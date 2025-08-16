// 使用全域 ErrorBoundary 組件（已在 components/shared/ErrorBoundary.js 中定義）

// Hero Banner 組件已移至 components/HeroBanner.js

function App() {
  try {
    const [selectedLanguage, setSelectedLanguage] = React.useState('zh'); // 預設改為中文
    const [currentRestaurant, setCurrentRestaurant] = React.useState(null);
    const [candidateList, setCandidateList] = React.useState([]); // 用戶候選餐廳列表，最多9家
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [searchAbortController, setSearchAbortController] = React.useState(null); // 搜尋中止控制器
    const [lastSearchTime, setLastSearchTime] = React.useState(0); // 最後搜尋時間戳
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

    // 使用滑動轉場管理器 - 解決競態條件
    const slideManager = window.useSlideTransitionManager(currentRestaurant, setCurrentRestaurant);

    // 額外的位置變更清除邏輯 - 使用 useUpdateEffect 避免初始渲染衝突
    window.useUpdateEffect(() => {
      if (window.clearRestaurantHistory && userLocation) {
        const actualRadius = baseUnit * unitMultiplier;
        console.log('🔄 搜索條件變化，清除餐廳歷史記錄:', { selectedMealTime, baseUnit, unitMultiplier, actualRadius, userLocation });
        window.clearRestaurantHistory();
      }
    }, [selectedMealTime, baseUnit, unitMultiplier, userLocation]);

    // 初始化位置服務模組
    const locationService = React.useMemo(() => {
      return window.createLocationService ? window.createLocationService() : null;
    }, []);

    // 主題狀態管理
    const [currentTheme, setCurrentTheme] = React.useState(null);
    const [currentBannerImage, setCurrentBannerImage] = React.useState('./assets/image/banner.jpg');
    const brandSubtitle = currentTheme?.brand?.subtitle || "舞鶴台南民宿";

    // 監聽主題變更事件
    React.useEffect(() => {
      const handleThemeChange = (event) => {
        const newTheme = event.detail.theme;
        setCurrentTheme(newTheme);
        // 更新全頁面背景圖片
        if (newTheme?.images?.banner) {
          setCurrentBannerImage(newTheme.images.banner);
        }
      };

      window.addEventListener('themeChanged', handleThemeChange);

      // 初始設定主題
      if (window.ThemeManager) {
        const initialTheme = window.ThemeManager.getCurrentTheme();
        setCurrentTheme(initialTheme);
        if (initialTheme?.images?.banner) {
          setCurrentBannerImage(initialTheme.images.banner);
        }
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
    
    // 語言切換時重新獲取地址 - 使用 useUpdateEffect 避免初始渲染衝突
    window.useUpdateEffect(() => {
      if (userLocation && locationStatus === 'success') {
        getAddressFromCoords(userLocation.lat, userLocation.lng);
      }
    }, [selectedLanguage]);




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
    
    // 位置改變時自動搜尋新位置資料
    React.useEffect(() => {
      if (userLocation && locationStatus === 'success' && !isInitialLoad) {
        console.log('🔄 位置已改變，清除舊快取並自動搜尋新位置的餐廳資料');
        console.log('🔍 當前狀態 - isSpinning:', isSpinning, 'locationStatus:', locationStatus);
        
        // 🎯 重要：清除餐廳歷史記錄（包括 localStorage 和 React 狀態）
        clearHistory();
        console.log('🧹 已清除餐廳歷史記錄');
        
        // 如果正在轉動，先停止再重新開始
        if (isSpinning) {
          console.log('⏹️ 正在轉動中，先停止搜尋');
          if (searchAbortController) {
            searchAbortController.abort();
            setSearchAbortController(null); // 立即清除控制器
          }
          setIsSpinning(false);

          // 延遲 250ms 後重新搜尋，確保超過防抖機制的 200ms 間隔
          setTimeout(() => {
            // 再次檢查防抖條件，確保不會過於頻繁
            const newCurrentTime = Date.now();
            if (newCurrentTime - lastSearchTime >= 200) {
              setLastSearchTime(newCurrentTime);
              handleSpin(true);
            } else {
              console.log('🚫 重新搜尋被防抖機制阻止');
            }
          }, 250);
        } else {
          // 直接搜尋新位置的資料
          handleSpin(true);
        }
      }
    }, [userLocation]);
    
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
        // RR_LOCATION_047: 地址校正失敗
        window.RRLog?.error('RR_LOCATION_ERROR', '地址校正失敗', { error: error.message });
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
     * 停止正在進行的搜尋
     */
    const handleStopSearch = () => {
      // RR_UI_048: 停止搜尋被觸發
      window.RRLog?.info('RR_UI_CLICK', '停止搜尋被觸發');
      if (searchAbortController) {
        // RR_UI_049: 中止控制器存在
        window.RRLog?.debug('RR_UI_UPDATE', '中止控制器存在，正在中止');
        try {
          searchAbortController.abort();
        } catch (error) {
          console.warn('中止控制器時發生錯誤:', error);
        }
        setSearchAbortController(null);
      } else {
        // RR_UI_050: 沒有中止控制器
        window.RRLog?.debug('RR_UI_UPDATE', '沒有中止控制器，直接停止動畫');
      }
      setIsSpinning(false);
      setSpinError(null);
      // RR_UI_051: 用戶停止搜尋完成
      window.RRLog?.info('RR_UI_UPDATE', '用戶停止搜尋完成');
    };

    /**
     * 智能餐廳搜索函數 - 根據資料可用性決定是否顯示動畫
     * 
     * 邏輯說明：
     * 1. 立即可用：有快取資料或能快速返回 → 不顯示輪盤動畫
     * 2. 需要等待：需要API調用或複雜搜索 → 顯示輪盤動畫分散注意力
     * 3. 自動調用：初次載入時的自動搜索 → 根據實際需要決定
     */
    const handleSpin = async (isAutoSpin = false) => {
      const currentTime = Date.now();
      
      // 防抖機制：確保搜尋間隔至少 200ms
      if (currentTime - lastSearchTime < 200) {
        console.log('🚫 搜尋頻率過高，跳過此次請求');
        return;
      }
      
      setLastSearchTime(currentTime);
      console.log('🎰 轉動開始，isSpinning:', isSpinning, 'isAutoSpin:', isAutoSpin);
      
      // 如果正在搜尋中，按按鈕停止搜尋
      if (isSpinning) {
        handleStopSearch();
        return;
      }

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
          
          // 從快取取得餐廳時，直接更新不觸發滑動轉場（避免轉盤停止後自動滑走）
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
          // setCurrentRestaurant(null); // 註解掉避免版面變化
          
          // 創建中止控制器
          const abortController = new AbortController();
          setSearchAbortController(abortController);
          
          // 🎯 修復：只在位置變更時重置搜索半徑，其他時候保持擴大狀態
          // 位置變更時會清除餐廳歷史，此時才重置搜索半徑
          const shouldResetRadius = !window.previousSearchLocation || 
                                  (window.previousSearchLocation.lat !== userLocation.lat || 
                                   window.previousSearchLocation.lng !== userLocation.lng);
          
          if (shouldResetRadius) {
            const actualRadius = baseUnit * unitMultiplier;
            if (window.updateSearchRadius) {
              window.updateSearchRadius(actualRadius);
              console.log(`📍 位置變更，重置搜索半徑: ${(actualRadius/1000).toFixed(1)}km`);
            }
            // 記錄當前搜索位置
            window.previousSearchLocation = { lat: userLocation.lat, lng: userLocation.lng };
          } else {
            console.log(`📍 相同位置，保持當前搜索半徑擴大狀態`);
          }
          
          try {
            // 調用餐廳搜索API（與動畫並行）- 添加 abort signal 支援
            const restaurant = await window.getRandomRestaurant(userLocation, selectedMealTime, { 
              baseUnit, 
              unitMultiplier,
              abortSignal: abortController.signal
            });
          
          if (restaurant) {
            // 移除API獲取成功日誌
            // API搜尋完成後，直接更新不觸發滑動轉場（避免轉盤停止後自動滑走）
            setCurrentRestaurant(restaurant);
            
            // 立即觸發預載入池管理 - 套用測試檔成功邏輯
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('restaurantChanged', { 
                detail: { restaurant: restaurant, history: restaurantHistory } 
              }));
            }, 0);
            
            // 圖片載入完成後結束動畫
            preloadImageAndStopSpin(restaurant);
            
            // 清除中止控制器
            setSearchAbortController(null);
          } else {
            throw new Error('無法找到符合條件的餐廳');
          }
          } catch (apiError) {
            // 檢查是否為用戶中止的請求
            if (apiError.name === 'AbortError') {
              // RR_UI_052: 搜尋已被用戶中止
              window.RRLog?.debug('RR_UI_UPDATE', '搜尋已被用戶中止');
              return; // 用戶中止，不顯示錯誤
            }
            throw apiError; // 重新拋出其他錯誤
          } finally {
            // 清除中止控制器
            setSearchAbortController(null);
          }
        }

      } catch (error) {
        // 檢查是否為用戶中止的請求
        if (error.name === 'AbortError') {
          // RR_UI_053: 搜尋已被用戶中止
          window.RRLog?.debug('RR_UI_UPDATE', '搜尋已被用戶中止');
          return; // 用戶中止，不顯示錯誤也不設置錯誤狀態
        }

        // RR_SEARCH_054: 餐廳搜索發生錯誤
        window.RRLog?.error('RR_SEARCH_ERROR', '餐廳搜索發生錯誤', { error: error.message });
        setSpinError(error.message);
        setIsSpinning(false);
        setSearchAbortController(null);
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
          // 新餐廳加入到列表最前面
          setCandidateList(prevList => [currentRestaurant, ...prevList]);
          // 加入候選後自動搜尋下一家餐廳
          setTimeout(() => {
            handleUserSpin(false);
          }, 100);
        }
      }
    };

    // 清除候選列表函數
    const handleClearList = () => {
      setCandidateList([]);
    };

    // 從候選列表中移除特定餐廳函數
    const handleRemoveCandidate = (indexToRemove) => {
      setCandidateList(prevList => prevList.filter((_, index) => index !== indexToRemove));
    };

    // 在 Google Maps 中打開餐廳位置和相片（使用共用的四層 fallback 策略）
    const openRestaurantInMaps = () => {
      if (currentRestaurant) {
        const optimized = window.getOptimizedRestaurantQuery(currentRestaurant);
        let url;
        
        if (optimized.type === 'place_id') {
          url = `https://www.google.com/maps/search/?api=1&query_place_id=${currentRestaurant.id}`;
        } else {
          url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(optimized.query)}`;
        }
        
        window.open(url, '_blank');
      }
    };

    // 追蹤操作方向
    const [navigationDirection, setNavigationDirection] = React.useState(null);

    // 處理回到上一家餐廳 - 使用滑動轉場管理器
    const handlePreviousClick = () => {
      const previousRestaurant = handlePreviousRestaurant();
      if (previousRestaurant) {
        setNavigationDirection('previous'); // 標記為向後操作
        // 使用安全的餐廳切換函數
        slideManager.safeRestaurantSwitch(previousRestaurant, 'right');
      }
    };

    // 處理用戶主動搜尋餐廳 - 使用滑動轉場管理器避免競態條件
    const handleUserSpin = async () => {
      // RR_UI_055: handleUserSpin被觸發
      window.RRLog?.debug('RR_UI_CLICK', 'handleUserSpin被觸發', { isSpinning });
      window.RRLog?.updateStats('ui', 'click');
      
      // 如果正在搜尋中，按按鈕停止搜尋
      if (isSpinning) {
        window.RRLog?.debug('RR_UI_UPDATE', '偵測到正在搜尋中，呼叫停止搜尋');
        handleStopSearch();
        return;
      }

      // 檢查是否可以開始滑動轉場
      if (!slideManager.canStartSlide) {
        window.RRLog?.debug('RR_UI_UPDATE', '滑動轉場進行中，跳過此次請求');
        return;
      }

      // 如果有當前餐廳，使用安全的餐廳切換
      if (currentRestaurant) {
        const newRestaurant = await searchNewRestaurant();
        if (newRestaurant) {
          setNavigationDirection('next');
          slideManager.safeRestaurantSwitch(newRestaurant, 'left');
        }
      } else {
        // 沒有當前餐廳，直接搜尋
        handleSpin(false);
      }
    };

    // 搜尋新餐廳的輔助函數
    const searchNewRestaurant = async () => {
      try {
        const cachedRestaurants = window.getAvailableRestaurantsFromCache ?
          window.getAvailableRestaurantsFromCache(selectedMealTime) : [];

        if (cachedRestaurants.length > 0) {
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

          return selectedRestaurant;
        } else {
          // 沒有快取，使用原來的搜尋邏輯
          handleSpin(false);
          return null;
        }
      } catch (error) {
        // RR_SEARCH_057: 搜尋新餐廳失敗
        window.RRLog?.error('RR_SEARCH_ERROR', '搜尋新餐廳失敗', { error: error.message });
        return null;
      }
    };

    // 處理滑動轉場觸發 - 註冊到滑動轉場管理器
    const handleTriggerSlideTransition = React.useCallback((slideTransitionFn) => {
      setTriggerSlideTransition(() => slideTransitionFn);
      // 同時註冊到滑動轉場管理器
      slideManager.registerSlideTransition(slideTransitionFn);
    }, [slideManager]);

    // 更新餐廳歷史記錄 - 使用 useUpdateEffect 避免初始渲染衝突
    window.useUpdateEffect(() => {
      if (currentRestaurant) {
        previousRestaurantRef.current = currentRestaurant;
      }
    }, [currentRestaurant]);

    return (
      <div className="min-h-screen text-[var(--text-primary)] relative overflow-hidden" data-name="app" data-file="app.js">

        {/* 全頁面背景圖片 - 動態切換 */}
        <div
          className="full-page-background theme-transition gpu-accelerated"
          style={{
            backgroundImage: `url(${currentBannerImage})`
          }}
        />

        {/* 全頁面漸層遮罩 - 增強內容可讀性 */}
        <div className="full-page-overlay" />

        {/* 主要內容區域 */}
        <div className="relative z-10">
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

          {/* 主要內容區域 - 毛玻璃效果設計 */}
          <div
            className="w-full gpu-accelerated"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              marginTop: '0', // 與banner無間隔
              padding: '0 30px 30px 30px', // 移除頂部padding，實現與Banner無縫連接
              borderRadius: '0', // 直角設計
              transition: 'all 0.3s ease'
            }}
          >
            <div className="max-w-6xl mx-auto px-6">

            {/* Slot Machine */}
            <div className="flex justify-center">
              <SlotMachine
                isSpinning={isSpinning}
                onSpin={handleUserSpin}
                onAddCandidate={handleAddCandidate}
                translations={t}
                finalRestaurant={currentRestaurant}
                candidateList={candidateList}
                language={selectedLanguage}
                onClearList={handleClearList}
                onRemoveCandidate={handleRemoveCandidate}
                onImageClick={openRestaurantInMaps}
                userLocation={userLocation}
                userAddress={userAddress}
                onPreviousRestaurant={handlePreviousClick}
                onTriggerSlideTransition={handleTriggerSlideTransition}
                restaurantHistory={restaurantHistory}
                selectedMealTime={selectedMealTime}
                baseUnit={baseUnit}
                unitMultiplier={unitMultiplier}
              />
            </div>

          {/* Restaurant Result - 緊貼老虎機底部 */}
          {currentRestaurant && !isSpinning && !spinError && (
            <div>
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
        <div className="max-w-6xl mx-auto mt-8 mb-8 px-4">
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
          </div>

          {/* Footer - 左右到底設計 */}
          <footer
            className="mt-16"
            style={{
              background: 'rgba(0, 0, 0, 0.4)', // 加深背景
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              margin: '0', // 左右到底，不留間隔
              borderRadius: '0', // 直角設計
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '64px' // 固定高度確保垂直居中
            }}
          >
            <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] leading-none">
              <span className="leading-none">© 2025 tribe.org.tw All rights reserved.</span>
            </div>
          </footer>
        </div>
      </div>
    );
  } catch (error) {
    // RR_UI_058: App組件錯誤
    window.RRLog?.error('RR_UI_ERROR', 'App組件錯誤', { error: error.message });
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
