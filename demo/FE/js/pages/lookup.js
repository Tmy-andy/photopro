// Lookup Page Script
console.log('✅ Lookup page script loaded');

// Initialize lookup page
function initLookupPage() {
  if (typeof dataManager === 'undefined' || !dataManager.data) return;
  
  renderRecentOrders();
  
  // Update placeholder based on search type
  const searchTypeRadios = document.querySelectorAll('input[name="searchType"]');
  searchTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const searchInput = document.getElementById('searchInput');
      if (!searchInput) return;
      
      if (e.target.value === 'code') {
        searchInput.placeholder = 'Nhập mã đơn hàng (VD: WL2024ABC)';
        searchInput.type = 'text';
      } else {
        searchInput.placeholder = 'Nhập số điện thoại (VD: 0901234567)';
        searchInput.type = 'tel';
      }
    });
  });
}

// Delay initialization
setTimeout(initLookupPage, 200);

function renderRecentOrders() {
  const container = document.getElementById('recentOrders');
  if (!container || typeof dataManager === 'undefined' || !dataManager.data) return;
  
  const orders = dataManager.data.orders || [];
  
  if (orders.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Chưa có đơn hàng nào</p>';
    return;
  }
  
  container.innerHTML = orders.slice(0, 5).map(order => {
    if (!order.customer) return '';
    return `
    <div style="padding: 12px; background: var(--surface-elevated); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: transform 0.2s;" onclick="appManager.viewOrder('${order.code}')">
      <div class="flex-between" style="margin-bottom: 4px;">
        <strong>${order.code}</strong>
        <span class="badge badge-${order.status === 'completed' ? 'success' : 'warning'}">${order.status === 'completed' ? 'Hoàn thành' : 'Chờ xử lý'}</span>
      </div>
      <div style="font-size: 14px; color: var(--text-secondary);">
        ${order.customer.phone} • ${order.photos.length} ảnh • ${order.total.toLocaleString('vi-VN')}₫
      </div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
        ${new Date(order.createdAt).toLocaleString('vi-VN')}
      </div>
    </div>
    `;
  }).filter(html => html !== '').join('');
}
