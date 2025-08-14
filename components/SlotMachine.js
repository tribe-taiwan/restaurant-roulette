function SlotMachine({ isSpinning, onSpin, onAddCandidate, translations, finalRestaurant, candidateList = [], language, onClearList, onRemoveCandidate, onImageClick, userLocation, userAddress, onPreviousRestaurant, onTriggerSlideTransition, restaurantHistory = [], selectedMealTime }) {
  try {
    // 追蹤按鈕點擊狀態
    const [buttonClickState, setButtonClickState] = React.useState('normal'); // 'normal', 'added', 'exists'

    // 追蹤分享按鈕狀態
    const [shareButtonState, setShareButtonState] = React.useState('normal'); // 'normal', 'copying', 'success', 'error'

    // 左滑刪除狀態管理
    const [swipeStates, setSwipeStates] = React.useState({});

    // Simplified animation state - only keep basic spinning state
    const [touchStart, setTouchStart] = React.useState(null);
    const [touchEnd, setTouchEnd] = React.useState(null);

    // Keen Slider integration - basic architecture
    const [keenSlider, setKeenSlider] = React.useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
    const [sliderRestaurants, setSliderRestaurants] = React.useState([]);
    const sliderRef = React.useRef(null);

    // Simple spinning logic (adopting test file approach) - moved here to fix undefined error
    const [spinningState, setSpinningState] = React.useState({
      isActive: false,
      intervalId: null,
      targetRestaurant: null,
      spinsRemaining: 0
    });

    // Basic navigation functions (adopting test file logic)
    const nextSlide = React.useCallback(() => {
      if (keenSlider && !(isSpinning || spinningState.isActive)) {
        keenSlider.next();
        console.log('⏭️ Keen Slider 下一張');
      }
    }, [keenSlider, isSpinning, spinningState.isActive]);

    const previousSlide = React.useCallback(() => {
      if (keenSlider && !(isSpinning || spinningState.isActive)) {
        keenSlider.prev();
        console.log('⏮️ Keen Slider 上一張');
      }
    }, [keenSlider, isSpinning, spinningState.isActive]);

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
        isSpinning: isSpinning || spinningState.isActive,
        onSpin,
        onPreviousRestaurant,
        // Add navigation functions for touch control
        nextSlide,
        previousSlide
      });
    }, [swipeStates, onRemoveCandidate, touchStart, touchEnd, isSpinning, spinningState.isActive, onSpin, onPreviousRestaurant, nextSlide, previousSlide]);

    // 使用共用的導航URL生成函數
    const getDirectionsUrl = React.useCallback((restaurant) => {
      return window.getDirectionsUrl(restaurant, userLocation, userAddress, language);
    }, [userLocation, userAddress, language]);

    // 檢查當前餐廳是否已在候選清單中
    const isRestaurantInCandidates = React.useMemo(() => {
      return finalRestaurant && candidateList.some(candidate =>
        (candidate.place_id && finalRestaurant.place_id && candidate.place_id === finalRestaurant.place_id) ||
        (candidate.name && finalRestaurant.name && candidate.name === finalRestaurant.name)
      );
    }, [finalRestaurant, candidateList]);

    // 創建按鈕邏輯處理器 - updated for simple spinning
    const buttonLogic = React.useMemo(() => {
      return window.createButtonLogic({
        finalRestaurant,
        candidateList,
        translations,
        buttonClickState,
        setButtonClickState,
        isSpinning: isSpinning || spinningState.isActive, // Use either external or internal spinning state
        onAddCandidate,
        onSpin,
        isRestaurantInCandidates,
        // Add simple spinning functions
        startSimpleSpinning,
        stopSimpleSpinning,
        sliderRestaurants
      });
    }, [finalRestaurant, candidateList, translations, buttonClickState, isSpinning, spinningState.isActive, onAddCandidate, onSpin, isRestaurantInCandidates, startSimpleSpinning, stopSimpleSpinning, sliderRestaurants]);

    // 創建分享按鈕邏輯處理器
    const shareButtonLogic = React.useMemo(() => {
      return window.createShareButtonLogic({
        setShareButtonState,
        getDirectionsUrl,
        translations
      });
    }, [setShareButtonState, getDirectionsUrl, translations]);

    // 創建鍵盤事件處理器
    const keyboardHandler = React.useMemo(() => {
      return window.createKeyboardHandler({
        isSpinning: isSpinning || spinningState.isActive,
        finalRestaurant,
        candidateList,
        onSpin,
        onAddCandidate,
        // Add navigation functions for keyboard control
        nextSlide,
        previousSlide
      });
    }, [isSpinning, spinningState.isActive, finalRestaurant, candidateList, onSpin, onAddCandidate, nextSlide, previousSlide]);

    // 設置鍵盤事件監聽
    React.useEffect(() => {
      return keyboardHandler.setupKeyboardListeners();
    }, [keyboardHandler]);

    // 設置原生觸控事件監聽器避免 passive 問題
    React.useEffect(() => {
      const candidateElements = document.querySelectorAll('[data-swipe-index]');
      
      const handlers = [];
      candidateElements.forEach((element, domIndex) => {
        const swipeIndex = parseInt(element.getAttribute('data-swipe-index'));
        
        const moveHandler = (e) => {
          if (touchHandlers) {
            touchHandlers.handleTouchMove(e, swipeIndex);
          }
        };
        
        element.addEventListener('touchmove', moveHandler, { passive: false });
        handlers.push({ element, handler: moveHandler });
      });
      
      return () => {
        handlers.forEach(({ element, handler }) => {
          element.removeEventListener('touchmove', handler);
        });
      };
    }, [candidateList, touchHandlers]);

    // 已經在上面定義過了，移除重複

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

    // 已經在上面定義過了，移除重複

    // Keen Slider initialization - adopting test file logic with dynamic content support
    React.useEffect(() => {
      if (!sliderRef.current || !window.KeenSlider) return;

      console.log('🔧 初始化 Keen Slider...');

      // Initialize slider with basic configuration (loop: false, slides: {perView: 1})
      // Disable built-in touch/drag to prevent conflicts with custom touch handlers
      const slider = new window.KeenSlider(sliderRef.current, {
        initial: 0,
        loop: false,
        drag: false, // Disable built-in drag to prevent conflicts
        slides: {
          perView: 1,
          spacing: 0
        },
        slideChanged(s) {
          const newIndex = s.track.details.rel;
          setCurrentSlideIndex(newIndex);

          // Log current restaurant info for debugging
          if (sliderRestaurants[newIndex]) {
            const restaurant = sliderRestaurants[newIndex];
            console.log('📍 Keen Slider 滑動到:', newIndex, '-', restaurant.name_zh || restaurant.name);
          } else {
            console.log('📍 Keen Slider 滑動到:', newIndex);
          }
        }
      });

      setKeenSlider(slider);
      console.log('✅ Keen Slider 初始化完成');

      // Cleanup function
      return () => {
        if (slider) {
          slider.destroy();
          console.log('🧹 Keen Slider 已清理');
        }
      };
    }, []);

    // Update slider when content changes - ensure slider updates properly
    React.useEffect(() => {
      if (keenSlider && sliderRestaurants.length > 0) {
        // Update slider to reflect new content
        keenSlider.update();
        console.log('🔄 Keen Slider 內容已更新, 總數:', sliderRestaurants.length);
        
        // Reset to first slide if current index is out of bounds
        if (currentSlideIndex >= sliderRestaurants.length) {
          keenSlider.moveToIdx(0);
          setCurrentSlideIndex(0);
          console.log('🔄 重置到第一張 slide');
        }
      }
    }, [keenSlider, sliderRestaurants, currentSlideIndex]);

    // Function to convert restaurant data to Keen Slider slides
    const convertRestaurantToSlideData = React.useCallback((restaurant) => {
      if (!restaurant) return null;
      
      return {
        id: restaurant.place_id || restaurant.id || `restaurant-${Date.now()}`,
        name: restaurant.name,
        name_zh: restaurant.name_zh,
        name_en: restaurant.name_en,
        image: restaurant.image,
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        distance: restaurant.distance,
        priceLevel: restaurant.priceLevel,
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        place_id: restaurant.place_id,
        // Ensure image is properly handled for display
        isPreloaded: !!restaurant.image
      };
    }, []);

    // Function to dynamically update slider content
    const updateSliderContent = React.useCallback((restaurants) => {
      if (!Array.isArray(restaurants)) {
        console.warn('⚠️ updateSliderContent: restaurants must be an array');
        return;
      }

      // Convert restaurant data to slide format
      const slideData = restaurants
        .map(convertRestaurantToSlideData)
        .filter(Boolean); // Remove null entries

      setSliderRestaurants(slideData);
      console.log('📊 更新 Keen Slider 餐廳數據:', slideData.length, '家餐廳');
      
      // Log restaurant names for debugging
      if (slideData.length > 0) {
        const names = slideData.map(r => r.name_zh || r.name).join(', ');
        console.log('🍽️ 餐廳列表:', names);
      }
    }, [convertRestaurantToSlideData]);

    // Function to add single restaurant to slider
    const addRestaurantToSlider = React.useCallback((restaurant) => {
      if (!restaurant) return;
      
      const slideData = convertRestaurantToSlideData(restaurant);
      if (slideData) {
        setSliderRestaurants(prev => {
          // Check if restaurant already exists
          const exists = prev.some(r => 
            (r.place_id && slideData.place_id && r.place_id === slideData.place_id) ||
            (r.name === slideData.name)
          );
          
          if (!exists) {
            const updated = [...prev, slideData];
            console.log('➕ 添加餐廳到 Keen Slider:', slideData.name_zh || slideData.name);
            return updated;
          }
          return prev;
        });
      }
    }, [convertRestaurantToSlideData]);

    // Function to get current restaurant from slider
    const getCurrentRestaurant = React.useCallback(() => {
      if (sliderRestaurants.length > 0 && currentSlideIndex < sliderRestaurants.length) {
        return sliderRestaurants[currentSlideIndex];
      }
      return null;
    }, [sliderRestaurants, currentSlideIndex]);

    // Simplified image preloading - integrated with preload pool
    const ensureImagePreloaded = React.useCallback((restaurant) => {
      if (!restaurant?.image || preloadPool.has(restaurant.image)) return;

      // Add to preload pool if not already there
      setPreloadPool(prev => {
        if (prev.has(restaurant.image)) return prev;
        
        const newPool = new Map(prev);
        newPool.set(restaurant.image, {
          restaurant: restaurant,
          isLoaded: false,
          imageObject: null
        });

        // Preload image
        const img = new Image();
        img.onload = () => {
          setPreloadPool(current => {
            const updated = new Map(current);
            if (updated.has(restaurant.image)) {
              updated.set(restaurant.image, {
                ...updated.get(restaurant.image),
                isLoaded: true,
                imageObject: img
              });
            }
            return updated;
          });
          console.log('🖼️ 即時預載入完成:', restaurant.name_zh || restaurant.name);
        };

        img.onerror = () => {
          console.warn('⚠️ 即時預載入失敗:', restaurant.image);
          setPreloadPool(current => {
            const updated = new Map(current);
            if (updated.has(restaurant.image)) {
              updated.set(restaurant.image, {
                ...updated.get(restaurant.image),
                isLoaded: true,
                imageObject: null
              });
            }
            return updated;
          });
        };

        img.src = restaurant.image;
        return newPool;
      });
    }, [preloadPool]);

    // Ensure current restaurant image is preloaded
    React.useEffect(() => {
      if (finalRestaurant?.image) {
        ensureImagePreloaded(finalRestaurant);
      }
    }, [finalRestaurant, ensureImagePreloaded]);

    // Preload pool state - simplified architecture
    const [preloadPool, setPreloadPool] = React.useState(new Map());
    const [backgroundRestaurants, setBackgroundRestaurants] = React.useState([]);

    // Simplified preload pool management - adopting test file approach
    const managePreloadPool = React.useCallback(async (currentRestaurant) => {
      if (!currentRestaurant || !selectedMealTime) return;

      try {
        // Get available restaurants from cache (simplified trigger logic)
        const cachedRestaurants = window.getAvailableRestaurantsFromCache ? 
          await window.getAvailableRestaurantsFromCache(selectedMealTime) : [];

        console.log('🔄 管理預載入池，快取餐廳數量:', cachedRestaurants.length);

        // Filter out already shown restaurants
        const history = window.getRestaurantHistory ? window.getRestaurantHistory() : [];
        const historyArray = Array.isArray(history) ? history : [];
        const availableRestaurants = cachedRestaurants.filter(cached => {
          return !historyArray.some(shown => shown.place_id === cached.place_id) &&
                 cached.place_id !== currentRestaurant.place_id;
        });

        console.log('🍽️ 可用餐廳數量:', availableRestaurants.length);

        // Update background restaurants for slider content
        setBackgroundRestaurants(availableRestaurants.slice(0, 10)); // Keep first 10 for performance

        // Simplified preload logic - preload next 5 restaurant images
        const restaurantsToPreload = availableRestaurants.slice(0, 5);
        
        setPreloadPool(prevPool => {
          const newPool = new Map(prevPool);
          
          restaurantsToPreload.forEach((restaurant, index) => {
            if (restaurant.image && !newPool.has(restaurant.image)) {
              // Create preload entry
              newPool.set(restaurant.image, {
                restaurant: restaurant,
                isLoaded: false,
                imageObject: null
              });

              // Preload image asynchronously
              const img = new Image();
              img.onload = () => {
                setPreloadPool(current => {
                  const updated = new Map(current);
                  if (updated.has(restaurant.image)) {
                    updated.set(restaurant.image, {
                      ...updated.get(restaurant.image),
                      isLoaded: true,
                      imageObject: img
                    });
                  }
                  return updated;
                });
                console.log('🖼️ 預載入完成:', restaurant.name_zh || restaurant.name);
              };

              img.onerror = () => {
                console.warn('⚠️ 預載入失敗:', restaurant.image);
                setPreloadPool(current => {
                  const updated = new Map(current);
                  if (updated.has(restaurant.image)) {
                    updated.set(restaurant.image, {
                      ...updated.get(restaurant.image),
                      isLoaded: true,
                      imageObject: null
                    });
                  }
                  return updated;
                });
              };

              img.src = restaurant.image;
            }
          });

          return newPool;
        });

        // Background refill trigger - simplified logic
        const BACKGROUND_REFILL_THRESHOLD = 5;
        if (availableRestaurants.length <= BACKGROUND_REFILL_THRESHOLD && availableRestaurants.length > 0 && userLocation) {
          console.log('🔄 觸發幕後補充餐廳，剩餘:', availableRestaurants.length);
          
          // Background restaurant refill (preserve existing functionality)
          setTimeout(async () => {
            try {
              if (window.getRandomRestaurant) {
                console.log('🔍 開始幕後補充餐廳');
                await window.getRandomRestaurant(userLocation, selectedMealTime, {
                  baseUnit: 1000,
                  unitMultiplier: 2,
                  backgroundRefill: true // Mark as background refill
                });
                console.log('✅ 幕後餐廳補充完成');
              }
            } catch (error) {
              console.warn('⚠️ 幕後補充失敗:', error);
            }
          }, 1000);
        }

      } catch (error) {
        console.warn('⚠️ 預載入池管理失敗:', error);
      }
    }, [selectedMealTime, userLocation]);

    // Update slider content with preloaded restaurants - ensure preloaded images display correctly
    React.useEffect(() => {
      if (finalRestaurant) {
        // Combine current restaurant with background restaurants for slider
        const allRestaurants = [finalRestaurant, ...backgroundRestaurants.slice(0, 9)]; // Current + 9 background
        
        // Mark restaurants as preloaded if they exist in preload pool
        const restaurantsWithPreloadStatus = allRestaurants.map(restaurant => ({
          ...restaurant,
          isPreloaded: restaurant.image ? preloadPool.has(restaurant.image) && preloadPool.get(restaurant.image).isLoaded : false
        }));

        updateSliderContent(restaurantsWithPreloadStatus);
        console.log('🔄 更新滑動器內容，總餐廳數:', restaurantsWithPreloadStatus.length);
      }
    }, [finalRestaurant, backgroundRestaurants, preloadPool, updateSliderContent]);

    // Trigger preload pool management when restaurant changes
    React.useEffect(() => {
      if (finalRestaurant) {
        managePreloadPool(finalRestaurant);
      }
    }, [finalRestaurant, managePreloadPool]);



    // Start simple spinning animation with timer + nextSlide
    const startSimpleSpinning = React.useCallback((targetRestaurant = null) => {
      if (spinningState.isActive || !keenSlider || sliderRestaurants.length === 0) {
        console.log('⚠️ 無法開始轉動: 已在轉動中或滑動器未準備好');
        return;
      }

      // Generate random number of spins (3-8 spins like test file)
      const randomSpins = 3 + Math.floor(Math.random() * 6);
      console.log('🎰 開始簡單轉動邏輯, 轉動次數:', randomSpins);

      setSpinningState({
        isActive: true,
        intervalId: null,
        targetRestaurant,
        spinsRemaining: randomSpins
      });

      let currentSpins = 0;
      const spinInterval = setInterval(() => {
        // Move to next slide
        keenSlider.next();
        currentSpins++;
        
        console.log(`🎰 轉動進度: ${currentSpins}/${randomSpins}`);

        // Check if spinning should stop
        if (currentSpins >= randomSpins) {
          clearInterval(spinInterval);
          
          // Update spinning state
          setSpinningState({
            isActive: false,
            intervalId: null,
            targetRestaurant: null,
            spinsRemaining: 0
          });

          console.log('🎉 簡單轉動完成！');
          
          // Get current restaurant after spinning
          const finalRestaurant = getCurrentRestaurant();
          if (finalRestaurant) {
            console.log('🍽️ 最終餐廳:', finalRestaurant.name_zh || finalRestaurant.name);
          }

          // Trigger external callback if provided
          if (onSpin && typeof onSpin === 'function') {
            // Call onSpin with false to indicate spinning has stopped
            setTimeout(() => onSpin(false), 100);
          }
        }
      }, 300); // 300ms interval like test file

      // Store interval ID for cleanup
      setSpinningState(prev => ({
        ...prev,
        intervalId: spinInterval
      }));

    }, [keenSlider, sliderRestaurants.length, spinningState.isActive, getCurrentRestaurant, onSpin]);

    // Stop spinning if needed
    const stopSimpleSpinning = React.useCallback(() => {
      if (spinningState.intervalId) {
        clearInterval(spinningState.intervalId);
        setSpinningState({
          isActive: false,
          intervalId: null,
          targetRestaurant: null,
          spinsRemaining: 0
        });
        console.log('🛑 轉動已停止');
      }
    }, [spinningState.intervalId]);

    // Cleanup spinning interval on unmount
    React.useEffect(() => {
      return () => {
        if (spinningState.intervalId) {
          clearInterval(spinningState.intervalId);
        }
      };
    }, [spinningState.intervalId]);

    // Handle external spinning trigger
    React.useEffect(() => {
      if (isSpinning && !spinningState.isActive && sliderRestaurants.length > 0) {
        // Start simple spinning when external isSpinning becomes true
        startSimpleSpinning();
      } else if (!isSpinning && spinningState.isActive) {
        // Stop spinning when external isSpinning becomes false
        stopSimpleSpinning();
      }
    }, [isSpinning, spinningState.isActive, sliderRestaurants.length, startSimpleSpinning, stopSimpleSpinning]);

    // Create slide transition function for external use
    const slideTransitionFunction = React.useCallback((currentRestaurant, newRestaurant, direction, onComplete) => {
      // Simple slide transition using Keen Slider
      console.log('🎬 執行滑動轉場:', {
        from: currentRestaurant?.name_zh || currentRestaurant?.name,
        to: newRestaurant?.name_zh || newRestaurant?.name,
        direction
      });

      // Add the new restaurant to slider if not already present
      if (newRestaurant && !sliderRestaurants.find(r => r.place_id === newRestaurant.place_id)) {
        addRestaurantToSlider(newRestaurant);
      }

      // Perform slide transition
      if (direction === 'left') {
        nextSlide();
      } else {
        previousSlide();
      }

      // Complete the transition after animation
      setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 300); // Match Keen Slider animation duration
    }, [nextSlide, previousSlide, addRestaurantToSlider, sliderRestaurants]);

    // Expose utility functions for external use - including preload pool functions
    React.useEffect(() => {
      // Make functions available to parent components
      if (typeof onTriggerSlideTransition === 'function') {
        // Register the slide transition function
        onTriggerSlideTransition(slideTransitionFunction);

        // Also expose utility functions as before (for backward compatibility)
        if (window.slotMachineUtils) {
          window.slotMachineUtils = {
            updateSliderContent,
            addRestaurantToSlider,
            getCurrentRestaurant,
            nextSlide,
            previousSlide,
            startSimpleSpinning,
            stopSimpleSpinning,
            currentSlideIndex,
            totalSlides: sliderRestaurants.length,
            isSpinningActive: spinningState.isActive,
            // Preload pool functions
            managePreloadPool,
            ensureImagePreloaded,
            preloadPoolSize: preloadPool.size,
            backgroundRestaurantsCount: backgroundRestaurants.length
          };
        }
      }
    }, [
      slideTransitionFunction,
      onTriggerSlideTransition,
      updateSliderContent,
      addRestaurantToSlider,
      getCurrentRestaurant,
      nextSlide,
      previousSlide,
      startSimpleSpinning,
      stopSimpleSpinning,
      currentSlideIndex,
      sliderRestaurants.length,
      spinningState.isActive,
      managePreloadPool,
      ensureImagePreloaded,
      preloadPool.size,
      backgroundRestaurants.length
    ]);

    // 老虎機的 HTML 結構
    return (
      <div className="w-full max-w-2xl mx-auto glow-container rounded-t-lg" data-name="slot-machine" data-file="components/SlotMachine.js">
        <div className="text-center">
          {/* Slot Machine Title with Preload Indicator */}
          <div className="mb-4 px-4 relative">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg text-center">
              {translations.slotMachineTitle}
            </h2>
            {/* Moved Preload Status Indicator */}
            {finalRestaurant && finalRestaurant.image && (
              <div className="absolute top-0 right-0 pointer-events-none">
                {preloadPool.has(finalRestaurant.image) ? (
                  preloadPool.get(finalRestaurant.image).isLoaded ? (
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      ✓ Preloaded
                    </div>
                  ) : (
                    <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-medium">
                      Loading...
                    </div>
                  )
                ) : (
                  <div className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Not in pool
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Keen Slider Container - Basic Architecture with Touch Integration */}
          <div
            ref={sliderRef}
            className="keen-slider group rounded-t-lg h-64 overflow-hidden relative select-none"
            {...(touchHandlers ? {
              onTouchStart: touchHandlers.handleImageTouchStart,
              onTouchMove: touchHandlers.handleImageTouchMove,
              onTouchEnd: touchHandlers.handleImageTouchEnd
            } : {})}
          >
            {/* Keen Slider Slides - Dynamic Content Structure */}
            {sliderRestaurants.map((restaurant, index) => (
              <div key={restaurant.id || `slide-${index}`} className="keen-slider__slide">
                <div 
                  className="restaurant-card w-full h-full relative"
                  style={{
                    backgroundImage: (() => {
                      // Use preloaded image if available, otherwise fallback to original URL
                      if (restaurant.image && preloadPool.has(restaurant.image)) {
                        const poolItem = preloadPool.get(restaurant.image);
                        if (poolItem.isLoaded && poolItem.imageObject) {
                          return `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${poolItem.imageObject.src})`;
                        }
                      }
                      
                      // Fallback to original image or gradient
                      return restaurant.image 
                        ? `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${restaurant.image})`
                        : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
                    })(),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  data-restaurant-id={restaurant.id}
                  data-restaurant-name={restaurant.name_zh || restaurant.name}
                >
                  {/* Restaurant Content */}
                  <div className="restaurant-content absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                    {(isSpinning || spinningState.isActive) ? (
                      <div className="text-xl font-bold drop-shadow-lg">
                        🎰 {translations.spinning || 'Spinning...'}
                      </div>
                    ) : (
                      <>
                        {/* Restaurant Name - Primary - Clickable for navigation */}
                        <div 
                          className="text-2xl font-bold drop-shadow-lg mb-1 cursor-pointer hover:text-yellow-300 transition-colors"
                          onClick={() => finalRestaurant && !(isSpinning || spinningState.isActive) && onImageClick && onImageClick()}
                          title="點擊查看Google地圖照片"
                        >
                          {restaurant.name_zh || restaurant.name}
                        </div>
                        
                        {/* Restaurant Name - English (if different) */}
                        {restaurant.name_en && restaurant.name_en !== (restaurant.name_zh || restaurant.name) && (
                          <div className="text-lg text-gray-200 drop-shadow mb-2">
                            {restaurant.name_en}
                          </div>
                        )}
                        
                        {/* Distance Information - Clickable for navigation */}
                        {restaurant.distance && (
                          <div 
                            className="text-sm drop-shadow cursor-pointer hover:text-yellow-300 transition-colors"
                            onClick={() => finalRestaurant && !(isSpinning || spinningState.isActive) && onImageClick && onImageClick()}
                            title="點擊查看Google地圖照片"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <div className="icon-map text-sm"></div>
                              <span>{restaurant.distance} km</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Price Level Tag */}
                  {!(isSpinning || spinningState.isActive) && restaurant.priceLevel && (
                    <div className="absolute bottom-10 left-4 pointer-events-none">
                      <div className="bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold">
                        {priceLabels[language]?.[restaurant.priceLevel] || priceLabels.en[restaurant.priceLevel]}
                      </div>
                    </div>
                  )}

                  {/* Rating and Cuisine Tags */}
                  {!(isSpinning || spinningState.isActive) && restaurant && (
                    <div className="absolute bottom-2 left-4 pointer-events-none">
                      <div className="flex items-center gap-2">
                        {/* Rating Display */}
                        {restaurant.rating && restaurant.rating > 0 && (
                          <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            <span className="flex items-center">{renderStars(restaurant.rating)}</span>
                            <span>{restaurant.rating}</span>
                            {restaurant.reviewCount && restaurant.reviewCount > 0 && (
                              <span>({restaurant.reviewCount.toLocaleString()})</span>
                            )}
                          </div>
                        )}

                        {/* Cuisine Type Tags */}
                        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                          <div className="flex gap-1">
                            {restaurant.cuisine.slice(0, 2).map((type, typeIndex) => (
                              <div key={typeIndex} className="bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded text-xs">
                                {type}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Arrow Buttons - Left and Right */}
                  {!(isSpinning || spinningState.isActive) && (
                    <>
                      {/* Left Arrow - Previous Restaurant */}
                      <button
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all duration-200 z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviousRestaurant && onPreviousRestaurant();
                        }}
                        title="回到上一家餐廳"
                      >
                        <div className="icon-chevron-left text-white text-xl"></div>
                      </button>

                      {/* Right Arrow - Next Restaurant */}
                      <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all duration-200 z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🔜 右箭頭被點擊，使用輪盤按鈕邏輯');
                          buttonLogic.handleSpinClick();
                        }}
                        title="搜尋下一家餐廳"
                      >
                        <div className="icon-chevron-right text-white text-xl"></div>
                      </button>
                    </>
                  )}

                  {/* Copy Google Maps Link Button - Top Right Corner (from old version) */}
                  {finalRestaurant && !(isSpinning || spinningState.isActive) && (
                    <div
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm z-30 ${
                        shareButtonState === 'copying' ? 'bg-blue-500 bg-opacity-80 scale-110' :
                        shareButtonState === 'success' ? 'bg-green-500 bg-opacity-80 scale-110' :
                        shareButtonState === 'error' ? 'bg-red-500 bg-opacity-80 scale-110' :
                        'bg-black bg-opacity-50 hover:bg-opacity-70'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (shareButtonState === 'normal') {
                          shareButtonLogic.handleShareClick(finalRestaurant);
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
                              borderRadius: '2px'
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Fallback slide when no restaurant data */}
            {sliderRestaurants.length === 0 && (
              <div className="keen-slider__slide">
                <div 
                  className="restaurant-card w-full h-full relative"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                  }}
                >
                  <div className="restaurant-content absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                    <div className="text-xl font-bold drop-shadow-lg">
                      {translations.noRestaurant || 'No restaurant found'}
                    </div>
                  </div>
                </div>
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

          {/* 刪除分享和導航按鈕區塊，合併上下區塊 */}

          {/* Candidate List Display */}
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
                      className="relative overflow-hidden"
                      data-swipe-index={index}
                      onTouchStart={(e) => touchHandlers.handleTouchStart(e, index)}
                      onTouchEnd={(e) => touchHandlers.handleTouchEnd(e, index)}
                      style={{
                        height: swipeStates[index]?.isDeleting ? '0px' : '96px', // h-24 = 96px
                        transition: swipeStates[index]?.isDeleting ? 'height 0.25s ease-out' : 'none'
                      }}
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
                          transition: swipeStates[index]?.isSwiping
                            ? 'none'
                            : swipeStates[index]?.isDeleting
                              ? 'transform 0.25s ease-out, opacity 0.25s ease-out'
                              : 'transform 0.3s ease-out',
                          opacity: swipeStates[index]?.isDeleting ? 0 : 1
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
    console.error('SlotMachine component error:', error);
    return (
      <div className="w-full max-w-2xl mx-auto glow-container rounded-t-lg p-4">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">⚠️ Component Error</h2>
          <p className="text-sm">SlotMachine component encountered an error. Please refresh the page.</p>
        </div>
      </div>
    );
  }
}

// Export the component
window.SlotMachine = SlotMachine;
