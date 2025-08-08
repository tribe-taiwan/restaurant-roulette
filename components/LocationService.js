// 位置服務模組 - 從 app.js 拆分出來  
// 處理地址轉換、定位管理、已儲存位置等核心位置服務功能

/**
 * 位置服務管理器
 * 提供地址轉換、GPS定位、位置儲存等核心功能
 */
function createLocationService() {
  
  /**
   * 地址轉換為經緯度
   * @param {string} address - 要轉換的地址
   * @returns {Promise<{lat: number, lng: number, address: string}>} 
   */
  const geocodeAddress = async (address) => {
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
    }
  };

  /**
   * 確認地址校正
   * @param {string} addressInput - 輸入的地址
   * @param {string} selectedLanguage - 當前語言
   * @param {function} callbacks - 回調函數集合
   */
  const handleAddressConfirm = async (addressInput, selectedLanguage, callbacks) => {
    if (!addressInput.trim()) return;
    
    const { setUserLocation, setUserAddress, setLocationStatus, setAddressInput } = callbacks;
    
    try {
      const result = await geocodeAddress(addressInput.trim());
      setUserLocation({ lat: result.lat, lng: result.lng });
      
      // 根據語言獲取地址並立即更新顯示
      const address = await window.getAddressFromCoordinates(result.lat, result.lng, selectedLanguage);
      setUserAddress(address);
      setLocationStatus('success');
      setAddressInput('');
      console.log('✅ 地址校正成功:', result, '地址:', address);
    } catch (error) {
      console.error('❌ 地址校正失敗:', error);
      alert('無法找到該地址，請重新輸入');
    }
  };

  /**
   * 智能住家/公司按鈕處理 - 根據輸入框狀態決定行為
   * @param {string} type - 位置類型 ('home', 'office', 'homebase')
   * @param {object|null} customLocation - 自定義位置（民宿位置）
   * @param {string} addressInput - 當前地址輸入
   * @param {array} savedLocations - 已儲存位置列表
   * @param {object} translations - 翻譯對象
   * @param {object} callbacks - 回調函數集合
   */
  const handleLocationButton = async (type, customLocation, addressInput, savedLocations, translations, callbacks) => {
    const { setUserLocation, setUserAddress, setLocationStatus } = callbacks;
    
    // 處理民宿位置的特殊情況
    if (type === 'homebase' && customLocation) {
      console.log('🏠 使用民宿作為起點位置:', customLocation);
      setUserLocation({ lat: customLocation.lat, lng: customLocation.lng });
      setUserAddress(customLocation.address);
      setLocationStatus('success');
      return;
    }

    if (addressInput.trim()) {
      // 輸入框有內容時：儲存位置功能
      await saveLocationFromInput(type, addressInput, savedLocations, callbacks);
    } else {
      // 輸入框為空時：使用已儲存位置
      const savedLocation = savedLocations.find(loc => loc.type === type);
      if (savedLocation) {
        await useSavedLocation(savedLocation, callbacks);
      } else {
        // 沒有保存過相應地址，顯示提示
        const message = type === 'home' ? translations.pleaseEnterHomeAddress : translations.pleaseEnterOfficeAddress;
        alert(message);
      }
    }
  };

  /**
   * 從輸入框儲存位置
   * @param {string} type - 位置類型
   * @param {string} addressInput - 地址輸入
   * @param {array} savedLocations - 現有已儲存位置
   * @param {object} callbacks - 回調函數集合
   */
  const saveLocationFromInput = async (type, addressInput, savedLocations, callbacks) => {
    if (!addressInput.trim()) return;
    
    const { 
      setUserLocation, 
      setUserAddress, 
      setLocationStatus, 
      setAddressInput, 
      setSavedLocations, 
      saveLocationToStorage,
      selectedLanguage 
    } = callbacks;
    
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
      setAddressInput('');
      
      console.log('✅ 位置已儲存並更新定位:', newLocation, '地址:', fullAddress);
    } catch (error) {
      console.error('❌ 儲存位置失敗:', error);
      alert('無法儲存該地址，請重新輸入');
    }
  };

  /**
   * 使用已儲存的位置
   * @param {object} location - 已儲存的位置對象
   * @param {object} callbacks - 回調函數集合
   */
  const useSavedLocation = async (location, callbacks) => {
    const { setUserLocation, setUserAddress, setLocationStatus, userLocation } = callbacks;
    
    console.log('🏠 切換到已儲存位置:', location.type, location);
    const newCoords = { lat: location.lat, lng: location.lng };
    setUserLocation(newCoords);
    console.log('🕔 userLocation 已更新為:', newCoords);
    
    // 使用完整地址顯示
    setUserAddress(location.address);
    setLocationStatus('success');
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

  /**
   * 獲取地址資訊
   * @param {number} lat - 緯度
   * @param {number} lng - 經度
   * @param {string} selectedLanguage - 當前語言
   * @param {object} callbacks - 回調函數集合
   * @param {object} translations - 翻譯對象
   */
  const getAddressFromCoords = async (lat, lng, selectedLanguage, callbacks, translations) => {
    const { setUserAddress, isInitialLoad, setIsInitialLoad, handleSpin, userLocation } = callbacks;
    
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
      setUserAddress(translations?.addressError || '地址錯誤');
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

  /**
   * 獲取用戶位置
   * @param {object} callbacks - 回調函數集合
   * @param {object} translations - 翻譯對象
   * @param {object|null} lastKnownLocation - 上次已知位置
   */
  const getUserLocation = (callbacks, translations, lastKnownLocation) => {
    const { 
      setLocationStatus, 
      setIsRelocating, 
      setLocationError, 
      setUserLocation, 
      setUserAddress,
      setLastKnownLocation,
      selectedLanguage,
      handleLocationError
    } = callbacks;
    
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
        getAddressFromCoords(coords.lat, coords.lng, selectedLanguage, callbacks, translations);
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
            getAddressFromCoords(lastKnownLocation.lat, lastKnownLocation.lng, selectedLanguage, callbacks, translations);
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

  /**
   * 處理定位錯誤
   * @param {string} errorMessage - 錯誤訊息
   * @param {object} callbacks - 回調函數集合
   */
  const handleLocationError = (errorMessage, callbacks) => {
    const { setLocationStatus, setIsRelocating, setLocationError } = callbacks;
    setLocationStatus('error');
    setIsRelocating(false);
    setLocationError(errorMessage);
  };

  // 返回所有位置服務函數
  return {
    geocodeAddress,
    handleAddressConfirm,
    handleLocationButton,
    saveLocationFromInput,
    useSavedLocation,
    getAddressFromCoords,
    getUserLocation,
    handleLocationError
  };
}

// 導出位置服務供其他模組使用
window.createLocationService = createLocationService;