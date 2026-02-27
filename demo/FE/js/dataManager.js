/**
 * PhotoPro — Data Manager
 * Quản lý dữ liệu từ mockData.json
 */

class DataManager {
  constructor() {
    this.data = null;
    this.isLoaded = false;
  }

  /**
   * Load dữ liệu từ mockData.json
   */
  async loadData() {
    try {
      const response = await fetch('./data/mockData.json');
      this.data = await response.json();
      this.isLoaded = true;
      console.log('✅ Data loaded successfully:', this.data);
      return this.data;
    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Fallback to inline data if fetch fails
      this.data = this.getFallbackData();
      this.isLoaded = true;
      return this.data;
    }
  }

  /**
   * Fallback data nếu không load được JSON
   */
  getFallbackData() {
    return {
      business: {
        name: "Wonderland Photo",
        subdomain: "wonderland",
        phone: "1900 xxxx",
        email: "support@wonderland.vn",
        address: "123 Đường ABC, Đà Nẵng"
      },
      albums: [],
      photos: { bana: [], hoian: [], dragon: [] },
      pricing: {
        tiers: [
          { id: 1, photos: 1, price: 20000, name: "Gói 1 ảnh", savings: 0 },
          { id: 2, photos: 3, price: 50000, name: "Gói 3 ảnh", savings: 17 },
          { id: 3, photos: 8, price: 100000, name: "Gói 8 ảnh", savings: 37 }
        ],
        singlePhotoPrice: 20000
      },
      orders: [
        {
          code: "WL8234",
          customer: { phone: "0912345678", email: "user1@example.com", name: "Nguyễn Văn A" },
          photos: [1, 2, 3, 5, 8, 12],
          total: 100000,
          paymentMethod: "momo",
          status: "completed",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          expiryTime: Date.now() + (22 * 60 * 60 * 1000), // 22 hours left
          downloadLink: "https://studio-abc.photopro.vn/d/ABC123XYZ456"
        },
        {
          code: "WL7156",
          customer: { phone: "0987654321", email: "user2@example.com", name: "Trần Thị B" },
          photos: [4, 7, 9],
          total: 50000,
          paymentMethod: "banking",
          status: "completed",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          expiryTime: Date.now() + (19 * 60 * 60 * 1000), // 19 hours left
          downloadLink: "https://studio-abc.photopro.vn/d/DEF789GHI012"
        },
        {
          code: "WL9421",
          customer: { phone: "0901234567", email: "user3@example.com", name: "Lê Văn C" },
          photos: [10, 11, 13, 14, 15, 16, 17, 18],
          total: 100000,
          paymentMethod: "cash",
          status: "completed",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          expiryTime: Date.now() + (0 * 60 * 60 * 1000), // about to expire
          downloadLink: "https://studio-abc.photopro.vn/d/JKL345MNO678"
        },
        {
          code: "WL3789",
          customer: { phone: "0923456789", email: "user4@example.com", name: "Phạm Thị D" },
          photos: [2, 6, 11],
          total: 50000,
          paymentMethod: "momo",
          status: "completed",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          expiryTime: Date.now() + (12 * 60 * 60 * 1000), // 12 hours left
          downloadLink: "https://studio-abc.photopro.vn/d/PQR901STU234"
        },
        {
          code: "WL5612",
          customer: { phone: "0934567890", email: "user5@example.com", name: "Hoàng Văn E" },
          photos: [1],
          total: 20000,
          paymentMethod: "banking",
          status: "completed",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          expiryTime: Date.now() + (23.5 * 60 * 60 * 1000), // 23.5 hours left
          downloadLink: "https://studio-abc.photopro.vn/d/VWX567YZA890"
        }
      ],
      tags: [],
      settings: {
        deliveryLinkTTL: 7,
        autoPackEnabled: true
      }
    };
  }

  /**
   * Lấy thông tin doanh nghiệp
   */
  getBusiness() {
    return this.data?.business || {};
  }

  /**
   * Lấy tất cả albums
   */
  getAlbums() {
    return this.data?.albums || [];
  }

  /**
   * Lấy albums theo category
   */
  getAlbumsByCategory(category) {
    if (category === 'all') return this.getAlbums();
    return this.getAlbums().filter(album => album.category === category);
  }

  /**
   * Lấy album theo ID
   */
  getAlbumById(id) {
    return this.getAlbums().find(album => album.id === id);
  }

  /**
   * Lấy tất cả photos
   */
  getAllPhotos() {
    const photos = this.data?.photos || {};
    return [...(photos.bana || []), ...(photos.hoian || []), ...(photos.dragon || [])];
  }

  /**
   * Lấy photos theo album category
   */
  getPhotosByCategory(category) {
    return this.data?.photos?.[category] || [];
  }

  /**
   * Lấy photos theo album ID
   */
  getPhotosByAlbum(albumId) {
    // Album ID format: "bana-hills", "hoian-ancient", "dragon-bridge"
    // Map to category
    const categoryMap = {
      'bana-hills': 'bana',
      'hoian-ancient': 'hoian',
      'dragon-bridge': 'dragon',
      'bana': 'bana',
      'hoian': 'hoian',
      'dragon': 'dragon'
    };
    
    const category = categoryMap[albumId] || albumId;
    return this.getPhotosByCategory(category);
  }

