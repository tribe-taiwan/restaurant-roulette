// 性能監控和優化工具
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      frameRates: [],
      loadTimes: []
    };
    
    this.observers = {
      intersection: null,
      resize: null,
      mutation: null
    };
    
    this.isMonitoring = false;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    this.init();
  }
  
  init() {
    // 初始化性能監控
    this.setupIntersectionObserver();
    this.setupResizeObserver();
    this.setupMemoryMonitoring();
    this.startFrameRateMonitoring();
    
    console.log('🚀 性能監控系統已初始化');
  }
  
  // 設置交集觀察器（懶載入優化）
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('瀏覽器不支援 IntersectionObserver');
      return;
    }
    
    this.observers.intersection = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素進入視窗
          this.handleElementVisible(entry.target);
        } else {
          // 元素離開視窗
          this.handleElementHidden(entry.target);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });
  }
  
  // 設置尺寸觀察器（響應式優化）
  setupResizeObserver() {
    if (!('ResizeObserver' in window)) {
      console.warn('瀏覽器不支援 ResizeObserver');
      return;
    }
    
    this.observers.resize = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        this.handleElementResize(entry.target, entry.contentRect);
      });
    });
  }
  
  // 設置記憶體監控
  setupMemoryMonitoring() {
    if (!('memory' in performance)) {
      console.warn('瀏覽器不支援記憶體監控');
      return;
    }
    
    setInterval(() => {
      const memory = performance.memory;
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      });
      
      // 保持最近100個記錄
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
      
      // 檢查記憶體洩漏
      this.checkMemoryLeak();
    }, 5000); // 每5秒檢查一次
  }
  
  // 開始幀率監控
  startFrameRateMonitoring() {
    const measureFrameRate = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      
      if (delta >= 1000) { // 每秒計算一次
        const fps = Math.round((this.frameCount * 1000) / delta);
        this.metrics.frameRates.push({
          timestamp: Date.now(),
          fps: fps
        });
        
        // 保持最近60個記錄
        if (this.metrics.frameRates.length > 60) {
          this.metrics.frameRates.shift();
        }
        
        // 檢查性能問題
        if (fps < 30) {
          console.warn(`⚠️ 低幀率警告: ${fps} FPS`);
          this.optimizePerformance();
        }
        
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
      
      this.frameCount++;
      requestAnimationFrame(measureFrameRate);
    };
    
    requestAnimationFrame(measureFrameRate);
  }
  
  // 處理元素可見
  handleElementVisible(element) {
    // 懶載入處理
    if (element.classList.contains('lazy-load')) {
      this.loadElement(element);
    }
    
    // 啟用動畫
    if (element.classList.contains('animate-on-scroll')) {
      element.classList.add('animate-fade-in');
    }
    
    // 優化will-change屬性
    if (element.classList.contains('interactive-element')) {
      element.style.willChange = 'transform';
    }
  }
  
  // 處理元素隱藏
  handleElementHidden(element) {
    // 清理will-change屬性
    if (element.style.willChange) {
      element.style.willChange = 'auto';
    }
    
    // 暫停非必要動畫
    if (element.classList.contains('animate-fade-in')) {
      element.classList.remove('animate-fade-in');
    }
  }
  
  // 處理元素尺寸變化
  handleElementResize(element, rect) {
    // 響應式字體調整
    if (element.classList.contains('responsive-text')) {
      this.adjustFontSize(element, rect.width);
    }
    
    // 響應式布局調整
    if (element.classList.contains('responsive-grid')) {
      this.adjustGridLayout(element, rect.width);
    }
  }
  
  // 載入元素（懶載入）
  loadElement(element) {
    const startTime = performance.now();
    
    // 模擬載入過程
    element.classList.add('loading-skeleton');
    
    // 實際載入邏輯
    setTimeout(() => {
      element.classList.remove('lazy-load', 'loading-skeleton');
      element.classList.add('loaded');
      
      const loadTime = performance.now() - startTime;
      this.metrics.loadTimes.push({
        timestamp: Date.now(),
        element: element.tagName,
        loadTime: loadTime
      });
      
      console.log(`✅ 元素載入完成: ${element.tagName} (${loadTime.toFixed(2)}ms)`);
    }, 100);
  }
  
  // 調整字體大小
  adjustFontSize(element, width) {
    const baseSize = 16;
    const scaleFactor = Math.max(0.8, Math.min(1.2, width / 400));
    const newSize = baseSize * scaleFactor;
    
    element.style.fontSize = `${newSize}px`;
  }
  
  // 調整網格布局
  adjustGridLayout(element, width) {
    let columns = 1;
    
    if (width >= 768) columns = 2;
    if (width >= 1024) columns = 3;
    if (width >= 1200) columns = 4;
    
    element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }
  
  // 檢查記憶體洩漏
  checkMemoryLeak() {
    if (this.metrics.memoryUsage.length < 10) return;
    
    const recent = this.metrics.memoryUsage.slice(-10);
    const trend = recent.reduce((acc, curr, index) => {
      if (index === 0) return acc;
      return acc + (curr.used - recent[index - 1].used);
    }, 0);
    
    if (trend > 10 * 1024 * 1024) { // 10MB增長
      console.warn('⚠️ 可能的記憶體洩漏檢測到');
      this.cleanupMemory();
    }
  }
  
  // 清理記憶體
  cleanupMemory() {
    // 清理未使用的事件監聽器
    this.cleanupEventListeners();
    
    // 清理DOM引用
    this.cleanupDOMReferences();
    
    // 強制垃圾回收（如果可用）
    if (window.gc) {
      window.gc();
    }
    
    console.log('🧹 記憶體清理完成');
  }
  
  // 清理事件監聽器
  cleanupEventListeners() {
    // 移除未使用的事件監聽器
    document.querySelectorAll('[data-cleanup="true"]').forEach(element => {
      const clone = element.cloneNode(true);
      element.parentNode.replaceChild(clone, element);
    });
  }
  
  // 清理DOM引用
  cleanupDOMReferences() {
    // 清理全局變數中的DOM引用
    Object.keys(window).forEach(key => {
      if (key.startsWith('_cached_') && window[key] instanceof Element) {
        if (!document.contains(window[key])) {
          delete window[key];
        }
      }
    });
  }
  
  // 性能優化
  optimizePerformance() {
    console.log('🔧 開始性能優化...');
    
    // 減少動畫複雜度
    this.reduceAnimationComplexity();
    
    // 優化渲染
    this.optimizeRendering();
    
    // 延遲非關鍵操作
    this.deferNonCriticalOperations();
    
    console.log('✅ 性能優化完成');
  }
  
  // 減少動畫複雜度
  reduceAnimationComplexity() {
    document.querySelectorAll('.complex-animation').forEach(element => {
      element.classList.add('simple-animation');
      element.classList.remove('complex-animation');
    });
  }
  
  // 優化渲染
  optimizeRendering() {
    // 批量DOM操作
    const fragment = document.createDocumentFragment();
    
    // 使用requestAnimationFrame批量更新
    const updates = [];
    document.querySelectorAll('[data-pending-update]').forEach(element => {
      updates.push(() => {
        element.removeAttribute('data-pending-update');
        // 執行更新邏輯
      });
    });
    
    if (updates.length > 0) {
      requestAnimationFrame(() => {
        updates.forEach(update => update());
      });
    }
  }
  
  // 延遲非關鍵操作
  deferNonCriticalOperations() {
    // 使用requestIdleCallback延遲非關鍵操作
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // 執行非關鍵操作
        this.performNonCriticalTasks();
      });
    } else {
      // 後備方案
      setTimeout(() => {
        this.performNonCriticalTasks();
      }, 100);
    }
  }
  
  // 執行非關鍵任務
  performNonCriticalTasks() {
    // 預載入下一頁內容
    this.preloadNextContent();
    
    // 清理舊的快取
    this.cleanupOldCache();
    
    // 更新統計數據
    this.updateAnalytics();
  }
  
  // 預載入下一頁內容
  preloadNextContent() {
    // 實現預載入邏輯
    console.log('📦 預載入下一頁內容');
  }
  
  // 清理舊快取
  cleanupOldCache() {
    // 清理localStorage中的舊數據
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小時
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.timestamp && (now - data.timestamp) > maxAge) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });
  }
  
  // 更新統計數據
  updateAnalytics() {
    // 發送性能數據到分析服務
    const performanceData = {
      avgFrameRate: this.getAverageFrameRate(),
      memoryUsage: this.getCurrentMemoryUsage(),
      loadTimes: this.getAverageLoadTime()
    };
    
    console.log('📊 性能統計:', performanceData);
  }
  
  // 獲取平均幀率
  getAverageFrameRate() {
    if (this.metrics.frameRates.length === 0) return 0;
    
    const sum = this.metrics.frameRates.reduce((acc, curr) => acc + curr.fps, 0);
    return Math.round(sum / this.metrics.frameRates.length);
  }
  
  // 獲取當前記憶體使用量
  getCurrentMemoryUsage() {
    if (!('memory' in performance)) return null;
    
    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
    };
  }
  
  // 獲取平均載入時間
  getAverageLoadTime() {
    if (this.metrics.loadTimes.length === 0) return 0;
    
    const sum = this.metrics.loadTimes.reduce((acc, curr) => acc + curr.loadTime, 0);
    return Math.round(sum / this.metrics.loadTimes.length);
  }
  
  // 觀察元素
  observeElement(element) {
    if (this.observers.intersection) {
      this.observers.intersection.observe(element);
    }
    
    if (this.observers.resize) {
      this.observers.resize.observe(element);
    }
  }
  
  // 停止觀察元素
  unobserveElement(element) {
    if (this.observers.intersection) {
      this.observers.intersection.unobserve(element);
    }
    
    if (this.observers.resize) {
      this.observers.resize.unobserve(element);
    }
  }
  
  // 獲取性能報告
  getPerformanceReport() {
    return {
      frameRate: {
        current: this.metrics.frameRates[this.metrics.frameRates.length - 1]?.fps || 0,
        average: this.getAverageFrameRate(),
        history: this.metrics.frameRates.slice(-10)
      },
      memory: {
        current: this.getCurrentMemoryUsage(),
        history: this.metrics.memoryUsage.slice(-10)
      },
      loadTimes: {
        average: this.getAverageLoadTime(),
        history: this.metrics.loadTimes.slice(-10)
      }
    };
  }
  
  // 銷毀監控器
  destroy() {
    if (this.observers.intersection) {
      this.observers.intersection.disconnect();
    }
    
    if (this.observers.resize) {
      this.observers.resize.disconnect();
    }
    
    this.isMonitoring = false;
    console.log('🛑 性能監控系統已停止');
  }
}

// 創建全局性能監控實例
window.PerformanceMonitor = new PerformanceMonitor();

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}