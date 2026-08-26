// ==========================================
// CẤU HÌNH BAN ĐẦU & DATABASE SETUP
// ==========================================
function setupDatabase() {
  var prop = PropertiesService.getScriptProperties();
  var dbId = prop.getProperty('DATABASE_ID');

  if (!dbId) {
    var ss = SpreadsheetApp.create("DB_HoSoNangLuc_GDTX_DakHa");
    dbId = ss.getId();
    prop.setProperty('DATABASE_ID', dbId);

    // Tạo Sheet Cấu hình chung
    var configSheet = ss.insertSheet('Config');
    configSheet.appendRow(['Key', 'Value']);
    configSheet.appendRow(['AdminPassword', 'admin123']);
    configSheet.appendRow(['TenTrungTam', 'TT GDNN-GDTX khu vực Đăk Hà']);
    configSheet.appendRow(['DiaChi', 'Thị trấn Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum']);
    configSheet.appendRow(['SoDienThoai', '0260.xxx.xxxx']);
    configSheet.appendRow(['Email', 'gdnngdtxdakha@gmail.com']);
    configSheet.appendRow(['TamNhin', 'Chúng tôi cam kết trở thành trung tâm đào tạo nghề hàng đầu khu vực, cung cấp nguồn nhân lực chất lượng cao.']);
    configSheet.appendRow(['SBMoTa', 'Điểm nhấn của chúng tôi là tiên phong ứng dụng công nghệ giáo dục (3D/AR, chuyển đổi số) vào quá trình đào tạo thực hành.']);

    // Tạo Sheet Khóa học
    var coursesSheet = ss.insertSheet('Courses');
    coursesSheet.appendRow(['ID', 'TenNghe', 'TrinhDo', 'ThoiGian', 'Icon', 'ChuanDauRa', 'MaNghe', 'KienThuc', 'KyNang', 'ViecLam']);
    coursesSheet.appendRow([
      'C1', 'Hàn điện', 'Sơ cấp', '3 tháng', 'fa-fire', 'Chứng chỉ sơ cấp nghề', '5520150',
      'Nắm vững kiến thức cơ bản và nguyên lý của nghề. Hiểu rõ các biện pháp an toàn lao động.',
      'Thực hiện thành thạo các thao tác hàn cơ bản. Vận dụng kỹ năng vào thực tế sản xuất.',
      'Làm việc tại các cơ sở, xưởng cơ khí địa phương.'
    ]);

    // Sheet Cơ sở vật chất
    var facilitiesSheet = ss.insertSheet('Facilities');
    facilitiesSheet.appendRow(['ID', 'Ten', 'MoTa', 'ImageURL']);
    facilitiesSheet.appendRow(['F1', 'Phòng học số hóa', 'Trang bị máy tính hiện đại', 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?auto=format&fit=crop&w=800']);

    // Sheet Nhân sự
    var staffSheet = ss.insertSheet('Staff');
    staffSheet.appendRow(['ID', 'TieuDe', 'ConSo', 'DonVi', 'Icon']);
    staffSheet.appendRow(['S1', 'Cán bộ, Giáo viên', '45', '', 'fa-users']);
    staffSheet.appendRow(['S2', 'Giáo viên đạt chuẩn', '100', '%', 'fa-graduation-cap']);
    staffSheet.appendRow(['S3', 'Chuyên gia/Thợ bậc cao', '15', '', 'fa-user-tie']);

    // Sheet Đối tác
    var partnersSheet = ss.insertSheet('Partners');
    partnersSheet.appendRow(['ID', 'TenDoanhNghiep', 'LogoURL']);
    partnersSheet.appendRow(['P1', 'Công ty Xây dựng', 'https://via.placeholder.com/150/0000FF/808080?Text=DoiTac']);

    var sheet1 = ss.getSheetByName('Trang tính 1') || ss.getSheetByName('Sheet1');
    if (sheet1) ss.deleteSheet(sheet1);
    Logger.log("Đã khởi tạo Database thành công! ID: " + dbId);
  }
}

function getDatabase() {
  var prop = PropertiesService.getScriptProperties();
  var id = prop.getProperty('DATABASE_ID');
  if (!id) {
    // Tự động khởi tạo nếu chưa có
    setupDatabase();
    id = prop.getProperty('DATABASE_ID');
  }
  return SpreadsheetApp.openById(id);
}

// ==========================================
// WEB APP ENTRY
// ==========================================
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
      .setTitle('Hồ sơ năng lực đào tạo nghề - TT GDNN-GDTX khu vực Đăk Hà')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// API CLIENT-SIDE (READ)
// ==========================================
function loginAdmin(password) {
  var sheet = getDatabase().getSheetByName('Config');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'AdminPassword') return String(data[i][1]) === String(password);
  }
  return false;
}

