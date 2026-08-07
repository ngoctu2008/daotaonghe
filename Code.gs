function doGet(e) {
  // Hàm tạo dữ liệu mock danh sách nghề thực tế
  function taoDanhSachNghe() {
    var rawList = [
      // Nhóm nghề phi nông nghiệp
      { ten: "Hàn điện", trinhDo: "Sơ cấp", thoiGian: "3 tháng", icon: "fa-fire" },
      { ten: "Vận hành, sửa chữa máy nông nghiệp", trinhDo: "Sơ cấp", thoiGian: "3 tháng", icon: "fa-tractor" },
      { ten: "Vận hành máy kéo nông nghiệp", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-truck-pickup" },
      { ten: "Nề - Hoàn thiện", trinhDo: "Sơ cấp", thoiGian: "3 tháng", icon: "fa-hard-hat" },
      // Nhóm nghề nông nghiệp
      { ten: "Trồng rau an toàn", trinhDo: "Dưới 3 tháng", thoiGian: "2 tháng", icon: "fa-leaf" },
      { ten: "Trồng dâu - nuôi tằm", trinhDo: "Dưới 3 tháng", thoiGian: "2 tháng", icon: "fa-bug" },
      { ten: "Trồng và chăm sóc cây mắc ca", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-tree" },
      { ten: "Trồng keo, bạch đàn, thông làm nguyên liệu giấy", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-tree" },
      { ten: "Trồng và chăm sóc cây sầu riêng", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-tree" },
      { ten: "Trồng nấm sò", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-seedling" },
      { ten: "Trồng, chăm sóc sâm Ngọc Linh", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-leaf" },
      { ten: "Trồng và chăm sóc cà phê vối", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-coffee" },
      { ten: "Trồng và chăm sóc cây cà phê (Catimor)", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-coffee" },
      { ten: "Trồng và chăm sóc cây cà phê", trinhDo: "Dưới 3 tháng", thoiGian: "2 tháng", icon: "fa-coffee" },
      { ten: "Nuôi và phòng trị bệnh cho trâu bò", trinhDo: "Dưới 3 tháng", thoiGian: "2 tháng", icon: "fa-hippo" },
      { ten: "Nuôi và phòng trị bệnh cho lợn", trinhDo: "Dưới 3 tháng", thoiGian: "2 tháng", icon: "fa-piggy-bank" },
      { ten: "Nuôi và phòng trị bệnh cho gà", trinhDo: "Dưới 3 tháng", thoiGian: "2 tháng", icon: "fa-kiwi-bird" },
      { ten: "Nuôi và phòng trị bệnh cho dê", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-paw" },
      { ten: "Nuôi dúi", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-paw" },
      { ten: "Cạo mủ cao su", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-tint" },
      { ten: "Quản lý và sử dụng thuốc bảo vệ thực vật", trinhDo: "Dưới 3 tháng", thoiGian: "1 tháng", icon: "fa-spray-can" }
    ];

    var danhSachNghe = [];

    for (var i = 0; i < rawList.length; i++) {
      var item = rawList[i];
      danhSachNghe.push({
        tenNganh: item.ten,
        trinhDo: item.trinhDo,
        chuanDauRa: item.trinhDo === "Sơ cấp" ? "Chứng chỉ sơ cấp nghề" : "Chứng chỉ đào tạo dưới 3 tháng",
        thucHanh: "Thực hành > 70%",
        icon: item.icon,
        chiTiet: {
          tongQuan: {
            maNghe: "55201" + (50 + i).toString(),
            trinhDoDaoTao: item.trinhDo,
            thoiGian: item.thoiGian,
            khoiLuong: "Cơ bản",
            doiTuong: "Từ 15 tuổi trở lên, sức khỏe phù hợp",
            vanBang: item.trinhDo === "Sơ cấp" ? "Chứng chỉ sơ cấp" : "Chứng chỉ đào tạo",
            canCu: "Quyết định phê duyệt chương trình đào tạo TT GDNN-GDTX khu vực Đăk Hà"
          },
          mucTieu: {
            kienThuc: [
              "Nắm vững kiến thức cơ bản và nguyên lý của nghề.",
              "Hiểu rõ các biện pháp an toàn và bảo hộ lao động."
            ],
            kyNang: [
              "Thực hiện thành thạo các thao tác thực hành cơ bản.",
              "Vận dụng kỹ năng vào thực tế sản xuất, canh tác hoặc sửa chữa."
            ],
            nangLuc: [
              "Chủ động, kỷ luật trong quá trình làm việc.",
              "Thích ứng tốt với môi trường lao động tại địa phương."
            ],
            viecLam: [
              "Làm việc tại các cơ sở, trang trại, doanh nghiệp địa phương.",
              "Tự tạo việc làm, phát triển kinh tế hộ gia đình."
            ]
          },
          thoiGian: [
            { hangMuc: "Thực hành", thoiLuong: "Chiếm phần lớn", tyLe: "~ 75%" },
            { hangMuc: "Lý thuyết", thoiLuong: "Phần cơ sở", tyLe: "~ 15%" },
            { hangMuc: "Kiểm tra định kỳ", thoiLuong: "Theo quy định", tyLe: "~ 10%" }
          ]
        }
      });
    }
    return danhSachNghe;
  }

  // Dữ liệu Mock Data (JSON)
  var data = {
    chuongTrinhDaoTao: taoDanhSachNghe(),
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
      .setTitle('Hồ sơ năng lực đào tạo nghề - TT GDNN-GDTX khu vực Đăk Hà')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
