// DistanceControl.js - 距離控制子組件
// 統一使用 React 組件和 Tailwind CSS 樣式

function DistanceControl({
  baseUnit,
  setBaseUnit,
  unitMultiplier,
  setUnitMultiplier,
  translations
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

    return (
      <div className="space-y-4">
        {/* 距離顯示 */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold mb-1">
            {getDisplayText()}
          </div>
          <div className="text-sm text-gray-600">
            {translations.searchRadius || '搜索範圍'}
          </div>
        </div>

        {/* 單位切換器 */}
        <div className="flex gap-2">
          {Object.entries(DISTANCE_CONFIG.baseUnits).map(([value, config], index) => {
            const isActive = baseUnit === Number(value);
            const buttonStyle = window.ButtonStylesManager ? 
              window.ButtonStylesManager.getButtonStyle({
                variant: isActive ? 'primary' : 'secondary',
                state: 'normal'
              }) : {
                background: isActive ? 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))' : 'var(--surface-color)',
                borderColor: isActive ? 'var(--theme-primary)' : 'var(--border-color)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                margin: 0,
                touchAction: 'manipulation'
              };

            return (
              <button
                key={value}
                onClick={() => handleUnitSwitch(Number(value))}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 min-h-[48px] border-2 shadow-md"
                style={buttonStyle}
                aria-label={`切換到${config.fullLabel}`}
                aria-pressed={isActive}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* 距離滑軌 */}
        <div className="space-y-2">
          {/* 滑軌容器 */}
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={unitMultiplier}
              onChange={(e) => setUnitMultiplier(Number(e.target.value))}
              onInput={(e) => setUnitMultiplier(Number(e.target.value))} // 支援即時更新
              className="distance-slider w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label={`搜索距離倍數: ${unitMultiplier}`}
              style={{
                background: `linear-gradient(to right, 
                  var(--theme-primary) 0%, 
                  var(--theme-primary) ${((unitMultiplier - 1) / 9) * 100}%, 
                  #e5e7eb ${((unitMultiplier - 1) / 9) * 100}%, 
                  #e5e7eb 100%)`,
                borderRadius: '6px',
                height: '8px',
                minHeight: '44px', // 確保觸控友好的點擊區域
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
            />
          </div>
          
          {/* 刻度標記 */}
          <div className="flex justify-between text-xs text-gray-500 px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(mark => (
              <span
                key={mark}
                className={`transition-colors duration-200 ${
                  unitMultiplier === mark ? 'font-semibold' : ''
                }`}
                style={unitMultiplier === mark ? {
                  color: 'var(--theme-primary)'
                } : {}}
              >
                {mark}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('DistanceControl component error:', error);
    return null;
  }
}

// 安全的模組匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DistanceControl;
} else if (typeof window !== 'undefined') {
  window.DistanceControl = DistanceControl;
}