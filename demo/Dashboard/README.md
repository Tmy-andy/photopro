# PhotoPro Dashboard Demo

Demo trang quản trị cho hệ thống PhotoPro - Bán ảnh du lịch tự động.

## Cấu trúc thư mục

```
Dashboard/
├── css/
│   ├── global.css         # Styles toàn cục, variables, layout
│   └── components.css     # Components (cards, buttons, forms, modals...)
├── js/
│   └── dashboardManager.js # Logic chính: auth, API calls, role-based access
├── pages/
│   ├── albums.html        # Quản lý Albums
│   ├── orders.html        # Quản lý Đơn hàng
│   ├── staff.html         # Quản lý Nhân viên (Admin System only)
│   ├── pricing.html       # Quản lý Bảng giá (Admin System + Admin Sales)
│   ├── revenue.html       # Báo cáo Doanh thu (All roles)
│   └── settings.html      # Cài đặt hệ thống (Admin System only)
├── assets/                # Images, icons, fonts
└── index.html            # Dashboard overview

```

## Tính năng

### 1. Dashboard Overview (index.html)
- **Stats Cards:** Tổng ảnh, Đơn hàng, Doanh thu, Khách hàng
- **Charts:** Biểu đồ doanh thu 7 ngày, Phân bố gói bán chạy
- **Recent Orders:** Danh sách đơn hàng gần nhất
- **Top Albums:** Albums bán chạy nhất
- **System Alerts:** Cảnh báo tự động xóa ảnh (Admin System only)

### 2. Quản lý Albums (albums.html)
- Grid view albums với thumbnail gradient
- Filters: Tìm kiếm, lọc theo trạng thái, sắp xếp
- Stats: Số ảnh, số đơn, doanh thu mỗi album
- Actions: Xem, Sửa (Admin System + Admin Sales), Xóa (Admin System only)
- Modal tạo album mới

### 3. Quản lý Đơn hàng (orders.html)
- Table view với phân trang
- Chi tiết đơn hàng: Mã, Khách hàng, Số ảnh, Giá, Trạng thái, Ngày mua
- Actions: Xem chi tiết, Hoàn tiền (Admin System + Admin Sales)
- Filters: Theo trạng thái, ngày, số tiền

### 4. Quản lý Nhân viên (staff.html)
- **Admin System only**
- Table danh sách nhân viên
- Thông tin: Tên, Email, Vai trò, Số ảnh upload, Trạng thái
- Actions: Thêm, Sửa, Xóa, Khóa/Mở khóa tài khoản
- Modal tạo nhân viên mới với phân quyền

### 5. Quản lý Bảng giá (pricing.html)
- **Admin System + Admin Sales**
- Bundle pricing cards: Gói 1/3/8 ảnh
- Giá, % tiết kiệm, số đơn đã bán
- Actions: Tạo gói mới, Sửa, Xóa
- Quản lý mã giảm giá (Coupon codes)

### 6. Báo cáo Doanh thu (revenue.html)
- **All roles** (Read-only cho Manager)
- Tabs: Ngày / Tuần / Tháng / Quý / Năm
- Biểu đồ xu hướng doanh thu
- Thống kê theo album, theo nhân viên, theo gói giá
- Xuất báo cáo Excel/CSV

### 7. Cài đặt (settings.html)
- **Admin System only**
- **Thời hạn lưu trữ:** Cấu hình retention time (7-365 ngày)
- **Thời hạn link:** TTL link download (24-720 giờ)
- **Auto-delete:** Bật/tắt, chế độ xóa
- **Domain/Subdomain:** Quản lý custom domain
- **Payment Gateway:** Cấu hình VNPay, MoMo, Bank transfer
- **Appearance:** Màu sắc chủ đạo (CSS variables)

## Hệ thống phân quyền

### Admin System (Quản trị tối cao)
✅ Tất cả chức năng
✅ Xóa album/folder
✅ Cấu hình hệ thống (retention, TTL, domain, payment)
✅ Quản lý nhân viên
✅ Quản lý giá
✅ Xem doanh thu

### Admin Sales (Quản lý kinh doanh)
✅ Quản lý albums (xem, sửa, xuất bản)
✅ Quản lý đơn hàng (xem, hoàn tiền)
✅ Quản lý giá (bundle, coupon)
✅ Xem doanh thu chi tiết
❌ Không xóa album
❌ Không cấu hình hệ thống
❌ Không quản lý nhân viên

