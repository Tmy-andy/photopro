// Delivery Page Script
console.log('✅ Delivery page script loaded');

// Initialize delivery page - call when needed, not immediately
// Will be called by navigationManager when navigating to delivery page

function initDeliveryPage() {
  console.log('📥 initDeliveryPage called');
  
  if (typeof stateManager === 'undefined') {
    console.error('❌ stateManager is undefined!');
    return;
  }
  
  const order = stateManager.state.orderInfo;
  
  if (!order) {
    console.error('❌ No order info found in stateManager.state.orderInfo!');
    return;
  }
  
  console.log('📦 Order info:', order);
  
  // Update order info
  const orderCodeEl = document.getElementById('deliveryOrderCode');
  if (orderCodeEl) orderCodeEl.textContent = order.code;
  
  const photoCountEl = document.getElementById('deliveryPhotoCount');
  if (photoCountEl) photoCountEl.textContent = order.photoCount + ' ảnh';
  
  // Update countdown
  if (order.expiryTime) {
    updateDeliveryCountdown(order.expiryTime);
  }
  
  // Render photos
  renderDeliveryPhotos();
  
  // Calculate total size
  const totalSizeEl = document.getElementById('totalSize');
  if (totalSizeEl && order.photoCount) {
    const estimatedSize = (order.photoCount * 3).toFixed(1); // ~3MB per photo
    totalSizeEl.textContent = `~${estimatedSize} MB`;
  }
  
  console.log('✅ Delivery page initialized');
}

function updateDeliveryCountdown(expiryTime) {
  const timeLeftEl = document.getElementById('deliveryTimeLeft');
  if (!timeLeftEl) return;
  
  const updateTimer = () => {
    const now = new Date().getTime();
    const distance = expiryTime - now;
    
    if (distance < 0) {
      timeLeftEl.textContent = 'Đã hết hạn';
      timeLeftEl.style.color = 'var(--error)';
      return;
    }
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    timeLeftEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

function renderDeliveryPhotos() {
  const grid = document.getElementById('deliveryPhotosGrid');
  if (!grid || typeof stateManager === 'undefined' || typeof dataManager === 'undefined') return;
  if (!stateManager.state || !stateManager.state.selectedPhotos) return;
  if (!stateManager.state.selectedPhotos.size) return;
  
  const selectedPhotoIds = Array.from(stateManager.state.selectedPhotos);
  console.log('📥 Rendering delivery photos:', selectedPhotoIds.length);
  
  const allPhotos = dataManager.getAllPhotos();
  const selectedPhotos = allPhotos.filter(p => selectedPhotoIds.includes(p.id));
  
  grid.innerHTML = selectedPhotos.map((photo, index) => {
    const imageUrl = photo.url || `https://images.unsplash.com/photo-${1500000000000 + photo.id * 1000000}?w=800&h=1000&fit=crop`;
    
    return `
      <div class="delivery-photo-item">
        <img src="${imageUrl}" alt="Photo ${index + 1}">
        <div class="download-overlay">
          <div class="photo-info">
            <div style="font-weight: 600;">Photo ${index + 1}</div>
            <div style="font-size: 11px; opacity: 0.8;">~3 MB</div>
          </div>
          <button class="download-btn" onclick="appManager.downloadPhoto(${photo.id})">
            <i data-lucide="download"></i> Tải
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Initialize Lucide icons for download buttons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  console.log('✅ Delivery photos rendered');
}
