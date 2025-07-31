// StatusMessages.js - 狀態訊息顯示組件

function StatusMessages({ locationStatus, spinError, translations }) {
  try {
    const t = translations;

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
            {t.locationError}
          </div>
        )}

        {spinError && (
          <div className="text-center text-[var(--warning-color)] mt-4 bg-[var(--surface-color)] rounded-lg p-3 max-w-lg mx-auto">
            <div className="icon-warning text-[var(--warning-color)] text-lg mb-2"></div>
            <div className="text-sm text-left">
              <strong>{t.spinErrorPrefix}</strong>
              <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono overflow-auto">
                {spinError}
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