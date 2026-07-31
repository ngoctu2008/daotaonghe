import re

with open('/app/gas_project/Code.gs', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's fix this manually with a simple string replace
bad_block = """function deleteAccount(rowIndex, userInfo) {
  if (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu') return { success: false, message: "Không có quyền!" };
  if (rowIndex <= 2) return { success: false, message: "Không thể xóa tài khoản Admin gốc!" }; // Bảo vệ admin đầu tiên
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  if (userInfo.role === 'GiaoVu') {
     var roleToDel = sheet.getRange(rowIndex, 3).getValue();
     if (roleToDel !== 'GiaoVien') return { success: false, message: "Giáo vụ chỉ được xóa tài khoản Giáo Viên!" };
  }
  sheet.deleteRow(rowIndex);
  return { success: true, message: "Đã xóa tài khoản!" };
};
  if (rowIndex <= 2) return { success: false, message: "Không thể xóa tài khoản Admin gốc!" }; // Bảo vệ admin đầu tiên
  var sheet = getDbSpreadsheet().getSheetByName("TaiKhoan");
  sheet.deleteRow(rowIndex);
  return { success: true, message: "Đã xóa tài khoản!" };
}"""

new_block = """function deleteAccount(rowIndex, userInfo) {
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

code = code.replace(bad_block, new_block)

with open('/app/gas_project/Code.gs', 'w', encoding='utf-8') as f:
    f.write(code)
