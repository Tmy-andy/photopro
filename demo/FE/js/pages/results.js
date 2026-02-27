// Results Page Script
console.log('✅ Results page script loaded');

// Initialize page when loaded
function initResultsPage() {
  console.log('🎬 initResultsPage called');
  console.log('📦 stateManager exists:', typeof stateManager !== 'undefined');
  
  if (typeof stateManager !== 'undefined') {
    console.log('✅ Subscribing to state changes');
    stateManager.subscribe(() => {
      console.log('🔔 State changed! Updating results UI...');
      updateResultsUI();
    });
  } else {
    console.warn('⚠️ stateManager not ready, retrying...');
    setTimeout(initResultsPage, 100);
    return;
  }
  
  // Render initial results
  renderSearchResults();
}

// Delay initialization
setTimeout(initResultsPage, 200);

function renderSearchResults() {
  console.log('🎬 renderSearchResults called');
  console.log('📦 Checking dependencies:', {
    dataManager: typeof dataManager,
    dataManager_data: !!dataManager?.data,
    stateManager: typeof stateManager,
    appManager: typeof appManager
  });
  
  if (!dataManager || !dataManager.data) {
    console.log('⏳ Waiting for data...');
    setTimeout(renderSearchResults, 100);
    return;
  }
  
  const resultsContainer = document.getElementById('resultsContainer');
  const emptyResults = document.getElementById('emptyResults');
  const totalPhotosEl = document.getElementById('totalPhotos');
  
  console.log('🎨 DOM elements:', {
    resultsContainer: !!resultsContainer,
    emptyResults: !!emptyResults,
    totalPhotosEl: !!totalPhotosEl
  });
  
  if (!resultsContainer) return;
  
  // Get all photos
  const allPhotos = getAllPhotosFromResults();
  
  if (allPhotos.length === 0) {
    resultsContainer.style.display = 'none';
    if (emptyResults) emptyResults.style.display = 'block';
    return;
  }
  
  resultsContainer.style.display = 'block';
  if (emptyResults) emptyResults.style.display = 'none';
  if (totalPhotosEl) totalPhotosEl.textContent = allPhotos.length;
  
  // Group photos by album
  const photosByAlbum = {
    bana: dataManager.data.photos.bana || [],
    hoian: dataManager.data.photos.hoian || [],
    dragon: dataManager.data.photos.dragon || []
  };
  
  const albumNames = {
    bana: '🎡 Bà Nà Hills',
    hoian: '🏮 Hội An Ancient Town',
    dragon: '🐉 Cầu Rồng Đêm'
  };
  
  // Render grouped by album
  let html = '';
  
  Object.keys(photosByAlbum).forEach(category => {
    const photos = photosByAlbum[category];
    if (photos.length > 0) {
      html += `
        <div class="card card-padded mb-3">
          <h3 class="mb-2">${albumNames[category]}</h3>
          <div class="photo-grid">
            ${photos.map(photo => {
              const isSelected = stateManager && stateManager.isPhotoSelected(photo.id);
              const imageUrl = photo.url || `https://images.unsplash.com/photo-${1500000000000 + photo.id * 1000000}?w=800&h=1000&fit=crop`;
              
              console.log('📸 Rendering photo:', photo.id, 'URL:', imageUrl, 'Selected:', isSelected);
              
              return `
                <div class="photo-card ${isSelected ? 'selected' : ''}">
                  <div class="photo-image" style="background-image: url('${imageUrl}');" onclick="console.log('🖼️ Photo clicked:', ${photo.id}); appManager.showLightbox(${photo.id})">
                    <div class="photo-watermark">DEMO WATERMARK</div>
                  </div>
                  <div class="photo-overlay">
                    ${isSelected ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Đã chọn' : 'Click để chọn'}
                  </div>
                  <div class="photo-badge">${photo.similarity}%</div>
                  ${photo.warning ? `<div class="photo-warning"><i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i> Hết hạn ${photo.warning}</div>` : ''}
                  <div class="photo-check ${isSelected ? 'checked' : ''}" onclick="console.log('✅ Checkbox clicked:', ${photo.id}); event.stopPropagation(); stateManager.togglePhoto(${photo.id})">
                    ${isSelected ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  });
  
  resultsContainer.innerHTML = html;
  console.log('✅ Photos rendered to DOM');
  
  // Re-initialize Lucide icons after dynamic content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Update UI counts without re-rendering photos
  updateResultsCounts();
}

function updateResultsCounts() {
  if (!document.getElementById('resultsContainer')) return;
  if (typeof stateManager === 'undefined' || !stateManager.state || !stateManager.state.selectedPhotos) return;
  
  const selectedCount = stateManager.state.selectedPhotos.size;
  
  // Update counts
  const counters = ['selectedCount', 'stickySelectedCount'];
  counters.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'stickySelectedCount') {
        el.textContent = `${selectedCount} ảnh`;
      } else {
        el.textContent = selectedCount;
      }
    }
  });
  
  // Update select all checkbox
  const selectAllCheckbox = document.getElementById('selectAllPhotos');
  if (selectAllCheckbox && dataManager.data) {
    const allPhotos = getAllPhotosFromResults();
    selectAllCheckbox.checked = allPhotos.length > 0 && selectedCount === allPhotos.length;
  }
}

function updateResultsUI() {
  console.log('🔄 updateResultsUI called');
  
  const resultsContainer = document.getElementById('resultsContainer');
  console.log('📦 resultsContainer exists:', !!resultsContainer);
  
  if (!resultsContainer) {
    console.warn('⚠️ resultsContainer not found, exiting');
    return;
  }
  
  console.log('📦 stateManager:', typeof stateManager);
  console.log('📦 stateManager.state:', stateManager?.state);
  console.log('📦 stateManager.state.selectedPhotos:', stateManager?.state?.selectedPhotos);
  
  if (typeof stateManager === 'undefined' || !stateManager.state || !stateManager.state.selectedPhotos) {
    console.warn('⚠️ stateManager or selectedPhotos not available, exiting');
    return;
  }
  
  const selectedCount = stateManager.state.selectedPhotos.size;
  
  console.log('📊 Selected count:', selectedCount);
  console.log('📋 Selected photos:', Array.from(stateManager.state.selectedPhotos));
  
  // Update counts
  updateResultsCounts();
  
  // Update photo cards selected state (without full re-render)
  console.log('🎨 Updating photo cards UI...');
  const photoCards = document.querySelectorAll('.photo-card');
  console.log('📸 Found photo cards:', photoCards.length);
  
  photoCards.forEach((card, index) => {
    const checkbox = card.querySelector('.photo-check');
    
    if (!checkbox) return;
    
    // Extract photo ID from checkbox onclick attribute
    const onclickAttr = checkbox.getAttribute('onclick');
    
    const match = onclickAttr && onclickAttr.match(/togglePhoto\((\d+)\)/);
    
    if (!match) return;
    
    const photoId = parseInt(match[1]);
    const isSelected = stateManager.isPhotoSelected(photoId);
    
    console.log('  🎨 Photo', photoId, ':', isSelected ? 'SELECTED ✓' : 'not selected');
    
    // Update card class
    if (isSelected) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
    
    // Update checkbox
    if (isSelected) {
      checkbox.classList.add('checked');
      checkbox.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px;"></i>';
    } else {
      checkbox.classList.remove('checked');
      checkbox.innerHTML = '';
    }
    
    // Update overlay text
    const overlay = card.querySelector('.photo-overlay');
    if (overlay) {
      overlay.innerHTML = isSelected ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Đã chọn' : 'Click để chọn';
    }
    
    // Initialize Lucide icons for checkboxes and overlays
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  });
  
  console.log('✅ UI updated successfully');
}

function getAllPhotosFromResults() {
  if (!dataManager.data) return [];
  const photos = [];
  ['bana', 'hoian', 'dragon'].forEach(category => {
    if (dataManager.data.photos[category]) {
      photos.push(...dataManager.data.photos[category]);
    }
  });
  return photos;
}
