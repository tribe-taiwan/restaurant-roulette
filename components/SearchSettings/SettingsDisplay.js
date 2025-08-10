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

    // 創建空的容器，不顯示任何內容
    const container = document.createElement('div');
    container.className = 'settings-display-container';
    container.style.display = 'none'; // 隱藏整個組件

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
