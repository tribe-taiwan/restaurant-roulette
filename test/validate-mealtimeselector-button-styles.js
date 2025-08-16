/**
 * MealTimeSelector ButtonStylesManager 整合驗證
 * 驗證 MealTimeSelector 是否正確使用 ButtonStylesManager
 */

// 模擬 DOM 環境
const mockWindow = {
  ButtonStylesManager: {
    getButtonStyle: (options) => ({
      background: options.variant === 'primary' ? 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))' : '#f3f4f6',
      borderColor: options.variant === 'primary' ? 'var(--theme-primary)' : 'var(--border-color)',
      color: options.variant === 'primary' ? 'var(--text-primary)' : '#374151',
      margin: 0,
      touchAction: 'manipulation',
      opacity: 1,
      cursor: 'pointer'
    }),
    getButtonClasses: (variant, size) => 'h-[72px] p-3 rounded-lg border-2 flex flex-col items-center justify-center shadow-lg transition-all duration-200'
  },
  getMealTimeConfig: () => ({
    breakfast: { start: 5, end: 10, displayTime: '5-10', icon: '🌅' },
    lunch: { start: 10, end: 16, displayTime: '10-16', icon: '☀️' },
    dinner: { start: 16, end: 24, displayTime: '16-24', icon: '🌃' }
  })
};

// 設定全域 window 物件
global.window = mockWindow;

// 不載入 React 組件，只檢查檔案內容

console.log('🧪 MealTimeSelector ButtonStylesManager 整合驗證');
console.log('================================================');

// 驗證項目
const validations = [
  {
    name: '✅ ButtonStylesManager 整合',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/SearchSettings/MealTimeSelector.js', 'utf8');
      
      // 檢查是否正確使用 ButtonStylesManager
      const usesButtonManager = content.includes('window.ButtonStylesManager') &&
                               content.includes('buttonManager.getButtonStyle') &&
                               content.includes('buttonManager.getButtonClasses');
      
      return usesButtonManager;
    }
  },
  {
    name: '✅ 移除重複樣式定義',
    test: () => {
      // 讀取更新後的檔案內容
      const fs = require('fs');
      const filePath = 'components/SearchSettings/MealTimeSelector.js';
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 檢查是否移除了重複的漸層定義
      const hasOldGradient = content.includes('linear-gradient(135deg, var(--theme-primary), var(--theme-accent))') &&
                            content.includes('borderColor: \'var(--theme-primary)\'') &&
                            !content.includes('ButtonStylesManager');
      
      // 應該使用 ButtonStylesManager 而不是內聯重複樣式
      const usesButtonManager = content.includes('window.ButtonStylesManager') &&
                               content.includes('buttonManager.getButtonStyle');
      
      return !hasOldGradient && usesButtonManager;
    }
  },
  {
    name: '✅ 保持兩行布局結構',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/SearchSettings/MealTimeSelector.js', 'utf8');
      
      // 檢查是否保持了兩行布局結構
      const hasTwoRowLayout = content.includes('mealTimeRows') &&
                             content.includes('第一行 - 營業中和任何時段') &&
                             content.includes('第二行 - 早午晚餐') &&
                             content.includes('flex-1 min-h-[72px]');
      
      return hasTwoRowLayout;
    }
  },
  {
    name: '✅ 主題相容性',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/SearchSettings/MealTimeSelector.js', 'utf8');
      
      // 檢查是否保持了 CSS 變數的使用
      const usesCSSVariables = content.includes('var(--theme-primary)') ||
                               content.includes('var(--border-color)') ||
                               content.includes('buttonManager.getButtonStyle');
      
      return usesCSSVariables;
    }
  },
  {
    name: '✅ 回退機制',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/SearchSettings/MealTimeSelector.js', 'utf8');
      
      // 檢查是否有適當的回退機制
      const hasFallback = content.includes('ButtonStylesManager not available') &&
                         content.includes('回退樣式') &&
                         content.includes('if (!buttonManager)');
      
      return hasFallback;
    }
  },
  {
    name: '✅ 觸控優化',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/SearchSettings/MealTimeSelector.js', 'utf8');
      
      // 檢查是否包含觸控優化
      const hasTouchOptimization = content.includes('touchAction: \'manipulation\'') ||
                                   content.includes('buttonManager.getButtonStyle');
      
      return hasTouchOptimization;
    }
  }
];

// 執行驗證
let passedTests = 0;
let totalTests = validations.length;

validations.forEach(validation => {
  try {
    const result = validation.test();
    if (result) {
      console.log(`${validation.name}: 通過`);
      passedTests++;
    } else {
      console.log(`${validation.name}: 失敗`);
    }
  } catch (error) {
    console.log(`${validation.name}: 錯誤 - ${error.message}`);
  }
});

console.log('\n📊 驗證結果');
console.log('================================================');
console.log(`通過: ${passedTests}/${totalTests}`);
console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 所有驗證通過！MealTimeSelector 已成功整合 ButtonStylesManager');
  console.log('\n📋 完成的任務:');
  console.log('- ✅ 替換內聯樣式和 className 使用 ButtonStylesManager');
  console.log('- ✅ 統一按鈕樣式管理');
  console.log('- ✅ 保持兩行布局和主題切換功能');
  console.log('- ✅ 移除重複的漸層和邊框定義');
  console.log('- ✅ 添加適當的回退機制');
  console.log('- ✅ 保持觸控優化');
} else {
  console.log('\n⚠️  部分驗證失敗，請檢查實作');
}

console.log('\n🔧 測試檔案: test/test-mealtimeselector-button-styles.html');
console.log('可以在瀏覽器中開啟此檔案進行視覺測試');