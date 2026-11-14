# HỆ THỐNG BỐC THĂM GIẢI ĐẤU BÓNG ĐÁ 12 ĐỘI & OVERLAY REALTIME LIVESTREAM

Hệ thống bốc thăm chuyên nghiệp dành cho giải đấu bóng đá 12 đội, phát trực tiếp trên **OBS Studio / vMix** qua Web Browser Source với tốc độ quét 60 FPS mượt mà (tối ưu phần cứng GPU).

Đã đóng gói hoàn chỉnh thành file thực thi độc lập: **`BocTham12Doi.exe`** (chạy ngay, không yêu cầu máy tính cài đặt Node.js).

---

## ⚡ CÁCH KHỞI ĐỘNG HỆ THỐNG

### Cách 1: Chạy trực tiếp file `.exe` (Khuyên dùng)
1. Nhấp đúp chuột vào file **`BocTham12Doi.exe`**.
2. Cửa sổ dòng lệnh sẽ xuất hiện và hệ thống **tự động mở trình duyệt** đến Bàn điều khiển: `http://localhost:3001/control`.
3. Khi muốn tắt hệ thống, chỉ cần đóng cửa sổ dòng lệnh.

### Cách 2: Chạy qua lệnh Terminal (Dành cho Lập trình viên)
```bash
npm start
```
Hoặc muốn build lại file `.exe` sau khi sửa code:
```bash
npm run build:exe
```

---

## 🌐 HƯỚNG DẪN DEPLOY CLOUD ĐỂ ĐIỀU KHIỂN TỪ XA (VERCEL + RENDER)

Hệ thống đã được cấu hình sẵn sàng để bạn deploy hoàn toàn miễn phí lên **Vercel** (Frontend) và **Render** (Backend Realtime):

### 1. Đẩy code lên GitHub
```bash
git init
git add .
git commit -m "feat: bốc thăm giải đấu 12 đội bóng realtime"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git push -u origin main
```

### 2. Deploy Backend Realtime lên Render.com (Miễn phí)
1. Đăng nhập [render.com](https://render.com) bằng GitHub.
2. Bấm **New +** -> **Web Service** -> Chọn Repository vừa tạo.
3. Điền thông tin:
   - **Name:** `boctham-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Bấm **Create Web Service**. Chờ 1-2 phút, Render sẽ cấp cho bạn một đường link HTTPS, ví dụ: `https://boctham-backend.onrender.com`.

### 3. Deploy Frontend lên Vercel (Miễn phí)
1. Đăng nhập [vercel.com](https://vercel.com) bằng GitHub.
2. Bấm **Add New...** -> **Project** -> Chọn Repository vừa tạo -> **Import**.
3. Cấu hình:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Environment Variables:**
     - Key: `VITE_SOCKET_URL`
     - Value: `https://boctham-backend.onrender.com` (link từ Render ở bước 2)
4. Bấm **Deploy**. Sau ~30 giây, bạn sẽ nhận được link Vercel, ví dụ: `https://boctham-12doi.vercel.app`.

*Lưu ý: Ngay trên giao diện Bàn điều khiển `/control`, bạn cũng có thể bấm vào nút **Bánh răng (Settings)** để đổi link backend bất cứ lúc nào mà không cần deploy lại!*

---

## 🚀 ĐƯỜNG DẪN TRUY CẬP HỆ THỐNG

| Route | Mục đích | Hướng dẫn cấu hình OBS Studio / vMix |
| :--- | :--- | :--- |
| **`http://localhost:3001/control`** | **Bàn điều khiển Kỹ thuật viên** | Mở trên trình duyệt (Chrome / Edge / Cốc Cốc / iPad / Smartphone cùng mạng LAN) để kỹ thuật viên bấm chọn đội, bốc ngẫu nhiên, hoàn tác hoặc reset. |
| **`http://localhost:3001/overlay-draw`** | **Khung bốc thăm chính (16:9 Cutout)** | Dùng cho phân cảnh Bốc thăm chính thức. Nền trong suốt 100%, có ô cắt 16:9 để lộ camera thật bên dưới. |
| **`http://localhost:3001/overlay-bg`** | **Background tổng họp báo / intro** | Dùng cho phân cảnh Khai mạc / Họp báo / Giới thiệu giải đấu. Có hiệu ứng loop hạt ánh sáng và hào quang kim loại mượt mà. |

---

## 🎥 HƯỚNG DẪN CẤU HÌNH TRÊN OBS STUDIO / VMIX

### Bước 1: Thiết lập Scene Bốc Thăm Chính trong OBS
1. Tạo một Scene mới (ví dụ đặt tên là: `Scene_BocTham`).
2. **Layer 1 (Dưới cùng):** Thêm nguồn Video Camera (hoặc Media Source / NDI Feed). Căn chỉnh khung video camera nằm vừa vặn vào vùng bên trái (khoảng `x: 130`, `y: 230`, kích thước tỉ lệ 16:9).
3. **Layer 2 (Trên cùng):** Thêm một nguồn **Browser Source**:
   - **URL:** `http://localhost:3001/overlay-draw`
   - **Width:** `1920`
   - **Height:** `1080`
   - **Custom CSS:** Để trống (vì hệ thống đã tối ưu nền trong suốt mặc định).
   - Tick chọn: **"Shutdown source when not visible"** và **"Refresh browser when scene becomes active"**.

### Bước 2: Thiết lập Scene Họp Báo / Khai Mạc trong OBS
1. Tạo một Scene mới (ví dụ đặt tên là: `Scene_HopBao`).
2. Thêm **Browser Source**:
   - **URL:** `http://localhost:3001/overlay-bg`
   - **Width:** `1920`
   - **Height:** `1080`

---

## 🏆 CÁC TÍNH NĂNG VẬN HÀNH ĐẶC SẮC

1. **Hiệu ứng Điện ảnh (GSAP 3D Cinematic Motion - 60 FPS):**
   - **Khi chọn/bốc đội:** Thẻ bài phóng lớn giữa màn hình kèm xoay 3D 360°, ánh hào quang vàng kim bùng nổ để MC xướng tên.
   - **Khi chốt slot:** Thẻ bài thu nhỏ và bay theo đường cong (Bezier path) cắm thẳng vào slot tương ứng của Bảng A, B hoặc C.
   - **Khi tiếp đất:** Ô slot rung chấn nhẹ, viền neon phát sáng và bắn pháo hoa ăn mừng (Confetti).
2. **Khung Video 16:9 cắt rỗng hoàn toàn tự nhiên:**
   - Vùng cắt rỗng trong suốt 100% theo đúng thiết kế gốc của SVG. Video camera đặt ở layer dưới trong OBS/vMix sẽ hiển thị sắc nét, không bị che khuất hay đè viền giả lập.
3. **Đồng bộ thời gian thực (Zero Latency Socket.io):**
   - Phản hồi tức thì giữa thiết bị điều khiển và màn hình livestream.
   - **Chống sập nguồn (State Persistence):** Tự động lưu cache trạng thái (`boc_tham_state.json`), nếu OBS mất mạng hoặc tải lại trang thì toàn bộ kết quả bốc thăm vẫn giữ nguyên 100%.
   - Hỗ trợ hoàn tác (Undo) và Đặt lại (Reset có xác nhận an toàn chống ấn nhầm).
4. **Hỗ trợ đầy đủ 12 Đội bóng chuẩn hóa:**
   - `HDF`, `KMF`, `KPF`, `LMMF`, `LPF`, `PQF`, `PUWA`, `PVF`, `TAF`, `TPF`, `TTCF`, `WFF`.
