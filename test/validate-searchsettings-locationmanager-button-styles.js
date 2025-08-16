/**
 * 驗證 SearchSettings 和 LocationManager 組件按鈕樣式更新
 * 測試 ButtonStylesManager 整合和功能正常性
 */

// 測試配置
const TEST_CONFIG = {
  testTimeout: 5000,
  components: [
    'DistanceControl',
    'LocationActions', 
    'QuickLocationButtons'
  ]
};

// 測試結果收集器
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * 主要測試函數
 */
async function runButtonStylesTests() {
  console.log('🧪 開始 SearchSettings 和 LocationManager 按鈕樣式測試...');
  
  try {
    // 1. 測試 ButtonStylesManager 可用性
    await testButtonStylesManagerAvailability();
    
    // 2. 測試 DistanceControl 按鈕樣式
    await testDistanceControlButtons();
    
    // 3. 測試 LocationActions 按鈕樣式
    await testLocationActionsButtons();
    
    // 4. 測試 QuickLocationButtons 按鈕樣式
    await testQuickLocationButtons();
    
    // 5. 測試主題切換相容性
    await testThemeCompatibility();
    
    // 6. 測試觸控優化
    await testTouchOptimization();
    
    // 顯示測試結果
    displayTestResults();
    
  } catch (error) {
    console.error('❌ 測試執行失敗:', error);
    testResults.errors.push(`測試執行失敗: ${error.message}`);
  }
}

/**
 * 測試 ButtonStylesManager 可用性
 */
async function testButtonStylesManagerAvailability() {
  console.log('📋 測試 ButtonStylesManager 可用性...');
  
  try {
    // 檢查 ButtonStylesManager 是否存在
    if (!window.ButtonStylesManager) {
      throw new Error('ButtonStylesManager 未載入');
    }
    
    // 檢查核心函數
    const requiredMethods = ['getButtonClasses', 'getButtonStyle', 'safeGetButtonStyle'];
    for (const method of requiredMethods) {
      if (typeof window.ButtonStylesManager[method] !== 'function') {
        throw new Error(`ButtonStylesManager.${method} 函數不存在`);
      }
    }
    
    // 測試基本功能
    const testStyle = window.ButtonStylesManager.getButtonStyle({
      variant: 'primary',
      state: 'normal'
    });
    
    if (!testStyle || typeof testStyle !== 'object') {
      throw new Error('getButtonStyle 返回無效結果');
    }
    
    // 檢查必要的樣式屬性
    const requiredProps = ['margin', 'touchAction'];
    for (const prop of requiredProps) {
      if (!(prop in testStyle)) {
        throw new Error(`樣式缺少必要屬性: ${prop}`);
      }
    }
    
    testResults.passed++;
    console.log('✅ ButtonStylesManager 可用性測試通過');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`ButtonStylesManager 可用性測試失敗: ${error.message}`);
    console.error('❌ ButtonStylesManager 可用性測試失敗:', error.message);
  }
}

/**
 * 測試 DistanceControl 按鈕樣式
 */
async function testDistanceControlButtons() {
  console.log('📋 測試 DistanceControl 按鈕樣式...');
  
  try {
    // 創建測試容器
    const testContainer = document.createElement('div');
    testContainer.id = 'distance-control-test';
    document.body.appendChild(testContainer);
    
    // 模擬 DistanceControl 組件的按鈕
    const testButtons = [
      { value: 200, label: '200m', active: true },
      { value: 1000, label: '1km', active: false }
    ];
    
    testButtons.forEach(({ value, label, active }) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.className = 'flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 min-h-[48px] border-2 shadow-md';
      
      // 應用 ButtonStylesManager 樣式
      const buttonStyle = window.ButtonStylesManager.getButtonStyle({
        variant: active ? 'primary' : 'secondary',
        state: 'normal'
      });
      
      Object.assign(button.style, buttonStyle);
      testContainer.appendChild(button);
      
      // 驗證樣式應用
      if (button.style.margin !== '0') {
        throw new Error(`按鈕 ${label} margin 設定錯誤`);
      }
      
      if (button.style.touchAction !== 'manipulation') {
        throw new Error(`按鈕 ${label} touchAction 設定錯誤`);
      }
    });
    
    testResults.passed++;
    console.log('✅ DistanceControl 按鈕樣式測試通過');
    
    // 清理測試容器
    document.body.removeChild(testContainer);
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`DistanceControl 按鈕樣式測試失敗: ${error.message}`);
    console.error('❌ DistanceControl 按鈕樣式測試失敗:', error.message);
  }
}

/**
 * 測試 LocationActions 按鈕樣式
 */
async function testLocationActionsButtons() {
  console.log('📋 測試 LocationActions 按鈕樣式...');
  
  try {
    // 創建測試容器
    const testContainer = document.createElement('div');
    testContainer.id = 'location-actions-test';
    document.body.appendChild(testContainer);
    
    // 測試自動定位按鈕
    const autoButton = document.createElement('button');
    autoButton.className = window.ButtonStylesManager.getButtonClasses('primary', 'standard');
    const autoButtonStyle = window.ButtonStylesManager.getButtonStyle({
      variant: 'primary',
      state: 'normal'
    });
    Object.assign(autoButton.style, autoButtonStyle);
    testContainer.appendChild(autoButton);
    
    // 測試手動定位按鈕
    const manualButton = document.createElement('button');
    manualButton.className = window.ButtonStylesManager.getButtonClasses('secondary', 'standard');
    const manualButtonStyle = window.ButtonStylesManager.getButtonStyle({
      variant: 'secondary',
      state: 'disabled'
    });
    Object.assign(manualButton.style, manualButtonStyle);
    testContainer.appendChild(manualButton);
    
    // 驗證樣式
    [autoButton, manualButton].forEach((button, index) => {
      const buttonType = index === 0 ? '自動定位' : '手動定位';
      
      if (button.style.margin !== '0') {
        throw new Error(`${buttonType}按鈕 margin 設定錯誤`);
      }
      
      if (button.style.touchAction !== 'manipulation') {
        throw new Error(`${buttonType}按鈕 touchAction 設定錯誤`);
      }
      
      if (!button.className.includes('h-[72px]')) {
        throw new Error(`${buttonType}按鈕缺少標準高度類別`);
      }
    });
    
    testResults.passed++;
    console.log('✅ LocationActions 按鈕樣式測試通過');
    
    // 清理測試容器
    document.body.removeChild(testContainer);
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`LocationActions 按鈕樣式測試失敗: ${error.message}`);
    console.error('❌ LocationActions 按鈕樣式測試失敗:', error.message);
  }
}

