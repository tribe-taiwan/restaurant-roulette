/**
 * TouchOptimizer - 移動端觸控體驗優化工具
 * 提供防誤觸、單手操作優化、觸覺回饋等功能
 */

class TouchOptimizer {
    constructor() {
        this.isInitialized = false;
        this.touchStartTime = 0;
        this.lastTouchEnd = 0;
        this.touchCount = 0;
        this.preventAccidentalTouch = true;
        this.enableHapticFeedback = true;
        this.singleHandMode = false;
        
        this.init();
    }

    /**
     * 初始化觸控優化
     */
    init() {
        if (this.isInitialized) return;
        
        // 檢測設備類型
        this.detectDeviceType();
        
        // 設置全局觸控優化
        this.setupGlobalTouchOptimization();
        
        // 檢測單手操作模式
        this.detectSingleHandMode();
        
        this.isInitialized = true;
        console.log('✅ TouchOptimizer 已初始化');
    }

    /**
     * 檢測設備類型
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        
        document.documentElement.classList.toggle('is-mobile', isMobile);
        document.documentElement.classList.toggle('is-tablet', isTablet);
        document.documentElement.classList.toggle('is-ios', isIOS);
        
        // 根據設備調整設定
        if (isMobile) {
            this.enableHapticFeedback = true;
            this.preventAccidentalTouch = true;
        }
    }

    /**
     * 設置全局觸控優化
     */
    setupGlobalTouchOptimization() {
        // 防止雙擊縮放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // 防止快速連續點擊
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - this.lastTouchEnd < 300) {
                e.preventDefault();
                return false;
            }
            this.lastTouchEnd = now;
        }, { passive: false });

        // 優化滾動性能
        document.addEventListener('touchmove', (e) => {
            // 允許垂直滾動，但限制水平滾動
            const touch = e.touches[0];
            const target = e.target.closest('[data-scroll-lock]');
            if (target) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * 檢測單手操作模式
     */
    detectSingleHandMode() {
        // 根據螢幕尺寸和方向判斷
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const isLargeScreen = Math.max(screenHeight, screenWidth) > 667; // iPhone 6 Plus 以上
        
        if (isLargeScreen) {
            this.singleHandMode = true;
            document.documentElement.classList.add('single-hand-mode');
        }

        // 監聽方向變化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectSingleHandMode();
            }, 100);
        });
    }

    /**
     * 優化按鈕觸控體驗
     */
    optimizeButton(button, options = {}) {
        if (!button) return;

        const config = {
            minTouchTarget: 44,
            hapticFeedback: this.enableHapticFeedback,
            preventAccidental: this.preventAccidentalTouch,
            confirmationRequired: false,
            ...options
        };

        // 確保最小觸控目標
        this.ensureMinimumTouchTarget(button, config.minTouchTarget);

        // 添加觸控回饋
        this.addEnhancedTouchFeedback(button, config);

        // 防誤觸機制
        if (config.preventAccidental) {
            this.addAccidentalTouchPrevention(button);
        }

        // 確認機制（用於重要操作）
        if (config.confirmationRequired) {
            this.addConfirmationMechanism(button, config);
        }

        return button;
    }

    /**
     * 確保最小觸控目標
     */
    ensureMinimumTouchTarget(element, minSize) {
        const rect = element.getBoundingClientRect();
        const currentHeight = rect.height;
        const currentWidth = rect.width;

        if (currentHeight < minSize || currentWidth < minSize) {
            const style = window.getComputedStyle(element);
            const paddingTop = parseInt(style.paddingTop) || 0;
            const paddingBottom = parseInt(style.paddingBottom) || 0;
            const paddingLeft = parseInt(style.paddingLeft) || 0;
            const paddingRight = parseInt(style.paddingRight) || 0;

            if (currentHeight < minSize) {
                const additionalPadding = (minSize - currentHeight) / 2;
                element.style.paddingTop = `${paddingTop + additionalPadding}px`;
                element.style.paddingBottom = `${paddingBottom + additionalPadding}px`;
            }

            if (currentWidth < minSize) {
                const additionalPadding = (minSize - currentWidth) / 2;
                element.style.paddingLeft = `${paddingLeft + additionalPadding}px`;
                element.style.paddingRight = `${paddingRight + additionalPadding}px`;
            }
        }
    }

    /**
     * 添加增強觸控回饋
     */
    addEnhancedTouchFeedback(element, config) {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };

        element.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };

            // 視覺回饋
            element.classList.add('touch-active');

            // 觸覺回饋
            if (config.hapticFeedback && navigator.vibrate) {
                navigator.vibrate(10);
            }
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // 移除視覺回饋
            setTimeout(() => {
                element.classList.remove('touch-active');
            }, 150);

            // 成功觸控回饋
            if (touchDuration > 50 && touchDuration < 2000) {
                if (config.hapticFeedback && navigator.vibrate) {
                    navigator.vibrate(15);
                }
            }
        }, { passive: true });

        element.addEventListener('touchcancel', () => {
            element.classList.remove('touch-active');
        }, { passive: true });
    }

    /**
     * 添加防誤觸機制
     */
    addAccidentalTouchPrevention(element) {
        let touchStartTime = 0;
        let touchMoved = false;

        element.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchMoved = false;
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            touchMoved = true;
        }, { passive: true });

        element.addEventListener('click', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;

            // 防止太快的點擊（可能是誤觸）
            if (touchDuration < 100) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // 防止滑動後的點擊
            if (touchMoved) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, { capture: true });
    }

    /**
     * 添加確認機制
     */
    addConfirmationMechanism(element, config) {
        const originalClickHandler = element.onclick;
        let confirmationShown = false;

        element.onclick = (e) => {
            if (!confirmationShown) {
                e.preventDefault();
                e.stopPropagation();

                // 顯示確認提示
                this.showConfirmation(element, config.confirmationMessage || '確定要執行此操作嗎？')
                    .then((confirmed) => {
                        if (confirmed && originalClickHandler) {
                            confirmationShown = true;
                            originalClickHandler.call(element, e);
                            setTimeout(() => {
                                confirmationShown = false;
                            }, 1000);
                        }
                    });

                return false;
            }
        };
    }

    /**
     * 顯示確認對話框
     */
    showConfirmation(element, message) {
        return new Promise((resolve) => {
            // 創建確認對話框
            const overlay = document.createElement('div');
            overlay.className = 'touch-confirmation-overlay';
            overlay.innerHTML = `
                <div class="touch-confirmation-dialog">
                    <div class="touch-confirmation-message">${message}</div>
                    <div class="touch-confirmation-buttons">
                        <button class="touch-confirmation-cancel">取消</button>
                        <button class="touch-confirmation-confirm">確定</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // 添加事件監聽器
            const cancelBtn = overlay.querySelector('.touch-confirmation-cancel');
            const confirmBtn = overlay.querySelector('.touch-confirmation-confirm');

            cancelBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };

            confirmBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };

            // 點擊外部關閉
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            };

            // 自動關閉
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            }, 10000);
        });
    }

    /**
     * 優化單手操作
     */
    optimizeForSingleHand() {
        if (!this.singleHandMode) return;

        // 將重要按鈕移到螢幕下方
        const importantButtons = document.querySelectorAll('[data-important-action]');
        importantButtons.forEach(button => {
            button.style.position = 'sticky';
            button.style.bottom = '20px';
            button.style.zIndex = '100';
        });

        // 添加拇指區域指示
        document.documentElement.classList.add('thumb-zone-optimized');
    }

    /**
     * 獲取觸控統計
     */
    getTouchStats() {
        return {
            touchCount: this.touchCount,
            singleHandMode: this.singleHandMode,
            hapticEnabled: this.enableHapticFeedback,
            preventAccidental: this.preventAccidentalTouch
        };
    }
}

// 創建全局實例
window.touchOptimizer = new TouchOptimizer();

// 便捷函數
window.optimizeButtonTouch = function(button, options) {
    return window.touchOptimizer.optimizeButton(button, options);
};

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchOptimizer;
}