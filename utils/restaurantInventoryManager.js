// 餐廳庫存管理系統 - 後台持續抓取機制
// 保持5筆符合當前時間的餐廳庫存，當庫存不足時自動補充

class RestaurantInventoryManager {
  constructor() {
    this.inventory = []; // 當前庫存
    this.minInventory = 5; // 最小庫存量
    this.batchSize = 20; // 每次抓取數量
    this.isRefilling = false; // 防止重複抓取
    this.userLocation = null;
    this.currentMealTime = 'current';
    
    // 綁定到window供外部調用
    window.restaurantInventory = this;
  }

  // 初始化庫存管理
  async initialize(userLocation, selectedMealTime = 'current') {
    this.userLocation = userLocation;
    this.currentMealTime = selectedMealTime;
    
    console.log('🏪 初始化餐廳庫存管理...', { userLocation, selectedMealTime });
    
    try {
      await this.refillInventory();
      console.log('✅ 庫存管理初始化完成，當前庫存:', this.inventory.length);
    } catch (error) {
      console.error('❌ 庫存管理初始化失敗:', error);
    }
  }

  // 補充庫存
  async refillInventory() {
    if (this.isRefilling || !this.userLocation) {
      return;
    }

    this.isRefilling = true;
    console.log('🔄 開始補充餐廳庫存...');

    try {
      // 獲取新的餐廳列表
      const newRestaurants = await window.searchNearbyRestaurants(
        this.userLocation, 
        this.currentMealTime
      );

      // 篩選符合當前時間的餐廳且不在現有庫存中
      const existingIds = this.inventory.map(r => r.id);
      const validRestaurants = newRestaurants.filter(restaurant => {
        const isOpen = this.isRestaurantValidForCurrentTime(restaurant);
        const isNew = !existingIds.includes(restaurant.id);
        return isOpen && isNew;
      });

      // 添加到庫存
      this.inventory.push(...validRestaurants);
      
      // 限制庫存總量，保持最新的
      if (this.inventory.length > this.batchSize) {
        this.inventory = this.inventory.slice(-this.batchSize);
      }

      console.log(`✅ 庫存補充完成，新增 ${validRestaurants.length} 家，當前庫存: ${this.inventory.length}`);
      
    } catch (error) {
      console.error('❌ 庫存補充失敗:', error);
    } finally {
      this.isRefilling = false;
    }
  }

  // 檢查餐廳是否符合當前時間要求
  isRestaurantValidForCurrentTime(restaurant) {
    if (this.currentMealTime === 'all') {
      return true;
    }
    
    if (this.currentMealTime === 'current') {
      // 檢查當前是否營業
      const openingHours = restaurant.detailsCache?.opening_hours;
      if (!openingHours) return true; // 無法確定時預設可用
      
      return window.isRestaurantOpenForMealTime(openingHours, 'current');
    }
    
    // 其他時段檢查
    return window.isRestaurantOpenInTimeSlot(restaurant, this.currentMealTime);
  }

  // 獲取下一個餐廳
  async getNextRestaurant() {
    // 檢查庫存是否需要補充
    if (this.inventory.length < this.minInventory && !this.isRefilling) {
      // 非阻塞式補充庫存
      this.refillInventory().catch(error => {
        console.warn('⚠️ 後台庫存補充失敗:', error);
      });
    }

    // 過濾出仍然符合當前時間的餐廳
    const validRestaurants = this.inventory.filter(restaurant => 
      this.isRestaurantValidForCurrentTime(restaurant)
    );

    if (validRestaurants.length === 0) {
      // 庫存為空，立即嘗試補充
      console.log('⚠️ 庫存為空，立即補充...');
      await this.refillInventory();
      
      const newValidRestaurants = this.inventory.filter(restaurant => 
        this.isRestaurantValidForCurrentTime(restaurant)
      );
      
      if (newValidRestaurants.length === 0) {
        throw new Error('無法找到符合條件的餐廳');
      }
      
      return this.selectRandomRestaurant(newValidRestaurants);
    }

    return this.selectRandomRestaurant(validRestaurants);
  }

  // 隨機選擇餐廳並從庫存中移除
  selectRandomRestaurant(restaurants) {
    const randomIndex = Math.floor(Math.random() * restaurants.length);
    const selectedRestaurant = restaurants[randomIndex];
    
    // 從庫存中移除已選擇的餐廳
    this.inventory = this.inventory.filter(r => r.id !== selectedRestaurant.id);
    
    console.log(`🎯 選中餐廳: ${selectedRestaurant.name}，剩餘庫存: ${this.inventory.length}`);
    
    return selectedRestaurant;
  }

  // 更新搜索條件
  updateSearchConditions(userLocation, selectedMealTime) {
    const conditionsChanged = 
      this.userLocation?.lat !== userLocation?.lat ||
      this.userLocation?.lng !== userLocation?.lng ||
      this.currentMealTime !== selectedMealTime;
    
    if (conditionsChanged) {
      console.log('🔄 搜索條件變化，清空庫存重新載入...');
      this.inventory = [];
      this.userLocation = userLocation;
      this.currentMealTime = selectedMealTime;
      
      // 異步重新初始化
      if (userLocation) {
        this.refillInventory().catch(error => {
          console.warn('⚠️ 重新載入庫存失敗:', error);
        });
      }
    }
  }

  // 獲取庫存狀態
  getInventoryStatus() {
    const validCount = this.inventory.filter(restaurant => 
      this.isRestaurantValidForCurrentTime(restaurant)
    ).length;
    
    return {
      total: this.inventory.length,
      valid: validCount,
      needsRefill: validCount < this.minInventory,
      isRefilling: this.isRefilling
    };
  }
}

// 創建全局實例
window.restaurantInventoryManager = new RestaurantInventoryManager();

// 簡化的餐廳獲取函數，使用庫存管理
window.getRandomRestaurantFromInventory = async function(userLocation, selectedMealTime = 'current') {
  try {
    const manager = window.restaurantInventoryManager;
    
    // 更新搜索條件
    manager.updateSearchConditions(userLocation, selectedMealTime);
    
    // 如果是第一次或庫存為空，先初始化
    if (manager.inventory.length === 0) {
      await manager.initialize(userLocation, selectedMealTime);
    }
    
    // 獲取餐廳
    const restaurant = await manager.getNextRestaurant();
    
    // 添加距離信息
    if (userLocation) {
      restaurant.distance = window.calculateDistance(
        userLocation.lat, userLocation.lng,
        restaurant.lat, restaurant.lng
      );
    }
    
    return restaurant;
    
  } catch (error) {
    console.error('❌ 從庫存獲取餐廳失敗，回退到原始方法:', error);
    // 回退到原始方法
    return window.getRandomRestaurant(userLocation, selectedMealTime);
  }
};

console.log('🏪 餐廳庫存管理系統已載入');