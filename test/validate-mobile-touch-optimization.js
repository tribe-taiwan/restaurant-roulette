/**
 * 移動端觸控體驗優化驗證腳本
 * 驗證所有觸控優化功能是否正常工作
 */

class MobileTouchOptimizationValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };
    }

    /**
     * 執行所有驗證測試
     */
    async runAllTests() {
        console.log('🧪 開始移動端觸控體驗優化驗證...\n');

        // 1. 驗證最小觸控標準
        await this.validateMinimumTouchTargets();

        // 2. 驗證觸控回饋動畫
        await this.validateTouchFeedback();

        // 3. 驗證防誤觸機制
        await this.validateAccidentalTouchPrevention();

        // 4. 驗證載入狀態指示
        await this.validateLoadingStates();

        // 5. 驗證單手操作便利性
        await this.validateSingleHandOperation();

        // 6. 驗證無障礙支援
        await this.validateAccessibility();

        // 7. 驗證觸覺回饋
        await this.validateHapticFeedback();

        // 8. 驗證主題適配
        await this.validateThemeCompatibility();

        // 輸出結果
        this.outputResults();
    }

    /**
     * 驗證最小觸控標準（44px）
     */
    async validateMinimumTouchTargets() {
        console.log('📏 驗證最小觸控標準...');

        const buttons = document.querySelectorAll('button, [role="button"], .clickable');
        let passCount = 0;
        let failCount = 0;

        buttons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            const minSize = 44;
            
            const meetsStandard = rect.width >= minSize && rect.height >= minSize;
            
            if (meetsStandard) {
                passCount++;
                this.addResult('pass', `按鈕 ${index + 1}: 尺寸符合標準 (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
            } else {
                failCount++;
                this.addResult('fail', `按鈕 ${index + 1}: 尺寸不符合標準 (${Math.round(rect.width)}x${Math.round(rect.height)}px < ${minSize}px)`);
            }
        });

        console.log(`✅ 通過: ${passCount} 個按鈕`);
        console.log(`❌ 失敗: ${failCount} 個按鈕\n`);
    }

    /**
     * 驗證觸控回饋動畫
     */
    async validateTouchFeedback() {
        console.log('🎭 驗證觸控回饋動畫...');

        const testButton = document.createElement('button');
        testButton.className = 'large-button large-button--medium large-button--primary';
        testButton.textContent = '測試按鈕';
        testButton.style.position = 'fixed';
        testButton.style.top = '-100px';
        testButton.style.left = '-100px';
        document.body.appendChild(testButton);

        try {
            // 測試觸控優化器是否存在
            if (typeof window.touchOptimizer === 'undefined') {
                this.addResult('fail', 'TouchOptimizer 未載入');
                return;
            }

            // 應用觸控優化
            window.touchOptimizer.optimizeButton(testButton);

            // 模擬觸控事件
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 0, clientY: 0 }]
            });
            
            testButton.dispatchEvent(touchStartEvent);

            // 檢查是否添加了觸控狀態類
            setTimeout(() => {
                const hasActiveClass = testButton.classList.contains('touch-active') || 
                                     testButton.classList.contains('large-button--pressed');
                
                if (hasActiveClass) {
                    this.addResult('pass', '觸控回饋動畫正常工作');
                } else {
                    this.addResult('fail', '觸控回饋動畫未正常工作');
                }

                // 清理測試元素
                document.body.removeChild(testButton);
            }, 100);

        } catch (error) {
            this.addResult('fail', `觸控回饋測試失敗: ${error.message}`);
            document.body.removeChild(testButton);
        }

        console.log('✅ 觸控回饋驗證完成\n');
    }

    /**
     * 驗證防誤觸機制
     */
    async validateAccidentalTouchPrevention() {
        console.log('🛡️ 驗證防誤觸機制...');

        // 檢查是否有防雙擊縮放
        const hasPreventZoom = document.addEventListener.toString().includes('touchstart');
        
        if (hasPreventZoom) {
            this.addResult('pass', '防雙擊縮放機制已啟用');
        } else {
            this.addResult('warning', '防雙擊縮放機制可能未啟用');
        }

        // 檢查觸控延遲設定
        const bodyStyle = window.getComputedStyle(document.body);
        const touchAction = bodyStyle.touchAction;
        
        if (touchAction === 'manipulation') {
            this.addResult('pass', '觸控操作優化已啟用');
        } else {
            this.addResult('warning', '觸控操作優化可能未啟用');
        }

        console.log('✅ 防誤觸機制驗證完成\n');
    }

    /**
     * 驗證載入狀態指示
     */
    async validateLoadingStates() {
        console.log('⏳ 驗證載入狀態指示...');

        try {
            // 測試 StatusIndicator
            if (typeof window.StatusIndicator !== 'undefined') {
                const indicator = new window.StatusIndicator({
                    type: 'loading',
                    message: '測試載入',
                    position: 'fixed'
                });

                const element = indicator.getElement();
                
                if (element && element.classList.contains('status-indicator--loading')) {
                    this.addResult('pass', 'StatusIndicator 載入狀態正常');
                } else {
                    this.addResult('fail', 'StatusIndicator 載入狀態異常');
                }

                // 清理
                indicator.destroy();
            } else {
                this.addResult('fail', 'StatusIndicator 組件未載入');
            }

            // 檢查載入動畫 CSS
            const hasSpinAnimation = Array.from(document.styleSheets).some(sheet => {
                try {
                    return Array.from(sheet.cssRules).some(rule => 
                        rule.cssText && rule.cssText.includes('@keyframes spin')
                    );
                } catch (e) {
                    return false;
                }
            });

            if (hasSpinAnimation) {
                this.addResult('pass', '載入動畫 CSS 已定義');
            } else {
                this.addResult('warning', '載入動畫 CSS 可能未定義');
            }

        } catch (error) {
            this.addResult('fail', `載入狀態測試失敗: ${error.message}`);
        }

        console.log('✅ 載入狀態驗證完成\n');
    }

    /**
     * 驗證單手操作便利性
     */
    async validateSingleHandOperation() {
        console.log('👍 驗證單手操作便利性...');

        const screenHeight = window.innerHeight;
        const thumbZoneStart = screenHeight * 0.67; // 下方 1/3 為拇指區域

        const importantButtons = document.querySelectorAll('[data-important-action="true"]');
        let inThumbZone = 0;
        let outOfThumbZone = 0;

        importantButtons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            const buttonCenter = rect.top + rect.height / 2;

            if (buttonCenter > thumbZoneStart) {
                inThumbZone++;
                this.addResult('pass', `重要按鈕 ${index + 1} 在拇指可達區域`);
            } else {
                outOfThumbZone++;
                this.addResult('warning', `重要按鈕 ${index + 1} 不在拇指可達區域`);
            }
        });

        // 檢查單手模式類
        const hasSingleHandClass = document.documentElement.classList.contains('single-hand-mode');
        if (hasSingleHandClass) {
            this.addResult('pass', '單手模式類已應用');
        } else {
            this.addResult('info', '單手模式類未應用（可能不是大螢幕設備）');
        }

        console.log(`✅ 拇指區域內: ${inThumbZone} 個重要按鈕`);
        console.log(`⚠️ 拇指區域外: ${outOfThumbZone} 個重要按鈕\n`);
    }

    /**
     * 驗證無障礙支援
     */
    async validateAccessibility() {
        console.log('♿ 驗證無障礙支援...');

        const buttons = document.querySelectorAll('button, [role="button"]');
        let hasAriaLabel = 0;
        let missingAriaLabel = 0;

        buttons.forEach((button, index) => {
            const hasLabel = button.hasAttribute('aria-label') || 
                           button.hasAttribute('aria-labelledby') ||
                           button.textContent.trim().length > 0;

            if (hasLabel) {
                hasAriaLabel++;
            } else {
                missingAriaLabel++;
                this.addResult('warning', `按鈕 ${index + 1} 缺少無障礙標籤`);
            }
        });

        // 檢查焦點樣式
        const hasFocusStyles = Array.from(document.styleSheets).some(sheet => {
            try {
                return Array.from(sheet.cssRules).some(rule => 
                    rule.selectorText && rule.selectorText.includes(':focus')
                );
            } catch (e) {
                return false;
            }
        });

        if (hasFocusStyles) {
            this.addResult('pass', '焦點樣式已定義');
        } else {
            this.addResult('warning', '焦點樣式可能未定義');
        }

        console.log(`✅ 有無障礙標籤: ${hasAriaLabel} 個按鈕`);
        console.log(`⚠️ 缺少標籤: ${missingAriaLabel} 個按鈕\n`);
    }

    /**
     * 驗證觸覺回饋
     */
    async validateHapticFeedback() {
        console.log('📳 驗證觸覺回饋...');

        const hasVibrateAPI = 'vibrate' in navigator;
        
        if (hasVibrateAPI) {
            this.addResult('pass', '設備支援觸覺回饋 API');
            
            // 測試觸覺回饋
            try {
                const result = navigator.vibrate(1);
                if (result) {
                    this.addResult('pass', '觸覺回饋測試成功');
                } else {
                    this.addResult('warning', '觸覺回饋可能被用戶禁用');
                }
            } catch (error) {
                this.addResult('warning', `觸覺回饋測試失敗: ${error.message}`);
            }
        } else {
            this.addResult('info', '設備不支援觸覺回饋 API');
        }

        console.log('✅ 觸覺回饋驗證完成\n');
    }

    /**
     * 驗證主題適配
     */
    async validateThemeCompatibility() {
        console.log('🎨 驗證主題適配...');

        // 檢查主題管理器
        if (typeof window.BrandThemeManager !== 'undefined') {
            const currentTheme = window.BrandThemeManager.getCurrentTheme();
            
            if (currentTheme) {
                this.addResult('pass', `當前主題: ${window.BrandThemeManager.getCurrentThemeId()}`);
                
                // 檢查社交媒體連結是否正確
                const socialMedia = currentTheme.socialMedia;
                if (socialMedia) {
                    Object.keys(socialMedia).forEach(platform => {
                        const link = socialMedia[platform];
                        if (link && link.url) {
                            this.addResult('pass', `${platform} 連結已配置`);
                        } else {
                            this.addResult('warning', `${platform} 連結未配置`);
                        }
                    });
                }
            } else {
                this.addResult('fail', '無法獲取當前主題配置');
            }
        } else {
            this.addResult('warning', '主題管理器未載入');
        }

        console.log('✅ 主題適配驗證完成\n');
    }

    /**
     * 添加測試結果
     */
    addResult(type, message) {
        this.results.details.push({ type, message });
        
        switch (type) {
            case 'pass':
                this.results.passed++;
                break;
            case 'fail':
                this.results.failed++;
                break;
            case 'warning':
            case 'info':
                this.results.warnings++;
                break;
        }
    }

    /**
     * 輸出測試結果
     */
    outputResults() {
        console.log('📊 移動端觸控體驗優化驗證結果');
        console.log('='.repeat(50));
        console.log(`✅ 通過: ${this.results.passed}`);
        console.log(`❌ 失敗: ${this.results.failed}`);
        console.log(`⚠️ 警告: ${this.results.warnings}`);
        console.log('='.repeat(50));

        // 詳細結果
        console.log('\n📋 詳細結果:');
        this.results.details.forEach((result, index) => {
            const icon = {
                'pass': '✅',
                'fail': '❌',
                'warning': '⚠️',
                'info': 'ℹ️'
            }[result.type];
            
            console.log(`${icon} ${result.message}`);
        });

        // 總結
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
        
        console.log(`\n🎯 成功率: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('🎉 所有關鍵功能測試通過！');
        } else {
            console.log('🔧 發現問題，需要修復失敗的項目');
        }

        // 建議
        console.log('\n💡 優化建議:');
        if (this.results.failed > 0) {
            console.log('- 修復失敗的觸控標準和功能問題');
        }
        if (this.results.warnings > 0) {
            console.log('- 考慮改善警告項目以提升用戶體驗');
        }
        console.log('- 在真實設備上進行測試驗證');
        console.log('- 收集用戶反饋進行持續優化');
    }
}

// 自動執行驗證（如果在瀏覽器環境中）
if (typeof window !== 'undefined') {
    window.MobileTouchOptimizationValidator = MobileTouchOptimizationValidator;
    
    // 等待頁面載入完成後執行驗證
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const validator = new MobileTouchOptimizationValidator();
                validator.runAllTests();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            const validator = new MobileTouchOptimizationValidator();
            validator.runAllTests();
        }, 1000);
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileTouchOptimizationValidator;
}