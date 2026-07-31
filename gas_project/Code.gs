/**
 * Hệ thống quản lý đào tạo nghề - Google Apps Script Backend
 * File: Code.gs
 */

// Lấy Spreadsheet chứa cơ sở dữ liệu
function getDbSpreadsheet() {
  // Thay thế bằng ID của Google Sheets nếu chạy script ngoài file Sheets,
  // nhưng thường thì script được đính kèm trực tiếp với bảng tính (Bound Script)
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Xử lý HTTP GET Request (khi người dùng truy cập Web App)
 */
function doGet(e) {
  var page = e.parameter.page;
  var courseId = e.parameter.courseId; // Dùng cho form đăng ký qua QR

  if (page == 'register' && courseId) {
    var template = HtmlService.createTemplateFromFile('StudentRegister');
    template.courseId = courseId;
    return template.evaluate().setTitle('Đăng ký khóa học').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  // Trang đăng nhập mặc định hoặc quản lý
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Hệ thống Quản lý Đào tạo Nghề')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Lấy nội dung file HTML (để include các phần dùng chung như CSS/JS)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* =======================================================================
 * XỬ LÝ XÁC THỰC VÀ PHÂN QUYỀN (AUTHENTICATION & AUTHORIZATION)
 * ======================================================================= */

/**
 * Kiểm tra thông tin đăng nhập
 */
function loginUser(username, password) {
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  if (!sheet) return { success: false, message: "Lỗi hệ thống: Không tìm thấy sheet 'TaiKhoan'" };

  var data = sheet.getDataRange().getValues();
  // Bỏ qua dòng tiêu đề
  for (var i = 1; i < data.length; i++) {
    var u = data[i][0]; // Cột A: Username
    var p = data[i][1]; // Cột B: Password
    var role = data[i][2]; // Cột C: Role (Admin, GiaoVu, GiaoVien)
    var name = data[i][3]; // Cột D: Họ Tên

    if (u === username && p === password) {
      return {
        success: true,
        user: { username: u, role: role, name: name }
      };
    }
  }
  return { success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" };
}

/* =======================================================================
 * QUẢN LÝ KHÓA HỌC (COURSES MANAGEMENT)
 * ======================================================================= */

/**
 * Lấy danh sách khóa học (dựa vào quyền)
 */
function getCourses(userInfo) {
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var courses = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var c_id = row[0]; // ID
    var c_name = row[1]; // Tên nghề
    var c_teacher = row[2]; // Mã GV (Username)
    var c_status = row[3]; // Trạng thái
    var c_start = row[4]; // Ngày KG
    var c_end = row[5]; // Ngày Bế giảng

    // Admin/GiaoVu thấy tất cả, GiaoVien chỉ thấy của mình
    if (userInfo.role === 'Admin' || userInfo.role === 'GiaoVu' || userInfo.username === c_teacher) {
      courses.push({
        id: c_id,
        name: c_name,
        teacher: c_teacher,
        status: c_status,
        start: c_start,
        end: c_end,
        rowIndex: i + 1 // Lưu vị trí dòng để update
      });
    }
  }
  return courses;
}

/**
 * Giáo viên tạo khóa học mới
 */
function createCourse(courseData, userInfo) {
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'KhoaHoc'" };

  var newId = "KH_" + new Date().getTime(); // Sinh ID ngẫu nhiên hoặc có thể cấu hình format
  sheet.appendRow([
    newId,
    courseData.name,
    userInfo.username,
    "Chờ duyệt",
    courseData.startDate,
    courseData.endDate
  ]);

  return { success: true, message: "Đã tạo khóa học thành công, vui lòng chờ duyệt." };
}

/**
 * Giáo vụ duyệt khóa học
 */
function approveCourse(rowIndex) {
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  sheet.getRange(rowIndex, 4).setValue("Đã duyệt"); // Cột 4 là Trạng thái
  return { success: true, message: "Đã duyệt khóa học." };
}

/* =======================================================================
 * QUẢN LÝ HỌC VIÊN (STUDENTS MANAGEMENT)
 * ======================================================================= */

/**
 * Đăng ký học viên mới (dành cho Form Quét QR)
 */
function registerStudent(studentData) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'HocVien'" };

  // Lưu thông tin học viên
  sheet.appendRow([
    studentData.courseId,
    studentData.fullName,
    studentData.dob,
    studentData.gender,
    studentData.cccd,
    studentData.address,
    studentData.phone,
    new Date() // Ngày đăng ký
  ]);

  return { success: true, message: "Đăng ký thành công!" };
}

/**
 * Lấy danh sách học viên của một khóa học
 */
function getStudentsByCourse(courseId) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === courseId) { // Cột A là CourseID
      students.push({
        fullName: data[i][1],
        dob: data[i][2],
        gender: data[i][3],
        cccd: data[i][4],
        address: data[i][5],
        phone: data[i][6]
      });
    }
  }
  return students;
}

/* =======================================================================
 * XUẤT HỒ SƠ & BÁO CÁO (DOCUMENT GENERATION)
 * ======================================================================= */

/**
 * Xuất đơn xin học / Quyết định (Dựa trên template Google Docs)
 */
function generateDocument(docType, courseId) {
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
    // 1. Copy template
    var templateFile = DriveApp.getFileById(templateId);
    var destFolder = DriveApp.getFolderById(destFolderId);
    var newFile = templateFile.makeCopy(docType + " - " + courseId, destFolder);

    // 2. Thay thế dữ liệu
    var doc = DocumentApp.openById(newFile.getId());
    var body = doc.getBody();

    // Lấy thông tin khóa học (Ví dụ cơ bản)
    var courses = getCourses({role: 'Admin'}); // Hack để lấy danh sách
    var courseInfo = courses.filter(function(c) { return c.id === courseId; })[0];

    if (courseInfo) {
      body.replaceText("{{TEN_KHOA_HOC}}", courseInfo.name || "");
      body.replaceText("{{NGAY_KHAI_GIANG}}", courseInfo.start || "");
      body.replaceText("{{GIAO_VIEN}}", courseInfo.teacher || "");
    }

    doc.saveAndClose();

    // 3. (Tùy chọn) Chuyển đổi thành PDF hoặc trả về link Docs
    return {
      success: true,
      url: newFile.getUrl(),
      message: "Xuất hồ sơ thành công!"
    };

  } catch (e) {
    return { success: false, message: "Lỗi khi tạo file: " + e.toString() };
  }
}

/**
 * Lấy link Web App hiện tại (để tạo QR Code)
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}
