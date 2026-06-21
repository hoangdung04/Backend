/**
 * Script seed dữ liệu mẫu chuyên nghiệp (30-40 đơn hàng trong 12 tháng gần nhất)
 * Chạy: node seed-mock-data.js
 */
import sequelize from "./config/database.js";
import Tour from "./models/tour.model.js";
import Category from "./models/category.model.js";
import Order from "./models/order.model.js";
import OrderItem from "./models/order-item.model.js";
import TourCategory from "./models/tour-category.model.js";

async function seed() {
  try {
    console.log("Connecting database...");
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    // 1. Kiểm tra xem đã có đơn hàng chưa để tránh xóa đè dữ liệu thực tế
    const existingOrders = await Order.count();
    if (existingOrders > 0) {
      console.log(`ℹ️ Đã có ${existingOrders} đơn hàng trong database. Bỏ qua seeding dữ liệu mẫu.`);
      process.exit(0);
    }
    console.log("Chưa có đơn hàng. Bắt đầu seed dữ liệu mẫu...");

    // Dọn dẹp dữ liệu cũ (đề phòng chạy dở dang bị lỗi ở lần trước)
    console.log("Dọn dẹp các bảng cũ để đảm bảo dữ liệu đồng bộ...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await OrderItem.destroy({ where: {}, truncate: true });
    await Order.destroy({ where: {}, truncate: true });
    await TourCategory.destroy({ where: {}, truncate: true });
    await Tour.destroy({ where: {}, truncate: true });
    await Category.destroy({ where: {}, truncate: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    // 2. Kiểm tra/Tạo Danh mục & Tours
    console.log("Checking tours in database...");
    let tours = [];
    
    if (tours.length === 0) {
      console.log("No tours found. Seeding default tours...");
      
      const [cat1] = await Category.findOrCreate({
        where: { title: "Du lịch Miền Bắc" },
        defaults: { title: "Du lịch Miền Bắc", status: "active", position: 1 }
      });
      const [cat2] = await Category.findOrCreate({
        where: { title: "Du lịch Miền Trung" },
        defaults: { title: "Du lịch Miền Trung", status: "active", position: 2 }
      });
      const [cat3] = await Category.findOrCreate({
        where: { title: "Du lịch Miền Nam" },
        defaults: { title: "Du lịch Miền Nam", status: "active", position: 3 }
      });

      const toursData = [
        {
          title: "Tour du lịch Sapa 3 ngày 2 đêm - Fansipan Hùng Vĩ",
          code: "TOURSAPA",
          price: 3200000,
          discount: 10,
          images: JSON.stringify(["https://res.cloudinary.com/doxfnr55c/image/upload/v1716301234/sapa.jpg"]),
          information: "Khám phá bản Cát Cát, thung lũng Mường Hoa, đỉnh Fansipan.",
          schedule: "Ngày 1: Hà Nội - Sapa. Ngày 2: Chinh phục Fansipan. Ngày 3: Sapa - Hà Nội.",
          timeStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          stock: 30,
          status: "active",
          position: 1
        },
        {
          title: "Tour Hà Giang - Mèo Vạc - Đồng Văn 4 ngày 3 đêm",
          code: "TOURHG",
          price: 4500000,
          discount: 15,
          images: JSON.stringify(["https://res.cloudinary.com/doxfnr55c/image/upload/v1716301235/hagiang.jpg"]),
          information: "Ngắm hoa tam giác mạch, chinh phục đèo Mã Pí Lèng, cột cờ Lũng Cú.",
          schedule: "Ngày 1: Hà Nội - Quản Bạ. Ngày 2: Đồng Văn - Lũng Cú. Ngày 3: Mèo Vạc - Mã Pí Lèng. Ngày 4: Trở về.",
          timeStart: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          stock: 25,
          status: "active",
          position: 2
        },
        {
          title: "Tour Đà Nẵng - Hội An - Bà Nà Hills 3 ngày 2 đêm",
          code: "TOURDN",
          price: 5200000,
          discount: 5,
          images: JSON.stringify(["https://res.cloudinary.com/doxfnr55c/image/upload/v1716301236/danang.jpg"]),
          information: "Vui chơi Bà Nà Hills, check-in Cầu Vàng, dạo phố cổ Hội An.",
          schedule: "Ngày 1: Đón sân bay - Hội An. Ngày 2: Bà Nà Hills - Cầu Vàng. Ngày 3: Bán đảo Sơn Trà - Tiễn khách.",
          timeStart: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          stock: 40,
          status: "active",
          position: 3
        },
        {
          title: "Siêu phẩm Tour đảo ngọc Phú Quốc 3 ngày 2 đêm",
          code: "TOURPQ",
          price: 6800000,
          discount: 20,
          images: JSON.stringify(["https://res.cloudinary.com/doxfnr55c/image/upload/v1716301237/phuquoc.jpg"]),
          information: "Tắm biển Bãi Sao, lặn ngắm san hô ga An Thới, Safari Phú Quốc.",
          schedule: "Ngày 1: Đón sân bay - Đông đảo. Ngày 2: Nam đảo - Lặn ngắm san hô. Ngày 3: VinWonders - Tiễn sân bay.",
          timeStart: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          stock: 20,
          status: "active",
          position: 4
        },
        {
          title: "Tour du thuyền Vịnh Hạ Long 2 ngày 1 đêm 5 sao",
          code: "TOURHL",
          price: 3900000,
          discount: 10,
          images: JSON.stringify(["https://res.cloudinary.com/doxfnr55c/image/upload/v1716301238/halong.jpg"]),
          information: "Nghỉ dưỡng du thuyền 5 sao sang trọng, chèo thuyền kayak, hang Sửng Sốt.",
          schedule: "Ngày 1: Hà Nội - Tuần Châu - Lên tàu. Ngày 2: Hang Sửng Sốt - Hà Nội.",
          timeStart: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          stock: 15,
          status: "active",
          position: 5
        }
      ];

      for (const tData of toursData) {
        const createdTour = await Tour.create(tData);
        tours.push(createdTour);
        // Gán danh mục
        const cat = tData.code === "TOURSAPA" || tData.code === "TOURHG" ? cat1 : (tData.code === "TOURDN" ? cat2 : cat3);
        await TourCategory.create({
          tour_id: createdTour.id,
          category_id: cat.id
        });
      }
      console.log(`Seeded ${tours.length} tours successfully!`);
    } else {
      console.log(`Found ${tours.length} existing tours in database.`);
    }

    // 3. Tạo dữ liệu 40 Đơn hàng mẫu
    console.log("Generating 40 mock orders...");
    const customers = [
      { name: "Nguyễn Văn Anh", phone: "0912345678", email: "vananh@gmail.com" },
      { name: "Trần Thị Bình", phone: "0987654321", email: "thibinh@gmail.com" },
      { name: "Phạm Hồng Cường", phone: "0905551234", email: "hongcuong@gmail.com" },
      { name: "Lê Thị Dung", phone: "0944443322", email: "thidung@gmail.com" },
      { name: "Hoàng Minh Hải", phone: "0355556677", email: "minhhai@gmail.com" },
      { name: "Nguyễn Thu Hương", phone: "0388889900", email: "thuhuong@gmail.com" },
      { name: "Đỗ Gia Khánh", phone: "0966668888", email: "giakhanh@gmail.com" },
      { name: "Phan Thanh Liêm", phone: "0977771122", email: "thanhliem@gmail.com" },
      { name: "Vũ Bảo Ngọc", phone: "0933334455", email: "baongoc@gmail.com" },
      { name: "Bùi Tiến Đạt", phone: "0922223344", email: "tiendat@gmail.com" }
    ];

    const statuses = ["initial", "paid", "completed", "cancelled"];
    const paymentMethods = ["bank_transfer", "cash"];
    const today = new Date();

    // Loop qua 12 tháng gần nhất (từ 11 tháng trước đến tháng này)
    for (let i = 11; i >= 0; i--) {
      // Mỗi tháng tạo khoảng 3-4 đơn hàng để biểu đồ có đường đi đẹp mắt
      const numOrdersThisMonth = 3 + Math.floor(Math.random() * 2); // 3 or 4 orders per month
      
      for (let j = 0; j < numOrdersThisMonth; j++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // Phân phối trạng thái
        // Các tháng cũ -> Hầu hết là 'completed' để tích lũy doanh thu
        // Tháng hiện tại -> Trộn lẫn các trạng thái để trực quan hóa
        let status = "completed";
        if (i === 0) { // Tháng hiện tại
          const rand = Math.random();
          if (rand < 0.2) status = "initial";
          else if (rand < 0.5) status = "paid";
          else if (rand < 0.9) status = "completed";
          else status = "cancelled";
        } else {
          // Tháng cũ thỉnh thoảng có đơn bị hủy hoặc chưa hoàn thành
          const rand = Math.random();
          if (rand < 0.1) status = "cancelled";
          else if (rand < 0.15) status = "paid";
          else status = "completed";
        }

        // Tạo ngày ngẫu nhiên trong tháng d
        const orderDate = new Date(today.getFullYear(), today.getMonth() - i, 1 + Math.floor(Math.random() * 25), 8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
        const orderCode = `OD${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`;

        // Tạo đơn hàng
        const newOrder = await Order.create({
          code: orderCode,
          fullName: customer.name,
          phone: customer.phone,
          email: customer.email,
          note: `Đơn hàng mẫu được tạo tự động cho tháng ${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`,
          status: status,
          paymentMethod: paymentMethod,
          deleted: false,
          createdAt: orderDate,
          updatedAt: orderDate
        });

        // Thêm 1 hoặc 2 tour vào đơn hàng
        const numItems = Math.random() > 0.8 ? 2 : 1;
        const selectedTours = [];
        while (selectedTours.length < numItems) {
          const t = tours[Math.floor(Math.random() * tours.length)];
          if (!selectedTours.some(x => x.id === t.id)) {
            selectedTours.push(t);
          }
        }

        for (const t of selectedTours) {
          const adults = 1 + Math.floor(Math.random() * 3); // 1-3 adults
          const children = Math.random() > 0.5 ? 1 : 0;
          const visa = Math.random() > 0.8 ? adults : 0;
          const singleRoom = Math.random() > 0.7 ? 1 : 0;

          await OrderItem.create({
            orderId: newOrder.id,
            tourId: t.id,
            quantity: adults + children,
            price: t.price,
            discount: t.discount || 0,
            timeStart: t.timeStart || orderDate,
            adultsQuantity: adults,
            childrenQuantity: children,
            toddlersQuantity: 0,
            infantsQuantity: 0,
            visaQuantity: visa,
            singleRoomQuantity: singleRoom,
            seniorsQuantity: 0
          });
        }
      }
    }

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("🎉 Seeding mock data completed successfully!");
    
    // Đếm số đơn hàng được tạo ra để verify
    const totalOrders = await Order.count();
    const totalItems = await OrderItem.count();
    console.log(`📊 Tổng số đơn hàng được tạo: ${totalOrders}`);
    console.log(`📊 Tổng số chi tiết đơn hàng (order items) được tạo: ${totalItems}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding mock data failed:", error);
    process.exit(1);
  }
}

seed();
