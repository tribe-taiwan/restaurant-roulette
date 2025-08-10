// SettingsDisplay.js - 設定狀態顯示子組件
// 顯示當前設定狀態

function SettingsDisplay({
  selectedMealTime,
  baseUnit,
  unitMultiplier,
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

    // 獲取用餐時段顯示文字
    const getMealTimeDisplayText = () => {
      const mealTimeLabels = {
        current: t.openNowFilter,
        all: t.anyTime,
        breakfast: t.breakfast,
        lunch: t.lunch,
        dinner: t.dinner
      };
      return mealTimeLabels[selectedMealTime] || selectedMealTime;
    };

    // 獲取距離顯示文字
    const getDistanceDisplayText = () => {
      const actualMeters = baseUnit * unitMultiplier;
      if (actualMeters >= 1000) {
        return `${actualMeters / 1000}km`;
      } else {
        return `${actualMeters}m`;
      }
    };

    // 獲取用餐時段圖標
    const getMealTimeIcon = () => {
      const iconMap = {
        current: '🕐',
        all: '🌐',
        breakfast: mealTimeConfig.breakfast.icon,
        lunch: mealTimeConfig.lunch.icon,
        dinner: mealTimeConfig.dinner.icon
      };
      return iconMap[selectedMealTime] || '⚙️';
    };

    // 創建 DOM 元素而不是 JSX
    const container = document.createElement('div');
    container.className = 'settings-display-container';
    
    const displayCard = document.createElement('div');
    displayCard.className = 'flex items-center justify-between p-3 bg-gray-800 rounded-lg';
    
    // 距離設定顯示
    const distanceSection = document.createElement('div');
    distanceSection.className = 'flex items-center gap-2';
    
    const distanceLabel = document.createElement('span');
    distanceLabel.className = 'text-sm text-[var(--text-secondary)]';
    distanceLabel.textContent = '搜索範圍:';
    
    const distanceValue = document.createElement('span');
    distanceValue.className = 'text-[var(--accent-color)] font-bold';
    distanceValue.textContent = getDistanceDisplayText();
    
    distanceSection.appendChild(distanceLabel);
    distanceSection.appendChild(distanceValue);
    
    // 分隔線
    const separator = document.createElement('div');
    separator.className = 'w-px h-6 bg-gray-600';
    
    // 用餐時段設定顯示
    const mealTimeSection = document.createElement('div');
    mealTimeSection.className = 'flex items-center gap-2';
    
    const mealTimeLabel = document.createElement('span');
    mealTimeLabel.className = 'text-sm text-[var(--text-secondary)]';
    mealTimeLabel.textContent = '用餐時段:';
    
    const mealTimeDisplay = document.createElement('div');
    mealTimeDisplay.className = 'flex items-center gap-1';
    
    const mealTimeIcon = document.createElement('span');
    mealTimeIcon.className = 'text-sm';
    mealTimeIcon.textContent = getMealTimeIcon();
    
    const mealTimeText = document.createElement('span');
    mealTimeText.className = 'text-[var(--accent-color)] font-medium';
    mealTimeText.textContent = getMealTimeDisplayText();
    
    mealTimeDisplay.appendChild(mealTimeIcon);
    mealTimeDisplay.appendChild(mealTimeText);
    mealTimeSection.appendChild(mealTimeLabel);
    mealTimeSection.appendChild(mealTimeDisplay);
    
    // 組裝所有元素
    displayCard.appendChild(distanceSection);
    displayCard.appendChild(separator);
    displayCard.appendChild(mealTimeSection);
    container.appendChild(displayCard);
    
    return container;
  } catch (error) {
    console.error('SettingsDisplay component error:', error);
    return null;
  }
}

// 導出組件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsDisplay;
} else if (typeof window !== 'undefined') {
  window.SettingsDisplay = SettingsDisplay;
}