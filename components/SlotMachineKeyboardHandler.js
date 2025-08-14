// SlotMachineKeyboardHandler.js
// ⌨️ 鍵盤事件處理模塊 - 處理桌面端鍵盤快捷鍵功能

/**
 * 創建鍵盤事件處理器
 * @param {Object} params - 參數對象
 * @param {boolean} params.isSpinning - 是否正在轉動
 * @param {Object} params.finalRestaurant - 當前餐廳
 * @param {Array} params.candidateList - 候選列表
 * @param {Function} params.onSpin - 轉動回調函數
 * @param {Function} params.onAddCandidate - 加入候選回調函數
 * @param {Function} params.nextSlide - Keen Slider 下一張函數
 * @param {Function} params.previousSlide - Keen Slider 上一張函數
 * @returns {Object} 鍵盤事件處理器對象
 */
const createKeyboardHandler = (params) => {
  const {
    isSpinning,
    finalRestaurant,
    candidateList,
    onSpin,
    onAddCandidate,
    nextSlide,
    previousSlide
  } = params;

  // 鍵盤事件處理（電腦）- 整合 Keen Slider 導航控制
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && !isSpinning) {
      // 左箭頭：使用 Keen Slider 的 previousSlide 函數
      if (previousSlide && typeof previousSlide === 'function') {
        previousSlide();
        console.log('⌨️ 鍵盤左箭頭 - 上一張');
      } else {
        // 回退到原有邏輯
        onSpin(false);
      }
    }
    if (e.key === 'ArrowRight' && !isSpinning) {
      // 右箭頭：使用 Keen Slider 的 nextSlide 函數
      if (nextSlide && typeof nextSlide === 'function') {
        nextSlide();
        console.log('⌨️ 鍵盤右箭頭 - 下一張');
      } else {
        // 回退到原有邏輯
        onSpin(false);
      }
    }
    if (e.key === 'Enter' && finalRestaurant && !isSpinning && candidateList.length < 9) {
      // Enter：加入候選
      onAddCandidate();
    }
    if (e.key === ' ' && !isSpinning) {
      // 空白鍵：轉動（採用測試檔案邏輯）
      e.preventDefault();
      onSpin(false);
      console.log('⌨️ 鍵盤空白鍵 - 轉動');
    }
  };

  // 設置鍵盤事件監聽器
  const setupKeyboardListeners = () => {
    window.addEventListener('keydown', handleKeyDown);
    
    // 返回清理函數
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  };

  return {
    handleKeyDown,
    setupKeyboardListeners
  };
};

// 註冊到全局變數
window.createKeyboardHandler = createKeyboardHandler;
