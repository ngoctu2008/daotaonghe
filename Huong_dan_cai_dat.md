# Hướng dẫn tạo nút "Tạo đơn xin học nghề" bằng VBA

Do hạn chế về môi trường hiện tại không thể nhúng thẳng mã macro vào file Excel của bạn, tôi đã chuẩn bị sẵn đoạn mã VBA và hướng dẫn chi tiết để bạn tự thực hiện. Rất đơn giản, bạn chỉ cần làm theo các bước sau:

## Bước 1: Mở trình soạn thảo VBA
1. Mở file Excel `CSDL.xlsm` của bạn.
2. Nhấn tổ hợp phím **Alt + F11** để mở cửa sổ Microsoft Visual Basic for Applications (VBA).
3. Trong cửa sổ VBA, nhìn sang cột bên trái (Project Explorer), nhấp chuột phải vào `VBAProject (CSDL.xlsm)`.
4. Chọn **Insert** -> **Module**. Một Module mới (thường là `Module1`) sẽ được tạo ra.

## Bước 2: Dán mã VBA
1. Mở file `Huong_dan_VBA.txt` (nằm cùng thư mục này) hoặc copy toàn bộ đoạn mã bên dưới.
2. Dán toàn bộ mã đó vào khung trắng bên phải của `Module1` vừa tạo.
3. Nhấn **Ctrl + S** để lưu lại và đóng cửa sổ VBA.

## Bước 3: Tạo nút bấm "Tạo đơn xin học nghề"
1. Quay lại màn hình Excel, chuyển sang sheet **Thống kê**.
2. Chuyển sang tab **Developer** trên thanh công cụ (Ribbon). *(Nếu bạn không thấy tab Developer, hãy vào File > Options > Customize Ribbon, và đánh dấu tích vào ô Developer ở cột bên phải).*
3. Trong tab Developer, chọn **Insert**, sau đó chọn **Button (Form Control)** (biểu tượng hình chữ nhật đầu tiên).
4. Vẽ một nút bấm lên vị trí bạn muốn trong sheet Thống kê.
5. Ngay khi bạn nhả chuột, cửa sổ `Assign Macro` sẽ hiện ra.
6. Chọn macro có tên **TaoDonXinHocNghe** trong danh sách và bấm **OK**.
7. Click chuột phải vào nút bấm vừa tạo, chọn **Edit Text** và đổi tên thành **Tạo đơn xin học nghề**.

## Bước 4: Chạy thử
1. Đảm bảo file `Don xin hoc nghe.doc` vẫn nằm trong thư mục `Templates` (cùng cấp với file Excel).
2. Bấm vào nút **Tạo đơn xin học nghề** bạn vừa tạo.
3. Chờ một chút để chương trình chạy (nó sẽ chạy ngầm). Khi hoàn tất, một thông báo sẽ hiện lên.
4. Kiểm tra trong thư mục chứa file Excel, bạn sẽ thấy một file Word mới có tên định dạng `Don xin hoc nghe [Tên Nghề] - [Tên Khóa].docx` chứa toàn bộ đơn của các học viên.

---
**Lưu ý quan trọng về thiết lập file mẫu Word (`Don xin hoc nghe.doc`)**:
Trong mã VBA, tôi sử dụng cơ chế Find & Replace để điền dấu "x" vào các lựa chọn theo mẫu của bạn: `( Nam`, `( Nữ`, `( Tự tạo việc làm`, v.v...
Để chức năng này hoạt động chính xác nhất, trong file Word mẫu, các ký tự này nên ở dạng text thường (ví dụ bạn gõ `( Nam`, `( Nữ`) thay vì dùng các tính năng Checkbox Control đặc biệt của Word.
