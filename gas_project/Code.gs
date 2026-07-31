/**
 * Hệ thống quản lý đào tạo nghề - Google Apps Script Backend
 * File: Code.gs
 */

// Lấy Spreadsheet chứa cơ sở dữ liệu
function getDbSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Hàm này CHỈ DÙNG 1 LẦN SAU KHI DÁN CODE ĐỂ XIN QUYỀN.
 * Bạn hãy chọn hàm setupPermissions trên thanh công cụ và bấm Chạy (Run).
 * Nó sẽ yêu cầu bạn cấp quyền cho Google Drive và Google Docs.
 */
function setupPermissions() {
  try {
    // Gọi thử một hàm của DriveApp và DocumentApp để kích hoạt hộp thoại xin quyền
    DriveApp.getFilesByName("KhoiTaoHeThong");
    DocumentApp.create("FileTamThoi").setTrashed(true);
    Logger.log("Đã cấp quyền thành công!");
  } catch (e) {
    Logger.log("Vui lòng làm theo hướng dẫn cấp quyền.");
  }
}

/**
 * Xử lý HTTP GET Request (khi người dùng truy cập Web App)
 */
function getLogoUrl() {
  try {
    var folderId = '1r8oSnXq47_0eJyE30eyTjbV9MKgo_hhM';
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFilesByName('Logo TT KV.png');
    if (files.hasNext()) {
      var file = files.next();
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return "https://drive.google.com/uc?export=view&id=" + file.getId();
    }
  } catch (e) {
    // Ignore permissions/search errors
  }
  return ""; // Fallback
}

function doGet(e) {
  var page = e.parameter.page;
  var courseId = e.parameter.courseId;
  var logoUrl = getLogoUrl();

  if (page == 'register' && courseId) {
    var template = HtmlService.createTemplateFromFile('StudentRegister');
    template.courseId = courseId;
    // Lấy danh sách đối tượng truyền vào trang đăng ký
    template.doiTuongList = getDoiTuong();
    template.logoUrl = logoUrl;
    return template.evaluate()
        .setTitle('Đăng ký khóa học')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  // Trang đăng nhập hoặc quản lý
  var template = HtmlService.createTemplateFromFile('Index');
  template.logoUrl = logoUrl;
  return template.evaluate()
      .setTitle('Hệ thống Quản lý Đào tạo Nghề')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Lấy nội dung file HTML (để include)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* =======================================================================
 * DANH MỤC (CATEGORIES)
 * ======================================================================= */

function getDanhSachNghe() {
  var sheet = getDbSpreadsheet().getSheetByName("DanhSachNghe");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) { // Bỏ qua tiêu đề
    if (data[i][0]) list.push(data[i][0].toString().trim());
  }
  return list;
}

function getDoiTuong() {
  var sheet = getDbSpreadsheet().getSheetByName("DoiTuong");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) { // Bỏ qua tiêu đề
    if (data[i][0]) list.push(data[i][0].toString().trim());
  }
  return list;
}



/* =======================================================================
 * QUẢN LÝ DANH MỤC (CATEGORIES CRUD)
 * ======================================================================= */

function getCategoryData(sheetName, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return [];
  var sheet = getDbSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var items = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      if (sheetName === 'DanhSachNghe') {
        items.push({
          value: data[i][0].toString().trim(),
          thoiGianDaoTao: data[i][1] ? data[i][1].toString().trim() : '',
          trinhDoDaoTao: data[i][2] ? data[i][2].toString().trim() : '',
          tongSoGio: data[i][3] ? data[i][3].toString().trim() : '',
          rowIndex: i + 1
        });
      } else {
        items.push({ value: data[i][0].toString().trim(), rowIndex: i + 1 });
      }
    }
  }
  return items;
}

