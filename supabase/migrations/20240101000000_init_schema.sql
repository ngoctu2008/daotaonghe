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
-- ROW LEVEL SECURITY (RLS) - FIX: DENY ALL DIRECT API ACCESS
-- ==========================================
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE UserSessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE DoiTuong ENABLE ROW LEVEL SECURITY;
ALTER TABLE Nghedaotao ENABLE ROW LEVEL SECURITY;
ALTER TABLE Khoahoc ENABLE ROW LEVEL SECURITY;
ALTER TABLE Hocvien ENABLE ROW LEVEL SECURITY;
ALTER TABLE ThongBao ENABLE ROW LEVEL SECURITY;
ALTER TABLE CauHinh ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Select CauHinh" ON CauHinh FOR SELECT USING (true);


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


-- Hàm tạo user
CREATE OR REPLACE FUNCTION create_user(p_username VARCHAR, p_hoten VARCHAR, p_role VARCHAR, p_password VARCHAR)
RETURNS json AS $$
DECLARE
    v_salt TEXT;
    v_hash TEXT;
BEGIN
    v_salt := encode(gen_random_bytes(16), 'hex');
    v_hash := encode(digest(p_password || v_salt, 'sha256'), 'hex');

    INSERT INTO Users (Username, HoTen, Role, TrangThai, MatKhauHash, Salt)
    VALUES (p_username, p_hoten, p_role, 'Hoạt động', v_hash, v_salt);

    RETURN json_build_object('success', true, 'message', 'Tạo tài khoản thành công');
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'message', 'Tên đăng nhập đã tồn tại');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
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

    IF NOT FOUND THEN RETURN json_build_object('success', false, 'message', 'Tài khoản không tồn tại'); END IF;
    IF v_user.TrangThai <> 'Hoạt động' THEN RETURN json_build_object('success', false, 'message', 'Tài khoản đang bị khóa'); END IF;

    v_computed_hash := encode(digest(p_password || v_user.Salt, 'sha256'), 'hex');

    IF v_computed_hash = v_user.MatKhauHash THEN
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


-- ==== SECURE READ RPCS (PASCALCASE ALIASES FOR JSON OUTPUT) ====

-- Admin & GV: Đọc danh sách khóa học
CREATE OR REPLACE FUNCTION get_khoahoc(p_token TEXT)
RETURNS json AS $$
DECLARE
    v_username VARCHAR;
    v_role VARCHAR;
    v_result json;
