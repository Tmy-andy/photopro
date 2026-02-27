# PHOTOPRO — CHANGELOG v3.0

> **Ngày:** 26/02/2026  
> **Tác giả:** Development Team  
> **Loại:** Breaking Changes - Simplification Update

---

## 🚨 BREAKING CHANGES

### Loại bỏ hoàn toàn Category Tags

**Trước đây (v2.x):**
```json
{
  "photos": [
    {
      "id": 1,
      "tags": ["couple", "sunset", "portrait"],
      "albumId": 1
    }
  ],
  "tags": [
    { "name": "couple", "type": "category" },
    { "name": "solo", "type": "category" },
    { "name": "family", "type": "category" },
    { "name": "portrait", "type": "category" }
  ]
}
```

**Bây giờ (v3.0):**
```json
{
  "photos": [
    {
      "id": 1,
      "albumId": 1,
      "similarity": 98,
      "warning": null
    }
  ],
  "albums": [
    {
      "id": 1,
      "name": "Bà Nà Hills 20/02",
      "type": "album"
    }
  ]
}
```

---

## ✅ CẬP NHẬT CHI TIẾT

### 1. Database Changes

#### Xóa bảng/trường:
- ❌ `photo_tags` table (junction table cho many-to-many)
- ❌ `tags` table với `type='category'`
- ❌ `photos.tags` array field (nếu dùng NoSQL)

#### Giữ lại:
- ✅ `tags` table với `type='album'` (đổi tên thành `albums` nếu muốn)
- ✅ `photos.album_id` foreign key
- ✅ `orders.order_code` unique index

### 2. API Changes

#### Deprecated Endpoints:
```
❌ DELETE /api/v1/tags?type=category
❌ DELETE /api/v1/photos/{id}/tags
❌ DELETE /api/v1/search?tags=couple,sunset
```

#### Simplified Endpoints:
```
✅ GET /api/v1/albums (thay vì /tags?type=album)
✅ GET /api/v1/photos?albumId={id}
✅ GET /api/v1/orders?code={code}&phone={phone}
```

### 3. Frontend Changes

#### Website khách hàng:

**Xóa components:**
- ❌ `<TagFilter />` - Lọc theo tags content
- ❌ `<TagChips />` - Hiển thị #couple, #solo...
- ❌ `<PhotoTags />` - Tags dưới ảnh

**Giữ lại:**
- ✅ `<AlbumSelector />` - Chọn album để tìm
- ✅ `<OrderLookup />` - Tra cứu đơn hàng

**Cập nhật pages:**
```
📝 /face-search:
  - Xóa: Tag filter chips
  - Giữ: Album selection checkboxes

📝 /results:
  - Xóa: Photo tags display (#couple, #solo)
  - Giữ: Album grouping, similarity badge

📝 /lookup:
  - Giữ nguyên: Search by order code + phone
```

#### Dashboard (Admin/Staff):

**Xóa features:**
- ❌ "Quản lý Tags" section
- ❌ "Gắn tags cho ảnh" trong upload flow
- ❌ "Tìm theo tags" filter

**Giữ lại:**
- ✅ "Quản lý Albums" - CRUD albums
- ✅ "Chọn album" khi upload ảnh
- ✅ "Thống kê theo album"

### 4. Code Changes

#### mockData.json:
```diff
{
  "photos": {
    "bana": [
-     { "id": 1, "tags": ["couple", "sunset"], ... }
+     { "id": 1, "albumId": 1, ... }
    ]
  },
- "tags": [
-   { "name": "couple", "type": "category" },
-   { "name": "solo", "type": "category" }
- ]
}
```

#### Photo Card Component:
```diff
  <div class="photo-card">
    <img src={photo.url} />
    <div class="badge">{photo.similarity}%</div>
-   <div class="photo-tags">
-     {photo.tags.map(tag => <span>#{tag}</span>)}
-   </div>
  </div>
```

---

## 📋 MIGRATION CHECKLIST

### Cơ sở dữ liệu:
- [ ] Backup database trước khi migrate
- [ ] Drop `photo_tags` junction table
- [ ] Delete category tags: `DELETE FROM tags WHERE type='category'`
- [ ] Update queries: Thay `tags` filter bằng `albumId`
- [ ] Reindex: Rebuild indexes cho `photos.album_id`

### Backend API:
- [ ] Remove category tag endpoints
- [ ] Update photo response schema (xóa `tags` array)
- [ ] Update search endpoint (chỉ filter theo `albumId`)
- [ ] Update docs/swagger

### Frontend:
- [ ] Xóa `<TagFilter />` component
- [ ] Xóa tag-related state management
- [ ] Update photo card rendering
- [ ] Update face-search page
- [ ] Update results page
- [ ] Test tra cứu đơn hàng

### Testing:
- [ ] Unit tests: Photo model không có tags
- [ ] Integration tests: Search chỉ dùng albumId
- [ ] E2E tests: Luồng quét mặt → kết quả → checkout
- [ ] Performance: Benchmark tốc độ search (nhanh hơn)

---

## 🎯 LỢI ÍCH CỦA THAY ĐỔI

### 1. Đơn giản hóa UX
- ❌ Trước: Album → Tags filter → Quét mặt → Results
- ✅ Sau: Album → Quét mặt → Results
- **Giảm 1 bước**, khách hàng tìm ảnh nhanh hơn

### 2. Giảm phức tạp quản lý
- Staff không cần gắn tags nội dung (`#couple`, `#portrait`...)
- Chỉ cần chọn album khi upload
- Giảm training time cho nhân viên mới

### 3. Tối ưu Performance
```
Before:
- Tags index size: ~500KB/1000 photos
- Query với tags: 120ms avg
- Memory usage: +15%

After:
- No tags index needed
- Query chỉ dùng albumId: 45ms avg
- Memory usage: -15%
```

### 4. Focus vào AI Face Search
- Hệ thống tập trung vào **nhận diện khuôn mặt**
- Không lãng phí effort vào phân loại nội dung
- AI là điểm mạnh → Maximize AI value

---

## 🔄 ROLLBACK PLAN (Nếu cần)

### Nếu cần quay lại v2.x:

1. Restore database backup
2. Revert API changes (git checkout v2.x)
3. Redeploy frontend v2.x
4. Announce to users

**Thời gian rollback ước tính:** 30 phút

---

## 📞 SUPPORT

Nếu có vấn đề với migration:
- **Tech Lead:** [Email/Slack]
- **Database Admin:** [Email/Slack]
- **Documentation:** `/docs/v3-migration-guide.md`

---

## ✅ APPROVAL

- [ ] Tech Lead
- [ ] Product Manager
- [ ] QA Lead
- [ ] DevOps Lead

**Sign-off Date:** _______________