function addCategoryItem(sheetName, itemData, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };

  var sheet = getDbSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: "Không tìm thấy Sheet " + sheetName };

  if (sheetName === 'DanhSachNghe') {
    if (!itemData || !itemData.value || itemData.value.trim() === "") return { success: false, message: "Tên nghề không được trống!" };
    sheet.appendRow([itemData.value.trim(), itemData.thoiGianDaoTao || '', itemData.trinhDoDaoTao || '', itemData.tongSoGio || '']);
  } else {
    // For other categories like DoiTuong where itemData is just a string value
    if (!itemData || itemData.trim() === "") return { success: false, message: "Dữ liệu trống!" };
    sheet.appendRow([itemData.trim()]);
  }
  return { success: true, message: "Đã thêm thành công!" };
}

function updateCategoryItem(sheetName, rowIndex, newItemValue, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  if (!newItemValue || newItemValue.trim() === "") return { success: false, message: "Dữ liệu trống!" };
  var sheet = getDbSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: "Không tìm thấy Sheet " + sheetName };

  sheet.getRange(rowIndex, 1).setValue(newItemValue.trim());
  return { success: true, message: "Đã cập nhật thành công!" };
}

function deleteCategoryItem(sheetName, rowIndex, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  if (rowIndex <= 1) return { success: false, message: "Không thể xóa dòng tiêu đề!" };
  var sheet = getDbSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: "Không tìm thấy Sheet " + sheetName };

  sheet.deleteRow(rowIndex);
  return { success: true, message: "Đã xóa thành công!" };
}


/* =======================================================================
 * XỬ LÝ XÁC THỰC, PHÂN QUYỀN VÀ TÀI KHOẢN
 * ======================================================================= */

function verifySession(credentials) {
  if (!credentials || !credentials.username || !credentials.password) return null;
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var u = data[i][0] != null ? data[i][0].toString().trim() : "";
    var p = data[i][1] != null ? data[i][1].toString().trim() : "";
    var role = data[i][2];
    var name = data[i][3];
    if (u === credentials.username.trim() && p === credentials.password.trim()) {
      return { username: u, role: role, name: name, rowIndex: i + 1 };
    }
  }
  return null;
}


function loginUser(username, password) {
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'TaiKhoan'" };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var u = data[i][0] != null ? data[i][0].toString().trim() : "";
    var p = data[i][1] != null ? data[i][1].toString().trim() : "";
    var role = data[i][2];
    var name = data[i][3];

    if (u === (username || "").trim() && p === (password || "").trim()) {
      return {
        success: true,
        user: { username: u, role: role, name: name, rowIndex: i + 1 }
      };
    }
  }
  return { success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" };
}

function changePassword(userInfo, oldPassword, newPassword) {
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  var row = userInfo.rowIndex;

  var currentPassword = sheet.getRange(row, 2).getValue().toString().trim();
  if (currentPassword !== oldPassword.trim()) {
    return { success: false, message: "Mật khẩu cũ không chính xác!" };
  }

  sheet.getRange(row, 2).setValue(newPassword.trim());
  return { success: true, message: "Đổi mật khẩu thành công!" };
}
function adminChangeUserPassword(targetRowIndex, newPassword, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");

  if (userInfo.role === 'GiaoVu') {
     var roleToModify = sheet.getRange(targetRowIndex, 3).getValue();
     if (roleToModify !== 'GiaoVien') return { success: false, message: "Giáo vụ chỉ được đổi mật khẩu của Giáo Viên!" };
  }

  sheet.getRange(targetRowIndex, 2).setValue(newPassword.trim());
  return { success: true, message: "Đã đặt lại mật khẩu cho tài khoản!" };
}


/* =======================================================================
 * QUẢN LÝ KHÓA HỌC (COURSES MANAGEMENT)
 * ======================================================================= */

/* =======================================================================
 * QUẢN TRỊ VIÊN: TÀI KHOẢN & CẤU HÌNH
 * ======================================================================= */

function getAccounts(credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return [];
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  var data = sheet.getDataRange().getValues();
  var accounts = [];
  for (var i = 1; i < data.length; i++) {
    // Không trả về password
    accounts.push({
      username: data[i][0] ? data[i][0].toString().trim() : "",
      role: data[i][2],
      name: data[i][3],
      rowIndex: i + 1
    });
  }
  if (userInfo.role === 'GiaoVu') {
    return accounts.filter(function(a) { return a.role === 'GiaoVien'; });
  }
  return accounts;
}

