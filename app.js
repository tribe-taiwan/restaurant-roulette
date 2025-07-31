class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [selectedLanguage, setSelectedLanguage] = React.useState('zh'); // 預設改為中文
    const [currentRestaurant, setCurrentRestaurant] = React.useState(null);
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [userLocation, setUserLocation] = React.useState(null);
    const [userAddress, setUserAddress] = React.useState(''); // 地址資訊
    const [locationStatus, setLocationStatus] = React.useState('loading');
    const [spinError, setSpinError] = React.useState(null);
    const [searchRadius, setSearchRadius] = React.useState(2); // 預設2公里
    const [isRelocating, setIsRelocating] = React.useState(false);
    const [selectedMealTime, setSelectedMealTime] = React.useState('lunch'); // 預設午餐時段
    const [isInitialLoad, setIsInitialLoad] = React.useState(true); // 追蹤是否為初次載入
    
    // 地址校正相關狀態
    const [showAddressInput, setShowAddressInput] = React.useState(false);
    const [addressInput, setAddressInput] = React.useState('');
    const [savedLocations, setSavedLocations] = React.useState([]);
    const [isGeocodingAddress, setIsGeocodingAddress] = React.useState(false);

    const translations = {
      en: {
        title: "Restaurant Roulette",
        spinButton: "What shall we eat?",
        spinning: "Finding your restaurant...",
        locationError: "Please allow location access to find nearby restaurants.",
        locationLoading: "Getting your location...",
        relocateButton: "Relocate",
        spinErrorPrefix: "Error: ",
        apiSearching: "Searching nearby restaurants...",
        radiusLabel: "Search radius:",
        radiusKm: "km",
        locationSuccess: "Location found",
        locationDetected: "Located at",
        addressLoading: "Getting address...",
        addressError: "Address unavailable",

        breakfast: "Breakfast",
        lunch: "Lunch", 
        dinner: "Dinner",
        enterAddress: "Enter address to correct location",
        locateHere: "📍 Locate here",
        home: "Home",
        office: "Office",
        saveText: "Save"
      },
      zh: {
        title: "餐廳輪盤",
        spinButton: "等一下要吃什麼？",
        spinning: "正在尋找您的餐廳...",
        locationError: "請允許位置訪問以獲取附近餐廳。",
        locationLoading: "正在獲取您的位置...",
        relocateButton: "重新定位",
        spinErrorPrefix: "錯誤：",
        apiSearching: "正在搜索附近餐廳...",
        radiusLabel: "搜索範圍：",
        radiusKm: "公里",
        locationSuccess: "定位成功",
        locationDetected: "當前位置",
        addressLoading: "正在獲取地址...",
        addressError: "地址無法取得",

        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
        enterAddress: "輸入地址來校正位置",
        locateHere: "📍 定位到這裡",
        home: "住家",
        office: "公司"
      }
    };

    const t = translations[selectedLanguage];

    // 載入已儲存的位置
    React.useEffect(() => {
      const saved = localStorage.getItem('savedLocations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }
    }, []);

    React.useEffect(() => {
      getUserLocation();
    }, []);
    
    // 語言切換時重新獲取地址
    React.useEffect(() => {
      if (userLocation && locationStatus === 'success') {
        getAddressFromCoords(userLocation.lat, userLocation.lng);
      }
    }, [selectedLanguage]);
    
    // 更新滑桿填充顏色
    React.useEffect(() => {
      const percentage = ((searchRadius - 1) / (20 - 1)) * 100;
      const sliders = document.querySelectorAll('.slider');
      sliders.forEach(slider => {
        slider.style.setProperty('--value', `${percentage}%`);
      });
    }, [searchRadius]);

    // 儲存位置到localStorage
    const saveLocationToStorage = (locations) => {
      localStorage.setItem('savedLocations', JSON.stringify(locations));
    };

    // 簡化地址顯示（只到路為止）
    const getSimplifiedAddress = (fullAddress) => {
      if (!fullAddress) return '';
      
      // 使用正則表達式找到路名並截取到路為止
      const roadMatch = fullAddress.match(/(.*?[路街道巷弄])/);
      if (roadMatch) {
        return roadMatch[1];
      }
      
      // 如果沒有找到路名，返回前兩個逗號分隔的部分
      const parts = fullAddress.split(',');
      return parts.slice(0, 2).join('').replace(/\d+號?/g, '').trim();
    };

    // 地址轉換為經緯度
    const geocodeAddress = async (address) => {
      setIsGeocodingAddress(true);
      try {
        const geocoder = new google.maps.Geocoder();
        
        return new Promise((resolve, reject) => {
          geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = results[0].geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng(),
                address: results[0].formatted_address
              });
            } else {
              reject(new Error('無法找到該地址'));
            }
          });
        });
      } catch (error) {
        throw error;
      } finally {
        setIsGeocodingAddress(false);
      }
    };

    // 確認地址校正
    const handleAddressConfirm = async () => {
      if (!addressInput.trim()) return;
      
      try {
        const result = await geocodeAddress(addressInput.trim());
        setUserLocation({ lat: result.lat, lng: result.lng });
        
        // 根據語言獲取地址並立即更新顯示
        const address = await window.getAddressFromCoordinates(result.lat, result.lng, selectedLanguage);
        const simplifiedAddress = getSimplifiedAddress(address);
        setUserAddress(simplifiedAddress);
        setLocationStatus('success');
        setShowAddressInput(false);
        setAddressInput('');
        console.log('✅ 地址校正成功:', result, '簡化地址:', simplifiedAddress);
      } catch (error) {
        console.error('❌ 地址校正失敗:', error);
        alert('無法找到該地址，請重新輸入');
      }
    };

    // 智能住家/公司按鈕處理 - 根據輸入框狀態決定行為
    const handleLocationButton = async (type) => {
      if (addressInput.trim()) {
        // 輸入框有內容時：儲存位置功能
        await saveLocationFromInput(type);
      } else {
        // 輸入框為空時：使用已儲存位置
        const savedLocation = savedLocations.find(loc => loc.type === type);
        if (savedLocation) {
          await useSavedLocation(savedLocation);
        }
      }
    };

    // 從輸入框儲存位置（新功能）
    const saveLocationFromInput = async (type) => {
      if (!addressInput.trim()) return;
      
      try {
        // 先將輸入地址轉為座標
        const result = await geocodeAddress(addressInput.trim());
        const coords = { lat: result.lat, lng: result.lng };
        
        // 獲取完整地址用於儲存
        const fullAddress = await window.getAddressFromCoordinates(coords.lat, coords.lng, selectedLanguage);
        
        const newLocation = {
          type: type,
          lat: coords.lat,
          lng: coords.lng,
          address: fullAddress,
          savedAt: new Date().toISOString()
        };
        
        const updatedLocations = savedLocations.filter(loc => loc.type !== type);
        updatedLocations.push(newLocation);
        
        setSavedLocations(updatedLocations);
        saveLocationToStorage(updatedLocations);
        
        // 立即更新當前定位到儲存的位置
        setUserLocation(coords);
        const simplifiedAddress = getSimplifiedAddress(fullAddress);
        setUserAddress(simplifiedAddress);
        setLocationStatus('success');
        setShowAddressInput(false);
        setAddressInput('');
        
        console.log('✅ 位置已儲存並更新定位:', newLocation, '簡化地址:', simplifiedAddress);
      } catch (error) {
        console.error('❌ 儲存位置失敗:', error);
        alert('無法儲存該地址，請重新輸入');
      }
    };

    // 使用已儲存的位置
    const useSavedLocation = async (location) => {
      setUserLocation({ lat: location.lat, lng: location.lng });
      
      // 使用簡化地址顯示
      const simplifiedAddress = getSimplifiedAddress(location.address);
      setUserAddress(simplifiedAddress);
      setLocationStatus('success');
      setShowAddressInput(false);
      console.log('✅ 使用已儲存位置:', location, '簡化地址:', simplifiedAddress);
    };

    // 獲取地址資訊
    const getAddressFromCoords = async (lat, lng) => {
      try {
        if (window.getAddressFromCoordinates) {
          const address = await window.getAddressFromCoordinates(lat, lng, selectedLanguage);
          setUserAddress(address);
          
          // 初次載入時自動執行餐廳搜索
          if (isInitialLoad && userLocation) {
            setIsInitialLoad(false);
            console.log('🎯 初次載入，自動搜索餐廳...');
            setTimeout(() => {
              handleSpin();
            }, 500); // 延遲500ms確保UI已更新
          }
        }
      } catch (error) {
        console.error('獲取地址失敗:', error);
        setUserAddress(t.addressError);
        // 即使地址獲取失敗，如果是初次載入也要嘗試搜索餐廳
        if (isInitialLoad && userLocation) {
          setIsInitialLoad(false);
          console.log('🎯 初次載入（地址失敗），仍自動搜索餐廳...');
          setTimeout(() => {
            handleSpin();
          }, 500);
        }
      }
    };

    const getUserLocation = () => {
      setLocationStatus('loading');
      setIsRelocating(true);
      
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        setLocationStatus('error');
        setIsRelocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setLocationStatus('success');
          setIsRelocating(false);
          console.log('Location detected:', coords.lat, coords.lng);
          
          // 獲取地址資訊
          setUserAddress(t.addressLoading);
          getAddressFromCoords(coords.lat, coords.lng);
        },
        (error) => {
          console.log('Location error:', error.message);
          setLocationStatus('error');
          setIsRelocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    };

    const handleSpin = async () => {
      if (isSpinning) return;
      
      console.log('🎮 開始轉動輪盤...', { selectedMealTime });
      setIsSpinning(true);
      setCurrentRestaurant(null);
      setSpinError(null);

      try {
        // 先等待一段時間做視覺效果
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔍 開始搜索餐廳，用戶位置:', userLocation);
        
        // 更新搜索半徑
        if (window.updateSearchRadius) {
          window.updateSearchRadius(searchRadius * 1000); // 轉換為公尺
        }
        
        // 調用更新後的 getRandomRestaurant 函數（現在支援營業時間篩選）
        const restaurant = await getRandomRestaurant(userLocation, selectedMealTime);
        
        console.log('✅ 成功獲取餐廳:', restaurant);
        setCurrentRestaurant(restaurant);
        
      } catch (error) {
        console.error('❌ 轉動輪盤時發生錯誤:', error);
        setSpinError(error.message);
      } finally {
        setIsSpinning(false);
      }
    };

    return (
      <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-primary)] p-4" data-name="app" data-file="app.js">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              userLocation={userLocation}
            />
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="flex items-center justify-center gap-4">
                <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={getUserLocation}
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
              
              {/* 地址校正輸入區域 - 優化版 */}
              {showAddressInput && (
                <div className="bg-[var(--surface-color)] rounded-lg p-4 max-w-md mx-auto w-full">
                  {/* 已儲存的位置 - 使用新的合併邏輯 */}
                  {savedLocations.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2">
                        {savedLocations.map((location) => (
                          <button
                            key={location.type}
                            onClick={() => handleLocationButton(location.type)}
                            className="flex-1 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                          >
                            <span>{location.type === 'home' ? '🏠' : '🏢'}</span>
                            <span>{location.type === 'home' ? t.home : t.office}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 地址輸入 - 去掉標題 */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder={t.enterAddress}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-[var(--primary-color)] focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddressConfirm()}
                    />
                  </div>
                  
                  {/* 智能按鈕群組 - 合併定位和儲存功能 */}
                  <div className="flex gap-2">
                    {/* 定位到這裡按鈕 */}
                    <button
                      onClick={handleAddressConfirm}
                      disabled={!addressInput.trim() || isGeocodingAddress}
                      className="flex-1 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      {isGeocodingAddress ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        t.locateHere
                      )}
                    </button>
                    
                    {/* 智能住家按鈕 */}
                    <button
                      onClick={() => handleLocationButton('home')}
                      disabled={isGeocodingAddress}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <span>🏠</span>
                      <span>
                        {addressInput.trim() ? `${selectedLanguage === 'zh' ? '儲存' : t.saveText} ${t.home}` : t.home}
                      </span>
                    </button>
                    
                    {/* 智能公司按鈕 */}
                    <button
                      onClick={() => handleLocationButton('office')}
                      disabled={isGeocodingAddress}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <span>🏢</span>
                      <span>
                        {addressInput.trim() ? `儲存${t.office}` : t.office}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* 搜索範圍設定 */}
            <div className="bg-[var(--surface-color)] rounded-lg p-4 max-w-md mx-auto mb-4">
              <div className="flex items-center justify-between gap-4">
                <label className="text-[var(--text-secondary)] font-medium">
                  {t.radiusLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{'--value': `${((searchRadius - 1) / (20 - 1)) * 100}%`}}
                  />
                  <span className="text-[var(--accent-color)] font-bold min-w-[4rem] text-center">
                    {searchRadius} {t.radiusKm}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 用餐時段選擇 - 去掉標題和all time按鈕 */}
            <div className="bg-[var(--surface-color)] rounded-lg p-4 max-w-md mx-auto mb-8">
              <div className="flex gap-2 justify-center">
                {[
                  { id: 'breakfast', label: t.breakfast, icon: '🌅', time: '6-11' },
                  { id: 'lunch', label: t.lunch, icon: '☀️', time: '11-14' },
                  { id: 'dinner', label: t.dinner, icon: '🌃', time: '17-22' }
                ].map((mealTime) => (
                  <button
                    key={mealTime.id}
                    onClick={() => setSelectedMealTime(mealTime.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedMealTime === mealTime.id
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'bg-gray-700 text-[var(--text-secondary)] hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{mealTime.icon}</span>
                      <span className="text-xs">{mealTime.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slot Machine */}
          <div className="flex justify-center mb-8">
            <SlotMachine 
              isSpinning={isSpinning}
              onSpin={handleSpin}
              translations={t}
              finalRestaurant={currentRestaurant}
            />
          </div>

          {/* Restaurant Result */}
          {currentRestaurant && !isSpinning && !spinError && (
            <div className="mt-8">
              <RestaurantCard 
                restaurant={currentRestaurant}
                language={selectedLanguage}
              />
            </div>
          )}

          {locationStatus === 'loading' && (
            <div className="text-center text-[var(--secondary-color)] mt-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--secondary-color)] border-t-transparent rounded-full animate-spin"></div>
                {t.locationLoading}
              </div>
            </div>
          )}
          
          {locationStatus === 'error' && (
            <div className="text-center text-[var(--warning-color)] mt-4 bg-[var(--surface-color)] rounded-lg p-3 max-w-md mx-auto">
              <div className="icon-map-pin text-[var(--warning-color)] text-lg mb-2"></div>
              {t.locationError}
            </div>
          )}

          {spinError && (
            <div className="text-center text-[var(--warning-color)] mt-4 bg-[var(--surface-color)] rounded-lg p-3 max-w-lg mx-auto">
              <div className="icon-warning text-[var(--warning-color)] text-lg mb-2"></div>
              <div className="text-sm text-left">
                <strong>{t.spinErrorPrefix}</strong>
                <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono overflow-auto">
                  {spinError}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-700">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
              <span>© 2025</span>
              <a 
                href="https://tribe.org.tw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--primary-color)] hover:text-[var(--secondary-color)] transition-colors duration-200 font-medium"
              >
                tribe.org.tw
              </a>
              <span>All rights reserved.</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Restaurant Roulette - Discover amazing food near you
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
