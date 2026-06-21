import RoomChat from "../../models/room-chat.model.js";
import Chat from "../../models/chat.model.js";
import Account from "../../models/account.model.js";

// Định nghĩa quan hệ cho Admin Controller
RoomChat.belongsTo(Account, { foreignKey: "user_id", as: "userInfo" });

// [GET] /api/admin/chat/rooms
// Lấy danh sách tất cả các phòng chat (để hiển thị danh sách khách hàng bên trái)
export const getRooms = async (req, res, next) => {
    try {
        const rooms = await RoomChat.findAll({
            where: {
                status: "active"
            },
            include: [{
                model: Account,
                as: "userInfo",
                attributes: ["id", "fullName", "avatar", "roleId"],
                where: {
                    // Chỉ lấy phòng của khách hàng (không có roleId = không phải Admin)
                    roleId: null
                },
                required: true
            }],
            order: [["lastMessageAt", "DESC"]] // Ưu tiên phòng có tin nhắn gần nhất
        });

        // Map code sang room_id để tương thích với Frontend
        const mappedRooms = rooms.map(r => {
            const val = r.get({ plain: true });
            val.room_id = val.code;
            return val;
        });

        res.json({
            code: "success",
            rooms: mappedRooms
        });
    } catch (error) {
        next(error);
    }
};

// [GET] /api/admin/chat/rooms/:roomId
// Lấy lịch sử chat của một phòng cụ thể (khi Admin click vào 1 khách hàng)
export const getRoomMessages = async (req, res, next) => {
    try {
        const roomId = req.params.roomId; // Đây là code của phòng (chuỗi dạng client_15)

        // Tìm RoomChat theo code
        const room = await RoomChat.findOne({ where: { code: roomId } });
        if (!room) {
            return res.status(404).json({ error: "Phòng chat không tồn tại" });
        }

        // Đánh dấu đã đọc: reset unreadCountAdmin = 0
        await RoomChat.update(
            { unreadCountAdmin: 0 },
            { where: { id: room.id } }
        );

        const chats = await Chat.findAll({
            where: {
                roomChatId: room.id,
                deleted: false
            },
            include: [{
                model: Account,
                as: "userInfo",
                attributes: ["fullName", "id"]
            }],
            order: [["createdAt", "ASC"]]
        });

        const messages = chats.map(chat => ({
            id: chat.id,
            user_id: chat.accountId,
            user: chat.userInfo ? chat.userInfo.fullName : "Khách",
            content: chat.content,
            images: chat.images,
            createdAt: chat.createdAt,
            senderType: chat.senderType || (chat.accountId === req.user.id ? 'Admin' : 'User')
        }));

        res.json({
            code: "success",
            messages: messages
        });
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/admin/chat/rooms/:roomId/read
// Đánh dấu phòng đã đọc (Admin mở phòng)
export const markAsRead = async (req, res, next) => {
    try {
        const roomId = req.params.roomId;
        await RoomChat.update(
            { unreadCountAdmin: 0 },
            { where: { code: roomId } }
        );

        // Gửi socket thông báo "Admin đã xem" cho User
        if (global._io) {
            global._io.to(roomId).emit("SERVER_SEEN_STATUS", {
                room_id: roomId,
                seenBy: "Admin",
                seenAt: new Date()
            });
        }

        res.json({ code: "success" });
    } catch (error) {
        next(error);
    }
};
