// 移除import，使用全域函數

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

// Hero Banner 組件已移至 components/HeroBanner.js

function App() {
  try {
    const [selectedLanguage, setSelectedLanguage] = React.useState('zh'); // 預設改為中文
    const [currentRestaurant, setCurrentRestaurant] = React.useState(null);
    const [candidateList, setCandidateList] = React.useState([]); // 用戶候選餐廳列表，最多9家
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [userLocation, setUserLocation] = React.useState(null);
    const [userAddress, setUserAddress] = React.useState(''); // 地址資訊
    const [locationStatus, setLocationStatus] = React.useState('loading');
    const [spinError, setSpinError] = React.useState(null);

    const [baseUnit, setBaseUnit] = React.useState(200); // 預設200公尺
    const [unitMultiplier, setUnitMultiplier] = React.useState(1); // 預設倍數1
    const [isRelocating, setIsRelocating] = React.useState(false);
    const [selectedMealTime, setSelectedMealTime] = React.useState('current'); // 預設顯示當前營業中的餐廳
    const [isInitialLoad, setIsInitialLoad] = React.useState(true); // 追蹤是否為初次載入
    const [lastKnownLocation, setLastKnownLocation] = React.useState(null); // 儲存上一次成功的定位
    const [locationError, setLocationError] = React.useState(null); // 儲存定位錯誤訊息

    // 滑動轉場相關狀態
    const [triggerSlideTransition, setTriggerSlideTransition] = React.useState(null);
    const previousRestaurantRef = React.useRef(currentRestaurant);

    // 地址校正相關狀態
    const [addressInput, setAddressInput] = React.useState('');
    const [savedLocations, setSavedLocations] = React.useState([]);
    const [isGeocodingAddress, setIsGeocodingAddress] = React.useState(false);
    
    // 使用餐廳歷史記錄 hook
    const { restaurantHistory, handlePreviousRestaurant, clearHistory, hasHistory } = window.useRestaurantHistory(
      currentRestaurant, 
      { selectedMealTime, baseUnit, unitMultiplier, userLocation },
      isInitialLoad
    );

    // 初始化位置服務模組
    const locationService = React.useMemo(() => {
      return window.createLocationService ? window.createLocationService() : null;
    }, []);

    // 主題狀態管理
    const [currentTheme, setCurrentTheme] = React.useState(null);
    const brandSubtitle = currentTheme?.brand?.subtitle || "舞鶴台南民宿";
    
    // 監聽主題變更事件
    React.useEffect(() => {
      const handleThemeChange = (event) => {
        setCurrentTheme(event.detail.theme);
      };
      
      window.addEventListener('themeChanged', handleThemeChange);
      
      // 初始設定主題
      if (window.ThemeManager) {
        setCurrentTheme(window.ThemeManager.getCurrentTheme());
      }
      
      return () => {
        window.removeEventListener('themeChanged', handleThemeChange);
      };
    }, []);

    // 使用翻譯模組創建翻譯對象 - 根據主題動態更新
    const translations = React.useMemo(() => {
      return window.createTranslations ? window.createTranslations(brandSubtitle) : {};
    }, [brandSubtitle]);

    const t = translations[selectedLanguage];

    // 載入已儲存的位置和上一次的定位
    React.useEffect(() => {
      const saved = localStorage.getItem('savedLocations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }
      
      // 載入上一次的定位
      const lastLocation = localStorage.getItem('lastKnownLocation');
      if (lastLocation) {
        setLastKnownLocation(JSON.parse(lastLocation));
      }
    }, []);

    React.useEffect(() => {
      getUserLocation();
    }, []);

    // 監聽老虎機動畫結束事件
    React.useEffect(() => {
      const handleAnimationEnd = () => {
        setIsSpinning(false);
      };

      window.addEventListener('slotAnimationEnd', handleAnimationEnd);
      return () => {
        window.removeEventListener('slotAnimationEnd', handleAnimationEnd);
      };
    }, []);
    
    // 語言切換時重新獲取地址
    React.useEffect(() => {
      if (userLocation && locationStatus === 'success') {
        getAddressFromCoords(userLocation.lat, userLocation.lng);
      }
    }, [selectedLanguage]);

    // 語言切換時重新計算餐廳營業狀態
    React.useEffect(() => {
      if (currentRestaurant && currentRestaurant.operatingStatus && window.getBusinessStatus) {
        try {
          // 重新計算營業狀態以支援多國語言
          // 注意：這裡無法獲取到原始的 opening_hours 資料，所以只能更新訊息格式
          console.log('🌐 語言切換，重新計算營業狀態:', selectedLanguage);
          
          // 暫時保留原始狀態，理想情況下需要重新調用 getBusinessStatus
          // 但由於沒有 opening_hours 數據，先保持原狀
        } catch (error) {
          console.warn('⚠️ 重新計算營業狀態失敗:', error);
        }
      }
    }, [selectedLanguage, currentRestaurant]);



    // Landing 時自動獲取第一家餐廳 - 添加延遲確保 API 完全準備好
    React.useEffect(() => {
      if (userLocation && locationStatus === 'success' && isInitialLoad && !currentRestaurant && !isSpinning) {
        // 移除Landing自動獲取日誌
        const timer = setTimeout(() => {
          handleSpin(true); // 傳入 true 表示自動調用
          setIsInitialLoad(false);
        }, 1000); // 延遲 1 秒

        return () => clearTimeout(timer);
      }
    }, [userLocation, locationStatus, isInitialLoad, currentRestaurant, isSpinning]);
    
    // ===========================================
    // 工具函數區塊 (純函數，不依賴狀態)
    // ===========================================
    
    // 儲存位置到localStorage
    const saveLocationToStorage = (locations) => {
      localStorage.setItem('savedLocations', JSON.stringify(locations));
    };


    // ===========================================
    // UI 副作用區塊
    // ===========================================
    
    // 更新滑桿填充顏色（新距離系統）
    React.useEffect(() => {
      const percentage = ((unitMultiplier - 1) / (10 - 1)) * 100;
      const sliders = document.querySelectorAll('.slider');
      sliders.forEach(slider => {
        slider.style.setProperty('--value', `${percentage}%`);
      });
    }, [unitMultiplier]);

    // ===========================================
    // 位置服務相關函數 - 使用模組化服務
    // ===========================================
    
    // 確認地址校正
    const handleAddressConfirm = async () => {
      if (!locationService || !addressInput.trim()) return;
      
      setIsGeocodingAddress(true);
      try {
        await locationService.handleAddressConfirm(addressInput, selectedLanguage, {
          setUserLocation,
          setUserAddress,
          setLocationStatus,
          setAddressInput
        });
      } catch (error) {
        console.error('❌ 地址校正失敗:', error);
      } finally {
        setIsGeocodingAddress(false);
      }
    };

    // 智能住家/公司按鈕處理
    const handleLocationButton = async (type, customLocation = null) => {
      if (!locationService) return;
      
      await locationService.handleLocationButton(
        type, 
        customLocation, 
        addressInput, 
        savedLocations, 
        t, 
        {
          setUserLocation,
          setUserAddress,
          setLocationStatus,
          setSavedLocations,
          saveLocationToStorage,
          setAddressInput,
          selectedLanguage
        }
      );
    };

    // 獲取地址資訊
    const getAddressFromCoords = async (lat, lng) => {
      if (!locationService) return;
      
      await locationService.getAddressFromCoords(lat, lng, selectedLanguage, {
        setUserAddress,
        isInitialLoad,
        setIsInitialLoad,
        handleSpin,
        userLocation
      }, translations);
    };

    const getUserLocation = () => {
      if (!locationService) return;
      
      locationService.getUserLocation({
        setLocationStatus,
        setIsRelocating,
        setLocationError,
        setUserLocation,
        setUserAddress,
        setLastKnownLocation,
        selectedLanguage,
        handleLocationError
      }, translations, lastKnownLocation);
    };
    
    // 處理定位錯誤
    const handleLocationError = (errorMessage) => {
      if (!locationService) return;
      
      locationService.handleLocationError(errorMessage, {
        setLocationStatus,
        setIsRelocating,
        setLocationError
      });
    };

    // ===========================================
    // 核心業務邏輯函數區塊
    // ===========================================
    
    /**
     * 智能餐廳搜索函數 - 根據資料可用性決定是否顯示動畫
     * 
     * 邏輯說明：
     * 1. 立即可用：有快取資料或能快速返回 → 不顯示輪盤動畫
     * 2. 需要等待：需要API調用或複雜搜索 → 顯示輪盤動畫分散注意力
     * 3. 自動調用：初次載入時的自動搜索 → 根據實際需要決定
     */
    const handleSpin = async (isAutoSpin = false) => {
      if (isSpinning) return;

      // 移除餐廳搜索開始日誌
      setSpinError(null);

      try {
        // ========================================
        // 簡化邏輯：檢查是否有可用快取
        // ========================================
        const cachedRestaurants = window.getAvailableRestaurantsFromCache ? 
          window.getAvailableRestaurantsFromCache(selectedMealTime) : [];
        
        if (cachedRestaurants.length > 0) {
          // 移除快取餐廳發現日誌
          // 直接從快取取得餐廳，觸發滑動轉場
          const selectedRestaurant = cachedRestaurants[Math.floor(Math.random() * cachedRestaurants.length)];
          
          // 添加距離資訊
          if (userLocation && window.calculateDistance) {
            selectedRestaurant.distance = window.calculateDistance(
              userLocation.lat, userLocation.lng,
              selectedRestaurant.lat, selectedRestaurant.lng
            );
          }
          
          // 更新歷史記錄
          if (window.updateRestaurantHistory) {
            window.updateRestaurantHistory(selectedRestaurant.id, 0);
          }
          
          setCurrentRestaurant(selectedRestaurant);
          
          // 立即觸發預載入池管理 - 套用測試檔成功邏輯
          if (triggerSlideTransition) {
            // 通知SlotMachine立即管理預載入池
            setTimeout(() => {
              // 使用自定義事件通知SlotMachine立即更新預載入池
              window.dispatchEvent(new CustomEvent('restaurantChanged', { 
                detail: { restaurant: selectedRestaurant, history: restaurantHistory } 
              }));
            }, 0);
          }
          // 移除快速顯示餐廳日誌
        } else {
          // 移除啟動輪盤搜索日誌
          // 啟動輪盤動畫，搜索新餐廳
          setIsSpinning(true);
          setCurrentRestaurant(null);
          
          // 計算實際搜索半徑並更新搜索設定
          const actualRadius = baseUnit * unitMultiplier;
          if (window.updateSearchRadius) {
            window.updateSearchRadius(actualRadius);
          }
          
          // 調用餐廳搜索API（與動畫並行）
          const restaurant = await window.getRandomRestaurant(userLocation, selectedMealTime, { baseUnit, unitMultiplier });
          
          if (restaurant) {
            // 移除API獲取成功日誌
            setCurrentRestaurant(restaurant);
            
            // 立即觸發預載入池管理 - 套用測試檔成功邏輯
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('restaurantChanged', { 
                detail: { restaurant: restaurant, history: restaurantHistory } 
              }));
            }, 0);
            
            // 圖片載入完成後結束動畫
            preloadImageAndStopSpin(restaurant);
          } else {
            throw new Error('無法找到符合條件的餐廳');
          }
        }

      } catch (error) {
        console.error('❌ 餐廳搜索發生錯誤:', error);
        setSpinError(error.message);
        setIsSpinning(false);
      }
    };


    /**
     * 圖片預載入與動畫控制 - 僅用於輪盤動畫
     */
    const preloadImageAndStopSpin = (restaurant) => {
      if (restaurant.image) {
        const img = new Image();
        
        img.onload = () => {
          // 移除圖片載入完成日誌
          setIsSpinning(false);
        };
        
        img.onerror = () => {
          // 移除圖片載入失敗日誌
          setTimeout(() => setIsSpinning(false), 500);
        };
        
        img.src = restaurant.image;
      } else {
        // 移除無圖片餐廳日誌
        setTimeout(() => setIsSpinning(false), 800);
      }
    };


    // 加入候選函數
    const handleAddCandidate = () => {
      if (currentRestaurant && candidateList.length < 9) {
        // 檢查是否已經在候選列表中
        const alreadyExists = candidateList.some(candidate => 
          candidate.id === currentRestaurant.id || candidate.name === currentRestaurant.name
        );
        
        if (!alreadyExists) {
          setCandidateList(prevList => [...prevList, currentRestaurant]);
        }
      }
    };

    // 清除候選列表函數
    const handleClearList = () => {
      setCandidateList([]);
    };

    // 處理圖片點擊跳轉到 Google Maps 相片功能
    const handleImageClick = () => {
      if (currentRestaurant) {
        let url;
        if (currentRestaurant.id) {
          // 使用 place_id 直接跳轉到相片頁面
          url = `https://www.google.com/maps/place/?q=place_id:${currentRestaurant.id}&hl=${selectedLanguage === 'zh' ? 'zh-TW' : 'en'}&tab=photos`;
        } else {
          // 回退到一般搜索
          url = `https://www.google.com/maps/search/${encodeURIComponent(currentRestaurant.name + ', ' + currentRestaurant.address)}/photos`;
        }
        window.open(url, '_blank');
      }
    };

    // 追蹤操作方向
    const [navigationDirection, setNavigationDirection] = React.useState(null);

    // 處理回到上一家餐廳
    const handlePreviousClick = () => {
      const previousRestaurant = handlePreviousRestaurant();
      if (previousRestaurant) {
        setNavigationDirection('previous'); // 標記為向後操作
        setCurrentRestaurant(previousRestaurant);
      }
    };

    // 處理滑動轉場觸發
    const handleTriggerSlideTransition = React.useCallback((slideTransitionFn) => {
      setTriggerSlideTransition(() => slideTransitionFn);
    }, []);

    // 監聽餐廳變化，觸發滑動轉場
    React.useEffect(() => {
      if (triggerSlideTransition && previousRestaurantRef.current && currentRestaurant &&
          previousRestaurantRef.current !== currentRestaurant && !isSpinning) {
        
        // 根據操作方向決定滑動方向
        let slideDirection = 'left'; // 預設向左（搜尋下一家，圖片向左滑動）
        
        if (navigationDirection === 'previous') {
          slideDirection = 'right'; // 向右滑動表示回到上一家
          console.log('🔄 [App] 觸發向後滑動轉場 (向右滑動)');
        } else {
          console.log('🔄 [App] 觸發向前滑動轉場 (向左滑動)');
        }
        
        console.log('🔄 [App] 滑動轉場詳情:', {
          previous: previousRestaurantRef.current?.name,
          current: currentRestaurant?.name,
          direction: slideDirection
        });
        
        triggerSlideTransition(currentRestaurant, slideDirection);
        
        // 重置方向標記
        setNavigationDirection(null);
      }
      previousRestaurantRef.current = currentRestaurant;
    }, [currentRestaurant, triggerSlideTransition, isSpinning, navigationDirection]);

    return (
      <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-primary)]" data-name="app" data-file="app.js">
        
        {/* Hero Banner - 整合滑動功能 */}
        {window.HeroBannerWithSliding && (
          <window.HeroBannerWithSliding 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            userLocation={userLocation}
            brandSubtitle={brandSubtitle}
            t={t}
            currentTheme={currentTheme}
          />
        )}

        <div className="max-w-6xl mx-auto px-4">

          {/* Slot Machine */}
          <div className="flex justify-center mb-8">
            <SlotMachine
              isSpinning={isSpinning}
              onSpin={handleSpin}
              onAddCandidate={handleAddCandidate}
              translations={t}
              finalRestaurant={currentRestaurant}
              candidateList={candidateList}
              language={selectedLanguage}
              onClearList={handleClearList}
              onImageClick={handleImageClick}
              userLocation={userLocation}
              userAddress={userAddress}
              onPreviousRestaurant={handlePreviousClick}
              onTriggerSlideTransition={handleTriggerSlideTransition}
              restaurantHistory={restaurantHistory}
              selectedMealTime={selectedMealTime}
            />
          </div>

          {/* Restaurant Result */}
          {currentRestaurant && !isSpinning && !spinError && (
            <div className="mt-8">
              <RestaurantCard
                restaurant={currentRestaurant}
                language={selectedLanguage}
                userLocation={userLocation}
                userAddress={userAddress}
              />
            </div>
          )}

          <StatusMessages 
            locationStatus={locationStatus}
            spinError={spinError}
            locationError={locationError}
            translations={t}
          />
        </div>
        
        {/* Location and Search Settings */}
        <div className="max-w-6xl mx-auto mt-16 mb-8 px-4">
          <LocationManager 
            locationStatus={locationStatus}
            userAddress={userAddress}
            savedLocations={savedLocations}
            addressInput={addressInput}
            setAddressInput={setAddressInput}
            isGeocodingAddress={isGeocodingAddress}
            onRelocate={getUserLocation}
            onAddressConfirm={handleAddressConfirm}
            onLocationButton={handleLocationButton}
            translations={t}
            isRelocating={isRelocating}
            selectedLanguage={selectedLanguage}
            userLocation={userLocation}
          />
          
          <SearchSettings
            selectedMealTime={selectedMealTime}
            setSelectedMealTime={setSelectedMealTime}
            translations={t}
            selectedLanguage={selectedLanguage}
            baseUnit={baseUnit}
            setBaseUnit={setBaseUnit}
            unitMultiplier={unitMultiplier}
            setUnitMultiplier={setUnitMultiplier}
          />
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
