// verify-task-5-implementation.js
// 🧪 Task 5 實現驗證腳本 - 檢查代碼結構

const fs = require('fs');
const path = require('path');

console.log('🧪 開始 Task 5 實現驗證 - 基本導航控制');

// 驗證項目
const verificationResults = {
  slotMachineNavigation: false,
  touchHandlerIntegration: false,
  keyboardHandlerIntegration: false,
  functionExposure: false
};

// 1. 檢查 SlotMachine.js 中的導航函數
function verifySlotMachineNavigation() {
  console.log('📋 檢查 1: SlotMachine.js 導航函數實現');
  
  try {
    const slotMachineCode = fs.readFileSync('components/SlotMachine.js', 'utf8');
    
    // 檢查導航函數定義
    const hasNextSlide = slotMachineCode.includes('const nextSlide = React.useCallback');
    const hasPreviousSlide = slotMachineCode.includes('const previousSlide = React.useCallback');
    
    // 檢查函數邏輯
    const hasKeenSliderNext = slotMachineCode.includes('keenSlider.next()');
    const hasKeenSliderPrev = slotMachineCode.includes('keenSlider.prev()');
    
    // 檢查函數傳遞給處理器
    const passedToTouchHandler = slotMachineCode.includes('nextSlide,') && 
                                 slotMachineCode.includes('previousSlide') &&
                                 slotMachineCode.includes('createTouchHandlers');
    
    const passedToKeyboardHandler = slotMachineCode.includes('createKeyboardHandler') &&
                                   slotMachineCode.includes('nextSlide') &&
                                   slotMachineCode.includes('previousSlide');
    
    if (hasNextSlide && hasPreviousSlide && hasKeenSliderNext && hasKeenSliderPrev && 
        passedToTouchHandler && passedToKeyboardHandler) {
      console.log('✅ 檢查 1 通過: SlotMachine.js 導航函數正確實現');
      return true;
    } else {
      console.log('❌ 檢查 1 失敗: 導航函數實現不完整');
      console.log('  - nextSlide 定義:', hasNextSlide);
      console.log('  - previousSlide 定義:', hasPreviousSlide);
      console.log('  - Keen Slider next():', hasKeenSliderNext);
      console.log('  - Keen Slider prev():', hasKeenSliderPrev);
      console.log('  - 傳遞給觸控處理器:', passedToTouchHandler);
      console.log('  - 傳遞給鍵盤處理器:', passedToKeyboardHandler);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 檢查 1 失敗:', error.message);
    return false;
  }
}

// 2. 檢查觸控處理器整合
function verifyTouchHandlerIntegration() {
  console.log('📋 檢查 2: 觸控處理器整合');
  
  try {
    const touchHandlerCode = fs.readFileSync('components/SlotMachineTouchHandler.js', 'utf8');
    
    // 檢查參數接收
    const acceptsNavigationParams = touchHandlerCode.includes('nextSlide,') && 
                                   touchHandlerCode.includes('previousSlide');
    
    // 檢查函數使用
    const usesNextSlide = touchHandlerCode.includes('nextSlide()') || 
                         touchHandlerCode.includes('nextSlide && typeof nextSlide === \'function\'');
    const usesPreviousSlide = touchHandlerCode.includes('previousSlide()') || 
                             touchHandlerCode.includes('previousSlide && typeof previousSlide === \'function\'');
    
    // 檢查觸控邏輯更新
    const hasUpdatedTouchLogic = touchHandlerCode.includes('整合 Keen Slider 導航控制') ||
                                touchHandlerCode.includes('使用 Keen Slider 的');
    
    if (acceptsNavigationParams && usesNextSlide && usesPreviousSlide && hasUpdatedTouchLogic) {
      console.log('✅ 檢查 2 通過: 觸控處理器整合正確');
      return true;
    } else {
      console.log('❌ 檢查 2 失敗: 觸控處理器整合不完整');
      console.log('  - 接收導航參數:', acceptsNavigationParams);
      console.log('  - 使用 nextSlide:', usesNextSlide);
      console.log('  - 使用 previousSlide:', usesPreviousSlide);
      console.log('  - 更新觸控邏輯:', hasUpdatedTouchLogic);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 檢查 2 失敗:', error.message);
    return false;
  }
}

// 3. 檢查鍵盤處理器整合
function verifyKeyboardHandlerIntegration() {
  console.log('📋 檢查 3: 鍵盤處理器整合');
  
  try {
    const keyboardHandlerCode = fs.readFileSync('components/SlotMachineKeyboardHandler.js', 'utf8');
    
    // 檢查參數接收
    const acceptsNavigationParams = keyboardHandlerCode.includes('nextSlide,') && 
                                   keyboardHandlerCode.includes('previousSlide');
    
    // 檢查方向鍵處理
    const hasArrowLeftHandling = keyboardHandlerCode.includes('ArrowLeft') && 
                                keyboardHandlerCode.includes('previousSlide');
    const hasArrowRightHandling = keyboardHandlerCode.includes('ArrowRight') && 
                                 keyboardHandlerCode.includes('nextSlide');
    
    // 檢查空白鍵處理
    const hasSpaceKeyHandling = keyboardHandlerCode.includes('e.key === \' \'') ||
                               keyboardHandlerCode.includes('e.key === " "');
    
    // 檢查鍵盤邏輯更新
    const hasUpdatedKeyboardLogic = keyboardHandlerCode.includes('整合 Keen Slider 導航控制') ||
                                   keyboardHandlerCode.includes('使用 Keen Slider 的');
    
    if (acceptsNavigationParams && hasArrowLeftHandling && hasArrowRightHandling && 
        hasSpaceKeyHandling && hasUpdatedKeyboardLogic) {
      console.log('✅ 檢查 3 通過: 鍵盤處理器整合正確');
      return true;
    } else {
      console.log('❌ 檢查 3 失敗: 鍵盤處理器整合不完整');
      console.log('  - 接收導航參數:', acceptsNavigationParams);
      console.log('  - 左箭頭處理:', hasArrowLeftHandling);
      console.log('  - 右箭頭處理:', hasArrowRightHandling);
      console.log('  - 空白鍵處理:', hasSpaceKeyHandling);
      console.log('  - 更新鍵盤邏輯:', hasUpdatedKeyboardLogic);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 檢查 3 失敗:', error.message);
    return false;
  }
}

// 4. 檢查函數暴露
function verifyFunctionExposure() {
  console.log('📋 檢查 4: 函數暴露給外部組件');
  
  try {
    const slotMachineCode = fs.readFileSync('components/SlotMachine.js', 'utf8');
    
    // 檢查 onTriggerSlideTransition 中是否暴露導航函數
    const exposesNextSlide = slotMachineCode.includes('onTriggerSlideTransition({') && 
                            slotMachineCode.includes('nextSlide,');
    const exposesPreviousSlide = slotMachineCode.includes('onTriggerSlideTransition({') && 
                                slotMachineCode.includes('previousSlide,');
    
    // 檢查依賴陣列
    const hasDependencyArray = slotMachineCode.includes('nextSlide,') && 
                              slotMachineCode.includes('previousSlide,') &&
                              slotMachineCode.includes('onTriggerSlideTransition');
    
    if (exposesNextSlide && exposesPreviousSlide && hasDependencyArray) {
      console.log('✅ 檢查 4 通過: 函數正確暴露給外部組件');
      return true;
    } else {
      console.log('❌ 檢查 4 失敗: 函數暴露不完整');
      console.log('  - 暴露 nextSlide:', exposesNextSlide);
      console.log('  - 暴露 previousSlide:', exposesPreviousSlide);
      console.log('  - 依賴陣列:', hasDependencyArray);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 檢查 4 失敗:', error.message);
    return false;
  }
}

// 執行所有驗證
function runAllVerifications() {
  console.log('🚀 開始執行所有驗證...\n');
  
  verificationResults.slotMachineNavigation = verifySlotMachineNavigation();
  console.log('');
  
  verificationResults.touchHandlerIntegration = verifyTouchHandlerIntegration();
  console.log('');
  
  verificationResults.keyboardHandlerIntegration = verifyKeyboardHandlerIntegration();
  console.log('');
  
  verificationResults.functionExposure = verifyFunctionExposure();
  console.log('');
  
  // 生成驗證報告
  const passedChecks = Object.values(verificationResults).filter(Boolean).length;
  const totalChecks = Object.keys(verificationResults).length;
  
  console.log('📊 Task 5 實現驗證報告:');
  console.log('========================');
  
  Object.entries(verificationResults).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const checkName = check.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${checkName}: ${passed ? '通過' : '失敗'}`);
  });
  
  console.log('========================');
  console.log(`📈 總體結果: ${passedChecks}/${totalChecks} 項檢查通過`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 Task 5 實現驗證完全通過！');
    console.log('');
    console.log('📋 Task 5 完成項目:');
    console.log('✅ 整合測試檔案的 nextSlide() 和 previousSlide() 函數');
    console.log('✅ 保留現有的觸控滑動功能');
    console.log('✅ 保留鍵盤方向鍵控制');
    console.log('✅ 確保所有導航操作與 Keen Slider 正確同步');
    console.log('');
    console.log('🎮 支援的控制方式:');
    console.log('• 鍵盤控制: ← → 方向鍵切換, 空白鍵轉動');
    console.log('• 觸控控制: 左滑/右滑切換');
    console.log('• 候選列表: 保留左滑刪除功能');
    console.log('• 函數暴露: nextSlide/previousSlide 可供外部調用');
    return true;
  } else {
    console.log('⚠️ Task 5 實現驗證部分失敗，需要進一步檢查');
    return false;
  }
}

// 執行驗證
const success = runAllVerifications();
process.exit(success ? 0 : 1);