import re

with open('/app/gas_project/Code.gs', 'r', encoding='utf-8') as f:
    code = f.read()

# Update getCourses to include new fields
getCourses_old = """
  for (var i = 1; i < data.length; i++) {
    var c_id = data[i][0];
    var c_name = data[i][1];
    var c_teacher = data[i][2];
    var c_status = data[i][3];
    var c_start = data[i][4];
    var c_end = data[i][5];

    if (userInfo.role === 'Admin' || userInfo.role === 'GiaoVu' || userInfo.username === c_teacher) {
      courses.push({
        id: c_id, name: c_name, teacher: c_teacher, status: c_status,
        start: c_start, end: c_end, rowIndex: i + 1
      });
    }
  }
"""

getCourses_new = """
  for (var i = 1; i < data.length; i++) {
    var c_teacher = data[i][2]; // Cột C: Mã GV
    if (userInfo.role === 'Admin' || userInfo.role === 'GiaoVu' || userInfo.username === c_teacher) {
      courses.push({
        id: data[i][0], name: data[i][1], teacher: c_teacher, status: data[i][3],
        start: data[i][4], end: data[i][5],
        namDaoTao: data[i][6], soNgay: data[i][7], diaDiem: data[i][8],
        qdMoLop: data[i][9], qdTotNghiep: data[i][10],
        rowIndex: i + 1
      });
    }
  }
"""
code = code.replace(getCourses_old.strip(), getCourses_new.strip())

# Update createCourse to match new structure
createCourse_old = """
function createCourse(courseData, userInfo) {
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'KhoaHoc'" };

  var newId = "KH_" + new Date().getTime();
  sheet.appendRow([
    newId, courseData.name, userInfo.username, "Chờ duyệt",
    courseData.startDate, courseData.endDate
  ]);

  return { success: true, message: "Đã tạo lớp học thành công, vui lòng chờ duyệt." };
}
"""
createCourse_new = """
function createCourse(courseData, userInfo) {
  var sheet = getDbSpreadsheet().getSheetByName("KhoaHoc");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'KhoaHoc'" };

  var newId = "KH_" + new Date().getTime();
  var rowData = [
    newId, courseData.name, userInfo.username, "Chờ duyệt",
    courseData.startDate, courseData.endDate,
    courseData.namDaoTao, courseData.soNgay, courseData.diaDiem,
    courseData.qdMoLop, courseData.qdTotNghiep
  ];
  sheet.appendRow(rowData);

  return { success: true, message: "Đã tạo lớp học thành công, vui lòng chờ duyệt." };
}
"""
code = code.replace(createCourse_old.strip(), createCourse_new.strip())


# Update Register / Add student to handle massive column array
registerStudent_old = """
// Quét QR tự đăng ký
function registerStudent(studentData) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'HocVien'" };

  sheet.appendRow([
    studentData.courseId, studentData.fullName, studentData.dob,
    studentData.gender, studentData.cccd, studentData.address,
    studentData.phone, studentData.doiTuong, new Date()
  ]);

  return { success: true, message: "Đăng ký thành công!" };
}
"""
registerStudent_new = """
// Tạo mảng dữ liệu Học viên theo đúng thứ tự cột
function _mapStudentToArray(s, isUpdate) {
  var arr = [
    s.courseId, s.fullName, s.dob, s.gender, s.cccd, s.phone, s.email,
    s.doiTuong, s.danToc, s.tonGiao, s.trinhDo,
    s.queQuan, s.noiSinh, s.thuongTru, s.tamTru,
    s.tenCha, s.ngheCha, s.tenMe, s.ngheMe, s.tenVoChong, s.ngheVoChong
  ];
  if (!isUpdate) arr.push(new Date()); // Ngày đăng ký (Cột cuối)
  return arr;
}

function registerStudent(studentData) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return { success: false, message: "Không tìm thấy sheet 'HocVien'" };

  sheet.appendRow(_mapStudentToArray(studentData, false));
  return { success: true, message: "Đăng ký thành công!" };
}
"""
code = code.replace(registerStudent_old.strip(), registerStudent_new.strip())


# Update getStudentsByCourse
getStudents_old = """
function getStudentsByCourse(courseId) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === courseId) {
      students.push({
        fullName: data[i][1], dob: data[i][2], gender: data[i][3],
        cccd: data[i][4], address: data[i][5], phone: data[i][6],
        doiTuong: data[i][7], rowIndex: i + 1
      });
    }
  }
  return students;
}
"""
getStudents_new = """
function getStudentsByCourse(courseId) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === courseId) {
      students.push({
        courseId: data[i][0], fullName: data[i][1], dob: data[i][2], gender: data[i][3],
        cccd: data[i][4], phone: data[i][5], email: data[i][6],
        doiTuong: data[i][7], danToc: data[i][8], tonGiao: data[i][9], trinhDo: data[i][10],
        queQuan: data[i][11], noiSinh: data[i][12], thuongTru: data[i][13], tamTru: data[i][14],
        tenCha: data[i][15], ngheCha: data[i][16], tenMe: data[i][17], ngheMe: data[i][18],
        tenVoChong: data[i][19], ngheVoChong: data[i][20],
        rowIndex: i + 1
      });
    }
  }
  return students;
}
"""
code = code.replace(getStudents_old.strip(), getStudents_new.strip())

# Update updateStudent
updateStudent_old = """
// Cập nhật HV
function updateStudent(rowIndex, studentData) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  sheet.getRange(rowIndex, 2, 1, 7).setValues([[
    studentData.fullName, studentData.dob, studentData.gender,
    studentData.cccd, studentData.address, studentData.phone, studentData.doiTuong
  ]]);
  return { success: true, message: "Đã cập nhật học viên!" };
}
"""
updateStudent_new = """
// Cập nhật HV
function updateStudent(rowIndex, studentData) {
  var sheet = getDbSpreadsheet().getSheetByName("HocVien");
  var arr = _mapStudentToArray(studentData, true);
  // Cập nhật từ cột 1 (Bỏ qua cột Date đăng ký cuối cùng)
  sheet.getRange(rowIndex, 1, 1, arr.length).setValues([arr]);
  return { success: true, message: "Đã cập nhật học viên!" };
}
"""
code = code.replace(updateStudent_old.strip(), updateStudent_new.strip())


with open('/app/gas_project/Code.gs', 'w', encoding='utf-8') as f:
    f.write(code)
