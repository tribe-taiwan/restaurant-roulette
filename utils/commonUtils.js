// 共用工具函數 - 避免組件間代碼重複
// 移除import，使用全域函數

// 優化餐廳搜尋查詢字串生成函數 - 四層 fallback 策略
window.getOptimizedRestaurantQuery = function(restaurant) {
  if (restaurant.name) {
    // 第一優先：城市+餐廳名稱（最可靠，避免 place_id 錯誤）
    let searchQuery = restaurant.name;
    if (restaurant.address) {
      // 從地址提取城市資訊（通常在地址後段）
      const cityMatch = restaurant.address.match(/[市區縣]\s*$|[市區縣][^\s]*$/);
      if (cityMatch) {
        searchQuery = `${restaurant.name} ${cityMatch[0]}`;
      }
    }
    return { type: 'name_city', query: searchQuery };
  } else if (restaurant.address) {
    // 第二優先：地址（輔助定位）
    return { type: 'address', query: restaurant.address };
  } else if (restaurant.lat && restaurant.lng) {
    // 第三優先：座標（可能定位不準，指向無關店家）
    return { type: 'coordinates', query: `${restaurant.lat},${restaurant.lng}` };
  } else if (restaurant.id) {
    // 最後備案：place_id（經常出錯，顯示空白地圖）
    return { type: 'place_id', query: `place_id:${restaurant.id}` };
  }
  return { type: 'fallback', query: restaurant.name || 'unknown' };
};

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

// 導航URL生成函數 - 統一的導航URL生成邏輯，使用共用的四層 fallback 策略
window.getDirectionsUrl = function(restaurant, userLocation, userAddress, language = 'zh') {
  // 使用共用的優化查詢函數
  const optimized = window.getOptimizedRestaurantQuery(restaurant);
  const destination = optimized.query;

  // 優先使用userAddress作為起點地址
  if (userAddress) {
    const origin = encodeURIComponent(userAddress);
    const encodedDestination = encodeURIComponent(destination);
    const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
    return finalUrl;
  }

  // 回退到座標（如果有userLocation但沒有userAddress）
  if (userLocation) {
    const origin = encodeURIComponent(`${userLocation.lat},${userLocation.lng}`);
    const encodedDestination = encodeURIComponent(destination);
    const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
    return finalUrl;
  }

  // 回退選項：直接導航到餐廳位置
  return restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
};

