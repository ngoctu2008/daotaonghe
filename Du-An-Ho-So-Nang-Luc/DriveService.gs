// ==========================================
// FILE: DriveService.gs
// TẢI TỆP LÊN GOOGLE DRIVE
// ==========================================

// Upload file PDF lên Google Drive và ghi thông tin vào Sheet
function uploadPDFFile(token, fileData, fileName, soHieu, loaiTaiLieu) {
  if (!verifyToken(token)) return { success: false, message: "Không có quyền truy cập!" };

  try {
    let folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    let contentType = fileData.substring(fileData.indexOf(":") + 1, fileData.indexOf(";"));
    let base64 = fileData.substring(fileData.indexOf(",") + 1);
    let blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, fileName);

    // Lưu file vào Drive
    let file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    let fileId = file.getId();

    // Ghi dữ liệu vào Google Sheet DB_TaiLieu
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_TaiLieu");
    let newId = "DOC_" + Utilities.getUuid();
    let ngayTao = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy");

    // Cột: ID | Ten_Van_Ban | So_Hieu | Loai_Tai_Lieu | Drive_File_ID | Ngay_Cap_Nhat | Trang_Thai
    sheet.appendRow([newId, fileName, soHieu, loaiTaiLieu, fileId, ngayTao, "Hiển thị"]);

    return { success: true, message: "Tải lên tài liệu PDF thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi upload: " + error.toString() };
  }
}
