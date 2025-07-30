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
    throw new Error("用戶位置不可用。請確保已啟用位置存取權限。");
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

    // 發送 API 請求
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('📨 API 響應:', data);

    if (data.status !== 'OK') {
      throw new Error(`API 錯誤: ${data.status} - ${data.error_message || '未知錯誤'}`);
    }

    const restaurants = data.results;
    
    if (!restaurants || restaurants.length === 0) {
      throw new Error(`在您附近 ${GOOGLE_PLACES_CONFIG.SEARCH_PARAMS.radius/1000}km 範圍內未找到餐廳。請嘗試擴大搜索範圍。`);
    }

    console.log(`✅ 找到 ${restaurants.length} 家餐廳`);

    // 隨機選擇一家餐廳
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    
    // 轉換為應用程式格式
    return await formatRestaurantData(randomRestaurant);

  } catch (error) {
    console.error('❌ 搜索餐廳時發生錯誤:', error);
    
    // 提供詳細的技術資訊用於偵錯
    const technicalInfo = {
      errorType: error.name,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
      userLocation: userLocation,
      apiKey: GOOGLE_PLACES_CONFIG.API_KEY ? `${GOOGLE_PLACES_CONFIG.API_KEY.substring(0, 8)}...` : '未設定'
    };
    
    console.error('🔧 技術偵錯資訊:', technicalInfo);
    
    throw new Error(`無法獲取附近餐廳資料。錯誤: ${error.message}。技術資訊: ${JSON.stringify(technicalInfo)}`);
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
    const data = await response.json();

    if (data.status === 'OK') {
      return data.result;
    } else {
      console.warn('⚠️ 無法獲取地點詳細資訊:', data.status);
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
}

/**
 * 獲取隨機餐廳 - 更新版本使用真實 API
 * @param {Object} userLocation - 用戶位置
 * @returns {Promise<Object>} 隨機餐廳
 */
async function getRandomRestaurant(userLocation) {
  console.log('🎯 開始獲取隨機餐廳...');
  
  try {
    // 使用 Google Places API 搜索真實餐廳
    const restaurant = await searchNearbyRestaurants(userLocation);
    
    console.log('🎉 成功獲取餐廳:', restaurant.name);
    return restaurant;
    
  } catch (error) {
    console.error('❌ 獲取隨機餐廳失敗，回退到模擬數據:', error.message);
    
    // 如果 API 失敗，回退到模擬數據
    return getRandomRestaurantFromMockData(userLocation);
  }
}

/**
 * 回退方案：從模擬數據獲取隨機餐廳
 * @param {Object} userLocation - 用戶位置
 * @returns {Object} 隨機餐廳
 */
function getRandomRestaurantFromMockData(userLocation) {
  console.log('⚠️ 使用模擬數據作為回退方案');
  
  if (!userLocation) {
    throw new Error("用戶位置不可用。請確保已啟用位置存取權限。");
  }

  // 過濾 10 公里範圍內的餐廳
  const nearbyRestaurants = mockRestaurants.filter(restaurant => {
    const distance = getDistanceFromLatLng(
      userLocation.lat, 
      userLocation.lng, 
      restaurant.lat, 
      restaurant.lng
    );
    return distance <= 10;
  });

  if (nearbyRestaurants.length === 0) {
    throw new Error("在您附近 10km 範圍內未找到餐廳。請嘗試擴大搜索範圍或回報此問題給開發團隊。");
  }

  return nearbyRestaurants[Math.floor(Math.random() * nearbyRestaurants.length)];
}

// 保留原有的距離計算函數
function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
  try {
    const R = 6371; // 地球半徑（公里）
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // 距離（公里）
    return d;
  } catch (error) {
    console.error('距離計算錯誤:', error);
    return 0;
  }
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
