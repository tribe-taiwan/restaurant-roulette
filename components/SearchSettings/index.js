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
  // 使用 useRef 來存儲 DOM 容器
  const containerRef = React.useRef(null);

  // 使用 useEffect 來處理 DOM 操作
  React.useEffect(() => {
    // 安全檢查
    if (!containerRef.current) {
      console.warn('SearchSettings: containerRef.current 不存在');
      return;
    }

    // 安全檢查 translations
    if (!translations) {
      console.warn('SearchSettings: translations 未提供');
      containerRef.current.innerHTML = `
        <div class="text-center text-red-400">
          搜索設定組件載入失敗：缺少翻譯資源
        </div>
      `;
      return;
    }

    // 檢查子組件是否已載入
    const missingComponents = [];
    if (typeof window.DistanceControl !== 'function') missingComponents.push('DistanceControl');
    if (typeof window.MealTimeSelector !== 'function') missingComponents.push('MealTimeSelector');
    if (typeof window.SettingsDisplay !== 'function') missingComponents.push('SettingsDisplay');

    if (missingComponents.length > 0) {
      console.warn('SearchSettings 子組件尚未完全載入:', missingComponents);
      containerRef.current.innerHTML = `
        <div class="text-center text-[var(--text-secondary)]">
          載入搜索設定組件中... (缺少: ${missingComponents.join(', ')})
        </div>
      `;
      return;
    }

    try {
      // 清空容器
      containerRef.current.innerHTML = '';

      // 創建子組件（這些函數返回 DOM 元素，不是 React 元素）
      const distanceControlElement = window.DistanceControl({
        baseUnit,
        setBaseUnit,
        unitMultiplier,
        setUnitMultiplier,
        translations
      });

      const mealTimeSelectorElement = window.MealTimeSelector({
        selectedMealTime,
        setSelectedMealTime,
        translations
      });

      const settingsDisplayElement = window.SettingsDisplay({
        selectedMealTime,
        baseUnit,
        unitMultiplier,
        translations
      });

      // 將 DOM 元素添加到容器
      if (distanceControlElement && distanceControlElement.nodeType === Node.ELEMENT_NODE) {
        containerRef.current.appendChild(distanceControlElement);
      }

      if (mealTimeSelectorElement && mealTimeSelectorElement.nodeType === Node.ELEMENT_NODE) {
        containerRef.current.appendChild(mealTimeSelectorElement);
      }

      if (settingsDisplayElement && settingsDisplayElement.nodeType === Node.ELEMENT_NODE) {
        containerRef.current.appendChild(settingsDisplayElement);
      }

      console.log('✅ SearchSettings 所有子組件載入完成');

    } catch (error) {
      console.error('SearchSettings 組件載入失敗:', error);
      containerRef.current.innerHTML = `
        <div class="text-center text-red-400">
          搜索設定組件載入失敗：${error.message}
        </div>
      `;
    }
  }, [selectedMealTime, setSelectedMealTime, translations, baseUnit, setBaseUnit, unitMultiplier, setUnitMultiplier]);

  return React.createElement('div', {
    ref: containerRef,
    className: 'search-settings-container'
  });
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
