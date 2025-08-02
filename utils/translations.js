/**
 * 統一翻譯管理系統
 * Restaurant Roulette - 多語言支援
 */

export const TRANSLATIONS = {
  en: {
    // 主應用介面
    title: "Restaurant Roulette",
    spinButton: "What shall we eat?",
    spinning: "Finding your restaurant...",
    locationError: "Please allow location access to find nearby restaurants.",
    locationLoading: "Getting your location...",
    relocateButton: "Relocate",
    spinErrorPrefix: "Error: ",
    apiSearching: "Searching nearby restaurants...",
    radiusLabel: "Search radius:",
    radiusKm: "km",
    locationSuccess: "Location found",
    locationDetected: "Located at",
    addressLoading: "Getting address...",
    addressError: "Address unavailable",
    breakfast: "Breakfast",
    lunch: "Lunch", 
    dinner: "Dinner",
    enterAddress: "Enter address to correct location",
    locateHere: "📍 Locate here",
    home: "Home",
    office: "Office",
    saveText: "Save",
    
    // 餐廳卡片相關
    viewRoute: "View Route & Navigation",
    viewWebsite: "View Website",
    address: "Address",
    phone: "Phone",
    businessHours: "Business Hours",
    openingIn: "Opening in",
    hours: "hours",
    hoursNotAvailable: 'Hours not available',
    viewLocation: 'View location',
    clickToViewPhotos: 'Click to view Google Maps photos',
    visitWebsite: 'Visit Website',
    openNow: 'Open Now',
    closed: 'Closed',
    hoursUnknown: 'Hours Unknown',
    temporarilyClosed: '⚠️ This restaurant may be temporarily closed, please call to confirm',
    
    // 營業狀態
    closedToday: 'Closed today',
    closingSoon: 'Closing soon',
    openingSoon: 'Opening soon',
    hoursAfterOpening: 'Opening in',
    hoursAfterClosing: 'Closing in'
  },
  zh: {
    // 主應用介面
    title: "吃這家",
    spinButton: "想吃什麼？",
    spinning: "正在尋找您的餐廳...",
    locationError: "請允許位置訪問以獲取附近餐廳。",
    locationLoading: "正在獲取您的位置...",
    relocateButton: "重新定位",
    spinErrorPrefix: "錯誤：",
    apiSearching: "正在搜索附近餐廳...",
    radiusLabel: "搜索範圍：",
    radiusKm: "公里",
    locationSuccess: "定位成功",
    locationDetected: "當前位置",
    addressLoading: "正在獲取地址...",
    addressError: "地址無法取得",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    enterAddress: "輸入地址來校正位置",
    locateHere: "📍 定位到這裡",
    home: "住家",
    office: "公司",
    saveText: "儲存",
    
    // 餐廳卡片相關
    viewRoute: "查看路線與規劃",
    viewWebsite: "查看官網",
    address: "地址",
    phone: "電話",
    businessHours: "營業時間",
    openingIn: "小時後開始營業",
    hours: "小時",
    hoursNotAvailable: '營業時間未提供',
    viewLocation: '查看位置',
    clickToViewPhotos: '點擊查看Google地圖相片',
    visitWebsite: '查看官網',
    openNow: '營業中',
    closed: '已打烊',
    hoursUnknown: '營業狀況未明',
    temporarilyClosed: '⚠️ 此餐廳可能暫停營業，建議致電確認',
    
    // 營業狀態
    closedToday: '今日不營業',
    closingSoon: '即將打烊',
    openingSoon: '即將營業',
    hoursAfterOpening: '小時後開始營業',
    hoursAfterClosing: '小時後打烊'
  },
  ja: {
    // 主應用介面
    title: "レストランルーレット",
    spinButton: "何を食べましょうか？",
    spinning: "レストランを探しています...",
    locationError: "近くのレストランを見つけるために位置情報へのアクセスを許可してください。",
    locationLoading: "位置情報を取得しています...",
    relocateButton: "再位置取得",
    spinErrorPrefix: "エラー：",
    apiSearching: "近くのレストランを検索しています...",
    radiusLabel: "検索範囲：",
    radiusKm: "km",
    locationSuccess: "位置情報取得成功",
    locationDetected: "現在地",
    addressLoading: "住所を取得しています...",
    addressError: "住所が取得できません",
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    enterAddress: "住所を入力して位置を修正",
    locateHere: "📍 ここに位置設定",
    home: "自宅",
    office: "オフィス",
    saveText: "保存",
    
    // 餐廳卡片相關
    viewRoute: "ルートと案内を見る",
    viewWebsite: "ウェブサイトを見る",
    address: "住所",
    phone: "電話",
    businessHours: "営業時間",
    openingIn: "時間後に開店",
    hours: "時間",
    hoursNotAvailable: '営業時間の情報なし',
    viewLocation: '場所を見る',
    clickToViewPhotos: 'Google マップの写真を見る',
    visitWebsite: 'ウェブサイトを見る',
    openNow: '営業中',
    closed: '閉店',
    hoursUnknown: '営業時間不明',
    temporarilyClosed: '⚠️ このレストランは一時閉店の可能性があります。電話で確認してください',
    
    // 營業狀態
    closedToday: '本日休業',
    closingSoon: 'まもなく閉店',
    openingSoon: 'まもなく開店',
    hoursAfterOpening: '時間後に開店',
    hoursAfterClosing: '時間後に閉店'
  },
  ko: {
    // 主應用介面
    title: "레스토랑 룰렛",
    spinButton: "무엇을 먹을까요?",
    spinning: "레스토랑을 찾고 있습니다...",
    locationError: "근처 레스토랑을 찾기 위해 위치 접근을 허용해주세요.",
    locationLoading: "위치를 가져오는 중...",
    relocateButton: "재위치",
    spinErrorPrefix: "오류: ",
    apiSearching: "근처 레스토랑을 검색 중...",
    radiusLabel: "검색 범위:",
    radiusKm: "km",
    locationSuccess: "위치 찾기 성공",
    locationDetected: "현재 위치",
    addressLoading: "주소를 가져오는 중...",
    addressError: "주소를 사용할 수 없음",
    breakfast: "아침식사",
    lunch: "점심식사",
    dinner: "저녁식사",
    enterAddress: "위치를 수정할 주소 입력",
    locateHere: "📍 여기에 위치",
    home: "집",
    office: "사무실",
    saveText: "저장",
    
    // 餐廳卡片相關
    viewRoute: "경로 및 내비게이션 보기",
    viewWebsite: "웹사이트 보기",
    address: "주소",
    phone: "전화",
    businessHours: "영업시간",
    openingIn: "시간 후 영업 시작",
    hours: "시간",
    hoursNotAvailable: '영업시간 정보 없음',
    viewLocation: '위치 보기',
    clickToViewPhotos: 'Google 지도 사진 보기',
    visitWebsite: '웹사이트 보기',
    openNow: '영업 중',
    closed: '영업종료',
    hoursUnknown: '영업시간 알 수 없음',
    temporarilyClosed: '⚠️ 이 식당은 임시 휴업일 수 있습니다. 전화로 확인하세요',
    
    // 營業狀態
    closedToday: '오늘 휴무',
    closingSoon: '곧 영업종료',
    openingSoon: '곧 영업시작',
    hoursAfterOpening: '시간 후 영업 시작',
    hoursAfterClosing: '시간 후 영업 종료'
  },
  es: {
    // 主應用介面
    title: "Ruleta de Restaurantes",
    spinButton: "¿Qué comemos?",
    spinning: "Buscando tu restaurante...",
    locationError: "Por favor permite el acceso a la ubicación para encontrar restaurantes cercanos.",
    locationLoading: "Obteniendo tu ubicación...",
    relocateButton: "Relocalizar",
    spinErrorPrefix: "Error: ",
    apiSearching: "Buscando restaurantes cercanos...",
    radiusLabel: "Radio de búsqueda:",
    radiusKm: "km",
    locationSuccess: "Ubicación encontrada",
    locationDetected: "Ubicado en",
    addressLoading: "Obteniendo dirección...",
    addressError: "Dirección no disponible",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    enterAddress: "Ingresa dirección para corregir ubicación",
    locateHere: "📍 Ubicar aquí",
    home: "Casa",
    office: "Oficina",
    saveText: "Guardar",
    
    // 餐廳卡片相關
    viewRoute: "Ver Ruta y Navegación",
    viewWebsite: "Ver Sitio Web",
    address: "Dirección",
    phone: "Teléfono",
    businessHours: "Horario de Atención",
    openingIn: "Abre en",
    hours: "horas",
    hoursNotAvailable: 'Horario no disponible',
    viewLocation: 'Ver ubicación',
    clickToViewPhotos: 'Ver fotos de Google Maps',
    visitWebsite: 'Ver Sitio Web',
    openNow: 'Abierto Ahora',
    closed: 'Cerrado',
    hoursUnknown: 'Horario Desconocido',
    temporarilyClosed: '⚠️ Este restaurante puede estar temporalmente cerrado, llame para confirmar',
    
    // 營業狀態
    closedToday: 'Cerrado hoy',
    closingSoon: 'Cerrando pronto',
    openingSoon: 'Abriendo pronto',
    hoursAfterOpening: 'Abre en',
    hoursAfterClosing: 'Cierra en'
  },
  fr: {
    // 主應用介面
    title: "Roulette de Restaurants",
    spinButton: "Que mangeons-nous ?",
    spinning: "Recherche de votre restaurant...",
    locationError: "Veuillez autoriser l'accès à la localisation pour trouver des restaurants à proximité.",
    locationLoading: "Obtention de votre position...",
    relocateButton: "Relocaliser",
    spinErrorPrefix: "Erreur : ",
    apiSearching: "Recherche de restaurants à proximité...",
    radiusLabel: "Rayon de recherche :",
    radiusKm: "km",
    locationSuccess: "Position trouvée",
    locationDetected: "Situé à",
    addressLoading: "Obtention de l'adresse...",
    addressError: "Adresse non disponible",
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    enterAddress: "Entrez l'adresse pour corriger la position",
    locateHere: "📍 Localiser ici",
    home: "Maison",
    office: "Bureau",
    saveText: "Sauvegarder",
    
    // 餐廳卡片相關
    viewRoute: "Voir Itinéraire et Navigation",
    viewWebsite: "Voir Site Web",
    address: "Adresse",
    phone: "Téléphone",
    businessHours: "Heures d'Ouverture",
    openingIn: "Ouvre dans",
    hours: "heures",
    hoursNotAvailable: 'Horaires non disponibles',
    viewLocation: 'Voir l\'emplacement',
    clickToViewPhotos: 'Voir les photos Google Maps',
    visitWebsite: 'Voir Site Web',
    openNow: 'Ouvert Maintenant',
    closed: 'Fermé',
    hoursUnknown: 'Horaires Inconnus',
    temporarilyClosed: '⚠️ Ce restaurant peut être temporairement fermé, appelez pour confirmer',
    
    // 營業狀態
    closedToday: 'Fermé aujourd\'hui',
    closingSoon: 'Ferme bientôt',
    openingSoon: 'Ouvre bientôt',
    hoursAfterOpening: 'Ouvre dans',
    hoursAfterClosing: 'Ferme dans'
  }
};

/**
 * 取得翻譯文字的工具函數
 * @param {string} language - 語言代碼 (en, zh, ja, ko, es, fr)
 * @param {string} key - 翻譯鍵值
 * @returns {string} 翻譯後的文字，如果找不到則返回英文版本
 */
export function getTranslation(language, key) {
  return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
}

/**
 * 取得 Google Maps 語言代碼
 * @param {string} language - 應用語言代碼
 * @returns {string} Google Maps API 支援的語言代碼
 */
export function getGoogleMapsLanguage(language) {
  const langMap = {
    'zh': 'zh-TW',
    'ja': 'ja',
    'ko': 'ko',
    'es': 'es',
    'fr': 'fr'
  };
  return langMap[language] || 'en';
}

/**
 * 取得本地化文字（簡化版，適用於雙語情況）
 * @param {string} language - 語言代碼
 * @param {string} zhText - 中文文字
 * @param {string} enText - 英文文字
 * @returns {string} 對應語言的文字
 */
export function getLocalizedText(language, zhText, enText) {
  return language === 'zh' ? zhText : enText;
}