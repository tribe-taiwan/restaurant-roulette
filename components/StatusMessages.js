// StatusMessages.js - 狀態訊息顯示組件

function StatusMessages({ locationStatus, spinError, locationError, translations }) {
  try {
    const t = translations;
    
    // 複製錯誤訊息到剪貼板
    const copyErrorToClipboard = (errorMessage) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(errorMessage).then(() => {
          alert('錯誤訊息已複製到剪貼板');
        }).catch(err => {
          console.error('複製失敗:', err);
        });
      } else {
        // 回退選項：使用舊式方法
        const textArea = document.createElement('textarea');
        textArea.value = errorMessage;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('錯誤訊息已複製到剪貼板');
        } catch (err) {
          console.error('複製失敗:', err);
        }
        document.body.removeChild(textArea);
      }
    };

    return (
      <>
        {locationStatus === 'loading' && (
          <div className="text-center text-[var(--secondary-color)] mt-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[var(--secondary-color)] border-t-transparent rounded-full animate-spin"></div>
              {t.locationLoading}
            </div>
          </div>
        )}
        
        {locationStatus === 'error' && (
          <div className="text-center text-[var(--warning-color)] mt-4 bg-[var(--surface-color)] rounded-lg p-3 max-w-md mx-auto">
            <div className="icon-map-pin text-[var(--warning-color)] text-lg mb-2"></div>
            <div className="text-sm">
              {t.locationError}
              {locationError && (
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <button
                      onClick={() => copyErrorToClipboard(locationError)}
                      className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                      title="複製錯誤訊息"
                    >
                      📋 複製錯誤
                    </button>
                  </div>
                  <details className="text-left">
                    <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                      技術詳情 ▼
                    </summary>
                    <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono overflow-auto max-h-32">
                      {locationError}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}

        {spinError && (
          <div className="text-center text-[var(--warning-color)] mt-4 bg-[var(--surface-color)] rounded-lg p-3 max-w-lg mx-auto">
            <div className="icon-warning text-[var(--warning-color)] text-lg mb-2"></div>
            <div className="text-sm text-left">
              <strong>{t.spinErrorPrefix}</strong>
              <div className="mt-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button
                    onClick={() => copyErrorToClipboard(spinError)}
                    className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                    title="複製錯誤訊息"
                  >
                    📋 複製錯誤
                  </button>
                </div>
                <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono overflow-auto">
                  {spinError}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('StatusMessages component error:', error);
    return null;
  }
}
