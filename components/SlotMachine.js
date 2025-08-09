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
    const [fastAnimationLevel, setFastAnimationLevel] = React.useState(1); // 1-5 漸進式減速級別
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

    // 預載入池管理 - 套用測試版本成功經驗：維持5張圖片
    const managePreloadPool = React.useCallback((currentRestaurant, restaurantHistory = []) => {

      setPreloadedImages(prevPool => {
        const newPool = new Map();
        
        // 無限滑動：維持當前餐廳前後各10張，總共21張
        const allRestaurants = [...restaurantHistory, currentRestaurant].filter(Boolean);
        const currentIndex = allRestaurants.length - 1; // 當前餐廳在歷史的最後
        
        // 預載入範圍：前10家（歷史）+ 當前 + 後10家（候補）
        let skippedNegativeCount = 0;
        for (let offset = -10; offset <= 10; offset++) {
          const index = currentIndex + offset;
          
          // 跳過負數索引（統計數量）
          if (index < 0) {
            skippedNegativeCount++;
            continue;
          }
          
          let restaurant = null;
          if (index < allRestaurants.length) {
            // 從歷史中獲取
            restaurant = allRestaurants[index];
          } else if (window.getAvailableRestaurantsFromCache && selectedMealTime) {
            // 從快取中獲取候補餐廳
            const cachedRestaurants = window.getAvailableRestaurantsFromCache(selectedMealTime);
            const futureIndex = index - allRestaurants.length;
            
            // 過濾掉已顯示過的餐廳
            const availableCandidates = cachedRestaurants.filter(cached => {
              return !allRestaurants.some(existing => existing.id === cached.id);
            });
            
            if (futureIndex < availableCandidates.length) {
              restaurant = availableCandidates[futureIndex];
            }
          }
          
          if (restaurant?.image) {
            const url = restaurant.image;
            
            // 保留已存在的圖片或預載入新圖片
            if (prevPool.has(url)) {
              newPool.set(url, prevPool.get(url));
            } else {
              // 標記需要預載入，但不等待
              preloadImage(url).then(img => {
                setPreloadedImages(current => new Map(current).set(url, img));
              }).catch(error => {
                console.warn(`❌ 預載入失敗 (${restaurant.name}):`, error.message);
              });
            }
          }
        }
        
        // 一行總結顯示預載入池狀態
        const skipMsg = skippedNegativeCount > 0 ? `，跳過${skippedNegativeCount}個負數索引` : '';
        console.log(`🔄 預載入池: ${newPool.size}張 (${currentRestaurant?.name || '無餐廳'})${skipMsg}`);
        return newPool;
      });
    }, [selectedMealTime]);

    // 保存當前餐廳資料用於滑動轉場
    const [currentRestaurantData, setCurrentRestaurantData] = React.useState(null);
    const [nextRestaurantData, setNextRestaurantData] = React.useState(null);

    // 滑動轉場函數
    const triggerSlideTransition = React.useCallback((newRestaurant, direction = 'left') => {
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
      const handleRestaurantChanged = (event) => {
        const { restaurant, history } = event.detail;
        console.log('🎯 [SlotMachine] 立即響應餐廳變更:', restaurant.name);
        
        // 立即管理預載入池 - 同步測試檔邏輯
        managePreloadPool(restaurant, history);
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
      "./assets/image/slot-machine/slot (6).jpg"
    ]);

    // 自動偵測可用的slot圖片數量
    const autoDetectSlotImages = React.useCallback(async () => {
      const basePath = './assets/image/slot-machine';
      const detectedImages = [];
      let maxTries = 20; // 最多嘗試20張圖片

      console.log('🔍 開始自動偵測slot圖片數量...');

      for (let i = 1; i <= maxTries; i++) {
        const imagePath = `${basePath}/slot (${i}).jpg`;
        const encodedImagePath = encodeURI(imagePath);
        
        try {
          const response = await fetch(encodedImagePath, { method: 'HEAD' });
          if (response.ok) {
            detectedImages.push(imagePath);
            // 移除找到圖片日誌
          } else {
            break;
          }
        } catch (error) {
          break;
        }
      }

      // 移除偵測完成日誌
      return detectedImages;
    }, []);

    // 🎯 動態生成CSS動畫 - 修改為左右滑動動畫，與滑動轉場呼應
    const createDynamicAnimation = React.useCallback((imageCount) => {
      const itemWidth = 256; // 每張圖片寬度（w-64 = 256px）

      // 🎯 使用原來的邏輯：slot圖片 + 前2張 + 餐廳圖片（保持相同效果）
      const totalImages = imageCount + 2 + 1;
      const finalPosition = (totalImages - 1) * itemWidth; // 停在最後一張（餐廳圖片）

      // 保持原來的70%位置計算方式
      const midPosition = Math.floor((totalImages - 3) * itemWidth);

      // 🎯 快速動畫：移動所有slot圖片的距離，讓用戶看到所有圖片
      const fastScrollDistance = imageCount * itemWidth;

      // 移除動態CSS計算日誌

      // 動態創建CSS keyframes - 改為左右滑動動畫
      const keyframes = `
        @keyframes scrollFastDynamic {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${fastScrollDistance}px);
          }
        }

        @keyframes scrollSlowStopDynamic {
          0% {
            transform: translateX(0);
            animation-timing-function: ease-out;
          }
          70% {
            transform: translateX(-${midPosition}px);
            animation-timing-function: ease-in;
          }
          100% {
            transform: translateX(-${finalPosition}px);
          }
        }
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

      // 移除CSS動畫生成日誌
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
        if (detectedImages.length > 0) {
          // 🎲 一開始就亂數排序圖片順序，增加隨機性
          const shuffledImages = shuffleArray(detectedImages);
          setSlotImages(shuffledImages);
          // 移除圖片數量更新日誌
          
          // 🎯 根據偵測結果生成動態CSS動畫
          createDynamicAnimation(detectedImages.length);
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
      if (isSpinning) {
        if (finalRestaurant && finalRestaurant.image) {
          // =====================================
          // 情況：API已返回結果，執行最終動畫
          // =====================================
          setAnimationPhase('slow');

          // 🎲 每次轉動都亂數排序，增加隨機性
          const shuffledSlots = shuffleArray(slotImages);

          // 構建最終序列：確保餐廳圖片在正確位置
          const finalSequence = [];

          // 從當前循環位置開始的完整循環（亂數排序）
          finalSequence.push(...shuffledSlots);

          // 添加額外的slot圖片確保足夠的滾動距離（亂數排序）
          finalSequence.push(...shuffledSlots.slice(0, 2));

          // 餐廳圖片作為最後一張
          finalSequence.push(finalRestaurant.image);

          setScrollingNames(finalSequence);

          // 設置動畫結束計時器（1秒後結束，對應CSS動畫時間）
          setTimeout(() => {
            setAnimationPhase('idle');
            window.dispatchEvent(new CustomEvent('slotAnimationEnd'));
          }, 1050); // 稍微延長一點確保動畫完成

        } else {
          // =====================================
          // 情況：等待API返回，顯示載入動畫
          // =====================================
          setAnimationPhase('fast');
          setFastAnimationLevel(1); // 重置為最快級別

          // 🎲 快速循環時使用亂數排序的圖片，減少視覺負擔
          const fastSequence = [];
          for (let i = 0; i < 12; i++) { // 從50減少到12，避免眼花
            const shuffledSlots = shuffleArray(slotImages);
            fastSequence.push(...shuffledSlots);
          }
          setScrollingNames(fastSequence);
        }
      } else {
        // =====================================
        // 情況：停止動畫，回到靜止狀態
        // =====================================
        setAnimationPhase('idle');
        setFastAnimationLevel(1); // 重置動畫級別
        setScrollingNames([]);
      }
    }, [isSpinning, finalRestaurant, shuffleArray]);

    // 漸進式減速邏輯 - 0.3秒後開始減速
    React.useEffect(() => {
      let timeoutIds = [];

      if (animationPhase === 'fast' && !finalRestaurant) {
        // 第一級持續0.3秒（最快速度）
        timeoutIds.push(setTimeout(() => {
          setFastAnimationLevel(2);
        }, 300));

        // 之後每0.4秒切換到下一級
        timeoutIds.push(setTimeout(() => {
          setFastAnimationLevel(3);
        }, 700));

        timeoutIds.push(setTimeout(() => {
          setFastAnimationLevel(4);
        }, 1100));

        timeoutIds.push(setTimeout(() => {
          setFastAnimationLevel(5);
        }, 1500));
      }

      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
      };
    }, [animationPhase, finalRestaurant]);

    // 獲取當前動畫類別
    const getAnimationClass = () => {
      switch (animationPhase) {
        case 'fast':
          // 🎯 使用動態生成的快速動畫
          return `animate-scroll-fast-dynamic-${fastAnimationLevel}`;
        case 'slow':
          // 🎯 使用動態生成的慢速動畫
          return 'animate-scroll-slow-stop-dynamic';
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
                  backgroundImage: finalRestaurant && finalRestaurant.image ?
                    `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${finalRestaurant.image})` :
                    slotImages.length > 0 ?
                      `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slotImages[slotImages.length - 1]})` :
                      'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}

            {/* 內容覆蓋層 */}
            <div className={`flex flex-row items-center justify-center transition-transform duration-2000 ease-out pointer-events-none ${
              isSpinning ? getAnimationClass() : ''
            }`}>
              {isSpinning ? (
                scrollingNames.map((imageSrc, index) => {
                  const isRestaurantImage = finalRestaurant && finalRestaurant.image && imageSrc === finalRestaurant.image;

                  return (
                    <div key={index} className="w-full h-64 flex items-center justify-center flex-shrink-0">
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

          {/* Button Container */}
          <div className="flex items-center gap-3 px-4">
            {/* Search Next Button */}
            <button
              onClick={() => onSpin(false)}
              disabled={isSpinning}
              className={`btn-primary flex-1 text-lg ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {translations.spinning}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  😋
                  {translations.spinButton}
                </div>
              )}
            </button>

            {/* Add to Candidate Button - Outside of image area */}
            {finalRestaurant && !isSpinning && candidateList.length < 9 && (
              <button
                onClick={onAddCandidate}
                className="bg-blue-600 text-white w-12 h-12 min-w-[3rem] rounded-full shadow-lg transition-all duration-200 active:scale-95 active:bg-blue-500 flex items-center justify-center flex-shrink-0"
                style={{
                  touchAction: 'manipulation'
                }}
                title={translations.addCandidate}
              >
                <div className="icon-plus text-xl"></div>
              </button>
            )}
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
