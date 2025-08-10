// SearchSettings/index.js - 搜索設定組件模組導出

// 載入主組件
if (typeof window !== 'undefined') {
  // 瀏覽器環境 - 動態載入腳本
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // 主組件已經通過 HTML 載入，無需動態載入
  console.log('SearchSettings 子組件模組已準備就緒');
}

// 安全的模組載入函數
function loadSearchSettingsComponents() {
  try {
    // 檢查是否在瀏覽器環境
    if (typeof window !== 'undefined') {
      // 確保所有子組件都已載入
      const components = {
        DistanceControl: window.DistanceControl,
        MealTimeSelector: window.MealTimeSelector,
        SettingsDisplay: window.SettingsDisplay,
        SearchSettings: window.SearchSettings
      };

      // 驗證所有組件都存在
      const missingComponents = Object.entries(components)
        .filter(([name, component]) => !component)
        .map(([name]) => name);

      if (missingComponents.length > 0) {
        console.warn('Missing SearchSettings components:', missingComponents);
      }

      return components;
    }

    // Node.js 環境
    return {
      DistanceControl: require('./DistanceControl'),
      MealTimeSelector: require('./MealTimeSelector'),
      SettingsDisplay: require('./SettingsDisplay')
    };
  } catch (error) {
    console.error('Error loading SearchSettings components:', error);
    return {};
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadSearchSettingsComponents };
} else if (typeof window !== 'undefined') {
  window.loadSearchSettingsComponents = loadSearchSettingsComponents;
}
