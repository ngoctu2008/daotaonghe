const fs = require('fs');
let html = fs.readFileSync('/app/gas_project/Index.html', 'utf8');

// 1. Add SheetJS library
html = html.replace('<!-- Scripts -->', '<!-- Scripts -->\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>');

// 2. Modify "Danh sách Nghề" Table HTML to have 4 columns and buttons
const oldTableHtml = `<div class="card-header bg-white d-flex justify-content-between align-items-center py-2">
                <h6 class="mb-0 small fw-bold">Danh sách Nghề</h6>
                <button class="btn btn-sm btn-primary py-0" onclick="addCategory('DanhSachNghe')"><i class="bi bi-plus"></i> Thêm</button>
              </div>
              <div class="table-responsive" style="max-height: 400px;">
                <table class="table table-sm table-hover table-bordered mb-0" id="tbl-DanhSachNghe">
                  <thead class="table-light position-sticky top-0"><tr><th>Tên nghề</th><th></th></tr></thead>
                  <tbody></tbody>
                </table>
              </div>`;

const newTableHtml = `<div class="card-header bg-white d-flex justify-content-between align-items-center py-2">
                <h6 class="mb-0 small fw-bold">Danh sách Nghề</h6>
                <div>
                  <button class="btn btn-sm btn-outline-success py-0" onclick="exportExcelDanhSachNghe()"><i class="bi bi-file-earmark-excel"></i> Xuất</button>
                  <label class="btn btn-sm btn-outline-primary py-0 mb-0">
                    <i class="bi bi-upload"></i> Nhập <input type="file" id="importExcelFile" style="display: none;" accept=".xlsx, .xls" onchange="importExcelDanhSachNghe(event)">
                  </label>
                  <button class="btn btn-sm btn-outline-secondary py-0" onclick="downloadTemplateNghe()"><i class="bi bi-download"></i> Mẫu</button>
                  <button class="btn btn-sm btn-primary py-0" onclick="openNgheForm()"><i class="bi bi-plus"></i> Thêm</button>
                </div>
              </div>
              <div class="table-responsive" style="max-height: 400px;">
                <table class="table table-sm table-hover table-bordered mb-0" id="tbl-DanhSachNghe">
                  <thead class="table-light position-sticky top-0">
                    <tr>
                      <th>Tên nghề</th>
                      <th>Thời gian ĐT</th>
                      <th>Trình độ ĐT</th>
                      <th>Tổng số giờ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>

              <!-- Modal Nghe Form -->
              <div id="ngheFormArea" class="hidden" style="position: absolute; top: 50px; left: 50%; transform: translateX(-50%); width: 400px; z-index: 1050;">
                <div class="card shadow">
                  <div class="card-header bg-primary text-white d-flex justify-content-between py-2">
                    <h6 class="mb-0" id="ngheFormTitle">Thêm Nghề</h6>
                    <button type="button" class="btn-close btn-close-white" style="font-size: 0.7rem;" onclick="closeNgheForm()"></button>
                  </div>
                  <div class="card-body p-3">
                    <input type="hidden" id="nRowIndex">
                    <div class="mb-2">
                      <label class="form-label small">Tên nghề (*)</label>
                      <input type="text" class="form-control form-control-sm" id="n_ten">
                    </div>
                    <div class="mb-2">
                      <label class="form-label small">Thời gian đào tạo</label>
                      <input type="text" class="form-control form-control-sm" id="n_thoigian">
                    </div>
                    <div class="mb-2">
                      <label class="form-label small">Trình độ đào tạo</label>
                      <input type="text" class="form-control form-control-sm" id="n_trinhdo">
                    </div>
                    <div class="mb-2">
                      <label class="form-label small">Tổng số giờ</label>
                      <input type="text" class="form-control form-control-sm" id="n_sogio">
                    </div>
                    <div class="text-end mt-3">
                      <span id="n_msg" class="text-info small me-2"></span>
                      <button class="btn btn-sm btn-secondary" onclick="closeNgheForm()">Hủy</button>
                      <button class="btn btn-sm btn-primary" onclick="saveNghe()">Lưu</button>
                    </div>
                  </div>
                </div>
              </div>`;

html = html.replace(oldTableHtml, newTableHtml);


