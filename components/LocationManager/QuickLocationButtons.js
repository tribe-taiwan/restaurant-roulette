// QuickLocationButtons.js - 住家/公司快速按鈕子組件
// 安全的模組化組件，處理快速位置選擇

function QuickLocationButtons({ 
  savedLocations,
  addressInput,
  isInputFocused,
  onLocationButton,
  translations 
}) {
  try {
    const t = translations;

    // 判斷住家和公司的按鈕狀態
    const hasHomeLocation = savedLocations.some(loc => loc.type === 'home');
    const hasOfficeLocation = savedLocations.some(loc => loc.type === 'office');
    const hasAddressInput = addressInput.trim().length > 0;
    const shouldShowActiveState = hasAddressInput || isInputFocused;
    
    // 獲取按鈕樣式
    const getLocationButtonStyle = (locationType) => {
      const hasLocation = locationType === 'home' ? hasHomeLocation : hasOfficeLocation;

      if (shouldShowActiveState) {
        // 藍色狀態 - 有輸入或聚焦就顯示可儲存狀態
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      } else if (hasLocation) {
        // 綠色狀態 - 已儲存
        return 'bg-[var(--success-color)] hover:bg-green-600';
      } else {
        // 灰色狀態 - 未設定
        return 'bg-gray-500 hover:bg-gray-600';
      }
    };

    // 獲取按鈕提示文字
    const getLocationButtonTip = (locationType) => {
      const hasLocation = locationType === 'home' ? hasHomeLocation : hasOfficeLocation;
      const isHome = locationType === 'home';

      if (shouldShowActiveState) {
        return isHome ? t.saveHomeTip : t.saveOfficeTip;
      } else if (hasLocation) {
        return isHome ? t.useHomeTip : t.useOfficeTip;
      } else {
        return t.enterAddressTip;
      }
    };
    
    // 獲取按鈕顯示文字
    const getLocationButtonText = (locationType) => {
      const hasLocation = locationType === 'home' ? hasHomeLocation : hasOfficeLocation;
      const isHome = locationType === 'home';

      if (shouldShowActiveState) {
        // 有輸入或聚焦就顯示儲存選項
        return isHome ? t.saveHome : t.saveOffice;
      } else if (hasLocation) {
        return isHome ? t.home : t.office;
      } else {
        return isHome ? t.homeNotSet : t.officeNotSet;
      }
    };

    return (
      <div className="quick-location-buttons">
        <div className="quick-buttons-container">
          {/* 住家按鈕 */}
          <button
            onClick={() => onLocationButton('home')}
            className={`quick-location-btn ${getLocationButtonStyle('home')}`}
            title={getLocationButtonTip('home')}
            data-touch-optimized="true"
            data-important-action={shouldShowActiveState ? "true" : "false"}
            aria-label={getLocationButtonTip('home')}
          >
            <div className="quick-btn-icon quick-btn-icon--home"></div>
            <div className="quick-btn-text">
              {getLocationButtonText('home')}
            </div>
          </button>

          {/* 公司按鈕 */}
          <button
            onClick={() => onLocationButton('office')}
            className={`quick-location-btn ${getLocationButtonStyle('office')}`}
            title={getLocationButtonTip('office')}
            data-touch-optimized="true"
            data-important-action={shouldShowActiveState ? "true" : "false"}
            aria-label={getLocationButtonTip('office')}
          >
            <div className="quick-btn-icon quick-btn-icon--briefcase"></div>
            <div className="quick-btn-text">
              {getLocationButtonText('office')}
            </div>
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('QuickLocationButtons component error:', error);
    return null;
  }
}

// 安全的模組匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickLocationButtons;
} else if (typeof window !== 'undefined') {
  window.QuickLocationButtons = QuickLocationButtons;
}
