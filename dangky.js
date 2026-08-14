import { supabase } from './supabase-client.js';

// DOM Elements
const loader = document.getElementById('loader');
const frmDangKy = document.getElementById('frmDangKy');
const cboMaKhoa = document.getElementById('MaKhoa');
const cboMaDoiTuong = document.getElementById('MaDoiTuong');
const msgAlert = document.getElementById('msgAlert');

// On Page Load
document.addEventListener('DOMContentLoaded', async () => {
    showLoader();
    try {
        await Promise.all([loadConfig(), loadKhoaHoc(), loadDoiTuong()]);

        // Auto select MaKhoa if passed via URL parameter (e.g. from QR code: ?makhoa=K2026-001)
        const urlParams = new URLSearchParams(window.location.search);
        const urlMaKhoa = urlParams.get('makhoa');
        if(urlMaKhoa) {
            cboMaKhoa.value = urlMaKhoa;
        }

    } catch (error) {
        console.error("Lỗi khởi tạo:", error);
        showAlert('Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau!', 'danger');
    } finally {
        hideLoader();
    }
});

// Load App Config
async function loadConfig() {
    const { data, error } = await supabase.from('CauHinh').select('*');
    if (error) throw error;

    let config = {};
    data.forEach(item => config[item.ConfigKey] = item.ConfigValue);

    if(config['LogoUrl']) document.getElementById('site-logo').src = config['LogoUrl'];
    if(config['TenSite']) document.getElementById('site-title').innerText = config['TenSite'];
    if(config['ChanTrang']) document.getElementById('footer-text').innerText = config['ChanTrang'];

    if(config['MauChuDao']) {
        document.documentElement.style.setProperty('--primary-color', config['MauChuDao']);
    }
}

// Load Active Courses
async function loadKhoaHoc() {
    // Lấy các khóa đang "Tuyển sinh"
    const { data, error } = await supabase
        .from('Khoahoc')
        .select('MaKhoa, TenKhoa')
        .eq('TrangThai', 'Tuyển sinh')
        .order('MaKhoa', { ascending: false });

    if (error) throw error;

    cboMaKhoa.innerHTML = '<option value="">-- Chọn lớp đăng ký --</option>';
    data.forEach(khoa => {
        const option = document.createElement('option');
        option.value = khoa.MaKhoa;
        option.textContent = `${khoa.TenKhoa} (${khoa.MaKhoa})`;
        cboMaKhoa.appendChild(option);
    });
}

// Load Policy Targets
async function loadDoiTuong() {
    const { data, error } = await supabase
        .from('DoiTuong')
        .select('MaDoiTuong, TenDoiTuong')
        .order('MaDoiTuong', { ascending: true });

    if (error) throw error;

    data.forEach(dt => {
        const option = document.createElement('option');
        option.value = dt.MaDoiTuong;
        option.textContent = dt.TenDoiTuong;
        cboMaDoiTuong.appendChild(option);
    });
}

// Handle Form Submit
frmDangKy.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();

    try {
        // Prepare Data for RPC
        const hocVienData = {
            MaKhoa: document.getElementById('MaKhoa').value,
            HoTen: document.getElementById('HoTen').value.toUpperCase(),
            GioiTinh: document.querySelector('input[name="GioiTinh"]:checked').value,
            NgaySinh: document.getElementById('NgaySinh').value,
            SoCC: document.getElementById('SoCC').value,
            NgayCC: document.getElementById('NgayCC').value || null,
            NoiCC: document.getElementById('NoiCC').value,
            DanToc: document.getElementById('DanToc').value,
            TonGiao: document.getElementById('TonGiao').value,
            TrinhDoVH: document.getElementById('TrinhDoVH').value,
            HKTT: document.getElementById('HKTT').value,
            NoiCuTru: document.getElementById('NoiCuTru').value,
            Dienthoai: document.getElementById('Dienthoai').value,
            MaDoiTuong: document.getElementById('MaDoiTuong').value ? parseInt(document.getElementById('MaDoiTuong').value) : null,
            ViecLamSauDaoTao: document.getElementById('ViecLamDuKien').value
        };

        // Call Secure RPC to handle registration and ID generation atomically
        const { data, error } = await supabase.rpc('register_hocvien', { p_data: hocVienData });

        if(error) throw error;
        if(!data.success) throw new Error(data.message || 'Lỗi không xác định');

        // Success
        frmDangKy.reset();
        showAlert(`Đăng ký thành công! Mã hồ sơ của bạn là: <strong>${data.mahv}</strong>. Trung tâm sẽ liên hệ lại sớm nhất.`, 'success');

        // Scroll to alert
        msgAlert.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        showAlert('Có lỗi xảy ra trong quá trình đăng ký: ' + error.message, 'danger');
    } finally {
        hideLoader();
    }
});

// Utilities
function showLoader() { loader.style.display = 'flex'; }
function hideLoader() { loader.style.display = 'none'; }
function showAlert(message, type) {
    msgAlert.innerHTML = message;
    msgAlert.className = `alert alert-${type} mt-3`;
    msgAlert.classList.remove('d-none');
}
