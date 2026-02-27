# PhotoPro - Hướng dẫn Sử dụng & Luồng Hoạt động

> **Tài liệu này dành cho:** Chủ doanh nghiệp, Quản lý, Nhân viên (Staff), và người muốn hiểu cách hệ thống hoạt động.

---

## 📌 PhotoPro là gì?

PhotoPro là hệ thống **bán ảnh tự động** dành cho các doanh nghiệp nhiếp ảnh tại điểm du lịch. 

**Ví dụ thực tế:**
- Khách du lịch đến Bà Nà Hills chụp ảnh
- Thợ ảnh upload ảnh lên hệ thống
- Khách quét mã QR → Chụp selfie → Hệ thống tự động tìm ảnh có mặt khách
- Khách chọn ảnh và thanh toán online
- Khách nhận link tải ảnh HD qua SMS/Email

**Lợi ích:**
- ✅ Khách tự tìm ảnh của mình, không cần nhờ nhân viên
- ✅ Thanh toán tự động, tiền về tài khoản doanh nghiệp ngay
- ✅ Quản lý ảnh theo album/ngày chụp dễ dàng
- ✅ Tự động xóa ảnh cũ để tiết kiệm dung lượng

---

## 👥 Ai sử dụng hệ thống?

### 1. Admin System (Quản trị viên cao nhất)
- Người có toàn quyền trên hệ thống
- Có thể xóa album, cấu hình hệ thống
- **Cấu hình thời hạn:** retention ảnh (7-365 ngày), TTL link (24-720 giờ)
- **Quản lý gói giá:** Tạo/sửa/xóa gói bundle pricing
- Quản lý tài khoản ngân hàng, domain
- Tạo tài khoản cho Admin Sales, Manager, Staff

### 2. Admin Sales (Quản lý kinh doanh)
- Quản lý gói giá (Bundle Pricing: Gói 1 ảnh, Gói 3 ảnh, Gói 8 ảnh...)
- Xem báo cáo doanh thu chi tiết
- Quản lý đơn hàng, hoàn tiền
- Tạo mã giảm giá
- **Không thể** xóa album/folder, cấu hình hệ thống

### 3. Manager (Quản lý - Chỉ xem)
- Xem thống kê tổng quan (doanh thu, số ảnh, số đơn)
- Xem báo cáo theo ngày/tuần/tháng
- **Không thể** sửa hay xóa bất kỳ thứ gì

### 4. Staff (Nhân viên/Thợ ảnh)
- Upload ảnh vào album đã được Admin tạo sẵn
- Gắn tag phân loại cho ảnh (couple, family, solo...)
- Xem danh sách đơn hàng
- **Không thể** tạo album mới, xóa ảnh, hay xem doanh thu

### 5. Khách hàng
- Tìm ảnh của mình bằng cách chụp selfie
- Chọn ảnh và thanh toán online
- Tải ảnh HD qua link

---

## 🔄 Luồng hoạt động chính

