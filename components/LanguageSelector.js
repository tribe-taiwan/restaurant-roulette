function LanguageSelector({ selectedLanguage, onLanguageChange, userLocation }) {
  try {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    return (
      <div className="w-auto" data-name="language-selector" data-file="components/LanguageSelector.js">
        <div className="flex flex-wrap gap-2 bg-[var(--surface-color)] rounded-lg p-2 justify-center">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedLanguage === lang.code
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-gray-700'
              }`}
            >
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('LanguageSelector component error:', error);
    return null;
  }
}
