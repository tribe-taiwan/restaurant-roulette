function LanguageSelector({ selectedLanguage, onLanguageChange, userLocation }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
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
        <div className="hidden md:flex gap-2 bg-[var(--surface-color)] rounded-lg p-2 justify-center">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                selectedLanguage === lang.code
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <span>{lang.name}</span>
            </button>
          ))}
        </div>

        {/* 手機版：漢堡選單 */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-[var(--surface-color)] bg-opacity-65 rounded-lg px-4 py-2 text-[var(--text-secondary)] transition-all duration-200"
          >
            <span className="text-lg">☰</span>
            <span className="text-sm font-medium">{currentLang?.name}</span>
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-[var(--surface-color)] rounded-lg shadow-lg border border-gray-600 z-30 min-w-[160px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg whitespace-nowrap ${
                    selectedLanguage === lang.code
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'text-[var(--text-secondary)]'
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
              className="fixed inset-0 z-10" 
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
