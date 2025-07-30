// Google Places API 配置 - 內嵌於 locationUtils.js
const GOOGLE_PLACES_CONFIG = {
  API_KEY: 'AIzaSyC7tj6X8c5QwX0uVR7fUNcate1Sapn7lyQ',
  BASE_URL: 'https://maps.googleapis.com/maps/api/place',
  SEARCH_PARAMS: {
    radius: 5000, // 5公里範圍
    type: 'restaurant',
    language: 'zh-TW'
  },
  FIELDS: [
    'place_id', 'name', 'formatted_address', 'geometry', 'rating',
    'user_ratings_total', 'price_level', 'opening_hours', 
    'formatted_phone_number', 'website', 'photos', 'types'
  ].join(',')
};

/**
 * 使用 Google Places API 搜索附近餐廳
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
    
    // 構建 Google Places API 請求 URL
    const searchUrl = new URL(`${GOOGLE_PLACES_CONFIG.BASE_URL}/nearbysearch/json`);
    searchUrl.searchParams.append('key', GOOGLE_PLACES_CONFIG.API_KEY);
    searchUrl.searchParams.append('location', `${userLocation.lat},${userLocation.lng}`);
    searchUrl.searchParams.append('radius', GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius);
    searchUrl.searchParams.append('type', GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.type);
    searchUrl.searchParams.append('language', GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.language);

    console.log('📡 API 請求 URL:', searchUrl.toString());

    // 發送 API 請求 - 檢查 CORS 問題
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 API 響應狀態:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 錯誤詳情:', errorText);
      
      const errorDetails = {
        errorType: 'APIError',
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
        responseBody: errorText,
        timestamp: new Date().toISOString(),
        requestURL: searchUrl.toString().replace(GOOGLE_PLACES_CONFIG.API_KEY, 'AIzaSyC7xxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
        userLocation: userLocation,
        corsIssue: response.status === 0 ? 'Possible CORS issue' : 'No CORS issue detected'
      };
      
      throw new Error(`Google Places API 請求失敗。技術資訊: ${JSON.stringify(errorDetails)}`);
    }

    const data = await response.json();
    
    console.log('📨 API 響應:', data);

    if (data.status !== 'OK') {
      const errorDetails = {
        errorType: 'GoogleAPIError',
        errorMessage: data.error_message || '未知錯誤',
        apiStatus: data.status,
        timestamp: new Date().toISOString(),
        userLocation: userLocation,
        apiKey: `${GOOGLE_PLACES_CONFIG.API_KEY.substring(0, 8)}xxxxxxxxxxxxxxxxxxxxxxxx`,
        requestURL: searchUrl.toString().replace(GOOGLE_PLACES_CONFIG.API_KEY, 'AIzaSyC7xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
      };
      
      throw new Error(`Google Places API 回傳錯誤: ${data.status}。技術資訊: ${JSON.stringify(errorDetails)}`);
    }

    const restaurants = data.results;
    
    if (!restaurants || restaurants.length === 0) {
      const errorDetails = {
        errorType: 'NoRestaurantsFound',
        errorMessage: '搜索範圍內無餐廳',
        searchRadius: GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius,
        userLocation: userLocation,
        timestamp: new Date().toISOString(),
        apiResponseStatus: data.status,
        totalResults: 0
      };
      
      throw new Error(`在您附近 ${GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius/1000}km 範圍內未找到餐廳。技術資訊: ${JSON.stringify(errorDetails)}`);
    }

    console.log(`✅ 找到 ${restaurants.length} 家餐廳`);

    // 隨機選擇一家餐廳
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    
    // 轉換為應用程式格式
    return await formatRestaurantData(randomRestaurant);

  } catch (error) {
    console.error('❌ 搜索餐廳時發生錯誤:', error);
    
    // 不使用回退機制，直接拋出詳細錯誤
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
    const detailsUrl = new URL(`${GOOGLE_PLACES_CONFIG.BASE_URL}/details/json`);
    detailsUrl.searchParams.append('key', GOOGLE_PLACES_CONFIG.API_KEY);
    detailsUrl.searchParams.append('place_id', placeId);
    detailsUrl.searchParams.append('fields', GOOGLE_PLACES_CONFIG.FIELDS);
    detailsUrl.searchParams.append('language', GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.language);

    const response = await fetch(detailsUrl);
    
    if (!response.ok) {
      console.warn('⚠️ 無法獲取地點詳細資訊 HTTP錯誤:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();

    if (data.status === 'OK') {
      return data.result;
    } else {
      console.warn('⚠️ 無法獲取地點詳細資訊 API錯誤:', data.status, data.error_message);
      return null;
    }
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
      const photoReference = place.photos[0].photo_reference;
      imageUrl = `${GOOGLE_PLACES_CONFIG.BASE_URL}/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_CONFIG.API_KEY}`;
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
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
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
      // 保持與原始格式相容的菜單亮點（使用預設值）
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
 * 獲取隨機餐廳 - 僅使用真實 API，不回退
 * @param {Object} userLocation - 用戶位置
 * @returns {Promise<Object>} 隨機餐廳
 */
async function getRandomRestaurant(userLocation) {
  console.log('🎯 開始獲取隨機餐廳...');
  
  // 直接使用 Google Places API，不回退
  const restaurant = await searchNearbyRestaurants(userLocation);
  
  console.log('🎉 成功獲取餐廳:', restaurant.name);
  return restaurant;
}
