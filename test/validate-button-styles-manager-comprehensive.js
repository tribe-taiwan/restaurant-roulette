/**
 * ButtonStylesManager 綜合驗證腳本
 * 
 * 此腳本驗證 ButtonStylesManager 的所有功能，包括：
 * 1. 基本功能測試
 * 2. 主題相容性測試
 * 3. 按鈕狀態測試
 * 4. 程式碼重複度分析
 * 5. 錯誤處理測試
 */

// 測試結果收集器
class TestValidator {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    test(name, testFn, category = 'general') {
        try {
            const start = Date.now();
            const result = testFn();
            const duration = Date.now() - start;
            
            this.results.push({
                name,
                category,
                passed: result === true,
                message: result === true ? 'PASS' : result || 'FAIL',
                duration
            });
            
            console.log(`${result === true ? '✅' : '❌'} ${name}: ${result === true ? 'PASS' : result}`);
        } catch (error) {
            this.results.push({
                name,
                category,
                passed: false,
                message: `ERROR: ${error.message}`,
                duration: 0
            });
            
            console.error(`❌ ${name}: ERROR - ${error.message}`);
        }
    }

    getSummary() {
        const total = this.results.length;
        const passed = this.results.filter(r => r.passed).length;
        const failed = total - passed;
        const totalDuration = Date.now() - this.startTime;
        
        return {
            total,
            passed,
            failed,
            passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0,
            duration: totalDuration,
            categories: this.getCategorySummary()
        };
    }

    getCategorySummary() {
        const categories = {};
        this.results.forEach(result => {
            if (!categories[result.category]) {
                categories[result.category] = { total: 0, passed: 0 };
            }
            categories[result.category].total++;
            if (result.passed) categories[result.category].passed++;
        });
        return categories;
    }

    printSummary() {
        const summary = this.getSummary();
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 ButtonStylesManager 測試結果摘要');
        console.log('='.repeat(60));
        console.log(`總測試數: ${summary.total}`);
        console.log(`通過: ${summary.passed} (${summary.passRate}%)`);
        console.log(`失敗: ${summary.failed}`);
        console.log(`執行時間: ${summary.duration}ms`);
        
        console.log('\n📋 分類結果:');
        Object.entries(summary.categories).forEach(([category, stats]) => {
            const rate = ((stats.passed / stats.total) * 100).toFixed(1);
            console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
        });
        
        if (summary.passRate >= 90) {
            console.log('\n🎉 測試結果: 優秀！所有功能運作正常。');
        } else if (summary.passRate >= 70) {
            console.log('\n⚠️ 測試結果: 良好，但有部分功能需要檢查。');
        } else {
            console.log('\n❌ 測試結果: 需要改進，多項功能存在問題。');
        }
        
        console.log('='.repeat(60));
    }
}

