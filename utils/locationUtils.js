// 移除import，使用全域函數

// 簡單的日誌管理系統
const logger = {
  info: (message, ...args) => console.log('ℹ️', message, ...args),
  success: (message, ...args) => console.log('✅', message, ...args),
  warning: (message, ...args) => console.warn('⚠️', message, ...args),
  error: (message, ...args) => console.error('❌', message, ...args),
  debug: (message, ...args) => console.log('🔍', message, ...args)
};

// Google Places JavaScript API 配置
const GOOGLE_PLACES_CONFIG = {
  API_KEY: '%%GOOGLE_PLACES_API_KEY%%', // 將在部署時被 GitHub Actions 替換
  SEARCH_PARAMS: {
    radius: 5000, // 預設5公里範圍，可動態更新
    type: 'restaurant'
  }
};

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
    
    // 設定全局回調函數
    window.onGoogleMapsLoaded = () => {
      console.log('✅ Google Maps API 載入完成');
      
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
      
      resolve();
    };
    
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
    
    document.head.appendChild(script);
  });
}

/**
 * 檢查餐廳是否在指定時間營業
 * @param {Object} openingHours - Google Places opening_hours 對象
 * @param {string} selectedMealTime - 選擇的用餐時段 ('breakfast', 'lunch', 'dinner', 'all')
 * @returns {boolean} 是否營業
 */
