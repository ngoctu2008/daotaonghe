const fs = require('fs');
let code = fs.readFileSync('/app/gas_project/Code.gs', 'utf8');

const oldLogoFunc = `function getLogoUrl() {
  try {
    var files = DriveApp.getFilesByName('logo.png');
    if (files.hasNext()) {
      var file = files.next();
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return "https://drive.google.com/uc?export=view&id=" + file.getId();
    }
  } catch (e) {
    // Ignore permissions/search errors
  }
  return "";
}`;

const newLogoFunc = `function getLogoUrl() {
  try {
    var folderId = '1r8oSnXq47_0eJyE30eyTjbV9MKgo_hhM';
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFilesByName('Logo TT KV.png');
    if (files.hasNext()) {
      var file = files.next();
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return "https://drive.google.com/uc?export=view&id=" + file.getId();
    }
  } catch (e) {
    // Ignore permissions/search errors
  }
  return "";
}`;

code = code.replace(oldLogoFunc, newLogoFunc);
fs.writeFileSync('/app/gas_project/Code.gs', code);
