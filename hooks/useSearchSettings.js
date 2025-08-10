/**
 * useSearchSettings Hook
 * 管理搜索設定相關狀態和邏輯的自定義 Hook
 * 提供安全的狀態管理和設定持久化
 * 
 * 安全特性:
 * - 獨立的狀態管理，避免全局變數衝突
 * - 完整的錯誤邊界和異常處理
 * - 安全的組件間通信機制
 * - 設定驗證和清理機制
 */

function useSearchSettings() {
  // Hook 唯一標識符，避免衝突
  const hookId = React.useMemo(() => `search-settings-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, []);
  
  // 組件掛載狀態，防止記憶體洩漏
  const isMountedRef = React.useRef(true);
  
  // 錯誤邊界狀態
  const [hookError, setHookError] = React.useState(null);
  const [isHookHealthy, setIsHookHealthy] = React.useState(true);

  // 用餐時段狀態
  const [selectedMealTime, setSelectedMealTime] = React.useState(() => {
    try {
      const saved = localStorage.getItem('selectedMealTime');
      return saved || 'all';
    } catch (error) {
      console.error('讀取用餐時段設定失敗:', error);
      return 'all';
    }
  });

  // 距離設定狀態
  const [baseUnit, setBaseUnit] = React.useState(() => {
    try {
      const saved = localStorage.getItem('baseUnit');
      return saved ? parseInt(saved, 10) : 1000;
    } catch (error) {
      console.error('讀取基礎單位設定失敗:', error);
      return 1000;
    }
  });

  const [unitMultiplier, setUnitMultiplier] = React.useState(() => {
    try {
      const saved = localStorage.getItem('unitMultiplier');
      return saved ? parseInt(saved, 10) : 3;
    } catch (error) {
      console.error('讀取距離倍數設定失敗:', error);
      return 3;
    }
  });

  // 設定歷史記錄
  const [settingsHistory, setSettingsHistory] = React.useState(() => {
    try {
      const saved = localStorage.getItem('settingsHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('讀取設定歷史失敗:', error);
      return [];
    }
  });

  // 錯誤狀態
  const [settingsError, setSettingsError] = React.useState(null);
  const [lastSettingsUpdate, setLastSettingsUpdate] = React.useState(null);

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

  // 用餐時段配置
  const mealTimeConfig = React.useMemo(() => {
    return window.getMealTimeConfig ? window.getMealTimeConfig() : {
      breakfast: { start: 5, end: 10, displayTime: '5-10', icon: '🌅' },
      lunch: { start: 10, end: 16, displayTime: '10-16', icon: '☀️' },
      dinner: { start: 16, end: 24, displayTime: '16-24', icon: '🌃' }
    };
  }, []);

  // 距離配置
  const distanceConfig = React.useMemo(() => {
    return {
      baseUnits: {
        200: { label: '200m', fullLabel: '200公尺模式', min: 1, max: 10 },
        1000: { label: '1km', fullLabel: '1公里模式', min: 1, max: 10 }
      },
      multiplierRange: { min: 1, max: 10 }
    };
  }, []);

  // 計算實際搜索距離
  const actualSearchRadius = React.useMemo(() => {
    return baseUnit * unitMultiplier;
  }, [baseUnit, unitMultiplier]);

  // 發送設定更新事件
  const emitSettingsUpdate = React.useCallback((type, data) => {
    try {
      emit(window.EVENT_TYPES?.[`${type.toUpperCase()}_CHANGED`] || `${type}-changed`, {
        ...data,
        timestamp: Date.now(),
        source: hookId
      });
    } catch (error) {
      console.error(`[${hookId}] 發送設定更新事件失敗:`, error);
    }
  }, [emit, hookId]);

  // 儲存設定到 localStorage
  const saveSettingsToStorage = React.useCallback((key, value) => {
    try {
      localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
      return true;
    } catch (error) {
      console.error(`儲存設定 ${key} 失敗:`, error);
      setSettingsError('無法儲存設定');
      return false;
    }
  }, []);

  // 記錄設定變更歷史
  const recordSettingsChange = React.useCallback((type, oldValue, newValue) => {
    if (!isMountedRef.current) return;
    
    try {
      const historyEntry = {
        id: Date.now(),
        type: type,
        oldValue: oldValue,
        newValue: newValue,
        timestamp: Date.now(),
        date: new Date().toISOString()
      };

      const updatedHistory = [historyEntry, ...settingsHistory].slice(0, 50);
      safeSetState(setSettingsHistory, updatedHistory, 'recordSettingsChange');
      saveSettingsToStorage('settingsHistory', updatedHistory);
    } catch (error) {
      console.error('記錄設定變更失敗:', error);
    }
  }, [settingsHistory, saveSettingsToStorage, safeSetState]);

  // 安全的用餐時段設定
  const handleMealTimeChange = React.useCallback((newMealTime) => {
    if (!newMealTime || typeof newMealTime !== 'string') {
      setSettingsError('無效的用餐時段設定');
      return false;
    }

    const validMealTimes = ['current', 'all', 'breakfast', 'lunch', 'dinner', 'custom'];
    if (!validMealTimes.includes(newMealTime)) {
      setSettingsError('不支援的用餐時段類型');
      return false;
    }

    try {
      const oldValue = selectedMealTime;
      safeSetState(setSelectedMealTime, newMealTime, 'handleMealTimeChange');
      saveSettingsToStorage('selectedMealTime', newMealTime);
      recordSettingsChange('mealTime', oldValue, newMealTime);
      safeSetState(setLastSettingsUpdate, new Date(), 'setLastSettingsUpdate');
      setSettingsError(null);

      // 發送事件
      emitSettingsUpdate('meal_time', { 
        oldValue, 
        newValue: newMealTime,
        actualSearchRadius 
      });

      // 觸覺回饋
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      return true;
    } catch (error) {
      console.error('設定用餐時段失敗:', error);
      setSettingsError('設定用餐時段失敗');
      return false;
    }
  }, [selectedMealTime, saveSettingsToStorage, recordSettingsChange, safeSetState, emitSettingsUpdate, actualSearchRadius]);

  // 安全的基礎單位設定
  const handleBaseUnitChange = React.useCallback((newBaseUnit) => {
    if (!newBaseUnit || typeof newBaseUnit !== 'number') {
      setSettingsError('無效的基礎單位設定');
      return false;
    }

    const validBaseUnits = Object.keys(distanceConfig.baseUnits).map(Number);
    if (!validBaseUnits.includes(newBaseUnit)) {
      setSettingsError('不支援的基礎單位');
      return false;
    }

    try {
      const oldValue = baseUnit;
      const currentActualDistance = actualSearchRadius;
      
      safeSetState(setBaseUnit, newBaseUnit, 'handleBaseUnitChange');
      saveSettingsToStorage('baseUnit', newBaseUnit);
      
      // 調整倍數以保持相近距離
      const newMultiplier = Math.round(currentActualDistance / newBaseUnit);
      const adjustedMultiplier = Math.max(1, Math.min(10, newMultiplier));
      
      if (adjustedMultiplier !== unitMultiplier) {
        safeSetState(setUnitMultiplier, adjustedMultiplier, 'adjustUnitMultiplier');
        saveSettingsToStorage('unitMultiplier', adjustedMultiplier);
      }

      recordSettingsChange('baseUnit', oldValue, newBaseUnit);
      safeSetState(setLastSettingsUpdate, new Date(), 'setLastSettingsUpdate');
      setSettingsError(null);

      // 發送事件
      emitSettingsUpdate('distance', { 
        type: 'baseUnit',
        oldValue, 
        newValue: newBaseUnit,
        actualSearchRadius: newBaseUnit * adjustedMultiplier
      });

      // 觸覺回饋
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }

      return true;
    } catch (error) {
      console.error('設定基礎單位失敗:', error);
      setSettingsError('設定基礎單位失敗');
      return false;
    }
  }, [baseUnit, unitMultiplier, actualSearchRadius, distanceConfig.baseUnits, saveSettingsToStorage, recordSettingsChange, safeSetState, emitSettingsUpdate]);

  // 安全的距離倍數設定
  const handleUnitMultiplierChange = React.useCallback((newMultiplier) => {
    if (!newMultiplier || typeof newMultiplier !== 'number') {
      setSettingsError('無效的距離倍數設定');
      return false;
    }

    const { min, max } = distanceConfig.multiplierRange;
    if (newMultiplier < min || newMultiplier > max) {
      setSettingsError(`距離倍數必須在 ${min} 到 ${max} 之間`);
      return false;
    }

    try {
      const oldValue = unitMultiplier;
      safeSetState(setUnitMultiplier, newMultiplier, 'handleUnitMultiplierChange');
      saveSettingsToStorage('unitMultiplier', newMultiplier);
      recordSettingsChange('unitMultiplier', oldValue, newMultiplier);
      safeSetState(setLastSettingsUpdate, new Date(), 'setLastSettingsUpdate');
      setSettingsError(null);

      // 發送事件
      emitSettingsUpdate('distance', { 
        type: 'multiplier',
        oldValue, 
        newValue: newMultiplier,
        actualSearchRadius: baseUnit * newMultiplier
      });

      // 觸覺回饋
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }

      return true;
    } catch (error) {
      console.error('設定距離倍數失敗:', error);
      setSettingsError('設定距離倍數失敗');
      return false;
    }
  }, [unitMultiplier, distanceConfig.multiplierRange, saveSettingsToStorage, recordSettingsChange, safeSetState, emitSettingsUpdate, baseUnit]);

  // Hook 健康檢查
  const performHealthCheck = React.useCallback(() => {
    try {
      // 檢查必要的 API
      const hasLocalStorage = typeof Storage !== 'undefined';
      const hasReact = typeof React !== 'undefined';
      const hasValidState = selectedMealTime && baseUnit && unitMultiplier;
      
      const isHealthy = hasLocalStorage && hasReact && hasValidState;
      
      if (!isHealthy) {
        const missingFeatures = [];
        if (!hasLocalStorage) missingFeatures.push('LocalStorage');
        if (!hasReact) missingFeatures.push('React');
        if (!hasValidState) missingFeatures.push('Valid State');
        
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
  }, [hookId, selectedMealTime, baseUnit, unitMultiplier]);

  // 包裝操作以提供錯誤處理
  const wrapOperation = React.useCallback((operation, context = '') => {
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
        console.error(`[${hookId}] 操作失敗 (${context}):`, error);
        setHookError(`${context}: ${error.message}`);
        return null;
      }
    };
  }, [hookId, isHookHealthy]);

  // 獲取距離顯示文字
  const getDistanceDisplayText = React.useCallback(() => {
    const actualMeters = actualSearchRadius;
    if (actualMeters >= 1000) {
      return `${actualMeters / 1000}km`;
    } else {
      return `${actualMeters}m`;
    }
  }, [actualSearchRadius]);

  // 獲取用餐時段顯示文字
  const getMealTimeDisplayText = React.useCallback((translations) => {
    const mealTimeLabels = {
      current: translations?.openNowFilter || '現在營業',
      all: translations?.anyTime || '任何時間',
      breakfast: translations?.breakfast || '早餐',
      lunch: translations?.lunch || '午餐',
      dinner: translations?.dinner || '晚餐',
      custom: translations?.customTime || '自訂時間'
    };
    return mealTimeLabels[selectedMealTime] || selectedMealTime;
  }, [selectedMealTime]);

  // 獲取用餐時段圖標
  const getMealTimeIcon = React.useCallback(() => {
    const iconMap = {
      current: '🕐',
      all: '🌐',
      breakfast: mealTimeConfig.breakfast.icon,
      lunch: mealTimeConfig.lunch.icon,
      dinner: mealTimeConfig.dinner.icon,
      custom: '⚙️'
    };
    return iconMap[selectedMealTime] || '🍽️';
  }, [selectedMealTime, mealTimeConfig]);

  // 重置設定到預設值
  const resetSettings = wrapOperation(() => {
    const defaultSettings = {
      selectedMealTime: 'all',
      baseUnit: 1000,
      unitMultiplier: 3
    };

    safeSetState(setSelectedMealTime, defaultSettings.selectedMealTime, 'resetSelectedMealTime');
    safeSetState(setBaseUnit, defaultSettings.baseUnit, 'resetBaseUnit');
    safeSetState(setUnitMultiplier, defaultSettings.unitMultiplier, 'resetUnitMultiplier');

    // 儲存到 localStorage
    Object.entries(defaultSettings).forEach(([key, value]) => {
      saveSettingsToStorage(key, value);
    });

    recordSettingsChange('reset', 'custom', 'default');
    safeSetState(setLastSettingsUpdate, new Date(), 'resetLastUpdate');
    setSettingsError(null);

    // 發送事件
    emitSettingsUpdate('settings', { type: 'reset', settings: defaultSettings });

    // 觸覺回饋
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    return true;
  }, 'resetSettings');

  // 清除錯誤
  const clearError = React.useCallback(() => {
    setSettingsError(null);
    setHookError(null);
  }, []);

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

  // 檢查設定是否為預設值
  const isDefaultSettings = React.useMemo(() => {
    return selectedMealTime === 'all' && baseUnit === 1000 && unitMultiplier === 3;
  }, [selectedMealTime, baseUnit, unitMultiplier]);

  // 返回狀態和方法
  return {
    // Hook 元數據
    hookId,
    isHookHealthy,
    hookError,
    
    // 狀態
    selectedMealTime,
    baseUnit,
    unitMultiplier,
    actualSearchRadius,
    settingsHistory,
    settingsError,
    lastSettingsUpdate,
    isDefaultSettings,

    // 配置
    mealTimeConfig,
    distanceConfig,

    // 安全包裝的方法
    setSelectedMealTime: handleMealTimeChange,
    setBaseUnit: handleBaseUnitChange,
    setUnitMultiplier: handleUnitMultiplierChange,
    resetSettings,
    clearError,

    // 便捷方法
    getDistanceDisplayText,
    getMealTimeDisplayText,
    getMealTimeIcon,
    
    // 健康檢查和診斷
    performHealthCheck,
    
    // 事件發送方法
    emitSettingsUpdate
  };
}

// 導出 Hook
if (typeof window !== 'undefined') {
  window.useSearchSettings = useSearchSettings;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = useSearchSettings;
}