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
- **Bảo mật & Điều hướng (App.tsx Routing):** 
  - Thiết lập Router Guard bảo vệ trang Admin (`/admin`). Kiểm tra chặt chẽ token và quyền hạn (`role === 'ADMIN'`) từ local storage.
  - Tự động điều hướng (Force Redirect) về `/home` ngay lập tức nếu người dùng không phải là Admin hoặc chưa đăng nhập mà cố tình truy cập vào đường dẫn trang quản trị.

### Cập nhật mới nhất
- **Tối ưu hóa tải dữ liệu (App.tsx)**: Chuyển sang cơ chế tải toàn bộ 600 câu hỏi từ 7 API cùng lúc khi khởi động ứng dụng để tăng tốc độ trải nghiệm.
- **Giao diện Ôn tập (QuizGame & ReviewPage)**: Bổ sung hiển thị chi tiết tên chương và chủ đề trực tiếp trên màn hình làm bài, giúp người dùng dễ dàng theo dõi thư mục đang học.

**Phiên làm việc ngày 13/04/2026:**
- **App.tsx & Quản lý trạng thái:**
  - Tối ưu hóa chức năng `handleLogout`: Thực hiện dọn dẹp kết nối SignalR (`resetSignalRConnection()`) và dừng kết nối một cách an toàn trước khi xóa dữ liệu LocalStorage.
  - Loại bỏ hoàn toàn khối logic đăng nhập riêng biệt cho Admin, cho phép trang `AdminPage` được truy cập trực tiếp thông qua trạng thái `currentPage = 'ADMIN'`.
- **Hệ thống Xác thực (AuthPage.tsx):**
  - Tích hợp API mới (`/auth/login` và `/auth/register`) thay cho bộ giả lập nội bộ.
  - Bổ sung việc lưu trữ thông tin thực tế (`userId`) và role sau khi đăng nhập thành công.
  - Loại bỏ nút đăng nhập bằng Google.
- **Trang chủ (HomePage.tsx):**
  - Thay đổi ảnh nền (Hero section) và nội dung văn bản (vd: "GROUP 3 .NET TECH Nền Tảng Ôn Thi GPLX") mang tính thương hiệu rõ ràng.
  - Bố cục lại chi tiết cấu trúc đề thi các hạng bằng (B1, B2, C, D, E, F) và thông tin điều kiện chuẩn đậu mới.
- **Trang giới thiệu (IntroPage.tsx):**
  - Cập nhật số lượng, họ tên và MSSV chi tiết của tất cả các thành viên trong nhóm thiết kế (11 thành viên).
  - Tinh giản hiệu ứng hiển thị, cập nhật văn bản mô tả dự án và kiến trúc công nghệ triển khai (ASP.NET Core Web API).
- **Hệ thống Quản trị (AdminPage.tsx):**
  - Đổi tên tab "Quản lý đề thi" thành "Chương".
  - Chuyển đổi công năng tab "Cài đặt" (Settings) thành trang quản lý "Văn bằng". Đổi icon thành `Eye` giúp giao diện trực quan, nhằm mô tả chức năng xem chi tiết.
  - Nâng cấp hệ thống hiển thị danh sách Văn Bằng: Tích hợp gọi API (`/api/BangLai`) để nạp hoàn toàn các hạng bằng một cách linh động. Khi thiết lập ban đầu hoặc lỗi, hệ thống tự động fallback về danh sách bằng lái chuẩn (B1, B2, C, D, E, F).
  - Thay thế hộp thoại thông báo thô (`alert()`) bằng một **Modal UI hiện đại**, hiển thị chuyên nghiệp chi tiết của văn bằng khi được nhấn vào (như thời gian thi, số câu chuẩn, tổng lượng câu ngân hàng gọi từ API `/api/CauHoi/CauTruc?BangLai=...`).
  - Cập nhật chức năng xem chi tiết Văn bằng: Tự động đính kèm hậu tố `TEST` vào mã bằng (ví dụ `C` thành `CTEST`, `D` thành `DTEST`) để nạp cấu trúcJSON từ Backend (API `/api/CauHoi/CauTruc?BangLai=...TEST`) và đồng bộ trực tiếp thông số (số câu/thời gian) lên thẻ hiển thị ở màn hình Admin.
  - Bổ sung và thiết kế lại giao diện **Cửa sổ thêm Văn bằng mới** (Add License Modal): Cải tiến bố cục rộng, sạch sẽ, chia làm 2 phần rõ rệt (Thông tin chung & Cấu trúc đề thi). Cho phép quản trị viên thêm trực tiếp số lượng câu hỏi chi tiết phân rã theo từng Chương (Category) và gửi POST Request tích hợp vào API `/api/licences/`.