# TÀI LIỆU TOÀN TẬP VỀ TRANG QUẢN TRỊ (ADMIN PAGE)

Tài liệu này tổng hợp mọi thứ liên quan đến luồng hoạt động, cấu trúc mã nguồn, tính năng và cách tích hợp phân quyền của Trang Quản Trị Hệ Thống (`/admin`) trong dự án "Hệ thống Ôn tập và Thi Sát hạch Giấy Phép Lái Xe".

---

## 1. Tổng quan (Overview)

- **Mục đích:** Cung cấp giao diện quản lý (Dashboard) dành riêng cho người dùng có quyền Quản trị viên (Admin). Giúp theo dõi hệ thống, quản lý ngân hàng câu hỏi, bài thi, cũng như tiếp nhận tư vấn (Video Call) với các học viên.
- **Đường dẫn (Route):** `/admin`
- **File thành phần chính:**
  - `src/app/components/AdminPage.tsx`: Màn hình Quản trị hệ thống (Quản lý Câu hỏi, Bài thi, Cài đặt).
  - `src/app/components/ConsultationAdminPage.tsx`: Màn hình Video call / Chat hỗ trợ cho Admin để tương tác với người dùng ở trạng thái chờ.
  - `src/app/App.tsx`: Nơi chứa Router Guard để chặn người dùng không có quyền truy cập.

---

## 2. Hệ thống Phân quyền (Auth Guard & Security)

Chức năng kiểm soát không cho phép học viên (`USER`) hoặc khách vãng lai truy cập vào trang Admin. Quá trình này được phân giải ở `App.tsx` bằng đoạn mã sau:

```tsx
// Trích xuất tại Router của mục case 'ADMIN': App.tsx
case 'ADMIN':
  if (!isAuthenticated || userRole !== 'ADMIN') {
    // Kiểm tra trực tiếp localStorage để đề phòng React State chưa kịp tải
    const storedRole = typeof window !== 'undefined' ? window.localStorage.getItem('userRole') : null;
    const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
    
    // Nếu trong cache bộ nhớ cũng không phải ADMIN -> Kick lập tức về HOME
    if (storedRole !== 'ADMIN' || !storedToken) {
      setTimeout(() => {
        if (currentPage === 'ADMIN') handlePageChange('HOME');
      }, 0);
      return null;
    }
    
    // Đợi nếu state chưa update nhưng localstrorage đã báo là admin
    return <div>Đang tải...</div>;
  }
  // Cho phép load vào trang Admin
  return <AdminPage questions={questions} setQuestions={setQuestions} chapters={chapters} />;
```

**Luồng phân quyền:**  Đăng nhập -> Backend kiểm tra tài khoản -> Nếu đúng Admin, trả về data JSON chứa `role === 1` -> Client lưu `userRole = 'ADMIN'` vào `localStorage` -> Thành công truy cập `/admin`.
*(Nếu truy cập trái phép, bạn sẽ bị redirect lập tức về trang chủ `/home` mà không để lại giao diện gì)*.

---

## 3. Kiến trúc Component `AdminPage.tsx`

`AdminPage` là một bảng điều khiển gồm có 1 Sidebar bên trái và Khu vực nội dung bên phải, được chia làm các tab khác nhau.

### 3.1. Các Tab (Chức năng điều hướng nội bộ)
Biến `adminTab` lưu 3 trạng thái của Panel:
- `'questions'`: Quản lý ngân hàng câu hỏi sát hạch.
- `'exams'`: Quản lý danh sách các bài thi.
- `'settings'`: Cài đặt hệ thống.

### 3.2. Quản lý Ngân hàng Câu hỏi (`questions` tab)
- **Lưu trữ State:** Sử dụng state `questions` (được truyền tự gốc `App.tsx`) để đồng bộ thời gian thực toàn app.
- **Thao tác Thêm/Sửa/Xóa (CRUD):** 
  - `handleEdit(q)`: Nạp câu hỏi vào màn hình chỉnh sửa Modal.
  - `handleDelete(id)`: Xóa một câu hỏi.
  - `handleDeleteAll()`: Xoá sạch bộ câu hỏi khỏi LocalStorage/hệ thống.
  - `handleSave()`: Cập nhật hoặc Tạo câu hỏi thủ công.
- **Đồng bộ Dữ liệu (Fetch API):**
  - Hàm `fetchQuestionsFromServer()` cho phép một chạm kéo toàn bộ CSDL (Bộ 600 câu của Bộ GTVT) từ Backend API (`/api/CauHoi`). Admin có thể ấn vào đây để làm mới bộ nhớ cache học viên.
- **Tìm kiếm & Bộ lọc:**
  - Có thể Filter theo Chương (Chapter) và rà soát câu điểm liệt (`isParalysis`).

### 3.3. Module: Quản trị chương ôn tập (Review Chapters Management)
Hệ thống cho phép định nghĩa các Chương của "Bộ 600 câu" bằng mảng dữ liệu `DEFAULT_REVIEW_CHAPTERS`. 
- Hàm `applyReviewMappingToQuestions()` giúp phân tách tự động các câu từ 1 đến 600 vào đúng các nhóm mục tiêu như (Quy định chung, Đạo đức người lái xe, Biển báo đường bộ...).

---

## 4. Khu vực Tư vấn - `ConsultationAdminPage.tsx`

Với những học viên có khúc mắc, họ sẽ vào `ConsultationUserPage.tsx` để thực hiện Video Call. Người bắt máy và quản lý pool các cuộc gọi nằm ở giao diện `ConsultationAdminPage.tsx`.

1. **Công nghệ:** Cốt lõi sử dụng `@microsoft/signalr` kết nối server-socket. 
2. **Hiển thị Học viên:** List danh sách học viên đang "Online" có mở form tư vấn.
3. **Thao tác Gọi (Call):** Admin có quyền Toggle Online/Offline của bản thân và thực hiện "Kết nối rảnh tay" (Video/Voice) trả lời trực tiếp cho học viên.

---

## 5. Tóm tắt thao tác kiểm duyệt API (Backend Endpoints)
Khi làm việc trên trang Admin, mã nguồn Frontend sẽ gọi tới một số API chủ chốt của hệ thống C#.Net:
- `[POST] auth/login:` Trả về `role = 1` đại diện cho Admin Access Token.
- `[GET] api/CauHoi:` Được dùng trong `fetchQuestionsFromServer()` để gọi ra danh sách hàng loạt câu hỏi cho các module.
- `[GET] assets/uploads/:` Sử dụng trong `fetchServerImages()` tại Admin để xem hoặc load các hình ảnh (sa hình, biển báo) gắn cho câu hỏi.

---
*Tài liệu này dành cho nhóm phát triển và Maintainer để dễ dàng nắm bắt logic quản lý khi mở rộng chức năng hệ thống Admin về sau.*