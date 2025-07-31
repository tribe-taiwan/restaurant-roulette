// LocationManager.js - 位置管理相關組件
// TODO: 未來可進一步拆分為更小的組件

function LocationManager({ 
  locationStatus, 
  userAddress, 
  showAddressInput, 
  setShowAddressInput,
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
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center justify-center gap-4">
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
            
            <button
              onClick={() => setShowAddressInput(!showAddressInput)}
              className="w-12 h-12 rounded-full bg-[var(--accent-color)] hover:bg-yellow-500 text-black flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg"
              title="校正位置"
            >
              <div className="icon-edit-3 text-lg font-bold" style={{textShadow: '0 0 2px rgba(255,255,255,0.8)'}}>✏️</div>
            </button>
          </div>
        </div>
        
        {/* 位置資訊顯示 */}
        {locationStatus === 'success' && userAddress && (
          <div className="bg-[var(--surface-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2">
              <div className="icon-map-pin text-[var(--success-color)] text-sm"></div>
              <span>{userAddress}</span>
            </div>
          </div>
        )}
        
        {/* 地址校正輸入區域 */}
        {showAddressInput && (
          <div className="bg-[var(--surface-color)] rounded-lg p-4 max-w-md mx-auto w-full">
            {/* 已儲存的位置 */}
            {savedLocations.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-2">
                  {savedLocations.map((location) => (
                    <button
                      key={location.type}
                      onClick={() => onLocationButton(location.type)}
                      className="flex-1 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <span>{location.type === 'home' ? '🏠' : '🏢'}</span>
                      <span>{location.type === 'home' ? t.home : t.office}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 地址輸入 */}
            <div className="mb-3">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder={t.enterAddress}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-[var(--primary-color)] focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && onAddressConfirm()}
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
                  t.locateHere
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('LocationManager component error:', error);
    return null;
  }
}