function SlotMachine({ isSpinning, onSpin, onAddCandidate, translations, finalRestaurant, candidateList = [], language, onClearList, onImageClick, userLocation, userAddress }) {
  try {
    const [scrollingNames, setScrollingNames] = React.useState([]);
    const [animationPhase, setAnimationPhase] = React.useState('idle'); // idle, fast, slow
    const [fastAnimationLevel, setFastAnimationLevel] = React.useState(1); // 1-5 漸進式減速級別
    const [touchStart, setTouchStart] = React.useState(null);
    const [touchEnd, setTouchEnd] = React.useState(null);
    
    // 價位標籤資料
    const priceLabels = {
      en: { 1: 'Budget', 2: 'Moderate', 3: 'Expensive', 4: 'Fine Dining' },
      zh: { 1: '經濟實惠', 2: '中等價位', 3: '高價位', 4: '精緻餐飲' },
      ja: { 1: 'リーズナブル', 2: '中価格帯', 3: '高価格帯', 4: '高級料理' },
      ko: { 1: '저렴한', 2: '중간 가격', 3: '비싼', 4: '고급 요리' },
      vi: { 1: 'Bình dân', 2: 'Trung bình', 3: 'Đắt tiền', 4: 'Sang trọng' },
      ms: { 1: 'Bajet', 2: 'Sederhana', 3: 'Mahal', 4: 'Mewah' }
    };
    
    // 導航URL生成函數（複製自RestaurantCard）
    const getDirectionsUrl = (restaurant) => {
      console.log('🗺️ 生成導航URL，當前userLocation:', userLocation);
      console.log('🗺️ 當前userAddress:', userAddress);
      console.log('🗺️ 餐廳地址:', restaurant.address);
      
      // 優先使用userAddress作為起點地址
      if (userAddress && restaurant.address) {
        const origin = encodeURIComponent(userAddress);
        const destination = encodeURIComponent(restaurant.address);
        const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
        console.log('🎯 最終導航URL:', finalUrl);
        console.log('🎯 導航起點地址:', userAddress);
        console.log('🎯 導航終點地址:', restaurant.address);
        return finalUrl;
      }

      // 回退到座標（如果有userLocation但沒有userAddress）
      if (userLocation && restaurant.address) {
        const origin = encodeURIComponent(`${userLocation.lat},${userLocation.lng}`);
        const destination = encodeURIComponent(restaurant.address);
        const finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&hl=${language === 'zh' ? 'zh-TW' : 'en'}`;
        console.log('🎯 使用座標的導航URL:', finalUrl);
        console.log('🎯 導航起點座標:', userLocation);
        console.log('🎯 導航終點地址:', restaurant.address);
        return finalUrl;
      }

      // 回退選項：直接導航到餐廳位置
      return restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ',' + restaurant.address)}`;
    };

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
        
        try {
          const response = await fetch(imagePath, { method: 'HEAD' });
          if (response.ok) {
            detectedImages.push(imagePath);
            console.log(`✅ 找到圖片 ${i}: ${imagePath}`);
          } else {
            console.log(`❌ 圖片 ${i} 不存在，停止偵測`);
            break;
          }
        } catch (error) {
          console.log(`❌ 圖片 ${i} 載入失敗，停止偵測`);
          break;
        }
      }

      console.log(`🎯 自動偵測完成！找到 ${detectedImages.length} 張slot圖片`);
      return detectedImages;
    }, []);

    // 🎯 動態生成CSS動畫 - 保持相同的動畫曲線和時間，只改變位置計算
    const createDynamicAnimation = React.useCallback((imageCount) => {
      const itemHeight = 256; // 每張圖片高度（h-64 = 256px）

      // 🎯 使用原來的邏輯：slot圖片 + 前2張 + 餐廳圖片（保持相同效果）
      const totalImages = imageCount + 2 + 1;
      const finalPosition = (totalImages - 1) * itemHeight; // 停在最後一張（餐廳圖片）

      // 保持原來的70%位置計算方式
      const midPosition = Math.floor((totalImages - 3) * itemHeight);

      // 🎯 快速動畫：移動所有slot圖片的距離，讓用戶看到所有圖片
      const fastScrollDistance = imageCount * itemHeight;

      console.log(`🎰 動態CSS計算: ${imageCount}張slot圖片 + 2張 + 1張餐廳 = ${totalImages}張總計`);
      console.log(`🎰 快速動畫距離: ${fastScrollDistance}px (${imageCount}張圖片)`);
      console.log(`🎰 70%位置: ${midPosition}px, 最終位置: ${finalPosition}px`);

      // 動態創建CSS keyframes - 包含快速和慢速動畫
      const keyframes = `
        @keyframes scrollFastDynamic {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-${fastScrollDistance}px);
          }
        }

        @keyframes scrollSlowStopDynamic {
          0% {
            transform: translateY(0);
            animation-timing-function: ease-out;
          }
          70% {
            transform: translateY(-${midPosition}px);
            animation-timing-function: ease-in;
          }
          100% {
            transform: translateY(-${finalPosition}px);
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

      console.log('🎨 動態CSS動畫已生成（快速+慢速）');
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
          console.log(`🎰 圖片數量已更新: ${detectedImages.length} 張（已亂數排序）`);
          
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
      const isLeftSwipe = distance > 50; // 左滑距離超過50px

      if (isLeftSwipe && !isSpinning) {
        // 左滑：搜尋下一家餐廳
        onSpin(false);
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

    // 修復後的動畫邏輯 - 解決無縫銜接問題
    React.useEffect(() => {
      if (isSpinning) {
        if (finalRestaurant && finalRestaurant.image) {
          // API已返回，執行無縫銜接邏輯
          console.log('🎰 API返回，開始無縫銜接動畫');
          setAnimationPhase('slow');

          // 🎲 每次轉動都亂數排序，增加隨機性
          const shuffledSlots = shuffleArray(slotImages);
          console.log('🎲 慢速階段使用亂數排序的圖片');

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
            console.log('🎰 動畫結束，觸發 slotAnimationEnd 事件');
            setAnimationPhase('idle');
            window.dispatchEvent(new CustomEvent('slotAnimationEnd'));
          }, 1050); // 稍微延長一點確保動畫完成

        } else {
          // API未返回，持續快速循環
          console.log('🎰 開始快速循環，等待API返回');
          setAnimationPhase('fast');
          setFastAnimationLevel(1); // 重置為最快級別

          // 🎲 快速循環時也使用亂數排序，每次都不同
          const fastSequence = [];
          for (let i = 0; i < 50; i++) {
            const shuffledSlots = shuffleArray(slotImages);
            fastSequence.push(...shuffledSlots);
          }
          console.log('🎲 快速階段使用50組亂數排序的圖片');
          setScrollingNames(fastSequence);
        }
      } else {
        setAnimationPhase('idle');
        setFastAnimationLevel(1); // 重置動畫級別
        setScrollingNames([]);
      }
    }, [isSpinning, finalRestaurant, shuffleArray]);

    // 漸進式減速邏輯 - 每0.5秒增加動畫級別
    React.useEffect(() => {
      let intervalId;

      if (animationPhase === 'fast' && !finalRestaurant) {
        console.log('🎰 開始漸進式減速，當前級別:', fastAnimationLevel);

        intervalId = setInterval(() => {
          setFastAnimationLevel(prevLevel => {
            const nextLevel = Math.min(prevLevel + 1, 5); // 最多到級別5
            console.log('🎰 動畫減速，級別:', prevLevel, '→', nextLevel);
            return nextLevel;
          });
        }, 500); // 每0.5秒切換
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [animationPhase, finalRestaurant, fastAnimationLevel]);

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
          
          {/* Restaurant Image Display */}
          <div 
            className="group rounded-t-lg mb-6 h-64 overflow-hidden relative cursor-pointer select-none"
            style={{
              backgroundImage: finalRestaurant && finalRestaurant.image ? 
                `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${finalRestaurant.image})` : 
                slotImages.length > 0 ? 
                  `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slotImages[slotImages.length - 1]})` : 
                  'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => finalRestaurant && !isSpinning && onImageClick && onImageClick()}
            title={finalRestaurant && !isSpinning ? "點擊查看Google地圖照片" : "左滑或按←鍵搜尋下一家餐廳"}
          >
            <div className={`flex flex-col items-center justify-center transition-transform duration-2000 ease-out pointer-events-none ${
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
                          <div className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                            {finalRestaurant.name}
                          </div>
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
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                    {finalRestaurant.name}
                  </div>
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
                <div className="text-xl font-bold text-white drop-shadow-lg py-8 flex items-center justify-center gap-2">
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
              )}
            </div>
            
            {/* Price Label - Bottom Left */}
            {finalRestaurant && !isSpinning && finalRestaurant.priceLevel && (
              <div className="absolute bottom-4 left-4 bg-[var(--accent-color)] text-black px-3 py-1 rounded-full font-semibold pointer-events-none">
                {priceLabels[language]?.[finalRestaurant.priceLevel] || priceLabels.en[finalRestaurant.priceLevel]}
              </div>
            )}
            
            {/* Hover Arrow - Right Side */}
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
                title="加入候選"
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
                  候選餐廳 ({candidateList.length}/9)
                </div>
                <button
                  onClick={onClearList}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  清除列表
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
