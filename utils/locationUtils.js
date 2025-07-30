// Google Places JavaScript API 配置
const GOOGLE_PLACES_CONFIG = {
  API_KEY: 'AIzaSyC7tj6X8c5QwX0uVR7fUNcate1Sapn7lyQ',
  SEARCH_PARAMS: {
    radius: 5000, // 5公里範圍
    type: 'restaurant'
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
 * 使用 Google Places JavaScript API 搜索附近餐廳
 * @param {Object} userLocation - 用戶位置 {lat, lng}
 * @returns {Promise<Object>} 隨機餐廳資訊
 */
async function searchNearbyRestaurants(userLocation) {
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
    console.log('🔍 開始搜索附近餐廳...', userLocation);
    
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
    
    console.log('📡 發送 PlacesService.nearbySearch 請求...', request);
    
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
      
      throw new Error(`在您附近 ${GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius/1000}km 範圍內未找到餐廳。技術資訊: ${JSON.stringify(errorDetails)}`);
    }

    console.log(`✅ 找到 ${results.length} 家餐廳`);

    // 隨機選擇一家餐廳
    const randomRestaurant = results[Math.floor(Math.random() * results.length)];
    
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
      fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'website', 'price_level']
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

    // 獲取詳細資訊
    const details = await getPlaceDetails(place.place_id);
    
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
      hours = details.opening_hours.weekday_text.join(', ');
    }

    // 處理餐廳類型
    const cuisine = place.types ? 
      place.types.filter(type => !['establishment', 'point_of_interest'].includes(type)) :
      ['餐廳'];

    // 格式化資料
    const formattedData = {
      id: place.place_id,
      name: place.name,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      priceLevel: priceLevel,
      cuisine: cuisine,
      address: place.formatted_address || place.vicinity,
      phone: (details && details.formatted_phone_number) || '電話請洽餐廳',
      hours: hours,
      image: imageUrl,
      website: (details && details.website) || null,
      businessStatus: place.business_status || 'OPERATIONAL',
      menuHighlights: [
        { name: "招牌料理", price: "請洽餐廳" },
        { name: "主廚推薦", price: "請洽餐廳" },
        { name: "熱門餐點", price: "請洽餐廳" }
      ]
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
 * @returns {Promise<Object>} 隨機餐廳
 */
async function getRandomRestaurant(userLocation) {
  console.log('🎯 開始獲取隨機餐廳...');
  
  const restaurant = await searchNearbyRestaurants(userLocation);
  
  console.log('🎉 成功獲取餐廳:', restaurant.name);
  return restaurant;
}
