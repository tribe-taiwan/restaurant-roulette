// 響應式布局管理器
class ResponsiveLayoutManager {
  constructor() {
    this.breakpoints = {
      xs: 320,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1200
    };
    
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.orientation = this.getOrientation();
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;
    
    this.callbacks = {
      breakpointChange: [],
      orientationChange: [],
      resize: []
    };
    
    this.resizeObserver = null;
    this.mutationObserver = null;
    this.orientationChangeTimeout = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupObservers();
    this.initializeResponsiveElements();
    this.optimizeInitialLayout();
    
    console.log('📱 響應式布局管理器已初始化');
    console.log(`當前斷點: ${this.currentBreakpoint}, 方向: ${this.orientation}`);
  }
  
  // 設置事件監聽器
  setupEventListeners() {
    // 視窗大小變化
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100); // 防抖動
    });
    
    // 方向變化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100); // 等待方向變化完成
    });
    
    // 視窗聚焦/失焦
    window.addEventListener('focus', () => {
      this.handleWindowFocus();
    });
    
    window.addEventListener('blur', () => {
      this.handleWindowBlur();
    });
  }
  
  // 設置觀察器
  setupObservers() {
    // 尺寸觀察器
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          this.handleElementResize(entry.target, entry.contentRect);
        });
      });
    }
    
    // DOM變化觀察器
    if ('MutationObserver' in window) {
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.initializeResponsiveElement(node);
              }
            });
          }
        });
      });
      
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // 初始化響應式元素
  initializeResponsiveElements() {
    // 初始化所有響應式容器
    document.querySelectorAll('.responsive-container').forEach(element => {
      this.initializeResponsiveElement(element);
    });
    
    // 初始化所有流體卡片
    document.querySelectorAll('.fluid-card').forEach(element => {
      this.optimizeCardLayout(element);
    });
    
    // 初始化所有響應式網格
    document.querySelectorAll('.responsive-grid').forEach(element => {
      this.optimizeGridLayout(element);
    });
  }
  
  // 初始化單個響應式元素
  initializeResponsiveElement(element) {
    // 添加響應式類別
    element.classList.add('responsive-initialized');
    
    // 設置初始樣式
    this.applyResponsiveStyles(element);
    
    // 觀察元素尺寸變化
    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
    }
    
    // 添加設備特定優化
    const deviceCaps = this.detectDeviceCapabilities();
    
    if (deviceCaps.hasTouch) {
      element.classList.add('touch-optimized');
    }
    
    if (deviceCaps.hasHover) {
      element.classList.add('hover-enabled');
    }
    
    if (deviceCaps.hasTouchOnly) {
      element.classList.add('touch-only');
    }
    
    // 添加瀏覽器特定類別
    if (deviceCaps.userAgent.isIOS) {
      element.classList.add('ios-device');
    }
    
    if (deviceCaps.userAgent.isAndroid) {
      element.classList.add('android-device');
    }
    
    if (deviceCaps.userAgent.isSafari) {
      element.classList.add('safari-browser');
    }
    
    // 添加性能優化
    element.classList.add('gpu-accelerated');
  }
  
  // 處理視窗大小變化
  handleResize() {
    const oldBreakpoint = this.currentBreakpoint;
    const oldOrientation = this.orientation;
    
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.orientation = this.getOrientation();
    
    // 斷點變化
    if (oldBreakpoint !== this.currentBreakpoint) {
      this.handleBreakpointChange(oldBreakpoint, this.currentBreakpoint);
    }
    
    // 方向變化 - 只在實際變化時處理
    if (oldOrientation !== this.orientation) {
      this.handleOrientationChangeInternal(oldOrientation);
    }
    
    // 更新所有響應式元素
    this.updateAllResponsiveElements();
    
    // 觸發回調
    this.callbacks.resize.forEach(callback => {
      callback({
        width: this.viewportWidth,
        height: this.viewportHeight,
        breakpoint: this.currentBreakpoint,
        orientation: this.orientation
      });
    });
  }
  
  // 處理斷點變化
  handleBreakpointChange(oldBreakpoint, newBreakpoint) {
    console.log(`📱 斷點變化: ${oldBreakpoint} → ${newBreakpoint}`);
    
    // 更新body類別
    document.body.classList.remove(`breakpoint-${oldBreakpoint}`);
    document.body.classList.add(`breakpoint-${newBreakpoint}`);
    
    // 觸發斷點變化回調
    this.callbacks.breakpointChange.forEach(callback => {
      callback(oldBreakpoint, newBreakpoint);
    });
    
    // 優化布局
    this.optimizeLayoutForBreakpoint(newBreakpoint);
  }
  
  // 處理方向變化 - 內部使用，帶防重複觸發
  handleOrientationChangeInternal(oldOrientation) {
    // 添加防抖機制，避免重複觸發
    if (this.orientationChangeTimeout) {
      clearTimeout(this.orientationChangeTimeout);
    }
    
    this.orientationChangeTimeout = setTimeout(() => {
      console.log(`🔄 方向變化: ${oldOrientation} → ${this.orientation}`);
      
      // 更新body類別
      document.body.classList.remove('portrait', 'landscape');
      document.body.classList.add(this.orientation);
      
      // 觸發方向變化回調
      this.callbacks.orientationChange.forEach(callback => {
        callback(this.orientation);
      });
      
      // 優化方向布局
      this.optimizeLayoutForOrientation(this.orientation);
      
      this.orientationChangeTimeout = null;
    }, 50); // 50ms 防抖
  }

  // 處理方向變化 - 外部調用
  handleOrientationChange() {
    const oldOrientation = this.orientation;
    this.orientation = this.getOrientation();
    
    if (oldOrientation !== this.orientation) {
      this.handleOrientationChangeInternal(oldOrientation);
    }
  }
  
  // 處理元素尺寸變化
  handleElementResize(element, rect) {
    // 更新元素的響應式樣式
    this.applyResponsiveStyles(element, rect);
    
    // 優化特定類型的元素
    if (element.classList.contains('fluid-card')) {
      this.optimizeCardLayout(element, rect);
    }
    
    if (element.classList.contains('responsive-grid')) {
      this.optimizeGridLayout(element, rect);
    }
    
    if (element.classList.contains('responsive-text')) {
      this.optimizeTextLayout(element, rect);
    }
  }
  
  // 處理視窗聚焦
  handleWindowFocus() {
    // 恢復動畫和過渡
    document.body.classList.remove('window-blurred');
    
    // 重新啟動性能監控
    if (window.PerformanceMonitor) {
      window.PerformanceMonitor.isMonitoring = true;
    }
  }
  
  // 處理視窗失焦
  handleWindowBlur() {
    // 暫停非必要動畫
    document.body.classList.add('window-blurred');
    
    // 暫停性能監控
    if (window.PerformanceMonitor) {
      window.PerformanceMonitor.isMonitoring = false;
    }
  }
  
  // 獲取當前斷點
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width >= this.breakpoints.xl) return 'xl';
    if (width >= this.breakpoints.lg) return 'lg';
    if (width >= this.breakpoints.md) return 'md';
    if (width >= this.breakpoints.sm) return 'sm';
    return 'xs';
  }
  
  // 獲取方向
  getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
  
  // 綜合設備檢測（與滑動管理器保持一致）
  detectDeviceCapabilities() {
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const hasTouchOnly = hasTouch && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 檢查 User Agent
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    
    // 檢查特殊設備
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent);
    const isFirefox = /firefox/i.test(userAgent);
    
    return {
      hasTouch,
      hasHover,
      hasTouchOnly,
      devicePixelRatio,
      userAgent: {
        isMobile: isMobileUA,
        isTablet: isTabletUA,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox
      },
      // 向後相容
      isTouchDevice: hasTouch
    };
  }
  
  // 檢查是否為觸控設備（向後相容）
  isTouchDevice() {
    return this.detectDeviceCapabilities().hasTouch;
  }
  
  // 應用響應式樣式
  applyResponsiveStyles(element, rect = null) {
    const elementRect = rect || element.getBoundingClientRect();
    const width = elementRect.width;
    
    // 應用流體間距
    this.applyFluidSpacing(element, width);
    
    // 應用流體字體
    this.applyFluidTypography(element, width);
    
    // 應用響應式布局
    this.applyResponsiveLayout(element, width);
  }
  
  // 應用流體間距
  applyFluidSpacing(element, width) {
    const baseSpacing = 16;
    const scaleFactor = Math.max(0.75, Math.min(1.25, width / 400));
    const fluidSpacing = baseSpacing * scaleFactor;
    
    if (element.classList.contains('fluid-spacing')) {
      element.style.setProperty('--dynamic-spacing', `${fluidSpacing}px`);
    }
  }
  
  // 應用流體字體
  applyFluidTypography(element, width) {
    if (!element.classList.contains('responsive-text')) return;
    
    const baseSize = 16;
    const scaleFactor = Math.max(0.8, Math.min(1.2, width / 400));
    const fluidSize = baseSize * scaleFactor;
    
    element.style.fontSize = `${fluidSize}px`;
  }
  
  // 應用響應式布局
  applyResponsiveLayout(element, width) {
    if (element.classList.contains('responsive-grid')) {
      let columns = 1;
      
      if (width >= 768) columns = 2;
      if (width >= 1024) columns = 3;
      if (width >= 1200) columns = 4;
      
      element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
  }
  
  // 優化卡片布局
  optimizeCardLayout(element, rect = null) {
    const elementRect = rect || element.getBoundingClientRect();
    const width = elementRect.width;
    const height = elementRect.height;
    
    // 動態調整內邊距
    const padding = Math.max(12, Math.min(24, width * 0.05));
    element.style.padding = `${padding}px`;
    
    // 確保在小螢幕上完整顯示
    if (this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm') {
      const maxHeight = this.viewportHeight * 0.8;
      if (height > maxHeight) {
        element.style.maxHeight = `${maxHeight}px`;
        element.style.overflowY = 'auto';
      }
    }
    
    // 添加性能優化
    element.style.contain = 'layout style paint';
  }
  
  // 優化網格布局
  optimizeGridLayout(element, rect = null) {
    const elementRect = rect || element.getBoundingClientRect();
    const width = elementRect.width;
    
    // 計算最佳列數
    const minColumnWidth = 280;
    const maxColumns = Math.floor(width / minColumnWidth);
    const columns = Math.max(1, Math.min(maxColumns, 4));
    
    element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // 動態調整間距
    const gap = Math.max(8, Math.min(24, width * 0.03));
    element.style.gap = `${gap}px`;
  }
  
  // 優化文字布局
  optimizeTextLayout(element, rect = null) {
    const elementRect = rect || element.getBoundingClientRect();
    const width = elementRect.width;
    
    // 動態調整行高
    const lineHeight = width < 400 ? 1.4 : 1.6;
    element.style.lineHeight = lineHeight;
    
    // 動態調整字間距
    const letterSpacing = width < 400 ? '0.01em' : '0.02em';
    element.style.letterSpacing = letterSpacing;
  }
  
  // 為斷點優化布局
  optimizeLayoutForBreakpoint(breakpoint) {
    // 移動端優化
    if (breakpoint === 'xs' || breakpoint === 'sm') {
      this.enableMobileOptimizations();
    } else {
      this.disableMobileOptimizations();
    }
    
    // 平板優化
    if (breakpoint === 'md') {
      this.enableTabletOptimizations();
    }
    
    // 桌面優化
    if (breakpoint === 'lg' || breakpoint === 'xl') {
      this.enableDesktopOptimizations();
    }
  }
  
  // 為方向優化布局
  optimizeLayoutForOrientation(orientation) {
    if (orientation === 'landscape' && this.viewportHeight < 600) {
      // 橫屏低高度優化
      document.body.classList.add('landscape-compact');
      this.enableCompactLayout();
    } else {
      document.body.classList.remove('landscape-compact');
      this.disableCompactLayout();
    }
  }
  
  // 啟用移動端優化
  enableMobileOptimizations() {
    document.body.classList.add('mobile-optimized');
    
    // 增加觸控區域
    document.querySelectorAll('.responsive-button').forEach(button => {
      button.style.minHeight = '48px';
      button.style.padding = '12px 16px';
    });
    
    // 優化輸入框
    document.querySelectorAll('.responsive-input').forEach(input => {
      input.style.fontSize = '16px'; // 防止iOS縮放
      input.style.minHeight = '48px';
    });
  }
  
  // 禁用移動端優化
  disableMobileOptimizations() {
    document.body.classList.remove('mobile-optimized');
  }
  
  // 啟用平板優化
  enableTabletOptimizations() {
    document.body.classList.add('tablet-optimized');
    
    // 調整網格布局
    document.querySelectorAll('.responsive-grid').forEach(grid => {
      grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    });
  }
  
  // 啟用桌面優化
  enableDesktopOptimizations() {
    document.body.classList.add('desktop-optimized');
    
    // 啟用懸停效果
    document.body.classList.add('hover-enabled');
  }
  
  // 啟用緊湊布局
  enableCompactLayout() {
    document.querySelectorAll('.fluid-card').forEach(card => {
      card.style.padding = '12px';
    });
    
    document.querySelectorAll('.responsive-button').forEach(button => {
      button.style.minHeight = '40px';
    });
  }
  
  // 禁用緊湊布局
  disableCompactLayout() {
    document.querySelectorAll('.fluid-card').forEach(card => {
      card.style.padding = '';
    });
    
    document.querySelectorAll('.responsive-button').forEach(button => {
      button.style.minHeight = '';
    });
  }
  
  // 更新所有響應式元素
  updateAllResponsiveElements() {
    document.querySelectorAll('.responsive-initialized').forEach(element => {
      this.applyResponsiveStyles(element);
    });
  }
  
  // 優化初始布局
  optimizeInitialLayout() {
    // 設置初始body類別
    document.body.classList.add(`breakpoint-${this.currentBreakpoint}`);
    document.body.classList.add(this.orientation);
    
    // 應用初始優化
    this.optimizeLayoutForBreakpoint(this.currentBreakpoint);
    this.optimizeLayoutForOrientation(this.orientation);
    
    // 預載入關鍵CSS
    this.preloadCriticalCSS();
  }
  
  // 預載入關鍵CSS
  preloadCriticalCSS() {
    const criticalCSS = [
      'components/shared/responsive-performance.css'
    ];
    
    criticalCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }
  
  // 註冊回調
  onBreakpointChange(callback) {
    this.callbacks.breakpointChange.push(callback);
  }
  
  onOrientationChange(callback) {
    this.callbacks.orientationChange.push(callback);
  }
  
  onResize(callback) {
    this.callbacks.resize.push(callback);
  }
  
  // 獲取當前狀態
  getCurrentState() {
    const deviceCaps = this.detectDeviceCapabilities();
    
    return {
      breakpoint: this.currentBreakpoint,
      orientation: this.orientation,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
      deviceCapabilities: deviceCaps,
      // 向後相容
      isTouchDevice: deviceCaps.hasTouch
    };
  }
  
  // 檢查斷點
  isBreakpoint(breakpoint) {
    return this.currentBreakpoint === breakpoint;
  }
  
  // 檢查最小斷點
  isMinBreakpoint(breakpoint) {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }
  
  // 檢查最大斷點
  isMaxBreakpoint(breakpoint) {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }
  
  // 銷毀管理器
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // 清理防抖計時器
    if (this.orientationChangeTimeout) {
      clearTimeout(this.orientationChangeTimeout);
    }
    
    // 清理事件監聽器
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    
    console.log('🛑 響應式布局管理器已銷毀');
  }
}

// 創建全局響應式布局管理器實例
window.ResponsiveLayoutManager = new ResponsiveLayoutManager();

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveLayoutManager;
}