function addAccount(accData, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  if (userInfo.role === 'GiaoVu' && accData.role !== 'GiaoVien') return { success: false, message: "Giáo vụ chỉ được tạo tài khoản Giáo Viên!" };
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  sheet.appendRow([accData.username.trim(), accData.password.trim(), accData.role, accData.name]);
  return { success: true, message: "Đã thêm tài khoản!" };
}

function updateAccount(rowIndex, accData, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  if (userInfo.role === 'GiaoVu') {
    if (accData.role !== 'GiaoVien') return { success: false, message: "Giáo vụ chỉ được phép gán quyền Giáo Viên!" };
    var existingRole = sheet.getRange(rowIndex, 3).getValue();
    if (existingRole !== 'GiaoVien') return { success: false, message: "Giáo vụ không được phép sửa tài khoản của cấp bậc cao hơn!" };
  }

  if (accData.password && accData.password.trim() !== "") {
    sheet.getRange(rowIndex, 1, 1, 4).setValues([[accData.username.trim(), accData.password.trim(), accData.role, accData.name]]);
  } else {
    var oldPass = sheet.getRange(rowIndex, 2).getValue();
    sheet.getRange(rowIndex, 1, 1, 4).setValues([[accData.username.trim(), oldPass, accData.role, accData.name]]);
  }
  return { success: true, message: "Đã cập nhật tài khoản!" };
}

function deleteAccount(rowIndex, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  if (rowIndex <= 2) return { success: false, message: "Không thể xóa tài khoản Admin gốc!" }; // Bảo vệ admin đầu tiên
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  if (userInfo.role === 'GiaoVu') {
     var roleToDel = sheet.getRange(rowIndex, 3).getValue();
     if (roleToDel !== 'GiaoVien') return { success: false, message: "Giáo vụ chỉ được xóa tài khoản Giáo Viên!" };
  }
  sheet.deleteRow(rowIndex);
  return { success: true, message: "Đã xóa tài khoản!" };
}

function getConfig(userInfo) {
  var sheetConfig = getDbSpreadsheet().getSheetByName("CauHinh");
  if (!sheetConfig) return {};
  var data = sheetConfig.getDataRange().getValues();
  var config = { donXinHoc: "", danhSachLop: "", exportFolder: "", namHienTai: "" };
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === "DonXinHoc_TemplateID") config.donXinHoc = data[i][1] || "";
    if (data[i][0] === "DanhSachLop_TemplateID") config.danhSachLop = data[i][1] || "";
    if (data[i][0] === "ExportFolderID") config.exportFolder = data[i][1] || "";
    if (data[i][0] === "NamHienTai") config.namHienTai = data[i][1] || "";
  }
  return config;
}

function saveConfig(configData, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || userInfo.role !== 'Admin') return { success: false, message: "Không có quyền!" };
  var sheetConfig = getDbSpreadsheet().getSheetByName("CauHinh");
  if (!sheetConfig) return { success: false, message: "Thiếu sheet CauHinh" };

  var data = sheetConfig.getDataRange().getValues();
  var updated = { donXinHoc: false, danhSachLop: false, exportFolder: false, namHienTai: false };

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === "DonXinHoc_TemplateID") { sheetConfig.getRange(i+1, 2).setValue(configData.donXinHoc); updated.donXinHoc = true; }
    if (data[i][0] === "DanhSachLop_TemplateID") { sheetConfig.getRange(i+1, 2).setValue(configData.danhSachLop); updated.danhSachLop = true; }
    if (data[i][0] === "ExportFolderID") { sheetConfig.getRange(i+1, 2).setValue(configData.exportFolder); updated.exportFolder = true; }
    if (data[i][0] === "NamHienTai") { sheetConfig.getRange(i+1, 2).setValue(configData.namHienTai); updated.namHienTai = true; }
  }

  if (!updated.donXinHoc) sheetConfig.appendRow(["DonXinHoc_TemplateID", configData.donXinHoc]);
  if (!updated.danhSachLop) sheetConfig.appendRow(["DanhSachLop_TemplateID", configData.danhSachLop]);
  if (!updated.exportFolder) sheetConfig.appendRow(["ExportFolderID", configData.exportFolder]);
  if (!updated.namHienTai) sheetConfig.appendRow(["NamHienTai", configData.namHienTai]);

  return { success: true, message: "Đã lưu cấu hình!" };
}