// 3. Update loadCategories script block
const oldLoadCategories = `function loadCategories(sheetName) {
        let tbody = document.querySelector(\`#tbl-\${sheetName} tbody\`);
        if(!tbody) return;
        tbody.innerHTML = '<tr><td class="text-center small">Đang tải...</td></tr>';

        google.script.run.withSuccessHandler(items => {
          tbody.innerHTML = '';
          if (items.length === 0) return tbody.innerHTML = '<tr><td class="text-center small text-muted">Chưa có dữ liệu.</td></tr>';

          items.forEach(item => {
            let tr = document.createElement('tr');
            let actions = \`<button class="btn btn-sm btn-link py-0 px-1" onclick="editCategory('\${sheetName}', \${item.rowIndex}, '\${escapeHtml(item.value).replace(/'/g, "\\\\'")}')"><i class="bi bi-pencil"></i></button>
                           <button class="btn btn-sm btn-link text-danger py-0 px-1" onclick="deleteCategory('\${sheetName}', \${item.rowIndex})"><i class="bi bi-trash"></i></button>\`;
            tr.innerHTML = \`<td class="ps-3 align-middle">\${escapeHtml(item.value)}</td><td class="text-end pe-2" style="width: 80px;">\${actions}</td>\`;
            tbody.appendChild(tr);
          });
        }).getCategoryData(sheetName, currentUser);

        // Load sheet còn lại nếu đang load DanhSachNghe
        if (sheetName === 'DanhSachNghe') loadCategories('DoiTuong');
      }`;

