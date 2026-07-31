# Hướng dẫn Cài đặt Hệ thống Quản lý Đào tạo Nghề
*(Phiên bản mới nhất - UI Hiện đại & Tự động hóa file CSDL)*

Để tiết kiệm thời gian và tránh việc tạo nhầm cấu trúc cột, tôi đã chuẩn bị sẵn một file Excel có tên `CSDL_DaoTaoNghe_Template.xlsx` đi kèm với mã nguồn. Bạn chỉ cần làm theo các bước dưới đây:

---

## Bước 1: Chuẩn bị Thư mục và File mẫu trên Google Drive

1. Truy cập vào [Google Drive](https://drive.google.com).
2. Tạo một thư mục mới: `QuanLyDaoTaoNghe`.
3. Trong thư mục này, tạo một thư mục con: `HoSoXuatRa`.
4. Tải các file mẫu `.doc` / `.docx` lên thư mục `QuanLyDaoTaoNghe`.
5. **Rất Quan trọng:** Mở các file Word đó trên Google Drive và chọn **Lưu dưới dạng Google Tài liệu (Save as Google Docs)**. Hệ thống tạo file tự động chỉ hoạt động với định dạng Google Docs.
6. Trong các file mẫu Google Docs, chèn các **thẻ từ khóa (tags)** vào vị trí cần điền dữ liệu. Ví dụ:
   - `{{TEN_KHOA_HOC}}`
   - `{{NGAY_KHAI_GIANG}}`
   - `{{GIAO_VIEN}}`

---

## Bước 2: Thiết lập Cơ sở dữ liệu bằng File Template

1. Tải file `CSDL_DaoTaoNghe_Template.xlsx` (có sẵn trong thư mục dự án) lên thư mục `QuanLyDaoTaoNghe` trên Google Drive.
2. Click đúp để mở file Excel đó trên trình duyệt.
3. Trên thanh công cụ, chọn **Tệp (File)** -> **Lưu dưới dạng Google Trang tính (Save as Google Sheets)**.
4. Một tab mới sẽ mở ra, đó chính là file cơ sở dữ liệu chính thức của bạn (đã có sẵn các Sheet: `TaiKhoan`, `KhoaHoc`, `HocVien`, `DanhSachNghe`, `DoiTuong`, `CauHinh` với đầy đủ cấu trúc chuẩn).
5. Bạn có thể xóa file Excel gốc (`.xlsx`) để tránh nhầm lẫn, chỉ giữ lại file Google Sheets.
6. Ở Sheet `CauHinh`, bạn hãy lấy ID của các file Docs mẫu và Folder xuất ra để dán vào cột `Value` tương ứng. *(ID là đoạn mã nằm giữa `/d/` và `/edit` trên thanh địa chỉ)*.

---

## Bước 3: Cài đặt mã nguồn và CẤP QUYỀN (Rất quan trọng)

1. Mở file Google Sheets `CSDL_DaoTaoNghe_Template` (bản Google Sheets).
2. Chọn **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
3. Tại giao diện Apps Script:
   - File `Mã.gs` (hoặc `Code.gs`): Dán nội dung từ file `Code.gs` vào.
   - Bấm dấu **+** -> **HTML** -> tạo file tên `Index`. Dán nội dung từ file `Index.html` vào.
   - Bấm dấu **+** -> **HTML** -> tạo file tên `StudentRegister`. Dán nội dung từ file `StudentRegister.html` vào.
4. Bấm **Lưu (Save)**.

### ⚠️ BƯỚC KHẮC PHỤC LỖI DRIVEAPP: XIN QUYỀN TRUY CẬP
*Vì code có chức năng tự động tạo hồ sơ Google Docs, nên Google yêu cầu quyền thao tác Drive.*
1. Tại màn hình `Code.gs`, nhìn lên thanh công cụ phía trên.
2. Ở ô chọn hàm, chọn hàm **`setupPermissions`**.
3. Bấm nút **Chạy (Run)**.
4. Một hộp thoại Yêu cầu cấp quyền sẽ hiện ra.
5. Bấm **Xem lại quyền (Review permissions)** -> Chọn tài khoản Google của bạn -> Bấm **Nâng cao (Advanced)** -> Bấm **Đi tới dự án (Go to... unsafe)** -> Kéo xuống dưới cùng và bấm **Cho phép (Allow)**.
6. Nếu bảng Nhật ký bên dưới hiện chữ `Đã cấp quyền thành công!`, bạn đã hoàn tất.

---

## Bước 4: Triển khai (Deploy) Hệ thống

**Lưu ý:** Mỗi lần bạn sửa code, bạn **BẮT BUỘC** phải tạo phiên bản Deploy mới.
1. Góc trên bên phải, bấm nút **Triển khai (Deploy)** -> **Tùy chọn triển khai mới (New deployment)**.
2. Mục **Chọn loại (Select type)** (biểu tượng bánh răng), chọn **Ứng dụng web (Web app)**.
3. Cấu hình:
   - Tùy chọn thực thi (Execute as): Chọn **Tôi (Me)**.
   - Ai có quyền truy cập (Who has access): Chọn **Bất kỳ ai (Anyone)**.
4. Bấm **Triển khai (Deploy)**.
5. Copy link Web App. Mở link và đăng nhập thử bằng tài khoản: `admin` / `123456`.

Chúc bạn cài đặt thành công! Hệ thống giờ đây đã có giao diện hiện đại mới, bổ sung đầy đủ trường thông tin gia đình/cá nhân, và có sẵn chức năng Admin cấp quyền cho Giáo vụ.