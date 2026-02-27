/**
 * PhotoPro — App Manager
 * Quản lý các tính năng chính của app
 */

class AppManager {
  constructor(dataManager, stateManager, uiManager) {
    this.data = dataManager;
    this.state = stateManager;
    this.ui = uiManager;
  }

  /**
   * Update search scope
   */
  updateSearchScope(scope) {
    const specificAlbumsDiv = document.getElementById('specificAlbums');

    if (scope === 'specific' && specificAlbumsDiv) {
      specificAlbumsDiv.style.display = 'block';
    } else if (specificAlbumsDiv) {
      specificAlbumsDiv.style.display = 'none';
    }

    this.state.setSearchScope(scope);
  }

  /**
   * Toggle tag selection
   */
  toggleTag(element) {
    element.classList.toggle('active');
    const tagText = element.textContent.trim();
    this.state.toggleTag(tagText);
  }

  /**
   * Start camera
   */
  startCamera(event) {
    if (event) event.stopPropagation();
    
    // Create camera interface
    const faceSearchBox = document.querySelector('.face-search-box');
    if (!faceSearchBox) return;
    
    // Replace content with camera UI
    faceSearchBox.innerHTML = `
      <div class="camera-container">
        <!-- Camera controls -->
        <div class="camera-controls">
          <button class="camera-control-btn" onclick="appManager.switchCamera()" title="Đổi camera">
            <i data-lucide="refresh-cw"></i>
          </button>
          <button class="camera-control-btn" onclick="appManager.closeCamera()" title="Đóng camera">
            ✕
          </button>
        </div>
        
        <!-- Video stream -->
        <video id="cameraVideo" class="camera-video" autoplay playsinline></video>
        
        <!-- Face scanner overlay -->
        <div class="face-scanner-overlay">
          <!-- Scanner frame with corners -->
          <div class="scanner-frame">
            <div class="scanner-corner top-left"></div>
            <div class="scanner-corner top-right"></div>
            <div class="scanner-corner bottom-left"></div>
            <div class="scanner-corner bottom-right"></div>
          </div>
          
          <!-- Scanning line -->
          <div class="scanner-line"></div>
          
          <!-- Grid overlay -->
          <div class="scanner-grid"></div>
          
          <!-- Face detection points -->
          <div class="face-points" id="facePoints"></div>
          
          <!-- Status indicator -->
          <div class="scanner-status" id="scannerStatus">
            <div class="status-spinner"></div>
            <span>Đang tìm khuôn mặt...</span>
          </div>
        </div>
      </div>
      
      <div class="mt-3" style="text-align: center;">
        <p style="font-size: 14px; color: var(--text-secondary);">
          <i data-lucide="lightbulb" style="width: 16px; height: 16px;"></i> Di chuyển khuôn mặt vào khung hình và giữ yên - Hệ thống sẽ tự động chụp
        </p>
      </div>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Initialize camera
    this.initializeCamera();
  }
  
  /**
   * Initialize camera stream
   */
  async initializeCamera() {
    try {
      const video = document.getElementById('cameraVideo');
      if (!video) return;
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.cameraFacing || 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      video.srcObject = stream;
      this.currentStream = stream;
      
      // Simulate face detection after 1.5 seconds
      setTimeout(() => {
        this.simulateFaceDetection();
      }, 1500);
      
    } catch (error) {
      console.error('Camera error:', error);
      alert('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.');
      this.closeCamera();
    }
  }
  
  /**
   * Simulate face detection
   */
  simulateFaceDetection() {
    const statusEl = document.getElementById('scannerStatus');
    const facePointsEl = document.getElementById('facePoints');
    
    if (!statusEl || !facePointsEl) return;
    
    // Update status
    statusEl.className = 'scanner-status detecting';
    statusEl.innerHTML = `
      <div class="status-spinner"></div>
      <span>Đã phát hiện khuôn mặt!</span>
    `;
    
    // Add face detection points (simulating facial landmarks)
    const points = [
      { x: 40, y: 30 },   // Left eye
      { x: 60, y: 30 },   // Right eye
      { x: 50, y: 50 },   // Nose
      { x: 40, y: 65 },   // Left mouth corner
      { x: 60, y: 65 },   // Right mouth corner
      { x: 20, y: 40 },   // Left face
      { x: 80, y: 40 },   // Right face
      { x: 50, y: 10 },   // Top of face
    ];
    
    facePointsEl.innerHTML = points.map((point, i) => `
      <div class="face-point" style="
        left: ${point.x}%;
        top: ${point.y}%;
        animation-delay: ${i * 0.1}s;
      "></div>
    `).join('');
    
    // Show success after 2 seconds
    setTimeout(() => {
      statusEl.className = 'scanner-status success';
      statusEl.innerHTML = `
        <span><i data-lucide="check" style="width: 20px; height: 20px;"></i> Nhận diện thành công!</span>
      `;
      
      // Re-initialize Lucide icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      
      // Auto-capture and search after 1 more second
      setTimeout(() => {
        this.autoCaptureAndSearch();
      }, 1000);
    }, 2000);
  }
  
  /**
   * Auto capture and search when face is detected
   */
  autoCaptureAndSearch() {
    const video = document.getElementById('cameraVideo');
    if (!video) return;
    
    console.log('🤖 Auto-capturing face and searching...');
    
    // Create canvas to capture frame (not displayed, just for simulation)
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    // Stop camera
    this.closeCamera();
    
    // Show loading and go to search results
    setTimeout(() => {
      this.simulateFaceSearch();
    }, 300);
  }
  
  /**
   * Switch camera (front/back)
   */
  async switchCamera() {
    // Stop current stream
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
    }
    
    // Toggle facing mode
    this.cameraFacing = this.cameraFacing === 'user' ? 'environment' : 'user';
    
    // Reinitialize camera
    await this.initializeCamera();
  }
  
  /**
   * Capture photo from camera
   */
  capturePhoto() {
    const video = document.getElementById('cameraVideo');
    if (!video) return;
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    // Flip horizontally to match mirror view
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    // Stop camera
    this.closeCamera();
    
    // Show loading and simulate face search
    setTimeout(() => {
      this.simulateFaceSearch();
    }, 500);
  }
  
  /**
   * Close camera
   */
  closeCamera() {
    // Stop all tracks
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    
    // Restore original UI
    const faceSearchBox = document.querySelector('.face-search-box');
    if (!faceSearchBox) return;
    
    faceSearchBox.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 64px;" class="mb-2"><i data-lucide="camera" style="width: 64px; height: 64px; stroke-width: 1.5;"></i></div>
        <h3 class="mb-1">Chụp hoặc tải ảnh khuôn mặt</h3>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
          AI sẽ tìm tất cả ảnh có khuôn mặt của bạn
        </p>
        
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="appManager.startCamera()">
            <i data-lucide="video"></i> Mở Camera
          </button>
          <button class="btn btn-outline" onclick="document.getElementById('faceUpload').click()">
            <i data-lucide="image"></i> Chọn Ảnh
          </button>
        </div>
        
        <input type="file" id="faceUpload" accept="image/*" style="display: none;" onchange="appManager.handleFileUpload(event)">
        
        <div class="mt-3" style="padding-top: 24px; border-top: 1px solid var(--border);">
          <p style="font-size: 14px; color: var(--text-secondary);">
            <i data-lucide="lightbulb" style="width: 16px; height: 16px;"></i> <strong>Mẹo:</strong> Sử dụng ảnh mặt rõ nét, nhìn thẳng để kết quả tốt nhất
          </p>
        </div>
      </div>
    `;
    
    // Re-initialize Lucide icons after dynamic content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * Handle file upload
   */
  handleFileUpload(input) {
    if (input.files && input.files[0]) {
      this.simulateFaceSearch();
    }
  }

  /**
   * Simulate face search with AI
   */
  simulateFaceSearch() {
    const steps = [
      { text: 'Đang phát hiện khuôn mặt...', subtext: 'AI đang phân tích ảnh của bạn', duration: 800 },
      { text: 'Đang trích xuất đặc trưng...', subtext: 'Tạo vector embedding', duration: 600 },
      { text: 'Đang tìm kiếm trong 1,800 ảnh...', subtext: 'So sánh với database', duration: 900 },
      { text: 'Đang sắp xếp kết quả...', subtext: 'Tìm thấy 18 ảnh khớp', duration: 400 }
    ];

    let currentStep = 0;

    const nextStep = () => {
      if (currentStep < steps.length) {
        this.ui.showLoading(steps[currentStep].text, steps[currentStep].subtext);

        setTimeout(() => {
          currentStep++;
          nextStep();
        }, steps[currentStep].duration);
      } else {
        this.ui.hideLoading();
        navigationManager.goToPage('results');
      }
    };

    nextStep();
  }

  /**
   * Toggle email input
   */
  toggleEmailInput() {
    const checkbox = document.getElementById('email-checkbox');
    const emailGroup = document.getElementById('email-group');

    if (checkbox && emailGroup) {
      if (checkbox.checked) {
        emailGroup.classList.remove('hidden');
      } else {
        emailGroup.classList.add('hidden');
      }
    }
  }

  /**
   * Process payment
   */
  processPayment() {
    console.log('💳 processPayment called');
    
    const phoneInput = document.getElementById('customerPhone');
    const emailInput = document.getElementById('customerEmail');
    const nameInput = document.getElementById('customerName');
    const phone = phoneInput?.value;
    const email = emailInput?.value;
    const name = nameInput?.value;

    console.log('📞 Phone:', phone);
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);

    if (!phone) {
      alert('Vui lòng nhập số điện thoại!');
      phoneInput?.focus();
      return;
    }

    // Validate phone
    if (!/^0[0-9]{9}$/.test(phone)) {
      alert('Số điện thoại không hợp lệ! Vui lòng nhập 10 số bắt đầu bằng 0');
      phoneInput?.focus();
      return;
    }
    
    // Check if any photos selected
    if (!this.state.state.selectedPhotos || this.state.state.selectedPhotos.size === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh!');
      navigationManager.goToPage('results');
      return;
    }

    // Save customer info
    this.state.setCustomerInfo({
      phone,
      email: email || '',
      name: name || ''
    });
    
    console.log('✅ Customer info saved');
    
    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'momo';
    const photoCount = this.state.state.selectedPhotos.size;
    const pricing = this.data.calculatePricing(photoCount);
    
    // Show QR modal for MoMo and Banking
    if (paymentMethod === 'momo' || paymentMethod === 'banking') {
      this.showQRModal(paymentMethod, pricing.finalPrice, phone);
      return;
    }

    // For card and cash, proceed directly
    this.completePayment(phone, email, name, paymentMethod, photoCount, pricing);
  }
  
