# Hướng dẫn Cài đặt Hệ thống Quản lý Đào tạo Nghề (Google Apps Script)

Vì hệ thống được xây dựng trên nền tảng Google Workspace, bạn cần làm theo các bước dưới đây để thiết lập Cơ sở dữ liệu (Google Sheets), Cấu trúc thư mục (Google Drive) và mã nguồn (Google Apps Script).

---

## Bước 1: Chuẩn bị Thư mục và File mẫu trên Google Drive

1. Truy cập vào [Google Drive](https://drive.google.com).
2. Tạo một thư mục mới, ví dụ đặt tên là: `QuanLyDaoTaoNghe`.
3. Trong thư mục này, tạo một thư mục con tên là `HoSoXuatRa` (Đây là nơi các file quyết định, danh sách được xuất ra sẽ lưu lại).
4. Tải các file mẫu `.doc` / `.docx` (như Đơn xin học, Quyết định mở lớp...) lên thư mục `QuanLyDaoTaoNghe`.
5. **Quan trọng:** Mở các file Word đó trên Google Drive và lưu lại dưới dạng **Google Docs**.
   *(File > Save as Google Docs / Tệp > Lưu dưới dạng Google Tài liệu).*
6. Trong các file mẫu Google Docs, chèn các **thẻ từ khóa (tags)** vào vị trí cần điền dữ liệu. Ví dụ:
   - `{{TEN_KHOA_HOC}}`
   - `{{NGAY_KHAI_GIANG}}`
   - `{{GIAO_VIEN}}`
   *(Bạn có thể tùy chỉnh thêm tags trong file `Code.gs` ở hàm `generateDocument`)*.

---

## Bước 2: Thiết lập Cơ sở dữ liệu (Google Sheets)

1. Trong thư mục `QuanLyDaoTaoNghe`, tạo một file Google Sheets mới, đặt tên là `CSDL_DaoTaoNghe`.
2. Tạo các Sheet với đúng tên và cấu trúc các cột (Row 1 làm tiêu đề) như sau:

**Sheet `TaiKhoan`**
| Username | Password | Role | HoTen |
| :--- | :--- | :--- | :--- |
| admin | 123456 | Admin | Quản trị viên |
| giaovu1 | 123456 | GiaoVu | Nguyễn Trưởng Giáo vụ |
| gv_tuan | 123456 | GiaoVien | Trần Tuấn (GVCN) |

**Sheet `KhoaHoc`**
| CourseID | TenNghe | MaGV | TrangThai | NgayKG | NgayBG |
| :--- | :--- | :--- | :--- | :--- | :--- |
| (Để trống) | | | | | |

**Sheet `HocVien`**
| CourseID | HoTen | NgaySinh | GioiTinh | CCCD | DiaChi | SoDienThoai | NgayDangKy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| (Để trống) | | | | | | | |

**Sheet `CauHinh`**
| Key | Value | Ghi chú |
| :--- | :--- | :--- |
| DonXinHoc_TemplateID | [Dán ID của file Docs mẫu Đơn xin học vào đây] | Lấy ID trên thanh địa chỉ |
| DanhSachLop_TemplateID | [Dán ID của file Docs mẫu Danh sách lớp vào đây] | |
| ExportFolderID | [Dán ID của thư mục HoSoXuatRa vào đây] | |

*(Cách lấy ID: Mở file/thư mục trên Google Drive, nhìn lên thanh URL trình duyệt, ID là đoạn mã dài nằm giữa `/d/` và `/edit` hoặc cuối URL).*

---

## Bước 3: Cài đặt mã nguồn Google Apps Script

1. Mở file `CSDL_DaoTaoNghe` (Google Sheets) vừa tạo.
2. Trên thanh menu, chọn **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
3. Xóa toàn bộ mã mặc định trong file `Mã.gs` (hoặc `Code.gs`) và copy toàn bộ nội dung từ file `Code.gs` (được cung cấp kèm theo) dán vào.
4. Bấm dấu cộng **(+)** cạnh chữ `Tệp (Files)`, chọn **HTML**. Đặt tên chính xác là `Index` (viết hoa chữ I). Copy nội dung từ file `Index.html` dán vào.
5. Tiếp tục bấm dấu cộng **(+)**, chọn **HTML**, đặt tên chính xác là `StudentRegister`. Copy nội dung từ file `StudentRegister.html` dán vào.
6. Bấm nút **Lưu (Save)** biểu tượng đĩa mềm.

---

## Bước 4: Triển khai (Deploy) thành Web App

1. Góc trên bên phải giao diện Apps Script, bấm nút **Triển khai (Deploy)** -> **Tùy chọn triển khai mới (New deployment)**.
2. Ở mục **Chọn loại (Select type)** (biểu tượng bánh răng), chọn **Ứng dụng web (Web app)**.
3. Cấu hình như sau:
   - Mô tả: `Version 1.0`
   - Tùy chọn thực thi (Execute as): Chọn **Tôi (Me)**.
   - Ai có quyền truy cập (Who has access): Chọn **Bất kỳ ai (Anyone)** *(Để học viên không có tài khoản Google vẫn quét QR đăng ký được).*
4. Bấm **Triển khai (Deploy)**.
5. Sẽ có một bảng yêu cầu cấp quyền (**Authorize access**). Bấm vào đó, chọn tài khoản Google của bạn, click **Nâng cao (Advanced)** -> chọn **Đi tới dự án (Go to... unsafe)** và bấm **Cho phép (Allow)**.
6. Copy đường link URL Web App được cung cấp.

---

## Bước 5: Sử dụng

1. Truy cập vào URL Web App bạn vừa copy.
2. Đăng nhập bằng tài khoản Admin đã tạo ở Sheet `TaiKhoan` (admin / 123456) để kiểm tra giao diện.
3. Thử đăng nhập bằng tài khoản Giáo viên (gv_tuan / 123456).
4. Tạo một khóa học mới, sau đó qua tài khoản Giáo vụ duyệt khóa học đó.
5. Quay lại tài khoản Giáo viên, bấm "Chi tiết" lớp học, vào tab "Hồ sơ & QR", bấm Tạo mã QR.
6. Dùng điện thoại quét mã QR để thử chức năng điền form Đăng ký của học viên. Kiểm tra dữ liệu đổ về tab "Học viên" và trong Sheet `HocVien`.
7. Nhấn "Xuất Đơn xin học" để test khả năng sinh file Word tự động.

Chúc bạn triển khai thành công!
