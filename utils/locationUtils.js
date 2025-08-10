// 移除import，使用全域函數

// 簡單的日誌管理系統
const logger = {
  info: (message, ...args) => console.log('ℹ️', message, ...args),
  success: (message, ...args) => console.log('✅', message, ...args),
  warning: (message, ...args) => console.warn('⚠️', message, ...args),
  error: (message, ...args) => console.error('❌', message, ...args),
  debug: (message, ...args) => console.log('🔍', message, ...args)
};

/**
 * 判斷是否為網路相關錯誤（需要重試）
 */
function isNetworkError(status) {
  const networkErrors = [
    'ERROR',
    'REQUEST_DENIED', 
    'UNKNOWN_ERROR',
    'OVER_QUERY_LIMIT'
  ];
  return networkErrors.includes(status);
}

/**
 * API 調用重試機制 - 區分網路失敗和搜不到餐廳
 * @param {Function} apiCall - 要執行的 API 調用函數
 * @param {Object} options - 重試選項
 */
async function retryApiCall(apiCall, options = {}) {
  const { 
    retryDelay = 5000         // 統一5秒延遲
  } = options;
  
  try {
    return await apiCall();
  } catch (error) {
    // 網路問題重試一次
    console.log(`🔄 網路問題，${retryDelay/1000}秒後重試`);
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    // 第二次嘗試
    return await apiCall();
  }
}

// Google Places JavaScript API 配置
// 使用 window 物件讓它可以被動態修改
window.GOOGLE_PLACES_CONFIG = {
  API_KEY: '%%GOOGLE_PLACES_API_KEY%%', // 將在部署時被 GitHub Actions 替換
  SEARCH_PARAMS: {
    radius: 5000, // 預設5公里範圍，可動態更新
    type: 'restaurant'
  }
};

// 為了向後相容，也創建一個 const 引用
const GOOGLE_PLACES_CONFIG = window.GOOGLE_PLACES_CONFIG;

// 引用統一的用餐時段配置（避免重複定義）
// 由於專案使用全域腳本載入，直接從 mealTimeConfig.js 獲取
// 注意：mealTimeConfig.js 已經提供了 window.getMealTimeConfig 函數

// 全局函數用於更新搜索半徑
window.updateSearchRadius = function(newRadius) {
  GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = newRadius;
  logger.info('搜索半徑已更新為:', newRadius, '公尺');
};

// 全局函數用於將經緯度轉換為地址（支援語言切換）
window.getAddressFromCoordinates = async function(lat, lng, language = 'zh') {
  try {
    if (!geocoder) {
      await initializeGoogleMaps();
    }
    
    const latlng = new google.maps.LatLng(lat, lng);
    
    return new Promise((resolve, reject) => {
      // 根據語言設定請求參數
      const geocodeRequest = {
        location: latlng,
        language: language === 'zh' ? 'zh-TW' : 'en'
      };
      
      geocoder.geocode(geocodeRequest, (results, status) => {
        if (status === 'OK' && results[0]) {
          // 提取有意義的地址組件
          const result = results[0];
          const components = result.address_components;
          
          // 尋找：區域、街道、城市
          let district = ''; // 區
          let route = ''; // 路/街道
          let city = '';
          let admin_area_level_3 = ''; // 區級行政區域
          let admin_area_level_2 = ''; // 市級行政區域
          
          components.forEach(component => {
            const types = component.types;
            
            // 根據語言選擇合適的名稱格式
            const componentName = language === 'zh' ? component.long_name : 
                                  (component.short_name || component.long_name);
            
            // 市級行政區域（台南市、高雄市等）
            if (types.includes('administrative_area_level_2') || types.includes('locality')) {
              admin_area_level_2 = componentName;
            }
            // 區級行政區域（西港區、東區等）
            else if (types.includes('administrative_area_level_3')) {
              admin_area_level_3 = componentName;
            }
            // 街道路名
            else if (types.includes('route')) {
              route = componentName;
            }
            // 次級地區（可能包含更具體的區域）
            else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
              if (!admin_area_level_3) { // 只有在沒有區域時才使用
                district = componentName;
              }
            }
          });
          
          // 直接使用 Google 提供的完整格式化地址
          const address = result.formatted_address;
          
          logger.success('地址轉換成功:', { 
            language,
            admin_area_level_2, 
            admin_area_level_3, 
            route, 
            district, 
            final: address 
          });
          resolve(address);
        } else {
          logger.warning('地址轉換失敗:', status);
          resolve(language === 'zh' ? '位置已確認' : 'Location confirmed');
        }
      });
    });
    
  } catch (error) {
    logger.error('地址轉換出錯:', error);
    return language === 'zh' ? '位置已確認' : 'Location confirmed';
  }
};

// 全局變數儲存 Google Maps 服務
let placesService = null;
let geocoder = null;

/**
 * 初始化 Google Maps JavaScript API
 */