  /**
   * Lấy photo theo ID
   */
  getPhotoById(id) {
    return this.getAllPhotos().find(photo => photo.id === id);
  }

  /**
   * Lấy pricing tiers
   */
  getPricingTiers() {
    return this.data?.pricing?.tiers || [];
  }

  /**
   * Tính gói tối ưu dựa trên số lượng ảnh
   */
  getSuggestedPackage(photoCount) {
    if (photoCount === 0) {
      return { name: '-', price: 0, savings: 0, photos: 0 };
    }

    const tiers = this.getPricingTiers();
    
    // Tìm gói phù hợp nhất
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (photoCount >= tiers[i].photos) {
        return tiers[i];
      }
    }
    
    // Nếu ít hơn gói nhỏ nhất, trả về gói nhỏ nhất
    return tiers[0] || { name: '-', price: 0, savings: 0, photos: 0 };
  }

  /**
   * Tính giá gốc (không có gói)
   */
  calculateOriginalPrice(photoCount) {
    const singlePrice = this.data?.pricing?.singlePhotoPrice || 20000;
    return photoCount * singlePrice;
  }

  /**
   * Tính toán giá chi tiết cho số ảnh đã chọn (tối ưu với nhiều gói)
   */
  calculatePricing(photoCount) {
    console.log('💰 calculatePricing called for:', photoCount, 'photos');
    
    if (photoCount === 0) {
      return {
        originalPrice: 0,
        finalPrice: 0,
        discount: 0,
        packageName: 'Chưa có',
        packages: [],
        suggestion: 'Vui lòng chọn ảnh để xem giá'
      };
    }

    const singlePrice = this.data?.pricing?.singlePhotoPrice || 20000;
    const originalPrice = photoCount * singlePrice;
    const tiers = this.getPricingTiers().sort((a, b) => b.photos - a.photos); // Sort giảm dần
    
    console.log('💰 Single price:', singlePrice);
    console.log('💰 Original price:', originalPrice);
    console.log('💰 Available tiers:', tiers);
    
    // Tìm combination tối ưu nhất (greedy algorithm)
    let remaining = photoCount;
    let finalPrice = 0;
    const packagesUsed = [];
    
    // Duyệt từ gói lớn nhất đến nhỏ nhất
    for (const tier of tiers) {
      if (remaining >= tier.photos) {
        const count = Math.floor(remaining / tier.photos);
        if (count > 0) {
          packagesUsed.push({
            tier: tier,
            count: count,
            totalPhotos: count * tier.photos,
            totalPrice: count * tier.price
          });
          finalPrice += count * tier.price;
          remaining -= count * tier.photos;
        }
      }
    }
    
    // Ảnh lẻ còn lại
    if (remaining > 0) {
      packagesUsed.push({
        tier: { name: 'Ảnh lẻ', photos: 1, price: singlePrice },
        count: remaining,
        totalPhotos: remaining,
        totalPrice: remaining * singlePrice
      });
      finalPrice += remaining * singlePrice;
    }
    
    // Tạo package name
    let packageName = '';
    if (packagesUsed.length === 0) {
      packageName = 'Chưa có';
    } else {
      packageName = packagesUsed.map(p => {
        if (p.tier.name === 'Ảnh lẻ') {
          return `${p.count} lẻ`;
        }
        return `${p.tier.name} x${p.count}`;
      }).join(' + ');
    }
    
    const discount = originalPrice - finalPrice;
    const savedPercent = discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;
    
    let suggestion = '';
    if (discount > 0) {
      suggestion = `Tiết kiệm ${savedPercent}% với gói combo!`;
    } else if (tiers.length > 0) {
      const smallestTier = tiers[tiers.length - 1];
      if (photoCount < smallestTier.photos) {
        const moreNeeded = smallestTier.photos - photoCount;
        suggestion = `Chọn thêm ${moreNeeded} ảnh để được ${smallestTier.name} (tiết kiệm ${smallestTier.savings}%)`;
      }
    }
    
    const result = {
      originalPrice,
      finalPrice,
      discount,
      packageName,
      packages: packagesUsed,
      suggestion,
      savedPercent
    };
    
    console.log('💰 Pricing result:', result);
    console.log('💰 Packages breakdown:', packagesUsed);
    return result;
  }

  /**
   * Lấy tất cả tags
   */
  getTags() {
    return this.data?.tags || [];
  }

  /**
   * Lấy settings
   */
  getSettings() {
    return this.data?.settings || {};
  }

  /**
   * Lấy statistics
   */
  getStatistics() {
    return this.data?.statistics || {};
  }

  /**
   * Lấy orders
   */
  getOrders() {
    return this.data?.orders || [];
  }

  /**
   * Tìm order theo ID
   */
  getOrderById(orderId) {
    return this.getOrders().find(order => order.id === orderId);
  }

  /**
   * Tìm orders theo số điện thoại
   */
  getOrdersByPhone(phone) {
    return this.getOrders().filter(order => order.customerPhone === phone);
  }

  /**
   * Lấy staff
   */
  getStaff() {
    return this.data?.staff || [];
  }
}

// Export singleton instance
const dataManager = new DataManager();