function getCourses(credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo) return [];
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var courses = [];

  for (var i = 1; i < data.length; i++) {
    var c_teacher = data[i][2]; // Cột C: Mã GV
    if (userInfo.role === 'Admin' || userInfo.role === 'GiaoVu' || userInfo.username === c_teacher) {
      courses.push({
        id: data[i][0], name: data[i][1], teacher: c_teacher, status: data[i][3],
        start: data[i][4], end: data[i][5],
        namDaoTao: data[i][6], soNgay: data[i][7], diaDiem: data[i][8],
        qdMoLop: data[i][9], qdTotNghiep: data[i][10],
        rowIndex: i + 1
      });
    }
  }
  return courses;
}

function createCourse(courseData, credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo) return { success: false, message: "Không có quyền!" }; // Ai có tài khoản cũng có thể tạo khóa học
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'KhoaHoc'" };

  var newId = "KH_" + new Date().getTime();
  var rowData = [
    newId, courseData.name, userInfo.username, "Chờ duyệt",
    courseData.startDate, courseData.endDate,
    courseData.namDaoTao, courseData.soNgay, courseData.diaDiem,
    courseData.qdMoLop, courseData.qdTotNghiep
  ];
  sheet.appendRow(rowData);

  return { success: true, message: "Đã tạo lớp học thành công, vui lòng chờ duyệt." };
}

function approveCourse(rowIndex, credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền duyệt!" };
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  sheet.getRange(rowIndex, 4).setValue("Đã duyệt");
  return { success: true, message: "Đã duyệt lớp học." };
}

/* =======================================================================
 * QUẢN LÝ HỌC VIÊN (STUDENTS MANAGEMENT)
 * ======================================================================= */

// Tạo mảng dữ liệu Học viên theo đúng thứ tự cột
function _mapStudentToArray(s, isUpdate) {
  // Trật tự các trường phải khớp với schema trong sheet "HocVien"
  var arr = [
    s.courseId, s.fullName, s.dob, s.gender, s.cccd, s.ngayCap, s.noiCap,
    s.phone, s.email, s.doiTuong, s.danToc, s.tonGiao,
    s.trinhDo, s.trinhDoVanHoa,
    s.queQuan, s.noiSinh,
    s.huyenThuongTru, s.xaThuongTru, s.thonThuongTru, s.thuongTru, s.tamTru,
    s.tenCha, s.ngheCha, s.tenMe, s.ngheMe, s.tenVoChong, s.ngheVoChong
  ];
  if (!isUpdate) arr.push(new Date()); // Ngày đăng ký (Cột cuối)
  return arr;
}

function registerStudent(studentData) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'HocVien'" };

  sheet.appendRow(_mapStudentToArray(studentData, false));
  return { success: true, message: "Đăng ký thành công!" };
}

function getStudentsByCourse(courseId) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === courseId) {
      students.push({
        courseId: data[i][0], fullName: data[i][1], dob: data[i][2], gender: data[i][3],
        cccd: data[i][4], ngayCap: data[i][5], noiCap: data[i][6],
        phone: data[i][7], email: data[i][8], doiTuong: data[i][9],
        danToc: data[i][10], tonGiao: data[i][11], trinhDo: data[i][12],
        trinhDoVanHoa: data[i][13], queQuan: data[i][14], noiSinh: data[i][15],
        huyenThuongTru: data[i][16], xaThuongTru: data[i][17], thonThuongTru: data[i][18],
        thuongTru: data[i][19], tamTru: data[i][20],
        tenCha: data[i][21], ngheCha: data[i][22], tenMe: data[i][23], ngheMe: data[i][24],
        tenVoChong: data[i][25], ngheVoChong: data[i][26],
        rowIndex: i + 1
      });
    }
  }
  return students;
}

