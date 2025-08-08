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
    // 地址和定位服務函數區塊
    // ===========================================
    
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
        setUserAddress(address);
        setLocationStatus('success');
        setAddressInput('');
        console.log('✅ 地址校正成功:', result, '地址:', address);
      } catch (error) {
        console.error('❌ 地址校正失敗:', error);
        alert('無法找到該地址，請重新輸入');
      }
    };

    // 智能住家/公司按鈕處理 - 根據輸入框狀態決定行為
    const handleLocationButton = async (type, customLocation = null) => {
      // 處理民宿位置的特殊情況
      if (type === 'homebase' && customLocation) {
        console.log('🏠 使用民宿作為起點位置:', customLocation);
        setUserLocation({ lat: customLocation.lat, lng: customLocation.lng });
        setUserAddress(customLocation.address);
        setLocationStatus('success');
        return;
      }

      if (addressInput.trim()) {
        // 輸入框有內容時：儲存位置功能
        await saveLocationFromInput(type);
      } else {
        // 輸入框為空時：使用已儲存位置
        const savedLocation = savedLocations.find(loc => loc.type === type);
        if (savedLocation) {
          await useSavedLocation(savedLocation);
        } else {
          // 沒有保存過相應地址，顯示提示
          const message = type === 'home' ? t.pleaseEnterHomeAddress : t.pleaseEnterOfficeAddress;
          alert(message);
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
        setUserAddress(fullAddress);
        setLocationStatus('success');
        setAddressInput('');
        
        console.log('✅ 位置已儲存並更新定位:', newLocation, '地址:', fullAddress);
      } catch (error) {
        console.error('❌ 儲存位置失敗:', error);
        alert('無法儲存該地址，請重新輸入');
      }
    };

    // 使用已儲存的位置
    const useSavedLocation = async (location) => {
      console.log('🏠 切換到已儲存位置:', location.type, location);
      const newCoords = { lat: location.lat, lng: location.lng };
      setUserLocation(newCoords);
      console.log('🕔 userLocation 已更新為:', newCoords);
      
      // 使用完整地址顯示
      setUserAddress(location.address);
      setLocationStatus('success');
      console.log('✅ 使用已儲存位置:', location, '地址:', location.address);
      
      // 添加小延遲確保狀態更新完成，然後檢查當前的userLocation
      setTimeout(() => {
        console.log('🔍 延遲檢查：當前userLocation狀態:', newCoords);
        console.log('🔍 React狀態是否已更新？比較原始座標:', {
          設定的座標: newCoords,
          實際狀態: userLocation
        });
      }, 100);
    };

    // 獲取地址資訊
    const getAddressFromCoords = async (lat, lng) => {
      try {
        if (window.getAddressFromCoordinates) {
          const address = await window.getAddressFromCoordinates(lat, lng, selectedLanguage);
          setUserAddress(address);
          
          // 初次載入時自動執行餐廳搜索 - 確保userLocation已設定
          if (isInitialLoad && userLocation) {
            setIsInitialLoad(false);
            console.log('🎯 初次載入，自動搜索餐廳...', { userLocation });
            setTimeout(() => {
              handleSpin();
            }, 500); // 延遲500ms確保UI已更新
          }
        }
      } catch (error) {
        console.error('獲取地址失敗:', error);
        setUserAddress(t('addressError'));
        // 即使地址獲取失敗，如果是初次載入也要嘗試搜索餐廳
        if (isInitialLoad && userLocation) {
          setIsInitialLoad(false);
          console.log('🎯 初次載入（地址失敗），仍自動搜索餐廳...', { userLocation });
          setTimeout(() => {
            handleSpin();
          }, 500);
        }
      }
    };

    const getUserLocation = () => {
      setLocationStatus('loading');
      setIsRelocating(true);
      setLocationError(null); // 清除之前的錯誤
      
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        handleLocationError('瀏覽器不支援定位功能');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // 儲存成功的定位到localStorage和狀態
          const locationData = {
            ...coords,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('lastKnownLocation', JSON.stringify(locationData));
          setLastKnownLocation(locationData);
          
          setUserLocation(coords);
          setLocationStatus('success');
          setIsRelocating(false);
          setLocationError(null);
          console.log('Location detected:', coords.lat, coords.lng);
          
          // 獲取地址資訊
          setUserAddress(translations[selectedLanguage]['addressLoading']);
          getAddressFromCoords(coords.lat, coords.lng);
        },
        (error) => {
          console.log('Location error:', error.message);
          
          // 嘗試使用上一次的定位
          if (lastKnownLocation) {
            console.log('使用上一次的定位:', lastKnownLocation);
            setUserLocation({ lat: lastKnownLocation.lat, lng: lastKnownLocation.lng });
            setLocationStatus('success');
            setUserAddress('使用上一次的位置');
            setIsRelocating(false);
            
            // 獲取地址資訊
            setTimeout(() => {
              getAddressFromCoords(lastKnownLocation.lat, lastKnownLocation.lng);
            }, 100);
          } else {
            // 沒有上一次的定位，顯示錯誤
            const errorDetails = {
              errorType: 'LocationError',
              errorMessage: '用戶位置不可用',
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              geolocationSupported: !!navigator.geolocation,
              errorCode: error.code,
              originalMessage: error.message
            };
            
            handleLocationError(`定位失敗。技術資訊: ${JSON.stringify(errorDetails)}`);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    };
    
    // 處理定位錯誤
    const handleLocationError = (errorMessage) => {
      setLocationStatus('error');
      setIsRelocating(false);
      setLocationError(errorMessage);
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

    // 處理回到上一家餐廳
    const handlePreviousClick = () => {
      const previousRestaurant = handlePreviousRestaurant();
      if (previousRestaurant) {
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
        console.log('🔄 [App] 觸發滑動轉場:', {
          previous: previousRestaurantRef.current?.name,
          current: currentRestaurant?.name
        });
        triggerSlideTransition(currentRestaurant, 'left');
      }
      previousRestaurantRef.current = currentRestaurant;
    }, [currentRestaurant, triggerSlideTransition, isSpinning]);

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
