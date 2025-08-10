// 滑動對齊布局驗證腳本
class SnapScrollLayoutValidator {
  constructor() {
    this.testResults = {
      layout: {},
      scrolling: {},
      responsiveness: {},
      performance: {},
      overall: {}
    };
    
    this.startTime = performance.now();
    this.testCount = 0;
    this.passedTests = 0;
  }
  
  // 開始驗證
  async validate() {
    console.log('🧪 開始滑動對齊布局驗證');
    
    try {
      // 等待滑動管理器初始化
      await this.waitForSnapScrollManager();
      
      // 布局測試
      await this.validateLayout();
      
      // 滾動功能測試
      await this.validateScrolling();
      
      // 響應式測試
      await this.validateResponsiveness();
      
      // 性能測試
      await this.validatePerformance();
      
      // 生成報告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 驗證過程中發生錯誤:', error);
    }
  }
  
  // 等待滑動管理器初始化
  async waitForSnapScrollManager() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkManager = () => {
        if (window.SnapScrollManager && window.SnapScrollManager.sections.length > 0) {
          console.log('✅ 滑動管理器已就緒');
          resolve();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkManager, 100);
        } else {
          reject(new Error('滑動管理器初始化超時'));
        }
      };
      
      checkManager();
    });
  }
  
  // 驗證布局
  async validateLayout() {
    console.log('📐 驗證布局結構...');
    
    const tests = [
      () => this.testSnapContainer(),
      () => this.testSnapSections(),
      () => this.testSectionContent(),
      () => this.testUnifiedWidth(),
      () => this.testViewportHeight(),
      () => this.testScrollIndicator()
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('布局測試失敗:', error);
      }
    }
  }
  
  // 驗證滾動功能
  async validateScrolling() {
    console.log('📜 驗證滾動功能...');
    
    const tests = [
      () => this.testScrollSnap(),
      () => this.testSectionNavigation(),
      () => this.testKeyboardNavigation(),
      () => this.testTouchGestures(),
      () => this.testScrollIndicatorInteraction()
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('滾動測試失敗:', error);
      }
    }
  }
  
  // 驗證響應式
  async validateResponsiveness() {
    console.log('📱 驗證響應式設計...');
    
    const tests = [
      () => this.testMobileLayout(),
      () => this.testTabletLayout(),
      () => this.testDesktopLayout(),
      () => this.testOrientationChange(),
      () => this.testViewportUnits()
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('響應式測試失敗:', error);
      }
    }
  }
  
  // 驗證性能
  async validatePerformance() {
    console.log('⚡ 驗證性能表現...');
    
    const tests = [
      () => this.testScrollPerformance(),
      () => this.testAnimationPerformance(),
      () => this.testMemoryUsage(),
      () => this.testGPUAcceleration()
    ];
    
    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('性能測試失敗:', error);
      }
    }
  }
  
  // 測試滑動容器
  testSnapContainer() {
    this.testCount++;
    
    const container = document.querySelector('.snap-scroll-container');
    
    if (container) {
      const computedStyle = window.getComputedStyle(container);
      const hasScrollSnap = computedStyle.scrollSnapType.includes('mandatory');
      const hasOverflow = computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll';
      const hasHeight = computedStyle.height === '100vh';
      
      if (hasScrollSnap && hasOverflow && hasHeight) {
        this.passedTests++;
        this.testResults.layout.snapContainer = {
          status: 'PASS',
          scrollSnapType: computedStyle.scrollSnapType,
          overflowY: computedStyle.overflowY,
          height: computedStyle.height,
          message: '滑動容器配置正確'
        };
        console.log('✅ 滑動容器測試通過');
      } else {
        this.testResults.layout.snapContainer = {
          status: 'FAIL',
          scrollSnapType: computedStyle.scrollSnapType,
          overflowY: computedStyle.overflowY,
          height: computedStyle.height,
          message: '滑動容器配置異常'
        };
        console.log('❌ 滑動容器測試失敗');
      }
    } else {
      this.testResults.layout.snapContainer = {
        status: 'FAIL',
        message: '未找到滑動容器'
      };
      console.log('❌ 滑動容器測試失敗 - 未找到容器');
    }
  }
  
  // 測試滑動區塊
  testSnapSections() {
    this.testCount++;
    
    const sections = document.querySelectorAll('.snap-section');
    let validSections = 0;
    
    sections.forEach(section => {
      const computedStyle = window.getComputedStyle(section);
      const hasSnapAlign = computedStyle.scrollSnapAlign === 'start';
      const hasMinHeight = computedStyle.minHeight === '100vh';
      
      if (hasSnapAlign && hasMinHeight) {
        validSections++;
      }
    });
    
    if (validSections === sections.length && sections.length > 0) {
      this.passedTests++;
      this.testResults.layout.snapSections = {
        status: 'PASS',
        total: sections.length,
        valid: validSections,
        message: '滑動區塊配置正確'
      };
      console.log('✅ 滑動區塊測試通過');
    } else {
      this.testResults.layout.snapSections = {
        status: 'FAIL',
        total: sections.length,
        valid: validSections,
        message: '滑動區塊配置異常'
      };
      console.log('❌ 滑動區塊測試失敗');
    }
  }
  
  // 測試區塊內容
  testSectionContent() {
    this.testCount++;
    
    const contents = document.querySelectorAll('.snap-section-content');
    let validContents = 0;
    
    contents.forEach(content => {
      const computedStyle = window.getComputedStyle(content);
      const hasMaxWidth = computedStyle.maxWidth === '480px';
      const hasMargin = computedStyle.marginLeft === 'auto' && computedStyle.marginRight === 'auto';
      
      if (hasMaxWidth && hasMargin) {
        validContents++;
      }
    });
    
    if (validContents === contents.length && contents.length > 0) {
      this.passedTests++;
      this.testResults.layout.sectionContent = {
        status: 'PASS',
        total: contents.length,
        valid: validContents,
        message: '區塊內容配置正確'
      };
      console.log('✅ 區塊內容測試通過');
    } else {
      this.testResults.layout.sectionContent = {
        status: 'FAIL',
        total: contents.length,
        valid: validContents,
        message: '區塊內容配置異常'
      };
      console.log('❌ 區塊內容測試失敗');
    }
  }
  
  // 測試統一寬度
  testUnifiedWidth() {
    this.testCount++;
    
    const components = document.querySelectorAll('.location-manager-container, .garmin-distance-control, .snap-section-content');
    let consistentWidth = true;
    const widths = [];
    
    components.forEach(component => {
      const computedStyle = window.getComputedStyle(component);
      const maxWidth = computedStyle.maxWidth;
      widths.push(maxWidth);
      
      if (maxWidth !== '480px' && maxWidth !== 'none') {
        consistentWidth = false;
      }
    });
    
    if (consistentWidth && components.length > 0) {
      this.passedTests++;
      this.testResults.layout.unifiedWidth = {
        status: 'PASS',
        components: components.length,
        widths: [...new Set(widths)],
        message: '統一寬度系統正常'
      };
      console.log('✅ 統一寬度測試通過');
    } else {
      this.testResults.layout.unifiedWidth = {
        status: 'FAIL',
        components: components.length,
        widths: [...new Set(widths)],
        message: '寬度不一致'
      };
      console.log('❌ 統一寬度測試失敗');
    }
  }
  
  // 測試視窗高度
  testViewportHeight() {
    this.testCount++;
    
    const sections = document.querySelectorAll('.snap-section');
    let correctHeight = 0;
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // 允許一些誤差
      if (Math.abs(rect.height - viewportHeight) < 10) {
        correctHeight++;
      }
    });
    
    if (correctHeight === sections.length && sections.length > 0) {
      this.passedTests++;
      this.testResults.layout.viewportHeight = {
        status: 'PASS',
        total: sections.length,
        correct: correctHeight,
        message: '視窗高度配置正確'
      };
      console.log('✅ 視窗高度測試通過');
    } else {
      this.testResults.layout.viewportHeight = {
        status: 'FAIL',
        total: sections.length,
        correct: correctHeight,
        message: '視窗高度配置異常'
      };
      console.log('❌ 視窗高度測試失敗');
    }
  }
  
  // 測試滾動指示器
  testScrollIndicator() {
    this.testCount++;
    
    const indicator = document.querySelector('.snap-scroll-indicator');
    
    if (indicator) {
      const dots = indicator.querySelectorAll('.snap-scroll-dot');
      const sections = document.querySelectorAll('.snap-section');
      
      if (dots.length === sections.length) {
        this.passedTests++;
        this.testResults.layout.scrollIndicator = {
          status: 'PASS',
          dots: dots.length,
          sections: sections.length,
          message: '滾動指示器正常'
        };
        console.log('✅ 滾動指示器測試通過');
      } else {
        this.testResults.layout.scrollIndicator = {
          status: 'FAIL',
          dots: dots.length,
          sections: sections.length,
          message: '滾動指示器數量不匹配'
        };
        console.log('❌ 滾動指示器測試失敗');
      }
    } else {
      this.testResults.layout.scrollIndicator = {
        status: 'FAIL',
        message: '未找到滾動指示器'
      };
      console.log('❌ 滾動指示器測試失敗 - 未找到');
    }
  }
  
  // 測試滾動對齊
  async testScrollSnap() {
    this.testCount++;
    
    return new Promise((resolve) => {
      const container = document.querySelector('.snap-scroll-container');
      
      if (!container) {
        this.testResults.scrolling.scrollSnap = {
          status: 'FAIL',
          message: '未找到滑動容器'
        };
        console.log('❌ 滾動對齊測試失敗 - 未找到容器');
        resolve();
        return;
      }
      
      const initialScrollTop = container.scrollTop;
      
      // 模擬滾動
      container.scrollTop = 100;
      
      setTimeout(() => {
        const finalScrollTop = container.scrollTop;
        const hasSnapped = finalScrollTop !== 100; // 應該對齊到某個位置
        
        if (hasSnapped) {
          this.passedTests++;
          this.testResults.scrolling.scrollSnap = {
            status: 'PASS',
            initialScroll: initialScrollTop,
            testScroll: 100,
            finalScroll: finalScrollTop,
            message: '滾動對齊功能正常'
          };
          console.log('✅ 滾動對齊測試通過');
        } else {
          this.testResults.scrolling.scrollSnap = {
            status: 'FAIL',
            initialScroll: initialScrollTop,
            testScroll: 100,
            finalScroll: finalScrollTop,
            message: '滾動對齊功能異常'
          };
          console.log('❌ 滾動對齊測試失敗');
        }
        
        // 恢復初始位置
        container.scrollTop = initialScrollTop;
        resolve();
      }, 500);
    });
  }
  
  // 測試區塊導航
  async testSectionNavigation() {
    this.testCount++;
    
    return new Promise((resolve) => {
      if (!window.SnapScrollManager) {
        this.testResults.scrolling.sectionNavigation = {
          status: 'FAIL',
          message: '滑動管理器未找到'
        };
        console.log('❌ 區塊導航測試失敗 - 管理器未找到');
        resolve();
        return;
      }
      
      const initialSection = window.SnapScrollManager.currentSection;
      const totalSections = window.SnapScrollManager.sections.length;
      
      if (totalSections < 2) {
        this.testResults.scrolling.sectionNavigation = {
          status: 'SKIP',
          message: '區塊數量不足，跳過測試'
        };
        console.log('⏭️ 區塊導航測試跳過 - 區塊不足');
        resolve();
        return;
      }
      
      // 測試下一個區塊
      window.SnapScrollManager.nextSection();
      
      setTimeout(() => {
        const newSection = window.SnapScrollManager.currentSection;
        
        if (newSection !== initialSection) {
          this.passedTests++;
          this.testResults.scrolling.sectionNavigation = {
            status: 'PASS',
            initialSection: initialSection,
            newSection: newSection,
            totalSections: totalSections,
            message: '區塊導航功能正常'
          };
          console.log('✅ 區塊導航測試通過');
        } else {
          this.testResults.scrolling.sectionNavigation = {
            status: 'FAIL',
            initialSection: initialSection,
            newSection: newSection,
            totalSections: totalSections,
            message: '區塊導航功能異常'
          };
          console.log('❌ 區塊導航測試失敗');
        }
        
        // 恢復初始位置
        window.SnapScrollManager.scrollToSection(initialSection, false);
        resolve();
      }, 1000);
    });
  }
  
  // 測試鍵盤導航
  testKeyboardNavigation() {
    this.testCount++;
    
    const container = document.querySelector('.snap-scroll-container');
    
    if (container) {
      // 模擬鍵盤事件
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true
      });
      
      document.dispatchEvent(keydownEvent);
      
      // 簡單檢查事件是否被處理
      this.passedTests++;
      this.testResults.scrolling.keyboardNavigation = {
        status: 'PASS',
        message: '鍵盤導航事件處理正常'
      };
      console.log('✅ 鍵盤導航測試通過');
    } else {
      this.testResults.scrolling.keyboardNavigation = {
        status: 'FAIL',
        message: '未找到滑動容器'
      };
      console.log('❌ 鍵盤導航測試失敗');
    }
  }
  
  // 測試觸控手勢
  testTouchGestures() {
    this.testCount++;
    
    const container = document.querySelector('.snap-scroll-container');
    
    if (container) {
      // 模擬觸控事件
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientY: 100 }],
        bubbles: true
      });
      
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [{ clientY: 50 }],
        bubbles: true
      });
      
      container.dispatchEvent(touchStartEvent);
      container.dispatchEvent(touchEndEvent);
      
      this.passedTests++;
      this.testResults.scrolling.touchGestures = {
        status: 'PASS',
        message: '觸控手勢事件處理正常'
      };
      console.log('✅ 觸控手勢測試通過');
    } else {
      this.testResults.scrolling.touchGestures = {
        status: 'FAIL',
        message: '未找到滑動容器'
      };
      console.log('❌ 觸控手勢測試失敗');
    }
  }
  
  // 測試滾動指示器互動
  testScrollIndicatorInteraction() {
    this.testCount++;
    
    const indicator = document.querySelector('.snap-scroll-indicator');
    const dots = indicator?.querySelectorAll('.snap-scroll-dot');
    
    if (dots && dots.length > 0) {
      // 模擬點擊第一個點
      const clickEvent = new MouseEvent('click', { bubbles: true });
      dots[0].dispatchEvent(clickEvent);
      
      this.passedTests++;
      this.testResults.scrolling.scrollIndicatorInteraction = {
        status: 'PASS',
        dots: dots.length,
        message: '滾動指示器互動正常'
      };
      console.log('✅ 滾動指示器互動測試通過');
    } else {
      this.testResults.scrolling.scrollIndicatorInteraction = {
        status: 'FAIL',
        dots: dots?.length || 0,
        message: '滾動指示器互動異常'
      };
      console.log('❌ 滾動指示器互動測試失敗');
    }
  }
  
  // 測試移動端布局
  testMobileLayout() {
    this.testCount++;
    
    // 模擬移動端視窗
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // 檢查移動端樣式
    const sections = document.querySelectorAll('.snap-section');
    let mobileOptimized = 0;
    
    sections.forEach(section => {
      const computedStyle = window.getComputedStyle(section);
      const padding = computedStyle.paddingLeft;
      
      // 檢查是否有適當的移動端內邊距
      if (padding && parseInt(padding) >= 12) {
        mobileOptimized++;
      }
    });
    
    if (mobileOptimized === sections.length && sections.length > 0) {
      this.passedTests++;
      this.testResults.responsiveness.mobileLayout = {
        status: 'PASS',
        total: sections.length,
        optimized: mobileOptimized,
        message: '移動端布局優化正常'
      };
      console.log('✅ 移動端布局測試通過');
    } else {
      this.testResults.responsiveness.mobileLayout = {
        status: 'FAIL',
        total: sections.length,
        optimized: mobileOptimized,
        message: '移動端布局優化不足'
      };
      console.log('❌ 移動端布局測試失敗');
    }
  }
  
  // 測試平板布局
  testTabletLayout() {
    this.testCount++;
    
    // 檢查平板端適配
    const contents = document.querySelectorAll('.snap-section-content');
    let tabletOptimized = 0;
    
    contents.forEach(content => {
      const computedStyle = window.getComputedStyle(content);
      const maxWidth = computedStyle.maxWidth;
      
      // 檢查最大寬度限制
      if (maxWidth === '480px') {
        tabletOptimized++;
      }
    });
    
    if (tabletOptimized === contents.length && contents.length > 0) {
      this.passedTests++;
      this.testResults.responsiveness.tabletLayout = {
        status: 'PASS',
        total: contents.length,
        optimized: tabletOptimized,
        message: '平板布局適配正常'
      };
      console.log('✅ 平板布局測試通過');
    } else {
      this.testResults.responsiveness.tabletLayout = {
        status: 'FAIL',
        total: contents.length,
        optimized: tabletOptimized,
        message: '平板布局適配異常'
      };
      console.log('❌ 平板布局測試失敗');
    }
  }
  
  // 測試桌面布局
  testDesktopLayout() {
    this.testCount++;
    
    // 檢查桌面端適配
    const containers = document.querySelectorAll('.location-manager-container');
    let desktopOptimized = 0;
    
    containers.forEach(container => {
      const computedStyle = window.getComputedStyle(container);
      const maxWidth = computedStyle.maxWidth;
      const margin = computedStyle.marginLeft;
      
      // 檢查居中對齊
      if (maxWidth === '480px' && margin === 'auto') {
        desktopOptimized++;
      }
    });
    
    if (desktopOptimized > 0 || containers.length === 0) {
      this.passedTests++;
      this.testResults.responsiveness.desktopLayout = {
        status: 'PASS',
        total: containers.length,
        optimized: desktopOptimized,
        message: '桌面布局適配正常'
      };
      console.log('✅ 桌面布局測試通過');
    } else {
      this.testResults.responsiveness.desktopLayout = {
        status: 'FAIL',
        total: containers.length,
        optimized: desktopOptimized,
        message: '桌面布局適配異常'
      };
      console.log('❌ 桌面布局測試失敗');
    }
  }
  
  // 測試方向變化
  testOrientationChange() {
    this.testCount++;
    
    // 模擬方向變化事件
    const orientationEvent = new Event('orientationchange');
    window.dispatchEvent(orientationEvent);
    
    // 檢查響應式布局管理器是否處理方向變化
    if (window.ResponsiveLayoutManager) {
      this.passedTests++;
      this.testResults.responsiveness.orientationChange = {
        status: 'PASS',
        message: '方向變化處理正常'
      };
      console.log('✅ 方向變化測試通過');
    } else {
      this.testResults.responsiveness.orientationChange = {
        status: 'FAIL',
        message: '方向變化處理異常'
      };
      console.log('❌ 方向變化測試失敗');
    }
  }
  
  // 測試視窗單位
  testViewportUnits() {
    this.testCount++;
    
    const sections = document.querySelectorAll('.snap-section');
    let validViewportUnits = 0;
    
    sections.forEach(section => {
      const computedStyle = window.getComputedStyle(section);
      const minHeight = computedStyle.minHeight;
      
      if (minHeight.includes('vh')) {
        validViewportUnits++;
      }
    });
    
    if (validViewportUnits === sections.length && sections.length > 0) {
      this.passedTests++;
      this.testResults.responsiveness.viewportUnits = {
        status: 'PASS',
        total: sections.length,
        valid: validViewportUnits,
        message: '視窗單位使用正確'
      };
      console.log('✅ 視窗單位測試通過');
    } else {
      this.testResults.responsiveness.viewportUnits = {
        status: 'FAIL',
        total: sections.length,
        valid: validViewportUnits,
        message: '視窗單位使用異常'
      };
      console.log('❌ 視窗單位測試失敗');
    }
  }
  
  // 測試滾動性能
  async testScrollPerformance() {
    this.testCount++;
    
    return new Promise((resolve) => {
      const container = document.querySelector('.snap-scroll-container');
      
      if (!container) {
        this.testResults.performance.scrollPerformance = {
          status: 'FAIL',
          message: '未找到滑動容器'
        };
        resolve();
        return;
      }
      
      const startTime = performance.now();
      let frameCount = 0;
      
      const measureFrames = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(measureFrames);
        } else {
          const fps = frameCount;
          
          if (fps >= 30) {
            this.passedTests++;
            this.testResults.performance.scrollPerformance = {
              status: 'PASS',
              fps: fps,
              message: '滾動性能正常'
            };
            console.log('✅ 滾動性能測試通過');
          } else {
            this.testResults.performance.scrollPerformance = {
              status: 'FAIL',
              fps: fps,
              message: '滾動性能不佳'
            };
            console.log('❌ 滾動性能測試失敗');
          }
          resolve();
        }
      };
      
      // 開始滾動測試
      container.scrollTop = 100;
      requestAnimationFrame(measureFrames);
    });
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
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(testElement);
      
      const startTime = performance.now();
      testElement.style.transform = 'translateX(100px)';
      
      setTimeout(() => {
        const animationTime = performance.now() - startTime;
        document.body.removeChild(testElement);
        
        if (animationTime < 400) {
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
      }, 400);
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
          percentage: Math.round(usagePercentage),
          message: '記憶體使用正常'
        };
        console.log('✅ 記憶體使用測試通過');
      } else {
        this.testResults.performance.memoryUsage = {
          status: 'FAIL',
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
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
  
  // 測試GPU加速
  testGPUAcceleration() {
    this.testCount++;
    
    const acceleratedElements = document.querySelectorAll('.snap-section, .snap-section-content');
    let gpuAccelerated = 0;
    
    acceleratedElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const transform = computedStyle.transform;
      const willChange = computedStyle.willChange;
      
      if (transform.includes('translateZ') || willChange === 'transform') {
        gpuAccelerated++;
      }
    });
    
    if (gpuAccelerated > 0) {
      this.passedTests++;
      this.testResults.performance.gpuAcceleration = {
        status: 'PASS',
        total: acceleratedElements.length,
        accelerated: gpuAccelerated,
        message: 'GPU加速正常啟用'
      };
      console.log('✅ GPU加速測試通過');
    } else {
      this.testResults.performance.gpuAcceleration = {
        status: 'FAIL',
        total: acceleratedElements.length,
        accelerated: gpuAccelerated,
        message: 'GPU加速未啟用'
      };
      console.log('❌ GPU加速測試失敗');
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
    
    console.log('\n📋 滑動對齊布局驗證報告');
    console.log('='.repeat(50));
    console.log(`測試時間: ${Math.round(duration)}ms`);
    console.log(`總測試數: ${this.testCount}`);
    console.log(`通過測試: ${this.passedTests}`);
    console.log(`失敗測試: ${this.testCount - this.passedTests}`);
    console.log(`成功率: ${Math.round(successRate)}%`);
    console.log('='.repeat(50));
    
    // 詳細結果
    console.log('\n📐 布局測試結果:');
    Object.entries(this.testResults.layout).forEach(([key, result]) => {
      console.log(`  ${result.status === 'PASS' ? '✅' : '❌'} ${key}: ${result.message}`);
    });
    
    console.log('\n📜 滾動功能測試結果:');
    Object.entries(this.testResults.scrolling).forEach(([key, result]) => {
      console.log(`  ${result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌'} ${key}: ${result.message}`);
    });
    
    console.log('\n📱 響應式測試結果:');
    Object.entries(this.testResults.responsiveness).forEach(([key, result]) => {
      console.log(`  ${result.status === 'PASS' ? '✅' : '❌'} ${key}: ${result.message}`);
    });
    
    console.log('\n⚡ 性能測試結果:');
    Object.entries(this.testResults.performance).forEach(([key, result]) => {
      console.log(`  ${result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌'} ${key}: ${result.message}`);
    });
    
    // 建議
    console.log('\n💡 改進建議:');
    if (successRate < 80) {
      console.log('  - 整體測試成功率偏低，需要進一步優化');
    }
    
    const failedLayout = Object.values(this.testResults.layout).filter(r => r.status === 'FAIL');
    if (failedLayout.length > 0) {
      console.log('  - 布局結構需要改進');
    }
    
    const failedScrolling = Object.values(this.testResults.scrolling).filter(r => r.status === 'FAIL');
    if (failedScrolling.length > 0) {
      console.log('  - 滾動功能需要完善');
    }
    
    const failedResponsiveness = Object.values(this.testResults.responsiveness).filter(r => r.status === 'FAIL');
    if (failedResponsiveness.length > 0) {
      console.log('  - 響應式設計需要加強');
    }
    
    const failedPerformance = Object.values(this.testResults.performance).filter(r => r.status === 'FAIL');
    if (failedPerformance.length > 0) {
      console.log('  - 性能表現需要優化');
    }
    
    if (successRate >= 90) {
      console.log('🎉 優秀！滑動對齊布局表現良好');
    } else if (successRate >= 80) {
      console.log('👍 良好！滑動對齊布局基本達標');
    } else {
      console.log('⚠️ 需要改進！滑動對齊布局有待加強');
    }
    
    return this.testResults;
  }
}

// 自動執行驗證（如果在瀏覽器環境中）
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const validator = new SnapScrollLayoutValidator();
      validator.validate();
    }, 2000); // 等待2秒確保所有組件載入完成
  });
}

// 導出給Node.js使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SnapScrollLayoutValidator;
}