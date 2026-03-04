# PHOTOPRO — Tài liệu Đặc tả Kỹ thuật Chi tiết

> **Phiên bản:** 3.0  
> **Cập nhật:** 26/02/2026  
> **Thay đổi quan trọng:** Loại bỏ category tags, chỉ sử dụng Albums và Order Code

---

## ⚠️ THAY ĐỔI QUAN TRỌNG — KHÔNG SỬ DỤNG CATEGORY TAGS

### Hệ thống chỉ dùng 2 loại định danh:

1. **ALBUM (Tag type='album')** 
   - Nhóm ảnh theo địa điểm/sự kiện
   - VD: "Bà Nà Hills 20/02", "Hội An Night 19/02"
   - Khách hàng chọn album để thu hẹp phạm vi tìm kiếm
   - API: `GET /api/v1/tags?type=album&status=published`

2. **MÃ ĐƠN HÀNG (Order Code)**
   - Tra cứu đơn hàng đã thanh toán
   - Format: WL + 4 số + 3 chữ (VD: WL2024ABC)
   - Khách dùng mã này + SĐT để tải ảnh
   - API: `GET /api/v1/orders?code={orderCode}&phone={phone}`

### ❌ KHÔNG sử dụng Category Tags

**Các tags sau đã bị XÓA khỏi hệ thống:**
- ❌ Content tags: `#couple`, `#solo`, `#family`, `#group`
- ❌ Style tags: `#portrait`, `#landscape`, `#sunset`, `#night`
- ❌ Mọi tag phân loại nội dung ảnh khác

