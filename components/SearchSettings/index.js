// SearchSettings/index.js - 主要 SearchSettings 組件
// 統一與 LocationManager 相同的結構和樣式風格

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
    return (
      <SettingsContainer>
        <div className="text-center text-red-400">
          搜索設定組件載入失敗：缺少翻譯資源
        </div>
      </SettingsContainer>
    );
  }

  // 渲染組件 - 與 LocationManager 相同的結構
  try {
    return (
      <SettingsContainer>
        <div className="search-settings-sections">
          {/* 距離控制子組件 */}
          <div className="search-section">
            <DistanceControl
              baseUnit={baseUnit}
              setBaseUnit={setBaseUnit}
              unitMultiplier={unitMultiplier}
              setUnitMultiplier={setUnitMultiplier}
              translations={translations}
            />
          </div>

          {/* 用餐時段選擇子組件 */}
          <div className="search-section search-section-last">
            <MealTimeSelector
              selectedMealTime={selectedMealTime}
              setSelectedMealTime={setSelectedMealTime}
              translations={translations}
            />
          </div>
        </div>
      </SettingsContainer>
    );
  } catch (error) {
    console.error('SearchSettings render error:', error);
    return (
      <SettingsContainer>
        <div className="text-center text-red-400">
          搜索設定組件渲染失敗，請重新整理頁面
        </div>
      </SettingsContainer>
    );
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

    // Node.js 環境 - 只在真正的 Node.js 環境中執行
    if (typeof module !== 'undefined' && module.exports) {
      return {
        DistanceControl: require('./DistanceControl'),
        MealTimeSelector: require('./MealTimeSelector'),
        SettingsDisplay: require('./SettingsDisplay')
      };
    }

    // 其他環境返回空對象
    return {};
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
