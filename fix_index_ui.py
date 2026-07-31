import re

with open('/app/gas_project/Index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# Update CSS and Basic Layout to match ArchitectUI/KeroUI style
style_old = """
      body { background-color: #f4f7f6; display: flex; height: 100vh; overflow: hidden; }
      .hidden { display: none !important; }

      /* Login styles */
      #loginPage { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
      .login-container { max-width: 400px; width: 100%; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

      /* Layout styles */
      #sidebar { width: 250px; background-color: #343a40; color: white; display: flex; flex-direction: column; transition: 0.3s; }
      #sidebar .nav-link { color: #adb5bd; padding: 12px 20px; font-size: 16px; cursor: pointer; }
      #sidebar .nav-link:hover, #sidebar .nav-link.active { color: white; background-color: #495057; border-radius: 4px; margin: 0 10px; }
      #sidebar .brand { padding: 20px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #495057; margin-bottom: 15px; }
      #content-area { flex-grow: 1; overflow-y: auto; padding: 20px; background-color: #f8f9fa; }

      .top-header { background: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
      #qrCodeContainer { text-align: center; margin-top: 20px; }
"""
style_new = """
      body { background-color: #f1f4f6; display: flex; height: 100vh; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      .hidden { display: none !important; }

      /* Utilities */
      .card { border: none; border-radius: 0.5rem; box-shadow: 0 0.46875rem 2.1875rem rgba(4,9,20,0.03), 0 0.9375rem 1.40625rem rgba(4,9,20,0.03); margin-bottom: 1.5rem; }
      .card-header { background-color: white; border-bottom: 1px solid rgba(26,54,126,0.125); padding: 1rem 1.25rem; font-weight: bold; color: #495057; text-transform: uppercase; font-size: 0.85rem;}

      /* Login styles */
      #loginPage { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);}
      .login-container { max-width: 400px; width: 100%; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }

      /* Layout styles */
      #sidebar { width: 280px; background-color: #ffffff; display: flex; flex-direction: column; transition: 0.3s; z-index: 10; box-shadow: 7px 0 60px rgba(0,0,0,0.05); }
      #sidebar .nav-link { color: #495057; padding: 12px 25px; font-size: 0.95rem; cursor: pointer; font-weight: 500; transition: all 0.2s;}
      #sidebar .nav-link:hover, #sidebar .nav-link.active { color: #3f6ad8; background-color: #e0f3ff; border-right: 3px solid #3f6ad8; }
      #sidebar .brand { padding: 25px; font-size: 24px; font-weight: bold; color: #3f6ad8; text-align: center; border-bottom: 1px solid #f1f4f6; margin-bottom: 15px; }
      #content-area { flex-grow: 1; overflow-y: auto; padding: 30px; background-color: #f1f4f6; }

      .top-header { background: white; padding: 15px 30px; border-radius: 0; box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); margin: -30px -30px 30px -30px; display: flex; justify-content: space-between; align-items: center; }
      #qrCodeContainer { text-align: center; margin-top: 20px; }
      .btn-primary { background-color: #3f6ad8; border-color: #3f6ad8; }
      .table th { text-transform: uppercase; font-size: 0.8rem; color: #6c757d; border-top: none;}
"""
code = code.replace(style_old.strip(), style_new.strip())

# Update form elements for Course Creation
courseForm_old = """
              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label small">Tên nghề đào tạo</label>
                  <input class="form-control" list="ngheOptions" id="newCourseName" placeholder="Gõ để tìm hoặc chọn nghề...">
                  <datalist id="ngheOptions"></datalist>
                </div>
                <div class="col-md-3 mb-2">
                  <label class="form-label small">Ngày khai giảng</label>
                  <input type="date" id="newCourseStart" class="form-control">
                </div>
                <div class="col-md-3 mb-2">
                  <label class="form-label small">Ngày bế giảng</label>
                  <input type="date" id="newCourseEnd" class="form-control">
                </div>
              </div>
"""
courseForm_new = """
              <div class="row g-2">
                <div class="col-md-4 mb-2">
                  <label class="form-label small">Tên nghề đào tạo</label>
                  <input class="form-control form-control-sm" list="ngheOptions" id="newCourseName" placeholder="Chọn nghề...">
                  <datalist id="ngheOptions"></datalist>
                </div>
                <div class="col-md-2 mb-2"><label class="form-label small">Năm ĐT</label><input type="number" id="c_nam" class="form-control form-control-sm" value="2024"></div>
                <div class="col-md-2 mb-2"><label class="form-label small">Ngày KG</label><input type="date" id="newCourseStart" class="form-control form-control-sm"></div>
                <div class="col-md-2 mb-2"><label class="form-label small">Ngày BG</label><input type="date" id="newCourseEnd" class="form-control form-control-sm"></div>
                <div class="col-md-2 mb-2"><label class="form-label small">Số ngày học</label><input type="number" id="c_soNgay" class="form-control form-control-sm"></div>

                <div class="col-md-4 mb-2"><label class="form-label small">Địa điểm (Thôn/Xã/Huyện/Tỉnh)</label><input type="text" id="c_diaDiem" class="form-control form-control-sm"></div>
                <div class="col-md-4 mb-2"><label class="form-label small">QĐ Mở Lớp</label><input type="text" id="c_qdMo" class="form-control form-control-sm"></div>
                <div class="col-md-4 mb-2"><label class="form-label small">QĐ Công nhận TN</label><input type="text" id="c_qdTN" class="form-control form-control-sm"></div>
              </div>
"""
code = code.replace(courseForm_old.strip(), courseForm_new.strip())

# Update createCourse JS
jsCreate_old = """
      function createCourse() {
        let name = document.getElementById('newCourseName').value;
        let start = document.getElementById('newCourseStart').value;
        let end = document.getElementById('newCourseEnd').value;
        if(!name) return alert("Vui lòng nhập hoặc chọn tên nghề!");

        document.getElementById('teacherAlert').innerText = "Đang xử lý...";
        google.script.run.withSuccessHandler(res => {
          document.getElementById('teacherAlert').innerText = res.message;
          if (res.success) { document.getElementById('newCourseName').value = ""; loadCourses(); }
        }).createCourse({ name: name, startDate: start, endDate: end }, currentUser);
      }
"""
jsCreate_new = """
      function createCourse() {
        let data = {
          name: document.getElementById('newCourseName').value,
          startDate: document.getElementById('newCourseStart').value,
          endDate: document.getElementById('newCourseEnd').value,
          namDaoTao: document.getElementById('c_nam').value,
          soNgay: document.getElementById('c_soNgay').value,
          diaDiem: document.getElementById('c_diaDiem').value,
          qdMoLop: document.getElementById('c_qdMo').value,
          qdTotNghiep: document.getElementById('c_qdTN').value
        };
        if(!data.name) return alert("Vui lòng nhập hoặc chọn tên nghề!");

        document.getElementById('teacherAlert').innerText = "Đang xử lý...";
        google.script.run.withSuccessHandler(res => {
          document.getElementById('teacherAlert').innerText = res.message;
          if (res.success) { document.getElementById('newCourseName').value = ""; loadCourses(); }
        }).createCourse(data, currentUser);
      }
"""
code = code.replace(jsCreate_old.strip(), jsCreate_new.strip())

# Update Student Form in Modal to support all fields
studentFormHTML_old = """
                <!-- Form Thêm/Sửa Học Viên -->
                <div id="studentFormArea" class="card mt-3 hidden border-primary">
                  <div class="card-header bg-primary text-white py-1">
                    <h6 class="mb-0" id="studentFormTitle">Thêm Học Viên</h6>
                  </div>
                  <div class="card-body py-2">
                    <input type="hidden" id="stuRowIndex">
                    <div class="row g-2">
                      <div class="col-md-3"><input type="text" id="s_name" class="form-control form-control-sm" placeholder="Họ tên *"></div>
                      <div class="col-md-2"><input type="date" id="s_dob" class="form-control form-control-sm"></div>
                      <div class="col-md-2">
                        <select id="s_gender" class="form-select form-select-sm"><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select>
                      </div>
                      <div class="col-md-2"><input type="text" id="s_cccd" class="form-control form-control-sm" placeholder="Số CCCD *"></div>
                      <div class="col-md-3">
                        <select id="s_doituong" class="form-select form-select-sm">
                          <option value="Bình thường">Bình thường</option>
                        </select>
                      </div>
                      <div class="col-md-4"><input type="text" id="s_address" class="form-control form-control-sm" placeholder="Địa chỉ"></div>
                      <div class="col-md-3"><input type="text" id="s_phone" class="form-control form-control-sm" placeholder="Số điện thoại"></div>
                      <div class="col-md-5 d-flex align-items-end">
                        <button class="btn btn-sm btn-success me-2" onclick="saveStudent()">Lưu</button>
                        <button class="btn btn-sm btn-secondary" onclick="closeStudentForm()">Hủy</button>
                        <span id="s_msg" class="ms-2 small"></span>
                      </div>
                    </div>
                  </div>
                </div>
"""
studentFormHTML_new = """
                <!-- Form Thêm/Sửa Học Viên -->
                <div id="studentFormArea" class="card mt-3 hidden shadow-sm border" style="border-top: 3px solid #3f6ad8 !important;">
                  <div class="card-header d-flex justify-content-between align-items-center py-2">
                    <h6 class="mb-0 fw-bold text-primary" id="studentFormTitle">Thêm Học Viên</h6>
                    <button class="btn-close btn-sm" onclick="closeStudentForm()"></button>
                  </div>
                  <div class="card-body py-2" style="max-height: 400px; overflow-y: auto;">
                    <input type="hidden" id="stuRowIndex">
                    <h6 class="small fw-bold text-muted mt-2 border-bottom pb-1">Cá nhân</h6>
                    <div class="row g-2">
                      <div class="col-md-4"><label class="small">Họ tên *</label><input type="text" id="s_name" class="form-control form-control-sm"></div>
                      <div class="col-md-3"><label class="small">Ngày sinh *</label><input type="date" id="s_dob" class="form-control form-control-sm"></div>
                      <div class="col-md-2"><label class="small">Giới tính</label><select id="s_gender" class="form-select form-select-sm"><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                      <div class="col-md-3"><label class="small">CCCD *</label><input type="text" id="s_cccd" class="form-control form-control-sm"></div>
                      <div class="col-md-3"><label class="small">SĐT</label><input type="text" id="s_phone" class="form-control form-control-sm"></div>
                      <div class="col-md-3"><label class="small">Dân tộc</label><input type="text" id="s_dantoc" class="form-control form-control-sm"></div>
                      <div class="col-md-3"><label class="small">Tôn giáo</label><input type="text" id="s_tongiao" class="form-control form-control-sm"></div>
                      <div class="col-md-3"><label class="small">Đối tượng</label><select id="s_doituong" class="form-select form-select-sm"><option value="Bình thường">Bình thường</option></select></div>
                    </div>

                    <h6 class="small fw-bold text-muted mt-3 border-bottom pb-1">Địa chỉ & Khác</h6>
                    <div class="row g-2">
                      <div class="col-md-6"><label class="small">Thường trú</label><input type="text" id="s_thuongtru" class="form-control form-control-sm"></div>
                      <div class="col-md-6"><label class="small">Tạm trú</label><input type="text" id="s_tamtru" class="form-control form-control-sm"></div>
                      <div class="col-md-4"><label class="small">Quê quán</label><input type="text" id="s_quequan" class="form-control form-control-sm"></div>
                      <div class="col-md-4"><label class="small">Nơi sinh</label><input type="text" id="s_noisinh" class="form-control form-control-sm"></div>
                      <div class="col-md-4"><label class="small">Email</label><input type="text" id="s_email" class="form-control form-control-sm"></div>
                    </div>

                    <h6 class="small fw-bold text-muted mt-3 border-bottom pb-1">Gia đình</h6>
                    <div class="row g-2">
                      <div class="col-md-6"><label class="small">Họ tên Cha</label><input type="text" id="s_tencha" class="form-control form-control-sm"></div>
                      <div class="col-md-6"><label class="small">Nghề Cha</label><input type="text" id="s_nghecha" class="form-control form-control-sm"></div>
                      <div class="col-md-6"><label class="small">Họ tên Mẹ</label><input type="text" id="s_tenme" class="form-control form-control-sm"></div>
                      <div class="col-md-6"><label class="small">Nghề Mẹ</label><input type="text" id="s_ngheme" class="form-control form-control-sm"></div>
                    </div>
                  </div>
                  <div class="card-footer bg-light text-end py-2">
                    <span id="s_msg" class="me-3 small text-primary"></span>
                    <button class="btn btn-sm btn-secondary" onclick="closeStudentForm()">Hủy</button>
                    <button class="btn btn-sm btn-success" onclick="saveStudent()">Lưu thông tin</button>
                  </div>
                </div>
"""
code = code.replace(studentFormHTML_old.strip(), studentFormHTML_new.strip())

# Update JS edit/save student to map new fields
jsEdit_old = """
      function editStudent(safeObj) {
        let s = JSON.parse(decodeURIComponent(safeObj));
        document.getElementById('studentFormArea').classList.remove('hidden');
        document.getElementById('studentFormTitle').innerText = "Sửa Học Viên";
        document.getElementById('stuRowIndex').value = s.rowIndex;
        document.getElementById('s_name').value = s.fullName;
        if(s.dob) document.getElementById('s_dob').value = new Date(s.dob).toISOString().split('T')[0];
        document.getElementById('s_gender').value = s.gender;
        document.getElementById('s_cccd').value = s.cccd;
        if(s.doiTuong) document.getElementById('s_doituong').value = s.doiTuong;
        document.getElementById('s_address').value = s.address;
        document.getElementById('s_phone').value = s.phone;
      }
"""
jsEdit_new = """
      function editStudent(safeObj) {
        let s = JSON.parse(decodeURIComponent(safeObj));
        document.getElementById('studentFormArea').classList.remove('hidden');
        document.getElementById('studentFormTitle').innerText = "Sửa Học Viên";
        document.getElementById('stuRowIndex').value = s.rowIndex;

        document.getElementById('s_name').value = s.fullName || "";
        if(s.dob) document.getElementById('s_dob').value = new Date(s.dob).toISOString().split('T')[0];
        document.getElementById('s_gender').value = s.gender || "Nam";
        document.getElementById('s_cccd').value = s.cccd || "";
        document.getElementById('s_phone').value = s.phone || "";
        document.getElementById('s_dantoc').value = s.danToc || "";
        document.getElementById('s_tongiao').value = s.tonGiao || "";
        if(s.doiTuong) document.getElementById('s_doituong').value = s.doiTuong;

        document.getElementById('s_thuongtru').value = s.thuongTru || "";
        document.getElementById('s_tamtru').value = s.tamTru || "";
        document.getElementById('s_quequan').value = s.queQuan || "";
        document.getElementById('s_noisinh').value = s.noiSinh || "";
        document.getElementById('s_email').value = s.email || "";

        document.getElementById('s_tencha').value = s.tenCha || "";
        document.getElementById('s_nghecha').value = s.ngheCha || "";
        document.getElementById('s_tenme').value = s.tenMe || "";
        document.getElementById('s_ngheme').value = s.ngheMe || "";
      }
"""
code = code.replace(jsEdit_old.strip(), jsEdit_new.strip())


jsSave_old = """
      function saveStudent() {
        let rowIndex = document.getElementById('stuRowIndex').value;
        let data = {
          courseId: currentCourseId, fullName: document.getElementById('s_name').value,
          dob: document.getElementById('s_dob').value, gender: document.getElementById('s_gender').value,
          cccd: document.getElementById('s_cccd').value, doiTuong: document.getElementById('s_doituong').value,
          address: document.getElementById('s_address').value, phone: document.getElementById('s_phone').value
        };
        if(!data.fullName || !data.dob || !data.cccd) return alert("Nhập đủ Họ tên, Ngày sinh, CCCD!");

        let msg = document.getElementById('s_msg'); msg.className = "text-primary ms-2 small"; msg.innerText = "Đang lưu...";

        if (rowIndex) { // Update
          google.script.run.withSuccessHandler(res => { loadStudents(); closeStudentForm(); }).updateStudent(rowIndex, data);
        } else { // Add
          google.script.run.withSuccessHandler(res => { loadStudents(); closeStudentForm(); }).addStudentManual(data);
        }
      }
"""
jsSave_new = """
      function saveStudent() {
        let rowIndex = document.getElementById('stuRowIndex').value;
        let data = {
          courseId: currentCourseId, fullName: document.getElementById('s_name').value,
          dob: document.getElementById('s_dob').value, gender: document.getElementById('s_gender').value,
          cccd: document.getElementById('s_cccd').value, phone: document.getElementById('s_phone').value,
          danToc: document.getElementById('s_dantoc').value, tonGiao: document.getElementById('s_tongiao').value,
          doiTuong: document.getElementById('s_doituong').value, email: document.getElementById('s_email').value,
          thuongTru: document.getElementById('s_thuongtru').value, tamTru: document.getElementById('s_tamtru').value,
          queQuan: document.getElementById('s_quequan').value, noiSinh: document.getElementById('s_noisinh').value,
          tenCha: document.getElementById('s_tencha').value, ngheCha: document.getElementById('s_nghecha').value,
          tenMe: document.getElementById('s_tenme').value, ngheMe: document.getElementById('s_ngheme').value
        };
        if(!data.fullName || !data.dob || !data.cccd) return alert("Nhập đủ Họ tên, Ngày sinh, CCCD!");

        let msg = document.getElementById('s_msg'); msg.innerText = "Đang lưu...";

        if (rowIndex) {
          google.script.run.withSuccessHandler(res => { loadStudents(); closeStudentForm(); }).updateStudent(rowIndex, data);
        } else {
          google.script.run.withSuccessHandler(res => { loadStudents(); closeStudentForm(); }).addStudentManual(data);
        }
      }
"""
code = code.replace(jsSave_old.strip(), jsSave_new.strip())


with open('/app/gas_project/Index.html', 'w', encoding='utf-8') as f:
    f.write(code)
