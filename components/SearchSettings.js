// SearchSettings.js - 搜索設定相關組件 (重構版本)
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

    // 延遲執行，確保所有腳本都已載入
    const timeoutId = setTimeout(() => {
      try {
        // 清空容器
        containerRef.current.innerHTML = '';

        // 確保子組件已載入
        const missingComponents = [];
        if (typeof window.DistanceControl !== 'function') missingComponents.push('DistanceControl');
        if (typeof window.MealTimeSelector !== 'function') missingComponents.push('MealTimeSelector');
        if (typeof window.SettingsDisplay !== 'function') missingComponents.push('SettingsDisplay');

        if (missingComponents.length > 0) {
          console.warn('SearchSettings 子組件尚未完全載入:', missingComponents);

          const loadingText = document.createElement('div');
          loadingText.className = 'text-center text-[var(--text-secondary)]';
          loadingText.textContent = `載入搜索設定組件中... (缺少: ${missingComponents.join(', ')})`;

          if (containerRef.current) {
            containerRef.current.appendChild(loadingText);
          }
          return;
        }

        let componentsLoaded = 0;

        // 設定顯示組件
        if (typeof window.SettingsDisplay === 'function') {
          try {
            console.log('🔧 載入 SettingsDisplay...');
            const settingsDisplay = window.SettingsDisplay({
              selectedMealTime,
              baseUnit,
              unitMultiplier,
              translations
            });

            if (settingsDisplay &&
                typeof settingsDisplay === 'object' &&
                settingsDisplay.nodeType === Node.ELEMENT_NODE &&
                containerRef.current) {
              containerRef.current.appendChild(settingsDisplay);
              console.log('✅ SettingsDisplay 載入成功');
              componentsLoaded++;
            } else {
              console.warn('⚠️ SettingsDisplay 返回無效元素:', settingsDisplay);
            }
          } catch (error) {
            console.error('❌ SettingsDisplay 載入失敗:', error);
          }
        }

        // 距離控制組件
        if (typeof window.DistanceControl === 'function') {
          try {
            console.log('🔧 載入 DistanceControl...');
            const distanceControl = window.DistanceControl({
              baseUnit,
              setBaseUnit,
              unitMultiplier,
              setUnitMultiplier,
              translations
            });

            if (distanceControl &&
                typeof distanceControl === 'object' &&
                distanceControl.nodeType === Node.ELEMENT_NODE &&
                containerRef.current) {
              containerRef.current.appendChild(distanceControl);
              console.log('✅ DistanceControl 載入成功');
              componentsLoaded++;
            } else {
              console.warn('⚠️ DistanceControl 返回無效元素:', distanceControl);
            }
          } catch (error) {
            console.error('❌ DistanceControl 載入失敗:', error);
          }
        }

        // 用餐時段選擇組件
        if (typeof window.MealTimeSelector === 'function') {
          try {
            console.log('🔧 載入 MealTimeSelector...');
            const mealTimeSelector = window.MealTimeSelector({
              selectedMealTime,
              setSelectedMealTime,
              translations
            });

            if (mealTimeSelector &&
                typeof mealTimeSelector === 'object' &&
                mealTimeSelector.nodeType === Node.ELEMENT_NODE &&
                containerRef.current) {
              containerRef.current.appendChild(mealTimeSelector);
              console.log('✅ MealTimeSelector 載入成功');
              componentsLoaded++;
            } else {
              console.warn('⚠️ MealTimeSelector 返回無效元素:', mealTimeSelector);
            }
          } catch (error) {
            console.error('❌ MealTimeSelector 載入失敗:', error);
          }
        }

        console.log(`SearchSettings: 成功載入 ${componentsLoaded} 個子組件`);

      } catch (error) {
        console.error('SearchSettings component error:', error);

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          const errorText = document.createElement('div');
          errorText.className = 'text-center text-red-400';
          errorText.textContent = '搜索設定組件發生錯誤，請重新整理頁面';
          containerRef.current.appendChild(errorText);
        }
      }
    }, 100); // 100ms 延遲

    // 清理函數
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectedMealTime, baseUnit, unitMultiplier, translations]);

  // 返回 React JSX
  try {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-[var(--surface-color)] rounded-lg p-4 mb-8 glow-container">
          <div ref={containerRef}>
            {/* 子組件將通過 useEffect 動態插入到這裡 */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SearchSettings render error:', error);
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-[var(--surface-color)] rounded-lg p-4 mb-8 glow-container">
          <div className="text-center text-red-400">
            搜索設定組件渲染失敗，請重新整理頁面
          </div>
        </div>
      </div>
    );
  }
}

// 註冊到全域範圍
if (typeof window !== 'undefined') {
  window.SearchSettings = SearchSettings;
}
