function SlotMachine({ isSpinning, onSpin, translations, finalRestaurant, restaurantList = [], language, onClearList }) {
  try {
    const [scrollingNames, setScrollingNames] = React.useState([]);
    
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
      <div className="slot-machine max-w-md w-full" data-name="slot-machine" data-file="components/SlotMachine.js">
        <div className="text-center mb-6">
          
          {/* Restaurant Name Scroller */}
          <div className="bg-white rounded-lg p-4 mb-6 h-32 overflow-hidden relative">
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
                  <div className="text-2xl font-bold text-[var(--primary-color)] mb-2">
                    🎉 {finalRestaurant.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {finalRestaurant.distance && (
                      <div className="flex items-center justify-center gap-1">
                        <span>📍</span>
                        <span>{finalRestaurant.distance}km</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-gray-800 py-8">
                  🎰 {translations.spinButton}
                </div>
              )}
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={onSpin}
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
                <div className="icon-shuffle text-xl"></div>
                {translations.spinButton}
              </div>
            )}
          </button>

          {/* Restaurant List */}
          {restaurantList.length > 0 && (
            <div className="mt-6">
              <div className="text-center text-sm text-gray-600 mb-4">
                餐廳選項 ({restaurantList.length}/5)
              </div>
              <div className="space-y-2">
                {restaurantList.map((restaurant, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {index + 1}. {restaurant.name}
                      </div>
                      {restaurant.distance && (
                        <div className="text-sm text-gray-600">
                          📍 {restaurant.distance}km
                        </div>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      🗺️
                    </a>
                  </div>
                ))}
              </div>
              {restaurantList.length > 0 && (
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