/**
 * 測試 QuickLocationButtons 按鈕樣式
 */
async function testQuickLocationButtons() {
  console.log('📋 測試 QuickLocationButtons 按鈕樣式...');
  
  try {
    // 創建測試容器
    const testContainer = document.createElement('div');
    testContainer.id = 'quick-location-test';
    document.body.appendChild(testContainer);
    
    // 測試住家和公司按鈕的不同狀態
    const buttonStates = [
      { type: 'home', variant: 'primary', state: 'normal' },
      { type: 'office', variant: 'success', state: 'normal' },
      { type: 'home', variant: 'secondary', state: 'normal' }
    ];
    
    buttonStates.forEach(({ type, variant, state }) => {
      const button = document.createElement('button');
      button.className = window.ButtonStylesManager.getButtonClasses(variant, 'standard');
      const buttonStyle = window.ButtonStylesManager.getButtonStyle({
        variant,
        state
      });
      Object.assign(button.style, buttonStyle);
      testContainer.appendChild(button);
      
      // 驗證樣式
      if (button.style.margin !== '0') {
        throw new Error(`${type}按鈕 margin 設定錯誤`);
      }
      
      if (button.style.touchAction !== 'manipulation') {
        throw new Error(`${type}按鈕 touchAction 設定錯誤`);
      }
    });
    
    testResults.passed++;
    console.log('✅ QuickLocationButtons 按鈕樣式測試通過');
    
    // 清理測試容器
    document.body.removeChild(testContainer);
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`QuickLocationButtons 按鈕樣式測試失敗: ${error.message}`);
    console.error('❌ QuickLocationButtons 按鈕樣式測試失敗:', error.message);
  }
}

/**
 * 測試主題切換相容性
 */
async function testThemeCompatibility() {
  console.log('📋 測試主題切換相容性...');
  
  try {
    // 測試不同主題下的按鈕樣式
    const themes = ['maizuru', 'qisu', 'muluInn'];
    
    for (const theme of themes) {
      // 模擬主題切換
      document.documentElement.setAttribute('data-theme', theme);
      
      // 測試按鈕樣式是否正確使用 CSS 變數
      const buttonStyle = window.ButtonStylesManager.getButtonStyle({
        variant: 'primary',
        state: 'normal'
      });
      
      // 檢查是否使用了 CSS 變數
      if (!buttonStyle.background.includes('var(--theme-primary)')) {
        throw new Error(`主題 ${theme} 下按鈕未使用正確的 CSS 變數`);
      }
    }
    
    testResults.passed++;
    console.log('✅ 主題切換相容性測試通過');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`主題切換相容性測試失敗: ${error.message}`);
    console.error('❌ 主題切換相容性測試失敗:', error.message);
  }
}

/**
 * 測試觸控優化
 */
async function testTouchOptimization() {
  console.log('📋 測試觸控優化...');
  
  try {
    // 測試所有按鈕變體的觸控優化
    const variants = ['primary', 'secondary', 'success'];
    
    variants.forEach(variant => {
      const buttonStyle = window.ButtonStylesManager.getButtonStyle({
        variant,
        state: 'normal'
      });
      
      // 檢查觸控優化屬性
      if (buttonStyle.touchAction !== 'manipulation') {
        throw new Error(`${variant} 變體缺少 touchAction 優化`);
      }
      
      if (buttonStyle.margin !== 0) {
        throw new Error(`${variant} 變體缺少 margin 修正`);
      }
    });
    
    testResults.passed++;
    console.log('✅ 觸控優化測試通過');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`觸控優化測試失敗: ${error.message}`);
    console.error('❌ 觸控優化測試失敗:', error.message);
  }
}

/**
 * 顯示測試結果
 */
function displayTestResults() {
  console.log('\n📊 測試結果摘要:');
  console.log(`✅ 通過: ${testResults.passed}`);
  console.log(`❌ 失敗: ${testResults.failed}`);
  console.log(`📝 總計: ${testResults.passed + testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 錯誤詳情:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 所有測試通過！SearchSettings 和 LocationManager 按鈕樣式更新成功！');
  } else {
    console.log('\n⚠️ 部分測試失敗，請檢查上述錯誤並修正。');
  }
}

// 導出測試函數
if (typeof window !== 'undefined') {
  window.runButtonStylesTests = runButtonStylesTests;
}

// 如果直接執行此腳本，自動運行測試
if (typeof window !== 'undefined' && window.location) {
  // 等待頁面載入完成後執行測試
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runButtonStylesTests);
  } else {
    // 延遲執行以確保所有組件都已載入
    setTimeout(runButtonStylesTests, 1000);
  }
}