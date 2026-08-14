import { supabase } from './supabase-client.js';

// ---- GLOBAL STATE ----
let currentUser = null;
let currentToken = null;
let cachedNghe = [];
let cachedDoiTuong = [];
let cachedUsers = [];

// ---- UTILS ----
function escapeHTML(str) {
    if(!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getUserName(email) {
    const user = cachedUsers.find(u => u.Username === email);
    return user ? escapeHTML(user.HoTen) : escapeHTML(email);
}

// ---- DOM ELEMENTS ----
const loginScreen = document.getElementById('login-screen');
const appWrapper = document.getElementById('app-wrapper');
const navLinks = document.querySelectorAll('.sidebar .nav-link');
const views = document.querySelectorAll('.view-section');

// ---- INITIALIZATION ----
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();

    // Login Form Submit
    document.getElementById('frmLogin').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        window.location.reload();
    });

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');

            views.forEach(v => v.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            document.getElementById('page-title').innerText = e.currentTarget.innerText.trim();

            loadViewData(targetId);
        });
    });

    // Form Event Listeners
    document.getElementById('frmSaveKhoaHoc').addEventListener('submit', saveKhoaHoc);
    document.getElementById('frmSaveHocVien').addEventListener('submit', saveHocVien);
    document.getElementById('filterKhoaHoc_HV').addEventListener('change', loadHocVien);
    document.getElementById('filterDuyet_HV').addEventListener('change', loadHocVien);
    document.getElementById('filterKhoaHoc_Diem').addEventListener('change', loadBangDiem);
});

// ---- AUTHENTICATION ----
function checkLoginStatus() {
    const userJson = sessionStorage.getItem('user');
    const tokenStr = sessionStorage.getItem('token');

    if (userJson && tokenStr) {
        currentUser = JSON.parse(userJson);
        currentToken = tokenStr;

        loginScreen.style.display = 'none';
        appWrapper.style.display = 'block';
        document.getElementById('currentUser').innerText = escapeHTML(currentUser.HoTen);

        applyRBAC();
        initAppData();
    } else {
        loginScreen.style.display = 'flex';
        appWrapper.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    const alertBox = document.getElementById('loginAlert');

    try {
        const { data, error } = await supabase.rpc('login_user_v2', { p_username: u, p_password: p });

        if (error) throw error;

        if (data.success) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            sessionStorage.setItem('token', data.token);
            window.location.reload();
        } else {
            alertBox.innerText = data.message;
            alertBox.classList.remove('d-none');
        }
    } catch (err) {
        alertBox.innerText = "Lỗi kết nối hoặc sai thông tin!";
        alertBox.classList.remove('d-none');
        console.error(err);
    }
}

function applyRBAC() {
    const isManager = ['Ban Giám đốc', 'Giáo vụ'].includes(currentUser.Role);
    if(isManager) {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('d-none'));
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
    }
}

// ---- APP DATA INIT ----
async function initAppData() {
    await Promise.all([
        loadCacheData(),
        loadDashboard(),
        loadThongBao()
    ]);
}

async function loadCacheData() {
    const p1 = supabase.from('Nghedaotao').select('*');
    const p2 = supabase.from('DoiTuong').select('*');
    const p3 = supabase.rpc('get_public_users');

    const [resNghe, resDt, resUsers] = await Promise.all([p1, p2, p3]);
    if(!resNghe.error) cachedNghe = resNghe.data;
    if(!resDt.error) cachedDoiTuong = resDt.data;
    if(!resUsers.error) cachedUsers = resUsers.data;
}

function loadViewData(viewId) {
    if(viewId === 'view-dashboard') loadDashboard();
    if(viewId === 'view-khoahoc') loadDsKhoaHoc();
    if(viewId === 'view-hocvien') initHocVienView();
    if(viewId === 'view-diem') initDiemView();
    if(viewId === 'view-danhmuc') loadDanhMuc();
}

// ---- DASHBOARD ----
async function loadDashboard() {
    const { count: cLop } = await supabase.from('Khoahoc').select('*', { count: 'exact', head: true });
    const { count: cHv } = await supabase.from('Hocvien').select('*', { count: 'exact', head: true }).eq('TrangThaiDuyet', 'Đã duyệt');
    const { count: cCho } = await supabase.from('Hocvien').select('*', { count: 'exact', head: true }).eq('TrangThaiDuyet', 'Chờ duyệt');
    const { count: cTn } = await supabase.from('Hocvien').select('*', { count: 'exact', head: true }).not('XepLoai', 'is', null).not('XepLoai', 'eq', 'Không đạt');

    document.getElementById('stat-lop').innerText = cLop || 0;
    document.getElementById('stat-hvdanghoc').innerText = cHv || 0;
    document.getElementById('stat-choduyet').innerText = cCho || 0;
    document.getElementById('stat-totnghiep').innerText = cTn || 0;
}

