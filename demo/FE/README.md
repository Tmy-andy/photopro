# PhotoPro — Demo Frontend

## 📁 Cấu Trúc Thư Mục

```
FE/
├── index.html                 # Trang chính, entry point
├── data/
│   └── mockData.json         # Dữ liệu giả lập (albums, photos, pricing, orders, staff, statistics)
├── css/
│   ├── global.css            # Styles toàn cục (reset, layout, utilities)
│   ├── navigation.css        # Styles cho navigation tabs
│   ├── components.css        # Styles cho components (buttons, forms, alerts, modals...)
│   └── photos.css            # Styles cho photo grid, albums, pricing
├── js/
│   ├── dataManager.js        # Quản lý dữ liệu từ mockData.json
│   ├── stateManager.js       # Quản lý state (selected photos, cart, filters...)
│   ├── uiManager.js          # Quản lý render UI
│   ├── navigationManager.js  # Quản lý điều hướng giữa các trang
│   └── appManager.js         # Quản lý các tính năng chính (face search, payment...)
└── pages/
    ├── landing.html          # Trang chủ
    ├── albums.html           # Danh sách albums
    ├── faceSearch.html       # Trang quét mặt
    ├── results.html          # Kết quả tìm kiếm
    ├── cart.html             # Giỏ hàng
    ├── checkout.html         # Thanh toán
    ├── success.html          # Thành công
    ├── delivery.html         # Tải ảnh
    ├── lookup.html           # Tra cứu đơn hàng
    └── *.js                  # Scripts cho từng trang (nếu cần)
```

## 🚀 Cách Sử Dụng

### 1. Mở trực tiếp file index.html

```bash
# Mở bằng trình duyệt
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### 2. Hoặc chạy local server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Sau đó truy cập: `http://localhost:8000`

## ✨ Tính Năng

### Đã Hoàn Thành
- ✅ 9 trang hoàn chỉnh với navigation
- ✅ Responsive design (mobile-first)
- ✅ State management (giỏ hàng, selected photos)
- ✅ Auto-pack pricing (tự động đề xuất gói tối ưu)
- ✅ Face search simulation (mô phỏng AI tìm ảnh)
- ✅ Payment flow hoàn chỉnh
- ✅ Countdown timer
- ✅ Order lookup
- ✅ LocalStorage persistence
- ✅ Loading states & animations

### Dữ Liệu Mock (mockData.json)
- **Business**: Thông tin doanh nghiệp
- **Albums**: 6 albums với thông tin chi tiết
- **Photos**: 18 ảnh với similarity scores, tags, warnings
- **Pricing**: 3 gói giá với tính năng auto-pack
- **Orders**: Đơn hàng mẫu
- **Staff**: 2 nhân viên mẫu
- **Statistics**: Thống kê doanh thu, orders theo ngày
- **Settings**: Cấu hình hệ thống
- **Tags**: Các tag phân loại ảnh

## 📱 Tối Ưu Mobile

- **Touch-friendly**: Tất cả buttons có kích thước tối thiểu 44x44px
- **No zoom on input**: Font size input >= 16px trên mobile
- **Responsive grid**: Auto-adjust columns dựa trên màn hình
- **Swipeable tabs**: Tabs có thể scroll ngang trên mobile
- **Sticky cart**: Cart summary sticky ở bottom trên mobile
- **Fast tap**: Loại bỏ 300ms delay với `-webkit-tap-highlight-color`

## 🎨 Theme Customization

Chỉnh sửa màu sắc trong `css/global.css`:

```css
:root {
  --primary: #1a6b4e;        /* Màu chính */
  --accent: #d4870e;         /* Màu nhấn */
  --surface: #ffffff;        /* Nền trắng */
  --text: #1a1d23;           /* Màu chữ */
  /* ... */
}
```

## 🔧 Kiến Trúc Code

### DataManager
- Load data từ `mockData.json`
- Provide methods để get albums, photos, pricing...
- Centralized data access

### StateManager
- Quản lý state của app
- Observable pattern (subscribe/notify)
- LocalStorage persistence
- Selected photos, filters, customer info...

### UIManager
- Render UI components
- Update DOM
- Format data (price, date...)
- Handle loading, modals...

### NavigationManager
- Route giữa các pages
- Update tabs active state
- Handle page lifecycle

