// 統一的用餐時段配置
// 這個文件統一管理所有用餐時段的時間設定

export const MEAL_TIME_CONFIG = {
  breakfast: { 
    start: 5, 
    end: 10, 
    displayTime: '5-10',
    icon: 'sunrise'
  },
  lunch: { 
    start: 10, 
    end: 16, 
    displayTime: '10-16',
    icon: 'sun'
  },
  dinner: { 
    start: 16, 
    end: 24, 
    displayTime: '16-24',
    icon: 'moon'
  }
};

// 為了向後兼容，也提供全局函數
if (typeof window !== 'undefined') {
  window.getMealTimeConfig = function() {
    return MEAL_TIME_CONFIG;
  };
}

export default MEAL_TIME_CONFIG;
