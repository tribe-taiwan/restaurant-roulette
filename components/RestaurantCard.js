// 移除import，使用全域函數

function RestaurantCard({ restaurant, language, userLocation }) {
  try {
    const [selectedImage, setSelectedImage] = React.useState(null);

    const priceLabels = {
      en: { 1: 'Budget', 2: 'Moderate', 3: 'Expensive', 4: 'Fine Dining' },
      zh: { 1: '經濟實惠', 2: '中等價位', 3: '高價位', 4: '精緻餐飲' },
      ja: { 1: 'リーズナブル', 2: '中価格帯', 3: '高価格帯', 4: '高級料理' },
      ko: { 1: '저렴한', 2: '중간 가격', 3: '비싼', 4: '고급 요리' },
      es: { 1: 'Económico', 2: 'Moderado', 3: 'Caro', 4: 'Alta Cocina' },
      fr: { 1: 'Économique', 2: 'Modéré', 3: 'Cher', 4: 'Haute Cuisine' }
    };

    const getTranslation = (key) => {
      const translations = {
        en: {
          hoursNotAvailable: 'Hours not available',
          viewLocation: 'View location',
          clickToViewPhotos: 'Click to view Google Maps photos',
          viewRoute: 'View Route & Navigation',
          viewWebsite: 'Visit Website',
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
          viewRoute: '查看路線與導航',
          viewWebsite: '查看網站',
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
      return translations[language]?.[key] || translations.en[key];
    };

    const formatHours = (hours) => {
      if (!hours) return getTranslation('hoursNotAvailable');
      
      // 【防護備註】星期縮寫必須使用英文三字母格式 (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
      // 【嚴禁修改】無論任何語言或本地化需求，星期縮寫一律保持英文格式！
      // 安全處理營業時間：如果是陣列，逐行渲染；如果是字串，直接顯示
      if (Array.isArray(hours)) {
        return (
          <div className="space-y-1">
            {hours.map((dayHours, index) => (
              <div key={index} className="text-sm">
                <span className="font-mono font-bold mr-2">
                  {dayHours.split(': ')[0]}:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {dayHours.split(': ')[1] || ''}
                </span>
              </div>
            ))}
          </div>
        );
      }
      
      return hours;
    };

    const handleImageClick = () => {
      // 點擊照片跳轉到Google Maps相片功能
      let url;
      if (restaurant.id) {
        // 使用place_id直接跳轉到相片頁面  
        url = `https://www.google.com/maps/place/?q=place_id:${restaurant.id}&hl=${language === 'zh' ? 'zh-TW' : 'en'}&tab=photos`;
      } else {
        // 回退到一般搜索
        url = `https://www.google.com/maps/search/${encodeURIComponent(restaurant.name + ', ' + restaurant.address)}/photos`;
      }
      window.open(url, '_blank');
    };

    const closeModal = () => {
      setSelectedImage(null);
    };

    const getDirectionsUrl = () => {
      console.log('🗺️ 生成導航URL，當前userLocation:', userLocation);
      console.log('🗺️ 餐廳地址:', restaurant.address);
      
      // 簡化邏輯：直接使用座標作為起點，餐廳地址作為終點
      if (userLocation && restaurant.address) {
        const origin = encodeURIComponent(`${userLocation.lat},${userLocation.lng}`);
        const destination = encodeURIComponent(restaurant.address);
        const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
        console.log('🎯 最終導航URL:', finalUrl);
        console.log('🎯 導航起點座標:', userLocation);
        console.log('🎯 導航終點地址:', restaurant.address);
        return finalUrl;
      }

      // 如果沒有當前位置，使用最後一次定位點
      if (!userLocation && restaurant.address) {
        try {
          const lastKnownLocation = localStorage.getItem('lastKnownLocation');
          if (lastKnownLocation) {
            const lastLocation = JSON.parse(lastKnownLocation);
            const origin = encodeURIComponent(`${lastLocation.lat},${lastLocation.lng}`);
            const destination = encodeURIComponent(restaurant.address);
            const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
            console.log('🎯 使用lastKnownLocation的導航URL:', finalUrl);
            return finalUrl;
          }
        } catch (error) {
          console.warn('⚠️ 無法讀取最後一次的定位點:', error);
        }
      }

      // 回退選項：直接導航到餐廳位置
      return restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`;
    };

    // Google風格的星級顯示（簡化版，無半顆星）
    const renderGoogleStars = () => {
      const rating = restaurant.rating || 0;
      const fullStars = Math.round(rating); // 四捨五入到最接近的整數
      const emptyStars = 5 - fullStars;
      
      return (
        <div className="flex items-center gap-1">
          {/* 實心星星 */}
          {[...Array(fullStars)].map((_, i) => (
            <span key={`full-${i}`} className="text-[#fbbc04] text-lg">★</span>
          ))}
          {/* 空心星星 */}
          {[...Array(emptyStars)].map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-400 text-lg">☆</span>
          ))}
        </div>
      );
    };

    return (
      <div className="card max-w-5xl mx-auto" data-name="restaurant-card" data-file="components/RestaurantCard.js">
        {/* Restaurant Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-3 text-[var(--text-primary)]">{restaurant.name}</h2>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              {renderGoogleStars()}
              <span className="text-[var(--text-secondary)] font-medium ml-1">{restaurant.rating}</span>
              <span className="text-[var(--text-secondary)]">({restaurant.reviewCount.toLocaleString()})</span>
            </div>
            {/* Cuisine Type 顯示在星級評分右邊 */}
            <div className="flex flex-wrap gap-1 ml-2">
              {restaurant.cuisine.map((type, index) => (
                <span key={index} className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Restaurant Main Image */}
          <div className="lg:col-span-2">
            <div className="relative mb-4">
              <img 
                src={restaurant.image} 
                alt={restaurant.name}
                className="w-full aspect-video object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
                title={getTranslation('clickToViewPhotos')}
              />
              <div className="absolute top-4 right-4 bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
                {priceLabels[language]?.[restaurant.priceLevel] || priceLabels.en[restaurant.priceLevel]}
              </div>
              {/* 點擊查看位置按鈕 - 與點擊照片功能相同 */}
              <div 
                className="absolute bottom-4 right-4 bg-blue-600 bg-opacity-90 hover:bg-opacity-100 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-all"
                onClick={handleImageClick}
                title={getTranslation('clickToViewPhotos')}
              >
                <span>🕔</span>
                <span>{getTranslation('viewLocation')}</span>
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div>
            {/* 網站和導航 - 移到地址上面 */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="icon-navigation text-[var(--primary-color)] text-lg"></div>
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary-color)] hover:underline text-sm"
                >
                  {getTranslation('viewRoute')}
                </a>
              </div>

              {restaurant.website && (
                <div className="flex items-center gap-2">
                  <div className="icon-globe text-[var(--accent-color)] text-lg"></div>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-color)] hover:underline text-sm"
                  >
                    {getTranslation('viewWebsite')}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="icon-map-pin text-[var(--primary-color)] text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {getTranslation('address')}
                  </div>
                  <span className="text-[var(--text-secondary)]">{restaurant.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="icon-phone text-[var(--success-color)] text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {getTranslation('phone')}
                  </div>
                  <a href={`tel:${restaurant.phone}`} className="text-[var(--success-color)] hover:underline">
                    {restaurant.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="icon-clock text-[var(--secondary-color)] text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {getTranslation('businessHours')}
                  </div>
                  <span className="text-[var(--text-secondary)]">{formatHours(restaurant.hours)}</span>
                </div>
              </div>
            </div>

            {/* Cuisine Type 已移至星級評分右邊，此處移除 */}

            {/* 營業狀態 - 改善排版 */}
            {restaurant.operatingStatus && (
              <div className={`rounded-lg p-4 mb-4 border-l-4 ${
                restaurant.operatingStatus.status === 'open' 
                  ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
                  : restaurant.operatingStatus.status === 'closed' 
                    ? 'bg-red-50 border-red-500 dark:bg-red-900/20' 
                    : 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`text-2xl ${
                    restaurant.operatingStatus.status === 'open' ? 'text-green-600' : 
                    restaurant.operatingStatus.status === 'closed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {restaurant.operatingStatus.status === 'open' ? '✅' : 
                     restaurant.operatingStatus.status === 'closed' ? '❌' : '🟡'}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm mb-1 ${
                      restaurant.operatingStatus.status === 'open' ? 'text-green-800 dark:text-green-300' : 
                      restaurant.operatingStatus.status === 'closed' ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {restaurant.operatingStatus.status === 'open'
                        ? getTranslation('openNow')
                        : restaurant.operatingStatus.status === 'closed'
                          ? getTranslation('closed')
                          : getTranslation('hoursUnknown')
                      }
                    </div>
                    <div className={`text-sm ${
                      restaurant.operatingStatus.status === 'open' ? 'text-green-700 dark:text-green-400' : 
                      restaurant.operatingStatus.status === 'closed' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {restaurant.operatingStatus.message}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 非營業狀態警告 */}
            {restaurant.businessStatus && restaurant.businessStatus !== 'OPERATIONAL' && (
              <div className="bg-[var(--warning-color)] bg-opacity-20 border border-[var(--warning-color)] rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="icon-alert-triangle text-[var(--warning-color)] text-lg"></div>
                  <span className="text-[var(--warning-color)] font-medium text-sm">
                    {getTranslation('temporarilyClosed')}
                  </span>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* TODO: Google菜單功能 - 需要額外的Places Details API呼叫 */}
        {/* 
        Google Places API可能包含菜單連結，但需要：
        1. 使用getDetails API取得更多餐廳資訊
        2. 檢查是否有菜單URL (如menu_url, delivery_url等)
        3. 由於API配額和複雜性，暫時不實現
        如需實現，可在formatRestaurantData函數中添加菜單資料獲取邏輯
        */}

        {/* Modal for Image Views */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
            <div className="bg-[var(--surface-color)] rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {selectedImage === 'menu' && (language === 'zh' ? '菜單' : 'Menu')}
                  {selectedImage === 'photos' && (language === 'zh' ? '菜品相簿' : 'Food Photos')}
                  {selectedImage === 'directions' && (language === 'zh' ? '導航路線' : 'Directions')}
                </h3>
                <button onClick={closeModal} className="icon-x text-xl text-gray-400 hover:text-white"></button>
              </div>
              
              <div className="text-center">
                {selectedImage === 'menu' && (
                  <div>
                    <p className="text-[var(--text-secondary)] mb-4">
                      {language === 'zh' ? '點擊下方按鈕查看完整菜單' : 'Click below to view the full menu'}
                    </p>
                    <button className="btn-primary">
                      <div className="icon-external-link text-lg mr-2"></div>
                      {language === 'zh' ? '查看菜單' : 'View Menu'}
                    </button>
                  </div>
                )}
                
                {selectedImage === 'photos' && (
                  <div>
                    <p className="text-[var(--text-secondary)] mb-4">
                      {language === 'zh' ? '瀏覽餐廳的菜品照片' : 'Browse restaurant food photos'}
                    </p>
                    <button className="btn-primary">
                      <div className="icon-camera text-lg mr-2"></div>
                      {language === 'zh' ? '查看相簿' : 'View Photos'}
                    </button>
                  </div>
                )}
                
                {selectedImage === 'directions' && (
                  <div>
                    <p className="text-[var(--text-secondary)] mb-4">
                      {language === 'zh' ? '獲取前往餐廳的導航路線' : 'Get directions to the restaurant'}
                    </p>
                    <a 
                      href={getDirectionsUrl()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center"
                    >
                      <div className="icon-navigation text-lg mr-2"></div>
                      {language === 'zh' ? '開始導航' : 'Get Directions'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('RestaurantCard component error:', error);
    return null;
  }
}