// 格式化營業時間 - 統一的營業時間格式化邏輯（已移至檔案末尾避免重複）

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
      viewRoute: '경로 및 내비게이션',
      viewWebsite: '웹사이트',
      address: '주소',
      phone: '전화',
      businessHours: '영업시간',
      openNow: '영업 중',
      closed: '영업종료',
      hoursUnknown: '영업시간 알 수 없음',
      temporarilyClosed: '⚠️ 이 식당은 일시적으로 문을 닫았을 수 있습니다. 전화로 확인하세요'
    },
    vi: {
      hoursNotAvailable: 'Giờ hoạt động không có sẵn',
      viewLocation: 'Xem vị trí',
      clickToViewPhotos: 'Xem ảnh Google Maps',
      viewRoute: 'Lộ trình & Điều hướng',
      viewWebsite: 'Website',
      address: 'Địa chỉ',
      phone: 'Điện thoại',
      businessHours: 'Giờ hoạt động',
      openNow: 'Đang mở cửa',
      closed: 'Đã đóng cửa',
      hoursUnknown: 'Giờ hoạt động không rõ',
      temporarilyClosed: '⚠️ Nhà hàng này có thể tạm thời đóng cửa, vui lòng gọi để xác nhận'
    },
    ms: {
      hoursNotAvailable: 'Waktu operasi tidak tersedia',
      viewLocation: 'Lihat lokasi',
      clickToViewPhotos: 'Lihat foto Google Maps',
      viewRoute: 'Laluan & Navigasi',
      viewWebsite: 'Website',
      address: 'Alamat',
      phone: 'Telefon',
      businessHours: 'Waktu Operasi',
      openNow: 'Sedang buka',
      closed: 'Tutup',
      hoursUnknown: 'Waktu operasi tidak diketahui',
      temporarilyClosed: '⚠️ Restoran ini mungkin ditutup sementara, sila telefon untuk mengesahkan'
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

// 多語言營業時間格式化函數
window.formatBusinessHours = function(hours, language = 'zh') {
  if (!hours) {
    // 如果沒有營業時間資料，返回多語言的「營業時間不可用」訊息
    const translations = {
      en: 'Hours not available',
      zh: '營業時間不可用',
      ja: '営業時間が利用できません',
      ko: '영업시간 정보 없음',
      vi: 'Giờ hoạt động không có sẵn',
      ms: 'Waktu operasi tidak tersedia'
    };
    return translations[language] || translations.zh;
  }

  // 如果不是陣列，直接回傳
  if (!Array.isArray(hours)) {
    return hours;
  }

  // 取得當前語言的翻譯
  const getTranslation = window.getTranslation || function(lang, key) {
    // fallback 函式
    const fallbackTranslations = {
      monday: { zh: '週一', en: 'Mon', ja: '月曜', ko: '월요일', vi: 'Thứ hai', ms: 'Isnin' },
      tuesday: { zh: '週二', en: 'Tue', ja: '火曜', ko: '화요일', vi: 'Thứ ba', ms: 'Selasa' },
      wednesday: { zh: '週三', en: 'Wed', ja: '水曜', ko: '수요일', vi: 'Thứ tư', ms: 'Rabu' },
      thursday: { zh: '週四', en: 'Thu', ja: '木曜', ko: '목요일', vi: 'Thứ năm', ms: 'Khamis' },
      friday: { zh: '週五', en: 'Fri', ja: '金曜', ko: '금요일', vi: 'Thứ sáu', ms: 'Jumaat' },
      saturday: { zh: '週六', en: 'Sat', ja: '土曜', ko: '토요일', vi: 'Thứ bảy', ms: 'Sabtu' },
      sunday: { zh: '週日', en: 'Sun', ja: '日曜', ko: '일요일', vi: 'Chủ nhật', ms: 'Ahad' },
      // 添加「休息」的翻譯
      closed: { zh: '休息', en: 'Closed', ja: '定休日', ko: '휴무', vi: 'Nghỉ', ms: 'Tutup' }
    };
    return fallbackTranslations[key] ? fallbackTranslations[key][lang] || fallbackTranslations[key]['en'] : key;
  };

  // 格式化每一天的營業時間
  return hours.map(day => {
    if (!day) return day;

    let formattedDay = day;

    // 處理各種可能的星期格式並統一轉換
    // 1. 先處理中文格式（Google Places API 在中文環境下返回中文）
    formattedDay = formattedDay
      .replace(/星期一/g, 'Mon')
      .replace(/星期二/g, 'Tue')
      .replace(/星期三/g, 'Wed')
      .replace(/星期四/g, 'Thu')
      .replace(/星期五/g, 'Fri')
      .replace(/星期六/g, 'Sat')
      .replace(/星期日/g, 'Sun');

    // 2. 處理英文全名格式
    formattedDay = formattedDay
      .replace(/Monday/g, 'Mon')
      .replace(/Tuesday/g, 'Tue')
      .replace(/Wednesday/g, 'Wed')
      .replace(/Thursday/g, 'Thu')
      .replace(/Friday/g, 'Fri')
      .replace(/Saturday/g, 'Sat')
      .replace(/Sunday/g, 'Sun');

    // 3. 處理「休息」狀態的翻譯
    formattedDay = formattedDay.replace(/休息/g, 'Closed');

    // 4. 根據目標語言進行最終翻譯
    if (language !== 'en') {
      formattedDay = formattedDay
        .replace(/Mon/g, getTranslation(language, 'monday'))
        .replace(/Tue/g, getTranslation(language, 'tuesday'))
        .replace(/Wed/g, getTranslation(language, 'wednesday'))
        .replace(/Thu/g, getTranslation(language, 'thursday'))
        .replace(/Fri/g, getTranslation(language, 'friday'))
        .replace(/Sat/g, getTranslation(language, 'saturday'))
        .replace(/Sun/g, getTranslation(language, 'sunday'))
        .replace(/Closed/g, getTranslation(language, 'closed'));
    }

    return formattedDay;
  });
};

console.log('✅ commonUtils.js 已載入 - 共用工具函數可用');
