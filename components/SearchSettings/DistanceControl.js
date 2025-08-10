// DistanceControl.js - Garmin風格距離控制子組件
// 包含大型單位切換器和視覺化距離滑軌

function DistanceControl({
  baseUnit,
  setBaseUnit,
  unitMultiplier,
  setUnitMultiplier
}) {
  try {
    // 距離配置
    const DISTANCE_CONFIG = {
      baseUnits: {
        200: { label: '200m', fullLabel: '200公尺模式' },
        1000: { label: '1km', fullLabel: '1公里模式' }
      }
    };

    // 計算實際搜索距離顯示
    const getActualRadius = () => baseUnit * unitMultiplier;
    const getDisplayText = () => {
      const actualMeters = getActualRadius();
      if (actualMeters >= 1000) {
        return `${actualMeters / 1000}km`;
      } else {
        return `${actualMeters}m`;
      }
    };

    // 單位切換處理
    const handleUnitSwitch = (newBaseUnit) => {
      const currentActualDistance = getActualRadius();
      setBaseUnit(newBaseUnit);
      
      // 調整倍數以保持相近距離
      const newMultiplier = Math.round(currentActualDistance / newBaseUnit);
      const adjustedMultiplier = Math.max(1, Math.min(10, newMultiplier));
      setUnitMultiplier(adjustedMultiplier);
    };

    // 創建主容器
    const container = document.createElement('div');
    container.className = 'garmin-distance-control';

    // 大型距離顯示
    const distanceDisplay = document.createElement('div');
    distanceDisplay.className = 'distance-display';
    
    const distanceValue = document.createElement('span');
    distanceValue.className = 'distance-value';
    distanceValue.textContent = getDisplayText();
    
    const distanceLabel = document.createElement('span');
    distanceLabel.className = 'distance-label';
    distanceLabel.textContent = '搜索範圍';
    
    distanceDisplay.appendChild(distanceValue);
    distanceDisplay.appendChild(distanceLabel);

    // 大型單位切換器
    const unitSwitcher = document.createElement('div');
    unitSwitcher.className = 'unit-switcher';
    
    Object.entries(DISTANCE_CONFIG.baseUnits).forEach(([value, config]) => {
      const button = document.createElement('button');
      button.className = `unit-button ${baseUnit === Number(value) ? 'active' : ''}`;
      button.textContent = config.label;
      button.setAttribute('aria-label', `切換到${config.fullLabel}`);
      button.setAttribute('aria-pressed', baseUnit === Number(value));
      button.setAttribute('data-touch-optimized', 'true');
      button.setAttribute('data-important-action', baseUnit === Number(value) ? 'false' : 'true');
      button.addEventListener('click', () => handleUnitSwitch(Number(value)));
      unitSwitcher.appendChild(button);
    });

    // 大型視覺化滑軌容器
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    
    // 滑軌軌道
    const sliderTrack = document.createElement('div');
    sliderTrack.className = 'slider-track';
    
    // 滑軌進度條
    const sliderProgress = document.createElement('div');
    sliderProgress.className = 'slider-progress';
    sliderProgress.style.setProperty('--progress', `${((unitMultiplier - 1) / (10 - 1)) * 100}%`);
    
    // 滑軌輸入
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '10';
    slider.value = unitMultiplier;
    slider.className = 'garmin-slider';
    slider.setAttribute('aria-label', `搜索距離倍數: ${unitMultiplier}`);
    slider.setAttribute('data-touch-optimized', 'true');
    slider.style.minHeight = '44px'; // 確保觸控標準
    slider.addEventListener('input', (e) => {
      setUnitMultiplier(Number(e.target.value));
      // 觸覺回饋
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
    });
    
    sliderTrack.appendChild(sliderProgress);
    sliderTrack.appendChild(slider);
    
    // 滑軌刻度標記
    const sliderMarks = document.createElement('div');
    sliderMarks.className = 'slider-marks';
    
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(mark => {
      const markDiv = document.createElement('div');
      markDiv.className = `slider-mark ${unitMultiplier === mark ? 'active' : ''}`;
      markDiv.style.setProperty('--position', `${((mark - 1) / (10 - 1)) * 100}%`);
      
      const markLabel = document.createElement('span');
      markLabel.className = 'mark-label';
      markLabel.textContent = mark;
      
      markDiv.appendChild(markLabel);
      sliderMarks.appendChild(markDiv);
    });
    
    sliderContainer.appendChild(sliderTrack);
    sliderContainer.appendChild(sliderMarks);

    // 組裝所有元素
    container.appendChild(distanceDisplay);
    container.appendChild(unitSwitcher);
    container.appendChild(sliderContainer);

    return container;
  } catch (error) {
    console.error('DistanceControl component error:', error);
    return null;
  }
}

// 導出組件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DistanceControl;
} else if (typeof window !== 'undefined') {
  window.DistanceControl = DistanceControl;
}