function getPublicData() {
  var db = getDatabase();
  var result = { config: {}, courses: [], staff: [], partners: [] };

  var cData = db.getSheetByName('Config').getDataRange().getValues();
  for (var i = 1; i < cData.length; i++) {
    // IMPORTANT: Never expose the admin password to the client!
    if (cData[i][0] !== 'AdminPassword') {
      result.config[cData[i][0]] = cData[i][1];
    }
  }

  var crsData = db.getSheetByName('Courses').getDataRange().getValues();
  for (var i = 1; i < crsData.length; i++) {
    if(crsData[i][0]) result.courses.push({
      id: crsData[i][0], tenNghe: crsData[i][1], trinhDo: crsData[i][2], thoiGian: crsData[i][3],
      icon: crsData[i][4], chuanDauRa: crsData[i][5], maNghe: crsData[i][6],
      kienThuc: crsData[i][7], kyNang: crsData[i][8], viecLam: crsData[i][9]
    });
  }

  var sSheet = db.getSheetByName('Staff');
  if(sSheet) {
      var sData = sSheet.getDataRange().getValues();
      for (var i = 1; i < sData.length; i++) {
        if(sData[i][0]) result.staff.push({ id: sData[i][0], tieuDe: sData[i][1], conSo: sData[i][2], donVi: sData[i][3], icon: sData[i][4] });
      }
  }

  var fSheet = db.getSheetByName('Facilities');
  if(fSheet) {
      result.facilities = [];
      var fData = fSheet.getDataRange().getValues();
      for (var i = 1; i < fData.length; i++) {
        if(fData[i][0]) result.facilities.push({ id: fData[i][0], ten: fData[i][1], moTa: fData[i][2], imageUrl: fData[i][3] });
      }
  }

  var pSheet = db.getSheetByName('Partners');
  if(pSheet) {
      var pData = pSheet.getDataRange().getValues();
      for (var i = 1; i < pData.length; i++) {
        if(pData[i][0]) result.partners.push({ id: pData[i][0], ten: pData[i][1], logoUrl: pData[i][2] });
      }
  }
  return result;
}

// ==========================================
// API CLIENT-SIDE (WRITE / SECURED)
// ==========================================
function saveConfigAdmin(configObj, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực: Sai mật khẩu!");
  var sheet = getDatabase().getSheetByName('Config');
  var data = sheet.getDataRange().getValues();
  for (var key in configObj) {
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(configObj[key]);
        found = true; break;
      }
    }
    if (!found) sheet.appendRow([key, configObj[key]]);
  }
  return "Cấu hình đã được lưu!";
}

function saveCourse(obj, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực: Sai mật khẩu!");
  var sheet = getDatabase().getSheetByName('Courses');
  if (obj.id) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == obj.id) {
        sheet.getRange(i + 1, 2, 1, 9).setValues([[obj.tenNghe, obj.trinhDo, obj.thoiGian, obj.icon, obj.chuanDauRa, obj.maNghe, obj.kienThuc, obj.kyNang, obj.viecLam]]);
        return "Cập nhật khóa học thành công!";
      }
    }
  } else {
    sheet.appendRow(['C' + new Date().getTime(), obj.tenNghe, obj.trinhDo, obj.thoiGian, obj.icon, obj.chuanDauRa, obj.maNghe, obj.kienThuc, obj.kyNang, obj.viecLam]);
    return "Thêm khóa học thành công!";
  }
}
function deleteCourse(id, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực: Sai mật khẩu!");
  var sheet = getDatabase().getSheetByName('Courses');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) { sheet.deleteRow(i + 1); return "Đã xóa khóa học!"; }
  }
}

// Cập nhật Cơ sở vật chất (Facilities)
function saveFacility(obj, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực!");
  var sheet = getDatabase().getSheetByName('Facilities');
  if (obj.id) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == obj.id) {
        sheet.getRange(i + 1, 2, 1, 3).setValues([[obj.ten, obj.moTa, obj.imageUrl]]);
        return "Thành công";
      }
    }
  } else {
    sheet.appendRow(['F' + new Date().getTime(), obj.ten, obj.moTa, obj.imageUrl]);
    return "Thành công";
  }
}
function deleteFacility(id, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực!");
  var sheet = getDatabase().getSheetByName('Facilities');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) { sheet.deleteRow(i + 1); return "Thành công"; }
  }
}

// Cập nhật Nhân sự (Staff)
function saveStaff(obj, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực!");
  var sheet = getDatabase().getSheetByName('Staff');
  if (obj.id) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == obj.id) {
        sheet.getRange(i + 1, 2, 1, 4).setValues([[obj.tieuDe, obj.conSo, obj.donVi, obj.icon]]);
        return "Thành công";
      }
    }
  } else {
    sheet.appendRow(['S' + new Date().getTime(), obj.tieuDe, obj.conSo, obj.donVi, obj.icon]);
    return "Thành công";
  }
}
function deleteStaff(id, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực!");
  var sheet = getDatabase().getSheetByName('Staff');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) { sheet.deleteRow(i + 1); return "Thành công"; }
  }
}

// Cập nhật Đổi Mật Khẩu
function changeAdminPassword(oldPass, newPass) {
  var sheet = getDatabase().getSheetByName('Config');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'AdminPassword') {
      if (String(data[i][1]) === String(oldPass)) {
        sheet.getRange(i + 1, 2).setValue(newPass);
        return true;
      }
      return false;
    }
  }
  return false;
}

// Cập nhật Partner
function savePartner(obj, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực!");
  var sheet = getDatabase().getSheetByName('Partners');
  if (obj.id) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == obj.id) {
        sheet.getRange(i + 1, 2, 1, 2).setValues([[obj.ten, obj.logoUrl]]);
        return "Thành công";
      }
    }
  } else {
    sheet.appendRow(['P' + new Date().getTime(), obj.ten, obj.logoUrl]);
    return "Thành công";
  }
}
function deletePartner(id, pass) {
  if (!loginAdmin(pass)) throw new Error("Lỗi xác thực!");
  var sheet = getDatabase().getSheetByName('Partners');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) { sheet.deleteRow(i + 1); return "Thành công"; }
  }
}