// ---- THÔNG BÁO ----
async function loadThongBao() {
    let query = supabase.from('ThongBao').select('*').order('ThoiGian', { ascending: false }).limit(10);
    if(currentUser.Role === 'Giáo viên') {
        query = query.eq('NguoiNhan', currentUser.Username);
    }

    const { data, error } = await query;
    if(error) return;

    const ul = document.getElementById('listThongBao');
    const badge = document.getElementById('tbCount');
    let unread = 0;

    if(data.length > 0) {
        ul.innerHTML = '';
        data.forEach(tb => {
            if(!tb.DaDoc) unread++;
            const bgClass = tb.DaDoc ? '' : 'bg-light';
            ul.innerHTML += `
                <li><a class="dropdown-item border-bottom ${bgClass}" href="#" onclick="markRead(${tb.MaTB})">
                    <small class="text-primary">${new Date(tb.ThoiGian).toLocaleString('vi-VN')}</small><br>
                    <span class="text-wrap" style="font-size:0.9rem">${escapeHTML(tb.NoiDung)}</span>
                </a></li>
            `;
        });
    }
    badge.innerText = unread;
}
window.markRead = async function(maTb) {
    await supabase.rpc('mark_read', { p_token: currentToken, p_matb: maTb });
    loadThongBao();
}

