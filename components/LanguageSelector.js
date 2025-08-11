function LanguageSelector({ selectedLanguage, onLanguageChange, userLocation }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  
  try {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' }
    ];

    const currentLang = languages.find(lang => lang.code === selectedLanguage);

    return (
      <div className="w-auto" data-name="language-selector" data-file="components/LanguageSelector.js">
        {/* 桌面版：正常顯示所有語言 */}
        <div className="unified-banner-language-selector hidden md:flex gap-2 justify-center">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`unified-banner-language-button flex items-center gap-2 ${
                selectedLanguage === lang.code
                  ? 'unified-banner-language-button--active'
                  : ''
              }`}
            >
              <span>{lang.name}</span>
            </button>
          ))}
        </div>

        {/* 手機版：漢堡選單 */}
        <div className="md:hidden relative">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="unified-banner-language-selector flex items-center gap-2"
          >
            <span className="text-lg">☰</span>
            <span className="text-sm font-medium">{currentLang?.name}</span>
          </button>
          
          {isOpen && (
            <div 
              className="bg-[var(--surface-color)] rounded-lg shadow-lg border border-gray-600 min-w-[160px]" 
              style={{
                position: 'fixed',
                top: buttonRef?.current ? buttonRef.current.getBoundingClientRect().bottom + 8 + 'px' : '60px',
                right: buttonRef?.current ? (window.innerWidth - buttonRef.current.getBoundingClientRect().right) + 'px' : '16px',
                zIndex: 9999
              }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`unified-banner-language-button w-full flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                    selectedLanguage === lang.code
                      ? 'unified-banner-language-button--active'
                      : ''
                  }`}
                >
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* 點擊外部關閉選單 */}
          {isOpen && (
            <div 
              className="fixed inset-0" 
              style={{ zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            ></div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('LanguageSelector component error:', error);
    return null;
  }
}
