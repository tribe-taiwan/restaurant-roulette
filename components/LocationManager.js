// LocationManager.js - 重構後的位置管理組件
// 使用模組化子組件架構，避免全局變數衝突

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
  // 內部狀態管理，避免全局衝突
  const [isInputFocused, setIsInputFocused] = React.useState(false);

  // 處理輸入框焦點
  const handleInputFocus = React.useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleInputBlur = React.useCallback(() => {
    setIsInputFocused(false);
  }, []);

  // 安全檢查
  if (!translations) {
    console.warn('LocationManager: translations 未提供');
    return (
      <SettingsContainer>
        <div className="text-center text-red-400">
          位置管理組件載入失敗：缺少翻譯資源
        </div>
      </SettingsContainer>
    );
  }

  // 渲染組件
  try {
    return (
      <SettingsContainer>
        {/* 當前定位資訊子組件 */}
        <div className="location-section">
          <CurrentLocationDisplay
            locationStatus={locationStatus}
            userAddress={userAddress}
            translations={translations}
          />
        </div>

        {/* 住家公司快速按鈕子組件 */}
        <div className="location-section">
          <QuickLocationButtons
            savedLocations={savedLocations}
            addressInput={addressInput}
            isInputFocused={isInputFocused}
            onLocationButton={onLocationButton}
            translations={translations}
          />
        </div>

        {/* 地址輸入子組件 */}
        <div className="location-section">
          <AddressInput
            addressInput={addressInput}
            setAddressInput={setAddressInput}
            onAddressConfirm={onAddressConfirm}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            translations={translations}
          />
        </div>

        {/* 定位操作按鈕子組件 */}
        <div className="location-section location-section-last">
          <LocationActions
            locationStatus={locationStatus}
            addressInput={addressInput}
            isInputFocused={isInputFocused}
            isRelocating={isRelocating}
            isGeocodingAddress={isGeocodingAddress}
            onRelocate={onRelocate}
            onAddressConfirm={onAddressConfirm}
            translations={translations}
          />
        </div>
      </SettingsContainer>
    );
  } catch (error) {
    console.error('LocationManager render error:', error);
    return (
      <SettingsContainer>
        <div className="text-center text-red-400">
          位置管理組件渲染失敗，請重新整理頁面
        </div>
      </SettingsContainer>
    );
  }
}

// 註冊到全域範圍
if (typeof window !== 'undefined') {
  window.LocationManager = LocationManager;
}
