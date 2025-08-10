/**
 * 餐廳歷史記錄管理 Hook
 * 負責管理用戶瀏覽過的餐廳歷史記錄，包括新增、清除和回到上一家功能
 */
function useRestaurantHistory(currentRestaurant, searchParams, isInitialLoad) {
  const [restaurantHistory, setRestaurantHistory] = React.useState([]);
  const [previousLocation, setPreviousLocation] = React.useState(null);

  const { selectedMealTime, baseUnit, unitMultiplier, userLocation } = searchParams;

  // 只有用餐時段變化時才清除餐廳歷史記錄（搜尋半徑變化不清除）
  React.useEffect(() => {
    if (window.clearRestaurantHistory && !isInitialLoad) {
      console.log(`🔄 用餐時段變化，清除餐廳歷史記錄 (${selectedMealTime})`);
      window.clearRestaurantHistory();
      // 同時清除本地餐廳歷史記錄
      setRestaurantHistory([]);
    }
  }, [selectedMealTime, isInitialLoad]); // 🎯 移除 baseUnit, unitMultiplier 依賴

  // 位置變更時清除餐廳歷史記錄
  React.useEffect(() => {
    if (userLocation && !isInitialLoad) {
      let shouldClear = false;
      let reason = '';

      if (!previousLocation) {
        // 第一次GPS定位 = 用戶手動輸入位置 = 應該清除餐廳歷史
        shouldClear = true;
        reason = '首次定位完成';
      } else {
        // 計算兩個位置之間的距離
        const distance = calculateDistance(
          previousLocation.lat, previousLocation.lng,
          userLocation.lat, userLocation.lng
        );

        // 如果距離超過5公里，認為是有意義的地點變更，清除餐廳歷史
        if (distance > 5000) { // 5公里
          shouldClear = true;
          reason = `地點變更超過5km (${Math.round(distance/1000)}km)`;
        }
      }

      if (shouldClear) {
        console.log(`🔄 ${reason}，清除餐廳歷史記錄`);
        if (window.clearRestaurantHistory) {
          window.clearRestaurantHistory();
          setRestaurantHistory([]);
        }
      }
    }

    // 更新前一個位置
    if (userLocation) {
      setPreviousLocation(userLocation);
    }
  }, [userLocation, isInitialLoad]);

  // 當前餐廳變化時添加到歷史記錄
  React.useEffect(() => {
    if (currentRestaurant && currentRestaurant.id) {
      // 只在首次添加時顯示
      // console.log('📝 添加餐廳到歷史記錄:', currentRestaurant.name);
      setRestaurantHistory(prev => {
        // 檢查是否已存在相同餐廳，避免重複添加
        const exists = prev.some(restaurant => restaurant.id === currentRestaurant.id);
        if (exists) {
          console.log('⏭️ 餐廳已存在於歷史記錄中，跳過添加');
          return prev;
        }
        // 限制歷史記錄最多保存 10 家餐廳
        const newHistory = [...prev, currentRestaurant];
        if (newHistory.length > 10) {
          newHistory.shift(); // 移除最舊的記錄
        }
        return newHistory;
      });
    }
  }, [currentRestaurant]);

  // 回到上一家餐廳函數
  const handlePreviousRestaurant = React.useCallback(() => {
    if (restaurantHistory.length < 2) {
      console.log('🔙 沒有足夠的歷史記錄，無法回到上一家餐廳');
      return null;
    }

    // 取得上一家餐廳（倒數第二個）
    const previousRestaurant = restaurantHistory[restaurantHistory.length - 2];
    console.log('🔙 回到上一家餐廳:', previousRestaurant.name);

    // 移除歷史記錄中的最後一筆記錄（當前餐廳）
    setRestaurantHistory(prev => prev.slice(0, -1));
    
    return previousRestaurant;
  }, [restaurantHistory]);

  // 手動清除歷史記錄
  const clearHistory = React.useCallback(() => {
    setRestaurantHistory([]);
    if (window.clearRestaurantHistory) {
      window.clearRestaurantHistory();
    }
  }, []);

  return {
    restaurantHistory,
    handlePreviousRestaurant,
    clearHistory,
    hasHistory: restaurantHistory.length >= 2
  };
}

// 全局掛載 hook
window.useRestaurantHistory = useRestaurantHistory;
