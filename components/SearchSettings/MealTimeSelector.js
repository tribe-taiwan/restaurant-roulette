// MealTimeSelector.js - 用餐時段選擇子組件
// 統一使用 React 組件和 Tailwind CSS 樣式

function MealTimeSelector({
  selectedMealTime,
  setSelectedMealTime,
  translations
}) {
  try {
    const t = translations;

    // 使用統一的用餐時段配置
    const mealTimeConfig = window.getMealTimeConfig ? window.getMealTimeConfig() : {
      breakfast: { start: 5, end: 10, displayTime: '5-10', icon: '🌅' },
      lunch: { start: 10, end: 16, displayTime: '10-16', icon: '☀️' },
      dinner: { start: 16, end: 24, displayTime: '16-24', icon: '🌃' }
    };

    // 定義用餐時段選項
    const mealTimeOptions = [
      { id: 'current', label: t.openNowFilter, icon: '🕐', time: '' },
      { id: 'all', label: t.anyTime, icon: '🌐', time: '' },
      { id: 'breakfast', label: t.breakfast, icon: mealTimeConfig.breakfast.icon, time: mealTimeConfig.breakfast.displayTime },
      { id: 'lunch', label: t.lunch, icon: mealTimeConfig.lunch.icon, time: mealTimeConfig.lunch.displayTime },
      { id: 'dinner', label: t.dinner, icon: mealTimeConfig.dinner.icon, time: mealTimeConfig.dinner.displayTime }
    ];

    // 定義用餐時段選項 - 按照原來的2行布局
    const mealTimeRows = [
      // 第一行 - 營業中和任何時段
      [
        { id: 'current', label: t.openNowFilter, time: 'now' },
        { id: 'all', label: t.anyTime, time: '24/7' }
      ],
      // 第二行 - 早午晚餐
      [
        { id: 'breakfast', label: t.breakfast, time: mealTimeConfig.breakfast.displayTime },
        { id: 'lunch', label: t.lunch, time: mealTimeConfig.lunch.displayTime },
        { id: 'dinner', label: t.dinner, time: mealTimeConfig.dinner.displayTime }
      ]
    ];

    return (
      <div className="space-y-3">
        {mealTimeRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-3 justify-center">
            {row.map(mealTime => (
              <button
                key={mealTime.id}
                onClick={() => setSelectedMealTime(mealTime.id)}
                className={`flex-1 min-h-[72px] p-3 rounded-lg border-2 transition-all duration-200 
                           flex flex-col items-center justify-center ${
                  selectedMealTime === mealTime.id
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
                style={selectedMealTime === mealTime.id ? {
                  background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
                  borderColor: 'var(--theme-primary)'
                } : {
                  borderColor: 'var(--border-color)'
                }}
                aria-label={`選擇${mealTime.label}${mealTime.time ? ` (${mealTime.time})` : ''}`}
                aria-pressed={selectedMealTime === mealTime.id}
              >
                {/* 主標籤 - 第一行文字較大 */}
                <div className="text-lg font-semibold text-center leading-tight">
                  {mealTime.label}
                </div>
                
                {/* 時間顯示 - 第二行文字較小顏色稍淺 */}
                <div className={`text-sm mt-1 ${
                  selectedMealTime === mealTime.id ? 'text-white opacity-90' : 'text-gray-500'
                }`}>
                  {mealTime.time}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('MealTimeSelector component error:', error);
    return null;
  }
}

// 安全的模組匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MealTimeSelector;
} else if (typeof window !== 'undefined') {
  window.MealTimeSelector = MealTimeSelector;
}