BEGIN
    v_username := verify_token(p_token);
    IF v_username IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    SELECT Role INTO v_role FROM Users WHERE Username = v_username;

    WITH QueryKhoa AS (
        SELECT k.MaKhoa as "MaKhoa", k.TenKhoa as "TenKhoa", k.MaNghe as "MaNghe", k.GVCN_Email as "GVCN_Email",
               k.TrangThai as "TrangThai", k.DiaDiemDaoTao as "DiaDiemDaoTao", k.TuNgay as "TuNgay", k.DenNgay as "DenNgay",
               (SELECT row_to_json(n) FROM (SELECT MaNghe as "MaNghe", TenNghe as "TenNghe", SoMoDun as "SoMoDun" FROM Nghedaotao WHERE MaNghe = k.MaNghe) n) as "Nghedaotao",
               (SELECT COALESCE(json_agg(row_to_json(h)), '[]') FROM (SELECT MaHV as "MaHV", TrangThaiDuyet as "TrangThaiDuyet" FROM Hocvien WHERE MaKhoa = k.MaKhoa) h) as "Hocvien"
        FROM Khoahoc k
        WHERE (v_role <> 'Giáo viên' OR k.GVCN_Email = v_username)
        ORDER BY k.MaKhoa DESC
    )
    SELECT json_agg(row_to_json(t)) INTO v_result FROM QueryKhoa t;

    RETURN json_build_object('success', true, 'data', COALESCE(v_result, '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Admin & GV: Đọc danh sách học viên
CREATE OR REPLACE FUNCTION get_hocvien(p_token TEXT, p_makhoa TEXT DEFAULT NULL, p_ttduyet TEXT DEFAULT NULL)
RETURNS json AS $$
DECLARE
    v_username VARCHAR;
    v_role VARCHAR;
    v_result json;
BEGIN
    v_username := verify_token(p_token);
    IF v_username IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    SELECT Role INTO v_role FROM Users WHERE Username = v_username;

    WITH QueryHocVien AS (
        SELECT h.MaHV as "MaHV", h.MaKhoa as "MaKhoa", h.HoTen as "HoTen", h.GioiTinh as "GioiTinh",
               h.NgaySinh as "NgaySinh", h.SoCC as "SoCC", h.Dienthoai as "Dienthoai", h.TrangThaiDuyet as "TrangThaiDuyet",
               h.MaDoiTuong as "MaDoiTuong", h.ViecLamSauDaoTao as "ViecLamSauDaoTao",
               h.DiemMD1 as "DiemMD1", h.DiemMD2 as "DiemMD2", h.DiemMD3 as "DiemMD3", h.DiemMD4 as "DiemMD4",
               h.DiemMD5 as "DiemMD5", h.TongKet as "TongKet", h.XepLoai as "XepLoai",
               (SELECT row_to_json(dt) FROM (SELECT TenDoiTuong as "TenDoiTuong" FROM DoiTuong WHERE MaDoiTuong = h.MaDoiTuong) dt) as "DoiTuong"
        FROM Hocvien h
        WHERE
            (p_makhoa = '' OR p_makhoa IS NULL OR h.MaKhoa = p_makhoa) AND
            (p_ttduyet = '' OR p_ttduyet IS NULL OR h.TrangThaiDuyet = p_ttduyet) AND
            (v_role <> 'Giáo viên' OR EXISTS (SELECT 1 FROM Khoahoc k2 WHERE k2.MaKhoa = h.MaKhoa AND k2.GVCN_Email = v_username))
        ORDER BY h.MaHV ASC
    )
    SELECT json_agg(row_to_json(t)) INTO v_result FROM QueryHocVien t;

    RETURN json_build_object('success', true, 'data', COALESCE(v_result, '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Thống kê Dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_token TEXT)
RETURNS json AS $$
DECLARE
    v_username VARCHAR;
    c_lop INT; c_hv INT; c_cho INT; c_tn INT;
BEGIN
    v_username := verify_token(p_token);
    IF v_username IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    SELECT COUNT(*) INTO c_lop FROM Khoahoc;
    SELECT COUNT(*) INTO c_hv FROM Hocvien WHERE TrangThaiDuyet = 'Đã duyệt';
    SELECT COUNT(*) INTO c_cho FROM Hocvien WHERE TrangThaiDuyet = 'Chờ duyệt';
    SELECT COUNT(*) INTO c_tn FROM Hocvien WHERE XepLoai IS NOT NULL AND XepLoai <> 'Không đạt';

    RETURN json_build_object('success', true, 'data', json_build_object('cLop', c_lop, 'cHv', c_hv, 'cCho', c_cho, 'cTn', c_tn));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Đọc Thông báo
CREATE OR REPLACE FUNCTION get_thongbao(p_token TEXT)
RETURNS json AS $$
DECLARE
    v_username VARCHAR;
    v_role VARCHAR;
    v_result json;
BEGIN
    v_username := verify_token(p_token);
    IF v_username IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;
    SELECT Role INTO v_role FROM Users WHERE Username = v_username;

    WITH QueryThongBao AS (
        SELECT MaTB as "MaTB", NoiDung as "NoiDung", DaDoc as "DaDoc", ThoiGian as "ThoiGian"
        FROM ThongBao
        WHERE v_role <> 'Giáo viên' OR NguoiNhan = v_username
        ORDER BY ThoiGian DESC LIMIT 10
    )
    SELECT json_agg(row_to_json(t)) INTO v_result FROM QueryThongBao t;
    RETURN json_build_object('success', true, 'data', COALESCE(v_result, '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Cache Data cho form
CREATE OR REPLACE FUNCTION get_cache_data(p_token TEXT)
RETURNS json AS $$
DECLARE
    v_username VARCHAR;
    v_nghe json; v_dt json; v_users json;
BEGIN
    v_username := verify_token(p_token);
    IF v_username IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    SELECT COALESCE(json_agg(row_to_json(n)), '[]') INTO v_nghe FROM (SELECT MaNghe as "MaNghe", TenNghe as "TenNghe", SoMoDun as "SoMoDun" FROM Nghedaotao) n;
    SELECT COALESCE(json_agg(row_to_json(d)), '[]') INTO v_dt FROM (SELECT MaDoiTuong as "MaDoiTuong", TenDoiTuong as "TenDoiTuong" FROM DoiTuong) d;
    SELECT COALESCE(json_agg(row_to_json(u)), '[]') INTO v_users FROM (SELECT Username as "Username", HoTen as "HoTen", Role as "Role" FROM Users) u;

    RETURN json_build_object('success', true, 'data', json_build_object('Nghedaotao', v_nghe, 'DoiTuong', v_dt, 'Users', v_users));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==== PUBLIC READ/WRITE (Dành cho Form Đăng Ký - Không cần Token) ====

-- Lấy danh sách Khóa đang tuyển sinh (Ẩn hết PII GVCN)
CREATE OR REPLACE FUNCTION public_get_khoatuyensinh()
RETURNS json AS $$
DECLARE
    v_result json;
BEGIN
    WITH QueryPublic AS (
        SELECT MaKhoa as "MaKhoa", TenKhoa as "TenKhoa" FROM Khoahoc WHERE TrangThai = 'Tuyển sinh' ORDER BY MaKhoa DESC
    )
    SELECT COALESCE(json_agg(row_to_json(t)), '[]') INTO v_result FROM QueryPublic t;
    RETURN json_build_object('success', true, 'data', v_result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lấy danh sách Đối tượng
CREATE OR REPLACE FUNCTION public_get_doituong()
RETURNS json AS $$
DECLARE
    v_result json;
BEGIN
    WITH QueryPublicDt AS (
        SELECT MaDoiTuong as "MaDoiTuong", TenDoiTuong as "TenDoiTuong" FROM DoiTuong ORDER BY MaDoiTuong ASC
    )
    SELECT COALESCE(json_agg(row_to_json(t)), '[]') INTO v_result FROM QueryPublicDt t;
    RETURN json_build_object('success', true, 'data', v_result);
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
    v_role VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;
    SELECT Role INTO v_role FROM Users WHERE Username = v_user;
    IF v_role NOT IN ('Ban Giám đốc', 'Giáo vụ') THEN RETURN json_build_object('success', false, 'message', 'Forbidden'); END IF;

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
    v_role VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;
    SELECT Role INTO v_role FROM Users WHERE Username = v_user;
    IF v_role NOT IN ('Ban Giám đốc', 'Giáo vụ') THEN RETURN json_build_object('success', false, 'message', 'Forbidden'); END IF;

    DELETE FROM Khoahoc WHERE MaKhoa = p_makhoa;
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_save_hocvien(p_token TEXT, p_mode TEXT, p_data jsonb)
RETURNS json AS $$
DECLARE
    v_user VARCHAR;
    v_role VARCHAR;
    v_makhoa VARCHAR;
    v_gvcn VARCHAR;
    v_new_sott INT;
    v_new_mahv VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;

    SELECT Role INTO v_role FROM Users WHERE Username = v_user;

    IF p_mode = 'add' THEN
        v_makhoa := p_data->>'MaKhoa';

        -- RBAC
        IF v_role = 'Giáo viên' THEN
            SELECT GVCN_Email INTO v_gvcn FROM Khoahoc WHERE MaKhoa = v_makhoa;
            IF v_gvcn <> v_user THEN
                RETURN json_build_object('success', false, 'message', 'Forbidden: Not your course');
            END IF;
        END IF;

        LOCK TABLE Hocvien IN EXCLUSIVE MODE;
        SELECT COALESCE(MAX(CAST(SUBSTRING(MaHV FROM LENGTH(v_makhoa) + 2) AS INT)), 0) + 1 INTO v_new_sott FROM Hocvien WHERE MaKhoa = v_makhoa;
        v_new_mahv := v_makhoa || '-' || LPAD(v_new_sott::TEXT, 2, '0');

        INSERT INTO Hocvien (
            MaHV, MaKhoa, HoTen, GioiTinh, NgaySinh, SoCC, Dienthoai, MaDoiTuong,
            ViecLamSauDaoTao, TrangThaiDuyet
        ) VALUES (
            v_new_mahv, v_makhoa, p_data->>'HoTen', p_data->>'GioiTinh', CAST(NULLIF(p_data->>'NgaySinh', '') AS DATE),
            p_data->>'SoCC', p_data->>'Dienthoai', CAST(NULLIF(p_data->>'MaDoiTuong', '') AS INT),
            p_data->>'ViecLamSauDaoTao', COALESCE(p_data->>'TrangThaiDuyet', 'Đã duyệt')
        );

    ELSIF p_mode = 'edit' THEN
        SELECT MaKhoa INTO v_makhoa FROM Hocvien WHERE MaHV = p_data->>'MaHV';

        IF v_role = 'Giáo viên' THEN
            SELECT GVCN_Email INTO v_gvcn FROM Khoahoc WHERE MaKhoa = v_makhoa;
            IF v_gvcn <> v_user THEN
                RETURN json_build_object('success', false, 'message', 'Forbidden: Not your course');
            END IF;
        END IF;

        UPDATE Hocvien SET
            HoTen = COALESCE(p_data->>'HoTen', HoTen),
            TrangThaiDuyet = COALESCE(p_data->>'TrangThaiDuyet', TrangThaiDuyet),
            GioiTinh = COALESCE(p_data->>'GioiTinh', GioiTinh),
            Dienthoai = COALESCE(p_data->>'Dienthoai', Dienthoai),
            SoCC = COALESCE(p_data->>'SoCC', SoCC),
            MaDoiTuong = CASE WHEN p_data->>'MaDoiTuong' IS NOT NULL THEN CAST(p_data->>'MaDoiTuong' AS INT) ELSE MaDoiTuong END,
            ViecLamSauDaoTao = COALESCE(p_data->>'ViecLamSauDaoTao', ViecLamSauDaoTao),
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
    v_role VARCHAR;
BEGIN
    v_user := verify_token(p_token);
    IF v_user IS NULL THEN RETURN json_build_object('success', false, 'message', 'Unauthorized'); END IF;
    SELECT Role INTO v_role FROM Users WHERE Username = v_user;
    IF v_role NOT IN ('Ban Giám đốc', 'Giáo vụ') THEN RETURN json_build_object('success', false, 'message', 'Forbidden'); END IF;

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
-- INIT DATA & DỮ LIỆU MẪU
-- ==========================================
INSERT INTO CauHinh (ConfigKey, ConfigValue) VALUES
('LogoUrl', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Logo_BGD%C4%90T.svg/200px-Logo_BGD%C4%90T.svg.png'),
('TenSite', 'Hệ thống Quản lý Đào tạo Nghề'),
('ChanTrang', '© 2024 Trung tâm GDNN-GDTX khu vực Đăk Hà'),
('MauChuDao', '#004085');

-- 1. Tài khoản (Mật khẩu mặc định là: 123456)
SELECT create_user('admin', 'Ban Giám Đốc Trung Tâm', 'Ban Giám đốc', 'admin123');
SELECT create_user('giaovu1', 'Nguyễn Thị Giáo Vụ', 'Giáo vụ', '123456');
SELECT create_user('gv_nam', 'Trần Văn Nam', 'Giáo viên', '123456');
SELECT create_user('gv_ha', 'Lê Thị Hà', 'Giáo viên', '123456');

-- 2. Đối tượng chính sách
INSERT INTO DoiTuong (TenDoiTuong, ChinhSach, GhiChu) VALUES
('Người khuyết tật', 'Hỗ trợ 100% học phí, 30.000đ/ngày ăn', 'Kèm giấy xác nhận khuyết tật'),
('Dân tộc thiểu số', 'Hỗ trợ 100% học phí, 30.000đ/ngày ăn', 'Bản sao CCCD'),
('Hộ nghèo / Cận nghèo', 'Hỗ trợ 100% học phí, 30.000đ/ngày ăn', 'Giấy chứng nhận hộ nghèo'),
('Bộ đội xuất ngũ', 'Hỗ trợ theo thẻ học nghề', 'Thẻ học nghề còn hạn');

-- 3. Ngành nghề đào tạo
INSERT INTO Nghedaotao (TenNghe, LoaiHinh, SoMoDun, ThoiGianDaoTao, SoGioDaoTao) VALUES
('Nề - Hoàn thiện', 'Sơ cấp', 5, 3, 300),
('Khai thác mủ cao su', 'Dưới 3 tháng', 3, 2, 200),
('Sửa chữa máy nông nghiệp', 'Sơ cấp', 4, 3, 250),
('Trồng và chăm sóc sầu riêng', 'Dưới 3 tháng', 2, 1, 100);

-- 4. Khóa học / Lớp học mẫu
INSERT INTO Khoahoc (MaKhoa, TenKhoa, MaNghe, GVCN_Email, TrangThai, DiaDiemDaoTao, TuNgay, DenNgay) VALUES
('K2026-001', 'Lớp Nề hoàn thiện - Thôn 1', 1, 'gv_nam', 'Đang đào tạo', 'Hội trường Thôn 1, xã Đăk Ui', '2026-01-10', '2026-04-10'),
('K2026-002', 'Lớp Cao su - Xã Ngọc Réo', 2, 'gv_ha', 'Tuyển sinh', 'UBND xã Ngọc Réo', NULL, NULL);

-- 5. Học viên mẫu
INSERT INTO Hocvien (MaHV, MaKhoa, HoTen, GioiTinh, NgaySinh, SoCC, NoiCC, DanToc, TonGiao, TrinhDoVH, HKTT, NoiCuTru, Dienthoai, MaDoiTuong, ViecLamSauDaoTao, TrangThaiDuyet, DiemMD1, DiemMD2, DiemMD3, DiemMD4, DiemMD5, TongKet, XepLoai) VALUES
('K2026-001-01', 'K2026-001', 'A THAO', 'Nam', '2000-05-15', '064000123456', 'Cục CS QLHC', 'Xơ Đăng', 'Không', 'THCS', 'Thôn 1, Đăk Ui', 'Thôn 1, Đăk Ui', '0912345678', 2, 'Tự tạo việc làm', 'Đã duyệt', 7.5, 8.0, 7.0, 8.5, 8.0, 7.8, 'Khá'),
('K2026-001-02', 'K2026-001', 'Y MLINH', 'Nữ', '2001-10-20', '064000654321', 'Cục CS QLHC', 'Xơ Đăng', 'Không', 'Tiểu học', 'Thôn 1, Đăk Ui', 'Thôn 1, Đăk Ui', '0987654321', 2, 'Được ký hợp đồng lao động', 'Đã duyệt', 4.5, 6.0, 5.5, 6.0, 5.0, 5.4, 'Không đạt'),
('K2026-001-03', 'K2026-001', 'NGUYỄN VĂN BÌNH', 'Nam', '1995-02-28', '064000111222', 'Kon Tum', 'Kinh', 'Không', 'THPT', 'Thôn 2, Đăk Ui', 'Thôn 2, Đăk Ui', '0909112233', NULL, 'Được doanh nghiệp, đơn vị bao tiêu sản phẩm', 'Đã duyệt', 9.0, 9.5, 8.5, 9.0, 9.0, 9.0, 'Xuất sắc');

INSERT INTO Hocvien (MaHV, MaKhoa, HoTen, GioiTinh, NgaySinh, SoCC, NoiCC, DanToc, TonGiao, TrinhDoVH, HKTT, NoiCuTru, Dienthoai, MaDoiTuong, ViecLamSauDaoTao, TrangThaiDuyet) VALUES
('K2026-002-01', 'K2026-002', 'LÊ THỊ HOA', 'Nữ', '1998-12-05', '064000333444', 'Kon Tum', 'Kinh', 'Không', 'THPT', 'Xã Ngọc Réo', 'Xã Ngọc Réo', '0977889900', 3, 'Đi làm việc có thời hạn ở nước ngoài', 'Chờ duyệt'),
('K2026-002-02', 'K2026-002', 'A TEO', 'Nam', '2003-08-14', '064000555666', 'Cục CS QLHC', 'Ba Na', 'Không', 'Chưa qua đào tạo', 'Xã Ngọc Réo', 'Xã Ngọc Réo', '0933445566', 2, 'Tự tạo việc làm', 'Chờ duyệt');

-- 6. Thông báo mẫu
INSERT INTO ThongBao (NguoiNhan, NoiDung, MaKhoa, DaDoc) VALUES
('admin', 'Hệ thống đã được khởi tạo thành công cùng với dữ liệu mẫu.', NULL, FALSE),
('gv_ha', 'Học viên mới: LÊ THỊ HOA vừa đăng ký lớp K2026-002. Vui lòng kiểm tra.', 'K2026-002', FALSE),
('gv_ha', 'Học viên mới: A TEO vừa đăng ký lớp K2026-002. Vui lòng kiểm tra.', 'K2026-002', FALSE);
