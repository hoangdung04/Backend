/**
 * Script seed dữ liệu đơn hàng đẹp phục vụ Demo điểm cao
 * Chạy: node seed-orders.js
 */
import sequelize from "./config/database.js";
import Tour from "./models/tour.model.js";
import Order from "./models/order.model.js";
import OrderItem from "./models/order-item.model.js";
import Account from "./models/account.model.js";
import { generateOrderCode } from "./helpers/generate.helper.js";

const names = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Nam", "Phạm Minh Đức", 
  "Vũ Việt Anh", "Đặng Hồng Nhung", "Bùi Thanh Lâm", "Đỗ Hải Yến", 
  "Nguyễn Tiến Đạt", "Hoàng Kim Ngân", "Trần Thế Vinh", "Lê Thanh Sơn", 
  "Phạm Thùy Linh", "Vũ Huy Hoàng", "Nguyễn Minh Thu"
];

const phones = [
  "0912345678", "0987654321", "0901234567", "0934567890", "0976543210",
  "0961234567", "0945678901", "0923456789", "0956789012", "0998765432"
];

const emails = [
  "an.nv@gmail.com", "binh.tt@gmail.com", "nam.lh@gmail.com", "duc.pm@gmail.com",
  "anh.vv@gmail.com", "nhung.dh@gmail.com", "lam.bt@gmail.com", "yen.dh@gmail.com",
  "dat.nt@gmail.com", "ngan.hk@gmail.com", "vinh.tt@gmail.com", "son.lt@gmail.com",
  "linh.pt@gmail.com", "hoang.vh@gmail.com", "thu.nm@gmail.com"
];

const notes = [
  "Cần hướng dẫn viên nói tiếng Anh trôi chảy.",
  "Đoàn có người già, xin sắp xếp phòng tầng thấp.",
  "Có suất ăn chay cho 2 người.",
  "Muốn phụ thu thêm phòng đơn.",
  "Đoàn có trẻ em hiếu động, cần xe đời mới rộng rãi.",
  "Không có yêu cầu gì thêm.",
  "Vui lòng gửi vé bay sớm qua email.",
  "Cần hóa đơn đỏ VAT cho công ty.",
  ""
];

// Sinh ngày ngẫu nhiên trong khoảng 6 tháng gần đây
function getRandomDateInLast6Months() {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const start = sixMonthsAgo.getTime();
  const end = now.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

async function seedOrders() {
  const transaction = await sequelize.transaction();
  try {
    console.log("Đang kết nối database để chuẩn bị seed đơn hàng...");
    
    // 1. Lấy danh sách tour đang bán
    const activeTours = await Tour.findAll({
      where: { deleted: false, status: "active" },
      transaction
    });

    if (activeTours.length === 0) {
      console.log("❌ Không tìm thấy tour nào đang active. Vui lòng chạy node add-china-tours.js trước để có dữ liệu tour!");
      await transaction.rollback();
      process.exit(1);
    }

    console.log(`Tìm thấy ${activeTours.length} tour active để tiến hành tạo đơn.`);

    // 2. Tìm hoặc tạo tài khoản khách hàng mặc định
    let defaultCustomer = await Account.findOne({
      where: { email: "customer@gmail.com" },
      transaction
    });
    if (!defaultCustomer) {
      defaultCustomer = await Account.create({
        fullName: "Khách Hàng Demo",
        email: "customer@gmail.com",
        password: "salt:hashpassword", // Dummy hash
        status: "active",
        token: "demo_customer_token"
      }, { transaction });
      console.log("✅ Đã tạo tài khoản khách hàng demo: customer@gmail.com (Mật khẩu mặc định)");
    }
    const customerId = defaultCustomer.id;

    // Xóa bớt đơn hàng demo cũ nếu muốn reset
    // await Order.destroy({ where: { account_id: customerId }, transaction });

    // 3. Tiến hành tạo 35 đơn hàng ngẫu nhiên
    const totalOrdersToSeed = 35;
    let seededCount = 0;

    for (let i = 0; i < totalOrdersToSeed; i++) {
      const customerIndex = Math.floor(Math.random() * names.length);
      const fullName = names[customerIndex];
      const email = emails[customerIndex];
      const phone = phones[Math.floor(Math.random() * phones.length)];
      const note = notes[Math.floor(Math.random() * notes.length)];
      
      // Chọn trạng thái: 65% completed, 20% paid, 10% initial, 5% cancelled
      const rand = Math.random();
      let status = "completed";
      if (rand > 0.65 && rand <= 0.85) {
        status = "paid";
      } else if (rand > 0.85 && rand <= 0.95) {
        status = "initial";
      } else if (rand > 0.95) {
        status = "cancelled";
      }

      const paymentMethod = Math.random() > 0.6 ? "cash" : "bank_transfer";
      const createdAt = getRandomDateInLast6Months();
      const updatedAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000); // 2 tiếng sau

      // Tạo đơn hàng
      const order = await Order.create({
        code: "TEMP",
        fullName,
        phone,
        email,
        note,
        account_id: customerId,
        status,
        paymentMethod,
        createdAt,
        updatedAt
      }, { transaction });

      // Cập nhật mã code thực tế OD00000xxx
      const code = generateOrderCode(order.id);
      await Order.update({ code }, { where: { id: order.id }, transaction });

      // Chọn 1-2 tour ngẫu nhiên cho đơn hàng này
      const numToursInOrder = Math.random() > 0.8 ? 2 : 1;
      const shuffledTours = [...activeTours].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < numToursInOrder; j++) {
        const tour = shuffledTours[j];
        
        // Số lượng khách đi
        const adultsQuantity = Math.floor(Math.random() * 4) + 1; // 1-4 người lớn
        const childrenQuantity = Math.random() > 0.6 ? Math.floor(Math.random() * 2) : 0; // 0-1 trẻ em
        const seniorsQuantity = Math.random() > 0.8 ? 1 : 0;
        const visaQuantity = Math.random() > 0.7 ? (adultsQuantity + childrenQuantity) : 0;
        const singleRoomQuantity = Math.random() > 0.8 ? 1 : 0;
        
        const totalTravelers = adultsQuantity + childrenQuantity + seniorsQuantity;

        await OrderItem.create({
          orderId: order.id,
          tourId: tour.id,
          quantity: totalTravelers,
          price: tour.price,
          discount: tour.discount,
          timeStart: tour.timeStart,
          adultsQuantity,
          childrenQuantity,
          toddlersQuantity: 0,
          infantsQuantity: 0,
          seniorsQuantity,
          visaQuantity,
          singleRoomQuantity
        }, { transaction });

        // Cập nhật giảm chỗ (stock) nếu không phải đơn hủy
        if (status !== "cancelled") {
          const totalSeats = adultsQuantity + childrenQuantity + seniorsQuantity;
          await Tour.update({
            stock: sequelize.literal(`GREATEST(0, stock - ${totalSeats})`)
          }, { 
            where: { id: tour.id }, 
            transaction 
          });
        }
      }

      seededCount++;
    }

    await transaction.commit();
    console.log(`\n🎉 Seed thành công ${seededCount} đơn hàng mock với phân phối thời gian và trạng thái hoàn hảo!`);
    console.log("💡 Biểu đồ doanh thu 12 tháng và phân bổ đơn hàng trên Dashboard Admin sẽ hiển thị tuyệt đẹp!");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Seed đơn hàng thất bại:", error);
  } finally {
    process.exit(0);
  }
}

seedOrders();
