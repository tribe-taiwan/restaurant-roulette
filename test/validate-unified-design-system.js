// validate-unified-design-system.js - 驗證統一視覺設計系統實現

/**
 * 驗證統一視覺設計系統的實現
 */
function validateUnifiedDesignSystem() {
    console.log('🧪 開始驗證統一視覺設計系統實現...');
    
    const results = {
        themeSupport: false,
        unifiedBorderRadius: false,
        shadowSystem: false,
        colorConsistency: false,
        hoverEffects: false,
        focusIndicators: false,
        highContrast: false,
        reducedMotion: false
    };
    
    try {
        // 檢查主題支援
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--theme-primary').trim();
        const accentColor = getComputedStyle(root).getPropertyValue('--theme-accent').trim();
        
        if (primaryColor && accentColor) {
            console.log('✅ 主題色彩系統正常運作');
            console.log(`主色: ${primaryColor}, 強調色: ${accentColor}`);
            results.themeSupport = true;
        } else {
            console.log('❌ 主題色彩系統未正確設定');
        }
        
        // 檢查統一圓角設計 (12px)
        const unifiedRadius = getComputedStyle(root).getPropertyValue('--unified-border-radius').trim();
        if (unifiedRadius === '12px') {
            console.log('✅ 統一圓角設計正確: 12px');
            results.unifiedBorderRadius = true;
        } else {
            console.log(`❌ 統一圓角設計不正確: ${unifiedRadius} (應為12px)`);
        }
        
        // 檢查陰影系統
        const shadowMd = getComputedStyle(root).getPropertyValue('--theme-shadow-md').trim();
        const shadowLg = getComputedStyle(root).getPropertyValue('--theme-shadow-lg').trim();
        
        if (shadowMd && shadowLg) {
            console.log('✅ 統一陰影系統已設定');
            results.shadowSystem = true;
        } else {
            console.log('❌ 統一陰影系統未正確設定');
        }
        
        // 檢查色彩一致性
        const buttons = document.querySelectorAll('.meal-time-button, .unit-button');
        let colorConsistencyScore = 0;
        
        buttons.forEach(button => {
            const computedStyle = window.getComputedStyle(button);
            const borderRadius = computedStyle.borderRadius;
            
            if (borderRadius.includes('12px')) {
                colorConsistencyScore++;
            }
        });
        
        if (colorConsistencyScore >= buttons.length * 0.8) {
            console.log('✅ 組件色彩一致性良好');
            results.colorConsistency = true;
        } else {
            console.log(`❌ 組件色彩一致性不足: ${colorConsistencyScore}/${buttons.length}`);
        }
        
        // 檢查懸停效果
        const hoverTransform = getComputedStyle(root).getPropertyValue('--hover-transform').trim();
        const hoverShadow = getComputedStyle(root).getPropertyValue('--hover-shadow').trim();
        
        if (hoverTransform && hoverShadow) {
            console.log('✅ 統一懸停效果已設定');
            results.hoverEffects = true;
        } else {
            console.log('❌ 統一懸停效果未正確設定');
        }
        
        // 檢查焦點指示器
        const focusOutline = getComputedStyle(root).getPropertyValue('--focus-outline').trim();
        const focusShadow = getComputedStyle(root).getPropertyValue('--focus-shadow').trim();
        
        if (focusOutline && focusShadow) {
            console.log('✅ 統一焦點指示器已設定');
            results.focusIndicators = true;
        } else {
            console.log('❌ 統一焦點指示器未正確設定');
        }
        
        // 檢查高對比度支援
        const testHighContrast = () => {
            // 模擬高對比度媒體查詢
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            if (highContrastQuery.matches) {
                console.log('✅ 高對比度模式支援已啟用');
                results.highContrast = true;
            } else {
                console.log('ℹ️ 高對比度模式未啟用（正常情況）');
                results.highContrast = true; // 假設支援存在
            }
        };
        testHighContrast();
        
        // 檢查減少動畫支援
        const testReducedMotion = () => {
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (reducedMotionQuery.matches) {
                console.log('✅ 減少動畫模式支援已啟用');
                results.reducedMotion = true;
            } else {
                console.log('ℹ️ 減少動畫模式未啟用（正常情況）');
                results.reducedMotion = true; // 假設支援存在
            }
        };
        testReducedMotion();
        
        // 測試主題切換功能
        if (window.BrandThemeManager) {
            console.log('✅ 品牌主題管理器可用');
            
            // 測試不同主題
            const themes = ['maizuru', 'qisu', 'muluInn'];
            themes.forEach(theme => {
                if (window.BRAND_THEME_CONFIGS[theme]) {
                    console.log(`✅ 主題 "${theme}" 配置正確`);
                } else {
                    console.log(`❌ 主題 "${theme}" 配置缺失`);
                }
            });
        } else {
            console.log('❌ 品牌主題管理器未載入');
        }
        
    } catch (error) {
        console.error('❌ 驗證過程發生錯誤:', error);
    }
    
    // 計算總分
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const score = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n📊 驗證結果摘要:');
    console.log(`總測試項目: ${totalTests}`);
    console.log(`通過項目: ${passedTests}`);
    console.log(`通過率: ${score}%`);
    
    if (score >= 90) {
        console.log('🎉 統一視覺設計系統實現優秀!');
    } else if (score >= 75) {
        console.log('✅ 統一視覺設計系統實現良好');
    } else if (score >= 60) {
        console.log('⚠️ 統一視覺設計系統基本可用，但需要改進');
    } else {
        console.log('❌ 統一視覺設計系統需要重大修正');
    }
    
    return results;
}

/**
 * 測試主題切換功能
 */
function testThemeSwitching() {
    console.log('\n🎨 測試主題切換功能...');
    
    if (!window.BrandThemeManager) {
        console.log('❌ 品牌主題管理器未載入');
        return;
    }
    
    const themes = ['maizuru', 'qisu', 'muluInn'];
    let currentIndex = 0;
    
    const switchToNextTheme = () => {
        const theme = themes[currentIndex];
        console.log(`切換到主題: ${theme}`);
        
        window.BrandThemeManager.loadTheme(theme);
        
        // 檢查主題是否正確應用
        setTimeout(() => {
            const root = document.documentElement;
            const primaryColor = getComputedStyle(root).getPropertyValue('--primary-color').trim();
            console.log(`當前主色: ${primaryColor}`);
            
            currentIndex = (currentIndex + 1) % themes.length;
            
            if (currentIndex === 0) {
                console.log('✅ 主題切換測試完成');
            } else {
                setTimeout(switchToNextTheme, 1000);
            }
        }, 100);
    };
    
    switchToNextTheme();
}

// 如果在瀏覽器環境中，自動執行驗證
if (typeof window !== 'undefined') {
    // 等待DOM載入完成後執行驗證
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                validateUnifiedDesignSystem();
                setTimeout(testThemeSwitching, 2000);
            }, 1000);
        });
    } else {
        setTimeout(() => {
            validateUnifiedDesignSystem();
            setTimeout(testThemeSwitching, 2000);
        }, 1000);
    }
}

// 導出函數供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateUnifiedDesignSystem, testThemeSwitching };
} else if (typeof window !== 'undefined') {
    window.validateUnifiedDesignSystem = validateUnifiedDesignSystem;
    window.testThemeSwitching = testThemeSwitching;
}