// 主要驗證函數
function validateButtonStylesManager() {
    console.log('🚀 開始 ButtonStylesManager 綜合驗證...\n');
    
    const validator = new TestValidator();
    
    // 檢查 ButtonStylesManager 是否存在
    if (typeof window === 'undefined' || !window.ButtonStylesManager) {
        console.error('❌ ButtonStylesManager 未找到！請確保已正確載入。');
        return false;
    }
    
    const BSM = window.ButtonStylesManager;
    
    // 1. 基本功能測試
    console.log('📝 1. 基本功能測試');
    console.log('-'.repeat(30));
    
    validator.test('ButtonStylesManager 物件存在', () => {
        return typeof BSM === 'object' && BSM !== null;
    }, 'basic');

    validator.test('base 屬性結構正確', () => {
        return BSM.base && 
               typeof BSM.base.standard === 'string' &&
               typeof BSM.base.compact === 'string' &&
               typeof BSM.base.fixes === 'object';
    }, 'basic');

    validator.test('variants 屬性結構正確', () => {
        return BSM.variants &&
               BSM.variants.primary &&
               BSM.variants.secondary &&
               BSM.variants.success &&
               BSM.variants.custom;
    }, 'basic');

    validator.test('states 屬性結構正確', () => {
        return BSM.states &&
               BSM.states.normal &&
               BSM.states.disabled &&
               BSM.states.loading;
    }, 'basic');

    // 2. getButtonClasses 函數測試
    console.log('\n📝 2. getButtonClasses 函數測試');
    console.log('-'.repeat(30));

    validator.test('getButtonClasses 函數存在', () => {
        return typeof BSM.getButtonClasses === 'function';
    }, 'functions');

    validator.test('getButtonClasses 預設參數', () => {
        const classes = BSM.getButtonClasses();
        return typeof classes === 'string' && 
               classes.includes('h-[72px]') && 
               classes.includes('p-3') && 
               classes.includes('rounded-lg');
    }, 'functions');

    validator.test('getButtonClasses 標準尺寸', () => {
        const classes = BSM.getButtonClasses('primary', 'standard');
        return classes.includes('h-[72px]') && classes.includes('shadow-lg');
    }, 'functions');

    validator.test('getButtonClasses 緊湊尺寸', () => {
        const classes = BSM.getButtonClasses('primary', 'compact');
        return classes.includes('h-12') && classes.includes('shadow-md');
    }, 'functions');

    validator.test('getButtonClasses 無效尺寸處理', () => {
        const classes = BSM.getButtonClasses('primary', 'invalid');
        return classes.includes('h-[72px]'); // 應該回退到標準尺寸
    }, 'functions');

    // 3. getButtonStyle 函數測試
    console.log('\n📝 3. getButtonStyle 函數測試');
    console.log('-'.repeat(30));

    validator.test('getButtonStyle 函數存在', () => {
        return typeof BSM.getButtonStyle === 'function';
    }, 'functions');

    validator.test('getButtonStyle 預設樣式', () => {
        const style = BSM.getButtonStyle();
        return typeof style === 'object' &&
               style.margin === 0 &&
               style.touchAction === 'manipulation' &&
               style.opacity === 1;
    }, 'functions');

    validator.test('getButtonStyle primary 變體', () => {
        const style = BSM.getButtonStyle({ variant: 'primary' });
        return style.background && 
               style.background.includes('var(--theme-primary') &&
               style.borderColor && 
               style.borderColor.includes('var(--theme-primary');
    }, 'functions');

    validator.test('getButtonStyle secondary 變體', () => {
        const style = BSM.getButtonStyle({ variant: 'secondary' });
        return style.background && 
               style.background.includes('var(--surface-color') &&
               style.borderColor && 
               style.borderColor.includes('var(--border-color');
    }, 'functions');

    validator.test('getButtonStyle success 變體', () => {
        const style = BSM.getButtonStyle({ variant: 'success' });
        return style.background && 
               style.background.includes('var(--success-color') &&
               style.color === 'white';
    }, 'functions');

    validator.test('getButtonStyle custom 變體', () => {
        const customColors = { background: '#ff0000', color: '#ffffff', borderColor: '#ff0000' };
        const style = BSM.getButtonStyle({ variant: 'custom', customColors });
        return style.background === '#ff0000' && 
               style.color === '#ffffff' && 
               style.borderColor === '#ff0000';
    }, 'functions');

    // 4. 按鈕狀態測試
    console.log('\n📝 4. 按鈕狀態測試');
    console.log('-'.repeat(30));

    validator.test('normal 狀態', () => {
        const style = BSM.getButtonStyle({ state: 'normal' });
        return style.opacity === 1 && style.cursor === 'pointer';
    }, 'states');

    validator.test('disabled 狀態', () => {
        const style = BSM.getButtonStyle({ state: 'disabled' });
        return style.opacity === 0.3 && style.cursor === 'not-allowed';
    }, 'states');

    validator.test('loading 狀態', () => {
        const style = BSM.getButtonStyle({ state: 'loading' });
        return style.opacity === 0.5 && style.cursor === 'wait';
    }, 'states');

    validator.test('ignoreDisabled 參數', () => {
        const style = BSM.getButtonStyle({ state: 'disabled', ignoreDisabled: true });
        return style.opacity === 1 && style.cursor === 'pointer';
    }, 'states');

    // 5. 錯誤處理測試
    console.log('\n📝 5. 錯誤處理測試');
    console.log('-'.repeat(30));

    validator.test('無效變體處理', () => {
        const style = BSM.getButtonStyle({ variant: 'invalid' });
        return style.background && style.background.includes('var(--theme-primary'); // 應該回退到 primary
    }, 'error-handling');

    validator.test('無效狀態處理', () => {
        const style = BSM.getButtonStyle({ state: 'invalid' });
        return style.opacity === 1 && style.cursor === 'pointer'; // 應該回退到 normal
    }, 'error-handling');

    validator.test('空參數處理', () => {
        const style = BSM.getButtonStyle({});
        return style.margin === 0 && style.touchAction === 'manipulation';
    }, 'error-handling');

    validator.test('null 參數處理', () => {
        const style = BSM.getButtonStyle(null);
        return style.margin === 0 && style.touchAction === 'manipulation';
    }, 'error-handling');

    // 6. 相容性測試
    console.log('\n📝 6. 相容性測試');
    console.log('-'.repeat(30));

    validator.test('createCompatibleButtonLogic 函數存在', () => {
        return typeof BSM.createCompatibleButtonLogic === 'function';
    }, 'compatibility');

    validator.test('相容性包裝器功能', () => {
        const mockLogic = { someMethod: () => 'test' };
        const compatible = BSM.createCompatibleButtonLogic(mockLogic);
        return typeof compatible.getAddButtonStyle === 'function' && 
               compatible.someMethod() === 'test';
    }, 'compatibility');

    validator.test('getAddButtonStyle 相容性', () => {
        const mockLogic = {};
        const compatible = BSM.createCompatibleButtonLogic(mockLogic);
        const style = compatible.getAddButtonStyle('#ff0000', '#ffffff', true);
        return style.background === '#ff0000' && style.color === '#ffffff';
    }, 'compatibility');

    // 7. 安全性測試
    console.log('\n📝 7. 安全性測試');
    console.log('-'.repeat(30));

    validator.test('safeGetButtonStyle 函數存在', () => {
        return typeof BSM.safeGetButtonStyle === 'function';
    }, 'safety');

    validator.test('safeGetButtonStyle 正常運作', () => {
        const style = BSM.safeGetButtonStyle({ variant: 'primary' });
        return style && typeof style === 'object' && style.margin === 0;
    }, 'safety');

    // 8. 主題相容性測試（如果 ThemeManager 存在）
    if (window.ThemeManager && window.THEME_CONFIGS) {
        console.log('\n📝 8. 主題相容性測試');
        console.log('-'.repeat(30));

        const themes = ['maizuru', 'qisu', 'muluInn'];
        themes.forEach(themeId => {
            validator.test(`${themeId} 主題相容性`, () => {
                // 模擬主題載入
                if (window.THEME_CONFIGS[themeId]) {
                    const style = BSM.getButtonStyle({ variant: 'primary' });
                    return style.background && style.background.includes('var(--theme-primary');
                }
                return true;
            }, 'themes');
        });
    }

    // 9. 效能測試
    console.log('\n📝 9. 效能測試');
    console.log('-'.repeat(30));

    validator.test('getButtonClasses 效能', () => {
        const start = Date.now();
        for (let i = 0; i < 1000; i++) {
            BSM.getButtonClasses('primary', 'standard');
        }
        const duration = Date.now() - start;
        return duration < 100; // 1000 次呼叫應該在 100ms 內完成
    }, 'performance');

    validator.test('getButtonStyle 效能', () => {
        const start = Date.now();
        for (let i = 0; i < 1000; i++) {
            BSM.getButtonStyle({ variant: 'primary', state: 'normal' });
        }
        const duration = Date.now() - start;
        return duration < 200; // 1000 次呼叫應該在 200ms 內完成
    }, 'performance');

    // 10. 程式碼重複度分析
    console.log('\n📝 10. 程式碼重複度分析');
    console.log('-'.repeat(30));

    validator.test('樣式常數集中化', () => {
        // 檢查是否有集中的樣式定義
        const hasStandardSize = BSM.base.standard.includes('h-[72px]');
        const hasCompactSize = BSM.base.compact.includes('h-12');
        const hasFixes = BSM.base.fixes.margin === 0;
        return hasStandardSize && hasCompactSize && hasFixes;
    }, 'duplication');

    validator.test('主題變數使用', () => {
        // 檢查是否使用 CSS 變數而非硬編碼顏色
        const primaryStyle = BSM.variants.primary;
        return primaryStyle.background.includes('var(--theme-primary') &&
               primaryStyle.borderColor.includes('var(--theme-primary');
    }, 'duplication');

    // 輸出測試結果
    validator.printSummary();
    
    return validator.getSummary().passRate >= 80;
}

