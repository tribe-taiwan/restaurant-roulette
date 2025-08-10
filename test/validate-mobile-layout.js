// 驗證手機優先布局的腳本
console.log('=== 手機優先 LocationManager 布局驗證 ===');

// 檢查 CSS 變數是否正確定義
const cssVariables = [
  '--button-height-small',
  '--button-height-medium', 
  '--button-height-large',
  '--touch-target-min',
  '--border-radius-medium',
  '--spacing-md',
  '--spacing-lg',
  '--primary-color',
  '--success-color'
];

console.log('\n1. 檢查 CSS 變數定義:');
cssVariables.forEach(variable => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable);
  console.log(`${variable}: ${value || '❌ 未定義'}`);
});

// 檢查響應式斷點
console.log('\n2. 檢查響應式設計:');
const breakpoints = [
  { name: '超小螢幕', width: 360 },
  { name: '小螢幕', width: 480 },
  { name: '平板', width: 768 },
  { name: '桌面', width: 1024 }
];

breakpoints.forEach(bp => {
  console.log(`${bp.name} (${bp.width}px): ${window.innerWidth <= bp.width ? '✅ 符合' : '❌ 不符合'}`);
});

// 檢查觸控區域大小
console.log('\n3. 檢查觸控區域:');
const buttons = document.querySelectorAll('.quick-location-btn, .location-action-btn');
buttons.forEach((btn, index) => {
  const rect = btn.getBoundingClientRect();
  const minSize = 44; // 最小觸控區域
  const isValid = rect.height >= minSize && rect.width >= minSize;
  console.log(`按鈕 ${index + 1}: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px ${isValid ? '✅' : '❌'}`);
});

// 檢查卡片是否在視窗內
console.log('\n4. 檢查布局適配:');
const card = document.querySelector('.location-manager-card');
if (card) {
  const rect = card.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const isVisible = rect.top >= 0 && rect.bottom <= viewportHeight;
  console.log(`卡片高度: ${rect.height.toFixed(0)}px`);
  console.log(`視窗高度: ${viewportHeight}px`);
  console.log(`完整可見: ${isVisible ? '✅' : '❌'}`);
}

// 檢查字體大小
console.log('\n5. 檢查字體大小:');
const textElements = document.querySelectorAll('.location-btn-text, .quick-btn-text, .address-input-field');
textElements.forEach((el, index) => {
  const fontSize = parseFloat(getComputedStyle(el).fontSize);
  const isReadable = fontSize >= 14; // 最小可讀字體
  console.log(`文字元素 ${index + 1}: ${fontSize}px ${isReadable ? '✅' : '❌'}`);
});

console.log('\n=== 驗證完成 ===');