### AppManager
- Business logic
- **Face search simulation (tự động chuyển trang)**
  - Camera mở → Phát hiện mặt (1.5s) → Nhận diện (2s) → **Auto capture & navigate** (1s)
  - **KHÔNG có nút chụp** - Tự động chụp khi nhận diện thành công
  - Total flow: ~6.8s từ mở camera đến trang kết quả
- Payment processing
- Countdown timer
- Order lookup

## 📊 Sử Dụng Data Cho Dashboard

File `mockData.json` chứa đầy đủ dữ liệu có thể sử dụng cho Dashboard:

```javascript
// Load data
const response = await fetch('./data/mockData.json');
const data = await response.json();

// Dashboard có thể dùng:
data.statistics.totalRevenue    // Tổng doanh thu
data.statistics.totalOrders     // Tổng đơn hàng
data.statistics.dailyStats      // Thống kê theo ngày
data.orders                     // Danh sách đơn hàng
data.staff                      // Danh sách nhân viên
data.albums                     // Danh sách albums
```

## 🔗 API Integration

Khi integrate với backend thật, chỉ cần thay đổi `dataManager.js`:

```javascript
// Thay vì load từ mockData.json
async loadData() {
  const response = await fetch('https://api.photopro.vn/data');
  this.data = await response.json();
}

// Hoặc tách ra các API calls riêng
async getAlbums() {
  const response = await fetch('https://api.photopro.vn/albums');
  return await response.json();
}
```

## 🧪 Demo Data - Tra Cứu Đơn Hàng

Bạn có thể sử dụng các mã sau để tra cứu thử trên trang **Tra Cứu Đơn Hàng**:

| Mã đơn hàng | Số điện thoại | Số ảnh | Tổng tiền | Phương thức | Thời gian tạo |
|-------------|---------------|--------|-----------|-------------|---------------|
| **WL8234**  | 0912345678    | 6      | 100.000₫  | MoMo        | 2h trước      |
| **WL7156**  | 0987654321    | 3      | 50.000₫   | Banking     | 5h trước      |
| **WL9421**  | 0901234567    | 8      | 100.000₫  | Cash        | 1 ngày trước  |
| **WL3789**  | 0923456789    | 3      | 50.000₫   | MoMo        | 12h trước     |
| **WL5612**  | 0934567890    | 1      | 20.000₫   | Banking     | 30 phút trước |

### Cách tra cứu:
1. Vào trang **Tra Cứu Đơn Hàng**
2. Chọn tìm theo **Mã đơn hàng** hoặc **Số điện thoại**
3. Nhập một trong các giá trị ở bảng trên (VD: `WL8234` hoặc `0912345678`)
4. Click **Tìm Kiếm**
5. Xem thông tin đơn hàng, link tải ảnh, countdown thời gian còn lại

💡 **Tip**: Click vào đơn hàng trong danh sách "Đơn Hàng Gần Đây" để tra cứu nhanh!

## 🎯 Next Steps

1. **Thêm Real Face Recognition**: Integrate TensorFlow.js hoặc Face-API.js
2. **Connect Backend API**: Replace mock data với real API
3. **Add Image Upload**: Thêm upload ảnh thật
4. **Payment Gateway**: Integrate VNPay, MoMo, Stripe
5. **SMS/Email Service**: Gửi link tải qua SMS/Email
6. **Analytics**: Google Analytics, Facebook Pixel
7. **PWA**: Thêm Service Worker cho offline support

## 📝 Notes

- Tất cả data đều có trong `mockData.json` để dễ reuse
- CSS được tách module cho dễ maintain
- JavaScript sử dụng class pattern, dễ extend
- Mobile-first approach
- No frameworks required (vanilla JS)
- Compatible với modern browsers

## 🐛 Troubleshooting

### CORS Error khi load JSON
Nếu gặp CORS error khi load `mockData.json`, cần chạy local server (xem mục "Cách Sử Dụng" ở trên).

### Images không hiện
Demo này sử dụng placeholders với emoji icons. Để dùng ảnh thật, thay thế phần placeholder trong `photos.css`.

### LocalStorage not working
Kiểm tra browser settings, đảm bảo LocalStorage được enable.

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 👨‍💻 Author

PhotoPro Demo - Created for demonstration purposes
