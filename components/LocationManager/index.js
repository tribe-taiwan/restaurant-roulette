// LocationManager/index.js - 安全的模組匯出入口
// 提供統一的子組件匯出，避免全局變數衝突

// 安全的模組載入函數
function loadLocationManagerComponents() {
  try {
    // 檢查是否在瀏覽器環境
    if (typeof window !== 'undefined') {
      // 確保所有子組件都已載入
      const components = {
        CurrentLocationDisplay: window.CurrentLocationDisplay,
        QuickLocationButtons: window.QuickLocationButtons,
        AddressInput: window.AddressInput,
        LocationActions: window.LocationActions
      };

      // 驗證所有組件都存在
      const missingComponents = Object.entries(components)
        .filter(([name, component]) => !component)
        .map(([name]) => name);

      if (missingComponents.length > 0) {
        console.warn('Missing LocationManager components:', missingComponents);
      }

      return components;
    }

    // Node.js 環境
    return {
      CurrentLocationDisplay: require('./CurrentLocationDisplay'),
      QuickLocationButtons: require('./QuickLocationButtons'),
      AddressInput: require('./AddressInput'),
      LocationActions: require('./LocationActions')
    };
  } catch (error) {
    console.error('Error loading LocationManager components:', error);
    return {};
  }
}

// 匯出組件載入器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadLocationManagerComponents };
} else if (typeof window !== 'undefined') {
  window.loadLocationManagerComponents = loadLocationManagerComponents;
}
