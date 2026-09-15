// ==========================================
// FILE: Code.gs
// ROUTING CHÍNH, WEB SERVER & API HANDLERS
// ==========================================

// Cấu hình ID của Google Sheet và Google Drive Folder
var SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
var DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";

// Hàm khởi tạo Web App
function doGet(e) {
  let template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
      .setTitle('Hồ sơ năng lực - Trung tâm GDNN-GDTX Đăk Hà')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Hàm gộp file HTML con (Include CSS, JS, Components)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
