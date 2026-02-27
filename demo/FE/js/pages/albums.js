// Albums Page Script
console.log('✅ Albums page script loaded');

// Initialize when page is ready and managers are available
function initAlbumsPage() {
  if (typeof dataManager === 'undefined' || !dataManager.data) return;
  
  // Render albums list
  const albumsList = document.getElementById('albums-list');
  if (albumsList && typeof uiManager !== 'undefined') {
    uiManager.renderAlbums('albums-list');
  }
}

// Listen for when the app is fully initialized
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAlbumsPage, 100);
  });
} else {
  setTimeout(initAlbumsPage, 100);
}
