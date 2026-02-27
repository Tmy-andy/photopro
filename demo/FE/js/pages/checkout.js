// Checkout Page Script
console.log('✅ Checkout page script loaded');

// Initialize checkout page
function initCheckoutPage() {
  console.log('💳 initCheckoutPage called');
  
  if (typeof stateManager === 'undefined' || typeof dataManager === 'undefined') {
    console.warn('⚠️ Managers not ready, retrying checkout init...');
    setTimeout(initCheckoutPage, 100);
    return;
  }
  
  updateCheckoutSummary();
  
  // Restore customer info if exists
  if (stateManager.customerInfo) {
    const phoneInput = document.getElementById('customerPhone');
    const emailInput = document.getElementById('customerEmail');
    const nameInput = document.getElementById('customerName');
    
    if (phoneInput && stateManager.customerInfo.phone) {
      phoneInput.value = stateManager.customerInfo.phone;
    }
    if (emailInput && stateManager.customerInfo.email) {
      emailInput.value = stateManager.customerInfo.email;
    }
    if (nameInput && stateManager.customerInfo.name) {
      nameInput.value = stateManager.customerInfo.name;
    }
  }
  
  // Subscribe to state changes
  stateManager.subscribe(() => {
    updateCheckoutSummary();
  });
  
  console.log('✅ Checkout initialized');
}

// Delay initialization
setTimeout(initCheckoutPage, 200);

function updateCheckoutSummary() {
  console.log('💳 updateCheckoutSummary called');
  
  if (typeof stateManager === 'undefined' || typeof dataManager === 'undefined') return;
  if (!stateManager.state || !stateManager.state.selectedPhotos || !dataManager.data) return;
  if (typeof uiManager === 'undefined') return;
  
  const selectedCount = stateManager.state.selectedPhotos.size;
  console.log('💳 Selected photos in checkout:', selectedCount);
  
  const pricing = dataManager.calculatePricing(selectedCount);
  
  if (!pricing) return;
  
  // Update counts
  const photoCountEl = document.getElementById('checkoutPhotoCount');
  if (photoCountEl) photoCountEl.textContent = selectedCount;
  
  // Update prices
  const subtotalEl = document.getElementById('checkoutSubtotal');
  if (subtotalEl) subtotalEl.textContent = pricing.originalPrice.toLocaleString('vi-VN') + '₫';
  
  const totalEl = document.getElementById('checkoutTotal');
  if (totalEl) totalEl.textContent = pricing.finalPrice.toLocaleString('vi-VN') + '₫';
  
  // Update package list
  const packageListEl = document.getElementById('checkoutPackageList');
  
  if (packageListEl) {
    if (selectedCount === 0 || !pricing.packages || pricing.packages.length === 0) {
      packageListEl.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px;">Chưa có</div>';
    } else {
      packageListEl.innerHTML = pricing.packages.map(pkg => {
        const isSingles = pkg.tier.name === 'Ảnh lẻ';
        const itemClass = isSingles ? 'package-item singles' : 'package-item';
        const displayName = isSingles ? `${pkg.count} ảnh lẻ` : `${pkg.tier.name} × ${pkg.count}`;
        
        return `
          <div class="${itemClass}">
            <span class="package-item-name">${displayName}</span>
            <span class="package-item-price">${pkg.totalPrice.toLocaleString('vi-VN')}₫</span>
          </div>
        `;
      }).join('');
    }
  }
  
  // Discount
  const discountRow = document.getElementById('checkoutDiscountRow');
  const discountEl = document.getElementById('checkoutDiscount');
  
  if (pricing.discount > 0) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountEl) discountEl.textContent = '-' + pricing.discount.toLocaleString('vi-VN') + '₫';
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }
  
  console.log('✅ Checkout summary updated');
}