### LUỒNG A: Doanh nghiệp & Nhân viên

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  BƯỚC 1: Admin tạo Album                                           │
│  ─────────────────────────                                         │
│  Admin đăng nhập → Tạo album mới (VD: "Bà Nà Hills 20/02/2026")    │
│  → Album sẵn sàng để Staff upload ảnh                              │
│                                                                    │
│  LƯU Ý: Mã QR là QR của WEBSITE doanh nghiệp                       │
│     (VD: studio-abc.photopro.vn)                                   │
│     Không phải QR cho từng album riêng lẻ.                         │
│     Khách quét QR → vào trang chủ → chọn album muốn tìm.           │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 2: Staff upload ảnh                                          │
│  ─────────────────────────                                         │
│  Thợ ảnh chụp xong → Đăng nhập Staff Portal                        │
│  → Chọn album "Bà Nà Hills 20/02/2026"                             │
│  → Kéo thả ảnh để upload (có thể upload 20 ảnh cùng lúc)           │
│  → Hệ thống tự động xử lý: nén ảnh, đóng watermark, quét mặt       │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 3: Staff gắn tag (tùy chọn)                                  │
│  ─────────────────────────────────                                 │
│  Staff chọn ảnh → Gắn tag phân loại                                │
│  VD: #couple, #family, #solo, #portrait, #sunset                   │
│  → Giúp khách dễ lọc ảnh hơn                                       │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 4: Admin xuất bản album                                      │
│  ───────────────────────────────                                   │
│  Admin kiểm tra ảnh → Nhấn "Xuất bản"                              │
│  → Album hiển thị trên website cho khách xem                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### LUỒNG B: Khách hàng mua ảnh

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  BƯỚC 1: Khách vào trang web                                       │
│  ─────────────────────────────                                     │
│  Khách quét mã QR tại quầy (QR dẫn đến website doanh nghiệp)       │
│  HOẶC truy cập trực tiếp: studio-abc.photopro.vn                   │
│                                                                    │
│  → Trang chủ hiển thị giới thiệu dịch vụ                           │
│  → Hướng dẫn cách tìm ảnh                                          │
│  → Danh sách các album hiện có (để khách chọn)                     │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 2: Chọn album/ngày chụp                                      │
│  ─────────────────────────────                                     │
│  Khách chọn album muốn tìm ảnh:                                    │
│  ○ Tất cả album (tìm trong tất cả ảnh)                             │
│  ○ Chọn album cụ thể: "Bà Nà Hills 20/02"                          │
│  ○ Lọc theo tag: #couple, #family...                               │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 3: Chụp selfie để tìm ảnh                                    │
│  ──────────────────────────────                                    │
│  Khách chụp selfie (hoặc upload ảnh có mặt mình)                   │
│                                                                    │
│  💡 Mẹo để tìm được nhiều ảnh:                                     │
│     • Bỏ kính râm, mũ, khẩu trang                                  │
│     • Chụp thẳng mặt, ánh sáng đủ                                  │
│     • Không nghiêng đầu quá nhiều                                  │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 4: Xem kết quả                                               │
│  ─────────────────────────                                         │
│  Hệ thống hiển thị các ảnh có mặt khách                            │
│  → Sắp xếp theo độ giống (cao → thấp)                              │
│  → Nhóm theo album/ngày chụp                                       │
│  → Ảnh có watermark, chưa thể tải                                  │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 5: Chọn ảnh muốn mua                                         │
│  ───────────────────────────                                       │
│  Khách tick chọn ảnh muốn mua                                      │
│  → Xem giá: Gói 1 ảnh = 20k, Gói 3 ảnh = 50k, Gói 8 ảnh = 100k   │
│  → Hệ thống tự động tính gói tối ưu (Auto-pack)                   │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 6: Thanh toán                                                │
│  ─────────────────────                                             │
│  Khách nhập số điện thoại (BẮT BUỘC)                               │
│  ☐ Gửi link qua email (tùy chọn, nếu tick thì nhập email)          │
│                                                                    │
│  Chọn phương thức thanh toán:                                      │
│  • Chuyển khoản ngân hàng (QR code)                                │
│  • Ví MoMo                                                         │
│  • VNPay                                                           │
│                                                                    │
│                              ↓                                     │
│                                                                    │
│  BƯỚC 7: Nhận ảnh                                                  │
│  ─────────────────                                                 │
│  Thanh toán thành công → Màn hình hiển thị:                        │
│                                                                    │
│  ┌──────────────────────────────────────────────┐                  │
│  │  ✅ THANH TOÁN THÀNH CÔNG!                   │                  │
│  │                                              │                  │
│  │  Link tải ảnh của bạn:                       │                  │
│  │  ┌────────────────────────────────────────┐  │                  │
│  │  │ studio-abc.photopro.vn/d/ABC123XYZ     │  │                  │
│  │  │                         [📋 Sao chép]  │  │                  │
│  │  └────────────────────────────────────────┘  │                  │
│  │                                              │                  │
│  │  [QR CODE để quét bằng điện thoại khác]      │                  │
│  │                                              │                  │
│  │  ⚠️ Link có hiệu lực trong 7 ngày (Admin cấu hình)  │                  │
│  │  ⚠️ Hết hạn: 28/02/2026 14:30                │                  │
│  │                                              │                  │
│  │  📱 Link cũng được gửi qua SMS               │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                    │
│  → Khách mở link → Tải ảnh HD (không có watermark)                 │
│  → Có thể tải từng ảnh hoặc tải tất cả (ZIP)                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 💰 Cách tính giá (Bundle Pricing)

> **Quan trọng:** Giá theo GÓI (Bundle), Admin có thể tùy chỉnh số lượng và giá.
> Hệ thống tự động tính gói tối ưu (Auto-pack) khi khách chọn ảnh.

### Bảng giá mẫu (Admin tự cấu hình)

| Gói | Giá | Giá trung bình/ảnh |
|-----|-----|-------------------|
| Gói 1 ảnh | 20,000đ | 20,000đ |
| Gói 3 ảnh | 50,000đ | 16,667đ (tiết kiệm 17%) |
| Gói 8 ảnh | 100,000đ | 12,500đ (tiết kiệm 37%) |

### Auto-pack Logic (Hệ thống tự tính gói tối ưu)

