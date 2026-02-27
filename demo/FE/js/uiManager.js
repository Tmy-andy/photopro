/**
 * PhotoPro — UI Manager
 * Quản lý việc render UI và tương tác
 */

class UIManager {
  constructor(dataManager, stateManager) {
    this.data = dataManager;
    this.state = stateManager;
  }

  /**
   * Format giá tiền VND
   */
  formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
  }

  /**
   * Format ngày tháng
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  /**
   * Render albums
   */
  renderAlbums(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const albums = limit 
      ? this.data.getAlbums().slice(0, limit) 
      : this.data.getAlbums();
    
    const currentFilter = this.state.getFilter();
    const filteredAlbums = currentFilter === 'all' 
      ? albums 
      : albums.filter(a => a.category === currentFilter);

    container.innerHTML = filteredAlbums.map(album => `
      <div class="album-card" onclick="uiManager.selectAlbum('${album.category}')">
        <div class="album-cover">
          <span style="font-size: 4rem;">${album.icon}</span>
        </div>
        <div class="album-info">
          <div class="album-title">${album.name}</div>
          <div class="album-meta">
            <span><i data-lucide="calendar" style="width: 16px; height: 16px;"></i> ${album.date}</span>
            <span><i data-lucide="camera" style="width: 16px; height: 16px;"></i> ${album.photoCount} ảnh</span>
          </div>
          <div class="album-desc">${album.description}</div>
          <button class="btn btn-primary btn-block btn-sm">
            <i data-lucide="search" style="width: 16px; height: 16px;"></i> Tìm Ảnh Tại Đây
          </button>
        </div>
      </div>
    `).join('');
    
    // Re-initialize Lucide icons after dynamic content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * Render photos
   */
  renderPhotos(containerId, photos) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = photos.map(photo => {
      const isSelected = this.state.isPhotoSelected(photo.id);
      const imageUrl = photo.url || `https://images.unsplash.com/photo-${1500000000000 + photo.id * 1000000}?w=800&h=1000&fit=crop`;
      
      return `
        <div class="photo-card ${isSelected ? 'selected' : ''}">
          <div class="photo-image" style="background-image: url('${imageUrl}');" onclick="appManager.showLightbox(${photo.id})">
            <div class="photo-watermark">DEMO WATERMARK</div>
          </div>
          <div class="photo-overlay">
            ${isSelected ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Đã chọn' : 'Click để chọn'}
          </div>
          <div class="photo-badge">${photo.similarity}%</div>
          ${photo.warning ? `<div class="photo-warning"><i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i> Hết hạn ${photo.warning}</div>` : ''}
          <div class="photo-check ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation(); uiManager.togglePhoto(${photo.id})">
            ${isSelected ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i>' : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Re-initialize Lucide icons after dynamic content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * Render pricing cards
   */
  renderPricingCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tiers = this.data.getPricingTiers();
    
    container.innerHTML = tiers.map((tier, index) => {
      const isRecommended = index === 1; // Middle tier is recommended
      return `
        <div class="pricing-card ${isRecommended ? 'recommended' : ''}">
          <div class="pricing-name">${tier.name}</div>
          <div class="pricing-price">${this.formatPrice(tier.price)}</div>
          <div class="pricing-unit">${this.formatPrice(tier.pricePerPhoto || tier.price)} / ảnh</div>
          ${tier.savings > 0 ? `<div class="pricing-savings">Tiết kiệm ${tier.savingsPercent}%</div>` : ''}
          <button class="btn ${isRecommended ? 'btn-primary' : 'btn-outline'} btn-block">
            Chọn Gói
          </button>
        </div>
      `;
    }).join('');
  }

  /**
   * Update cart info
   */
  updateCartInfo() {
    const count = this.state.getSelectedCount();
    const suggestion = this.data.getSuggestedPackage(count);

    // Update các elements
    this.updateElement('selected-count', count);
    this.updateElement('cart-count', count);
    this.updateElement('result-count', '18');

    const cartBtn = document.getElementById('go-to-cart-btn');

    if (count === 0) {
      this.updateElement('suggested-package', 'Chưa chọn');
      this.updateElement('suggested-price', '0đ');
      if (cartBtn) cartBtn.disabled = true;
    } else {
      this.updateElement('suggested-package', suggestion.name);
      this.updateElement('suggested-price', this.formatPrice(suggestion.price));
      if (cartBtn) cartBtn.disabled = false;
    }
  }

  /**
   * Update element text content
   */
  updateElement(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  /**
   * Select album (navigate to face search)
   */
  selectAlbum(category) {
    navigationManager.goToPage('face-search');
  }

  /**
   * Toggle photo selection
   */
  togglePhoto(photoId) {
    this.state.togglePhoto(photoId);
    
    // Re-render all photo grids
    this.renderPhotos('bana-grid', this.data.getPhotosByCategory('bana'));
    this.renderPhotos('hoian-grid', this.data.getPhotosByCategory('hoian'));
    this.renderPhotos('dragon-grid', this.data.getPhotosByCategory('dragon'));
    
    // Update cart info
    this.updateCartInfo();
  }

  /**
   * Filter albums by category
   */
  filterAlbums(category, event) {
    this.state.setFilter(category);

    // Update active tag
    if (event) {
      const parentList = event.target.closest('.tag-list');
      if (parentList) {
        parentList.querySelectorAll('.tag').forEach(tag => {
          tag.classList.remove('active');
        });
        event.target.classList.add('active');
      }
    }

    this.renderAlbums('albums-list');
  }

  /**
   * Update cart page
   */
  updateCartPage() {
    const count = this.state.getSelectedCount();
    const suggestion = this.data.getSuggestedPackage(count);
    const originalPrice = this.data.calculateOriginalPrice(count);
    const savings = originalPrice - suggestion.price;

    // Update summary
    this.updateElement('cart-photo-count', count);
    this.updateElement('summary-count', count);
    this.updateElement('summary-package', suggestion.name);
    this.updateElement('summary-original', this.formatPrice(originalPrice));
    this.updateElement('summary-savings', this.formatPrice(savings));
    this.updateElement('summary-total', this.formatPrice(suggestion.price));

    // Render photos in cart
    const selectedIds = this.state.getSelectedPhotos();
    const allPhotos = this.data.getAllPhotos();
    const cartPhotos = allPhotos.filter(p => selectedIds.includes(p.id));

    const container = document.getElementById('cart-photos-grid');
    if (container) {
      container.innerHTML = cartPhotos.map(photo => `
        <div class="photo-card">
          <div class="photo-placeholder">
            <div class="photo-placeholder-icon">📷</div>
            <div>Photo ${photo.id}</div>
          </div>
          <div class="photo-badge">${photo.similarity}%</div>
          <button 
            style="position: absolute; top: 8px; left: 8px; width: 28px; height: 28px; border-radius: 50%; background: var(--danger); color: white; border: none; cursor: pointer; font-weight: bold;"
            onclick="uiManager.removeFromCart(${photo.id})"
          >×</button>
        </div>
      `).join('');
    }
  }

  /**
   * Remove photo from cart
   */
  removeFromCart(photoId) {
    this.state.removePhoto(photoId);
    this.updateCartPage();
    this.updateCartInfo();
  }

  /**
   * Clear cart
   */
  clearCart() {
    if (confirm('Bạn có chắc muốn xóa tất cả ảnh khỏi giỏ hàng?')) {
      this.state.clearCart();
      this.updateCartPage();
      this.updateCartInfo();
    }
  }

  /**
   * Update checkout page
   */
  updateCheckoutPage() {
    const count = this.state.getSelectedCount();
    const suggestion = this.data.getSuggestedPackage(count);
    const originalPrice = this.data.calculateOriginalPrice(count);
    const savings = originalPrice - suggestion.price;

    this.updateElement('checkout-count', count);
    this.updateElement('checkout-package', suggestion.name);
    this.updateElement('checkout-original', this.formatPrice(originalPrice));
    this.updateElement('checkout-savings', this.formatPrice(savings));
    this.updateElement('checkout-total', this.formatPrice(suggestion.price));
  }

  /**
   * Update delivery page
   */
  updateDeliveryPage() {
    const selectedIds = this.state.getSelectedPhotos();
    const allPhotos = this.data.getAllPhotos();
    const deliveryPhotos = allPhotos.filter(p => selectedIds.includes(p.id)).slice(0, 5);

    this.updateElement('delivery-count', deliveryPhotos.length);

    const container = document.getElementById('delivery-grid');
    if (container) {
      container.innerHTML = deliveryPhotos.map(photo => `
        <div class="photo-card" onclick="uiManager.downloadPhoto(${photo.id})">
          <div class="photo-placeholder">
            <div class="photo-placeholder-icon"><i data-lucide="camera"></i></div>
            <div>Photo ${photo.id}</div>
            <div style="font-size: .7rem; margin-top: 4px; color: var(--success);">HD - NO WATERMARK</div>
          </div>
          <div class="photo-overlay">
            <i data-lucide="download"></i> Tải xuống
          </div>
        </div>
      `).join('');
      
      // Re-initialize Lucide icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

  /**
   * Download photo
   */
  downloadPhoto(photoId) {
    this.showNotification(`Đang tải ảnh ${photoId}...\n(Demo mode - không tải thực tế)`, 'info');
  }

  /**
   * Download all photos
   */
  downloadAll() {
    this.showNotification('Đang tạo file ZIP và tải xuống...\n(Demo mode - không tải thực tế)', 'info');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    alert(message);
  }

  /**
   * Toggle album photos visibility
   */
  toggleAlbumPhotos(id) {
    const element = document.getElementById(id);
    const toggleText = document.getElementById(id.replace('-photos', '-toggle'));

    if (element) {
      if (element.style.display === 'none') {
        element.style.display = 'block';
        if (toggleText) toggleText.textContent = 'Thu gọn';
      } else {
        element.style.display = 'none';
        if (toggleText) toggleText.textContent = 'Xem ảnh';
      }
    }
  }

  /**
   * Show loading overlay
   */
  showLoading(text = 'Đang xử lý...', subtext = 'Vui lòng đợi') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const loadingSubtext = document.getElementById('loading-subtext');

    if (overlay) {
      if (loadingText) loadingText.textContent = text;
      if (loadingSubtext) loadingSubtext.textContent = subtext;
      overlay.classList.remove('hidden');
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  /**
   * Open modal
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  /**
   * Close modal
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Reset lookup form
   */
  resetLookupForm() {
    const searchInput = document.getElementById('searchInput');
    const notFoundEl = document.getElementById('notFoundResults');
    const resultsEl = document.getElementById('searchResults');
    
    if (searchInput) searchInput.value = '';
    if (notFoundEl) notFoundEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'none';
    
    // Focus on input
    if (searchInput) searchInput.focus();
  }
}

// Will be initialized after dataManager and stateManager are loaded
let uiManager;
