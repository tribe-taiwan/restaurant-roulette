function SlotMachine({ isSpinning, onSpin, translations, finalRestaurant }) {
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
          <div className="icon-utensils text-4xl text-[var(--accent-color)] mb-4"></div>
          
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
                  <div className="text-sm text-gray-600 space-y-1">
                    {finalRestaurant.distance && (
                      <div className="flex items-center justify-center gap-1">
                        <span>📍</span>
                        <span>{finalRestaurant.distance}km</span>
                      </div>
                    )}
                    {finalRestaurant.operatingStatus && (
                      <div className={`flex items-center justify-center gap-1 ${
                        finalRestaurant.operatingStatus.status === 'open' 
                          ? 'text-green-600' 
                          : finalRestaurant.operatingStatus.status === 'closed' 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        <span>
                          {finalRestaurant.operatingStatus.status === 'open' ? '🟢' : 
                           finalRestaurant.operatingStatus.status === 'closed' ? '🔴' : '⚪'}
                        </span>
                        <span>{finalRestaurant.operatingStatus.message}</span>
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
        </div>
      </div>
    );
  } catch (error) {
    console.error('SlotMachine component error:', error);
    return null;
  }
}
