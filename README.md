# Syllabus Management and Digitization System (SMD)

> **Giải pháp số hóa và quản lý giáo trình dành cho các trường đại học**

---

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Vấn đề hiện tại](#vấn-đề-hiện-tại)
- [Mục tiêu giải pháp](#mục-tiêu-giải-pháp)
- [Tính năng chính](#tính-năng-chính)
- [Actors](#actors)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tech Stack](#tech-stack)
- [Cài đặt](#cài-đặt)
- [Sử dụng](#sử-dụng)
- [Screenshots](#screenshots)
- [Acknowledgments](#acknowledgments)

---

## 🌟 Giới thiệu

**SMD (Syllabus Management and Digitization System)** là một dự án được phát triển để giải quyết các thách thức trong quản lý giáo trình của các trường đại học. SMD cung cấp một nền tảng tập trung để các giảng viên, khoa và sinh viên có thể truy cập, quản lý và phân tích nội dung giáo trình một cách hiệu quả.

### Lợi ích chính
✅ Số hóa giáo trình, đảm bảo tất cả giáo trình được lưu trữ trên nền tảng tập trung  
✅ Hỗ trợ AI phát hiện thay đổi, chuẩn hóa nội dung và đề xuất cải tiến  
✅ Cung cấp quy trình xét duyệt rõ ràng, minh bạch và toàn bộ lịch sử chỉnh sửa  
✅ Tra cứu giáo trình nhanh chóng theo năm học, môn học và các tiêu chí cụ thể  
✅ Mở rộng tích hợp với hệ thống quản lý học tập (LMS) trong tương lai  

---

## 📊 Vấn đề hiện tại

- Lưu trữ giáo trình phân tán dưới các định dạng như PDF/Word, khó cập nhật và không nhất quán.
- Thiếu công cụ theo dõi phiên bản, không có chuẩn hóa trong việc xét duyệt.
- Người học khó truy cập, tra cứu hoặc so sánh nội dung giáo trình giữa các năm hoặc môn học.
- Thiếu công cụ hiện đại để phân tích nội dung hoặc liên kết chuẩn đầu ra chương trình học (PLO).

---

## 🎯 Mục tiêu giải pháp

### SMD được xây dựng để:
- **Tập trung quản lý và số hóa giáo trình**: Các giảng viên và khoa có thể dễ dàng chỉnh sửa, cập nhật và tiêu chuẩn hóa nội dung giáo trình trên nền tảng Web.
- **Hỗ trợ quy trình xét duyệt rõ ràng**:
  - **Dự thảo → Chờ Xét Duyệt → Chờ Phê Duyệt → Đã Duyệt → Công Bố**  
  - Cho phép ghi nhận lịch sử chỉnh sửa và theo dõi quy trình xét duyệt.
- **Cải thiện khả năng tìm kiếm và phân tích**:
  - Tra cứu giáo trình theo mã môn học, tên môn học, từ khóa, hoặc nội dung chi tiết.
  - So sánh phiên bản giáo trình qua các năm học và xem mối quan hệ giữa các môn học.  
- **Tích hợp AI để tự động hóa**:  
  - Phát hiện thay đổi giữa các phiên bản.
  - Gợi ý chuẩn đầu ra CLO (Input Standards).
  - Tự động tạo tóm tắt nội dung cho sinh viên.

---

## 🚀 Tính năng chính

### 1️⃣ Quản lý giáo trình tập trung (Lecturers)
- Nhập liệu và chỉnh sửa giáo trình với công cụ trực quan.
- Quản lý mối quan hệ giữa các module (tiên quyết, song hành, bổ sung).
- Cập nhật và so sánh các phiên bản giáo trình theo thời gian.

### 2️⃣ Quy trình xét duyệt minh bạch (HOD, AA, Principal)
- HOD đảm bảo nội dung giáo trình đạt chất lượng trước khi gửi lên cấp cao hơn.
- Academic Affairs xác minh sự phù hợp của giáo trình với chuẩn đầu ra của chương trình.
- Principal phụ trách phê duyệt cuối cùng và giám sát toàn bộ hệ thống.

### 3️⃣ Tìm kiếm và phân tích nâng cao
- Cho phép người dùng tra cứu giáo trình theo nhiều tiêu chí.
- So sánh các phiên bản tài liệu và xem lịch sử chỉnh sửa.
- Hiển thị mối quan hệ giữa các môn học dưới dạng bảng hoặc sơ đồ cây.

### 4️⃣ AI tự động hóa
- Gợi ý tương đồng giữa CLO và PLO.
- Kiểm tra sự nhất quán với chuẩn đầu ra chương trình học.
- Cung cấp tóm tắt nội dung cho sinh viên.

### 5️⃣ Quyền truy cập và bảo mật
- Chỉ cấp quyền truy cập theo vai trò (Admin, Lecturer, Student, HOD, etc.).
- Log toàn bộ hành động để kiểm tra sự thay đổi nội dung.

---

## 👥 Actors

| Vai trò              | Mô tả                                                              |
|----------------------|--------------------------------------------------------------------|
| **Giảng viên (Lecturer)**     | Thêm, chỉnh sửa nội dung giáo trình và gửi xét duyệt.                |
| **Trưởng khoa (HOD)**         | Xét duyệt và quản lý phản hồi từ các giảng viên.                      |
| **Bộ phận học vụ (AA)**        | Xét duyệt cuối về chuẩn đầu ra và cấu trúc chương trình học.         |
| **Hiệu trưởng (Principal)**   | Phê duyệt chiến lược cấp cao và phê duyệt giáo trình cuối.            |
| **Sinh viên (Student)**        | Tra cứu giáo trình, theo dõi phiên bản và nhận tóm tắt nội dung.     |

---

## 🏗️ Kiến trúc hệ thống

```plaintext
SMD-System
├── backend/                   # Spring Boot backend
│   └── src/...                # API logic
├── frontend/                  # React.js frontend
│   └── components/...         # Component-based architecture
├── database/                  # Database schema & migration
└── ai-module/                 # AI-feature integration
```

---

## 💡 Tech Stack

### **Frontend**
- React.js, TypeScript
- Tailwind CSS
- Axios (API Communication)

### **Backend**
- Spring Boot, Java 17+
- MySQL
- Redis

### **AI**
- Python (FastAPI)
- Natural Language Processing (NLP)

---

## 💻 Cài đặt

### Yêu cầu hệ thống
- **Node.js**: v18+  
- **Java**: JDK 17+  
- **MySQL**: v8+  

### Bước 1: Clone repository
```bash
git clone https://github.com/<your-repo>.git
cd SMD-system
```

### Bước 2: Cài đặt dependencies

#### Frontend
```bash
cd frontend/
npm install
```

---

## 📱 Screenshots

🚧 _Screenshots sẽ được cập nhật sau..._

---

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io)
- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- Built with ❤️ by [Your Team]
