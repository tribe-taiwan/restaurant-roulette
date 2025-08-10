// MealTimeSelector.js - 用餐時段選擇子組件
// 實現大按鈕網格布局 (2行3列)

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

    // 定義用餐時段選項 - 2行2列網格布局，移除自訂選項
    const mealTimeOptions = [
      // 第一行
      [
        { id: 'current', label: t.openNowFilter, icon: 'clock', time: '' },
        { id: 'all', label: t.anyTime, icon: 'globe', time: '' }
      ],
      // 第二行
      [
        { id: 'breakfast', label: t.breakfast, icon: '', time: mealTimeConfig.breakfast.displayTime },
        { id: 'lunch', label: t.lunch, icon: '', time: mealTimeConfig.lunch.displayTime },
        { id: 'dinner', label: t.dinner, icon: '', time: mealTimeConfig.dinner.displayTime }
      ]
    ];

    // 這個函數已經不需要了，因為我們直接使用 DOM 操作

    // 創建DOM元素而不是JSX
    const container = document.createElement('div');
    container.className = 'meal-time-selector-grid';
    
    mealTimeOptions.forEach((row, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'meal-time-row';
      
      row.forEach(mealTime => {
        const button = document.createElement('button');
        button.className = `meal-time-button ${selectedMealTime === mealTime.id ? 'selected' : ''}`;
        button.setAttribute('aria-label', `選擇${mealTime.label}${mealTime.time ? ` (${mealTime.time})` : ''}`);
        button.setAttribute('aria-pressed', selectedMealTime === mealTime.id);
        button.setAttribute('data-touch-optimized', 'true');
        button.setAttribute('data-important-action', selectedMealTime === mealTime.id ? 'false' : 'true');
        
        const content = document.createElement('div');
        content.className = 'meal-time-button-content';
        
        // 只有當有圖標時才創建圖標元素
        if (mealTime.icon) {
          const icon = document.createElement('div');
          if (mealTime.icon === 'clock' || mealTime.icon === 'globe') {
            icon.className = `meal-time-icon lucide-${mealTime.icon}`;
          } else {
            icon.className = 'meal-time-icon';
            icon.textContent = mealTime.icon;
          }
          content.appendChild(icon);
        }
        
        const label = document.createElement('span');
        label.className = mealTime.icon ? 'meal-time-label' : 'meal-time-label-large';
        label.textContent = mealTime.label;
        content.appendChild(label);
        
        if (mealTime.time) {
          const time = document.createElement('span');
          time.className = 'meal-time-time';
          time.textContent = mealTime.time;
          content.appendChild(time);
        }
        
        button.appendChild(content);
        button.addEventListener('click', () => setSelectedMealTime(mealTime.id));
        
        rowElement.appendChild(button);
      });
      
      container.appendChild(rowElement);
    });
    
    return container;
  } catch (error) {
    console.error('MealTimeSelector component error:', error);
    return null;
  }
}

// 導出組件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MealTimeSelector;
} else if (typeof window !== 'undefined') {
  window.MealTimeSelector = MealTimeSelector;
}