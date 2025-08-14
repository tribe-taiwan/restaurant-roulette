function SlotMachine({ isSpinning, onSpin, onAddCandidate, translations, finalRestaurant, candidateList = [], language, onClearList, onRemoveCandidate, onImageClick, userLocation, userAddress, onPreviousRestaurant, onTriggerSlideTransition, restaurantHistory = [], selectedMealTime }) {
  try {
    // 追蹤按鈕點擊狀態
    const [buttonClickState, setButtonClickState] = React.useState('normal'); // 'normal', 'added', 'exists'

    // 追蹤分享按鈕狀態
    const [shareButtonState, setShareButtonState] = React.useState('normal'); // 'normal', 'copying', 'success', 'error'

    // 左滑刪除狀態管理
    const [swipeStates, setSwipeStates] = React.useState({});

    // 創建觸控事件處理器
    const touchHandlers = React.useMemo(() => {
      return window.createTouchHandlers({
        setSwipeStates,
        swipeStates,
        onRemoveCandidate,
        setTouchStart,
        setTouchEnd,
        touchStart,
        touchEnd,
        isSpinning,
        onSpin,
        onPreviousRestaurant
      });
    }, [swipeStates, onRemoveCandidate, touchStart, touchEnd, isSpinning, onSpin, onPreviousRestaurant]);

    // 創建按鈕邏輯處理器
    const buttonLogic = React.useMemo(() => {
      return window.createButtonLogic({
        finalRestaurant,
        candidateList,
        translations,
        buttonClickState,
        setButtonClickState,
        isSpinning,
        onAddCandidate,
        onSpin,
        isRestaurantInCandidates
      });
    }, [finalRestaurant, candidateList, translations, buttonClickState, isSpinning, onAddCandidate, onSpin, isRestaurantInCandidates]);

    // 創建分享按鈕邏輯處理器
    const shareButtonLogic = React.useMemo(() => {
      return window.createShareButtonLogic({
        setShareButtonState,
        getDirectionsUrl
      });
    }, [setShareButtonState]);

    // 創建鍵盤事件處理器
    const keyboardHandler = React.useMemo(() => {
      return window.createKeyboardHandler({
        isSpinning,
        finalRestaurant,
        candidateList,
        onSpin,
        onAddCandidate
      });
    }, [isSpinning, finalRestaurant, candidateList, onSpin, onAddCandidate]);

    // 設置鍵盤事件監聽
    React.useEffect(() => {
      return keyboardHandler.setupKeyboardListeners();
    }, [keyboardHandler]);





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

    // 創建動畫控制器
    const animationController = React.useMemo(() => {
      return window.createAnimationController({
        isSpinning,
        finalRestaurant,
        animationPhase,
        apiWaitingSequenceCache,
        slotImages,
        preloadedImages,
        setAnimationPhase,
        setApiWaitingLevel,
        setScrollingNames
      });
    }, [isSpinning, finalRestaurant, animationPhase, apiWaitingSequenceCache, slotImages, preloadedImages]);

    // 智能動畫控制邏輯
    React.useEffect(() => {
      animationController.handleAnimationLogic();
    }, [animationController]);





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
      const currentConfig = window.getSlideAnimationConfig();
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
    }, [finalRestaurant, isSliding, isSpinning, preloadedImages]);

    // 初始化動畫配置
    React.useEffect(() => {
      const config = window.applySlideAnimationStyles();
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









    // 組件初始化時自動偵測圖片
    React.useEffect(() => {
      window.autoDetectSlotImages().then(detectedImages => {
        // RR_UI_074: 偵測到的圖片
        window.RRLog?.debug('RR_UI_UPDATE', '偵測到的圖片', {
          images: detectedImages.slice(0, 5).map(img => img.split('/').pop()) // 只顯示前5個檔名
        });

        if (detectedImages.length > 0) {
          // 🎲 一開始就亂數排序圖片順序，增加隨機性
          const shuffledImages = window.shuffleArray(detectedImages);
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
          window.createDynamicAnimation(detectedImages.length, 0.5);
        } else {
          // RR_UI_077: 沒有偵測到任何圖片
          window.RRLog?.warn('RR_UI_ERROR', '沒有偵測到任何圖片，將保持預設值');
        }
      });
    }, []);








    // 老虎機的 HTML 結構
    return (
      <div className="w-full max-w-2xl mx-auto glow-container rounded-t-lg" data-name="slot-machine" data-file="components/SlotMachine.js">
        <div className="text-center">
          {/* Slot Machine Title */}
          <div className="mb-4 px-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg text-center">
              {translations.slotMachineTitle}
            </h2>
          </div>

          {/* Restaurant Image Display with Slide Transition */}
          <div
            className="group rounded-t-lg h-64 overflow-hidden relative cursor-pointer select-none"
            onTouchStart={touchHandlers.handleImageTouchStart}
            onTouchMove={touchHandlers.handleImageTouchMove}
            onTouchEnd={touchHandlers.handleImageTouchEnd}
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
                      zIndex: 1,
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
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
                      zIndex: 2,
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
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
              className={`flex flex-row items-center justify-center transition-transform duration-2000 ease-out pointer-events-none ${isSpinning ? animationController.getAnimationClass() : ''
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
                    shareButtonLogic.copyGoogleMapsLink(finalRestaurant);
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
              onClick={() => buttonLogic.handleSpinClick()}
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
              onClick={buttonLogic.isAddButtonDisabled() ? null : buttonLogic.handleAddCandidateClick}
              disabled={buttonLogic.isAddButtonDisabled()}
              className="min-h-[72px] p-3 rounded-lg border-2
                         flex flex-col items-center justify-center text-white shadow-lg"
              style={buttonLogic.getAddButtonStyle()}
              title={buttonLogic.getAddButtonTitle()}
            >
              <div className="text-xl font-bold text-center">
                {buttonLogic.getAddCandidateButtonText()}
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
                      onTouchStart={(e) => touchHandlers.handleTouchStart(e, index)}
                      onTouchMove={(e) => touchHandlers.handleTouchMove(e, index)}
                      onTouchEnd={(e) => touchHandlers.handleTouchEnd(e, index)}
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
