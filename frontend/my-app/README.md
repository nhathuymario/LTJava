# Hệ thống Quản lý và Số hóa Giáo trình Đại học (SMD)

## Giới thiệu

Dự án **SMD** (University Textbook Management and Digitization System) là một hệ thống web quản lý giáo trình cho các trường đại học. Ứng dụng hỗ trợ:
- Quản lý, tạo, chỉnh sửa và duyệt giáo trình cho giảng viên, trưởng khoa, phòng học vụ và nhà quản trị.
- Tra cứu và tải xuống giáo trình công khai cho sinh viên và công chúng.
- Quản lý cấu hình hệ thống như học kỳ, thang điểm và mẫu CLO/PLO.

## Công nghệ

- **Frontend**: React, Vite, JavaScript (ES6), Tailwind CSS.
- **Quản lý trạng thái**: Context API (AuthProvider) để lưu token, vai trò và thông tin người dùng trong `sessionStorage`.
- **Mock Services**: Dữ liệu mẫu được cung cấp qua các service giả (`src/services/textbookService.js`, `src/services/systemConfigService.js`).

## Cấu trúc dự án

```
my-app/
├─ src/
│  ├─ assets/                # Hình ảnh, icon
│  ├─ components/            # Các component UI tái sử dụng
│  ├─ features/
│  │   ├─ admin/             # Trang cấu hình hệ thống
│  │   ├─ lecturer/          # Quản lý giáo trình của giảng viên
│  │   ├─ review/            # Duyệt giáo trình (HOD, AA, Rector)
│  │   └─ public/            # Thư viện giáo trình công khai
│  ├─ layouts/               # Layout cho admin và user
│  ├─ routes/                # Định nghĩa các route và bảo vệ quyền truy cập
│  ├─ services/              # Mock service cho API
│  └─ index.css              # Tailwind + custom CSS
├─ public/                    # Tệp tĩnh
├─ vite.config.js
└─ package.json
```

## Cài đặt & Chạy dự án

```bash
# Cài đặt phụ thuộc
npm install

# Chạy môi trường phát triển
npm run dev
```

Mở trình duyệt tại `http://localhost:5173` để xem ứng dụng.

## Các tính năng chính

- **Đăng nhập/đăng xuất** với vai trò (ADMIN, LECTURER, HOD, ACADEMIC_AFFAIRS, RECTOR, STUDENT, USER).
- **Quản lý giáo trình**: Tạo, sửa, xem danh sách, gửi duyệt.
- **Duyệt giáo trình**: Xem chi tiết, phê duyệt hoặc từ chối với lý do.
- **Thư viện công khai**: Tìm kiếm, lọc theo môn học, xem chi tiết và tải tài liệu.
- **Cấu hình hệ thống**: Quản lý học kỳ, thang điểm và mẫu CLO/PLO (đang phát triển).

## Liên hệ

Nếu có thắc mắc hoặc muốn đóng góp, vui lòng liên hệ **phu@university.edu**.
