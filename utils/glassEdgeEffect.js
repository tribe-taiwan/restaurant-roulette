/**
 * 動態霧面邊緣效果
 * 從頂部輕微模糊漸變到底部強模糊，與背景毛玻璃一致
 */

function createGlassEdgeEffect() {
  const bannerContainer = document.querySelector('.unified-banner-container');
  if (!bannerContainer) return;

  // 移除現有的邊緣效果
  const existingEdges = bannerContainer.querySelectorAll('.glass-edge-layer');
  existingEdges.forEach(edge => edge.remove());

  // 創建多層模糊效果
  const layers = 6; // 模糊漸變層數
  const totalHeight = 12; // 總邊緣高度
  
  for (let i = 0; i < layers; i++) {
    const layer = document.createElement('div');
    layer.className = 'glass-edge-layer';
    
    // 計算每層的位置和高度
    const layerHeight = totalHeight / layers;
    const bottomOffset = -3 - (i * layerHeight);
    
    // 計算模糊程度 (從3px到8px)
    const blurStart = 3;
    const blurEnd = 8;
    const blurAmount = blurStart + ((blurEnd - blurStart) * (i / (layers - 1)));
    
    // 計算顏色漸變 (從深灰到淡白)
    const progress = i / (layers - 1);
    let r, g, b, alpha;
    
    if (progress < 0.5) {
      // 前半段：深灰到中灰
      const localProgress = progress * 2;
      r = Math.round(10 + (70 - 10) * localProgress);
      g = Math.round(10 + (70 - 10) * localProgress);
      b = Math.round(15 + (75 - 15) * localProgress);
      alpha = 0.6 - (0.3 * localProgress);
    } else {
      // 後半段：中灰到毛玻璃白
      const localProgress = (progress - 0.5) * 2;
      r = Math.round(70 + (255 - 70) * localProgress);
      g = Math.round(70 + (255 - 70) * localProgress);
      b = Math.round(75 + (255 - 75) * localProgress);
      alpha = 0.3 - (0.27 * localProgress); // 最終到0.03
    }
    
    // 設置樣式
    layer.style.cssText = `
      position: absolute;
      bottom: ${bottomOffset}px;
      left: 0;
      right: 0;
      height: ${layerHeight + 1}px;
      background: rgba(${r}, ${g}, ${b}, ${alpha});
      backdrop-filter: blur(${blurAmount}px) saturate(${0.8 - (progress * 0.2)});
      -webkit-backdrop-filter: blur(${blurAmount}px) saturate(${0.8 - (progress * 0.2)});
      z-index: ${10 + layers - i};
      opacity: ${0.9 - (progress * 0.1)};
      pointer-events: none;
    `;
    
    bannerContainer.appendChild(layer);
  }
  
  console.log(`Created glass edge effect with ${layers} layers`);
}

// 響應式調整
function adjustGlassEdgeForScreenSize() {
  const isMobile = window.innerWidth <= 767;
  const layers = document.querySelectorAll('.glass-edge-layer');
  
  layers.forEach((layer, index) => {
    if (isMobile) {
      // 手機端：減少模糊和高度
      const blurAmount = 2 + ((6 - 2) * (index / (layers.length - 1)));
      layer.style.backdropFilter = `blur(${blurAmount}px) saturate(0.7)`;
      layer.style.height = '1.5px';
    } else {
      // 桌面端：完整效果
      const blurAmount = 3 + ((8 - 3) * (index / (layers.length - 1)));
      layer.style.backdropFilter = `blur(${blurAmount}px) saturate(${0.8 - (index / layers.length * 0.2)})`;
    }
  });
}

// 初始化和事件監聽
function initGlassEdgeEffect() {
  // 頁面載入後創建效果
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGlassEdgeEffect);
  } else {
    createGlassEdgeEffect();
  }
  
  // 響應式調整
  window.addEventListener('resize', adjustGlassEdgeForScreenSize);
  
  // 主題切換時重新創建效果
  window.addEventListener('themeChanged', createGlassEdgeEffect);
}

// 導出函數
if (typeof window !== 'undefined') {
  window.createGlassEdgeEffect = createGlassEdgeEffect;
  window.initGlassEdgeEffect = initGlassEdgeEffect;
  
  // 自動初始化
  initGlassEdgeEffect();
}