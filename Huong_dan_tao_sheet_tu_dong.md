# Hướng dẫn tạo tự động các Sheet danh sách từ CSDL

Tài liệu này sẽ hướng dẫn bạn cách thiết lập để các sheet **DSTN-Xã**, **DSTN-TT**, và **Công nhận tốt nghiệp** trong file `CSDL.xlsm` tự động lấy và cập nhật dữ liệu từ sheet **Thông tin HV** bằng công cụ Macro (VBA).

Giải pháp này tối ưu ở chỗ:
- Không cần phải kéo công thức bằng tay mỗi khi thêm học viên mới.
- Macro sẽ tự động đếm số lượng học viên, điền công thức sang các sheet danh sách, và tự động kẻ khung (Borders) cho đẹp mắt.
- Bất kỳ thay đổi thông tin nào ở sheet **Thông tin HV** sau khi đã chạy Macro cũng sẽ lập tức cập nhật ở các sheet danh sách nhờ vào Excel Formulas đã được chèn.

---

## Các bước cài đặt Macro

### Bước 1: Mở trình soạn thảo VBA
1. Mở file `CSDL.xlsm` của bạn.
2. Trên bàn phím, nhấn tổ hợp phím **Alt + F11**. Cửa sổ **Microsoft Visual Basic for Applications (VBA)** sẽ hiện ra.

### Bước 2: Tạo một Module mới
1. Trong cửa sổ VBA, nhìn sang cột bên trái (Project - VBAProject).
2. Nhấn chuột phải vào `VBAProject (CSDL.xlsm)`.
3. Chọn **Insert** > **Module**. Một cửa sổ soạn thảo trắng sẽ hiện ra bên phải.

### Bước 3: Dán đoạn mã Macro
1. Mở file `auto_sheets_vba.txt` đính kèm cùng hướng dẫn này.
2. Sao chép (Copy) toàn bộ nội dung trong file đó.
3. Dán (Paste) vào cửa sổ trắng của Module vừa tạo ở Bước 2.
4. Nhấn biểu tượng lưu (Save) hoặc **Ctrl + S** và đóng cửa sổ VBA lại (dấu X góc trên bên phải).

### Bước 4: Tạo nút bấm (Button) Cập Nhật
Để tiện sử dụng, bạn có thể tạo một nút bấm ngay trên sheet **Thông tin HV** (hoặc bất kỳ sheet nào bạn muốn).

1. Chuyển sang tab **Developer** trên thanh công cụ Excel.
   *(Nếu bạn không thấy tab Developer, hãy vào File > Options > Customize Ribbon > Đánh dấu tích vào ô Developer ở cột bên phải > OK).*
2. Trong nhóm Controls, chọn **Insert** > Nhấp vào biểu tượng đầu tiên **Button (Form Control)**.
3. Vẽ một hình chữ nhật trên sheet (đây sẽ là nút bấm của bạn).
4. Ngay khi bạn thả chuột, một hộp thoại **Assign Macro** sẽ hiện ra.
5. Chọn tên Macro là `CapNhatDanhSach` trong danh sách.
6. Nhấn **OK**.
7. Bạn có thể nhấp chuột phải vào nút bấm vừa tạo, chọn **Edit Text** để đổi tên nút thành "Cập Nhật Danh Sách".

---

## Cách sử dụng

1. Nhập thông tin học viên mới hoặc chỉnh sửa dữ liệu trong sheet **Thông tin HV**.
2. Nhấn vào nút **Cập Nhật Danh Sách** bạn vừa tạo.
3. Macro sẽ chạy trong khoảng 1-2 giây. Sau khi có thông báo "Đã cập nhật danh sách thành công!", bạn hãy kiểm tra các sheet **DSTN-Xã**, **DSTN-TT**, và **Công nhận tốt nghiệp**.
4. Toàn bộ danh sách học viên sẽ được tự động điền vào đúng vị trí, tách riêng phần "Họ" và "Tên", giữ nguyên số thứ tự và được kẻ khung vuông vắn.

**Lưu ý:**
- Bắt đầu từ dòng số 3 trong sheet **Thông tin HV** phải có dữ liệu. Macro sẽ đếm dựa trên cột A (Số TT). Hãy đảm bảo cột A luôn được đánh số liên tục hoặc có dữ liệu.
- Trong sheet **Công nhận tốt nghiệp**, cột điểm hiện đang được để trống vì thông thường điểm được lấy từ một sheet khác (Điểm MĐ). Bạn có thể gõ công thức thủ công vào dòng đầu tiên (dòng số 7) và kéo xuống nếu cần.