const newLoadCategories = `function loadCategories(sheetName) {
        let tbody = document.querySelector(\`#tbl-\${sheetName} tbody\`);
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" class="text-center small">Đang tải...</td></tr>';

        google.script.run.withSuccessHandler(items => {
          tbody.innerHTML = '';
          if (items.length === 0) return tbody.innerHTML = '<tr><td colspan="5" class="text-center small text-muted">Chưa có dữ liệu.</td></tr>';

          if (sheetName === 'DanhSachNghe') {
            window.danhSachNgheData = items; // Save for export
          }

          items.forEach(item => {
            let tr = document.createElement('tr');
            if (sheetName === 'DanhSachNghe') {
              let safeObj = encodeURIComponent(JSON.stringify(item));
              let actions = \`<button class="btn btn-sm btn-link py-0 px-1" onclick="editNgheForm('\${safeObj}')"><i class="bi bi-pencil"></i></button>
                             <button class="btn btn-sm btn-link text-danger py-0 px-1" onclick="deleteCategory('\${sheetName}', \${item.rowIndex})"><i class="bi bi-trash"></i></button>\`;
              tr.innerHTML = \`
                <td class="ps-3 align-middle">\${escapeHtml(item.value)}</td>
                <td class="align-middle">\${escapeHtml(item.thoiGianDaoTao || '')}</td>
                <td class="align-middle">\${escapeHtml(item.trinhDoDaoTao || '')}</td>
                <td class="align-middle">\${escapeHtml(item.tongSoGio || '')}</td>
                <td class="text-end pe-2" style="width: 80px;">\${actions}</td>\`;
            } else {
              let actions = \`<button class="btn btn-sm btn-link py-0 px-1" onclick="editCategory('\${sheetName}', \${item.rowIndex}, '\${escapeHtml(item.value).replace(/'/g, "\\\\'")}')"><i class="bi bi-pencil"></i></button>
                             <button class="btn btn-sm btn-link text-danger py-0 px-1" onclick="deleteCategory('\${sheetName}', \${item.rowIndex})"><i class="bi bi-trash"></i></button>\`;
              tr.innerHTML = \`<td class="ps-3 align-middle">\${escapeHtml(item.value)}</td><td class="text-end pe-2" style="width: 80px;">\${actions}</td>\`;
            }
            tbody.appendChild(tr);
          });
        }).getCategoryData(sheetName, currentUser);

        if (sheetName === 'DanhSachNghe') loadCategories('DoiTuong');
      }

      function openNgheForm() {
        document.getElementById('ngheFormArea').classList.remove('hidden');
        document.getElementById('ngheFormTitle').innerText = "Thêm Nghề";
        document.getElementById('nRowIndex').value = "";
        document.getElementById('n_ten').value = "";
        document.getElementById('n_thoigian').value = "";
        document.getElementById('n_trinhdo').value = "";
        document.getElementById('n_sogio').value = "";
        document.getElementById('n_msg').innerText = "";
      }

      function editNgheForm(safeObj) {
        let item = JSON.parse(decodeURIComponent(safeObj));
        document.getElementById('ngheFormArea').classList.remove('hidden');
        document.getElementById('ngheFormTitle').innerText = "Sửa Nghề";
        document.getElementById('nRowIndex').value = item.rowIndex;
        document.getElementById('n_ten').value = item.value;
        document.getElementById('n_thoigian').value = item.thoiGianDaoTao || "";
        document.getElementById('n_trinhdo').value = item.trinhDoDaoTao || "";
        document.getElementById('n_sogio').value = item.tongSoGio || "";
        document.getElementById('n_msg').innerText = "";
      }

      function closeNgheForm() { document.getElementById('ngheFormArea').classList.add('hidden'); }

      function saveNghe() {
        let rowIndex = document.getElementById('nRowIndex').value;
        let data = {
          value: document.getElementById('n_ten').value,
          thoiGianDaoTao: document.getElementById('n_thoigian').value,
          trinhDoDaoTao: document.getElementById('n_trinhdo').value,
          tongSoGio: document.getElementById('n_sogio').value
        };
        if(!data.value) return alert("Vui lòng nhập Tên nghề!");

        let msg = document.getElementById('n_msg'); msg.innerText = "Đang lưu...";
        if (rowIndex) {
          google.script.run.withSuccessHandler(res => {
            if(res.success) { loadCategories('DanhSachNghe'); closeNgheForm(); } else { alert(res.message); msg.innerText = ""; }
          }).updateCategoryItem('DanhSachNghe', rowIndex, data, currentUser);
        } else {
          google.script.run.withSuccessHandler(res => {
            if(res.success) { loadCategories('DanhSachNghe'); closeNgheForm(); } else { alert(res.message); msg.innerText = ""; }
          }).addCategoryItem('DanhSachNghe', data, currentUser);
        }
      }

      function downloadTemplateNghe() {
        const ws = XLSX.utils.aoa_to_sheet([["Tên nghề", "Thời gian đào tạo", "Trình độ đào tạo", "Tổng số giờ"]]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DanhSachNghe");
        XLSX.writeFile(wb, "Mau_Nhap_Nghe.xlsx");
      }

      function exportExcelDanhSachNghe() {
        if (!window.danhSachNgheData || window.danhSachNgheData.length === 0) return alert("Không có dữ liệu để xuất!");
        let dataToExport = [["Tên nghề", "Thời gian đào tạo", "Trình độ đào tạo", "Tổng số giờ"]];
        window.danhSachNgheData.forEach(item => {
          dataToExport.push([item.value, item.thoiGianDaoTao, item.trinhDoDaoTao, item.tongSoGio]);
        });
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DanhSachNghe");
        XLSX.writeFile(wb, "DanhSachNghe.xlsx");
      }

      function importExcelDanhSachNghe(e) {
        let file = e.target.files[0];
        if (!file) return;
        let reader = new FileReader();
        reader.onload = function(e) {
          let data = new Uint8Array(e.target.result);
          let workbook = XLSX.read(data, {type: 'array'});
          let firstSheetName = workbook.SheetNames[0];
          let worksheet = workbook.Sheets[firstSheetName];
          // Get raw data array of arrays, header is first row
          let jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
          if(jsonData.length <= 1) return alert("File không có dữ liệu!");

          // Verify header (optional but good practice)
          let headers = jsonData[0];
          if(headers[0] !== "Tên nghề" && !confirm("Tiêu đề cột đầu tiên không phải 'Tên nghề'. Bạn có chắc chắn muốn tiếp tục import?")) {
              document.getElementById('importExcelFile').value = ''; // Reset file input
              return;
          }

          let dataToImport = jsonData.slice(1); // Remove header
          google.script.run.withSuccessHandler(res => {
            alert(res.message);
            if(res.success) loadCategories('DanhSachNghe');
            document.getElementById('importExcelFile').value = ''; // Reset file input
          }).importDanhSachNghe(dataToImport, currentUser);
        };
        reader.readAsArrayBuffer(file);
      }`;

html = html.replace(oldLoadCategories, newLoadCategories);

// Replace addCategory logic slightly for 'DoiTuong' backwards compatibility
const oldAddCatScript = `function addCategory(sheetName) {
        let title = sheetName === 'DanhSachNghe' ? "Nghề Đào Tạo" : "Đối Tượng";
        let val = prompt(\`Nhập tên \${title} mới:\`);
        if(!val || !val.trim()) return;

        google.script.run.withSuccessHandler(res => {
           if(res.success) loadCategories(sheetName);
           else alert(res.message);
        }).addCategoryItem(sheetName, val, currentUser);
      }`;

const newAddCatScript = `function addCategory(sheetName) {
        if (sheetName === 'DanhSachNghe') return; // Handled by Modal now
        let title = "Đối Tượng";
        let val = prompt(\`Nhập tên \${title} mới:\`);
        if(!val || !val.trim()) return;

        google.script.run.withSuccessHandler(res => {
           if(res.success) loadCategories(sheetName);
           else alert(res.message);
        }).addCategoryItem(sheetName, val, currentUser);
      }`;
html = html.replace(oldAddCatScript, newAddCatScript);


fs.writeFileSync('/app/gas_project/Index.html', html);
