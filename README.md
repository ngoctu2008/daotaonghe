# Hệ Thống Quản Lý Đào Tạo Nghề (Supabase + Vercel)

Đây là ứng dụng quản lý đào tạo nghề nghiệp được xây dựng bằng giao diện HTML/JS thuần (Bootstrap 5) và cơ sở dữ liệu Supabase (PostgreSQL).

Dự án hỗ trợ **triển khai tự động 1-click** lên Vercel.

## 🚀 Hướng Dẫn Cài Đặt (Triển khai tự động lên Vercel)

### Bước 1: Chuẩn bị Cơ Sở Dữ Liệu (Supabase)

1. Truy cập [Supabase.com](https://supabase.com/) và tạo một Project mới.
2. Tại trang quản trị Supabase, vào mục **SQL Editor**, tạo một Query mới.
3. Copy toàn bộ nội dung trong file `schema.sql` của dự án này và dán vào SQL Editor, sau đó nhấn **Run** để tự động tạo bảng, hàm RPC (bảo mật mật khẩu) và dữ liệu mẫu.
4. Vào phần **Project Settings -> API**. Lưu lại 2 thông tin sau:
   - **Project URL**
   - **Project API Keys (anon / public)**

### Bước 2: Deploy lên Vercel

1. Tạo tài khoản miễn phí tại [Vercel.com](https://vercel.com) (nếu chưa có).
2. Nhấn vào nút Deploy bên dưới để tự động clone repository này và cài đặt lên Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjules-ai%2Ftraining-management-app&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

*(Lưu ý: Nếu bạn đang tự push code này lên repo GitHub cá nhân của bạn, hãy trỏ link trong nút Deploy về repo của bạn).*

3. Tại màn hình cài đặt của Vercel, hãy điền 2 biến môi trường đã lưu ở Bước 1 vào mục **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Điền Project URL của Supabase)
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` = (Điền Project API Keys `anon` của Supabase)
4. Nhấn **Deploy** và chờ 2 -> 3 phút để hệ thống tự động thiết lập.

---

### Thông Tin Đăng Nhập Mặc Định

Sau khi Deploy thành công, hãy truy cập vào đường link Vercel cung cấp để sử dụng hệ thống.

- **Tên đăng nhập:** `admin`
- **Mật khẩu:** `admin123`

*(Sau khi đăng nhập, hệ thống sẽ cấp quyền quản trị cao nhất "Ban Giám đốc").*
