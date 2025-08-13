// SlotMachineButtonLogic.js
// 🔘 按鈕邏輯處理模塊 - 處理加入候選按鈕和分享按鈕的狀態和邏輯

/**
 * 檢查餐廳是否可以加入候選（營業狀態檢查）
 * @param {Object} restaurant - 餐廳對象
 * @returns {boolean} 是否可營業
 */
const isRestaurantOperational = (restaurant) => {
  if (!restaurant) return false;
  // 檢查營業狀態，只有OPERATIONAL的餐廳才能加入候選
  return !restaurant.businessStatus || restaurant.businessStatus === 'OPERATIONAL';
};

/**
 * 創建按鈕邏輯處理器
 * @param {Object} params - 參數對象
 * @param {Object} params.finalRestaurant - 當前餐廳
 * @param {Array} params.candidateList - 候選列表
 * @param {Object} params.translations - 翻譯對象
 * @param {string} params.buttonClickState - 按鈕點擊狀態
 * @param {Function} params.setButtonClickState - 設置按鈕狀態函數
 * @param {boolean} params.isSpinning - 是否正在轉動
 * @param {Function} params.onAddCandidate - 加入候選回調函數
 * @param {Function} params.onSpin - 轉動回調函數
 * @param {boolean} params.isRestaurantInCandidates - 餐廳是否已在候選中
 * @returns {Object} 按鈕邏輯處理器對象
 */
const createButtonLogic = (params) => {
  const {
    finalRestaurant,
    candidateList,
    translations,
    buttonClickState,
    setButtonClickState,
    isSpinning,
    onAddCandidate,
    onSpin,
    isRestaurantInCandidates
  } = params;

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

  // 處理輪盤按鈕點擊（重置加入按鈕狀態）
  const handleSpinClick = () => {
    setButtonClickState('normal');
    onSpin(false);
  };

  // 檢查按鈕是否應該被禁用
  const isAddButtonDisabled = () => {
    return !finalRestaurant || 
           candidateList.length >= 9 || 
           isSpinning || 
           !isRestaurantOperational(finalRestaurant);
  };

  // 獲取按鈕樣式
  const getAddButtonStyle = () => {
    return {
      background: !isRestaurantOperational(finalRestaurant) ?
        'linear-gradient(135deg, #9CA3AF, #6B7280)' : // 灰色漸層表示暫停營業
        'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
      borderColor: !isRestaurantOperational(finalRestaurant) ? '#6B7280' : 'var(--theme-primary)',
      touchAction: 'manipulation',
      transition: 'none',
      margin: 0,
      opacity: (!finalRestaurant || candidateList.length >= 9 || !isRestaurantOperational(finalRestaurant)) ? 0.3 : (isSpinning ? 0.5 : 1),
      cursor: (!finalRestaurant || candidateList.length >= 9 || isSpinning || !isRestaurantOperational(finalRestaurant)) ? 'not-allowed' : 'pointer'
    };
  };

  // 獲取按鈕標題
  const getAddButtonTitle = () => {
    if (finalRestaurant && candidateList.length < 9 && isRestaurantOperational(finalRestaurant)) {
      return translations.addCandidate;
    }
    if (!isRestaurantOperational(finalRestaurant)) {
      return '餐廳暫停營業，無法加入候選';
    }
    return '';
  };

  return {
    getAddCandidateButtonText,
    handleAddCandidateClick,
    handleSpinClick,
    isAddButtonDisabled,
    getAddButtonStyle,
    getAddButtonTitle,
    isRestaurantOperational
  };
};

/**
 * 創建分享按鈕邏輯處理器
 * @param {Object} params - 參數對象
 * @param {Function} params.setShareButtonState - 設置分享按鈕狀態函數
 * @param {Function} params.getDirectionsUrl - 獲取導航URL函數
 * @returns {Object} 分享按鈕邏輯處理器對象
 */
const createShareButtonLogic = (params) => {
  const { setShareButtonState, getDirectionsUrl } = params;

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

  return {
    copyGoogleMapsLink
  };
};

// 註冊到全局變數
window.createButtonLogic = createButtonLogic;
window.createShareButtonLogic = createShareButtonLogic;
window.isRestaurantOperational = isRestaurantOperational;
