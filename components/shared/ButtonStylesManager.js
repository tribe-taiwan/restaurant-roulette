/**
 * ButtonStylesManager - 統一按鈕樣式管理系統
 * 
 * 提供集中化的按鈕樣式管理，消除重複程式碼並確保主題相容性
 * 支援現有的 CSS 變數系統和主題切換功能
 */

const ButtonStylesManager = {
  // 基礎樣式常數
  base: {
    // 標準尺寸按鈕 (h-[72px])
    standard: 'h-[72px] p-3 rounded-lg border-2 flex flex-col items-center justify-center shadow-lg transition-all duration-200',
    
    // 緊湊尺寸按鈕 (h-12)
    compact: 'h-12 p-2 rounded-md border flex items-center justify-center shadow-md transition-all duration-200',
    
    // 通用修正樣式
    fixes: { 
      margin: 0, 
      touchAction: 'manipulation' 
    }
  },

  // 主題相容的按鈕變體
  variants: {
    primary: {
      background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
      borderColor: 'var(--theme-primary)',
      color: 'var(--text-primary)'
    },
    secondary: {
      background: 'var(--surface-color)',
      borderColor: 'var(--border-color)', 
      color: 'var(--text-secondary)'
    },
    success: {
      background: 'var(--success-color)',
      borderColor: 'var(--success-color)',
      color: 'white'
    },
    custom: {
      // 允許執行時期自訂
      background: null,
      borderColor: null,
      color: null
    }
  },

  // 按鈕狀態管理
  states: {
    normal: { 
      opacity: 1, 
      cursor: 'pointer' 
    },
    disabled: { 
      opacity: 0.3, 
      cursor: 'not-allowed' 
    },
    loading: { 
      opacity: 0.5, 
      cursor: 'wait' 
    }
  },

  /**
   * 取得按鈕的 Tailwind CSS 類別
   * @param {string} variant - 按鈕變體 ('primary', 'secondary', 'success', 'custom')
   * @param {string} size - 按鈕尺寸 ('standard', 'compact')
   * @returns {string} Tailwind CSS 類別字串
   */
  getButtonClasses: function(variant = 'primary', size = 'standard') {
    try {
      // 驗證參數
      if (!this.base[size]) {
        console.warn(`Invalid button size: ${size}. Using 'standard' as fallback.`);
        size = 'standard';
      }

      if (!this.variants[variant]) {
        console.warn(`Invalid button variant: ${variant}. Using 'primary' as fallback.`);
        variant = 'primary';
      }

      const baseClasses = this.base[size];
      const variantClasses = this.getVariantClasses(variant);
      
      return `${baseClasses} ${variantClasses}`.trim();
    } catch (error) {
      console.error('ButtonStylesManager.getButtonClasses error:', error);
      // 返回安全的預設類別
      return this.base.standard;
    }
  },

  /**
   * 取得變體相關的 CSS 類別
   * @param {string} variant - 按鈕變體
   * @returns {string} 變體相關的 CSS 類別
   */
  getVariantClasses: function(variant) {
    // 對於使用 CSS 變數的變體，我們不需要額外的 Tailwind 類別
    // 樣式將透過 getButtonStyle 函數的內聯樣式處理
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'success':
      case 'custom':
        return '';
      default:
        return '';
    }
  },

  /**
   * 取得完整的按鈕內聯樣式
   * @param {Object} options - 樣式選項
   * @param {string} options.variant - 按鈕變體
   * @param {string} options.state - 按鈕狀態
   * @param {Object} options.customColors - 自訂顏色
   * @param {boolean} options.ignoreDisabled - 忽略停用狀態
   * @returns {Object} 內聯樣式物件
   */
  getButtonStyle: function(options = {}) {
    try {
      const {
        variant = 'primary',
        state = 'normal',
        customColors = {},
        ignoreDisabled = false
      } = options;

      // 驗證變體
      let validVariant = variant;
      if (!this.variants[variant]) {
        console.warn(`Invalid button variant: ${variant}. Using 'primary' as fallback.`);
        validVariant = 'primary';
      }

      // 驗證狀態
      let validState = state;
      if (!this.states[state]) {
        console.warn(`Invalid button state: ${state}. Using 'normal' as fallback.`);
        validState = 'normal';
      }

      // 取得變體樣式
      const variantStyle = validVariant === 'custom' 
        ? customColors 
        : { ...this.variants[validVariant] };
      
      // 取得狀態樣式
      const stateStyle = ignoreDisabled && validState === 'disabled' 
        ? { ...this.states.normal }
        : { ...this.states[validState] };
      
      // 合併所有樣式
      return {
        ...variantStyle,
        ...stateStyle,
        ...this.base.fixes
      };
    } catch (error) {
      console.error('ButtonStylesManager.getButtonStyle error:', error);
      // 返回安全的預設樣式
      return {
        background: 'linear-gradient(135deg, var(--theme-primary, #dc143c), var(--theme-accent, #ffd700))',
        borderColor: 'var(--theme-primary, #dc143c)',
        color: 'var(--text-primary, #ffffff)',
        margin: 0,
        touchAction: 'manipulation',
        opacity: 1,
        cursor: 'pointer'
      };
    }
  },

  /**
   * 建立與現有按鈕邏輯相容的包裝器
   * @param {Object} originalLogic - 原始按鈕邏輯物件
   * @returns {Object} 相容的按鈕邏輯物件
   */
  createCompatibleButtonLogic: function(originalLogic) {
    const self = this;
    
    return {
      ...originalLogic,
      getAddButtonStyle: function(customBackground, customTextColor, ignoreOperationalStatus) {
        if (customBackground || customTextColor) {
          return self.getButtonStyle({
            variant: 'custom',
            customColors: {
              background: customBackground,
              color: customTextColor
            },
            state: ignoreOperationalStatus ? 'normal' : 'disabled'
          });
        }
        
        return self.getButtonStyle({
          variant: 'primary',
          state: ignoreOperationalStatus ? 'normal' : 'disabled'
        });
      }
    };
  },

  /**
   * 安全的樣式取得函數，包含錯誤處理
   * @param {Object} options - 樣式選項
   * @returns {Object} 安全的樣式物件
   */
  safeGetButtonStyle: function(options) {
    try {
      return this.getButtonStyle(options);
    } catch (error) {
      console.error('ButtonStylesManager.safeGetButtonStyle error:', error);
      // 返回最基本的安全樣式
      return {
        background: '#dc143c',
        borderColor: '#dc143c',
        color: 'white',
        margin: 0,
        touchAction: 'manipulation',
        opacity: 1,
        cursor: 'pointer'
      };
    }
  }
};

// 註冊到 window 物件供全域使用
if (typeof window !== 'undefined') {
  window.ButtonStylesManager = ButtonStylesManager;
  
  // 觸發自訂事件通知系統 ButtonStylesManager 已載入
  if (window.dispatchEvent) {
    const event = new CustomEvent('buttonStylesManagerLoaded', {
      detail: { manager: ButtonStylesManager }
    });
    window.dispatchEvent(event);
  }
  
  console.log('ButtonStylesManager loaded and registered globally');
}

// 支援 CommonJS 模組匯出（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonStylesManager;
}

// ES6 模組匯出已移除，因為此檔案透過 script 標籤載入，不是作為模組