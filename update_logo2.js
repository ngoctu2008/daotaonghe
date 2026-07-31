const fs = require('fs');
let code = fs.readFileSync('/app/gas_project/Code.gs', 'utf8');

code = code.replace(/function getLogoUrl\(\) \{[\s\S]*?return ""; \/\/ Fallback\n\}/, `function getLogoUrl() {
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
  return ""; // Fallback
}`);

fs.writeFileSync('/app/gas_project/Code.gs', code);
