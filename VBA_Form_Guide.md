# Hướng dẫn tạo Form nhập liệu học viên bằng VBA trong file Excel CSDL.xls

Do môi trường hiện tại không hỗ trợ chèn trực tiếp mã VBA vào file Excel, dưới đây là mã nguồn VBA và hướng dẫn chi tiết để bạn tự thêm một UserForm vào file `CSDL.xls` của mình.

## Bước 1: Mở trình soạn thảo VBA
1. Mở file `CSDL.xls` (hoặc `CSDL.xlsx` nếu bạn đã chuyển đổi định dạng) bằng Microsoft Excel.
2. Nhấn tổ hợp phím `Alt + F11` để mở cửa sổ **Microsoft Visual Basic for Applications (VBA)**.

## Bước 2: Tạo UserForm
1. Trên thanh menu, chọn `Insert` -> `UserForm`. Một cửa sổ Form (ví dụ: `UserForm1`) sẽ xuất hiện.
2. Đổi tên Form thành `frmNhapHocVien` (trong cửa sổ Properties ở góc dưới bên trái, tìm thuộc tính `(Name)`).
3. Mở **Toolbox** (nếu chưa thấy, chọn `View` -> `Toolbox`).
4. Kéo và thả các Control sau vào Form (có thể thiết kế bố cục cho đẹp mắt):
   - **Label & TextBox** cho: `Họ và tên`, `Ngày sinh`, `CCCD`, `Số điện thoại`
     - Tên các TextBox tương ứng: `txtHoTen`, `txtNgaySinh`, `txtCCCD`, `txtSDT`
   - **ComboBox** cho: `Giới tính`, `Mã khóa học`
     - Tên các ComboBox: `cmbGioiTinh`, `cmbMaKhoaHoc`
   - **CommandButton** để Lưu và Hủy
     - Tên Button: `cmdLuu` (Caption: "Lưu thông tin"), `cmdHuy` (Caption: "Hủy")

## Bước 3: Thêm Code cho UserForm
1. Nhấp đúp (Double-click) vào bất kỳ khoảng trống nào trên `frmNhapHocVien` để mở cửa sổ code.
2. Xóa hết code cũ (nếu có) và dán đoạn mã sau vào:

```vba
Private Sub UserForm_Initialize()
    ' Khởi tạo các giá trị cho ComboBox Giới tính
    With cmbGioiTinh
        .AddItem "Nam"
        .AddItem "Nữ"
        .ListIndex = 0
    End With

    ' Khởi tạo giá trị cho Mã khóa học (có thể lấy từ sheet KhoaHoc)
    ' Giả sử lấy từ sheet KhoaHoc cột A
    Dim wsKhoaHoc As Worksheet
    Dim lastRow As Long, i As Long

    On Error Resume Next
    Set wsKhoaHoc = ThisWorkbook.Sheets("KhoaHoc")
    On Error GoTo 0

    If Not wsKhoaHoc Is Nothing Then
        lastRow = wsKhoaHoc.Cells(wsKhoaHoc.Rows.Count, "A").End(xlUp).Row
        For i = 2 To lastRow ' Bỏ qua dòng tiêu đề
            If Trim(wsKhoaHoc.Cells(i, 1).Value) <> "" Then
                cmbMaKhoaHoc.AddItem wsKhoaHoc.Cells(i, 1).Value
            End If
        Next i
        If cmbMaKhoaHoc.ListCount > 0 Then cmbMaKhoaHoc.ListIndex = 0
    End If
End Sub

Private Sub cmdLuu_Click()
    Dim wsHocVien As Worksheet
    Dim emptyRow As Long

    ' Kiểm tra dữ liệu bắt buộc
    If Trim(txtHoTen.Text) = "" Or Trim(txtCCCD.Text) = "" Or Trim(cmbMaKhoaHoc.Text) = "" Then
        MsgBox "Vui lòng nhập đầy đủ Mã khóa học, Họ Tên và CCCD!", vbExclamation, "Lỗi"
        Exit Sub
    End If

    Set wsHocVien = ThisWorkbook.Sheets("HocVien")
    emptyRow = wsHocVien.Cells(wsHocVien.Rows.Count, "A").End(xlUp).Row + 1

    ' Lưu dữ liệu (Thứ tự cột tương ứng với sheet HocVien)
    wsHocVien.Cells(emptyRow, 1).Value = cmbMaKhoaHoc.Text
    wsHocVien.Cells(emptyRow, 2).Value = txtHoTen.Text
    wsHocVien.Cells(emptyRow, 3).Value = txtNgaySinh.Text
    wsHocVien.Cells(emptyRow, 4).Value = cmbGioiTinh.Text
    wsHocVien.Cells(emptyRow, 5).Value = txtCCCD.Text
    ' Có thể thêm các trường khác tương tự cho các TextBox khác...
    wsHocVien.Cells(emptyRow, 8).Value = txtSDT.Text
    wsHocVien.Cells(emptyRow, 28).Value = Now ' Cột cuối (Ngày đăng ký)

    MsgBox "Đã lưu học viên thành công!", vbInformation, "Thành công"

    ' Reset Form
    txtHoTen.Text = ""
    txtNgaySinh.Text = ""
    txtCCCD.Text = ""
    txtSDT.Text = ""
End Sub

Private Sub cmdHuy_Click()
    Unload Me
End Sub
```

## Bước 4: Tạo Module để gọi Form (Tạo nút bấm ngoài Excel)
1. Trong cửa sổ VBA, chọn `Insert` -> `Module`.
2. Dán đoạn mã sau vào Module mới tạo:

```vba
Sub MoFormNhapLieu()
    frmNhapHocVien.Show
End Sub
```

## Bước 5: Tạo nút bấm (Button) ngoài màn hình Excel
1. Trở lại cửa sổ Excel (đóng cửa sổ VBA).
2. Vào sheet **HocVien** (hoặc sheet bất kỳ bạn muốn).
3. Chọn tab `Developer` -> `Insert` -> Chọn biểu tượng **Button (Form Control)**. (Nếu không thấy tab Developer, vào File -> Options -> Customize Ribbon -> Tick vào ô Developer).
4. Vẽ một nút bấm lên sheet. Excel sẽ hỏi bạn muốn gán (Assign) Macro nào cho nút này.
5. Chọn `MoFormNhapLieu` và nhấn OK.
6. Đổi tên nút thành "Mở Form Nhập Liệu".

Bây giờ bạn có thể click vào nút bấm đó để mở Form nhập liệu học viên! Lưu ý để chạy được Macro, bạn có thể cần lưu file dưới định dạng **Excel Macro-Enabled Workbook (*.xlsm)**.
