// 主題選擇器組件 - 用於演示和測試不同主題
// 可以在開發環境中使用，生產環境可以隱藏

function ThemeSelector({ currentTheme, onThemeChange, isVisible = false }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  if (!isVisible) return null;

  const availableThemes = window.ThemeManager?.getAvailableThemes() || [];
  const themeConfigs = window.THEME_CONFIGS || {};

  const getThemeDisplayName = (themeName) => {
    const theme = themeConfigs[themeName];
    return theme ? `${theme.brand.subtitle} (${themeName})` : themeName;
  };

  const handleThemeSelect = (themeName) => {
    if (window.ThemeManager) {
      window.ThemeManager.loadTheme(themeName);
      if (onThemeChange) {
        onThemeChange(themeName);
      }
      setIsOpen(false);
      
      // 更新 URL 參數
      const url = new URL(window.location);
      url.searchParams.set('theme', themeName);
      window.history.replaceState({}, '', url);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* 主題選擇按鈕 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          title="選擇主題"
        >
          <div className="icon-palette text-sm"></div>
          <span className="text-sm">主題</span>
          <div className={`icon-chevron-down text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></div>
        </button>

        {/* 主題選項下拉選單 */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] overflow-hidden">
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                選擇主題風格
              </div>
              
              {availableThemes.map((themeName) => {
                const theme = themeConfigs[themeName];
                const isActive = currentTheme === themeName;
                
                return (
                  <button
                    key={themeName}
                    onClick={() => handleThemeSelect(themeName)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 主題色彩預覽 */}
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: theme?.colors?.primary || '#ccc' }}
                      ></div>
                      
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                          {theme?.brand?.subtitle || themeName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {theme?.brand?.subtitle || '主題名稱'}
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="icon-check text-blue-500 text-sm"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-gray-100 px-4 py-2">
              <div className="text-xs text-gray-500">
                💡 提示：也可以使用 URL 參數 ?theme=主題名稱 來切換主題
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 點擊外部關閉選單 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

// 全局註冊組件
window.ThemeSelector = ThemeSelector;