function initializeGoogleMaps() {
  return new Promise((resolve, reject) => {
    // 檢查是否已載入
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps API 已載入');
      
      // 建立一個隱藏的地圖來使用 PlacesService
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      
      const map = new google.maps.Map(mapDiv, {
        center: { lat: 0, lng: 0 },
        zoom: 1
      });
      
      placesService = new google.maps.places.PlacesService(map);
      geocoder = new google.maps.Geocoder();
      
      resolve();
      return;
    }
    
    // 動態載入 Google Maps JavaScript API
    console.log('📡 載入 Google Maps JavaScript API...');
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_CONFIG.API_KEY}&libraries=places&callback=onGoogleMapsLoaded`;
    script.async = true;
    script.defer = true;
    
    // 設定全局回調函數將在後面定義
    
    script.onerror = (error) => {
      const errorDetails = {
        errorType: 'GoogleMapsLoadError',
        errorMessage: 'Google Maps JavaScript API 載入失敗',
        timestamp: new Date().toISOString(),
        scriptSrc: script.src,
        apiKey: `${GOOGLE_PLACES_CONFIG.API_KEY.substring(0, 8)}xxxxxxxxxxxxxxxxxxxxxxxx`
      };
      
      reject(new Error(`Google Maps API 載入失敗。技術資訊: ${JSON.stringify(errorDetails)}`));
    };

    // 腳本載入錯誤處理
    script.onerror = () => {
      console.error('❌ Google Maps API 腳本載入失敗');
      reject(new Error('Google Maps API 腳本載入失敗'));
    };

    // 設定超時處理
    const timeout = setTimeout(() => {
      console.error('❌ Google Maps API 載入超時');
      reject(new Error('Google Maps API 載入超時'));
    }, 4000); // 4秒超時

    // 成功載入時清除超時
    const originalResolve = resolve;
    const originalReject = reject;

    // 重新定義回調函數，確保只執行一次
    window.onGoogleMapsLoaded = () => {
      clearTimeout(timeout);
      try {
        console.log('✅ Google Maps API 載入完成');

        // 檢查 Google Maps API 是否正確載入
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Maps API 載入不完整');
        }

        // 建立隱藏地圖
        const mapDiv = document.createElement('div');
        mapDiv.style.display = 'none';
        document.body.appendChild(mapDiv);

        const map = new google.maps.Map(mapDiv, {
          center: { lat: 0, lng: 0 },
          zoom: 1
        });

        placesService = new google.maps.places.PlacesService(map);
        geocoder = new google.maps.Geocoder();

        // 驗證服務是否正確初始化
        if (!placesService || !geocoder) {
          throw new Error('Google Maps 服務初始化失敗');
        }

        console.log('✅ Google Maps 服務初始化成功');
        originalResolve();
      } catch (error) {
        console.error('❌ Google Maps API 初始化失敗:', error);
        originalReject(error);
      }
    };

    document.head.appendChild(script);
  });
}

/**
 * 檢查餐廳是否在指定時間營業
 * @param {Object} openingHours - Google Places opening_hours 對象
 * @param {string} selectedMealTime - 選擇的用餐時段 ('breakfast', 'lunch', 'dinner', 'all')
 * @returns {boolean} 是否營業
 */
/**
 * 計算餐廳距離關門還有幾分鐘（用於20分鐘緩衝區）
 * @param {Object} openingHours - Google Places API 營業時間物件
 * @returns {number|null} 距離關門的分鐘數，如果無法計算則返回 null
 */
function calculateMinutesUntilClose(openingHours) {
  if (!openingHours || !openingHours.periods) {
    return null;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  try {
    // 找到今天的營業時間
    for (const period of openingHours.periods) {
      if (!period.open || !period.close) continue;
      
      const openTime = parseInt(period.open.time);
      const closeTime = parseInt(period.close.time);
      
      // 檢查今天的營業時段
      if (period.open.day === currentDay) {
        let isInBusinessHours = false;
        let closeDateTime = new Date(now);
        
        if (closeTime > openTime) {
          // 同日營業
          isInBusinessHours = currentTime >= openTime && currentTime < closeTime;
          closeDateTime.setHours(Math.floor(closeTime / 100), closeTime % 100, 0, 0);
        } else {
          // 跨夜營業
          isInBusinessHours = currentTime >= openTime;
          closeDateTime.setDate(closeDateTime.getDate() + 1);
          closeDateTime.setHours(Math.floor(closeTime / 100), closeTime % 100, 0, 0);
        }
        
        if (isInBusinessHours) {
          const minutesUntilClose = Math.ceil((closeDateTime - now) / (1000 * 60));
          return Math.max(0, minutesUntilClose);
        }
      }
      
      // 檢查昨夜跨夜營業
      const yesterdayDay = (currentDay + 6) % 7;
      if (period.open.day === yesterdayDay && closeTime < openTime && currentTime <= closeTime) {
        const closeDateTime = new Date(now);
        closeDateTime.setHours(Math.floor(closeTime / 100), closeTime % 100, 0, 0);
        const minutesUntilClose = Math.ceil((closeDateTime - now) / (1000 * 60));
        return Math.max(0, minutesUntilClose);
      }
    }
  } catch (error) {
    console.warn('⚠️ calculateMinutesUntilClose 計算失敗:', error);
  }

  return null;
}

function isRestaurantOpenForMealTime(openingHours, selectedMealTime) {
  if (!openingHours || selectedMealTime === 'all') {
    return true; // 如果沒有營業時間資訊或選擇全部時段，則顯示所有餐廳
  }
  
  // 'current'表示只顯示現在營業中的餐廳，優先使用Google API的isOpen()方法
  if (selectedMealTime === 'current') {


    // 使用新的 Google Places API 的 isOpen() 方法
    // 根據官方文檔，isOpen() 需要 utc_offset_minutes 或 periods 才能正常工作
    // 注意：從 localStorage 讀取的快取數據不會有 isOpen 函數（函數無法序列化）
    if (openingHours && typeof openingHours.isOpen === 'function') {
      try {
        const isOpenNow = openingHours.isOpen();

        // 檢查 isOpen() 是否返回有效結果（不是 undefined）
        if (isOpenNow !== undefined) {
          // 如果營業中，檢查20分鐘緩衝區
          if (isOpenNow) {
            const minutesUntilClose = calculateMinutesUntilClose(openingHours);
            if (minutesUntilClose !== null && minutesUntilClose <= 20) {
              console.log(`⚠️ 餐廳將在${minutesUntilClose}分鐘後關門，排除此餐廳`);
              return false;
            }
          } else {
            // 只在關店時顯示日誌
            console.log('🕐 餐廳已關門，跳過');
          }

          return isOpenNow;
        } else {
          console.log('🔄 Google Places API isOpen() 返回 undefined，缺少必要的時區或營業時間數據');
        }
      } catch (error) {
        console.warn('⚠️ Google Places API isOpen() 調用失敗，回退到 periods 計算:', error);
      }
    }
    // 注意：不輸出 "isOpen() 方法不可用" 的日誌，因為快取數據本來就沒有這個函數
    
    // 回退邏輯：使用 periods 手動計算當前營業狀態
    if (openingHours.periods && openingHours.periods.length > 0) {
      const now = new Date();
      const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      const currentTime = now.getHours() * 100 + now.getMinutes(); // 格式: HHMM
      
      // 檢查今天的營業時段
      for (const period of openingHours.periods) {
        if (!period.open) continue;

        // 檢查是否為今天的營業時段
        if (period.open.day === currentDay) {
          const openTime = parseInt(period.open.time || '0000');
          const closeTime = period.close ? parseInt(period.close.time || '2359') : 2359;
          
          // 處理跨夜營業 (例如: 2200-0200)
          if (closeTime < openTime) {
            // 跨夜營業：當前時間在開門時間之後，或在關門時間之前
            if (currentTime >= openTime || currentTime <= closeTime) {
              return true;
            }
          } else {
            // 同日營業：當前時間在開門和關門時間之間
            if (currentTime >= openTime && currentTime <= closeTime) {
              return true;
            }
          }
        }
        
        // 檢查昨天的跨夜營業時段（例如昨天23:00-今天02:00）
        const yesterdayDay = (currentDay + 6) % 7; // 昨天
        if (period.open.day === yesterdayDay && period.close) {
          const openTime = parseInt(period.open.time || '0000');
          const closeTime = parseInt(period.close.time || '2359');
          
          // 如果是跨夜營業且今天在關門時間內
          if (closeTime < openTime && currentTime <= closeTime) {
            return true;
          }
        }
      }
      
      // 移除營業時間檢查失敗日誌
      return false;
    }
    
    // 如果沒有periods數據，但測試顯示100%餐廳都有營業時間，那就相信Google的isOpen方法
    console.log(`⚠️ 沒有periods數據，預設為營業中`);
    return true; // 2025年優化：如果有營業時間數據但無法解析，預設為營業中
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  // 使用統一的用餐時段配置
  const mealTimes = window.getMealTimeConfig();
  
  const selectedTime = mealTimes[selectedMealTime];
  if (!selectedTime) return true;
  
  try {
    // 如果有 periods 資訊
    if (openingHours.periods) {
      const today = openingHours.periods.find(period => period.open && period.open.day === dayOfWeek);
      if (!today) return false; // 今天不營業
      
      const openTime = parseInt(today.open.time.substring(0, 2));
      // 修復：正確解析關門時間，處理24小時制
      let closeTime;
      if (today.close) {
        const closeTimeStr = today.close.time;
        closeTime = parseInt(closeTimeStr.substring(0, 2));
        // 如果關門時間是凌晨（如01:00），轉換為24+小時制
        if (closeTime < openTime && closeTime < 12) {
          closeTime += 24;
        }
      } else {
        closeTime = 24; // 24小時營業
      }
      
      // 處理晚餐時段16-24的情況
      if (selectedTime.end === 24) {
        // 晚餐時段特殊處理：只要營業到16點以後就算符合
        return closeTime > selectedTime.start;
      }

      // 檢查時段重疊邏輯
      const overlap1 = selectedTime.start >= openTime && selectedTime.start < closeTime;
      const overlap2 = selectedTime.end > openTime && selectedTime.end <= closeTime;
      const overlap3 = selectedTime.start < openTime && selectedTime.end > closeTime;
      const result = overlap1 || overlap2 || overlap3;

      return result;
    }
    
    // 如果只有 weekday_text 資訊，簡單檢查
    if (openingHours.weekday_text) {
      const todayText = openingHours.weekday_text[dayOfWeek === 0 ? 6 : dayOfWeek - 1]; // 調整星期格式
      if (todayText && todayText.includes('Closed')) {
        return false;
      }
    }
    
    return true; // 無法確定時預設顯示
    
  } catch (error) {
    logger.warning('解析營業時間時出錯:', error);
    return true; // 出錯時預設顯示
  }
}

/**
 * 使用 Google Places JavaScript API 搜索附近餐廳 - 改進版本支援多次搜索
 * @param {Object} userLocation - 用戶位置 {lat, lng}
 * @param {string} selectedMealTime - 選擇的用餐時段（保留參數以保持兼容性）
 * @param {Object} options - 搜索選項
 * @returns {Promise<Array>} 餐廳列表
 */
async function searchNearbyRestaurants(userLocation, selectedMealTime = 'all', options = {}) {
  // 解構 abortSignal 參數
  const { abortSignal, ...searchOptions } = options;
  
  // 檢查是否已被中止
  if (abortSignal?.aborted) {
    throw new DOMException('搜尋被中止', 'AbortError');
  }
  
  if (!userLocation) {
    const errorDetails = {
      errorType: 'LocationError',
      errorMessage: '用戶位置不可用',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      geolocationSupported: !!navigator.geolocation
    };
    throw new Error(`定位失敗。技術資訊: ${JSON.stringify(errorDetails)}`);
  }

  try {
    // 確保 Google Maps API 已載入
    if (!placesService) {
      await initializeGoogleMaps();
    }

    // 再次檢查服務是否可用
    if (!placesService) {
      throw new Error('Google Places Service 初始化失敗，請檢查網絡連接或 API Key');
    }
    
    // 使用多區域搜索策略來獲取更多樣化的結果 (替代隨機偏移方法)
    const allRestaurants = [];
    const searchedPlaceIds = new Set(); // 追蹤已搜索的餐廳，避免重複
    
    // 定義9個搜索區域 (城市用，每公里至少100家餐廳)
    const offsetDistance = 0.009; // 約1公里偏移
    const searchAreas = [
      { name: '中心區域', lat: userLocation.lat, lng: userLocation.lng },
      { name: '北區', lat: userLocation.lat + offsetDistance, lng: userLocation.lng },
      { name: '南區', lat: userLocation.lat - offsetDistance, lng: userLocation.lng },
      { name: '東區', lat: userLocation.lat, lng: userLocation.lng + offsetDistance },
      { name: '西區', lat: userLocation.lat, lng: userLocation.lng - offsetDistance },
      { name: '東北區', lat: userLocation.lat + offsetDistance, lng: userLocation.lng + offsetDistance },
      { name: '東南區', lat: userLocation.lat - offsetDistance, lng: userLocation.lng + offsetDistance },
      { name: '西北區', lat: userLocation.lat + offsetDistance, lng: userLocation.lng - offsetDistance },
      { name: '西南區', lat: userLocation.lat - offsetDistance, lng: userLocation.lng - offsetDistance }
    ];
    
    // 搜索策略：餐廳類型
    const searchTypes = ['restaurant', 'meal_takeaway'];
    
    // 根據是否為重複搜索來決定搜索區域數量
    const areasToSearch = options.attempt > 0 ? 
      searchAreas.slice(0, Math.min(3 + options.attempt, searchAreas.length)) : 
      searchAreas.slice(0, 4); // 預設搜索前4個區域
    
    // 計算總搜索次數：區域數 × 餐廳類型數
    const totalSearchCalls = areasToSearch.length * searchTypes.length;
    console.log(`🎯 搜索策略: ${areasToSearch.length}個區域 × ${searchTypes.length}種類型 = ${totalSearchCalls}次API調用`);
    console.log(`📍 搜索區域: ${areasToSearch.map(area => area.name).join('、')}`);
    console.log(`🍽️搜索類型: ${searchTypes.join('、')}`);
    console.log(`📏 搜索半徑: ${GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius/1000}km`);

    for (const area of areasToSearch) {
      // 檢查是否已被中止
      if (abortSignal?.aborted) {
        throw new DOMException('搜尋被中止', 'AbortError');
      }
      
      // 併發執行餐廳類型搜索（優化：同區域不同類型併發，區域間循序）
      // 原因：時間減少50%（2.4s→1.2s），風險可控（只2個併發），錯誤處理簡單
      const typeSearchPromises = searchTypes.map(async (type) => {
        // 檢查是否已被中止
        if (abortSignal?.aborted) {
          throw new DOMException('搜尋被中止', 'AbortError');
        }
        
        // 建立搜索請求，使用用戶設定的搜索半徑
        const request = {
          location: new google.maps.LatLng(area.lat, area.lng),
          radius: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius,
          type: type,
          language: 'zh-TW'
        };
        
        try {
          // 使用重試邏輯的 API 調用
          return await retryApiCall(async () => {
            return new Promise((resolve, reject) => {
              placesService.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  resolve({ type, results: results || [] });
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                  resolve({ type, results: [] });
                } else if (isNetworkError(status)) {
                  // 網路問題，拋出錯誤以觸發重試
                  reject(new Error(`Network error: ${status}`));
                } else {
                  // API 問題（如配額用完），不重試
                  console.warn(`⚠️ ${area.name} ${type} 搜索失敗:`, status);
                  resolve({ type, results: [] });
                }
              });
            });
          });
        } catch (error) {
          console.warn(`⚠️ ${area.name} ${type} 搜索出錯:`, error);
          return { type, results: [] };
        }
      });
      
      // 等待該區域的所有類型搜索完成（併發執行）
      const typeSearchResults = await Promise.allSettled(typeSearchPromises);
      
      // 處理搜索結果
      typeSearchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.results) {
          const { type, results } = result.value;
          let newCount = 0;
          
          results.forEach(restaurant => {
            if (!searchedPlaceIds.has(restaurant.place_id)) {
              searchedPlaceIds.add(restaurant.place_id);
              allRestaurants.push(restaurant);
              newCount++;
            }
          });
          
          // 移除詳細搜索日誌，減少LOG量
        }
      });
    }
    
    if (allRestaurants.length === 0) {
      // 使用實際當前搜索半徑，而不是配置中的固定值
      const currentRadius = options.currentRadius || GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius;
      const errorDetails = {
        errorType: 'NoRestaurantsFound',
        errorMessage: '搜索範圍內無餐廳',
        searchRadius: currentRadius,
        configRadius: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius,
        userLocation: userLocation,
        timestamp: new Date().toISOString(),
        totalResults: 0,
        attempt: options.attempt || 0
      };
      
      // 不再拋出錯誤，直接返回空陣列，讓上層處理擴大搜索
      // 使用實際當前搜索半徑顯示
      console.log(`📍 搜索範圍 ${currentRadius/1000}km 內未找到餐廳`);
      return [];
    }

    // 隨機打亂餐廳列表順序，增加多樣性
    const shuffledRestaurants = allRestaurants.sort(() => Math.random() - 0.5);
    const restaurantsWithDetails = await Promise.all(
      shuffledRestaurants.map(async (restaurant) => {
        try {
          const details = await getPlaceDetails(restaurant.place_id);
          return { ...restaurant, detailsCache: details };
        } catch (error) {
          console.warn('⚠️ 無法獲取餐廳詳細資訊:', restaurant.name, error);
          return { ...restaurant, detailsCache: null };
        }
      })
    );

    // 轉換為應用程式格式
    const formattedRestaurants = await Promise.all(
      restaurantsWithDetails.map(restaurant => formatRestaurantData(restaurant))
    );

    // 移除格式化完成日誌
    return formattedRestaurants;

  } catch (error) {
    logger.error('搜索餐廳時發生錯誤:', error);
    throw error;
  }
}

/**
 * 獲取地點詳細資訊
 * @param {string} placeId - Google Places ID
 * @param {string} language - 語言代碼 (zh-TW, en, ja, ko)
 * @returns {Promise<Object>} 詳細資訊
 */
async function getPlaceDetails(placeId, language = 'zh-TW') {
  try {
    if (!placesService) {
      await initializeGoogleMaps();
    }
    
    const request = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'website', 'price_level', 'url', 'utc_offset_minutes'],
      language: language
    };
    
    return await retryApiCall(async () => {
      return new Promise((resolve, reject) => {
        placesService.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(place);
          } else if (isNetworkError(status)) {
            // 網路問題，拋出錯誤以觸發重試
            reject(new Error(`Network error in getDetails: ${status}`));
          } else {
            // API 問題（如找不到地點），不重試
            console.warn('⚠️ 無法獲取地點詳細資訊:', status);
            resolve(null);
          }
        });
      });
    });
    
  } catch (error) {
    console.error('❌ 獲取地點詳細資訊時出錯:', error);
    return null;
  }
}

/**
 * 格式化餐廳資料以符合應用程式需求
 * @param {Object} place - Google Places API 回傳的地點資料
 * @returns {Promise<Object>} 格式化後的餐廳資料
 */
async function formatRestaurantData(place) {
  try {
    // 移除格式化過程日誌

    // 獲取中文和英文詳細資訊
    const detailsZh = place.detailsCache || await getPlaceDetails(place.place_id, 'zh-TW');
    const detailsEn = await getPlaceDetails(place.place_id, 'en');
    
    // 使用中文資訊作為主要資訊
    const details = detailsZh;
    
    // 處理照片 如果餐廳有Google Places API提供的照片，會使用真實照片；如果沒有，就使用這張Unsplash的預設餐廳圖片。
    // let imageUrl = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500';
    let imageUrl = './assets/image/banner.jpg';
    if (place.photos && place.photos.length > 0) {
      imageUrl = place.photos[0].getUrl({ maxWidth: 800 });
    }

    // 處理價格等級
    const priceLevel = place.price_level || (details && details.price_level) || 2;
    
    // 處理營業時間 - 使用純文字格式，避免XSS風險
    // 注意：這裡暫時使用預設語言，實際語言會在組件層面處理
    let hours = '營業時間請洽餐廳';
    if (details && details.opening_hours && details.opening_hours.weekday_text) {
      // 格式化營業時間為純文字陣列，由組件負責渲染樣式
      const rawHours = details.opening_hours.weekday_text.filter(text => text); // 過濾空值

      // 先儲存原始資料，讓組件層面根據當前語言進行格式化
      hours = rawHours; // 保留原始資料，讓 RestaurantCard 根據當前語言格式化
    }

    // 處理餐廳類型
    const cuisine = place.types ? 
      place.types.filter(type => !['establishment', 'point_of_interest', 'food'].includes(type))
        .map(type => {
          // 轉換英文類型為中文
          const typeMap = {
            'restaurant': '餐廳',
            'meal_takeaway': '外帶',
            'meal_delivery': '外送',
            'bakery': '烘焙店',
            'cafe': '咖啡廳',
            'bar': '酒吧',
            'night_club': '夜店'
          };
          return typeMap[type] || type;
        }) :
      ['餐廳'];

    // 計算營業狀態 - 需要語言參數，但這裡沒有，所以使用預設中文
    const businessStatusInfo = getBusinessStatus(details?.opening_hours, 'zh');
    
    // 格式化資料
    const formattedData = {
      id: place.place_id,
      name: place.name,
      // 添加中文和英文名稱
      name_zh: (detailsZh && detailsZh.name) || place.name,
      name_en: (detailsEn && detailsEn.name) || place.name,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      rating: Math.round((place.rating || 0) * 10) / 10, // 保留一位小數
      reviewCount: place.user_ratings_total || 0,
      priceLevel: priceLevel,
      cuisine: cuisine,
      address: place.formatted_address || place.vicinity,
      phone: (details && details.formatted_phone_number) || '電話請洽餐廳',
      hours: hours,
      image: imageUrl,
      website: (details && details.website) || null,
      googleMapsUrl: (details && details.url) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + (place.formatted_address || place.vicinity))}&query_place_id=${place.place_id}`,
      businessStatus: place.business_status || 'OPERATIONAL',
      operatingStatus: businessStatusInfo,
      // 保留營業時間數據供篩選使用
      detailsCache: details
    };

    // 移除格式化完成日誌
    return formattedData;

  } catch (error) {
    const errorDetails = {
      errorType: 'FormatError',
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
      placeData: {
        place_id: place.place_id,
        name: place.name,
        hasPhotos: !!(place.photos && place.photos.length > 0),
        hasGeometry: !!place.geometry
      }
    };
    
    throw new Error(`格式化餐廳資料失敗。技術資訊: ${JSON.stringify(errorDetails)}`);
  }
}