| Khách chọn | Hệ thống đề xuất | Lý do |
|------------|------------------|-------|
| 1 ảnh | Gói 1 ảnh = 20k | Vừa đủ |
| 2 ảnh | Gói 3 ảnh = 50k | Dư 1 ảnh, rẻ hơn mua 2 lẻ (40k) chỉ 10k |
| 3 ảnh | Gói 3 ảnh = 50k | Vừa đủ |
| 4-8 ảnh | Gói 8 ảnh = 100k | Tiết kiệm hơn nhiều |
| 9 ảnh | Gói 8 + Gói 1 = 120k | Tối ưu |
| 10 ảnh | Gói 8 + Gói 3 = 150k | Dư 1 ảnh, khuyến khích chọn thêm |

### Ví dụ tính giá
- Khách chọn **5 ảnh**
- Hệ thống đề xuất: **Gói 8 ảnh = 100,000đ** (dư 3 slot)
- Gợi ý: "Bạn có thể chọn thêm 3 ảnh nữa miễn phí!"
- So với mua lẻ: 5 × 20k = 100k (bằng giá, nhưng gói 8 được thêm 3 ảnh)

---

## ⏰ Thời hạn quan trọng

### 1. Thời hạn lưu trữ ảnh (Admin cấu hình)
- Mặc định: **30 ngày** (Admin có thể chỉnh từ 7 đến 365 ngày)
- Sau thời gian này, ảnh **tự động bị xóa** để tiết kiệm dung lượng
- **Cảnh báo:** 7 ngày trước khi xóa, hệ thống hiển thị cảnh báo trong Admin Dashboard
- Admin có thể bật/tắt auto-delete và chọn "chỉ xóa ảnh chưa bán"

### 2. Thời hạn link tải ảnh (Admin cấu hình)
- Mặc định: **168 giờ (7 ngày)** (Admin có thể chỉnh từ 24 giờ đến 720 giờ = 30 ngày)
- Sau thời gian này, link **hết hạn** và không tải được nữa
- Khách sẽ thấy **đồng hồ đếm ngược** trên trang tải ảnh
- Hết hạn → Link mất + Ảnh đã mua bị xóa

### 3. Ví dụ timeline

```
Ngày 1 (20/02):  Thợ ảnh chụp, upload ảnh
                 ↓
Ngày 2 (21/02):  Khách mua ảnh, nhận link tải
                 → Link có hiệu lực 7 ngày (đến 28/02) — Admin cấu hình
                 ↓
Ngày 30 (22/03): Ảnh tự động bị xóa khỏi hệ thống (mặc định 30 ngày)
                 — Admin có thể chỉnh từ 7 đến 365 ngày
```

---

## 📊 Báo cáo & Thống kê (Dành cho Admin)

### Admin có thể xem:
- **Doanh thu:** Theo ngày / tuần / tháng / quý / năm
- **Theo album:** Album nào bán chạy nhất
- **Theo nhân viên:** Staff nào upload nhiều nhất
- **Top ảnh:** Ảnh nào được mua nhiều nhất
- **Xuất báo cáo:** Excel / CSV

