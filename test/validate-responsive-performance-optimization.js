// 響應式布局和性能優化驗證腳本
class ResponsivePerformanceValidator {
  constructor() {
    this.testResults = {
      responsive: {},
      performance: {},
      accessibility: {},
      overall: {}
    };
    
    this.startTime = performance.now();
    this.testCount = 0;
    this.passedTests = 0;
  }
  
  // 開始驗證
  async validate() {
    console.log('🧪 開始響應式布局和性能優化驗證');
    
    try {
      // 響應式測試
      await this.validateResponsiveLayout();
      
      // 性能測試
      await this.validatePerformance();
      
      // 無障礙測試
      await this.validateAccessibility();
      
      // 生成報告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 驗證過程中發生錯誤:', error);
    }
  }
  
  // 驗證響應式布局
  async validateResponsiveLayout() {
    console.log('📱 驗證響應式布局...');
    
    const tests = [
      () => this.testBreakpointSystem(),
      () => this.testFluidSpacing(),
      () => this.testResponsiveGrid(),
      () => this.testMobileOptimization(),
      () => this.testOrientationSupport(),
      () => this.testViewportUnits(),
      () => this.testContainerQueries()
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('響應式測試失敗:', error);
      }
    }
  }
  
  // 驗證性能優化
  async validatePerformance() {
    console.log('🚀 驗證性能優化...');
    
    const tests = [
      () => this.testFrameRate(),
      () => this.testMemoryUsage(),
      () => this.testLoadTimes(),
      () => this.testGPUAcceleration(),
      () => this.testLazyLoading(),
      () => this.testAnimationPerformance(),
      () => this.testScrollPerformance()
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('性能測試失敗:', error);
      }
    }
  }
  
  // 驗證無障礙支援
  async validateAccessibility() {
    console.log('♿ 驗證無障礙支援...');
    
    const tests = [
      () => this.testKeyboardNavigation(),
      () => this.testScreenReaderSupport(),
      () => this.testHighContrastMode(),
      () => this.testReducedMotion(),
      () => this.testTouchTargets(),
      () => this.testFocusManagement()
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('無障礙測試失敗:', error);
      }
    }
  }
  
  // 測試斷點系統
  testBreakpointSystem() {
    this.testCount++;
    
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentBreakpoint = window.ResponsiveLayoutManager?.getCurrentBreakpoint();
    
    if (breakpoints.includes(currentBreakpoint)) {
      this.passedTests++;
      this.testResults.responsive.breakpointSystem = {
        status: 'PASS',
        current: currentBreakpoint,
        message: '斷點系統正常運作'
      };
      console.log('✅ 斷點系統測試通過');
    } else {
      this.testResults.responsive.breakpointSystem = {
        status: 'FAIL',
        current: currentBreakpoint,
        message: '斷點系統異常'
      };
      console.log('❌ 斷點系統測試失敗');
    }
  }
  
  // 測試流體間距
  testFluidSpacing() {
    this.testCount++;
    
    const fluidElements = document.querySelectorAll('[style*="--fluid-spacing"]');
    const hasFluidSpacing = fluidElements.length > 0;
    
    if (hasFluidSpacing) {
      this.passedTests++;
      this.testResults.responsive.fluidSpacing = {
        status: 'PASS',
        count: fluidElements.length,
        message: '流體間距系統正常'
      };
      console.log('✅ 流體間距測試通過');
    } else {
      this.testResults.responsive.fluidSpacing = {
        status: 'FAIL',
        count: 0,
        message: '未找到流體間距元素'
      };
      console.log('❌ 流體間距測試失敗');
    }
  }
  
  // 測試響應式網格
  testResponsiveGrid() {
    this.testCount++;
    
    const gridElements = document.querySelectorAll('.responsive-grid');
    let passCount = 0;
    
    gridElements.forEach(grid => {
      const computedStyle = window.getComputedStyle(grid);
      const gridColumns = computedStyle.gridTemplateColumns;
      
      if (gridColumns && gridColumns !== 'none') {
        passCount++;
      }
    });
    
    if (passCount === gridElements.length && gridElements.length > 0) {
      this.passedTests++;
      this.testResults.responsive.responsiveGrid = {
        status: 'PASS',
        total: gridElements.length,
        passed: passCount,
        message: '響應式網格正常運作'
      };
      console.log('✅ 響應式網格測試通過');
    } else {
      this.testResults.responsive.responsiveGrid = {
        status: 'FAIL',
        total: gridElements.length,
        passed: passCount,
        message: '響應式網格配置異常'
      };
      console.log('❌ 響應式網格測試失敗');
    }
  }
  
  // 測試移動端優化
  testMobileOptimization() {
    this.testCount++;
    
    const viewport = document.querySelector('meta[name="viewport"]');
    const touchOptimized = document.querySelectorAll('.touch-optimized').length > 0;
    const mobileOptimized = document.body.classList.contains('mobile-optimized');
    
    const isMobileOptimized = viewport && (touchOptimized || mobileOptimized);
    
    if (isMobileOptimized) {
      this.passedTests++;
      this.testResults.responsive.mobileOptimization = {
        status: 'PASS',
        viewport: !!viewport,
        touchOptimized: touchOptimized,
        mobileOptimized: mobileOptimized,
        message: '移動端優化正常'
      };
      console.log('✅ 移動端優化測試通過');
    } else {
      this.testResults.responsive.mobileOptimization = {
        status: 'FAIL',
        viewport: !!viewport,
        touchOptimized: touchOptimized,
        mobileOptimized: mobileOptimized,
        message: '移動端優化不足'
      };
      console.log('❌ 移動端優化測試失敗');
    }
  }
  
  // 測試方向支援
  testOrientationSupport() {
    this.testCount++;
    
    const orientation = window.ResponsiveLayoutManager?.getOrientation();
    const hasOrientationClass = document.body.classList.contains('portrait') || 
                               document.body.classList.contains('landscape');
    
    if (orientation && hasOrientationClass) {
      this.passedTests++;
      this.testResults.responsive.orientationSupport = {
        status: 'PASS',
        current: orientation,
        hasClass: hasOrientationClass,
        message: '方向支援正常'
      };
      console.log('✅ 方向支援測試通過');
    } else {
      this.testResults.responsive.orientationSupport = {
        status: 'FAIL',
        current: orientation,
        hasClass: hasOrientationClass,
        message: '方向支援異常'
      };
      console.log('❌ 方向支援測試失敗');
    }
  }
  
  // 測試視窗單位
  testViewportUnits() {
    this.testCount++;
    
    const testElement = document.createElement('div');
    testElement.style.height = '100vh';
    testElement.style.width = '100vw';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const hasViewportUnits = computedStyle.height !== '0px' && computedStyle.width !== '0px';
    
    document.body.removeChild(testElement);
    
    if (hasViewportUnits) {
      this.passedTests++;
      this.testResults.responsive.viewportUnits = {
        status: 'PASS',
        message: '視窗單位支援正常'
      };
      console.log('✅ 視窗單位測試通過');
    } else {
      this.testResults.responsive.viewportUnits = {
        status: 'FAIL',
        message: '視窗單位支援異常'
      };
      console.log('❌ 視窗單位測試失敗');
    }
  }
  
  // 測試容器查詢
  testContainerQueries() {
    this.testCount++;
    
    const supportsContainerQueries = CSS.supports('container-type: inline-size');
    const containerElements = document.querySelectorAll('[style*="container-type"]').length;
    
    if (supportsContainerQueries || containerElements > 0) {
      this.passedTests++;
      this.testResults.responsive.containerQueries = {
        status: 'PASS',
        supported: supportsContainerQueries,
        elements: containerElements,
        message: '容器查詢支援正常'
      };
      console.log('✅ 容器查詢測試通過');
    } else {
      this.testResults.responsive.containerQueries = {
        status: 'FAIL',
        supported: supportsContainerQueries,
        elements: containerElements,
        message: '容器查詢不支援'
      };
      console.log('❌ 容器查詢測試失敗');
    }
  }
  
  // 測試幀率
  async testFrameRate() {
    this.testCount++;
    
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      
      function countFrames() {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          const fps = frameCount;
          
          if (fps >= 30) {
            this.passedTests++;
            this.testResults.performance.frameRate = {
              status: 'PASS',
              fps: fps,
              message: '幀率正常'
            };
            console.log('✅ 幀率測試通過:', fps, 'FPS');
          } else {
            this.testResults.performance.frameRate = {
              status: 'FAIL',
              fps: fps,
              message: '幀率過低'
            };
            console.log('❌ 幀率測試失敗:', fps, 'FPS');
          }
          resolve();
        }
      }
      
      requestAnimationFrame(countFrames.bind(this));
    });
  }
  
  // 測試記憶體使用
  testMemoryUsage() {
    this.testCount++;
    
    if ('memory' in performance) {
      const memory = performance.memory;
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usagePercentage < 80) {
        this.passedTests++;
        this.testResults.performance.memoryUsage = {
          status: 'PASS',
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round(usagePercentage),
          message: '記憶體使用正常'
        };
        console.log('✅ 記憶體使用測試通過');
      } else {
        this.testResults.performance.memoryUsage = {
          status: 'FAIL',
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round(usagePercentage),
          message: '記憶體使用過高'
        };
        console.log('❌ 記憶體使用測試失敗');
      }
    } else {
      this.testResults.performance.memoryUsage = {
        status: 'SKIP',
        message: '瀏覽器不支援記憶體監控'
      };
      console.log('⏭️ 記憶體使用測試跳過');
    }
  }
  
  // 測試載入時間
  async testLoadTimes() {
    this.testCount++;
    
    const startTime = performance.now();
    
    // 模擬載入操作
    const testElement = document.createElement('div');
    testElement.innerHTML = '<div>'.repeat(1000) + '</div>'.repeat(1000);
    document.body.appendChild(testElement);
    
    const loadTime = performance.now() - startTime;
    document.body.removeChild(testElement);
    
    if (loadTime < 100) {
      this.passedTests++;
      this.testResults.performance.loadTimes = {
        status: 'PASS',
        time: Math.round(loadTime),
        message: '載入時間正常'
      };
      console.log('✅ 載入時間測試通過:', Math.round(loadTime), 'ms');
    } else {
      this.testResults.performance.loadTimes = {
        status: 'FAIL',
        time: Math.round(loadTime),
        message: '載入時間過長'
      };
      console.log('❌ 載入時間測試失敗:', Math.round(loadTime), 'ms');
    }
  }
  
  // 測試GPU加速
  testGPUAcceleration() {
    this.testCount++;
    
    const acceleratedElements = document.querySelectorAll('.gpu-accelerated');
    const transformElements = document.querySelectorAll('[style*="translateZ(0)"]');
    
    const hasGPUAcceleration = acceleratedElements.length > 0 || transformElements.length > 0;
    
    if (hasGPUAcceleration) {
      this.passedTests++;
      this.testResults.performance.gpuAcceleration = {
        status: 'PASS',
        acceleratedElements: acceleratedElements.length,
        transformElements: transformElements.length,
        message: 'GPU加速正常啟用'
      };
      console.log('✅ GPU加速測試通過');
    } else {
      this.testResults.performance.gpuAcceleration = {
        status: 'FAIL',
        acceleratedElements: acceleratedElements.length,
        transformElements: transformElements.length,
        message: 'GPU加速未啟用'
      };
      console.log('❌ GPU加速測試失敗');
    }
  }
  
  // 測試懶載入
  testLazyLoading() {
    this.testCount++;
    
    const lazyElements = document.querySelectorAll('.lazy-load');
    const loadedElements = document.querySelectorAll('.lazy-load.loaded');
    
    if (lazyElements.length > 0) {
      this.passedTests++;
      this.testResults.performance.lazyLoading = {
        status: 'PASS',
        total: lazyElements.length,
        loaded: loadedElements.length,
        message: '懶載入系統正常'
      };
      console.log('✅ 懶載入測試通過');
    } else {
      this.testResults.performance.lazyLoading = {
        status: 'FAIL',
        total: lazyElements.length,
        loaded: loadedElements.length,
        message: '未找到懶載入元素'
      };
      console.log('❌ 懶載入測試失敗');
    }
  }
  
  // 測試動畫性能
  async testAnimationPerformance() {
    this.testCount++;
    
    return new Promise((resolve) => {
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        position: fixed;
        top: -100px;
        left: -100px;
        width: 50px;
        height: 50px;
        background: red;
        transition: transform 0.5s ease;
      `;
      document.body.appendChild(testElement);
      
      const startTime = performance.now();
      testElement.style.transform = 'translateX(100px)';
      
      setTimeout(() => {
        const animationTime = performance.now() - startTime;
        document.body.removeChild(testElement);
        
        if (animationTime < 600) {
          this.passedTests++;
          this.testResults.performance.animationPerformance = {
            status: 'PASS',
            time: Math.round(animationTime),
            message: '動畫性能正常'
          };
          console.log('✅ 動畫性能測試通過');
        } else {
          this.testResults.performance.animationPerformance = {
            status: 'FAIL',
            time: Math.round(animationTime),
            message: '動畫性能不佳'
          };
          console.log('❌ 動畫性能測試失敗');
        }
        resolve();
      }, 600);
    });
  }
  
  // 測試滾動性能
  testScrollPerformance() {
    this.testCount++;
    
    const hasScrollOptimization = document.querySelectorAll('.smooth-scroll').length > 0;
    const hasOverscrollBehavior = getComputedStyle(document.body).overscrollBehavior !== 'auto';
    
    if (hasScrollOptimization || hasOverscrollBehavior) {
      this.passedTests++;
      this.testResults.performance.scrollPerformance = {
        status: 'PASS',
        smoothScroll: hasScrollOptimization,
        overscrollBehavior: hasOverscrollBehavior,
        message: '滾動性能優化正常'
      };
      console.log('✅ 滾動性能測試通過');
    } else {
      this.testResults.performance.scrollPerformance = {
        status: 'FAIL',
        smoothScroll: hasScrollOptimization,
        overscrollBehavior: hasOverscrollBehavior,
        message: '滾動性能優化不足'
      };
      console.log('❌ 滾動性能測試失敗');
    }
  }
  
  // 測試鍵盤導航
  testKeyboardNavigation() {
    this.testCount++;
    
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let accessibleCount = 0;
    focusableElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.outline !== 'none' || element.style.outline !== 'none') {
        accessibleCount++;
      }
    });
    
    if (accessibleCount > 0) {
      this.passedTests++;
      this.testResults.accessibility.keyboardNavigation = {
        status: 'PASS',
        total: focusableElements.length,
        accessible: accessibleCount,
        message: '鍵盤導航支援正常'
      };
      console.log('✅ 鍵盤導航測試通過');
    } else {
      this.testResults.accessibility.keyboardNavigation = {
        status: 'FAIL',
        total: focusableElements.length,
        accessible: accessibleCount,
        message: '鍵盤導航支援不足'
      };
      console.log('❌ 鍵盤導航測試失敗');
    }
  }
  
  // 測試螢幕閱讀器支援
  testScreenReaderSupport() {
    this.testCount++;
    
    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
    const altImages = document.querySelectorAll('img[alt]');
    
    const hasAriaSupport = ariaElements.length > 0;
    const hasImageAlt = altImages.length === document.querySelectorAll('img').length;
    
    if (hasAriaSupport || hasImageAlt) {
      this.passedTests++;
      this.testResults.accessibility.screenReaderSupport = {
        status: 'PASS',
        ariaElements: ariaElements.length,
        altImages: altImages.length,
        message: '螢幕閱讀器支援正常'
      };
      console.log('✅ 螢幕閱讀器支援測試通過');
    } else {
      this.testResults.accessibility.screenReaderSupport = {
        status: 'FAIL',
        ariaElements: ariaElements.length,
        altImages: altImages.length,
        message: '螢幕閱讀器支援不足'
      };
      console.log('❌ 螢幕閱讀器支援測試失敗');
    }
  }
  
  // 測試高對比度模式
  testHighContrastMode() {
    this.testCount++;
    
    const supportsHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const hasHighContrastStyles = document.styleSheets.length > 0;
    
    if (supportsHighContrast || hasHighContrastStyles) {
      this.passedTests++;
      this.testResults.accessibility.highContrastMode = {
        status: 'PASS',
        supported: supportsHighContrast,
        hasStyles: hasHighContrastStyles,
        message: '高對比度模式支援正常'
      };
      console.log('✅ 高對比度模式測試通過');
    } else {
      this.testResults.accessibility.highContrastMode = {
        status: 'FAIL',
        supported: supportsHighContrast,
        hasStyles: hasHighContrastStyles,
        message: '高對比度模式支援不足'
      };
      console.log('❌ 高對比度模式測試失敗');
    }
  }
  
  // 測試減少動畫偏好
  testReducedMotion() {
    this.testCount++;
    
    const supportsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasReducedMotionStyles = Array.from(document.styleSheets).some(sheet => {
      try {
        return Array.from(sheet.cssRules).some(rule => 
          rule.conditionText && rule.conditionText.includes('prefers-reduced-motion')
        );
      } catch (e) {
        return false;
      }
    });
    
    if (hasReducedMotionStyles) {
      this.passedTests++;
      this.testResults.accessibility.reducedMotion = {
        status: 'PASS',
        supported: supportsReducedMotion,
        hasStyles: hasReducedMotionStyles,
        message: '減少動畫偏好支援正常'
      };
      console.log('✅ 減少動畫偏好測試通過');
    } else {
      this.testResults.accessibility.reducedMotion = {
        status: 'FAIL',
        supported: supportsReducedMotion,
        hasStyles: hasReducedMotionStyles,
        message: '減少動畫偏好支援不足'
      };
      console.log('❌ 減少動畫偏好測試失敗');
    }
  }
  
  // 測試觸控目標
  testTouchTargets() {
    this.testCount++;
    
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    let adequateTargets = 0;
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width >= 44 && rect.height >= 44) {
        adequateTargets++;
      }
    });
    
    const percentage = (adequateTargets / interactiveElements.length) * 100;
    
    if (percentage >= 80) {
      this.passedTests++;
      this.testResults.accessibility.touchTargets = {
        status: 'PASS',
        total: interactiveElements.length,
        adequate: adequateTargets,
        percentage: Math.round(percentage),
        message: '觸控目標大小適當'
      };
      console.log('✅ 觸控目標測試通過');
    } else {
      this.testResults.accessibility.touchTargets = {
        status: 'FAIL',
        total: interactiveElements.length,
        adequate: adequateTargets,
        percentage: Math.round(percentage),
        message: '觸控目標過小'
      };
      console.log('❌ 觸控目標測試失敗');
    }
  }
  
  // 測試焦點管理
  testFocusManagement() {
    this.testCount++;
    
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    let visibleFocusCount = 0;
    focusableElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.outline !== 'none' && computedStyle.outlineWidth !== '0px') {
        visibleFocusCount++;
      }
    });
    
    if (visibleFocusCount > 0) {
      this.passedTests++;
      this.testResults.accessibility.focusManagement = {
        status: 'PASS',
        total: focusableElements.length,
        visibleFocus: visibleFocusCount,
        message: '焦點管理正常'
      };
      console.log('✅ 焦點管理測試通過');
    } else {
      this.testResults.accessibility.focusManagement = {
        status: 'FAIL',
        total: focusableElements.length,
        visibleFocus: visibleFocusCount,
        message: '焦點管理不足'
      };
      console.log('❌ 焦點管理測試失敗');
    }
  }
  
  // 生成報告
  generateReport() {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    const successRate = (this.passedTests / this.testCount) * 100;
    
    this.testResults.overall = {
      duration: Math.round(duration),
      totalTests: this.testCount,
      passedTests: this.passedTests,
      failedTests: this.testCount - this.passedTests,
      successRate: Math.round(successRate),
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📋 響應式布局和性能優化驗證報告');
    console.log('='.repeat(50));
    console.log(`測試時間: ${Math.round(duration)}ms`);
    console.log(`總測試數: ${this.testCount}`);
    console.log(`通過測試: ${this.passedTests}`);
    console.log(`失敗測試: ${this.testCount - this.passedTests}`);
    console.log(`成功率: ${Math.round(successRate)}%`);
    console.log('='.repeat(50));
    
    // 詳細結果
    console.log('\n📱 響應式布局測試結果:');
    Object.entries(this.testResults.responsive).forEach(([key, result]) => {
      console.log(`  ${result.status === 'PASS' ? '✅' : '❌'} ${key}: ${result.message}`);
    });
    
    console.log('\n🚀 性能優化測試結果:');
    Object.entries(this.testResults.performance).forEach(([key, result]) => {
      console.log(`  ${result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌'} ${key}: ${result.message}`);
    });
    
    console.log('\n♿ 無障礙支援測試結果:');
    Object.entries(this.testResults.accessibility).forEach(([key, result]) => {
      console.log(`  ${result.status === 'PASS' ? '✅' : '❌'} ${key}: ${result.message}`);
    });
    
    // 建議
    console.log('\n💡 改進建議:');
    if (successRate < 80) {
      console.log('  - 整體測試成功率偏低，需要進一步優化');
    }
    
    const failedResponsive = Object.values(this.testResults.responsive).filter(r => r.status === 'FAIL');
    if (failedResponsive.length > 0) {
      console.log('  - 響應式布局需要改進');
    }
    
    const failedPerformance = Object.values(this.testResults.performance).filter(r => r.status === 'FAIL');
    if (failedPerformance.length > 0) {
      console.log('  - 性能優化需要加強');
    }
    
    const failedAccessibility = Object.values(this.testResults.accessibility).filter(r => r.status === 'FAIL');
    if (failedAccessibility.length > 0) {
      console.log('  - 無障礙支援需要完善');
    }
    
    if (successRate >= 90) {
      console.log('🎉 優秀！響應式布局和性能優化表現良好');
    } else if (successRate >= 80) {
      console.log('👍 良好！響應式布局和性能優化基本達標');
    } else {
      console.log('⚠️ 需要改進！響應式布局和性能優化有待加強');
    }
    
    return this.testResults;
  }
}

// 自動執行驗證（如果在瀏覽器環境中）
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const validator = new ResponsivePerformanceValidator();
      validator.validate();
    }, 1000);
  });
}

// 導出給Node.js使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsivePerformanceValidator;
}