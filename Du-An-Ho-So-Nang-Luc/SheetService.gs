// ==========================================
// FILE: SheetService.gs
// TƯƠNG TÁC VỚI GOOGLE SHEETS
// ==========================================

// Lấy danh sách Học phí từ Google Sheet
function getPublicHocPhiData() {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_HocPhi");
    let data = sheet.getDataRange().getValues();
    data.shift(); // Xóa hàng tiêu đề
    return { success: true, data: data };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// Lấy danh sách Văn bản PDF từ Google Sheet
function getPublicPDFList() {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_TaiLieu");
    let data = sheet.getDataRange().getValues();
    data.shift();

    let result = [];
    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      // Chỉ lấy các tài liệu có trạng thái "Hiển thị" (nếu có cột trạng thái)
      if (row[6] !== "Ẩn") {
        result.push({
          id: row[0],
          tenVanBan: row[1],
          soHieu: row[2],
          loaiTaiLieu: row[3],
          driveId: row[4],
          ngayBanHanh: row[5],
          trangThai: row[6]
        });
      }
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// ==========================================
// QUẢN LÝ GIÁO VIÊN
// ==========================================
function getGiaoVienData() {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_GiaoVien");
    let data = sheet.getDataRange().getValues();
    data.shift();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function saveGiaoVien(token, id, hoTen, chuyenMon, nghe) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_GiaoVien");
    if (id) {
       let data = sheet.getDataRange().getValues();
       for (let i = 1; i < data.length; i++) {
         if (data[i][0] === id) {
           sheet.getRange(i + 1, 2).setValue(hoTen);
           sheet.getRange(i + 1, 3).setValue(chuyenMon);
           sheet.getRange(i + 1, 4).setValue(nghe);
           return { success: true, message: "Cập nhật thành công!" };
         }
       }
       return { success: false, message: "Không tìm thấy ID" };
    } else {
       let newId = "GV_" + Utilities.getUuid();
       sheet.appendRow([newId, hoTen, chuyenMon, nghe]);
       return { success: true, message: "Thêm giáo viên mới thành công!" };
    }
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function deleteGiaoVien(token, id) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_GiaoVien");
    let data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Xóa thành công" };
      }
    }
    return { success: false, message: "Không tìm thấy ID" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// ==========================================
// QUẢN LÝ CƠ SỞ VẬT CHẤT
// ==========================================
function getCoSoVatChatData() {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_CoSoVatChat");
    let data = sheet.getDataRange().getValues();
    data.shift();
    return { success: true, data: data };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function saveCoSoVatChat(token, id, ten, soLuong, tinhTrang, ghiChu) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_CoSoVatChat");
    if (id) {
       let data = sheet.getDataRange().getValues();
       for (let i = 1; i < data.length; i++) {
         if (data[i][0] === id) {
           sheet.getRange(i + 1, 2).setValue(ten);
           sheet.getRange(i + 1, 3).setValue(soLuong);
           sheet.getRange(i + 1, 4).setValue(tinhTrang);
           sheet.getRange(i + 1, 5).setValue(ghiChu);
           return { success: true, message: "Cập nhật thành công!" };
         }
       }
       return { success: false, message: "Không tìm thấy ID" };
    } else {
       let newId = "CS_" + Utilities.getUuid();
       sheet.appendRow([newId, ten, soLuong, tinhTrang, ghiChu]);
       return { success: true, message: "Thêm cơ sở vật chất mới thành công!" };
    }
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function deleteCoSoVatChat(token, id) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_CoSoVatChat");
    let data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Xóa thành công" };
      }
    }
    return { success: false, message: "Không tìm thấy ID" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// Ẩn tài liệu PDF
function hidePDFDocument(token, docId) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };

  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_TaiLieu");
    let data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === docId) {
        // Cập nhật cột Trang_Thai (Cột thứ 7 - index 6)
        sheet.getRange(i + 1, 7).setValue("Ẩn");
        return { success: true, message: "Đã ẩn tài liệu thành công" };
      }
    }
    return { success: false, message: "Không tìm thấy tài liệu" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// Thêm/Cập nhật Học phí
function saveHocPhi(token, id, tenNghe, trinhDo, tongTiet, hocPhi, quyetDinh) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };

  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_HocPhi");

    if (id) {
       // Cập nhật
       let data = sheet.getDataRange().getValues();
       for (let i = 1; i < data.length; i++) {
         if (data[i][0] === id) {
           sheet.getRange(i + 1, 2).setValue(tenNghe);
           sheet.getRange(i + 1, 3).setValue(trinhDo);
           sheet.getRange(i + 1, 4).setValue(tongTiet);
           sheet.getRange(i + 1, 5).setValue(hocPhi);
           sheet.getRange(i + 1, 6).setValue(quyetDinh);
           return { success: true, message: "Cập nhật học phí thành công!" };
         }
       }
       return { success: false, message: "Không tìm thấy ID học phí" };
    } else {
       // Thêm mới
       let newId = "HP_" + Utilities.getUuid();
       sheet.appendRow([newId, tenNghe, trinhDo, tongTiet, hocPhi, quyetDinh]);
       return { success: true, message: "Thêm học phí mới thành công!" };
    }
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// Lấy danh sách tài liệu cho Admin (Cả ẩn và hiện)
function getAdminPDFList(token) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };

  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_TaiLieu");
    let data = sheet.getDataRange().getValues();
    data.shift();

    let result = [];
    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      result.push({
        id: row[0],
        tenVanBan: row[1],
        soHieu: row[2],
        loaiTaiLieu: row[3],
        driveId: row[4],
        ngayBanHanh: row[5],
        trangThai: row[6] || "Hiển thị"
      });
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// Hiện tài liệu PDF
function showPDFDocument(token, docId) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };

  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_TaiLieu");
    let data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === docId) {
        sheet.getRange(i + 1, 7).setValue("Hiển thị");
        return { success: true, message: "Đã hiện tài liệu thành công" };
      }
    }
    return { success: false, message: "Không tìm thấy tài liệu" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// Xóa học phí
function deleteHocPhi(token, id) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };

  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_HocPhi");
    let data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Xóa học phí thành công" };
      }
    }
    return { success: false, message: "Không tìm thấy ID học phí" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}
