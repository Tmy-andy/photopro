// Success Page Script
console.log('✅ Success page script loaded');

// Initialize success page - call when needed, not immediately
// Will be called by navigationManager when navigating to success page

function initSuccessPage() {
  console.log('🎉 initSuccessPage called');
  console.log('stateManager exists:', typeof stateManager !== 'undefined');
  
  if (typeof stateManager === 'undefined') {
    console.error('❌ stateManager is undefined!');
    return;
  }
  
  // Access orderInfo from state property
  const order = stateManager.state.orderInfo;
  
  console.log('orderInfo from state:', order);
  
  if (!order) {
    console.error('❌ No order info found in stateManager.state.orderInfo!');
    return;
  }
  
  console.log('📦 Order data:', order);
  
  // Update order info
  const orderCodeEl = document.getElementById('orderCode');
  if (orderCodeEl) orderCodeEl.textContent = order.code;
  
  const orderPhoneEl = document.getElementById('orderPhone');
  if (orderPhoneEl) orderPhoneEl.textContent = order.phone;
  
  const orderPhotoCountEl = document.getElementById('orderPhotoCount');
  if (orderPhotoCountEl) orderPhotoCountEl.textContent = order.photoCount + ' ảnh';
  
  const orderTotalEl = document.getElementById('orderTotal');
  if (orderTotalEl) orderTotalEl.textContent = order.total.toLocaleString('vi-VN') + '₫';
  
  const orderPaymentMethodEl = document.getElementById('orderPaymentMethod');
  if (orderPaymentMethodEl) {
    const methodNames = {
      'momo': 'Ví MoMo',
      'banking': 'Chuyển khoản',
      'card': 'Thẻ tín dụng',
      'cash': 'Tiền mặt'
    };
    orderPaymentMethodEl.textContent = methodNames[order.paymentMethod] || order.paymentMethod;
  }
  
  // Update download link
  const downloadLinkEl = document.getElementById('downloadLink');
  if (downloadLinkEl && order.downloadLink) {
    downloadLinkEl.textContent = order.downloadLink;
  }
  
  // Start countdown
  if (typeof appManager !== 'undefined' && order.expiryTime) {
    console.log('⏰ Starting countdown for expiry:', order.expiryTime);
    appManager.startCountdown(order.expiryTime);
  }
  
  console.log('✅ Success page initialized successfully');
}
