function SlotMachine({ isSpinning, onSpin, onAddCandidate, translations, finalRestaurant, candidateList = [], language, onClearList, onImageClick, userLocation, userAddress, onPreviousRestaurant, onTriggerSlideTransition, restaurantHistory = [], selectedMealTime }) {
  try {
    // 🎬 滑動動畫配置中心 - 集中管理所有滑動動畫參數
    const getSlideAnimationConfig = React.useCallback(() => {
      // 動畫時間分配：前70%慢速移動10%距離，後30%加速完成90%距離
      const slowPhasePercent = 60;     // 慢速階段佔總時間的百分比
      const slowMoveDistance = 5;     // 慢速階段移動的距離百分比
      const totalDuration = 700;       // 總動畫時間(ms)
      
      // 計算關鍵幀參數
      const slowPhaseEnd = slowPhasePercent; // 70%時間點
      const slowDistanceEnd = slowMoveDistance; // 10%距離點
      
      // 生成 CSS keyframes 字符串
      const generateKeyframes = (animationName, startPos, slowEndPos, finalPos) => `
        @keyframes ${animationName} {
          0% { transform: translateX(${startPos}%); }
          ${slowPhaseEnd}% { transform: translateX(${slowEndPos}%); }
          100% { transform: translateX(${finalPos}%); }
        }
      `;
      
      // 動態生成所有動畫的 keyframes
      const keyframes = [
        generateKeyframes('slideOutToLeft', 0, -slowDistanceEnd, -100),
        generateKeyframes('slideOutToRight', 0, slowDistanceEnd, 100),
        generateKeyframes('slideInFromRight', 100, 100-slowDistanceEnd, 0),
        generateKeyframes('slideInFromLeft', -100, -100+slowDistanceEnd, 0),
        // 🎯 添加元素淡出動畫 - 柔和漸隱
        `@keyframes fadeOutSlide {
          0% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(0.98); 
          }
          100% { 
            opacity: 0; 
            transform: scale(0.95); 
          }
        }`
      ].join('\n');
      
      // 自訂 cubic-bezier 曲線，實現前慢後快效果
      const timingFunction = 'cubic-bezier(0.05, 0, 0.2, 1)';
      
      return {
        duration: totalDuration,
        timingFunction,
        keyframes,
        slowPhasePercent,
        slowMoveDistance
      };
    }, []);

    // 應用動畫配置到 DOM
    const applySlideAnimationStyles = React.useCallback(() => {
      const config = getSlideAnimationConfig();
      
      // 移除舊的動畫樣式
      const oldStyle = document.getElementById('custom-slide-animation');
      if (oldStyle) {
        oldStyle.remove();
      }
      
      // 創建新的動畫樣式
      const style = document.createElement('style');
      style.id = 'custom-slide-animation';
      style.textContent = config.keyframes;
      document.head.appendChild(style);
      
      console.log(`🎬 滑動動畫配置已更新: 前${config.slowPhasePercent}%時間移動${config.slowMoveDistance}%距離`);
      
      return config;
    }, [getSlideAnimationConfig]);
    const [scrollingNames, setScrollingNames] = React.useState([]);
    const [animationPhase, setAnimationPhase] = React.useState('idle'); // idle, fast, slow
    const [apiWaitingLevel, setApiWaitingLevel] = React.useState(1); // 1-5 API等待動畫級別
    const [apiWaitingSequenceCache, setApiWaitingSequenceCache] = React.useState([]); // 預先準備的API等待動畫序列
    const [touchStart, setTouchStart] = React.useState(null);
    const [touchEnd, setTouchEnd] = React.useState(null);

    // 滑動轉場狀態
    const [isSliding, setIsSliding] = React.useState(false);
    const [currentImage, setCurrentImage] = React.useState(null);
    const [nextImage, setNextImage] = React.useState(null);
    const [slideDirection, setSlideDirection] = React.useState('left');
    const [isPreloading, setIsPreloading] = React.useState(false);

    // 預載入池管理
    const [preloadedImages, setPreloadedImages] = React.useState(new Map());
    const [availableRestaurantsCount, setAvailableRestaurantsCount] = React.useState(0);
    
    // 動畫配置狀態
    const [animationConfig, setAnimationConfig] = React.useState(null);

    // 使用共用的價位標籤
    const priceLabels = window.getPriceLabels();
    
    // 使用共用的星級顯示邏輯
    const renderStars = (rating) => {
      const stars = window.renderStars(rating);
      if (!stars) return null;
      
      return (
        <>
          {stars.map(star => (
            <span key={star.key} className={star.className}>{star.symbol}</span>
          ))}
        </>
      );
    };

    // 使用共用的導航URL生成函數
    const getDirectionsUrl = (restaurant) => {
      return window.getDirectionsUrl(restaurant, userLocation, userAddress, language);
    };

    // 圖片預載入函數 - 整合預載入池
    const preloadImage = (url) => {
      return new Promise((resolve, reject) => {
        if (!url) {
          resolve(null);
          return;
        }

        // 檢查是否已經預載入
        if (preloadedImages.has(url)) {
          resolve(preloadedImages.get(url));
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

    // 預載入池管理 - 保持原有邏輯，但讓圖片攜帶餐廳信息
    const managePreloadPool = React.useCallback(async (currentRestaurant, restaurantHistory = []) => {
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
            console.log(`🔄 快取為空，使用默認預載入範圍: ${maxRange}家`);
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
                  console.warn(`❌ 預載入失敗 (${restaurant.name}):`, error.message);
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
                    console.warn(`❌ Fallback 圖片也載入失敗 (${restaurant.name})`);
                  });
                });
              }
            }
          }

          // 🎯 關鍵修復：基於預載入池的實際可用餐廳數量觸發幕後補充
          const BACKGROUND_REFILL_THRESHOLD = 10; // 預載入池剩餘10家時觸發幕後補充

          if (availableFutureRestaurants <= BACKGROUND_REFILL_THRESHOLD && availableFutureRestaurants > 0 && userLocation) {
            console.log(`🔔 預載入池不足警告: 剩餘${availableFutureRestaurants}家可用餐廳，觸發幕後補充`);

            // 幕後觸發API搜索，不影響用戶體驗，不觸發老虎機
            setTimeout(async () => {
              try {
                if (window.getRandomRestaurant) {
                  console.log('🔄 開始幕後補充餐廳...');
                  await window.getRandomRestaurant(userLocation, selectedMealTime, {
                    baseUnit: 1000,
                    unitMultiplier: 2,
                    backgroundRefill: true // 標記為幕後補充，不觸發老虎機
                  });
                  console.log('✅ 幕後餐廳補充完成');
                }
              } catch (error) {
                console.warn('⚠️ 幕後餐廳補充失敗:', error.message);
              }
            }, 200); // 延遲200ms執行，避免阻塞UI
          }

          // 顯示動態預載入池狀態
          const skipMsg = skippedNegativeCount > 0 ? `，跳過${skippedNegativeCount}個負數索引` : '';
          console.log(`🔄 預載入池: ${newPool.size}張圖片，範圍${maxRange}家(±${halfRange})，可用${availableFutureRestaurants}家 (${currentRestaurant?.name || '無餐廳'})${skipMsg}`);

          // 🎯 更新可用餐廳數量狀態
          setAvailableRestaurantsCount(availableFutureRestaurants);

          return newPool;
        });

      } catch (error) {
        console.warn('❌ 預載入池管理失敗:', error.message);
      }
    }, [selectedMealTime, userLocation]);

    // 保存當前餐廳資料用於滑動轉場
    const [currentRestaurantData, setCurrentRestaurantData] = React.useState(null);
    const [nextRestaurantData, setNextRestaurantData] = React.useState(null);

    // 滑動轉場函數
    const triggerSlideTransition = React.useCallback((previousRestaurant, newRestaurant, direction = 'left', onComplete = null) => {
      // 🔄 保留滑動轉場的關鍵LOG，因為這是我們最近在偵錯的功能
      console.log('🔄 [SlotMachine] 滑動轉場觸發:', newRestaurant?.name);

      // 🛡️ 協調機制：防止動畫衝突
      if (isSliding) {
        console.log('❌ [SlotMachine] 滑動轉場被阻止: 已在滑動中');
        return;
      }

      if (isSpinning) {
        console.log('❌ [SlotMachine] 滑動轉場被阻止: 輪盤動畫進行中');
        return;
      }

      const getCurrentImageUrl = () => {
        if (finalRestaurant && finalRestaurant.image) return finalRestaurant.image;
        return null;
      };

      const getNewImageUrl = () => {
        if (newRestaurant && newRestaurant.image) return newRestaurant.image;
        return null;
      };

      const currentImg = getCurrentImageUrl();
      const newImg = getNewImageUrl();

      // 檢查新圖片是否已預載入，必要時緊急預載入
      if (newImg && !preloadedImages.has(newImg)) {
        // 緊急預載入，但不等待
        preloadImage(newImg).catch(error => {
          console.warn('❌ 緊急預載入失敗:', error.message);
        });
      }

      // 💡 保存當前和新餐廳資料，實現正確的滑動轉場
      setCurrentRestaurantData(finalRestaurant);  // 原餐廳跟著原圖滑出
      setNextRestaurantData(newRestaurant);        // 新餐廳跟著新圖滑入
      setCurrentImage(currentImg);
      setNextImage(newImg);
      setSlideDirection(direction);
      setIsSliding(true);

      // 使用動態配置的動畫時間
      const currentConfig = getSlideAnimationConfig();
      setTimeout(() => {
        setIsSliding(false);
        setCurrentImage(null);
        setNextImage(null);
        setCurrentRestaurantData(null); // 清除保存的餐廳資料
        setNextRestaurantData(null);

        // 調用完成回調
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
      }, currentConfig.duration);
    }, [finalRestaurant, isSliding, isSpinning, preloadedImages, getSlideAnimationConfig]);

    // 初始化動畫配置
    React.useEffect(() => {
      const config = applySlideAnimationStyles();
      setAnimationConfig(config);
    }, []); // 只在組件載入時執行一次

    // 初始預載入：完全套用測試檔成功經驗 - 先載下一張，完成後載5張池
    React.useEffect(() => {
      const initializePreloading = async () => {
        console.log('🚀 初始化預載入...');

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
            console.log(`⏳ [SlotMachine] 開始預載下一張: ${nextRestaurant.name}`);
            await preloadImage(nextRestaurant.image);
            console.log(`✅ [SlotMachine] 下一張圖片預載完成: ${nextRestaurant.name}`);
          } catch (error) {
            console.log(`❌ [SlotMachine] 下一張圖片預載失敗: ${nextRestaurant.name}`, error);
          }
        }

        // 2. 下一張完成後，立刻預載5張池
        console.log('🔄 [SlotMachine] 下一張完成，開始預載5張池...');
        if (finalRestaurant) {
          managePreloadPool(finalRestaurant, restaurantHistory);
        } else if (nextRestaurant) {
          // 如果沒有當前餐廳，以下一張餐廳為基準
          managePreloadPool(nextRestaurant, []);
        }
      };

      initializePreloading();
    }, []); // 只在組件載入時執行一次

    // 監聽立即餐廳變更事件 - 套用測試檔成功邏輯
    React.useEffect(() => {
      const handleRestaurantChanged = async (event) => {
        const { restaurant, history } = event.detail;
        console.log('🎯 [SlotMachine] 立即響應餐廳變更:', restaurant.name);

        // 立即管理預載入池 - 異步處理
        await managePreloadPool(restaurant, history);
      };

      window.addEventListener('restaurantChanged', handleRestaurantChanged);

      return () => {
        window.removeEventListener('restaurantChanged', handleRestaurantChanged);
      };
    }, [managePreloadPool]);

    // 餐廳變更時管理預載入池 - 作為備用
    React.useEffect(() => {
      if (finalRestaurant) {
        // 餐廳變更備用處理（靜默）
        
        // 備用預載入池管理
        managePreloadPool(finalRestaurant, restaurantHistory);
      }
    }, [finalRestaurant, restaurantHistory, managePreloadPool]);

    // 預載入池變更時的簡化日誌
    React.useEffect(() => {
      if (preloadedImages.size > 0) {
        console.log(`📊 預載入池: ${preloadedImages.size}張圖片已就緒`);
      }
    }, [preloadedImages.size]); // 只在大小變更時觸發

    // 儲存上一個餐廳的引用，用於滑動轉場時的圖片比較
    const previousRestaurant = React.useRef(finalRestaurant);

    // 暴露滑動轉場函數給父組件
    React.useEffect(() => {
      if (onTriggerSlideTransition) {
        onTriggerSlideTransition(triggerSlideTransition);
      }
    }, [triggerSlideTransition, onTriggerSlideTransition]);

    // 🎯 動態偵測圖片數量 - 自動適應資料夾中的圖片
    const [slotImages, setSlotImages] = React.useState([
      "./assets/image/slot-machine/slot (1).jpg",
      "./assets/image/slot-machine/slot (2).jpg",
      "./assets/image/slot-machine/slot (3).jpg",
      "./assets/image/slot-machine/slot (4).jpg",
      "./assets/image/slot-machine/slot (5).jpg",
      "./assets/image/slot-machine/slot (6).jpg",
      "./assets/image/slot-machine/slot (7).jpg",
      "./assets/image/slot-machine/slot (8).jpg",
      "./assets/image/slot-machine/slot (9).jpg",
      "./assets/image/slot-machine/slot (10).jpg",
      "./assets/image/slot-machine/slot (11).jpg",
      "./assets/image/slot-machine/slot (12).jpg",
      "./assets/image/slot-machine/slot (13).jpg",
      "./assets/image/slot-machine/slot (14).jpg",
      "./assets/image/slot-machine/slot (15).jpg",
      "./assets/image/slot-machine/slot (16).jpg",
      "./assets/image/slot-machine/slot (17).jpg",
      "./assets/image/slot-machine/slot (18).jpg",
      "./assets/image/slot-machine/slot (19).jpg",
      "./assets/image/slot-machine/slot (20).jpg",
      "./assets/image/slot-machine/slot (21).jpg",
      "./assets/image/slot-machine/slot (22).jpg"
    ]);

    // 自動偵測可用的slot圖片數量 - 支援多種格式且無數量限制
    const autoDetectSlotImages = React.useCallback(async () => {
      const basePath = './assets/image/slot-machine';
      const detectedImages = [];
      const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      console.log('🔍 開始自動偵測slot圖片數量（支援多種格式）...');
      
      let i = 1;
      while (true) {
        let imageFound = false;
        
        // 嘗試每種副檔名
        for (const ext of extensions) {
          const imagePath = `${basePath}/slot (${i})${ext}`;

          try {
            // 使用 Image 物件靜默檢查圖片，完全不會在 console 顯示 404
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = imagePath;
            });

            detectedImages.push(imagePath);
            imageFound = true;
            break; // 找到就跳出副檔名迴圈
          } catch (error) {
            // 繼續嘗試下一個副檔名
          }
        }
        
        if (!imageFound) {
          console.log(`🏁 偵測完成，共找到 ${detectedImages.length} 張圖片 (slot (1) ~ slot (${detectedImages.length}))`);
          break; // 沒找到任何格式的圖片，停止搜尋
        }
        
        i++;
        
        // 安全上限，避免無限迴圈
        if (i > 100) {
          console.warn('⚠️ 達到圖片搜尋上限100張，停止搜尋');
          break;
        }
      }
      
      console.log(`✅ 成功載入 ${detectedImages.length} 張slot圖片，支援格式: ${extensions.join(', ')}`);
      return detectedImages;
    }, []);

    // 🎯 動態生成CSS動畫 - 修改為固定每張顯示時間的模式
    const createDynamicAnimation = React.useCallback((imageCount, timePerImage = 0.3) => {
      const itemWidth = 256; // 每張圖片寬度（w-64 = 256px）

      // 🎯 使用原來的邏輯：slot圖片 + 前2張 + 餐廳圖片（保持相同效果）
      const totalImages = imageCount + 2 + 1;
      const finalPosition = (totalImages - 1) * itemWidth; // 停在最後一張（餐廳圖片）

      // 保持原來的70%位置計算方式
      const midPosition = Math.floor((totalImages - 3) * itemWidth);

      // 🎯 新的動畫時間計算：每張圖片固定顯示時間
      const apiWaitingTotalDuration = timePerImage * imageCount * 5; // slot_apiWaiting模式總時間（增加循環時間）
      const apiReceivedTotalDuration = timePerImage * totalImages; // slot_apiReceived模式總時間
      
      // 🎯 API等待動畫：移動所有slot圖片的距離，讓用戶看到所有圖片
      const apiWaitingScrollDistance = imageCount * itemWidth;

      console.log(`🎯 動畫參數: ${imageCount}張圖，每張${timePerImage}s，apiWaiting總時間${apiWaitingTotalDuration}s，apiReceived總時間${apiReceivedTotalDuration}s`);

      // 動態創建CSS keyframes - 使用GPU加速的transform3d
      const keyframes = `
        @keyframes scrollApiWaitingDynamic {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-${apiWaitingScrollDistance}px, 0, 0);
          }
        }

        @keyframes scrollApiReceivedStopDynamic {
          0% {
            transform: translate3d(0, 0, 0);
            animation-timing-function: ease-out;
          }
          70% {
            transform: translate3d(-${midPosition}px, 0, 0);
            animation-timing-function: ease-in;
          }
          100% {
            transform: translate3d(-${finalPosition}px, 0, 0);
          }
        }
        
        /* API等待動畫 - 使用新的時間計算 */
        .animate-scroll-api-waiting-dynamic-1 { animation: scrollApiWaitingDynamic ${(apiWaitingTotalDuration * 0.8).toFixed(2)}s linear infinite; }
        .animate-scroll-api-waiting-dynamic-2 { animation: scrollApiWaitingDynamic ${(apiWaitingTotalDuration * 1.0).toFixed(2)}s linear infinite; }
        .animate-scroll-api-waiting-dynamic-3 { animation: scrollApiWaitingDynamic ${(apiWaitingTotalDuration * 1.2).toFixed(2)}s linear infinite; }
        .animate-scroll-api-waiting-dynamic-4 { animation: scrollApiWaitingDynamic ${(apiWaitingTotalDuration * 1.4).toFixed(2)}s linear infinite; }
        .animate-scroll-api-waiting-dynamic-5 { animation: scrollApiWaitingDynamic ${(apiWaitingTotalDuration * 1.6).toFixed(2)}s linear infinite; }
        
        /* API接收過渡動畫 */
        .animate-scroll-api-received-stop-dynamic { animation: scrollApiReceivedStopDynamic ${apiReceivedTotalDuration.toFixed(2)}s ease-out forwards; }
      `;

      // 移除舊的動畫樣式
      const oldStyle = document.getElementById('dynamic-slot-animation');
      if (oldStyle) {
        oldStyle.remove();
      }

      // 添加新的動畫樣式
      const style = document.createElement('style');
      style.id = 'dynamic-slot-animation';
      style.textContent = keyframes;
      document.head.appendChild(style);
      
      // 返回時間參數供其他地方使用
      return {
        apiWaitingDuration: apiWaitingTotalDuration,
        apiReceivedDuration: apiReceivedTotalDuration,
        timePerImage
      };
    }, []);

    // 🎲 亂數排序函數 - 增加轉盤的隨機性
    const shuffleArray = React.useCallback((array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }, []);

    // 組件初始化時自動偵測圖片
    React.useEffect(() => {
      autoDetectSlotImages().then(detectedImages => {
        console.log('🔧 [DEBUG] 偵測到的圖片:', detectedImages);
        if (detectedImages.length > 0) {
          // 🎲 一開始就亂數排序圖片順序，增加隨機性
          const shuffledImages = shuffleArray(detectedImages);
          setSlotImages(shuffledImages);
          console.log('🔧 [DEBUG] 設定 slotImages:', shuffledImages);
          
          // 🎯 預先準備 API等待動畫序列，避免動畫開始時的計算延遲
          const preparedApiWaitingSequence = [...shuffledImages]; // 使用單組圖片，依賴CSS infinite循環
          setApiWaitingSequenceCache(preparedApiWaitingSequence);
          console.log('🚀 [DEBUG] 預先準備 API等待序列:', preparedApiWaitingSequence.length, '張圖片');
          
          // 🎯 根據偵測結果生成動態CSS動畫（預設0.5秒/張）
          createDynamicAnimation(detectedImages.length, 0.5);
        } else {
          console.warn('⚠️ [DEBUG] 沒有偵測到任何圖片，slotImages 將保持預設值');
        }
      });
    }, [autoDetectSlotImages, createDynamicAnimation, shuffleArray]);

    // 觸控事件處理（手機）
    const handleTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50; // 左滑距離超過50px（搜尋下一家）
      const isRightSwipe = distance < -50; // 右滑距離超過50px（回到上一家）

      if (isLeftSwipe && !isSpinning) {
        // 左滑：搜尋下一家餐廳
        onSpin(false);
      } else if (isRightSwipe && !isSpinning && onPreviousRestaurant) {
        // 右滑：回到上一家餐廳
        onPreviousRestaurant();
      }
    };

    // 鍵盤事件處理（電腦）
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && !isSpinning) {
        // 左箭頭：搜尋下一家餐廳
        onSpin(false);
      }
      if (e.key === 'Enter' && finalRestaurant && !isSpinning && candidateList.length < 9) {
        // Enter：加入候選
        onAddCandidate();
      }
    };

    // 添加鍵盤事件監聽
    React.useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isSpinning, finalRestaurant, candidateList.length]);

    /**
     * 智能動畫控制邏輯 - 根據資料狀態決定動畫類型
     * 
     * 動畫狀態說明：
     * - idle: 靜止狀態，顯示最終結果或預設圖片
     * - fast: 快速動畫，等待API返回時分散用戶注意力
     * - slow: 慢速動畫，API已返回，執行最終的視覺過渡
     * 
     * 邏輯流程：
     * 1. isSpinning=true 且無結果 → 快速動畫（分散注意力）
     * 2. isSpinning=true 且有結果 → 慢速動畫（過渡到結果）
     * 3. isSpinning=false → 停止動畫，顯示最終結果
     */
    React.useEffect(() => {
      console.log('🎯 動畫狀態檢查:', { 
        isSpinning, 
        currentPhase: animationPhase,
        hasFinalRestaurant: !!finalRestaurant, 
        hasImage: !!(finalRestaurant?.image) 
      });
      
      if (isSpinning) {
        if (animationPhase === 'slot_apiWaiting' && finalRestaurant && finalRestaurant.image) {
          // =====================================
          // 情況：API等待模式中 + API已返回 → 立即切換到API接收模式
          // =====================================
          console.log('🐌 slot_apiWaiting->slot_apiReceived 轉換觸發 - API已返回，開始最終過渡');
          setAnimationPhase('slot_apiReceived');

          // 🎲 每次轉動都亂數排序
          const shuffledSlots = shuffleArray(slotImages);

          // 🔗 構建最終序列：基於fast序列確保視覺連續性
          const finalSequence = [];
          
          // 使用與slot_apiWaiting模式相同的序列基礎
          if (apiWaitingSequenceCache.length > 0) {
            finalSequence.push(...apiWaitingSequenceCache);
            console.log('🔗 使用slot_apiWaiting序列快取:', apiWaitingSequenceCache.length, '張');
          } else {
            finalSequence.push(...shuffledSlots);
            console.log('⚠️ Fallback: 使用shuffled slots');
          }

          // 添加過渡圖片
          finalSequence.push(...finalSequence.slice(0, 2));
          
          // 餐廳圖片作為最後一張
          finalSequence.push(finalRestaurant.image);

          console.log('🔗 最終序列長度:', finalSequence.length, '張，餐廳圖片將緊接滑入');
          setScrollingNames(finalSequence);

          // 動畫時間計算
          const actualSequenceLength = finalSequence.length - 1;
          const animationResult = createDynamicAnimation(actualSequenceLength, 0.5);
          const apiReceivedAnimationDuration = animationResult.apiReceivedDuration * 1000;
          
          console.log('🎯 slot_apiReceived動畫: 序列長度', actualSequenceLength, '動畫時間', apiReceivedAnimationDuration/1000, '秒');
          
          setTimeout(() => {
            setAnimationPhase('idle');
            window.dispatchEvent(new CustomEvent('slotAnimationEnd'));
          }, apiReceivedAnimationDuration + 50);

        } else if (animationPhase !== 'slot_apiWaiting') {
          // =====================================
          // 情況：檢查預載入池狀態，決定是否需要API等待模式
          // =====================================

          // 🎯 關鍵修復：直接檢查預載入池的實際狀態
          const hasAvailableRestaurants = Array.from(preloadedImages.values())
            .some(item => item && item.isAvailable === true);

          if (hasAvailableRestaurants) {
            // 預載入池有可用餐廳，不需要觸發老虎機
            const availableCount = Array.from(preloadedImages.values())
              .filter(item => item && item.isAvailable === true).length;
            console.log(`✅ 預載入池有${availableCount}家可用餐廳，跳過老虎機動畫`);
            setAnimationPhase('idle');
            return;
          }

          console.log('⚡ 啟動slot_apiWaiting模式 - 等待API返回中...');
          
          requestAnimationFrame(() => {
            setAnimationPhase('slot_apiWaiting');
            setApiWaitingLevel(1);

            // 使用多組預備序列確保連續動畫
            let waitingSequence = [];
            if (apiWaitingSequenceCache.length > 0) {
              // 重複多次確保足夠的滾動長度
              for (let i = 0; i < 5; i++) {
                waitingSequence.push(...apiWaitingSequenceCache);
              }
              setScrollingNames(waitingSequence);
              console.log('⚡ slot_apiWaiting模式: 使用多組序列，總長度:', waitingSequence.length, '（', apiWaitingSequenceCache.length, 'x5）');
            } else {
              // Fallback: 重複slotImages
              for (let i = 0; i < 5; i++) {
                waitingSequence.push(...slotImages);
              }
              setScrollingNames(waitingSequence);
              console.log('⚠️ slot_apiWaiting模式: Fallback多組slotImages，總長度:', waitingSequence.length);
            }
          });
        }
        // 如果已經在slot_apiWaiting模式且API未返回，維持等待狀態
        
      } else {
        // =====================================
        // 情況：停止轉動 → 停止所有動畫
        // =====================================
        // console.log('🛑 停止動畫 - 回到靜止狀態');
        setAnimationPhase('idle');
        setApiWaitingLevel(1);
        setScrollingNames([]);
      }
    }, [isSpinning, finalRestaurant, animationPhase, apiWaitingSequenceCache, slotImages, shuffleArray, createDynamicAnimation]);

    // 🚫 移除漸進式減速邏輯，使用固定速度避免卡頓
    // 漸進式變速會導致動畫中斷和視覺跳躍，改用單一固定速度

    // 獲取當前動畫類別 - 使用固定速度避免變速卡頓
    const getAnimationClass = () => {
      switch (animationPhase) {
        case 'slot_apiWaiting':
          // 🎯 使用固定速度的等待API動畫，避免變速導致的卡頓
          return 'animate-scroll-api-waiting-dynamic-2'; // 固定使用level-2速度
        case 'slot_apiReceived':
          // 🎯 使用動態生成的API接收過渡動畫
          return 'animate-scroll-api-received-stop-dynamic';
        default:
          return '';
      }
    };

    return (
      <div className="w-full max-w-2xl mx-auto glow-container rounded-lg" data-name="slot-machine" data-file="components/SlotMachine.js">
        <div className="text-center mb-6">
          
          {/* Restaurant Image Display with Slide Transition */}
          <div
            className="group rounded-t-lg mb-6 h-64 overflow-hidden relative cursor-pointer select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => finalRestaurant && !isSpinning && onImageClick && onImageClick()}
            title={finalRestaurant && !isSpinning ? "點擊查看Google地圖照片" : "左滑或按←鍵搜尋下一家餐廳"}
          >
            {/* 滑動轉場容器 */}
            {isSliding && (currentImage || nextImage) ? (
              <div className="absolute inset-0 overflow-hidden">
                {/* 當前圖片 - 滑出 */}
                {currentImage && (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: 'translateX(0)',
                      animation: slideDirection === 'left' 
                        ? `slideOutToLeft ${animationConfig?.duration || 300}ms ${animationConfig?.timingFunction || 'ease-out'} forwards`
                        : `slideOutToRight ${animationConfig?.duration || 300}ms ${animationConfig?.timingFunction || 'ease-out'} forwards`,
                      zIndex: 1
                    }}
                  >
                    {/* 當前餐廳的UI元素 - 原餐廳的資料跟著原圖片一起滑出 */}
                    {currentRestaurantData && (
                      <>
                        {/* 餐廳名稱和距離 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <div className="text-2xl font-bold text-white drop-shadow-lg mb-1">
                            {currentRestaurantData.name_zh || currentRestaurantData.name}
                          </div>
                          {currentRestaurantData.name_en && currentRestaurantData.name_en !== (currentRestaurantData.name_zh || currentRestaurantData.name) && (
                            <div className="text-lg text-gray-200 drop-shadow mb-2">
                              {currentRestaurantData.name_en}
                            </div>
                          )}
                          <div className="text-sm text-white drop-shadow">
                            {currentRestaurantData.distance && (
                              <div className="flex items-center justify-center gap-1">
                                <div className="icon-map text-sm"></div>
                                <span>{currentRestaurantData.distance} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 價位標籤 */}
                        {currentRestaurantData.priceLevel && (
                          <div className="absolute bottom-10 left-4 pointer-events-none">
                            <div className="bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
                              {priceLabels[language]?.[currentRestaurantData.priceLevel] || priceLabels.en[currentRestaurantData.priceLevel]}
                            </div>
                          </div>
                        )}

                        {/* 評分和類型標籤 */}
                        <div className="absolute bottom-2 left-4 pointer-events-none">
                          <div className="flex items-center gap-2">
                            {/* 評分 */}
                            {currentRestaurantData.rating && currentRestaurantData.rating > 0 && (
                              <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                <span className="flex items-center">{renderStars(currentRestaurantData.rating)}</span>
                                <span>{currentRestaurantData.rating}</span>
                                {currentRestaurantData.reviewCount && currentRestaurantData.reviewCount > 0 && (
                                  <span>({currentRestaurantData.reviewCount.toLocaleString()})</span>
                                )}
                              </div>
                            )}

                            {/* 餐廳類型標籤 */}
                            {currentRestaurantData.cuisine && currentRestaurantData.cuisine.length > 0 && (
                              <div className="flex gap-1">
                                {currentRestaurantData.cuisine.slice(0, 2).map((type, index) => (
                                  <div key={index} className="bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded text-xs">
                                    {type}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* 下一張圖片 - 從右側滑入 */}
                {nextImage && (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${nextImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: slideDirection === 'left' ? 'translateX(100%)' : 'translateX(-100%)',
                      animation: slideDirection === 'left' 
                        ? `slideInFromRight ${animationConfig?.duration || 300}ms ${animationConfig?.timingFunction || 'ease-out'} forwards`
                        : `slideInFromLeft ${animationConfig?.duration || 300}ms ${animationConfig?.timingFunction || 'ease-out'} forwards`,
                      zIndex: 2
                    }}
                  >
                    {/* 新餐廳的UI元素 - 跟著新圖片一起滑入 */}
                    {nextRestaurantData && (
                      <>
                        {/* 餐廳名稱和距離 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <div className="text-2xl font-bold text-white drop-shadow-lg mb-1">
                            {nextRestaurantData.name_zh || nextRestaurantData.name}
                          </div>
                          {nextRestaurantData.name_en && nextRestaurantData.name_en !== (nextRestaurantData.name_zh || nextRestaurantData.name) && (
                            <div className="text-lg text-gray-200 drop-shadow mb-2">
                              {nextRestaurantData.name_en}
                            </div>
                          )}
                          <div className="text-sm text-white drop-shadow">
                            {nextRestaurantData.distance && (
                              <div className="flex items-center justify-center gap-1">
                                <div className="icon-map text-sm"></div>
                                <span>{nextRestaurantData.distance} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 價位標籤 */}
                        {nextRestaurantData.priceLevel && (
                          <div className="absolute bottom-10 left-4 pointer-events-none">
                            <div className="bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
                              {priceLabels[language]?.[nextRestaurantData.priceLevel] || priceLabels.en[nextRestaurantData.priceLevel]}
                            </div>
                          </div>
                        )}

                        {/* 評分和類型標籤 */}
                        <div className="absolute bottom-2 left-4 pointer-events-none">
                          <div className="flex items-center gap-2">
                            {/* 評分 */}
                            {nextRestaurantData.rating && nextRestaurantData.rating > 0 && (
                              <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                <span className="flex items-center">{renderStars(nextRestaurantData.rating)}</span>
                                <span>{nextRestaurantData.rating}</span>
                                {nextRestaurantData.reviewCount && nextRestaurantData.reviewCount > 0 && (
                                  <span>({nextRestaurantData.reviewCount.toLocaleString()})</span>
                                )}
                              </div>
                            )}

                            {/* 餐廳類型標籤 */}
                            {nextRestaurantData.cuisine && nextRestaurantData.cuisine.length > 0 && (
                              <div className="flex gap-1">
                                {nextRestaurantData.cuisine.slice(0, 2).map((type, index) => (
                                  <div key={index} className="bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded text-xs">
                                    {type}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* 正常顯示狀態 */
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: (() => {
                    if (finalRestaurant && finalRestaurant.image) {
                      // console.log('🔧 [DEBUG] 使用餐廳圖片:', finalRestaurant.image);
                      // 添加 fallback 圖片以防載入失敗
                      const fallbackUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                      return `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${finalRestaurant.image}), url(${fallbackUrl})`;
                    } else if (slotImages.length > 0) {
                      const fallbackImage = slotImages[slotImages.length - 1];
                      console.log('🔧 [DEBUG] 使用 slot fallback 圖片:', fallbackImage);
                      return `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${fallbackImage})`;
                    } else {
                      console.log('🔧 [DEBUG] 使用預設漸層背景');
                      return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
                    }
                  })(),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}

            {/* 內容覆蓋層 */}
            <div 
              className={`flex flex-row items-center justify-center transition-transform duration-2000 ease-out pointer-events-none ${
                isSpinning ? getAnimationClass() : ''
              }`}
              style={{
                willChange: isSpinning ? 'transform' : 'auto'
              }}
            >
              {isSpinning ? (
                scrollingNames.map((imageSrc, index) => {
                  const isRestaurantImage = finalRestaurant && finalRestaurant.image && imageSrc === finalRestaurant.image;

                  return (
                    <div key={index} className="w-64 h-64 flex items-center justify-center flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt={isRestaurantImage ? `restaurant-${finalRestaurant.name}` : `slot-${index}`}
                        className="w-full h-full object-cover"
                        style={{
                          filter: isRestaurantImage ? 'brightness(1) contrast(1)' : 'brightness(0.8) contrast(1.1)'
                        }}
                      />
                      {/* 如果是餐廳圖片，添加資訊覆蓋層 */}
                      {isRestaurantImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold text-white drop-shadow-lg mb-1">
                            {finalRestaurant.name_zh || finalRestaurant.name}
                          </div>
                          {finalRestaurant.name_en && finalRestaurant.name_en !== (finalRestaurant.name_zh || finalRestaurant.name) && (
                            <div className="text-lg text-gray-200 drop-shadow mb-2">
                              {finalRestaurant.name_en}
                            </div>
                          )}
                          <div className="text-sm text-white drop-shadow">
                            {finalRestaurant.distance && (
                              <div className="flex items-center justify-center gap-1">
                                <div className="icon-map text-sm"></div>
                                <span>{finalRestaurant.distance} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : finalRestaurant ? (
                <div className="w-full h-64 flex flex-col items-center justify-center flex-shrink-0 text-center">
                  <div className="text-2xl font-bold text-white drop-shadow-lg mb-1">
                    {finalRestaurant.name_zh || finalRestaurant.name}
                  </div>
                  {finalRestaurant.name_en && finalRestaurant.name_en !== (finalRestaurant.name_zh || finalRestaurant.name) && (
                    <div className="text-lg text-gray-200 drop-shadow mb-2">
                      {finalRestaurant.name_en}
                    </div>
                  )}
                  <div className="text-sm text-white drop-shadow">
                    {finalRestaurant.distance && (
                      <div className="flex items-center justify-center gap-1">
                        <div className="icon-map text-sm"></div>
                        <span>{finalRestaurant.distance} km</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 flex flex-col items-center justify-center flex-shrink-0 text-center">
                  <div className="text-xl font-bold text-white drop-shadow-lg flex items-center justify-center gap-2">
                    {/* 🎯 如果有slot圖片，顯示「打烊了」，否則顯示原始訊息 */}
                    {slotImages.length > 0 ? (
                      <>
                        😴
                        {language === 'zh' ? '打烊了' : 
                         language === 'ja' ? '閉店' :
                         language === 'ko' ? '영업종료' : 
                         language === 'es' ? 'Cerrado' :
                         language === 'fr' ? 'Fermé' : 'Closed'}
                      </>
                    ) : (
                      <>
                        😋
                        {translations.spinButton}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 簡單轉圈Loading覆蓋層 - 只在轉盤時顯示 */}
            {isSpinning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Price Label - 完全獨立的絕對定位 */}
            {finalRestaurant && !isSpinning && finalRestaurant.priceLevel && (
              <div className="absolute bottom-10 left-4 pointer-events-none">
                <div className="bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
                  {priceLabels[language]?.[finalRestaurant.priceLevel] || priceLabels.en[finalRestaurant.priceLevel]}
                </div>
              </div>
            )}

            {/* Rating and Type Tags - 獨立的絕對定位 */}
            {finalRestaurant && !isSpinning && (
              <div className="absolute bottom-2 left-4 pointer-events-none">
                <div className="flex items-center gap-2">
                  {/* Rating Label - 只包含星號和評分 */}
                  {finalRestaurant.rating && finalRestaurant.rating > 0 && (
                    <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <span className="flex items-center">{renderStars(finalRestaurant.rating)}</span>
                      <span>{finalRestaurant.rating}</span>
                      {finalRestaurant.reviewCount && finalRestaurant.reviewCount > 0 && (
                        <span>({finalRestaurant.reviewCount.toLocaleString()})</span>
                      )}
                    </div>
                  )}

                  {/* Restaurant Type Tags - 獨立顯示，無背景遮罩 */}
                  {finalRestaurant.cuisine && finalRestaurant.cuisine.length > 0 && (
                    <div className="flex gap-1">
                      {finalRestaurant.cuisine.slice(0, 2).map((type, index) => (
                        <div key={index} className="bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded text-xs">
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Hover Arrow - Left Side (Previous Restaurant) */}
            {finalRestaurant && !isSpinning && (
              <div 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPreviousRestaurant) {
                    onPreviousRestaurant();
                  }
                }}
                title="回到上一家餐廳"
              >
                <div className="icon-chevron-left text-white text-6xl drop-shadow-lg"></div>
              </div>
            )}

            {/* Hover Arrow - Right Side (Next Restaurant) */}
            {finalRestaurant && !isSpinning && (
              <div 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpin(false);
                }}
                title="搜尋下一家餐廳"
              >
                <div className="icon-chevron-right text-white text-6xl drop-shadow-lg"></div>
              </div>
            )}
            
          </div>

          {/* Button Container - 固定兩欄布局 */}
          <div className="grid grid-cols-[1fr_120px] gap-3 px-4">
            {/* Search Next Button - 主按鈕佔剩餘空間 */}
            <button
              onClick={() => onSpin(false)}
              className="min-h-[72px] p-3 rounded-lg border-2 
                         flex flex-col items-center justify-center text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
                borderColor: 'var(--theme-primary)',
                touchAction: 'manipulation',
                transition: 'none'
              }}
            >
              {isSpinning ? (
                <div className="text-xl font-bold text-center">
                  點擊停止
                </div>
              ) : (
                <div className="text-xl font-bold text-center">
                  {translations.spinButton}
                </div>
              )}
            </button>

            {/* Add to Candidate Button - 固定 120px 寬度空間 */}
            <button
              onClick={(!finalRestaurant || candidateList.length >= 9 || isSpinning) ? null : onAddCandidate}
              disabled={!finalRestaurant || candidateList.length >= 9 || isSpinning}
              className="min-h-[72px] p-3 rounded-lg border-2 
                         flex flex-col items-center justify-center text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
                borderColor: 'var(--theme-primary)',
                touchAction: 'manipulation',
                transition: 'none',
                opacity: (!finalRestaurant || candidateList.length >= 9) ? 0.3 : (isSpinning ? 0.5 : 1),
                cursor: (!finalRestaurant || candidateList.length >= 9 || isSpinning) ? 'not-allowed' : 'pointer'
              }}
              title={finalRestaurant && candidateList.length < 9 ? translations.addCandidate : ''}
            >
              <div className="text-lg font-semibold text-center leading-tight">
                {translations.addCandidate}
              </div>
            </button>
          </div>

          {/* Restaurant List */}
          {candidateList.length > 0 && (
            <div className="mt-6 w-full">
              <div className="flex items-center justify-between mb-4 px-4">
                <div className="text-sm text-gray-600">
                  {translations.candidates} ({candidateList.length}/9)
                </div>
                <button
                  onClick={onClearList}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  {translations.clearList}
                </button>
              </div>
              <div className="space-y-3 w-full">
                {candidateList.map((restaurant, index) => {
                  const priceLevel = restaurant.priceLevel || restaurant.price_level || 2;
                  
                  return (
                    <a
                      key={index}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden transition-all duration-200 hover:shadow-lg relative h-24"
                      style={{
                        backgroundImage: restaurant.image ? 
                          `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${restaurant.image})` : 
                          'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Left Info Panel with Golden Ratio Width - Frosted Glass Effect */}
                      <div 
                        className="absolute left-0 top-0 h-full flex flex-col justify-center p-4 cursor-pointer hover:bg-opacity-75 transition-all duration-200"
                        style={{
                          width: '38.2%',
                          background: 'linear-gradient(to right, rgba(255,255,255,0.25), rgba(255,255,255,0.1), transparent)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)', // Safari support
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDirectionsUrl(restaurant), '_blank');
                        }}
                        title="點擊導航到此餐廳"
                      >
                        <div className="text-left pointer-events-none">
                          <div className="font-semibold text-white text-base mb-1 leading-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            {index + 1}. {restaurant.name}
                          </div>
                          {restaurant.distance && (
                            <div className="text-xs text-white flex items-center gap-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                              <div className="icon-map text-xs"></div>
                              <span>{restaurant.distance} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Price Label - Bottom Right */}
                      <div className="absolute bottom-3 right-3 bg-[var(--accent-color)] text-black px-2 py-1 rounded-full text-xs font-semibold pointer-events-none">
                        {priceLabels[language]?.[priceLevel] || priceLabels.en[priceLevel]}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('SlotMachine component error:', error);
    return null;
  }
}

// 註冊組件到全局
window.SlotMachine = SlotMachine;
