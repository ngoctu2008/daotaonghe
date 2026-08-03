function doGet(e) {
  // Dữ liệu Mock Data (JSON)
  var data = {
    chuongTrinhDaoTao: [
      {
        tenNganh: "Kỹ thuật Xây dựng",
        trinhDo: "Sơ cấp - 3 tháng",
        chuanDauRa: "Kỹ thuật xây tô, an toàn lao động.",
        thucHanh: "Thực hành chiếm 80%",
        icon: "fa-hard-hat",
        chiTiet: ["Nội quy an toàn", "Vật liệu xây dựng", "Thực hành xây tô", "Đọc bản vẽ cơ bản"]
      },
      {
        tenNganh: "Điện dân dụng & Điện thông minh",
        trinhDo: "Sơ cấp - 3 đến 6 tháng",
        chuanDauRa: "Lắp ráp, bảo trì mạch điện, nhà thông minh.",
        thucHanh: "Thực hành chiếm 80%",
        icon: "fa-bolt",
        chiTiet: ["An toàn điện", "Linh kiện điện tử", "Mạch điện dân dụng", "Lắp đặt Smarthome"]
      },
      {
        tenNganh: "Kỹ thuật Nông nghiệp",
        trinhDo: "Dưới 3 tháng",
        chuanDauRa: "Canh tác, trị bệnh cây cà phê, nông nghiệp sạch.",
        thucHanh: "Thực hành chiếm 80%",
        icon: "fa-leaf",
        chiTiet: ["Chọn giống cây", "Kỹ thuật bón phân", "Phòng trừ sâu bệnh", "Thu hoạch & Bảo quản"]
      }
    ],
    doiNguNhanSu: [
      {
        tieuDe: "Cán bộ, Giáo viên",
        conSo: 45,
        icon: "fa-users"
      },
      {
        tieuDe: "Giáo viên đạt chuẩn",
        conSo: 100,
        donVi: "%",
        icon: "fa-graduation-cap"
      },
      {
        tieuDe: "Chuyên gia/Thợ bậc cao",
        conSo: 15,
        icon: "fa-user-tie"
      }
    ],
    doiTac: [
      {
        ten: "Công ty Cổ phần Xây dựng A",
        logo: "https://via.placeholder.com/150/0000FF/808080?Text=DoiTac1"
      },
      {
        ten: "Tập đoàn Điện lực B",
        logo: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=DoiTac2"
      },
      {
        ten: "Viện Nông nghiệp C",
        logo: "https://via.placeholder.com/150/FFFF00/000000?Text=DoiTac3"
      },
      {
        ten: "Doanh nghiệp D",
        logo: "https://via.placeholder.com/150/000000/FFFFFF?Text=DoiTac4"
      }
    ]
  };

  var template = HtmlService.createTemplateFromFile('Index');
  template.data = data; // Truyền dữ liệu vào template

  return template.evaluate()
      .setTitle('Hồ sơ năng lực đào tạo nghề - TT GDNN-GDTX Đăk Tô')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
