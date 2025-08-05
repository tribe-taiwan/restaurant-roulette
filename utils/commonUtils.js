// 共用工具函數 - 避免組件間代碼重複
// 移除import，使用全域函數

// 價位標籤資料 - 統一管理所有語言的價位標籤
window.getPriceLabels = function() {
  return {
    en: { 1: 'Budget', 2: 'Moderate', 3: 'Expensive', 4: 'Fine Dining' },
    zh: { 1: '經濟實惠', 2: '中等價位', 3: '高價位', 4: '精緻餐飲' },
    ja: { 1: 'リーズナブル', 2: '中価格帯', 3: '高価格帯', 4: '高級料理' },
    ko: { 1: '저렴한', 2: '중간 가격', 3: '비싼', 4: '고급 요리' },
    vi: { 1: 'Bình dân', 2: 'Trung bình', 3: 'Đắt tiền', 4: 'Sang trọng' },
    ms: { 1: 'Bajet', 2: 'Sederhana', 3: 'Mahal', 4: 'Mewah' },
    es: { 1: 'Económico', 2: 'Moderado', 3: 'Caro', 4: 'Alta Cocina' },
    fr: { 1: 'Économique', 2: 'Modéré', 3: 'Cher', 4: 'Haute Cuisine' }
  };
};

// 星級顯示函數 - 統一的星級渲染邏輯
window.renderStars = function(rating) {
  if (!rating || rating <= 0) return null;
  
  const fullStars = Math.round(rating);
  const emptyStars = 5 - fullStars;
  
  const stars = [];
  
  // 添加實心星星
  for (let i = 0; i < fullStars; i++) {
    stars.push({
      type: 'full',
      key: `full-${i}`,
      className: 'text-[#fbbc04]',
      symbol: '★'
    });
  }
  
  // 添加空心星星
  for (let i = 0; i < emptyStars; i++) {
    stars.push({
      type: 'empty',
      key: `empty-${i}`,
      className: 'text-gray-400',
      symbol: '☆'
    });
  }
  
  return stars;
};

