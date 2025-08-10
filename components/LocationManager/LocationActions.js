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
    
    // 獲取手動定位按鈕樣式
    const getManualLocationButtonStyle = () => {
      if (manualLocationState === 'success') {
        return 'bg-[var(--success-color)] hover:bg-green-600';
      } else if (shouldShowActiveState) {
        return 'bg-orange-500 hover:bg-orange-600';
      } else {
        return 'bg-[var(--primary-color)] hover:bg-[var(--secondary-color)]';
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
                  <div className="location-btn-icon">
                    <div className="icon-map-pin"></div>
                  </div>
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
            className={`location-action-btn manual-location-btn ${getManualLocationButtonStyle()} ${(!addressInput.trim() && !isInputFocused) ? 'btn-disabled' : ''}`}
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
                  <div className="location-btn-icon">
                    <div className="icon-clock"></div>
                  </div>
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