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
    const [selectedLanguage, setSelectedLanguage] = React.useState('en');
    const [currentRestaurant, setCurrentRestaurant] = React.useState(null);
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [userLocation, setUserLocation] = React.useState(null);
    const [locationStatus, setLocationStatus] = React.useState('loading');
    const [spinError, setSpinError] = React.useState(null);
    const [searchRadius, setSearchRadius] = React.useState(5); // 預設5公里
    const [isRelocating, setIsRelocating] = React.useState(false);

    const translations = {
      en: {
        title: "Restaurant Roulette",
        spinButton: "Spin for Restaurant",
        spinning: "Finding your restaurant...",
        locationError: "Please allow location access to find nearby restaurants.",
        locationLoading: "Getting your location...",
        relocateButton: "Relocate",
        spinErrorPrefix: "Error: ",
        apiSearching: "Searching nearby restaurants...",
        radiusLabel: "Search radius:",
        radiusKm: "km",
        locationSuccess: "Location found",
        locationDetected: "Located at"
      },
      zh: {
        title: "餐廳輪盤",
        spinButton: "轉動尋找餐廳",
        spinning: "正在尋找您的餐廳...",
        locationError: "請允許位置訪問以獲取附近餐廳。",
        locationLoading: "正在獲取您的位置...",
        relocateButton: "重新定位",
        spinErrorPrefix: "錯誤：",
        apiSearching: "正在搜索附近餐廳...",
        radiusLabel: "搜索範圍：",
        radiusKm: "公里",
        locationSuccess: "定位成功",
        locationDetected: "當前位置"
      }
    };

    const t = translations[selectedLanguage];

    React.useEffect(() => {
      getUserLocation();
    }, []);
    
    // 更新滑桿填充顏色
    React.useEffect(() => {
      const percentage = ((searchRadius - 1) / (20 - 1)) * 100;
      const sliders = document.querySelectorAll('.slider');
      sliders.forEach(slider => {
        slider.style.setProperty('--value', `${percentage}%`);
      });
    }, [searchRadius]);

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
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('success');
          setIsRelocating(false);
          console.log('Location detected:', position.coords.latitude, position.coords.longitude);
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
      
      console.log('🎮 開始轉動輪盤...');
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
        
        // 調用更新後的 getRandomRestaurant 函數（現在是 async）
        const restaurant = await getRandomRestaurant(userLocation);
        
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
            <div className="flex items-center justify-center gap-4 mb-8">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
                {t.title}
              </h1>
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
                title={locationStatus === 'success' && userLocation 
                  ? `${t.locationDetected}: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` 
                  : t.relocateButton}
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
            
            {/* 搜索範圍設定 */}
            <div className="bg-[var(--surface-color)] rounded-lg p-4 max-w-md mx-auto mb-8">
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