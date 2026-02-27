# PHOTOPRO — ĐẶC TẢ CHI TIẾT FRONTEND & DASHBOARD

> **Phiên bản:** 2.1  
> **Cập nhật:** 26/02/2026  
> **Mục đích:** Tài liệu đặc tả chi tiết giao diện người dùng cho Website khách hàng và Dashboard quản trị  

---

## ⚠️ LƯU Ý QUAN TRỌNG VỀ TAGS

### Hệ thống chỉ sử dụng 2 loại định danh:

1. **ALBUM (Tag type='album')** 
   - Dùng để nhóm ảnh theo địa điểm/sự kiện
   - VD: "Bà Nà Hills", "Hội An Ancient Town", "Cầu Rồng"
   - Khách hàng chọn album để quét mặt
   - Hiển thị trong trang /albums

2. **MÃ ĐƠN HÀNG (Order Code)**
   - Dùng để tra cứu đơn hàng đã mua
   - Format: WL + 4 số + 3 chữ (VD: WL2024ABC)
   - Khách hàng dùng mã này hoặc SĐT để tra cứu và tải ảnh
   - Hiển thị trong trang /lookup

### ❌ KHÔNG sử dụng Category Tags

**Các tags sau ĐÃ BỊ XÓA và KHÔNG cần thiết:**
- ❌ `#couple`, `#solo`, `#family`, `#group`
- ❌ `#portrait`, `#landscape`, `#sunset`
- ❌ `#night`, `#day`, `#indoor`, `#outdoor`
- ❌ Bất kỳ tag phân loại nội dung nào khác

**Lý do:**
- Hệ thống tập trung vào **nhận diện khuôn mặt AI** để tìm ảnh
- Khách hàng chỉ quan tâm: "Ảnh của tôi ở đâu?" → Không cần filter theo nội dung
- Đơn giản hóa UX: Chọn Album → Quét mặt → Nhận ảnh
- Tra cứu đơn hàng chỉ cần: Mã đơn hàng HOẶC số điện thoại

---

## MỤC LỤC