// ---- MODULE: KHÓA HỌC ----
async function loadDsKhoaHoc() {
    const tbody = document.getElementById('tblKhoaHoc');
    let query = supabase.from('Khoahoc').select(`
        MaKhoa, TenKhoa, TrangThai, GVCN_Email,
        Nghedaotao(TenNghe),
        Hocvien(MaHV, TrangThaiDuyet)
    `).order('MaKhoa', { ascending: false });

    if(currentUser.Role === 'Giáo viên') {
        query = query.eq('GVCN_Email', currentUser.Username);
    }

    const { data, error } = await query;
    if(error) { tbody.innerHTML = '<tr><td colspan="7">Lỗi tải dữ liệu</td></tr>'; return; }

    tbody.innerHTML = '';
    data.forEach(k => {
        const tongSo = k.Hocvien.length;
        const choDuyet = k.Hocvien.filter(h => h.TrangThaiDuyet === 'Chờ duyệt').length;

        let badgeClass = 'badge-tuyensinh';
        if(k.TrangThai === 'Đang đào tạo') badgeClass = 'badge-daotao';
        if(k.TrangThai === 'Kết thúc khóa học') badgeClass = 'badge-ketthuc';

        const row = `
            <tr>
                <td class="fw-bold text-primary">${escapeHTML(k.MaKhoa)}</td>
                <td>
                    ${escapeHTML(k.TenKhoa)}<br>
                    <small class="text-muted">${k.Nghedaotao ? escapeHTML(k.Nghedaotao.TenNghe) : ''}</small>
                </td>
                <td>${getUserName(k.GVCN_Email)}</td>
                <td><span class="badge ${badgeClass}">${escapeHTML(k.TrangThai)}</span></td>
                <td class="text-center fw-bold">${tongSo - choDuyet}</td>
                <td class="text-center text-danger fw-bold">${choDuyet > 0 ? choDuyet : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="xemHocVienKhoa('${escapeHTML(k.MaKhoa)}')" title="Quản lý Học viên"><i class="fas fa-users"></i></button>
                    <button class="btn btn-sm btn-outline-primary" onclick="showQR('${escapeHTML(k.MaKhoa)}', '${escapeHTML(k.TenKhoa)}')" title="Mã QR"><i class="fas fa-qrcode"></i></button>
                    <button class="btn btn-sm btn-outline-success admin-only" onclick="editKhoaHoc('${escapeHTML(k.MaKhoa)}')" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger admin-only" onclick="deleteKhoaHoc('${escapeHTML(k.MaKhoa)}')" title="Xóa"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    applyRBAC();
}

window.showQR = function(maKhoa, tenKhoa) {
    document.getElementById('qrLop').innerText = tenKhoa;
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    new QRCode(qrContainer, { text: `${basePath}/DangKy.html?makhoa=${encodeURIComponent(maKhoa)}`, width: 150, height: 150 });
    new bootstrap.Modal(document.getElementById('modalQR')).show();
}

window.xemHocVienKhoa = function(maKhoa) {
    // Chuyển view
    document.querySelector('.nav-link[data-target="view-hocvien"]').click();
    // Đợi render combo filter
    setTimeout(() => {
        const filter = document.getElementById('filterKhoaHoc_HV');
        if(filter) {
            filter.value = maKhoa;
            loadHocVien();
        }
    }, 300);
}

window.appKhoaHoc = {
    showModal: function() {
        document.getElementById('frmSaveKhoaHoc').reset();
        document.getElementById('kh_mode').value = 'add';
        document.getElementById('kh_MaKhoa').readOnly = false;

        document.getElementById('kh_MaNghe').innerHTML = cachedNghe.map(n => `<option value="${n.MaNghe}">${escapeHTML(n.TenNghe)}</option>`).join('');
        const gvList = cachedUsers.filter(u => u.Role === 'Giáo viên');
        document.getElementById('kh_GVCN').innerHTML = '<option value="">-- Chọn --</option>' + gvList.map(u => `<option value="${escapeHTML(u.Username)}">${escapeHTML(u.HoTen)}</option>`).join('');

        new bootstrap.Modal(document.getElementById('modalKhoaHoc')).show();
    }
};

window.editKhoaHoc = async function(maKhoa) {
    const { data } = await supabase.from('Khoahoc').select('*').eq('MaKhoa', maKhoa).single();
    if(data) {
        appKhoaHoc.showModal();
        document.getElementById('kh_mode').value = 'edit';
        document.getElementById('kh_MaKhoa').value = data.MaKhoa;
        document.getElementById('kh_MaKhoa').readOnly = true;
        document.getElementById('kh_TenKhoa').value = data.TenKhoa;
        document.getElementById('kh_MaNghe').value = data.MaNghe;
        document.getElementById('kh_GVCN').value = data.GVCN_Email || '';
        document.getElementById('kh_TrangThai').value = data.TrangThai;
        document.getElementById('kh_DiaDiem').value = data.DiaDiemDaoTao || '';
        document.getElementById('kh_TuNgay').value = data.TuNgay || '';
        document.getElementById('kh_DenNgay').value = data.DenNgay || '';
    }
}

window.deleteKhoaHoc = async function(maKhoa) {
    if(confirm('Chắc chắn xóa khóa học này và tất cả học viên thuộc khóa?')) {
        const { data, error } = await supabase.rpc('admin_delete_khoahoc', { p_token: currentToken, p_makhoa: maKhoa });
        if(error || !data.success) alert("Lỗi xóa: " + (error?.message || data?.message));
        else { loadDsKhoaHoc(); loadDashboard(); }
    }
}

async function saveKhoaHoc(e) {
    e.preventDefault();
    const dataObj = {
        MaKhoa: document.getElementById('kh_MaKhoa').value,
        TenKhoa: document.getElementById('kh_TenKhoa').value,
        MaNghe: document.getElementById('kh_MaNghe').value,
        GVCN_Email: document.getElementById('kh_GVCN').value || null,
        TrangThai: document.getElementById('kh_TrangThai').value,
        DiaDiemDaoTao: document.getElementById('kh_DiaDiem').value,
        TuNgay: document.getElementById('kh_TuNgay').value || null,
        DenNgay: document.getElementById('kh_DenNgay').value || null
    };

    const { data, error } = await supabase.rpc('admin_save_khoahoc', {
        p_token: currentToken,
        p_mode: document.getElementById('kh_mode').value,
        p_data: dataObj
    });

    if(error || !data.success) alert("Lỗi: " + (error?.message || data?.message));
    else {
        bootstrap.Modal.getInstance(document.getElementById('modalKhoaHoc')).hide();
        loadDsKhoaHoc(); loadDashboard();
    }
}

// ---- MODULE: HỌC VIÊN ----
async function initHocVienView() {
    let query = supabase.from('Khoahoc').select('MaKhoa, TenKhoa').order('MaKhoa', {ascending: false});
    if(currentUser.Role === 'Giáo viên') query = query.eq('GVCN_Email', currentUser.Username);

    const { data } = await query;
    const filter = document.getElementById('filterKhoaHoc_HV');
    filter.innerHTML = '<option value="">-- Tất cả các khóa --</option>';
    data.forEach(k => {
        filter.innerHTML += `<option value="${escapeHTML(k.MaKhoa)}">${escapeHTML(k.MaKhoa)} - ${escapeHTML(k.TenKhoa)}</option>`;
    });

    loadHocVien();
}

async function loadHocVien() {
    const maKhoa = document.getElementById('filterKhoaHoc_HV').value;
    const ttDuyet = document.getElementById('filterDuyet_HV').value;

    const tbody = document.getElementById('tblHocVien');

    let query = supabase.from('Hocvien').select(`
        *, DoiTuong(TenDoiTuong), Khoahoc!inner(MaKhoa, GVCN_Email)
    `).order('MaHV', { ascending: true });

    if(maKhoa) query = query.eq('MaKhoa', maKhoa);
    if(ttDuyet) query = query.eq('TrangThaiDuyet', ttDuyet);

    if(currentUser.Role === 'Giáo viên') {
        query = query.eq('Khoahoc.GVCN_Email', currentUser.Username);
    }

    const { data, error } = await query;
    if(error) { tbody.innerHTML = '<tr><td colspan="7">Lỗi</td></tr>'; return; }

    tbody.innerHTML = '';
    data.forEach(h => {
        const btnDuyet = h.TrangThaiDuyet === 'Chờ duyệt' ? `<button class="btn btn-sm btn-warning" onclick="duyetHocVien('${escapeHTML(h.MaHV)}')">Duyệt</button>` : `<span class="badge bg-success">Đã duyệt</span>`;

        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(h.MaHV)}</td>
                <td class="fw-bold">${escapeHTML(h.HoTen)}</td>
                <td>${escapeHTML(h.MaKhoa)}</td>
                <td>${h.NgaySinh ? escapeHTML(new Date(h.NgaySinh).toLocaleDateString('vi-VN')) : ''}</td>
                <td>${h.DoiTuong ? escapeHTML(h.DoiTuong.TenDoiTuong) : ''}</td>
                <td>${btnDuyet}</td>
                <td>
                    <button class="btn btn-sm btn-outline-success admin-only" onclick="editHocVien('${escapeHTML(h.MaHV)}')" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger admin-only" onclick="xoaHocVien('${escapeHTML(h.MaHV)}')" title="Xóa"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    applyRBAC();
}

window.appHocVien = {
    showModal: async function() {
        document.getElementById('frmSaveHocVien').reset();
        document.getElementById('hv_mode').value = 'add';

        let query = supabase.from('Khoahoc').select('MaKhoa, TenKhoa').order('MaKhoa', {ascending: false});
        const { data: khoas } = await query;
        document.getElementById('hv_MaKhoa').innerHTML = khoas.map(k => `<option value="${escapeHTML(k.MaKhoa)}">${escapeHTML(k.MaKhoa)}</option>`).join('');
        document.getElementById('hv_MaDoiTuong').innerHTML = '<option value="">Không</option>' + cachedDoiTuong.map(d => `<option value="${d.MaDoiTuong}">${escapeHTML(d.TenDoiTuong)}</option>`).join('');

        new bootstrap.Modal(document.getElementById('modalHocVien')).show();
    }
};

window.editHocVien = async function(maHv) {
    const { data } = await supabase.from('Hocvien').select('*').eq('MaHV', maHv).single();
    if(data) {
        await appHocVien.showModal();
        document.getElementById('hv_mode').value = 'edit';
        document.getElementById('hv_MaHV').value = data.MaHV;
        document.getElementById('hv_MaKhoa').value = data.MaKhoa;
        document.getElementById('hv_TrangThaiDuyet').value = data.TrangThaiDuyet;
        document.getElementById('hv_HoTen').value = data.HoTen;
        document.getElementById('hv_GioiTinh').value = data.GioiTinh || 'Nam';
        document.getElementById('hv_Dienthoai').value = data.Dienthoai || '';
        document.getElementById('hv_NgaySinh').value = data.NgaySinh || '';
        document.getElementById('hv_SoCC').value = data.SoCC || '';
        document.getElementById('hv_MaDoiTuong').value = data.MaDoiTuong || '';
        document.getElementById('hv_ViecLam').value = data.ViecLamSauDaoTao || '';
    }
}

async function saveHocVien(e) {
    e.preventDefault();
    const dataObj = {
        MaHV: document.getElementById('hv_MaHV').value,
        MaKhoa: document.getElementById('hv_MaKhoa').value,
        TrangThaiDuyet: document.getElementById('hv_TrangThaiDuyet').value,
        HoTen: document.getElementById('hv_HoTen').value.toUpperCase(),
        GioiTinh: document.getElementById('hv_GioiTinh').value,
        Dienthoai: document.getElementById('hv_Dienthoai').value,
        NgaySinh: document.getElementById('hv_NgaySinh').value || null,
        SoCC: document.getElementById('hv_SoCC').value,
        MaDoiTuong: document.getElementById('hv_MaDoiTuong').value ? parseInt(document.getElementById('hv_MaDoiTuong').value) : null,
        ViecLamSauDaoTao: document.getElementById('hv_ViecLam').value
    };

    const { data, error } = await supabase.rpc('admin_save_hocvien', {
        p_token: currentToken,
        p_mode: document.getElementById('hv_mode').value,
        p_data: dataObj
    });

    if(error || !data.success) alert("Lỗi: " + (error?.message || data?.message));
    else {
        bootstrap.Modal.getInstance(document.getElementById('modalHocVien')).hide();
        loadHocVien(); loadDashboard();
    }
}

window.duyetHocVien = async function(maHv) {
    if(confirm('Chấp nhận học viên này vào lớp chính thức?')) {
        await supabase.rpc('admin_save_hocvien', {
            p_token: currentToken, p_mode: 'edit', p_data: { MaHV: maHv, TrangThaiDuyet: 'Đã duyệt' }
        });
        loadHocVien(); loadDashboard();
    }
}

window.xoaHocVien = async function(maHv) {
    if(confirm('CẢNH BÁO: Xóa học viên này?')) {
        await supabase.rpc('admin_delete_hocvien', { p_token: currentToken, p_mahv: maHv });
        loadHocVien(); loadDashboard();
    }
}

// ---- MODULE: CHẤM ĐIỂM ----
async function initDiemView() {
    let query = supabase.from('Khoahoc').select('MaKhoa, TenKhoa, MaNghe, Nghedaotao(SoMoDun)').order('MaKhoa', {ascending: false});
    if(currentUser.Role === 'Giáo viên') query = query.eq('GVCN_Email', currentUser.Username);
    const { data } = await query;
    const filter = document.getElementById('filterKhoaHoc_Diem');
    filter.innerHTML = '<option value="">-- Chọn Khóa Học --</option>';
    data.forEach(k => {
        const soMd = k.Nghedaotao ? k.Nghedaotao.SoMoDun : 1;
        filter.innerHTML += `<option value="${escapeHTML(k.MaKhoa)}" data-somd="${soMd}">${escapeHTML(k.MaKhoa)} - ${escapeHTML(k.TenKhoa)}</option>`;
    });
}

async function loadBangDiem() {
    const filter = document.getElementById('filterKhoaHoc_Diem');
    const maKhoa = filter.value;
    const container = document.getElementById('diemContainer');

    if(!maKhoa) return;

    const soMd = parseInt(filter.options[filter.selectedIndex].getAttribute('data-somd')) || 5;

    const { data: hocviens } = await supabase.from('Hocvien')
        .select('MaHV, HoTen, DiemMD1, DiemMD2, DiemMD3, DiemMD4, DiemMD5, TongKet, XepLoai')
        .eq('MaKhoa', maKhoa).eq('TrangThaiDuyet', 'Đã duyệt').order('MaHV', { ascending: true });

    let mdHeaders = '';
    for(let i=1; i<=soMd; i++) mdHeaders += `<th style="width: 80px;">MĐ ${i}</th>`;

    let html = `
        <table class="table table-bordered table-hover align-middle">
            <thead class="table-light">
                <tr><th>Mã HV</th><th>Họ Tên</th>${mdHeaders}<th>Tổng Kết</th><th>Xếp Loại</th><th>Lưu</th></tr>
            </thead><tbody>
    `;

    hocviens.forEach(h => {
        let mdInputs = '';
        for(let i=1; i<=soMd; i++) {
            const val = h[`DiemMD${i}`] || '';
            mdInputs += `<td><input type="number" class="form-control form-control-sm diem-input" data-hv="${escapeHTML(h.MaHV)}" data-md="${i}" step="0.1" min="0" max="10" value="${val}" onchange="tinhDiemRow('${escapeHTML(h.MaHV)}', ${soMd})"></td>`;
        }

        let rowClass = h.XepLoai === 'Không đạt' ? 'table-danger' : '';
        html += `
            <tr id="row_${escapeHTML(h.MaHV)}" class="${rowClass}">
                <td>${escapeHTML(h.MaHV)}</td><td class="fw-bold">${escapeHTML(h.HoTen)}</td>${mdInputs}
                <td><input type="text" class="form-control form-control-sm text-center fw-bold bg-light" id="tk_${escapeHTML(h.MaHV)}" value="${h.TongKet || ''}" readonly></td>
                <td><span class="badge ${h.XepLoai==='Không đạt'?'bg-danger':'bg-success'}" id="xl_${escapeHTML(h.MaHV)}">${escapeHTML(h.XepLoai || '')}</span></td>
                <td><button class="btn btn-sm btn-primary w-100" onclick="saveDiem('${escapeHTML(h.MaHV)}', ${soMd})"><i class="fas fa-save"></i></button></td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

window.tinhDiemRow = function(maHv, soMd) {
    let tong = 0, count = 0, coDiemLiet = false;
    for(let i=1; i<=soMd; i++) {
        const input = document.querySelector(`input[data-hv="${maHv}"][data-md="${i}"]`);
        if(input && input.value !== '') {
            const d = parseFloat(input.value);
            tong += d; count++;
            if(d < 5.0) coDiemLiet = true;
        }
    }
    const txtTk = document.getElementById(`tk_${maHv}`);
    const badgeXl = document.getElementById(`xl_${maHv}`);
    const row = document.getElementById(`row_${maHv}`);

    if(count === soMd) {
        const tk = (tong / soMd).toFixed(1);
        txtTk.value = tk;
        let xeploai = '';
        row.classList.remove('table-danger');

        if(coDiemLiet) { xeploai = 'Không đạt'; row.classList.add('table-danger'); badgeXl.className = 'badge bg-danger'; }
        else {
            const d = parseFloat(tk);
            if(d >= 9.0) xeploai = 'Xuất sắc'; else if(d >= 8.0) xeploai = 'Giỏi'; else if(d >= 7.0) xeploai = 'Khá'; else if(d >= 5.0) xeploai = 'Trung bình'; else xeploai = 'Không đạt';
            badgeXl.className = xeploai === 'Không đạt' ? 'badge bg-danger' : 'badge bg-success';
        }
        badgeXl.innerText = xeploai;
    } else {
        txtTk.value = ''; badgeXl.innerText = ''; row.classList.remove('table-danger');
    }
}

window.saveDiem = async function(maHv, soMd) {
    const dataToSave = { MaHV: maHv };
    for(let i=1; i<=soMd; i++) {
        const input = document.querySelector(`input[data-hv="${maHv}"][data-md="${i}"]`);
        dataToSave[`DiemMD${i}`] = input.value !== '' ? parseFloat(input.value) : null;
    }
    dataToSave.TongKet = document.getElementById(`tk_${maHv}`).value !== '' ? parseFloat(document.getElementById(`tk_${maHv}`).value) : null;
    dataToSave.XepLoai = document.getElementById(`xl_${maHv}`).innerText !== '' ? document.getElementById(`xl_${maHv}`).innerText : null;

    const { error } = await supabase.rpc('admin_save_hocvien', { p_token: currentToken, p_mode: 'edit', p_data: dataToSave });

    if(error) alert("Lỗi lưu điểm");
    else {
        const btn = document.querySelector(`#row_${maHv} .btn-primary`);
        btn.classList.replace('btn-primary', 'btn-success'); btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => { btn.classList.replace('btn-success', 'btn-primary'); btn.innerHTML = '<i class="fas fa-save"></i>'; }, 1500);
    }
}

// ---- DANH MỤC HỆ THỐNG ----
function loadDanhMuc() {
    const tbNghe = document.getElementById('tblNgheDaoTao');
    tbNghe.innerHTML = '';
    cachedNghe.forEach(n => {
        tbNghe.innerHTML += `<tr><td>${n.MaNghe}</td><td>${escapeHTML(n.TenNghe)}</td><td>${n.SoMoDun}</td></tr>`;
    });

    const tbDt = document.getElementById('tblDoiTuong');
    tbDt.innerHTML = '';
    cachedDoiTuong.forEach(d => {
        tbDt.innerHTML += `<tr><td>${d.MaDoiTuong}</td><td>${escapeHTML(d.TenDoiTuong)}</td></tr>`;
    });
}
