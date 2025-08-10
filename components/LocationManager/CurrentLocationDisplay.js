// CurrentLocationDisplay.js - 顯示當前位置資訊的子組件
// 安全的模組化組件，避免全局變數衝突

function CurrentLocationDisplay({ 
  locationStatus, 
  userAddress, 
  translations 
}) {
  try {
    const t = translations;

    // 只在定位成功且有地址時顯示
    if (locationStatus !== 'success' || !userAddress) {
      return null;
    }

    return (
      <div className="current-location-display">
        <div className="current-location-content">
          <div className="current-location-icon">
            <div className="icon-map-pin"></div>
          </div>
          <div className="current-location-text">
            <div className="current-location-label">
              {t.locationDetected}
            </div>
            <div className="current-location-address">
              {userAddress}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CurrentLocationDisplay component error:', error);
    return null;
  }
}

// 安全的模組匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CurrentLocationDisplay;
} else if (typeof window !== 'undefined') {
  window.CurrentLocationDisplay = CurrentLocationDisplay;
}