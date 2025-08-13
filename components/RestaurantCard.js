// 移除import，使用全域函數

function RestaurantCard({ restaurant, language, userLocation, userAddress }) {
  try {

    // 使用共用的價位標籤
    const priceLabels = window.getPriceLabels();

    // 使用共用的翻譯函數
    const getTranslation = (key) => {
      const translations = window.getRestaurantTranslations(language);
      return translations[key] || key;
    };

    const formatHours = (hours) => {
      if (!hours) return getTranslation('hoursNotAvailable');

      // 使用多語言營業時間格式化函數
      const formattedHours = window.formatBusinessHours ?
        window.formatBusinessHours(hours, language) : hours;

      // 安全處理營業時間：如果是陣列，逐行渲染；如果是字串，直接顯示
      if (Array.isArray(formattedHours)) {
        return (
          <div className="space-y-1">
            {formattedHours.map((dayHours, index) => (
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

      return formattedHours;
    };

    const handleImageClick = () => {
      // 點擊照片跳轉到Google Maps相片功能
      let url;
      if (restaurant.id) {
        // 第一優先：place_id（最精確，直接找到原餐廳）
        url = `https://www.google.com/maps/search/?api=1&query_place_id=${restaurant.id}`;
      } else if (restaurant.name) {
        // 第二優先：城市+餐廳名稱（縮小同名餐廳問題）
        let searchQuery = restaurant.name;
        if (restaurant.address) {
          // 從地址提取城市資訊（通常在地址後段）
          const cityMatch = restaurant.address.match(/[市區縣]\s*$|[市區縣][^\s]*$/);
          if (cityMatch) {
            searchQuery = `${restaurant.name} ${cityMatch[0]}`;
          }
        }
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
      } else if (restaurant.address) {
        // 第三優先：地址（輔助定位）
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`;
      } else if (restaurant.lat && restaurant.lng) {
        // 最後備案：座標（可能定位不準，指向無關店家）
        url = `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`;
      }
      window.open(url, '_blank');
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
      <div className="w-full max-w-2xl mx-auto bg-[var(--surface-color)] rounded-b-lg p-4 glow-container" data-name="restaurant-card" data-file="components/RestaurantCard.js">
          {/* 非營業狀態警告 - 移到最上面 */}
          {restaurant.businessStatus && restaurant.businessStatus !== 'OPERATIONAL' && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="icon-alert-triangle text-red-600 text-lg"></div>
                <span className="text-red-700 font-medium text-sm">
                  {getTranslation('temporarilyClosed') || '暫停營業'}
                </span>
              </div>
            </div>
          )}

          {/* 地址顯示 - 與其他區塊統一風格 */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-md font-medium break-words">
                {restaurant.address}
              </div>
            </div>
            {restaurant.website && (
              <div className="text-sm">
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center justify-center gap-1">
                  <div className="icon-globe text-lg"></div>
                  <span>官方網站</span>
                </a>
              </div>
            )}
          </div>
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
            {/* 按鈕區塊 - 與其他區塊統一風格 */}
            <div className="flex gap-3 mb-6">
              {/* 導航按鈕 - 左邊 */}
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[72px] p-3 rounded-lg border-2 transition-all duration-200 
                           flex flex-col items-center justify-center text-white shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
                  borderColor: 'var(--theme-primary)'
                }}
              >
                <div className="text-lg font-semibold text-center leading-tight">
                  {getTranslation('viewRoute')}
                </div>
                <div className="text-lg mt-1 text-white opacity-90">
                  <div className="icon-navigation"></div>
                </div>
              </a>

              {/* 營業狀態按鈕 - 右邊 */}
              <div
                className="flex-1 min-h-[72px] p-3 rounded-lg border-2 transition-all duration-200 
                           flex flex-col items-center justify-center shadow-lg"
                style={{
                  background: 'white',
                  borderColor: '#e5e7eb'
                }}
              >
                <div className={`text-lg font-semibold text-center leading-tight ${
                  restaurant.operatingStatus?.status === 'open' ? 'text-green-600' : 'text-gray-800'
                }`}>
                  {restaurant.operatingStatus?.status === 'open' 
                    ? getTranslation('openNow') || '營業中'
                    : restaurant.operatingStatus?.status === 'closed'
                      ? getTranslation('closed') || '已打烊'
                      : getTranslation('hoursUnknown') || '營業中'
                  }
                </div>
                <div className="text-sm mt-1 flex items-center gap-1">
                  {restaurant.phone && (
                    <>
                      <div className={`icon-phone w-4 h-4 ${
                        restaurant.operatingStatus?.status === 'open' ? 'text-green-600' : 'text-red-600'
                      }`}></div>
                      <span className={`${
                        restaurant.operatingStatus?.status === 'open' 
                          ? 'text-green-600' 
                          : 'text-red-600 line-through'
                      }`}>
                        {restaurant.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 營業時間 - 單欄顯示 */}
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="font-medium mb-2 text-black">{getTranslation('businessHours') || '營業時間'}</div>
                <div className="space-y-1 text-gray-600">
                  {formatHours(restaurant.hours)}
                </div>
              </div>
            </div>

            {/* Cuisine Type 已移至星級評分右邊，此處移除 */}
            {/* 非營業狀態警告已移至頂部 */}
        </div>

      </div>
    );
  } catch (error) {
    console.error('RestaurantCard component error:', error);
    return null;
  }
}
