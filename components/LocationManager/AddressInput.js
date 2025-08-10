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
      <div className="address-input-container">
        <div className="address-input-wrapper">
          <div className="address-input-icon">
            <div className="icon-search"></div>
          </div>
          <input
            type="text"
            value={addressInput}
            onChange={handleInputChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={t.enterAddress}
            className="address-input-field"
            onKeyPress={handleKeyPress}
            maxLength="200"
          />
        </div>
      </div>
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