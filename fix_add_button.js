const fs = require('fs');
let html = fs.readFileSync('/app/gas_project/Index.html', 'utf8');

// The original UI update didn't target the actual HTML for adding 'DanhSachNghe' in the admin panel correctly.
// We need to look for where `addCategory('DanhSachNghe')` is called in the HTML.
// From previous grep:
// <div class="card-header d-flex justify-content-between align-items-center">
//   <span>Nghề Đào Tạo</span>
//   <button class="btn btn-sm btn-primary" onclick="addCategory('DanhSachNghe')"><i class="bi bi-plus"></i> Thêm</button>
// </div>

const oldHeader = `<div class="card-header d-flex justify-content-between align-items-center">
                <span>Nghề Đào Tạo</span>
                <button class="btn btn-sm btn-primary" onclick="addCategory('DanhSachNghe')"><i class="bi bi-plus"></i> Thêm</button>
              </div>
              <div class="card-body p-0">
                <table class="table table-sm table-hover mb-0" id="tbl-DanhSachNghe">
                  <thead class="table-light"><tr><th>Tên</th><th></th></tr></thead>
                  <tbody></tbody>
                </table>
              </div>`;

const newHeader = `<div class="card-header d-flex justify-content-between align-items-center py-2">
                <span class="mb-0 fw-bold">Nghề Đào Tạo</span>
                <div>
                  <button class="btn btn-sm btn-outline-success py-0" onclick="exportExcelDanhSachNghe()"><i class="bi bi-file-earmark-excel"></i> Xuất</button>
                  <label class="btn btn-sm btn-outline-primary py-0 mb-0">
                    <i class="bi bi-upload"></i> Nhập <input type="file" id="importExcelFile" style="display: none;" accept=".xlsx, .xls" onchange="importExcelDanhSachNghe(event)">
                  </label>
                  <button class="btn btn-sm btn-outline-secondary py-0" onclick="downloadTemplateNghe()"><i class="bi bi-download"></i> Mẫu</button>
                  <button class="btn btn-sm btn-primary py-0" onclick="openNgheForm()"><i class="bi bi-plus"></i> Thêm</button>
                </div>
              </div>
              <div class="card-body p-0 table-responsive" style="max-height: 400px;">
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

html = html.replace(oldHeader, newHeader);

// The `newTableHtml` replacement we did in step 2 might not have found the exact match if the HTML structure was slightly different. We need to check if the modal was added.
fs.writeFileSync('/app/gas_project/Index.html', html);
