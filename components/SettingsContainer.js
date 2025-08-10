// SettingsContainer.js - 共用的設定容器組件
// 避免重複的容器樣式代碼

function SettingsContainer({ children, className = "", withGlowContainer = true }) {
  if (withGlowContainer) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-[var(--surface-color)] rounded-lg p-4 mb-8 glow-container">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {children}
    </div>
  );
}

// 註冊到全域範圍
if (typeof window !== 'undefined') {
  window.SettingsContainer = SettingsContainer;
}
