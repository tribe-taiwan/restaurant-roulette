// LocationActions.js - 自動/手動定位按鈕子組件
// 安全的模組化組件，處理定位操作

function LocationActions({ 
  locationStatus,
  addressInput,
  isInputFocused,
  isRelocating,
  isGeocodingAddress,
  onRelocate,
  onAddressConfirm,
  translations 
}) {
  // 內部狀態管理，避免全局衝突
  const [manualLocationState, setManualLocationState] = React.useState('idle');

  try {
    const t = translations;
    const hasAddressInput = addressInput.trim().length > 0;
    const shouldShowActiveState = hasAddressInput || isInputFocused;
    
    // 獲取手動定位按鈕樣式 - 使用簡單背景色，不使用漸層
    const getManualLocationButtonStyle = () => {
      if (!addressInput.trim() && !isInputFocused) {
        return 'btn-disabled';
      } else if (manualLocationState === 'success') {
        return 'btn-success-solid';
      } else if (shouldShowActiveState) {
        return 'btn-blue-solid';
      } else {
        return 'btn-gray-solid';
      }
    };
    
    // 獲取手動定位按鈕文字
    const getManualLocationButtonText = () => {
      if (manualLocationState === 'success') {
        return t.located;
      } else {
        return t.locateHere;
      }
    };
    
    // 處理手動定位
    const handleManualLocation = () => {
      onAddressConfirm();
      setManualLocationState('success');
    };

    return (
      <div className="location-actions">
        <div className="location-actions-container">
          {/* 自動定位按鈕 */}
          <button
            onClick={onRelocate}
            disabled={isRelocating}
            className={`location-action-btn auto-location-btn ${
              isRelocating 
                ? 'btn-loading' 
                : locationStatus === 'success'
                  ? 'btn-success'
                  : locationStatus === 'error'
                    ? 'btn-warning'
                    : 'btn-primary'
            }`}
            title={t.autoLocationTip}
            data-touch-optimized="true"
            data-important-action="true"
            aria-label={isRelocating ? `${t.autoLocation} - ${t.loading}` : t.autoLocationTip}
            aria-busy={isRelocating}
          >
            <div className="location-btn-content">
              {isRelocating ? (
                <>
                  <div className="loading-spinner" role="status" aria-label={t.loading}></div>
                  <div className="location-btn-text">
                    {t.locating || '定位中...'}
                  </div>
                </>
              ) : (
                <>
                  <div className="location-btn-icon location-btn-icon--map-pin"></div>
                  <div className="location-btn-text">
                    {t.autoLocation}
                  </div>
                </>
              )}
            </div>
          </button>
          
          {/* 手動定位按鈕 */}
          <button
            onClick={handleManualLocation}
            disabled={!addressInput.trim() || isGeocodingAddress}
            className={`location-action-btn manual-location-btn ${getManualLocationButtonStyle()}`}
            title={t.manualLocationTip}
            data-touch-optimized="true"
            data-important-action={shouldShowActiveState ? "true" : "false"}
            aria-label={isGeocodingAddress ? `${t.locateHere} - ${t.loading}` : t.manualLocationTip}
            aria-busy={isGeocodingAddress}
          >
            <div className="location-btn-content">
              {isGeocodingAddress ? (
                <>
                  <div className="loading-spinner" role="status" aria-label={t.loading}></div>
                  <div className="location-btn-text">
                    {t.geocoding || '地址解析中...'}
                  </div>
                </>
              ) : (
                <>
                  <div className="location-btn-icon location-btn-icon--clock"></div>
                  <div className="location-btn-text">
                    {getManualLocationButtonText()}
                  </div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LocationActions component error:', error);
    return null;
  }
}

// 安全的模組匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocationActions;
} else if (typeof window !== 'undefined') {
  window.LocationActions = LocationActions;
}
