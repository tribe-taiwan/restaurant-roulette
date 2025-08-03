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
  isRelocating
}) {
  try {
    const t = translations;

    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
            {t.title}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={onRelocate}
              disabled={isRelocating}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform ${
                isRelocating 
                  ? 'bg-[var(--secondary-color)] cursor-not-allowed' 
                  : locationStatus === 'success'
                    ? 'bg-[var(--success-color)] hover:bg-green-600 hover:scale-105'
                    : locationStatus === 'error'
                      ? 'bg-[var(--warning-color)] hover:bg-orange-600 hover:scale-105'
                      : 'bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] hover:scale-105'
              }`}
              title={t.relocateButton}
            >
              {isRelocating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className={`icon-map-pin text-white text-lg ${
                  locationStatus === 'success' ? 'animate-pulse' : ''
                }`}></div>
              )}
            </button>
          </div>
        </div>
        
        {/* 位置資訊顯示 */}
        {locationStatus === 'success' && userAddress && (
          <div className="bg-[var(--surface-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-secondary)] mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="icon-map-pin text-[var(--success-color)] text-sm"></div>
              <span>{userAddress}</span>
            </div>
          </div>
        )}
        
        {/* 地址輸入區域 - 始終顯示 */}
        <div className="bg-[var(--surface-color)] rounded-lg p-4 w-full">
            {/* 住家公司按鈕 - 總是顯示 */}
            <div className="mb-4">
              <div className="flex gap-2">
                {/* 住家按鈕 */}
                <button
                  onClick={() => onLocationButton('home')}
                  className={`flex-1 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 ${
                    savedLocations.some(loc => loc.type === 'home')
                      ? 'bg-[var(--success-color)] hover:bg-green-600'
                      : 'bg-[var(--primary-color)] hover:bg-[var(--secondary-color)]'
                  }`}
                  title={savedLocations.some(loc => loc.type === 'home') ? '使用已儲存的住家位置' : '將當前輸入儲存為住家位置'}
                >
                  <div className="icon-home text-sm"></div>
                  <span>{t.home}</span>
                </button>
                
                {/* 公司按鈕 */}
                <button
                  onClick={() => onLocationButton('office')}
                  className={`flex-1 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 ${
                    savedLocations.some(loc => loc.type === 'office')
                      ? 'bg-[var(--success-color)] hover:bg-green-600'
                      : 'bg-[var(--primary-color)] hover:bg-[var(--secondary-color)]'
                  }`}
                  title={savedLocations.some(loc => loc.type === 'office') ? '使用已儲存的公司位置' : '將當前輸入儲存為公司位置'}
                >
                  <div className="icon-building text-sm"></div>
                  <span>{t.office}</span>
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
                placeholder={t.enterAddress}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-[var(--primary-color)] focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && onAddressConfirm()}
                maxLength="200"
              />
            </div>
            
            {/* 定位到這裡按鈕 */}
            <div className="flex gap-2">
              <button
                onClick={onAddressConfirm}
                disabled={!addressInput.trim() || isGeocodingAddress}
                className="w-full bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
              >
                {isGeocodingAddress ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <div className="icon-clock text-sm"></div>
                    {t.locateHere}
                  </>
                )}
              </button>
            </div>
          </div>
      </div>
    );
  } catch (error) {
    console.error('LocationManager component error:', error);
    return null;
  }
}