// 導航URL生成函數 - 統一的導航URL生成邏輯
window.getDirectionsUrl = function(restaurant, userLocation, userAddress, language = 'zh') {
  console.log('🗺️ 生成導航URL，當前userLocation:', userLocation);
  console.log('🗺️ 當前userAddress:', userAddress);
  console.log('🗺️ 餐廳地址:', restaurant.address);
  
  // 優先使用userAddress作為起點地址
  if (userAddress && restaurant.address) {
    const origin = encodeURIComponent(userAddress);
    const destination = encodeURIComponent(restaurant.address);
    const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
    console.log('🎯 最終導航URL:', finalUrl);
    console.log('🎯 導航起點地址:', userAddress);
    console.log('🎯 導航終點地址:', restaurant.address);
    return finalUrl;
  }

  // 回退到座標（如果有userLocation但沒有userAddress）
  if (userLocation && restaurant.address) {
    const origin = encodeURIComponent(`${userLocation.lat},${userLocation.lng}`);
    const destination = encodeURIComponent(restaurant.address);
    const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
    console.log('🎯 使用座標的導航URL:', finalUrl);
    console.log('🎯 導航起點座標:', userLocation);
    console.log('🎯 導航終點地址:', restaurant.address);
    return finalUrl;
  }

  // 回退選項：直接導航到餐廳位置
  return restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`;
};

// 格式化營業時間 - 統一的營業時間格式化邏輯
window.formatBusinessHours = function(hours, language = 'zh') {
  if (!hours) {
    const translations = {
      en: 'Hours not available',
      zh: '營業時間不可用',
      ja: '営業時間が利用できません',
      ko: '영업시간 정보 없음',
      es: 'Horario no disponible',
      fr: 'Horaires non disponibles'
    };
    return translations[language] || translations.zh;
  }
  
  if (Array.isArray(hours)) {
    // 格式化營業時間為純文字陣列
    return hours.map(dayHours => {
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
  
  return hours;
};

// 翻譯函數 - 餐廳卡片用的翻譯
window.getRestaurantTranslations = function(language = 'zh') {
  const translations = {
    en: {
      hoursNotAvailable: 'Hours not available',
      viewLocation: 'View location',
      clickToViewPhotos: 'Click to view Google Maps photos',
      viewRoute: 'Route & Navigation',
      viewWebsite: 'Website',
      address: 'Address',
      phone: 'Phone',
      businessHours: 'Business Hours',
      openNow: 'Open Now',
      closed: 'Closed',
      hoursUnknown: 'Hours Unknown',
      temporarilyClosed: '⚠️ This restaurant may be temporarily closed, please call to confirm'
    },
    zh: {
      hoursNotAvailable: '營業時間不可用',
      viewLocation: '查看位置',
      clickToViewPhotos: '點擊查看Google地圖照片',
      viewRoute: '路線與導航',
      viewWebsite: '網站',
      address: '地址',
      phone: '電話',
      businessHours: '營業時間',
      openNow: '營業中',
      closed: '已打烊',
      hoursUnknown: '營業時間未知',
      temporarilyClosed: '⚠️ 此餐廳可能暫時關閉，請致電確認'
    },
    ja: {
      hoursNotAvailable: '営業時間が利用できません',
      viewLocation: '場所を見る',
      clickToViewPhotos: 'Google マップの写真を見る',
      viewRoute: 'ルートとナビゲーション',
      viewWebsite: 'ウェブサイトを見る',
      address: '住所',
      phone: '電話',
      businessHours: '営業時間',
      openNow: '営業中',
      closed: '閉店',
      hoursUnknown: '営業時間不明',
      temporarilyClosed: '⚠️ このレストランは一時的に閉店している可能性があります。お電話でご確認ください'
    },
    ko: {
      hoursNotAvailable: '영업시간 정보 없음',
      viewLocation: '위치 보기',
      clickToViewPhotos: 'Google 지도 사진 보기',
      viewRoute: '경로 및 내비게이션 보기',
      viewWebsite: '웹사이트 보기',
      address: '주소',
      phone: '전화',
      businessHours: '영업시간',
      openNow: '영업 중',
      closed: '영업종료',
      hoursUnknown: '영업시간 알 수 없음',
      temporarilyClosed: '⚠️ 이 식당은 일시적으로 문을 닫았을 수 있습니다. 전화로 확인하세요'
    },
    es: {
      hoursNotAvailable: 'Horario no disponible',
      viewLocation: 'Ver ubicación',
      clickToViewPhotos: 'Ver fotos de Google Maps',
      viewRoute: 'Ver Ruta y Navegación',
      viewWebsite: 'Ver Sitio Web',
      address: 'Dirección',
      phone: 'Teléfono',
      businessHours: 'Horario de Atención',
      openNow: 'Abierto Ahora',
      closed: 'Cerrado',
      hoursUnknown: 'Horario Desconocido',
      temporarilyClosed: '⚠️ Este restaurante puede estar temporalmente cerrado, llame para confirmar'
    },
    fr: {
      hoursNotAvailable: 'Horaires non disponibles',
      viewLocation: 'Voir l\'emplacement',
      clickToViewPhotos: 'Voir les photos Google Maps',
      viewRoute: 'Voir Itinéraire et Navigation',
      viewWebsite: 'Voir Site Web',
      address: 'Adresse',
      phone: 'Téléphone',
      businessHours: 'Heures d\'Ouverture',
      openNow: 'Ouvert Maintenant',
      closed: 'Fermé',
      hoursUnknown: 'Horaires Inconnus',
      temporarilyClosed: '⚠️ Ce restaurant peut être temporairement fermé, appelez pour confirmer'
    }
  };
  
  return translations[language] || translations.zh;
};

console.log('✅ commonUtils.js 已載入 - 共用工具函數可用');