/**
 * 計算兩點間距離（公里）
 * @param {number} lat1 - 第一點緯度
 * @param {number} lng1 - 第一點經度
 * @param {number} lat2 - 第二點緯度
 * @param {number} lng2 - 第二點經度
 * @returns {number} 距離（公里）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // 保留兩位小數
}

/**
 * 計算營業狀態和時間
 * @param {Object} openingHours - Google Places opening_hours 對象
 * @param {string} language - 語言代碼 ('en', 'zh', 'ja', 'ko', 'es', 'fr')
 * @returns {Object} 營業狀態信息
 */
function getBusinessStatus(openingHours, language = 'zh') {
  // 這裡有翻譯系統

  if (!openingHours) {
    return { status: 'unknown', message: window.getTranslation ? window.getTranslation(language, 'hoursUnknown') : 'Hours Unknown' };
  }

  // 使用 Google 推薦的 isOpen() 方法
  if (typeof openingHours.isOpen === 'function') {
    try {
      const isOpenNow = openingHours.isOpen();

      // 檢查 isOpen() 是否返回有效結果（不是 undefined）
      if (isOpenNow !== undefined) {
        return {
          status: isOpenNow ? 'open' : 'closed',
          message: isOpenNow ? (window.getTranslation ? window.getTranslation(language, 'openNow') : 'Open now') : (window.getTranslation ? window.getTranslation(language, 'closed') : 'Closed')
        };
      } else {
        console.log('🔄 getBusinessStatus isOpen() 返回 undefined，缺少必要的時區或營業時間數據');
      }
    } catch (error) {
      console.warn('⚠️ getBusinessStatus isOpen() 方法調用失敗:', error);
    }
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const currentTime = now.getHours() * 100 + now.getMinutes(); // 格式: HHMM

  try {
    // 如果 isOpen() 方法不可用，使用 periods 計算邏輯作為備用
    if (openingHours.periods) {
      // 找到今天的營業時間
      const todayPeriods = openingHours.periods.filter(period => 
        period.open && period.open.day === currentDay
      );
      
      if (todayPeriods.length === 0) {
        return { status: 'closed', message: window.getTranslation ? window.getTranslation(language, 'closedToday') : 'Closed today' };
      }
      
      for (const period of todayPeriods) {
        const openTime = parseInt(period.open.time);
        const closeTime = period.close ? parseInt(period.close.time) : 2400;
        
        // 處理跨夜營業時間（例如：18:00 - 01:00）
        let isOpen = false;
        if (closeTime > openTime) {
          // 同日營業：開店到關店在同一天
          isOpen = currentTime >= openTime && currentTime < closeTime;
        } else {
          // 跨夜營業：開店在今天，關店在明天
          isOpen = currentTime >= openTime || currentTime < closeTime;
        }
        
        if (isOpen) {
          // 目前營業中，計算還有多久關門
          let closeDateTime = new Date(now);
          const closeHour = Math.floor(closeTime / 100);
          const closeMinute = closeTime % 100;
          
          if (closeTime <= openTime) {
            // 跨夜營業，關門時間在明天
            closeDateTime.setDate(closeDateTime.getDate() + 1);
          }
          closeDateTime.setHours(closeHour, closeMinute, 0, 0);
          
          const hoursUntilClose = Math.ceil((closeDateTime - now) / (1000 * 60 * 60));
          return {
            status: 'open',
            message: hoursUntilClose > 0 ? `${hoursUntilClose} ${window.getTranslation ? window.getTranslation(language, 'hoursAfterClosing') : 'hours until closing'}` : (window.getTranslation ? window.getTranslation(language, 'closingSoon') : 'Closing soon')
          };
        } else if (currentTime < openTime && closeTime > openTime) {
          // 今天還未營業（非跨夜營業）
          const openHour = Math.floor(openTime / 100);
          const openMinute = openTime % 100;
          const openDateTime = new Date(now);
          openDateTime.setHours(openHour, openMinute, 0, 0);
          
          const hoursUntilOpen = Math.ceil((openDateTime - now) / (1000 * 60 * 60));
          return {
            status: 'closed',
            message: hoursUntilOpen > 0 ? `${hoursUntilOpen} ${window.getTranslation ? window.getTranslation(language, 'hoursAfterOpening') : 'hours until opening'}` : (window.getTranslation ? window.getTranslation(language, 'openingSoon') : 'Opening soon')
          };
        }
      }
      
      // 今天已經打烊，找明天的營業時間
      const tomorrow = (currentDay + 1) % 7;
      const tomorrowPeriods = openingHours.periods.filter(period => 
        period.open && period.open.day === tomorrow
      );
      
      if (tomorrowPeriods.length > 0) {
        const openTime = parseInt(tomorrowPeriods[0].open.time);
        const openHour = Math.floor(openTime / 100);
        const openMinute = openTime % 100;
        const openDateTime = new Date(now);
        openDateTime.setDate(openDateTime.getDate() + 1);
        openDateTime.setHours(openHour, openMinute, 0, 0);
        
        const hoursUntilOpen = Math.ceil((openDateTime - now) / (1000 * 60 * 60));
        return {
          status: 'closed',
          message: `${hoursUntilOpen} ${window.getTranslation ? window.getTranslation(language, 'hoursAfterOpening') : 'hours until opening'}`
        };
      }
    }
    
    
    return { status: 'unknown', message: window.getTranslation ? window.getTranslation(language, 'hoursUnknown') : 'Hours unknown' };

  } catch (error) {
    console.warn('⚠️ 解析營業狀態時出錯:', error);
    return { status: 'unknown', message: window.getTranslation ? window.getTranslation(language, 'hoursUnknown') : 'Hours unknown' };
  }
}

/**
 * 餐廳歷史記錄管理
 */
window.getRestaurantHistory = function() {
  try {
    const history = localStorage.getItem('restaurant_history');
    if (!history) return null;

    const data = JSON.parse(history);
    const now = Date.now();

    // 檢查是否超過5分鐘
    if (now - data.timestamp > 5 * 60 * 1000) {
      localStorage.removeItem('restaurant_history');
      return null;
    }

    return data;
  } catch (error) {
    console.warn('⚠️ 讀取餐廳歷史記錄失敗:', error);
    localStorage.removeItem('restaurant_history');
    return null;
  }
}

function updateRestaurantHistory(restaurantId, expandedRadius = 0) {
  try {
    let history = getRestaurantHistory();

    if (!history) {
      history = {
        timestamp: Date.now(),
        shown_restaurants: [],
        cached_restaurants: [], // 新增：快取的所有餐廳
        expanded_radius: expandedRadius
      };
    }

    // 添加餐廳ID到歷史記錄
    if (!history.shown_restaurants.includes(restaurantId)) {
      history.shown_restaurants.push(restaurantId);
    }

    // 更新擴展半徑
    history.expanded_radius = expandedRadius;

    localStorage.setItem('restaurant_history', JSON.stringify(history));
    // 移除歷史記錄更新日誌
  } catch (error) {
    console.warn('⚠️ 更新餐廳歷史記錄失敗:', error);
  }
}

/**
 * 更新餐廳快取 - 儲存API搜索到的所有餐廳
 * @param {Array} restaurants - 搜索到的餐廳列表
 */
function updateRestaurantCache(restaurants) {
  try {
    let history = getRestaurantHistory();

    if (!history) {
      history = {
        timestamp: Date.now(),
        shown_restaurants: [],
        cached_restaurants: [],
        expanded_radius: 0
      };
    }

    // 確保 cached_restaurants 數組存在
    if (!history.cached_restaurants) {
      history.cached_restaurants = [];
    }

    // 合併新的餐廳到快取，避免重複
    restaurants.forEach(restaurant => {
      const exists = history.cached_restaurants.some(cached => cached.id === restaurant.id);
      if (!exists) {
        // 只存儲必要的餐廳資訊，避免存儲包含已棄用屬性的原始 Google Places 物件
        const cleanRestaurant = {
          id: restaurant.id,
          name: restaurant.name,
          name_zh: restaurant.name_zh,
          name_en: restaurant.name_en,
          lat: restaurant.lat,
          lng: restaurant.lng,
          rating: restaurant.rating,
          reviewCount: restaurant.reviewCount,
          priceLevel: restaurant.priceLevel,
          cuisine: restaurant.cuisine,
          address: restaurant.address,
          phone: restaurant.phone,
          hours: restaurant.hours,
          image: restaurant.image,
          website: restaurant.website,
          googleMapsUrl: restaurant.googleMapsUrl,
          businessStatus: restaurant.businessStatus,
          operatingStatus: restaurant.operatingStatus,
          // 保留營業時間資訊，但清理已棄用屬性
          detailsCache: restaurant.detailsCache ? {
            opening_hours: restaurant.detailsCache.opening_hours ? {
              periods: restaurant.detailsCache.opening_hours.periods,
              weekday_text: restaurant.detailsCache.opening_hours.weekday_text
              // 注意：不存儲 isOpen 函數，因為函數無法序列化到 localStorage
              // 不包含已棄用的 open_now, utc_offset 等屬性
            } : null,
            utc_offset_minutes: restaurant.detailsCache.utc_offset_minutes
          } : null
        };
        history.cached_restaurants.push(cleanRestaurant);
      }
    });

    localStorage.setItem('restaurant_history', JSON.stringify(history));
    // 移除快取更新日誌
  } catch (error) {
    console.warn('⚠️ 更新餐廳快取失敗:', error);
  }
}

/**
 * 從快取中獲取可用餐廳
 * @param {string} selectedMealTime - 選擇的用餐時段
 * @returns {Array} 可用的餐廳列表
 */
function getAvailableRestaurantsFromCache(selectedMealTime) {
  try {
    const history = getRestaurantHistory();

    if (!history || !history.cached_restaurants || history.cached_restaurants.length === 0) {
      // 只在首次或重要狀態變化時顯示
      return [];
    }

    // 統計沒有營業時間數據的餐廳
    const noHoursRestaurants = [];

    // 篩選：營業中 + 未出現過
    const availableRestaurants = history.cached_restaurants.filter(restaurant => {
      const isOpen = isRestaurantOpenInTimeSlot(restaurant, selectedMealTime, true); // 抑制個別日誌
      const notShown = !history.shown_restaurants.includes(restaurant.id);

      // 收集沒有營業時間數據的餐廳
      if (selectedMealTime === 'current' && !restaurant.detailsCache?.opening_hours) {
        noHoursRestaurants.push(restaurant.name);
      }

      return isOpen && notShown;
    });

    // 統一顯示沒有營業時間數據的餐廳日誌
    if (noHoursRestaurants.length > 0) {
      console.log(`⚠️ 幕後補充: ${noHoursRestaurants.length}家餐廳沒有營業時間數據已排除 (${noHoursRestaurants.slice(0, 3).join('、')}${noHoursRestaurants.length > 3 ? '等' : ''})`);
    }

    return availableRestaurants;
  } catch (error) {
    console.warn('⚠️ 從快取獲取餐廳失敗:', error);
    return [];
  }
}

// 用於避免重複日誌的記憶機制
const loggedRestaurants = new Set();

/**
 * 檢查餐廳是否在指定時段營業
 * @param {Object} restaurant - 餐廳資訊
 * @param {string} timeSlot - 時段 ('breakfast', 'lunch', 'dinner', 'all')
 * @param {boolean} suppressLog - 是否抑制日誌輸出（用於批量檢查）
 * @returns {boolean} 是否營業
 */
function isRestaurantOpenInTimeSlot(restaurant, timeSlot, suppressLog = false) {
  // 【防護性註解：2025-01-02】遊客時間寶貴，沒有營業時間數據的餐廳必須排除，避免白跑一趟
  // 【重要】不得將沒有營業時間數據的餐廳視為營業中，這會誤導用戶
  if (timeSlot === 'current') {
    if (!restaurant.detailsCache?.opening_hours) {
      // 只在非抑制模式下顯示日誌
      if (!suppressLog) {
        // 避免重複日誌：每家餐廳只記錄一次
        const logKey = `no-hours-${restaurant.id || restaurant.name}`;
        if (!loggedRestaurants.has(logKey)) {
          loggedRestaurants.add(logKey);
          console.log(`⚠️ 餐廳 ${restaurant.name} 沒有營業時間數據，為保護用戶時間必須排除`);
        }
      }
      return false; // 沒有營業時間數據時，必須排除該餐廳，保護用戶時間
    }
    return isRestaurantOpenForMealTime(restaurant.detailsCache.opening_hours, 'current');
  }

  // 其他時段篩選保持原有邏輯
  if (timeSlot === 'all' || !restaurant.detailsCache?.opening_hours) {
    return true; // 無法確定時預設可用
  }

  // 使用統一的用餐時段配置
  const timeSlots = window.getMealTimeConfig();

  const slot = timeSlots[timeSlot];
  if (!slot) return true;

  return isRestaurantOpenForMealTime(restaurant.detailsCache.opening_hours, timeSlot);
}

/**
 * 獲取隨機餐廳 - 改進版本使用多樣化搜索策略
 * @param {Object} userLocation - 用戶位置
 * @param {string} selectedMealTime - 選擇的用餐時段
 * @returns {Promise<Object>} 隨機餐廳
 */
window.getRandomRestaurant = async function(userLocation, selectedMealTime = 'all', distanceConfig = {}) {
  // 解構 abortSignal 參數
  const { abortSignal, ...otherConfig } = distanceConfig;
  
  // 清除重複日誌記憶，開始新的搜索週期
  loggedRestaurants.clear();
  
  // 檢查是否已被中止
  if (abortSignal?.aborted) {
    throw new DOMException('搜尋被中止', 'AbortError');
  }

  // ========================================
  // 第一步：檢查快取中是否有可用餐廳
  // ========================================
  const cachedRestaurants = getAvailableRestaurantsFromCache(selectedMealTime);
  if (cachedRestaurants.length > 0) {
    // 移除快取選擇日誌
    
    // 隨機選擇一家餐廳
    const selectedRestaurant = cachedRestaurants[Math.floor(Math.random() * cachedRestaurants.length)];
    
    // 添加距離信息
    if (userLocation) {
      selectedRestaurant.distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        selectedRestaurant.lat, selectedRestaurant.lng
      );
    }
    
    // 更新歷史記錄（標記為已顯示）
    updateRestaurantHistory(selectedRestaurant.id, 0);
    
    // 移除快取獲取成功日誌
    return selectedRestaurant;
  }

  // ========================================
  // 第二步：快取中沒有可用餐廳，調用API
  // ========================================
  // 移除API搜索開始日誌

  const history = getRestaurantHistory() || { shown_restaurants: [], cached_restaurants: [], expanded_radius: 0 };
  const originalRadius = GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius;
  
  // 從新距離系統獲取參數
  const { baseUnit = 1000, unitMultiplier = 2 } = distanceConfig;
  const baseRadius = baseUnit * unitMultiplier;
  
  // 最多嘗試25次：前5次使用多樣化搜索，後20次使用baseUnit智能擴展
  const maxAttempts = 25;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 檢查是否已被中止
    if (abortSignal?.aborted) {
      throw new DOMException('搜尋被中止', 'AbortError');
    }
    
    let searchRadius = originalRadius;
    let searchOptions = { attempt: attempt };
    
    // 前5次嘗試：在用戶設定的距離內使用不同搜索策略
    if (attempt < 5) {
      searchRadius = baseRadius;
      const expectedAreas = Math.min(3 + attempt + 1, 9); // 預期搜索區域數
      const expectedCalls = expectedAreas * 2; // 2種餐廳類型
      console.log(`🔍 第${attempt + 1}次嘗試: 多區域搜索 (${searchRadius/1000}km範圍，約${expectedAreas}區域)`);
    } else {
      // 後續嘗試：使用baseUnit智能擴展範圍
      const expansionMultiplier = attempt - 4; // 擴展倍數：1, 2, 3, ...
      searchRadius = baseRadius + (baseUnit * expansionMultiplier);
      console.log(`🔍 第${attempt + 1}次嘗試: 擴展範圍 ${searchRadius/1000}km (基礎${baseRadius/1000}km + 擴展${(baseUnit * expansionMultiplier)/1000}km)`);
    }

    // 臨時更新搜索半徑
    GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = searchRadius;

    try {
      // 獲取餐廳列表，傳入搜索選項、當前搜索半徑和 abortSignal
      const restaurants = await searchNearbyRestaurants(userLocation, selectedMealTime, { 
        ...searchOptions, 
        currentRadius: searchRadius,
        abortSignal 
      });

      // 重要：將所有搜索到的餐廳加入快取
      if (restaurants.length > 0) {
        updateRestaurantCache(restaurants);
        // 移除快取加入日誌
      }

      // 篩選：營業中 + 未出現過
      const availableRestaurants = restaurants.filter(restaurant => {
        const isOpen = isRestaurantOpenInTimeSlot(restaurant, selectedMealTime);
        const notShown = !history.shown_restaurants.includes(restaurant.id);

        // 移除餐廳篩除日誌，減少LOG量

        return isOpen && notShown;
      });

      // 添加調試信息，當篩選後沒有餐廳時
      if (availableRestaurants.length === 0 && restaurants.length > 0) {
        const openCount = restaurants.filter(r => isRestaurantOpenInTimeSlot(r, selectedMealTime)).length;
        const notShownCount = restaurants.filter(r => !history.shown_restaurants.includes(r.id)).length;
        console.log(`📊 搜索結果: 找到${restaurants.length}家餐廳，${openCount}家營業中，${notShownCount}家未顯示過，已顯示${history.shown_restaurants.length}家`);
      }

      if (availableRestaurants.length > 0) {
        // 隨機選擇一家餐廳
        const selectedRestaurant = availableRestaurants[Math.floor(Math.random() * availableRestaurants.length)];

        // 添加距離信息
        if (userLocation) {
          selectedRestaurant.distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            selectedRestaurant.lat, selectedRestaurant.lng
          );
        }

        // 更新歷史記錄
        const expandedRadius = attempt > 4 ? (attempt - 4) : 0;
        updateRestaurantHistory(selectedRestaurant.id, expandedRadius);

        // 恢復原始搜索半徑
        GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = originalRadius;

        // 移除成功獲取餐廳日誌
        return selectedRestaurant;
      }

      // 沒有可用餐廳，繼續下一次嘗試（不輸出警告，因為這是正常的擴大搜索流程）

    } catch (error) {
      // 只有真正的 API/網路錯誤才會到這裡
      console.error(`❌ 第${attempt + 1}次搜索發生錯誤:`, error);

      // 如果是最後一次嘗試，拋出錯誤
      if (attempt === maxAttempts - 1) {
        GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = originalRadius;
        throw error;
      }
    }
  }

  // 恢復原始搜索半徑
  GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = originalRadius;

  throw new Error('使用多種搜索策略後仍未找到合適的餐廳，請稍後再試或清除歷史記錄。');
};

// 全局函數用於計算距離
window.calculateDistance = calculateDistance;
window.getBusinessStatus = getBusinessStatus;
window.getAvailableRestaurantsFromCache = getAvailableRestaurantsFromCache;
window.isRestaurantOpenInTimeSlot = isRestaurantOpenInTimeSlot; // 用於測試
window.clearRestaurantHistory = function() {
  try {
    localStorage.removeItem('restaurant_history');
    // 歷史記錄已清除（靜默）
  } catch (error) {
    console.warn('⚠️ 清除餐廳歷史記錄失敗:', error);
  }
};
