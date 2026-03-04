# PHOTOPRO — Bố cục & Chức năng Front-end Toàn diện

> **Phiên bản:** 2.0 (cập nhật theo spec-v2)  
> **Cập nhật:** 04/03/2026  
> **Thiết kế trung tính** — Phù hợp mọi loại hình doanh nghiệp du lịch  
> **Không dùng theme cố định** — Doanh nghiệp tự chọn màu sắc (7 preset + Custom HEX)  
> **Kỹ thuật:** Thuần HTML + CSS Variables + Mock Data JSON  
> **Tham chiếu:** `photopro-spec-v2.md` (v2.1) — Xem chi tiết các thay đổi A1-A6, B1, C1, C2  

---

## MỤC LỤC

1. [Hệ thống tùy chỉnh màu sắc](#1-hệ-thống-tùy-chỉnh-màu-sắc)
2. [3 Ứng dụng Front-end](#2-ba-ứng-dụng-front-end)
3. [Customer Storefront — 6 trang](#3-customer-storefront)
4. [Staff Portal — 4 trang](#4-staff-portal)
5. [Admin Dashboard — 7+ trang (cập nhật v2)](#5-admin-dashboard)
6. [Shared Components](#6-shared-components)
7. [Mock Data Structure](#7-mock-data-structure)
8. [Responsive Design](#8-responsive-design)

---

## 1. HỆ THỐNG TÙY CHỈNH MÀU SẮC

Thay vì chọn theme cố định, mỗi doanh nghiệp tự cấu hình bảng màu qua **CSS Variables** trong Admin → Cài đặt → Giao diện.

### 1.1 Biến màu cốt lõi

| Biến CSS | Vai trò | Mặc định | Mô tả |
|----------|---------|----------|-------|
| `--primary` | Màu chính | `#1a6b4e` | Nút CTA, sidebar active, link, badge |
| `--primary-light` | Nền nhạt primary | Auto-gen | Hover states, selected items |
| `--primary-dark` | Primary đậm | Auto-gen | Text trên nền sáng |
| `--accent` | Màu nhấn | `#d4870e` | Badge recommended, giá tiết kiệm |
| `--accent-light` | Nền nhạt accent | Auto-gen | Warning nhẹ, highlight |
| `--surface` | Nền trắng | `#ffffff` | Card, header, form |
| `--surface-alt` | Nền phụ | `#f6f7f9` | Body background, hover row |
| `--text` | Chữ chính | `#1a1d23` | Tiêu đề, nội dung chính |
| `--text-secondary` | Chữ phụ | `#5a6170` | Mô tả, label phụ |
| `--text-muted` | Chữ mờ | `#8b91a0` | Hint, timestamp |
| `--border` | Viền | `#e2e5ea` | Card border, divider |
| `--danger` | Lỗi/xóa | `#d63b3b` | Cố định, không đổi |
| `--success` | Thành công | `#1a854a` | Cố định, không đổi |

### 1.2 Preset màu sẵn có

| Preset | Primary | Accent | Phong cách |
|--------|---------|--------|------------|
| Xanh lá (mặc định) | `#1a6b4e` | `#d4870e` | Thiên nhiên, sinh thái |
| Xanh dương | `#2563eb` | `#f59e0b` | Chuyên nghiệp, biển |
| Tím | `#7c3aed` | `#ec4899` | Sang trọng, sáng tạo |
| Đỏ | `#dc2626` | `#ea580c` | Năng động, nổi bật |
| Teal | `#0d9488` | `#06b6d4` | Tươi mát, nhiệt đới |
| Slate Dark | `#1e293b` | `#f97316` | Tối giản, hiện đại |
| Nâu | `#92400e` | `#d97706` | Cổ điển, hoài niệm |

### 1.3 Cách auto-generate màu phụ

Từ `--primary`, hệ thống tự tạo:
- `--primary-light`: cùng hue, saturation ≤ 30%, lightness = 95%
- `--primary-dark`: cùng hue, lightness = 20%

Tương tự cho `--accent-light` từ `--accent`.

---

## 2. BA ỨNG DỤNG FRONT-END

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CUSTOMER STOREFRONT (Next.js SSR)                          │
│     URL: {subdomain}.photopro.vn hoặc {custom-domain}          │
│     Dành cho: Khách du lịch                                    │
│     6 trang: Landing → Search → Results → Checkout → Success   │
│              → Delivery                                        │
│                                                                │
│  2. STAFF PORTAL (React + Vite)                                │
│     URL: portal.photopro.vn                                    │
│     Dành cho: Nhân viên / Thợ ảnh                              │
│     4 trang: Địa Điểm → Upload → Thống kê NV → Profile        │
│                                                                │
│  3. ADMIN DASHBOARD (React + Vite)                             │
│     URL: admin.photopro.vn                                     │
│     Dành cho: Admin System, Admin Sales, Manager, Staff        │
│     7+ trang: Dashboard → Địa Điểm → Staff → Pricing          │
│               → Revenue → Thống kê NV → Settings              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CUSTOMER STOREFRONT

### 3.1 Trang Landing (`/`)

**Mục đích:** Giới thiệu dịch vụ + Hướng khách chụp selfie tìm ảnh. **KHÔNG hiển thị ảnh.**

**Bố cục từ trên xuống:**

```
┌─ HEADER ──────────────────────────────────────────────────┐
│ [Logo + Tên DN]                     [Trang chủ] [Tìm ảnh] │
├─ HERO SECTION (nền gradient primary-light → surface-alt) ─┤
│                                                            │
│  Tiêu đề: "Tìm ảnh du lịch của bạn"  (h1, 2rem, fw-800) │
│  Mô tả: "Chúng tôi đã chụp hàng ngàn..."  (1rem, muted) │
│                                                            │
│  ─── TAG CHỌN ĐỊA ĐIỂM (pills) ────                      │
│  [● Tất cả] [Bà Nà Hills] [Hội An] [Cầu Rồng]           │
│                                                            │
│  ─── FACE SEARCH BOX ────                                  │
│  ┌──────────────────────────────┐                          │
│  │  📸 (icon lớn)               │                          │
│  │  "Chụp selfie hoặc tải lên" │  Dashed border           │
│  │  Mẹo: Bỏ kính, mũ...       │  Hover → primary-light   │
│  │  [📷 Chụp selfie] [📤 Tải]  │                          │
│  └──────────────────────────────┘                          │
│                                                            │
│  🔒 "Selfie chỉ dùng tìm kiếm, không lưu trữ"           │
├─ DANH SÁCH ĐỊA ĐIỂM ─────────────────────────────────────┤
│  Grid cards các địa điểm đang PUBLISHED                    │
│  Mỗi card: Tên địa điểm · Số ảnh · Ngày · Color border   │
└────────────────────────────────────────────────────────────┘
```

**Chức năng:**
- Hiển thị danh sách địa điểm đang published (dạng pills có thể chọn)
- Camera capture hoặc file upload selfie
- Selfie gửi lên server, xử lý in-memory, **không lưu disk**
- Redirect sang `/results` sau khi xử lý

---

### 3.2 Trang Face Search (`/search`)

**Mục đích:** Cho khách chọn phạm vi và chụp selfie chi tiết hơn.

**Bố cục:**

```
┌─ HEADER ──────────────────────────────────────────────┐
├─ CARD: Tìm ảnh của bạn ──────────────────────────────┤
│                                                        │
│  PHẠM VI TÌM KIẾM (radio group):                      │
│  ● Tất cả địa điểm (5 địa điểm, ~750 ảnh)            │
│  ○ Chọn địa điểm cụ thể:                              │
│    ☑ Bà Nà Hills 20/02 (150 ảnh)                      │
│    ☑ Hội An 19/02 (200 ảnh)                           │
│    ☐ Cầu Rồng Đêm 18/02 (120 ảnh)                    │
│                                                        │
│  KHOẢNG THỜI GIAN (tùy chọn — v2):                    │
│  Từ ngày: [____/____/________]                         │
│  Đến ngày: [____/____/________]                        │
│  Chọn nhanh:                                           │
│  [Hôm nay] [3 ngày] [7 ngày] [30 ngày] [Tất cả]      │
│  ⓘ Chọn ngày để thu hẹp kết quả (không bắt buộc)     │
│                                                        │
│  FACE SEARCH BOX (giống Landing nhưng nhỏ hơn)        │
│                                                        │
│  ⓘ ALERT: Mẹo chụp selfie chính xác nhất             │
└────────────────────────────────────────────────────────┘
```

**Chức năng:**
- Chọn scope: tất cả / địa điểm cụ thể
- Multi-select địa điểm (checkbox)
- **Lọc theo ngày chụp** (date picker + quick buttons) — v2
- Camera capture + File upload
- Hiển thị search time (ms)
- Chỉ tìm ảnh `status = 'available'` (loại ảnh đã bán)

---

### 3.3 Trang Kết quả (`/results`)

**Mục đích:** Hiển thị ảnh có mặt khách, nhóm theo địa điểm. Cho chọn ảnh mua.

**Bố cục:**

```
┌─ HEADER ─────────────────────────────────────────────────┐
│ [Logo]                    [⏱️ 450ms] [Tìm thấy 18 ảnh]  │
├─ RESULTS GROUPED BY LOCATION ────────────────────────────┤
│                                                           │
│  ── 📍 Bà Nà Hills 20/02 (8 ảnh) ──────── [Xem thêm →] │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │ 98%  │ │ 95%  │ │ 92%  │ │ 88%  │   Photo grid       │
│  │☑ Chọn│ │☑ Chọn│ │☐ Chọn│ │☐⚠3d │   4 cột desktop    │
│  └──────┘ └──────┘ └──────┘ └──────┘   2 cột mobile     │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                           │
│  ── 📍 Hội An 19/02 (7 ảnh) ───────────── [Xem thêm →] │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │ 94%  │ │ 91%  │ │ 85%  │ │ 80%  │                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                           │
├─ PRICING BAR (sticky / card nổi bật) ────────────────────┤
│  BẢNG GIÁ: 1 ảnh = 10k · 3 ảnh = 20k · 10 ảnh = 50k   │
│  Giỏ hàng: 3 ảnh · Gói 3 files: 20,000đ  [THANH TOÁN →]│
└──────────────────────────────────────────────────────────┘
```

**Chức năng chi tiết:**
- Ảnh hiển thị dạng **photo grid responsive** (aspect-ratio 3:4)
- Mỗi ảnh có: **watermark overlay**, badge % similarity, checkbox chọn
- Ảnh sắp bị xóa (< 7 ngày): badge đỏ `⚠️ 3d`
- Ảnh đã bán (`status = 'sold'`): KHÔNG hiển thị (đã di chuyển sang album đơn hàng)
- **Auto-pack logic** tự tính gói tối ưu cho khách
- Bottom pricing bar hiển thị tóm tắt + nút thanh toán

---

### 3.4 Trang Checkout (`/checkout`)

**Mục đích:** Tóm tắt đơn hàng, chọn gói, nhập thông tin, thanh toán.

**Bố cục:**

```
┌─ HEADER ─────────────────────────────────────────────┐
├─ CARD 1: Đơn hàng ──────────────────────────────────┤
│  Thumbnail ảnh đã chọn (scroll ngang)                │
│  3 ảnh HD · Gói 3 ảnh  ────────────────── 20,000đ   │
├─ ALERT: Gợi ý auto-pack ────────────────────────────┤
│  💡 Chọn thêm 7 ảnh → Gói 10 = 50k (tiết kiệm!)    │
├─ CARD 2: Chọn gói ──────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ 1 ảnh    │ │ 3 ảnh ●  │ │ 10 ảnh   │  Grid cards │
│  │ 10,000đ  │ │ 20,000đ  │ │ 50,000đ  │  Chọn = bôi │
│  │ 10k/ảnh  │ │ 6.7k/ảnh │ │ 🔥5k/ảnh │  viền prim. │
│  └──────────┘ └──────────┘ └──────────┘             │
├─ CARD 3: Thông tin nhận ảnh ─────────────────────────┤
│  SĐT *:  [0912 345 678]   ← Bắt buộc               │
│  ☐ Gửi link qua Email     ← Tick = hiện input email │
│  Mã giảm giá: [_______] [Áp dụng]                   │
├─ CARD 4: Phương thức thanh toán ─────────────────────┤
│  ● VNPay (QR · ATM · Visa/Master)                   │
│  ○ MoMo (QR · Ví MoMo)                              │
│  ○ Chuyển khoản ngân hàng (0% phí)                   │
├─ CTA BUTTON ─────────────────────────────────────────┤
│  [🔒 THANH TOÁN 20,000đ]  (full-width, primary)     │
│  "Giao dịch bảo mật. Tiền chuyển trực tiếp cho DN." │
└──────────────────────────────────────────────────────┘
```

**Chức năng:**
- Chọn gói (pricing cards, selected state)
- SĐT bắt buộc, Email tùy chọn (checkbox toggle)
- Mã giảm giá (input + nút áp dụng)
- Chọn payment gateway (radio cards)
- Nút thanh toán → redirect cổng TT

---

### 3.5 Trang Thành công (`/success/{order_id}`)

**Mục đích:** Hiển thị nổi bật link tải ảnh + QR code + cảnh báo hết hạn.

**Bố cục:**

```
┌─ HERO (success-light background) ────────────────────┐
│  ✅ THANH TOÁN THÀNH CÔNG!                            │
│  Đơn hàng #ORD-A1B2C3 · 3 ảnh HD                    │
├─ CARD: Link tải (viền success) ──────────────────────┤
│  📥 LINK TẢI ẢNH:                                    │
│  ┌─────────────────────────────────────┐              │
│  │ studio-abc.photopro.vn/d/abc123xyz  │  Monospace   │
│  └─────────────────────────────────────┘              │
│  [📋 Sao chép link] [📥 Tải QR code]                 │
├─ CARD: QR Code ──────────────────────────────────────┤
│  📱 Lưu QR Code để mở lại sau:                       │
│  [  QR CODE 140×140  ]                                │
├─ ALERT WARNING ──────────────────────────────────────┤
│  ⚠️ QUAN TRỌNG                                       │
│  ⏱️ Hết hạn sau: 71:59:45 (countdown mono)           │
│  🗑️ Ảnh sẽ bị XÓA VĨNH VIỄN sau khi hết hạn!       │
├─ CTA ────────────────────────────────────────────────┤
│  [📥 TẢI NGAY TẤT CẢ ẢNH]  (full-width, accent)    │
│  "Link đã gửi qua SMS đến 091****678"               │
└──────────────────────────────────────────────────────┘
```

**Chức năng:**
- Link tải hiển thị nổi bật (monospace, card viền)
- Nút sao chép link (clipboard API)
- QR code (generate PNG/SVG)
- Countdown timer realtime
- Cảnh báo xóa vĩnh viễn

---

### 3.6 Trang Tải ảnh — Delivery (`/d/{code}`)

**Mục đích:** Trang tải ảnh HD đã mua, có đếm ngược.

**Bố cục:**

```
┌─ HEADER ─────────────────────────────────────────────┐
├─ CARD: Countdown ────────────────────────────────────┤
│  ĐƠN HÀNG: #ORD-A1B2C3                              │
│  ⏱️ THỜI HẠN CÒN LẠI                                │
│  ┌────┐ : ┌────┐ : ┌────┐                           │
│  │ 47 │   │ 23 │   │ 15 │   Countdown unit boxes     │
│  │ giờ│   │phút│   │giây│   JetBrains Mono, đỏ       │
│  └────┘   └────┘   └────┘                           │
│  [███████████████░░░░░░░] 65%  Progress bar          │
├─ ALERT DANGER ───────────────────────────────────────┤
│  ⚠️ Ảnh sẽ bị XÓA VĨNH VIỄN khi hết hạn!           │
├─ PHOTO GRID (3 cột) ────────────────────────────────┤
│  📸 Ảnh của bạn (3 ảnh)            [📥 Tải tất cả]  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │  Ảnh HD  │ │  Ảnh HD  │ │  Ảnh HD  │             │
│  │ [📥 Tải] │ │ [📥 Tải] │ │ [📥 Tải] │             │
│  └──────────┘ └──────────┘ └──────────┘             │
├─ CARD: Info ─────────────────────────────────────────┤
│  Lượt tải còn lại: 3/5                               │
│  [Share Zalo] [Share Facebook]                       │
└──────────────────────────────────────────────────────┘
```

**Chức năng:**
- Countdown timer realtime (giờ:phút:giây)
- Progress bar thời hạn còn lại (%)
- Tải từng ảnh hoặc tải tất cả (ZIP)
- Đếm lượt tải còn lại (max_downloads)
- Share Zalo / Facebook / Email
- Khi hết hạn: hiển thị trạng thái "EXPIRED"
- **Image protection**: disable right-click, drag, transparent overlay

---

## 4. STAFF PORTAL

### 4.1 Layout chung

```
┌───────────────────────────────────────────────────────┐
│ 📷 Staff Portal                        [User] [Logout]│
├──────────┬────────────────────────────────────────────┤
│          │                                            │
│ SIDEBAR  │          MAIN CONTENT                      │
│ 220px    │          (padding 24px)                    │
│          │                                            │
│ � Địa Điểm│   ← Đổi tên từ Albums (v2)              │
│ ⬆ Upload │                                            │
│ 📈 TK NV │   ← Thống kê của mình (v2)                │
│ 📋 Orders│                                            │
│ 👤 Profile│                                           │
│          │                                            │
│ ── ── ── │                                            │
│ User info│                                            │
└──────────┴────────────────────────────────────────────┘
```

**LƯU Ý:** Staff KHÔNG thấy: Dashboard (admin), Revenue, Pricing, Settings.
Staff chỉ xem ảnh do chính mình upload vào Địa Điểm.

### 4.2 Trang Địa Điểm (`/locations`)

- Danh sách Địa Điểm được phân công (card list, border-left color)
- Mỗi ĐĐ: tên, số ảnh **do mình upload**, ngày, status badge, nút "Upload vào đây"
- **Alert:** "Bạn chỉ xem được ảnh do chính mình upload."
- Click ĐĐ → chuyển sang Upload

### 4.3 Trang Upload (`/locations/{id}/upload`)

```
┌─ ĐĐ header: Tên + status + actions ─────────────────┐
├─ UPLOAD ZONE ────────────────────────────────────────┤
│  Dashed border · Kéo thả hoặc chọn file             │
│  Max 20 ảnh/lần · JPG/PNG/HEIC · 50MB/ảnh           │
├─ UPLOAD PROGRESS ────────────────────────────────────┤
│  IMG_0342.jpg ───────████████░░ 85%                  │
│  IMG_0343.jpg ─────────────────── ✓ Xong             │
│  IMG_0344.jpg ─────────────────── Đang chờ...        │
├─ PHOTO GRID (chỉ ảnh do mình upload) ───────────────┤
│  Grid ảnh với status badge                           │
│  ⓘ Bạn chỉ xem được ảnh do chính mình upload.      │
└──────────────────────────────────────────────────────┘
```

**Chức năng:**
- Drag-drop upload (max 20 concurrent)
- Upload progress (per file: %, retry if failed)
- Grid chỉ hiển thị ảnh do staff đang đăng nhập upload
- Staff **KHÔNG** thể xem ảnh của staff khác upload

### 4.4 Trang Orders (`/orders`)

- Table đơn hàng: Mã đơn, Số ảnh, Tổng tiền, Trạng thái (badge), Thời gian
- Staff chỉ **xem danh sách**, không quản lý

---

## 5. ADMIN DASHBOARD

### 5.1 Layout chung

```
┌─────────────────────────────────────────────────────────┐
│ 📷 PhotoPro Admin    [Role badge]    [🔔 3]  [Logout]   │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │          MAIN CONTENT                        │
│ 220px    │                                              │
│          │                                              │
│ TỔNG QUAN│    Hiện theo role:                           │
│ 📊 Dash  │    Admin System: TẤT CẢ menu                │
│ ─────────│    Admin Sales: không Settings               │
│ NỘI DUNG │    Manager: Dashboard + DT + TK NV (read)    │
│ 📍 Địa Điểm│  ← Đổi tên từ Albums (v2)                │
│ 👥 Staff │                                              │
│ ─────────│                                              │
│ KINH DOANH│                                             │
│ 💰 Giá   │                                              │
│ 📋 Orders│                                              │
│ � DT    │                                              │
│ � TK NV │  ← Thống kê nhân viên (mới — v2)            │
│ ─────────│                                              │
│ HỆ THỐNG │                                              │
│ ⚙️ Setup │                                              │
│ 🌐 Domain│                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 5.2 Trang Dashboard (`/`)

- **4-5 Stat cards:** Tổng ảnh, Ảnh đã bán, Đơn hàng, Doanh thu, Dung lượng
- **Chart doanh thu 7 ngày:** Bar chart responsive
- **Gói bán chạy:** Xếp hạng gói + số đơn
- **Alert cảnh báo:** "250 ảnh sẽ bị xóa trong 7 ngày tới"
- **Địa Điểm chờ Publish:** Card list + nút Publish/Xóa
- **Staff đang hoạt động:** Tên + số ảnh hôm nay + Online/Offline
- **Staff view:** 4 stat cards (Ảnh UP, Ảnh bán, DT tháng, Địa điểm) + danh sách ĐĐ được phân công

### 5.3 Trang Địa Điểm (`/locations`) *(đổi từ Albums)*

- **Danh sách:** Card grid các địa điểm chụp, mỗi card: tên, vị trí, ngày, stats, staff badges
- **Modals:** Tạo mới, Sửa, Xem chi tiết, Xóa (confirm)
- **Phân quyền staff:** Bảng 1 cột "Được upload" (checkbox). Staff chỉ xem ảnh do mình upload.
- Actions: ✏️ Sửa, 👁 Xem, 🗑️ Xóa (chỉ Admin System)
- Nút: [+ Tạo Địa Điểm]

### 5.4 Trang Staff Management (`/staff`)

- **Filter tags:** Tất cả, Admin System, Admin Sales, Manager, Staff
- **Table:** Tên, Vai trò (badge theo màu), Mã NV, Địa điểm (badges), Trạng thái, Actions
- Cột Mã NV + Địa điểm chỉ hiện cho role Staff. Non-staff hiển thị "—".
- Actions: ✏️ Sửa, 🔒 Reset password
- **Form tạo/sửa:** Khi chọn vai trò Staff → hiện thêm: Mã nhân viên + Chọn Địa điểm (v2)
- Nút: [+ Thêm nhân viên]

### 5.5 Trang Pricing (`/pricing`)

- **Table gói giá:** Tên gói, Số ảnh, Giá VND, Giá/ảnh, Status, Actions
- Actions: ✏️ Sửa, 🗑️ Xóa
- Nút: [+ Thêm gói mới]
- **Section mã giảm giá:** Table mã, % giảm, Đã dùng/Giới hạn, Hết hạn
- **Alert auto-pack:** Giải thích cách hệ thống tự tính gói tối ưu

### 5.6 Trang Revenue (`/revenue`)

- **Time filter:** [Hôm nay] [Tuần] [Tháng●] [Quý] [Năm] [Tùy chọn]
- **4 Stat cards:** Tổng DT, Đơn hàng, Ảnh bán, Phí platform
- **Export buttons:** [Xuất Excel] [Xuất CSV] [Xuất PDF]
- **Top Địa Điểm bán chạy:** Ranked list
- **Top Staff upload:** Ranked list

### 5.7 Trang Settings (`/settings`)

> ⚠️ **Chỉ Admin System** mới truy cập được

**6 Card cấu hình:**

1. **🗑️ Thời hạn lưu trữ ảnh** *(đã đơn giản hóa — v2)*
   - Input: N ngày (min 7, max 365, default 30)
   - Info: "Ảnh chưa bán sẽ tự động bị xóa sau thời hạn. Ảnh đã mua được di chuyển vào album đơn hàng và lưu trữ vĩnh viễn."
   - ~~Toggle: Bật/tắt auto-delete~~ (đã bỏ — v2 C2)
   - ~~Toggle: Chỉ xóa ảnh chưa bán~~ (đã bỏ — v2 C2)

2. **⏱️ Thời hạn Link tải**
   - Input: N giờ (min 24, max 720, default 168)
   - Input: Số lượt tải tối đa (default 5)

3. **🌐 Domain**
   - Subdomain: [studio-abc].photopro.vn
   - Custom domain: photos.studioabc.com + CNAME status

4. **🏦 Tài khoản ngân hàng**
   - Ngân hàng, Số TK, Chủ TK, Trạng thái xác minh

5. **🎨 Tùy chỉnh màu sắc** *(mở rộng — v2)*
   - 7 Preset nhanh: Xanh lá, Xanh dương, Tím, Đỏ, Teal, Slate Dark, Nâu
   - Custom color: `<input type="color">` + Input HEX cho Primary & Accent
   - Live preview: Nút, badge, link trên nền primary/accent
   - Upload logo doanh nghiệp
   - Upload watermark ảnh

6. **Nút [💾 Lưu cài đặt]**

### 5.8 Trang Thống Kê Nhân Viên (`/staff-stats`) *(mới — v2)*

> Mục **Kinh Doanh** trong sidebar. Xem spec-v2.md A1.

- **Admin/Manager:** Bảng danh sách staff + click mở modal chi tiết
- **Staff:** Trang thống kê cá nhân (không thấy staff khác)
- **Table:** #, Nhân viên, Mã NV, Ảnh upload, Ảnh bán, Tỉ lệ (progress bar), DT tháng, Tổng DT, Địa điểm (badges)
- **Modal chi tiết:** 4 stat cards + biểu đồ doanh thu (Chart.js bar) + tabs kỳ DT + ĐĐ được phân công
- **Export:** Xuất Excel

---

## 6. SHARED COMPONENTS

### 6.1 Gallery Components

| Component | Mô tả |
|-----------|-------|
| `PhotoGrid` | Responsive grid, lazy load, aspect-ratio 3:4, auto-fill minmax(150px, 1fr) |
| `PhotoCard` | Placeholder → lazy image, watermark overlay, checkbox, similarity badge, warning badge |
| `PhotoLightbox` | Full-screen preview với watermark, disable right-click |

### 6.2 Upload Components

| Component | Mô tả |
|-----------|-------|
| `UploadZone` | Dashed border, drag-drop, click to select, hover state |
| `UploadProgress` | Per-file progress bar, status (uploading/done/error), retry |
| `BatchUploader` | Queue 20 files, parallel upload, auto-retry |

### 6.3 Search & Filter Components (cập nhật v2)

| Component | Mô tả |
|-----------|-------|
| `DateRangePicker` | Từ ngày / Đến ngày inputs + quick date buttons (Hôm nay, 3 ngày, 7 ngày, 30 ngày, Tất cả) |
| `QuickDateButtons` | Nút chọn nhanh khoảng thời gian, active state (primary color) |
| `TagBadge` | Status badge (PUBLISHED/READY/DRAFT/etc.) |
| `LocationBadge` | Badge hiển thị tên Địa Điểm được phân công |

### 6.4 Payment Components

| Component | Mô tả |
|-----------|-------|
| `PricingCard` | Selectable card, name/price/per-unit, recommended badge |
| `PaymentMethod` | Radio card, icon, tên, mô tả |
| `CartSummary` | Photo count + package + total |

### 6.5 Data Display

| Component | Mô tả |
|-----------|-------|
| `StatCard` | Label + large value + change % (up/down color) |
| `DataTable` | Sortable header, hover row, responsive scroll |
| `BarChart` | CSS-only bars, hover highlight, labels |
| `Countdown` | JetBrains Mono, 3 unit boxes (h:m:s), realtime |
| `ProgressBar` | Thin bar, fill color, percentage |

### 6.6 Form Components

| Component | Mô tả |
|-----------|-------|
| `FormInput` | Border, focus ring (primary-light), hint text |
| `Toggle` | Slide toggle on/off, primary color when on |
| `Alert` | Info/Warning/Danger/Success variants |

---

## 7. MOCK DATA STRUCTURE

Tất cả mock data được lưu trong 1 object JSON:

```json
{
  "business": {
    "name": "Studio ABC Photo",
    "subdomain": "studio-abc",
    "domain": "studio-abc.photopro.vn",
    "delivery_link_ttl_hours": 168,
    "photo_retention_days": 30,
    "brand_colors": {
      "primary": "#1a6b4e",
      "accent": "#d4870e"
    }
  },
  "locations": [
    { "id": "a1", "name": "Bà Nà Hills 20/02", "address": "Bà Nà Hills, Đà Nẵng", "date": "2026-02-20", "photos": 150, "status": "PUBLISHED", "type": "location", "staff": ["NV001", "NV002"] }
  ],
  "pricing": [
    { "name": "Gói 1 ảnh", "count": 1, "price": 10000 }
  ],
  "discounts": [
    { "code": "WELCOME10", "discount": "10%", "used": 45, "limit": 100 }
  ],
  "staff": [
    { "name": "Nguyễn Văn A", "role": "staff", "employee_code": "NV001", "photos": 3200, "locations": ["Bà Nà Hills", "Hội An"] }
  ],
  "orders": [
    { "id": "ORD-A1B2C3", "photos": 3, "total": 20000, "status": "DELIVERED", "type": "order", "is_permanent": true }
  ],
  "revenue_chart": [
    { "day": "20/02", "value": 6800000 }
  ],
  "search_results": {
    "group1": [
      { "score": 98, "status": "available", "warning": false }
    ]
  }
}
```

---

## 8. RESPONSIVE DESIGN

### Breakpoints

| Breakpoint | Width | Photo Grid | Sidebar | Layout |
|------------|-------|------------|---------|--------|
| Mobile | < 640px | 2 cột | Ẩn (hamburger) | Stack |
| Tablet | 768px | 3 cột | Ẩn hoặc overlay | Stack |
| Desktop | 1024px | 4-6 cột | 220px fixed | Grid sidebar + content |
| Large | 1280px+ | 6 cột | 220px fixed | Max-width 1400px |

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 2.0s |
| Time to Interactive | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| Lighthouse Score | > 90 |

---

## 9. CẤU TRÚC FOLDER — MONOREPO

### 9.1 Tổng quan Monorepo

```
photopro/                          ← Monorepo root
├── apps/                          ← 3 Frontend apps
│   ├── storefront/                ← Next.js 14 — Customer (SSR)
│   ├── staff-portal/              ← React + Vite — Staff upload & tag
│   └── admin-dashboard/           ← React + Vite — Admin management
├── packages/                      ← Shared packages
│   ├── ui/                        ← @photopro/ui — Shared components
│   ├── types/                     ← @photopro/types — TypeScript interfaces
│   ├── utils/                     ← @photopro/utils — Shared utilities
│   └── api-client/                ← @photopro/api-client — API client
├── services/                      ← 10 Backend microservices
│   ├── staff-service/             ← Port 3001
│   ├── media-processing/          ← Worker (background)
│   ├── face-index/                ← Port 3003 — Python FastAPI
│   ├── storefront-service/        ← Port 3000
│   ├── order-service/             ← Port 3005
│   ├── payment-service/           ← Port 3006
│   ├── delivery-service/          ← Port 3007
│   ├── admin-service/             ← Port 3008
│   ├── notification-service/      ← Port 3009
│   └── auto-delete-service/       ← Port 3010
├── infra/                         ← Infrastructure as Code
│   ├── terraform/                 ← AWS ECS, RDS, S3, CloudFront
│   ├── nginx/                     ← Reverse proxy, subdomain routing
│   └── docker/                    ← Dockerfiles per service
├── docs/                          ← Documentation
├── package.json                   ← pnpm workspaces
├── pnpm-workspace.yaml
├── turbo.json                     ← Turborepo pipeline
├── docker-compose.yml             ← Dev: Postgres, Redis, RabbitMQ, MinIO
└── tsconfig.base.json
```

---

### 9.2 Customer Storefront — Next.js 14 App Router

```
apps/storefront/
├── package.json
├── next.config.ts                 // Dynamic subdomain + custom domain routing
├── tailwind.config.ts             // CSS variables integration
├── tsconfig.json
├── .env.local                     // API_URL, S3_CDN, NEXT_PUBLIC_*
├── middleware.ts                   // Subdomain → business resolver
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json              // PWA manifest
└── src/
    ├── app/                       // ═══ APP ROUTER — Routes & Layouts ═══
    │   ├── layout.tsx             // Root layout: fonts, metadata, providers
    │   ├── not-found.tsx          // 404 — Business not found
    │   ├── globals.css            // CSS variables, Tailwind directives
    │   │
    │   ├── (store)/               // ── Route group: Customer pages ──
    │   │   ├── layout.tsx         // StoreLayout: Header + resolve business
    │   │   ├── page.tsx           // / — Landing page
    │   │   ├── search/
    │   │   │   └── page.tsx       // /search — Face search + location filter
    │   │   ├── results/
    │   │   │   └── page.tsx       // /results — Kết quả face search
    │   │   ├── checkout/
    │   │   │   └── page.tsx       // /checkout — Giỏ hàng + thanh toán
    │   │   └── success/
    │   │       └── [id]/
    │   │           └── page.tsx   // /success/:id — Thanh toán thành công
    │   │
    │   ├── (delivery)/            // ── Route group: Delivery (minimal layout) ──
    │   │   ├── layout.tsx         // MinimalLayout: no header nav
    │   │   └── d/
    │   │       └── [code]/
    │   │           └── page.tsx   // /d/:code — Trang tải ảnh + countdown
    │   │
    │   └── api/                   // ── API Routes (Next.js) ──
    │       ├── business/route.ts  // Resolve business by subdomain/domain
    │       ├── face-search/route.ts // Proxy → Face Index Service :3003
    │       └── preview-urls/route.ts // Generate signed preview URLs
    │
    ├── components/                // ═══ UI COMPONENTS ═══
    │   ├── layout/
    │   │   ├── StoreHeader.tsx    // Logo, nav, business name
    │   │   ├── StoreFooter.tsx    // Copyright, powered by
    │   │   └── MobileNav.tsx      // Hamburger menu mobile
    │   │
    │   ├── search/
    │   │   ├── CameraCapture.tsx  // Webcam selfie, canvas capture
    │   │   ├── ImageUpload.tsx    // File input, preview, validate
    │   │   ├── LocationSelector.tsx // Multi-select địa điểm pills (v2)
    │   │   ├── DateRangeFilter.tsx // Lọc ngày từ–đến + quick buttons (v2)
    │   │   └── SearchTips.tsx     // Hướng dẫn chụp selfie
    │   │
    │   ├── gallery/
    │   │   ├── PhotoGrid.tsx      // Responsive grid, lazy load
    │   │   ├── PhotoCard.tsx      // Thumbnail, badge, checkbox
    │   │   ├── ProtectedImage.tsx // Watermark, anti-save overlay
    │   │   ├── PhotoLightbox.tsx  // Fullscreen preview, swipe
    │   │   ├── ResultGroup.tsx    // Location group header + photo grid
    │   │   └── DeleteWarning.tsx  // Badge đếm ngược sắp xóa
    │   │
    │   ├── cart/
    │   │   ├── PricingBar.tsx     // Sticky bottom: tổng giá, CTA
    │   │   ├── PackageSelector.tsx // Pricing card grid, auto-pack
    │   │   ├── CartSummary.tsx    // Photo count + package + total
    │   │   └── DiscountInput.tsx  // Mã giảm giá input
    │   │
    │   ├── checkout/
    │   │   ├── ContactForm.tsx    // SĐT bắt buộc, email toggle
    │   │   ├── PaymentMethods.tsx // VNPay, MoMo, Bank radio cards
    │   │   └── OrderSummary.tsx   // Tóm tắt đơn hàng + gói
    │   │
    │   ├── delivery/
    │   │   ├── Countdown.tsx      // Realtime h:m:s + progress bar
    │   │   ├── DownloadGrid.tsx   // Ảnh HD + nút tải + ZIP
    │   │   ├── ShareButtons.tsx   // Zalo, Facebook, Email share
    │   │   └── DeliveryExpired.tsx // UI khi link hết hạn
    │   │
    │   └── ui/                    // Base UI (hoặc từ @photopro/ui)
    │       ├── Button.tsx
    │       ├── Badge.tsx
    │       ├── Alert.tsx
    │       ├── Card.tsx
    │       ├── ProgressBar.tsx
    │       └── Skeleton.tsx
    │
    ├── hooks/
    │   ├── useBusiness.ts         // Resolve business context
    │   ├── useFaceSearch.ts       // Upload selfie, poll results
    │   ├── useCart.ts             // Cart state: add/remove photo
    │   ├── useAutopack.ts         // Tính gói tối ưu từ pricing
    │   ├── useCountdown.ts        // Countdown timer logic
    │   └── usePreviewUrls.ts      // Fetch + auto-refresh signed URLs
    │
    ├── stores/                    // Zustand stores
    │   ├── cartStore.ts           // Selected photos, package, total
    │   └── searchStore.ts         // Scope, locations, date range, results
    │
    ├── services/                  // API client functions
    │   ├── api.ts                 // Axios instance, interceptors
    │   ├── locations.ts            // getLocations, getLocationBySlug (v2)
    │   ├── faceSearch.ts          // postFaceSearch, getResults
    │   ├── orders.ts              // createOrder, getOrder, pay
    │   ├── pricing.ts             // getPricing packages
    │   └── delivery.ts            // getDelivery, downloadPhoto
    │
    ├── lib/
    │   ├── utils.ts               // formatPrice, formatDate, classNames
    │   ├── autopack.ts            // Auto-pack pricing algorithm
    │   ├── imageProtect.ts        // Disable right-click, drag
    │   └── qrcode.ts              // Generate QR code SVG
    │
    └── types/
        ├── business.ts            // Business, Location interfaces (v2)
        ├── photo.ts               // Photo, FaceResult, SearchResult
        ├── order.ts               // Order, OrderItem, Delivery
        └── pricing.ts             // PricingPackage, Discount
```

---

### 9.3 Staff Portal — React + Vite

```
apps/staff-portal/
├── package.json
├── vite.config.ts                 // Proxy /api → backend :3001
├── tailwind.config.ts
├── tsconfig.json
├── public/
└── src/
    ├── main.tsx                   // React entry, providers
    ├── App.tsx                    // Router + AuthGuard
    ├── index.css                  // Tailwind + CSS vars
    │
    ├── pages/
    │   ├── LoginPage.tsx          // Email/SĐT + Password/OTP
    │   ├── LocationsPage.tsx      // Danh sách Địa Điểm được phân công (was Albums)
    │   ├── LocationDetailPage.tsx // Ảnh do mình upload trong ĐĐ
    │   ├── UploadPage.tsx         // Drag-drop bulk upload
    │   ├── MyStatsPage.tsx        // Thống kê cá nhân (mới — v2)
    │   ├── OrdersPage.tsx         // Danh sách đơn hàng (list only)
    │   └── ProfilePage.tsx        // Thông tin cá nhân staff
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx        // Nav: Địa Điểm, Upload, TK NV, Orders
    │   │   ├── TopBar.tsx         // User info + logout
    │   │   └── PageLayout.tsx     // Sidebar + Main content grid
    │   │
    │   ├── upload/
    │   │   ├── DropZone.tsx       // Drag-drop area, file validate
    │   │   ├── UploadProgress.tsx // Per-file progress, retry
    │   │   ├── BatchUploader.tsx  // Queue 20 files, parallel upload
    │   │   └── UploadStats.tsx    // Total/success/failed count
    │   │
    │   ├── gallery/
    │   │   ├── PhotoGrid.tsx      // Grid ảnh, chỉ ảnh do mình upload
    │   │   ├── PhotoCard.tsx      // Thumbnail + status
    │   │   └── PhotoDetail.tsx    // Modal chi tiết ảnh
    │   │
    │   ├── stats/                     // Mới — v2
    │   │   └── MyStatsView.tsx    // Thống kê cá nhân: cards + biểu đồ + ĐĐ được phân công
    │   │
    │   ├── orders/
    │   │   └── OrderTable.tsx     // Table đơn hàng + status badge
    │   │
    │   └── ui/                    // Shared UI (hoặc từ @photopro/ui)
    │
    ├── hooks/
    │   ├── useAuth.ts             // Login, logout, token refresh
    │   ├── useLocations.ts        // React Query: fetch locations (v2)
    │   ├── useUpload.ts           // Upload queue, progress tracking
    │   ├── usePhotos.ts           // Fetch photos by location
    │   └── useOrders.ts           // Fetch order list
    │
    ├── stores/
    │   ├── authStore.ts           // JWT tokens, user info, role
    │   ├── uploadStore.ts         // Upload queue, progress state
    │   └── selectionStore.ts      // Selected photos for tagging
    │
    ├── services/
    │   ├── api.ts                 // Axios + JWT interceptor
    │   ├── auth.ts                // login, refresh, logout
    │   ├── locations.ts            // getLocations, getLocationPhotos (v2)
    │   ├── photos.ts              // uploadPhotos
    │   └── orders.ts              // getOrders
    │
    └── types/
        └── index.ts               // Staff, Location, Photo, Order (v2)
```

---

### 9.4 Admin Dashboard — React + Vite

```
apps/admin-dashboard/
├── package.json
├── vite.config.ts                 // Proxy /api → backend :3008
├── tailwind.config.ts
├── public/
└── src/
    ├── main.tsx                   // React entry, providers
    ├── App.tsx                    // Router + RoleGuard
    ├── index.css
    │
    ├── pages/
    │   ├── LoginPage.tsx          // Admin login
    │   ├── DashboardPage.tsx      // Stats, charts, alerts — All roles
    │   ├── LocationsPage.tsx      // CRUD Địa Điểm (was Albums) — Sys+Sales
    │   ├── LocationDetailPage.tsx // Photos in ĐĐ, staff chỉ xem ảnh mình
    │   ├── StaffPage.tsx          // CRUD staff (+ Mã NV, Địa điểm) — System only
    │   ├── StaffStatsPage.tsx     // Staff statistics (mới — v2) — All roles
    │   ├── PricingPage.tsx        // Bundle pricing CRUD — Sys+Sales
    │   ├── DiscountsPage.tsx      // Discount codes CRUD — Sys+Sales
    │   ├── OrdersPage.tsx         // Orders (ảnh từ album ĐH) — Sys+Sales full / Manager summary
    │   ├── RevenuePage.tsx        // Charts, export — Sys+Sales
    │   ├── SettingsPage.tsx       // Domain, bank, branding, color picker — System only
    │   └── ProfilePage.tsx        // Hồ sơ cá nhân — All roles
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AdminSidebar.tsx   // Role-based menu items
    │   │   ├── AdminTopBar.tsx    // Role badge, notifications, logout
    │   │   ├── AdminLayout.tsx    // Sidebar + content grid
    │   │   └── RoleGuard.tsx      // Route guard by permission
    │   │
    │   ├── dashboard/
    │   │   ├── StatCard.tsx       // Label + value + change %
    │   │   ├── RevenueChart.tsx   // Bar/line chart — Recharts
    │   │   ├── TopPackages.tsx    // Gói bán chạy ranked list
    │   │   ├── PendingLocations.tsx // Địa điểm chờ publish (v2)
    │   │   ├── ActiveStaff.tsx    // Staff online + ảnh hôm nay
    │   │   └── DeleteWarnings.tsx // Ảnh sắp bị xóa alert
    │   │
    │   ├── locations/                  // Đổi từ albums/
    │   │   ├── LocationTable.tsx  // Card grid + status + actions
    │   │   ├── LocationForm.tsx   // Create/Edit ĐĐ modal (+ staff assign)
    │   │   ├── LocationView.tsx   // View detail modal (stats + staff)
    │   │   └── PublishButton.tsx  // Publish location (check bank verified)
    │   │
    │   ├── staff/
    │   │   ├── StaffTable.tsx     // Table + role badge + Mã NV + ĐĐ + actions
    │   │   ├── StaffForm.tsx      // Create/Edit staff modal (+ employee_code, locations khi role=Staff)
    │   │   └── PermissionMatrix.tsx // Role × permission grid ✅/❌
    │   │
    │   ├── staff-stats/               // Mới — v2
    │   │   ├── StaffStatsTable.tsx // Bảng thống kê tất cả staff
    │   │   ├── StaffStatsModal.tsx // Modal chi tiết + biểu đồ
    │   │   └── MyStats.tsx        // Trang thống kê cá nhân (cho Staff)
    │   │
    │   ├── pricing/
    │   │   ├── PricingTable.tsx   // Bundle packages table
    │   │   ├── PricingForm.tsx    // Create/Edit package modal
    │   │   ├── DiscountTable.tsx  // Discount codes table
    │   │   └── DiscountForm.tsx   // Create/Edit discount modal
    │   │
    │   ├── revenue/
    │   │   ├── RevenueStats.tsx   // 4 stat cards
    │   │   ├── RevenueChart.tsx   // Time-series chart
    │   │   ├── TimeFilter.tsx     // Hôm nay/Tuần/Tháng/Quý/Năm tabs
    │   │   ├── ExportButtons.tsx  // Excel, CSV, PDF export
    │   │   ├── TopLocations.tsx   // Ranked list by revenue (v2)
    │   │   └── TopStaff.tsx       // Ranked list by uploads
    │   │
    │   ├── settings/
    │   │   ├── RetentionSettings.tsx  // Simplified: chỉ input ngày + info note (v2 C2)
    │   │   ├── DeliverySettings.tsx   // Link TTL + max downloads
    │   │   ├── DomainSettings.tsx     // Subdomain + custom domain
    │   │   ├── BankSettings.tsx       // Bank account form
    │   │   └── BrandingSettings.tsx   // 7 presets + Custom color picker HEX (v2 A6) + logo + watermark
    │   │
    │   ├── orders/
    │   │   ├── OrderTable.tsx     // Full order table + actions
    │   │   └── OrderDetail.tsx    // Order detail: ảnh từ album ĐH + link tải + trạng thái (v2 C1)
    │   │
    │   └── ui/                    // Shared UI
    │
    ├── hooks/
    │   ├── useAuth.ts             // Login, role check, permissions
    │   ├── usePermission.ts       // Check role × action matrix
    │   ├── useDashboard.ts        // Fetch dashboard metrics
    │   ├── useRevenue.ts          // Fetch revenue with time filter
    │   └── useExport.ts           // Export data to Excel/CSV/PDF
    │
    ├── stores/
    │   ├── authStore.ts           // JWT, user, role, permissions
    │   └── filterStore.ts         // Time range, location filter (v2)
    │
    ├── services/
    │   ├── api.ts                 // Axios + JWT + role header
    │   ├── dashboard.ts           // getDashboardMetrics
    │   ├── locations.ts           // CRUD locations (was albums), staff assign
    │   ├── staff.ts               // CRUD staff, reset password
    │   ├── staffStats.ts          // getStaffStatistics, getStaffStatDetail (mới — v2)
    │   ├── pricing.ts             // CRUD pricing packages
    │   ├── discounts.ts           // CRUD discount codes
    │   ├── orders.ts              // getOrders, orderDetail (ảnh từ album ĐH), refund
    │   ├── revenue.ts             // getRevenue, exportReport
    │   ├── settings.ts            // get/update all settings
    │   └── brandColors.ts         // getBrandColors, updateBrandColors (mới — v2)
    │
    ├── lib/
    │   ├── permissions.ts         // RBAC permission matrix constants
    │   └── formatters.ts          // formatPrice, formatDate, etc.
    │
    └── types/
        └── index.ts               // All admin interfaces
```

---

### 9.5 Shared Packages

```
packages/
├── ui/                            // @photopro/ui — Shared component library
│   ├── package.json
│   └── src/
│       ├── Button.tsx             // Primary, outline, ghost, sizes
│       ├── Badge.tsx              // Status badges: success, danger, etc.
│       ├── Card.tsx               // Surface card + padded
│       ├── Alert.tsx              // Info, warning, danger, success
│       ├── Table.tsx              // Sortable, hover, responsive
│       ├── Toggle.tsx             // On/off toggle switch
│       ├── TagPill.tsx            // Toggleable tag pill
│       ├── Skeleton.tsx           // Loading placeholder shimmer
│       ├── ProgressBar.tsx        // Fill bar + percentage
│       ├── Modal.tsx              // Dialog overlay + close
│       ├── FormInput.tsx          // Input + label + hint + error
│       ├── Select.tsx             // Dropdown select
│       ├── Tabs.tsx               // Tab navigation
│       └── theme.css              // CSS variables: colors, radius, shadows
│
├── types/                         // @photopro/types — TypeScript interfaces
│   ├── package.json
│   └── src/
│       ├── business.ts            // Business, Settings
│       ├── user.ts                // User, Staff, Role enums
│       ├── location.ts            // Location (v2 — thay thế Album)
│       ├── photo.ts               // Photo, FaceEmbedding, SearchResult
│       ├── order.ts               // Order, OrderItem, Payment
│       ├── delivery.ts            // DeliveryLink, DownloadLog
│       ├── pricing.ts             // PricingPackage, DiscountCode
│       └── api.ts                 // ApiResponse, Pagination, ErrorResponse
│
├── utils/                         // @photopro/utils — Shared utilities
│   ├── package.json
│   └── src/
│       ├── format.ts              // formatPrice, formatDate, formatPhone
│       ├── autopack.ts            // Auto-pack pricing algorithm
│       ├── validation.ts          // Phone, email, file validators
│       └── constants.ts           // Roles, statuses, limits
│
└── api-client/                    // @photopro/api-client — Shared API
    ├── package.json
    └── src/
        ├── client.ts              // Axios base instance, interceptors
        ├── auth.ts                // login, refresh, logout
        └── endpoints.ts           // API endpoint constants
```

---

> **File HTML demo đi kèm:** `photopro-demo.html`  
> Mở bằng trình duyệt để xem bố cục thực tế với tất cả các trang, mock data, và color picker.  
> *Cập nhật: 02/2026*
