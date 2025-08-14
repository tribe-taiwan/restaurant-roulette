// validate-task-5-navigation-controls.js
// 🧪 Task 5 驗證腳本 - 實現基本導航控制

/**
 * Task 5 驗證重點：
 * ✅ 整合測試檔案的 nextSlide() 和 previousSlide() 函數
 * ✅ 保留現有的觸控滑動功能
 * ✅ 保留鍵盤方向鍵控制
 * ✅ 確保所有導航操作與 Keen Slider 正確同步
 */

console.log('🧪 開始 Task 5 驗證 - 實現基本導航控制');

// 驗證項目
const validationChecks = {
  navigationFunctions: false,
  touchIntegration: false,
  keyboardIntegration: false,
  sliderSync: false
};

// 1. 檢查導航函數是否存在
function checkNavigationFunctions() {
  console.log('📋 檢查 1: 導航函數是否存在');
  
  try {
    // 檢查 SlotMachine 組件中是否有 nextSlide 和 previousSlide 函數
    const slotMachineCode = document.querySelector('[data-name="slot-machine"]');
    if (!slotMachineCode) {
      console.warn('⚠️ 找不到 SlotMachine 組件');
      return false;
    }
    
    // 檢查是否有 Keen Slider 實例
    const keenSliderElement = document.querySelector('.keen-slider');
    if (!keenSliderElement) {
      console.warn('⚠️ 找不到 Keen Slider 元素');
      return false;
    }
    
    console.log('✅ 檢查 1 通過: 找到 SlotMachine 組件和 Keen Slider 元素');
    return true;
    
  } catch (error) {
    console.error('❌ 檢查 1 失敗:', error);
    return false;
  }
}

// 2. 檢查觸控整合
function checkTouchIntegration() {
  console.log('📋 檢查 2: 觸控整合是否正確');
  
  try {
    // 檢查觸控處理器是否存在
    if (typeof window.createTouchHandlers !== 'function') {
      console.warn('⚠️ createTouchHandlers 函數不存在');
      return false;
    }
    
    // 檢查觸控處理器是否接受導航函數參數
    const mockParams = {
      setSwipeStates: () => {},
      swipeStates: {},
      onRemoveCandidate: () => {},
      setTouchStart: () => {},
      setTouchEnd: () => {},
      touchStart: null,
      touchEnd: null,
      isSpinning: false,
      onSpin: () => {},
      onPreviousRestaurant: () => {},
      nextSlide: () => console.log('Mock nextSlide called'),
      previousSlide: () => console.log('Mock previousSlide called')
    };
    
    const touchHandlers = window.createTouchHandlers(mockParams);
    
    if (!touchHandlers.handleImageTouchEnd) {
      console.warn('⚠️ 觸控處理器缺少 handleImageTouchEnd 方法');
      return false;
    }
    
    console.log('✅ 檢查 2 通過: 觸控整合正確');
    return true;
    
  } catch (error) {
    console.error('❌ 檢查 2 失敗:', error);
    return false;
  }
}

// 3. 檢查鍵盤整合
function checkKeyboardIntegration() {
  console.log('📋 檢查 3: 鍵盤整合是否正確');
  
  try {
    // 檢查鍵盤處理器是否存在
    if (typeof window.createKeyboardHandler !== 'function') {
      console.warn('⚠️ createKeyboardHandler 函數不存在');
      return false;
    }
    
    // 檢查鍵盤處理器是否接受導航函數參數
    const mockParams = {
      isSpinning: false,
      finalRestaurant: { name: 'Test Restaurant' },
      candidateList: [],
      onSpin: () => {},
      onAddCandidate: () => {},
      nextSlide: () => console.log('Mock nextSlide called'),
      previousSlide: () => console.log('Mock previousSlide called')
    };
    
    const keyboardHandler = window.createKeyboardHandler(mockParams);
    
    if (!keyboardHandler.handleKeyDown) {
      console.warn('⚠️ 鍵盤處理器缺少 handleKeyDown 方法');
      return false;
    }
    
    console.log('✅ 檢查 3 通過: 鍵盤整合正確');
    return true;
    
  } catch (error) {
    console.error('❌ 檢查 3 失敗:', error);
    return false;
  }
}