function isRestaurantOpenForMealTime(openingHours, selectedMealTime) {
  if (!openingHours || selectedMealTime === 'all') {
    return true; // 如果沒有營業時間資訊或選擇全部時段，則顯示所有餐廳
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  // 定義用餐時段
  const mealTimes = {
    breakfast: { start: 6, end: 11 },
    lunch: { start: 11, end: 14 },
    dinner: { start: 17, end: 22 }
  };
  
  const selectedTime = mealTimes[selectedMealTime];
  if (!selectedTime) return true;
  
  try {
    // 如果有 periods 資訊
    if (openingHours.periods) {
      const today = openingHours.periods.find(period => period.open && period.open.day === dayOfWeek);
      if (!today) return false; // 今天不營業
      
      const openTime = parseInt(today.open.time.substring(0, 2));
      const closeTime = today.close ? parseInt(today.close.time.substring(0, 2)) : 24;
      
      // 檢查選擇的用餐時段是否與營業時間重疊
      return (selectedTime.start >= openTime && selectedTime.start < closeTime) ||
             (selectedTime.end > openTime && selectedTime.end <= closeTime) ||
             (selectedTime.start < openTime && selectedTime.end > closeTime);
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
 * 使用 Google Places JavaScript API 搜索附近餐廳
 * @param {Object} userLocation - 用戶位置 {lat, lng}
 * @param {string} selectedMealTime - 選擇的用餐時段（保留參數以保持兼容性）
 * @returns {Promise<Array>} 餐廳列表
 */
async function searchNearbyRestaurants(userLocation, selectedMealTime = 'all') {
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
    console.log('🔍 開始搜索附近餐廳...', userLocation, '用餐時段:', selectedMealTime);
    
    // 確保 Google Maps API 已載入
    if (!placesService) {
      console.log('📡 初始化 Google Maps API...');
      await initializeGoogleMaps();
    }
    
    // 建立搜索請求
    const request = {
      location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius,
      type: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.type
    };
    
    console.log(`📡 發送 PlacesService.nearbySearch 請求... (半徑: ${GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius/1000}km)`, request);
    
    // 使用 Promise 包裝 PlacesService 回調
    const results = await new Promise((resolve, reject) => {
      placesService.nearbySearch(request, (results, status) => {
        console.log('📨 PlacesService 響應:', { status, resultsCount: results ? results.length : 0 });
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          const errorDetails = {
            errorType: 'PlacesServiceError',
            errorMessage: `PlacesService 錯誤: ${status}`,
            placesStatus: status,
            timestamp: new Date().toISOString(),
            userLocation: userLocation,
            requestParams: {
              location: `${userLocation.lat},${userLocation.lng}`,
              radius: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius,
              type: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.type
            }
          };
          
          reject(new Error(`Google Places 搜索失敗。技術資訊: ${JSON.stringify(errorDetails)}`));
        }
      });
    });
    
    if (!results || results.length === 0) {
      const errorDetails = {
        errorType: 'NoRestaurantsFound',
        errorMessage: '搜索範圍內無餐廳',
        searchRadius: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius,
        userLocation: userLocation,
        timestamp: new Date().toISOString(),
        totalResults: 0
      };
      
      throw new Error(`在您附近 ${GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius/1000}km 範圍內未找到餐廳。請嘗試擴大搜索範圍。技術資訊: ${JSON.stringify(errorDetails)}`);
    }

    console.log(`✅ 找到 ${results.length} 家餐廳`);

    // 獲取所有餐廳的詳細營業時間資訊
    console.log('🕐 獲取餐廳詳細資訊...');
    const restaurantsWithDetails = await Promise.all(
      results.map(async (restaurant) => {
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

    console.log(`🎯 返回 ${formattedRestaurants.length} 家格式化餐廳`);
    return formattedRestaurants;

  } catch (error) {
    logger.error('搜索餐廳時發生錯誤:', error);
    throw error;
  }
}

/**
 * 獲取地點詳細資訊
 * @param {string} placeId - Google Places ID
 * @returns {Promise<Object>} 詳細資訊
 */
async function getPlaceDetails(placeId) {
  try {
    if (!placesService) {
      await initializeGoogleMaps();
    }
    
    const request = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'website', 'price_level', 'url']
    };
    
    return new Promise((resolve) => {
      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          console.warn('⚠️ 無法獲取地點詳細資訊:', status);
          resolve(null);
        }
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
    console.log('🔄 正在格式化餐廳資料:', place.name);

    // 獲取詳細資訊（如果有快取則使用快取）
    const details = place.detailsCache || await getPlaceDetails(place.place_id);
    
    // 處理照片
    let imageUrl = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500';
    if (place.photos && place.photos.length > 0) {
      imageUrl = place.photos[0].getUrl({ maxWidth: 800 });
    }

    // 處理價格等級
    const priceLevel = place.price_level || (details && details.price_level) || 2;
    
    // 處理營業時間 - 使用純文字格式，避免XSS風險
    let hours = '營業時間請洽餐廳';
    if (details && details.opening_hours && details.opening_hours.weekday_text) {
      // 格式化營業時間為純文字陣列，由組件負責渲染樣式
      hours = details.opening_hours.weekday_text
        .map(dayHours => {
          // 將星期幾改為縮寫，保持純文字格式
          return dayHours
            .replace(/Monday/g, 'Mon')
            .replace(/Tuesday/g, 'Tue')
            .replace(/Wednesday/g, 'Wed')
            .replace(/Thursday/g, 'Thu')
            .replace(/Friday/g, 'Fri')
            .replace(/Saturday/g, 'Sat')
            .replace(/Sunday/g, 'Sun');
        });
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
      operatingStatus: businessStatusInfo
    };

    console.log('✅ 餐廳資料格式化完成:', formattedData.name);
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
  
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const currentTime = now.getHours() * 100 + now.getMinutes(); // 格式: HHMM
  
  try {
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
    
    // 如果有 open_now 資訊
    if (openingHours.hasOwnProperty('open_now')) {
      return {
        status: openingHours.open_now ? 'open' : 'closed',
        message: openingHours.open_now ? (window.getTranslation ? window.getTranslation(language, 'openNow') : 'Open now') : (window.getTranslation ? window.getTranslation(language, 'closed') : 'Closed')
      };
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
function getRestaurantHistory() {
  try {
    const history = localStorage.getItem('restaurant_history');
    if (!history) return null;

    const data = JSON.parse(history);
    const now = Date.now();

    // 檢查是否超過24小時
    if (now - data.timestamp > 24 * 60 * 60 * 1000) {
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
    console.log('📝 更新餐廳歷史記錄:', { restaurantId, expandedRadius, totalShown: history.shown_restaurants.length });
  } catch (error) {
    console.warn('⚠️ 更新餐廳歷史記錄失敗:', error);
  }
}

/**
 * 檢查餐廳是否在指定時段營業
 * @param {Object} restaurant - 餐廳資訊
 * @param {string} timeSlot - 時段 ('breakfast', 'lunch', 'dinner', 'all')
 * @returns {boolean} 是否營業
 */
function isRestaurantOpenInTimeSlot(restaurant, timeSlot) {
  if (timeSlot === 'all' || !restaurant.detailsCache?.opening_hours) {
    return true; // 無法確定時預設可用
  }

  const timeSlots = {
    breakfast: { start: 6, end: 11 },
    lunch: { start: 11, end: 14 },
    dinner: { start: 17, end: 22 }
  };

  const slot = timeSlots[timeSlot];
  if (!slot) return true;

  return isRestaurantOpenForMealTime(restaurant.detailsCache.opening_hours, timeSlot);
}

/**
 * 獲取隨機餐廳 - 使用 JavaScript API
 * @param {Object} userLocation - 用戶位置
 * @param {string} selectedMealTime - 選擇的用餐時段
 * @returns {Promise<Object>} 隨機餐廳
 */
window.getRandomRestaurant = async function(userLocation, selectedMealTime = 'all') {
  console.log('🎯 開始獲取隨機餐廳...', { selectedMealTime });

  const history = getRestaurantHistory() || { shown_restaurants: [], expanded_radius: 0 };
  const originalRadius = GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius;

  // 最多嘗試3次，每次擴大1km
  for (let attempt = 0; attempt < 3; attempt++) {
    const currentExpandedRadius = history.expanded_radius + attempt;
    const searchRadius = originalRadius + (currentExpandedRadius * 1000); // 每次增加1000米

    console.log(`🔍 第${attempt + 1}次搜索，半徑: ${searchRadius/1000}km`);

    // 臨時更新搜索半徑
    GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = searchRadius;

    try {
      // 獲取餐廳列表
      const restaurants = await searchNearbyRestaurants(userLocation, selectedMealTime);

      // 篩選：營業中 + 未出現過
      const availableRestaurants = restaurants.filter(restaurant => {
        const isOpen = isRestaurantOpenInTimeSlot(restaurant, selectedMealTime);
        const notShown = !history.shown_restaurants.includes(restaurant.id);
        return isOpen && notShown;
      });

      console.log(`📊 篩選結果: ${availableRestaurants.length}家可用餐廳 (總共${restaurants.length}家)`);

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
        updateRestaurantHistory(selectedRestaurant.id, currentExpandedRadius);

        // 恢復原始搜索半徑
        GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = originalRadius;

        console.log('🎉 成功獲取餐廳:', selectedRestaurant.name);
        return selectedRestaurant;
      }

      console.log(`⚠️ 在${searchRadius/1000}km範圍內沒有找到合適的餐廳，嘗試擴大搜索範圍...`);

    } catch (error) {
      console.error(`❌ 第${attempt + 1}次搜索失敗:`, error);

      // 如果是最後一次嘗試，拋出錯誤
      if (attempt === 2) {
        GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = originalRadius;
        throw error;
      }
    }
  }

  // 恢復原始搜索半徑
  GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = originalRadius;

  throw new Error('在擴大搜索範圍後仍未找到合適的餐廳，請稍後再試或調整搜索條件。');
};

// 全局函數用於計算距離
window.calculateDistance = calculateDistance;
window.getBusinessStatus = getBusinessStatus;
window.clearRestaurantHistory = function() {
  try {
    localStorage.removeItem('restaurant_history');
    console.log('🗑️ 已清除餐廳歷史記錄（條件變化）');
  } catch (error) {
    console.warn('⚠️ 清除餐廳歷史記錄失敗:', error);
  }
};
