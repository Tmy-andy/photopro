// PhotoPro Dashboard Manager
// Quản lý authentication, role-based access, API calls

class DashboardManager {
  constructor() {
    this.currentUser = {
      id: 1,
      name: 'Admin System',
      email: 'admin@photopro.vn',
      role: 'admin-system', // admin-system | admin-sales | manager
      avatar: 'AS'
    };
    
    this.init();
  }
  
  init() {
    this.checkAuth();
    this.applyRoleBasedVisibility();
    this.updateUserInfo();
  }
  
  // Authentication
  checkAuth() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Redirect to login page
      console.log('No auth token found');
      // window.location.href = '/login.html';
    }
  }
  
  login(email, password) {
    // API call to login
    return fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        this.currentUser = data.user;
        return data;
      }
      throw new Error('Login failed');
    });
  }
  
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }
  
  // Role-based Access Control
  applyRoleBasedVisibility() {
    const role = this.currentUser.role;
    
    document.querySelectorAll('[data-role]').forEach(el => {
      const allowedRoles = el.dataset.role.split(',').map(r => r.trim());
      if (!allowedRoles.includes(role)) {
        el.style.display = 'none';
      }
    });
  }
  
  hasPermission(requiredRole) {
    const hierarchy = {
      'admin-system': 3,
      'admin-sales': 2,
      'manager': 1
    };
    
    return hierarchy[this.currentUser.role] >= hierarchy[requiredRole];
  }
  
  // Update UI
  updateUserInfo() {
    const roleElement = document.getElementById('userRole');
    if (roleElement) {
      const roleNames = {
        'admin-system': 'Admin System',
        'admin-sales': 'Admin Sales',
        'manager': 'Manager'
      };
      roleElement.textContent = roleNames[this.currentUser.role] || this.currentUser.role;
    }
  }
  
  // API Calls
  async apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(`/api/v1${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Albums
  async getAlbums(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/albums?${params}`);
  }
  
  async createAlbum(data) {
    return this.apiCall('/albums', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async updateAlbum(id, data) {
    return this.apiCall(`/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async deleteAlbum(id) {
    return this.apiCall(`/albums/${id}`, {
      method: 'DELETE'
    });
  }
  
  // Orders
  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/orders?${params}`);
  }
  
  async getOrderDetails(id) {
    return this.apiCall(`/orders/${id}`);
  }
  
  async refundOrder(id, reason) {
    return this.apiCall(`/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
  
  // Staff
  async getStaff() {
    return this.apiCall('/staff');
  }
  
  async createStaff(data) {
    return this.apiCall('/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async updateStaff(id, data) {
    return this.apiCall(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async deleteStaff(id) {
    return this.apiCall(`/staff/${id}`, {
      method: 'DELETE'
    });
  }
  
  // Pricing
  async getPricingBundles() {
    return this.apiCall('/pricing/bundles');
  }
  
  async createBundle(data) {
    return this.apiCall('/pricing/bundles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async updateBundle(id, data) {
    return this.apiCall(`/pricing/bundles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async deleteBundle(id) {
    return this.apiCall(`/pricing/bundles/${id}`, {
      method: 'DELETE'
    });
  }
  
  // Revenue & Statistics
  async getRevenue(period = 'month') {
    return this.apiCall(`/stats/revenue?period=${period}`);
  }
  
  async getDashboardStats() {
    return this.apiCall('/stats/dashboard');
  }
  
  // Settings
  async getSettings() {
    return this.apiCall('/settings');
  }
  
  async updateSettings(data) {
    return this.apiCall('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  // Utilities
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
  
  formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
  }
  
  formatDateTime(date) {
    return new Date(date).toLocaleString('vi-VN');
  }
  
  showNotification(message, type = 'success') {
    // Show toast notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  showLoading() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay active';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  }
  
  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Initialize dashboard manager
const dashboardManager = new DashboardManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardManager;
}
