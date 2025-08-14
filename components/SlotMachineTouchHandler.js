// SlotMachineTouchHandler.js
// 📱 觸控事件處理模塊 - 處理候選列表左滑刪除和圖片滑動功能

/**
 * 創建觸控事件處理器
 * @param {Object} params - 參數對象
 * @param {Function} params.setSwipeStates - 設置滑動狀態的函數
 * @param {Object} params.swipeStates - 當前滑動狀態
 * @param {Function} params.onRemoveCandidate - 移除候選的回調函數
 * @param {Function} params.setTouchStart - 設置觸控開始位置
 * @param {Function} params.setTouchEnd - 設置觸控結束位置
 * @param {number} params.touchStart - 觸控開始位置
 * @param {number} params.touchEnd - 觸控結束位置
 * @param {boolean} params.isSpinning - 是否正在轉動
 * @param {Function} params.onSpin - 轉動回調函數
 * @param {Function} params.onPreviousRestaurant - 上一家餐廳回調函數
 * @param {Function} params.nextSlide - Keen Slider 下一張函數
 * @param {Function} params.previousSlide - Keen Slider 上一張函數
 * @returns {Object} 觸控事件處理器對象
 */
const createTouchHandlers = (params) => {
  const {
    setSwipeStates,
    swipeStates,
    onRemoveCandidate,
    setTouchStart,
    setTouchEnd,
    touchStart,
    touchEnd,
    isSpinning,
    onSpin,
    onPreviousRestaurant,
    nextSlide,
    previousSlide
  } = params;



  // 候選列表左滑刪除 - 觸控開始
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

  // 候選列表左滑刪除 - 觸控移動
  const handleTouchMove = (e, index) => {
    if (!swipeStates[index]) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStates[index].startX;
    const deltaY = touch.clientY - swipeStates[index].startY;

    // 判斷是否為水平滑動（左滑）
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0 && Math.abs(deltaX) > 15) {
      // 只在事件可取消時才阻止預設行為
      if (e.cancelable) {
        e.preventDefault(); // 防止頁面滾動
      }

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
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  // 候選列表左滑刪除 - 觸控結束
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

    // 如果滑動距離超過閾值且不是快速點擊，則執行刪除動畫
    if (offsetX < threshold && duration > 100) {
      // 先設置刪除動畫狀態
      setSwipeStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          isDeleting: true,
          offsetX: -120, // 完全滑出
          isSwiping: false
        }
      }));

      // 延遲執行實際刪除，讓動畫播放完成
      setTimeout(() => {
        if (onRemoveCandidate) {
          onRemoveCandidate(index);
        }
        // 重新整理 swipeStates，將所有大於被刪除index的狀態向前移動
        setSwipeStates(prev => {
          const newState = {};
          Object.keys(prev).forEach(key => {
            const keyIndex = parseInt(key);
            if (keyIndex < index) {
              // 保留小於被刪除index的狀態
              newState[keyIndex] = prev[keyIndex];
            } else if (keyIndex > index) {
              // 將大於被刪除index的狀態向前移動一位
              newState[keyIndex - 1] = prev[keyIndex];
            }
            // 跳過等於被刪除index的狀態（即被刪除的元素）
          });
          return newState;
        });
      }, 250); // 250ms 動畫時間
    } else {
      // 滑動不足，彈回原位
      setSwipeStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          offsetX: 0,
          isSwiping: false
        }
      }));
      
      // 300ms 後清理狀態
      setTimeout(() => {
        setSwipeStates(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }, 300);
    }
  };

  // 圖片觸控滑動 - 觸控開始
  const handleImageTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // 圖片觸控滑動 - 觸控移動
  const handleImageTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // 圖片觸控滑動 - 觸控結束 (整合 Keen Slider 導航控制)
  const handleImageTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // 如果沒有滑動，可能是點擊或雙擊，不執行滑動邏輯
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // 左滑距離超過50px（下一張）
    const isRightSwipe = distance < -50; // 右滑距離超過50px（上一張）

    // 只有在明確的滑動手勢時才執行導航，避免與雙擊衝突
    if (Math.abs(distance) > 50 && !isSpinning) {
      if (isLeftSwipe) {
        // 左滑：使用 Keen Slider 的 nextSlide 函數
        if (nextSlide && typeof nextSlide === 'function') {
          nextSlide();
        } else {
          // 回退到原有邏輯
          onSpin(false);
        }
      } else if (isRightSwipe) {
        // 右滑：使用 Keen Slider 的 previousSlide 函數
        if (previousSlide && typeof previousSlide === 'function') {
          previousSlide();
        } else if (onPreviousRestaurant) {
          // 回退到原有邏輯
          onPreviousRestaurant();
        }
      }
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleImageTouchStart,
    handleImageTouchMove,
    handleImageTouchEnd
  };
};

// 註冊到全局變數
window.createTouchHandlers = createTouchHandlers;
