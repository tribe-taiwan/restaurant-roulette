// SearchSettings/index.js - 主要 SearchSettings 組件
// 使用子組件架構實現模組化設計

function SearchSettings({
  selectedMealTime,
  setSelectedMealTime,
  translations,
  selectedLanguage,
  baseUnit,
  setBaseUnit,
  unitMultiplier,
  setUnitMultiplier
}) {
  // 安全檢查
  if (!translations) {
    console.warn('SearchSettings: translations 未提供');
    return React.createElement('div', {
      className: 'text-center text-red-400'
    }, '搜索設定組件載入失敗：缺少翻譯資源');
  }

  // 檢查子組件是否已載入
  const missingComponents = [];
  if (typeof window.DistanceControl !== 'function') missingComponents.push('DistanceControl');
  if (typeof window.MealTimeSelector !== 'function') missingComponents.push('MealTimeSelector');
  if (typeof window.SettingsDisplay !== 'function') missingComponents.push('SettingsDisplay');

  if (missingComponents.length > 0) {
    console.warn('SearchSettings 子組件尚未完全載入:', missingComponents);
    return React.createElement('div', {
      className: 'text-center text-[var(--text-secondary)]'
    }, `載入搜索設定組件中... (缺少: ${missingComponents.join(', ')})`);
  }

  try {
    // 直接使用 React 組件
    return React.createElement('div', {
      className: 'search-settings-container'
    }, [
      // 距離控制組件
      React.createElement(window.DistanceControl, {
        key: 'distance-control',
        baseUnit,
        setBaseUnit,
        unitMultiplier,
        setUnitMultiplier,
        translations
      }),

      // 用餐時段選擇組件
      React.createElement(window.MealTimeSelector, {
        key: 'meal-time-selector',
        selectedMealTime,
        setSelectedMealTime,
        translations
      }),

      // 設定顯示組件
      React.createElement(window.SettingsDisplay, {
        key: 'settings-display',
        selectedMealTime,
        baseUnit,
        unitMultiplier,
        translations
      })
    ]);

  } catch (error) {
    console.error('SearchSettings 組件渲染失敗:', error);
    return React.createElement('div', {
      className: 'text-center text-red-400'
    }, `搜索設定組件渲染失敗：${error.message}`);
  }
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

// 註冊到全域範圍
if (typeof window !== 'undefined') {
  window.SearchSettings = SearchSettings;
  window.loadSearchSettingsComponents = loadSearchSettingsComponents;
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchSettings, loadSearchSettingsComponents };
}
