import re

with open('/app/gas_project/Code.gs', 'r', encoding='utf-8') as f:
    code = f.read()

bad_changePassword = """function changePassword(userInfo, oldPassword, newPassword) {
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  var row = userInfo.rowIndex;

  var currentPassword = sheet.getRange(row, 2).getValue().toString().trim();
  if (currentPassword !== oldPassword.trim()) {
    return { success: false, message: "Mật khẩu cũ không chính xác!" };
  }

  sheet.getRange(row, 2).setValue(newPassword.trim());
  return { success: true, message: "Đổi mật khẩu thành công!" };
}"""

# Update changePassword so it also allows admin to change others password (if called by new admin function)
# Actually, the user asked for Admin and GiaoVu to be able to change password of OTHER accounts.
# Let's add a new function for that, changeOtherPassword

add_changeOtherPassword = """
function adminChangeUserPassword(targetRowIndex, newPassword, userInfo) {
  if (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu') return { success: false, message: "Không có quyền!" };
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");

  if (userInfo.role === 'GiaoVu') {
     var roleToModify = sheet.getRange(targetRowIndex, 3).getValue();
     if (roleToModify !== 'GiaoVien') return { success: false, message: "Giáo vụ chỉ được đổi mật khẩu của Giáo Viên!" };
  }

  sheet.getRange(targetRowIndex, 2).setValue(newPassword.trim());
  return { success: true, message: "Đã đặt lại mật khẩu cho tài khoản!" };
}
"""

code = code.replace(bad_changePassword, bad_changePassword + add_changeOtherPassword)

with open('/app/gas_project/Code.gs', 'w', encoding='utf-8') as f:
    f.write(code)
