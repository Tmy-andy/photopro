// Cart Page Script
console.log('✅ Cart page script loaded');

// Listen to state changes
function initCartPage() {
  console.log('🛒 initCartPage called');
  
  if (typeof stateManager !== 'undefined') {
    console.log('✅ Cart subscribing to state changes');
    stateManager.subscribe(() => {
      console.log('🔔 Cart state changed');
      updateCartUI();
    });
    
    // Initial render
    updateCartUI();
  } else {
    console.warn('⚠️ stateManager not ready, retrying cart init...');
    setTimeout(initCartPage, 100);
  }
}

// Delay initialization
setTimeout(initCartPage, 200);

function updateCartUI() {
  console.log('🛒 updateCartUI called');
  
  if (!document.getElementById('cartPhotosGrid')) return;
  if (typeof stateManager === 'undefined' || !stateManager.state || !stateManager.state.selectedPhotos) return;
  
  const selectedCount = stateManager.state.selectedPhotos.size;
  console.log('🛒 Selected photos in cart:', selectedCount);
  
  // Update photo count
  const countEl = document.getElementById('cartPhotoCount');
  if (countEl) countEl.textContent = selectedCount;
  
  const summaryCountEl = document.getElementById('summaryPhotoCount');
  if (summaryCountEl) summaryCountEl.textContent = selectedCount;
  
  // Show/hide empty state
  const emptyCart = document.getElementById('emptyCart');
  const cartGrid = document.getElementById('cartPhotosGrid');
  
  if (selectedCount === 0) {
    if (emptyCart) emptyCart.style.display = 'block';
    if (cartGrid) cartGrid.style.display = 'none';
  } else {
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartGrid) cartGrid.style.display = 'grid';
    
    // Render selected photos
    renderCartPhotos();
  }
  
  // Update pricing
  if (typeof dataManager !== 'undefined' && dataManager.data) {
    const pricing = dataManager.calculatePricing(selectedCount);
    
    if (pricing) {
      const originalPriceEl = document.getElementById('originalPrice');
      const totalPriceEl = document.getElementById('totalPrice');
      const appliedPackageEl = document.getElementById('appliedPackage');
      const discountRow = document.getElementById('discountRow');
      const discountAmountEl = document.getElementById('discountAmount');
      
      if (originalPriceEl) originalPriceEl.textContent = pricing.originalPrice.toLocaleString('vi-VN') + '₫';
      if (totalPriceEl) totalPriceEl.textContent = pricing.finalPrice.toLocaleString('vi-VN') + '₫';
      if (appliedPackageEl) appliedPackageEl.textContent = pricing.packageName || 'Lẻ';
      
      if (pricing.discount > 0) {
        if (discountRow) discountRow.style.display = 'flex';
        if (discountAmountEl) discountAmountEl.textContent = '-' + pricing.discount.toLocaleString('vi-VN') + '₫';
      } else {
        if (discountRow) discountRow.style.display = 'none';
      }
    }
  }
  
  console.log('✅ Cart UI updated');
}

function renderCartPhotos() {
  const cartGrid = document.getElementById('cartPhotosGrid');
  if (!cartGrid) return;
  if (typeof stateManager === 'undefined' || typeof dataManager === 'undefined') return;
  if (!stateManager.state || !stateManager.state.selectedPhotos) return;
  
  const selectedPhotoIds = Array.from(stateManager.state.selectedPhotos);
  console.log('🛒 Rendering cart photos:', selectedPhotoIds);
  
  const allPhotos = dataManager.getAllPhotos();
  const selectedPhotos = allPhotos.filter(p => selectedPhotoIds.includes(p.id));
  
  console.log('🛒 Found photos to render:', selectedPhotos.length);
  
  cartGrid.innerHTML = selectedPhotos.map(photo => {
    const imageUrl = photo.url || `https://images.unsplash.com/photo-${1500000000000 + photo.id * 1000000}?w=800&h=1000&fit=crop`;
    
    return `
      <div class="photo-card selected">
        <div class="photo-image" style="background-image: url('${imageUrl}');" onclick="appManager.showLightbox(${photo.id})">
          <div class="photo-watermark">DEMO WATERMARK</div>
        </div>
        <div class="photo-badge">${photo.similarity}%</div>
        ${photo.warning ? `<div class="photo-warning"><i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i> Hết hạn ${photo.warning}</div>` : ''}
        <button class="btn btn-danger btn-sm" onclick="stateManager.togglePhoto(${photo.id})" style="position: absolute; top: 8px; right: 8px; z-index: 10; padding: 4px 8px;">
          × Xóa
        </button>
      </div>
    `;
  }).join('');
  
  // Initialize Lucide icons for warning icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}