**Lý do:**
1. AI nhận diện khuôn mặt → Tìm ảnh theo người, không theo nội dung
2. Đơn giản UX: Album → Quét mặt → Nhận ảnh → Thanh toán
3. Giảm độ phức tạp quản lý: Staff chỉ cần gắn album tag, không cần tag nội dung
4. Tối ưu performance: Giảm số lượng tags cần index

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Kiến trúc tổng thể](#2-kiến-trúc-tổng-thể)
3. [5 Actor & Vai trò](#3-năm-actor--vai-trò)
4. [3 Luồng chính — Chi tiết từng bước](#4-ba-luồng-chính--chi-tiết-từng-bước)
5. [Chi tiết 10 Module](#5-chi-tiết-10-module)
6. [Business Site — Subdomain & Custom Domain](#6-business-site--subdomain--custom-domain)
7. [Hệ thống Nhân viên (Staff Management)](#7-hệ-thống-nhân-viên-staff-management)
8. [Face Search — Tối ưu thuật toán quét mặt & tìm ảnh](#8-face-search--tối-ưu-thuật-toán-quét-mặt--tìm-ảnh)
9. [Bảo mật Hình ảnh (Image Protection)](#9-bảo-mật-hình-ảnh-image-protection)
10. [Thanh toán (Payment)](#10-thanh-toán-payment)
11. [Database Schema đầy đủ (Business/Staff Model)](#11-database-schema-đầy-đủ-businessstaff-model)
12. [Event-Driven Architecture](#12-event-driven-architecture)
13. [API Endpoint Reference](#13-api-endpoint-reference)
14. [AI Face Recognition — Kỹ thuật chi tiết & Tối ưu](#14-ai-face-recognition--kỹ-thuật-chi-tiết--tối-ưu)
15. [Lưu trữ theo Doanh nghiệp (Per-Business Storage)](#15-lưu-trữ-theo-doanh-nghiệp-per-business-storage)
16. [Bảo mật & Phân quyền (RBAC)](#16-bảo-mật--phân-quyền-rbac)
17. [Giao diện — Đề xuất UI/UX từng màn hình](#17-giao-diện--đề-xuất-uiux-từng-màn-hình)
18. [Infrastructure & Deployment](#18-infrastructure--deployment)
19. [Monitoring & Alerting](#19-monitoring--alerting)
20. [Tính năng bổ sung (Roadmap)](#20-tính-năng-bổ-sung-roadmap)
21. [Tech Stack khuyến nghị](#21-tech-stack-khuyến-nghị)
22. [Hệ thống Tag (Tag System)](#22-hệ-thống-tag-tag-system)
23. [Hệ thống Tự động xóa (Auto-Delete System)](#23-hệ-thống-tự-động-xóa-auto-delete-system)
24. [Frontend Specification](#24-frontend-specification)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 PhotoPro là gì?

PhotoPro là hệ thống bán ảnh cho doanh nghiệp nhiếp ảnh tại các điểm du lịch:

- **Mỗi doanh nghiệp có hệ thống riêng** (subdomain `studio-abc.photopro.vn` hoặc domain riêng `photos.studioabc.com`). KHÔNG có multi-tenant, mỗi doanh nghiệp deploy riêng.
- **Trong doanh nghiệp có nhiều thợ ảnh (nhân viên)** làm việc với quyền hạn khác nhau.
- Doanh nghiệp **tự tạo tag/sự kiện** và đưa ảnh vào **category/tag** phù hợp. Mỗi ảnh có thể thuộc nhiều tag/category. **Album = Tag với type='album'**.
- Hệ thống AI **tối ưu tốc độ quét mặt** và **tìm ảnh nhanh** để khách tìm đúng ảnh của mình.
- **Định giá theo gói (Bundle)**: 20k/1 ảnh, 50k/3 ảnh, 100k/8 ảnh,... (Admin cấu hình).
- Sau khi mua, **ảnh được gom thành 1 link download** có thời hạn (Admin cấu hình). Hết hạn → link mất → ảnh đó bị xóa.
- Ảnh tải lên có **thời gian lưu trữ giới hạn** (Admin cấu hình). Hết hạn → tự động xóa.
- Khách thanh toán online → **tiền chuyển thẳng vào tài khoản doanh nghiệp**.

### 1.2 Nguyên tắc kiến trúc

| Nguyên tắc | Giải thích cho dev |
|-------------|---------------------|
| **Module-first** | Mỗi module là 1 service riêng, deploy độc lập, lỗi đâu fix đó. |
| **Event-driven** | Các module giao tiếp qua message queue (RabbitMQ/SQS). KHÔNG gọi HTTP trực tiếp giữa service. |
| **Per-business storage** | Mỗi doanh nghiệp có hệ thống riêng. KHÔNG có multi-tenant. Dữ liệu tách biệt hoàn toàn. |
| **Direct payment** | Tiền thanh toán từ khách chuyển thẳng vào tài khoản doanh nghiệp. Platform thu phí riêng. |
| **Async processing** | Mọi tác vụ nặng (nén ảnh, AI face index) chạy background worker. **Tối ưu tốc độ xử lý**. |
| **Tag-based organization** | Ảnh được quản lý bằng tag/category. 1 ảnh có nhiều tag. **Album = Tag với type='album'**, KHÔNG có table albums riêng. |
| **Time-limited delivery** | Link download có thời hạn. Ảnh có thời hạn lưu trữ. Admin cấu hình thời gian. |
| **Pricing by bundle** | Giá theo gói ảnh (1/3/8 ảnh,...). Hệ thống tự tính gói tối ưu (auto-pack). |

---

## 2. KIẾN TRÚC TỔNG THỂ

### 2.1 Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                             │
│                                                                         │
│  ┌──────────────────┐  ┌───────────────────────┐  ┌──────────────────┐  │
│  │ Staff Portal     │  │  Business Site        │  │   Admin          │  │
│  │ (Nhân viên)      │  │  (Khách hàng)         │  │   Dashboard      │  │
│  │ (React + Vite)   │  │  (Next.js SSR)        │  │   (React + Vite) │  │
│  │                  │  │                       │  │                  │  │
│  │ - Upload ảnh     │  │  - studio.photopro.vn │  │ - Admin System   │  │
│  │ - Gắn tag        │  │  - photos.custom.com  │  │ - Admin Sales    │  │
│  │ - Gắn tag/categ  │  │  - Face search        │  │ - Manager        │  │
│  │ - Xem đơn hàng   │  │  - Mua ảnh / checkout │  │ - Giá & Combo    │  │
│  │                  │  │  - QR entry           │  │ - Thống kê DT    │  │
│  └────────┬─────────┘  └──────────┬────────────┘  └────────┬─────────┘  │
└───────────┼───────────────────────┼────────────────────────┼────────────┘
            │                       │                        │
            └───────────┬───────────┴────────────────────────┘
                        │
          ┌─────────────┴───────────────┐
          │   NGINX REVERSE PROXY       │
          │   + Domain/Subdomain Router │
          │   + API Gateway             │
          │   + JWT Auth Middleware     │
          │   + Rate Limiting + CORS    │
          └─────────────┬───────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────────────┐
│                  SERVICE LAYER (10 Microservices)                       │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 1. Staff     │  │ 2. Media     │  │ 3. Face      │  │ 4. Store-    │ │
│  │    Portal    │  │    Processing│  │    Index &   │  │    front     │ │
│  │    Service   │  │    Pipeline  │  │    Search    │  │    Service   │ │
│  │              │  │    (TỐI ƯU)  │  │    (TỐI ƯU)  │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 5. Order     │  │ 6. Payment   │  │ 7. Delivery  │  │ 8. Admin     │ │
│  │    Service   │  │    Service   │  │    Service   │  │    Service   │ │
│  │              │  │  (Direct Pay)│  │  (Link+Auto  │  │  (3 cấp độ)  │ │
│  │              │  │              │  │   Cleanup)   │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                         │
│  ┌──────────────┐  ┌─────────────────────────────────────────────────┐  │
│  │ 9. Notifi-   │  │ 10. Tag & Category Service                      │  │
│  │    cation    │  │     (Quản lý tag + album + pricing)             │  │
│  └──────────────┘  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
            │
┌───────────┴─────────────────────────────────────────────────────────────┐
│                     MESSAGE BUS                                         │
│         RabbitMQ (dev) / AWS SQS + SNS (prod)                           │
└───────────┬─────────────────────────────────────────────────────────────┘
            │
┌───────────┴────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │PostgreSQL│ │ AWS S3   │ │ Redis    │ │Vector DB │ │ Stripe       │  │
│  │16+       │ │ + CDN    │ │ 7+       │ │(pgvector)│ │ Connect /    │  │
│  │+ pgvector│ │(CloudFr.)│ │ (Cache)  │ │ (TỐI ƯU) │ │ VNPay        │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Tóm tắt các tầng

| Tầng | Thành phần | Công nghệ | Vai trò |
|------|-----------|-----------|---------|
| **Presentation** | 3 frontend apps | React/Next.js + TailwindCSS | UI cho 5 actor (Admin System, Admin Sales, Manager, Staff, Customer) |
| **Nginx Router** | Domain/subdomain router + API GW | Nginx + Lua/OpenResty | Route `*.photopro.vn` + custom domain → đúng business site |
| **Service** | 10 microservices | Node.js (Fastify) + Python (FastAPI) cho AI | Business logic |
| **Message Bus** | Event queue | RabbitMQ / AWS SQS+SNS | Giao tiếp async |
| **Data** | 5 hệ thống | PostgreSQL, S3, Redis, Vector DB, Payment Gateway | Lưu trữ + thanh toán trực tiếp |

---

## 3. NĂM ACTOR & VAI TRÒ

| Actor | Vai trò | Truy cập qua |
|-------|---------|--------------|
| **Admin System** | Quản trị tối cao. Xóa folder/tag ảnh, cấu hình hệ thống, quản lý thời hạn lưu trữ. | Admin Dashboard (`admin.photopro.vn`) |
| **Admin Sales** | Quản lý hầu hết chức năng. Quản lý giá (đơn lẻ/combo), xem doanh thu theo ngày/tuần/tháng/quý/năm. | Admin Dashboard (`admin.photopro.vn`) |
| **Manager (Quản lý)** | Chỉ được xem thống kê. KHÔNG có quyền sửa, xóa, quản lý giá. | Admin Dashboard (quyền hạn chế) |
| **Staff (Nhân viên/Thợ)** | Upload ảnh vào tag có sẵn, gắn tag/category cho ảnh, xem đơn hàng. KHÔNG TẠO tag mới. | Staff Portal (`portal.photopro.vn`) |
| **Customer (Khách)** | Tìm ảnh bằng khuôn mặt, mua ảnh (download HD), nhận link download. | Business Site (`studio.photopro.vn` hoặc `custom-domain.com`) |

### 3.1 Ma trận phân quyền Admin

| Hành động | Admin System | Admin Sales | Manager |
|-----------|:------------:|:-----------:|:-------:|
| Xóa folder/tag ảnh | ✅ | ❌ | ❌ |
| Cấu hình thời hạn lưu trữ ảnh | ✅ | ❌ | ❌ |
| Cấu hình thời hạn link download | ✅ | ❌ | ❌ |
| Quản lý tài khoản ngân hàng | ✅ | ❌ | ❌ |
| Quản lý domain/subdomain | ✅ | ❌ | ❌ |
| Quản lý giá đơn lẻ | ✅ | ✅ | ❌ |
| Quản lý combo giá | ✅ | ✅ | ❌ |
| Xem doanh thu ngày/tuần/tháng/quý/năm | ✅ | ✅ | ✅ (read-only) |
| Quản lý đơn hàng | ✅ | ✅ | ❌ |
| Quản lý tag (tạo, sửa) | ✅ | ✅ | ❌ |
| Kiểm soát nội dung (moderation) | ✅ | ✅ | ❌ |
| Xem thống kê | ✅ | ✅ | ✅ |
| Xuất báo cáo Excel/CSV | ✅ | ✅ | ✅ |

---

## 4. BA LUỒNG CHÍNH — CHI TIẾT TỪNG BƯỚC

### 4.1 LUỒNG A: Staff/Nhân viên → Upload & Quản lý ảnh

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LUỒNG A — NHÂN VIÊN/THỢ ẢNH (Staff)                                         │
│                                                                             │
│  ① Đăng nhập Staff Portal                                                   │
│     │ a. Email/SĐT + Password hoặc OTP                                      │
│     │ b. Được cấp tài khoản bởi Admin                                       │
│     ▼                                                                       │
│  ② Tạo Tag/Sự kiện (ALBUM = TAG)                                            │
│     │ Input: Tên event, địa điểm, ngày chụp, type='album'                   │
│     │ Output: tag_id, slug                                                  │
│     │ Tag với type='album' hoạt động như album chứa ảnh                     │
│     ▼                                                                       │
│  ③ Upload ảnh hàng loạt (TỐI ƯU TỐC ĐỘ)                                     │
│     │ Multipart upload · JPEG/PNG/HEIC · Max 50MB/ảnh                       │
│     │ Parallel upload: 20 ảnh cùng lúc                                      │
│     │ Progressive JPEG cho thumbnail nhanh                                  │
│     │ Ảnh được gắn upload_date để tính thời hạn lưu trữ                     │
│     │ Album → PROCESSING                                                    │
│     ▼                                                                       │
│  ④ Hệ thống xử lý tự động (ASYNC — TỐI ƯU TỐC ĐỘ)                           │
│     │ a. Media Processing Pipeline:                                         │
│     │    - Batch processing: xử lý 10 ảnh song song                         │
│     │    - Thumbnail 300px (progressive JPEG, quality 60%)                  │
│     │    - Preview 1200px (watermark) - lazy loading ready                  │
│     │    - HD giữ nguyên                                                    │
│     │ b. AI Face Indexing (TỐI ƯU):                                         │
│     │    - GPU acceleration (CUDA/TensorRT)                                 │
│     │    - Batch face detection: 10 ảnh/batch                               │
│     │    - Pre-computed HNSW index cho vector search nhanh                  │
│     │    - Target: < 500ms/ảnh cho face indexing                            │
│     │ → Tất cả xử lý xong: Album → READY                                    │
│     ▼                                                                       │
│  ⑤ Gắn Tag/Category cho ảnh                                                 │
│     │ 1 ảnh có thể có NHIỀU tag: #banahill #couple #sunset                  │
│     │ Album chính là 1 tag đặc biệt                                         │
│     │ Tag giúp tổ chức và tìm kiếm nhanh                                    │
│     │ API: POST /photos/{id}/tags                                           │
│     ▼                                                                       │
│  ⑥ Xuất bản Album                                                           │
│     │ Yêu cầu: có TK ngân hàng đã xác thực                                  │
│     │ Album → PUBLISHED → hiển thị trên site doanh nghiệp                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Tag States — State Machine (Album = Tag với type='album')

```
                    ┌───────────────────────────┐
                    │                           │
  Tạo mới           ▼                           │
  ───────►  ┌──────────────┐    Upload ảnh      │
            │   DRAFT      │──────────────►┌────┴────────┐
            │ (Chưa upload)│               │ PROCESSING  │
            └──────────────┘               │ (Đang xử lý)│
                                           └──────┬──────┘
                                                  │
                                     Tất cả ảnh   │
                                     xử lý xong   │
                                                  ▼
            ┌─────────────┐  Xuất bản     ┌──────────────┐
            │  PUBLISHED  │◄──────────────│    READY     │
            │(Khách xem & │  (cần TK NH   │(Chờ gắn tag &│
            │  mua được)  │   verified)   │  review)     │
            └──────┬──────┘               └──────────────┘
                   │
                   │ Ẩn / hết hạn lưu trữ
                   ▼
            ┌─────────────┐
            │  ARCHIVED   │
            │ (Đã xóa)    │
            └─────────────┘
```

| Từ | Sang | Điều kiện | Trigger |
|----|------|-----------|---------|
| `DRAFT` | `PROCESSING` | Upload ít nhất 1 ảnh | Tự động khi upload |
| `PROCESSING` | `READY` | Tất cả ảnh đã `processed` AND `indexed` | Tự động khi worker hoàn tất |
| `READY` | `PUBLISHED` | Staff nhấn "Xuất bản" + có TK NH verified | Staff chủ động |
| `PUBLISHED` | `ARCHIVED` | Admin xóa HOẶC hết thời hạn lưu trữ (Admin cấu hình) | Admin hoặc cron job |

---

### 4.2 LUỒNG B: Khách → Chọn Tag → Quét mặt → Mua → Nhận link (LUỒNG MỚI)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LUỒNG B — KHÁCH DU LỊCH                                                     │
│                                                                             │
│  ① Vào SITE DOANH NGHIỆP (Landing Page GIỚI THIỆU)                          │
│     │ Từ QR code tại điểm du lịch HOẶC link chia sẻ                         │
│     │ URL ví dụ:                                                            │
│     │   studio-abc.photopro.vn         (trang giới thiệu)                   │
│     │   photos.studioabc.com           (custom domain)                      │
│     │                                                                       │
│     │ ⚠️ TRANG KHÔNG HIỂN THỊ ẢNH - Chỉ là trang giới thiệu dịch vụ         │
│     │ Nội dung: Giới thiệu doanh nghiệp + Hướng dẫn quét mặt + CTA          │
│     ▼                                                                       │
│  ② CHỌN NGÀY + TAG ĐỂ TÌM KIẾM (Tùy chọn)                                   │
│     │ Filter theo shoot_date (để tăng tốc độ và độ chính xác):              │
│     │   ○ [Hôm nay] [Hôm qua] [Chọn ngày...]                                │
│     │                                                                       │
│     │ Tag = "Album" - Khách có thể:                                         │
│     │   ○ Tìm trong TẤT CẢ ảnh (mặc định)                                   │
│     │   ○ Chọn tag cụ thể (VD: "Bà Nà Hills 20/02", "Cầu Rồng"...)          │
│     │   ○ Chọn nhiều tag                                                    │
│     │                                                                       │
│     ▼                                                                       │
│  ③ QUÉT MẶT (Face Search — TỐI ƯU TỐC ĐỘ)                                   │
│     │                                                                       │
│     │  Cách tìm:                                                            │
│     │    [📸 Chụp selfie]  hoặc  [📤 Tải ảnh selfie lên]                   │
│     │                                                                       │
│     │  Server xử lý (TỐI ƯU TỐC ĐỘ):                                        │
│     │  1. Face Detection GPU accelerated (< 200ms)                          │
│     │  2. Extract embedding vector ArcFace (< 100ms)                        │
│     │  3. Vector search HNSW + IVF index (< 500ms)                          │
│     │  4. Filter theo tag đã chọn (nếu có)                                  │
│     │                                                                       │
│     │  Selfie KHÔNG được lưu — xử lý in-memory, xóa ngay.                   │
│     ▼                                                                       │
│  ④ XEM KẾT QUẢ (Trang hiển thị ảnh có mặt của khách)                        │
│     │ Hiển thị preview (có watermark) ảnh có mặt khách                      │
│     │ Mỗi ảnh hiện tag thuộc về                                             │
│     │ ⚠️ ẢNH SẮP XÓA (< 7 ngày) hiện ĐẾM NGƯỢC cảnh báo                     │
│     ▼                                                                       │
│  ⑤ CHỌN ẢNH MUỐN MUA → thêm vào giỏ                                         │
│     │ GIÁ THEO GÓI (Bundle Pricing - Admin TÙY CHỈNH):                      │
│     │   ⚙️ Admin tự tạo/sửa/xóa gói giá trong Dashboard                     │
│     │   Ví dụ mặc định:                                                     │
│     │   • Gói 1 ảnh  = 20,000đ                                              │
│     │   • Gói 3 ảnh  = 50,000đ  (tiết kiệm 33%)                             │
│     │   • Gói 8 ảnh  = 100,000đ (tiết kiệm 37%)                             │
│     │   • Custom bundle: Admin tạo thêm N ảnh = X đồng                      │
│     │                                                                       │
│     │ AUTO-PACK LOGIC:                                                      │
│     │   Khách chọn k ảnh → hệ thống tự tính gói tối ưu:                     │
│     │   • k=1 → Gói 1                                                       │
│     │   • k=2 → Đề xuất Gói 3 (mua dư 1)                                    │
│     │   • k=3 → Gói 3                                                       │
│     │   • k=4..8 → Gói 8                                                    │
│     │   • k>8 → Nhiều Gói 8 + phần dư theo Gói 1/3                          │
│     ▼                                                                       │
│  ⑥ CHECKOUT & THANH TOÁN                                                    │
│     │ Nhập SĐT (bắt buộc)                                                   │
│     │ ☐ Tick "Gửi link ảnh qua email" → Nhập email (TÙY CHỌN)               │
│     │    (⚠️ KHÔNG mặc định gửi email, chỉ gửi khi khách tick)              │
│     │ Chọn cổng TT: VNPay, MoMo, ZaloPay, Stripe                            │
│     │ TIỀN CHUYỂN THẲNG VÀO TÀI KHOẢN DOANH NGHIỆP                          │
│     ▼                                                                       │
│  ⑦ THANH TOÁN THÀNH CÔNG → HIỂN THỊ LINK NỔI BẬT NGAY                       │
│     │                                                                       │
│     │  ┌─────────────────────────────────────────────────────────┐          │
│     │  │                ✅ THANH TOÁN THÀNH CÔNG!                │          │
│     │  │                                                         │          │
│     │  │  LINK TẢI ẢNH CỦA BẠN:                                  │          │
│     │  │  ┌─────────────────────────────────────────────────┐    │          │
│     │  │  │ studio-abc.photopro.vn/d/abc123xyz              │    │          │
│     │  │  └─────────────────────────────────────────────────┘    │          │
│     │  │  [📋 SAO CHÉP LINK]    [📥 TẢI QR CODE]                │          │
│     │  │                                                         │          │
│     │  │  ⚠️ CẢNH BÁO: Link sẽ hết hạn sau 72 giờ                │          │
│     │  │     (Đếm ngược: 71:59:45)                               │          │
│     │  │     Ảnh sẽ bị XÓA sau khi link hết hạn!                 │          │
│     │  │                                                         │          │
│     │  │  📱 LƯU QR CODE ĐỂ MỞ LẠI SAU:                          │          │
│     │  │  ┌─────────┐                                            │          │
│     │  │  │ [QR]    │  ← Nhấn để tải QR về máy                   │          │
│     │  │  └─────────┘                                            │          │
│     │  └─────────────────────────────────────────────────────────┘          │
│     │                                                                       │
│     │ a. Gắn TAG = order_id cho TẤT CẢ ảnh đã mua                           │
│     │ b. Tạo DELIVERY LINK với đếm ngược thời hạn                           │
│     │ c. Nếu tick "gửi email" → gửi link qua Email                          │
│     ▼                                                                       │
│  ⑧ TRANG TẢI ẢNH (Delivery Page)                                            │
│     │ Truy cập: studio-abc.photopro.vn/d/{code}                             │
│     │ Hiển thị:                                                             │
│     │   • ĐẾM NGƯỢC thời hạn còn lại (từ lúc link tạo)                      │
│     │   • Danh sách ảnh đã mua (có tag = order_id)                          │
│     │   • Nút tải từng ảnh + Tải tất cả (ZIP)                               │
│     │   • Cảnh báo rõ ràng: "Ảnh sẽ bị xóa sau khi hết hạn"                 │
│     │                                                                       │
│     │ SHARE (Quan trọng - trải nghiệm chia sẻ MXH):                         │
│     │   • [Share Zalo] [Share Facebook] [Gửi Email]                         │
│     │   • Share link trang download (có token bảo mật)                      │
│     │   • Mục đích: Chụp hình để đăng MXH, share bạn bè, người thân         │
│     ▼                                                                       │
│  ⑨ Link hết hạn → Auto cleanup                                              │
│     │ • Link trả về 404                                                     │
│     │ • Ảnh có tag order_id bị XÓA tự động                                  │
│     │ • Tag order_id bị xóa khỏi hệ thống                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi tiết: Luồng thanh toán + Gắn tag + Tạo link

```
Khách nhấn         Order           Tag              Delivery        Notification
"Thanh toán"       Service         Service          Service         Service
     │                │                │                │              │
     │  POST /orders  │                │                │              │
     ├───────────────►│                │                │              │
     │                │─ create order ─►                │              │
     │                │                │                │              │
     │◄───────────────┤ payment_url    │                │              │
     │                │                │                │              │
     │ ── Khách thanh toán trên cổng ──│                │              │
     │                │                │                │              │
     │                │payment.success │                │              │
     │                │◄───────────────│                │              │
     │                │                │                │              │
     │                │  1. Gắn tag    │                │              │
     │                │  order_id cho  │                │              │
     │                │  các photo_ids │                │              │
     │                ├───────────────►│                │              │
     │                │                │                │              │
     │                │  2. Tạo link   │                │              │
     │                │  download      │                │              │
     │                ├────────────────────────────────►│              │
     │                │                │                │              │
     │                │                │                │ 3. Gửi Email │
     │                │                │                │    + SMS     │
     │                │                │                ├─────────────►│
     │                │                │                │              │
```

---

### 4.3 LUỒNG C: Admin → Quản lý & Thống kê (3 cấp độ)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LUỒNG C — ADMIN (3 CẤP ĐỘ PHÂN QUYỀN)                                       │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  A. ADMIN SYSTEM (Quyền cao nhất)                                           │
│  ═══════════════════════════════════════════════════════════════════════   │
│     • XÓA FOLDER/TAG ẢNH (chỉ Admin System mới có quyền)                    │
│     • CẤU HÌNH THỜI HẠN (TÙY CHỈNH):                                        │
│       - Thời hạn lưu trữ ảnh: ___N___ ngày (mặc định 30, min 7, max 365)    │
│       - Thời hạn link download: ___N___ giờ (mặc định 168 = 7 ngày)         │
│       - Bật/tắt auto-delete                                                 │
│       - Chỉ xóa ảnh chưa bán (delete_unsold_only)                           │
│     • Quản lý tài khoản ngân hàng doanh nghiệp                              │
│     • Quản lý subdomain và custom domain                                    │
│     • Tạo/xóa tài khoản Admin Sales, Manager, Staff                         │
│     • Xem tất cả log hệ thống                                               │
│     • Quản lý gói giá (Bundle Pricing) - tạo/sửa/xóa gói                    │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  B. ADMIN SALES (Quản lý hầu hết)                                           │
│  ═══════════════════════════════════════════════════════════════════════   │
│     • QUẢN LÝ GIÁ THEO GÓI (Bundle Pricing - TÙY CHỈNH):                    │
│       - Tạo/sửa/xóa gói giá                                                 │
│       - Ví dụ: Gói 1 ảnh  = 20,000đ                                         │
│       - Gói 3 ảnh  = 50,000đ                                                │
│       - Gói 8 ảnh  = 100,000đ                                               │
│       - Custom bundle: N ảnh = X đồng                                       │
│     • XEM DOANH THU chi tiết:                                               │
│       - Theo NGÀY / TUẦN / THÁNG / QUÝ / NĂM                                │
│       - Theo PHOTOGRAPHER (photographer_code từ folder)                     │
│       - Theo tag / theo album                                               │
│       - Top bundle bán chạy                                                 │
│       - Xuất báo cáo Excel/CSV                                              │
│       - Biểu đồ doanh thu, top ảnh bán chạy                                 │
│     • Quản lý đơn hàng: xem, xử lý, hoàn tiền                               │
│     • Quản lý tag (album=tag): tạo, sửa, ẩn (KHÔNG xóa)                     │
│     • Kiểm soát nội dung (Content Moderation)                               │
│     • Quản lý nhân viên (Staff)                                             │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  C. MANAGER (Chỉ xem thống kê - Read-only)                                  │
│  ═══════════════════════════════════════════════════════════════════════   │
│     • Xem dashboard: doanh thu, đơn hàng, ảnh bán                           │
│     • Xem báo cáo: ngày/tuần/tháng/quý/năm                                  │
│     • Xuất báo cáo (read-only)                                              │
│     • KHÔNG CÓ QUYỀN: sửa, xóa, quản lý giá, quản lý đơn hàng               │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  D. CẤU HÌNH HỆ THỐNG (Admin System)                                        │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│     THỜI HẠN LƯU TRỮ ẢNH (Admin TÙY CHỈNH)                                  │
│     ┌────────────────────────────────────────────────────────────────┐      │
│     │ Ảnh chưa bán: [_____] ngày (min 7, max 365, mặc định 30)       │      │
│     │ ☑ Bật auto-delete                                              │      │
│     │ ☐ Chỉ xóa ảnh chưa bán                                         │      │
│     │ Hết hạn → TỰ ĐỘNG XÓA ẢNH                                      │      │
│     └────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│     THỜI HẠN LINK DOWNLOAD (Admin TÙY CHỈNH)                                │
│     ┌────────────────────────────────────────────────────────────────┐      │
│     │ Link tồn tại: [_____] giờ (min 24, max 720, mặc định 168=7ngày)│      │
│     │ Hết hạn → LINK MẤT + XÓA ẢNH ĐÃ MUA (có tag order_id)          │      │
│     └────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│     GÓI GIÁ (Admin TÙY CHỈNH)                                               │
│     ┌────────────────────────────────────────────────────────────────┐      │
│     │ [+ Thêm gói mới]                                               │      │
│     │                                                                │      │
│     │ Gói 1 ảnh:  [20,000] đ   [Sửa] [Xóa]                          │      │
│     │ Gói 3 ảnh:  [50,000] đ   [Sửa] [Xóa]                          │      │
│     │ Gói 8 ảnh: [100,000] đ   [Sửa] [Xóa]                          │      │
│     └────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│  E. THỐNG KÊ DOANH THU (Admin Sales, Manager)                               │
│  ═══════════════════════════════════════════════════════════════════════   │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │ Chọn khoảng thời gian:                                          │     │
│     │ [Hôm nay] [Tuần này] [Tháng này] [Quý này] [Năm nay] [Tùy chọn]│     │
│     │                                                                 │     │
│     │ Tổng doanh thu:     25,800,000đ    ↑ 15%                        │     │
│     │ Tổng đơn hàng:      1,245          ↑ 8%                         │     │
│     │ Ảnh đã bán:         4,890          ↑ 12%                        │     │
│     │ Phí platform:       5,160,000đ                                  │     │
│     │                                                                 │     │
│     │ [XUẤT EXCEL]  [XUẤT CSV]  [XUẤT PDF]                            │     │
│     └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. CHI TIẾT 10 MODULE

### Module 1: Staff Portal Service

**Port:** 3001 · **Ngôn ngữ:** Node.js (Fastify) · **DB:** `users`, `photos`, `tags`, `photo_tags`

#### Cấu trúc Folder Upload (quy ước để xử lý tự động)

```
Root chung: /photopro_upload/

A) Theo ngày:
   /photopro_upload/YYYY-MM-DD/

B) Theo photographer:
   /photopro_upload/YYYY-MM-DD/{photographer_code}/

C) Theo album (khuyến nghị):
   /photopro_upload/YYYY-MM-DD/{photographer_code}/{album_code}/

Ví dụ:
   /photopro_upload/2026-02-25/PH001/ALB_ConVienNuoc_Sang/
```

#### Quy ước File

| Loại | Pattern | Ghi chú |
|------|---------|---------|
| Ảnh | `IMG_*.jpg\|jpeg\|png` | V1 ưu tiên jpg/jpeg |
| Video | `VID_*.mp4` | V1 có thể hoãn |
| Cover video | `VID_0001_cover.jpg` | Ảnh có khuôn mặt rõ để scan |

#### Metadata tự động (từ folder path)

- `photographer_code` → lấy từ folder
- `shoot_date` → lấy từ folder (YYYY-MM-DD)
- `album_code` → lấy từ folder (nếu có)
- Không bắt buộc EXIF

#### Chức năng & API (ALBUM = TAG)

| # | Chức năng | API Endpoint | Method | Auth | Input | Output | Logic |
|---|-----------|-------------|--------|------|-------|--------|-------|
| 1 | Đăng nhập Staff | `/auth/login` | POST | Public | `{email, password}` hoặc `{phone, otp}` | `{access_token, refresh_token}` | JWT access (15 phút) + refresh (7 ngày). |
| 2 | Refresh token | `/auth/refresh` | POST | Refresh token | `{refresh_token}` | `{access_token}` | Verify refresh, issue new access. |
| 3 | Xem profile | `/staff/me` | GET | JWT Staff | — | `{id, name, role, stats}` | Query staff info. |
| 4 | Tạo Tag (Album) | `/tags` | POST | **JWT Admin** | `{name, type, spot_name?, shoot_date?}` | `{tag_id, slug}` | **CHỈ ADMIN tạo**. type='album' tạo album. |
| 5 | Danh sách Tag | `/tags` | GET | JWT Staff | `?type=album` | `[{tag_id, name, photo_count, status}]` | Staff xem danh sách tag/album để upload. |
| 6 | Upload ảnh vào Tag | `/tags/{id}/photos` | POST | JWT Staff | Multipart: `files[]` (max 20) | `{uploaded: [{photo_id, status, upload_date}]}` | Staff upload ảnh. Lưu upload_date. Emit `photo.uploaded`. |
| 7 | Gắn thêm tag cho ảnh | `/photos/{id}/tags` | POST | JWT Staff | `{tag_ids: []}` | `{photo_id, tags[]}` | 1 ảnh nhiều tag. |
| 8 | Xóa tag khỏi ảnh | `/photos/{id}/tags` | DELETE | JWT Staff | `{tag_ids: []}` | `{photo_id, tags[]}` | Xóa tag khỏi ảnh. |
| 9 | Chi tiết tag | `/tags/{id}` | GET | JWT Staff | — | `{tag, photos[]}` | Xem ảnh trong tag. |
| 10 | Cập nhật tag | `/tags/{id}` | PUT | **JWT Admin** | `{name?, status?}` | `{tag}` | **CHỈ ADMIN**. |
| 11 | Publish Tag (Album) | `/tags/{id}/publish` | POST | **JWT Admin** | — | `{tag}` (PUBLISHED) | **CHỈ ADMIN publish**. Emit `tag.published`. |
| 12 | Danh sách ảnh | `/photos` | GET | JWT Staff | `?tag_id=&status=&warning=true` | `[{photo_id, thumbnail_url, tags[], status, delete_warning}]` | Filter theo tag. Include delete warning nếu < 7 ngày. |

#### Validation Rules

```
session.event_name:   required, string, max 200 chars
session.spot_name:    required, string, max 200 chars
session.shoot_date:   required, date (ISO 8601), không quá 1 năm tương lai
photo.file:           required, mime IN (image/jpeg, image/png, image/heic), size ≤ 50MB
pricing.*:            optional, integer ≥ 1000 (VND)
subdomain:            lowercase, a-z0-9-hyphen, 3-50 chars, unique
custom_domain:        valid FQDN, unique in system
bank_account.number:  required, 6-20 digits
```

---

### Module 2: Media Processing Pipeline (TỐI ƯU TỐC ĐỘ)

**Loại:** Background worker (consume events) · **Ngôn ngữ:** Node.js (Sharp) + Python (invisible watermark)

#### Pipeline (TỐI ƯU TỐC ĐỘ)

```
Event: photo.uploaded
  │
  ▼
┌──────────────────────────────────────────────────────┐
│ Worker 1: VALIDATE (< 500ms/ảnh)                     │
│  - Download file từ S3 (async parallel)              │
│  - Kiểm tra format thật (magic bytes)                │
│  - Kiểm tra size ≤ 50MB                              │
│  - Đọc EXIF: orientation, dimensions                 │
│  - Nếu HEIC → convert sang JPEG (sharp)              │
│  - Auto-orient theo EXIF rotation                    │
│  - LƯU upload_date vào metadata                      │
│  Nếu lỗi: photo.status = FAILED, log reason          │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│ Worker 2: GENERATE VARIANTS (< 2s/ảnh)               │
│                                                      │
│  BATCH PROCESSING: 10 ảnh song song                  │
│                                                      │
│  Thumbnail (300px, quality 60%, PROGRESSIVE JPEG)    │
│    → Tải nhanh, lazy loading ready                   │
│    → S3: /{bid}/{aid}/thumbs/{photo_id}.jpg          │
│                                                      │
│  Preview (1200px, quality 80%)                       │
│    + Visible watermark (tiled diagonal pattern)      │
│    + Invisible watermark (steganography)             │
│    → S3: /{bid}/{aid}/previews/{photo_id}.jpg        │
│                                                      │
│  Original HD (giữ nguyên, strip EXIF nhạy cảm)       │
│    → S3: /{bid}/{aid}/originals/{photo_id}.jpg       │
│                                                      │
│  Update DB: paths, dimensions, status = PROCESSED    │
│  → Emit event: photo.processed                       │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│ Worker 3: AI FACE INDEXING (< 500ms/ảnh với GPU)     │
│  → GPU accelerated (CUDA/TensorRT)                   │
│  → Batch processing: 10 ảnh/batch                    │
│  → Xem chi tiết tại Module 3                         │
│  → Emit event: photo.indexed                         │
└──────────────────────────────────────────────────────┘
```

#### Tối ưu Thumbnail Loading

| Kỹ thuật | Mô tả |
|----------|-------|
| **Progressive JPEG** | Thumbnail hiển thị mờ trước, rõ dần → UX tốt hơn |
| **WebP format** | Fallback cho browsers hỗ trợ → giảm 30% size |
| **Lazy loading** | Chỉ tải thumbnail khi scroll vào viewport |
| **CDN caching** | Cache thumbnail 30 ngày, cache-control headers |
| **Preload hints** | Preload thumbnail cho 6 ảnh tiếp theo |

#### Watermark Engine

| Config | Giá trị |
|--------|---------|
| Visible watermark mặc định | Text "PhotoPro" + logo |
| Visible watermark custom | Logo doanh nghiệp từ S3 `/{bid}/profile/watermark.png` |
| Vị trí visible | Tiled diagonal: lặp pattern chéo 45°, spacing 200px, chống crop |
| Opacity | 30–40% (configurable) |
| Invisible watermark | Nhúng `business_id:photo_id` vào pixel data (DWT method) |
| Thư viện visible | Sharp `composite()` với SVG pattern |
| Thư viện invisible | Python `invisible-watermark` (imwatermark) |

#### Concurrency & Scaling (TỐI ƯU)

- **Batch processing**: 10 ảnh song song (tối ưu throughput)
- Scale theo queue depth: queue > 50 → thêm worker instance
- Memory limit per worker: 1GB (cho batch processing)
- Timeout: 30 giây/ảnh → quá timeout → DLQ
- GPU worker pool: 2 GPU instances cho face indexing

#### Internal API (Module 2 ↔ Module 4)

| Endpoint | Method | Input | Output | Mô tả |
|----------|--------|-------|--------|-------|
| `/internal/face-search` | POST | `{image, topK, shoot_date?}` | `[{media_id, score}]` | Face search nội bộ |
| `/internal/{id}/thumb` | GET | - | Image binary | Lấy thumbnail |
| `/internal/{id}/preview` | GET | - | Image binary | Lấy preview (có watermark) |

---

### Module 3: Face Index & Search (TỐI ƯU TỐC ĐỘ)

**Port:** 3003 · **Ngôn ngữ:** Python (FastAPI) · **Vector DB:** pgvector (PostgreSQL extension)

#### Indexing Pipeline (TỐI ƯU TỐC ĐỘ — trigger: `photo.processed`)

```
Input: photo (JPEG) từ S3 — BATCH PROCESSING 10 ảnh/batch
  │
  ▼
Step 1: Face Detection (RetinaFace + GPU CUDA)
  - GPU accelerated: NVIDIA T4/V100
  - Batch inference: 10 ảnh cùng lúc
  - Target: < 50ms/ảnh (batch)
  - Output: List[{bbox(x,y,w,h), confidence, landmarks}]
  - Threshold: confidence ≥ 0.8 (bỏ qua face mờ)
  - Bỏ qua face < 40×40px
  │
  ▼
Step 2: Face Alignment (< 10ms/face)
  - 5-point landmarks (2 mắt, 1 mũi, 2 mép)
  - Affine transform → chuẩn hóa 112×112px
  - Vectorized operations với NumPy
  │
  ▼
Step 3: Face Embedding (ArcFace R100 + TensorRT)
  - TensorRT optimized: 2x faster than PyTorch
  - Batch embedding: 32 faces cùng lúc
  - Target: < 20ms/face (batch)
  - Output: vector(512), L2 normalized
  │
  ▼
Step 4: Lưu Vector DB (Bulk insert)
  - Batch INSERT: 100 records/query
  - HNSW index pre-built
  - ⚠️ DENORMALIZE album_id để filter nhanh
  INSERT INTO face_embeddings:
  {photo_id, business_id, album_id,          -- album_id từ photos.primary_album_id
   face_index, bounding_box, embedding, confidence}

Update: photo.face_count = N
Emit: photo.indexed (bao gồm album_id)
```

#### TỐI ƯU THUẬT TOÁN SO SÁNH MẶT

```
┌─────────────────────────────────────────────────────────────────────────┐
│ VECTOR SEARCH OPTIMIZATION                                              │
│                                                                         │
│  1. HNSW INDEX (Hierarchical Navigable Small World)                     │
│     - Approximate nearest neighbor search                               │
│     - O(log N) complexity thay vì O(N)                                  │
│     - Parameters: m=16, ef_construction=64, ef_search=100               │
│                                                                         │
│  2. IVF INDEX (Inverted File Index) cho scale lớn                       │
│     - Chia vector thành clusters                                        │
│     - Chỉ search trong clusters gần nhất                                │
│     - nlist=100, nprobe=10                                              │
│                                                                         │
│  3. QUERY OPTIMIZATION (TỐI ƯU THEO ALBUM)                              │
│     - face_embeddings.album_id: denormalized để filter NHANH            │
│     - Pre-filter bằng business_id + album_id TRƯỚC khi vector search    │
│     - Không cần JOIN với photos table khi search                        │
│     - WHERE album_id IN (selected_albums) + HNSW search                 │
│                                                                         │
│  4. CACHING                                                             │
│     - Redis cache cho frequent searches                                 │
│     - Cache embedding của selfie (TTL 5 phút)                           │
│     - Cache kết quả search (TTL 1 phút)                                 │
│                                                                         │
│  5. DISTANCE METRIC                                                     │
│     - Cosine similarity (vector_cosine_ops)                             │
│     - Threshold: similarity ≥ 0.75 (configurable, tune sau)             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Search API (TỐI ƯU - FILTER THEO ALBUM + NGÀY)

```
POST /face-search
{
  "selfie_image": <file>,
  "business_id": "uuid",                     // BẮT BUỘC
  "search_scope": "all",                     // "all" | "selected_albums" | "by_date"
  "album_ids": ["uuid1", "uuid2"],           // Chỉ khi scope = "selected_albums"
  "shoot_date": "2026-02-25",                // Filter theo ngày chụp (YYYY-MM-DD)
  "date_range": "today|yesterday|custom",    // Quick filter
  "similarity_threshold": 0.75               // Threshold match (tune sau, default 0.75)
}

-- SQL Query tối ưu (filter album + date TRƯỚC khi vector search):
SELECT f.*, p.*, 
       1 - (f.embedding <=> $selfie_embedding) as similarity
FROM face_embeddings f
JOIN photos p ON f.photo_id = p.id
WHERE f.business_id = $business_id
  AND f.album_id IN ($selected_album_ids)    -- Filter album TRƯỚC
  AND p.shoot_date = $shoot_date             -- Filter ngày TRƯỚC
  AND f.has_face = true                      -- Chỉ ảnh có mặt
  AND p.status >= 'INDEXED'                  -- Chỉ ảnh đã index
ORDER BY f.embedding <=> $selfie_embedding   -- HNSW search
LIMIT 100;

Response:
{
  "results": [
    {
      "photo_id": "uuid",
      "similarity_score": 0.95,
      "thumbnail_url": "https://cdn.../thumb.jpg",
      "bounding_box": {"x": 100, "y": 50, "w": 80, "h": 100},
      "tags": [
        {"id": "uuid", "name": "Bà Nà Hills 20/02", "type": "album"},
        {"id": "uuid", "name": "couple", "type": "category"}
      ],
      "delete_warning": {                    // Nếu ảnh sắp bị xóa < 7 ngày
        "is_warning": true,
        "days_remaining": 3,
        "countdown_display": "3 ngày"
      }
    }
  ],
  "grouped_by_tag": {
    "uuid-tag-1": {"name": "Bà Nà Hills 20/02", "type": "album", "count": 8},
    "uuid-tag-2": {"name": "Hội An 19/02", "type": "album", "count": 7}
  },
  "total": 18,
  "search_scope": "all",
  "tags_searched": 5,
  "search_time_ms": 450   // Target < 500ms
}
```

#### Search SQL (TỐI ƯU VỚI HNSW INDEX)

```sql
-- Pre-filter bằng business_id, tag_ids + Vector search (< 300ms cho 20K vectors)
WITH filtered AS (
  SELECT fe.* FROM face_embeddings fe
  JOIN photo_tags pt ON fe.photo_id = pt.photo_id
  WHERE fe.business_id = :bid
    AND pt.tag_id = ANY(:tag_ids)  -- Filter theo tags
    AND fe.photo_id IN (SELECT id FROM photos WHERE status = 'INDEXED')
)
SELECT DISTINCT
  photo_id, bounding_box,
  1 - (embedding <=> :query_vector) as similarity_score
FROM filtered
WHERE 1 - (embedding <=> :query_vector) >= :threshold
ORDER BY embedding <=> :query_vector ASC
LIMIT 100;
```

#### Performance Benchmarks (TỐI ƯU)

| Scope | Số vector ước tính | Response time (TỐI ƯU) |
|-------|-------------------|------------------------|
| 1 album (200 ảnh × 2 face) | ~400 vectors | **< 200ms** |
| 5 album chọn | ~2,000 vectors | **< 350ms** |
| Tất cả album (50 albums) | ~20,000 vectors | **< 800ms** |
| Index 1 ảnh (detect+embed+save) | — | **< 500ms** (GPU T4) |

#### Xử lý edge cases

| Vấn đề | Giải pháp |
|--------|----------|
| Ảnh có nhiều người | Index TẤT CẢ face. Search trả ảnh nếu BẤT KỲ face nào match. |
| Khuôn mặt bị che/mờ | Detection confidence < 0.8 → bỏ qua face đó. |
| Selfie đeo kính/mũ | UI hiển thị hướng dẫn: "Bỏ kính mắt, mũ. Chụp thẳng mặt." |
| Privacy | Selfie xử lý in-memory, KHÔNG lưu disk/S3. Xóa ngay sau search. |
| Scale lớn (>100K ảnh/business) | Partition face_embeddings theo `business_id`. HNSW index. |

---

### Module 4: Storefront Service (Customer Site)

**Port:** 3000 · **Ngôn ngữ:** Next.js 14+ (App Router)

#### URL Structure (BUSINESS-BASED - KHÔNG HIỂN THỊ ẢNH TRỰC TIẾP)

```
⚠️ TRANG KHÔNG HIỂN THỊ ẢNH - Chỉ là trang giới thiệu + quét mặt

{subdomain}.photopro.vn/                           → Landing Page (Giới thiệu + Quét mặt)
{subdomain}.photopro.vn/search                     → Face search (trang quét mặt)
{subdomain}.photopro.vn/search?tags=tag1,tag2      → Quét mặt filter theo tags
{subdomain}.photopro.vn/results                    → Kết quả face search (ảnh có mặt)
{subdomain}.photopro.vn/checkout                   → Thanh toán
{subdomain}.photopro.vn/success/{order_id}         → Thanh toán thành công (hiển thị link)
{subdomain}.photopro.vn/d/{delivery_code}          → Link tải ảnh (có hạn + đếm ngược)

// ⚠️ KHÔNG CÓ /album/ - Album = Tag, dùng param ?tags=
// Custom domain (tương tự):
photos.studioabc.com/
photos.studioabc.com/search?tags=bana-hills
photos.studioabc.com/d/abc123xyz  → delivery link (có đếm ngược)
```

#### Luồng URL Customer

```
1. Landing Page (/)
   ↓ Chọn tags (tùy chọn)
2. Face Search (/search?tags=...)
   ↓ Chụp/upload selfie
3. Kết quả (/results?session=xxx)
   ↓ Chọn ảnh → thêm vào giỏ
4. Checkout (/checkout)
   ↓ Nhập SĐT + (tick email) → Thanh toán
5. Thành công (/success/{order_id})
   ↓ Hiển thị link nổi bật + QR + đếm ngược
6. Tải ảnh (/d/{code})
   → Đếm ngược thời hạn + Download
```

#### Domain Routing (Nginx)

```nginx
# Wildcard subdomain: *.photopro.vn
server {
    listen 443 ssl;
    server_name ~^(?<subdomain>[^.]+)\.photopro\.vn$;

    # Loại trừ subdomain hệ thống
    if ($subdomain ~* ^(portal|admin|api|www)$) {
        break;
    }

    location / {
        proxy_pass http://storefront-service:3000;
        proxy_set_header X-Business-Subdomain $subdomain;
        proxy_set_header Host $host;
    }
}

# Custom domain: catch-all
server {
    listen 443 ssl;
    server_name _;

    location / {
        proxy_pass http://storefront-service:3000;
        proxy_set_header X-Custom-Domain $host;
        proxy_set_header Host $host;
    }
}
```

**Storefront resolve business:**

```javascript
async function resolveBusiness(req, res, next) {
  let business;
  const subdomain = req.headers['x-business-subdomain'];
  const customDomain = req.headers['x-custom-domain'];

  if (subdomain) {
    business = await db.businesses.findOne({
      where: { subdomain }
    });
  } else if (customDomain) {
    business = await db.businesses.findOne({
      where: { custom_domain: customDomain, custom_domain_status: 'active' }
    });
  }

  if (!business) return res.status(404).render('site-not-found');
  req.business = business;
  next();
}
```

#### QR Code Strategy (SITE-LEVEL QR)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ QR CODE STRATEGY                                                        │
│                                                                         │
│  1. Site QR (QR chính):                                                 │
│     - URL: {subdomain}.photopro.vn                                      │
│     - In QR đặt tại quầy/bàn tại điểm du lịch                           │
│     - Khách scan → vào trang chủ → chọn album → tìm ảnh                 │
│     - UTM: ?utm_source=qr&utm_campaign=main                             │
│                                                                         │
│  2. Face Search QR (optional):                                          │
│     - URL: {subdomain}.photopro.vn/face-search                          │
│     - Shortcut trực tiếp vào trang quét mặt                             │
│     - Khách scan → chụp selfie ngay → tìm ảnh                           │
│                                                                         │
│  Generate: npm `qrcode` → PNG/SVG                                       │
│  Size tối thiểu: 3cm × 3cm (scan từ 30cm)                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Performance Requirements (TỐI ƯU)

| Metric | Target | Phương pháp |
|--------|--------|------------|
| First Contentful Paint | < 1.0s | SSR + CDN cached HTML + preload critical CSS |
| Gallery load (50 thumbnails) | < 1.5s | Lazy load + CDN + WebP + placeholder blur |
| Thumbnail display | < 200ms each | Progressive JPEG, preload, CDN edge cache |
| Face search response | < 2s | Vector DB HNSW indexed + Redis cache |
| Checkout page | < 1s | Minimal JS, prefetch payment scripts |

---

### Module 5: Order Service (HỆ THỐNG GIÁ FILE-BASED)

**Port:** 3005 · **Ngôn ngữ:** Node.js (Fastify)

#### BẢNG GIÁ MẶC ĐỊNH (CONFIGURABLE BY ADMIN)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRICING STRUCTURE (FILE-BASED, KHÔNG PHẢI PER-PHOTO)                    │
│                                                                         │
│  Gói cơ bản:                                                            │
│  ┌──────────────┬────────────┬──────────────────────────────┐           │
│  │ Package      │ Price      │ Description                  │           │
│  ├──────────────┼────────────┼──────────────────────────────┤           │
│  │ 1 file       │ 10,000 VND │ Download 1 ảnh HD            │           │
│  │ 3 files      │ 20,000 VND │ Download 3 ảnh HD (tiết kiệm)│           │
│  │ 10 files     │ 50,000 VND │ Download 10 ảnh HD (best)    │           │
│  └──────────────┴────────────┴──────────────────────────────┘           │
│                                                                         │
│  Admin có thể:                                                          │
│  - Thay đổi giá từng gói                                                │
│  - Tạo gói custom (5 files = 30k, 20 files = 80k, etc.)                 │
│  - Set giá theo album/event đặc biệt                                    │
│  - Áp dụng discount codes                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Order States

```
CREATED → PENDING_PAYMENT → PAID → PROCESSING
                                    │
                                    └─ (digital) → DELIVERED (link gửi kèm hạn)
                                                   │
                                                   ├─ EXPIRED (link hết hạn)
                                                   └─ AUTO_DELETED (ảnh bị xóa)

                          ├─ EXPIRED (30 phút không TT)
                          └─ FAILED (TT thất bại)
```

#### API (Email TÙY CHỌN, SĐT BẮT BUỘC)

| Endpoint | Method | Auth | Input | Output |
|----------|--------|------|-------|--------|
| `/orders` | POST | Public | `{customer_phone, send_email?, customer_email?, business_id, tag_ids[]?, items[{photo_id}]}` | `{order_id, total_amount, status}` |
| `/orders/{id}` | GET | Phone verify | `?phone=...` | `{order, items, payment_status, delivery, download_urls?}` |
| `/orders/{id}/pay` | POST | Public | `{payment_gateway}` | `{payment_url, payment_id}` |
| `/pricing` | GET | Public | `?business_id=...` | `{packages: [{name, file_count, price}]}` |

**⚠️ Lưu ý:**
- `customer_phone`: BẮT BUỘC
- `send_email`: Boolean, mặc định FALSE. TRUE = khách tick "Gửi link qua email"
- `customer_email`: Chỉ required khi send_email = TRUE
- `tag_ids[]`: Optional, dùng để tracking từ tag nào (cho analytics)
| `/pricing` | PUT | JWT Admin | `{packages: [...]}` | Updated pricing |

#### Order với Tag (GẮN TAG KHI MUA)

```javascript
// Khi order PAID → gắn tag order_id cho photo
async function tagPurchasedPhotos(order) {
  const orderTag = await db.tags.create({
    name: `Order #${order.id.slice(0, 8)}`,
    type: 'order',
    business_id: order.business_id
  });
  
  for (const item of order.items) {
    await db.photo_tags.create({
      photo_id: item.photo_id,
      tag_id: orderTag.id
    });
  }
  
  // Emit event để tạo delivery link
  emit('order.tagged', { order_id: order.id, tag_id: orderTag.id });
}

---

### Module 6: Payment Service

**Port:** 3006 · **Ngôn ngữ:** Node.js (Fastify)

#### Nguyên tắc (PER-BUSINESS)

```
Khách trả tiền → TIỀN VÀO TK DOANH NGHIỆP
Revenue tracking cho Admin (Sales, Manager)
Simple payment flow: VNPay / MoMo / Bank transfer
```

#### Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PAYMENT FLOW                                                            │
│                                                                         │
│  1. Customer chọn ảnh → tạo order                                       │
│  2. Chọn payment method: VNPay / MoMo / Bank Transfer                   │
│  3. Redirect to payment gateway                                         │
│  4. Customer thanh toán                                                 │
│  5. Webhook callback → order.status = PAID                              │
│  6. Tạo delivery link (có hạn, admin configurable)                      │
│  7. Gửi link qua Email + SMS                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Payment Integration

| Gateway | Phương thức | Phí |
|---------|------------|-----|
| VNPay | QR, ATM, Visa/Master | ~1.5% |
| MoMo | QR, Ví MoMo | ~1.8% |
| Bank Transfer | Chuyển khoản trực tiếp | 0% |

#### API Endpoints

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/payment/create` | POST | Internal | Tạo payment cho order |
| `/payment/status/{id}` | GET | Public | Check payment status |
| `/webhooks/vnpay` | POST | VNPay sig | VNPay webhook |
| `/webhooks/momo` | POST | MoMo sig | MoMo webhook |
| `/payment/transactions` | GET | JWT Admin | Lịch sử giao dịch |
| `/payment/revenue` | GET | JWT Admin | Báo cáo doanh thu |

---

### Module 7: Delivery Service (LINK CÓ HẠN + AUTO DELETE)

**Port:** 3007 · **Ngôn ngữ:** Node.js (Fastify)

#### DELIVERY LINK CÓ HẠN (Admin Configurable)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DELIVERY LINK EXPIRATION                                                │
│                                                                         │
│  1. Admin cấu hình thời hạn link (mặc định: 72 giờ)                     │
│     - Settings: delivery_link_ttl_hours = 72 (configurable)             │
│     - Min: 24 giờ, Max: 168 giờ (7 ngày)                                │
│                                                                         │
│  2. Khi order PAID → tạo delivery link:                                 │
│     {                                                                   │
│       code: "abc123xyz",                  // 12 chars alphanumeric      │
│       order_id: "uuid",                                                 │
│       expires_at: now + delivery_link_ttl_hours,                        │
│       max_downloads: 5,                                                 │
│       current_downloads: 0,                                             │
│       status: "active"                                                  │
│     }                                                                   │
│                                                                         │
│  3. Link format: {subdomain}.photopro.vn/d/{code}                       │
│                                                                         │
│  4. Khi link hết hạn:                                                   │
│     - status = "expired"                                                │
│     - Download blocked                                                  │
│     - Trigger: photo auto-delete (nếu enabled)                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Digital Delivery Flow (trigger: `payment.success`)

```
1. Fetch order_items → danh sách photo_ids
2. Tạo delivery record:
   {
     code: generateCode(12),
     order_id,
     business_id,
     customer_email,
     customer_phone,
     expires_at: now + config.delivery_link_ttl_hours,
     max_downloads: 5,
     photo_ids: [...],
     status: 'active'
   }
3. Gắn tag order_id cho các photo đã mua
4. Emit: delivery.created → Notification gửi Email+SMS
   - Nội dung: "Link tải ảnh: {url}. Hết hạn sau 72 giờ."
5. Khi khách tải:
   - Check expires_at > now
   - Check current_downloads < max_downloads
   - Increment download count
   - Log IP/user-agent
   - Nếu vượt quá → block + log
```

#### Delivery Link Access API

```
GET /d/{code}
Response (valid):
{
  "status": "active",
  "photos": [
    {
      "photo_id": "uuid",
      "thumbnail_url": "...",
      "download_url": "https://s3.../presigned-url?expires=..."
    }
  ],
  "expires_at": "2025-03-15T10:00:00Z",
  "created_at": "2025-03-12T10:00:00Z",
  "time_remaining_seconds": 172800,     // Đếm ngược từ lúc tạo
  "downloads_remaining": 3,
  "warning": "Ảnh sẽ bị XÓA VĨNH VIỄN sau khi link hết hạn!"
}

Response (expired):
{
  "status": "expired",
  "error": "Link đã hết hạn. Ảnh đã bị xóa.",
  "expired_at": "2025-03-12T10:00:00Z"
}
```

#### DELIVERY PAGE UI (Trang tải ảnh)

```
┌───────────────────────────────────────────────────────────────────┐
│  📷 PhotoPro                                                      │
│                                                                   │
│  ĐƠN HÀNG: #ORD-ABC123                                            │
│                                                                   │
│  ⏱️ THỜI HẠN CÒN LẠI: 47:23:15 (đếm ngược realtime)               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 65%                   │
│                                                                   │
│  ⚠️ CẢNH BÁO: Ảnh sẽ bị XÓA VĨNH VIỄN khi hết hạn!                │
│                                                                   │
│  ẢNH CỦA BẠN (3 ảnh)                      [📥 TẢI TẤT CẢ (ZIP)]   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                              │
│  │         │ │         │ │         │                              │
│  │  Ảnh 1  │ │  Ảnh 2  │ │  Ảnh 3  │                              │
│  │         │ │         │ │         │                              │
│  │ [Tải ↓] │ │ [Tải ↓] │ │ [Tải ↓] │                              │
│  └─────────┘ └─────────┘ └─────────┘                              │
│                                                                   │
│  Lượt tải còn lại: 3/5                                            │
└───────────────────────────────────────────────────────────────────┘
```

#### API Endpoints

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/d/{code}` | GET | Public | Truy cập delivery link |
| `/d/{code}/download/{photo_id}` | GET | Public | Download ảnh (check limit) |
| `/delivery/settings` | GET | JWT Admin | Get delivery settings |
| `/delivery/settings` | PUT | JWT Admin | Update TTL, max downloads |
| `/delivery/{id}/extend` | POST | JWT Admin | Gia hạn link (thêm 24h) |

---

### Module 8: Admin Dashboard Service (3 LEVELS)

**Port:** 3008 · **Ngôn ngữ:** Node.js (Fastify) + React Admin UI

#### ADMIN ROLES & PERMISSIONS

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 3 ADMIN LEVELS                                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ADMIN SYSTEM (Super Admin)                                      │    │
│  │ - Toàn quyền hệ thống                                           │    │
│  │ - XÓA FOLDER/TAG (chỉ role này có quyền)                        │    │
│  │ - Quản lý user/staff                                            │    │
│  │ - Cấu hình hệ thống (delivery TTL, auto-delete settings)        │    │
│  │ - Xem tất cả data                                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ADMIN SALES (Sales Admin)                                       │    │
│  │ - Quản lý pricing/bảng giá                                      │    │
│  │ - Xem revenue reports chi tiết                                  │    │
│  │ - Tạo discount codes                                            │    │
│  │ - Export báo cáo doanh thu                                      │    │
│  │ - KHÔNG thể xóa folder/tag                                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ MANAGER (View-only Stats)                                       │    │
│  │ - Xem thống kê tổng quan (dashboard)                            │    │
│  │ - Xem số lượng ảnh, orders, revenue summary                     │    │
│  │ - KHÔNG thể edit bất kỳ data nào                                │    │
│  │ - KHÔNG thể xem chi tiết từng giao dịch                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Permission Matrix

| Chức năng | Admin System | Admin Sales | Manager |
|-----------|--------------|-------------|---------|
| Xóa folder/tag | ✅ | ❌ | ❌ |
| Quản lý staff | ✅ | ❌ | ❌ |
| Cấu hình hệ thống | ✅ | ❌ | ❌ |
| Quản lý pricing | ✅ | ✅ | ❌ |
| Tạo discount codes | ✅ | ✅ | ❌ |
| Xem revenue chi tiết | ✅ | ✅ | ❌ |
| Export báo cáo | ✅ | ✅ | ❌ |
| Xem dashboard stats | ✅ | ✅ | ✅ |
| Xem order list | ✅ | ✅ | ✅ (summary only) |
| Edit tags | ✅ | ✅ | ❌ |
| Auto-delete settings | ✅ | ❌ | ❌ |

#### API Endpoints (PER ROLE)

| Endpoint | Method | Admin System | Admin Sales | Manager |
|----------|--------|--------------|-------------|---------|
| `/admin/dashboard` | GET | ✅ | ✅ | ✅ |
| `/admin/albums` | GET | ✅ | ✅ | ✅ |
| `/admin/albums/{id}` | DELETE | ✅ | ❌ | ❌ |
| `/admin/staff` | CRUD | ✅ | ❌ | ❌ |
| `/admin/pricing` | GET/PUT | ✅ | ✅ | ❌ |
| `/admin/discounts` | CRUD | ✅ | ✅ | ❌ |
| `/admin/revenue` | GET | ✅ | ✅ | ❌ |
| `/admin/revenue/export` | POST | ✅ | ✅ | ❌ |
| `/admin/orders` | GET | ✅ Full | ✅ Full | ✅ Summary |
| `/admin/settings` | GET/PUT | ✅ | ❌ | ❌ |
| `/admin/auto-delete` | GET/PUT | ✅ | ❌ | ❌ |
| `/admin/photos/flagged` | GET | ✅ | ❌ | ❌ |

#### Dashboard Metrics

```javascript
// Dashboard endpoint response
{
  // Tổng quan (all roles can see)
  "total_photos": 15420,
  "total_albums": 85,
  "total_orders": 1250,
  "total_customers": 890,
  
  // Revenue (Admin System + Admin Sales only)
  "revenue_today": 2500000,
  "revenue_this_month": 45000000,
  "revenue_last_month": 38000000,
  "growth_percentage": 18.4,
  
  // Charts data
  "revenue_by_day": [...],      // Last 30 days
  "orders_by_day": [...],
  "top_albums": [...],
  
  // System health (Admin System only)
  "storage_used_gb": 125.5,
  "photos_pending_delete": 2340,
  "delivery_links_expired": 156
}

---

### Module 9: Notification Service

**Port:** 3009 · **Ngôn ngữ:** Node.js (Fastify) · **Loại:** Consumer (listen events)

#### Event → Notification Mapping

| Event | Người nhận | Kênh | Nội dung |
|-------|-----------|------|---------|
| `payment.success` | Khách | Email + SMS | "Đơn hàng #{id} thanh toán thành công." |
| `delivery.created` | Khách | Email + SMS | "Ảnh HD sẵn sàng. Link: {url}. Hết hạn {expires_at}." |
| `delivery.expiring` | Khách | SMS | "Link tải ảnh sắp hết hạn (còn 6 giờ). Tải ngay: {url}" |
| `delivery.expired` | Admin | Email | "Delivery #{id} đã hết hạn. {count} ảnh pending delete." |
| `photo.auto_deleted` | Admin | Email | "Auto-deleted {count} ảnh theo policy." |
| `staff.invited` | Staff | Email | "Bạn được mời làm nhân viên. [Chấp nhận]" |
| `order.new` | Staff | Push | "Đơn hàng mới #{id} - {amount}đ" |

#### Tích hợp

| Kênh | Provider | Ghi chú |
|------|---------|---------|
| Email | AWS SES + MJML templates | Template-based, hỗ trợ tiếng Việt |
| SMS | eSMS.vn (VN) / Twilio (quốc tế) | REST API |
| Push | Firebase Cloud Messaging | Mobile app & Staff portal |

---

### Module 10: Auto-Delete Service (CronJob)

**Port:** 3010 · **Ngôn ngữ:** Node.js · **Loại:** Scheduled Jobs (Cron)

#### AUTO-DELETE SYSTEM

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AUTO-DELETE LOGIC                                                       │
│                                                                         │
│  RETENTION POLICY (Admin configurable):                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ photo_retention_days = 30        (default, min 7, max 365)       │   │
│  │ delivery_link_ttl_hours = 168    (default 7 ngày, min 24, max 720)│   │
│  │ auto_delete_enabled = true                                       │   │
│  │ delete_unsold_only = false       (true = chỉ xóa ảnh chưa bán)   │   │
│  │ warning_days_before_delete = 7   (hiện đếm ngược 7 ngày trước)   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  PHOTO LIFECYCLE + ĐẾM NGƯỢC CẢNH BÁO:                                  │
│                                                                         │
│  upload_date ──────────────────────────────────────► delete_at          │
│       │                                                   │             │
│       │     retention_period (30 days)                    │             │
│       │◄─────────────────────────────────────────────────►│             │
│       │                                                   │             │
│       │               │◄─── 7 days warning ───►│          │             │
│       │               │     (ĐẾM NGƯỢC)        │          │             │
│       │               │                        │          │             │
│  ┌────┴────┐    ┌─────┴──────┐          ┌──────┴─────┐    │             │
│  │ ACTIVE  │───►│ WARNING ⚠️ │─────────►│ SCHEDULED  │───►│ DELETED     │
│  │         │    │ Còn 7 ngày │          │ TO DELETE  │    │             │
│  └─────────┘    └────────────┘          └────────────┘    │             │
│                                                                         │
│  ⚠️ ẢNH TRONG GIAI ĐOẠN WARNING (< 7 ngày trước xóa):                   │
│     - Hiển thị ĐẾM NGƯỢC trên UI: "Sẽ bị xóa sau: 6 ngày 23:45:12"      │
│     - Badge cảnh báo màu đỏ trong Staff Portal                          │
│     - Khách xem kết quả face search cũng thấy cảnh báo                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Photo Warning Status API

```
GET /photos?include_delete_warning=true
Response:
{
  "photos": [
    {
      "photo_id": "uuid",
      "upload_date": "2026-01-25T10:00:00Z",
      "scheduled_delete_at": "2026-02-24T10:00:00Z",
      "delete_warning": {
        "is_warning": true,                    // true nếu còn < 7 ngày
        "days_remaining": 3,
        "hours_remaining": 71,
        "seconds_remaining": 255600,
        "countdown_display": "3 ngày 23:45:12" // Để hiển thị đếm ngược
      },
      "tags": ["Bà Nà Hills", "couple"]
    }
  ]
}
```

#### Staff/Admin Portal - Hiển thị Warning

```
┌──────────────────────────────────────────────────────────────────────┐
│ ẢNH SẮP BỊ XÓA (< 7 ngày)                                     [!] 45 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ ⚠️ 6d  │ │ ⚠️ 5d │ │ ⚠️ 3d  │ │ ⚠️ 2d │ │ 🔴 1d  │              │
│  │        │ │        │ │        │ │        │ │        │              │
│  │  IMG   │ │  IMG   │ │  IMG   │ │  IMG   │ │  IMG   │              │
│  │        │ │        │ │        │ │        │ │        │              │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                                      │
│  ⚠️ = Còn > 1 ngày     🔴 = Còn < 24 giờ (khẩn cấp)                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Customer Face Search - Hiển thị Warning

```
Kết quả tìm kiếm của bạn (5 ảnh):
┌────────┐ ┌────────┐ ┌────────────────┐ ┌────────┐ ┌────────┐
│        │ │        │ │ ⚠️ SẮP XÓA    │ │        │ │        │
│  Ảnh   │ │  Ảnh   │ │ Còn 2 ngày    │ │  Ảnh   │ │  Ảnh   │
│        │ │        │ │               │ │        │ │        │
│ 10,000đ│ │ 10,000đ│ │ 10,000đ       │ │ 10,000đ│ │ 10,000đ│
└────────┘ └────────┘ └────────────────┘ └────────┘ └────────┘
                      ↑ Badge đếm ngược
```

#### Cron Jobs Schedule

| Job Name | Schedule | Description |
|----------|----------|-------------|
| `expire-delivery-links` | Every hour | Mark expired delivery links |
| `delete-expired-photos` | Daily 3:00 AM | Delete photos past retention |
| `cleanup-orphan-files` | Weekly Sunday | Remove S3 files without DB record |
| `send-expiry-warnings` | Every 6 hours | Notify customers about expiring links |
| `generate-delete-report` | Daily 4:00 AM | Report deleted photos to Admin |

#### Auto-Delete Flow

```javascript
// Cron: Daily 3:00 AM
async function deleteExpiredPhotos() {
  const config = await getAutoDeleteConfig();
  
  if (!config.auto_delete_enabled) return;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.photo_retention_days);
  
  // Query photos to delete
  let query = db.photos.where('upload_date', '<=', cutoffDate);
  
  if (config.delete_unsold_only) {
    query = query.whereNotIn('id', 
      db.order_items.select('photo_id').where('status', 'PAID')
    );
  }
  
  const photosToDelete = await query.select(['id', 's3_key']);
  
  // Batch delete from S3
  for (const batch of chunk(photosToDelete, 100)) {
    await s3.deleteObjects({
      Bucket: config.bucket,
      Delete: { Objects: batch.map(p => ({ Key: p.s3_key })) }
    });
    
    // Delete from DB
    await db.photos.whereIn('id', batch.map(p => p.id)).delete();
    await db.face_embeddings.whereIn('photo_id', batch.map(p => p.id)).delete();
    await db.photo_tags.whereIn('photo_id', batch.map(p => p.id)).delete();
  }
  
  // Log & notify
  emit('photo.auto_deleted', { count: photosToDelete.length, date: new Date() });
}
```

#### API Endpoints (Admin System Only)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/auto-delete/config` | GET | Admin System | Get auto-delete settings |
| `/auto-delete/config` | PUT | Admin System | Update settings |
| `/auto-delete/preview` | GET | Admin System | Preview photos to be deleted |
| `/auto-delete/run` | POST | Admin System | Manual trigger delete job |
| `/auto-delete/logs` | GET | Admin System | Deletion history/logs |

---

## 6. BUSINESS SITE — SUBDOMAIN & CUSTOM DOMAIN

### 6.1 Cấu trúc domain

```
System domains:        portal.photopro.vn    → Staff Portal
                       admin.photopro.vn     → Admin Dashboard
                       api.photopro.vn       → API Gateway
                       www.photopro.vn       → Marketing site

Business sites:        {slug}.photopro.vn    → Site doanh nghiệp (subdomain)
                       photos.custom.com     → Site doanh nghiệp (custom domain)
```

### 6.2 Setup Custom Domain

```
Bước 1: Admin vào Portal → Cài đặt → Domain → Nhập custom domain
Bước 2: Hệ thống hiển thị hướng dẫn DNS:
         Type: CNAME  ·  Host: photos  ·  Value: proxy.photopro.vn
Bước 3: Hệ thống verify CNAME (kiểm tra mỗi 5 phút, tối đa 48 giờ)
Bước 4: Auto-provision SSL (Let's Encrypt) → Kích hoạt
```

### 6.3 SSL

| Loại domain | SSL Provider | Quản lý |
|-------------|-------------|---------|
| `*.photopro.vn` (wildcard) | AWS ACM | 1 wildcard cert cho tất cả subdomain |
| Custom domain | Let's Encrypt (auto-renew) | Certbot hoặc Caddy auto-SSL |

---

## 7. HỆ THỐNG NHÂN VIÊN (STAFF MANAGEMENT)

### 7.1 Staff Roles Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STAFF ROLES IN BUSINESS                                                 │
│                                                                         │
│  ┌──────────────────────┐                                              │
│  │ ADMIN SYSTEM         │  - Toàn quyền hệ thống                       │
│  │ (Super Admin)        │  - XÓA folder/tag (chỉ role này)             │
│  │                      │  - Quản lý tất cả staff                       │
│  │                      │  - Cấu hình auto-delete, settings             │
│  └──────────────────────┘                                              │
│           │                                                            │
│           ▼                                                            │
│  ┌──────────────────────┐                                              │
│  │ ADMIN SALES          │  - Quản lý pricing, discount                 │
│  │ (Sales Admin)        │  - Xem revenue chi tiết                       │
│  │                      │  - Export báo cáo                             │
│  │                      │  - KHÔNG xóa folder/tag                       │
│  └──────────────────────┘                                              │
│           │                                                            │
│           ▼                                                            │
│  ┌──────────────────────┐                                              │
│  │ MANAGER              │  - Xem dashboard (view-only)                  │
│  │ (View-only Stats)    │  - Xem order summary                          │
│  │                      │  - KHÔNG edit bất kỳ data                     │
│  └──────────────────────┘                                              │
│           │                                                            │
│           ▼                                                            │
│  ┌──────────────────────┐                                              │
│  │ STAFF                │  - Upload ảnh vào tag có sẵn                  │
│  │ (Nhân viên chụp)     │  - Gắn tag cho ảnh (KHÔNG tạo tag mới)        │
│  │                      │  - Xem đơn hàng                               │
│  │                      │  - KHÔNG tạo/xóa tag                          │
│  └──────────────────────┘                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Permission Matrix

| Hành động | Admin System | Admin Sales | Manager | Staff |
|-----------|:------------:|:-----------:|:-------:|:-----:|
| Upload ảnh | ✅ | ✅ | ❌ | ✅ |
| Tạo tag (album) | ✅ | ✅ | ❌ | ❌ |
| Gắn tag cho ảnh | ✅ | ❌ | ❌ | ✅ |
| Xóa ảnh | ✅ | ❌ | ❌ | ❌ |
| **Xóa folder/tag** | ✅ | ❌ | ❌ | ❌ |
| Quản lý pricing | ✅ | ✅ | ❌ | ❌ |
| Tạo discount | ✅ | ✅ | ❌ | ❌ |
| Xem revenue chi tiết | ✅ | ✅ | ❌ | ❌ |
| Export báo cáo | ✅ | ✅ | ❌ | ❌ |
| Xem dashboard | ✅ | ✅ | ✅ | ❌ |
| Xem orders | ✅ Full | ✅ Full | ✅ Summary | ✅ List |
| Quản lý staff | ✅ | ❌ | ❌ | ❌ |
| Cấu hình auto-delete | ✅ | ❌ | ❌ | ❌ |
| Cấu hình settings | ✅ | ❌ | ❌ | ❌ |

### 7.3 Staff Management API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/admin/staff` | GET | Admin System | Danh sách staff |
| `/admin/staff` | POST | Admin System | Tạo staff mới |
| `/admin/staff/{id}` | GET | Admin System | Chi tiết staff |
| `/admin/staff/{id}` | PUT | Admin System | Cập nhật staff |
| `/admin/staff/{id}` | DELETE | Admin System | Xóa staff |
| `/admin/staff/{id}/reset-password` | POST | Admin System | Reset password |

### 7.4 Permission Middleware

```javascript
const PERMISSIONS = {
  staff: [
    'upload_photo', 'create_album', 'edit_album', 
    'tag_photo', 'delete_photo', 'view_orders'
  ],
  manager: [
    'view_dashboard', 'view_orders_summary'
  ],
  admin_sales: [
    'view_dashboard', 'view_orders', 
    'manage_pricing', 'create_discount', 
    'view_revenue', 'export_reports'
  ],
  admin_system: ['*']  // Toàn quyền
};

function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    const { user } = req;
    
    // Admin System có toàn quyền
    if (user.role === 'admin_system') return next();
    
    // Check permission theo role
    if (!PERMISSIONS[user.role]?.includes(requiredPermission)) {
      return res.status(403).json({
        error: `Role "${user.role}" không có quyền "${requiredPermission}"`
      });
    }
    
    next();
  };
}

// Special check for delete tag/folder (Admin System only)
function checkDeleteTagPermission() {
  return async (req, res, next) => {
    if (req.user.role !== 'admin_system') {
      return res.status(403).json({
        error: 'Chỉ Admin System mới có quyền xóa folder/tag'
      });
    }
    next();
  };
}
```

---

## 8. FACE SEARCH — TỐI ƯU THUẬT TOÁN QUÉT MẶT & TÌM ẢNH

### 8.1 UI Face Search

#### Flow tự động (Updated)

```
┌───────────────────────────────────────────────────────────────────┐
│   LUỒNG MỚI: TỰ ĐỘNG CHUYỂN TRANG KHI PHÁT HIỆN KHUÔN MẶT        │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User click "📷 Mở Camera"                                     │
│     ↓                                                             │
│  2. Camera mở + hiển thị khung scanner overlay                    │
│     - Không có nút "Chụp ảnh"                                     │
│     - Chỉ có nút "✕ Đóng" và "🔄 Đổi camera"                      │
│     ↓                                                             │
│  3. Phát hiện khuôn mặt (1.5s)                                    │
│     Status: "Đang tìm khuôn mặt..."                               │
│     → Face detection points hiện lên                              │
│     ↓                                                             │
│  4. Nhận diện thành công (2s giữ khuôn mặt trong khung)           │
│     Status: "✓ Nhận diện thành công!"                             │
│     ↓                                                             │
│  5. TỰ ĐỘNG chụp và chuyển trang (1s sau khi nhận diện)           │
│     - Capture frame từ video                                      │
│     - Stop camera stream                                          │
│     - Hiển thị loading "Đang tìm ảnh..."                          │
│     ↓                                                             │
│  6. Navigate to Results page                                      │
│     - Hiển thị ảnh tìm được                                       │
│     - Không cần user bấm nút chụp                                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

#### UI Camera Interface

```
┌───────────────────────────────────────────────────────────────────┐
│   Studio ABC                     studio-abc.photopro.vn           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  [🔄]                                              [✕]       │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │                                                        │ │ │
│  │  │              � VIDEO STREAM                           │ │ │
│  │  │                                                        │ │ │
│  │  │         ┌─────────────────────┐                       │ │ │
│  │  │         │                     │  ← Scanner frame       │ │ │
│  │  │         │    👤 Face here     │                        │ │ │
│  │  │         │                     │                        │ │ │
│  │  │         └─────────────────────┘                       │ │ │
│  │  │                                                        │ │ │
│  │  │         [●●●●●●●●]  ← Face detection points          │ │ │
│  │  │                                                        │ │ │
│  │  │         ✓ Nhận diện thành công!  ← Status             │ │ │
│  │  │                                                        │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  💡 Di chuyển khuôn mặt vào khung hình và giữ yên          │ │
│  │     Hệ thống sẽ tự động chụp khi nhận diện thành công      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ❌ KHÔNG CÓ NÚT "CHỤP ẢNH" - Tự động capture                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

#### Timing & States

| Bước | Thời gian | Status hiển thị | Action |
|------|-----------|-----------------|--------|
| Camera init | 0s | - | Start video stream |
| Face detection | 1.5s | "Đang tìm khuôn mặt..." | Scan for faces |
| Face found | 2s | "Đã phát hiện khuôn mặt!" | Show detection points |
| Recognition | 2s hold | "✓ Nhận diện thành công!" | Verify face stable |
| Auto capture | +1s | - | Capture frame silently |
| Navigate | +0.3s | "Đang tìm ảnh..." | Go to results |
| **Total** | **~6.8s** | - | Full flow complete |

#### Frontend Implementation (appManager.js)

```javascript
// Face detection flow - auto capture when face detected
simulateFaceDetection() {
  // 1. Show "Detecting face..." (1.5s)
  statusEl.innerHTML = 'Đang tìm khuôn mặt...';
  
  setTimeout(() => {
    // 2. Show "Face detected!" with points (2s)
    statusEl.innerHTML = 'Đã phát hiện khuôn mặt!';
    this.showFacePoints();
    
    setTimeout(() => {
      // 3. Show "Recognition successful!" (1s)
      statusEl.innerHTML = '✓ Nhận diện thành công!';
      
      setTimeout(() => {
        // 4. AUTO CAPTURE & NAVIGATE (no button needed)
        this.autoCaptureAndSearch();
      }, 1000);
    }, 2000);
  }, 1500);
}

autoCaptureAndSearch() {
  // Capture frame from video
  const canvas = document.createElement('canvas');
  ctx.drawImage(video, 0, 0);
  
  // Stop camera
  this.closeCamera();
  
  // Show loading and navigate
  setTimeout(() => {
    this.simulateFaceSearch(); // → Go to results
  }, 300);
}
```

### 8.2 Kết quả — Nhóm theo Tag

```
┌───────────────────────────────────────────────────────────────────┐
│  TÌM THẤY 18 ẢNH TRONG 3 TAG                       ⏱️ 450ms       │
│                                                                   │
│  ── Bà Nà Hills 20/02 (8 ảnh) ─────────────────────────────────── │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  [Xem thêm 4 ảnh]    │
│  │ 98%    │ │ 95%    │ │ 92%    │ │ 88%    │                      │
│  │#couple │ │#couple │ │#portrait│ │#solo   │                     │
│  │[☑ Chọn]│ │[☑ Chọn]│ │[☐ Chọn]│ │[☐ Chọn]│                    │
│  └────────┘ └────────┘ └────────┘ └────────┘                      │
│                                                                   │
│  ── Hội An 19/02 (7 ảnh) ──────────────────────────────────────── │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  [Xem thêm 3 ảnh]    │
│  │ 94%    │ │ 91%    │ │ 85%    │ │ 80%    │                      │
│  └────────┘ └────────┘ └────────┘ └────────┘                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ BẢNG GIÁ: 1 file = 10k | 3 files = 20k | 10 files = 50k     │ │
│  │ Giỏ hàng: 2 ảnh · Gói 3 files: 20,000đ     [THANH TOÁN →]    │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## 9. BẢO MẬT HÌNH ẢNH (IMAGE PROTECTION)

### 5 lớp bảo vệ

```
LỚP 1: VISIBLE WATERMARK
  - Watermark tiled diagonal (lặp pattern chéo 45°, spacing 200px)
  - Text + logo business, opacity 30-40%, chống crop
  - Áp dụng: ảnh preview trên storefront

LỚP 2: INVISIBLE WATERMARK (Steganography)
  - Nhúng business_id + photo_id vào pixel data (DWT method)
  - Không nhìn thấy bằng mắt, extract được bằng tool
  - Dùng để truy nguồn gốc nếu ảnh bị leak
  - Thư viện: invisible-watermark (Python imwatermark)

LỚP 3: FRONTEND PROTECTION
  - Disable right-click (contextmenu preventDefault)
  - Disable kéo-thả (dragstart preventDefault)
  - CSS pointer-events: none trên <img>
  - Overlay transparent div phủ lên ảnh (chặn "Save As")
  - Disable Ctrl+S, Ctrl+Shift+I, F12
  - Lưu ý: không chặn 100% (screenshot vẫn được → lớp 2 bù)

LỚP 4: CDN & URL PROTECTION
  - Preview: signed URL (TTL 1 giờ, auto-refresh)
  - Hotlink protection: Referer check, chỉ cho *.photopro.vn + custom domains đã đăng ký
  - Original HD: KHÔNG expose URL cho đến khi đã thanh toán
  - Rate limiting: max 100 preview loads/phút/IP

LỚP 5: LEGAL / DMCA
  - Copyright notice: "© Studio ABC via PhotoPro"
  - Terms of Service: cấm tải/sao chép preview
  - Report system + DMCA takedown process
```

### Invisible Watermark — Implementation

```python
from imwatermark import WatermarkEncoder, WatermarkDecoder

def embed_invisible_watermark(image_path, business_id, photo_id):
    encoder = WatermarkEncoder()
    payload = f"PP:{business_id}:{photo_id}"
    encoder.set_watermark('bytes', payload.encode('utf-8'))
    bgr_encoded = encoder.encode(cv2.imread(image_path), 'dwtDct')
    cv2.imwrite(output_path, bgr_encoded)

def extract_invisible_watermark(image_path):
    decoder = WatermarkDecoder('bytes', len(payload) * 8)
    watermark = decoder.decode(cv2.imread(image_path), 'dwtDct')
    return watermark.decode('utf-8')  # "PP:{business_id}:{photo_id}"
```

### Frontend Protection Component

```jsx
function ProtectedImage({ src, alt }) {
  return (
    <div
      className="relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <img src={src} alt={alt} className="pointer-events-none" draggable="false" />
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}
```

### Preview URL Strategy

```
Preview ảnh dùng signed URL ngắn hạn (1 giờ):
1. Client fetch: GET /photos/preview-urls?ids=uuid1,uuid2,...
2. Server trả: [{photo_id, signed_preview_url, expires_at}]
3. Client render ảnh
4. Sau 50 phút → client auto-refresh URLs
```

---

## 10. THANH TOÁN (PAYMENT)

### 10.1 Nguyên tắc thanh toán

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PAYMENT FLOW                                                            │
│                                                                         │
│  1. Khách chọn ảnh → thêm vào giỏ hàng                                  │
│  2. Chọn gói phù hợp (1 file/3 files/10 files)                          │
│  3. Chọn payment method: VNPay / MoMo / Bank Transfer                   │
│  4. Redirect to payment gateway                                         │
│  5. Khách thanh toán → webhook callback                                 │
│  6. Order status = PAID                                                 │
│  7. Tạo delivery link (có hạn) → gửi Email + SMS                        │
│  8. Tiền vào tài khoản doanh nghiệp                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Payment Gateways

| Gateway | Phương thức | Phí ước tính | Thời gian nhận tiền |
|---------|------------|--------------|---------------------|
| VNPay | QR, ATM, Visa/Master | ~1.5% | T+1 |
| MoMo | QR, Ví MoMo | ~1.8% | T+1 |
| Bank Transfer | Chuyển khoản trực tiếp | 0% | Instant |

### 10.3 Database Schema (Payments)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    gateway VARCHAR(20) NOT NULL 
        CHECK (gateway IN ('vnpay', 'momo', 'bank_transfer')),
    gateway_txn_id VARCHAR(200),
    
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    
    payment_url VARCHAR(1000),
    raw_response JSONB,
    webhook_received_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_business ON payments(business_id, created_at DESC);
```

### 10.4 Webhook Handling

```javascript
// POST /webhooks/vnpay
async function handleVNPayWebhook(req, res) {
  const { vnp_TxnRef, vnp_ResponseCode, vnp_Amount } = req.body;
  
  // Verify signature
  if (!verifyVNPaySignature(req.body)) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  const payment = await db.payments.findOne({ gateway_txn_id: vnp_TxnRef });
  
  if (vnp_ResponseCode === '00') {
    // Success
    await db.payments.update(payment.id, { status: 'SUCCESS' });
    await db.orders.update(payment.order_id, { status: 'PAID' });
    
    // Create delivery link
    emit('payment.success', { order_id: payment.order_id });
  } else {
    // Failed
    await db.payments.update(payment.id, { status: 'FAILED' });
    await db.orders.update(payment.order_id, { status: 'FAILED' });
  }
  
  return res.json({ RspCode: '00', Message: 'Confirm Success' });
}
```

---

## 11. DATABASE SCHEMA ĐẦY ĐỦ (BUSINESS/STAFF MODEL)

### Entity Relationship

```
businesses ──1:N──► users (staff/admin)
    │
    ├──1:N──► albums ──1:N──► photos ──1:N──► face_embeddings
    │             │               │
    │             │               └──N:N──► tags (via photo_tags)
    │             │
    │             └──N:N──► tags
    │
    ├──1:N──► tags
    │
    ├──1:N──► pricing_packages
    │
    └──────────────────── orders ──1:N──► order_items
                            │
                            └──1:1──► delivery_links
```

### Tất cả bảng (BUSINESS/STAFF MODEL)

```sql
-- businesses (thay cho photographers - PER-BUSINESS SYSTEM)
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    watermark_url VARCHAR(500),
    
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    custom_domain_status VARCHAR(20) DEFAULT 'inactive'
        CHECK (custom_domain_status IN ('inactive','pending_dns','active','failed')),
    
    -- Settings (Admin configurable)
    delivery_link_ttl_hours INT DEFAULT 168,         -- Link expiration (7 ngày mặc định, max 30 ngày)
    photo_retention_days INT DEFAULT 30,             -- Auto-delete after N days
    auto_delete_enabled BOOLEAN DEFAULT TRUE,
    delete_unsold_only BOOLEAN DEFAULT FALSE,
    
    -- Stats
    total_revenue DECIMAL(15,2) DEFAULT 0,
    current_storage_bytes BIGINT DEFAULT 0,
    current_photo_count INT DEFAULT 0,
    current_album_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- users (staff + admin roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    avatar_url VARCHAR(500),
    
    -- Role: admin_system, admin_sales, manager, staff
    role VARCHAR(20) NOT NULL 
        CHECK (role IN ('admin_system', 'admin_sales', 'manager', 'staff')),
    
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(business_id, email)
);

-- tags (CRITICAL: Album = Tag, Category = Tag, 1 ảnh nhiều tag)
-- ⚠️ KHÔNG CÓ BẢNG ALBUMS RIÊNG - Album chính là Tag với type='album'
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL 
        CHECK (type IN ('album', 'category', 'event', 'order', 'custom')),
    color VARCHAR(7),                               -- Hex color: #FF5733
    description TEXT,
    parent_id UUID REFERENCES tags(id),             -- Hierarchical tags
    
    -- Album-specific fields (chỉ dùng khi type='album')
    spot_name VARCHAR(200),                         -- VD: "Bà Nà Hills", "Cầu Rồng"
    shoot_date DATE,                                -- Ngày chụp
    status VARCHAR(20) DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT','PROCESSING','READY','PUBLISHED','ARCHIVED')),
    published_at TIMESTAMP,
    
    photo_count INT DEFAULT 0,                      -- Cached count
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(business_id, slug)
);

-- ⚠️ ALBUM = TAG. Để query albums: SELECT * FROM tags WHERE type = 'album'

-- ⚠️ KHÔNG CÓ BẢNG ALBUMS RIÊNG - Album = Tag (type='album')
-- Albums được tạo bằng cách tạo tag với type='album'
-- Query album: SELECT * FROM tags WHERE type = 'album'

-- photos (với upload_date cho auto-delete)
-- ⚠️ CRITICAL: primary_album_id = tag có type='album' mà ảnh thuộc về
-- Ảnh được lưu trên S3 theo cấu trúc album để tối ưu tìm kiếm
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    uploaded_by UUID REFERENCES users(id),          -- Staff who uploaded
    
    -- Metadata từ folder path (tự động extract)
    photographer_code VARCHAR(50),                  -- Lấy từ folder: /YYYY-MM-DD/{photographer_code}/
    shoot_date DATE,                                -- Lấy từ folder: /YYYY-MM-DD/
    album_code VARCHAR(100),                        -- Lấy từ folder: /{album_code}/
    
    -- CRITICAL: Album chính mà ảnh thuộc về (dùng cho S3 path & filter nhanh)
    -- Đây là tag có type='album', mapping 1-1 với folder trên server
    primary_album_id UUID NOT NULL REFERENCES tags(id),
    
    original_filename VARCHAR(500),
    file_size BIGINT,
    width INT,
    height INT,
    mime_type VARCHAR(50),
    has_face BOOLEAN DEFAULT FALSE,                 -- Có mặt người hay không
    
    -- S3 paths: /{business_id}/{primary_album_id}/originals/{photo_id}.jpg
    original_path VARCHAR(500),
    preview_path VARCHAR(500),
    thumbnail_path VARCHAR(500),
    
    status VARCHAR(20) DEFAULT 'NEW'
        CHECK (status IN ('NEW','DERIVATIVES_READY','INDEXED','FAILED','DELETED')),
    
    face_count INT DEFAULT 0,
    quality_score FLOAT,
    
    -- CRITICAL: Upload date for auto-delete
    upload_date TIMESTAMP DEFAULT NOW(),
    delete_scheduled_at TIMESTAMP,                  -- upload_date + retention_days
    
    -- Warning flag for photos about to be deleted (< 7 days)
    is_delete_warning BOOLEAN GENERATED ALWAYS AS (
        delete_scheduled_at IS NOT NULL AND 
        delete_scheduled_at <= NOW() + INTERVAL '7 days'
    ) STORED,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index để query nhanh theo album và ngày
CREATE INDEX idx_photos_album ON photos(business_id, primary_album_id);
CREATE INDEX idx_photos_album_status ON photos(primary_album_id, status);
CREATE INDEX idx_photos_shoot_date ON photos(business_id, shoot_date);
CREATE INDEX idx_photos_photographer ON photos(business_id, photographer_code);

-- photo_tags (CRITICAL: Many-to-many - 1 ảnh có nhiều tag)
CREATE TABLE photo_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(photo_id, tag_id)
);

-- face_embeddings (optimized for HNSW search)
-- ⚠️ CRITICAL: album_id để filter NHANH theo album khi face search
-- Denormalized từ photos.primary_album_id để tránh JOIN
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE face_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    business_id UUID NOT NULL,
    album_id UUID NOT NULL REFERENCES tags(id),     -- Denormalized: photos.primary_album_id
    face_index INT NOT NULL,
    bounding_box JSONB NOT NULL,
    confidence FLOAT NOT NULL,
    embedding vector(512) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- HNSW Index for fast vector search
CREATE INDEX idx_face_vector ON face_embeddings
    USING hnsw (embedding vector_cosine_ops) 
    WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_face_business ON face_embeddings(business_id);
-- ⚠️ CRITICAL: Index để filter theo album TRƯỚC khi vector search
CREATE INDEX idx_face_album ON face_embeddings(album_id);
CREATE INDEX idx_face_business_album ON face_embeddings(business_id, album_id);

-- bundle_pricing (BUNDLE PRICING theo số ảnh)
CREATE TABLE bundle_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,                     -- "Gói 1 ảnh", "Gói 3 ảnh", "Gói 8 ảnh"
    photo_count INT NOT NULL,                       -- 1, 3, 8
    price DECIMAL(15,2) NOT NULL,                   -- 20000, 50000, 100000
    currency VARCHAR(3) DEFAULT 'VND',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    tag_id UUID REFERENCES tags(id),                -- Album = Tag, link order với tag
    
    -- ⚠️ Email là TÙY CHỌN - chỉ bắt buộc SĐT
    customer_email VARCHAR(255),                    -- NULL nếu khách không tick "gửi email"
    customer_phone VARCHAR(20) NOT NULL,            -- Bắt buộc
    send_email BOOLEAN DEFAULT FALSE,               -- TRUE = khách tick "gửi link qua email"
    
    bundle_id UUID REFERENCES bundle_pricing(id),   -- Gói giá đã chọn
    photo_count INT NOT NULL,                       -- Số ảnh thực tế mua
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    
    status VARCHAR(20) DEFAULT 'CREATED'
        CHECK (status IN ('CREATED','PENDING_PAYMENT','PAID','PROCESSING','DELIVERED','FAILED','EXPIRED')),
    
    payment_gateway VARCHAR(20),                    -- vnpay, momo, bank_transfer
    payment_id VARCHAR(100),
    payment_url VARCHAR(1000),
    
    expires_at TIMESTAMP,                           -- Order expiration (30 min)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- order_items (với photographer_code để thống kê doanh thu)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id),
    photographer_code VARCHAR(50),                  -- Denormalized từ photos.photographer_code
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index để thống kê doanh thu theo photographer
CREATE INDEX idx_order_items_photographer ON order_items(photographer_code);

-- delivery_links (CRITICAL: Link có hạn + auto-delete)
CREATE TABLE delivery_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    code VARCHAR(20) UNIQUE NOT NULL,               -- abc123xyz (URL code)
    
    -- ⚠️ Email là TÙY CHỌN
    customer_email VARCHAR(255),                    -- NULL nếu khách không muốn email
    customer_phone VARCHAR(20) NOT NULL,            -- Bắt buộc
    
    photo_ids JSONB NOT NULL,                       -- Array of photo_ids
    
    max_downloads INT DEFAULT 5,
    current_downloads INT DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'exhausted')),
    
    -- CRITICAL: Expiration + Countdown
    expires_at TIMESTAMP NOT NULL,
    auto_delete_photos BOOLEAN DEFAULT TRUE,        -- Delete photos when link expires
    
    last_download_at TIMESTAMP,
    download_logs JSONB DEFAULT '[]'::jsonb,        -- [{ip, user_agent, timestamp}]
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- auto_delete_logs (Track deletions)
CREATE TABLE auto_delete_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    photo_count INT NOT NULL,
    storage_freed_bytes BIGINT,
    deleted_by VARCHAR(20) NOT NULL                 -- 'system_cron', 'admin_manual'
        CHECK (deleted_by IN ('system_cron', 'admin_manual')),
    details JSONB,                                  -- {photo_ids: [...], reason: '...'}
    created_at TIMESTAMP DEFAULT NOW()
);

-- discount_codes (Admin Sales managed)
CREATE TABLE discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL              -- 'percentage', 'fixed'
        CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(15,2) NOT NULL,          -- 10 (%) or 5000 (VND)
    min_order_amount DECIMAL(15,2) DEFAULT 0,
    max_uses INT,
    current_uses INT DEFAULT 0,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- system_settings (Global + per-business settings)
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),     -- NULL = global setting
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(business_id, key)
);
```

### Indexing Strategy (TỐI ƯU TỐC ĐỘ)

```sql
-- Business
CREATE INDEX idx_businesses_subdomain ON businesses(subdomain);
CREATE INDEX idx_businesses_custom_domain ON businesses(custom_domain) WHERE custom_domain IS NOT NULL;

-- Tags (ALBUM = TAG - CRITICAL)
CREATE INDEX idx_tags_business ON tags(business_id, type);
CREATE INDEX idx_tags_slug ON tags(business_id, slug);
CREATE INDEX idx_tags_album ON tags(business_id) WHERE type = 'album';

-- Photos (CRITICAL for fast gallery loading)
CREATE INDEX idx_photos_business ON photos(business_id, status);
CREATE INDEX idx_photos_upload_date ON photos(upload_date);
CREATE INDEX idx_photos_delete_scheduled ON photos(delete_scheduled_at) WHERE delete_scheduled_at IS NOT NULL;
CREATE INDEX idx_photos_warning ON photos(business_id) WHERE is_delete_warning = TRUE;

-- Photo Tags (CRITICAL for tag-based queries - ALBUM = TAG)
CREATE INDEX idx_photo_tags_photo ON photo_tags(photo_id);
CREATE INDEX idx_photo_tags_tag ON photo_tags(tag_id);

-- Orders & Delivery
CREATE INDEX idx_orders_business ON orders(business_id, created_at DESC);
CREATE INDEX idx_orders_customer ON orders(customer_phone);
CREATE INDEX idx_delivery_links_code ON delivery_links(code);
CREATE INDEX idx_delivery_links_expires ON delivery_links(expires_at) WHERE status = 'active';

-- Users
CREATE INDEX idx_users_business ON users(business_id, role);
CREATE INDEX idx_users_email ON users(email);
```

---

## 12. EVENT-DRIVEN ARCHITECTURE

### Event Catalog (BUSINESS/STAFF MODEL - ALBUM = TAG)

| Event Name | Publisher | Consumer(s) | Payload |
|-----------|----------|-------------|---------|
| `photo.uploaded` | Staff Portal | Media Processing | `{photo_id, album_id, business_id, s3_raw_path, upload_date}` |
| `photo.processed` | Media Processing | Face Index | `{photo_id, album_id, business_id, paths}` |
| `photo.indexed` | Face Index | Storefront (cache) | `{photo_id, album_id, face_count}` |
| `photo.tagged` | Staff Portal | Storefront (cache) | `{photo_id, tag_ids[], action: 'add'\|'remove'}` |
| `photo.warning` | Auto-Delete Service | Admin Dashboard | `{business_id, photo_ids[], days_remaining}` |
| `photo.auto_deleted` | Auto-Delete Service | Admin Dashboard, Notification | `{business_id, photo_count, storage_freed_bytes}` |
| `tag.created` | Admin Dashboard | Storefront (cache) | `{tag_id, business_id, name, type}` |
| `tag.updated` | Admin Dashboard | Storefront (cache) | `{tag_id, business_id, name}` |
| `tag.published` | Admin Dashboard | Storefront (cache) | `{tag_id, business_id, slug}` |
| `tag.deleted` | Admin Dashboard | Storefront (cache) | `{tag_id, business_id}` |
| `order.created` | Order Service | Payment Service | `{order_id, business_id, amount, phone, send_email}` |
| `order.tagged` | Order Service | Delivery Service | `{order_id, album_id, photo_ids[]}` |
| `payment.success` | Payment Service | Order, Delivery, Notification | `{payment_id, order_id, amount, business_id}` |
| `payment.failed` | Payment Service | Order, Notification | `{payment_id, order_id, reason}` |
| `delivery.created` | Delivery Service | Notification (nếu send_email=true) | `{delivery_id, order_id, code, expires_at, photo_ids[], send_email}` |
| `delivery.expiring` | Cron Job | Notification | `{delivery_id, customer_phone, expires_at, hours_remaining}` |
| `delivery.expired` | Cron Job | Auto-Delete Service, Notification | `{delivery_id, order_id, photo_ids[]}` |
| `staff.invited` | Admin Dashboard | Notification | `{business_id, email, role}` |
| `staff.joined` | Staff Portal | Notification | `{business_id, user_id, role}` |
| `domain.custom.verified` | Storefront Service | Notification | `{business_id, domain}` |

**NOTE:** `album_id` trong events = `photos.primary_album_id` = Tag có `type='album'`

### Queue Topology (RabbitMQ)

```
Exchange: photopro.events (type: topic)

Queue: media-processing-queue     ← photo.uploaded
Queue: face-indexing-queue        ← photo.processed
Queue: order-service-queue        ← payment.*
Queue: delivery-service-queue     ← payment.success, order.tagged
Queue: notification-queue         ← payment.*, delivery.*, photo.auto_deleted, staff.*
Queue: storefront-cache-queue     ← photo.indexed, photo.tagged, tag.*
Queue: auto-delete-queue          ← delivery.expired

DLQ per queue. Retry: exponential backoff (1s, 5s, 30s). Max 3 retries.
```

---

## 13. API ENDPOINT REFERENCE (BUSINESS/STAFF MODEL)

> Base URL: `https://api.photopro.vn/v1`
> Storefront: `https://{subdomain}.photopro.vn/api/v1`

### Authentication

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/otp/send` | Public |

### Staff Portal (CHỈ UPLOAD + GẮN TAG)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/staff/me` | JWT Staff | Get current staff profile |
| GET | `/albums` | JWT Staff | List albums (xem danh sách album có sẵn) |
| GET | `/albums/{id}` | JWT Staff | Get album details |
| POST | `/albums/{id}/photos` | JWT Staff | Upload photos vào album có sẵn |
| GET | `/photos` | JWT Staff | List photos (filter by album, tag) |
| POST | `/photos/{id}/tags` | JWT Staff | Gắn tags cho photo |
| DELETE | `/photos/{id}/tags` | JWT Staff | Xóa tags khỏi photo |
| GET | `/tags` | JWT Staff | List tags (xem danh sách tag để gắn) |

**⚠️ Staff KHÔNG có quyền:**
- `POST /albums` - Tạo album (**CHỈ ADMIN**)
- `POST /albums/{id}/publish` - Publish album (**CHỈ ADMIN**)
- `POST /tags` - Tạo tag (**CHỈ ADMIN**)
- `PUT /tags/{id}` - Cập nhật tag (**CHỈ ADMIN**)
- `DELETE /tags/{id}` - Xóa tag (**CHỈ ADMIN**)
- `GET /orders` - Xem đơn hàng (**CHỈ ADMIN/MANAGER**)

### Admin Dashboard (3 LEVELS)

| Method | Path | Admin System | Admin Sales | Manager |
|--------|------|--------------|-------------|---------|
| GET | `/admin/dashboard` | ✅ | ✅ | ✅ |
| GET | `/admin/albums` | ✅ | ✅ | ✅ |
| DELETE | `/admin/albums/{id}` | ✅ | ❌ | ❌ |
| CRUD | `/admin/staff` | ✅ | ❌ | ❌ |
| GET/PUT | `/admin/pricing` | ✅ | ✅ | ❌ |
| CRUD | `/admin/discounts` | ✅ | ✅ | ❌ |
| GET | `/admin/revenue` | ✅ | ✅ | ❌ |
| POST | `/admin/revenue/export` | ✅ | ✅ | ❌ |
| GET | `/admin/orders` | ✅ Full | ✅ Full | ✅ Summary |
| GET/PUT | `/admin/settings` | ✅ | ❌ | ❌ |
| GET/PUT | `/admin/auto-delete` | ✅ | ❌ | ❌ |

### Storefront (Customer Site — Public)

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Public |
| GET | `/album/{slug}` | Public |
| GET | `/tag/{slug}` | Public |
| GET | `/albums` | Public |
| POST | `/face-search` | Public |
| GET | `/pricing` | Public |
| POST | `/orders` | Public |
| POST | `/orders/{id}/pay` | Public |
| GET | `/orders/{id}` | Email verify |
| GET | `/d/{code}` | Public |
| GET | `/d/{code}/download/{photo_id}` | Public |

### Webhooks

| Method | Path | Auth |
|--------|------|------|
| POST | `/webhooks/stripe` | Stripe signature |
| POST | `/webhooks/vnpay` | VNPay signature |
| POST | `/webhooks/momo` | MoMo signature |

### Admin

| Method | Path | Auth |
|--------|------|------|
| GET | `/admin/businesses` | Admin |
| PUT | `/admin/businesses/{id}/status` | Admin super_admin |
| GET | `/admin/businesses/{id}/payment-status` | Admin |
| GET | `/admin/photos/flagged` | Admin moderator+ |
| PUT | `/admin/photos/{id}/moderate` | Admin moderator+ |
| GET | `/admin/payments/transactions` | Admin finance+ |
| GET | `/admin/payments/disputes` | Admin finance+ |
| PUT | `/admin/payments/disputes/{id}/resolve` | Admin finance+ |
| GET | `/admin/revenue` | Admin finance+ |
| GET | `/admin/settings` | Admin |
| PUT | `/admin/settings` | Admin super_admin |

---

## 14. AI FACE RECOGNITION — KỸ THUẬT CHI TIẾT

(Xem chi tiết tại Module 3, Mục 5)

**Tóm tắt:**
- **Index:** RetinaFace (detection) → ArcFace R100 (embedding 512D) → pgvector (lưu trữ)
- **Search:** 3 scope (current_album / selected_albums / all_albums). Kết quả nhóm theo album.
- **Performance:** < 300ms (1 album) → < 1.5s (tất cả album)
- **Privacy:** Selfie xử lý in-memory, xóa ngay. Không lưu disk/S3.

---

## 15. LƯU TRỮ THEO DOANH NGHIỆP (PER-BUSINESS STORAGE)

### S3 Bucket Structure - MAPPING VỚI SERVER ALBUM

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CRITICAL: S3 PATH = SERVER ALBUM STRUCTURE                             │
│                                                                         │
│ Ảnh trên server được tổ chức theo ALBUM (folder).                       │
│ Mỗi album trên server = 1 Tag với type='album' trong database.          │
│                                                                         │
│ photos.primary_album_id = Tag ID của album chứa ảnh                     │
│ S3 path dùng primary_album_id để mapping 1-1 với folder server          │
└─────────────────────────────────────────────────────────────────────────┘

photopro-media-{env}/
  ├─ {business_id}/
  │   ├─ {album_id}/           ← Album = Tag (type='album'), mapping với folder server
  │   │   ├─ originals/        ← File HD gốc (PRIVATE — signed URL sau thanh toán)
  │   │   ├─ previews/         ← Ảnh watermark (SIGNED URL 1 giờ + hotlink protection)
  │   │   ├─ thumbs/           ← Thumbnail (PUBLIC via CDN, cache 30 ngày)
  │   │   └─ faces/            ← Cropped face (INTERNAL only — IAM role)
  │   │
  │   ├─ {album_id_2}/         ← Album khác
  │   │   ├─ originals/
  │   │   └─ ...
  │   │
  │   ├─ profile/              ← Logo, watermark (PUBLIC via CDN)
  │   └─ exports/              ← Export reports (PRIVATE — signed URL)
  ├─ {business_id_2}/
  └─ ...
```

### Album-Server Mapping Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ALBUM = TAG với type='album' = FOLDER TRÊN SERVER                       │
│                                                                         │
│  1. Server có sẵn các folder ảnh (album):                               │
│     /photos/bana-hills-20022026/                                        │
│     /photos/hoian-19022026/                                             │
│     /photos/caurong-18022026/                                           │
│                                                                         │
│  2. Khi import/sync vào hệ thống:                                       │
│     - Tạo Tag với type='album' cho mỗi folder                           │
│     - photos.primary_album_id = tag_id của album đó                     │
│     - S3 path: /{business_id}/{album_tag_id}/originals/{photo_id}.jpg   │
│                                                                         │
│  3. Khi face search, filter theo album:                                 │
│     - face_embeddings.album_id (denormalized) để filter NHANH           │
│     - Không cần JOIN với photos table khi search                        │
│     - WHERE album_id IN (selected_albums) trước khi vector search       │
│                                                                         │
│  4. Ảnh có thể có NHIỀU tag khác (category, event):                     │
│     - photo_tags table: {photo_id, tag_id} (many-to-many)               │
│     - VD: Ảnh thuộc album "Bà Nà" + tag "#couple" + tag "#sunset"       │
│     - Nhưng chỉ có 1 primary_album_id (folder chứa file gốc)            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Storage với Auto-Delete

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STORAGE LIFECYCLE                                                       │
│                                                                         │
│  1. Photo uploaded → files vào S3:                                      │
│     /{business_id}/{album_id}/originals/{photo_id}.jpg                  │
│     /{business_id}/{album_id}/previews/{photo_id}.jpg                   │
│     /{business_id}/{album_id}/thumbs/{photo_id}.jpg                     │
│     (album_id = photos.primary_album_id)                                │
│                                                                         │
│  2. S3 Lifecycle Rules (auto):                                          │
│     - INTELLIGENT_TIERING sau 30 ngày                                   │
│     - GLACIER sau 90 ngày (optional)                                    │
│                                                                         │
│  3. Auto-Delete cron (daily):                                           │
│     - Query photos where upload_date > retention_days                   │
│     - Delete từ S3 + DB                                                 │
│     - Log deletion event                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Import từ Server có sẵn

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SYNC/IMPORT WORKFLOW (Từ server ảnh có sẵn vào hệ thống)                │
│                                                                         │
│  Input: Server folder structure                                         │
│  /server-photos/                                                        │
│    ├─ BaNa-Hills-20022026/     ← Album folder                           │
│    │   ├─ IMG_001.jpg                                                   │
│    │   ├─ IMG_002.jpg                                                   │
│    │   └─ ...                                                           │
│    ├─ HoiAn-19022026/          ← Album folder                           │
│    └─ ...                                                               │
│                                                                         │
│  Process:                                                               │
│  1. Scan mỗi folder → Tạo Tag (type='album', name=folder_name)          │
│  2. Scan ảnh trong folder → Tạo Photo record:                           │
│     - primary_album_id = tag_id của album vừa tạo                       │
│     - Upload lên S3: /{business_id}/{album_tag_id}/originals/...        │
│  3. Background job: Face detection + indexing                           │
│     - Lưu face_embeddings với album_id = photos.primary_album_id        │
│                                                                         │
│  Output:                                                                │
│  - Tags table: {id: 'abc', type: 'album', name: 'BaNa Hills 20/02'}     │
│  - Photos table: {id: 'xyz', primary_album_id: 'abc', ...}              │
│  - face_embeddings: {photo_id: 'xyz', album_id: 'abc', embedding: ...}  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 16. BẢO MẬT & PHÂN QUYỀN (RBAC)

### Authentication

| Actor | Phương thức | Token |
|-------|-----------|-------|
| Staff | Email/pass | JWT access (15 phút) + refresh (7 ngày, httpOnly cookie) |
| Admin System | Email/pass + 2FA (TOTP) | JWT access (15 phút) |
| Admin Sales | Email/pass | JWT access (15 phút) |
| Manager | Email/pass | JWT access (15 phút) |
| Khách | Không cần tài khoản | Xác định bằng email + SĐT khi checkout |

### JWT Payload

```json
{
  "sub": "user_id",
  "business_id": "uuid",
  "role": "admin_system | admin_sales | manager | staff",
  "iat": 1708700000,
  "exp": 1708700900
}
```

### Full RBAC Matrix (BUSINESS/STAFF MODEL)

| Hành động | Admin System | Admin Sales | Manager | Staff | Customer |
|-----------|:------------:|:-----------:|:-------:|:-----:|:--------:|
| Tạo album/tag | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload ảnh vào album | ✅ | ❌ | ❌ | ✅ | ❌ |
| Gắn tag cho ảnh | ✅ | ❌ | ❌ | ✅ | ❌ |
| Publish album | ✅ | ❌ | ❌ | ❌ | ❌ |
| Xóa ảnh | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Xóa folder/album** | ✅ | ❌ | ❌ | ❌ | ❌ |
| Quản lý pricing | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tạo discount | ✅ | ✅ | ❌ | ❌ | ❌ |
| Xem revenue chi tiết | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export báo cáo | ✅ | ✅ | ❌ | ❌ | ❌ |
| Xem dashboard | ✅ | ✅ | ✅ | ❌ | ❌ |
| Xem orders | ✅ | ✅ | ✅ (summary) | ❌ | ❌ |
| Quản lý staff | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cấu hình auto-delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cấu hình settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Face search | ❌ | ❌ | ❌ | ❌ | ✅ |
| Mua ảnh | ❌ | ❌ | ❌ | ❌ | ✅ |

**Giải thích Staff:**
- Staff (thợ ảnh/nhân viên chụp) **CHỈ** được: Upload ảnh vào album có sẵn, Gắn tag
- Staff **KHÔNG** được: Tạo album, xem dashboard, xem orders, xem doanh thu, publish album, xóa ảnh, settings
- Staff là người đi chụp ảnh tại điểm du lịch và upload về hệ thống, không liên quan đến kinh doanh
- **Album = Tag**: Admin tạo album/tag trước, Staff chỉ upload ảnh vào và gắn tag

### Data Protection

| Mục | Biện pháp |
|-----|-----------|
| Ảnh HD | S3 private, pre-signed URL sau thanh toán (TTL configurable, max downloads) |
| Preview ảnh | Signed URL (1 giờ) + hotlink protection + invisible watermark |
| S3 encryption | SSE-S3 (mặc định) |
| HTTPS | TLS 1.2+ everywhere, HSTS |
| Selfie | In-memory only, xóa ngay sau search |
| Rate limiting | Per-IP: 100 req/phút. Face search: 10 req/phút/IP. |
| Logging | Sensitive data masking: email → `k***@gmail.com`, phone → `09***678` |

---

## 17. GIAO DIỆN — ĐỀ XUẤT UI/UX

### 17.1 Staff Portal (Thợ ảnh - Chỉ Upload + Gắn Tag)

```
┌──────────────────────────────────────────────────────────────────────┐
│ PhotoPro    [Nguyễn Văn A - Thợ ảnh]         [Đăng xuất]             │
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  Albums    │   CHỌN ALBUM ĐỂ UPLOAD                                  │
│  Upload    │   ────────────────────────────────────────────────────  │
│            │   Bà Nà Hills 20/02    │ 150 ảnh  │ [Upload vào đây]    │
│            │   Hội An 19/02         │  80 ảnh  │ [Upload vào đây]    │
│            │   Cầu Rồng 18/02       │  45 ảnh  │ [Upload vào đây]    │
│            │                                                         │
│            │   ⚠️ Bạn không có quyền tạo album mới.                  │
│            │      Liên hệ Admin để tạo album.                        │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘

LƯU Ý: Staff KHÔNG THẤY menu: Dashboard, Orders, Revenue, Settings
       Staff KHÔNG ĐƯỢC tạo album - chỉ upload vào album có sẵn do Admin tạo
       Staff CHỈ THẤY: Albums (chọn để upload), Gắn tag
       Album = Tag trong hệ thống
```

### 17.2 Staff Portal — Upload & Gắn Tag

```
┌──────────────────────────────────────────────────────────────────────┐
│ PhotoPro    Album: Bà Nà Hills 20/02                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │    Kéo thả ảnh vào đây hoặc [Chọn file]                        │  │
│  │                                                                │  │
│  │    Tối đa 20 ảnh/lần · JPG/PNG · Max 50MB/ảnh                  │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ẢNH TRONG ALBUM (150 ảnh)                    [Chọn tất cả] [Gắn tag]│
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │☐      │ │☑       │ │☑      │ │☐      │  │☐      │ │☐       │  │
│  │        │ │        │ │        │ │        │ │        │ │        │   │
│  │#couple │ │        │ │#family │ │#solo   │ │        │ │        │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                                      │
│  GẮN TAG CHO ẢNH ĐÃ CHỌN (2 ảnh):                                    │
│  [#couple] [#family] [#solo] [#portrait] [+ Tạo tag mới]             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 17.3 Admin Dashboard — Admin System View

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📷 PhotoPro Admin    [Admin System]    [🔔 3]    [Đăng xuất]          │
├────────────┬───────────────────────────────────────────────────────────┤
│            │                                                           │
│  Dashboard │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  Albums    │   │ Tổng ảnh │ │ Đã bán   │ │ Đơn hàng │ │ Doanh thu│     │
│  Staff     │   │ tháng    │ │ tháng    │ │ tháng    │ │ tháng    │     │
│  Pricing   │   │   1,250  │ │   234    │ │    89    │ │12.5M VND │     │
│  Discounts │   └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  Orders    │                                                           │
│  Revenue   │   Album chờ publish                         [Publish all] │
│  Settings  │   ────────────────────────────────────────────────────    │
│  Auto-Del  │   Bà Nà Hills 20/02    │ READY │ 150 ảnh │ [Publish] [❌]│
│            │   Hội An 19/02         │ READY │  80 ảnh │ [Publish] [❌]│
│            │                                                           │
│            │   Staff đang hoạt động                                    │
│            │   ────────────────────────────────────────────────────    │
│            │   Nguyễn A  │ 25 ảnh hôm nay │ Online                     │
│            │   Trần B    │ 15 ảnh hôm nay │ Offline 2 giờ              │
│            │                                                           │
└────────────┴───────────────────────────────────────────────────────────┘
```

### 17.4 Admin Dashboard — Quản lý Album/Tag & Staff

```
┌────────────┬─────────────────────────────────────────────────────────┐
│            │                                                         │
│  ...       │  QUẢN LÝ ALBUM/TAG                          [+ Tạo mới] │
│  Albums    │                                                         │
│  Staff     │  Tên Album         │ Số ảnh │ Status    │ Actions       │
│  ...       │  ─────────────────────────────────────────────────────  │
│            │  Bà Nà Hills 20/02 │ 150    │ PUBLISHED │ ✏️ [Publish]  │
│            │  Hội An 19/02      │  80    │ DRAFT     │ ✏️ [Publish]  │
│            │  Cầu Rồng 18/02    │  45    │ DRAFT     │ ✏️ 🗑         │
│            │                                                         │
│            │  QUẢN LÝ STAFF                              [+ Thêm mới]│
│            │                                                         │
│            │  Tên           │ Email              │ Status │ Actions  │
│            │  ─────────────────────────────────────────────────────  │
│            │  Nguyễn Văn A  │ a@email.com        │ Active │ ✏️ 🔒   │
│            │  Trần Văn B    │ b@email.com        │ Active │ ✏️ 🔒   │
│            │                                                         │
│            │  ⚠️ CHỈ ADMIN được tạo album/tag                        │
│            │     Staff chỉ được: Upload ảnh vào album có sẵn, Gắn tag│
│            │     Staff KHÔNG được: tạo album, xem dashboard, orders  │
└────────────┴─────────────────────────────────────────────────────────┘
```

### 17.5 Admin Dashboard — Cài đặt Domain

```
┌────────────┬─────────────────────────────────────────────────────────┐
│            │                                                         │
│  ...       │  CÀI ĐẶT DOMAIN                                         │
│  Settings  │                                                         │
│  ...       │  Subdomain PhotoPro (miễn phí)                          │
│            │  ┌──────────────────────────────────────────────────┐   │
│            │  │ bana-photos .photopro.vn        Đang hoạt động   │   │
│            │  │ [Đổi subdomain]                                  │   │
│            │  └──────────────────────────────────────────────────┘   │
│            │                                                         │
│            │  Domain riêng (tùy chọn)                                │
│            │  ┌──────────────────────────────────────────────────┐   │
│            │  │ Domain: photos.banahills.com                     │   │
│            │  │ Trạng thái: ✅ Active · SSL: ✅ Valid           │   │
│            │  │ CNAME: photos → proxy.photopro.vn  ✅ Verified  │   │
│            │  │ [Sửa domain]  [Xóa domain]                       │   │
│            │  └──────────────────────────────────────────────────┘   │
└────────────┴─────────────────────────────────────────────────────────┘
```

### 17.6 Customer — Checkout (EMAIL TÙY CHỌN)

```
┌───────────────────────────────────────────────────────────────────┐
│  📷 PhotoPro                     studio-abc.photopro.vn           │
│                                                                   │
│  ĐƠN HÀNG: 3 ảnh HD · Tổng: 20,000đ                               │
│                                                                   │
│  Thông tin nhận ảnh                                               │
│  SĐT *     [0912_345_678_________]  ← Bắt buộc                    │
│                                                                   │
│  ☐ Gửi link ảnh qua Email (tùy chọn)                              │
│    Email   [________________________]  ← Chỉ hiện khi tick        │
│                                                                   │
│  ⚠️ KHÔNG mặc định gửi email - chỉ gửi khi khách tick             │
│                                                                   │
│  PHƯƠNG THỨC THANH TOÁN                                           │
│  ● VNPay (QR / ATM / Visa)                                        │
│  ○ MoMo                                                           │
│  ○ ZaloPay                                                        │
│  ○ Thẻ quốc tế (Visa/Master via Stripe)                           │
│                                                                   │
│              [  THANH TOÁN 20,000đ  ]                             │
│  🔒 Giao dịch bảo mật                                              │
└───────────────────────────────────────────────────────────────────┘
```

### 17.7 Customer — Thanh toán thành công (LINK NỔI BẬT)

```
┌───────────────────────────────────────────────────────────────────┐
│                    ✅ THANH TOÁN THÀNH CÔNG!                      │
│                                                                   │
│  ═══════════════════════════════════════════════════════════════  │
│                                                                   │
│  📥 LINK TẢI ẢNH CỦA BẠN:                                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ https://studio-abc.photopro.vn/d/abc123xyz                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│        [📋 SAO CHÉP LINK]         [📥 TẢI QR CODE VỀ MÁY]        │
│                                                                   │
│  ═══════════════════════════════════════════════════════════════  │
│                                                                   │
│  📱 LƯU QR CODE ĐỂ MỞ LẠI SAU:                                    │
│  ┌─────────────────┐                                              │
│  │                 │                                              │
│  │   [QR CODE]     │  ← Nhấn để tải QR về máy                     │
│  │                 │                                              │
│  └─────────────────┘                                              │
│                                                                   │
│  ⚠️ QUAN TRỌNG:                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ⏱️ Link sẽ hết hạn sau: 71:59:45 (đếm ngược)                │  │
│  │                                                              │  │
│  │ 🗑️ Ảnh sẽ bị XÓA VĨNH VIỄN sau khi link hết hạn!           │  │
│  │    Hãy tải về ngay hoặc lưu QR code để mở lại sau.          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│                    [📥 TẢI NGAY TẤT CẢ ẢNH]                       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 17.8 Customer — Trang Landing (KHÔNG HIỂN THỊ ẢNH)

```
┌───────────────────────────────────────────────────────────────────┐
│  📷 BÀ NÀ HILLS PHOTO                                             │
│     studio-abc.photopro.vn                                        │
│                                                                   │
│  ═══════════════════════════════════════════════════════════════  │
│                                                                   │
│  🏔️ CHÀO MỪNG ĐẾN VỚI DỊCH VỤ ẢNH DU LỊCH                        │
│                                                                   │
│  Chúng tôi đã chụp hàng ngàn khoảnh khắc đẹp tại các điểm        │
│  du lịch. Tìm ảnh của bạn chỉ với 1 bức selfie!                  │
│                                                                   │
│  ═══════════════════════════════════════════════════════════════  │
│                                                                   │
│  📍 CHỌN ĐỊA ĐIỂM/TAG (tùy chọn):                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ☐ Tất cả (tìm trong mọi ảnh)                                │  │
│  │ ☐ Bà Nà Hills 20/02                                         │  │
│  │ ☐ Cầu Rồng 19/02                                            │  │
│  │ ☐ Hội An 18/02                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  📸 TÌM ẢNH CỦA BẠN:                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │       [📷 CHỤP SELFIE]   hoặc   [📤 TẢI ẢNH LÊN]            │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ⚠️ Trang này KHÔNG hiển thị ảnh - bạn cần quét mặt để tìm ảnh   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 18. INFRASTRUCTURE & DEPLOYMENT

### Deployment Architecture

| Component | Technology | Ghi chú |
|-----------|-----------|---------|
| Containers | Docker + ECS Fargate (prod) | Mỗi service = 1 container |
| Reverse Proxy | Nginx/OpenResty hoặc Caddy | Wildcard subdomain + custom domain routing + auto-SSL |
| Database | AWS RDS PostgreSQL 16+ (Multi-AZ) | + pgvector extension |
| Cache | AWS ElastiCache (Redis 7+) | Session, rate limit, hot data |
| Storage | AWS S3 + CloudFront CDN | Signed URLs, lifecycle rules |
| Message Queue | RabbitMQ (dev) / AWS SQS+SNS (prod) | — |
| CI/CD | GitHub Actions → ECR → ECS | Auto deploy khi merge main |
| DNS | Route 53 | Wildcard `*.photopro.vn` |
| SSL | AWS ACM (wildcard) + Let's Encrypt (custom domains) | — |
| IaC | Terraform | Toàn bộ infra as code |

### Docker Compose (Dev)

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports: ["5432:5432"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
  business-service:
    build: ./services/business
    ports: ["3001:3001"]
  media-processing:
    build: ./services/media-processing
  face-index:
    build: ./services/face-index
    ports: ["3003:3003"]
  storefront:
    build: ./apps/storefront
    ports: ["3000:3000"]
  order-service:
    build: ./services/order
    ports: ["3005:3005"]
  payment-service:
    build: ./services/payment
    ports: ["3006:3006"]
  delivery-service:
    build: ./services/delivery
    ports: ["3007:3007"]
  admin-billing:
    build: ./services/admin-billing
    ports: ["3008:3008"]
  notification-service:
    build: ./services/notification
    ports: ["3009:3009"]
  staff-service:
    build: ./services/staff
    ports: ["3010:3010"]
```

### Scaling Strategy

| Service | Scale trigger | Min | Max |
|---------|-------------|-----|-----|
| Business Service | CPU > 70% | 2 | 10 |
| Media Processing Worker | Queue depth > 50 | 1 | 20 |
| Face Index Worker | Queue depth > 30 | 1 | 10 |
| Storefront | CPU > 70% | 2 | 20 |
| Order Service | CPU > 70% | 2 | 10 |
| Payment Service | CPU > 70% | 2 | 5 |
| Delivery Service | CPU > 60% | 1 | 5 |
| Notification Service | Queue depth > 100 | 1 | 5 |
| Staff Service | CPU > 70% | 1 | 5 |

---

## 19. MONITORING & ALERTING

### Metrics

| Metric | Source | Alert khi | Severity |
|--------|--------|-----------|----------|
| API latency p99 | API Gateway | > 3 giây | Warning |
| API error rate (5xx) | API Gateway | > 1% | Critical |
| Queue depth | RabbitMQ/SQS | > 1000 messages | Warning |
| DLQ message count | DLQ | > 0 | Critical |
| Face search latency p99 | Face Index | > 2 giây | Warning |
| Payment success rate | Payment Service | < 95% | Critical |
| Auto-transfer failure | Payment Service | > 0 | Critical |
| Custom domain SSL expiring | Cron job | < 7 ngày | Warning |
| S3 storage per business | S3 Inventory | > 90% quota | Info |
| CPU/Memory per container | ECS/CloudWatch | > 80% sustained | Warning |
| Image hotlink attempts blocked | Nginx/CDN | > 1000/giờ | Warning |

### Logging

- Format: Structured JSON (pino for Node.js, structlog for Python)
- Correlation ID: `X-Correlation-Id` truyền qua TẤT CẢ services
- Aggregation: CloudWatch Logs → OpenSearch
- Retention: 30 ngày hot, 90 ngày cold (S3)
- Sensitive data masking: KHÔNG log plaintext email/SĐT/CCCD/bank

### Alerting

| Severity | Channel | Response time |
|----------|---------|--------------|
| Critical | PagerDuty → on-call phone | 5 phút |
| Warning | Slack #alerts | 30 phút |
| Info | Slack #monitoring | Next business day |

---

## 20. TÍNH NĂNG BỔ SUNG (ROADMAP)

### Phase 1: MVP Enhancement (Tháng 1–2)

| Tính năng | Mô tả | Effort | Impact |
|-----------|-------|--------|--------|
| AI Auto-Retouch | Tự động chỉnh sáng, cân bằng trắng, làm đẹp da. GFPGAN + 3D LUT. Target < $0.03/ảnh. | Trung bình | Conversion +20-40% |
| AI Review | Chấm điểm kỹ thuật 0–100 (blur, exposure, composition). NIMA/MUSIQ. | Nhỏ | Album chất lượng hơn |

### Phase 2: Real-time & Mở rộng (Tháng 3–5)

| Tính năng | Mô tả | Effort | Impact |
|-----------|-------|--------|--------|
| Real-time Camera-to-Cloud | Mobile companion app. Kết nối máy ảnh → điện thoại → auto upload. | Lớn | Conversion +100-200% |
| Video Support | Upload clip ≤ 60s. FFmpeg transcoding. Preview 480p watermark. | Trung bình | Tăng AOV |
| Mobile App cho Staff | Staff upload ảnh từ điện thoại, xem album (đã tạo), gắn tag. | Trung bình | — |

### Phase 3: Chuyên nghiệp hóa (Tháng 6–8)

| Tính năng | Mô tả |
|-----------|-------|
| Custom Storefront Theme | Admin tùy chỉnh giao diện site (màu, font, layout) |
| Custom Branding / White-label | Ẩn branding PhotoPro (Enterprise) |
| Album Templates | 6+ template: Grid, Masonry, Slideshow, Dark Elegant, Polaroid, Magazine |
| Instant Payout (Stripe) | Doanh nghiệp nhận tiền trong vài phút |

### Phase 4: Growth (Tháng 9+)

Referral program, Album music (royalty-free), Privacy auto-blur (biển số, mặt người ngoài), Multi-currency (USD/EUR), Human retoucher marketplace.

---

## 21. TECH STACK KHUYẾN NGHỊ

| Category | Technology | Lý do |
|----------|-----------|-------|
| **Frontend (Storefront)** | Next.js 14+ (App Router) + TailwindCSS | SSR/SSG, dynamic subdomain routing |
| **Frontend (Portal/Admin)** | React + Vite + TailwindCSS + shadcn/ui | SPA nhanh |
| **Backend Services** | Node.js (Fastify) | Nhanh, phù hợp CRUD + event-driven |
| **AI Pipeline** | Python (FastAPI) | InsightFace, PyTorch ecosystem |
| **Database** | PostgreSQL 16+ + pgvector | Đa năng, vector search tích hợp |
| **Cache** | Redis 7+ | Rate limit, session, signed URL cache |
| **Object Storage** | AWS S3 + CloudFront CDN | Signed URL, lifecycle rules |
| **Message Queue** | RabbitMQ (dev) → AWS SQS+SNS (prod) | — |
| **Image Processing** | Sharp (Node.js) + invisible-watermark (Python) | Watermark + steganography |
| **Face Recognition** | InsightFace (self-host) hoặc Amazon Rekognition | — |
| **Payment** | VNPay + MoMo + Bank Transfer | Vietnam market |
| **Email** | AWS SES + MJML templates | — |
| **SMS** | eSMS.vn (VN) / Twilio (quốc tế) | — |
| **Reverse Proxy** | Nginx/OpenResty hoặc Caddy | Wildcard subdomain + auto-SSL |
| **SSL** | AWS ACM (wildcard) + Let's Encrypt (custom domains) | — |
| **DNS** | Route 53 | Wildcard `*.photopro.vn` |
| **CI/CD** | GitHub Actions → ECR → ECS | — |
| **Container** | Docker + ECS Fargate | Serverless containers, auto-scaling |
| **IaC** | Terraform | — |
| **QR Code** | npm `qrcode` | SVG/PNG output |

---

## 22. HỆ THỐNG TAG (TAG SYSTEM)

### 22.1 Khái niệm Tag & Album-Server Mapping

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TAG SYSTEM CONCEPT & SERVER ALBUM MAPPING                               │
│                                                                         │
│  Tag là đơn vị phân loại linh hoạt:                                     │
│                                                                         │
│  1. ALBUM = Tag đặc biệt (type: 'album') = FOLDER TRÊN SERVER           │
│     ╔═════════════════════════════════════════════════════════════════╗ │
│     ║ CRITICAL: Mỗi folder ảnh trên server = 1 Tag với type='album'   ║ │
│     ║                                                                 ║ │
│     ║ Server folder:    /photos/BaNa-20022026/                        ║ │
│     ║                          ↓ sync                                 ║ │
│     ║ Database:         tags(id='abc', type='album', name='BaNa...')  ║ │
│     ║                          ↓                                      ║ │
│     ║ photos:           primary_album_id = 'abc'                      ║ │
│     ║ face_embeddings:  album_id = 'abc' (denormalized)               ║ │
│     ║ S3 path:          /{business_id}/abc/originals/{photo_id}.jpg   ║ │
│     ╚═════════════════════════════════════════════════════════════════╝ │
│     - Mỗi ảnh CHỈ thuộc 1 album (primary_album_id)                      │
│     - Nhưng có thể có NHIỀU tag khác (category, event,...)              │
│                                                                         │
│  2. CATEGORY = Tag phân loại (type: 'category')                         │
│     - #couple, #family, #solo, #portrait, #landscape                    │
│     - 1 ảnh có thể thuộc nhiều category                                 │
│     - Dùng để filter thêm khi browse/search                             │
│                                                                         │
│  3. EVENT = Tag sự kiện (type: 'event')                                 │
│     - #wedding, #graduation, #birthday                                  │
│     - Cho phép filter ảnh theo sự kiện                                  │
│                                                                         │
│  4. ORDER = Tag tự động (type: 'order')                                 │
│     - Khi khách mua ảnh → ảnh được gắn tag order_id                     │
│     - Dùng cho tracking ảnh đã bán                                      │
│                                                                         │
│  5. CUSTOM = Tag tùy chỉnh (type: 'custom')                             │
│     - Admin tạo tag theo nhu cầu                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 22.2 Album vs Tag Relationship

```
┌─────────────────────────────────────────────────────────────────────────┐
│ MỐI QUAN HỆ ALBUM (primary) VÀ TAGS (additional)                        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Photo: IMG_001.jpg                                              │   │
│  │                                                                 │   │
│  │ primary_album_id: "abc"  ← Album chứa file (1-1)                │   │
│  │                            Mapping với folder server            │   │
│  │                            S3: /{business}/{abc}/originals/...  │   │
│  │                            face_embeddings.album_id = "abc"     │   │
│  │                                                                 │   │
│  │ photo_tags: [             ← Tags bổ sung (many-to-many)         │   │
│  │   {tag_id: "abc", type: "album"},     // album tag              │   │
│  │   {tag_id: "def", type: "category"},  // #couple                │   │
│  │   {tag_id: "ghi", type: "category"},  // #sunset                │   │
│  │   {tag_id: "jkl", type: "event"}      // #valentine2026         │   │
│  │ ]                                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  TÓM TẮT:                                                               │
│  - primary_album_id: XÁC ĐỊNH file ở đâu trên storage (1 ảnh = 1 album) │
│  - photo_tags: PHÂN LOẠI ảnh, dùng cho filter/search (1 ảnh nhiều tag)  │
│  - face_embeddings.album_id: DENORMALIZED từ photos.primary_album_id    │
│    để filter NHANH khi face search (không cần JOIN)                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 22.3 Tag API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/tags` | POST | **JWT Admin** | Tạo tag mới (**CHỈ ADMIN**) |
| `/tags` | GET | JWT Staff | Danh sách tags (filter by type) |
| `/tags/{id}` | GET | JWT Staff | Chi tiết tag |
| `/tags/{id}` | PUT | **JWT Admin** | Cập nhật tag (**CHỈ ADMIN**) |
| `/tags/{id}` | DELETE | JWT Admin System | Xóa tag |
| `/photos/{id}/tags` | POST | JWT Staff | Gắn tags cho photo |
| `/photos/{id}/tags` | DELETE | JWT Staff | Xóa tags khỏi photo |
| `/photos` | GET | JWT Staff | `?tag_id=xxx` filter ảnh theo tag |

### 22.3 Tag Request/Response

```javascript
// POST /tags
{
  "name": "Cặp đôi",
  "type": "category",         // 'album' | 'category' | 'event' | 'custom'
  "color": "#FF5733",         // Optional hex color
  "description": "Ảnh chụp cặp đôi"
}

// Response
{
  "id": "uuid",
  "business_id": "uuid",
  "name": "Cặp đôi",
  "slug": "cap-doi",
  "type": "category",
  "color": "#FF5733",
  "photo_count": 0,
  "created_at": "2025-03-01T10:00:00Z"
}

// POST /photos/{id}/tags
{
  "tag_ids": ["uuid-1", "uuid-2", "uuid-3"]
}

// Response
{
  "photo_id": "uuid",
  "tags": [
    {"id": "uuid-1", "name": "Bà Nà Hills", "type": "album"},
    {"id": "uuid-2", "name": "Cặp đôi", "type": "category"},
    {"id": "uuid-3", "name": "Wedding", "type": "event"}
  ]
}
```

### 22.4 Customer Tag-based Access

```
Customer có thể xem ảnh theo tag qua URL:

  {subdomain}.photopro.vn/tag/cap-doi        → Tất cả ảnh có tag "Cặp đôi"
  {subdomain}.photopro.vn/tag/wedding        → Tất cả ảnh có tag "Wedding"
  {subdomain}.photopro.vn/album/bana-hills   → Tất cả ảnh trong album Bà Nà Hills

Customer chỉ thấy ảnh có status = PUBLISHED
```

---

## 23. HỆ THỐNG TỰ ĐỘNG XÓA (AUTO-DELETE SYSTEM)

### 23.1 Nguyên tắc Auto-Delete

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AUTO-DELETE RULES                                                       │
│                                                                         │
│  1. RETENTION PERIOD (Admin configurable):                              │
│     - photo_retention_days = 30 (default)                               │
│     - Ảnh upload quá N ngày → scheduled to delete                       │
│                                                                         │
│  2. DELIVERY LINK EXPIRATION:                                           │
│     - delivery_link_ttl_hours = 72 (default)                            │
│     - Link hết hạn → customer không download được                       │
│                                                                         │
│  3. DELETE MODES:                                                       │
│     - delete_unsold_only = false: Xóa TẤT CẢ ảnh cũ                     │
│     - delete_unsold_only = true: Chỉ xóa ảnh CHƯA BÁN                   │
│                                                                         │
│  4. AUTO-DELETE SCOPE:                                                  │
│     - Photo files (S3: original, preview, thumbnail)                    │
│     - Face embeddings (DB)                                              │
│     - Photo-tag relationships (DB)                                      │
│     - KHÔNG xóa: Order records, delivery logs (audit trail)             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 23.2 Cron Job Schedule

| Job Name | Schedule | Description |
|----------|----------|-------------|
| `check-delivery-links` | Every hour | Mark expired links, send warnings |
| `delete-expired-photos` | Daily 3:00 AM | Delete photos past retention |
| `cleanup-orphan-s3` | Weekly Sunday 2:00 AM | Remove orphan S3 files |
| `generate-deletion-report` | Daily 4:00 AM | Email report to Admin |

### 23.3 Auto-Delete Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DAILY AUTO-DELETE FLOW (3:00 AM)                                        │
│                                                                         │
│  Step 1: Query photos to delete                                         │
│  ────────────────────────────────                                       │
│  SELECT * FROM photos                                                   │
│  WHERE upload_date < NOW() - INTERVAL '{retention_days} days'           │
│  [AND id NOT IN (SELECT photo_id FROM order_items WHERE paid)]          │
│                                                                         │
│  Step 2: Batch delete from S3                                           │
│  ────────────────────────────────                                       │
│  - Delete: original_path, preview_path, thumbnail_path                  │
│  - Batch size: 100 files per request                                    │
│                                                                         │
│  Step 3: Delete from DB                                                 │
│  ────────────────────────────────                                       │
│  - DELETE FROM face_embeddings WHERE photo_id IN (...)                  │
│  - DELETE FROM photo_tags WHERE photo_id IN (...)                       │
│  - DELETE FROM photos WHERE id IN (...)                                 │
│                                                                         │
│  Step 4: Log & Notify                                                   │
│  ────────────────────────────────                                       │
│  - INSERT INTO auto_delete_logs (...)                                   │
│  - EMIT event: photo.auto_deleted                                       │
│  - Email report to Admin System                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 23.4 Admin Settings API

```javascript
// GET /admin/auto-delete/config
{
  "photo_retention_days": 30,
  "delivery_link_ttl_hours": 72,
  "auto_delete_enabled": true,
  "delete_unsold_only": false,
  "last_run_at": "2025-03-01T03:00:00Z",
  "next_run_at": "2025-03-02T03:00:00Z",
  "pending_delete_count": 1250,
  "pending_delete_size_gb": 15.5
}

// PUT /admin/auto-delete/config (Admin System only)
{
  "photo_retention_days": 60,
  "delivery_link_ttl_hours": 168,
  "auto_delete_enabled": true,
  "delete_unsold_only": true
}

// GET /admin/auto-delete/preview
// Preview photos that would be deleted
{
  "photos_to_delete": 1250,
  "storage_to_free_gb": 15.5,
  "by_tag": [
    {"tag_id": "uuid", "name": "Bà Nà 01/02", "count": 250},
    {"tag_id": "uuid", "name": "Hội An 28/01", "count": 180}
  ]
}

// POST /admin/auto-delete/run (Manual trigger - Admin System only)
{
  "confirm": true,
  "dry_run": false
}
```

---

## 24. FRONTEND SPECIFICATION

### 24.1 Frontend Applications

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND APPS                                                           │
│                                                                         │
│  1. CUSTOMER STOREFRONT (Next.js 14+)                                   │
│     URL: {subdomain}.photopro.vn                                        │
│     Purpose: Browse albums, search face, purchase photos                │
│     Features:                                                           │
│     - SSR for SEO + fast initial load                                   │
│     - Lazy loading gallery                                              │
│     - Face search with camera/upload                                    │
│     - Cart + Checkout                                                   │
│     - Delivery link access                                              │
│                                                                         │
│  2. STAFF PORTAL (React + Vite)                                         │
│     URL: portal.photopro.vn                                             │
│     Purpose: Upload, tag, manage photos                                 │
│     Features:                                                           │
│     - Drag-drop bulk upload                                             │
│     - Tag management                                                    │
│     - Album organization                                                │
│     - Order list view                                                   │
│                                                                         │
│  3. ADMIN DASHBOARD (React + Vite)                                      │
│     URL: admin.photopro.vn                                              │
│     Purpose: System management, reporting                               │
│     Features:                                                           │
│     - Dashboard with charts                                             │
│     - Staff management                                                  │
│     - Pricing configuration                                             │
│     - Auto-delete settings                                              │
│     - Revenue reports                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 24.2 Customer Storefront Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page, featured albums |
| Album List | `/albums` | Grid of all published albums |
| Album Detail | `/album/{slug}` | Photo gallery with filters |
| Tag Filter | `/tag/{slug}` | Photos filtered by tag |
| Face Search | `/face-search` | Camera/upload selfie → find photos |
| Cart | `/cart` | Selected photos, pricing packages |
| Checkout | `/checkout` | Payment form |
| Order Status | `/order/{id}` | Order tracking (email verify) |
| Delivery | `/d/{code}` | Download purchased photos |

### 24.3 Staff Portal Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Quick stats, recent uploads |
| Albums | `/albums` | Album list + create |
| Album Detail | `/albums/{id}` | Photos in album, manage |
| Upload | `/albums/{id}/upload` | Bulk upload interface |
| Tags | `/tags` | Tag management |
| Orders | `/orders` | Order list |
| Profile | `/profile` | Staff profile |

### 24.4 Admin Dashboard Pages

| Page | Route | Admin System | Admin Sales | Manager |
|------|-------|--------------|-------------|---------|
| Dashboard | `/` | ✅ | ✅ | ✅ |
| Albums | `/albums` | ✅ | ✅ | ✅ |
| Staff | `/staff` | ✅ | ❌ | ❌ |
| Pricing | `/pricing` | ✅ | ✅ | ❌ |
| Discounts | `/discounts` | ✅ | ✅ | ❌ |
| Revenue | `/revenue` | ✅ | ✅ | ❌ |
| Orders | `/orders` | ✅ Full | ✅ Full | ✅ Summary |
| Settings | `/settings` | ✅ | ❌ | ❌ |
| Auto-Delete | `/auto-delete` | ✅ | ❌ | ❌ |

### 24.5 UI Components (Shared)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ REUSABLE COMPONENTS                                                     │
│                                                                         │
│  Gallery:                                                               │
│  - PhotoGrid: Responsive grid, lazy load thumbnails                     │
│  - PhotoLightbox: Full-screen preview with watermark                    │
│  - PhotoSelect: Multi-select for cart/tagging                           │
│                                                                         │
│  Upload:                                                                │
│  - DropZone: Drag-drop area, file validation                            │
│  - UploadProgress: Progress bar, retry failed                           │
│  - BatchUploader: Queue management                                      │
│                                                                         │
│  Tags:                                                                  │
│  - TagPicker: Multi-select tags                                         │
│  - TagBadge: Colored tag display                                        │
│  - TagInput: Create new tag inline                                      │
│                                                                         │
│  Search:                                                                │
│  - CameraCapture: Webcam selfie                                         │
│  - ImageUpload: File upload alternative                                 │
│  - SearchResults: Grouped by album                                      │
│                                                                         │
│  Payment:                                                               │
│  - PricingTable: Package selection                                      │
│  - CartSummary: Selected photos + total                                 │
│  - PaymentForm: Gateway selection                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 24.6 Performance Targets

| Metric | Target | Storefront | Portal | Admin |
|--------|--------|------------|--------|-------|
| FCP | < 1.0s | ✅ SSR | ✅ Preload | ✅ Preload |
| LCP | < 2.0s | ✅ Priority images | ✅ Lazy load | ✅ Lazy load |
| TTI | < 3.0s | ✅ Code split | ✅ Code split | ✅ Code split |
| CLS | < 0.1 | ✅ Image placeholders | ✅ Skeletons | ✅ Skeletons |
| Lighthouse | > 90 | ✅ | ✅ | ✅ |

### 24.7 State Management

| App | Solution | Reason |
|-----|----------|--------|
| Storefront | React Query + Zustand | Server state + minimal client state |
| Staff Portal | React Query + Zustand | Upload queue, tag state |
| Admin Dashboard | React Query + Zustand | Forms, filters |

### 24.8 Responsive Breakpoints

```css
/* TailwindCSS breakpoints */
sm: 640px    /* Mobile landscape */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
2xl: 1536px  /* Extra large */

/* Photo grid columns */
Mobile:   2 columns
Tablet:   3-4 columns
Desktop:  4-6 columns
```

---

> *— Hết tài liệu —*
> *PhotoPro Technical Specification — Developer Edition*
> *Business/Staff Model với Tag System, Auto-Delete, và 3 Admin Levels*
> *Ngày cập nhật: 2026*
