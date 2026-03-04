# PHOTOPRO — Đặc Tả Kỹ Thuật v2.0 — Các Thay Đổi & Bổ Sung

> **Phiên bản:** 2.0  
> **Cập nhật:** 04/03/2026  
> **Mục đích:** Tài liệu mô tả chi tiết các thay đổi, bổ sung tính năng cho Dashboard và Frontend  
> **Tham chiếu:** Dựa trên `photopro-spec-final.md` (v3.0), `photopro-frontend-spec.md` (v2.1)

---

## MỤC LỤC

### PHẦN A — DASHBOARD
1. [A1: Thống kê nhân viên (Staff Statistics)](#a1-thống-kê-nhân-viên-staff-statistics)
2. [A2: Đổi tên Album → Địa Điểm + Phân quyền Staff](#a2-đổi-tên-album--địa-điểm--phân-quyền-staff)
3. [A3: Phân tách ảnh theo Staff trong Album](#a3-phân-tách-ảnh-theo-staff-trong-album)
4. [A4: Dashboard phân quyền cho Staff](#a4-dashboard-phân-quyền-cho-staff)
5. [A5: Quản lý nhân viên - Bổ sung trường cho Staff](#a5-quản-lý-nhân-viên---bổ-sung-trường-cho-staff)
6. [A6: Cài đặt giao diện - Chọn mã màu tùy chỉnh](#a6-cài-đặt-giao-diện---chọn-mã-màu-tùy-chỉnh)

### PHẦN B — FRONTEND
7. [B1: Face Search - Bộ lọc ngày chụp](#b1-face-search---bộ-lọc-ngày-chụp)

### PHẦN C — LUỒNG ĐƠN HÀNG & LƯU TRỮ
8. [C1: Album đơn hàng - Lưu trữ ảnh đã mua](#c1-album-đơn-hàng---lưu-trữ-ảnh-đã-mua)
9. [C2: Bỏ chế độ xóa ảnh - Chỉ giữ thời hạn lưu trữ](#c2-bỏ-chế-độ-xóa-ảnh---chỉ-giữ-thời-hạn-lưu-trữ)

---

## A1. THỐNG KÊ NHÂN VIÊN (STAFF STATISTICS)

### Mô tả
Thêm trang **Thống kê nhân viên** trong mục **Kinh Doanh** của Dashboard. Trang này hiển thị dữ liệu thống kê chi tiết về hiệu suất của từng Staff (Photographer).

### Phân quyền hiển thị

| Vai trò | Cách hiển thị |
|---------|--------------|
| **Admin System** | Hiển thị bảng danh sách tất cả Staff. Click vào Staff → Modal chi tiết thống kê. |
| **Admin Sales** | Hiển thị bảng danh sách tất cả Staff (read-only). Click vào Staff → Modal chi tiết. |
| **Manager** | Hiển thị bảng danh sách tất cả Staff (read-only). Click vào Staff → Modal chi tiết. |
| **Staff** | Hiển thị trực tiếp trang thống kê của chính mình (không thấy staff khác). |

### Dữ liệu thống kê mỗi Staff

| Trường | Mô tả | Nguồn |
|--------|-------|-------|
| `staff_id` | Mã nhân viên | `staff.employee_code` |
| `staff_name` | Tên nhân viên | `staff.name` |
| `total_photos_uploaded` | Tổng số ảnh đã upload | `COUNT(photos WHERE uploader_id = staff_id)` |
| `total_photos_sold` | Tổng số ảnh đã bán | `COUNT(order_items WHERE photo.uploader_id = staff_id)` |
| `revenue_today` | Doanh thu hôm nay | `SUM(order_items.price) WHERE date = today` |
| `revenue_this_month` | Doanh thu tháng này | `SUM(order_items.price) WHERE month = current` |
| `revenue_this_year` | Doanh thu năm nay | `SUM(order_items.price) WHERE year = current` |
| `total_revenue` | Tổng doanh thu | `SUM(order_items.price)` |
| `assigned_locations` | Địa điểm được phân công | `staff_location_assignments` |
| `conversion_rate` | Tỉ lệ chuyển đổi (ảnh bán/ảnh up) | `total_photos_sold / total_photos_uploaded * 100` |
| `avg_revenue_per_photo` | Doanh thu trung bình/ảnh | `total_revenue / total_photos_sold` |
| `last_upload_date` | Ngày upload gần nhất | `MAX(photos.created_at)` |

### Bảng SQL bổ sung

```sql
-- View thống kê staff (tạo view cho query nhanh)
CREATE OR REPLACE VIEW v_staff_statistics AS
SELECT 
    s.id AS staff_id,
    s.employee_code,
    s.name AS staff_name,
    s.avatar,
    s.status,
    COUNT(DISTINCT p.id) AS total_photos_uploaded,
    COUNT(DISTINCT CASE WHEN oi.id IS NOT NULL THEN p.id END) AS total_photos_sold,
    COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN oi.price ELSE 0 END), 0) AS revenue_today,
    COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM o.created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
                       AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) 
                  THEN oi.price ELSE 0 END), 0) AS revenue_this_month,
    COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) 
                  THEN oi.price ELSE 0 END), 0) AS revenue_this_year,
    COALESCE(SUM(oi.price), 0) AS total_revenue,
    MAX(p.created_at) AS last_upload_date
FROM staff s
LEFT JOIN photos p ON p.uploader_id = s.id
LEFT JOIN order_items oi ON oi.photo_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
GROUP BY s.id, s.employee_code, s.name, s.avatar, s.status;
```

### API Endpoints

```
GET /api/v1/staff/statistics              → Danh sách thống kê tất cả staff (Admin)
GET /api/v1/staff/statistics/:staffId     → Chi tiết thống kê 1 staff
GET /api/v1/staff/statistics/me           → Thống kê của staff đang đăng nhập
GET /api/v1/staff/statistics/:staffId/revenue?period=day|month|year
                                          → Doanh thu chi tiết theo khoảng thời gian
```

### UI Layout

**Dạng Admin (Bảng):**
```
┌──────────────────────────────────────────────────────────────────┐
│ Thống kê nhân viên                                   [Xuất Excel]│
├──────────────────────────────────────────────────────────────────┤
│ [Tìm kiếm...] [Lọc trạng thái ▼] [Khoảng thời gian ▼]            │
├────┬────────────┬─────────┬──────────┬──────────┬────────┬───────┤
│ #  │ Nhân viên  │ Mã NV   │ Ảnh UP   │ Ảnh bán  │ DT tháng│ ···  │
├────┼────────────┼─────────┼──────────┼──────────┼────────┼───────┤
│ 1  │ [Av] Lê C  │ NV001   │ 2,800    │ 1,200    │ 12M    │ [👁]  │
│ 2  │ [Av] Phạm D│ NV002   │ 2,450    │ 980      │ 9.8M   │ [👁]  │
│ ...│            │         │          │          │        │       │
└────┴────────────┴─────────┴──────────┴──────────┴────────┴───────┘
     → Click vào row → Mở Modal chi tiết
```

**Modal chi tiết Staff:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Thống kê: Lê Văn C (NV001)                                [✕]   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│ │ Ảnh UP  │ │ Ảnh bán │ │ Tỉ lệ   │ │ Tổng DT │                 │
│ │ 2,800   │ │ 1,200   │ │ 42.8%   │ │ 60M     │                 │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                 │
│                                                                 │
│ Doanh thu: [Ngày] [Tháng] [Năm]                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │            📊 Biểu đồ doanh thu                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Địa điểm được phân công:                                        │
│ [Bà Nà Hills] [Hội An] [Cầu Rồng]                               │
│                                                                 │
│ Upload gần nhất: 03/03/2026                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Dạng Staff (Trang trực tiếp):**
```
┌─────────────────────────────────────────────────────────────────┐
│ Thống kê của tôi                                                │
├─────────────────────────────────────────────────────────────────┤
│ (Hiển thị trực tiếp tất cả thông tin như modal ở trên)          │
│ Không có bảng danh sách, chỉ hiện dữ liệu của chính mình        │
└─────────────────────────────────────────────────────────────────┘
```

---

## A2. ĐỔI TÊN ALBUM → ĐỊA ĐIỂM + PHÂN QUYỀN STAFF

### Mô tả
- **Đổi tên** mục "Albums" → "Địa Điểm" trong sidebar và toàn bộ giao diện
- **Bổ sung trường** chọn Staff được quyền upload ảnh vào từng Địa Điểm
- Staff chỉ được xem ảnh do chính mình upload (không cần cột "Xem" riêng)
- **Bổ sung đầy đủ modal**: Tạo mới, Sửa, Xem chi tiết, Xóa (confirm)

### Thay đổi Database

```sql
-- Bảng staff_location_assignments: Gắn staff vào địa điểm (album)
CREATE TABLE staff_location_assignments (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE, -- tag type='album' = Địa Điểm
    can_upload BOOLEAN DEFAULT TRUE,    -- Quyền upload ảnh vào địa điểm (Staff luôn chỉ xem ảnh của mình)
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by INTEGER REFERENCES staff(id), -- Admin nào gán
    UNIQUE(staff_id, tag_id)
);

CREATE INDEX idx_staff_location_staff ON staff_location_assignments(staff_id);
CREATE INDEX idx_staff_location_tag ON staff_location_assignments(tag_id);
```

### API Endpoints

```
-- Quản lý Địa Điểm (Album) 
GET    /api/v1/locations                          → Danh sách địa điểm
POST   /api/v1/locations                          → Tạo địa điểm mới  
PUT    /api/v1/locations/:id                      → Cập nhật địa điểm
DELETE /api/v1/locations/:id                      → Xóa địa điểm
GET    /api/v1/locations/:id                      → Chi tiết địa điểm

-- Phân quyền Staff cho Địa Điểm
GET    /api/v1/locations/:id/staff                → Danh sách staff được gán
POST   /api/v1/locations/:id/staff                → Gán staff vào địa điểm
DELETE /api/v1/locations/:id/staff/:staffId        → Gỡ staff khỏi địa điểm
```

### Modal Tạo/Sửa Địa Điểm (Bổ sung)

```
┌─────────────────────────────────────────────────────────────────┐
│ Tạo Địa Điểm mới / Sửa Địa Điểm                        [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Tên Địa Điểm *           [_________________________]           │
│ Vị trí / Địa chỉ         [_________________________]           │
│ Ngày chụp *               [____/____/________]                  │
│ Mô tả                     [_________________________]           │
│                            [_________________________]           │
│                                                                 │
│ ─── Phân quyền nhân viên ────────────────────────────────────── │
│                                                                 │
│ Chọn nhân viên được quyền upload ảnh:                           │
│ (Staff chỉ xem được ảnh do chính mình upload)                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Nhân viên                              Được upload          │ │
│ │ ☑ Lê Văn C (NV001) - Staff               [☑]              │ │
│ │ ☑ Phạm Thị D (NV002) - Staff             [☑]              │ │
│ │ ☐ Hoàng Văn E (NV003) - Staff            [☐]              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                               [Hủy]  [💾 Lưu Địa Điểm]       │
└─────────────────────────────────────────────────────────────────┘
```

### Modal Xem Chi Tiết Địa Điểm

```
┌─────────────────────────────────────────────────────────────────┐
│ Chi tiết: Bà Nà Hills 20/02                              [✕]  │
├─────────────────────────────────────────────────────────────────┤
│ Trạng thái: [Published ✅]    Ngày tạo: 20/02/2026            │
│ Vị trí: Bà Nà Hills, Đà Nẵng                                  │
│                                                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ 150 ảnh │ │ 120 đơn │ │ 6M DT   │ │ 3 Staff │               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                 │
│ Nhân viên được phân công:                                       │
│ • Lê Văn C (NV001) - 80 ảnh uploaded                           │
│ • Phạm Thị D (NV002) - 70 ảnh uploaded                         │
│                                                                 │
│ Mô tả: Bộ ảnh chụp tại Bà Nà Hills ngày 20/02/2026           │
├─────────────────────────────────────────────────────────────────┤
│                          [✏️ Sửa]  [🗑️ Xóa]  [Đóng]          │
└─────────────────────────────────────────────────────────────────┘
```

### Thay đổi UI

| Vị trí | Cũ | Mới |
|--------|-----|-----|
| Sidebar nav | `Albums` | `Địa Điểm` |
| Sidebar icon | `folder-open` | `map-pin` |
| Page title | `Quản lý Albums` | `Quản lý Địa Điểm` |
| Button tạo | `Tạo Album mới` | `Tạo Địa Điểm mới` |
| Modal title | `Tạo Album mới` | `Tạo Địa Điểm mới` |
| Card title | `Bà Nà Hills 20/02` | (giữ nguyên tên) |

---

## A3. PHÂN TÁCH ẢNH THEO STAFF TRONG ALBUM

### Mô tả
Khi staff upload ảnh vào một Địa Điểm (album), staff chỉ được **xem ảnh mà chính mình upload**, KHÔNG được xem ảnh của staff khác upload vào chung địa điểm đó.

### Giải pháp kỹ thuật

#### Bảng SQL liên quan

```sql
-- Bảng photos đã có sẵn trường uploader_id
-- photos.uploader_id = staff.id (người upload ảnh)

-- Khi staff query ảnh trong album:
-- Luôn filter theo uploader_id = current_staff_id

-- Index tối ưu
CREATE INDEX idx_photos_uploader_tag ON photos(uploader_id, tag_id);
```

#### Luồng xử lý chi tiết

```
┌─────────────────────────────────────────────────────────────────┐
│ LUỒNG: Staff xem ảnh trong Địa Điểm                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Staff đăng nhập → JWT token chứa { user_id, role: 'staff' } │
│                                                                 │
│ 2. Staff vào Địa Điểm "Bà Nà Hills"                            │
│    → API: GET /api/v1/locations/{tag_id}/photos                 │
│    → Backend nhận request                                       │
│                                                                 │
│ 3. Backend kiểm tra role:                                       │
│    ┌──────────────────────────────────────────────────┐          │
│    │ IF role === 'staff':                             │          │
│    │   → Filter: WHERE uploader_id = jwt.user_id     │          │
│    │   → Staff CHỈ thấy ảnh của mình                 │          │
│    │                                                  │          │
│    │ IF role === 'admin-system' OR 'admin-sales':     │          │
│    │   → KHÔNG filter uploader_id                     │          │
│    │   → Admin thấy TẤT CẢ ảnh                       │          │
│    │                                                  │          │
│    │ IF role === 'manager':                            │          │
│    │   → KHÔNG filter uploader_id                     │          │
│    │   → Manager thấy TẤT CẢ ảnh (read-only)         │          │
│    └──────────────────────────────────────────────────┘          │
│                                                                 │
│ 4. Response chỉ chứa ảnh phù hợp với quyền                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### SQL Query mẫu

```sql
-- Staff xem ảnh (chỉ ảnh của mình)
SELECT p.* 
FROM photos p
JOIN photo_tags pt ON pt.photo_id = p.id
WHERE pt.tag_id = :location_tag_id
  AND p.uploader_id = :current_staff_id  -- ← Filter quan trọng
ORDER BY p.created_at DESC;

-- Admin xem ảnh (tất cả ảnh)
SELECT p.*, s.name AS uploader_name, s.employee_code
FROM photos p
JOIN photo_tags pt ON pt.photo_id = p.id
LEFT JOIN staff s ON s.id = p.uploader_id
WHERE pt.tag_id = :location_tag_id
ORDER BY p.created_at DESC;
```

#### Backend Middleware

```javascript
// middleware/photoAccessControl.js
function filterPhotosByRole(req, res, next) {
    const { role, user_id } = req.user; // từ JWT
    
    if (role === 'staff') {
        // Staff chỉ thấy ảnh của mình
        req.photoFilter = { uploader_id: user_id };
    } else {
        // Admin/Manager thấy tất cả
        req.photoFilter = {};
    }
    
    next();
}
```

### Lưu ý bảo mật
- **API level**: Filter PHẢI thực hiện ở backend, KHÔNG tin tưởng frontend
- **S3 signed URL**: Khi staff request ảnh, backend verify `uploader_id` trước khi generate signed URL
- **Upload validation**: Khi staff upload, backend verify staff được phân công vào địa điểm đó (check `staff_location_assignments`)

---

## A4. DASHBOARD PHÂN QUYỀN CHO STAFF

### Mô tả
Khi đăng nhập bằng tài khoản Staff, Dashboard chỉ hiển thị các chức năng mà Staff được cấp quyền. Sidebar và nội dung thay đổi theo role.

### Sidebar theo Role

| Menu Item | Admin System | Admin Sales | Manager | Staff |
|-----------|:----------:|:----------:|:-------:|:-----:|
| Dashboard (Tổng quan) | ✅ | ✅ | ✅ | ✅ (giới hạn) |
| Địa Điểm | ✅ (full) | ✅ (full) | ✅ (read) | ✅ (chỉ địa điểm được gán) |
| Đơn hàng | ✅ | ✅ | ❌ | ❌ |
| Nhân viên | ✅ | ❌ | ❌ | ❌ |
| Bảng giá | ✅ | ✅ | ❌ | ❌ |
| Doanh thu | ✅ | ✅ | ✅ (read) | ❌ |
| Thống kê NV | ✅ | ✅ | ✅ (read) | ✅ (chỉ của mình) |
| Cài đặt | ✅ | ❌ | ❌ | ❌ |
| Hồ sơ cá nhân | ✅ | ✅ | ✅ | ✅ |

### Dashboard Home cho Staff

```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard (Staff View)                                          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐              │
│ │ Ảnh UP  │ │ Ảnh bán │ │ DT tháng │ │ Địa điểm │              │
│ │ 2,800   │ │ 1,200   │ │ 12M      │ │ 3        │              │
│ └─────────┘ └─────────┘ └──────────┘ └──────────┘              │
│                                                                 │
│ Địa điểm được phân công:                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│ │ Bà Nà    │ │ Hội An   │ │ Cầu Rồng │                         │
│ │ 80 ảnh   │ │ 55 ảnh   │ │ 30 ảnh   │                         │
│ └──────────┘ └──────────┘ └──────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Cập nhật `data-role` attribute

```html
<!-- Sidebar cho Staff -->
<a href="pages/locations.html" class="nav-item" data-role="admin-system,admin-sales,manager,staff">
  <i data-lucide="map-pin"></i> Địa Điểm
</a>
<a href="pages/staff-stats.html" class="nav-item" data-role="admin-system,admin-sales,manager,staff">
  <i data-lucide="bar-chart-2"></i> Thống kê NV
</a>
```

---

## A5. QUẢN LÝ NHÂN VIÊN — BỔ SUNG TRƯỜNG CHO STAFF

### Mô tả
Trong form tạo/sửa nhân viên, khi vai trò được chọn là **Staff**:
- Hiển thị thêm trường **Mã nhân viên** (`employee_code`) đóng vai trò `user_id`
- Hiển thị thêm trường **Chọn Địa điểm** được phép upload ảnh (multi-select)

### Cập nhật Database

```sql
-- Bổ sung cột employee_code vào bảng staff
ALTER TABLE staff ADD COLUMN employee_code VARCHAR(20) UNIQUE;
-- Format: NV + số tự tăng, VD: NV001, NV002, NV003

-- employee_code đóng vai trò user_id khi cần identify staff
-- Lưu ý: staff.id vẫn là PK chính, employee_code chỉ là mã hiển thị
```

### Form tạo/sửa nhân viên (Cập nhật)

```
┌─────────────────────────────────────────────────────────────────┐
│ Thêm nhân viên mới / Sửa nhân viên                      [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Họ và tên *              [_________________________]            │
│ Email *                  [_________________________]            │
│ Số điện thoại *          [_________________________]            │
│ Vai trò *                [Staff ▼                  ]            │
│ Mật khẩu *               [_________________________]            │
│                                                                 │
│ ─── Thông tin Staff (chỉ hiện khi chọn vai trò Staff) ──────── │
│                                                                 │
│ Mã nhân viên *           [NV003    ] (tự sinh, có thể sửa)     │
│                                                                 │
│ Địa điểm được upload:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Bà Nà Hills 20/02                                       │ │
│ │ ☑ Hội An 19/02                                             │ │
│ │ ☐ Cầu Rồng 18/02                                          │ │
│ │ ☐ Sơn Trà 17/02                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Phân quyền:                                                     │
│ • Admin Sales: Quản lý albums, đơn hàng, giá, xem DT          │
│ • Manager: Chỉ xem dashboard và doanh thu (read-only)          │
│ • Staff: Upload ảnh, xem thống kê cá nhân                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                               [Hủy]  [💾 Lưu]                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cột bảng nhân viên (Cập nhật)

| Cột | Cũ | Mới |
|-----|-----|-----|
| Nhân viên | ✅ | ✅ |
| Mã NV | ❌ | ✅ (hiện cho role=staff) |
| Vai trò | ✅ | ✅ |
| Địa điểm | ❌ | ✅ (hiện cho role=staff) |
| Số ảnh upload | ✅ | ✅ |
| Ngày tham gia | ✅ | ✅ |
| Trạng thái | ✅ | ✅ |
| Thao tác | ✅ | ✅ |

---

## A6. CÀI ĐẶT GIAO DIỆN — CHỌN MÃ MÀU TÙY CHỈNH

### Mô tả
Thay vì chỉ cho chọn 4 preset màu cố định, cho phép admin nhập **mã màu HEX tùy ý** cho Primary Color và Accent Color.

### UI Cập nhật

```
┌─────────────────────────────────────────────────────────────────┐
│ Màu sắc chủ đạo                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Preset nhanh:                                                   │
│ [🟢 Xanh lá] [🔵 Xanh dương] [🟣 Tím] [🔴 Đỏ]                │
│ [Teal] [Slate Dark] [Nâu]                                       │
│                                                                 │
│ ─── Hoặc chọn màu tùy chỉnh ──────────────────────────────── │
│                                                                 │
│ Màu chính (Primary):                                            │
│ [🎨 Color Picker] [#1a6b4e    ]  ← Input HEX + Color picker   │
│ Preview: [████████████████]                                     │
│                                                                 │
│ Màu nhấn (Accent):                                              │
│ [🎨 Color Picker] [#d4870e    ]  ← Input HEX + Color picker   │
│ Preview: [████████████████]                                     │
│                                                                 │
│ ─── Xem trước ─────────────────────────────────────────────── │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Nút Primary] [Nút Accent] [Badge] [Link]                 │ │
│ │ Text trên nền primary | Text trên nền accent               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ⓘ Màu sắc áp dụng cho cả Frontend và Dashboard                │
└─────────────────────────────────────────────────────────────────┘
```

### Logic xử lý

```javascript
// Khi user chọn color picker hoặc nhập HEX
function updateCustomColor(type, hexValue) {
    // Validate hex
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue)) return;
    
    // Cập nhật CSS variable real-time
    document.documentElement.style.setProperty(`--${type}`, hexValue);
    
    // Auto-generate light/dark variants
    const hsl = hexToHSL(hexValue);
    document.documentElement.style.setProperty(`--${type}-light`, 
        `hsl(${hsl.h}, 30%, 95%)`);
    document.documentElement.style.setProperty(`--${type}-dark`, 
        `hsl(${hsl.h}, ${hsl.s}%, 20%)`);
}
```

---

## B1. FACE SEARCH — BỘ LỌC NGÀY CHỤP

### Mô tả
Bổ sung mục **chọn ngày** vào trang Face Search để tối ưu phạm vi tìm kiếm. Trường ngày là **tùy chọn** (optional), không bắt buộc.

### UI Cập nhật

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Quét Khuôn Mặt                                              │
│ Tìm ảnh của bạn bằng AI nhận diện khuôn mặt                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Phạm Vi Tìm Kiếm:                                              │
│ ○ Tìm trong tất cả albums                                      │
│ ○ Chọn albums cụ thể                                           │
│                                                                 │
│ ─── Lọc theo ngày chụp (tùy chọn) ──────────────────────────── │
│                                                                 │
│ Từ ngày: [____/____/________]   Đến ngày: [____/____/________] │
│ Hoặc chọn nhanh: [Hôm nay] [3 ngày] [7 ngày] [30 ngày]       │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ 📷 Chụp hoặc tải ảnh khuôn mặt                                │
│ AI sẽ tìm tất cả ảnh có khuôn mặt của bạn                     │
│                                                                 │
│ [📹 Mở Camera]  [🖼 Chọn Ảnh]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### API tham số bổ sung

```
GET /api/v1/face-search
  Body: {
    face_embedding: [...],
    album_ids: [1, 2],        // Optional
    date_from: "2026-02-20",  // Optional - Ngày bắt đầu
    date_to: "2026-02-25",    // Optional - Ngày kết thúc  
    threshold: 0.6
  }
```

### SQL Query bổ sung

```sql
-- Face search có filter ngày
SELECT p.*, fe.distance
FROM photos p
JOIN face_embeddings fe ON fe.photo_id = p.id
WHERE fe.embedding <-> :query_embedding < :threshold
  AND (:date_from IS NULL OR p.shot_date >= :date_from)   -- Filter ngày
  AND (:date_to IS NULL OR p.shot_date <= :date_to)       -- Filter ngày
  AND (:album_ids IS NULL OR p.id IN (
    SELECT pt.photo_id FROM photo_tags pt WHERE pt.tag_id = ANY(:album_ids)
  ))
ORDER BY fe.distance ASC
LIMIT 100;
```

### Lưu ý UX
- Trường ngày **KHÔNG bắt buộc** - nếu không chọn → tìm toàn bộ
- Hiển thị text gợi ý: "Chọn ngày để thu hẹp kết quả tìm kiếm (không bắt buộc)"
- Quick date buttons giúp chọn nhanh mà không cần nhập tay
- Mobile: Các nút quick date xếp thành 2 hàng cho dễ bấm

---

## C1. ALBUM ĐƠN HÀNG — LƯU TRỮ ẢNH ĐÃ MUA

### Mô tả
Khi khách hàng chọn mua ảnh và thanh toán thành công, **ảnh đã mua sẽ được DI CHUYỂN (move) sang một album riêng** có tên là **mã đơn hàng** (VD: `ORD-20260304-001`). Ảnh đã di chuyển **không còn tồn tại trong Địa Điểm gốc**, không thể mua lần thứ 2. Album đơn hàng lưu trữ **vĩnh viễn** để admin tra cứu bất kỳ lúc nào. Link tải ảnh cho khách thì có **giới hạn thời gian** (TTL).

### Nguyên tắc hoạt động

| Khái niệm | Mô tả |
|------------|-------|
| **Album đơn hàng** | Tự động tạo khi đơn hàng thanh toán thành công. Tên = mã đơn hàng. Lưu trữ **vĩnh viễn**. |
| **Di chuyển ảnh** | Ảnh được **move** (không phải copy) khỏi Địa Điểm gốc → album đơn hàng. Ảnh **biến mất** khỏi Địa Điểm, khách khác không thấy và không thể mua lại. |
| **Link tải ảnh** | Signed URL gửi cho khách. Có **giới hạn thời gian** (TTL, ví dụ 7 ngày) và **giới hạn số lần tải**. |
| **Không mua lần 2** | Ảnh đã mua không còn trong Địa Điểm → không hiển thị cho khách khác → đảm bảo tính độc quyền. |

### Luồng chi tiết

```
┌─────────────────────────────────────────────────────────────────┐
│ LUỒNG: Thanh toán thành công → Di chuyển ảnh vào album ĐH      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Khách chọn ảnh → Thêm giỏ hàng → Thanh toán                │
│                                                                 │
│ 2. Payment gateway callback → status = "completed"              │
│                                                                 │
│ 3. Backend xử lý post-payment:                                  │
│    ┌──────────────────────────────────────────────────┐          │
│    │ a) Tạo album (tag) mới:                         │          │
│    │    name = mã đơn hàng (VD: ORD-20260304-001)    │          │
│    │    type = 'order'                                │          │
│    │    is_permanent = TRUE                           │          │
│    │                                                  │          │
│    │ b) DI CHUYỂN ảnh đã mua vào album đơn hàng:     │          │
│    │    - Move file ảnh sang thư mục /orders/{orderId}│          │
│    │    - Xóa photo_tags liên kết ảnh ↔ Địa Điểm cũ  │          │
│    │    - Tạo photo_tags liên kết ảnh → album ĐH     │          │
│    │    - Đánh dấu photo.status = 'sold'              │          │
│    │    → Ảnh BIẾN MẤT khỏi Địa Điểm gốc             │          │
│    │    → Không ai có thể mua lại ảnh này              │          │
│    │                                                  │          │
│    │ c) Generate signed URL (có TTL):                 │          │
│    │    - Thời hạn theo cài đặt (VD: 168 giờ)        │          │
│    │    - Giới hạn số lần tải (VD: 5 lần)            │          │
│    │    - Gửi email/SMS cho khách kèm link            │          │
│    └──────────────────────────────────────────────────┘          │
│                                                                 │
│ 4. Khách nhận link → Tải ảnh trong thời hạn                     │
│    → Hết hạn link → Khách không tải được nữa                    │
│    → Nhưng album đơn hàng VẪN CÒN trên hệ thống                │
│                                                                 │
│ 5. Admin vào Dashboard → Đơn hàng → Chi tiết đơn               │
│    → Xem ảnh đã mua (lấy từ album mã đơn hàng)                 │
│    → Album này tồn tại vĩnh viễn                                │
│                                                                 │
│ 6. Ảnh đã mua KHÔNG còn hiển thị trong Địa Điểm gốc            │
│    → Khách khác vào Địa Điểm → Không thấy ảnh đó nữa           │
│    → Face Search cũng không trả về ảnh đã bán                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Thay đổi Database

```sql
-- Mở rộng bảng tags (album) để hỗ trợ album đơn hàng
ALTER TABLE tags ADD COLUMN type VARCHAR(20) DEFAULT 'location';
-- type = 'location' (Địa Điểm chụp) | 'order' (Album đơn hàng)

ALTER TABLE tags ADD COLUMN is_permanent BOOLEAN DEFAULT FALSE;
-- is_permanent = TRUE → Không bao giờ bị xóa bởi retention policy

ALTER TABLE tags ADD COLUMN order_id INTEGER REFERENCES orders(id);
-- Liên kết album đơn hàng với đơn hàng

-- Bổ sung trạng thái ảnh
ALTER TABLE photos ADD COLUMN status VARCHAR(20) DEFAULT 'available';
-- status = 'available' (đang bán) | 'sold' (đã bán - đã di chuyển sang album ĐH)

CREATE INDEX idx_photos_status ON photos(status);

-- Bảng order_photos: Lưu thông tin ảnh trong album đơn hàng
CREATE TABLE order_photos (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    photo_id INTEGER NOT NULL REFERENCES photos(id),
    -- photo_id giữ liên kết trực tiếp vì ảnh được DI CHUYỂN (không xóa)
    file_path VARCHAR(500) NOT NULL,    -- Đường dẫn file trong /orders/{orderId}/
    price DECIMAL(10,2),                -- Giá tại thời điểm mua
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_photos_order ON order_photos(order_id);
```

### Logic di chuyển ảnh (Backend)

```javascript
// services/orderService.js
async function processPaymentSuccess(orderId) {
    const order = await getOrder(orderId);
    const orderItems = await getOrderItems(orderId);
    
    // a) Tạo album đơn hàng
    const orderAlbum = await db.tags.create({
        name: order.order_code,  // VD: ORD-20260304-001
        type: 'order',
        is_permanent: true,
        order_id: orderId
    });
    
    // b) Di chuyển từng ảnh
    for (const item of orderItems) {
        const photo = await db.photos.findById(item.photo_id);
        
        // Move file từ /locations/ → /orders/{orderId}/
        const newPath = await moveFile(photo.file_path, `orders/${orderId}/`);
        
        // Xóa liên kết ảnh ↔ Địa Điểm cũ
        await db.photo_tags.delete({ 
            photo_id: photo.id, 
            tag_type: 'location'  // Chỉ xóa tag Địa Điểm
        });
        
        // Tạo liên kết ảnh → Album đơn hàng
        await db.photo_tags.create({
            photo_id: photo.id,
            tag_id: orderAlbum.id
        });
        
        // Cập nhật trạng thái + đường dẫn mới
        await db.photos.update(photo.id, {
            status: 'sold',
            file_path: newPath
        });
        
        // Lưu vào order_photos
        await db.order_photos.create({
            order_id: orderId,
            photo_id: photo.id,
            file_path: newPath,
            price: item.price
        });
    }
    
    // c) Generate signed URL
    const downloadLinks = await generateSignedURLs(orderId);
    await sendDownloadEmail(order.customer_phone, downloadLinks);
}
```

### Ảnh hưởng đến các query hiện tại

```sql
-- Query ảnh trong Địa Điểm: Tự động loại bỏ ảnh đã bán
-- (vì photo_tags liên kết với Địa Điểm đã bị XÓA)
SELECT p.* FROM photos p
JOIN photo_tags pt ON pt.photo_id = p.id
WHERE pt.tag_id = :location_tag_id
  AND p.status = 'available'   -- Double-check: chỉ lấy ảnh chưa bán
ORDER BY p.created_at DESC;

-- Face Search: Cũng loại bỏ ảnh đã bán
SELECT p.*, fe.distance FROM photos p
JOIN face_embeddings fe ON fe.photo_id = p.id
WHERE fe.embedding <-> :query_embedding < :threshold
  AND p.status = 'available'   -- Không trả về ảnh đã bán
ORDER BY fe.distance ASC;

-- Admin xem ảnh trong album đơn hàng
SELECT op.*, p.file_path, p.width, p.height
FROM order_photos op
JOIN photos p ON p.id = op.photo_id
WHERE op.order_id = :order_id;
```

### API Endpoints

```
-- Album đơn hàng
GET /api/v1/orders/:orderId/photos     → Lấy danh sách ảnh đã mua trong đơn hàng
                                         (lấy từ bảng order_photos)

-- Chi tiết đơn hàng (cập nhật response)
GET /api/v1/orders/:orderId            → Response bổ sung:
                                         {
                                           ...order_info,
                                           photos: [
                                             { id, file_path, thumbnail_url, ... }
                                           ],
                                           download_links: [
                                             { url, expires_at, downloads_remaining }
                                           ]
                                         }
```

### Luồng Frontend — Chi tiết đơn hàng

```
┌─────────────────────────────────────────────────────────────────┐
│ Chi tiết đơn hàng: ORD-20260304-001                      [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Trạng thái: [Đã thanh toán ✅]    Ngày: 04/03/2026             │
│ Khách hàng: 0901234567                                         │
│ Tổng tiền: 150,000₫                                            │
│                                                                 │
│ ─── Ảnh đã mua (3 ảnh) ─────────────────────────────────────── │
│                                                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│ │  [ảnh]  │ │  [ảnh]  │ │  [ảnh]  │   ← Lấy từ album         │
│ │  #001   │ │  #002   │ │  #003   │      ORD-20260304-001     │
│ └─────────┘ └─────────┘ └─────────┘                           │
│                                                                 │
│ ─── Link tải ảnh ────────────────────────────────────────────── │
│                                                                 │
│ Link: https://dl.photopro.vn/d/abc123xyz                       │
│ Hết hạn: 11/03/2026 14:30                                      │
│ Đã tải: 2/5 lần                                                │
│ Trạng thái: [Còn hiệu lực 🟢]                                 │
│                                                                 │
│ [📋 Copy link]  [🔄 Tạo link mới]  [📧 Gửi lại email]        │
│                                                                 │
│ ⓘ Album đơn hàng được lưu trữ vĩnh viễn.                      │
│   Ảnh đã mua được di chuyển hẳn sang album này,                │
│   không còn tồn tại trong Địa Điểm gốc.                       │
│   Link tải có giới hạn thời gian và số lần tải.                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                          [In hóa đơn]  [Đóng] │
└─────────────────────────────────────────────────────────────────┘
```

### So sánh: Album đơn hàng vs Link tải

| Thuộc tính | Album đơn hàng | Link tải ảnh |
|------------|:--------------:|:------------:|
| Thời hạn | **Vĩnh viễn** | Có giới hạn (TTL) |
| Ai truy cập | Admin (Dashboard) | Khách hàng |
| Mục đích | Tra cứu, quản lý | Tải ảnh về |
| Xóa được không | Không (permanent) | Tự hết hạn |
| Ảnh trong Địa Điểm gốc | **Đã bị di chuyển đi**, không còn tồn tại | N/A |
| Mua lại lần 2 | **Không thể** — ảnh đã biến mất khỏi Địa Điểm | N/A |

---

## C2. BỎ CHẾ ĐỘ XÓA ẢNH — CHỈ GIỮ THỜI HẠN LƯU TRỮ

### Mô tả
Trong phần Cài đặt > Thời hạn > **Thời hạn lưu trữ ảnh (Photo Retention)**: Bỏ phần "Chế độ xóa" (checkbox bật/tắt tự động xóa + select chế độ xóa). Chỉ giữ lại input thời gian lưu trữ.

### Lý do
- Ảnh đã mua được **di chuyển** sang album đơn hàng (vĩnh viễn), không còn trong Địa Điểm.
- Ảnh chưa bán hết hạn → tự động xóa là hành vi mặc định, không cần toggle.
- Đơn giản hóa UI, tránh nhầm lẫn.

### UI Cũ → Mới

**Cũ:**
```
Thời hạn lưu trữ ảnh (Photo Retention)
├── Thời gian lưu trữ ảnh (ngày): [30]
├── ☑ Bật tự động xóa ảnh hết hạn    ← BỎ
└── Chế độ xóa: [Chỉ xóa ảnh chưa bán ▼]  ← BỎ
```

**Mới:**
```
Thời hạn lưu trữ ảnh (Photo Retention)
├── Thời gian lưu trữ ảnh (ngày): [30]
└── ⓘ Ảnh chưa bán sẽ tự động bị xóa sau thời hạn.
      Ảnh đã mua được lưu vĩnh viễn trong album đơn hàng.
```

---

## TÓM TẮT CÁC FILE CẦN THAY ĐỔI

### Dashboard
| File | Thay đổi |
|------|----------|
| `demo/Dashboard/index.html` | Cập nhật sidebar (đổi Albums→Địa Điểm, thêm Thống kê NV) |
| `demo/Dashboard/pages/albums.html` | Đổi thành `locations.html`, đổi tên, bổ sung modal đầy đủ, thêm trường staff |
| `demo/Dashboard/pages/staff.html` | Thêm cột Mã NV, Địa điểm. Form thêm trường khi role=Staff |
| `demo/Dashboard/pages/staff-stats.html` | **MỚI** - Trang thống kê nhân viên |
| `demo/Dashboard/pages/settings.html` | Tab Giao diện: thêm color picker + input HEX |
| `demo/Dashboard/pages/revenue.html` | Cập nhật sidebar |
| `demo/Dashboard/pages/orders.html` | Cập nhật sidebar |
| `demo/Dashboard/pages/pricing.html` | Cập nhật sidebar |
| `demo/Dashboard/js/dashboardManager.js` | Thêm role 'staff', API calls mới, logic phân quyền |

### Frontend
| File | Thay đổi |
|------|----------|
| `demo/FE/pages/faceSearch.html` | Thêm date picker, quick date buttons |
| `demo/FE/js/pages/faceSearch.js` | Logic xử lý date filter |

### Luồng đơn hàng & lưu trữ
| File | Thay đổi |
|------|----------|
| `demo/Dashboard/pages/orders.html` | Chi tiết đơn hàng: hiển thị ảnh đã mua từ album mã ĐH, link tải + trạng thái |
| `demo/Dashboard/pages/settings.html` | Photo Retention: bỏ checkbox tự động xóa + select chế độ xóa, thêm note album đơn hàng |
| Backend | Logic tạo album đơn hàng khi thanh toán thành công, di chuyển ảnh, generate signed URL |

---

## CHANGELOG

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 04/03/2026 | v2.0 | Tạo spec v2 - 7 thay đổi chính (A1-A6, B1) |
| 04/03/2026 | v2.1 | Bổ sung C1 (Album đơn hàng - DI CHUYỂN ảnh), C2 (Bỏ chế độ xóa) |
