/**
 * PhotoPro — State Manager
 * Quản lý state của application (giỏ hàng, selected photos, filters...)
 */

class StateManager {
  constructor() {
    this.state = {
      selectedPhotos: new Set(),
      currentFilter: 'all',
      currentPage: 'landing',
      searchScope: 'all',
      selectedAlbums: [],
      selectedTags: [],
      customerInfo: {
        phone: '',
        email: '',
        note: ''
      },
      orderInfo: null
    };

    this.listeners = [];
  }

  /**
   * Đăng ký listener để nhận thông báo khi state thay đổi
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Thông báo cho tất cả listeners
   */
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Chọn/bỏ chọn ảnh
   */
  togglePhoto(photoId) {
    console.log('🔄 togglePhoto called with photoId:', photoId, 'type:', typeof photoId);
    console.log('📋 Current selected photos:', Array.from(this.state.selectedPhotos));
    
    if (this.state.selectedPhotos.has(photoId)) {
      console.log('➖ Removing photo:', photoId);
      this.state.selectedPhotos.delete(photoId);
    } else {
      console.log('➕ Adding photo:', photoId);
      this.state.selectedPhotos.add(photoId);
    }
    
    console.log('✅ Updated selected photos:', Array.from(this.state.selectedPhotos));
    this.notify();
  }

  /**
   * Xóa ảnh khỏi giỏ hàng
   */
  removePhoto(photoId) {
    this.state.selectedPhotos.delete(photoId);
    this.notify();
  }

  /**
   * Xóa tất cả ảnh khỏi giỏ hàng
   */
  clearCart() {
    this.state.selectedPhotos.clear();
    this.notify();
  }

  /**
   * Lấy danh sách ID ảnh đã chọn
   */
  getSelectedPhotos() {
    return Array.from(this.state.selectedPhotos);
  }

  /**
   * Lấy số lượng ảnh đã chọn
   */
  getSelectedCount() {
    return this.state.selectedPhotos.size;
  }

  /**
   * Kiểm tra ảnh có được chọn không
   */
  isPhotoSelected(photoId) {
    return this.state.selectedPhotos.has(photoId);
  }

  /**
   * Set filter hiện tại
   */
  setFilter(filter) {
    this.state.currentFilter = filter;
    this.notify();
  }

  /**
   * Get filter hiện tại
   */
  getFilter() {
    return this.state.currentFilter;
  }

  /**
   * Set trang hiện tại
   */
  setCurrentPage(page) {
    this.state.currentPage = page;
    this.notify();
  }

  /**
   * Get trang hiện tại
   */
  getCurrentPage() {
    return this.state.currentPage;
  }

  /**
   * Set search scope
   */
  setSearchScope(scope) {
    this.state.searchScope = scope;
    this.notify();
  }

  /**
   * Get search scope
   */
  getSearchScope() {
    return this.state.searchScope;
  }

  /**
   * Set selected albums
   */
  setSelectedAlbums(albums) {
    this.state.selectedAlbums = albums;
    this.notify();
  }

  /**
   * Get selected albums
   */
  getSelectedAlbums() {
    return this.state.selectedAlbums;
  }

  /**
   * Toggle tag
   */
  toggleTag(tag) {
    const index = this.state.selectedTags.indexOf(tag);
    if (index > -1) {
      this.state.selectedTags.splice(index, 1);
    } else {
      this.state.selectedTags.push(tag);
    }
    this.notify();
  }

  /**
   * Get selected tags
   */
  getSelectedTags() {
    return this.state.selectedTags;
  }

  /**
   * Set customer info
   */
  setCustomerInfo(info) {
    this.state.customerInfo = { ...this.state.customerInfo, ...info };
    this.notify();
  }

  /**
   * Get customer info
   */
  getCustomerInfo() {
    return this.state.customerInfo;
  }

  /**
   * Set order info
   */
  setOrderInfo(info) {
    this.state.orderInfo = info;
    this.notify();
  }

  /**
   * Get order info
   */
  getOrderInfo() {
    return this.state.orderInfo;
  }

  /**
   * Reset state
   */
  reset() {
    this.state = {
      selectedPhotos: new Set(),
      currentFilter: 'all',
      currentPage: 'landing',
      searchScope: 'all',
      selectedAlbums: [],
      selectedTags: [],
      customerInfo: {
        phone: '',
        email: '',
        note: ''
      },
      orderInfo: null
    };
    this.notify();
  }

  /**
   * Get full state
   */
  getState() {
    return this.state;
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage() {
    try {
      const stateToSave = {
        ...this.state,
        selectedPhotos: Array.from(this.state.selectedPhotos)
      };
      localStorage.setItem('photopro_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('photopro_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = {
          ...parsed,
          selectedPhotos: new Set(parsed.selectedPhotos || [])
        };
        this.notify();
        return true;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return false;
  }
}

// Export singleton instance
const stateManager = new StateManager();

// Auto-save to localStorage when state changes
stateManager.subscribe(() => {
  stateManager.saveToLocalStorage();
});
