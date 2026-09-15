# Hướng Dẫn Cài Đặt Hệ Thống Hồ Sơ Năng Lực Trung Tâm GDNN-GDTX Đăk Hà

Hệ thống được xây dựng trên nền tảng **Google Apps Script**, sử dụng **Google Sheets** làm cơ sở dữ liệu và **Google Drive** làm kho lưu trữ tài liệu PDF. Dưới đây là các bước chi tiết để bạn tự tay triển khai mã nguồn.

---

## Bước 1: Chuẩn bị Môi trường Lưu trữ trên Google Drive

1. Đăng nhập vào Google Drive của bạn (tốt nhất là tài khoản dùng cho công việc của Trung tâm).
2. Tạo một thư mục mới, đặt tên ví dụ: `Kho_Tai_Lieu_PDF_Trung_Tam`.
3. Nhấp chuột phải vào thư mục vừa tạo -> Chọn **Chia sẻ (Share)**.
4. Ở phần "Quyền truy cập chung" (General access), chuyển từ *Hạn chế (Restricted)* sang **Bất kỳ ai có liên kết (Anyone with the link)**.
5. Quyền ở bên cạnh chọn là **Người xem (Viewer)**.
6. Sao chép **ID của thư mục** này. (Nó là đoạn mã nằm ở trên thanh URL, ví dụ: `https://drive.google.com/drive/folders/`**`1a2B3c4D5e...`**). Ghi nhớ đoạn ID này.

---

## Bước 2: Chuẩn bị Cơ Sở Dữ Liệu trên Google Sheets

1. Tạo một tệp **Google Sheets** mới, đặt tên ví dụ: `Database_HoSoNangLuc`.
2. Tạo và đổi tên các trang tính (Tabs) ở phía dưới cùng, đồng thời tạo các cột tương ứng trên **Hàng 1** của mỗi tab như sau:

   **Tab 1: DB_HocPhi**
   - Cột A: ID (Ví dụ nhập thử dòng 2: HP1)
   - Cột B: Ten_Nghe (Ví dụ: Trồng Mắc ca)
   - Cột C: Trinh_Do_Thoi_Gian (Ví dụ: Sơ cấp / 3 tháng)
   - Cột D: Tong_So_Tiet (Ví dụ: 300)
   - Cột E: Hoc_Phi_HocVien (Ví dụ: 2500000)
   - Cột F: Quyet_Dinh_Ban_Hanh (Ví dụ: 49/QĐ-UBND)

   **Tab 2: DB_TaiLieu**
   - Cột A: ID
   - Cột B: Ten_Van_Ban
   - Cột C: So_Hieu
   - Cột D: Loai_Tai_Lieu
   - Cột E: Drive_File_ID
   - Cột F: Ngay_Cap_Nhat
   - Cột G: Trang_Thai (Ghi chú: Khi tạo dữ liệu bằng code sẽ tự điền chữ "Hiển thị" hoặc "Ẩn")

   **Tab 3: DB_Users**
   - Cột A: Username (Ví dụ: admin)
   - Cột B: Password (Ví dụ: 123456)
   - Cột C: Ho_Ten (Ví dụ: Nguyễn Văn A)
   - Cột D: Quyen_Han (Ví dụ: SUPER_ADMIN)

   **Tab 4: DB_GiaoVien**
   - Cột A: ID
   - Cột B: Ho_Ten
   - Cột C: Chuyen_Mon
   - Cột D: Nghe_Phu_Trach

   **Tab 5: DB_CoSoVatChat**
   - Cột A: ID
   - Cột B: Ten_CSVC
   - Cột C: So_Luong
   - Cột D: Tinh_Trang
   - Cột E: Ghi_Chu

3. Sao chép **ID của tệp Spreadsheet** này. (Nằm ở thanh URL, ví dụ: `https://docs.google.com/spreadsheets/d/`**`1XyZ...`**`/edit`). Ghi nhớ đoạn ID này.

