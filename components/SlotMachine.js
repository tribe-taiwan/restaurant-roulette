function SlotMachine({ isSpinning, onSpin, onAddCandidate, translations, finalRestaurant, candidateList = [], language, onClearList, onImageClick }) {
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
      es: { 1: 'Económico', 2: 'Moderado', 3: 'Caro', 4: 'Alta Cocina' },
      fr: { 1: 'Économique', 2: 'Modéré', 3: 'Cher', 4: 'Haute Cuisine' }
    };
    
    const restaurantNames = [
      "櫻町壽司",
      "阿母義麵屋",
      "香料事務所",
      "堡來了漢堡店",
      "小巴黎餐酒館",
      "塔可炸翻天",
      "金龍食堂",
      "披薩殿",
      "咖哩日常",
      "牛排俱樂部",
      "海景鮮味屋",
      "山上燒肉鋪",
      "城市角落咖啡",
      "花園日子",
      "火烤食研所",
      "甜在心",
      "巷口熟食店",
      "皇族大食堂"
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
        // Generate more names for smooth scrolling
        const extendedNames = [];
        for (let i = 0; i < 20; i++) {
          extendedNames.push(...restaurantNames);
        }
        setScrollingNames(extendedNames);
      }
    }, [isSpinning]);

    return (
      <div className="w-full max-w-2xl mx-auto" data-name="slot-machine" data-file="components/SlotMachine.js">
        <div className="text-center mb-6">
          
          {/* Restaurant Image Display */}
          <div 
            className="group rounded-lg mb-6 h-64 overflow-hidden relative cursor-pointer select-none"
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
            <div className={`flex flex-col items-center justify-center transition-transform duration-2000 ease-out ${
              isSpinning ? 'animate-scroll-names' : ''
            }`}>
              {isSpinning ? (
                scrollingNames.map((name, index) => (
                  <div key={index} className="text-lg font-semibold text-gray-800 py-2 whitespace-nowrap">
                    {name}
                  </div>
                ))
              ) : finalRestaurant ? (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                    {finalRestaurant.name}
                  </div>
                  <div className="text-sm text-white drop-shadow">
                    {finalRestaurant.distance && (
                      <div className="flex items-center justify-center gap-1">
                        <div className="icon-map text-sm"></div>
                        <span>{finalRestaurant.distance}km</span>
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
            
            {/* Price Label - Top Right */}
            {finalRestaurant && !isSpinning && finalRestaurant.priceLevel && (
              <div className="absolute top-4 right-4 bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
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
            
            {/* Add to Candidate Button - Small Circle in Bottom Right */}
            {finalRestaurant && !isSpinning && candidateList.length < 9 && (
              <button
                onClick={onAddCandidate}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full text-sm font-bold shadow-lg transition-all"
                title="加入候選"
              >
                {candidateList.length}/9
              </button>
            )}
          </div>

          {/* Search Next Button */}
          <button
            onClick={() => onSpin(false)}
            disabled={isSpinning}
            className={`btn-primary w-full text-lg ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
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

          {/* Restaurant List */}
          {candidateList.length > 0 && (
            <div className="mt-6 w-full">
              <div className="text-center text-sm text-gray-600 mb-4">
                候選餐廳 ({candidateList.length}/9)
              </div>
              <div className="space-y-2 w-full">
                {candidateList.map((restaurant, index) => {
                  const priceLabels = {
                    1: '經濟實惠',
                    2: '中等價位', 
                    3: '高價位',
                    4: '精緻餐飲'
                  };
                  const priceLevel = restaurant.priceLevel || restaurant.price_level || 2;
                  const priceText = priceLabels[priceLevel] || '中等價位';
                  
                  return (
                    <a
                      key={index}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-lg">
                            {index + 1}. {restaurant.name}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                            {restaurant.distance && (
                              <span><div className="icon-map inline text-sm mr-1"></div>{restaurant.distance}km</span>
                            )}
                            <span>💰 {priceText}</span>
                          </div>
                        </div>
                        <div className="text-gray-400 text-lg">
                          ↗
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              {candidateList.length > 0 && (
                <div className="text-center mt-4">
                  <button
                    onClick={onClearList}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                  >
                    🗑️ 清除列表
                  </button>
                </div>
              )}
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
