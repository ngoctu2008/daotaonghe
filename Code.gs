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
      id: "course-xaydung",
      title: "Kỹ thuật Xây dựng",
      level: "Sơ cấp - 3 tháng",
      outcome: "Kỹ thuật xây tô, an toàn lao động.",
      practiceBadge: "Thực hành chiếm 80%",
      icon: "fa-hard-hat",
      details: {
        description: "Chương trình đào tạo thợ xây dựng dân dụng có khả năng đọc bản vẽ, thi công các hạng mục xây tô cơ bản.",
        knowledge: "Hiểu biết về vật liệu xây dựng, nguyên lý kết cấu cơ bản, và quy định an toàn lao động trên công trường.",
        skills: "Thành thạo kỹ năng trộn vữa, xây gạch, tô trát tường, ốp lát gạch, và lắp ráp giàn giáo an toàn.",
        career: "Làm việc tại các công ty thầu xây dựng, tổ đội thi công nhà ở dân dụng hoặc tự nhận thầu các công trình nhỏ."
      }
    },
    {
      id: "course-diendandung",
      title: "Điện dân dụng & Điện thông minh",
      level: "Sơ cấp - 3 đến 6 tháng",
      outcome: "Lắp ráp, bảo trì mạch điện, nhà thông minh.",
      practiceBadge: "Thực hành chiếm 80%",
      icon: "fa-plug",
      details: {
        description: "Đào tạo kỹ thuật viên lắp đặt, sửa chữa hệ thống điện gia đình và tiếp cận công nghệ nhà thông minh (Smart Home).",
        knowledge: "Nắm vững an toàn điện, nguyên lý hoạt động của các thiết bị điện, sơ đồ mạch điện và khí cụ điện.",
        skills: "Thiết kế, đi dây mạng lưới điện âm tường, nổi; lắp ráp bảng điện, công tắc; cài đặt cảm biến, công tắc thông minh điều khiển qua wifi.",
        career: "Trở thành thợ điện dân dụng độc lập, nhân viên bảo trì tại các tòa nhà, hoặc kỹ thuật viên lắp đặt Smart Home cho các đại lý."
      }
    },
    {
      id: "course-nongnghiep",
      title: "Kỹ thuật Nông nghiệp",
      level: "Dưới 3 tháng",
      outcome: "Canh tác, trị bệnh cây cà phê, nông nghiệp sạch.",
      practiceBadge: "Thực hành chiếm 80%",
      icon: "fa-leaf",
      details: {
        description: "Khóa học ngắn hạn hướng dẫn áp dụng kỹ thuật nông nghiệp hữu cơ và công nghệ cao vào canh tác cây trồng chủ lực.",
        knowledge: "Kiến thức về sinh lý thực vật, đặc điểm thổ nhưỡng, các loại phân bón và thuốc bảo vệ thực vật an toàn.",
        skills: "Kỹ thuật ghép cây, tỉa cành tạo tán cho cà phê, sầu riêng; nhận biết và phòng trị sâu bệnh hại; pha chế chế phẩm sinh học.",
        career: "Quản lý trang trại gia đình hiệu quả cao, chuyên gia tư vấn nông nghiệp cấp cơ sở, hoặc làm việc tại các nông trại VietGAP."
      }
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
