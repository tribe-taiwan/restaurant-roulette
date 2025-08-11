// AddressInput.js - 大型地址輸入框子組件
// 安全的模組化組件，提供地址輸入功能

function AddressInput({
  addressInput,
  setAddressInput,
  onAddressConfirm,
  onFocus,
  onBlur,
  translations
}) {
  try {
    const t = translations;

    // 處理輸入變更，包含安全驗證
    const handleInputChange = (e) => {
      const input = e.target.value;
      // 輸入驗證：限制長度和過濾危險字符
      if (input.length <= 200 && !/[<>\"'&]/.test(input)) {
        setAddressInput(input);
      }
    };

    // 處理按鍵事件
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        onAddressConfirm();
      }
    };

    return (
      <input
        type="text"
        value={addressInput}
        onChange={handleInputChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={t.enterAddress}
        className="w-full px-4 py-3 text-base 
                   bg-white dark:bg-gray-800 
                   border-2 border-gray-300 dark:border-gray-600 
                   rounded-lg 
                   placeholder-gray-500 dark:placeholder-gray-400 
                   text-gray-900 dark:text-white 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   hover:border-gray-400 dark:hover:border-gray-500 
                   transition-colors duration-200 
                   min-h-[48px] box-border
                   sm:px-3 sm:py-2 sm:min-h-[44px]"
        onKeyPress={handleKeyPress}
        maxLength="200"
        style={{ fontSize: '16px' }} // 防止iOS縮放
      />
    );
  } catch (error) {
    console.error('AddressInput component error:', error);
    return null;
  }
}

// 安全的模組匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AddressInput;
} else if (typeof window !== 'undefined') {
  window.AddressInput = AddressInput;
}
