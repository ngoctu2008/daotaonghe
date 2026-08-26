# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG HỆ THỐNG CMS (GOOGLE APPS SCRIPT)

Tài liệu này bao gồm 2 phần: Hướng dẫn triển khai (dành cho kỹ thuật viên) và Hướng dẫn quản trị (dành cho Admin).

---

## PHẦN 1: HƯỚNG DẪN TRIỂN KHAI (Dành cho Kỹ thuật)

Hệ thống được xây dựng trên Google Apps Script (GAS) và sử dụng Google Sheets làm cơ sở dữ liệu.

### Bước 1: Tạo dự án
1. Truy cập [script.google.com](https://script.google.com/).
2. Nhấn **Dự án mới** (New Project). Đặt tên dự án (VD: *Web CMS Đào Tạo Nghề*).

### Bước 2: Copy mã nguồn
Trong màn hình soạn thảo, hãy tạo 4 file với tên tương ứng và copy toàn bộ nội dung từ các file bạn nhận được vào:
1. `Code.gs` (Mặc định có sẵn file Mã.gs, hãy đổi tên hoặc xóa đi).
2. `Index.html` (Thêm mới file HTML).
3. `CSS.html` (Thêm mới file HTML).
4. `JS.html` (Thêm mới file HTML).

### Bước 3: Khởi tạo Cơ sở dữ liệu (Quan trọng!)
1. Mở file `Code.gs`.
2. Trên thanh công cụ phía trên cùng, chọn hàm `setupDatabase` từ danh sách thả xuống (kế bên nút Chạy/Run).
3. Nhấn nút **Chạy** (Run).
4. Google sẽ yêu cầu cấp quyền. Bạn chọn: *Xem lại quyền -> Chọn tài khoản Google -> Nâng cao (Advanced) -> Đi tới dự án (Go to project)* và nhấn **Cho phép** (Allow).
5. Khi chạy xong, vào Google Drive của bạn, bạn sẽ thấy một file Google Sheet mới tên là **`DB_HoSoNangLuc_GDTX_DakHa`**. Đây chính là Database của bạn. Đừng xóa file này!

### Bước 4: Triển khai (Deploy) thành Web App
1. Nhấn nút **Triển khai** (Deploy) ở góc trên bên phải -> Chọn **Triển khai mới** (New deployment).
2. Chọn loại (Select type): **Ứng dụng Web** (Web app).
3. Tại phần *Quyền truy cập* (Who has access), hãy chọn **Bất kỳ ai** (Anyone).
4. Nhấn **Triển khai**.
5. Copy đường link URL được cung cấp. Đó chính là link trang web của bạn!

*(Mỗi khi bạn sửa code HTML/JS, bạn cần chọn Quản lý bản triển khai -> Chỉnh sửa -> Phiên bản mới để cập nhật web).*

---

## PHẦN 2: HƯỚNG DẪN SỬ DỤNG CMS (Dành cho Admin)

Bạn có thể chỉnh sửa mọi nội dung trên web mà không cần chạm vào code.

### 1. Đăng nhập trang Quản trị
- Truy cập vào đường link Web App của bạn, sau đó thêm `#admin` vào cuối link.
  *(Ví dụ: `https://script.google.com/macros/s/.../exec#admin`)*
- Nhập mật khẩu. **Mật khẩu mặc định lần đầu là: `admin123`**.
- Sau khi vào, hãy vào Tab **Đổi Mật Khẩu** để thay mật khẩu mới an toàn hơn.

### 2. Tab: Giới Thiệu & Cấu Hình
Tại đây bạn có thể sửa:
- **Tên Trung Tâm, Địa chỉ, Số điện thoại, Email**: Những thông tin này sẽ hiện ở thanh menu (Navbar) và dưới chân trang (Footer).
- **Tầm nhìn & Sứ mạng**: Văn bản giới thiệu ở Section 1.
- *Lưu ý*: Sau khi nhập xong, nhấn **Lưu Cấu Hình** và đợi hộp thoại thông báo thành công.

### 3. Tab: Khóa Học (CĐR)
Quản lý các chương trình đào tạo hiển thị ở Section 2.
- Nhấn **+ Thêm Mới** hoặc nút **Sửa** màu xanh ở từng dòng.
- **Mã nghề, Tên nghề, Thời gian, Trình độ**: Điền text bình thường.
- **Chuẩn đầu ra (CĐR)**: Bạn có thể nhập chi tiết về Kiến thức, Kỹ năng, Việc làm. Phần này sẽ hiển thị dưới dạng Modal (Hộp thoại nổi) khi người dùng bấm "Xem chi tiết CĐR".
- **Icon (FontAwesome)**: Website sử dụng bộ icon miễn phí của FontAwesome.
  - Cách dùng: Lên trang [FontAwesome Free](https://fontawesome.com/search?o=r&m=free). Chọn 1 icon bạn thích.
  - Copy phần tên của icon. Ví dụ: `fa-fire`, `fa-car`, `fa-laptop`. Nhập đúng chữ này vào ô Icon.

### 4. Tab: Cơ Sở Vật Chất & Đối Tác
Quản lý các phòng học, xưởng thực hành và logo doanh nghiệp liên kết.
- **Link ảnh (URL) / Link Logo**: Hệ thống yêu cầu cung cấp đường link trực tiếp của hình ảnh (đuôi `.jpg`, `.png`).
- **Cách lấy link ảnh**:
  - **Cách 1 (Từ web khác)**: Chuột phải vào một hình ảnh trên web -> Chọn "Copy image address" (Sao chép địa chỉ hình ảnh) và dán vào.
  - **Cách 2 (Từ Google Drive)**: Do Google Drive hạn chế chia sẻ ảnh trực tiếp trên web, bạn nên up ảnh lên các trang up ảnh miễn phí (như Imgur, Postimages) rồi lấy link trực tiếp, hoặc dùng công cụ chuyển đổi link Drive sang link trực tiếp (vd: `https://drive.google.com/uc?id=MÃ_FILE`).

---
**Chúc bạn thao tác thành công!**
