import sequelize from "./config/database.js";
import Category from "./models/category.model.js";
import Tour from "./models/tour.model.js";
import TourCategory from "./models/tour-category.model.js";
import { generateTourCode } from "./helpers/generate.helper.js";

async function main() {
  const transaction = await sequelize.transaction();
  try {
    console.log("Đang tạo danh mục 'Tour Trung Quốc'...");
    
    // 1. Tạo hoặc lấy danh mục "Tour Trung Quốc"
    const [category, catCreated] = await Category.findOrCreate({
      where: { title: "Tour Trung Quốc" },
      defaults: {
        title: "Tour Trung Quốc",
        image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800&auto=format&fit=crop",
        description: "Khám phá vẻ đẹp cổ kính và hiện đại của Trung Quốc qua các hành trình di sản tuyệt vời từ Vạn Lý Trường Thành đến Phượng Hoàng Cổ Trấn.",
        status: "active",
        position: 4,
        slug: "tour-trung-quoc-" + Date.now(),
      },
      transaction
    });
    
    const categoryId = category.id;
    console.log(catCreated ? `✅ Tạo danh mục thành công (ID: ${categoryId})` : `ℹ️ Danh mục 'Tour Trung Quốc' đã tồn tại (ID: ${categoryId})`);

    // 2. Định nghĩa danh sách 10 tour Trung Quốc, mỗi tour có đúng 3 hình ảnh
    const newTours = [
      {
        title: "Tour Phượng Hoàng Cổ Trấn - Trương Gia Giới (5 ngày 4 đêm)",
        price: 12990000,
        discount: 10,
        stock: 25,
        status: "active",
        timeStart: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1520745947248-e287a72ed646?q=80&w=800", // Phượng Hoàng Cổ Trấn
          "https://images.unsplash.com/photo-1561031454-4f1331bd2a34?q=80&w=800", // Trương Gia Giới
          "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=800"  // Chùa/lầu cổ
        ]),
        information: `
          <p><strong>Trương Gia Giới</strong> nổi tiếng với hàng ngàn cột đá sa thạch cao vút dựng đứng như những măng đá khổng lồ, là nguyên mẫu cho hành tinh Pandora trong bộ phim bom thấm Avatar. Trấn cổ <strong>Phượng Hoàng</strong> với hơn 1.300 năm lịch sử trầm mặc bên dòng sông Đà Giang sẽ đưa bạn trở về không gian Trung Hoa cổ kính xưa.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Khám phá <strong>Thiên Môn Sơn</strong> với con đường độc đạo 99 khúc cua ngoạn mục.</li>
            <li>Thử thách lòng can đảm tại <strong>Hành lang kính (Glass Skywalk)</strong> bám vách núi dựng đứng ở độ cao 1.400m.</li>
            <li>Dạo thuyền trên <strong>Hồ Bảo Phong</strong> thơ mộng và nghe những khúc hát dân ca trữ tình.</li>
            <li>Khám phá vẻ đẹp huyền ảo của <strong>Phượng Hoàng Cổ Trấn</strong> rực rỡ sắc màu về đêm dọc dòng sông Đà Giang.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Nam Ninh - Trương Gia Giới</h4>
          <p>Xe đón đoàn khởi hành đi Lạng Sơn, làm thủ tục xuất cảnh sang Bằng Tường. Khởi hành đi Nam Ninh, dùng bữa tối và lên tàu hỏa giường nằm đi Trương Gia Giới. Nghỉ đêm trên tàu.</p>
          <h4>Ngày 2: Thiên Môn Sơn - Hành lang kính</h4>
          <p>Đến Trương Gia Giới, đoàn đi cáp treo lên Thiên Môn Sơn khám phá Cổng Trời, dạo bước trên Hành lang kính dài 60m bám vách núi ở độ cao 1.400m. Nhận phòng khách sạn, nghỉ ngơi.</p>
          <h4>Ngày 3: Hồ Bảo Phong - Phượng Hoàng Cổ Trấn</h4>
          <p>Tham quan Hồ Bảo Phong, du thuyền ngắm phong cảnh và nghe dân ca. Chiều khởi hành đi Phượng Hoàng Cổ Trấn. Khám phá vẻ đẹp lung linh của cổ trấn dọc sông Đà Giang khi lên đèn.</p>
          <h4>Ngày 4: Khám phá Phượng Hoàng Cổ Trấn - Nam Ninh</h4>
          <p>Tham quan cầu Hồng Kiều, các ngôi nhà cổ của người Miêu, ngắm sông Đà Giang buổi sáng yên bình. Trưa khởi hành về Cát Thủ để lên tàu về Nam Ninh.</p>
          <h4>Ngày 5: Nam Ninh - Hà Nội</h4>
          <p>Đoàn tự do mua sắm tại phố đi bộ. Sau đó làm thủ tục về Việt Nam qua cửa khẩu Hữu Nghị. Kết thúc hành trình đầy ý nghĩa.</p>
        `
      },
      {
        title: "Tour Bắc Kinh - Thượng Hải - Hàng Châu - Tô Châu (7 ngày 6 đêm)",
        price: 18990000,
        discount: 5,
        stock: 20,
        status: "active",
        timeStart: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800", // Đền Thiên Đàn Bắc Kinh
          "https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?q=80&w=800", // Thượng Hải Pudong
          "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800"  // Vạn Lý Trường Thành
        ]),
        information: `
          <p>Hành trình di sản văn hóa Trung Hoa qua 4 thành phố nổi tiếng nhất: thủ đô <strong>Bắc Kinh</strong> cổ kính với Vạn Lý Trường Thành kỳ vị, Tử Cấm Thành uy nghiêm; <strong>Thượng Hải</strong> hiện đại sầm uất bên bến Thượng Hải; <strong>Tô Châu</strong> - giang nam sông nước thơ mộng; và <strong>Hàng Châu</strong> phong cảnh hữu tình như thiên đường nơi hạ giới.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Chinh phục <strong>Vạn Lý Trường Thành</strong> - một trong bảy kỳ quan thế giới mới.</li>
            <li>Tham quan <strong>Tử Cấm Thành (Cố Cung)</strong> - cung điện hoàng gia lớn nhất thế giới.</li>
            <li>Dạo thuyền ngắm cảnh <strong>Tây Hồ Hàng Châu</strong> thơ mộng.</li>
            <li>Khám phá các khu vườn cổ kiến trúc độc đáo tại <strong>Tô Châu (Sư Tử Lâm)</strong>.</li>
            <li>Check-in <strong>Bến Thượng Hải</strong> sầm uất và tháp truyền hình Đông Phương Minh Châu.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Bắc Kinh</h4>
          <p>Đoàn làm thủ tục đáp chuyến bay thẳng từ Hà Nội đi Bắc Kinh. Đến Bắc Kinh, xe đón đoàn về nhận phòng khách sạn nghỉ ngơi.</p>
          <h4>Ngày 2: Vạn Lý Trường Thành - Thập Tam Lăng</h4>
          <p>Chinh phục Vạn Lý Trường Thành (Cư Dung Quan). Chiều tham quan Thập Tam Lăng (Trường Lăng) - lăng mộ của các hoàng đế nhà Minh. Thưởng thức đặc sản Vịt quay Bắc Kinh.</p>
          <h4>Ngày 3: Tử Cấm Thành - Di Hòa Viên</h4>
          <p>Tham quan Quảng trường Thiên An Môn, Tử Cấm Thành với 9.999 gian cung điện nguy nga. Chiều tham quan Di Hòa Viên - cung điện mùa hè của Từ Hy Thái Hậu.</p>
          <h4>Ngày 4: Bắc Kinh - tàu cao tốc đi Tô Châu</h4>
          <p>Đoàn đón tàu cao tốc từ Bắc Kinh đi Tô Châu (khoảng 5 tiếng). Đến Tô Châu, tham quan Sư Tử Lâm - vườn cổ nổi tiếng Giang Nam, chùa Hàn Sơn cổ kính.</p>
          <h4>Ngày 5: Tô Châu - Hàng Châu</h4>
          <p>Khởi hành đi Hàng Châu. Du thuyền thưởng ngoạn vẻ đẹp thơ mộng của Tây Hồ, tham quan Tam Đàn Ấn Nguyệt, đền thờ Nhạc Phi, thưởng thức trà Long Tỉnh nổi tiếng.</p>
          <h4>Ngày 6: Hàng Châu - Thượng Hải</h4>
          <p>Di chuyển đến Thượng Hải. Tham quan Bến Thượng Hải, khu phố cổ Miếu Thành Hoàng, phố đi bộ Nam Kinh sầm uất. Chụp hình lưu niệm dưới chân tháp truyền hình Đông Phương Minh Châu.</p>
          <h4>Ngày 7: Thượng Hải - Hà Nội</h4>
          <p>Đoàn tự do mua sắm trước khi xe đưa ra sân bay đáp chuyến bay về lại Hà Nội. Kết thúc chương trình du lịch Trung Quốc 4 địa danh.</p>
        `
      },
      {
        title: "Tour Lệ Giang - Shangri-La huyền thoại (6 ngày 5 đêm)",
        price: 15990000,
        discount: 15,
        stock: 15,
        status: "active",
        timeStart: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=800", // Núi tuyết Ngọc Long
          "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800", // Phố cổ Lệ Giang
          "https://images.unsplash.com/photo-1762969834554-dbc8b8ac9aff?q=80&w=800"  // Tu viện Songzanlin (Shangri-La)
        ]),
        information: `
          <p>Khám phá <strong>Lệ Giang cổ trấn</strong> - Venice của phương Đông nằm dưới chân núi tuyết Ngọc Long kỳ vĩ với lịch sử hơn 800 năm. Trải nghiệm thung lũng <strong>Shangri-La</strong> huyền thoại, nơi được mệnh danh là 'Thung lũng bất tử', nơi hội tụ văn hóa Tây Tạng huyền bí giữa cao nguyên lộng gió.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Khám phá Đô thị cổ Lệ Giang với hệ thống kênh rạch uốn lượn cổ kính.</li>
            <li>Chinh phục <strong>Núi tuyết Ngọc Long</strong> bằng cáp treo lên độ cao 4.506m quanh năm tuyết phủ.</li>
            <li>Ngắm vẻ đẹp ngỡ ngàng của <strong>Thung lũng Lam Nguyệt (Blue Moon Valley)</strong>.</li>
            <li>Khám phá <strong>Khe Hổ Nhảy (Hổ Khiêu Hiệp)</strong> - một trong những hẻm núi sâu nhất thế giới.</li>
            <li>Tham quan đền thờ Tây Tạng <strong>Songzanlin</strong> đồ sộ như một Cung điện Potala thu nhỏ.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Lào Cai - Côn Minh - Lệ Giang</h4>
          <p>Đoàn di chuyển bằng xe giường nằm lên Lào Cai, làm thủ tục xuất cảnh sang Hà Khẩu. Đi tàu cao tốc từ Hà Khẩu đến Côn Minh, sau đó chuyển tiếp tàu cao tốc đi Lệ Giang. Nhận phòng và tự do đi dạo Lệ Giang Cổ Trấn về đêm.</p>
          <h4>Ngày 2: Núi tuyết Ngọc Long - Thung lũng Lam Nguyệt</h4>
          <p>Đi cáp treo lên núi tuyết Ngọc Long ngắm cảnh tuyết trắng kỳ vĩ. Tham quan Bạch Thủy Hà, thung lũng Lam Nguyệt với dòng nước xanh ngọc bích quanh năm. Xem show diễn 'Ấn tượng Lệ Giang' của đạo diễn Trương Nghệ Mưu.</p>
          <h4>Ngày 3: Lệ Giang cổ trấn - Hẻm núi Khe Hổ Nhảy - Shangrila</h4>
          <p>Rời Lệ Giang, đoàn đi tham quan Khe Hổ Nhảy ngắm dòng sông Kim Sa cuộn trào qua hẻm đá kỳ vĩ. Tiếp tục di chuyển lên cao nguyên Shangri-La ở độ cao hơn 3.200m.</p>
          <h4>Ngày 4: Khám phá Shangrila thanh bình</h4>
          <p>Tham quan Tu viện Songzanlin (tu viện Phật giáo Tây Tạng lớn nhất Vân Nam), khám phá công viên quốc gia Phổ Đạt Thố với hồ nước phẳng lặng và rừng thông nguyên sinh bát ngát.</p>
          <h4>Ngày 5: Shangrila - Côn Minh</h4>
          <p>Khởi hành về lại Côn Minh bằng tàu cao tốc. Đến Côn Minh, nhận phòng khách sạn, dùng bữa tối lẩu nấm Vân Nam đặc sản.</p>
          <h4>Ngày 6: Côn Minh - Hà Khẩu - Hà Nội</h4>
          <p>Đoàn tham quan Chợ hoa Côn Minh lớn nhất châu Á, sau đó lên tàu cao tốc về lại Hà Khẩu. Làm thủ tục nhập cảnh về Việt Nam và xe đưa đoàn về Hà Nội. Kết thúc hành trình.</p>
        `
      },
      {
        title: "Tour Cửu Trại Câu - Thiên Đường Hạ Giới (6 ngày 5 đêm)",
        price: 16500000,
        discount: 8,
        stock: 18,
        status: "active",
        timeStart: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=800",
          "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=800",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"
        ]),
        information: `
          <p>Khám phá <strong>Cửu Trại Câu</strong> - khu bảo tồn thiên nhiên được UNESCO công nhận là di sản thế giới với những hồ nước xanh ngọc đa sắc tuyệt mỹ đổi màu theo mùa. Hành trình còn kết hợp tham quan Thành Đô - quê hương của gấu trúc lớn tinh nghịch và thung lũng đá vôi Hoàng Long lung linh.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Tham quan hệ thống hồ nước đa sắc: Hồ Ngũ Sắc, Hồ Gương, Hồ Thác Nước Nặc Nhật Lãng tại Cửu Trại Câu.</li>
            <li>Ghé thăm <strong>Trung tâm nghiên cứu Gấu Trúc Thành Đô</strong>.</li>
            <li>Tham quan danh thắng <strong>Hoàng Long</strong> với các hồ bậc thang đá vôi tuyệt đẹp.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Thành Đô</h4><p>Đoàn đáp chuyến bay từ Hà Nội đi Thành Đô. Xe đón đoàn về nhận phòng khách sạn nghỉ đêm tại Thành Đô.</p>
          <h4>Ngày 2: Thành Đô - Đô Giang Yển - Cửu Trại Câu</h4><p>Tham quan công trình thủy lợi cổ Đô Giang Yển. Chiều khởi hành đi Cửu Trại Câu, thưởng thức văn hóa của người dân tộc Tạng dọc đường đi.</p>
          <h4>Ngày 3: Khám phá trọn vẹn danh thắng Cửu Trại Câu</h4><p>Đoàn dành cả ngày ngồi xe sinh thái tham quan danh thắng Cửu Trại Câu với các hồ nước tuyệt mỹ đổi màu kỳ ảo.</p>
          <h4>Ngày 4: Cửu Trại Câu - Hoàng Long - Mâu Ni Câu</h4><p>Khám phá thung lũng Hoàng Long và thác nước Mâu Ni Câu - thác nước đá vôi lớn nhất Trung Quốc.</p>
          <h4>Ngày 5: Cửu Trại Câu - Thành Đô</h4><p>Quay trở về Thành Đô. Tối tự do dạo phố cổ Cẩm Lý sầm uất và thưởng thức lẩu Tứ Xuyên cay nồng.</p>
          <h4>Ngày 6: Thành Đô - Hà Nội</h4><p>Tham quan Trung tâm Gấu Trúc Thành Đô trước khi ra sân bay bay về Hà Nội. Kết thúc hành trình.</p>
        `
      },
      {
        title: "Tour Tây Tạng - Mái Nhà Thế Giới (8 ngày 7 đêm)",
        price: 35900000,
        discount: 5,
        stock: 10,
        status: "active",
        timeStart: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
          "https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=800",
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800"
        ]),
        information: `
          <p>Hành trình khám phá vùng đất Phật giáo linh thiêng <strong>Tây Tạng</strong> - nơi được mệnh danh là cực thứ ba của Trái Đất ở độ cao trung bình trên 4.000m. Du khách sẽ được chiêm ngưỡng cung điện Potala kỳ vĩ và những hồ nước thiêng xanh như ngọc bích.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Tham quan <strong>Cung điện Potala</strong> - kỳ quan kiến trúc Phật giáo Tây Tạng tại Lhasa.</li>
            <li>Ghé thăm đền <strong>Jokhang (Chùa Đại Chiêu)</strong> thiêng liêng nhất Tây Tạng.</li>
            <li>Chiêm ngưỡng vẻ đẹp huyền bí của <strong>Hồ Yamdrok (Hồ Dương Trác Ung Thác)</strong>.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Thành Đô - Lhasa</h4><p>Đoàn bay từ Hà Nội đi Thành Đô, nối chuyến bay đi Lhasa Tây Tạng. Nhận phòng và nghỉ ngơi tại khách sạn để thích nghi với độ cao.</p>
          <h4>Ngày 2: Cung điện Potala - Đền Jokhang</h4><p>Tham quan cung điện Potala nguy nga và đền Đại Chiêu Jokhang linh thiêng. Dạo quanh phố cổ Barkhor.</p>
          <h4>Ngày 3: Tu viện Drepung - Tu viện Sera</h4><p>Tham quan hai tu viện lớn nhất của phái Mũ Vàng Tây Tạng, xem buổi biện kinh nổi tiếng của các nhà sư tại tu viện Sera.</p>
          <h4>Ngày 4: Lhasa - Hồ Yamdrok - Gyantse</h4><p>Vượt đèo cao ngắm Hồ nước mặn thiêng Yamdrok xanh biếc như ngọc. Di chuyển đến thị trấn cổ Gyantse.</p>
          <h4>Ngày 5: Gyantse - Shigatse</h4><p>Tham quan Pháo đài Gyantse và chùa Vạn Phật trước khi đi đến thành phố lớn thứ hai Tây Tạng - Shigatse.</p>
          <h4>Ngày 6: Shigatse - Lhasa</h4><p>Ghé thăm tu viện Tashilhunpo - nơi ngự trị của Ban Thiền Lạt Ma. Trở về Lhasa bằng tàu cao tốc Thanh Tạng.</p>
          <h4>Ngày 7: Lhasa - Thành Đô</h4><p>Đoàn đón chuyến bay về lại Thành Đô mua sắm và nghỉ ngơi.</p>
          <h4>Ngày 8: Thành Đô - Hà Nội</h4><p>Bay về Hà Nội. Kết thúc hành trình khám phá Tây Tạng huyền bí.</p>
        `
      },
      {
        title: "Tour Đại Lý - Lệ Giang - Côn Minh (6 ngày 5 đêm)",
        price: 14990000,
        discount: 12,
        stock: 22,
        status: "active",
        timeStart: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1543097692-fa13c6cd8595?q=80&w=800",
          "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=800",
          "https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?q=80&w=800"
        ]),
        information: `
          <p>Hành trình khám phá Vân Nam huyền thoại qua 3 điểm đến nổi tiếng: thủ phủ <strong>Côn Minh</strong> với rừng đá Thạch Lâm kỳ vĩ; cổ thành <strong>Đại Lý</strong> yên bình bên hồ Nhĩ Hải thơ mộng (phim trường Thiên Long Bát Bộ); và <strong>Lệ Giang cổ trấn</strong> trầm mặc dưới chân núi tuyết.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Khám phá phim trường <strong>Đại Lý Cổ Thành</strong>.</li>
            <li>Tham quan thắng cảnh <strong>Tam Tháp Đại Lý</strong> cổ kính.</li>
            <li>Dạo thuyền trên <strong>Hồ Nhĩ Hải</strong> ngắm cảnh thanh bình.</li>
            <li>Khám phá <strong>Lệ Giang cổ trấn</strong> cổ kính thơ mộng.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Hà Khẩu - Côn Minh</h4><p>Đoàn xuất cảnh đi Hà Khẩu, lên tàu cao tốc đi Côn Minh. Nhận phòng và tự do tham quan phố đi bộ Kim Mã Bích Kê.</p>
          <h4>Ngày 2: Thạch Lâm - Đại Lý</h4><p>Khám phá kỳ quan Rừng đá Thạch Lâm. Chiều đón tàu cao tốc đi Đại Lý cổ thành.</p>
          <h4>Ngày 3: Khám phá Đại Lý - Lệ Giang</h4><p>Tham quan Tam Tháp Đại Lý, dạo thuyền Hồ Nhĩ Hải. Chiều di chuyển bằng ô tô đi Lệ Giang.</p>
          <h4>Ngày 4: Núi tuyết Ngọc Long - Thung lũng Lam Nguyệt</h4><p>Chinh phục núi tuyết Ngọc Long bằng cáp treo, ngắm dòng nước xanh biếc tại thung lũng Lam Nguyệt.</p>
          <h4>Ngày 5: Lệ Giang - Côn Minh</h4><p>Tự do mua sắm tại Lệ Giang trước khi lên tàu cao tốc về lại Côn Minh.</p>
          <h4>Ngày 6: Côn Minh - Hà Khẩu - Hà Nội</h4><p>Tham quan chợ hoa lớn nhất châu Á ở Côn Minh, sau đó đón tàu cao tốc về Hà Khẩu để làm thủ tục nhập cảnh về Việt Nam.</p>
        `
      },
      {
        title: "Tour Tây An - Con Đường Tơ Lụa & Lăng Mộ Tần Thủy Hoàng (5 ngày 4 đêm)",
        price: 15500000,
        discount: 10,
        stock: 20,
        status: "active",
        timeStart: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800", // Tường thành cổ Tây An
          "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800", // Tượng binh mã dũng
          "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=800"  // Lầu cổ truyền thống
        ]),
        information: `
          <p>Khám phá cố đô <strong>Tây An</strong> - cái nôi của nền văn minh Trung Hoa cổ đại và điểm khởi đầu của Con đường Tơ lụa huyền thoại. Trực tiếp chiêm ngưỡng Đội quân đất nung Terracotta kỳ vĩ trong lăng mộ hoàng đế Tần Thủy Hoàng.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Tham quan kỳ quan khảo cổ <strong>Binh Mã Dũng (Terracotta Army)</strong> trong quần thể lăng mộ Tần Thủy Hoàng.</li>
            <li>Dạo bước trên <strong>Tường thành cổ Tây An</strong> hoành tráng thời nhà Minh.</li>
            <li>Khám phá khu phố Hồi giáo (Muslim Quarter) và Tháp Đại Nhạn.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Quảng Châu - Tây An</h4><p>Đoàn làm thủ tục bay từ Hà Nội đi Tây An (quá cảnh Quảng Châu). Đến Tây An, nhận phòng khách sạn nghỉ ngơi.</p>
          <h4>Ngày 2: Lăng Mộ Tần Thủy Hoàng - Đội Quân Đất Nung</h4><p>Dành cả ngày tham quan khu di tích Binh Mã Dũng với hàng ngàn tượng chiến binh đất nung kích thước như người thật.</p>
          <h4>Ngày 3: Tường Thành Cổ Tây An - Tháp Đại Nhạn</h4><p>Tham quan và đi xe đạp trải nghiệm trên Tường thành cổ Tây An. Chiều tham quan Tháp Đại Nhạn lịch sử.</p>
          <h4>Ngày 4: Tháp Chuông - Phố Hồi Giáo</h4><p>Check-in Tháp Chuông và Tháp Trống Tây An. Chiều tự do mua sắm quà lưu niệm và thưởng thức ẩm thực đường phố tại phố Hồi Giáo.</p>
          <h4>Ngày 5: Tây An - Hà Nội</h4><p>Đoàn đáp chuyến bay về lại Việt Nam. Kết thúc tour Tây An ý nghĩa.</p>
        `
      },
      {
        title: "Tour Quế Lâm - Dương Sóc: Tranh Thủy Mặc Hữu Tình (5 ngày 4 đêm)",
        price: 9990000,
        discount: 15,
        stock: 30,
        status: "active",
        timeStart: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1505881502353-a1986add3762?q=80&w=800",
          "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800",
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800"
        ]),
        information: `
          <p>Du ngoạn danh thắng <strong>Quế Lâm</strong> - nơi được mệnh danh là 'Sơn thủy giáp thiên hạ' (phong cảnh đẹp nhất thiên hạ). Ngồi thuyền xuôi dòng sông Ly Giang ngắm các ngọn núi đá vôi nhấp nhô tuyệt đẹp mờ ảo trong sương.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Du thuyền ngắm cảnh sông <strong>Ly Giang</strong> thơ mộng như tranh thủy mặc.</li>
            <li>Tham quan thị trấn cổ <strong>Dương Sóc</strong> và con phố Tây sầm uất.</li>
            <li>Ghé thăm ruộng bậc thang <strong>Long Tích (Longji Rice Terraces)</strong> kỳ vĩ bậc nhất thế giới.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Nam Ninh - Quế Lâm</h4><p>Đoàn di chuyển đường bộ từ Hà Nội đi Lạng Sơn, xuất cảnh sang Bằng Tường rồi đi tàu cao tốc từ Nam Ninh tới Quế Lâm.</p>
          <h4>Ngày 2: Du thuyền Sông Ly Giang - Dương Sóc</h4><p>Du thuyền dọc sông Ly Giang chiêm ngưỡng núi non kỳ vĩ. Chiều đến Dương Sóc nhận phòng, tự do dạo phố Tây Tây.</p>
          <h4>Ngày 3: Núi Vòi Voi - Động Lô Địch Nham</h4><p>Trở lại Quế Lâm tham quan Núi Vòi Voi (biểu tượng Quế Lâm), khám phá động đá vôi Lô Địch Nham rực rỡ ánh đèn.</p>
          <h4>Ngày 4: Ruộng Bậc Thang Long Tích</h4><p>Di chuyển tham quan quần thể ruộng bậc thang Long Tích vô cùng hùng vĩ của người dân tộc Choang.</p>
          <h4>Ngày 5: Quế Lâm - Nam Ninh - Hà Nội</h4><p>Đáp tàu về lại Nam Ninh, sau đó làm thủ tục về Việt Nam qua cửa khẩu Hữu Nghị.</p>
        `
      },
      {
        title: "Tour Nam Kinh - Vô Tích - Ô Trấn: Giang Nam Thơ Mộng (5 ngày 4 đêm)",
        price: 13900000,
        discount: 10,
        stock: 20,
        status: "active",
        timeStart: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800", // Ô Trấn (Wuzhen)
          "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800", // Đền Phu Tử Nam Kinh
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800"  // Vô Tích pagoda
        ]),
        information: `
          <p>Hành trình đưa bạn khám phá vùng đất giang nam sông nước thơ mộng bậc nhất Trung Quốc. Trải nghiệm cổ trấn ven sông <strong>Ô Trấn (Wuzhen)</strong> với lịch sử nghìn năm bình yên, cố đô Nam Kinh cổ kính và kỳ quan tượng Phật khổng lồ Lingshan Phật tại Vô Tích.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Khám phá <strong>Ô Trấn (Tây Sách)</strong> - cổ trấn sông nước đẹp nhất Giang Nam khi lên đèn.</li>
            <li>Tham quan đền Khổng Tử tại Nam Kinh và sông Tần Hoài thơ mộng.</li>
            <li>Chiêm ngưỡng tượng Phật đồng khổng lồ <strong>Linh Sơn Đại Phật</strong> tại Vô Tích.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Thượng Hải - Ô Trấn</h4><p>Đoàn bay đi Thượng Hải, xe đón di chuyển trực tiếp về Ô Trấn cổ trấn. Khám phá nét yên bình cổ kính ven sông.</p>
          <h4>Ngày 2: Ô Trấn - Vô Tích</h4><p>Tham quan thủy trấn Ô Trấn vào sáng sớm. Chiều khởi hành đi Vô Tích, tham quan khu du lịch Thái Hồ.</p>
          <h4>Ngày 3: Linh Sơn Đại Phật - Nam Kinh</h4><p>Khám phá đại tượng Phật Linh Sơn cao 88m. Chiều khởi hành đi cố đô Nam Kinh.</p>
          <h4>Ngày 4: Khám phá Nam Kinh cổ kính</h4><p>Tham quan Lăng Tôn Trung Sơn, Đền Phu Tử Nam Kinh và dạo thuyền ngắm sông Tần Hoài lãng mạn.</p>
          <h4>Ngày 5: Nam Kinh - Thượng Hải - Hà Nội</h4><p>Quay trở về Thượng Hải đáp chuyến bay về lại Hà Nội. Kết thúc hành trình.</p>
        `
      },
      {
        title: "Tour Khám Phá Tân Cương: Con Đường Tơ Lụa Huyền Bí (9 ngày 8 đêm)",
        price: 38900000,
        discount: 5,
        stock: 12,
        status: "active",
        timeStart: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800", // Sa mạc Tân Cương
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800", // Thiên Trì
          "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=800"  // Phố cổ Kashgar
        ]),
        information: `
          <p>Hành trình thám hiểm vùng đất <strong>Tân Cương</strong> rộng lớn kỳ bí ở vùng biên thùy phía Tây Bắc Trung Quốc. Nơi hội tụ các cảnh quan hoang sơ từ thảo nguyên bao la, hồ nước trên đỉnh núi tuyết đến sa mạc Gobi hoang dã cùng nền văn hóa Duy Ngô Nhĩ độc đáo.</p>
          <p><strong>Những điểm nổi bật trong hành trình:</strong></p>
          <ul>
            <li>Chiêm ngưỡng Hồ Thiên Trì (Heavenly Lake) trong vắt dưới chân núi tuyết Bogda.</li>
            <li>Khám phá thành phố ốc đảo Turpan và di tích thành cổ Jiaohe.</li>
            <li>Khám phá phố cổ <strong>Kashgar</strong> - trái tim của Con đường Tơ lụa huyền thoại.</li>
          </ul>
        `,
        schedule: `
          <h4>Ngày 1: Hà Nội - Urumqi</h4><p>Đoàn bay đi Urumqi - thủ phủ của khu tự trị Tân Cương. Xe đón đoàn về khách sạn nghỉ ngơi.</p>
          <h4>Ngày 2: Urumqi - Thiên Trì</h4><p>Tham quan danh thắng Hồ Thiên Trì trên núi Thiên Sơn kỳ vĩ, ngắm núi tuyết Bogda.</p>
          <h4>Ngày 3: Urumqi - Hỏa Diệm Sơn - Turpan</h4><p>Di chuyển đến Turpan, tham quan địa danh Hỏa Diệm Sơn nổi tiếng trong truyện Tây Du Ký.</p>
          <h4>Ngày 4: Turpan - Thành cổ Giao Hà - Kashgar</h4><p>Khám phá giếng nước cổ Karez và phế tích thành cổ Giao Hà. Tối đón chuyến bay nội địa đi Kashgar.</p>
          <h4>Ngày 5: Khám phá phố cổ Kashgar</h4><p>Tham quan nhà thờ Hồi giáo Id Kah cổ nhất Tân Cương và dạo quanh khu phố cổ Kashgar sầm uất mang đậm nét kiến trúc Trung Á.</p>
          <h4>Ngày 6: Kashgar - Hồ Karakul - Cao Nguyên Pamir</h4><p>Di chuyển dọc quốc lộ Karakoram lên hồ nước Karakul thơ mộng trên cao nguyên Pamir hùng vĩ.</p>
          <h4>Ngày 7: Kashgar - Urumqi</h4><p>Tự do mua sắm tại chợ quốc tế Grand Bazaar Kashgar trước khi đáp chuyến bay về lại Urumqi.</p>
          <h4>Ngày 8: Urumqi - Quảng Châu</h4><p>Bay về Quảng Châu nghỉ đêm tự do mua sắm.</p>
          <h4>Ngày 9: Quảng Châu - Hà Nội</h4><p>Bay về lại Hà Nội. Kết thúc hành trình khám phá Tân Cương 9 ngày.</p>
        `
      }
    ];

    for (let t of newTours) {
      // Kiểm tra xem tour này đã có chưa
      const existing = await Tour.findOne({ where: { title: t.title }, transaction });
      if (existing) {
        console.log(`ℹ️ Tour '${t.title}' đã tồn tại trong database.`);
        continue;
      }

      // Tạo tour mới (slug tự tạo qua hook beforeCreate)
      const positionCount = await Tour.count({ transaction });
      t.position = positionCount + 1;
      
      const createdTour = await Tour.create(t, { transaction });
      const tourId = createdTour.id;
      
      // Tạo mã code TOUR00000x
      const code = generateTourCode(tourId);
      await Tour.update({ code }, { where: { id: tourId }, transaction });

      // Liên kết danh mục
      await TourCategory.create({
        tour_id: tourId,
        category_id: categoryId
      }, { transaction });

      console.log(`✅ Đã tạo tour thành công: '${t.title}' (Mã: ${code}, ID: ${tourId})`);
    }

    await transaction.commit();
    console.log("\n🎉 Seed dữ liệu 10 tour Trung Quốc hoàn tất thành công!");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Thất bại khi seed dữ liệu tour Trung Quốc:", error);
  } finally {
    process.exit(0);
  }
}

main();
