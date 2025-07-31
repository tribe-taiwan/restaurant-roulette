function RestaurantCard({ restaurant, language }) {
  try {
    const [selectedImage, setSelectedImage] = React.useState(null);

    const priceLabels = {
      en: { 1: 'Budget', 2: 'Moderate', 3: 'Expensive', 4: 'Fine Dining' },
      zh: { 1: '經濟實惠', 2: '中等價位', 3: '高價位', 4: '精緻餐飲' }
    };

    const formatHours = (hours) => {
      if (!hours) return language === 'zh' ? '營業時間未提供' : 'Hours not available';
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
      // 優先使用路線規劃功能
      if (restaurant.id) {
        return `https://www.google.com/maps/dir/?api=1&destination=place_id:${restaurant.id}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
      }
      // 回退選項
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
                className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
                title={language === 'zh' ? '點擊查看Google地圖相片' : 'Click to view Google Maps photos'}
              />
              <div className="absolute top-4 right-4 bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
                {priceLabels[language]?.[restaurant.priceLevel] || priceLabels.en[restaurant.priceLevel]}
              </div>
              {/* 點擊查看位置按鈕 - 與點擊照片功能相同 */}
              <div 
                className="absolute bottom-4 right-4 bg-blue-600 bg-opacity-90 hover:bg-opacity-100 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-all"
                onClick={handleImageClick}
                title={language === 'zh' ? '點擊查看Google地圖相片' : 'Click to view Google Maps photos'}
              >
                <span>📍</span>
                <span>{language === 'zh' ? '查看位置' : 'View location'}</span>
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="icon-map-pin text-[var(--primary-color)] text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {language === 'zh' ? '地址' : 'Address'}
                  </div>
                  <span className="text-[var(--text-secondary)]">{restaurant.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="icon-phone text-[var(--success-color)] text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {language === 'zh' ? '電話' : 'Phone'}
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
                    {language === 'zh' ? '營業時間' : 'Hours'}
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
                    {restaurant.operatingStatus.status === 'open' ? '🟢' : 
                     restaurant.operatingStatus.status === 'closed' ? '🔴' : '🟡'}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm mb-1 ${
                      restaurant.operatingStatus.status === 'open' ? 'text-green-800 dark:text-green-300' : 
                      restaurant.operatingStatus.status === 'closed' ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {restaurant.operatingStatus.status === 'open' 
                        ? (language === 'zh' ? '營業中' : 'Open Now')
                        : restaurant.operatingStatus.status === 'closed'
                          ? (language === 'zh' ? '已打烊' : 'Closed')
                          : (language === 'zh' ? '營業狀況未明' : 'Hours Unknown')
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
                    {language === 'zh' ? '⚠️ 此餐廳可能暫停營業，建議致電確認' : '⚠️ This restaurant may be temporarily closed, please call to confirm'}
                  </span>
                </div>
              </div>
            )}

            {/* 網站和導航 - 一行顯示 */}
            <div className="flex flex-wrap gap-4 mb-4">
              {restaurant.website && (
                <div className="flex items-center gap-2">
                  <div className="icon-globe text-[var(--accent-color)] text-lg"></div>
                  <a 
                    href={restaurant.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--accent-color)] hover:underline text-sm"
                  >
                    {language === 'zh' ? '查看官網' : 'Visit Website'}
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="icon-navigation text-[var(--primary-color)] text-lg"></div>
                <a 
                  href={getDirectionsUrl()}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--primary-color)] hover:underline text-sm"
                >
                  {language === 'zh' ? '在Google地圖中查看導航' : 'View in Google Maps'}
                </a>
              </div>
            </div>
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