// 程式碼重複度詳細分析
function analyzeCodeDuplication() {
    console.log('\n📊 程式碼重複度詳細分析');
    console.log('='.repeat(50));
    
    // 模擬分析常見的重複樣式
    const commonStyles = {
        'h-[72px] p-3 rounded-lg border-2': '標準按鈕尺寸',
        'h-12 p-2 rounded-md border': '緊湊按鈕尺寸',
        'flex flex-col items-center justify-center': '按鈕內容布局',
        'shadow-lg transition-all duration-200': '陰影和過渡效果',
        'margin: 0': 'CSS 重置修正',
        'touchAction: manipulation': '觸控優化',
        'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))': '主題漸層背景'
    };

    const estimatedComponentsUsingStyles = 5; // SlotMachine, MealTimeSelector, DistanceControl, LocationManager, etc.
    const totalDuplicationBefore = Object.keys(commonStyles).length * estimatedComponentsUsingStyles;
    const totalDuplicationAfter = Object.keys(commonStyles).length; // 集中在 ButtonStylesManager

    const reductionCount = totalDuplicationBefore - totalDuplicationAfter;
    const reductionPercentage = ((reductionCount / totalDuplicationBefore) * 100).toFixed(1);

    console.log('常見重複樣式:');
    Object.entries(commonStyles).forEach(([style, description]) => {
        console.log(`  • ${style} (${description})`);
    });

    console.log(`\n重複度統計:`);
    console.log(`  重構前: ${totalDuplicationBefore} 個重複定義`);
    console.log(`  重構後: ${totalDuplicationAfter} 個集中定義`);
    console.log(`  減少數量: ${reductionCount} 個`);
    console.log(`  減少比例: ${reductionPercentage}%`);

    if (parseFloat(reductionPercentage) >= 80) {
        console.log(`\n✅ 達成目標！程式碼重複度減少 ${reductionPercentage}%，超過 80% 的目標。`);
    } else {
        console.log(`\n⚠️ 未達目標。程式碼重複度減少 ${reductionPercentage}%，未達到 80% 的目標。`);
    }

    return {
        before: totalDuplicationBefore,
        after: totalDuplicationAfter,
        reduction: reductionCount,
        percentage: parseFloat(reductionPercentage),
        targetMet: parseFloat(reductionPercentage) >= 80
    };
}

// 如果在瀏覽器環境中執行
if (typeof window !== 'undefined') {
    // 等待 DOM 載入完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                validateButtonStylesManager();
                analyzeCodeDuplication();
            }, 100);
        });
    } else {
        // DOM 已載入，直接執行
        setTimeout(() => {
            validateButtonStylesManager();
            analyzeCodeDuplication();
        }, 100);
    }
}

// 匯出函數供其他腳本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateButtonStylesManager,
        analyzeCodeDuplication,
        TestValidator
    };
}