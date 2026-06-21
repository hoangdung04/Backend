import Order from "../../models/order.model.js";
import OrderItem from "../../models/order-item.model.js";
import sequelize from "../../config/database.js";
import Tour from "../../models/tour.model.js";
import { autoCompleteExpiredToursAndOrders } from "../../helpers/auto-update.helper.js";
import { Op } from "sequelize";
import exceljs from "exceljs";

// [GET] /api/admin/orders
export const index = async (req, res) => {
  try {
    // Tự động quét và cập nhật trạng thái các tour/đơn hàng quá hạn khởi hành
    await autoCompleteExpiredToursAndOrders();

    const orders = await Order.findAll({
      where: { deleted: false },
      order: [['createdAt', 'DESC']],
      raw: true,
    });
    
    const [orderStats] = await sequelize.query(`
      SELECT 
        o.id as orderId, 
        COUNT(oi.id) as totalTours, 
        SUM(
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (0) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ) as total_price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE o.deleted = false
      GROUP BY o.id
    `);

    // Ghép số liệu vào danh sách orders
    for (const order of orders) {
      const stat = orderStats.find(s => s.orderId === order.id);
      order.totalTours = stat ? stat.totalTours : 0;
      order.total_price = stat ? stat.total_price : 0;
    }

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// [GET] /api/admin/orders/:id – Chi tiết đơn hàng
export const detail = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, deleted: false },
      raw: true,
    });
    if (!order) {
      return res.status(404).json({ code: "error", message: "Không tìm thấy đơn hàng" });
    }

    const ordersItem = await OrderItem.findAll({
      where: { orderId: order.id },
      raw: true,
    });

    for (const item of ordersItem) {
      const priceSpecial = Math.round(item.price * (1 - item.discount / 100));
      item.price_special = priceSpecial;
      
      const adultsPrice = priceSpecial * (item.adultsQuantity || 0);
      const childrenPrice = Math.round(priceSpecial * 0.7) * (item.childrenQuantity || 0);
      const toddlersPrice = Math.round(priceSpecial * 0.5) * (item.toddlersQuantity || 0);
      const infantsPrice = 0; // Trẻ sơ sinh miễn phí
      const seniorsPrice = Math.round(priceSpecial * 0.6) * (item.seniorsQuantity || 0); // Người cao tuổi giảm 40%
      const visaPrice = 1500000 * (item.visaQuantity || 0);
      const singleRoomPrice = 3500000 * (item.singleRoomQuantity || 0);

      item.total = adultsPrice + childrenPrice + toddlersPrice + infantsPrice + seniorsPrice + visaPrice + singleRoomPrice;
      const tourInfo = await Tour.findOne({ where: { id: item.tourId }, raw: true });
      if (tourInfo) {
        item.tourTitle = tourInfo.title;
        item.tourCode  = tourInfo.code;
        item.tourSlug  = tourInfo.slug;
        if (tourInfo.images) {
          const imgs = JSON.parse(tourInfo.images);
          item.tourImage = imgs[0] || null;
        }
      }
    }

    order.total_price = ordersItem.reduce((sum, item) => sum + item.total, 0);

    res.json({ code: "success", order, ordersItem });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// [PATCH] /api/admin/orders/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.update({ status }, { where: { id: req.params.id } });
    res.json({ code: "success", message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// [DELETE] /api/admin/orders/:id – Xóa đơn hàng (soft delete)
export const deletePatch = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderId = req.params.id;

    // 1. Tìm đơn hàng để kiểm tra trạng thái trước khi xóa
    const order = await Order.findOne({
      where: { id: orderId, deleted: false },
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ code: "error", message: "Không tìm thấy đơn hàng" });
    }

    // 2. Nếu đơn hàng chưa ở trạng thái hủy (tức là chưa được trả lại stock), tiến hành hoàn trả stock cho các tour
    if (order.status !== "cancelled") {
      const orderItems = await OrderItem.findAll({
        where: { orderId: orderId },
        transaction: t
      });

      for (const item of orderItems) {
        const seats = (item.adultsQuantity || 0) + (item.childrenQuantity || 0) + (item.toddlersQuantity || 0) + (item.seniorsQuantity || 0);
        await Tour.update(
          { stock: sequelize.literal(`stock + ${seats}`) },
          { 
            where: { id: item.tourId },
            transaction: t
          }
        );
      }
    }

    // 3. Thực hiện xóa mềm đơn hàng
    await Order.update(
      { deleted: true, deletedAt: new Date() },
      { 
        where: { id: orderId },
        transaction: t
      }
    );

    await t.commit();
    res.json({ code: "success", message: "Xóa đơn hàng và hoàn trả chỗ trống thành công" });
  } catch (error) {
    await t.rollback();
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// [GET] /api/admin/orders/export – Xuất báo cáo Excel
export const exportExcel = async (req, res) => {
  try {
    const { keyword, status, startDate, endDate } = req.query;

    const whereClause = { deleted: false };

    // Lọc theo từ khóa (Mã đơn, Tên khách hàng, Số điện thoại)
    if (keyword) {
      const kw = `%${keyword.trim().toLowerCase()}%`;
      whereClause[Op.or] = [
        { code: { [Op.like]: kw } },
        { fullName: { [Op.like]: kw } },
        { phone: { [Op.like]: kw } }
      ];
    }

    // Lọc theo trạng thái đơn hàng
    if (status) {
      whereClause.status = status;
    }

    // Lọc theo khoảng ngày đặt hàng
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [
          new Date(new Date(startDate).setHours(0, 0, 0, 0)),
          new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        ],
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const orders = await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    const [orderStats] = await sequelize.query(`
      SELECT 
        o.id as orderId, 
        COUNT(oi.id) as totalTours, 
        SUM(
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (0) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ) as total_price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE o.deleted = false
      GROUP BY o.id
    `);

    // Bản đồ trạng thái đơn hàng sang tiếng Việt
    const STATUS_MAP = {
      initial: "Khởi tạo",
      paid: "Đã thanh toán",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };

    // Định dạng dữ liệu xuất excel
    const formatDate = (date) => {
      const d = new Date(date);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Khởi tạo workbook mới từ exceljs
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo Đơn đặt Tour");

    // 1. TIÊU ĐỀ BÁO CÁO (Độ rộng 10 cột, từ A đến J)
    worksheet.mergeCells("A2:J2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = "BÁO CÁO DANH SÁCH ĐƠN ĐẶT TOUR";
    titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF00B96B" } }; // Theme green #00b96b
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(2).height = 32;

    // 2. THÔNG TIN PHỤ (Ngày xuất)
    worksheet.mergeCells("A3:J3");
    const subTitleCell = worksheet.getCell("A3");
    subTitleCell.value = `Ngày xuất báo cáo: ${formatDate(new Date())}`;
    subTitleCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF555555" } };
    subTitleCell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(3).height = 20;

    // Khoảng trống trước bảng dữ liệu
    worksheet.getRow(4).height = 15;

    // 3. TIÊU ĐỀ CÁC CỘT TRONG BẢNG (Hàng thứ 5)
    const headerRow = worksheet.getRow(5);
    headerRow.values = [
      "STT",
      "Mã đơn hàng",
      "Họ tên khách hàng",
      "Số điện thoại",
      "Số lượng tour",
      "Tổng giá trị",
      "Ngày đặt hàng",
      "Trạng thái đơn hàng",
      "Phương thức thanh toán",
      "Ghi chú"
    ];
    headerRow.height = 28;

    // Định dạng cột mặc định
    const colWidths = [8, 18, 25, 16, 15, 22, 20, 20, 22, 30];
    colWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Style cho dòng tiêu đề bảng
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00B96B" }, // Theme green #00b96b
      };
      cell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        left: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        right: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
    });

    // 4. THÊM DỮ LIỆU CÁC DÒNG
    let indexNo = 1;
    for (const order of orders) {
      const stat = orderStats.find((s) => s.orderId === order.id);
      const totalTours = stat ? stat.totalTours : 0;
      const totalPrice = stat ? Number(stat.total_price || 0) : 0;

      const row = worksheet.addRow([
        indexNo++,
        order.code || "",
        order.fullName || "",
        order.phone || "",
        totalTours,
        totalPrice,
        formatDate(order.createdAt),
        STATUS_MAP[order.status] || order.status || "",
        order.paymentMethod === "cash" ? "Tiền mặt" : order.paymentMethod || "",
        order.note || ""
      ]);

      row.height = 22;

      // Style cho các ô dữ liệu
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } }, // Tailwind gray-200 border
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };

        // Alignments & formats
        if (colNumber === 1 || colNumber === 2 || colNumber === 4 || colNumber === 5 || colNumber === 7 || colNumber === 8 || colNumber === 9) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }

        // Định dạng tiền tệ cho cột Tổng giá trị (Cột số 6)
        if (colNumber === 6) {
          cell.numFmt = '#,##0"đ"';
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }

        // Zebra striping - dòng chẵn tô màu xám nhẹ
        if (row.number % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" }, // Gray-50 color
          };
        }
      });
    }

    // 5. TỰ ĐỘNG GIÃN RỘNG CỘT CHO KHỚP DỮ LIỆU (bỏ qua dòng tiêu đề merge A2, A3)
    worksheet.columns.forEach((column, index) => {
      let maxLen = colWidths[index] || 10;
      column.eachCell({ includeRowHeader: false }, (cell) => {
        if (cell.row < 5) return; // Bỏ qua tiêu đề merge để tránh co giãn sai
        const valStr = cell.value ? String(cell.value) : "";
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      column.width = Math.min(Math.max(maxLen + 4, 10), 50); // giới hạn tối đa 50 ký tự
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="Bao_cao_don_dat_tour.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error("Export Excel error:", error);
    res.status(500).json({ error: "Lỗi server khi xuất Excel" });
  }
};

// [PATCH] /api/admin/orders/:id – Cập nhật đơn đặt tour
export const editPatch = async (req, res) => {
  try {
    const { fullName, phone, email, note } = req.body;
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { id: orderId, deleted: false }
    });

    if (!order) {
      return res.status(404).json({ code: "error", message: "Không tìm thấy đơn hàng" });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (email) updateData.email = email;
    if (note !== undefined) updateData.note = note;

    await Order.update(updateData, { where: { id: orderId } });

    res.json({ code: "success", message: "Cập nhật đơn hàng thành công" });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật đơn hàng" });
  }
};
