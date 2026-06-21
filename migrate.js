/**
 * Script tạo bảng roles và accounts trong MySQL
 * Chạy: node migrate.js
 */
import sequelize from "./config/database.js";
import Role from "./models/role.model.js";
import Account from "./models/account.model.js";
import OtpVerify from "./models/otp.model.js";
import OrderItem from "./models/order-item.model.js";
import Tour from "./models/tour.model.js";
import Category from "./models/category.model.js";
import Order from "./models/order.model.js";
import Chat from "./models/chat.model.js";
import RoomChat from "./models/room-chat.model.js";
import Article from "./models/article.model.js";
import ArticleTour from "./models/article-tour.model.js";
import TourCategory from "./models/tour-category.model.js";
import crypto from "crypto";

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};


const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

async function migrate() {
  try {
    console.log("Đang kết nối database...");
    await sequelize.authenticate();
    console.log("Kết nối thành công!");

    console.log("Đang tự động chuyển đổi cấu trúc dữ liệu cũ (nếu có)...");

    // 1. Đổi tên bảng orders_item -> order_items nếu có
    try {
      const [tableExists] = await sequelize.query("SHOW TABLES LIKE 'orders_item'");
      const [newTableExists] = await sequelize.query("SHOW TABLES LIKE 'order_items'");
      if (tableExists.length > 0 && newTableExists.length === 0) {
        await sequelize.query("RENAME TABLE orders_item TO order_items");
        console.log("   -> Đã chuyển đổi bảng orders_item thành order_items thành công!");
      }
    } catch (e) {
      console.log("   -> Không cần chuyển đổi bảng orders_item:", e.message);
    }

    // 2. Chuyển đổi bảng accounts (role_id -> roleId)
    try {
      const [cols] = await sequelize.query("SHOW COLUMNS FROM accounts");
      const hasOldRole = cols.some(c => c.Field === 'role_id');
      const hasNewRole = cols.some(c => c.Field === 'roleId');
      if (hasOldRole) {
        if (!hasNewRole) {
          await sequelize.query("ALTER TABLE accounts ADD COLUMN roleId INT NULL");
        }
        await sequelize.query("UPDATE accounts SET roleId = role_id WHERE roleId IS NULL AND role_id IS NOT NULL");
        console.log("   -> Đã copy dữ liệu từ cột role_id sang roleId trong bảng accounts");
      }
    } catch (e) {
      console.log("   -> Bỏ qua chuyển đổi cột accounts.role_id:", e.message);
    }

    // 3. Chuyển đổi bảng room_chats (room_id -> code)
    try {
      const [cols] = await sequelize.query("SHOW COLUMNS FROM room_chats");
      const hasOldRoom = cols.some(c => c.Field === 'room_id');
      const hasNewRoom = cols.some(c => c.Field === 'code');
      if (hasOldRoom) {
        if (!hasNewRoom) {
          await sequelize.query("ALTER TABLE room_chats ADD COLUMN code VARCHAR(50) NULL");
        }
        await sequelize.query("UPDATE room_chats SET code = room_id WHERE code IS NULL OR code = ''");
        console.log("   -> Đã copy dữ liệu từ cột room_id sang code trong bảng room_chats");
      }
    } catch (e) {
      console.log("   -> Bỏ qua chuyển đổi cột room_chats.room_id:", e.message);
    }

    // 4. Chuyển đổi bảng chats (room_chat_id -> roomChatId, user_id -> accountId)
    try {
      const [cols] = await sequelize.query("SHOW COLUMNS FROM chats");
      const hasOldUser = cols.some(c => c.Field === 'user_id');
      const hasNewUser = cols.some(c => c.Field === 'accountId');
      if (hasOldUser) {
        if (!hasNewUser) {
          await sequelize.query("ALTER TABLE chats ADD COLUMN accountId INT NULL");
        }
        await sequelize.query("UPDATE chats SET accountId = user_id WHERE accountId IS NULL OR accountId = 0");
        console.log("   -> Đã copy dữ liệu từ cột user_id sang accountId trong bảng chats");
      }

      const hasOldRoomChat = cols.some(c => c.Field === 'room_chat_id');
      const hasNewRoomChat = cols.some(c => c.Field === 'roomChatId');
      if (hasOldRoomChat) {
        if (!hasNewRoomChat) {
          await sequelize.query("ALTER TABLE chats ADD COLUMN roomChatId INT NULL");
        }
        try {
          await sequelize.query(`
            UPDATE chats c 
            JOIN room_chats r ON (c.room_chat_id = r.code OR c.room_chat_id = r.room_id)
            SET c.roomChatId = r.id 
            WHERE c.roomChatId IS NULL OR c.roomChatId = 0
          `);
          console.log("   -> Đã đồng bộ liên kết chats.roomChatId từ room_chats.id");
        } catch (innerErr) {
          console.log("   -> Bỏ qua ánh xạ roomChatId:", innerErr.message);
        }
      }
    } catch (e) {
      console.log("   -> Bỏ qua chuyển đổi cột chats:", e.message);
    }

    // 5. Chuyển đổi bảng articles (summary -> description, thumbnail -> image)
    try {
      const [cols] = await sequelize.query("SHOW COLUMNS FROM articles");
      const hasOldSummary = cols.some(c => c.Field === 'summary');
      const hasNewDesc = cols.some(c => c.Field === 'description');
      if (hasOldSummary) {
        if (!hasNewDesc) {
          await sequelize.query("ALTER TABLE articles ADD COLUMN description TEXT NULL");
        }
        await sequelize.query("UPDATE articles SET description = summary WHERE description IS NULL OR description = ''");
        console.log("   -> Đã copy dữ liệu từ cột summary sang description trong bảng articles");
      }

      const hasOldThumb = cols.some(c => c.Field === 'thumbnail');
      const hasNewImg = cols.some(c => c.Field === 'image');
      if (hasOldThumb) {
        if (!hasNewImg) {
          await sequelize.query("ALTER TABLE articles ADD COLUMN image VARCHAR(255) NULL");
        }
        await sequelize.query("UPDATE articles SET image = thumbnail WHERE image IS NULL OR image = ''");
        console.log("   -> Đã copy dữ liệu từ cột thumbnail sang image trong bảng articles");
      }
    } catch (e) {
      console.log("   -> Bỏ qua chuyển đổi cột articles:", e.message);
    }

    // Tạo bảng roles (force: false = chỉ tạo nếu chưa tồn tại)
    await Role.sync({ alter: true });
    console.log("✅ Bảng roles đã sẵn sàng");

    // Tạo bảng accounts
    await Account.sync({ alter: true });
    console.log("✅ Bảng accounts đã sẵn sàng");

    // Tạo bảng categories
    await Category.sync({ alter: true });
    console.log("✅ Bảng categories đã sẵn sàng");

    // Tạo bảng tours
    await Tour.sync({ alter: true });
    console.log("✅ Bảng tours đã sẵn sàng");

    // Tạo bảng tour_categories
    await TourCategory.sync({ alter: true });
    console.log("✅ Bảng tour_categories đã sẵn sàng");

    // Tạo bảng orders
    await Order.sync({ alter: true });
    console.log("✅ Bảng orders đã sẵn sàng");

    // Tạo bảng order_items
    await OrderItem.sync({ alter: true });
    console.log("✅ Bảng order_items đã sẵn sàng");

    // Tạo bảng room_chats
    await RoomChat.sync({ alter: true });
    console.log("✅ Bảng room_chats đã sẵn sàng");

    // Tạo bảng chats
    await Chat.sync({ alter: true });
    console.log("✅ Bảng chats đã sẵn sàng");

    // Tạo bảng articles
    await Article.sync({ alter: true });
    console.log("✅ Bảng articles đã sẵn sàng");

    // Tạo bảng article_tours
    await ArticleTour.sync({ alter: true });
    console.log("✅ Bảng article_tours đã sẵn sàng");

    // Tạo bảng otp_verifications
    await OtpVerify.sync({ alter: true });
    console.log("✅ Bảng otp_verifications đã sẵn sàng");

    // Tạo role "Super Admin" nếu chưa có
    const [superAdminRole, createdRole] = await Role.findOrCreate({
      where: { title: "Super Admin" },
      defaults: {
        title: "Super Admin",
        description: "Toàn quyền quản trị hệ thống",
        status: "active",
        permissions: [
          "tours_view", "tours_create", "tours_edit", "tours_delete",
          "categories_view", "categories_create", "categories_edit", "categories_delete",
          "accounts_view", "accounts_create", "accounts_edit", "accounts_delete",
          "roles_view", "roles_create", "roles_edit", "roles_delete", "roles_permissions",
          "orders_view", "orders_edit", "orders_delete",
        ],
      },
    });
    console.log(createdRole ? "✅ Tạo role Super Admin thành công" : "ℹ️ Role Super Admin đã tồn tại");

    // Đảm bảo vai trò Super Admin không bị xóa mềm trong cơ sở dữ liệu
    await Role.update(
      { deleted: false, status: "active" },
      { where: { id: superAdminRole.id } }
    );
    console.log("✅ Đảm bảo role Super Admin đang hoạt động (không bị xóa mềm)");

    // Tạo tài khoản admin mặc định nếu chưa có
    const [adminAccount, createdAccount] = await Account.findOrCreate({
      where: { email: "admin@gmail.com" },
      defaults: {
        fullName: "Super Admin",
        email: "admin@gmail.com",
        password: hashPassword("123456"),
        token: generateToken(),
        roleId: superAdminRole.id,
        status: "active",
      },
    });
    console.log(createdAccount ? "✅ Tạo tài khoản admin@gmail.com (password: 123456) thành công" : "ℹ️ Tài khoản admin đã tồn tại");

    // Đảm bảo tài khoản admin@gmail.com luôn có vai trò Super Admin, trạng thái active, và mật khẩu là 123456
    await Account.update(
      { 
        roleId: superAdminRole.id, 
        status: "active",
        password: hashPassword("123456")
      },
      { where: { email: "admin@gmail.com" } }
    );
    console.log("✅ Đã cập nhật/đồng bộ vai trò Super Admin và mật khẩu (123456) cho tài khoản admin@gmail.com!");

    console.log("\n🎉 Migration hoàn tất!");
    console.log("📌 Đăng nhập: POST /api/admin/auth/login");
    console.log("   email: admin@gmail.com");
    console.log("   password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration thất bại:", error);
    process.exit(1);
  }
}

migrate();
