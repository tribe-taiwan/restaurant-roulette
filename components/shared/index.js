/**
 * Shared Components Index
 * 統一導出所有共用組件
 */

// 導入組件類
import LargeButton from './LargeButton.js';
import MobileCard from './MobileCard.js';
import StatusIndicator from './StatusIndicator.js';
import TouchOptimizer from './TouchOptimizer.js';

// 導出組件類
export {
    LargeButton,
    MobileCard,
    StatusIndicator,
    TouchOptimizer
};

// 導出工廠函數
export const createLargeButton = (options) => {
    const button = new LargeButton(options);
    const element = button.getElement();
    
    // 自動應用觸控優化
    if (window.touchOptimizer) {
        window.touchOptimizer.optimizeButton(element, {
            hapticFeedback: options.hapticFeedback !== false,
            preventAccidental: options.preventAccidental !== false
        });
        element.setAttribute('data-touch-optimized', 'true');
    }
    
    return button;
};

export const createMobileCard = (options) => new MobileCard(options);
export const createStatusIndicator = (options) => new StatusIndicator(options);
export const createTouchOptimizer = () => new TouchOptimizer();

// 便捷的狀態指示器方法
export const showLoading = (message = '載入中...', options = {}) => {
    return new StatusIndicator({
        type: 'loading',
        message,
        position: 'fixed',
        autoHide: false,
        ...options
    }).show();
};

export const showSuccess = (message = '操作成功', options = {}) => {
    return new StatusIndicator({
        type: 'success',
        message,
        position: 'fixed',
        autoHide: true,
        ...options
    }).show();
};

export const showError = (message = '操作失敗', options = {}) => {
    return new StatusIndicator({
        type: 'error',
        message,
        position: 'fixed',
        autoHide: true,
        autoHideDelay: 5000,
        ...options
    }).show();
};

export const showWarning = (message = '警告', options = {}) => {
    return new StatusIndicator({
        type: 'warning',
        message,
        position: 'fixed',
        autoHide: true,
        autoHideDelay: 4000,
        ...options
    }).show();
};

export const showInfo = (message = '提示', options = {}) => {
    return new StatusIndicator({
        type: 'info',
        message,
        position: 'fixed',
        autoHide: true,
        autoHideDelay: 3000,
        ...options
    }).show();
};

// 全局觸控優化函數
export const optimizeAllButtons = () => {
    if (!window.touchOptimizer) return;
    
    const buttons = document.querySelectorAll('button, [role="button"], .clickable');
    buttons.forEach(button => {
        if (!button.hasAttribute('data-touch-optimized')) {
            window.touchOptimizer.optimizeButton(button);
            button.setAttribute('data-touch-optimized', 'true');
        }
    });
    
    console.log(`✅ 已優化 ${buttons.length} 個按鈕的觸控體驗`);
};

// 預設導出（用於直接導入整個模組）
export default {
    LargeButton,
    MobileCard,
    StatusIndicator,
    TouchOptimizer,
    createLargeButton,
    createMobileCard,
    createStatusIndicator,
    createTouchOptimizer,
    optimizeAllButtons,
    showLoading,
    showSuccess,
    showError,
    showWarning,
    showInfo
};