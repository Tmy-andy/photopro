# PHOTOPRO — CHANGELOG

> Lịch sử thay đổi các tài liệu đặc tả và demo Dashboard.  
> Sắp xếp theo thứ tự mới nhất trước.

---

## [2026-03-04] — v2.3

### 🔄 Thay đổi lớn

#### 1. Redesign trang Login — Split-screen layout
- **Trước:** Card đơn giản, centered, gradient tím nền.
- **Sau:** Layout split-screen 2 panel:
  - **Panel trái (60%):** Branding — logo, tagline, 3 feature highlights (Upload, Thống kê, Đa địa điểm), animated floating shapes, footer.
  - **Panel phải (520px):** Form đăng nhập — email + password với icon, checkbox ghi nhớ, link quên mật khẩu, nút đăng nhập với loading spinner.
- **Demo accounts:** 4 nút bấm nhanh dạng grid 2×2 (Admin System, Admin Sales, Manager, Nhân viên), mỗi nút có icon + màu riêng biệt.
- **Responsive:** Ẩn panel trái trên tablet (≤1024px), hiện mobile logo thay thế.
- **Logic giữ nguyên:** 4 demo accounts, staff redirect → `staff-upload.html`, auto-redirect nếu `rememberMe`, localStorage key `photopro_user`.

#### 2. Redesign trang Staff Upload (`staff-upload.html`)
- Quick stats banner (tổng ảnh, hôm nay, bán được)
- Location cards với color accent top + selected state
- Gradient selected-location banner
- Centered upload drop zone với flex
- Photo view toggle (grid/list)

#### 3. Redesign trang Staff Statistics (`staff-stats.html`)
- Dual-mode: Admin table view vs Staff personal view
- Role detection từ localStorage
- Admin sidebar + Staff sidebar (toggle via JS)
- Fixed `#adminHeaderActions` flex layout

#### 4. Sidebar visibility — `data-role="admin-system"`
- Thêm `data-role="admin-system"` vào div `.nav-section` bao bọc mục **"Hệ thống"** trên **tất cả 9 trang admin** (index, locations, orders, staff, settings, pricing, revenue, staff-stats, profile).
- `DashboardManager.js` ẩn toàn bộ section cho roles: `admin-sales`, `manager`, `staff`.
- Các mục bị ẩn: Cài đặt, Tên miền/Branding.

#### 5. Unified Staff Sidebar
- Staff sidebar chuẩn trên `staff-upload.html`, `staff-stats.html`, `profile.html`:
  - Logo: "PhotoPro Staff"
  - **Công việc:** Upload Ảnh, Thống kê của tôi
  - **Tài khoản:** Hồ sơ, Đăng xuất
- `profile.html`: JS swap sidebar khi role = staff

#### 6. Profile page fixes
- Fix: DashboardManager localStorage key → `photopro_user`
- Fix: Header sync hiển thị tên + role
- Fix: Staff demo account hiện đúng dữ liệu
- Fix: Layout structure dùng đúng `.dashboard-container` pattern
- Remove: Profile banner (không cần)
- Fix: Avatar alignment

### 📁 Files thay đổi

| File | Thay đổi |
|------|----------|
| `demo/Dashboard/login.html` | Tạo mới hoàn toàn — split-screen design |
| `demo/Dashboard/staff-upload.html` | Redesign toàn bộ UI |
| `demo/Dashboard/staff-stats.html` | Redesign dual-mode |
| `demo/Dashboard/profile.html` | Fix layout + staff sidebar swap |
| `demo/Dashboard/index.html` | `data-role` + staff redirect |
| `demo/Dashboard/pages/locations.html` | `data-role="admin-system"` |
| `demo/Dashboard/pages/orders.html` | `data-role="admin-system"` |
| `demo/Dashboard/pages/staff.html` | `data-role="admin-system"` |
| `demo/Dashboard/pages/settings.html` | `data-role="admin-system"` |
| `demo/Dashboard/pages/pricing.html` | `data-role="admin-system"` |
| `demo/Dashboard/pages/revenue.html` | `data-role="admin-system"` |
| `demo/Dashboard/pages/albums.html` | `data-role="admin-system"` |

### 📄 Spec files cập nhật

| File | Phiên bản | Thay đổi |
|------|-----------|----------|
| `photopro-frontend-spec.md` | 2.2 → 2.3 | Section 13 (Login): cập nhật wireframe split-screen + demo accounts |
| `photopro-layout-spec.md` | 2.0 → 2.1 | Thêm section Login page layout, cập nhật Staff sidebar description |

---

## [2026-03-04] — v2.2

### 🔄 Thay đổi

#### Đồng bộ spec files theo spec-v2
- `photopro-frontend-spec.md`: Cập nhật từ v2.1 → v2.2
  - Album → Địa Điểm (toàn bộ)
  - Thêm Section 22 (Thống kê Nhân Viên)
  - Bổ sung album đơn hàng (type='order')
  - Face search: thêm bộ lọc ngày chụp
  - Cài đặt: thêm color picker (7 preset + HEX)
  - Bổ sung trường Staff: `employee_code`, `assigned_locations`
  - Cập nhật bảng phân quyền
- `photopro-layout-spec.md`: Cập nhật từ v1.0 → v2.0
  - Đồng bộ tất cả thay đổi A1-A6, B1, C1, C2

---

## [2026-03-04] — v2.0

### 🆕 Tạo mới

#### photopro-spec-v2.md
- Tài liệu đặc tả chi tiết các thay đổi v2:
  - **A1:** Thống kê nhân viên (Staff Statistics)
  - **A2:** Đổi tên Album → Địa Điểm + Phân quyền Staff
  - **A3:** Phân tách ảnh theo Staff trong Album
  - **A4:** Dashboard phân quyền cho Staff
  - **A5:** Quản lý nhân viên - Bổ sung trường cho Staff
  - **A6:** Cài đặt giao diện - Chọn mã màu tùy chỉnh
  - **B1:** Face Search - Bộ lọc ngày chụp
  - **C1:** Album đơn hàng - Lưu trữ ảnh đã mua
  - **C2:** Bỏ chế độ xóa ảnh - Chỉ giữ thời hạn lưu trữ

---

> *— Hết Changelog —*
