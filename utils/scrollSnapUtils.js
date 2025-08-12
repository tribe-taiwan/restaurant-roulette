// 滑動吸附工具 - 實現類似 Google 地圖的滑動行為
// 長滑動自動定位到老虎機區塊頂端，短滑動保持常規操作

class ScrollSnapUtils {
  constructor() {
    this.touchStartY = null;
    this.touchStartTime = null;
    this.touchEndY = null;
    this.touchEndTime = null;
    this.lastTouchY = null;
    this.isTracking = false;
    this.preventingScroll = false;
    
    // 閾值配置 - 基於測試成功的參數
    this.FAST_SWIPE_VELOCITY = 0.8; // 快速滑動最小速度（像素/毫秒）- 觸發自動吸附
    this.MIN_SWIPE_DISTANCE = 50; // 最小滑動距離，避免意外觸發（像素）
    
    this.init();
  }
  
  init() {
    // 只在觸控裝置上啟用
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.bindEvents();
      console.log('✅ ScrollSnapUtils 初始化完成 - 觸控滑動檢測已啟用');
    }
  }
  
  bindEvents() {
    // 觸控事件
    document.addEventListener('touchstart', (e) => this.onStart(e.touches[0].clientY), { passive: false });
    document.addEventListener('touchend', (e) => this.onEnd(e.changedTouches[0].clientY, e), { passive: false });
  }
  
  onStart(y) {
    this.touchStartY = y;
    this.touchStartTime = Date.now();
    this.isTracking = true;
    
    // 記錄開始時的位置判斷，避免滑動過程中位置變化
    this.startPosition = this.getRelativePositionByTouch(y);
    console.log(`ScrollSnap 開始: Y=${y}, 位置=${this.startPosition}`);
  }
  
  onEnd(y, event) {
    if (!this.isTracking) return;
    
    const endY = y;
    const endTime = Date.now();
    
    const distance = Math.abs(endY - this.touchStartY);
    const duration = endTime - this.touchStartTime;
    const velocity = distance / duration;
    
    // 修正方向檢測：手指向上滑動 = 頁面向下滾動 = down，手指向下滑動 = 頁面向上滾動 = up
    const direction = endY < this.touchStartY ? 'down' : 'up';
    const position = this.startPosition || this.getRelativePosition();
    
    const fingerDirection = endY < this.touchStartY ? '向上' : '向下';
    const pageDirection = endY < this.touchStartY ? '向下' : '向上';
    
    console.log(`ScrollSnap 滑動: 距離=${distance}px, 時間=${duration}ms, 速度=${velocity.toFixed(2)}px/ms`);
    console.log(`手指${fingerDirection}滑動 → 頁面${pageDirection}滾動 (${direction}), 位置=${position}`);
    
    // 檢查基本條件
    const isFastEnough = velocity > this.FAST_SWIPE_VELOCITY;
    const isLongEnough = distance > this.MIN_SWIPE_DISTANCE;
    
    // 檢查觸發條件：符合需求的方向和位置組合
    const shouldTriggerSnap = this.shouldTriggerSnap(direction, position);
    const shouldTrigger = isFastEnough && isLongEnough && shouldTriggerSnap;
    
    if (shouldTrigger) {
      console.log(`✅ 快速滑動檢測成功！定位到老虎機`);
      
      // 阻止原生滾動
      event.preventDefault();
      event.stopPropagation();
      
      // 延遲確保阻止生效
      setTimeout(() => {
        this.snapToSlotMachine(direction);
      }, 10);
    } else {
      const reasons = [];
      if (!isFastEnough) reasons.push(`速度不足(${velocity.toFixed(3)})`);
      if (!isLongEnough) reasons.push(`距離不足(${distance}px)`);
      if (!shouldTriggerSnap) reasons.push(`方向錯誤(${direction}在${position})`);
      console.log(`慢速滑動，保持原生行為: ${reasons.join(', ')}`);
    }
    
    this.isTracking = false;
  }
  
  // 根據需求的正確觸發邏輯
  shouldTriggerSnap(direction, position) {
    // 需求 1: 在老虎機上方快速向下滾動時吸附
    if (position === 'above' && direction === 'down') {
      console.log('✅ 符合需求1: 上方區域，頁面向下滾動');
      return true;
    }
    
    // 需求 2: 在老虎機下方快速向上滾動時吸附  
    if (position === 'below' && direction === 'up') {
      console.log('✅ 符合需求2: 下方區域，頁面向上滾動');
      return true;
    }
    
    // 所有其他情況都不觸發
    console.log(`❌ 不符合觸發條件: 頁面${direction}滾動 在 ${position} 位置`);
    return false;
  }
  
  // 檢測相對於老虎機的位置
  getRelativePosition() {
    const currentScroll = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const viewportCenter = currentScroll + (viewportHeight / 2);
    
    const slotMachine = document.querySelector('[data-name="slot-machine"]');
    if (!slotMachine) {
      console.warn('⚠️ 找不到老虎機元素');
      return 'unknown';
    }
    
    const slotRect = slotMachine.getBoundingClientRect();
    const slotTop = slotRect.top + currentScroll;
    const slotBottom = slotTop + slotRect.height;
    
    let position;
    if (viewportCenter < slotTop) {
      position = 'above';
    } else if (viewportCenter > slotBottom) {
      position = 'below';  
    } else {
      position = 'within';
    }
    
    // 詳細調試信息
    console.log(`📍 位置檢測: {滾動: ${Math.round(currentScroll)}px, 視窗中心: ${Math.round(viewportCenter)}px, 老虎機頂部: ${Math.round(slotTop)}px, 老虎機底部: ${Math.round(slotBottom)}px, 判斷: ${position}}`);
    
    return position;
  }
  
  // 基於觸控位置檢測相對於老虎機的位置
  getRelativePositionByTouch(touchY) {
    const currentScroll = window.pageYOffset;
    const touchPageY = touchY + currentScroll; // 觸控位置的頁面座標
    
    const slotMachine = document.querySelector('[data-name="slot-machine"]');
    if (!slotMachine) {
      console.warn('⚠️ 找不到老虎機元素');
      return 'unknown';
    }
    
    const slotRect = slotMachine.getBoundingClientRect();
    const slotTop = slotRect.top + currentScroll;
    const slotBottom = slotTop + slotRect.height;
    
    let position;
    if (touchPageY < slotTop) {
      position = 'above';
    } else if (touchPageY > slotBottom) {
      position = 'below';  
    } else {
      position = 'within';
    }
    
    // 詳細調試信息
    console.log(`📍 觸控位置檢測: {滾動: ${Math.round(currentScroll)}px, 觸控頁面位置: ${Math.round(touchPageY)}px, 老虎機頂部: ${Math.round(slotTop)}px, 老虎機底部: ${Math.round(slotBottom)}px, 判斷: ${position}}`);
    
    return position;
  }
  
  snapToSlotMachine(direction) {
    // 查找老虎機區塊
    const slotMachineElement = document.querySelector('[data-name="slot-machine"]');
    if (!slotMachineElement) {
      console.warn('找不到老虎機區塊，無法執行滑動吸附');
      return;
    }
    
    // 計算老虎機區塊的位置
    const slotMachineRect = slotMachineElement.getBoundingClientRect();
    const targetPosition = slotMachineRect.top + window.pageYOffset;
    
    console.log(`🎯 快速滑動：${direction} 方向，定位到老虎機 (${targetPosition}px)`);
    
    // 使用精確滾動
    this.preciseScrollTo(targetPosition);
  }
  
  // 自定義平滑滾動 - 精確控制（基於測試成功版本）
  preciseScrollTo(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = Math.abs(targetPosition - startPosition);
    
    // 阻止原生滾動干擾
    document.body.style.overflow = 'hidden';
    
    console.log(`🎯 開始精確滾動: ${startPosition}px -> ${targetPosition}px`);
    
    // 自定義動畫參數
    const duration = Math.min(300 + distance * 0.3, 500); // 動態持續時間
    const startTime = performance.now();
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用 easeOutCubic 緩動函數，避免滾過頭
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = startPosition + (targetPosition - startPosition) * easeProgress;
      
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // 動畫完成，確保精確到位
        window.scrollTo(0, targetPosition);
        setTimeout(() => {
          this.verifyScrollResult(targetPosition, startPosition);
        }, 50);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }
  
  // 驗證滾動結果
  verifyScrollResult(targetPosition, startPosition) {
    // 恢復滾動
    document.body.style.overflow = '';
    
    const finalPosition = window.pageYOffset;
    const accuracy = Math.abs(finalPosition - targetPosition);
    
    if (accuracy <= 10) {
      console.log(`✅ 滾動成功: 位置=${finalPosition.toFixed(1)}px, 精度=${accuracy.toFixed(1)}px`);
    } else {
      console.log(`⚠️ 精度不佳: 位置=${finalPosition.toFixed(1)}px, 精度=${accuracy.toFixed(1)}px`);
    }
  }
  
  reset() {
    this.touchStartY = null;
    this.touchStartTime = null;
    this.touchEndY = null;
    this.touchEndTime = null;
    this.isTracking = false;
  }
  
  // 銷毀實例（清理事件監聽器）
  destroy() {
    document.removeEventListener('touchstart', this.onStart);
    document.removeEventListener('touchend', this.onEnd);
  }
}

// 創建全域實例
window.ScrollSnapUtils = ScrollSnapUtils;

// 自動初始化
if (typeof window !== 'undefined') {
  window.scrollSnapUtilsInstance = new ScrollSnapUtils();
}

console.log('✅ scrollSnapUtils.js 已載入 - 滑動吸附功能可用');