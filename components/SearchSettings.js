// SearchSettings.js - 搜索設定相關組件

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
  try {
    const t = translations;

    // 使用統一的用餐時段配置
    const mealTimeConfig = window.getMealTimeConfig ? window.getMealTimeConfig() : {
      breakfast: { start: 5, end: 10, displayTime: '5-10', icon: '🌅' },
      lunch: { start: 10, end: 16, displayTime: '10-16', icon: '☀️' },
      dinner: { start: 16, end: 24, displayTime: '16-24', icon: '🌃' }
    };

    // 距離配置
    const DISTANCE_CONFIG = {
      baseUnits: {
        200: { label: '200m', fullLabel: '200公尺模式' },
        1000: { label: '1km', fullLabel: '1公里模式' }
      }
    };

    // 計算實際搜索距離顯示
    const getActualRadius = () => baseUnit * unitMultiplier;
    const getDisplayText = () => {
      const actualMeters = getActualRadius();
      if (actualMeters >= 1000) {
        return `${actualMeters / 1000}km`;
      } else {
        return `${actualMeters}m`;
      }
    };

    // 單位切換處理
    const handleUnitSwitch = (newBaseUnit) => {
      const currentActualDistance = getActualRadius();
      setBaseUnit(newBaseUnit);
      
      // 調整倍數以保持相近距離
      const newMultiplier = Math.round(currentActualDistance / newBaseUnit);
      const adjustedMultiplier = Math.max(1, Math.min(10, newMultiplier));
      setUnitMultiplier(adjustedMultiplier);
    };

    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* 整合區塊 */}
        <div className="bg-[var(--surface-color)] rounded-lg p-4 mb-8 glow-container">
          {/* 搜索範圍設定 */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              {/* 單位切換器 */}
              <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                {Object.entries(DISTANCE_CONFIG.baseUnits).map(([value, config]) => (
                  <button
                    key={value}
                    onClick={() => handleUnitSwitch(Number(value))}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      baseUnit === Number(value)
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-gray-600'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              {/* 滑軌和距離顯示 */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={unitMultiplier}
                  onChange={(e) => setUnitMultiplier(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{'--value': `${((unitMultiplier - 1) / (10 - 1)) * 100}%`}}
                />
                <span className="text-[var(--accent-color)] font-bold min-w-[4rem] text-center">
                  {getDisplayText()}
                </span>
              </div>
            </div>
          </div>
          
          {/* 用餐時段選擇 */}
          <div>
          {/* 第一行：現在營業中和不限時間 */}
          <div className="flex gap-2 justify-center mb-2">
            {[
              { id: 'current', label: selectedLanguage === 'zh' ? '現在營業中' : 'Open Now', icon: 'clock', time: '' },
              { id: 'all', label: selectedLanguage === 'zh' ? '不限時間' : 'Any Time', icon: 'globe', time: '' }
            ].map((mealTime) => (
              <button
                key={mealTime.id}
                onClick={() => setSelectedMealTime(mealTime.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedMealTime === mealTime.id
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-gray-700 text-[var(--text-secondary)] hover:bg-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className={`icon-${mealTime.icon} text-lg`}></div>
                  <span className="text-xs">{mealTime.label}</span>
                </div>
              </button>
            ))}
          </div>
          {/* 第二行：早午晚餐時段 */}
          <div className="flex gap-2 justify-center">
            {[
              { id: 'breakfast', label: t.breakfast, icon: mealTimeConfig.breakfast.icon, time: mealTimeConfig.breakfast.displayTime },
              { id: 'lunch', label: t.lunch, icon: mealTimeConfig.lunch.icon, time: mealTimeConfig.lunch.displayTime },
              { id: 'dinner', label: t.dinner, icon: mealTimeConfig.dinner.icon, time: mealTimeConfig.dinner.displayTime }
            ].map((mealTime) => (
              <button
                key={mealTime.id}
                onClick={() => setSelectedMealTime(mealTime.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedMealTime === mealTime.id
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-gray-700 text-[var(--text-secondary)] hover:bg-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className={`icon-${mealTime.icon} text-lg`}></div>
                  <span className="text-xs">{mealTime.label}</span>
                </div>
              </button>
            ))}
          </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SearchSettings component error:', error);
    return null;
  }
}
