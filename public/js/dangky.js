

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

        // Auto select MaKhoa if passed via URL parameter
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
    const supabaseMod = await import('./supabase-client.js');
    const { data, error } = await supabaseMod.supabase.from('CauHinh').select('*');
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

// Load Active Courses using Public RPC
async function loadKhoaHoc() {
    const supabaseMod = await import('./supabase-client.js');
    const { data, error } = await supabaseMod.supabase.rpc('public_get_khoatuyensinh');

    if (error) throw error;
    if (!data.success) throw new Error("Lỗi tải danh sách khóa học");

    cboMaKhoa.innerHTML = '<option value="">-- Chọn lớp đăng ký --</option>';
    data.data.forEach(khoa => {
        const option = document.createElement('option');
        option.value = khoa.MaKhoa;
        option.textContent = `${khoa.TenKhoa} (${khoa.MaKhoa})`;
        cboMaKhoa.appendChild(option);
    });
}

// Load Policy Targets using Public RPC
async function loadDoiTuong() {
    const supabaseMod = await import('./supabase-client.js');
    const { data, error } = await supabaseMod.supabase.rpc('public_get_doituong');

    if (error) throw error;
    if (!data.success) throw new Error("Lỗi tải danh sách đối tượng");

    data.data.forEach(dt => {
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

        const supabaseMod = await import('./supabase-client.js');
        const { data, error } = await supabaseMod.supabase.rpc('register_hocvien', { p_data: hocVienData });

        if(error) throw error;
        if(!data.success) throw new Error(data.message || 'Lỗi không xác định');

        frmDangKy.reset();
        showAlert(`Đăng ký thành công! Mã hồ sơ của bạn là: <strong>${data.mahv}</strong>. Trung tâm sẽ liên hệ lại sớm nhất.`, 'success');
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
