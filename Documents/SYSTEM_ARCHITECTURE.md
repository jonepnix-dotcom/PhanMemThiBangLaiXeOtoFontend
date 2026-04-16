# TÀI LIỆU TOÀN TẬP VỀ KIẾN TRÚC VÀ LOGIC HỆ THỐNG GIAO DIỆN CỦA DỰ ÁN

Tài liệu này (`SYSTEM_ARCHITECTURE.md`) trình bày chi tiết toàn bộ logic hoạt động, vòng đời khởi tạo và kiến trúc luồng dữ liệu của ứng dụng Website Học và Thi Sát Hạch GPLX (React + Vite).

---

## 1. TỔNG QUAN KIẾN TRÚC (ARCHITECTURE OVERVIEW)

- **Mô hình kiến trúc:** Ứng dụng ứng dụng mô hình SPA (Single Page Application). Toàn bộ nội dung giao diện được Render động bằng React thông qua `index.html` và thẻ `<div id="root">`.
- **Luồng dữ liệu (Data Flow):** Theo mô hình Top-Down (từ trên xuống theo chuẩn React). `App.tsx` đóng vai trò là "Nhạc trưởng" (Root Component) lưu giữ State dùng chung, sau đó phân phát (prop-drilling) bộ câu hỏi (`questions`), trạng thái đăng nhập, và dữ liệu người dùng xuống các màn hình tương ứng.
- **Hệ thống Network & Real-time:** 
  - Giao tiếp đồng bộ (HTTP Request): thông qua hàm `fetch()` RESTful tới API (.NET).
  - Giao tiếp thời gian thực (WebSocket): thông qua `@microsoft/signalr` kết hợp WebRTC cho tính năng Video Call.

---

## 2. VÒNG ĐỜI KHỞI TẠO APP (APP INITIALIZATION LIFECYCLE)

Khi người dùng mở trang web, `App.tsx` sẽ đi qua các bước khởi tạo sau:

1. **Reset & Phục hồi đường dẫn (Path Recovery):** Đọc `localStorage.getItem('currentPage')` kết hợp hàm kiểm tra phân tích chuỗi `window.location.pathname` để quyết định gắn Component màn hình nào (vd: Mở tab trực tiếp báo `/admin` -> `currentPage = 'ADMIN'`).
2. **Khôi phục Phiên Đăng Nhập (Auth Session):** Hook `useEffect` sẽ chạy ngay để tìm kiếm chuỗi `accessToken` và `userRole` trong bộ nhớ cục bộ (`localStorage`).
   - Nếu có Token -> Gửi chuỗi Token đó lên API `/auth/me` để lấy thông tin Name & Email cập nhật vào thanh Header. Đặt `isAuthenticated = true`.
   - Nếu Token rỗng -> `isAuthenticated = false`.
3. **Tiền tải Dữ Liệu (Pre-fetch Data):** 
   - Gọi lên API Server (như cấu hình sẵn) bằng hàm `fetch(url + 'api/CauHoi')` để tải toàn bộ bảng câu hỏi.
   - Cache (lưu đệm) ngay lập tức vào `sessionStorage` (Bộ nhớ phiên). Nếu lần sau thao tác không cần đi tải lại (tránh ngập băng thông hệ thống).

---

## 3. LOGIC ĐIỀU HƯỚNG TRANG (ROUTING LOGIC)

Hệ thống **không** sử dụng `react-router-dom` theo cách truyền thống bằng `<Routes>`, mà sử dụng một logic Custom Router rất nhẹ dựa trên lệnh `switch...case`:

- Hàm `handlePageChange(pageKey)` được dùng mọi nơi.
- Khi gọi hàm này, nó kích hoạt 2 việc: 
  - Đổi State `currentPage` -> React tự động Re-render hiển thị Case Component tương ứng.
  - Đổi đường dẫn trên thanh URL bằng `window.history.replaceState` để người dùng cảm giác như đang chuyển trang vật lý, đồng thời lưu lại trang cuối họ mở vào `localStorage`.
- **Router Guard (Bảo vệ đường dẫn):** Tại `App.tsx`, ở `case 'ADMIN'` và `case 'CONSULTATION'`, hệ thống tự nhúng mã kiểm tra ngầm `userRole === 'ADMIN'`. Trả ngay về `handlePageChange('HOME')` nếu phát hiện giả mạo.

