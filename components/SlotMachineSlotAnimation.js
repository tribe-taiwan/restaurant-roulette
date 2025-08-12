// SlotMachineSlotAnimation.js
// 🎰 老虎機動畫邏輯 - 動態生成CSS動畫和控制老虎機轉動效果

/**
 * 🎯 動態生成CSS動畫 - 修改為固定每張顯示時間的模式
 * @param {number} imageCount - 圖片數量
 * @param {number} timePerImage - 每張圖片顯示時間（秒）
 * @returns {Object} 動畫時間參數對象
 */
const createDynamicAnimation = (imageCount, timePerImage = 0.3) => {
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
};

// 註冊到全局變數
window.createDynamicAnimation = createDynamicAnimation;
