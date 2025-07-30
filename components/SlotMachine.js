function SlotMachine({ isSpinning, onSpin, translations, finalRestaurant }) {
  try {
    const [scrollingNames, setScrollingNames] = React.useState([]);
    
    const restaurantNames = [
      "Sakura Sushi", "Mama's Italian Kitchen", "Spice Garden", 
      "The Burger Joint", "Le Petit Bistro", "Taco Libre",
      "Golden Dragon", "Pizza Palace", "Curry House", "Steakhouse Elite",
      "Ocean View Seafood", "Mountain Grill", "City Cafe", "Garden Bistro",
      "Fire Kitchen", "Sweet Treats", "Corner Deli", "Royal Dining"
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
                  <div className="text-sm text-gray-600">
                    {finalRestaurant.cuisine.join(', ')}
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
