import re

with open('/app/gas_project/Code.gs', 'r', encoding='utf-8') as f:
    code = f.read()

new_deleteAccount = """function deleteAccount(rowIndex, userInfo) {
  if (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu') return { success: false, message: "Không có quyền!" };
  if (rowIndex <= 2) return { success: false, message: "Không thể xóa tài khoản Admin gốc!" }; // Bảo vệ admin đầu tiên
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  if (userInfo.role === 'GiaoVu') {
     var roleToDel = sheet.getRange(rowIndex, 3).getValue();
     if (roleToDel !== 'GiaoVien') return { success: false, message: "Giáo vụ chỉ được xóa tài khoản Giáo Viên!" };
  }
  sheet.deleteRow(rowIndex);
  return { success: true, message: "Đã xóa tài khoản!" };
}"""

# regex needs to match the whole block including the trailing bad text
code = re.sub(r'function deleteAccount\(rowIndex, userInfo\) \{[\s\S]*?return \{ success: true, message: "Đã xóa tài khoản!" \};\n\}', new_deleteAccount, code)

with open('/app/gas_project/Code.gs', 'w', encoding='utf-8') as f:
    f.write(code)
