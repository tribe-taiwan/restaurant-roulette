/**
 * 餐廳歷史記錄管理 Hook
 * 負責管理用戶瀏覽過的餐廳歷史記錄，包括新增、清除和回到上一家功能
 */
function useRestaurantHistory(currentRestaurant, searchParams, isInitialLoad) {
  const [restaurantHistory, setRestaurantHistory] = React.useState([]);
  
  const { selectedMealTime, baseUnit, unitMultiplier, userLocation } = searchParams;

  // 搜索條件變化時清除餐廳歷史記錄
  React.useEffect(() => {
    if (window.clearRestaurantHistory && !isInitialLoad) {
      const actualRadius = baseUnit * unitMultiplier;
      console.log(`🔄 搜索條件變化，清除餐廳歷史記錄 (${selectedMealTime}, ${actualRadius}m)`);
      window.clearRestaurantHistory();
      // 同時清除本地餐廳歷史記錄
      setRestaurantHistory([]);
    }
  }, [selectedMealTime, baseUnit, unitMultiplier, userLocation, isInitialLoad]);

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