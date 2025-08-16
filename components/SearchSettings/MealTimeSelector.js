// MealTimeSelector.js - 用餐時段選擇子組件
// 統一使用 React 組件和 ButtonStylesManager 樣式

function MealTimeSelector({
  selectedMealTime,
  setSelectedMealTime,
  translations
}) {
  try {
    const t = translations;

    // 確保 ButtonStylesManager 可用
    const buttonManager = window.ButtonStylesManager;
    if (!buttonManager) {
      console.warn('ButtonStylesManager not available, using fallback styles');
    }

    // 使用統一的用餐時段配置
    const mealTimeConfig = window.getMealTimeConfig ? window.getMealTimeConfig() : {
      breakfast: { start: 5, end: 10, displayTime: '5-10', icon: '🌅' },
      lunch: { start: 10, end: 16, displayTime: '10-16', icon: '☀️' },
      dinner: { start: 16, end: 24, displayTime: '16-24', icon: '🌃' }
    };

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

    // 取得按鈕樣式的輔助函數
    const getButtonStyle = (isSelected) => {
      if (!buttonManager) {
        // 回退樣式，保持與原來相同的外觀
        return isSelected ? {
          background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
          borderColor: 'var(--theme-primary)',
          color: 'white',
          margin: 0,
          touchAction: 'manipulation'
        } : {
          background: '#f3f4f6',
          borderColor: 'var(--border-color)',
          color: '#374151',
          margin: 0,
          touchAction: 'manipulation'
        };
      }

      return isSelected 
        ? buttonManager.getButtonStyle({ variant: 'primary', state: 'normal' })
        : buttonManager.getButtonStyle({ 
            variant: 'custom', 
            customColors: {
              background: '#f3f4f6',
              borderColor: 'var(--border-color)',
              color: '#374151'
            },
            state: 'normal' 
          });
    };

    const getButtonClasses = (isSelected) => {
      if (!buttonManager) {
        // 回退類別
        return `flex-1 min-h-[72px] p-3 rounded-lg border-2 transition-all duration-200 
                flex flex-col items-center justify-center ${
          isSelected
            ? 'text-white shadow-lg'
            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md'
        }`;
      }

      const baseClasses = buttonManager.getButtonClasses('primary', 'standard');
      // 移除基礎類別中的固定高度，使用 flex-1 和 min-h-[72px] 來適應兩行布局
      const customClasses = baseClasses.replace('h-[72px]', 'flex-1 min-h-[72px]');
      
      if (!isSelected) {
        // 未選中狀態添加 hover 效果
        return `${customClasses} hover:bg-gray-50 hover:shadow-md`;
      }
      
      return customClasses;
    };

    return (
      <div className="space-y-3">
        {mealTimeRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-3 justify-center">
            {row.map((mealTime) => {
              const isSelected = selectedMealTime === mealTime.id;
              
              return (
                <button
                  key={mealTime.id}
                  onClick={() => setSelectedMealTime(mealTime.id)}
                  className={getButtonClasses(isSelected)}
                  style={getButtonStyle(isSelected)}
                  aria-label={`選擇${mealTime.label}${mealTime.time ? ` (${mealTime.time})` : ''}`}
                  aria-pressed={isSelected}
                >
                  {/* 主標籤 - 第一行文字較大 */}
                  <div className="text-lg font-semibold text-center leading-tight">
                    {mealTime.label}
                  </div>
                  
                  {/* 時間顯示 - 第二行文字較小顏色稍淺 */}
                  <div className={`text-sm mt-1 ${
                    isSelected ? 'text-white opacity-90' : 'text-gray-500'
                  }`}>
                    {mealTime.time}
                  </div>
                </button>
              );
            })}
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