  /**
   * Show QR payment modal
   */
  showQRModal(method, amount, phone) {
    console.log('📱 showQRModal:', method, amount);
    
    const modal = document.getElementById('qrModal');
    const title = document.getElementById('qrModalTitle');
    const qrAmount = document.getElementById('qrAmount');
    const qrContent = document.getElementById('qrContent');
    
    if (!modal) return;
    
    // Update modal content
    if (title) {
      title.textContent = method === 'momo' ? 'Thanh toán MoMo' : 'Chuyển khoản Ngân hàng';
    }
    
    if (qrAmount) {
      qrAmount.textContent = amount.toLocaleString('vi-VN') + '₫';
    }
    
    const orderCode = 'WL' + Math.floor(1000 + Math.random() * 9000);
    if (qrContent) {
      qrContent.textContent = orderCode;
    }
    
    // Store for later use
    this.pendingPayment = {
      method,
      amount,
      phone,
      orderCode
    };
    
    modal.style.display = 'flex';
    
    // Start countdown timer (5 minutes = 300 seconds)
    this.startPaymentTimer(300);
    
    // Start auto-check payment (simulate checking every 3 seconds)
    this.startPaymentCheck();
  }
  
  /**
   * Start payment countdown timer
   */
  startPaymentTimer(seconds) {
    const timerEl = document.getElementById('qrTimer');
    if (!timerEl) return;
    
    let remaining = seconds;
    
    // Clear existing timer if any
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
    }
    