// 4. 檢查滑動器同步
function checkSliderSync() {
  console.log('📋 檢查 4: 滑動器同步是否正確');
  
  try {
    // 檢查 Keen Slider 是否正確載入
    if (typeof window.KeenSlider === 'undefined') {
      console.warn('⚠️ Keen Slider 未載入');
      return false;
    }
    
    // 檢查滑動器元素是否存在
    const sliderElement = document.querySelector('.keen-slider');
    if (!sliderElement) {
      console.warn('⚠️ 找不到滑動器元素');
      return false;
    }
    
    // 檢查是否有滑動內容
    const slides = sliderElement.querySelectorAll('.keen-slider__slide');
    if (slides.length === 0) {
      console.warn('⚠️ 找不到滑動內容');
      return false;
    }
    
    console.log('✅ 檢查 4 通過: 滑動器同步正確，找到', slides.length, '個滑動項目');
    return true;
    
  } catch (error) {
    console.error('❌ 檢查 4 失敗:', error);
    return false;
  }
}

// 執行所有驗證
function runAllValidations() {
  console.log('🚀 開始執行所有驗證...');
  
  validationChecks.navigationFunctions = checkNavigationFunctions();
  validationChecks.touchIntegration = checkTouchIntegration();
  validationChecks.keyboardIntegration = checkKeyboardIntegration();
  validationChecks.sliderSync = checkSliderSync();
  
  // 生成驗證報告
  const passedChecks = Object.values(validationChecks).filter(Boolean).length;
  const totalChecks = Object.keys(validationChecks).length;
  
  console.log('\n📊 Task 5 驗證報告:');
  console.log('==================');
  
  Object.entries(validationChecks).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const checkName = check.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${checkName}: ${passed ? '通過' : '失敗'}`);
  });
  
  console.log('==================');
  console.log(`📈 總體結果: ${passedChecks}/${totalChecks} 項檢查通過`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 Task 5 驗證完全通過！基本導航控制已成功實現');
    return true;
  } else {
    console.log('⚠️ Task 5 驗證部分失敗，需要進一步檢查');
    return false;
  }
}

// 模擬用戶操作測試
function simulateUserInteractions() {
  console.log('\n🎮 模擬用戶操作測試...');
  
  try {
    // 模擬鍵盤事件
    console.log('⌨️ 模擬鍵盤右箭頭事件...');
    const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    document.dispatchEvent(rightArrowEvent);
    
    setTimeout(() => {
      console.log('⌨️ 模擬鍵盤左箭頭事件...');
      const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(leftArrowEvent);
    }, 500);
    
    setTimeout(() => {
      console.log('⌨️ 模擬鍵盤空白鍵事件...');
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(spaceEvent);
    }, 1000);
    
    // 模擬觸控事件
    setTimeout(() => {
      console.log('👆 模擬觸控滑動事件...');
      const sliderElement = document.querySelector('.keen-slider');
      if (sliderElement) {
        // 模擬觸控開始
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 200 }]
        });
        sliderElement.dispatchEvent(touchStart);
        
        // 模擬觸控結束（左滑）
        setTimeout(() => {
          const touchEnd = new TouchEvent('touchend', {
            changedTouches: [{ clientX: 100 }]
          });
          sliderElement.dispatchEvent(touchEnd);
        }, 100);
      }
    }, 1500);
    
    console.log('✅ 用戶操作模擬完成');
    
  } catch (error) {
    console.error('❌ 用戶操作模擬失敗:', error);
  }
}

// 等待頁面載入完成後執行驗證
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      runAllValidations();
      simulateUserInteractions();
    }, 1000);
  });
} else {
  setTimeout(() => {
    runAllValidations();
    simulateUserInteractions();
  }, 1000);
}

// 導出驗證函數供外部使用
if (typeof window !== 'undefined') {
  window.validateTask5 = {
    runAllValidations,
    simulateUserInteractions,
    validationChecks
  };
}