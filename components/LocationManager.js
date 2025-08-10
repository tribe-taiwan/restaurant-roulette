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

  try {
    const t = translations;

    // 載入子組件（安全的模組化方式）
    const components = loadLocationManagerComponents();
    const { 
      CurrentLocationDisplay, 
      QuickLocationButtons, 
      AddressInput, 
      LocationActions 
    } = components;

    // 檢查子組件是否正確載入
    if (!CurrentLocationDisplay || !QuickLocationButtons || !AddressInput || !LocationActions) {
      console.error('LocationManager: 子組件載入失敗');
      return null;
    }

    // 處理輸入框聚焦狀態
    const handleInputFocus = () => setIsInputFocused(true);
    const handleInputBlur = () => setIsInputFocused(false);

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-[var(--surface-color)] rounded-lg p-4 mb-8 glow-container">
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
        </div>
      </div>
    );
  } catch (error) {
    console.error('LocationManager component error:', error);
    return null;
  }
}
