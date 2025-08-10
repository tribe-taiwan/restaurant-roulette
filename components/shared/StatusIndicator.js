/**
 * StatusIndicator - 狀態指示器組件
 * 用於顯示載入、成功、錯誤等狀態回饋
 */

class StatusIndicator {
    constructor(options = {}) {
        this.options = {
            type: 'loading', // 'loading', 'success', 'error', 'warning', 'info'
            size: 'medium', // 'small', 'medium', 'large'
            message: '',
            showIcon: true,
            showMessage: true,
            autoHide: false,
            autoHideDelay: 3000,
            position: 'static', // 'static', 'fixed', 'absolute'
            className: '',
            ...options
        };
        
        this.element = null;
        this.autoHideTimer = null;
    }

    /**
     * 創建狀態指示器元素
     */
    createElement() {
        const indicator = document.createElement('div');
        indicator.className = this.getIndicatorClasses();
        
        // 設置位置樣式
        this.setPositionStyles(indicator);
        
        // 創建內容
        this.createIndicatorContent(indicator);
        
        // 設置自動隱藏
        if (this.options.autoHide) {
            this.setAutoHide();
        }
        
        this.element = indicator;
        return indicator;
    }

    /**
     * 獲取指示器CSS類名
     */
    getIndicatorClasses() {
        const classes = ['status-indicator'];
        
        // 類型類名
        classes.push(`status-indicator--${this.options.type}`);
        
        // 尺寸類名
        classes.push(`status-indicator--${this.options.size}`);
        
        // 位置類名
        if (this.options.position !== 'static') {
            classes.push(`status-indicator--${this.options.position}`);
        }
        
        // 自定義類名
        if (this.options.className) {
            classes.push(this.options.className);
        }
        
        return classes.join(' ');
    }

    /**
     * 設置位置樣式
     */
    setPositionStyles(indicator) {
        if (this.options.position === 'fixed') {
            indicator.style.position = 'fixed';
            indicator.style.top = '20px';
            indicator.style.right = '20px';
            indicator.style.zIndex = '9999';
        } else if (this.options.position === 'absolute') {
            indicator.style.position = 'absolute';
            indicator.style.top = '50%';
            indicator.style.left = '50%';
            indicator.style.transform = 'translate(-50%, -50%)';
            indicator.style.zIndex = '100';
        }
    }

    /**
     * 創建指示器內容
     */
    createIndicatorContent(indicator) {
        const content = document.createElement('div');
        content.className = 'status-indicator__content';
        
        // 添加圖標
        if (this.options.showIcon) {
            const icon = this.createIcon();
            content.appendChild(icon);
        }
        
        // 添加訊息
        if (this.options.showMessage && this.options.message) {
            const message = this.createMessage();
            content.appendChild(message);
        }
        
        indicator.appendChild(content);
    }

    /**
     * 創建圖標元素
     */
    createIcon() {
        const icon = document.createElement('div');
        icon.className = 'status-indicator__icon';
        
        switch (this.options.type) {
            case 'loading':
                icon.innerHTML = this.getLoadingIcon();
                break;
            case 'success':
                icon.innerHTML = this.getSuccessIcon();
                break;
            case 'error':
                icon.innerHTML = this.getErrorIcon();
                break;
            case 'warning':
                icon.innerHTML = this.getWarningIcon();
                break;
            case 'info':
                icon.innerHTML = this.getInfoIcon();
                break;
            default:
                icon.innerHTML = this.getLoadingIcon();
        }
        
        return icon;
    }

    /**
     * 創建訊息元素
     */
    createMessage() {
        const message = document.createElement('div');
        message.className = 'status-indicator__message';
        message.textContent = this.options.message;
        return message;
    }

    /**
     * 獲取載入圖標
     */
    getLoadingIcon() {
        return `
            <svg viewBox="0 0 24 24" class="status-indicator__spinner">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" 
                        fill="none" stroke-linecap="round" stroke-dasharray="31.416" 
                        stroke-dashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" 
                             values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" 
                             values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
            </svg>
        `;
    }

    /**
     * 獲取成功圖標
     */
    getSuccessIcon() {
        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
        `;
    }

    /**
     * 獲取錯誤圖標
     */
    getErrorIcon() {
        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
        `;
    }

    /**
     * 獲取警告圖標
     */
    getWarningIcon() {
        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        `;
    }

    /**
     * 獲取資訊圖標
     */
    getInfoIcon() {
        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
        `;
    }

    /**
     * 設置自動隱藏
     */
    setAutoHide() {
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }
        
        this.autoHideTimer = setTimeout(() => {
            this.hide();
        }, this.options.autoHideDelay);
    }

    /**
     * 更新狀態
     */
    updateStatus(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        if (this.element) {
            // 更新類名
            this.element.className = this.getIndicatorClasses();
            
            // 重新創建內容
            this.element.innerHTML = '';
            this.createIndicatorContent(this.element);
            
            // 重新設置自動隱藏
            if (this.options.autoHide) {
                this.setAutoHide();
            }
        }
        
        return this;
    }

    /**
     * 顯示指示器
     */
    show() {
        if (this.element) {
            this.element.style.display = 'flex';
            this.element.classList.add('status-indicator--visible');
            
            // 觸發動畫
            requestAnimationFrame(() => {
                this.element.classList.add('status-indicator--animate-in');
            });
            
            // 移動端觸覺回饋
            if (navigator.vibrate && this.options.type === 'error') {
                navigator.vibrate([100, 50, 100]); // 錯誤震動模式
            } else if (navigator.vibrate && this.options.type === 'success') {
                navigator.vibrate(50); // 成功震動
            }
            
            // 無障礙支援
            this.element.setAttribute('role', 'alert');
            this.element.setAttribute('aria-live', this.options.type === 'error' ? 'assertive' : 'polite');
        }
        return this;
    }

    /**
     * 隱藏指示器
     */
    hide() {
        if (this.element) {
            this.element.classList.add('status-indicator--animate-out');
            
            setTimeout(() => {
                this.element.style.display = 'none';
                this.element.classList.remove('status-indicator--visible', 'status-indicator--animate-in', 'status-indicator--animate-out');
            }, 300);
        }
        
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
        
        return this;
    }

    /**
     * 銷毀指示器
     */
    destroy() {
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
    }

    /**
     * 獲取指示器元素
     */
    getElement() {
        return this.element || this.createElement();
    }
}

// 工廠函數和便捷方法
window.createStatusIndicator = function(options) {
    return new StatusIndicator(options);
};

// 便捷的全局方法
window.showLoading = function(message = '載入中...', options = {}) {
    return new StatusIndicator({
        type: 'loading',
        message,
        position: 'fixed',
        autoHide: false,
        ...options
    }).show();
};

window.showSuccess = function(message = '操作成功', options = {}) {
    return new StatusIndicator({
        type: 'success',
        message,
        position: 'fixed',
        autoHide: true,
        ...options
    }).show();
};

window.showError = function(message = '操作失敗', options = {}) {
    return new StatusIndicator({
        type: 'error',
        message,
        position: 'fixed',
        autoHide: true,
        autoHideDelay: 5000,
        ...options
    }).show();
};

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatusIndicator;
}