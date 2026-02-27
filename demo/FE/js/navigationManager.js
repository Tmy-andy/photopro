/**
 * PhotoPro — Navigation Manager
 * Quản lý điều hướng giữa các trang
 */

class NavigationManager {
  constructor(stateManager) {
    this.state = stateManager;
    this.currentPage = 'landing';
  }

  /**
   * Initialize navigation
   */
  init() {
    // Setup tab click handlers
    document.querySelectorAll('.demo-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.goToPage(tab.dataset.page);
      });
    });

    console.log('✅ Navigation initialized');
  }

  /**
   * Navigate to a page
   */
  goToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
      page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Update tabs
    document.querySelectorAll('.demo-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.page === pageId) {
        tab.classList.add('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update state
    this.currentPage = pageId;
    this.state.setCurrentPage(pageId);

    // Update page-specific content
    this.onPageChange(pageId);

    console.log('📄 Navigated to:', pageId);
  }

  /**
   * Handle page change events
   */
  onPageChange(pageId) {
    switch (pageId) {
      case 'results':
        // Trigger results page render
        if (typeof renderSearchResults === 'function') {
          setTimeout(renderSearchResults, 100);
        }
        break;
      case 'cart':
        if (typeof updateCartUI === 'function') {
          setTimeout(updateCartUI, 100);
        }
        break;
      case 'checkout':
        if (typeof updateCheckoutSummary === 'function') {
          setTimeout(updateCheckoutSummary, 100);
        }
        break;
      case 'success':
        if (typeof initSuccessPage === 'function') {
          setTimeout(initSuccessPage, 100);
        }
        break;
      case 'delivery':
        if (typeof initDeliveryPage === 'function') {
          setTimeout(initDeliveryPage, 100);
        }
        break;
    }
  }

  /**
   * Go to cart (with validation)
   */
  goToCart() {
    if (this.state.getSelectedCount() === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh!');
      return;
    }
    this.goToPage('cart');
  }

  /**
   * Get current page
   */
  getCurrentPage() {
    return this.currentPage;
  }
}

// Will be initialized after stateManager is loaded
let navigationManager;
