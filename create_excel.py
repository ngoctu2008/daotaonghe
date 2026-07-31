import pandas as pd

# 1. Sheet: TaiKhoan
df_taikhoan = pd.DataFrame({
    'Username': ['admin', 'giaovu1', 'gv_tuan'],
    'Password': ['123456', '123456', '123456'],
    'Role': ['Admin', 'GiaoVu', 'GiaoVien'],
    'HoTen': ['Quản trị viên', 'Nguyễn Giáo Vụ', 'Trần Tuấn (GVCN)']
})

# 2. Sheet: KhoaHoc
df_khoahoc = pd.DataFrame(columns=[
    'CourseID', 'TenNghe', 'MaGV', 'TrangThai', 'NgayKG', 'NgayBG',
    'NamDaoTao', 'SoNgayThucHoc', 'DiaDiem', 'QD_MoLop', 'QD_TotNghiep'
])
# Add a sample course
df_khoahoc.loc[0] = ['KH_12345', 'Trồng và chăm sóc cà phê', 'gv_tuan', 'Đã duyệt', '2024-08-01', '2024-10-01', '2024', 60, 'Xã A, Huyện B, Tỉnh C', '01/QĐ-UBND', '']

# 3. Sheet: HocVien
# Note: Ensure this EXACTLY matches the order in _mapStudentToArray in Code.gs
df_hocvien = pd.DataFrame(columns=[
    'CourseID', 'HoTen', 'NgaySinh', 'GioiTinh', 'CCCD', 'SoDienThoai', 'Email',
    'DoiTuong', 'DanToc', 'TonGiao', 'TrinhDo',
    'QueQuan', 'NoiSinh', 'ThuongTru', 'TamTru',
    'TenCha', 'NgheCha', 'TenMe', 'NgheMe', 'TenVoChong', 'NgheVoChong',
    'NgayDangKy'
])

# 4. Sheet: DanhSachNghe
df_nghe = pd.DataFrame({
    'TenNghe': [
        'Trồng và chăm sóc cà phê',
        'Vận hành, sửa chữa máy nông nghiệp',
        'Nuôi và phòng trị bệnh cho trâu, bò',
        'May công nghiệp',
        'Kỹ thuật hàn'
    ]
})

# 5. Sheet: DoiTuong
df_doituong = pd.DataFrame({
    'DoiTuong': [
        'Hộ nghèo',
        'Hộ cận nghèo',
        'Dân tộc thiểu số',
        'Bộ đội xuất ngũ',
        'Người khuyết tật',
        'Lao động nông thôn'
    ]
})

# 6. Sheet: CauHinh
df_cauhinh = pd.DataFrame({
    'Key': ['DonXinHoc_TemplateID', 'DanhSachLop_TemplateID', 'ExportFolderID'],
    'Value': ['[ID file mẫu đơn xin học]', '[ID file mẫu danh sách lớp]', '[ID folder chứa file xuất]'],
    'GhiChu': ['Dán ID file docs vào đây', 'Dán ID file docs vào đây', 'Dán ID thư mục vào đây']
})

# Write all to one Excel file
with pd.ExcelWriter('/app/gas_project/CSDL_DaoTaoNghe_Template.xlsx', engine='openpyxl') as writer:
    df_taikhoan.to_excel(writer, sheet_name='TaiKhoan', index=False)
    df_khoahoc.to_excel(writer, sheet_name='KhoaHoc', index=False)
    df_hocvien.to_excel(writer, sheet_name='HocVien', index=False)
    df_nghe.to_excel(writer, sheet_name='DanhSachNghe', index=False)
    df_doituong.to_excel(writer, sheet_name='DoiTuong', index=False)
    df_cauhinh.to_excel(writer, sheet_name='CauHinh', index=False)

print("Đã tạo file Excel thành công!")