    // Update timer display
    const updateTimer = () => {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      if (remaining <= 0) {
        clearInterval(this.paymentTimer);
        this.closeQRModal();
        uiManager.showNotification('⏱️ Hết thời gian thanh toán. Vui lòng thử lại.', 'error');
      }
      remaining--;
    };
    
    updateTimer(); // Initial display
    this.paymentTimer = setInterval(updateTimer, 1000);
  }
  
  /**
   * Start checking payment status (simulated auto-verify)
   */
  startPaymentCheck() {
    const statusEl = document.getElementById('qrStatus');
    if (!statusEl) return;
    
    let checkCount = 0;
    
    // Clear existing check if any
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }
    
    console.log('🔄 Starting payment verification...');
    
    // Simulate payment verification (in real app, this would call backend API)
    this.paymentCheckInterval = setInterval(() => {
      checkCount++;
      console.log('🔍 Checking payment status... attempt', checkCount);
      
      // Simulate: Auto-confirm after 5-15 seconds (random between 2-5 checks)
      const autoConfirmAfter = Math.floor(Math.random() * 4) + 2; // 2-5 checks = 6-15 seconds
      
      if (checkCount >= autoConfirmAfter) {
        // Payment detected!
        console.log('✅ Payment verified!');
        
        clearInterval(this.paymentCheckInterval);
        clearInterval(this.paymentTimer);
        
        // Update status to success
        statusEl.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 32px;"><i data-lucide="check-circle" style="width: 32px; height: 32px; color: var(--success, #059669);"></i></span>
            <span style="font-weight: 600; color: var(--success, #059669);">Thanh toán thành công!</span>
          </div>
          <p style="margin: 0; font-size: 14px; color: var(--text-secondary);">
            Đang xử lý đơn hàng...
          </p>
        `;
        statusEl.style.background = 'var(--success-light, #d1fae5)';
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        statusEl.style.borderColor = 'var(--success, #059669)';
        
        // Auto-confirm payment after showing success message
        setTimeout(() => {
          this.confirmQRPayment();
        }, 1500);
      }
    }, 3000); // Check every 3 seconds
  }
  
  /**
   * Close QR modal
   */
  closeQRModal() {
    const modal = document.getElementById('qrModal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Clear all timers and intervals
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
      this.paymentTimer = null;
    }
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
      this.paymentCheckInterval = null;
    }
    
    // Reset status display
    const statusEl = document.getElementById('qrStatus');
    if (statusEl) {
      statusEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
          <div class="spinner" style="width: 20px; height: 20px; border: 3px solid var(--info); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <span style="font-weight: 600; color: var(--info);">Đang chờ thanh toán...</span>
        </div>
        <p style="margin: 0; font-size: 14px; color: var(--text-secondary);">
          Tự động xác nhận sau khi thanh toán thành công
        </p>
        <p id="qrTimer" style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold; color: var(--info);">05:00</p>
      `;
      statusEl.style.background = 'var(--info-light, #eff6ff)';
      statusEl.style.borderColor = 'var(--info, #2563eb)';
    }
    
    this.pendingPayment = null;
  }
  
  /**
   * Confirm QR payment
   */
  confirmQRPayment() {
    console.log('✅ Payment confirmed');
    
    if (!this.pendingPayment) return;
    
    const { phone } = this.pendingPayment;
    const phoneInput = document.getElementById('customerPhone');
    const emailInput = document.getElementById('customerEmail');
    const nameInput = document.getElementById('customerName');
    const email = emailInput?.value || '';
    const name = nameInput?.value || '';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'momo';
    const photoCount = this.state.state.selectedPhotos.size;
    const pricing = this.data.calculatePricing(photoCount);
    
    this.closeQRModal();
    this.completePayment(phone, email, name, paymentMethod, photoCount, pricing);
  }
  
  /**
   * Complete payment and create order
   */
  completePayment(phone, email, name, paymentMethod, photoCount, pricing) {
    this.ui.showLoading('Đang xử lý thanh toán...', 'Vui lòng đợi');

    setTimeout(() => {
      this.ui.hideLoading();

      // Generate order info
      const orderCode = 'WL' + Math.floor(1000 + Math.random() * 9000);
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
      const expiryDate = new Date(expiryTime);

      const orderInfo = {
        code: orderCode,
        phone,
        email,
        name,
        photoCount,
        total: pricing.finalPrice,
        paymentMethod,
        expiryTime,
        expiryDate: expiryDate.toLocaleString('vi-VN'),
        downloadLink: `https://studio-abc.photopro.vn/d/${this.generateRandomString(12)}`,
        customer: {
          phone,
          email,
          name
        },
        photos: Array.from(this.state.state.selectedPhotos),
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      // Add order to dataManager
      if (!dataManager.data.orders) {
        dataManager.data.orders = [];
      }
      dataManager.data.orders.push(orderInfo);

      this.state.setOrderInfo(orderInfo);
      
      console.log('✅ Order created:', orderInfo);

      navigationManager.goToPage('success');
    }, 2000);
  }

  /**
   * Generate random string
   */
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Start countdown timer
   */
  startCountdown(expiryTime) {
    console.log('⏰ startCountdown called with expiryTime:', expiryTime);
    
    if (!expiryTime) {
      console.error('❌ No expiry time provided');
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = expiryTime - now;

      if (distance < 0) {
        // Expired
        document.getElementById('hoursLeft').textContent = '00';
        document.getElementById('minutesLeft').textContent = '00';
        document.getElementById('secondsLeft').textContent = '00';
        clearInterval(this.countdownInterval);
        return;
      }

      // Calculate time remaining
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Update display
      document.getElementById('hoursLeft').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutesLeft').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('secondsLeft').textContent = seconds.toString().padStart(2, '0');
    };

    // Clear existing interval if any
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Update immediately
    updateCountdown();

    // Then update every second
    this.countdownInterval = setInterval(updateCountdown, 1000);
    
    console.log('✅ Countdown started');
  }

  /**
   * Copy download link
   */
  copyDownloadLink() {
    const linkElement = document.getElementById('downloadLink');
    if (!linkElement) {
      console.error('❌ Download link element not found');
      return;
    }

    const link = linkElement.textContent;
    
    navigator.clipboard.writeText(link).then(() => {
      uiManager.showNotification('✅ Đã sao chép link tải ảnh!', 'success');
    }).catch(err => {
      console.error('Copy failed:', err);
      uiManager.showNotification('❌ Không thể sao chép. Vui lòng copy thủ công.', 'error');
    });
  }

  /**
   * Download single photo
   */
  downloadPhoto(photoId) {
    console.log('📥 Downloading photo:', photoId);
    
    if (typeof dataManager === 'undefined') {
      console.error('❌ dataManager not found');
      return;
    }
    
    const photo = dataManager.getPhotoById(photoId);
    if (!photo) {
      console.error('❌ Photo not found:', photoId);
      uiManager.showNotification('❌ Không tìm thấy ảnh', 'error');
      return;
    }
    
    // Get high quality image URL
    const imageUrl = photo.url || `https://images.unsplash.com/photo-${1500000000000 + photoId * 1000000}?w=1920&h=2400&fit=crop&q=90`;
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `photo-${photoId}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    uiManager.showNotification('✅ Đang tải ảnh...', 'success');
    console.log('✅ Download triggered for photo:', photoId);
  }

  /**
   * Download all photos
   */
  downloadAllPhotos() {
    console.log('📥 Downloading all photos');
    
    if (typeof stateManager === 'undefined' || !stateManager.state.selectedPhotos) {
      console.error('❌ No selected photos found');
      return;
    }
    
    const selectedPhotoIds = Array.from(stateManager.state.selectedPhotos);
    
    if (selectedPhotoIds.length === 0) {
      uiManager.showNotification('❌ Không có ảnh nào để tải', 'error');
      return;
    }
    
    uiManager.showNotification(`📥 Đang tải ${selectedPhotoIds.length} ảnh...`, 'info');
    
    // Download each photo with a delay to avoid overwhelming the browser
    selectedPhotoIds.forEach((photoId, index) => {
      setTimeout(() => {
        this.downloadPhoto(photoId);
      }, index * 500); // 500ms delay between downloads
    });
    
    console.log(`✅ Triggered download for ${selectedPhotoIds.length} photos`);
  }

  /**
   * Search order
   */
  searchOrder() {
    const searchInput = document.getElementById('searchInput');
    const searchTypeRadios = document.querySelectorAll('input[name="searchType"]:checked');
    
    if (!searchInput || searchTypeRadios.length === 0) {
      console.error('❌ Search form elements not found');
      return;
    }

    const searchValue = searchInput.value.trim();
    const searchType = searchTypeRadios[0].value;

    if (!searchValue) {
      uiManager.showNotification('⚠️ Vui lòng nhập thông tin tìm kiếm', 'error');
      return;
    }

    console.log('🔍 Searching order:', searchType, searchValue);

    uiManager.showLoading('Đang tìm kiếm...', 'Vui lòng đợi');

    setTimeout(() => {
      uiManager.hideLoading();
      
      if (typeof dataManager === 'undefined' || !dataManager.data || !dataManager.data.orders) {
        console.error('❌ No orders data available');
        this.showNotFoundResults();
        return;
      }

      console.log('📦 Available orders:', dataManager.data.orders);

      // Search in orders
      let order = null;
      if (searchType === 'code') {
        console.log('🔎 Searching for code:', searchValue);
        console.log('📋 Full orders data:', JSON.stringify(dataManager.data.orders, null, 2));
        console.log('📋 Orders in data:', dataManager.data.orders.map(o => ({ code: o?.code, id: o?.id, hasCode: !!o?.code, keys: Object.keys(o || {}) })));
        order = dataManager.data.orders.find(o => {
          if (!o) return false;
          const orderCode = o.code || o.id; // Support both 'code' and 'id' fields
          if (!orderCode) return false;
          const matches = orderCode === searchValue || orderCode.toLowerCase() === searchValue.toLowerCase();
          console.log(`  Checking ${orderCode} === ${searchValue}:`, matches);
          return matches;
        });
      } else {
        order = dataManager.data.orders.find(o => {
          if (!o) return false;
          const phone = o.customer?.phone || o.customerPhone; // Support both formats
          if (!phone) return false;
          return phone === searchValue;
        });
      }

      if (order) {
        console.log('✅ Order found:', order);
        this.displayOrderResults(order);
      } else {
        console.log('❌ Order not found');
        this.showNotFoundResults();
      }
    }, 1000);
  }

  /**
   * Display order search results
   */
  displayOrderResults(order) {
    // Hide not found, show results
    const notFoundEl = document.getElementById('notFoundResults');
    const resultsEl = document.getElementById('searchResults');
    
    if (notFoundEl) notFoundEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';

    // Support both data formats
    const orderCode = order.code || order.id;
    const customerPhone = order.customer?.phone || order.customerPhone;
    const customerEmail = order.customer?.email || order.customerEmail;
    const customerName = order.customer?.name || order.customerName || '';
    const photoIds = order.photos || order.photoIds || [];
    const total = order.total || order.totalAmount;
    const createdAt = order.createdAt;
    const expiryTime = order.expiryTime || new Date(order.expiresAt).getTime();
    const downloadLink = order.downloadLink;
    const status = order.status;
    const paymentMethod = order.paymentMethod;

    // Update order info
    document.getElementById('resultOrderCode').textContent = orderCode;
    document.getElementById('resultOrderDate').textContent = new Date(createdAt).toLocaleString('vi-VN');
    document.getElementById('resultOrderPhone').textContent = customerPhone;
    document.getElementById('resultPhotoCount').textContent = photoIds.length + ' ảnh';
    document.getElementById('resultTotal').textContent = total.toLocaleString('vi-VN') + '₫';
    document.getElementById('resultDownloadLink').textContent = downloadLink;

    // Calculate time remaining
    const now = new Date().getTime();
    const timeLeft = expiryTime - now;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const expiryDate = new Date(expiryTime).toLocaleString('vi-VN');
    
    document.getElementById('resultExpiry').textContent = hoursLeft > 0 
      ? `Còn ${hoursLeft} giờ (${expiryDate})`
      : 'Đã hết hạn';

    // Display status
    const statusEl = document.getElementById('resultStatus');
    if (statusEl) {
      const statusText = status === 'completed' || status === 'paid' ? 'Đã thanh toán' : 'Chờ xử lý';
      const statusClass = status === 'completed' || status === 'paid' ? 'success' : 'warning';
      statusEl.textContent = statusText;
      statusEl.className = `badge badge-${statusClass}`;
    }

    // Render photos grid
    this.renderOrderPhotos(photoIds);
    
    // Save order to state for delivery page
    stateManager.state.orderInfo = {
      code: orderCode,
      phone: customerPhone,
      email: customerEmail,
      name: customerName,
      photoCount: photoIds.length,
      total: total,
      paymentMethod: paymentMethod,
      expiryTime: order.expiryTime,
      downloadLink: order.downloadLink
    };
    
    // Set selected photos for delivery
    stateManager.state.selectedPhotos = new Set(order.photos);
  }

  /**
   * Show not found results
   */
  showNotFoundResults() {
    const notFoundEl = document.getElementById('notFoundResults');
    const resultsEl = document.getElementById('searchResults');
    
    if (notFoundEl) notFoundEl.style.display = 'block';
    if (resultsEl) resultsEl.style.display = 'none';
  }

  /**
   * Render order photos in grid
   */
  renderOrderPhotos(photoIds) {
    const grid = document.getElementById('resultPhotosGrid');
    if (!grid || typeof dataManager === 'undefined') return;

    const allPhotos = dataManager.getAllPhotos();
    const orderPhotos = allPhotos.filter(p => photoIds.includes(p.id));

    grid.innerHTML = orderPhotos.map(photo => {
      const imageUrl = photo.url || `https://images.unsplash.com/photo-${1500000000000 + photo.id * 1000000}?w=400&h=500&fit=crop`;
      return `
        <div class="photo-card">
          <img src="${imageUrl}" alt="Photo ${photo.id}" loading="lazy">
        </div>
      `;
    }).join('');
  }

  /**
   * View order (from recent orders list)
   */
  viewOrder(orderCode) {
    const searchInput = document.getElementById('searchInput');
    const codeRadio = document.querySelector('input[name="searchType"][value="code"]');
    
    if (searchInput) searchInput.value = orderCode;
    if (codeRadio) codeRadio.checked = true;
    
    this.searchOrder();
  }

  /**
   * Update time display
   */
  updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    const dateStr = now.toLocaleDateString('vi-VN');
    this.ui.updateElement('current-time', `${timeStr} • ${dateStr}`);
  }

  /**
   * Init
   */
  init() {
    // Update time
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);

    // Try to load saved state
    this.state.loadFromLocalStorage();

    // Setup lightbox keyboard controls
    document.addEventListener('keydown', (e) => {
      const lightbox = document.getElementById('lightbox');
      if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'Escape') this.closeLightbox();
        // Removed arrow key navigation
      }
    });

    // Close lightbox on backdrop click
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) this.closeLightbox();
      });
    }

    console.log('✅ App initialized successfully');
  }

  /**
   * Show photo in lightbox
   */
  showLightbox(photoId) {
    console.log('🔍 showLightbox called with photoId:', photoId);
    console.log('📦 dataManager exists:', !!this.data);
    console.log('📦 dataManager.getAllPhotos exists:', !!this.data?.getAllPhotos);
    
    const allPhotos = this.data.getAllPhotos();
    console.log('📸 All photos:', allPhotos.length);
    
    const photo = allPhotos.find(p => p.id === photoId);
    console.log('🎯 Found photo:', photo);
    
    if (!photo) {
      console.error('❌ Photo not found with ID:', photoId);
      return;
    }

    // Store current context
    const currentAlbum = this.data.getAlbumById(photo.albumId);
    console.log('📂 Album:', currentAlbum);
    
    const albumPhotos = this.data.getPhotosByAlbum(photo.albumId);
    console.log('📸 Album photos:', albumPhotos.length);
    
    this.lightboxContext = {
      photos: albumPhotos,
      currentIndex: albumPhotos.findIndex(p => p.id === photoId),
      currentPhoto: photo
    };
    
    console.log('🎬 Lightbox context:', this.lightboxContext);

    // Update lightbox UI
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');
    const counter = document.getElementById('lightbox-counter');
    const checkbox = document.getElementById('lightbox-checkbox');

    console.log('🎨 Lightbox elements:', {
      lightbox: !!lightbox,
      image: !!image,
      counter: !!counter,
      checkbox: !!checkbox
    });

    if (lightbox && image) {
      image.src = photo.url;
      counter.textContent = `${this.lightboxContext.currentIndex + 1} / ${this.lightboxContext.photos.length}`;
      checkbox.checked = this.state.isPhotoSelected(photoId);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      console.log('✅ Lightbox opened successfully');
    } else {
      console.error('❌ Lightbox elements not found');
    }
  }

  /**
   * Close lightbox
   */
  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      this.lightboxContext = null;
    }
  }

  /**
   * Navigate to next photo in lightbox
   */
  lightboxNext() {
    if (!this.lightboxContext) return;
    
    const nextIndex = (this.lightboxContext.currentIndex + 1) % this.lightboxContext.photos.length;
    const nextPhoto = this.lightboxContext.photos[nextIndex];
    this.showLightbox(nextPhoto.id);
  }

  /**
   * Navigate to previous photo in lightbox
   */
  lightboxPrev() {
    if (!this.lightboxContext) return;
    
    const prevIndex = (this.lightboxContext.currentIndex - 1 + this.lightboxContext.photos.length) % this.lightboxContext.photos.length;
    const prevPhoto = this.lightboxContext.photos[prevIndex];
    this.showLightbox(prevPhoto.id);
  }

  /**
   * Toggle photo selection from lightbox
   */
  toggleLightboxPhoto() {
    if (!this.lightboxContext) return;
    this.state.togglePhoto(this.lightboxContext.currentPhoto.id);
  }
}

// Will be initialized after all managers are ready
let appManager;