### Dashboard hiển thị:
```
┌────────────────────────────────────────────────────────────────────┐
│  DASHBOARD - Tháng 02/2026                                         │
│                                                                    │
│  📸 Tổng ảnh upload:     12,500 ảnh                                │
│  🛒 Tổng đơn hàng:       850 đơn                                   │
│  💰 Doanh thu:           42,500,000đ                               │
│  📈 So với tháng trước:  +15%                                      │
│                                                                    │
│  GÓI BÁN CHẠY                         TOP STAFF                    │
│  1. Gói 8 ảnh - 420 đơn (49%)        1. Nguyễn Văn A - 3,200 ảnh   │
│  2. Gói 3 ảnh - 280 đơn (33%)        2. Trần Thị B - 2,800 ảnh     │
│  3. Gói 1 ảnh - 150 đơn (18%)        3. Lê Văn C - 2,500 ảnh       │
│                                                                    │
│  TOP ALBUM                                                         │
│  1. Bà Nà 20/02 - 120 đơn                                          │
│  2. Hội An 19/02 - 98 đơn                                          │
│  3. Cầu Rồng 18/02 - 75 đơn                                        │
│                                                                    │
│  ⚠️ CẢNH BÁO: 250 ảnh sẽ bị xóa trong 7 ngày tới                   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🏷️ Hệ thống Tag (Phân loại ảnh)

### Các loại tag:

| Loại | Mô tả | Ví dụ |
|------|-------|-------|
| **Album** | Nhóm ảnh theo buổi chụp/ngày | "Bà Nà Hills 20/02/2026" |
| **Category** | Phân loại theo thể loại | #couple, #family, #solo, #portrait |
| **Event** | Phân loại theo sự kiện | #wedding, #graduation, #birthday |
| **Custom** | Tag tùy chỉnh | #VIP, #sunset, #night |

### Quy tắc:
- **Album:** Mỗi ảnh thuộc về **1 album duy nhất** (nơi lưu file)
- **Các tag khác:** Mỗi ảnh có thể có **nhiều tag** để phân loại

### Ví dụ:
Một ảnh có thể có:
- Album: "Bà Nà Hills 20/02/2026"
- Tags: #couple, #sunset, #portrait

---

## 🔒 Phân quyền chi tiết

### Bảng so sánh quyền hạn:

| Chức năng | Admin System | Admin Sales | Manager | Staff |
|-----------|:------------:|:-----------:|:-------:|:-----:|
| **Xóa album/folder** | ✅ | ❌ | ❌ | ❌ |
| **Cấu hình hệ thống** | ✅ | ❌ | ❌ | ❌ |
| **Cấu hình thời hạn (retention, TTL)** | ✅ | ❌ | ❌ | ❌ |
| **Quản lý gói giá (Bundle Pricing)** | ✅ | ✅ | ❌ | ❌ |
| **Quản lý tài khoản nhân viên** | ✅ | ❌ | ❌ | ❌ |
| **Tạo album mới** | ✅ | ✅ | ❌ | ❌ |
| **Quản lý gói giá (Bundle)** | ✅ | ✅ | ❌ | ❌ |
| **Tạo mã giảm giá** | ✅ | ✅ | ❌ | ❌ |
| **Xem doanh thu chi tiết** | ✅ | ✅ | ❌ | ❌ |
| **Xuất báo cáo** | ✅ | ✅ | ❌ | ❌ |
| **Xem dashboard tổng quan** | ✅ | ✅ | ✅ | ❌ |
| **Xem danh sách đơn hàng** | ✅ Chi tiết | ✅ Chi tiết | ✅ Tóm tắt | ✅ Danh sách |
| **Upload ảnh** | ✅ | ✅ | ❌ | ✅ |
| **Gắn tag cho ảnh** | ✅ | ❌ | ❌ | ✅ |

---

## ❓ Câu hỏi thường gặp

### Q: Staff có thể tạo album mới không?
**A:** Không. Chỉ Admin System và Admin Sales mới có quyền tạo album. Staff chỉ upload ảnh vào album đã được tạo sẵn.

### Q: Ảnh có thể thuộc nhiều album không?
**A:** Không. Mỗi ảnh chỉ thuộc về **1 album duy nhất** (tương ứng với folder lưu trữ). Tuy nhiên, ảnh có thể có **nhiều tag** để phân loại (VD: #couple, #sunset).

### Q: Khách không cần đăng ký tài khoản?
**A:** Đúng. Khách chỉ cần nhập **số điện thoại** để nhận link tải ảnh qua SMS. Email là tùy chọn.

### Q: Tiền thanh toán về đâu?
**A:** Tiền được chuyển **trực tiếp vào tài khoản ngân hàng của doanh nghiệp**. Không qua trung gian.

### Q: Nếu khách mất link tải ảnh thì sao?
**A:** Link được gửi qua SMS (và email nếu khách chọn). Nếu link còn hiệu lực, khách có thể mở lại từ tin nhắn.

### Q: Ảnh có tự động xóa không?
**A:** Có. Sau thời gian lưu trữ (mặc định 30 ngày, Admin có thể chỉnh từ 7-365 ngày), ảnh **tự động bị xóa** để tiết kiệm dung lượng. Hệ thống sẽ cảnh báo Admin 7 ngày trước khi xóa.

### Q: Khách có thể tải lại ảnh sau khi link hết hạn không?
**A:** Không. Sau khi link hết hạn (mặc định 7 ngày = 168 giờ), khách không thể tải được nữa. Khách cần liên hệ doanh nghiệp nếu muốn mua lại.

---

## 📱 Các trang web trong hệ thống

| Trang | URL | Dành cho |
|-------|-----|----------|
| **Admin Dashboard** | admin.photopro.vn | Admin System, Admin Sales, Manager |
| **Staff Portal** | portal.photopro.vn | Nhân viên/Thợ ảnh |
| **Business Site** | studio-abc.photopro.vn | Khách hàng |
| **Custom Domain** | photos.studioabc.com | Khách hàng (nếu có domain riêng) |

---

## 📞 Hỗ trợ

Nếu cần hỗ trợ về hệ thống, vui lòng liên hệ:
- Email: support@photopro.vn
- Hotline: 1900-xxxx

---

*Tài liệu cập nhật: Tháng 02/2026*
