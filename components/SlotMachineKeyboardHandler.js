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
 * @returns {Object} 鍵盤事件處理器對象
 */
const createKeyboardHandler = (params) => {
  const {
    isSpinning,
    finalRestaurant,
    candidateList,
    onSpin,
    onAddCandidate
  } = params;

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
