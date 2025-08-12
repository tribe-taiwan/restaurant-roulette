function SlotMachine({ isSpinning, onSpin, onAddCandidate, translations, finalRestaurant, candidateList = [], language, onClearList, onRemoveCandidate, onImageClick, userLocation, userAddress, onPreviousRestaurant, onTriggerSlideTransition, restaurantHistory = [], selectedMealTime }) {
  try {
    // 追蹤按鈕點擊狀態
    const [buttonClickState, setButtonClickState] = React.useState('normal'); // 'normal', 'added', 'exists'

    // 追蹤分享按鈕狀態
    const [shareButtonState, setShareButtonState] = React.useState('normal'); // 'normal', 'copying', 'success', 'error'

    // 左滑刪除狀態管理
    const [swipeStates, setSwipeStates] = React.useState({});

    // 觸控事件處理函數
    const handleTouchStart = (e, index) => {
      const touch = e.touches[0];
      setSwipeStates(prev => ({
        ...prev,
        [index]: {
          startX: touch.clientX,
          startY: touch.clientY,
          currentX: touch.clientX,
          offsetX: 0,
          isSwiping: false,
          startTime: Date.now()
        }
      }));
    };

    const handleTouchMove = (e, index) => {
      if (!swipeStates[index]) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - swipeStates[index].startX;
      const deltaY = touch.clientY - swipeStates[index].startY;

      // 判斷是否為水平滑動（左滑）
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0 && Math.abs(deltaX) > 15) {
        e.preventDefault(); // 防止頁面滾動

        const maxOffset = -100; // 最大滑動距離
        const offsetX = Math.max(deltaX, maxOffset);

        setSwipeStates(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            currentX: touch.clientX,
            offsetX: offsetX,
            isSwiping: true
          }
        }));
      }
      // 如果已經是左滑狀態，繼續阻止頁面滾動
      else if (swipeStates[index].isSwiping && swipeStates[index].offsetX < 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e, index) => {
      if (!swipeStates[index]) return;

      const { offsetX, startTime, isSwiping } = swipeStates[index];
      const duration = Date.now() - startTime;
      const threshold = -80; // 觸發刪除的閾值（滑動超過80px）

      // 只有在左滑時才阻止瀏覽器的預設行為（避免觸發頁面滾動）
      if (isSwiping && offsetX < 0) {
        e.preventDefault();
        e.stopPropagation();
      }

      // 如果滑動距離超過閾值且不是快速點擊，則刪除
      if (offsetX < threshold && duration > 100) {
        if (onRemoveCandidate) {
          onRemoveCandidate(index);
        }
      }

      // 重置滑動狀態
      setSwipeStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          offsetX: 0,
          isSwiping: false
        }
      }));
    };

    // 檢查當前餐廳是否已在候選清單中
    const isRestaurantInCandidates = finalRestaurant && candidateList.some(candidate =>
      (candidate.place_id && finalRestaurant.place_id && candidate.place_id === finalRestaurant.place_id) ||
      (candidate.name && finalRestaurant.name && candidate.name === finalRestaurant.name)
    );

    // 當候選清單被清空時重置按鈕狀態
    React.useEffect(() => {
      if (candidateList.length === 0) {
        setButtonClickState('normal');
      }
    }, [candidateList.length]);

    // 當餐廳改變時重置按鈕狀態
    React.useEffect(() => {
      setButtonClickState('normal');
    }, [finalRestaurant]);

    // 處理輪盤按鈕點擊（重置加入按鈕狀態）
    const handleSpinClick = () => {
      setButtonClickState('normal');
      onSpin(false);
    };

    // 檢查餐廳是否可以加入候選（營業狀態檢查）
    const isRestaurantOperational = (restaurant) => {
      if (!restaurant) return false;
      // 檢查營業狀態，只有OPERATIONAL的餐廳才能加入候選
      return !restaurant.businessStatus || restaurant.businessStatus === 'OPERATIONAL';
    };

    // 按鈕文字邏輯
    const getAddCandidateButtonText = () => {
      if (!finalRestaurant) return translations.addCandidate;

      // 檢查營業狀態
      if (!isRestaurantOperational(finalRestaurant)) return '暫停營業';

      // 檢查候選列表是否已滿
      if (candidateList.length >= 9) return translations.listFull || '名單已滿';

      // 只有在點擊後才顯示狀態文字
      if (buttonClickState === 'added') return translations.candidateAdded || '已加入';
      if (buttonClickState === 'exists') return translations.candidateAlreadyExists || '加過了';

      // 默認狀態：顯示加入候選
      return translations.addCandidate;
    };

    // 處理加入候選按鈕點擊
    const handleAddCandidateClick = () => {
      if (!finalRestaurant || candidateList.length >= 9 || isSpinning) return;

      if (isRestaurantInCandidates) {
        setButtonClickState('exists');
      } else {
        setButtonClickState('added');
        onAddCandidate();
      }
    };
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
        generateKeyframes('slideInFromRight', 100, 100 - slowDistanceEnd, 0),
        generateKeyframes('slideInFromLeft', -100, -100 + slowDistanceEnd, 0),
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

      // RR_UI_081: 滑動動畫配置更新
      window.RRLog?.debug('RR_UI_UPDATE', '滑動動畫配置已更新', {
        slowPhasePercent: config.slowPhasePercent,
        slowMoveDistance: config.slowMoveDistance
      });

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

    // 複製 Google Maps 連結到剪貼簿
    const copyGoogleMapsLink = async (restaurant) => {
      if (!restaurant) return;

      // 設置複製中狀態
      setShareButtonState('copying');

      try {
        const url = getDirectionsUrl(restaurant);

        // 使用現代的 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          // 回退方案：創建臨時 input 元素
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand('copy');
            textArea.remove();
          } catch (err) {
            console.error('複製失敗:', err);
            textArea.remove();
            throw err;
          }
        }

        console.log('📋 Google Maps 連結已複製到剪貼簿');

        // 設置成功狀態
        setShareButtonState('success');

        // 1.5秒後恢復正常狀態
        setTimeout(() => {
          setShareButtonState('normal');
        }, 1500);

      } catch (error) {
        console.error('複製 Google Maps 連結失敗:', error);

        // 設置錯誤狀態
        setShareButtonState('error');

        // 2秒後恢復正常狀態
        setTimeout(() => {
          setShareButtonState('normal');
        }, 2000);
      }
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
          const BACKGROUND_REFILL_THRESHOLD = 10; // 預載入池剩餘10家時觸發幕後補充

          if (availableFutureRestaurants <= BACKGROUND_REFILL_THRESHOLD && availableFutureRestaurants > 0 && userLocation) {
            // RR_UI_083: 預載入池不足警告
            window.RRLog?.info('RR_UI_UPDATE', '預載入池不足警告，觸發幕後補充', {
              remainingRestaurants: availableFutureRestaurants
            });

            // 幕後觸發API搜索，不影響用戶體驗，不觸發老虎機
            setTimeout(async () => {
              try {
                if (window.getRandomRestaurant) {
                  // RR_UI_084: 開始幕後補充餐廳
                  window.RRLog?.debug('RR_UI_UPDATE', '開始幕後補充餐廳');
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
              }
            }, 200); // 延遲200ms執行，避免阻塞UI
          }

          // RR_UI_072: 預載入池狀態更新
          window.RRLog?.debug('RR_UI_UPDATE', '預載入池狀態更新', {
            poolSize: newPool.size,
            range: maxRange,
            halfRange: halfRange,
            availableRestaurants: availableFutureRestaurants,
            currentRestaurant: currentRestaurant?.name || '無餐廳',
            skippedNegative: skippedNegativeCount
          });

          // 🎯 更新可用餐廳數量狀態
          setAvailableRestaurantsCount(availableFutureRestaurants);

          return newPool;
        });

      } catch (error) {
        // RR_UI_065: 預載入池管理失敗
        window.RRLog?.warn('RR_UI_ERROR', '預載入池管理失敗', { error: error.message });
      }
    }, [selectedMealTime, userLocation]);

    // 保存當前餐廳資料用於滑動轉場
    const [currentRestaurantData, setCurrentRestaurantData] = React.useState(null);
    const [nextRestaurantData, setNextRestaurantData] = React.useState(null);

    // 滑動轉場函數
    const triggerSlideTransition = React.useCallback((previousRestaurant, newRestaurant, direction = 'left', onComplete = null) => {
      // RR_UI_078: 滑動轉場觸發
      window.RRLog?.debug('RR_UI_UPDATE', '滑動轉場觸發', {
        restaurant: newRestaurant?.name,
        direction
      });

      // 🛡️ 協調機制：防止動畫衝突
      if (isSliding) {
        // RR_UI_079: 滑動轉場被阻止-已在滑動中
        window.RRLog?.debug('RR_UI_UPDATE', '滑動轉場被阻止: 已在滑動中');
        return;
      }

      if (isSpinning) {
        // RR_UI_080: 滑動轉場被阻止-輪盤動畫中
        window.RRLog?.debug('RR_UI_UPDATE', '滑動轉場被阻止: 輪盤動畫進行中');
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
          // RR_UI_066: 緊急預載入失敗
          window.RRLog?.debug('RR_UI_ERROR', '緊急預載入失敗', { error: error.message });
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
        // RR_UI_087: 立即響應餐廳變更
        window.RRLog?.debug('RR_UI_UPDATE', '立即響應餐廳變更', { restaurant: restaurant.name });

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
        // RR_UI_073: 預載入池就緒
        window.RRLog?.debug('RR_UI_UPDATE', '預載入池就緒', {
          readyImages: preloadedImages.size
        });
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

    // 自動偵測可用的slot圖片數量 - 使用fetch避免404錯誤
    const autoDetectSlotImages = React.useCallback(async () => {
      const basePath = './assets/image/slot-machine';
      const detectedImages = [];
      const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

      // RR_UI_059: 開始自動偵測slot圖片
      window.RRLog?.debug('RR_UI_UPDATE', '開始自動偵測slot圖片數量', {
        supportedFormats: extensions
      });

      let i = 1;
      while (true) {
        let imageFound = false;

        // 嘗試每種副檔名
        for (const ext of extensions) {
          const imagePath = `${basePath}/slot (${i})${ext}`;

          try {
            // 使用fetch進行HEAD請求，避免下載圖片內容，減少404錯誤顯示
            const response = await fetch(imagePath, {
              method: 'HEAD',
              cache: 'no-cache'
            });

            if (response.ok) {
              detectedImages.push(imagePath);
              imageFound = true;
              break; // 找到就跳出副檔名迴圈
            }
          } catch (error) {
            // 繼續嘗試下一個副檔名，不輸出錯誤
          }
        }

        if (!imageFound) {
          // RR_UI_060: slot圖片偵測完成
          window.RRLog?.info('RR_UI_UPDATE', 'slot圖片偵測完成', {
            totalFound: detectedImages.length,
            range: `slot (1) ~ slot (${detectedImages.length})`
          });
          break; // 沒找到任何格式的圖片，停止搜尋
        }

        i++;

        // 安全上限，避免無限迴圈
        if (i > 100) {
          // RR_UI_061: 達到圖片搜尋上限
          window.RRLog?.warn('RR_UI_ERROR', '達到圖片搜尋上限100張，停止搜尋');
          break;
        }
      }

      // RR_UI_062: slot圖片載入成功
      window.RRLog?.info('RR_UI_UPDATE', 'slot圖片載入成功', {
        count: detectedImages.length,
        supportedFormats: extensions,
        images: detectedImages.slice(0, 3).map(img => img.split('/').pop()) // 只顯示前3個檔名
      });

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

      // RR_UI_088: 動畫參數計算
      window.RRLog?.debug('RR_UI_UPDATE', '動畫參數計算', {
        imageCount,
        timePerImage,
        apiWaitingTotalDuration,
        apiReceivedTotalDuration
      });

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
        // RR_UI_074: 偵測到的圖片
        window.RRLog?.debug('RR_UI_UPDATE', '偵測到的圖片', {
          images: detectedImages.slice(0, 5).map(img => img.split('/').pop()) // 只顯示前5個檔名
        });

        if (detectedImages.length > 0) {
          // 🎲 一開始就亂數排序圖片順序，增加隨機性
          const shuffledImages = shuffleArray(detectedImages);
          setSlotImages(shuffledImages);

          // RR_UI_075: 設定slot圖片
          window.RRLog?.debug('RR_UI_UPDATE', '設定slot圖片', {
            count: shuffledImages.length,
            shuffled: true
          });

          // 🎯 預先準備 API等待動畫序列，避免動畫開始時的計算延遲
          const preparedApiWaitingSequence = [...shuffledImages]; // 使用單組圖片，依賴CSS infinite循環
          setApiWaitingSequenceCache(preparedApiWaitingSequence);

          // RR_UI_076: 預先準備API等待序列
          window.RRLog?.debug('RR_UI_UPDATE', '預先準備API等待序列', {
            sequenceLength: preparedApiWaitingSequence.length
          });

          // 🎯 根據偵測結果生成動態CSS動畫（預設0.5秒/張）
          createDynamicAnimation(detectedImages.length, 0.5);
        } else {
          // RR_UI_077: 沒有偵測到任何圖片
          window.RRLog?.warn('RR_UI_ERROR', '沒有偵測到任何圖片，將保持預設值');
        }
      });
    }, [autoDetectSlotImages, createDynamicAnimation, shuffleArray]);

    // 觸控事件處理（手機）
    const handleImageTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleImageTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleImageTouchEnd = () => {
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
      // RR_UI_089: 動畫狀態檢查
      window.RRLog?.debug('RR_UI_UPDATE', '動畫狀態檢查', {
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
          // RR_UI_090: API已返回開始最終過渡
          window.RRLog?.debug('RR_UI_UPDATE', 'slot_apiWaiting->slot_apiReceived 轉換觸發，API已返回');
          setAnimationPhase('slot_apiReceived');

          // 🎲 每次轉動都亂數排序
          const shuffledSlots = shuffleArray(slotImages);

          // 🔗 構建最終序列：基於fast序列確保視覺連續性
          const finalSequence = [];

          // 使用與slot_apiWaiting模式相同的序列基礎
          if (apiWaitingSequenceCache.length > 0) {
            finalSequence.push(...apiWaitingSequenceCache);
            // RR_UI_091: 使用slot_apiWaiting序列快取
            window.RRLog?.debug('RR_UI_UPDATE', '使用slot_apiWaiting序列快取', {
              cacheLength: apiWaitingSequenceCache.length
            });
          } else {
            finalSequence.push(...shuffledSlots);
            // RR_UI_092: Fallback使用shuffled slots
            window.RRLog?.debug('RR_UI_UPDATE', 'Fallback: 使用shuffled slots');
          }

          // 添加過渡圖片
          finalSequence.push(...finalSequence.slice(0, 2));

          // 餐廳圖片作為最後一張
          finalSequence.push(finalRestaurant.image);

          // RR_UI_093: 最終序列長度
          window.RRLog?.debug('RR_UI_UPDATE', '最終序列長度', {
            sequenceLength: finalSequence.length,
            note: '餐廳圖片將緊接滑入'
          });
          setScrollingNames(finalSequence);

          // 動畫時間計算
          const actualSequenceLength = finalSequence.length - 1;
          const animationResult = createDynamicAnimation(actualSequenceLength, 0.5);
          const apiReceivedAnimationDuration = animationResult.apiReceivedDuration * 1000;

          // RR_UI_094: slot_apiReceived動畫參數
          window.RRLog?.debug('RR_UI_UPDATE', 'slot_apiReceived動畫參數', {
            sequenceLength: actualSequenceLength,
            animationDuration: `${apiReceivedAnimationDuration / 1000}秒`
          });

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
            // RR_UI_095: 預載入池有可用餐廳跳過動畫
            window.RRLog?.debug('RR_UI_UPDATE', '預載入池有可用餐廳，跳過老虎機動畫', {
              availableCount
            });
            setAnimationPhase('idle');
            return;
          }

          // RR_UI_096: 啟動slot_apiWaiting模式
          window.RRLog?.debug('RR_UI_UPDATE', '啟動slot_apiWaiting模式 - 等待API返回中');

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
              // RR_UI_097: slot_apiWaiting模式使用多組序列
              window.RRLog?.debug('RR_UI_UPDATE', 'slot_apiWaiting模式: 使用多組序列', {
                totalLength: waitingSequence.length,
                cacheLength: apiWaitingSequenceCache.length,
                multiplier: 5
              });
            } else {
              // Fallback: 重複slotImages
              for (let i = 0; i < 5; i++) {
                waitingSequence.push(...slotImages);
              }
              setScrollingNames(waitingSequence);
              // RR_UI_098: slot_apiWaiting模式Fallback
              window.RRLog?.debug('RR_UI_UPDATE', 'slot_apiWaiting模式: Fallback多組slotImages', {
                totalLength: waitingSequence.length
              });
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
    // 老虎機的 HTML 結構
    return (
      <div className="w-full max-w-2xl mx-auto glow-container rounded-t-lg" data-name="slot-machine" data-file="components/SlotMachine.js">
        <div className="text-center">

          {/* Restaurant Image Display with Slide Transition */}
          <div
            className="group rounded-t-lg h-64 overflow-hidden relative cursor-pointer select-none"
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
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
                      backgroundImage: `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${currentImage})`,
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
                      backgroundImage: `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${nextImage})`,
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
                      return `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${finalRestaurant.image}), url(${fallbackUrl})`;
                    } else if (slotImages.length > 0) {
                      const fallbackImage = slotImages[slotImages.length - 1];
                      // RR_UI_099: 使用slot fallback圖片
                      window.RRLog?.debug('RR_UI_UPDATE', '使用 slot fallback 圖片', {
                        fallbackImage: fallbackImage.split('/').pop()
                      });
                      return `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${fallbackImage})`;
                    } else {
                      // RR_UI_100: 使用預設漸層背景
                      window.RRLog?.debug('RR_UI_UPDATE', '使用預設漸層背景');
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
              className={`flex flex-row items-center justify-center transition-transform duration-2000 ease-out pointer-events-none ${isSpinning ? getAnimationClass() : ''
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
                          filter: 'brightness(1) contrast(1)'
                        }}
                      />
                      {/* 如果是餐廳圖片，添加資訊覆蓋層 */}
                      {isRestaurantImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: `rgba(0,0,0,var(--image-overlay-opacity))` }}>
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
              <div className="absolute inset-0 flex items-center justify-center z-50">
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

            {/* 分享 Copy Google Maps Link Button - Top Right Corner */}
            {finalRestaurant && !isSpinning && (
              <div
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm z-20 ${shareButtonState === 'copying' ? 'bg-blue-500 bg-opacity-80 scale-110' :
                    shareButtonState === 'success' ? 'bg-green-500 bg-opacity-80 scale-110' :
                      shareButtonState === 'error' ? 'bg-red-500 bg-opacity-80 scale-110' :
                        'bg-black bg-opacity-50 hover:bg-opacity-70'
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (shareButtonState === 'normal') {
                    copyGoogleMapsLink(finalRestaurant);
                  }
                }}
                title={
                  shareButtonState === 'copying' ? '複製中...' :
                    shareButtonState === 'success' ? '已複製！' :
                      shareButtonState === 'error' ? '複製失敗' :
                        '複製 Google Maps 連結'
                }
              >
                {shareButtonState === 'copying' ? (
                  // 載入動畫
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : shareButtonState === 'success' ? (
                  // 成功勾勾
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : shareButtonState === 'error' ? (
                  // 錯誤 X
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : (
                  // 正常的複製圖標
                  <div
                    className="w-5 h-5 relative"
                    style={{
                      background: 'transparent',
                      border: '1.5px solid white',
                      borderRadius: '2px'
                    }}
                  >
                    {/* Copy icon overlay */}
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4"
                      style={{
                        background: 'white',
                        border: '1.5px solid white',
                        borderRadius: '1px'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Button Container - 固定兩欄布局 */}
          <div className="grid grid-cols-[1fr_120px] gap-3 px-4 slot-machine-buttons">
            {/* Search Next Button - 主按鈕佔剩餘空間，第一個按鈕為了統一也加上 margin: 0 */}
            <button
              onClick={() => handleSpinClick()}
              className="min-h-[72px] p-3 rounded-lg border-2 
                         flex flex-col items-center justify-center text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
                borderColor: 'var(--theme-primary)',
                touchAction: 'manipulation',
                transition: 'none',
                margin: 0
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

            {/* Add to Candidate Button - 固定 120px 寬度空間，非第一個按鈕需要 margin: 0 來避免上方多出間隔 */}
            <button
              onClick={(!finalRestaurant || candidateList.length >= 9 || isSpinning || !isRestaurantOperational(finalRestaurant)) ? null : handleAddCandidateClick}
              disabled={!finalRestaurant || candidateList.length >= 9 || isSpinning || !isRestaurantOperational(finalRestaurant)}
              className="min-h-[72px] p-3 rounded-lg border-2
                         flex flex-col items-center justify-center text-white shadow-lg"
              style={{
                background: !isRestaurantOperational(finalRestaurant) ?
                  'linear-gradient(135deg, #9CA3AF, #6B7280)' : // 灰色漸層表示暫停營業
                  'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
                borderColor: !isRestaurantOperational(finalRestaurant) ? '#6B7280' : 'var(--theme-primary)',
                touchAction: 'manipulation',
                transition: 'none',
                margin: 0,
                opacity: (!finalRestaurant || candidateList.length >= 9 || !isRestaurantOperational(finalRestaurant)) ? 0.3 : (isSpinning ? 0.5 : 1),
                cursor: (!finalRestaurant || candidateList.length >= 9 || isSpinning || !isRestaurantOperational(finalRestaurant)) ? 'not-allowed' : 'pointer'
              }}
              title={finalRestaurant && candidateList.length < 9 && isRestaurantOperational(finalRestaurant) ? translations.addCandidate :
                !isRestaurantOperational(finalRestaurant) ? '餐廳暫停營業，無法加入候選' : ''}
            >
              <div className="text-xl font-bold text-center">
                {getAddCandidateButtonText()}
              </div>
            </button>
          </div>

          {/* Restaurant List */}
          {candidateList.length > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between px-4 slot-machine-buttons">
                <div className="text-sm text-gray-300">
                  {translations.candidates} ({candidateList.length}/9)
                </div>
                <button
                  onClick={onClearList}
                  className="text-sm text-gray-300 hover:text-gray-100 transition-colors"
                >
                  {translations.clearList}
                </button>
              </div>
              <div className="w-full divide-y divide-white/10"> {/* 添加了 2px 細白線分隔，移除了 space-y-1（垂直間距）*/}
                {candidateList.map((restaurant, index) => {
                  const priceLevel = restaurant.priceLevel || restaurant.price_level || 2;

                  return (
                    <div
                      key={index}
                      className="relative overflow-hidden h-24"
                      onTouchStart={(e) => handleTouchStart(e, index)}
                      onTouchMove={(e) => handleTouchMove(e, index)}
                      onTouchEnd={(e) => handleTouchEnd(e, index)}
                    >
                      {/* 左滑時顯示的刪除背景 */}
                      <div
                        className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 z-0"
                        style={{
                          opacity: swipeStates[index]?.offsetX ? Math.min(Math.abs(swipeStates[index].offsetX) / 50, 1) : 0,
                          transition: swipeStates[index]?.isSwiping ? 'none' : 'opacity 0.3s ease-out'
                        }}
                      >
                        <div className="text-white text-xl font-bold">刪除</div>
                      </div>

                      {/* 原本的餐廳卡片 */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden transition-all duration-200 hover:shadow-lg relative h-24 z-10"
                        style={{
                          backgroundImage: restaurant.image ?
                            `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${restaurant.image})` :
                            'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transform: `translateX(${swipeStates[index]?.offsetX || 0}px)`,
                          transition: swipeStates[index]?.isSwiping ? 'none' : 'transform 0.3s ease-out'
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    // RR_UI_101: SlotMachine組件錯誤
    window.RRLog?.error('RR_UI_ERROR', 'SlotMachine組件錯誤', { error: error.message });
    return null;
  }
}

// 註冊組件到全局
window.SlotMachine = SlotMachine;
