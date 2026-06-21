import Tour from "../../models/tour.model.js";
import sequelize from "../../config/database.js";
import Order from "../../models/order.model.js";
import Account from "../../models/account.model.js";
import OrderItem from "../../models/order-item.model.js";
import Category from "../../models/category.model.js";
import { autoCompleteExpiredToursAndOrders } from "../../helpers/auto-update.helper.js";
import { Op } from "sequelize";

// [GET] /api/admin/dashboard
export const index = async (req, res) => {
  try {
    // Tự động quét và cập nhật trạng thái các tour/đơn hàng quá hạn khởi hành
    await autoCompleteExpiredToursAndOrders();

    const statistic = {
      category: { total: 0, active: 0, inactive: 0 },
      tour: { total: 0, active: 0, inactive: 0 },
      account: { total: 0, active: 0, inactive: 0 },
      order: { total: 0, completed: 0, revenue: 0 }
    };

    // Thống kê Tour
    statistic.tour.total = await Tour.count({ where: { deleted: false } });
    statistic.tour.active = await Tour.count({ where: { status: "active", deleted: false } });
    statistic.tour.inactive = await Tour.count({ where: { status: "inactive", deleted: false } });

    // Thống kê Category
    statistic.category.total = await Category.count({ where: { deleted: false } });
    statistic.category.active = await Category.count({ where: { status: "active", deleted: false } });
    statistic.category.inactive = await Category.count({ where: { status: "inactive", deleted: false } });

    // Thống kê Account
    statistic.account.total = await Account.count({ where: { deleted: false } });
    statistic.account.active = await Account.count({ where: { status: "active", deleted: false } });
    statistic.account.inactive = await Account.count({ where: { status: "inactive", deleted: false } });

    // Thống kê Order
    statistic.order.total = await Order.count({ where: { deleted: false } });
    statistic.order.completed = await Order.count({ where: { status: "completed", deleted: false } });

    // 1. Tính tổng doanh thu tích lũy (chỉ tính đơn hoàn thành)
    const [revenueResult] = await sequelize.query(`
      SELECT 
        SUM(
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ) as totalRevenue
      FROM order_items oi
      JOIN orders o ON oi.orderId = o.id
      WHERE o.status = 'completed' AND o.deleted = false
    `);
    
    statistic.order.revenue = Number(revenueResult[0]?.totalRevenue || 0);

    // 2. Thống kê doanh thu và đơn hàng theo Ngày, Tuần, Tháng, Năm
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Start of current week (Monday)
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    // Start of current year
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    const endOfYear = new Date(startOfYear.getFullYear(), 11, 31, 23, 59, 59, 999);

    const [[revenueStats]] = await sequelize.query(`
      SELECT 
        SUM(CASE WHEN o.createdAt BETWEEN :todayStart AND :todayEnd THEN 
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ELSE 0 END) as todayRevenue,
        COUNT(DISTINCT CASE WHEN o.createdAt BETWEEN :todayStart AND :todayEnd THEN o.id END) as todayCount,
        
        SUM(CASE WHEN o.createdAt BETWEEN :weekStart AND :weekEnd THEN 
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ELSE 0 END) as weekRevenue,
        COUNT(DISTINCT CASE WHEN o.createdAt BETWEEN :weekStart AND :weekEnd THEN o.id END) as weekCount,

        SUM(CASE WHEN o.createdAt BETWEEN :monthStart AND :monthEnd THEN 
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ELSE 0 END) as monthRevenue,
        COUNT(DISTINCT CASE WHEN o.createdAt BETWEEN :monthStart AND :monthEnd THEN o.id END) as monthCount,

        SUM(CASE WHEN o.createdAt BETWEEN :yearStart AND :yearEnd THEN 
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ELSE 0 END) as yearRevenue,
        COUNT(DISTINCT CASE WHEN o.createdAt BETWEEN :yearStart AND :yearEnd THEN o.id END) as yearCount
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE o.status = 'completed' AND o.deleted = false
    `, {
      replacements: {
        todayStart: startOfToday,
        todayEnd: endOfToday,
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        monthStart: startOfMonth,
        monthEnd: endOfMonth,
        yearStart: startOfYear,
        yearEnd: endOfYear,
      }
    });

    // 3. Lấy tất cả danh sách đơn hàng
    const allOrders = await Order.findAll({
      where: { deleted: false },
      order: [['createdAt', 'DESC']],
      raw: true
    });

    const [allOrderStats] = await sequelize.query(`
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

    for (const order of allOrders) {
      const stat = allOrderStats.find(s => s.orderId === order.id);
      order.totalTours = stat ? stat.totalTours : 0;
      order.total_price = stat ? stat.total_price : 0;
    }

    // 4. Doanh thu 12 tháng gần nhất (bao gồm cả tháng hiện tại)
    const monthlyRevenue = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      monthlyRevenue.push({
        month: `${year}-${month}`,
        revenue: 0,
        count: 0
      });
    }

    const startOfMonthlyQuery = new Date(today.getFullYear(), today.getMonth() - 11, 1, 0, 0, 0, 0);

    const [dbMonthlyRevenue] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(o.createdAt, '%Y-%m') as month,
        SUM(
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ) as revenue,
        COUNT(DISTINCT o.id) as count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE o.status = 'completed' AND o.deleted = false AND o.createdAt >= :startDate
      GROUP BY DATE_FORMAT(o.createdAt, '%Y-%m')
    `, {
      replacements: { startDate: startOfMonthlyQuery }
    });

    for (const item of dbMonthlyRevenue) {
      const found = monthlyRevenue.find(m => m.month === item.month);
      if (found) {
        found.revenue = Number(item.revenue || 0);
        found.count = item.count || 0;
      }
    }

    // 5. Phân bổ trạng thái đơn hàng (chỉ tính đơn hàng chưa xóa)
    const statusDistribution = [
      { status: "initial", label: "Khởi tạo", count: await Order.count({ where: { status: "initial", deleted: false } }) },
      { status: "paid", label: "Đã thanh toán", count: await Order.count({ where: { status: "paid", deleted: false } }) },
      { status: "completed", label: "Hoàn thành", count: await Order.count({ where: { status: "completed", deleted: false } }) },
      { status: "cancelled", label: "Đã hủy", count: await Order.count({ where: { status: "cancelled", deleted: false } }) },
    ];

    // 6. Top tour bán chạy (lượt đặt cao nhất, không tính đơn hủy)
    const [topTours] = await sequelize.query(`
      SELECT 
        t.id,
        t.title,
        t.code,
        t.images,
        t.price,
        SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity ELSE 0 END) as totalBookings,
        SUM(CASE WHEN o.status = 'completed' THEN 
          (COALESCE(oi.adultsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100))) +
          (COALESCE(oi.childrenQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.7)) +
          (COALESCE(oi.toddlersQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.5)) +
          (COALESCE(oi.seniorsQuantity, 0) * ROUND(oi.price * (1 - oi.discount / 100) * 0.6)) +
          (COALESCE(oi.visaQuantity, 0) * 1500000) +
          (COALESCE(oi.singleRoomQuantity, 0) * 3500000)
        ELSE 0 END) as totalRevenue
      FROM order_items oi
      JOIN tours t ON oi.tourId = t.id
      JOIN orders o ON oi.orderId = o.id
      WHERE o.deleted = false AND t.deleted = false
      GROUP BY t.id
      HAVING totalBookings > 0
      ORDER BY totalBookings DESC
      LIMIT 5
    `);

    for (const tour of topTours) {
      tour.totalBookings = Number(tour.totalBookings || 0);
      tour.totalRevenue = Number(tour.totalRevenue || 0);
      if (tour.images) {
        try {
          const parsed = JSON.parse(tour.images);
          tour.image = parsed[0] || "";
        } catch (e) {
          tour.image = "";
        }
      } else {
        tour.image = "";
      }
    }

    res.json({
      code: "success",
      statistic,
      revenueStats: {
        today: Number(revenueStats.todayRevenue || 0),
        todayCount: revenueStats.todayCount || 0,
        week: Number(revenueStats.weekRevenue || 0),
        weekCount: revenueStats.weekCount || 0,
        month: Number(revenueStats.monthRevenue || 0),
        monthCount: revenueStats.monthCount || 0,
        year: Number(revenueStats.yearRevenue || 0),
        yearCount: revenueStats.yearCount || 0
      },
      monthlyRevenue,
      statusDistribution,
      topTours,
      allOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
