// Hero Banner 滑動組件 - 從 app.js 拆分出來
// 處理主題輪播、滑動動畫、語言選擇器和社交媒體連結

/**
 * Hero Banner 滑動組件
 * @param {string} selectedLanguage - 當前選擇的語言
 * @param {function} onLanguageChange - 語言變更回調函數
 * @param {object} userLocation - 用戶位置資訊
 * @param {string} brandSubtitle - 品牌副標題
 * @param {object} t - 翻譯對象
 * @param {object} currentTheme - 當前主題配置
 */
function HeroBannerWithSliding({ selectedLanguage, onLanguageChange, userLocation, brandSubtitle, t, currentTheme }) {
  const [themes, setThemes] = React.useState([]);
  const [currentThemeIndex, setCurrentThemeIndex] = React.useState(0);
  const [isSliding, setIsSliding] = React.useState(false);
  const [slideDirection, setSlideDirection] = React.useState('left');

  // 載入可用主題
  const loadAvailableThemes = React.useCallback(() => {
    if (!window.ThemeManager || !window.THEME_CONFIGS) return [];
    
    const availableThemes = window.ThemeManager.getAvailableThemes();
    const themeData = [];

    availableThemes.forEach(themeName => {
      const themeConfig = window.THEME_CONFIGS[themeName];
      if (themeConfig) {
        themeData.push({
          id: themeName,
          bannerImage: themeConfig.images?.banner || null,
          logoImage: themeConfig.images?.bnbLogo || null,
          displayName: themeConfig.brand?.subtitle || themeName,
          config: themeConfig
        });
      }
    });

    return themeData;
  }, []);

  // 初始化主題
  React.useEffect(() => {
    const themeData = loadAvailableThemes();
    if (themeData.length > 0) {
      setThemes(themeData);
      const currentThemeId = window.ThemeManager?.getCurrentTheme()?.id;
      const currentIndex = themeData.findIndex(t => t.id === currentThemeId);
      setCurrentThemeIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [loadAvailableThemes]);

  // 滑動到下一個主題（右箭頭：原圖向左滑出，新圖從右滑入）
  const slideToNext = () => {
    if (isSliding || themes.length <= 1) return;

    setSlideDirection('left'); // 原圖向左滑出
    setIsSliding(true);

    setTimeout(() => {
      const nextIndex = (currentThemeIndex + 1) % themes.length;
      setCurrentThemeIndex(nextIndex);
      window.ThemeManager.loadTheme(themes[nextIndex].id);
      setIsSliding(false);
    }, 300);
  };

  // 滑動到上一個主題（左箭頭：原圖向右滑出，新圖從左滑入）
  const slideToPrevious = () => {
    if (isSliding || themes.length <= 1) return;

    setSlideDirection('right'); // 原圖向右滑出
    setIsSliding(true);

    setTimeout(() => {
      const prevIndex = currentThemeIndex <= 0 ? themes.length - 1 : currentThemeIndex - 1;
      setCurrentThemeIndex(prevIndex);
      window.ThemeManager.loadTheme(themes[prevIndex].id);
      setIsSliding(false);
    }, 300);
  };

  const currentThemeData = themes[currentThemeIndex];

  // 根據滑動方向計算下一個主題的索引
  const nextIndex = slideDirection === 'left'
    ? (currentThemeIndex + 1) % themes.length
    : currentThemeIndex <= 0 ? themes.length - 1 : currentThemeIndex - 1;
  const nextThemeData = themes[nextIndex];

  return (
    <div className="unified-banner-container group">
      {/* 滑動容器 - 毛玻璃Banner設計 */}
      <div className="absolute inset-0 overflow-hidden">
        {!isSliding ? (
          /* 靜態顯示當前主題 - 恢復原背景 */
          <div className="absolute inset-0 w-full h-full">
            <div
              className="unified-banner-background"
              style={{
                backgroundImage: `url(${currentThemeData?.bannerImage || './assets/image/banner.jpg'})`
              }}
            />
            <div className="unified-banner-content">
              <div className={`unified-banner-text-container ${selectedLanguage !== 'zh' && brandSubtitle ? 'has-subtitle' : ''}`}>
                <h1
                  className="unified-banner-title"
                  onClick={() => {
                    if (window.navigateToHomeBase) {
                      window.navigateToHomeBase();
                    }
                  }}
                  title={t?.BackToHotel || '回民宿家'}

                >
                  {t?.title || '甲崩喔'}
                </h1>
                {selectedLanguage !== 'zh' && brandSubtitle && (
                  <h3
                    className="unified-banner-subtitle"
                    onClick={() => {
                      if (window.navigateToHomeBase) {
                        window.navigateToHomeBase();
                      }
                    }}
                    title={t?.BackToHotel || '回民宿家'}
                    style={{ cursor: 'pointer' }}
                  >
                    {brandSubtitle}
                  </h3>
                )}
                <div
                  className="unified-banner-home-link home-pulse"
                  onClick={() => {
                    if (window.navigateToHomeBase) {
                      window.navigateToHomeBase();
                    }
                  }}
                  title={t?.BackToHotel || '回民宿家'}
                  style={{'--pulse-delay': '1s'}}
                >
                  <span>{t?.BackToHotel || '回民宿家'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 滑動動畫容器 - 移除背景圖片 */
          <div className="absolute inset-0">
            {/* 當前主題 - 滑出 */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                transform: 'translateX(0)',
                animation: slideDirection === 'left'
                  ? 'slideOutToLeft 300ms ease-out forwards'
                  : 'slideOutToRight 300ms ease-out forwards',
                zIndex: 1
              }}
            >
              <div
                className="unified-banner-background"
                style={{
                  backgroundImage: `url(${currentThemeData?.bannerImage || './assets/image/banner.jpg'})`
                }}
              />
              <div className="unified-banner-content">
                <div className="unified-banner-text-container">
                  <h1
                    className="unified-banner-title"
                    onClick={() => {
                      if (window.navigateToHomeBase) {
                        window.navigateToHomeBase();
                      }
                    }}
                    title={t?.BackToHotel || '回民宿家'}

                    >
                    {t?.title || '甲崩喔'}
                  </h1>
                  {selectedLanguage !== 'zh' && brandSubtitle && (
                    <h3
                      className="unified-banner-subtitle"
                      onClick={() => {
                        if (window.navigateToHomeBase) {
                          window.navigateToHomeBase();
                        }
                      }}
                      title={t?.BackToHotel || '回民宿家'}
                      style={{ cursor: 'pointer' }}
                    >
                      {brandSubtitle}
                    </h3>
                  )}
                  <div
                    className="unified-banner-home-link home-pulse"
                    onClick={() => {
                      if (window.navigateToHomeBase) {
                        window.navigateToHomeBase();
                      }
                    }}
                    title={t?.BackToHotel || '回民宿家'}
                    style={{'--pulse-delay': '1s'}}
                  >
                    <i className="lucide lucide-home icon-home"></i>
                    <span>{t?.BackToHotel || '回民宿家'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 下一個主題 - 滑入 */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                transform: slideDirection === 'left' ? 'translateX(100%)' : 'translateX(-100%)',
                animation: slideDirection === 'left'
                  ? 'slideInFromRight 300ms ease-out forwards'
                  : 'slideInFromLeft 300ms ease-out forwards',
                zIndex: 2
              }}
            >
              <div
                className="unified-banner-background"
                style={{
                  backgroundImage: `url(${nextThemeData?.bannerImage || './assets/image/banner.jpg'})`
                }}
              />
              <div className="unified-banner-content">
                <div className="unified-banner-text-container">
                  <h1
                    className="unified-banner-title"
                    onClick={() => {
                      if (window.navigateToHomeBase) {
                        window.navigateToHomeBase();
                      }
                    }}
                    title={t?.BackToHotel || '回民宿家'}

                    >
                    {t?.title || '甲崩喔'}
                  </h1>
                  {selectedLanguage !== 'zh' && brandSubtitle && (
                    <h3
                      className="unified-banner-subtitle"
                      onClick={() => {
                        if (window.navigateToHomeBase) {
                          window.navigateToHomeBase();
                        }
                      }}
                      title={t?.BackToHotel || '回民宿家'}
                      style={{ cursor: 'pointer' }}
                    >
                      {brandSubtitle}
                    </h3>
                  )}
                  <div
                    className="unified-banner-home-link home-pulse"
                    onClick={() => {
                      if (window.navigateToHomeBase) {
                        window.navigateToHomeBase();
                      }
                    }}
                    title={t?.BackToHotel || '回民宿家'}
                    style={{'--pulse-delay': '1s'}}
                  >
                    <i className="lucide lucide-home icon-home"></i>
                    <span>{t?.BackToHotel || '回民宿家'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 語言選擇器 - 固定右上角 */}
      <div className="absolute top-4 right-4 z-40">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          userLocation={userLocation}
        />
      </div>

      {/* 滑動箭頭 */}
      {themes.length > 1 && (
        <>
          <div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-40"
            onClick={slideToPrevious}
            title="上一個主題"
          >
            <div className="icon-chevron-left text-white text-6xl drop-shadow-lg"></div>
          </div>

          <div
            className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-30"
            onClick={slideToNext}
            title="下一個主題"
          >
            <div className="icon-chevron-right text-white text-6xl drop-shadow-lg"></div>
          </div>
        </>
      )}

      {/* 社交媒體圖標 - 右下角 */}
      <div className="unified-banner-social">
        {currentTheme?.images?.bnbLogo && (
          <a
            href={currentTheme?.homeBase?.officialWebsite || "https://journey.owlting.com/hotels/10534cf7-3614-4e34-8032-357ccf579751"}
            target="_blank"
            rel="noopener noreferrer"
            className="unified-banner-social-icon"
            title={`${currentTheme?.brand?.subtitle || '民宿'} 官網`}
          >
            <img
              src={currentTheme.images.bnbLogo}
              alt={`${currentTheme?.brand?.subtitle || '民宿'} Logo`}
              className="w-full h-full object-cover"
            />
          </a>
        )}

        <a
          href={currentTheme?.socialMedia?.booking?.url || "https://www.booking.com/hotel/tw/tai-nan-wu-he-min-su.zh-tw.html"}
          target="_blank"
          rel="noopener noreferrer"
          className="unified-banner-social-icon"
          title="線上訂房"
        >
          <img
            src="./assets/image/booking-logo.png"
            alt="線上訂房"
            className="w-full h-full object-cover"
          />
        </a>

        <a
          href={currentTheme?.socialMedia?.instagram?.url || "https://www.instagram.com/"}
          target="_blank"
          rel="noopener noreferrer"
          className="unified-banner-social-icon unified-banner-social-icon--instagram"
          title="關注 Instagram"
        >
          <div className="icon-instagram text-white text-xl"></div>
        </a>

        <a
          href={currentTheme?.socialMedia?.facebook?.url || "https://www.facebook.com/"}
          target="_blank"
          rel="noopener noreferrer"
          className="unified-banner-social-icon unified-banner-social-icon--facebook"
          title="關注 Facebook"
        >
          <div className="icon-facebook text-white text-xl"></div>
        </a>
      </div>
    </div>
  );
}

// 導出組件供其他模組使用
window.HeroBannerWithSliding = HeroBannerWithSliding;
