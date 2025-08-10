/**
 * useLocationManager Hook
 * 管理位置相關狀態和邏輯的自定義 Hook
 * 提供安全的狀態管理和組件間通信
 * 
 * 安全特性:
 * - 獨立的狀態管理，避免全局變數衝突
 * - 完整的錯誤邊界和異常處理
 * - 安全的組件間通信機制
 * - 記憶體洩漏防護
 */

function useLocationManager() {
  // Hook 唯一標識符，避免衝突
  const hookId = React.useMemo(() => `location-manager-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, []);
  
  // 組件掛載狀態，防止記憶體洩漏
  const isMountedRef = React.useRef(true);
  
  // 錯誤邊界狀態
  const [hookError, setHookError] = React.useState(null);
  const [isHookHealthy, setIsHookHealthy] = React.useState(true);
  // 位置狀態管理
  const [locationStatus, setLocationStatus] = React.useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [userLocation, setUserLocation] = React.useState(null);
  const [userAddress, setUserAddress] = React.useState('');
  const [addressInput, setAddressInput] = React.useState('');
  const [isRelocating, setIsRelocating] = React.useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = React.useState(false);
  
  // 儲存的位置（住家/公司）
  const [savedLocations, setSavedLocations] = React.useState(() => {
    try {
      const saved = localStorage.getItem('savedLocations');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('讀取儲存位置失敗:', error);
      return [];
    }
  });

  // 錯誤狀態管理
  const [locationError, setLocationError] = React.useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = React.useState(null);

  // 位置服務可用性檢查
  const isGeolocationAvailable = React.useMemo(() => {
    return 'geolocation' in navigator;
  }, []);

  // 儲存位置到 localStorage
  const saveLocationsToStorage = React.useCallback((locations) => {
    try {
      localStorage.setItem('savedLocations', JSON.stringify(locations));
    } catch (error) {
      console.error('儲存位置失敗:', error);
      setLocationError('無法儲存位置資訊');
    }
  }, []);

  // 獲取當前位置
  const getCurrentLocation = React.useCallback(async () => {
    if (!isGeolocationAvailable) {
      setLocationError('此設備不支援地理位置服務');
      setLocationStatus('error');
      return null;
    }

    setIsRelocating(true);
    setLocationStatus('loading');
    setLocationError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5分鐘快取
        };

        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

      setUserLocation(location);
      setLocationStatus('success');
      setLastLocationUpdate(new Date());

      // 反向地理編碼獲取地址
      await reverseGeocode(location);

      return location;
    } catch (error) {
      console.error('獲取位置失敗:', error);
      
      let errorMessage = '無法獲取您的位置';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '位置權限被拒絕，請在瀏覽器設定中允許位置存取';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '位置資訊無法取得';
          break;
        case error.TIMEOUT:
          errorMessage = '位置請求逾時，請重試';
          break;
        default:
          errorMessage = `位置服務錯誤: ${error.message}`;
      }

      setLocationError(errorMessage);
      setLocationStatus('error');
      return null;
    } finally {
      setIsRelocating(false);
    }
  }, [isGeolocationAvailable]);

  // 反向地理編碼
  const reverseGeocode = React.useCallback(async (location) => {
    try {
      // 這裡可以整合實際的地理編碼服務
      // 目前使用模擬實現
      const mockAddress = `緯度 ${location.latitude.toFixed(4)}, 經度 ${location.longitude.toFixed(4)}`;
      setUserAddress(mockAddress);
      return mockAddress;
    } catch (error) {
      console.error('反向地理編碼失敗:', error);
      setUserAddress('無法獲取地址資訊');
      return null;
    }
  }, []);

  // 地址地理編碼
  const geocodeAddress = React.useCallback(async (address) => {
    if (!address.trim()) {
      setLocationError('請輸入有效的地址');
      return null;
    }

    setIsGeocodingAddress(true);
    setLocationError(null);

    try {
      // 這裡可以整合實際的地理編碼服務
      // 目前使用模擬實現
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬 API 延遲

      const mockLocation = {
        latitude: 22.9908 + (Math.random() - 0.5) * 0.01,
        longitude: 120.2133 + (Math.random() - 0.5) * 0.01,
        accuracy: 100,
        timestamp: Date.now(),
        source: 'geocoded'
      };

      setUserLocation(mockLocation);
      setUserAddress(address);
      setLocationStatus('success');
      setLastLocationUpdate(new Date());

      return mockLocation;
    } catch (error) {
      console.error('地址地理編碼失敗:', error);
      setLocationError('無法解析該地址，請檢查地址是否正確');
      return null;
    } finally {
      setIsGeocodingAddress(false);
    }
  }, []);

  // 儲存快速位置（住家/公司）
  const saveQuickLocation = React.useCallback((type, location, address) => {
    if (!location || !address) {
      setLocationError('無法儲存位置：缺少位置或地址資訊');
      return false;
    }

    try {
      const newLocation = {
        id: `${type}_${Date.now()}`,
        type: type, // 'home' 或 'office'
        name: type === 'home' ? '住家' : '公司',
        address: address,
        location: location,
        savedAt: Date.now()
      };

      // 移除同類型的舊位置
      const updatedLocations = savedLocations.filter(loc => loc.type !== type);
      updatedLocations.push(newLocation);

      setSavedLocations(updatedLocations);
      saveLocationsToStorage(updatedLocations);

      return true;
    } catch (error) {
      console.error('儲存快速位置失敗:', error);
      setLocationError('儲存位置失敗');
      return false;
    }
  }, [savedLocations, saveLocationsToStorage]);

  // 使用快速位置
  const useQuickLocation = React.useCallback((type) => {
    const quickLocation = savedLocations.find(loc => loc.type === type);
    
    if (!quickLocation) {
      setLocationError(`尚未設定${type === 'home' ? '住家' : '公司'}位置`);
      return false;
    }

    try {
      setUserLocation(quickLocation.location);
      setUserAddress(quickLocation.address);
      setAddressInput(quickLocation.address);
      setLocationStatus('success');
      setLastLocationUpdate(new Date());
      setLocationError(null);

      return true;
    } catch (error) {
      console.error('使用快速位置失敗:', error);
      setLocationError('載入儲存位置失敗');
      return false;
    }
  }, [savedLocations]);

  // 處理位置按鈕點擊
  const handleLocationButton = React.useCallback(async (type) => {
    const hasCurrentLocation = userLocation && addressInput.trim();
    const existingLocation = savedLocations.find(loc => loc.type === type);

    if (hasCurrentLocation && (!existingLocation || addressInput !== existingLocation.address)) {
      // 儲存新位置
      const success = saveQuickLocation(type, userLocation, addressInput);
      if (success) {
        // 觸覺回饋
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    } else if (existingLocation) {
      // 使用現有位置
      useQuickLocation(type);
    } else {
      setLocationError(`請先設定位置後再儲存為${type === 'home' ? '住家' : '公司'}`);
    }
  }, [userLocation, addressInput, savedLocations, saveQuickLocation, useQuickLocation]);

  // 處理地址確認
  const handleAddressConfirm = React.useCallback(async () => {
    if (!addressInput.trim()) {
      setLocationError('請輸入地址');
      return;
    }

    const location = await geocodeAddress(addressInput);
    if (location) {
      // 觸覺回饋
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    }
  }, [addressInput, geocodeAddress]);

  // 清除錯誤
  const clearError = React.useCallback(() => {
    setLocationError(null);
  }, []);

  // 重置位置狀態
  const resetLocation = React.useCallback(() => {
    setUserLocation(null);
    setUserAddress('');
    setAddressInput('');
    setLocationStatus('idle');
    setLocationError(null);
    setIsRelocating(false);
    setIsGeocodingAddress(false);
  }, []);

  // 檢查位置是否過期（超過30分鐘）
  const isLocationStale = React.useMemo(() => {
    if (!userLocation || !userLocation.timestamp) return false;
    const thirtyMinutes = 30 * 60 * 1000;
    return Date.now() - userLocation.timestamp > thirtyMinutes;
  }, [userLocation]);

  // 自動重新定位（如果位置過期）
  React.useEffect(() => {
    if (isLocationStale && locationStatus === 'success') {
      console.log('位置資訊已過期，建議重新定位');
      // 可以在這裡添加自動重新定位邏輯
    }
  }, [isLocationStale, locationStatus]);

  // 安全的狀態更新函數
  const safeSetState = React.useCallback((setter, value, errorContext = '') => {
    if (!isMountedRef.current) {
      console.warn(`[${hookId}] 嘗試在組件卸載後更新狀態: ${errorContext}`);
      return false;
    }
    
    try {
      setter(value);
      return true;
    } catch (error) {
      console.error(`[${hookId}] 狀態更新失敗 (${errorContext}):`, error);
      setHookError(`狀態更新失敗: ${error.message}`);
      setIsHookHealthy(false);
      return false;
    }
  }, [hookId]);

  // 組件間通信
  const { emit, subscribe } = window.useComponentCommunication ? window.useComponentCommunication() : {
    emit: () => console.warn('ComponentCommunication 未載入'),
    subscribe: () => () => {}
  };

  // 發送位置更新事件
  const emitLocationUpdate = React.useCallback((location, address) => {
    try {
      emit(window.EVENT_TYPES?.LOCATION_UPDATED || 'location-updated', {
        location,
        address,
        timestamp: Date.now(),
        source: hookId
      });
    } catch (error) {
      console.error(`[${hookId}] 發送位置更新事件失敗:`, error);
    }
  }, [emit, hookId]);

  // 發送錯誤事件
  const emitLocationError = React.useCallback((error, context = '') => {
    try {
      emit(window.EVENT_TYPES?.LOCATION_ERROR || 'location-error', {
        error: error.message || error,
        context,
        timestamp: Date.now(),
        source: hookId
      });
    } catch (emitError) {
      console.error(`[${hookId}] 發送錯誤事件失敗:`, emitError);
    }
  }, [emit, hookId]);

  // Hook 健康檢查
  const performHealthCheck = React.useCallback(() => {
    try {
      // 檢查必要的 API
      const hasGeolocation = 'geolocation' in navigator;
      const hasLocalStorage = typeof Storage !== 'undefined';
      const hasReact = typeof React !== 'undefined';
      
      const isHealthy = hasGeolocation && hasLocalStorage && hasReact;
      
      if (!isHealthy) {
        const missingFeatures = [];
        if (!hasGeolocation) missingFeatures.push('Geolocation API');
        if (!hasLocalStorage) missingFeatures.push('LocalStorage');
        if (!hasReact) missingFeatures.push('React');
        
        throw new Error(`缺少必要功能: ${missingFeatures.join(', ')}`);
      }
      
      setIsHookHealthy(true);
      setHookError(null);
      return true;
    } catch (error) {
      console.error(`[${hookId}] 健康檢查失敗:`, error);
      setIsHookHealthy(false);
      setHookError(error.message);
      return false;
    }
  }, [hookId]);

  // 初始化健康檢查
  React.useEffect(() => {
    performHealthCheck();
  }, [performHealthCheck]);

  // 清理函數
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      console.log(`[${hookId}] Hook 已清理`);
    };
  }, [hookId]);

  // 包裝所有異步操作以提供錯誤處理
  const wrapAsyncOperation = React.useCallback((operation, context = '') => {
    return async (...args) => {
      if (!isMountedRef.current) {
        console.warn(`[${hookId}] 嘗試在組件卸載後執行操作: ${context}`);
        return null;
      }

      if (!isHookHealthy) {
        console.warn(`[${hookId}] Hook 不健康，跳過操作: ${context}`);
        return null;
      }

      try {
        return await operation(...args);
      } catch (error) {
        console.error(`[${hookId}] 異步操作失敗 (${context}):`, error);
        emitLocationError(error, context);
        setHookError(`${context}: ${error.message}`);
        return null;
      }
    };
  }, [hookId, isHookHealthy, emitLocationError]);

  // 包裝同步操作
  const wrapSyncOperation = React.useCallback((operation, context = '') => {
    return (...args) => {
      if (!isMountedRef.current) {
        console.warn(`[${hookId}] 嘗試在組件卸載後執行操作: ${context}`);
        return null;
      }

      if (!isHookHealthy) {
        console.warn(`[${hookId}] Hook 不健康，跳過操作: ${context}`);
        return null;
      }

      try {
        return operation(...args);
      } catch (error) {
        console.error(`[${hookId}] 同步操作失敗 (${context}):`, error);
        emitLocationError(error, context);
        setHookError(`${context}: ${error.message}`);
        return null;
      }
    };
  }, [hookId, isHookHealthy, emitLocationError]);

  // 返回狀態和方法
  return {
    // Hook 元數據
    hookId,
    isHookHealthy,
    hookError,
    
    // 狀態
    locationStatus,
    userLocation,
    userAddress,
    addressInput,
    setAddressInput: (value) => safeSetState(setAddressInput, value, 'setAddressInput'),
    isRelocating,
    isGeocodingAddress,
    savedLocations,
    locationError,
    lastLocationUpdate,
    isGeolocationAvailable,
    isLocationStale,

    // 安全包裝的方法
    getCurrentLocation: wrapAsyncOperation(getCurrentLocation, 'getCurrentLocation'),
    geocodeAddress: wrapAsyncOperation(geocodeAddress, 'geocodeAddress'),
    handleLocationButton: wrapAsyncOperation(handleLocationButton, 'handleLocationButton'),
    handleAddressConfirm: wrapAsyncOperation(handleAddressConfirm, 'handleAddressConfirm'),
    saveQuickLocation: wrapSyncOperation(saveQuickLocation, 'saveQuickLocation'),
    useQuickLocation: wrapSyncOperation(useQuickLocation, 'useQuickLocation'),
    clearError: wrapSyncOperation(clearError, 'clearError'),
    resetLocation: wrapSyncOperation(resetLocation, 'resetLocation'),

    // 便捷方法
    onRelocate: wrapAsyncOperation(getCurrentLocation, 'onRelocate'),
    onAddressConfirm: wrapAsyncOperation(handleAddressConfirm, 'onAddressConfirm'),
    onLocationButton: wrapAsyncOperation(handleLocationButton, 'onLocationButton'),
    
    // 健康檢查和診斷
    performHealthCheck,
    
    // 事件發送方法
    emitLocationUpdate,
    emitLocationError
  };
}

// 導出 Hook
if (typeof window !== 'undefined') {
  window.useLocationManager = useLocationManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = useLocationManager;
}