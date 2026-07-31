const fs = require('fs');
let code = fs.readFileSync('/app/gas_project/Code.gs', 'utf8');

const oldGetCategoryData = `function getCategoryData(sheetName, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return [];
  var sheet = getDbSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var items = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) items.push({ value: data[i][0].toString().trim(), rowIndex: i + 1 });
  }
  return items;
}`;

const newGetCategoryData = `function getCategoryData(sheetName, credentials) {
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
}`;

code = code.replace(oldGetCategoryData, newGetCategoryData);

const oldAddCategoryItem = `function addCategoryItem(sheetName, itemValue, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  if (!itemValue || itemValue.trim() === "") return { success: false, message: "Dữ liệu trống!" };
  var sheet = getDbSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: "Không tìm thấy Sheet " + sheetName };

  sheet.appendRow([itemValue.trim()]);
  return { success: true, message: "Đã thêm thành công!" };
}`;

const newAddCategoryItem = `function addCategoryItem(sheetName, itemData, credentials) {
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
}`;

code = code.replace(oldAddCategoryItem, newAddCategoryItem);

const oldUpdateCategoryItem = `function updateCategoryItem(sheetName, rowIndex, newItemValue, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  if (!newItemValue || newItemValue.trim() === "") return { success: false, message: "Dữ liệu trống!" };
  var sheet = getDbSpreadsheet().getSheetByName(sheetName);
  sheet.getRange(rowIndex, 1).setValue(newItemValue.trim());
  return { success: true, message: "Đã cập nhật!" };
}`;

const newUpdateCategoryItem = `function updateCategoryItem(sheetName, rowIndex, itemData, credentials) {
  var userInfo = verifySession(credentials); if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'GiaoVu')) return { success: false, message: "Không có quyền!" };
  var sheet = getDbSpreadsheet().getSheetByName(sheetName);

  if (sheetName === 'DanhSachNghe') {
    if (!itemData || !itemData.value || itemData.value.trim() === "") return { success: false, message: "Tên nghề không được trống!" };
    sheet.getRange(rowIndex, 1, 1, 4).setValues([[itemData.value.trim(), itemData.thoiGianDaoTao || '', itemData.trinhDoDaoTao || '', itemData.tongSoGio || '']]);
  } else {
    if (!itemData || itemData.trim() === "") return { success: false, message: "Dữ liệu trống!" };
    sheet.getRange(rowIndex, 1).setValue(itemData.trim());
  }
  return { success: true, message: "Đã cập nhật!" };
}`;

code = code.replace(oldUpdateCategoryItem, newUpdateCategoryItem);

const importFunction = `
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
`;

code += importFunction;

fs.writeFileSync('/app/gas_project/Code.gs', code);
