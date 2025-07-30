class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [selectedLanguage, setSelectedLanguage] = React.useState('en');
    const [currentRestaurant, setCurrentRestaurant] = React.useState(null);
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [userLocation, setUserLocation] = React.useState(null);
    const [locationStatus, setLocationStatus] = React.useState('loading');

    const translations = {
      en: {
        title: "Restaurant Roulette",
        spinButton: "Spin for Restaurant",
        spinning: "Finding your restaurant...",
        locationError: "Please allow location access to find nearby restaurants.",
        locationLoading: "Getting your location...",
        relocateButton: "Relocate"
      },
      zh: {
        title: "餐廳輪盤",
        spinButton: "轉動尋找餐廳",
        spinning: "正在尋找您的餐廳...",
        locationError: "請允許位置訪問以獲取附近餐廳。",
        locationLoading: "正在獲取您的位置...",
        relocateButton: "重新定位"
      }
    };

    const t = translations[selectedLanguage];

    React.useEffect(() => {
      getUserLocation();
    }, []);

    const getUserLocation = () => {
      setLocationStatus('loading');
      
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        setLocationStatus('error');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('success');
          console.log('Location detected:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Location error:', error.message);
          setLocationStatus('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    };

    const handleSpin = async () => {
      if (isSpinning) return;
      
      setIsSpinning(true);
      setCurrentRestaurant(null);

      // Simulate API call delay
      setTimeout(() => {
        const restaurant = getRandomRestaurant(userLocation);
        setCurrentRestaurant(restaurant);
        setIsSpinning(false);
      }, 2500);
    };

    return (
      <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-primary)] p-4" data-name="app" data-file="app.js">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              userLocation={userLocation}
            />
            <div className="flex items-center justify-center gap-4 mb-8">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
                {t.title}
              </h1>
              <button
                onClick={getUserLocation}
                className="w-12 h-12 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                title={t.relocateButton}
              >
                <div className="icon-map-pin text-white text-lg"></div>
              </button>
            </div>
          </div>

          {/* Slot Machine */}
          <div className="flex justify-center mb-8">
            <SlotMachine 
              isSpinning={isSpinning}
              onSpin={handleSpin}
              translations={t}
              finalRestaurant={currentRestaurant}
            />
          </div>

          {/* Restaurant Result */}
          {currentRestaurant && !isSpinning && (
            <div className="mt-8">
              <RestaurantCard 
                restaurant={currentRestaurant}
                language={selectedLanguage}
              />
            </div>
          )}

          {locationStatus === 'loading' && (
            <div className="text-center text-[var(--secondary-color)] mt-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--secondary-color)] border-t-transparent rounded-full animate-spin"></div>
                {t.locationLoading}
              </div>
            </div>
          )}
          
          {locationStatus === 'error' && (
            <div className="text-center text-[var(--warning-color)] mt-4 bg-[var(--surface-color)] rounded-lg p-3 max-w-md mx-auto">
              <div className="icon-map-pin text-[var(--warning-color)] text-lg mb-2"></div>
              {t.locationError}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);