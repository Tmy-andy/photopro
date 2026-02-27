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
  
  if (!document.getElementById('cartPhotosGrid')) {
    console.log('⚠️ cartPhotosGrid not found');
    return;
  }
  
  if (typeof stateManager === 'undefined' || !stateManager.state || !stateManager.state.selectedPhotos) {
    console.log('⚠️ stateManager not ready');
    return;
  }
  
  if (typeof uiManager === 'undefined') {
    console.log('⚠️ uiManager not ready');
    return;
  }
  
  // Use uiManager to update cart page
  console.log('✅ Calling uiManager.updateCartPage()');
  uiManager.updateCartPage();
  
  console.log('✅ Cart UI updated via uiManager');
}
