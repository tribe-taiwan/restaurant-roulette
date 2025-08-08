/**
 * 主題切換組件
 * 與現有 ThemeManager 系統整合，支持滑動導航切換民宿主題
 */
function ThemeSwitcher({ 
  onThemeChange,
  containerHeight = 'h-80',
  showThemeName = true,
  showDots = true,
  className = '',
  initialTheme = null,
  // Hero Banner 整合功能
  showFullHero = false,
  selectedLanguage = 'zh',
  onLanguageChange,
  userLocation,
  brandSubtitle,
  t,
  currentTheme
}) {
  try {
    const [themes, setThemes] = React.useState([]);
    const [currentThemeIndex, setCurrentThemeIndex] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    // 新增：跟踪 ThemeManager 的當前主題，確保按鈕使用正確的連結
    const [activeTheme, setActiveTheme] = React.useState(null);

    // 從現有的 ThemeManager 獲取主題配置
    const loadAvailableThemes = React.useCallback(() => {
      console.log('🔍 載入可用主題配置...');
      
      if (!window.ThemeManager || !window.THEME_CONFIGS) {
        console.warn('ThemeManager 或 THEME_CONFIGS 未初始化');
        return [];
      }

      const availableThemes = window.ThemeManager.getAvailableThemes();
      const themeData = [];

      availableThemes.forEach(themeName => {
        const themeConfig = window.THEME_CONFIGS[themeName];
        if (themeConfig) {
          themeData.push({
            id: themeName,
            name: themeName.charAt(0).toUpperCase() + themeName.slice(1),
            bannerImage: themeConfig.images?.banner || null,
            logoImage: themeConfig.images?.bnbLogo || null, 
            fallbackImage: themeConfig.images?.banner || null,
            faviconPath: themeConfig.images?.favicon || null,
            displayName: themeConfig.brand?.subtitle || getThemeDisplayName(themeName),
            config: themeConfig
          });
          console.log(`✅ 載入主題: ${themeName}`);
        }
      });

      console.log(`🎨 共載入 ${themeData.length} 個主題`);
      return themeData;
    }, []);

    // 獲取主題顯示名稱 (多語言支援)
    const getThemeDisplayName = (themeName) => {
      const displayNames = {
        'maizuru': '舞鶴民宿',
        'qisu': '柒宿', 
        'muluInn': '台南沐旅',
        'mountain': '山景民宿',
        'forest': '森林小屋',
        'cityview': '城市景觀'
      };
      return displayNames[themeName] || themeName;
    };

    // 初始化主題載入
    React.useEffect(() => {
      console.log('🔄 ThemeSwitcher 初始化開始...');
      try {
        const themeData = loadAvailableThemes();
        console.log('📦 載入的主題數據:', themeData);
        
        if (themeData.length > 0) {
          setThemes(themeData);
          
          // 設定初始主題索引
          let initialIndex = 0;
          if (initialTheme) {
            const foundIndex = themeData.findIndex(t => t.id === initialTheme);
            if (foundIndex >= 0) {
              initialIndex = foundIndex;
            }
          }
          
          setCurrentThemeIndex(initialIndex);
          console.log(`✅ ThemeSwitcher 初始化完成，共載入 ${themeData.length} 個主題`);
        } else {
          console.log('❌ 沒有載入到任何主題');
        }
      } catch (error) {
        console.error('❌ ThemeSwitcher 初始化錯誤:', error);
      }
      setIsLoading(false);
    }, [loadAvailableThemes, initialTheme]);

    // 監聽主題變更事件，確保組件與 ThemeManager 同步
    React.useEffect(() => {
      const handleThemeChanged = (event) => {
        const { themeId, theme } = event.detail;
        console.log('🔄 ThemeSwitcher 收到主題變更事件:', themeId);

        // 更新當前主題索引以匹配新主題
        const newIndex = themes.findIndex(t => t.id === themeId);
        if (newIndex >= 0 && newIndex !== currentThemeIndex) {
          console.log(`📍 更新主題索引: ${currentThemeIndex} -> ${newIndex}`);
          setCurrentThemeIndex(newIndex);
        }

        // 更新活動主題數據，確保按鈕使用正確的連結
        if (theme) {
          setActiveTheme(theme);
          console.log('📍 更新活動主題數據:', theme);
        }
      };

      // 初始化時獲取當前主題
      const initActiveTheme = () => {
        if (window.ThemeManager) {
          const currentTheme = window.ThemeManager.getCurrentTheme();
          if (currentTheme) {
            setActiveTheme(currentTheme);
            console.log('📍 初始化活動主題:', currentTheme);
            console.log('📍 官網連結:', currentTheme?.homeBase?.officialWebsite);
            console.log('📍 訂房連結:', currentTheme?.socialMedia?.booking?.url);
          } else {
            console.warn('⚠️ ThemeManager.getCurrentTheme() 返回 null');
          }
        } else {
          console.warn('⚠️ ThemeManager 未載入');
        }
      };

      // 立即嘗試初始化
      initActiveTheme();

      // 如果 ThemeManager 還沒準備好，延遲初始化
      if (!activeTheme) {
        setTimeout(initActiveTheme, 100);
      }

      window.addEventListener('themeChanged', handleThemeChanged);
      return () => window.removeEventListener('themeChanged', handleThemeChanged);
    }, [themes, currentThemeIndex]);

    // 應用主題
    const applyTheme = React.useCallback((theme) => {
      if (!theme || !window.ThemeManager) return;
      
      console.log(`🎨 切換到主題: ${theme.displayName}`);
      
      // 使用現有的 ThemeManager 系統來應用主題
      window.ThemeManager.loadTheme(theme.id);

      // 觸發主題變更回調
      if (onThemeChange) {
        onThemeChange(theme);
      }
    }, [onThemeChange]);

    // 處理主題索引變更
    const handleThemeIndexChange = React.useCallback((newIndex) => {
      if (newIndex >= 0 && newIndex < themes.length) {
        setCurrentThemeIndex(newIndex);
        applyTheme(themes[newIndex]);
      }
    }, [themes, applyTheme]);

    // 渲染主題項目
    const renderThemeItem = React.useCallback((theme, index) => {
      return (
        <div className="absolute inset-0">
          {/* 主題背景圖片 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: theme.bannerImage ? 
                `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${theme.bannerImage})` :
                'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {showFullHero ? (
            /* 完整 Hero Banner 內容 */
            <>
              {/* 主標題區域 - 居中顯示 */}
              <div className="relative z-20 absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  {/* 主標題 */}
                  <h1 className="text-3xl md:text-6xl font-bold mb-2 drop-shadow-lg">
                    {t?.title || '甲崩喔'}
                  </h1>
                  {/* 副標題（非中文時顯示） */}
                  {selectedLanguage !== 'zh' && brandSubtitle && (
                    <h3 className="text-lg md:text-xl opacity-90 drop-shadow-md">
                      {brandSubtitle}
                    </h3>
                  )}
                </div>
              </div>
              
              {/* 語言選擇器 - 右上角 */}
              <div className="absolute top-4 right-4 z-30">
                {onLanguageChange && window.LanguageSelector && (
                  <window.LanguageSelector 
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={onLanguageChange}
                    userLocation={userLocation}
                  />
                )}
              </div>
              
              {/* Social Media Icons - Right Side */}
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                {/* 民宿 Logo - 官網連結 */}
                {theme.logoImage && (() => {
                  // 直接從 ThemeManager 獲取當前主題的官網連結
                  const currentTheme = window.ThemeManager?.getCurrentTheme();
                  const officialWebsite = currentTheme?.homeBase?.officialWebsite;

                  return (
                    <a
                      href={officialWebsite || "https://journey.owlting.com/hotels/10534cf7-3614-4e34-8032-357ccf579751"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 shadow-lg hover:scale-110 transition-transform duration-200"
                      title={`${theme.displayName} 官網`}
                      onClick={() => {
                        console.log('🔍 第一個按鈕（民宿官網）:');
                        console.log('官網連結:', officialWebsite);
                      }}
                    >
                      <img
                        src={theme.logoImage}
                        alt={`${theme.displayName} Logo`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </a>
                  );
                })()}

                {/* 訂房圖標 - 訂房連結 */}
                {(() => {
                  // 直接從 ThemeManager 獲取當前主題的訂房連結
                  const currentTheme = window.ThemeManager?.getCurrentTheme();
                  const bookingUrl = currentTheme?.socialMedia?.booking?.url;

                  return (
                    <a
                      href={bookingUrl || "https://www.booking.com/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 shadow-lg hover:scale-110 transition-transform duration-200"
                      title="線上訂房"
                      onClick={() => {
                        console.log('🔍 第二個按鈕（訂房）:');
                        console.log('訂房連結:', bookingUrl);
                      }}
                    >
                      <img
                        src="./assets/image/booking-logo.png"
                        alt="線上訂房"
                        className="w-full h-full object-contain"
                      />
                    </a>
                  );
                })()}

                {/* Instagram 圖標 */}
                <a
                  href={activeTheme?.socialMedia?.instagram?.url || "https://www.instagram.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
                  title="關注 Instagram"
                >
                  <div className="icon-instagram text-white text-2xl"></div>
                </a>

                {/* Facebook 圖標 */}
                <a
                  href={activeTheme?.socialMedia?.facebook?.url || "https://www.facebook.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
                  title="關注 Facebook"
                >
                  <div className="icon-facebook text-white text-2xl"></div>
                </a>
              </div>
            </>
          ) : (
            /* 簡單主題預覽 */
            showThemeName && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                  {/* 主題 Logo */}
                  {theme.logoImage && (
                    <div className="mb-4">
                      <img 
                        src={theme.logoImage} 
                        alt={theme.displayName}
                        className="w-20 h-20 object-contain mx-auto drop-shadow-lg"
                        onError={(e) => {
                          // Logo 載入失敗時隱藏
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* 主題名稱 */}
                  <div className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                    {theme.displayName}
                  </div>
                  
                  {/* 主題指示 */}
                  <div className="text-sm text-white drop-shadow opacity-75">
                    {themes.length > 1 && `${index + 1} / ${themes.length}`}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      );
    }, [showThemeName, themes.length, showFullHero, selectedLanguage, brandSubtitle, t, onLanguageChange, userLocation]);

    // 載入狀態
    if (isLoading) {
      return (
        <div className={`${containerHeight} ${className} flex items-center justify-center bg-gray-900 text-white rounded-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>載入主題中...</span>
          </div>
        </div>
      );
    }

    // 沒有載入到主題 - 顯示後備 Banner
    if (themes.length === 0) {
      console.log('⚠️ ThemeSwitcher: 沒有檢測到主題，顯示後備Banner，ThemeManager狀態:', {
        hasThemeManager: !!window.ThemeManager,
        hasThemeConfigs: !!window.THEME_CONFIGS,
        availableThemes: window.ThemeManager ? window.ThemeManager.getAvailableThemes() : 'N/A'
      });
      
      // 後備 Banner - 使用原本的設計
      return (
        <div className={`${containerHeight} ${className} mb-8`}>
          <div
            className="relative w-full min-h-[400px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('./assets/image/banner.jpg')`
            }}
          >
            {/* 半透明遮罩 */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* 主標題區域 - 居中顯示 */}
            <div className="relative z-20 text-center text-white">
              <h1 className="text-3xl md:text-6xl font-bold mb-2 drop-shadow-lg">
                {t?.title || '甲崩喔'}
              </h1>
              {selectedLanguage !== 'zh' && brandSubtitle && (
                <h3 className="text-lg md:text-xl opacity-90 drop-shadow-md">
                  {brandSubtitle}
                </h3>
              )}
            </div>
            
            {/* 語言選擇器 - 右上角 */}
            <div className="absolute top-4 right-4 z-30">
              {onLanguageChange && window.LanguageSelector && (
                <window.LanguageSelector 
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={onLanguageChange}
                  userLocation={userLocation}
                />
              )}
            </div>
            
            {/* 錯誤提示 */}
            <div className="absolute bottom-4 left-4 z-30 bg-red-600 text-white px-3 py-2 rounded text-sm">
              主題系統未初始化 (除錯模式)
            </div>
          </div>
        </div>
      );
    }

    // 只有一個主題時，直接顯示不需要切換功能
    if (themes.length === 1) {
      return (
        <div className={`${containerHeight} ${className} rounded-lg overflow-hidden`}>
          {renderThemeItem(themes[0], 0)}
        </div>
      );
    }

    // 多個主題，顯示切換功能
    return (
      <div className={`${containerHeight} ${className} rounded-lg overflow-hidden`}>
        <window.SlideContainer
          items={themes}
          currentIndex={currentThemeIndex}
          onIndexChange={handleThemeIndexChange}
          renderItem={renderThemeItem}
          containerHeight="h-full"
          showArrows={true}
          showDots={showDots}
          autoLoop={true}
          enableTouch={true}
          enableKeyboard={false} // 避免與餐廳搜尋的鍵盤事件衝突
          arrowClassName="text-white text-5xl drop-shadow-2xl"
        />
      </div>
    );

  } catch (error) {
    console.error('ThemeSwitcher component error:', error);
    return (
      <div className={`${containerHeight} ${className} flex items-center justify-center bg-red-100 rounded-lg`}>
        <div className="text-red-600">主題切換元件載入失敗</div>
      </div>
    );
  }
}

// 註冊組件到全局
window.ThemeSwitcher = ThemeSwitcher;
