// 移除import，使用全域函數

function RestaurantCard({ restaurant, language, userLocation, userAddress }) {
  try {
    const [selectedImage, setSelectedImage] = React.useState(null);

    // 使用共用的價位標籤
    const priceLabels = window.getPriceLabels();

    // 使用共用的翻譯函數
    const getTranslation = (key) => {
      const translations = window.getRestaurantTranslations(language);
      return translations[key] || key;
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

    // 使用共用的導航URL生成函數
    const getDirectionsUrl = () => {
      return window.getDirectionsUrl(restaurant, userLocation, userAddress, language);
    };

    // 使用共用的星級顯示函數
    const renderGoogleStars = () => {
      const rating = restaurant.rating || 0;
      const stars = window.renderStars(rating);
      if (!stars) return null;
      
      return (
        <div className="flex items-center gap-1">
          {stars.map(star => (
            <span key={star.key} className={`${star.className} text-lg`}>{star.symbol}</span>
          ))}
        </div>
      );
    };

    return (
      <div className="card w-full max-w-2xl mx-auto" data-name="restaurant-card" data-file="components/RestaurantCard.js">
        {/* Restaurant Header - 暫時註解掉 */}
        {/* 
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-3 text-[var(--text-primary)]">{restaurant.name}</h2>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              {renderGoogleStars()}
              <span className="text-[var(--text-secondary)] font-medium ml-1">{restaurant.rating}</span>
              <span className="text-[var(--text-secondary)]">({restaurant.reviewCount.toLocaleString()})</span>
            </div>
            <div className="flex flex-wrap gap-1 ml-2">
              {restaurant.cuisine.map((type, index) => (
                <span key={index} className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
        */}

        {/* Restaurant Info */}
        <div>
            {/* 導航和網站圖示按鈕 */}
            <div className="flex items-center gap-3 mb-6">
              {/* 導航按鈕 */}
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                // --- 修改開始 ---
                // 1. 新增 group 用於統一 hover 效果
                // 2. 移除 w-12 h-12 justify-center
                // 3. 新增 padding (px-4 py-3) 和 gap (gap-3)
                className="group flex items-center gap-3 rounded-lg bg-[var(--surface-color)] px-4 py-3 text-[var(--text-primary)] transition-colors duration-200 border border-gray-600 hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] hover:text-white"
                // --- 修改結束 ---
                title={getTranslation('viewRoute')}
              >
                {/* 4. 將 hover 效果改為 group-hover */}
                <div className="icon-navigation text-[var(--primary-color)] text-xl"></div>
                {/* 5. 將文字從 title 移到這裡，並套用樣式 */}
                <span className="font-semibold">{getTranslation('viewRoute')}</span>
              </a>

              {/* 網站按鈕 */}
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  // --- 修改開始 ---
                  className="group flex items-center gap-3 rounded-lg bg-[var(--surface-color)] px-4 py-3 text-[var(--text-primary)] transition-colors duration-200 border border-gray-600 hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] hover:text-white"
                  // --- 修改結束 ---
                  title={getTranslation('viewWebsite')}
                >
                  {/* 將 hover 效果改為 group-hover */}
                  <div className="icon-globe text-xl"></div>
                  {/* 將文字從 title 移到這裡，並套用樣式 */}
                  <span className="font-semibold">{getTranslation('viewWebsite')}</span>
                </a>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="icon-map-pin text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {getTranslation('address')}
                  </div>
                  <span className="text-[var(--text-secondary)]">{restaurant.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="icon-phone text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {getTranslation('phone')}
                  </div>
                  <a href={`tel:${restaurant.phone}`} className="hover:underline">
                    {restaurant.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="icon-clock text-lg mt-1"></div>
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