### Manager (Quản lý - Read-only)
✅ Xem dashboard
✅ Xem doanh thu (chỉ đọc)
✅ Xem thống kê
❌ Không sửa/xóa
❌ Không quản lý giá

## Công nghệ sử dụng

- **HTML5 + CSS3:** Layout responsive, CSS Variables
- **Vanilla JavaScript:** Không dùng framework
- **Lucide Icons:** Icon set thống nhất
- **Chart.js:** Biểu đồ doanh thu
- **CSS Grid & Flexbox:** Layout hiện đại

## Role-based Access Control

Dashboard sử dụng `data-role` attribute để ẩn/hiện elements theo vai trò:

```html
<!-- Chỉ Admin System thấy -->
<button data-role="admin-system">Xóa Album</button>

<!-- Admin System + Admin Sales thấy -->
<button data-role="admin-system,admin-sales">Sửa Album</button>

<!-- Tất cả vai trò thấy -->
<button>Xem Album</button>
```

Logic xử lý trong `dashboardManager.js`:

```javascript
const currentRole = dashboardManager.currentUser.role;
document.querySelectorAll('[data-role]').forEach(el => {
  const allowedRoles = el.dataset.role.split(',');
  if (!allowedRoles.includes(currentRole)) {
    el.style.display = 'none';
  }
});
```

## API Integration

`dashboardManager.js` cung cấp các phương thức API:

```javascript
// Albums
await dashboardManager.getAlbums({ status: 'published' });
await dashboardManager.createAlbum(data);
await dashboardManager.updateAlbum(id, data);
await dashboardManager.deleteAlbum(id);

// Orders
await dashboardManager.getOrders({ page: 1, limit: 20 });
await dashboardManager.getOrderDetails(id);
await dashboardManager.refundOrder(id, reason);

// Staff
await dashboardManager.getStaff();
await dashboardManager.createStaff(data);

// Pricing
await dashboardManager.getPricingBundles();
await dashboardManager.createBundle(data);

// Revenue
await dashboardManager.getRevenue('month');
await dashboardManager.getDashboardStats();

// Settings
await dashboardManager.getSettings();
await dashboardManager.updateSettings(data);
```

## Utilities

```javascript
// Format currency
dashboardManager.formatCurrency(50000); // "50.000 ₫"

// Format date
dashboardManager.formatDate('2026-02-27'); // "27/02/2026"

// Show notification
dashboardManager.showNotification('Thành công!', 'success');

// Loading overlay
dashboardManager.showLoading();
dashboardManager.hideLoading();
```

## Responsive Design

- **Desktop (> 1200px):** Full sidebar + stats grid 4 cột
- **Tablet (768px - 1200px):** Full sidebar + stats grid 2 cột
- **Mobile (< 768px):** Sidebar ẩn (toggle menu) + stats grid 1 cột

## Color Scheme

CSS Variables trong `global.css`:

```css
:root {
  --primary: #1a6b4e;       /* Màu chính (xanh lá) */
  --primary-light: #e8f5f0; /* Nền nhạt */
  --primary-dark: #134a36;  /* Hover states */
  --surface: #ffffff;       /* Background cards */
  --surface-alt: #f6f7f9;   /* Background body */
  --text: #1a1d23;          /* Text chính */
  --text-secondary: #5a6170; /* Text phụ */
  --text-muted: #8b91a0;    /* Text mờ */
  --border: #e2e5ea;        /* Viền */
  --danger: #d63b3b;        /* Lỗi/xóa */
  --success: #1a854a;       /* Thành công */
  --warning: #d4870e;       /* Cảnh báo */
  --info: #2563eb;          /* Thông tin */
}
```

## Liên kết với Frontend

- Dashboard URL: `admin.photopro.vn`
- Frontend URL: `studio-abc.photopro.vn` hoặc custom domain
- Link trong navigation: `<a href="../FE/index.html">Xem Frontend</a>`

## Tính năng sắp tới

- [ ] Real-time notifications (Socket.io)
- [ ] Bulk operations (xóa/sửa nhiều albums cùng lúc)
- [ ] Advanced filters & search
- [ ] Export reports (Excel, CSV, PDF)
- [ ] Dark mode toggle
- [ ] Multi-language support

---

**Lưu ý:** Đây là demo frontend tĩnh. Khi tích hợp backend, thay thế mock data bằng API calls thực tế trong `dashboardManager.js`.
