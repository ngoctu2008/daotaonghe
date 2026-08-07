function doGet(e) {
  // Hàm tạo dữ liệu mock cho 26 nghề
  function taoDanhSach26Nghe() {
    var danhSachNghe = [];
    var tenNgheGiaDinh = [
      "Vận hành, sửa chữa máy nông nghiệp", "Kỹ thuật Xây dựng (Nề hoàn thiện)", "Điện dân dụng",
      "Sửa chữa xe máy", "Kỹ thuật chăn nuôi thú y", "Trồng trọt và bảo vệ thực vật",
      "Hàn điện - Cắt kim loại", "Tin học văn phòng cơ bản", "May công nghiệp",
      "Kỹ thuật chế biến món ăn", "Pha chế đồ uống (Bartender)", "Chăm sóc sắc đẹp (Spa)",
      "Kỹ thuật sửa chữa điện lạnh", "Vận hành máy xúc, máy đào", "Lái xe nâng hàng",
      "Thiết kế đồ họa cơ bản", "Kỹ thuật điện tử công nghiệp", "Sửa chữa điện thoại",
      "Gia công mộc mỹ nghệ", "Kỹ thuật trồng nấm", "Trồng hoa, cây cảnh",
      "Bảo trì thiết bị cơ điện", "Quản lý doanh nghiệp nhỏ", "Kỹ năng bán hàng siêu thị",
      "Tiếng Anh giao tiếp nghề nghiệp", "Tiếng Hàn lao động xuất khẩu"
    ];

    var iconList = [
      "fa-tractor", "fa-hard-hat", "fa-bolt", "fa-motorcycle", "fa-paw", "fa-seedling",
      "fa-fire", "fa-laptop", "fa-tshirt", "fa-utensils", "fa-glass-martini", "fa-spa",
      "fa-snowflake", "fa-truck-pickup", "fa-truck-loading", "fa-palette", "fa-microchip", "fa-mobile-alt",
      "fa-hammer", "fa-tree", "fa-leaf", "fa-cogs", "fa-chart-line", "fa-shopping-cart",
      "fa-language", "fa-globe-asia"
    ];

    for (var i = 0; i < 26; i++) {
      danhSachNghe.push({
        tenNganh: tenNgheGiaDinh[i],
        trinhDo: "Sơ cấp bậc 1",
        chuanDauRa: "Chứng chỉ nghề sơ cấp bậc 1 - Thực hành " + (242) + " giờ.",
        thucHanh: "Thực hành 75.6%",
        icon: iconList[i],
        // Chi tiết chuẩn đầu ra theo yêu cầu của bạn
        chiTiet: {
          tongQuan: {
            maNghe: "55201" + (87 + i).toString(), // Mã tự tăng để khác biệt
            trinhDoDaoTao: "Sơ cấp bậc 1",
            thoiGian: "3 tháng (14 tuần)",
            khoiLuong: "03 Mô đun",
            doiTuong: "Từ 15 tuổi trở lên, biết đọc, biết viết, sức khỏe phù hợp",
            vanBang: "Chứng chỉ nghề sơ cấp bậc 1",
            canCu: "Quyết định số 41/QĐ-GDNN-GDTX (04/06/2024 - TT GDNN – GDTX Đăk Hà)"
          },
          mucTieu: {
            kienThuc: [
              "Nắm vững nguyên lý hoạt động, cấu tạo của thiết bị và hệ thống liên quan.",
              "Nhận diện hiện tượng, nguyên nhân hư hỏng và nắm rõ quy trình kiểm tra, bảo dưỡng.",
              "Hiểu rõ cấu tạo, nhiệm vụ các bộ phận và phương pháp điều khiển, vận hành.",
              "Nắm vững sơ đồ cấu tạo, nguyên lý làm việc và trình tự chẩn đoán, sửa chữa."
            ],
            kyNang: [
              "Thực hiện tháo lắp, kiểm tra, bảo dưỡng đúng yêu cầu kỹ thuật.",
              "Vận hành an toàn và chuẩn kỹ thuật trên các điều kiện khác nhau.",
              "Xử lý, sửa chữa các hư hỏng thông thường; lựa chọn phương pháp tối ưu.",
              "Phân tích, đánh giá các dạng sai hỏng, tìm ra nguyên nhân và phòng ngừa."
            ],
            nangLuc: [
              "Kỹ năng ghi chép, tiếp nhận thông tin và làm việc nhóm hiệu quả.",
              "Tác phong công nghiệp chuẩn mực, dễ thích nghi tại cơ sở làm việc.",
              "Chủ động tự học, trau dồi tay nghề và nâng cao kinh nghiệm.",
              "Tuân thủ tuyệt đối an toàn lao động cho người và thiết bị."
            ],
            viecLam: [
              "Làm việc tại các phân xưởng, nhà máy, công ty chuyên ngành.",
              "Đủ năng lực tự tổ chức sản xuất kinh doanh, cung cấp dịch vụ tại địa phương."
            ]
          },
          thoiGian: [
            { hangMuc: "Thực hành", thoiLuong: 242, tyLe: "75.6%" },
            { hangMuc: "Lý thuyết", thoiLuong: 29, tyLe: "9.1%" },
            { hangMuc: "Kiểm tra định kỳ / Kết thúc Mô đun", thoiLuong: 25, tyLe: "7.8%" },
            { hangMuc: "Tự học", thoiLuong: 24, tyLe: "7.5%" }
          ]
        }
      });
    }
    return danhSachNghe;
  }

  // Dữ liệu Mock Data (JSON)
  var data = {
    chuongTrinhDaoTao: taoDanhSach26Nghe(),
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
