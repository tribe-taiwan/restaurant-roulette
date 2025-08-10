// 滑動對齊管理器 - 確保每個功能區塊完整顯示
class SnapScrollManager {
  constructor() {
    this.container = null;
    this.sections = [];
    this.currentSection = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.observers = {
      intersection: null,
      resize: null
    };
    
    this.callbacks = {
      sectionChange: [],
      scrollStart: [],
      scrollEnd: []
    };
    
    this.init();
  }
  
  init() {
    // 快速檢查是否為桌面端
    if (this.isDesktopQuick()) {
      console.log('🖥️ 桌面端檢測到，跳過滑動對齊管理器初始化');
      return;
    }
    
    // 等待DOM載入完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupSnapScroll();
      });
    } else {
      this.setupSnapScroll();
    }
    
    console.log('📜 滑動對齊管理器已初始化');
  }
  
  // 設置滑動對齊
  setupSnapScroll() {
    // 檢查是否需要滑動對齊功能
    if (this.isDesktop()) {
      console.log('🖥️ 桌面端檢測到，跳過滑動對齊設置');
      this.container = document.body; // 使用body作為容器，但不應用滑動對齊
      this.sections = []; // 桌面端不需要區塊概念
      return;
    }
    
    // 尋找或創建滑動容器（僅手機和平板）
    this.container = document.querySelector('.snap-scroll-container');
    if (!this.container) {
      this.createSnapScrollContainer();
    }
    
    // 桌面端跳過滑動相關設置
    if (!this.isDesktop()) {
      // 收集所有區塊
      this.collectSections();
      
      // 設置觀察器
      this.setupObservers();
      
      // 創建滑動指示器
      this.createScrollIndicator();
      
      // 創建滑動提示
      this.createScrollHint();
      
      // 初始化當前區塊
      this.updateCurrentSection(0);
    }
    
    // 設置事件監聽器（所有設備）
    this.setupEventListeners();
    
    // 設置初始響應式狀態
    this.updateSnapSettings();
    this.updateIndicatorVisibility();
    
    const deviceInfo = this.detectDeviceType();
    console.log(`📱 找到 ${this.sections.length} 個滑動區塊`);
    console.log(`📱 設備檢測結果:`, {
      類型: deviceInfo.type,
      螢幕: `${deviceInfo.width}×${deviceInfo.height}`,
      觸控: deviceInfo.hasTouch ? '支援' : '不支援',
      懸停: deviceInfo.hasHover ? '支援' : '不支援',
      像素比: deviceInfo.devicePixelRatio,
      方向: deviceInfo.isPortrait ? '豎屏' : '橫屏',
      UserAgent檢測: deviceInfo.userAgent,
      媒體查詢: deviceInfo.mediaQuery
    });
    console.log(`📱 滑動對齊啟用: ${this.isSnapEnabled()}`);
  }
  
  // 創建滑動容器
  createSnapScrollContainer() {
    // 獲取現有內容
    const existingContent = document.body.innerHTML;
    
    // 創建滑動容器
    this.container = document.createElement('div');
    this.container.className = 'snap-scroll-container';
    
    // 將現有內容包裝到第一個區塊中
    const firstSection = document.createElement('div');
    firstSection.className = 'snap-section snap-section--main';
    firstSection.innerHTML = `<div class="snap-section-content">${existingContent}</div>`;
    
    this.container.appendChild(firstSection);
    
    // 替換body內容
    document.body.innerHTML = '';
    document.body.appendChild(this.container);
    
    console.log('📦 已創建滑動容器');
  }
  
  // 收集所有區塊
  collectSections() {
    this.sections = Array.from(document.querySelectorAll('.snap-section'));
    
    // 如果沒有找到區塊，將主要組件轉換為區塊
    if (this.sections.length === 0) {
      this.convertComponentsToSections();
    }
    
    // 為每個區塊添加索引
    this.sections.forEach((section, index) => {
      section.dataset.sectionIndex = index;
    });
  }
  
  // 將現有組件轉換為滑動區塊
  convertComponentsToSections() {
    const components = [
      { selector: '.hero-banner, .language-selector', type: 'hero', title: '首頁' },
      { selector: '.location-manager-mobile', type: 'location', title: '位置設定' },
      { selector: '.search-settings, .garmin-distance-control', type: 'settings', title: '搜尋設定' },
      { selector: '.slot-machine, .restaurant-card', type: 'results', title: '搜尋結果' }
    ];
    
    const container = this.container || document.body;
    const newSections = [];
    
    components.forEach((comp, index) => {
      const elements = document.querySelectorAll(comp.selector);
      
      if (elements.length > 0) {
        // 創建新區塊
        const section = document.createElement('div');
        section.className = `snap-section snap-section--${comp.type}`;
        section.dataset.sectionTitle = comp.title;
        
        // 創建內容容器
        const content = document.createElement('div');
        content.className = 'snap-section-content';
        
        // 移動元素到新區塊
        elements.forEach(element => {
          content.appendChild(element);
        });
        
        section.appendChild(content);
        newSections.push(section);
      }
    });
    
    // 如果有新區塊，重新組織DOM
    if (newSections.length > 0) {
      // 清空容器
      container.innerHTML = '';
      
      // 添加新區塊
      newSections.forEach(section => {
        container.appendChild(section);
      });
      
      // 更新區塊列表
      this.sections = newSections;
      
      console.log(`🔄 已轉換 ${newSections.length} 個組件為滑動區塊`);
    }
  }
  
  // 設置觀察器
  setupObservers() {
    // 交集觀察器 - 檢測當前可見區塊
    if ('IntersectionObserver' in window) {
      this.observers.intersection = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionIndex = parseInt(entry.target.dataset.sectionIndex);
            if (sectionIndex !== this.currentSection) {
              this.updateCurrentSection(sectionIndex);
            }
          }
        });
      }, {
        root: this.container,
        threshold: [0.5],
        rootMargin: '-10% 0px -10% 0px'
      });
      
      // 觀察所有區塊
      this.sections.forEach(section => {
        this.observers.intersection.observe(section);
      });
    }
    
    // 尺寸觀察器 - 處理視窗大小變化
    if ('ResizeObserver' in window) {
      this.observers.resize = new ResizeObserver(() => {
        this.handleResize();
      });
      
      this.observers.resize.observe(this.container);
    }
  }
  
  // 設置事件監聽器
  setupEventListeners() {
    // 滾動事件
    this.container.addEventListener('scroll', (e) => {
      this.handleScroll(e);
    });
    
    // 觸控事件（所有設備）
    let touchStartY = 0;
    let touchEndY = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
    
    this.container.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY;
      this.handleSwipe(touchStartY, touchEndY);
    });
    
    // 鍵盤事件（僅手機和平板）
    document.addEventListener('keydown', (e) => {
      if (this.isSnapEnabled()) {
        this.handleKeyboard(e);
      }
    });
    
    // 滾輪事件（響應式處理）
    this.container.addEventListener('wheel', (e) => {
      this.handleWheel(e);
    });
    
    // 視窗大小變化監聽
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  // 創建滑動指示器
  createScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'snap-scroll-indicator';
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'snap-scroll-dot';
      dot.dataset.section = index;
      dot.title = section.dataset.sectionTitle || `區塊 ${index + 1}`;
      
      dot.addEventListener('click', () => {
        this.scrollToSection(index);
      });
      
      indicator.appendChild(dot);
    });
    
    document.body.appendChild(indicator);
    this.indicator = indicator;
  }
  
  // 創建滑動提示
  createScrollHint() {
    const hint = document.createElement('div');
    hint.className = 'snap-scroll-hint';
    hint.innerHTML = `
      <div class="snap-scroll-hint-icon">↓</div>
      <div>滑動瀏覽</div>
    `;
    
    // 添加到第一個區塊
    if (this.sections[0]) {
      this.sections[0].appendChild(hint);
    }
    
    // 3秒後自動隱藏
    setTimeout(() => {
      hint.style.opacity = '0';
      setTimeout(() => {
        hint.remove();
      }, 500);
    }, 3000);
  }
  
  // 處理滾動
  handleScroll(e) {
    if (!this.isScrolling) {
      this.isScrolling = true;
      this.triggerCallback('scrollStart', { section: this.currentSection });
    }
    
    // 清除之前的超時
    clearTimeout(this.scrollTimeout);
    
    // 設置新的超時
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.triggerCallback('scrollEnd', { section: this.currentSection });
    }, 150);
  }
  
  // 處理滑動手勢
  handleSwipe(startY, endY) {
    const threshold = 50;
    const diff = startY - endY;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // 向上滑動 - 下一個區塊
        this.nextSection();
      } else {
        // 向下滑動 - 上一個區塊
        this.previousSection();
      }
    }
  }
  
  // 處理鍵盤事件
  handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        this.nextSection();
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        this.previousSection();
        break;
      case 'Home':
        e.preventDefault();
        this.scrollToSection(0);
        break;
      case 'End':
        e.preventDefault();
        this.scrollToSection(this.sections.length - 1);
        break;
    }
  }
  
  // 處理滾輪事件（響應式）
  handleWheel(e) {
    // 桌面端：允許正常滾動
    if (!this.isSnapEnabled()) {
      return; // 不攔截滾輪事件
    }
    
    // 手機和平板端：滑動對齊邏輯
    if (this.isScrolling) {
      e.preventDefault();
      return;
    }
    
    const delta = e.deltaY;
    const threshold = 10;
    
    if (Math.abs(delta) > threshold) {
      e.preventDefault();
      
      if (delta > 0) {
        this.nextSection();
      } else {
        this.previousSection();
      }
    }
  }
  
  // 處理視窗大小變化
  handleResize() {
    // 重新計算區塊位置
    this.updateSectionPositions();
    
    // 根據新的螢幕大小調整滑動對齊設定
    this.updateSnapSettings();
    
    // 更新指示器顯示
    this.updateIndicatorVisibility();
    
    // 確保當前區塊仍然可見（僅在滑動對齊啟用時）
    if (this.isSnapEnabled()) {
      setTimeout(() => {
        this.scrollToSection(this.currentSection, false);
      }, 100);
    }
  }
  
  // 更新滑動對齊設定
  updateSnapSettings() {
    if (!this.container) return;
    
    if (this.isDesktop()) {
      // 桌面端：禁用滑動對齊
      this.container.style.scrollSnapType = 'none';
      this.container.style.height = 'auto';
    } else if (this.isTablet()) {
      // 平板端：寬鬆滑動對齊
      this.container.style.scrollSnapType = 'y proximity';
      this.container.style.height = 'auto';
    } else {
      // 手機端：強制滑動對齊
      this.container.style.scrollSnapType = 'y mandatory';
      this.container.style.height = '100vh';
    }
  }
  
  // 更新指示器可見性
  updateIndicatorVisibility() {
    if (this.indicator) {
      if (this.isDesktop()) {
        this.indicator.style.display = 'none';
      } else {
        this.indicator.style.display = 'flex';
      }
    }
  }
  
  // 更新區塊位置
  updateSectionPositions() {
    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      section.dataset.position = rect.top;
    });
  }
  
  // 滾動到指定區塊
  scrollToSection(index, smooth = true) {
    if (index < 0 || index >= this.sections.length) {
      return;
    }
    
    const section = this.sections[index];
    const containerRect = this.container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    
    const scrollTop = this.container.scrollTop + sectionRect.top - containerRect.top;
    
    if (smooth) {
      this.container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    } else {
      this.container.scrollTop = scrollTop;
    }
    
    this.updateCurrentSection(index);
  }
  
  // 下一個區塊
  nextSection() {
    const nextIndex = Math.min(this.currentSection + 1, this.sections.length - 1);
    if (nextIndex !== this.currentSection) {
      this.scrollToSection(nextIndex);
    }
  }
  
  // 上一個區塊
  previousSection() {
    const prevIndex = Math.max(this.currentSection - 1, 0);
    if (prevIndex !== this.currentSection) {
      this.scrollToSection(prevIndex);
    }
  }
  
  // 更新當前區塊
  updateCurrentSection(index) {
    const oldSection = this.currentSection;
    this.currentSection = index;
    
    // 更新指示器
    if (this.indicator) {
      const dots = this.indicator.querySelectorAll('.snap-scroll-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
    
    // 更新區塊狀態
    this.sections.forEach((section, i) => {
      section.classList.toggle('active', i === index);
    });
    
    // 觸發回調
    if (oldSection !== index) {
      this.triggerCallback('sectionChange', {
        from: oldSection,
        to: index,
        section: this.sections[index]
      });
      
      console.log(`📍 切換到區塊 ${index + 1}/${this.sections.length}`);
    }
  }
  
  // 添加新區塊
  addSection(element, type = 'custom', title = '') {
    const section = document.createElement('div');
    section.className = `snap-section snap-section--${type}`;
    section.dataset.sectionTitle = title;
    section.dataset.sectionIndex = this.sections.length;
    
    const content = document.createElement('div');
    content.className = 'snap-section-content';
    content.appendChild(element);
    
    section.appendChild(content);
    this.container.appendChild(section);
    
    this.sections.push(section);
    
    // 重新設置觀察器
    if (this.observers.intersection) {
      this.observers.intersection.observe(section);
    }
    
    // 更新指示器
    this.updateIndicator();
    
    console.log(`➕ 已添加新區塊: ${title}`);
  }
  
  // 移除區塊
  removeSection(index) {
    if (index < 0 || index >= this.sections.length) {
      return;
    }
    
    const section = this.sections[index];
    
    // 停止觀察
    if (this.observers.intersection) {
      this.observers.intersection.unobserve(section);
    }
    
    // 移除DOM元素
    section.remove();
    
    // 更新區塊列表
    this.sections.splice(index, 1);
    
    // 重新設置索引
    this.sections.forEach((section, i) => {
      section.dataset.sectionIndex = i;
    });
    
    // 調整當前區塊索引
    if (this.currentSection >= index) {
      this.currentSection = Math.max(0, this.currentSection - 1);
    }
    
    // 更新指示器
    this.updateIndicator();
    
    console.log(`➖ 已移除區塊 ${index}`);
  }
  
  // 更新指示器
  updateIndicator() {
    if (!this.indicator) return;
    
    // 重新創建指示器
    this.indicator.innerHTML = '';
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'snap-scroll-dot';
      dot.dataset.section = index;
      dot.title = section.dataset.sectionTitle || `區塊 ${index + 1}`;
      
      if (index === this.currentSection) {
        dot.classList.add('active');
      }
      
      dot.addEventListener('click', () => {
        this.scrollToSection(index);
      });
      
      this.indicator.appendChild(dot);
    });
  }
  
  // 註冊回調
  onSectionChange(callback) {
    this.callbacks.sectionChange.push(callback);
  }
  
  onScrollStart(callback) {
    this.callbacks.scrollStart.push(callback);
  }
  
  onScrollEnd(callback) {
    this.callbacks.scrollEnd.push(callback);
  }
  
  // 觸發回調
  triggerCallback(type, data) {
    this.callbacks[type].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`回調執行錯誤 (${type}):`, error);
      }
    });
  }
  
  // 綜合設備檢測
  detectDeviceType() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 檢查 User Agent 中的設備標識
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    const isDesktopUA = !isMobileUA && !isTabletUA;
    
    // 檢查媒體查詢
    const isMobileMedia = window.matchMedia('(max-width: 767px)').matches;
    const isTabletMedia = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
    const isDesktopMedia = window.matchMedia('(min-width: 1024px)').matches;
    
    // 檢查觸控能力
    const hasTouchOnly = hasTouch && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    // 檢查方向和比例
    const isPortrait = height > width;
    const aspectRatio = width / height;
    
    // 綜合判斷邏輯
    let deviceType = 'desktop';
    
    // 手機判斷：小螢幕 + 觸控 + 移動端 UA + 豎屏傾向
    if ((width < 768 || isMobileUA) && hasTouch && !isTabletUA) {
      deviceType = 'mobile';
    }
    // 平板判斷：中等螢幕 + 觸控 + 平板 UA 或 大螢幕觸控設備
    else if (((width >= 768 && width < 1024) || isTabletUA) && hasTouch && !hasHover) {
      deviceType = 'tablet';
    }
    // 桌面判斷：大螢幕 + 滑鼠懸停 + 非觸控主要操作
    else if (width >= 1024 && hasHover && !hasTouchOnly) {
      deviceType = 'desktop';
    }
    // 混合設備（如 Surface）：根據螢幕大小和主要交互方式
    else if (hasTouch && hasHover) {
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width < 1024) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop'; // 大螢幕觸控設備當作桌面處理
      }
    }
    
    return {
      type: deviceType,
      width: width,
      height: height,
      hasTouch: hasTouch,
      hasHover: hasHover,
      hasTouchOnly: hasTouchOnly,
      devicePixelRatio: devicePixelRatio,
      isPortrait: isPortrait,
      aspectRatio: aspectRatio,
      userAgent: {
        isMobile: isMobileUA,
        isTablet: isTabletUA,
        isDesktop: isDesktopUA
      },
      mediaQuery: {
        isMobile: isMobileMedia,
        isTablet: isTabletMedia,
        isDesktop: isDesktopMedia
      }
    };
  }
  
  // 檢查滑動對齊是否啟用
  isSnapEnabled() {
    const device = this.detectDeviceType();
    // 手機端：完全啟用
    // 平板端：部分啟用
    // 桌面端：禁用
    return device.type !== 'desktop';
  }
  
  // 檢查是否為手機端
  isMobile() {
    return this.detectDeviceType().type === 'mobile';
  }
  
  // 檢查是否為平板端
  isTablet() {
    return this.detectDeviceType().type === 'tablet';
  }
  
  // 檢查是否為桌面端
  isDesktop() {
    return this.detectDeviceType().type === 'desktop';
  }
  
  // 快速檢查桌面端（避免重複計算）
  isDesktopQuick() {
    return window.innerWidth >= 1024 && window.matchMedia('(hover: hover)').matches;
  }
  
  // 獲取當前狀態
  getCurrentState() {
    const deviceInfo = this.detectDeviceType();
    
    return {
      currentSection: this.currentSection,
      totalSections: this.sections.length,
      isScrolling: this.isScrolling,
      sectionTitle: this.sections[this.currentSection]?.dataset.sectionTitle || '',
      snapEnabled: this.isSnapEnabled(),
      deviceInfo: deviceInfo
    };
  }
  
  // 啟用/禁用滑動對齊
  setEnabled(enabled) {
    if (enabled) {
      this.container.style.scrollSnapType = 'y mandatory';
      this.container.classList.remove('snap-disabled');
    } else {
      this.container.style.scrollSnapType = 'none';
      this.container.classList.add('snap-disabled');
    }
  }
  
  // 銷毀管理器
  destroy() {
    // 清理觀察器
    if (this.observers.intersection) {
      this.observers.intersection.disconnect();
    }
    
    if (this.observers.resize) {
      this.observers.resize.disconnect();
    }
    
    // 清理事件監聽器
    this.container.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('keydown', this.handleKeyboard);
    
    // 移除指示器
    if (this.indicator) {
      this.indicator.remove();
    }
    
    // 清理超時
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    console.log('🛑 滑動對齊管理器已銷毀');
  }
}

// 創建全局滑動對齊管理器實例
window.SnapScrollManager = new SnapScrollManager();

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SnapScrollManager;
}