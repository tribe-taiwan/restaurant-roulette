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

    const openRestaurantInMaps = () => {
      // 在 Google Maps 中打開餐廳位置和相片功能（使用共用的四層 fallback 策略）
      const optimized = window.getOptimizedRestaurantQuery(restaurant);
      let url;
      
      if (optimized.type === 'place_id') {
        url = `https://www.google.com/maps/search/?api=1&query_place_id=${restaurant.id}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(optimized.query)}`;
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