---

## Bước 3: Đưa Mã Nguồn vào Google Apps Script

1. Từ tệp Google Sheets bạn vừa tạo, trên thanh menu chọn **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Một cửa sổ viết mã sẽ mở ra. Xóa hết code trong file `Mã.gs` mặc định.
3. Ở cột bên trái, bạn sẽ thấy phần **Tệp (Files)**. Hãy tiến hành tạo mới các tệp và Copy-Paste nội dung tương ứng từ thư mục mã nguồn (`Du-An-Ho-So-Nang-Luc`):

   **Tạo các tệp Script (.gs):** (Bấm biểu tượng dấu + -> Script)
   - `Code.gs`
   - `Auth.gs`
   - `DriveService.gs`
   - `SheetService.gs`

   **Tạo các tệp HTML (.html):** (Bấm biểu tượng dấu + -> HTML)
   - `Index.html`
   - `Header.html`
   - `PublicView.html`
   - `AdminView.html`
   - `LoginModal.html`
   - `PDFViewerModal.html`
   - `CSS.html`
   - `JS.html`

4. **CẤU HÌNH QUAN TRỌNG:**
   - Mở tệp `Code.gs`.
   - Tìm dòng `const SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";` và dán **ID của Google Sheet** vào.
   - Tìm dòng `const DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";` và dán **ID của thư mục Drive** vào.
5. Nhấn biểu tượng **Lưu (Save)** hoặc nhấn `Ctrl + S`.

---

## Bước 4: Triển Khai (Deploy) Web App

1. Ở góc trên cùng bên phải giao diện Apps Script, nhấn nút **Triển khai (Deploy)** màu xanh -> Chọn **Tùy chọn triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng ⚙️ ở mục "Chọn loại" (Select type) -> Chọn **Ứng dụng web (Web app)**.
3. Cấu hình như sau:
   - **Thêm mô tả (Description):** "Phiên bản V1.0".
   - **Thực thi dưới dạng (Execute as):** Chọn "Tôi" (Me) - Email của bạn.
   - **Ai có quyền truy cập (Who has access):** Chọn **Bất kỳ ai (Anyone)**.
4. Bấm **Triển khai (Deploy)**.
5. Google sẽ yêu cầu bạn cấp quyền truy cập.
   - Bấm **Cấp quyền truy cập (Authorize access)**.
   - Chọn tài khoản Google của bạn.
   - Có thể Google sẽ cảnh báo ứng dụng chưa được xác minh. Bấm **Nâng cao (Advanced)** -> Chọn **Đi tới ... (không an toàn) (Go to ... (unsafe))**.
   - Cuộn xuống dưới cùng và bấm **Cho phép (Allow)**.
6. Sau khi cấp quyền thành công, hệ thống sẽ cung cấp cho bạn một đường dẫn (URL) dưới dòng **URL của Ứng dụng web (Web app URL)**.
7. **Sao chép URL** này. Đây chính là đường dẫn trang web chính thức của Trung tâm.

---

## Hướng Dẫn Sử Dụng Nhanh
- **Trang chủ:** Truy cập vào URL vừa nhận được, bạn sẽ thấy giao diện Người dùng (Public Portal) xem thông tin, học phí, đọc tài liệu.
- **Đăng nhập Quản trị:** Bấm nút **"Đăng nhập Quản trị"** trên thanh menu, sử dụng tài khoản tạo ở Tab `DB_Users` để vào Bảng điều khiển Admin.
- **Quản lý Tài liệu:** Tại Admin Dashboard, qua tab Quản lý Tài liệu PDF để tải tệp từ máy tính lên. Tệp sẽ tự động đưa vào Google Drive và ghi thông tin vào Google Sheet. Người dùng bên ngoài sẽ lập tức thấy tài liệu này (trừ khi bạn bấm nút "Ẩn").
