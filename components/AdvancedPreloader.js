// components/AdvancedPreloader.js
// 🎯 從舊版本提取的9個方向預載入模組 - 已驗證可行的代碼

/**
 * 創建智能預載入池管理器 - 直接從舊版本SlotMachine.js提取
 * @param {Object} params - 參數對象
 * @returns {Object} 預載入池管理器
 */
function createAdvancedPreloader({ selectedMealTime, userLocation }) {
  
  /**
   * 圖片預載入函數 - 整合預載入池 (從舊版本直接複製)
   */
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;

      // 設置超時，避免無限等待
      setTimeout(() => {
        reject(new Error('圖片載入超時'));
      }, 5000);
    });
  };

  /**
   * 預載入池管理 - 從舊版本直接複製，保持原有邏輯，但讓圖片攜帶餐廳信息
   */
  const managePreloadPool = async (currentRestaurant, restaurantHistory = [], setPreloadedImages, setAvailableRestaurantsCount) => {
    try {
      // 獲取可用餐廳（異步）
      const cachedRestaurants = window.getAvailableRestaurantsFromCache ?
        await window.getAvailableRestaurantsFromCache(selectedMealTime) : [];

      setPreloadedImages(prevPool => {
        const newPool = new Map();

        // 動態預載入範圍：基於可用餐廳數量，上限200家
        const allRestaurants = [...restaurantHistory, currentRestaurant].filter(Boolean);
        const currentIndex = allRestaurants.length - 1; // 當前餐廳在歷史的最後

        // 計算總可用餐廳數量
        const totalAvailableCount = cachedRestaurants.filter(cached => {
          return !allRestaurants.some(existing => existing.id === cached.id);
        }).length;

        // 動態計算預載入範圍：智能調整
        const minRange = 21;
        const defaultRangeWhenEmpty = 50; // 當快取為空時使用較大的默認範圍

        let maxRange;
        if (totalAvailableCount === 0) {
          // 快取為空時（如搜索條件變化），使用較大的默認範圍為新餐廳預留空間
          maxRange = Math.min(defaultRangeWhenEmpty, 200);
          // RR_UI_082: 快取為空使用默認範圍
          window.RRLog?.debug('RR_UI_UPDATE', '快取為空，使用默認預載入範圍', {
            maxRange
          });
        } else {
          // 有可用餐廳時，基於實際數量動態調整
          maxRange = Math.min(Math.max(totalAvailableCount + allRestaurants.length, minRange), 200);
        }
        const halfRange = Math.floor(maxRange / 2);

        // 🎯 關鍵：計算預載入池中實際可用的未來餐廳數量
        let availableFutureRestaurants = 0;

        // 動態預載入範圍：前N家（歷史）+ 當前 + 後N家（候補）
        let skippedNegativeCount = 0;
        for (let offset = -halfRange; offset <= halfRange; offset++) {
          const index = currentIndex + offset;

          // 跳過負數索引（統計數量）
          if (index < 0) {
            skippedNegativeCount++;
            continue;
          }

          let restaurant = null;
          let isAvailable = false;

          if (index < allRestaurants.length) {
            // 從歷史中獲取
            restaurant = allRestaurants[index];
            isAvailable = false; // 歷史餐廳不算可用
          } else {
            // 從快取中獲取候補餐廳
            const futureIndex = index - allRestaurants.length;

            // 過濾掉已顯示過的餐廳
            const availableCandidates = cachedRestaurants.filter(cached => {
              return !allRestaurants.some(existing => existing.id === cached.id);
            });

            if (futureIndex < availableCandidates.length) {
              restaurant = availableCandidates[futureIndex];
              isAvailable = true; // 未來餐廳算可用
              availableFutureRestaurants++;
            }
          }

          if (restaurant?.image) {
            const url = restaurant.image;

            // 保持原有的預載入池結構，但值包含餐廳信息
            if (prevPool.has(url)) {
              // 更新餐廳可用狀態
              const existingItem = prevPool.get(url);
              newPool.set(url, {
                ...existingItem,
                restaurant: restaurant,
                isAvailable: isAvailable
              });
            } else {
              // 創建新的預載入項目
              const poolItem = {
                imageObject: null, // 將異步載入
                restaurant: restaurant,
                isAvailable: isAvailable
              };
              newPool.set(url, poolItem);

              // 異步預載入圖片，保持原有邏輯
              preloadImage(url).then(img => {
                setPreloadedImages(current => {
                  const updated = new Map(current);
                  if (updated.has(url)) {
                    updated.set(url, {
                      ...updated.get(url),
                      imageObject: img
                    });
                  }
                  return updated;
                });
              }).catch(error => {
                // RR_UI_063: 預載入失敗
                window.RRLog?.debug('RR_UI_ERROR', '預載入失敗', {
                  restaurant: restaurant.name,
                  error: error.message
                });
                // 載入失敗時使用 fallback 圖片
                const fallbackUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                preloadImage(fallbackUrl).then(fallbackImg => {
                  setPreloadedImages(current => {
                    const updated = new Map(current);
                    if (updated.has(url)) {
                      updated.set(url, {
                        ...updated.get(url),
                        imageObject: fallbackImg
                      });
                    }
                    return updated;
                  });
                }).catch(() => {
                  // RR_UI_064: Fallback圖片載入失敗
                  window.RRLog?.warn('RR_UI_ERROR', 'Fallback圖片載入失敗', {
                    restaurant: restaurant.name
                  });
                });
              });
            }
          }
        }

        // 🎯 關鍵修復：基於預載入池的實際可用餐廳數量觸發幕後補充
        const BACKGROUND_REFILL_THRESHOLD = 9; // 預載入池剩餘9家時觸發幕後補充

        // 添加防重複觸發機制
        if (!window.backgroundRefillInProgress) {
          window.backgroundRefillInProgress = false;
        }
        const currentTime = Date.now();
        const lastBackgroundRefillTime = window.lastBackgroundRefillTime || 0;

        if (availableFutureRestaurants <= BACKGROUND_REFILL_THRESHOLD && userLocation && !window.backgroundRefillInProgress && (currentTime - lastBackgroundRefillTime > 5000)) {
          // RR_UI_083: 預載入池不足警告
          window.RRLog?.info('RR_UI_UPDATE', '預載入池不足警告，觸發幕後補充', {
            remainingRestaurants: availableFutureRestaurants,
            threshold: BACKGROUND_REFILL_THRESHOLD,
            userLocationExists: !!userLocation,
            timeSinceLastRefill: currentTime - lastBackgroundRefillTime
          });

          // 標記正在進行幕後補充
          window.backgroundRefillInProgress = true;
          window.lastBackgroundRefillTime = currentTime;

          // 幕後觸發API搜索，不影響用戶體驗，不觸發老虎機
          setTimeout(async () => {
            try {
              if (window.getRandomRestaurant) {
                // RR_UI_084: 開始幕後補充餐廳
                window.RRLog?.debug('RR_UI_UPDATE', '開始幕後補充餐廳', {
                  expandedRange: '2km',
                  backgroundRefill: true
                });
                await window.getRandomRestaurant(userLocation, selectedMealTime, {
                  baseUnit: 1000,
                  unitMultiplier: 2,
                  backgroundRefill: true // 標記為幕後補充，不觸發老虎機
                });
                // RR_UI_085: 幕後餐廳補充完成
                window.RRLog?.debug('RR_UI_UPDATE', '幕後餐廳補充完成');
              }
            } catch (error) {
              // RR_UI_086: 幕後餐廳補充失敗
              window.RRLog?.warn('RR_UI_ERROR', '幕後餐廳補充失敗', { error: error.message });
            } finally {
              // 清除進行中標記
              window.backgroundRefillInProgress = false;
            }
          }, 100); // 延遲100ms執行，避免阻塞UI
        } else if (availableFutureRestaurants <= BACKGROUND_REFILL_THRESHOLD) {
          // 記錄為什麼沒有觸發
          window.RRLog?.debug('RR_UI_UPDATE', '幕後補充條件檢查', {
            availableFutureRestaurants,
            threshold: BACKGROUND_REFILL_THRESHOLD,
            userLocationExists: !!userLocation,
            backgroundRefillInProgress: window.backgroundRefillInProgress,
            timeSinceLastRefill: currentTime - lastBackgroundRefillTime,
            reason: !userLocation ? '缺少用戶位置' : 
                   window.backgroundRefillInProgress ? '已在進行中' : 
                   (currentTime - lastBackgroundRefillTime <= 5000) ? '時間間隔不足' : '未知'
          });
        }

        // RR_UI_072: 預載入池狀態更新
        const successfullyLoadedCount = Array.from(newPool.values())
          .filter(item => item.isLoaded)
          .length;
        window.RRLog?.debug('RR_UI_UPDATE', '界面更新: 預載入池狀態更新', {
          預載入池大小: newPool.size,
          有效快取餐廳: successfullyLoadedCount,
          搜尋範圍: maxRange,
          半徑範圍: halfRange,
          剩餘可用餐廳: availableFutureRestaurants,
          當前餐廳: currentRestaurant?.name || '無餐廳',
          跳過負索引: skippedNegativeCount
        });

        // 🎯 更新預載入池中有效的餐廳數量
        setAvailableRestaurantsCount({ 
          available: availableFutureRestaurants, 
          total: newPool.size 
        });

        return newPool;
      });

    } catch (error) {
      // RR_UI_065: 預載入池管理失敗
      window.RRLog?.warn('RR_UI_ERROR', '預載入池管理失敗', { error: error.message });
    }
  };

  /**
   * 初始預載入：完全套用測試檔成功經驗 - 先載下一張，完成後載5張池 (從舊版本直接複製)
   */
  const initializePreloading = async (finalRestaurant, restaurantHistory, managePreloadPoolCallback) => {
    // RR_UI_071: 初始化預載入
    window.RRLog?.debug('RR_UI_UPDATE', '初始化預載入');

    // 1. 先預載下一張（還沒顯示的下一張餐廳）
    let nextRestaurant = null;
    if (window.getAvailableRestaurantsFromCache && selectedMealTime) {
      const cachedRestaurants = window.getAvailableRestaurantsFromCache(selectedMealTime);

      // 找到第一個還沒顯示過的餐廳（排除當前餐廳）
      const availableNext = cachedRestaurants.filter(cached => {
        if (finalRestaurant) {
          return cached.id !== finalRestaurant.id;
        }
        return true;
      });

      if (availableNext.length > 0) {
        nextRestaurant = availableNext[0];
      }
    }

    if (nextRestaurant?.image) {
      try {
        // RR_UI_067: 開始預載下一張圖片
        window.RRLog?.debug('RR_UI_UPDATE', '開始預載下一張圖片', {
          restaurant: nextRestaurant.name
        });
        await preloadImage(nextRestaurant.image);
        // RR_UI_068: 下一張圖片預載完成
        window.RRLog?.debug('RR_UI_UPDATE', '下一張圖片預載完成', {
          restaurant: nextRestaurant.name
        });
      } catch (error) {
        // RR_UI_069: 下一張圖片預載失敗
        window.RRLog?.debug('RR_UI_ERROR', '下一張圖片預載失敗', {
          restaurant: nextRestaurant.name,
          error: error.message
        });
      }
    }

    // 2. 下一張完成後，立刻預載5張池
    // RR_UI_070: 開始預載圖片池
    window.RRLog?.debug('RR_UI_UPDATE', '下一張完成，開始預載圖片池');
    if (finalRestaurant) {
      managePreloadPoolCallback(finalRestaurant, restaurantHistory);
    } else if (nextRestaurant) {
      // 如果沒有當前餐廳，以下一張餐廳為基準
      managePreloadPoolCallback(nextRestaurant, []);
    }
  };

  return {
    managePreloadPool,
    initializePreloading,
    preloadImage
  };
}

// 註冊到全局變數
window.createAdvancedPreloader = createAdvancedPreloader;
