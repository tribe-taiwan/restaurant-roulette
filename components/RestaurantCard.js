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
      // 點擊照片直接跳轉到Google Maps
      window.open(restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ', ' + restaurant.address)}&query_place_id=${restaurant.id}`, '_blank');
    };

    const closeModal = () => {
      setSelectedImage(null);
    };

    const getDirectionsUrl = () => {
      return restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ', ' + restaurant.address)}&query_place_id=${restaurant.id}`;
    };

    // Google風格的星級顯示
    const renderGoogleStars = () => {
      const rating = restaurant.rating || 0;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      
      return (
        <div className="flex items-center gap-1">
          {/* 實心星星 */}
          {[...Array(fullStars)].map((_, i) => (
            <span key={`full-${i}`} className="text-[#fbbc04] text-lg">★</span>
          ))}
          {/* 半星 */}
          {hasHalfStar && (
            <span className="text-[#fbbc04] text-lg relative">
              <span className="absolute inset-0">☆</span>
              <span className="absolute inset-0 overflow-hidden w-1/2">★</span>
            </span>
          )}
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
          <div className="flex items-center gap-2 mb-3">
            {renderGoogleStars()}
            <span className="text-[var(--text-secondary)] font-medium ml-1">{restaurant.rating}</span>
            <span className="text-[var(--text-secondary)]">({restaurant.reviewCount.toLocaleString()})</span>
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
                title={language === 'zh' ? '點擊在Google地圖中查看' : 'Click to view in Google Maps'}
              />
              <div className="absolute top-4 right-4 bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
                {priceLabels[language]?.[restaurant.priceLevel] || priceLabels.en[restaurant.priceLevel]}
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                📸 {language === 'zh' ? '點擊查看位置' : 'Click to view location'}
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

            {/* Cuisine Type */}
            <div className="flex flex-wrap gap-2 mb-6">
              {restaurant.cuisine.map((type, index) => (
                <span key={index} className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-sm">
                  {type}
                </span>
              ))}
            </div>

            {/* 營業狀態 */}
            {restaurant.businessStatus && restaurant.businessStatus !== 'OPERATIONAL' && (
              <div className="bg-[var(--warning-color)] bg-opacity-20 border border-[var(--warning-color)] rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="icon-alert-triangle text-[var(--warning-color)] text-lg"></div>
                  <span className="text-[var(--warning-color)] font-medium">
                    {language === 'zh' ? '注意：可能暫停營業' : 'Note: May be temporarily closed'}
                  </span>
                </div>
              </div>
            )}

            {/* 附加資訊 */}
            {restaurant.website && (
              <div className="flex items-start gap-3 mb-4">
                <div className="icon-globe text-[var(--accent-color)] text-lg mt-1"></div>
                <div>
                  <div className="font-medium text-[var(--text-primary)] mb-1">
                    {language === 'zh' ? '網站' : 'Website'}
                  </div>
                  <a 
                    href={restaurant.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--accent-color)] hover:underline text-sm"
                  >
                    {language === 'zh' ? '查看官網' : 'Visit Website'}
                  </a>
                </div>
              </div>
            )}
            
            {/* Google Maps 連結 */}
            <div className="flex items-start gap-3 mb-4">
              <div className="icon-navigation text-[var(--primary-color)] text-lg mt-1"></div>
              <div>
                <div className="font-medium text-[var(--text-primary)] mb-1">
                  {language === 'zh' ? '導航' : 'Directions'}
                </div>
                <a 
                  href={getDirectionsUrl()}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--primary-color)] hover:underline text-sm"
                >
                  {language === 'zh' ? '在Google地圖中查看' : 'View in Google Maps'}
                </a>
              </div>
            </div>
          </div>
        </div>

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
