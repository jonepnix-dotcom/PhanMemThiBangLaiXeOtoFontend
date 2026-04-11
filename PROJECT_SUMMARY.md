# TỔNG HỢP CHI TIẾT DỰ ÁN CUỐI KỲ - NHÓM 3 (.NET & REACT)

## 1. Tổng quan dự án (Project Overview)
**Tên dự án:** Hệ thống Ôn tập và Thi Sát hạch Giấy Phép Lái Xe (GPLX) & Tư vấn Trực tuyến (UI-web-GROUP-3-.NET)
**Mục tiêu:** Xây dựng một nền tảng Web App toàn diện giúp người dùng học lý thuyết, thi thử các bài thi sát hạch lái xe (Hạng B1, B2, C, D, E). Điểm nhấn đặc biệt của dự án là khả năng **tư vấn trực tuyến bằng Video Call** giữa học viên và Quản trị viên (Admin).

**Công nghệ cốt lõi:**
- **Frontend Framework:** React 18 + TypeScript + Vite.
- **Styling UI:** Tailwind CSS v4, hệ thống component dựa trên Radix UI (shadcn/ui style), Framer Motion cho animation.
- **Real-time & Communication:** Cấu trúc WebRTC kết hợp `@microsoft/signalr` cho Video Call và Real-time Notification.
- **Backend Communication:** Sử dụng Fetch API để đồng bộ dữ liệu với Backend (có thể là .NET như tên dự án hướng tới).

---

## 2. Cấu trúc thư mục (Folder Structure)

| Thư mục / Tệp tin | Mô tả chi tiết |
| --- | --- |
| `src/main.tsx` & `App.tsx` | Entry point của ứng dụng và tệp điều hướng gốc, quản lý giao diện chính dựa trên logic điều hướng thủ công (Custom Routing thông qua state `currentPage`) và quản lý bộ nhớ cục bộ (Local/Session Storage). |
| `src/app/components/` | Thư mục quan trọng nhất chứa tất cả các màn hình (Pages) và Component chức năng của dự án. Bao gồm thi cử (`ThiPage`, `QuizGame`, `ReviewPage`), trang chủ và thông tin (`HomePage`, `IntroPage`, `ContactPage`), và hệ thống quản trị/tư vấn (`AdminPage`, `ConsultationUserPage`, `ConsultationAdminPage`). |
| `src/app/components/ui/` | Tập hợp các UI Components tái sử dụng được tuỳ biến từ Radix UI. Chứa đầy đủ các thẻ chức năng giao diện chuẩn mực (Button, Dialog, Accordion, Avatar, Dropdown...). |
| `src/app/contexts/` | Chứa các React Context như `SignalRContext.tsx` dùng để duy trì kết nối Socket toàn cục trên trình duyệt học viên/admin. |
| `src/app/hooks/` | Chứa các Custom Hook phục vụ Video Call và xử lý luồng WebRTC như `useWebRTCHook`, `useMicHook`, `useWebcamHook`, `useAudioVisualizer`. |
| `src/app/services/` | Viết các logic tương tác với các dịch vụ bên ngoài. Ví dụ: `signalr.ts` phục vụ kết nối với Server qua giao thức WebSocket/SignalR. |
| `src/app/types.ts` | File định nghĩa toàn bộ Type/Interface của TypeScript (như kiểu `Question`, `Chapter`, cấu trúc người dùng...). Giúp kiểm soát chặt chẽ lỗi cú pháp. |
| `src/styles/` | Quản lý CSS toàn cục, các biến màu sắc (`theme.css`), file cài đặt Tailwind và custom font (`tailwind.css`, `fonts.css`). |
| `package.json` & `vite.config.ts`| Các file cấu hình thư viện và trình build (Vite). |

---

## 3. Chức năng chính (Core Features)

### A. Hệ thống Kiến thức & Thi thử (Mock Test System)
- **Ôn tập theo chuyên đề (`ReviewPage`):** Học viên có thể ôn tập bộ 600 câu hỏi lý thuyết, được phân phối theo các chương chuyên biệt (Quy định chung, Nghiệp vụ vận tải, Đạo đức người lái xe, Kỹ thuật lái xe, Cấu tạo sửa chữa, Hệ thống biển báo, Sa hình).
- **Thi Sát hạch (`ThiPage`, `QuizGame`):** Module cung cấp bài thi bám sát định dạng thực tế của bộ Giao thông vận tải, chia theo các hạng bằng khác nhau:
    - Hạng B1, B2 (30-35 câu / 20-22 phút).
    - Hạng C, D, E (40-45 câu / 24-26 phút).
