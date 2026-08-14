CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Bảng Users (Người dùng & Phân quyền)
CREATE TABLE Users (
    Username VARCHAR(50) PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    TrangThai VARCHAR(50) DEFAULT 'Hoạt động',
    MatKhauHash TEXT NOT NULL,
    Salt TEXT NOT NULL
);

-- Bảng Session để Custom Auth
CREATE TABLE UserSessions (
    Token TEXT PRIMARY KEY,
    Username VARCHAR(50) REFERENCES Users(Username) ON DELETE CASCADE,
    ExpiresAt TIMESTAMP NOT NULL
);

-- 2. Bảng DoiTuong
CREATE TABLE DoiTuong (
    MaDoiTuong SERIAL PRIMARY KEY,
    TenDoiTuong VARCHAR(150) NOT NULL,
    ChinhSach TEXT,
    GhiChu TEXT
);

-- 3. Bảng Nghedaotao
CREATE TABLE Nghedaotao (
    MaNghe SERIAL PRIMARY KEY,
    TenNghe VARCHAR(200) NOT NULL,
    LoaiHinh VARCHAR(100),
    SoMoDun INT DEFAULT 1,
    ThoiGianDaoTao INT,
    SoGioDaoTao INT
);

-- 4. Bảng Khoahoc
CREATE TABLE Khoahoc (
    MaKhoa VARCHAR(50) PRIMARY KEY,
    TenKhoa VARCHAR(200) NOT NULL,
    MaNghe INT REFERENCES Nghedaotao(MaNghe) ON DELETE SET NULL,
    GVCN_Email VARCHAR(50) REFERENCES Users(Username) ON DELETE SET NULL,
    TrangThai VARCHAR(50) DEFAULT 'Tuyển sinh',
    DiaDiemDaoTao TEXT,
    TuNgay DATE,
    DenNgay DATE
);

-- 5. Bảng Hocvien
CREATE TABLE Hocvien (
    MaHV VARCHAR(50) PRIMARY KEY,
    MaKhoa VARCHAR(50) REFERENCES Khoahoc(MaKhoa) ON DELETE CASCADE,
    HoTen VARCHAR(100) NOT NULL,
    GioiTinh VARCHAR(10),
    NgaySinh DATE,
    TrangThaiDuyet VARCHAR(50) DEFAULT 'Chờ duyệt',
    GhiChu TEXT,
    SoCC VARCHAR(20),
    NgayCC DATE,
    NoiCC TEXT,
    TrinhDoVH VARCHAR(50),
    DanToc VARCHAR(50),
    TonGiao VARCHAR(50),
    HKTT TEXT,
    NguyenQuan TEXT,
    NoiCuTru TEXT,
    Dienthoai VARCHAR(20),
    MaDoiTuong INT REFERENCES DoiTuong(MaDoiTuong) ON DELETE SET NULL,
    ViecLamSauDaoTao VARCHAR(100),
    DiemMD1 NUMERIC(4,1),
    DiemMD2 NUMERIC(4,1),
    DiemMD3 NUMERIC(4,1),
    DiemMD4 NUMERIC(4,1),
    DiemMD5 NUMERIC(4,1),
    TongKet NUMERIC(4,1),
    XepLoai VARCHAR(50)
);

