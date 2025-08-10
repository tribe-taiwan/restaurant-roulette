// SearchSettings/index.js - 搜索設定組件模組導出

// 導入子組件
if (typeof window !== 'undefined') {
  // 瀏覽器環境 - 動態載入腳本
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // 載入所有子組件
  Promise.all([
    loadScript('./SearchSettings/DistanceControl.js'),
    loadScript('./SearchSettings/MealTimeSelector.js'),
    loadScript('./SearchSettings/SettingsDisplay.js')
  ]).then(() => {
    console.log('SearchSettings 子組件載入完成');
  }).catch(error => {
    console.error('SearchSettings 子組件載入失敗:', error);
  });
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DistanceControl: require('./DistanceControl'),
    MealTimeSelector: require('./MealTimeSelector'),
    SettingsDisplay: require('./SettingsDisplay')
  };
}