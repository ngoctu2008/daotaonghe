/**
 * Xử lý HTTP GET request khi người dùng truy cập vào URL của Web App
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');

  // ==========================================
  // MOCK DATA (DỮ LIỆU ĐỘNG)
  // Các phần dữ liệu có thể thay đổi thường xuyên
  // ==========================================

  // 1. Dữ liệu các chương trình đào tạo nghề
  template.courses = [
    {
      title: "Kỹ thuật Xây dựng",
      level: "Sơ cấp - 3 tháng",
      outcome: "Kỹ thuật xây tô, an toàn lao động.",
      practiceBadge: "Thực hành chiếm 80%",
      icon: "fa-hard-hat"
    },
    {
      title: "Điện dân dụng & Điện thông minh",
      level: "Sơ cấp - 3 đến 6 tháng",
      outcome: "Lắp ráp, bảo trì mạch điện, nhà thông minh.",
      practiceBadge: "Thực hành chiếm 80%",
      icon: "fa-plug"
    },
    {
      title: "Kỹ thuật Nông nghiệp",
      level: "Dưới 3 tháng",
      outcome: "Canh tác, trị bệnh cây cà phê, nông nghiệp sạch.",
      practiceBadge: "Thực hành chiếm 80%",
      icon: "fa-leaf"
    }
  ];

  // 2. Dữ liệu thống kê nhân sự (dùng cho hiệu ứng đếm số)
  template.stats = [
    { label: "Cán bộ, Giáo viên", value: 45, suffix: "+" },
    { label: "Đạt chuẩn nghề nghiệp", value: 100, suffix: "%" },
    { label: "Chuyên gia / Thợ bậc cao", value: 15, suffix: "+" }
  ];

  // 3. Dữ liệu đối tác (Danh sách logo hoặc tên đối tác)
  template.partners = [
    { name: "Công ty Cổ phần Xây dựng A", logoUrl: "https://via.placeholder.com/150x80?text=Partner+1" },
    { name: "Tập đoàn Điện lực B", logoUrl: "https://via.placeholder.com/150x80?text=Partner+2" },
    { name: "Nông trại Công nghệ cao C", logoUrl: "https://via.placeholder.com/150x80?text=Partner+3" },
    { name: "Khu công nghiệp D", logoUrl: "https://via.placeholder.com/150x80?text=Partner+4" }
  ];

  // Trả về giao diện HTML
  return template.evaluate()
      .setTitle('Hồ sơ năng lực - TT GDNN-GDTX Đăk Tô')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Hàm hỗ trợ nhúng các file HTML con (CSS, JS) vào file Index chính
 * @param {string} filename Tên file cần nhúng
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