### PHẦN A — WEBSITE KHÁCH HÀNG
1. [Tổng quan Website](#1-tổng-quan-website)
2. [Design Templates](#2-design-templates)
3. [Trang Landing (Giới thiệu doanh nghiệp)](#3-trang-landing-giới-thiệu-doanh-nghiệp)
4. [Trang Chọn Album để Quét Mặt](#4-trang-chọn-album-để-quét-mặt)
5. [Trang Quét Mặt & Kết Quả](#5-trang-quét-mặt--kết-quả)
6. [Trang Giỏ Hàng & Checkout](#6-trang-giỏ-hàng--checkout)
7. [Trang Thanh Toán Thành Công](#7-trang-thanh-toán-thành-công)
8. [Trang Tra Cứu Đơn Hàng](#8-trang-tra-cứu-đơn-hàng)
9. [Responsive & Mobile](#9-responsive--mobile)
10. [UI Components Chung](#10-ui-components-chung)

### PHẦN B — DASHBOARD QUẢN TRỊ
11. [Tổng Quan Dashboard](#11-tổng-quan-dashboard)
12. [Layout & Navigation](#12-layout--navigation)
13. [Trang Login](#13-trang-login)
14. [Dashboard Home](#14-dashboard-home)
15. [Quản lý Album (Tag type='album')](#15-quản-lý-album-tag-typealbum)
16. [Quản lý Folder](#16-quản-lý-folder)
17. [Upload Ảnh (Staff)](#17-upload-ảnh-staff)
18. [Quản lý Giá & Combo](#18-quản-lý-giá--combo)
19. [Quản lý Đơn Hàng](#19-quản-lý-đơn-hàng)
20. [Thống Kê Doanh Thu](#20-thống-kê-doanh-thu)
21. [Quản lý Nhân Viên](#21-quản-lý-nhân-viên)
22. [Cấu hình Hệ Thống](#22-cấu-hình-hệ-thống)
23. [Phân Quyền Theo Role](#23-phân-quyền-theo-role)
24. [Tech Stack Frontend](#24-tech-stack-frontend)

---

# PHẦN A — WEBSITE KHÁCH HÀNG

## 1. TỔNG QUAN WEBSITE

### 1.1 Mục đích

Website **landing page bán ảnh du lịch** cho doanh nghiệp nhiếp ảnh:
- Giới thiệu doanh nghiệp và dịch vụ chụp ảnh du lịch
- Hướng dẫn khách hàng quét mặt tìm ảnh của mình
- Bán ảnh HD cho khách du lịch

> **QUAN TRỌNG:** Website KHÔNG hiển thị gallery ảnh công khai.  
> Khách hàng CHỈ thấy ảnh sau khi quét mặt tìm được ảnh của mình.  
> Album chỉ hiện ẢNH BÌA (ảnh phong cảnh đẹp) để thu hút và cho biết địa điểm chụp.

### 1.2 Luồng khách hàng

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LUỒNG KHÁCH HÀNG                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐             │
│   │  Quét QR  │       │  Landing  │       │   Chọn    │             │
│   │   Site    │  ───→ │   Page    │  ───→ │   Album   │             │
│   │           │       │ (Giới    │       │ (chỉ ảnh  │             │
│   │           │       │  thiệu)   │       │   bìa)    │             │
│   └───────────┘       └───────────┘       └───────────┘             │
│                              │                   │                   │
│                              │                   ▼                   │
│                              │            ┌───────────┐             │
│                              └──────────→ │  QUÉT MẶT │             │
│                                           │  TÌM ẢNH  │             │
│                                           └───────────┘             │
│                                                  │                   │
│                                                  ▼                   │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐             │
│   │  Thanh    │       │ Checkout  │       │  KẾT QUẢ  │             │
│   │   Toán    │  ←─── │           │  ←─── │ (ảnh của  │             │
│   │           │       │           │       │   bạn)    │             │
│   └───────────┘       └───────────┘       └───────────┘             │
│         │                                                            │
│         ▼                                                            │
│   ┌───────────┐                                                      │
│   │  Thành    │                                                      │
│   │   Công    │  ← Countdown 7 ngày (168h) + Link tải               │
│   │           │                                                      │
│   └───────────┘                                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Sitemap

```
{subdomain}.photopro.vn/
├── /                     → Landing Page (giới thiệu + CTA quét mặt)
├── /albums               → Chọn album để quét mặt (CHỈ hiện ảnh bìa)
├── /face-search          → Quét mặt tìm ảnh (toàn site)
├── /face-search/{album}  → Quét mặt trong album cụ thể
├── /cart                 → Giỏ hàng
├── /checkout             → Thanh toán
├── /order/success/{id}   → Trang thành công (có countdown)
└── /order/lookup         → Tra cứu đơn hàng
```

> **Lưu ý:** KHÔNG có trang `/album/{slug}` xem gallery ảnh.

### 1.4 Tech Stack

| Công nghệ | Vai trò |
|-----------|---------|
| Next.js 14+ (App Router) | Framework React + SSR/ISR |
| TailwindCSS | Styling |
| shadcn/ui (Radix) | Component library |
| TensorFlow.js | Face detection (trình duyệt) |
| ONNX Runtime Web | Embedding extraction (trình duyệt) |
| Zustand | State management (giỏ hàng) |
| next/image | Tối ưu ảnh |

---

## 2. DESIGN TEMPLATES

Hệ thống hỗ trợ nhiều template thiết kế, doanh nghiệp có thể chọn 1 trong các template có sẵn hoặc tùy chỉnh màu sắc.

### 2.1 Elegant Dark (tông tối sang trọng)

```
┌───────────────────────────────────────────────────────────────┐
│  Palette:                                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │#0F0F0F│ │#1A1A1A│ │#D4AF37│ │#FFFFFF│ │#888888│            │
│  │ BG    │ │ Card  │ │Accent │ │ Text  │ │Subtle │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                               │
│  Font: Playfair Display (heading) + Inter (body)              │
│  Style: Luxury, elegant, photography studio                   │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Beach Bright (tông sáng biển)

```
┌───────────────────────────────────────────────────────────────┐
│  Palette:                                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │#F8FAFC│ │#FFFFFF│ │#0EA5E9│ │#0F172A│ │#F97316│            │
│  │ BG    │ │ Card  │ │Primary│ │ Text  │ │Accent │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                               │
│  Font: Nunito (heading) + Open Sans (body)                    │
│  Style: Fresh, vacation, beach/resort                         │
└───────────────────────────────────────────────────────────────┘
```

### 2.3 Minimal Clean (tối giản)

```
┌───────────────────────────────────────────────────────────────┐
│  Palette:                                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │#FFFFFF│ │#FAFAFA│ │#2563EB│ │#111827│ │#6B7280│            │
│  │ BG    │ │ Card  │ │Primary│ │ Text  │ │Subtle │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                               │
│  Font: DM Sans (heading + body)                               │
│  Style: Clean, modern, professional                           │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. TRANG LANDING (GIỚI THIỆU DOANH NGHIỆP)

> **Mục đích:** Giới thiệu doanh nghiệp du lịch, dịch vụ chụp ảnh, và hướng dẫn khách tìm ảnh.  
> **QR Code:** Cấp SITE, dẫn đến `{subdomain}.photopro.vn`

### 3.1 Wireframe Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo]  WONDERLAND PHOTO                         [Tìm ảnh] [Tra cứu]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │                    [HERO IMAGE - ẢNH PHONG CẢNH ĐẸP]           │  │
│  │                    (Bà Nà Hills / Hội An / Biển)               │  │
│  │                                                                │  │
│  │         ┌─────────────────────────────────────────┐            │  │
│  │         │                                         │            │  │
│  │         │     📸 LƯU GIỮ KHOẢNH KHẮC ĐẸP          │            │  │
│  │         │       TRONG CHUYẾN DU LỊCH              │            │  │
│  │         │                                         │            │  │
│  │         │  Chúng tôi đã chụp hàng nghìn bức ảnh   │            │  │
│  │         │  tại các điểm du lịch nổi tiếng.        │            │  │
│  │         │  Tìm ảnh của bạn chỉ với 1 selfie!      │            │  │
│  │         │                                         │            │  │
│  │         │          [  TÌM ẢNH CỦA TÔI  ]          │            │  │
│  │         │                                         │            │  │
│  │         └─────────────────────────────────────────┘            │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ── CÁCH TÌM ẢNH CỦA BẠN ─────────────────────────────────────────   │
│                                                                      │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐        │
│   │       1       │    │       2       │    │       3       │        │
│   │               │    │               │    │               │        │
│   │      📱       │    │     🔍       │    │     💳       │         │
│   │               │    │               │    │               │        │
│   │  Chụp Selfie  │ →  │  AI tìm ảnh   │ →  │  Mua & Tải    │        │
│   │  hoặc tải ảnh │    │  có bạn trong │    │  ảnh HD về    │        │
│   │  có mặt bạn   │    │  vài giây     │    │  điện thoại   │        │
│   │               │    │               │    │               │        │
│   └───────────────┘    └───────────────┘    └───────────────┘        │
│                                                                      │
│  ── VỀ CHÚNG TÔI ─────────────────────────────────────────────────   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  [Ảnh team]     WONDERLAND PHOTO                               │  │
│  │                                                                │  │
│  │                 Chúng tôi là đội ngũ nhiếp ảnh chuyên nghiệp   │  │
│  │                 chuyên chụp ảnh cho du khách tại các điểm      │  │
│  │                 du lịch nổi tiếng miền Trung Việt Nam:         │  │
│  │                                                                │  │
│  │                 📍 Bà Nà Hills · Hội An · Đà Nẵng · Sơn Trà    │  │
│  │                                                                │  │
│  │                 Với công nghệ AI nhận diện khuôn mặt,          │  │
│  │                 bạn có thể tìm được ảnh của mình chỉ trong     │  │
│  │                 vài giây mà không cần xem qua hàng nghìn ảnh.  │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ── ĐỊA ĐIỂM CHỤP ẢNH GẦN ĐÂY ────────────────────────────────────   │
│                                                                      │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐│
│  │                    │ │                    │ │                    ││
│  │   [ẢNH BÌA -       │ │   [ẢNH BÌA -       │ │   [ẢNH BÌA -       ││
│  │    PHONG CẢNH]     │ │    PHONG CẢNH]     │ │    PHONG CẢNH]     ││
│  │                    │ │                    │ │                    ││
│  ├────────────────────┤ ├────────────────────┤ ├────────────────────┤│
│  │ 📍 Bà Nà Hills     │ │ 📍 Hội An Night   │ │ 📍 Biển Mỹ Khê    ││
│  │ 📅 20/02/2026      │ │ 📅 19/02/2026     │ │ 📅 18/02/2026     ││
│  │                    │ │                    │ │                    ││
│  │ [TÌM ẢNH TẠI ĐÂY]│ │ │ [TÌM ẢNH TẠI ĐÂY]│ │ │  [TÌM ẢNH TẠI ĐÂY] ││
│  └────────────────────┘ └────────────────────┘ └────────────────────┘│
│                                                                      │
│             [  XEM TẤT CẢ ĐỊA ĐIỂM  ]                                │
│                                                                      │
│  ── BẢNG GIÁ (Admin TÙY CHỈNH) ────────────────────────────────────  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │   💰 GÓI GIÁ ẢNH HD (Bundle Pricing)                           │  │
│  │                                                                │  │
│  │   ┌────────────────┬────────────────┬────────────────┐         │  │
│  │   │   GÓI 1 ẢNH    │   GÓI 3 ẢNH    │   GÓI 8 ẢNH    │         │  │
│  │   │   20,000đ      │   50,000đ      │  100,000đ      │         │  │
│  │   │                │  (tiết kiệm 17%)│ (tiết kiệm 37%)│         │  │
│  │   └────────────────┴────────────────┴────────────────┘         │  │
│  │                                                                │  │
│  │   💡 Hệ thống tự chọn gói tối ưu (Auto-pack):                  │  │
│  │   • Chọn 2 ảnh → Đề xuất Gói 3 (tiết kiệm thêm 1 ảnh!)         │  │
│  │   • Chọn 5 ảnh → Đề xuất Gói 8 (tiết kiệm hơn!)                │  │
│  │                                                                │  │
│  │   ⚙️ Giá do Admin doanh nghiệp tùy chỉnh                       │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ── CÂU HỎI THƯỜNG GẶP ───────────────────────────────────────────   │
│                                                                      │
│  ▸ Làm sao tìm được ảnh của tôi?                                     │
│    Chỉ cần chụp selfie hoặc tải ảnh có mặt bạn, AI sẽ tìm            │
│    tất cả ảnh có bạn trong hệ thống.                                 │
│                                                                      │
│  ▸ Ảnh selfie của tôi có được lưu không?                             │
│    Không. Ảnh selfie được xử lý ngay trên điện thoại của bạn,        │
│    chúng tôi không lưu trữ ảnh mặt của bạn.                          │
│                                                                      │
│  ▸ Tôi có thể tải ảnh trong bao lâu?                                 │
│    Link tải có hiệu lực 7 ngày sau khi thanh toán (Admin cấu hình). │
│                                                                      │
│  ▸ Tôi quên mã đơn hàng thì sao?                                     │
│    Bạn có thể tra cứu bằng số điện thoại đã đặt hàng.                │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  WONDERLAND PHOTO                                                    │
│  📞 Hotline: 1900 xxxx · 📧 support@wonderland.vn                   │
│  📍 123 Đường ABC, Đà Nẵng                                           │
│  © 2026 Wonderland Photo. All rights reserved.                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Wireframe Mobile

```
┌──────────────────────────────────────┐
│  [☰]    WONDERLAND PHOTO    [🛒]    │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │    [HERO - PHONG CẢNH ĐẸP]     │  │
│  │                                │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │                          │  │  │
│  │  │  📸 LƯU GIỮ KHOẢNH KHẮC  │  │  │
│  │  │     TRONG CHUYẾN ĐI      │  │  │
│  │  │                          │  │  │
│  │  │  Tìm ảnh của bạn chỉ     │  │  │
│  │  │  với 1 selfie!           │  │  │
│  │  │                          │  │  │
│  │  │ [ 🔍 TÌM ẢNH CỦA TÔI ]   │  │  │
│  │  │                          │  │  │
│  │  └──────────────────────────┘  │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  ── CÁCH TÌM ẢNH ──────────────────  │
│                                      │
│   1. � Chụp Selfie                  │
│   2. � AI tìm ảnh có bạn            │
│   3. � Mua & Tải về                 │
│                                      │
│  ── ĐỊA ĐIỂM GẦN ĐÂY ──────────────  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │    [ẢNH BÌA - PHONG CẢNH]      │  │
│  │ 📍 Bà Nà Hills · 20/02/2026    │  │
│  │    [ 🔍 TÌM ẢNH TẠI ĐÂY ]      │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │    [ẢNH BÌA - PHONG CẢNH]      │  │
│  │ 📍 Hội An Night · 19/02/2026   │  │
│  │    [ 🔍 TÌM ẢNH TẠI ĐÂY ]      │  │
│  └────────────────────────────────┘  │
│                                      │
│  [XEM TẤT CẢ ĐỊA ĐIỂM]               │
│                                      │
│  ── BẢNG GIÁ (Admin TÙY CHỈNH) ──────  │
│                                      │
│  Gói 1 ảnh HD: 20,000đ               │
│  Gói 3 ảnh HD: 50,000đ (-17%)        │
│  Gói 8 ảnh HD: 100,000đ (-37%)       │
│                                      │
│  💡 Auto-pack: Hệ thống tự chọn gói  │
│     tối ưu khi bạn chọn ảnh!         │
│                                      │
│  ── FAQ ───────────────────────────  │
│                                      │
│  ▸ Làm sao tìm ảnh?                  │
│  ▸ Ảnh selfie có lưu không?          │
│  ▸ Tải ảnh trong bao lâu?            │
│                                      │
├──────────────────────────────────────┤
│  📞 1900 xxxx · © 2026 Wonderland    │
└──────────────────────────────────────┘
```

### 3.3 Các section chính

| Section | Nội dung | Mục đích |
|---------|----------|----------|
| Hero | Ảnh phong cảnh đẹp + CTA "Tìm ảnh" | Thu hút, action |
| Cách tìm ảnh | 3 bước đơn giản | Hướng dẫn nhanh |
| Về chúng tôi | Giới thiệu team, địa điểm | Tạo uy tín |
| Địa điểm gần đây | Album cards (CHỈ ảnh bìa) | Quick access |
| Bảng giá | Giá đơn lẻ + combo | Minh bạch giá |
| FAQ | Câu hỏi thường gặp | Giải đáp thắc mắc |
| Footer | Contact info | Liên hệ |

### 3.4 Kỹ thuật

| Yếu tố | Chi tiết |
|--------|----------|
| Render | SSR cho SEO (Server Component) |
| Hero image | `next/image` với `priority`, lazy load phần còn lại |
| Albums | ISR (revalidate 60s), chỉ fetch cover image |
| Mobile | Single column, CTA sticky bottom |
| QR | QR code tại quầy dẫn đến URL này |

---

## 4. TRANG CHỌN ALBUM ĐỂ QUÉT MẶT

> **Mục đích:** Khách chọn địa điểm/album để tìm ảnh (tối ưu tốc độ search).  
> **QUAN TRỌNG:** CHỈ hiện ảnh bìa (ảnh phong cảnh), KHÔNG hiện ảnh trong album.

### 4.1 Wireframe Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo]  CHỌN ĐỊA ĐIỂM TÌM ẢNH                [Tìm tất cả] [Tra cứu] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  � BẠN ĐÃ CHỤP ẢNH TẠI ĐÂU?                                          │
│                                                                      │
│  Chọn địa điểm để tìm ảnh nhanh hơn, hoặc                            │
│  [  🔍 TÌM TRONG TẤT CẢ ĐỊA ĐIỂM  ]                                  │
│                                                                      │
│  ── LỌC THEO KHU VỰC ─────────────────────────────────────────────   │
│  [Tất cả] [Bà Nà Hills] [Hội An] [Đà Nẵng] [Sơn Trà]                 │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐      │
│  │                            │  │                            │      │
│  │     [ẢNH BÌA - PHONG       │  │     [ẢNH BÌA - PHONG       │      │
│  │      CẢNH BÀ NÀ HILLS]     │  │      CẢNH HỘI AN]          │      │
│  │                            │  │                            │      │
│  │                            │  │                            │      │
│  ├────────────────────────────┤  ├────────────────────────────┤      │
│  │ 📍 Bà Nà Hills             │  │ 📍 Hội An Ancient Town    │      │
│  │ 📅 20/02/2026              │  │ 📅 19/02/2026             │      │
│  │                            │  │                            │      │
│  │ "Lễ hội mùa xuân"          │  │ "Phố cổ đêm"               │      │
│  │                            │  │                            │      │
│  │  [ 🔍 TÌM ẢNH TẠI ĐÂY ]   │  │  [ 🔍 TÌM ẢNH TẠI ĐÂY ]    │      │
│  └────────────────────────────┘  └────────────────────────────┘      │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐      │
│  │                            │  │                            │      │
│  │     [ẢNH BÌA - PHONG       │  │     [ẢNH BÌA - PHONG       │      │
│  │      CẢNH CẦU RỒNG]        │  │      CẢNH SƠN TRÀ]         │      │
│  │                            │  │                            │      │
│  ├────────────────────────────┤  ├────────────────────────────┤      │
│  │ 📍 Cầu Rồng Đêm           │  │ 📍 Sơn Trà Linh Ứng        │      │
│  │ 📅 18/02/2026             │  │ 📅 17/02/2026              │      │
│  │                            │  │                            │      │
│  │  [ 🔍 TÌM ẢNH TẠI ĐÂY ]   │  │  [ 🔍 TÌM ẢNH TẠI ĐÂY ]    │      │
│  └────────────────────────────┘  └────────────────────────────┘      │
│                                                                      │
│  [  Xem thêm địa điểm  ]                                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  💡 Không nhớ địa điểm?                                        │  │
│  │     [  🔍 TÌM TRONG TẤT CẢ ĐỊA ĐIỂM  ] — AI sẽ tìm giúp bạn    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Wireframe Mobile

```
┌──────────────────────────────────────┐
│  ← Trang chủ           [Tra cứu đơn] │
├──────────────────────────────────────┤
│                                      │
│  🔍 BẠN ĐÃ CHỤP ẢNH TẠI ĐÂU?         │
│                                      │
│  [ 🔍 TÌM TẤT CẢ ĐỊA ĐIỂM ]          │
│                                      │
│  ── HOẶC CHỌN ĐỊA ĐIỂM ──────────    │ 
│                                      │
│  Filter: [Tất cả ▼]                  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │    [ẢNH BÌA - PHONG CẢNH]      │  │
│  │                                │  │
│  │ 📍 Bà Nà Hills                 │  │
│  │ 📅 20/02/2026                  │  │
│  │                                │  │
│  │  [ 🔍 TÌM ẢNH TẠI ĐÂY ]        │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │    [ẢNH BÌA - PHONG CẢNH]      │  │
│  │                                │  │
│  │ 📍 Hội An Night                │  │
│  │ 📅 19/02/2026                  │  │
│  │                                │  │
│  │  [ 🔍 TÌM ẢNH TẠI ĐÂY ]        │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │    [ẢNH BÌA - PHONG CẢNH]      │  │
│  │                                │  │
│  │ 📍 Cầu Rồng Đêm                │  │
│  │ 📅 18/02/2026                  │  │
│  │                                │  │
│  │  [ 🔍 TÌM ẢNH TẠI ĐÂY ]        │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Xem thêm]                          │
│                                      │
├──────────────────────────────────────┤
│  💡 Không nhớ?                       │
│  [ 🔍 TÌM TRONG TẤT CẢ ]             │
└──────────────────────────────────────┘
```

### 4.3 Album Card Components

```
┌────────────────────────────────────────┐
│                                        │
│        [ẢNH BÌA - PHONG CẢNH]          │  ← CHỈ ảnh phong cảnh đẹp
│        (Cover image của album)         │     KHÔNG hiện ảnh người
│                                        │
├────────────────────────────────────────┤
│                                        │
│  📍 Tên địa điểm                       │
│  📅 Ngày chụp                          │
│                                        │
│  "Mô tả ngắn về buổi chụp"             │  ← Optional
│                                        │
│     [ 🔍 TÌM ẢNH TẠI ĐÂY ]            │  ← CTA chính
│                                        │
└────────────────────────────────────────┘

⚠️ KHÔNG có:
- Số lượng ảnh (không cho biết có bao nhiêu ảnh)
- Nút "Xem album" (không có trang xem ảnh)
- Preview thumbnails (không hiện ảnh người)
```

### 4.4 API Mapping

| Thành phần | API Endpoint | Ghi chú |
|------------|--------------|---------|
| Album list | `GET /api/v1/tags?type=album&status=published` | Chỉ lấy info cơ bản |
| Cover image | `album.cover_photo_url` | Ảnh phong cảnh (do Admin set) |

### 4.5 Kỹ thuật

| Yếu tố | Chi tiết |
|--------|----------|
| Render | SSR initial + client pagination |
| Card | Chỉ hiện cover image + info |
| Click CTA | Navigate đến `/face-search/{album-slug}` |
| Filter | Client-side nếu < 50 albums |

---

## 5. TRANG QUÉT MẶT & KẾT QUẢ

> **Đây là nơi duy nhất khách hàng được xem ảnh của mình!**
> 
> Ảnh có watermark, click để xem lớn hơn trong Lightbox.
> Thêm vào giỏ để mua bản HD không watermark.

### 5.1 Bước 1: Giao diện quét mặt

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Quay lại                                                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              🔍 TÌM ẢNH CỦA BẠN                                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ PHẠM VI TÌM KIẾM:                                            │    │
│  │                                                              │    │
│  │ ● Tất cả album  (12 album, ~1,800 ảnh)                       │    │
│  │ ○ Album hiện tại: Bà Nà Hills 20/02  (150 ảnh) — nhanh hơn   │    │
│  │ ○ Chọn album:                                                │    │
│  │   ☑ Bà Nà Hills 20/02           (150 ảnh)                    │    │
│  │   ☐ Hội An Night 19/02          (200 ảnh)                    │    │
│  │   ☐ Cầu Rồng Đêm 18/02          (120 ảnh)                    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │              ┌────────────────────┐                          │    │
│  │              │                    │                          │    │
│  │              │   Camera preview   │                          │    │
│  │              │   (live feed)      │                          │    │
│  │              │                    │                          │    │
│  │              │   [Khung mặt]      │                          │    │
│  │              │                    │                          │    │
│  │              └────────────────────┘                          │    │
│  │                                                              │    │
│  │      [  📸 CHỤP SELFIE  ]   hoặc   [  📤 TẢI ẢNH LÊN  ]     │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  💡 Mẹo để tìm chính xác hơn:                                │    │
│  │  · Bỏ kính mắt & mũ                                          │    │
│  │  · Chụp thẳng mặt, ánh sáng đủ                               │    │
│  │  · Nếu không tìm thấy, thử album khác                        │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  🔒 Ảnh selfie của bạn được xử lý ngay trên thiết bị.                │
│     Chúng tôi không lưu trữ ảnh mặt của bạn.                         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Bước 2: Đang xử lý (loading)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│              🔍 ĐANG TÌM ẢNH CỦA BẠN...                              │
│                                                                      │
│              ┌────────────────────┐                                  │
│              │                    │                                  │
│              │  [Ảnh selfie vừa   │                                  │
│              │   chụp — hiện      │                                  │
│              │   trên device]     │                                  │
│              │                    │                                  │
│              └────────────────────┘                                  │
│                                                                      │
│              ████████████░░░░░░░░  65%                               │
│                                                                      │
│              ✅ Nhận diện khuôn mặt                                  │
│              ✅ Trích xuất đặc trưng                                 │
│              ⏳ Đang tìm kiếm trong 12 album...                      │
│              ○ Hiển thị kết quả                                      │
│                                                                      │
│              Ước tính: ~2 giây                                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.3 Bước 3: Kết quả

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Quét lại                                     [📸 Quét mặt khác] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🎯 TÌM THẤY 18 ẢNH TRONG 3 ALBUM                (⏱ 1.8 giây)      │
│                                                                      │
│  ── Bà Nà Hills 20/02 (8 ảnh) ────────────────────────────────────  │
│                                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │ 98%  │ │ 95%  │ │ 93%  │ │ 90%  │ │ 88%  │  [+3 ảnh nữa]        │
│  │      │ │      │ │      │ │      │ │      │                       │
│  │[thumb│ │[thumb│ │[thumb│ │[thumb│ │[thumb│                       │
│  │ nail]│ │ nail]│ │ nail]│ │ nail]│ │ nail]│                       │
│  │      │ │      │ │      │ │      │ │      │                       │
│  │ [+🛒]│ │ [+🛒]│ │ [+🛒]│ │ [+🛒]│ │ [+🛒]│                       │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                       │
│                                                                      │
│  ── Hội An Night 19/02 (7 ảnh) ───────────────────────────────────  │
│                                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  [+2 ảnh nữa]        │
│  │ 94%  │ │ 91%  │ │ 87%  │ │ 83%  │ │ 80%  │                       │
│  │[thumb│ │[thumb│ │[thumb│ │[thumb│ │[thumb│                       │
│  │+cart]│ │+cart]│ │+cart]│ │+cart]│ │+cart]│                       │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                       │
│                                                                      │
│  ── Cầu Rồng 18/02 (3 ảnh) ──────────────────────────────────────  │
│                                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐                                         │
│  │ 85%  │ │ 78%  │ │ 72%  │                                         │
│  └──────┘ └──────┘ └──────┘                                         │
│                                                                      │
│  ── CHỌN NHANH ───────────────────────────────────────────────────  │
│  [Chọn tất cả 18 ảnh]  [Chọn top 10 (≥85%)]  [Bỏ chọn tất cả]      │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  🛒 STICKY BAR (Auto-pack Bundle Pricing)                            │
│                                                                      │
│  5 ảnh đã chọn                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 💡 GÓI 8 ẢNH: 100,000đ — Chọn thêm 3 ảnh nữa miễn phí!         │ │
│  │    Hoặc: Gói 3 + Gói 3 = 100,000đ (dư 1 ảnh)                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                    [  CHỌN THÊM  ]     [  THANH TOÁN 100K →  ]      │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.4 API Mapping

| Thành phần | API Endpoint | Ghi chú |
|------------|--------------|---------|
| Face search | `POST /api/v1/face-search` | Body: embedding vector + album_ids (optional) |
| Results | Response: `[{photo_id, similarity, album_id, thumbnail_url}]` | Sorted by similarity DESC |

### 5.5 Kỹ thuật

| Yếu tố | Chi tiết |
|--------|----------|
| Face Detection | TensorFlow.js (MediaPipe) — chạy trên browser |
| Embedding | ONNX Runtime Web (MobileFaceNet) — chạy trên browser |
| Privacy | Selfie KHÔNG gửi lên server, chỉ gửi embedding vector 512d |
| Pre-filter | Nếu chọn album, API sẽ filter theo `album_id` trước khi vector search |
| Results | Sort theo similarity DESC, group theo album |
| Thumbnail | CDN cached, load ~200ms |
| Click | Mở Lightbox (preview lớn + watermark) |
| Quick select | Giúp mobile UX (ít tap) |
| Combo suggestion | Nếu số ảnh chọn gần combo → suggest |

---

## 6. TRANG GIỎ HÀNG & CHECKOUT

> **Quan trọng:** Giá theo GÓI (Bundle Pricing) với auto-pack logic.
> Hệ thống tự tính gói tối ưu dựa trên số ảnh khách chọn.

### 6.1 Giỏ hàng

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Tiếp tục mua                                   🛒 GIỎ HÀNG       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────┐  Ảnh #1 (Bà Nà Hills)          HD Download             🗑 │
│  │[thumb│  ────────────────────────────────────────────────────────  │
│  └──────┘                                                            │
│  ┌──────┐  Ảnh #2 (Bà Nà Hills)          HD Download             🗑 │
│  │[thumb│  ────────────────────────────────────────────────────────  │
│  └──────┘                                                            │
│  ┌──────┐  Ảnh #3 (Hội An)               HD Download             🗑 │
│  │[thumb│  ────────────────────────────────────────────────────────  │
│  └──────┘                                                            │
│  ┌──────┐  Ảnh #4 (Hội An)               HD Download             🗑 │
│  │[thumb│  ────────────────────────────────────────────────────────  │
│  └──────┘                                                            │
│  ┌──────┐  Ảnh #5 (Cầu Rồng)             HD Download             🗑 │
│  └──────┘                                                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  💡 AUTO-PACK — Hệ thống tự chọn gói tối ưu                  │   │
│  │                                                              │   │
│  │  Bạn có 5 ảnh HD. Gói tối ưu:                                │   │
│  │                                                              │   │
│  │  ┌───────────────────────────────────────────────────────┐   │   │
│  │  │ ● GÓI 8 ẢNH: 100,000đ  ← KHUYÊN DÙNG (dư 3 ảnh!)     │   │   │
│  │  │   Bạn có thể chọn thêm 3 ảnh nữa miễn phí!           │   │   │
│  │  │                                                       │   │   │
│  │  │ ○ Gói 3 + Gói 3: 100,000đ (5 ảnh, dư 1 ảnh)          │   │   │
│  │  │                                                       │   │   │
│  │  │ ○ Mua đơn lẻ:    100,000đ (5 × 20k)                   │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  │        [  CHỌN THÊM ẢNH (còn 3 slot)  ]                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ────────────────────────────────────────────────────────────────── │
│  TỔNG:                                    100,000đ (Gói 8 ảnh)      │
│                                                                      │
│                          [  TIẾN HÀNH THANH TOÁN →  ]               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Auto-pack Logic (Client-side)

```javascript
// Auto-pack algorithm
function calculateOptimalBundle(photoCount, bundles) {
  // bundles = [{photo_count: 1, price: 20000}, {photo_count: 3, price: 50000}, {photo_count: 8, price: 100000}]
  
  // Sort bundles by price per photo (best value first)
  const sorted = bundles.sort((a, b) => 
    (a.price / a.photo_count) - (b.price / b.photo_count)
  );
  
  let remaining = photoCount;
  let totalPrice = 0;
  const selectedBundles = [];
  
  // Greedy: pick largest bundle that fits
  for (const bundle of sorted.reverse()) {
    while (remaining >= bundle.photo_count || 
           (bundle.photo_count - remaining <= 3 && totalPrice === 0)) {
      // Allow up to 3 "free" slots if it's a better deal
      selectedBundles.push(bundle);
      remaining -= bundle.photo_count;
      totalPrice += bundle.price;
      if (remaining <= 0) break;
    }
  }
  
  return { selectedBundles, totalPrice, extraSlots: Math.abs(remaining) };
}
```

### 6.3 Checkout

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Giỏ hàng                                      THANH TOÁN          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📦 TÓM TẮT ĐƠN                                                     │
│  Gói 8 ảnh HD (chọn 5, còn 3 slot)                   100,000đ        │
│                                                                      │
│  ────────────────────────────────────────────────────────────────── │
│                                                                      │
│  📱 THÔNG TIN LIÊN HỆ                                               │
│                                                                      │
│  Số điện thoại *  [___________________________]                      │
│  (Bắt buộc — để gửi thông báo đơn hàng)                              │
│                                                                      │
│  ☐ Tôi muốn nhận link tải qua email                                 │
│  ┌────────────────────────────────────────────────────────┐          │
│  │ Email         [___________________________]            │  ← Hiện │
│  │ (Không bắt buộc)                                       │  khi ☑  │
│  └────────────────────────────────────────────────────────┘          │
│                                                                      │
│  (Nếu có ảnh in)                                                     │
│  📍 ĐỊA CHỈ GIAO HÀNG                                               │
│  Họ tên *    [___________________________]                           │
│  Địa chỉ *   [___________________________]                           │
│  Tỉnh/TP *   [________▼] Quận/Huyện * [________▼]                   │
│                                                                      │
│  ────────────────────────────────────────────────────────────────── │
│                                                                      │
│  💳 PHƯƠNG THỨC THANH TOÁN                                          │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ ● [VNPay logo] VNPay (QR / ATM / Visa)                    │     │
│  │ ○ [MoMo logo]  MoMo                                       │     │
│  │ ○ [ZP logo]    ZaloPay                                    │     │
│  │ ○ [Stripe]     Thẻ quốc tế (Visa / Mastercard)            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ────────────────────────────────────────────────────────────────── │
│  TỔNG:                                              200,000đ         │
│                                                                      │
│              [     THANH TOÁN 200,000đ     ]                        │
│                                                                      │
│  🔒 Giao dịch bảo mật · Hỗ trợ: hotline 1900xxxx                   │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.3 API Mapping

| Thành phần | API Endpoint | Ghi chú |
|------------|--------------|---------|
| Create order | `POST /api/v1/orders` | Body: items, phone (required), email (optional) |
| Payment init | `POST /api/v1/payments/init` | Returns redirect URL |
| Payment callback | `GET /api/v1/payments/callback` | VNPay/MoMo callback |

### 6.4 Kỹ thuật

| Yếu tố | Chi tiết |
|--------|----------|
| Form validation | React Hook Form + Zod |
| Phone | Required, format validation |
| Email | Optional (checkbox toggle), email format validation |
| Cart state | Zustand / localStorage |
| Payment | Redirect to gateway, then callback |

---

## 7. TRANG THANH TOÁN THÀNH CÔNG

> **Quan trọng:** Trang này hiển thị countdown (mặc định 7 ngày = 168h) và link tải ảnh

### 7.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo]  WONDERLAND PHOTO                                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              ✅ THANH TOÁN THÀNH CÔNG!                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │   Mã đơn hàng:  #ORD-2026022400123                          │   │
│  │   Ngày mua:     24/02/2026 14:30                            │   │
│  │   Số ảnh:       Gói 8 ảnh HD (chọn 5)                       │   │
│  │   Tổng tiền:    100,000đ                                    │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │   ⏰ THỜI GIAN CÒN LẠI ĐỂ TẢI ẢNH:                         │   │
│  │                                                              │   │
│  │           ┌──────┬──────┬──────┐                            │   │
│  │           │  167 │  45  │  23  │                            │   │
│  │           │ giờ  │ phút │ giây │                            │   │
│  │           └──────┴──────┴──────┘                            │   │
│  │                                                              │   │
│  │   Link tải sẽ hết hạn: 03/03/2026 14:30                    │   │
│  │   Lượt tải còn lại: 5/5                                     │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── ẢNH CỦA BẠN ───────────────────────────────────────────────── │
│                                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │[thumb│ │[thumb│ │[thumb│ │[thumb│ │[thumb│                      │
│  │ nail]│ │ nail]│ │ nail]│ │ nail]│ │ nail]│                      │
│  │      │ │      │ │      │ │      │ │      │                      │
│  │ [TẢI]│ │ [TẢI]│ │ [TẢI]│ │ [TẢI]│ │ [TẢI]│                      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                                      │
│         [  📥 TẢI TẤT CẢ (.zip)  ]                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  💡 LƯU Ý QUAN TRỌNG:                                       │   │
│  │                                                              │   │
│  │  • Vui lòng tải ảnh trong thời hạn (mặc định 7 ngày)        │   │
│  │  • Mỗi ảnh được tải tối đa 5 lần                            │   │
│  │  • Lưu mã đơn hàng để tra cứu sau                           │   │
│  │  • Nếu cần hỗ trợ, liên hệ hotline 1900xxxx                 │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  📧 Đã gửi thông tin đơn hàng đến:                          │   │
│  │     ĐT: 09xx xxx 789                                        │   │
│  │     Email: k***@gmail.com (nếu có)                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│          [  TIẾP TỤC MUA SẮM  ]    [  TRA CỨU ĐƠN HÀNG  ]          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.2 Countdown Logic

```javascript
// Countdown component logic
const expiresAt = order.expires_at; // ISO timestamp from API
const now = new Date();
const remaining = expiresAt - now; // milliseconds

// Display
const hours = Math.floor(remaining / (1000 * 60 * 60));
const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

// When expired
if (remaining <= 0) {
  showExpiredMessage();
  disableDownloadButtons();
}
```

### 7.3 API Mapping

| Thành phần | API Endpoint | Ghi chú |
|------------|--------------|---------|
| Order detail | `GET /api/v1/orders/{order_id}` | Include `expires_at`, `download_remaining` |
| Download single | `GET /api/v1/downloads/{photo_id}?token={token}` | Signed URL |
| Download all | `GET /api/v1/downloads/zip/{order_id}?token={token}` | ZIP download |

---

## 8. TRANG TRA CỨU ĐƠN HÀNG

### 8.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  TRA CỨU ĐƠN HÀNG                                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Nhập mã đơn hàng hoặc số điện thoại đã đặt:                        │
│  [____________________________]  [TRA CỨU]                          │
│                                                                      │
│  ── KẾT QUẢ ────────────────────────────────────────────────────── │
│                                                                      │
│  Đơn #ORD-2026022400123                                              │
│  Ngày đặt: 24/02/2026 14:30                                         │
│  Trạng thái: ✅ Đã thanh toán · Ảnh HD sẵn sàng                     │
│                                                                      │
│  ⏰ THỜI GIAN CÒN LẠI: 71:45:23                                     │
│                                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │[ảnh] │ │[ảnh] │ │[ảnh] │ │[ảnh] │ │[ảnh] │                      │
│  │[TẢI] │ │[TẢI] │ │[TẢI] │ │[TẢI] │ │[TẢI] │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                                      │
│  [  TẢI TẤT CẢ (.zip)  ]                                            │
│                                                                      │
│  Lượt tải còn lại: 3/5                                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 8.2 Các trạng thái đơn hàng

| Trạng thái | Hiển thị | Actions |
|------------|----------|---------|
| pending | ⏳ Chờ thanh toán | [Thanh toán lại] |
| paid | ✅ Đã thanh toán | [Tải ảnh] + countdown |
| expired | ⌛ Đã hết hạn | "Link đã hết hạn. Liên hệ hỗ trợ." |
| refunded | 💰 Đã hoàn tiền | — |

---

## 9. RESPONSIVE & MOBILE

| Breakpoint | Layout | Ghi chú |
|-----------|--------|---------|
| Mobile (< 640px) | 1 column, bottom nav, full-width cards | 80% traffic |
| Tablet (640–1024px) | 2 columns, side nav collapse | |
| Desktop (> 1024px) | 3–4 columns, full nav | |

### Mobile-first features

| Feature | Implementation |
|---------|----------------|
| Camera API | `getUserMedia` cho chụp selfie trực tiếp |
| Touch | Swipe gallery, pull-to-refresh |
| Bottom sheet | Giỏ hàng, bộ lọc |
| PWA | Installable, offline model cache (Service Worker) |

---

## 10. UI COMPONENTS CHUNG

| Component | Thư viện | Mô tả |
|-----------|---------|-------|
| Button, Input, Card, Dialog | shadcn/ui | Radix UI primitives + TailwindCSS |
| Image Gallery | `react-masonry-css` | Masonry layout |
| Lightbox | `yet-another-react-lightbox` | Swipe, zoom, full-screen |
| Toast | shadcn/ui Toast | Notifications |
| Skeleton | shadcn/ui Skeleton | Loading placeholders |
| Camera | Custom (getUserMedia + Canvas) | Face capture |
| Icons | Lucide React | Consistent icon set |
| Charts | Recharts | Dashboard charts |
| Countdown | Custom component | Countdown display (Admin cấu hình TTL) |

---

# PHẦN B — DASHBOARD QUẢN TRỊ

## 11. TỔNG QUAN DASHBOARD

### 11.1 Mục đích

Ứng dụng quản trị cho nhân viên doanh nghiệp:
- **Admin System:** Toàn quyền
- **Admin Sales:** Quản lý nghiệp vụ, không quản lý hệ thống
- **Manager:** Chỉ xem thống kê (read-only)
- **Staff:** Chỉ upload ảnh + gắn tag (KHÔNG tạo album)

### 11.2 Tech Stack

| Công nghệ | Vai trò |
|-----------|---------|
| React 18+ | UI framework |
| Vite | Build tool |
| TailwindCSS + shadcn/ui | Styling + component library |
| React Router v6 | Routing |
| React Query (TanStack Query) | Data fetching + cache |
| Recharts | Charts & graphs |
| React Hook Form + Zod | Form + validation |
| react-dropzone | File upload (drag & drop) |
| date-fns | Date formatting |
| xlsx (SheetJS) | Export Excel |

---

## 12. LAYOUT & NAVIGATION

### 12.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo] PHOTOPRO DASHBOARD           [🔔 3] [Nguyễn Văn A ▼]        │
├──────────┬───────────────────────────────────────────────────────────┤
│          │                                                           │
│  MENU    │  NỘI DUNG CHÍNH                                          │
│          │                                                           │
│ (icon)   │                                                           │
│ 🏠 Home  │                                                           │
│          │                                                           │
│ 📁 Folder│                                                           │
│  └ DS Folder│                                                        │
│          │                                                           │
│ 📷 Album │  ← Album = Tag với type='album'                          │
│  └ DS Album│                                                         │
│  └ Category│                                                         │
│          │                                                           │
│ 📸 Upload│  ← (Staff thấy mục này + Home)                           │
│          │                                                           │
│ 💰 Gói giá│  ← Bundle Pricing (Admin TÙY CHỈNH)                      │
│          │                                                           │
│ 📦 Đơn hàng│                                                         │
│          │                                                           │
│ 📊 Thống kê│  ← (Manager chỉ thấy mục này)                          │
│          │                                                           │
│ 👤 Nhân viên│ ← (Admin System only)                                  │
│          │                                                           │
│ ⚙️ Hệ thống│ ← (Admin System only)                                   │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 12.2 Menu visibility theo role

| Menu | Admin System | Admin Sales | Manager | Staff |
|------|:------------:|:-----------:|:-------:|:-----:|
| Home (overview) | ✅ | ✅ | ✅ (limited) | ✅ (limited) |
| Folder | ✅ | ✅ | ❌ | ❌ |
| Album | ✅ | ✅ | ❌ | ❌ |
| Upload | ✅ | ✅ | ❌ | ✅ (album được assign) |
| Gói giá (Bundle) | ✅ | ✅ | ❌ | ❌ |
| Đơn hàng | ✅ | ✅ | ❌ | ❌ |
| Thống kê | ✅ | ✅ | ✅ (read-only) | ❌ |
| Nhân viên | ✅ | ❌ | ❌ | ❌ |
| Hệ thống | ✅ | ❌ | ❌ | ❌ |

---

## 13. TRANG LOGIN

### 13.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│              [Logo]                                                  │
│              PHOTOPRO DASHBOARD                                      │
│                                                                      │
│              ┌──────────────────────────────┐                       │
│              │                              │                       │
│              │  Email                       │                       │
│              │  [________________________] │                       │
│              │                              │                       │
│              │  Mật khẩu                    │                       │
│              │  [________________________] │                       │
│              │                              │                       │
│              │  ☐ Ghi nhớ đăng nhập         │                       │
│              │                              │                       │
│              │  [    ĐĂNG NHẬP    ]         │                       │
│              │                              │                       │
│              │  Quên mật khẩu?              │                       │
│              │                              │                       │
│              └──────────────────────────────┘                       │
│                                                                      │
│              Hỗ trợ: support@company.com                            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 13.2 API Mapping

| Action | API Endpoint | Response |
|--------|--------------|----------|
| Login | `POST /api/v1/auth/login` | `{access_token, refresh_token, user}` |
| Refresh | `POST /api/v1/auth/refresh` | `{access_token}` |
| Logout | `POST /api/v1/auth/logout` | — |

---

## 14. DASHBOARD HOME

### 14.1 Admin System / Admin Sales

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  🏠 TỔNG QUAN                    Hôm nay: 24/02/2026     │
│          │                                                           │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│          │  │ Doanh thu│ │ Đơn hàng │ │ Ảnh bán  │ │ Album    │    │
│          │  │ hôm nay  │ │ hôm nay  │ │ hôm nay  │ │ active   │    │
│          │  │ 2.3M VND │ │    18    │ │    52    │ │    12    │    │
│          │  │ +15% ▲   │ │ +8% ▲    │ │ +12% ▲   │ │          │    │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│          │                                                           │
│          │  ┌─────────────────────────────────────────────────┐     │
│          │  │ 📊 Doanh thu 7 ngày qua (line chart)           │     │
│          │  │                                                 │     │
│          │  │  3M ┤                    ╭──╮                   │     │
│          │  │  2M ┤          ╭──╮     │  │  ╭──╮             │     │
│          │  │  1M ┤   ╭──╮ │  ╰──╮ ╰──╯  │  │              │     │
│          │  │     └───╯  ╰─╯     ╰──────╯  ╰──             │     │
│          │  │      18  19  20  21  22  23  24               │     │
│          │  └─────────────────────────────────────────────────┘     │
│          │                                                           │
│          │  ── ĐƠN HÀNG GẦN ĐÂY ──────────────── [Xem tất cả →]   │
│          │  #ORD-123 │ 14:30 │ 200K │ Combo 5 │ ✅ Paid             │
│          │  #ORD-122 │ 13:15 │ 50K  │ Đơn lẻ  │ ✅ Paid             │
│          │  #ORD-121 │ 12:45 │ 120K │ Combo 3 │ ⏳ Pending          │
│          │                                                           │
│          │  ── ALBUM GẦN ĐÂY ────────────────── [Xem tất cả →]    │
│          │  Bà Nà Hills │ 150 ảnh │ PUBLISHED │ 23 ảnh bán         │
│          │  Hội An Night│ 200 ảnh │ PUBLISHED │ 15 ảnh bán         │
│          │  Cầu Rồng    │  45 ảnh │ PROCESSING│ —                   │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 14.2 Manager (chỉ xem thống kê)

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  🏠 THỐNG KÊ                     Hôm nay: 24/02/2026     │
│          │                                                           │
│  Home    │  (Chỉ hiện KPI cards + biểu đồ + bảng thống kê)         │
│  Thống kê│  Không có nút chỉnh sửa, tạo mới, xóa.                  │
│          │  Không thấy menu Album, Giá, Đơn hàng, Nhân viên.        │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 14.3 Staff

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  🏠 TỔNG QUAN                                            │
│          │                                                           │
│  Home    │  Album được phân công:                                    │
│  Upload  │  ┌───────────────────────────────────────────────────┐   │
│          │  │ Bà Nà Hills 20/02  │ 150 ảnh uploaded │ PUBLISHED│   │
│          │  │ Hội An 19/02       │  80 ảnh uploaded │ PUBLISHED│   │
│          │  └───────────────────────────────────────────────────┘   │
│          │                                                           │
│          │  Tổng ảnh upload tháng này: 420                          │
│          │                                                           │
│          │  ⚠️ Lưu ý: Bạn chỉ có thể upload ảnh vào album được     │
│          │     phân công và gắn tag cho ảnh.                        │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

---

## 15. QUẢN LÝ ALBUM (Tag type='album')

> **Lưu ý:** Album = Tag với `type='album'`. Không có bảng albums riêng.

### 15.1 Danh sách Album

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  📷 ALBUM                                    [+ Tạo album]│
│          │                                                           │
│          │  Filter: [Tất cả ▼] [Published ▼] [Tháng 02 ▼]           │
│          │  Search: [Tìm album...________]                          │
│          │                                                           │
│          │  ┌──────────────────────────────────────────────────────┐│
│          │  │ Tên              │Folder  │Ngày   │Ảnh  │TT   │Act  ││
│          │  ├──────────────────┼────────┼───────┼─────┼─────┼─────┤│
│          │  │ Bà Nà Hills 20/02│Folder A│20/02  │ 150 │PUB  │✏️👁🗑││
│          │  │ Hội An Night     │Folder A│19/02  │ 200 │PUB  │✏️👁🗑││
│          │  │ Cầu Rồng Đêm     │Folder B│18/02  │ 120 │DRAFT│✏️👁🗑││
│          │  │ Sơn Trà          │Folder B│17/02  │ 180 │ARCH │✏️👁🗑││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                           │
│          │  🗑 = Xóa (Admin System only)                            │
│          │  ✏️ = Sửa thông tin album                                │
│          │  👁 = Xem chi tiết + ảnh trong album                     │
│          │                                                           │
│          │  Pagination: [← Prev] 1 2 3 ... 10 [Next →]              │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 15.2 Tạo / Sửa Album (Dialog)

```
┌──────────────────────────────────────────────────────────────────────┐
│  TẠO ALBUM MỚI                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tên album *       [Bà Nà Hills 22/02/2026_______________]          │
│  Folder *          [Folder Bà Nà Hills ▼]                           │
│  Địa điểm          [Bà Nà Hills, Đà Nẵng________________]          │
│  Ngày chụp *       [22/02/2026] 📅                                  │
│  Category          [Bà Nà Hills ▼]                                  │
│  Mô tả             [___________________________________]            │
│                     [___________________________________]            │
│  Ảnh bìa           [Kéo thả hoặc chọn file]                        │
│                                                                      │
│  Staff phụ trách *                                                  │
│  ☑ Nguyễn Văn A                                                     │
│  ☑ Trần Thị B                                                       │
│  ☐ Lê Văn C                                                         │
│                                                                      │
│  Giá riêng album (để trống = dùng giá mặc định)                    │
│  HD Download:  [________] VND                                       │
│  Print 10×15:  [________] VND                                       │
│                                                                      │
│          [HỦY]                    [TẠO ALBUM]                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 15.3 Chi tiết Album — Quản lý ảnh

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  📷 Bà Nà Hills 20/02        [Publish] [Archive] [Sửa]   │
│          │  📍 Bà Nà Hills · 📅 20/02 · 📷 150 ảnh · 👤 2 Staff    │
│          │                                                           │
│          │  Tab: [Tất cả ảnh] [Đã index] [Lỗi] [Thống kê]          │
│          │                                                           │
│          │  ☐ Chọn tất cả    [🗑 Xóa đã chọn] (Admin System only)  │
│          │                                                           │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│          │  │☐     │ │☐     │ │☐     │ │☐     │ │☐     │          │
│          │  │[thumb│ │[thumb│ │[thumb│ │[thumb│ │[thumb│          │
│          │  │ nail]│ │ nail]│ │ nail]│ │ nail]│ │ nail]│          │
│          │  │      │ │      │ │      │ │      │ │      │          │
│          │  │2 face│ │1 face│ │3 face│ │0 face│ │1 face│          │
│          │  │READY │ │READY │ │READY │ │READY │ │PROC. │          │
│          │  │[Tags]│ │[Tags]│ │[Tags]│ │[Tags]│ │[Tags]│          │
│          │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│          │                                                           │
│          │  Showing 1-50 of 150   [1] [2] [3] [→]                  │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 15.4 API Mapping

| Action | API Endpoint | Ghi chú |
|--------|--------------|---------|
| List albums | `GET /api/v1/tags?type=album` | Query tags với type='album' |
| Create album | `POST /api/v1/tags` | Body: `{type: 'album', ...}` |
| Update album | `PUT /api/v1/tags/{id}` | Update tag fields |
| Delete album | `DELETE /api/v1/tags/{id}` | Admin System only |
| Assign staff | `POST /api/v1/tags/{id}/users` | Assign staff to album |

---

## 16. QUẢN LÝ FOLDER

### 16.1 Danh sách Folder

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  📁 FOLDER                                  [+ Tạo folder]│
│          │                                                           │
│          │  ┌──────────────────────────────────────────────────────┐│
│          │  │ Tên Folder        │Albums │Ảnh   │Created  │Actions ││
│          │  ├───────────────────┼───────┼──────┼─────────┼────────┤│
│          │  │ Bà Nà Hills 2026  │   5   │ 750  │ Jan 2026│ ✏️ 🗑  ││
│          │  │ Hội An Collection │   3   │ 420  │ Jan 2026│ ✏️ 🗑  ││
│          │  │ Đà Nẵng Beach     │   8   │ 1200 │ Feb 2026│ ✏️ 🗑  ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                           │
│          │  Lưu ý: Folder dùng để nhóm albums, tương ứng với folder │
│          │  trên server lưu trữ ảnh gốc.                            │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 16.2 API Mapping

| Action | API Endpoint | Ghi chú |
|--------|--------------|---------|
| List folders | `GET /api/v1/folders` | List all folders |
| Create folder | `POST /api/v1/folders` | Body: `{name, description}` |
| Update folder | `PUT /api/v1/folders/{id}` | Update folder info |
| Delete folder | `DELETE /api/v1/folders/{id}` | Admin System only, require empty |

---

## 17. UPLOAD ẢNH (STAFF)

> **Quan trọng:** Staff chỉ có thể upload vào album được phân công và gắn tag. KHÔNG thể tạo album mới.

### 17.1 Wireframe

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  📸 UPLOAD ẢNH                                           │
│          │                                                           │
│          │  Album: [Bà Nà Hills 20/02 ▼]  (chỉ hiện album được assign)│
│          │                                                           │
│          │  ⚠️ Bạn chỉ có thể upload vào album được phân công.      │
│          │                                                           │
│          │  ┌──────────────────────────────────────────────────────┐│
│          │  │                                                      ││
│          │  │     ╔═══════════════════════════════════════╗        ││
│          │  │     ║                                       ║        ││
│          │  │     ║    📤 Kéo thả ảnh vào đây             ║        ││
│          │  │     ║                                       ║        ││
│          │  │     ║    hoặc  [Chọn file]                  ║        ││
│          │  │     ║                                       ║        ││
│          │  │     ║    JPEG, PNG, HEIC · Max 50MB/ảnh    ║        ││
│          │  │     ║    Tối đa 100 ảnh / lần              ║        ││
│          │  │     ║                                       ║        ││
│          │  │     ╚═══════════════════════════════════════╝        ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                           │
│          │  ── TIẾN TRÌNH UPLOAD ────────────────────────────────  │
│          │                                                           │
│          │  IMG_001.jpg  ████████████████████ 100%  ✅ Uploaded     │
│          │  IMG_002.jpg  ████████████████░░░░  80%  ⏳ Uploading    │
│          │  IMG_003.jpg  ████████░░░░░░░░░░░░  40%  ⏳ Uploading    │
│          │  IMG_004.jpg  ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ Waiting      │
│          │  ...                                                      │
│          │                                                           │
│          │  Upload: 25/100 · Processing: 15 · Indexed: 10           │
│          │                                                           │
│          │  ── ẢNH ĐÃ UPLOAD TRONG ALBUM NÀY ─────────────────────  │
│          │  (Grid thumbnails, click để gắn tag)                     │
│          │                                                           │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│          │  │[thumb│ │[thumb│ │[thumb│ │[thumb│ │[thumb│          │
│          │  │[Tags]│ │[Tags]│ │[Tags]│ │[Tags]│ │[Tags]│          │
│          │  │[+Tag]│ │[+Tag]│ │[+Tag]│ │[+Tag]│ │[+Tag]│          │
│          │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 17.2 Gắn Tag cho ảnh

```
┌──────────────────────────────────────────────────────────────────────┐
│  GẮN TAG CHO ẢNH                                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐                                           │
│  │                      │                                           │
│  │    [ẢNH PREVIEW]     │                                           │
│  │                      │                                           │
│  └──────────────────────┘                                           │
│                                                                      │
│  Tags hiện tại:                                                     │
│  [Bà Nà Hills ×] [Sunrise ×] [Couple ×]                            │
│                                                                      │
│  Thêm tag:                                                          │
│  [Tìm hoặc chọn tag...________________]                             │
│                                                                      │
│  Tags gợi ý:                                                        │
│  [Family] [Wedding] [Portrait] [Landscape] [Night]                  │
│                                                                      │
│          [HỦY]                    [LƯU TAGS]                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 17.3 Kỹ thuật upload

| Yếu tố | Chi tiết |
|--------|----------|
| Method | Multipart upload, chunk 5MB (resumable) |
| Concurrent | 3 files đồng thời |
| Retry | Tự động retry khi fail (3 lần) |
| Progress | Progress bar per file + tổng thể |
| Library | `react-dropzone` |
| File types | JPEG, PNG, HEIC |
| Max size | 50MB/ảnh |
| Max batch | 100 ảnh/lần |

### 17.4 API Mapping

| Action | API Endpoint | Ghi chú |
|--------|--------------|---------|
| Upload photo | `POST /api/v1/photos/upload` | Multipart, include album_id |
| Get assigned albums | `GET /api/v1/users/me/albums` | Albums staff được assign |
| Add tags | `POST /api/v1/photos/{id}/tags` | Body: `{tag_ids: [...]}` |
| Remove tag | `DELETE /api/v1/photos/{id}/tags/{tag_id}` | Remove one tag |

---

## 18. QUẢN LÝ GÓI GIÁ (Bundle Pricing)

> **Quan trọng:** Giá theo GÓI (Bundle), KHÔNG phải giá đơn lẻ.
> Admin System/Admin Sales có thể tạo/sửa/xóa gói giá.

### 18.1 Danh sách gói giá

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  💰 GÓI GIÁ (Bundle Pricing)              [+ Thêm gói]   │
│          │                                                           │
│ Gói giá  │  ⚙️ Admin tùy chỉnh gói giá — giá được áp dụng toàn site │
│          │                                                           │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ Số ảnh  │ Giá (VND)      │ Tiết kiệm │ Actions    │  │
│          │  ├─────────┼────────────────┼───────────┼────────────┤  │
│          │  │    1    │ [  20,000  ]   │     —     │  ✏️  🗑   │  │
│          │  │    3    │ [  50,000  ]   │    17%    │  ✏️  🗑   │  │
│          │  │    8    │ [ 100,000  ]   │    37%    │  ✏️  🗑   │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                           │
│          │  💡 AUTO-PACK LOGIC:                                     │
│          │  ┌──────────────────────────────────────────────────────┐│
│          │  │ Khi khách chọn k ảnh, hệ thống tự tính gói tối ưu:  ││
│          │  │                                                      ││
│          │  │ • k=1 → Gói 1 ảnh (20k)                              ││
│          │  │ • k=2 → Đề xuất Gói 3 ảnh (50k, mua dư 1 ảnh)        ││
│          │  │ • k=3 → Gói 3 ảnh (50k)                              ││
│          │  │ • k=4..8 → Gói 8 ảnh (100k)                          ││
│          │  │ • k=9 → Gói 8 + Gói 1 (120k)                         ││
│          │  │ • k=10 → Gói 8 + Gói 3 (150k) — đề xuất mua thêm     ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 18.2 Tạo/Sửa gói giá (Dialog)

```
┌──────────────────────────────────────────────────────────────────────┐
│  THÊM GÓI GIÁ MỚI                                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Số lượng ảnh *  [___5___]                                          │
│                                                                      │
│  Giá gói (VND) * [__80,000__]                                       │
│                                                                      │
│  So sánh với mua lẻ:                                                │
│  5 ảnh × 20,000đ = 100,000đ                                         │
│  → Tiết kiệm: 20,000đ (20%)                                         │
│                                                                      │
│          [HỦY]                    [TẠO GÓI]                         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 18.3 Preview khách hàng thấy

```
┌──────────────────────────────────────────────────────────────────────┐
│  PREVIEW — Bảng giá hiển thị trên website                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   💰 GÓI GIÁ ẢNH HD (Bundle Pricing)                                │
│                                                                      │
│   ┌────────────────┬────────────────┬────────────────┐              │
│   │   GÓI 1 ẢNH    │   GÓI 3 ẢNH    │   GÓI 8 ẢNH    │              │
│   │   20,000đ      │   50,000đ      │  100,000đ      │              │
│   │                │  (tiết kiệm 17%)│ (tiết kiệm 37%)│              │
│   └────────────────┴────────────────┴────────────────┘              │
│                                                                      │
│   💡 Hệ thống tự chọn gói tối ưu khi bạn chọn ảnh!                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 18.4 API Mapping

| Action | API Endpoint | Ghi chú |
|--------|--------------|---------|
| List bundles | `GET /api/v1/bundle-pricing` | Danh sách gói giá |
| Create bundle | `POST /api/v1/bundle-pricing` | Body: `{photo_count, price}` |
| Update bundle | `PUT /api/v1/bundle-pricing/{id}` | Update gói |
| Delete bundle | `DELETE /api/v1/bundle-pricing/{id}` | Admin System/Sales only |

---

## 19. QUẢN LÝ ĐƠN HÀNG

### 19.1 Danh sách đơn hàng

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  📦 ĐƠN HÀNG                                             │
│          │                                                           │
│          │  Filter: [Tất cả ▼] [Paid ▼] [Hôm nay ▼]                │
│          │  Search: [Mã đơn / SĐT...________]                       │
│          │                                                           │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ Mã đơn   │Ngày     │Khách          │Tổng  │TT    │  │
│          │  ├──────────┼─────────┼───────────────┼──────┼──────┤  │
│          │  │ ORD-123  │24/02 14h│09xx xxx 789   │200K  │✅Paid│  │
│          │  │ ORD-122  │24/02 13h│09xx xxx 456   │ 50K  │✅Paid│  │
│          │  │ ORD-121  │24/02 12h│09xx xxx 123   │120K  │⏳Pend│  │
│          │  │ ORD-120  │23/02 18h│09xx xxx 987   │350K  │✅Dlvd│  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 19.2 Chi tiết đơn hàng

```
┌──────────────────────────────────────────────────────────────────────┐
│  ĐƠN #ORD-123                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Khách: 09xx xxx 789                                                 │
│  Email: k***@gmail.com (nếu có)                                     │
│  Loại: Combo 5 ảnh HD · Album: Bà Nà Hills                         │
│  Tổng: 200,000đ · Cổng: VNPay · TT: 24/02 14:32                    │
│                                                                      │
│  ⏰ Thời gian còn lại: 71:45:23                                     │
│  Link hết hạn: 27/02 14:32                                          │
│  Downloads: 2/5                                                      │
│                                                                      │
│  Ảnh: [thumb] [thumb] [thumb] [thumb] [thumb]                       │
│                                                                      │
│  Trạng thái: ✅ PAID → DELIVERED                                    │
│                                                                      │
│  [Hoàn tiền]  [Gia hạn link]                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 20. THỐNG KÊ DOANH THU

### 20.1 Trang thống kê

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  📊 THỐNG KÊ DOANH THU                                   │
│          │                                                           │
│          │  Period: [Ngày ▼] [Tuần] [Tháng] [Quý] [Năm]            │
│          │  Range:  [01/02/2026] → [28/02/2026]     [Export CSV]   │
│          │                                                           │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│          │  │ Tổng     │ │ Đơn hàng │ │ Ảnh bán  │ │ TB/đơn   │    │
│          │  │ doanh thu│ │          │ │          │ │          │    │
│          │  │ 45.2M    │ │   320    │ │   1,240  │ │ 141K     │    │
│          │  │ +18% ▲   │ │ +12% ▲   │ │ +22% ▲   │ │ +5% ▲    │    │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│          │                                                           │
│          │  ┌─────────────────────────────────────────────────┐     │
│          │  │ 📈 Doanh thu theo thời gian (line chart)       │     │
│          │  │                                                 │     │
│          │  │  10M ┤              ╭──╮                        │     │
│          │  │   5M ┤    ╭──╮   ╭─╯  ╰──╮   ╭──╮              │     │
│          │  │      └────╯  ╰───╯       ╰───╯  ╰──            │     │
│          │  │       01  05  10  15  20  25  28               │     │
│          │  └─────────────────────────────────────────────────┘     │
│          │                                                           │
│          │  ┌─────────────────────┐  ┌─────────────────────┐        │
│          │  │ 📊 Theo Album      │  │ 🥧 Theo sản phẩm   │        │
│          │  │                     │  │                     │        │
│          │  │ Bà Nà    ████ 35% │  │ HD Digital  ████ 65%│        │
│          │  │ Hội An   ███  25% │  │ Print 10x15 ██  20%│        │
│          │  │ Đà Nẵng  ██   20% │  │ Print 13x18 █   15%│        │
│          │  │ Other    ██   20% │  │                     │        │
│          │  └─────────────────────┘  └─────────────────────┘        │
│          │                                                           │
│          │  ── CHI TIẾT THEO ALBUM ─────────────────────────────── │
│          │  │ Album           │ Ảnh bán │ Doanh thu │ Combo │      │
│          │  ├─────────────────┼─────────┼───────────┼───────┤      │
│          │  │ Bà Nà Hills     │   450   │  15.8M    │  85%  │      │
│          │  │ Hội An Night    │   320   │  11.2M    │  78%  │      │
│          │  │ Đà Nẵng Beach   │   280   │   9.0M    │  82%  │      │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 20.2 Role "Manager"

- Thấy toàn bộ dữ liệu thống kê
- KHÔNG có nút chỉnh sửa, tạo mới, xóa ở bất kỳ đâu
- Chỉ đọc + Export

---

## 21. QUẢN LÝ NHÂN VIÊN

**(Admin System only)**

### 21.1 Danh sách nhân viên

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  👤 NHÂN VIÊN                         [+ Tạo tài khoản]  │
│          │                                                           │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ Tên            │Email           │Role       │TT│Act│  │
│          │  ├────────────────┼────────────────┼───────────┼──┼───┤  │
│          │  │ Nguyễn Admin   │admin@co.vn     │Admin Sys  │✅│✏️ │  │
│          │  │ Trần Sales     │sales@co.vn     │Admin Sales│✅│✏️🔒│  │
│          │  │ Lê Quản lý     │mgr@co.vn       │Manager    │✅│✏️🔒│  │
│          │  │ Phạm Văn A     │a@co.vn         │Staff      │✅│✏️🔒│  │
│          │  │ Hoàng Thị B    │b@co.vn         │Staff      │❌│✏️🔓│  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 21.2 Tạo tài khoản

```
┌──────────────────────────────────────────────────────────────────────┐
│  TẠO TÀI KHOẢN                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tên *       [________________________]                             │
│  Email *     [________________________]                             │
│  SĐT        [________________________]                             │
│  Role *      [Admin Sales ▼]                                        │
│                                                                      │
│  Roles:                                                              │
│  • Admin System — Toàn quyền                                        │
│  • Admin Sales — Quản lý nghiệp vụ, không quản lý hệ thống          │
│  • Manager — Chỉ xem thống kê (read-only)                           │
│  • Staff — Chỉ upload ảnh + gắn tag (KHÔNG tạo album)               │
│                                                                      │
│  Mật khẩu *  [________] (auto-generate option)                      │
│                                                                      │
│          [HỦY]                        [TẠO TÀI KHOẢN]               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 22. CẤU HÌNH HỆ THỐNG

**(Admin System only)**

### 22.1 Wireframe

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  MENU    │  ⚙️ CẤU HÌNH HỆ THỐNG                                    │
│          │                                                           │
│          │  Tab: [Chung] [Thanh toán] [Email/SMS] [Giao diện]       │
│          │                                                           │
│          │  ── CHUNG ──────────────────────────────────────────────  │
│          │  Tên doanh nghiệp  [________________________]             │
│          │  Logo              [Upload logo]                          │
│          │  Subdomain         [wonderland].photopro.vn               │
│          │  Hotline           [1900xxxx_________________]            │
│          │  Email hỗ trợ      [support@example.com______]           │
│          │                                                           │
│          │  ── QR CODE SITE ───────────────────────────────────────  │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │                                                    │  │
│          │  │  QR Code dẫn đến: wonderland.photopro.vn          │  │
│          │  │                                                    │  │
│          │  │  ┌─────────────┐                                   │  │
│          │  │  │ [QR CODE]   │     [Tải PNG]  [Tải SVG]        │  │
│          │  │  │             │     [In A4]    [In A3]           │  │
│          │  │  └─────────────┘                                   │  │
│          │  │                                                    │  │
│          │  │  ⚠️ Đây là QR duy nhất của site.                  │  │
│          │  │     Đặt tại quầy/khu vực chụp ảnh.                │  │
│          │  │                                                    │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                           │
│          │  ── THANH TOÁN ─────────────────────────────────────────  │
│          │  Tài khoản ngân hàng:                                     │
│          │    Ngân hàng: [Vietcombank ▼]                            │
│          │    Số TK:     [****7890] (encrypted)                     │
│          │    Chủ TK:    [CONG TY TNHH ABC__________]              │
│          │                                                           │
│          │  Cổng thanh toán:                                        │
│          │    ☑ VNPay     Merchant ID: [vnp_xxx] API Key: [***]    │
│          │    ☑ MoMo      Partner Code: [momo_xxx]                  │
│          │    ☐ ZaloPay   (chưa kết nối)                            │
│          │    ☑ Stripe    Key: [sk_***]                             │
│          │                                                           │
│          │  ── GIAO DIỆN WEBSITE ──────────────────────────────────  │
│          │  Theme:                                                   │
│          │    ○ Elegant Dark (tông tối, sang trọng)                 │
│          │    ● Beach Bright (tông sáng, biển)                      │
│          │    ○ Minimal Clean (tối giản)                            │
│          │                                                           │
│          │  ══════════════════════════════════════════════════════  │
│          │  ⚙️ CẤU HÌNH ADMIN TÙY CHỈNH (QUAN TRỌNG)                │
│          │  ══════════════════════════════════════════════════════  │
│          │                                                           │
│          │  ── THỜI HẠN LƯU TRỮ ẢNH ───────────────────────────────  │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ Ảnh chưa bán: [__30__] ngày  (min 7, max 365)      │  │
│          │  │ ☑ Bật auto-delete                                  │  │
│          │  │ ☐ Chỉ xóa ảnh chưa bán                             │  │
│          │  │ ⚠️ Hết hạn → TỰ ĐỘNG XÓA ẢNH                       │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                           │
│          │  ── THỜI HẠN LINK DOWNLOAD ─────────────────────────────  │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ Link tồn tại: [__168__] giờ  (= 7 ngày)            │  │
│          │  │ (min 24, max 720 = 30 ngày)                        │  │
│          │  │ Số lượt tải tối đa: [__5__] lần                    │  │
│          │  │ ⚠️ Hết hạn → LINK MẤT + XÓA ẢNH ĐÃ MUA             │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                           │
│          │  ── GÓI GIÁ (Bundle Pricing) ───────────────────────────  │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ [+ Thêm gói mới]                                   │  │
│          │  │                                                    │  │
│          │  │ Gói 1 ảnh:  [20,000] đ   [Sửa] [Xóa]              │  │
│          │  │ Gói 3 ảnh:  [50,000] đ   [Sửa] [Xóa]              │  │
│          │  │ Gói 8 ảnh: [100,000] đ   [Sửa] [Xóa]              │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                           │
│          │                              [LƯU CẤU HÌNH]             │
│          │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

---

## 23. PHÂN QUYỀN THEO ROLE — TÓM TẮT UI

| Trang Dashboard | Admin System | Admin Sales | Manager | Staff |
|----------------|:------------:|:-----------:|:-------:|:-----:|
| Home (KPI + overview) | Full | Full | Chỉ KPI | Albums mình |
| Folder list + CRUD | Full + DELETE | Full (no DELETE) | ❌ | ❌ |
| Album list + CRUD | Full + DELETE | Full (no DELETE) | ❌ | ❌ |
| Album detail + photos | Full | Full | ❌ | Chỉ album mình (read+tag) |
| Upload ảnh | ✅ | ✅ | ❌ | ✅ (album được assign) |
| Gắn tag cho ảnh | ✅ | ✅ | ❌ | ✅ (album được assign) |
| Gói giá (Bundle Pricing) | ✅ | ✅ | ❌ | ❌ |
| Đơn hàng | ✅ | ✅ | ❌ | ❌ |
| Thống kê doanh thu | Full + export | Full + export | Read-only | ❌ |
| Nhân viên | Full | ❌ | ❌ | ❌ |
| Cấu hình hệ thống | Full (retention, TTL, bundles) | ❌ | ❌ | ❌ |

---

## 24. TECH STACK FRONTEND

### 24.1 Website (Next.js)

```
photopro-web/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (theme, fonts, metadata)
│   ├── page.tsx                # Trang Intro
│   ├── albums/
│   │   └── page.tsx            # Danh sách album
│   ├── album/[slug]/
│   │   ├── page.tsx            # Chi tiết album + gallery
│   │   └── face-search/
│   │       └── page.tsx        # Quét mặt trong album
│   ├── face-search/
│   │   └── page.tsx            # Quét mặt toàn site
│   ├── cart/page.tsx           # Giỏ hàng
│   ├── checkout/page.tsx       # Thanh toán
│   ├── order/
│   │   ├── success/[id]/page.tsx  # Trang thành công + countdown
│   │   └── lookup/page.tsx     # Tra cứu đơn
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── gallery/                # Masonry, Lightbox
│   ├── face-search/            # Camera, model loader, results
│   ├── cart/                   # Cart provider, sticky bar
│   ├── countdown/              # Countdown timer component
│   └── common/                 # Header, Footer, SEO
├── lib/
│   ├── api.ts                  # API client (fetch wrapper)
│   ├── face-ai.ts              # TensorFlow.js + ONNX loader
│   └── cart-store.ts           # Zustand cart state
├── public/
│   └── models/                 # Face AI models (cached by SW)
└── styles/
    └── globals.css             # Tailwind + theme variables
```

### 24.2 Dashboard (React + Vite)

```
photopro-dashboard/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── routes/                 # React Router pages
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx       # Home
│   │   ├── Folders.tsx         # Folder management
│   │   ├── Albums.tsx          # Album (tag type=album) management
│   │   ├── AlbumDetail.tsx     # Photos inside album
│   │   ├── Upload.tsx          # Staff upload
│   │   ├── TagPhotos.tsx       # Tag management for photos
│   │   ├── Pricing.tsx         # Default prices
│   │   ├── Combos.tsx          # Combo management
│   │   ├── Orders.tsx          # Order list + detail
│   │   ├── Statistics.tsx      # Revenue charts
│   │   ├── Users.tsx           # Staff management
│   │   └── SystemConfig.tsx    # System settings
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── layout/             # Sidebar, Header, Breadcrumb
│   │   ├── charts/             # Revenue chart, pie chart
│   │   ├── tables/             # DataTable (sorting, filter, pagination)
│   │   └── forms/              # Album form, Pricing form, User form
│   ├── hooks/
│   │   ├── useAuth.ts          # JWT auth + role check
│   │   ├── usePermission.ts    # UI permission gates
│   │   └── useStats.ts         # Revenue data hooks
│   ├── lib/
│   │   ├── api.ts              # Axios / fetch wrapper
│   │   ├── auth.ts             # Token management
│   │   └── export.ts           # CSV / Excel export
│   └── types/
│       └── index.ts            # TypeScript types
```

### 24.3 Dependencies chính

```json
{
  "website": {
    "next": "^14",
    "tailwindcss": "^3.4",
    "@tensorflow/tfjs": "^4",
    "onnxruntime-web": "^1.17",
    "react-masonry-css": "^1.0",
    "yet-another-react-lightbox": "^3",
    "zustand": "^4",
    "framer-motion": "^11",
    "next-intl": "^3"
  },
  "dashboard": {
    "react": "^18",
    "vite": "^5",
    "tailwindcss": "^3.4",
    "react-router-dom": "^6",
    "@tanstack/react-query": "^5",
    "recharts": "^2",
    "react-hook-form": "^7",
    "zod": "^3",
    "react-dropzone": "^14",
    "date-fns": "^3",
    "xlsx": "^0.18",
    "lucide-react": "^0.300"
  }
}
```

---

# PHỤ LỤC

## A. Tóm tắt các điểm quan trọng

| Điểm | Chi tiết |
|------|----------|
| QR Code | **Site-level** duy nhất, dẫn đến `{subdomain}.photopro.vn` |
| Album | Tag với `type='album'`, KHÔNG có bảng albums riêng |
| Staff | Chỉ upload + gắn tag, KHÔNG tạo album mới |
| Phone | **Bắt buộc** ở checkout |
| Email | **Tùy chọn** (checkbox toggle) |
| Countdown | 168h (7 ngày) mặc định, Admin cấu hình (min 24h, max 720h) |
| Download limit | 5 lượt mặc định |
| Bundle Pricing | 20k/1 ảnh, 50k/3 ảnh, 100k/8 ảnh (Admin tùy chỉnh) |
| Auto-pack | Hệ thống tự tính gói tối ưu khi khách chọn ảnh |
| Retention | Ảnh chưa bán: 30 ngày mặc định (Admin cấu hình 7-365) |

## B. Trạng thái đơn hàng

| Status | Mô tả | Customer UI | Admin UI |
|--------|-------|-------------|----------|
| pending | Chờ thanh toán | [Thanh toán lại] | ⏳ Pending |
| paid | Đã thanh toán | Countdown + Download | ✅ Paid |
| expired | Hết hạn download | "Link đã hết hạn" | ⌛ Expired |
| refunded | Đã hoàn tiền | — | 💰 Refunded |

## C. 5 Roles hệ thống

| Role | Mô tả |
|------|-------|
| admin_system | Toàn quyền hệ thống |
| admin_sales | Quản lý nghiệp vụ (không quản lý user/settings) |
| manager | Chỉ xem thống kê (read-only) |
| staff | Chỉ upload + gắn tag (KHÔNG tạo album) |
| customer | Khách hàng mua ảnh |

---

> *— Hết tài liệu Frontend Specification —*
