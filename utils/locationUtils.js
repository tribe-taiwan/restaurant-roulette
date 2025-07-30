// Google Places JavaScript API 配置
const GOOGLE_PLACES_CONFIG = {
  API_KEY: 'AIzaSyC7tj6X8c5QwX0uVR7fUNcate1Sapn7lyQ',
  SEARCH_PARAMS: {
    radius: 5000, // 預設5公里範圍，可動態更新
    type: 'restaurant'
  }
};

// 全局函數用於更新搜索半徑
window.updateSearchRadius = function(newRadius) {
  GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius = newRadius;
  console.log('🔄 搜索半徑已更新為:', newRadius, '公尺');
};

// 全局函數用於將經緯度轉換為地址
window.getAddressFromCoordinates = async function(lat, lng) {
  try {
    if (!geocoder) {
      await initializeGoogleMaps();
    }
    
    const latlng = new google.maps.LatLng(lat, lng);
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
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
            
            // 市級行政區域（台南市、高雄市等）
            if (types.includes('administrative_area_level_2') || types.includes('locality')) {
              admin_area_level_2 = component.long_name;
            }
            // 區級行政區域（西港區、東區等）
            else if (types.includes('administrative_area_level_3')) {
              admin_area_level_3 = component.long_name;
            }
            // 街道路名
            else if (types.includes('route')) {
              route = component.long_name;
            }
            // 次級地區（可能包含更具體的區域）
            else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
              if (!admin_area_level_3) { // 只有在沒有區域時才使用
                district = component.long_name;
              }
            }
          });
          
          // 組合地址：優先顯示「市 + 區 + 路」格式
          let address = '';
          
          if (admin_area_level_2 && admin_area_level_3 && route) {
            address = `${admin_area_level_2}${admin_area_level_3}${route}`;
          } else if (admin_area_level_2 && admin_area_level_3) {
            address = `${admin_area_level_2}${admin_area_level_3}`;
          } else if (admin_area_level_2 && route) {
            address = `${admin_area_level_2}${route}`;
          } else if (admin_area_level_2 && district) {
            address = `${admin_area_level_2}${district}`;
          } else if (admin_area_level_2) {
            address = admin_area_level_2;
          } else {
            // 最後回退：使用 formatted_address 的前兩個部分
            const formatted = result.formatted_address;
            const parts = formatted.split(',');
            address = parts.slice(0, 2).join('').replace(/\d+號?/g, '').trim();
          }
          
          console.log('✅ 地址轉換成功:', { 
            admin_area_level_2, 
            admin_area_level_3, 
            route, 
            district, 
            final: address 
          });
          resolve(address);
        } else {
          console.warn('⚠️ 地址轉換失敗:', status);
          resolve('位置已確認');
        }
      });
    });
    
  } catch (error) {
    console.error('❌ 地址轉換出錯:', error);
    return '位置已確認';
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
    console.warn('⚠️ 解析營業時間時出錯:', error);
    return true; // 出錯時預設顯示
  }
}

/**
 * 使用 Google Places JavaScript API 搜索附近餐廳
 * @param {Object} userLocation - 用戶位置 {lat, lng}
 * @param {string} selectedMealTime - 選擇的用餐時段
 * @returns {Promise<Object>} 隨機餐廳資訊
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

    // 如果選擇了特定用餐時段，先篩選出符合營業時間的餐廳
    let filteredResults = results;
    if (selectedMealTime !== 'all') {
      console.log('🕐 開始篩選符合用餐時段的餐廳...');
      
      // 獲取詳細營業時間資訊並篩選
      const restaurantsWithHours = await Promise.all(
        results.map(async (restaurant) => {
          try {
            const details = await getPlaceDetails(restaurant.place_id);
            const isOpen = isRestaurantOpenForMealTime(details?.opening_hours, selectedMealTime);
            return { restaurant, isOpen, details };
          } catch (error) {
            console.warn('⚠️ 無法獲取餐廳營業時間:', restaurant.name, error);
            return { restaurant, isOpen: true, details: null }; // 無法確定時預設顯示
          }
        })
      );
      
      filteredResults = restaurantsWithHours
        .filter(item => item.isOpen)
        .map(item => ({ ...item.restaurant, detailsCache: item.details }));
      
      console.log(`🕐 篩選後剩餘 ${filteredResults.length} 家符合${selectedMealTime}時段的餐廳`);
      
      if (filteredResults.length === 0) {
        throw new Error(`在您選擇的用餐時段內未找到營業的餐廳。請選擇其他時段或擴大搜索範圍。`);
      }
    }

    // 隨機選擇一家餐廳
    const randomRestaurant = filteredResults[Math.floor(Math.random() * filteredResults.length)];
    
    // 轉換為應用程式格式
    return await formatRestaurantData(randomRestaurant);

  } catch (error) {
    console.error('❌ 搜索餐廳時發生錯誤:', error);
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
    
    // 處理營業時間
    let hours = '營業時間請洽餐廳';
    if (details && details.opening_hours && details.opening_hours.weekday_text) {
      hours = details.opening_hours.weekday_text.slice(0, 3).join(', '); // 只顯示前3天避免太長
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
      businessStatus: place.business_status || 'OPERATIONAL'
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
 * 獲取隨機餐廳 - 使用 JavaScript API
 * @param {Object} userLocation - 用戶位置
 * @param {string} selectedMealTime - 選擇的用餐時段
 * @returns {Promise<Object>} 隨機餐廳
 */
async function getRandomRestaurant(userLocation, selectedMealTime = 'all') {
  console.log('🎯 開始獲取隨機餐廳...', { selectedMealTime });
  
  const restaurant = await searchNearbyRestaurants(userLocation, selectedMealTime);
  
  console.log('🎉 成功獲取餐廳:', restaurant.name);
  return restaurant;
}
