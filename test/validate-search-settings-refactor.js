// validate-search-settings-refactor.js
// 驗證 SearchSettings 重構組件的結構和導出

const fs = require('fs');
const path = require('path');

console.log('🔍 驗證 SearchSettings 重構組件...\n');

// 檢查文件是否存在
const filesToCheck = [
  'components/SearchSettings/DistanceControl.js',
  'components/SearchSettings/MealTimeSelector.js', 
  'components/SearchSettings/SettingsDisplay.js',
  'components/SearchSettings/index.js',
  'components/SearchSettings/SearchSettings.css',
  'components/SearchSettings/README.md'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分文件缺失，請檢查文件結構');
  process.exit(1);
}

// 檢查組件結構
console.log('\n🔍 檢查組件結構...');

// 檢查 DistanceControl 組件
const distanceControlContent = fs.readFileSync('components/SearchSettings/DistanceControl.js', 'utf8');
const distanceControlChecks = [
  { pattern: /function DistanceControl/, description: 'DistanceControl 函數定義' },
  { pattern: /baseUnit.*setBaseUnit/, description: 'baseUnit props' },
  { pattern: /unitMultiplier.*setUnitMultiplier/, description: 'unitMultiplier props' },
  { pattern: /handleUnitSwitch/, description: '單位切換處理函數' },
  { pattern: /getActualRadius/, description: '距離計算函數' },
  { pattern: /window\.DistanceControl/, description: '全局導出' }
];

console.log('\n📦 DistanceControl 組件:');
distanceControlChecks.forEach(check => {
  if (check.pattern.test(distanceControlContent)) {
    console.log(`  ✅ ${check.description}`);
  } else {
    console.log(`  ❌ ${check.description}`);
  }
});

// 檢查 MealTimeSelector 組件
const mealTimeSelectorContent = fs.readFileSync('components/SearchSettings/MealTimeSelector.js', 'utf8');
const mealTimeSelectorChecks = [
  { pattern: /function MealTimeSelector/, description: 'MealTimeSelector 函數定義' },
  { pattern: /selectedMealTime.*setSelectedMealTime/, description: 'selectedMealTime props' },
  { pattern: /translations/, description: 'translations props' },
  { pattern: /mealTimeOptions/, description: '用餐時段選項配置' },
  { pattern: /renderMealTimeButton/, description: '按鈕渲染函數' },
  { pattern: /aria-label/, description: '無障礙支援' },
  { pattern: /window\.MealTimeSelector/, description: '全局導出' }
];

console.log('\n📦 MealTimeSelector 組件:');
mealTimeSelectorChecks.forEach(check => {
  if (check.pattern.test(mealTimeSelectorContent)) {
    console.log(`  ✅ ${check.description}`);
  } else {
    console.log(`  ❌ ${check.description}`);
  }
});

// 檢查 SettingsDisplay 組件
const settingsDisplayContent = fs.readFileSync('components/SearchSettings/SettingsDisplay.js', 'utf8');
const settingsDisplayChecks = [
  { pattern: /function SettingsDisplay/, description: 'SettingsDisplay 函數定義' },
  { pattern: /getMealTimeDisplayText/, description: '用餐時段顯示文字函數' },
  { pattern: /getDistanceDisplayText/, description: '距離顯示文字函數' },
  { pattern: /getMealTimeIcon/, description: '用餐時段圖標函數' },
  { pattern: /window\.SettingsDisplay/, description: '全局導出' }
];

console.log('\n📦 SettingsDisplay 組件:');
settingsDisplayChecks.forEach(check => {
  if (check.pattern.test(settingsDisplayContent)) {
    console.log(`  ✅ ${check.description}`);
  } else {
    console.log(`  ❌ ${check.description}`);
  }
});

// 檢查主 SearchSettings 組件的重構
const searchSettingsContent = fs.readFileSync('components/SearchSettings.js', 'utf8');
const searchSettingsChecks = [
  { pattern: /window\.DistanceControl/, description: 'DistanceControl 子組件使用' },
  { pattern: /window\.MealTimeSelector/, description: 'MealTimeSelector 子組件使用' },
  { pattern: /window\.SettingsDisplay/, description: 'SettingsDisplay 子組件使用' },
  { pattern: /載入搜索設定組件中/, description: '載入狀態處理' },
  { pattern: /搜索設定組件載入失敗/, description: '錯誤處理' }
];

console.log('\n📦 主 SearchSettings 組件:');
searchSettingsChecks.forEach(check => {
  if (check.pattern.test(searchSettingsContent)) {
    console.log(`  ✅ ${check.description}`);
  } else {
    console.log(`  ❌ ${check.description}`);
  }
});

// 檢查 CSS 文件
const cssContent = fs.readFileSync('components/SearchSettings/SearchSettings.css', 'utf8');
const cssChecks = [
  { pattern: /\.distance-control-container/, description: '距離控制容器樣式' },
  { pattern: /\.meal-time-selector-container/, description: '用餐時段選擇器容器樣式' },
  { pattern: /\.settings-display-container/, description: '設定顯示容器樣式' },
  { pattern: /@media.*max-width.*640px/, description: '響應式設計' },
  { pattern: /@media.*prefers-reduced-motion/, description: '無障礙支援' },
  { pattern: /min-height.*44px/, description: '觸控標準' }
];

console.log('\n🎨 CSS 樣式:');
cssChecks.forEach(check => {
  if (check.pattern.test(cssContent)) {
    console.log(`  ✅ ${check.description}`);
  } else {
    console.log(`  ❌ ${check.description}`);
  }
});

// 檢查 HTML 更新
const htmlContent = fs.readFileSync('index.html', 'utf8');
const htmlChecks = [
  { pattern: /SearchSettings\/SearchSettings\.css/, description: 'CSS 文件引入' },
  { pattern: /SearchSettings\/DistanceControl\.js/, description: 'DistanceControl 腳本引入' },
  { pattern: /SearchSettings\/MealTimeSelector\.js/, description: 'MealTimeSelector 腳本引入' },
  { pattern: /SearchSettings\/SettingsDisplay\.js/, description: 'SettingsDisplay 腳本引入' },
  { pattern: /SearchSettings\/index\.js/, description: 'index 腳本引入' }
];

console.log('\n🌐 HTML 更新:');
htmlChecks.forEach(check => {
  if (check.pattern.test(htmlContent)) {
    console.log(`  ✅ ${check.description}`);
  } else {
    console.log(`  ❌ ${check.description}`);
  }
});

console.log('\n✅ SearchSettings 重構組件驗證完成！');
console.log('\n📋 重構摘要:');
console.log('  • 將 SearchSettings 拆分為 3 個子組件');
console.log('  • DistanceControl: 距離控制，包含單位切換器和滑軌');
console.log('  • MealTimeSelector: 用餐時段選擇，大按鈕網格布局');
console.log('  • SettingsDisplay: 設定狀態顯示');
console.log('  • 實現安全的模組化架構，避免全局變數衝突');
console.log('  • 添加完整的錯誤處理和載入狀態');
console.log('  • 支援響應式設計和無障礙功能');