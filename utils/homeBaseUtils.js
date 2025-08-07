// 民宿導航工具函數
// 提供回民宿的導航功能和位置管理

// 全局函數：獲取民宿位置資訊
window.getHomeBaseInfo = function() {
  const theme = window.ThemeManager?.getCurrentTheme();
  if (!theme || !theme.homeBase) {
    console.warn('⚠️ 無法獲取民宿位置資訊，主題未載入');
    return null;
  }
  return theme.homeBase;
};

// 全局函數：導航到民宿
window.navigateToHomeBase = function() {
  const homeBase = window.getHomeBaseInfo();
  if (!homeBase) {
    alert('無法獲取民宿位置資訊');
    return;
  }

  // 使用 Google Maps 導航 - 直接使用地址
  const destination = encodeURIComponent(`${homeBase.name}, ${homeBase.address}`);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  window.open(mapsUrl, '_blank');
  console.log('🏠 開啟導航到民宿:', homeBase.name, homeBase.address);
};

// 全局函數：使用民宿作為起點位置
window.useHomeBaseAsLocation = async function() {
  const homeBase = window.getHomeBaseInfo();
  if (!homeBase) {
    console.warn('⚠️ 無法使用民宿位置，主題未載入');
    return null;
  }

  // 使用地址進行地理編碼獲取座標
  try {
    if (window.geocodeAddress) {
      const result = await window.geocodeAddress(`${homeBase.name}, ${homeBase.address}`);
      return {
        lat: result.lat,
        lng: result.lng,
        address: `${homeBase.name}, ${homeBase.address}`,
        type: 'homebase'
      };
    } else {
      console.warn('⚠️ 地理編碼功能不可用');
      return null;
    }
  } catch (error) {
    console.error('❌ 民宿地址地理編碼失敗:', error);
    return null;
  }
};

// 全局函數：將民宿設為預設家位置
window.setHomeBaseAsHome = async function() {
  const homeBase = window.getHomeBaseInfo();
  if (!homeBase) {
    alert('無法獲取民宿位置資訊');
    return false;
  }

  try {
    // 先獲取民宿的座標
    const homeBaseLocation = await window.useHomeBaseAsLocation();
    if (!homeBaseLocation) {
      alert('無法獲取民宿座標');
      return false;
    }

    // 獲取現有的已儲存位置
    const saved = localStorage.getItem('savedLocations');
    let savedLocations = saved ? JSON.parse(saved) : [];

    // 移除現有的家位置
    savedLocations = savedLocations.filter(loc => loc.type !== 'home');

    // 加入民宿作為家位置
    const homeLocation = {
      type: 'home',
      lat: homeBaseLocation.lat,
      lng: homeBaseLocation.lng,
      address: `${homeBase.name}, ${homeBase.address}`,
      savedAt: new Date().toISOString(),
      isHomeBase: true // 標記這是民宿位置
    };

    savedLocations.push(homeLocation);
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));

    console.log('🏠 已將民宿設為預設家位置:', homeLocation);
    return true;
  } catch (error) {
    console.error('❌ 設定民宿為家位置失敗:', error);
    return false;
  }
};

// 全局函數：檢查是否已將民宿設為家位置
window.isHomeBaseSetAsHome = function() {
  try {
    const saved = localStorage.getItem('savedLocations');
    if (!saved) return false;
    
    const savedLocations = JSON.parse(saved);
    const homeLocation = savedLocations.find(loc => loc.type === 'home');
    
    return homeLocation && homeLocation.isHomeBase === true;
  } catch (error) {
    console.error('❌ 檢查家位置設定失敗:', error);
    return false;
  }
};

// 全局函數：獲取到民宿的距離
window.getDistanceToHomeBase = function(userLocation) {
  const homeBase = window.getHomeBaseInfo();
  if (!homeBase || !userLocation) {
    return null;
  }

  // 使用現有的距離計算函數
  if (window.calculateDistance) {
    return window.calculateDistance(
      userLocation.lat, userLocation.lng,
      homeBase.lat, homeBase.lng
    );
  }
  
  return null;
};

// 全局函數：生成民宿預訂連結
window.getHomeBaseBookingUrl = function() {
  const homeBase = window.getHomeBaseInfo();
  return homeBase ? homeBase.bookingUrl : null;
};

// 全局函數：獲取民宿聯絡資訊
window.getHomeBaseContact = function() {
  const homeBase = window.getHomeBaseInfo();
  if (!homeBase) return null;
  
  return {
    name: homeBase.name,
    address: homeBase.address,
    phone: homeBase.phone,
    bookingUrl: homeBase.bookingUrl
  };
};