-- 6. Bảng ThongBao
CREATE TABLE ThongBao (
    MaTB SERIAL PRIMARY KEY,
    NguoiNhan VARCHAR(50) REFERENCES Users(Username) ON DELETE CASCADE,
    NoiDung TEXT NOT NULL,
    MaKhoa VARCHAR(50) REFERENCES Khoahoc(MaKhoa) ON DELETE SET NULL,
    DaDoc BOOLEAN DEFAULT FALSE,
    ThoiGian TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng CauHinh
CREATE TABLE CauHinh (
    ConfigKey VARCHAR(50) PRIMARY KEY,
    ConfigValue TEXT
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) - FIX: READ ONLY FOR PUBLIC
-- ==========================================
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE UserSessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE DoiTuong ENABLE ROW LEVEL SECURITY;
ALTER TABLE Nghedaotao ENABLE ROW LEVEL SECURITY;
ALTER TABLE Khoahoc ENABLE ROW LEVEL SECURITY;
ALTER TABLE Hocvien ENABLE ROW LEVEL SECURITY;
ALTER TABLE ThongBao ENABLE ROW LEVEL SECURITY;
ALTER TABLE CauHinh ENABLE ROW LEVEL SECURITY;

-- No Policies for Users and UserSessions (Deny All).
CREATE POLICY "Public Select DoiTuong" ON DoiTuong FOR SELECT USING (true);
CREATE POLICY "Public Select Nghedaotao" ON Nghedaotao FOR SELECT USING (true);
CREATE POLICY "Public Select Khoahoc" ON Khoahoc FOR SELECT USING (true);
CREATE POLICY "Public Select Hocvien" ON Hocvien FOR SELECT USING (true);
CREATE POLICY "Public Select ThongBao" ON ThongBao FOR SELECT USING (true);
CREATE POLICY "Public Select CauHinh" ON CauHinh FOR SELECT USING (true);

-- Cho phép form đăng ký insert public an toàn không cần RPC nếu muốn, nhưng vì ta dùng RPC `register_hocvien`, không cần policy INSERT.


-- ==========================================
-- RPC FUNCTIONS
-- ==========================================

-- Check Token validity internally
CREATE OR REPLACE FUNCTION verify_token(p_token TEXT)
RETURNS VARCHAR AS $$
DECLARE
    v_user VARCHAR;
BEGIN
    SELECT Username INTO v_user FROM UserSessions WHERE Token = p_token AND ExpiresAt > CURRENT_TIMESTAMP;
    RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm RPC Đăng nhập bảo mật (V2) - Có trả về Session Token
CREATE OR REPLACE FUNCTION login_user_v2(p_username VARCHAR, p_password VARCHAR)
RETURNS json AS $$
DECLARE
    v_user RECORD;
    v_computed_hash TEXT;
    v_new_token TEXT;
BEGIN
    SELECT * INTO v_user FROM Users WHERE Username = p_username;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Tài khoản không tồn tại');
    END IF;
    IF v_user.TrangThai <> 'Hoạt động' THEN
        RETURN json_build_object('success', false, 'message', 'Tài khoản đang bị khóa');
    END IF;

    v_computed_hash := encode(digest(p_password || v_user.Salt, 'sha256'), 'hex');

    IF v_computed_hash = v_user.MatKhauHash THEN
        -- Generate Token
        v_new_token := encode(gen_random_bytes(32), 'hex');
        INSERT INTO UserSessions (Token, Username, ExpiresAt) VALUES (v_new_token, v_user.Username, CURRENT_TIMESTAMP + INTERVAL '1 day');

        RETURN json_build_object(
            'success', true,
            'token', v_new_token,
            'user', json_build_object('Username', v_user.Username, 'HoTen', v_user.HoTen, 'Role', v_user.Role)
        );
    ELSE
        RETURN json_build_object('success', false, 'message', 'Sai mật khẩu');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_public_users()
RETURNS TABLE (Username VARCHAR, HoTen VARCHAR, Role VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.Username, u.HoTen, u.Role FROM Users u;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Đăng ký học viên (Public)
CREATE OR REPLACE FUNCTION register_hocvien(p_data jsonb)
RETURNS json AS $$
DECLARE
    v_makhoa VARCHAR;
    v_new_sott INT;
    v_new_mahv VARCHAR;
    v_gvcn VARCHAR;
BEGIN
    v_makhoa := p_data->>'MaKhoa';
    LOCK TABLE Hocvien IN EXCLUSIVE MODE;
    SELECT COALESCE(MAX(CAST(SUBSTRING(MaHV FROM LENGTH(v_makhoa) + 2) AS INT)), 0) + 1 INTO v_new_sott FROM Hocvien WHERE MaKhoa = v_makhoa;
    v_new_mahv := v_makhoa || '-' || LPAD(v_new_sott::TEXT, 2, '0');

    INSERT INTO Hocvien (
        MaHV, MaKhoa, HoTen, GioiTinh, NgaySinh, SoCC, NgayCC, NoiCC,
        DanToc, TonGiao, TrinhDoVH, HKTT, NoiCuTru, Dienthoai, MaDoiTuong,
        ViecLamSauDaoTao, TrangThaiDuyet
    ) VALUES (
        v_new_mahv, v_makhoa, p_data->>'HoTen', p_data->>'GioiTinh', CAST(NULLIF(p_data->>'NgaySinh', '') AS DATE),
        p_data->>'SoCC', CAST(NULLIF(p_data->>'NgayCC', '') AS DATE), p_data->>'NoiCC', p_data->>'DanToc', p_data->>'TonGiao', p_data->>'TrinhDoVH',
        p_data->>'HKTT', p_data->>'NoiCuTru', p_data->>'Dienthoai', CAST(NULLIF(p_data->>'MaDoiTuong', '') AS INT),
        p_data->>'ViecLamSauDaoTao', 'Chờ duyệt'
    );

    SELECT GVCN_Email INTO v_gvcn FROM Khoahoc WHERE MaKhoa = v_makhoa;
    INSERT INTO ThongBao (NguoiNhan, NoiDung, MaKhoa) VALUES (COALESCE(v_gvcn, 'admin'), 'Học viên mới: ' || (p_data->>'HoTen') || ' vừa đăng ký lớp ' || v_makhoa || '. Vui lòng kiểm tra.', v_makhoa);

    RETURN json_build_object('success', true, 'mahv', v_new_mahv);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==== ADMIN SECURE WRITES ====

CREATE OR REPLACE FUNCTION admin_save_khoahoc(p_token TEXT, p_mode TEXT, p_data jsonb)
RETURNS json AS $$
DECLARE
    v_user VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    IF p_mode = 'add' THEN
        INSERT INTO Khoahoc (MaKhoa, TenKhoa, MaNghe, GVCN_Email, TrangThai, DiaDiemDaoTao, TuNgay, DenNgay)
        VALUES (p_data->>'MaKhoa', p_data->>'TenKhoa', CAST(p_data->>'MaNghe' AS INT), NULLIF(p_data->>'GVCN_Email',''), p_data->>'TrangThai', p_data->>'DiaDiemDaoTao', CAST(NULLIF(p_data->>'TuNgay','') AS DATE), CAST(NULLIF(p_data->>'DenNgay','') AS DATE));
    ELSE
        UPDATE Khoahoc SET
            TenKhoa = p_data->>'TenKhoa', MaNghe = CAST(p_data->>'MaNghe' AS INT), GVCN_Email = NULLIF(p_data->>'GVCN_Email',''),
            TrangThai = p_data->>'TrangThai', DiaDiemDaoTao = p_data->>'DiaDiemDaoTao', TuNgay = CAST(NULLIF(p_data->>'TuNgay','') AS DATE), DenNgay = CAST(NULLIF(p_data->>'DenNgay','') AS DATE)
        WHERE MaKhoa = p_data->>'MaKhoa';
    END IF;
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_delete_khoahoc(p_token TEXT, p_makhoa TEXT)
RETURNS json AS $$
DECLARE
    v_user VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    DELETE FROM Khoahoc WHERE MaKhoa = p_makhoa;
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_save_hocvien(p_token TEXT, p_mode TEXT, p_data jsonb)
RETURNS json AS $$
DECLARE
    v_user VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    IF p_mode = 'edit' THEN
        UPDATE Hocvien SET
            HoTen = COALESCE(p_data->>'HoTen', HoTen),
            TrangThaiDuyet = COALESCE(p_data->>'TrangThaiDuyet', TrangThaiDuyet),
            GioiTinh = COALESCE(p_data->>'GioiTinh', GioiTinh),
            Dienthoai = COALESCE(p_data->>'Dienthoai', Dienthoai),
            SoCC = COALESCE(p_data->>'SoCC', SoCC),
            MaDoiTuong = CASE WHEN p_data->>'MaDoiTuong' IS NOT NULL THEN CAST(p_data->>'MaDoiTuong' AS INT) ELSE MaDoiTuong END,
            ViecLamSauDaoTao = COALESCE(p_data->>'ViecLamSauDaoTao', ViecLamSauDaoTao),
            -- Grading fields
            DiemMD1 = CASE WHEN p_data ? 'DiemMD1' THEN CAST(p_data->>'DiemMD1' AS NUMERIC) ELSE DiemMD1 END,
            DiemMD2 = CASE WHEN p_data ? 'DiemMD2' THEN CAST(p_data->>'DiemMD2' AS NUMERIC) ELSE DiemMD2 END,
            DiemMD3 = CASE WHEN p_data ? 'DiemMD3' THEN CAST(p_data->>'DiemMD3' AS NUMERIC) ELSE DiemMD3 END,
            DiemMD4 = CASE WHEN p_data ? 'DiemMD4' THEN CAST(p_data->>'DiemMD4' AS NUMERIC) ELSE DiemMD4 END,
            DiemMD5 = CASE WHEN p_data ? 'DiemMD5' THEN CAST(p_data->>'DiemMD5' AS NUMERIC) ELSE DiemMD5 END,
            TongKet = CASE WHEN p_data ? 'TongKet' THEN CAST(p_data->>'TongKet' AS NUMERIC) ELSE TongKet END,
            XepLoai = CASE WHEN p_data ? 'XepLoai' THEN p_data->>'XepLoai' ELSE XepLoai END
        WHERE MaHV = p_data->>'MaHV';
    END IF;
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_delete_hocvien(p_token TEXT, p_mahv TEXT)
RETURNS json AS $$
DECLARE
    v_user VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    DELETE FROM Hocvien WHERE MaHV = p_mahv;
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_read(p_token TEXT, p_matb INT)
RETURNS json AS $$
DECLARE
    v_user VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    UPDATE ThongBao SET DaDoc = true WHERE MaTB = p_matb;
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- INIT DATA
-- ==========================================
INSERT INTO CauHinh (ConfigKey, ConfigValue) VALUES
('LogoUrl', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Logo_BGD%C4%90T.svg/200px-Logo_BGD%C4%90T.svg.png'),
('TenSite', 'Hệ thống Quản lý Đào tạo Nghề'),
('ChanTrang', '© 2024 Trung tâm GDNN-GDTX khu vực Đăk Hà'),
('MauChuDao', '#004085');

INSERT INTO Users (Username, HoTen, Role, TrangThai, MatKhauHash, Salt)
VALUES ('admin', 'Quản trị viên', 'Ban Giám đốc', 'Hoạt động', encode(digest('admin123' || '1234567890abcdef', 'sha256'), 'hex'), '1234567890abcdef');
