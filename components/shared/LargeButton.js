/**
 * LargeButton - Garmin風格大按鈕組件
 * 支援多種尺寸、狀態和觸控回饋
 */

class LargeButton {
    constructor(options = {}) {
        this.options = {
            size: 'medium', // 'small', 'medium', 'large', 'xl'
            variant: 'primary', // 'primary', 'secondary', 'success', 'warning', 'error'
            disabled: false,
            loading: false,
            touchFeedback: true,
            icon: null,
            iconPosition: 'left', // 'left', 'right', 'top'
            fullWidth: false,
            ...options
        };
        
        this.element = null;
        this.clickHandler = null;
    }

    /**
     * 創建按鈕元素
     */
    createElement() {
        const button = document.createElement('button');
        button.className = this.getButtonClasses();
        button.disabled = this.options.disabled || this.options.loading;
        
        // 設置內容
        this.setButtonContent(button);
        
        // 添加事件監聽器
        this.addEventListeners(button);
        
        this.element = button;
        return button;
    }

    /**
     * 獲取按鈕CSS類名
     */
    getButtonClasses() {
        const classes = ['large-button'];
        
        // 尺寸類名
        classes.push(`large-button--${this.options.size}`);
        
        // 變體類名
        classes.push(`large-button--${this.options.variant}`);
        
        // 狀態類名
        if (this.options.disabled) classes.push('large-button--disabled');
        if (this.options.loading) classes.push('large-button--loading');
        if (this.options.fullWidth) classes.push('large-button--full-width');
        if (this.options.icon) classes.push(`large-button--icon-${this.options.iconPosition}`);
        
        return classes.join(' ');
    }

    /**
     * 設置按鈕內容
     */
    setButtonContent(button) {
        const content = document.createElement('span');
        content.className = 'large-button__content';
        
        // 添加圖標
        if (this.options.icon && !this.options.loading) {
            const icon = this.createIcon();
            content.appendChild(icon);
        }
        
        // 添加載入指示器
        if (this.options.loading) {
            const spinner = this.createSpinner();
            content.appendChild(spinner);
        }
        
        // 添加文字
        if (this.options.text) {
            const text = document.createElement('span');
            text.className = 'large-button__text';
            text.textContent = this.options.text;
            content.appendChild(text);
        }
        
        button.appendChild(content);
    }

    /**
     * 創建圖標元素
     */
    createIcon() {
        const icon = document.createElement('span');
        icon.className = 'large-button__icon';
        icon.innerHTML = this.options.icon;
        return icon;
    }

    /**
     * 創建載入動畫
     */
    createSpinner() {
        const spinner = document.createElement('span');
        spinner.className = 'large-button__spinner';
        spinner.innerHTML = `
            <svg viewBox="0 0 24 24" class="large-button__spinner-svg">
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
        return spinner;
    }

    /**
     * 添加事件監聽器
     */
    addEventListeners(button) {
        // 點擊事件
        button.addEventListener('click', (e) => {
            if (this.options.disabled || this.options.loading) {
                e.preventDefault();
                return;
            }
            
            if (this.clickHandler) {
                this.clickHandler(e);
            }
        });

        // 觸控回饋
        if (this.options.touchFeedback) {
            this.addTouchFeedback(button);
        }

        // 鍵盤支援
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    }

    /**
     * 添加觸控回饋效果
     */
    addTouchFeedback(button) {
        let touchStartTime = 0;
        let touchStartPosition = { x: 0, y: 0 };
        let isLongPress = false;
        let longPressTimer = null;
        let hapticFeedbackGiven = false;

        // 觸控開始
        button.addEventListener('touchstart', (e) => {
            if (this.options.disabled || this.options.loading) return;
            
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPosition = { x: touch.clientX, y: touch.clientY };
            isLongPress = false;
            hapticFeedbackGiven = false;
            
            // 立即視覺回饋
            button.classList.add('large-button--pressed');
            
            // 觸覺回饋（如果支援）
            if (navigator.vibrate && this.options.hapticFeedback !== false) {
                navigator.vibrate(10); // 輕微震動
                hapticFeedbackGiven = true;
            }
            
            // 長按檢測（防誤觸）
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                button.classList.add('large-button--long-press');
                
                // 長按觸覺回饋
                if (navigator.vibrate && hapticFeedbackGiven) {
                    navigator.vibrate([20, 10, 20]); // 長按震動模式
                }
            }, 500);
        });

        // 觸控移動（檢測是否移出按鈕區域）
        button.addEventListener('touchmove', (e) => {
            if (this.options.disabled || this.options.loading) return;
            
            const touch = e.touches[0];
            const rect = button.getBoundingClientRect();
            const isInside = (
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            );
            
            // 如果移出按鈕區域，取消按下狀態
            if (!isInside) {
                button.classList.remove('large-button--pressed', 'large-button--long-press');
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            } else if (!button.classList.contains('large-button--pressed')) {
                button.classList.add('large-button--pressed');
            }
        });

        // 觸控結束
        button.addEventListener('touchend', (e) => {
            if (this.options.disabled || this.options.loading) return;
            
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // 清除長按計時器
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            // 移除視覺狀態
            button.classList.remove('large-button--pressed', 'large-button--long-press');
            
            // 防誤觸：檢查觸控時間和位置
            if (touchDuration < 50) { // 太短的觸控可能是誤觸
                e.preventDefault();
                return;
            }
            
            // 檢查觸控位置是否仍在按鈕內
            const touch = e.changedTouches[0];
            const rect = button.getBoundingClientRect();
            const isInside = (
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            );
            
            if (!isInside) {
                e.preventDefault();
                return;
            }
            
            // 成功觸控回饋
            if (navigator.vibrate && hapticFeedbackGiven) {
                navigator.vibrate(15); // 確認震動
            }
        });

        // 觸控取消
        button.addEventListener('touchcancel', () => {
            button.classList.remove('large-button--pressed', 'large-button--long-press');
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });

        // 滑鼠事件（桌面端）
        button.addEventListener('mousedown', (e) => {
            if (this.options.disabled || this.options.loading) return;
            button.classList.add('large-button--pressed');
        });

        button.addEventListener('mouseup', () => {
            button.classList.remove('large-button--pressed', 'large-button--long-press');
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('large-button--pressed', 'large-button--long-press');
        });

        // 防止雙擊縮放（移動端）
        button.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
    }

    /**
     * 設置點擊處理器
     */
    onClick(handler) {
        this.clickHandler = handler;
        return this;
    }

    /**
     * 更新按鈕狀態
     */
    updateState(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        if (this.element) {
            this.element.className = this.getButtonClasses();
            this.element.disabled = this.options.disabled || this.options.loading;
            
            // 重新設置內容
            this.element.innerHTML = '';
            this.setButtonContent(this.element);
        }
        
        return this;
    }

    /**
     * 設置載入狀態
     */
    setLoading(loading) {
        return this.updateState({ loading });
    }

    /**
     * 設置禁用狀態
     */
    setDisabled(disabled) {
        return this.updateState({ disabled });
    }

    /**
     * 獲取按鈕元素
     */
    getElement() {
        return this.element || this.createElement();
    }
}

// 工廠函數，方便快速創建按鈕
window.createLargeButton = function(options) {
    return new LargeButton(options);
};

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LargeButton;
}