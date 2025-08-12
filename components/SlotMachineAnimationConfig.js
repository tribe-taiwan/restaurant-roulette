// SlotMachineAnimationConfig.js
// 🎬 滑動動畫配置中心 - 集中管理所有滑動動畫參數

/**
 * 獲取滑動動畫配置
 * @returns {Object} 動畫配置對象，包含時間、緩動函數、keyframes等
 */
const getSlideAnimationConfig = () => {
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
    generateKeyframes('slideInFromRight', 100, 100 - slowDistanceEnd, 0),
    generateKeyframes('slideInFromLeft', -100, -100 + slowDistanceEnd, 0),
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
};

/**
 * 應用動畫配置到 DOM
 * @returns {Object} 返回應用的配置對象
 */
const applySlideAnimationStyles = () => {
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

  // RR_UI_081: 滑動動畫配置更新
  window.RRLog?.debug('RR_UI_UPDATE', '滑動動畫配置已更新', {
    slowPhasePercent: config.slowPhasePercent,
    slowMoveDistance: config.slowMoveDistance
  });

  return config;
};

// 註冊到全局變數
window.getSlideAnimationConfig = getSlideAnimationConfig;
window.applySlideAnimationStyles = applySlideAnimationStyles;