- Hệ thống hỗ trợ chấm điểm minh bạch, có cảnh báo câu điểm liệt.

### B. Liên lạc theo thời gian thực & Video Call
- Hệ thống áp dụng công nghệ **WebRTC và SignalR** để tạo cuộc gọi trực tiếp.
- Giúp Học viên (`ConsultationUserPage`) trực tiếp đặt câu hỏi và trao đổi bằng hình ảnh/âm thanh với Quản trị viên (`ConsultationAdminPage`).
- Popup Global Video Call (`GlobalCallHandler.tsx`) cho phép overlay màn hình gọi kể cả khi đang lướt đến tab màn hình khác.
- Cho phép toggle Webcam, Mic, Share Screen bằng những thao tác trực quan (quản lý qua hệ thống `hooks/`).

### C. Quản lý Tài khoản & Cá nhân hoá
- **Đăng nhập / Đăng ký (`AuthPage.tsx`):** Phân quyền vai trò chuẩn (`USER` và `ADMIN`). Dùng thư viện phân quyền token (JWT accessToken) lưu trữ an toàn trong localStorage.
- **Lịch sử (`HistoryPage`) & Hồ sơ (`ProfilePage`):** Có biểu đồ/bảng dữ liệu theo dõi quá trình làm bài và lưu lại kết quả giúp học viên dễ dàng khắc phục điểm yếu. 

### D. Hệ thống Quản trị (Admin System)
- **Quản trị nội dung (`AdminPage`):** Ban quản trị có thể quản lý hệ thống, kiểm soát bộ các câu hỏi.
- Quản lý luồng tương tác với người dùng ở sảnh chờ tư vấn.

---

## 4. Kiến trúc luồng Hoạt động (App Architecture & Flow)
1. **Quản lý Dữ liệu:** Ứng dụng tận dụng `sessionStorage` và `localStorage` phía Client để cache lại dữ liệu cấu trúc đề, thông tin đăng nhập và bộ câu hỏi, giúp hạn chế gọi tải nặng tới server API.
2. **Khởi tạo kết nối Socket:** Từ ban đầu, dựa vào token, nếu user hợp lệ, Web socket (Hỗ trợ bởi `signalR`) sẽ được thiết lập, đưa người dùng vào pool online của hệ thống.
3. **Cơ chế Điều Hướng (Routing):** Hiện tại dù project có cài đặt `react-router-dom`, nhưng phần lớn logic chính bên trong `App.tsx` đang sử dụng điều hướng State qua biến `currentPage`, kết hợp Fallback check theo URL path truyền thống.
4. **Trải nghiệm Giao DịCh:** Chú trọng tính Responsive mạnh mẽ nhờ Tailwind và giao diện tương thích tốt hệ điều hành và thiết bị di động.

---
*Dự án sử dụng cơ sở hạ tầng hiện đại, đáp ứng tốt nhu cầu học tập kiến thức lái xe trên môi trường trực tuyến với độ tương tác thời gian thực cao.*

## 5. Nhật ký cập nhật (Changelog)

**Phiên làm việc ngày 11/04/2026:**
- **UI/UX & Branding:** 
  - Thay đổi file logo toàn hệ thống từ định dạng SVG sang PNG (`logo.png`).
  - Cập nhật tên website hiển thị thành **Nhóm 3 - Công nghệ .NET9** (Title web và Header).
  - Tinh chỉnh giao diện: xử lý khung bao bọc (Wrapper) để bo tròn hoàn toàn khối logo (`rounded-full`, `overflow-hidden`) trên mọi kích thước màn hình.
- **Xác thực (AuthPage):** 
  - Thêm tính năng kiểm tra bỏ trống form.
  - Hiển thị thông báo đăng ký thành công nổi bật và tự động chuyển về thẻ Đăng nhập (giữ nguyên tên đăng nhập đã nhập).
- **Tư vấn trực tuyến (Consultation):** 
  - Thiết kế lại màn hình chờ dành cho người dùng chưa đăng nhập. Rút gọn dòng text đơn điệu thành một Card giao diện trực quan và chuyên nghiệp với CTA điều hướng rõ ràng.
- **Tài liệu học tập (DocumentsPage):** 
  - Fix lỗi tràn layout trên layout điện thoại (Mobile Responsive) bằng cách cấu hình tự động bẻ chữ (`break-words`), co cụm tiêu đề (`line-clamp-2`).
  - Lược bỏ nội dung hiển thị đường dẫn thô (`/docs/...`) rườm rà dưới tên tài liệu giúp giao diện thoáng và sạch hơn.