// Thêm HV thủ công (Bởi Giáo viên)
function addStudentManual(studentData, credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo) return { success: false, message: "Không có quyền!" }; // Admin, GiaoVu, GiaoVien đều thao tác được
  return registerStudent(studentData);
}

function updateStudent(rowIndex, studentData, credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo) return { success: false, message: "Không có quyền!" }; // Admin, GiaoVu, GiaoVien đều thao tác được
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  var arr = _mapStudentToArray(studentData, true);
  sheet.getRange(rowIndex, 1, 1, arr.length).setValues([arr]);
  return { success: true, message: "Đã cập nhật học viên!" };
}

function deleteStudent(rowIndex, credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo) return { success: false, message: "Không có quyền!" }; // Admin, GiaoVu, GiaoVien đều thao tác được
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  sheet.deleteRow(rowIndex);
  return { success: true, message: "Đã xóa học viên!" };
}

/* =======================================================================
 * XUẤT HỒ SƠ & BÁO CÁO (DOCUMENT GENERATION)
 * ======================================================================= */

function generateDocument(docType, courseId, credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo) return { success: false, message: "Không có quyền!" };
  var sheetConfig = getDbSpreadsheet().getSheetByName("CauHinh");
  if (!sheetConfig) return { success: false, message: "Thiếu sheet 'CauHinh'" };

  var data = sheetConfig.getDataRange().getValues();
  var templateId = "";
  var destFolderId = "";

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === docType + "_TemplateID") templateId = data[i][1];
    if (data[i][0] === "ExportFolderID") destFolderId = data[i][1];
  }

  if (!templateId || !destFolderId) {
    return { success: false, message: "Chưa cấu hình ID template hoặc thư mục xuất trong sheet CauHinh." };
  }

  try {
    var templateFile = DriveApp.getFileById(templateId);
    var destFolder = DriveApp.getFolderById(destFolderId);
    var newFile = templateFile.makeCopy(docType + " - " + courseId, destFolder);

    var doc = DocumentApp.openById(newFile.getId());
    var body = doc.getBody();

    var courses = getCourses({role: 'Admin'}); // Lấy tất cả để filter
    var courseInfo = courses.filter(function(c) { return c.id === courseId; })[0];

    if (courseInfo) {
      body.replaceText("{{TEN_KHOA_HOC}}", courseInfo.name || "");
      body.replaceText("{{NGAY_KHAI_GIANG}}", courseInfo.start ? Utilities.formatDate(new Date(courseInfo.start), Session.getScriptTimeZone(), "dd/MM/yyyy") : "");
      body.replaceText("{{GIAO_VIEN}}", courseInfo.teacher || "");
    }

    doc.saveAndClose();
    return { success: true, url: newFile.getUrl(), message: "Xuất hồ sơ thành công!" };

  } catch (e) {
    return { success: false, message: "Lỗi: " + e.toString() };
  }
}

function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

function importDanhSachNghe(data, credentials) {
  var userInfo = verifySession(credentials);
  if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };

  var sheet = getDbSpreadsheet().getSheetByName('DanhSachNghe');
  if (!sheet) return { success: false, message: "Không tìm thấy Sheet DanhSachNghe" };

  // Clear existing data (except header) if you want to replace, or just append.
  // Let's append new items. We'll assume data is an array of arrays [[Tên nghề, Thời gian đào tạo, Trình độ đào tạo, Tổng số giờ], ...]
  if (data && data.length > 0) {
    var rowsToAppend = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (row[0] && row[0].toString().trim() !== "") { // Check if 'Tên nghề' exists
        rowsToAppend.push([
          row[0].toString().trim(),
          row[1] ? row[1].toString().trim() : '',
          row[2] ? row[2].toString().trim() : '',
          row[3] ? row[3].toString().trim() : ''
        ]);
      }
    }
    if (rowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 4).setValues(rowsToAppend);
      return { success: true, message: "Đã import " + rowsToAppend.length + " nghề!" };
    } else {
       return { success: false, message: "Không có dữ liệu hợp lệ để import!" };
    }
  }
  return { success: false, message: "Dữ liệu rỗng!" };
}