---

## 4. LOGIC TÍNH NĂNG THI SÁT HẠCH & ÔN TẬP

Các Module này nằm trong `ReviewPage.tsx` (Ôn tập) và `ThiPage.tsx` + `QuizGame.tsx` (Thi).

**B.1. Ôn Tập (`ReviewPage`):**
- Dữ liệu câu hỏi được lọc (`filter`) theo từ khóa `chapterId` (Chương 1 đến Chương 7).
- Học viên được đọc câu hỏi kèm theo phần hiển thị "Giải thích đáp án" màu cam (đáp án đúng) nếu hệ thống được cấu hình đầy đủ nội dung để nhớ.

**B.2. Thi Thử (`QuizGame`):**
- Tính toán ngẫu nhiên (Randomize): Hệ thống lấy ngẫu nhiên 30-45 câu hỏi (Tuỳ vào hạng bằng B1, B2, C, D, E) mỗi khi bắt đầu một đề thi mới.
- Logic Thời Gian (Timer Hook): Đếm ngược từ 20-26 phút. Hàm `setInterval` sẽ chạy và trừ giây mỗi 1000ms. Khi thời gian = 0, hàm `handleSubmit()` tự động được kích hoạt chấm bài (force submit).
- Logic Chấm Điểm:
  - So sánh kết quả của biến `answeredQuestions[id]` với `correctAnswer` của thẻ gốc.
  - Kiểm tra điều kiện qua bài: Nếu Điểm < (Điểm chuẩn tối thiểu) HOẶC SAI 1 CÂU ĐIỂM LIỆT (`isParalysis === true`) -> Trả về mốc "Trượt" (Not Passed).

---

## 5. LOGIC THỜI GIAN THỰC & VIDEO CALL (SIGNAL R + WEBRTC)

Đây là tính năng mũi nhọn phức tạp nhất của dự án. Hoạt động của nó phụ thuộc vào quy trình bắt tay:

1. **SignalRContext:** Đóng vai trò là Room kết nối. Duy trì Hub Connection lên C#. Khi 1 user ấn `toggleOnline()`, hệ thống phát đi thông báo Server.
2. **Gọi điện (Call User - `ConsultationUserPage/ConsultationAdminPage`):** 
   - Người gọi ấn "Gọi". SignalR gửi Signal 'IncomingCall' đến Người Nhận.
   - Nếu bên nhận xác nhận Accept (Chấp nhận). Cửa sổ `GlobalCallHandler.tsx` chèn lên toàn bộ màn hình hệ thống.
3. **WebRTC Hooks (Peer-to-Peer):** 
   - `useWebRTCHook`: Giữ IceCandidate và SDP Offer. Dùng WebRTC P2P để kết nối độ trễ thấp trực tiếp giữa client Học viên và Admin mà không cần qua server luân chuyển video trung gian.
   - `useMicHook` / `useWebcamHook` / `useAudioVisualizer`: Tương tác với phần cứng trình duyệt xin quyền (Permissions API), kích hoạt Micro, xử lý độ phân giải Webcam và phát sóng (Broadcast). Tích hợp đồ thị vẽ sóng âm thanh trên giao diện.
   - `useShareScreenHook`: Lấy stream màn hình (`navigator.mediaDevices.getDisplayMedia`) thay vì stream camera.

---

## 6. LOGIC XỬ LÝ LỖI & TOAST NOTIFICATION

Dự án sử dụng thư viện `sonner` (Toast) để cung cấp phản hồi hình ảnh ở mọi hành động.
- Khi fetch API failed.
- Khi người dùng đăng nhập sai tên.
- Khi đăng ký thành công (kèm validate trống).
- Khi tạo xoá câu hỏi trong Admin thành công.

Giao diện sẽ nảy Popup thông báo góc màn hình giúp người dùng nhận thức lập tức trạng thái của luồng tác vụ.

---

## TỔNG KẾT
Cấu trúc Logic trên phối hợp chặt chẽ việc đồng bộ hóa dữ liệu (Global State, LocalStorage caching) với tương tác người dùng thời gian thực. Giúp ứng dụng hạn chế tối đa số lượng request dư thừa lên đường truyền máy chủ, mang lại cảm giác App linh hoạt như Native Mobile App.