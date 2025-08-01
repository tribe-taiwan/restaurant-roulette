// SearchSettings.js - 搜索設定相關組件

function SearchSettings({
  searchRadius,
  setSearchRadius,
  selectedMealTime,
  setSelectedMealTime,
  translations,
  selectedLanguage
}) {
  try {
    const t = translations;

    // 使用統一的用餐時段配置
    const mealTimeConfig = window.getMealTimeConfig ? window.getMealTimeConfig() : {
      breakfast: { start: 5, end: 10, displayTime: '5-10', icon: '🌅' },
      lunch: { start: 10, end: 16, displayTime: '10-16', icon: '☀️' },
      dinner: { start: 16, end: 24, displayTime: '16-24', icon: '🌃' }
    };

    return (
      <>
        {/* 搜索範圍設定 */}
        <div className="bg-[var(--surface-color)] rounded-lg p-4 max-w-md mx-auto mb-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-[var(--text-secondary)] font-medium">
              {t.radiusLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="20"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{'--value': `${((searchRadius - 1) / (20 - 1)) * 100}%`}}
              />
              <span className="text-[var(--accent-color)] font-bold min-w-[4rem] text-center">
                {searchRadius} {t.radiusKm}
              </span>
            </div>
          </div>
        </div>
        
        {/* 用餐時段選擇 */}
        <div className="bg-[var(--surface-color)] rounded-lg p-4 max-w-md mx-auto mb-8">
          {/* 第一行：現在營業中和不限時間 */}
          <div className="flex gap-2 justify-center mb-2">
            {[
              { id: 'current', label: selectedLanguage === 'zh' ? '現在營業中' : 'Open Now', icon: '🕐', time: '' },
              { id: 'all', label: selectedLanguage === 'zh' ? '不限時間' : 'Any Time', icon: '🌐', time: '' }
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
                  <span className="text-lg">{mealTime.icon}</span>
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
                  <span className="text-lg">{mealTime.icon}</span>
                  <span className="text-xs">{mealTime.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('SearchSettings component error:', error);
    return null;
  }
}
