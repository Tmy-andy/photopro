// Face Search Page Script
console.log('✅ Face search page script loaded');

// Initialize page-specific functionality when page loads
function initFaceSearchPage() {
  if (typeof dataManager === 'undefined' || !dataManager.data) return;
  
  // Render album checkboxes for specific search
  renderAlbumCheckboxes();
}

// Call init after app is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initFaceSearchPage, 100);
  });
} else {
  setTimeout(initFaceSearchPage, 100);
}

function renderAlbumCheckboxes() {
  const container = document.getElementById('albumCheckboxes');
  if (!container || !dataManager.data) return;
  
  const albums = dataManager.getAlbums();
  container.innerHTML = albums.map(album => `
    <label style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 6px; transition: background 0.2s;">
      <input type="checkbox" value="${album.id}" onchange="stateManager.toggleAlbumFilter('${album.id}')">
      <span>${album.icon} ${album.name}</span>
    </label>
  `).join('');
}
