const fs = require('fs');
let code = fs.readFileSync('/app/gas_project/Code.gs', 'utf8');

// Admins and GiaoVu should also be able to create courses, add/update/delete students. Let's make permissions more flexible.
code = code.replace(`if (!userInfo || userInfo.role !== 'GiaoVien') return { success: false, message: "Chỉ Giáo viên mới được tạo khóa học!" };`,
                    `if (!userInfo) return { success: false, message: "Không có quyền!" }; // Ai có tài khoản cũng có thể tạo khóa học`);

code = code.replace(/if \(!userInfo \|\| userInfo.role !== 'GiaoVien'\) return \{ success: false, message: "Không có quyền!" \};/g,
                    `if (!userInfo) return { success: false, message: "Không có quyền!" }; // Admin, GiaoVu, GiaoVien đều thao tác được`);

fs.writeFileSync('/app/gas_project/Code.gs', code);
