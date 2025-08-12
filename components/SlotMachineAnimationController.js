// SlotMachineAnimationController.js
// 🎬 動畫控制模塊 - 智能動畫控制邏輯和動畫類別管理

/**
 * 獲取當前動畫類別 - 使用固定速度避免變速卡頓
 * @param {string} animationPhase - 當前動畫階段
 * @returns {string} CSS 動畫類別名稱
 */
const getAnimationClass = (animationPhase) => {
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

/**
 * 創建動畫控制器
 * @param {Object} params - 參數對象
 * @param {boolean} params.isSpinning - 是否正在轉動
 * @param {Object} params.finalRestaurant - 當前餐廳
 * @param {string} params.animationPhase - 動畫階段
 * @param {Array} params.apiWaitingSequenceCache - API等待序列快取
 * @param {Array} params.slotImages - slot圖片陣列
 * @param {Map} params.preloadedImages - 預載入圖片池
 * @param {Function} params.setAnimationPhase - 設置動畫階段
 * @param {Function} params.setApiWaitingLevel - 設置API等待級別
 * @param {Function} params.setScrollingNames - 設置滾動名稱
 * @returns {Object} 動畫控制器對象
 */
const createAnimationController = (params) => {
  const {
    isSpinning,
    finalRestaurant,
    animationPhase,
    apiWaitingSequenceCache,
    slotImages,
    preloadedImages,
    setAnimationPhase,
    setApiWaitingLevel,
    setScrollingNames
  } = params;

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
  const handleAnimationLogic = () => {
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
        const shuffledSlots = window.shuffleArray(slotImages);

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
        const animationResult = window.createDynamicAnimation(actualSequenceLength, 0.5);
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
  };

  return {
    handleAnimationLogic,
    getAnimationClass: () => getAnimationClass(animationPhase)
  };
};

// 註冊到全局變數
window.createAnimationController = createAnimationController;
window.getAnimationClass = getAnimationClass;
