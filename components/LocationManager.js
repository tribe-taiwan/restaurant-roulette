// LocationManager.js - 位置管理相關組件
// TODO: 未來可進一步拆分為更小的組件

function LocationManager({ 
  locationStatus, 
  userAddress, 
  savedLocations,
  addressInput,
  setAddressInput,
  isGeocodingAddress,
  onRelocate,
  onAddressConfirm,
  onLocationButton,
  translations,
  isRelocating,
  selectedLanguage,
  userLocation
}) {
  const [manualLocationState, setManualLocationState] = React.useState('idle'); // idle, success
  const [isInputFocused, setIsInputFocused] = React.useState(false); // 追蹤輸入框聚焦狀態

  try {
    const t = translations;

    // 判斷住家和公司的按鈕狀態
    const hasHomeLocation = savedLocations.some(loc => loc.type === 'home');
    const hasOfficeLocation = savedLocations.some(loc => loc.type === 'office');
    const hasAddressInput = addressInput.trim().length > 0;
    const shouldShowActiveState = hasAddressInput || isInputFocused; // 有輸入內容或聚焦時都顯示活躍狀態
    
    // 獲取按鈕樣式和文字
    const getLocationButtonStyle = (locationType) => {
      const hasLocation = locationType === 'home' ? hasHomeLocation : hasOfficeLocation;

      if (shouldShowActiveState) {
        // 橘色狀態 - 有輸入或聚焦就顯示可儲存狀態
        return 'bg-orange-500 hover:bg-orange-600';
      } else if (hasLocation) {
        // 綠色狀態 - 已儲存
        return 'bg-[var(--success-color)] hover:bg-green-600';
      } else {
        // 灰色狀態 - 未設定
        return 'bg-gray-500 hover:bg-gray-600';
      }
    };

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
    
    const getManualLocationButtonStyle = () => {
      if (manualLocationState === 'success') {
        return 'bg-[var(--success-color)] hover:bg-green-600';
      } else if (shouldShowActiveState) {
        return 'bg-orange-500 hover:bg-orange-600';
      } else {
        return 'bg-[var(--primary-color)] hover:bg-[var(--secondary-color)]';
      }
    };
    
    const getManualLocationButtonText = () => {
      if (manualLocationState === 'success') {
        return t.located;
      } else {
        return t.locateHere;
      }
    };
    
    const handleManualLocation = () => {
      onAddressConfirm();
      setManualLocationState('success');
    };

    return (
      <div className="w-full">
        {/* 位置管理區塊 */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          {/* 整合區塊 */}
          <div className="bg-[var(--surface-color)] rounded-lg p-4 w-full glow-container">
            {/* 當前定位資訊 - 置中顯示 */}
            {locationStatus === 'success' && userAddress && (
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="icon-map-pin text-[var(--success-color)] text-sm"></div>
                  <span className="text-sm text-[var(--text-secondary)]">{t.locationDetected}：{userAddress}</span>
                </div>
              </div>
            )}
            {/* 住家公司按鈕 - 總是顯示 */}
            <div className="mb-4">
              <div className="flex gap-2">
                {/* 住家按鈕 */}
                <button
                  onClick={() => onLocationButton('home')}
                  className={`flex-1 text-white px-3 py-2 rounded text-sm transition-colors ${getLocationButtonStyle('home')}`}
                  title={getLocationButtonTip('home')}
                >
                  <span>{getLocationButtonText('home')}</span>
                </button>
                
                {/* 公司按鈕 */}
                <button
                  onClick={() => onLocationButton('office')}
                  className={`flex-1 text-white px-3 py-2 rounded text-sm transition-colors ${getLocationButtonStyle('office')}`}
                  title={getLocationButtonTip('office')}
                >
                  <span>{getLocationButtonText('office')}</span>
                </button>
              </div>
            </div>
            
            {/* 地址輸入 */}
            <div className="mb-3">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => {
                  const input = e.target.value;
                  // 輸入驗證：限制長度和過濾危險字符
                  if (input.length <= 200 && !/[<>\"'&]/.test(input)) {
                    setAddressInput(input);
                  }
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={t.enterAddress}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && onAddressConfirm()}
                maxLength="200"
              />
            </div>
            
            {/* 定位按鈕區域 - 自動定位和手動定位同一行 */}
            <div className="flex gap-2">
              {/* 自動定位按鈕 */}
              <button
                onClick={onRelocate}
                disabled={isRelocating}
                className={`flex-1 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 ${
                  isRelocating 
                    ? 'bg-[var(--secondary-color)] cursor-not-allowed' 
                    : locationStatus === 'success'
                      ? 'bg-[var(--success-color)] hover:bg-green-600'
                      : locationStatus === 'error'
                        ? 'bg-[var(--warning-color)] hover:bg-orange-600'
                        : 'bg-[var(--primary-color)] hover:bg-[var(--secondary-color)]'
                }`}
                title={t.autoLocationTip}
              >
                {isRelocating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <div className="icon-map-pin text-sm"></div>
                    <span>{t.autoLocation}</span>
                  </>
                )}
              </button>
              
              {/* 手動定位按鈕 */}
              <button
                onClick={handleManualLocation}
                disabled={!addressInput.trim() || isGeocodingAddress}
                className={`flex-1 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 ${getManualLocationButtonStyle()} ${(!addressInput.trim() && !isInputFocused) ? 'disabled:bg-gray-600 disabled:hover:bg-gray-600' : ''}`}
                title={t.manualLocationTip}
              >
                {isGeocodingAddress ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <div className="icon-clock text-sm"></div>
                    <span>{getManualLocationButtonText()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LocationManager component error:', error);
    return null;
  }
}
