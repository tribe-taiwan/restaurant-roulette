function SlotMachine({ isSpinning, onSpin, onAddCandidate, translations, finalRestaurant, candidateList = [], language, onClearList, onImageClick, userLocation, userAddress }) {
  try {
    const [scrollingNames, setScrollingNames] = React.useState([]);
    const [touchStart, setTouchStart] = React.useState(null);
    const [touchEnd, setTouchEnd] = React.useState(null);
    
    // 價位標籤資料
    const priceLabels = {
      en: { 1: 'Budget', 2: 'Moderate', 3: 'Expensive', 4: 'Fine Dining' },
      zh: { 1: '經濟實惠', 2: '中等價位', 3: '高價位', 4: '精緻餐飲' },
      ja: { 1: 'リーズナブル', 2: '中価格帯', 3: '高価格帯', 4: '高級料理' },
      ko: { 1: '저렴한', 2: '중간 가격', 3: '비싼', 4: '고급 요리' },
      vi: { 1: 'Bình dân', 2: 'Trung bình', 3: 'Đắt tiền', 4: 'Sang trọng' },
      ms: { 1: 'Bajet', 2: 'Sederhana', 3: 'Mahal', 4: 'Mewah' }
    };
    
    // 導航URL生成函數（複製自RestaurantCard）
    const getDirectionsUrl = (restaurant) => {
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

    const slotImages = [
      "./assets/image/slot-machine/slot (1).jpg",
      "./assets/image/slot-machine/slot (2).jpg",
      "./assets/image/slot-machine/slot (3).jpg",
      "./assets/image/slot-machine/slot (4).jpg",
      "./assets/image/slot-machine/slot (5).jpg",
      "./assets/image/slot-machine/slot (6).jpg"
    ];

    // 觸控事件處理（手機）
    const handleTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50; // 左滑距離超過50px

      if (isLeftSwipe && !isSpinning) {
        // 左滑：搜尋下一家餐廳
        onSpin(false);
      }
    };

    // 鍵盤事件處理（電腦）
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && !isSpinning) {
        // 左箭頭：搜尋下一家餐廳
        onSpin(false);
      }
      if (e.key === 'Enter' && finalRestaurant && !isSpinning && candidateList.length < 9) {
        // Enter：加入候選
        onAddCandidate();
      }
    };

    // 添加鍵盤事件監聽
    React.useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isSpinning, finalRestaurant, candidateList.length]);

    React.useEffect(() => {
      if (isSpinning) {
        if (finalRestaurant && finalRestaurant.image) {
          // API 已返回，構建最終序列並觸發慢速停止動畫
          const extendedImages = [];

          // 添加一些 slot 圖片
          for (let i = 0; i < 8; i++) {
            extendedImages.push(...slotImages);
          }
          // 最後幾張 slot 圖片
          extendedImages.push(slotImages[0], slotImages[1]);
          // 餐廳圖片作為最後一張
          extendedImages.push(finalRestaurant.image);

          setScrollingNames(extendedImages);

          // 觸發慢速停止動畫
          setTimeout(() => {
            // 切換到慢速動畫
            const container = document.querySelector('.animate-scroll-names');
            if (container) {
              container.classList.remove('animate-scroll-names');
              container.classList.add('animate-scroll-slow-stop');
            }
          }, 100);

        } else {
          // API 未返回，持續快速循環 slot 圖片
          const extendedImages = [];
          for (let i = 0; i < 50; i++) {
            extendedImages.push(...slotImages);
          }
          setScrollingNames(extendedImages);
        }
      }
    }, [isSpinning, finalRestaurant]);

    return (
      <div className="w-full max-w-2xl mx-auto glow-container rounded-lg" data-name="slot-machine" data-file="components/SlotMachine.js">
        <div className="text-center mb-6">
          
          {/* Restaurant Image Display */}
          <div 
            className="group rounded-t-lg mb-6 h-64 overflow-hidden relative cursor-pointer select-none"
            style={{
              backgroundImage: finalRestaurant && finalRestaurant.image ? 
                `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${finalRestaurant.image})` : 
                'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => finalRestaurant && !isSpinning && onImageClick && onImageClick()}
            title={finalRestaurant && !isSpinning ? "點擊查看Google地圖照片" : "左滑或按←鍵搜尋下一家餐廳"}
          >
            <div className={`flex flex-col items-center justify-center transition-transform duration-2000 ease-out pointer-events-none ${
              isSpinning ? 'animate-scroll-names' : ''
            }`}>
              {isSpinning ? (
                scrollingNames.map((imageSrc, index) => {
                  const isRestaurantImage = finalRestaurant && finalRestaurant.image && imageSrc === finalRestaurant.image;

                  return (
                    <div key={index} className="w-full h-64 flex items-center justify-center flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt={isRestaurantImage ? `restaurant-${finalRestaurant.name}` : `slot-${index}`}
                        className="w-full h-full object-cover"
                        style={{
                          filter: isRestaurantImage ? 'brightness(1) contrast(1)' : 'brightness(0.8) contrast(1.1)'
                        }}
                      />
                      {/* 如果是餐廳圖片，添加資訊覆蓋層 */}
                      {isRestaurantImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                            {finalRestaurant.name}
                          </div>
                          <div className="text-sm text-white drop-shadow">
                            {finalRestaurant.distance && (
                              <div className="flex items-center justify-center gap-1">
                                <div className="icon-map text-sm"></div>
                                <span>{finalRestaurant.distance} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : finalRestaurant ? (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                    {finalRestaurant.name}
                  </div>
                  <div className="text-sm text-white drop-shadow">
                    {finalRestaurant.distance && (
                      <div className="flex items-center justify-center gap-1">
                        <div className="icon-map text-sm"></div>
                        <span>{finalRestaurant.distance} km</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-white drop-shadow-lg py-8 flex items-center justify-center gap-2">
                  😋
                  {translations.spinButton}
                </div>
              )}
            </div>
            
            {/* Price Label - Bottom Left */}
            {finalRestaurant && !isSpinning && finalRestaurant.priceLevel && (
              <div className="absolute bottom-4 left-4 bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold pointer-events-none">
                {priceLabels[language]?.[finalRestaurant.priceLevel] || priceLabels.en[finalRestaurant.priceLevel]}
              </div>
            )}
            
            {/* Hover Arrow - Right Side */}
            {finalRestaurant && !isSpinning && (
              <div 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpin(false);
                }}
                title="搜尋下一家餐廳"
              >
                <div className="icon-chevron-right text-white text-6xl drop-shadow-lg"></div>
              </div>
            )}
            
          </div>

          {/* Button Container */}
          <div className="flex items-center gap-3 px-4">
            {/* Search Next Button */}
            <button
              onClick={() => onSpin(false)}
              disabled={isSpinning}
              className={`btn-primary flex-1 text-lg ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {translations.spinning}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  😋
                  {translations.spinButton}
                </div>
              )}
            </button>

            {/* Add to Candidate Button - Outside of image area */}
            {finalRestaurant && !isSpinning && candidateList.length < 9 && (
              <button
                onClick={onAddCandidate}
                className="bg-blue-600 text-white w-12 h-12 min-w-[3rem] rounded-full shadow-lg transition-all duration-200 active:scale-95 active:bg-blue-500 flex items-center justify-center flex-shrink-0"
                style={{
                  touchAction: 'manipulation'
                }}
                title="加入候選"
              >
                <div className="icon-plus text-xl"></div>
              </button>
            )}
          </div>

          {/* Restaurant List */}
          {candidateList.length > 0 && (
            <div className="mt-6 w-full">
              <div className="flex items-center justify-between mb-4 px-4">
                <div className="text-sm text-gray-600">
                  候選餐廳 ({candidateList.length}/9)
                </div>
                <button
                  onClick={onClearList}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  清除列表
                </button>
              </div>
              <div className="space-y-3 w-full">
                {candidateList.map((restaurant, index) => {
                  const priceLevel = restaurant.priceLevel || restaurant.price_level || 2;
                  
                  return (
                    <a
                      key={index}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden transition-all duration-200 hover:shadow-lg relative h-24"
                      style={{
                        backgroundImage: restaurant.image ? 
                          `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${restaurant.image})` : 
                          'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Left Info Panel with Golden Ratio Width - Frosted Glass Effect */}
                      <div 
                        className="absolute left-0 top-0 h-full flex flex-col justify-center p-4 cursor-pointer hover:bg-opacity-75 transition-all duration-200"
                        style={{
                          width: '38.2%',
                          background: 'linear-gradient(to right, rgba(255,255,255,0.25), rgba(255,255,255,0.1), transparent)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)', // Safari support
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDirectionsUrl(restaurant), '_blank');
                        }}
                        title="點擊導航到此餐廳"
                      >
                        <div className="text-left pointer-events-none">
                          <div className="font-semibold text-white text-base mb-1 leading-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            {index + 1}. {restaurant.name}
                          </div>
                          {restaurant.distance && (
                            <div className="text-xs text-white flex items-center gap-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                              <div className="icon-map text-xs"></div>
                              <span>{restaurant.distance} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Price Label - Bottom Right */}
                      <div className="absolute bottom-3 right-3 bg-[var(--accent-color)] text-black px-2 py-1 rounded-full text-xs font-semibold pointer-events-none">
                        {priceLabels[language]?.[priceLevel] || priceLabels.en[priceLevel]}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('SlotMachine component error:', error);
    return null;
  }
}
