// ==========================================
// FILE: Auth.gs
// XỬ LÝ ĐĂNG NHẬP & PHÂN QUYỀN
// ==========================================

// Lấy hoặc tạo Secret Key động (lưu trong Script Properties để bảo mật)
function getSecretKey() {
  let props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('AUTH_SECRET');
  if (!secret) {
    secret = Utilities.getUuid();
    props.setProperty('AUTH_SECRET', secret);
  }
  return secret;
}

// Xác thực đăng nhập Admin
function loginAdmin(username, password) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_Users");
    let data = sheet.getDataRange().getValues();
    data.shift(); // Bỏ qua dòng tiêu đề

    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === username && data[i][1] === password) {
        // Tạo token an toàn hơn chứa username và secret key động
        let secret = getSecretKey();
        let token = Utilities.base64Encode(username + "|" + secret);
        return { success: true, token: token, fullname: data[i][2], role: data[i][3] };
      }
    }
    return { success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống: " + error.toString() };
  }
}

// Kiểm tra token (Dùng cho các hàm CRUD)
function verifyToken(token) {
  try {
    let decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    let parts = decoded.split("|");
    let secret = getSecretKey();

    if (parts.length === 2 && parts[1] === secret) {
      let username = parts[0];

      let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("DB_Users");
      let data = sheet.getDataRange().getValues();
      data.shift();

      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === username) {
           return true; // Token hợp lệ, username tồn tại
        }
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}
