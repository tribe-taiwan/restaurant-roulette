// 移除import，使用全域函數

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
    const [selectedLanguage, setSelectedLanguage] = React.useState('zh'); // 預設改為中文
    const [currentRestaurant, setCurrentRestaurant] = React.useState(null);
    const [candidateList, setCandidateList] = React.useState([]); // 用戶候選餐廳列表，最多9家
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [userLocation, setUserLocation] = React.useState(null);
    const [userAddress, setUserAddress] = React.useState(''); // 地址資訊
    const [locationStatus, setLocationStatus] = React.useState('loading');
    const [spinError, setSpinError] = React.useState(null);
    const [searchRadius, setSearchRadius] = React.useState(2); // 預設2公里
    const [isRelocating, setIsRelocating] = React.useState(false);
    const [selectedMealTime, setSelectedMealTime] = React.useState('all'); // 預設不過濾時段
    const [isInitialLoad, setIsInitialLoad] = React.useState(true); // 追蹤是否為初次載入
    const [lastKnownLocation, setLastKnownLocation] = React.useState(null); // 儲存上一次成功的定位
    const [locationError, setLocationError] = React.useState(null); // 儲存定位錯誤訊息
    
    // 地址校正相關狀態
    const [showAddressInput, setShowAddressInput] = React.useState(false);
    const [addressInput, setAddressInput] = React.useState('');
    const [savedLocations, setSavedLocations] = React.useState([]);
    const [isGeocodingAddress, setIsGeocodingAddress] = React.useState(false);

    const translations = {
      en: {
        title: "Restaurant Roulette",
        spinButton: "What shall we eat?",
        addCandidate: "Add Option",
        nextBatch: "Next Batch",
        spinning: "Searching...",
        locationError: "Please allow location access to find nearby restaurants.",
        locationLoading: "Getting your location...",
        relocateButton: "Relocate",
        spinErrorPrefix: "Error: ",
        apiSearching: "Searching nearby restaurants...",
        radiusLabel: "Search radius:",
        radiusKm: "km",
        locationSuccess: "Location found",
        locationDetected: "Located at",
        addressLoading: "Getting address...",
        addressError: "Address unavailable",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        enterAddress: "Enter address to correct location",
        locateHere: "🕔 Locate here",
        home: "Home",
        office: "Office",
        saveText: "Save",
        // 餐廳資訊
        viewRoute: "View Route & Navigation",
        viewWebsite: "View Website",
        address: "Address",
        phone: "Phone",
        businessHours: "Business Hours",
        openingIn: "Opening in",
        hours: "hours"
      },
      zh: {
        title: "吃這家",
        spinButton: "想吃什麼？",
        addCandidate: "加入候選",
        nextBatch: "換一批",
        spinning: "正在搜尋...",
        locationError: "請允許位置訪問以獲取附近餐廳。",
        locationLoading: "正在獲取您的位置...",
        relocateButton: "重新定位",
        spinErrorPrefix: "錯誤：",
        apiSearching: "正在搜索附近餐廳...",
        radiusLabel: "搜索範圍：",
        radiusKm: "公里",
        locationSuccess: "定位成功",
        locationDetected: "當前位置",
        addressLoading: "正在獲取地址...",
        addressError: "地址無法取得",
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
        enterAddress: "輸入地址來校正位置",
        locateHere: "🕔 定位到這裡",
        home: "住家",
        office: "公司",
        saveText: "儲存",
        // 餐廳資訊
        viewRoute: "查看路線與導航",
        viewWebsite: "查看網站",
        address: "地址",
        phone: "電話",
        businessHours: "營業時間",
        openingIn: "還有多久開業",
        hours: "小時"
      },
      ja: {
        title: "レストランルーレット",
        spinButton: "何を食べましょうか？",
        spinning: "レストランを探しています...",
        locationError: "近くのレストランを見つけるために位置情報へのアクセスを許可してください。",
        locationLoading: "位置情報を取得しています...",
        relocateButton: "再位置取得",
        spinErrorPrefix: "エラー：",
        apiSearching: "近くのレストランを検索しています...",
        radiusLabel: "検索範囲：",
        radiusKm: "km",
        locationSuccess: "位置情報取得成功",
        locationDetected: "現在地",
        addressLoading: "住所を取得しています...",
        addressError: "住所が取得できません",
        breakfast: "朝食",
        lunch: "昼食",
        dinner: "夕食",
        enterAddress: "住所を入力して位置を修正",
        locateHere: "🕔 ここに位置設定",
        home: "自宅",
        office: "オフィス",
        saveText: "保存",
        // 餐廳資訊
        viewRoute: "ルートとナビゲーション",
        viewWebsite: "ウェブサイトを見る",
        address: "住所",
        phone: "電話",
        businessHours: "営業時間",
        openingIn: "開業まで",
        hours: "時間"
      },
      ko: {
        title: "레스토랑 룰렛",
        spinButton: "무엇을 먹을까요?",
        spinning: "레스토랑을 찾고 있습니다...",
        locationError: "근처 레스토랑을 찾기 위해 위치 접근을 허용해주세요.",
        locationLoading: "위치를 가져오는 중...",
        relocateButton: "재위치",
        spinErrorPrefix: "오류: ",
        apiSearching: "근처 레스토랑을 검색 중...",
        radiusLabel: "검색 범위:",
        radiusKm: "km",
        locationSuccess: "위치 찾기 성공",
        locationDetected: "현재 위치",
        addressLoading: "주소를 가져오는 중...",
        addressError: "주소를 사용할 수 없음",
        breakfast: "아침식사",
        lunch: "점심식사",
        dinner: "저녁식사",
        enterAddress: "위치를 수정할 주소 입력",
        locateHere: "🕔 여기에 위치",
        home: "집",
        office: "사무실",
        saveText: "저장",
        // 餐廳資訊
        viewRoute: "경로 및 내비게이션 보기",
        viewWebsite: "웹사이트 보기",
        address: "주소",
        phone: "전화",
        businessHours: "영업시간",
        openingIn: "개업까지 남은 시간",
        hours: "시간"
      },
      es: {
        title: "Ruleta de Restaurantes",
        spinButton: "¿Qué comemos?",
        spinning: "Buscando tu restaurante...",
        locationError: "Por favor permite el acceso a la ubicación para encontrar restaurantes cercanos.",
        locationLoading: "Obteniendo tu ubicación...",
        relocateButton: "Relocalizar",
        spinErrorPrefix: "Error: ",
        apiSearching: "Buscando restaurantes cercanos...",
        radiusLabel: "Radio de búsqueda:",
        radiusKm: "km",
        locationSuccess: "Ubicación encontrada",
        locationDetected: "Ubicado en",
        addressLoading: "Obteniendo dirección...",
        addressError: "Dirección no disponible",
        breakfast: "Desayuno",
        lunch: "Almuerzo",
        dinner: "Cena",
        enterAddress: "Ingresa dirección para corregir ubicación",
        locateHere: "🕔 Ubicar aquí",
        home: "Casa",
        office: "Oficina",
        saveText: "Guardar",
        // 餐廳資訊
        viewRoute: "Ver Ruta y Navegación",
        viewWebsite: "Ver Sitio Web",
        address: "Dirección",
        phone: "Teléfono",
        businessHours: "Horario de Atención",
        openingIn: "Abre en",
        hours: "horas"
      },
      fr: {
        title: "Roulette de Restaurants",
        spinButton: "Que mangeons-nous ?",
        spinning: "Recherche de votre restaurant...",
        locationError: "Veuillez autoriser l'accès à la localisation pour trouver des restaurants à proximité.",
        locationLoading: "Obtention de votre position...",
        relocateButton: "Relocaliser",
        spinErrorPrefix: "Erreur : ",
        apiSearching: "Recherche de restaurants à proximité...",
        radiusLabel: "Rayon de recherche :",
        radiusKm: "km",
        locationSuccess: "Position trouvée",
        locationDetected: "Situé à",
        addressLoading: "Obtention de l'adresse...",
        addressError: "Adresse non disponible",
        breakfast: "Petit-déjeuner",
        lunch: "Déjeuner",
        dinner: "Dîner",
        enterAddress: "Entrez l'adresse pour corriger la position",
        locateHere: "🕔 Localiser ici",
        home: "Maison",
        office: "Bureau",
        saveText: "Sauvegarder",
        // 餐廳資訊
        viewRoute: "Voir Itinéraire et Navigation",
        viewWebsite: "Voir Site Web",
        address: "Adresse",
        phone: "Téléphone",
        businessHours: "Heures d'Ouverture",
        openingIn: "Ouvre dans",
        hours: "heures"
      }
    };

    const t = translations[selectedLanguage];

    // 載入已儲存的位置和上一次的定位
    React.useEffect(() => {
      const saved = localStorage.getItem('savedLocations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }
      
      // 載入上一次的定位
      const lastLocation = localStorage.getItem('lastKnownLocation');
      if (lastLocation) {
        setLastKnownLocation(JSON.parse(lastLocation));
      }
    }, []);

    React.useEffect(() => {
      getUserLocation();
    }, []);
    
    // 語言切換時重新獲取地址
    React.useEffect(() => {
      if (userLocation && locationStatus === 'success') {
        getAddressFromCoords(userLocation.lat, userLocation.lng);
      }
    }, [selectedLanguage]);

    // 語言切換時重新計算餐廳營業狀態
    React.useEffect(() => {
      if (currentRestaurant && currentRestaurant.operatingStatus && window.getBusinessStatus) {
        try {
          // 重新計算營業狀態以支援多國語言
          // 注意：這裡無法獲取到原始的 opening_hours 資料，所以只能更新訊息格式
          console.log('🌐 語言切換，重新計算營業狀態:', selectedLanguage);
          
          // 暫時保留原始狀態，理想情況下需要重新調用 getBusinessStatus
          // 但由於沒有 opening_hours 數據，先保持原狀
        } catch (error) {
          console.warn('⚠️ 重新計算營業狀態失敗:', error);
        }
      }
    }, [selectedLanguage, currentRestaurant]);

    // 搜索條件變化時清除餐廳歷史記錄
    React.useEffect(() => {
      if (window.clearRestaurantHistory && !isInitialLoad) {
        console.log('🔄 搜索條件變化，清除餐廳歷史記錄:', { selectedMealTime, searchRadius });
        window.clearRestaurantHistory();
      }
    }, [selectedMealTime, searchRadius]);
    
    // ===========================================
    // 工具函數區塊 (純函數，不依賴狀態)
    // ===========================================
    
    // 儲存位置到localStorage
    const saveLocationToStorage = (locations) => {
      localStorage.setItem('savedLocations', JSON.stringify(locations));
    };


    // ===========================================
    // UI 副作用區塊
    // ===========================================
    
    // 更新滑桿填充顏色
    React.useEffect(() => {
      const percentage = ((searchRadius - 1) / (20 - 1)) * 100;
      const sliders = document.querySelectorAll('.slider');
      sliders.forEach(slider => {
        slider.style.setProperty('--value', `${percentage}%`);
      });
    }, [searchRadius]);

    // ===========================================
    // 地址和定位服務函數區塊
    // ===========================================
    
    // 地址轉換為經緯度
    const geocodeAddress = async (address) => {
      setIsGeocodingAddress(true);
      try {
        const geocoder = new google.maps.Geocoder();
        
        return new Promise((resolve, reject) => {
          geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = results[0].geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng(),
                address: results[0].formatted_address
              });
            } else {
              reject(new Error('無法找到該地址'));
            }
          });
        });
      } catch (error) {
        throw error;
      } finally {
        setIsGeocodingAddress(false);
      }
    };

    // 確認地址校正
    const handleAddressConfirm = async () => {
      if (!addressInput.trim()) return;
      
      try {
        const result = await geocodeAddress(addressInput.trim());
        setUserLocation({ lat: result.lat, lng: result.lng });
        
        // 根據語言獲取地址並立即更新顯示
        const address = await window.getAddressFromCoordinates(result.lat, result.lng, selectedLanguage);
        setUserAddress(address);
        setLocationStatus('success');
        setShowAddressInput(false);
        setAddressInput('');
        console.log('✅ 地址校正成功:', result, '地址:', address);
      } catch (error) {
        console.error('❌ 地址校正失敗:', error);
        alert('無法找到該地址，請重新輸入');
      }
    };

    // 智能住家/公司按鈕處理 - 根據輸入框狀態決定行為
    const handleLocationButton = async (type) => {
      if (addressInput.trim()) {
        // 輸入框有內容時：儲存位置功能
        await saveLocationFromInput(type);
      } else {
        // 輸入框為空時：使用已儲存位置
        const savedLocation = savedLocations.find(loc => loc.type === type);
        if (savedLocation) {
          await useSavedLocation(savedLocation);
        }
      }
    };

    // 從輸入框儲存位置（新功能）
    const saveLocationFromInput = async (type) => {
      if (!addressInput.trim()) return;
      
      try {
        // 先將輸入地址轉為座標
        const result = await geocodeAddress(addressInput.trim());
        const coords = { lat: result.lat, lng: result.lng };
        
        // 獲取完整地址用於儲存
        const fullAddress = await window.getAddressFromCoordinates(coords.lat, coords.lng, selectedLanguage);
        
        const newLocation = {
          type: type,
          lat: coords.lat,
          lng: coords.lng,
          address: fullAddress,
          savedAt: new Date().toISOString()
        };
        
        const updatedLocations = savedLocations.filter(loc => loc.type !== type);
        updatedLocations.push(newLocation);
        
        setSavedLocations(updatedLocations);
        saveLocationToStorage(updatedLocations);
        
        // 立即更新當前定位到儲存的位置
        setUserLocation(coords);
        setUserAddress(fullAddress);
        setLocationStatus('success');
        setShowAddressInput(false);
        setAddressInput('');
        
        console.log('✅ 位置已儲存並更新定位:', newLocation, '地址:', fullAddress);
      } catch (error) {
        console.error('❌ 儲存位置失敗:', error);
        alert('無法儲存該地址，請重新輸入');
      }
    };

    // 使用已儲存的位置
    const useSavedLocation = async (location) => {
      console.log('🏠 切換到已儲存位置:', location.type, location);
      const newCoords = { lat: location.lat, lng: location.lng };
      setUserLocation(newCoords);
      console.log('🕔 userLocation 已更新為:', newCoords);
      
      // 使用完整地址顯示
      setUserAddress(location.address);
      setLocationStatus('success');
      setShowAddressInput(false);
      console.log('✅ 使用已儲存位置:', location, '地址:', location.address);
      
      // 添加小延遲確保狀態更新完成，然後檢查當前的userLocation
      setTimeout(() => {
        console.log('🔍 延遲檢查：當前userLocation狀態:', newCoords);
        console.log('🔍 React狀態是否已更新？比較原始座標:', {
          設定的座標: newCoords,
          實際狀態: userLocation
        });
      }, 100);
    };

    // 獲取地址資訊
    const getAddressFromCoords = async (lat, lng) => {
      try {
        if (window.getAddressFromCoordinates) {
          const address = await window.getAddressFromCoordinates(lat, lng, selectedLanguage);
          setUserAddress(address);
          
          // 初次載入時自動執行餐廳搜索 - 確保userLocation已設定
          if (isInitialLoad && userLocation) {
            setIsInitialLoad(false);
            console.log('🎯 初次載入，自動搜索餐廳...', { userLocation });
            setTimeout(() => {
              handleSpin();
            }, 500); // 延遲500ms確保UI已更新
          }
        }
      } catch (error) {
        console.error('獲取地址失敗:', error);
        setUserAddress(t('addressError'));
        // 即使地址獲取失敗，如果是初次載入也要嘗試搜索餐廳
        if (isInitialLoad && userLocation) {
          setIsInitialLoad(false);
          console.log('🎯 初次載入（地址失敗），仍自動搜索餐廳...', { userLocation });
          setTimeout(() => {
            handleSpin();
          }, 500);
        }
      }
    };

    const getUserLocation = () => {
      setLocationStatus('loading');
      setIsRelocating(true);
      setLocationError(null); // 清除之前的錯誤
      
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        handleLocationError('瀏覽器不支援定位功能');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // 儲存成功的定位到localStorage和狀態
          const locationData = {
            ...coords,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('lastKnownLocation', JSON.stringify(locationData));
          setLastKnownLocation(locationData);
          
          setUserLocation(coords);
          setLocationStatus('success');
          setIsRelocating(false);
          setLocationError(null);
          console.log('Location detected:', coords.lat, coords.lng);
          
          // 獲取地址資訊
          setUserAddress(translations[selectedLanguage]['addressLoading']);
          getAddressFromCoords(coords.lat, coords.lng);
        },
        (error) => {
          console.log('Location error:', error.message);
          
          // 嘗試使用上一次的定位
          if (lastKnownLocation) {
            console.log('使用上一次的定位:', lastKnownLocation);
            setUserLocation({ lat: lastKnownLocation.lat, lng: lastKnownLocation.lng });
            setLocationStatus('success');
            setUserAddress('使用上一次的位置');
            setIsRelocating(false);
            
            // 獲取地址資訊
            setTimeout(() => {
              getAddressFromCoords(lastKnownLocation.lat, lastKnownLocation.lng);
            }, 100);
          } else {
            // 沒有上一次的定位，顯示錯誤
            const errorDetails = {
              errorType: 'LocationError',
              errorMessage: '用戶位置不可用',
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              geolocationSupported: !!navigator.geolocation,
              errorCode: error.code,
              originalMessage: error.message
            };
            
            handleLocationError(`定位失敗。技術資訊: ${JSON.stringify(errorDetails)}`);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    };
    
    // 處理定位錯誤
    const handleLocationError = (errorMessage) => {
      setLocationStatus('error');
      setIsRelocating(false);
      setLocationError(errorMessage);
    };

    // ===========================================
    // 核心業務邏輯函數區塊
    // ===========================================
    
    const handleSpin = async () => {
      if (isSpinning) return;
      
      console.log('🎮 開始轉動輪盤...', { selectedMealTime });
      setIsSpinning(true);
      setCurrentRestaurant(null);
      setSpinError(null);

      try {
        // 先等待一段時間做視覺效果
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔍 開始搜索餐廳，用戶位置:', userLocation);
        
        // 更新搜索半徑
        if (window.updateSearchRadius) {
          window.updateSearchRadius(searchRadius * 1000); // 轉換為公尺
        }
        
        // 調用更新後的 getRandomRestaurant 函數（現在支援營業時間篩選）
        const restaurant = await window.getRandomRestaurant(userLocation, selectedMealTime);
        
        // 重新計算營業狀態以支援多國語言
        if (restaurant.operatingStatus && window.getBusinessStatus) {
          try {
            // 需要餐廳的 opening_hours 資料來重新計算
            // 暫時保留原始狀態，之後需要改進
            console.log('🌐 重新計算營業狀態支援語言:', selectedLanguage);
          } catch (error) {
            console.warn('⚠️ 重新計算營業狀態失敗:', error);
          }
        }
        
        console.log('✅ 成功獲取餐廳:', restaurant);
        setCurrentRestaurant(restaurant);
        
      } catch (error) {
        console.error('❌ 轉動輪盤時發生錯誤:', error);
        setSpinError(error.message);
      } finally {
        setIsSpinning(false);
      }
    };

    // 加入候選函數
    const handleAddCandidate = () => {
      if (currentRestaurant && candidateList.length < 9) {
        // 檢查是否已經在候選列表中
        const alreadyExists = candidateList.some(candidate => 
          candidate.id === currentRestaurant.id || candidate.name === currentRestaurant.name
        );
        
        if (!alreadyExists) {
          setCandidateList(prevList => [...prevList, currentRestaurant]);
        }
      }
    };

    // 清除候選列表函數
    const handleClearList = () => {
      setCandidateList([]);
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
            <LocationManager 
              locationStatus={locationStatus}
              userAddress={userAddress}
              showAddressInput={showAddressInput}
              setShowAddressInput={setShowAddressInput}
              savedLocations={savedLocations}
              addressInput={addressInput}
              setAddressInput={setAddressInput}
              isGeocodingAddress={isGeocodingAddress}
              onRelocate={getUserLocation}
              onAddressConfirm={handleAddressConfirm}
              onLocationButton={handleLocationButton}
              translations={t}
              isRelocating={isRelocating}
            />
            
            <SearchSettings 
              searchRadius={searchRadius}
              setSearchRadius={setSearchRadius}
              selectedMealTime={selectedMealTime}
              setSelectedMealTime={setSelectedMealTime}
              translations={t}
            />
          </div>

          {/* Slot Machine */}
          <div className="flex justify-center mb-8">
            <SlotMachine 
              isSpinning={isSpinning}
              onSpin={handleSpin}
              onAddCandidate={handleAddCandidate}
              translations={t}
              finalRestaurant={currentRestaurant}
              candidateList={candidateList}
              language={selectedLanguage}
              onClearList={handleClearList}
            />
          </div>

          {/* Restaurant Result */}
          {currentRestaurant && !isSpinning && !spinError && (
            <div className="mt-8">
              <RestaurantCard
                restaurant={currentRestaurant}
                language={selectedLanguage}
                userLocation={userLocation}
              />
            </div>
          )}

          <StatusMessages 
            locationStatus={locationStatus}
            spinError={spinError}
            locationError={locationError}
            translations={t}
          />
        </div>
        
        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-700">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
              <span>© 2025</span>
              <a 
                href="https://tribe.org.tw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--primary-color)] hover:text-[var(--secondary-color)] transition-colors duration-200 font-medium"
              >
                tribe.org.tw
              </a>
              <span>All rights reserved.</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Restaurant Roulette - Discover amazing food near you
            </div>
          </div>
        </footer>
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
