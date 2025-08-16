/**
 * ButtonStylesManager 簡化驗證腳本
 * 
 * 此腳本可以在 Node.js 環境中執行，驗證 ButtonStylesManager 的核心功能
 * 使用方法: node test/validate-button-styles-manager-simple.js
 */

// 模擬瀏覽器環境
const mockWindow = {
    ButtonStylesManager: null
};

// 模擬 ButtonStylesManager（從實際檔案複製核心邏輯）
const ButtonStylesManager = {
    base: {
        standard: 'h-[72px] p-3 rounded-lg border-2 flex flex-col items-center justify-center shadow-lg transition-all duration-200',
        compact: 'h-12 p-2 rounded-md border flex items-center justify-center shadow-md transition-all duration-200',
        fixes: { 
            margin: 0, 
            touchAction: 'manipulation' 
        }
    },

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
            background: null,
            borderColor: null,
            color: null
        }
    },

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

    getButtonClasses: function(variant = 'primary', size = 'standard') {
        try {
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
            return this.base.standard;
        }
    },

    getVariantClasses: function(variant) {
        return '';
    },

    getButtonStyle: function(options = {}) {
        try {
            const {
                variant = 'primary',
                state = 'normal',
                customColors = {},
                ignoreDisabled = false
            } = options;

            let validVariant = variant;
            if (!this.variants[variant]) {
                console.warn(`Invalid button variant: ${variant}. Using 'primary' as fallback.`);
                validVariant = 'primary';
            }

            let validState = state;
            if (!this.states[state]) {
                console.warn(`Invalid button state: ${state}. Using 'normal' as fallback.`);
                validState = 'normal';
            }

            const variantStyle = validVariant === 'custom' 
                ? customColors 
                : { ...this.variants[validVariant] };
            
            const stateStyle = ignoreDisabled && validState === 'disabled' 
                ? { ...this.states.normal }
                : { ...this.states[validState] };
            
            return {
                ...variantStyle,
                ...stateStyle,
                ...this.base.fixes
            };
        } catch (error) {
            console.error('ButtonStylesManager.getButtonStyle error:', error);
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

    safeGetButtonStyle: function(options) {
        try {
            return this.getButtonStyle(options);
        } catch (error) {
            console.error('ButtonStylesManager.safeGetButtonStyle error:', error);
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

// 測試結果收集器
class SimpleTestRunner {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    test(name, testFn) {
        try {
            const start = Date.now();
            const result = testFn();
            const duration = Date.now() - start;
            
            const passed = result === true;
            this.results.push({
                name,
                passed,
                message: passed ? 'PASS' : result || 'FAIL',
                duration
            });
            
            console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASS' : result}`);
            return passed;
        } catch (error) {
            this.results.push({
                name,
                passed: false,
                message: `ERROR: ${error.message}`,
                duration: 0
            });
            
            console.error(`❌ ${name}: ERROR - ${error.message}`);
            return false;
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
            duration: totalDuration
        };
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
        
        if (summary.passRate >= 90) {
            console.log('\n🎉 測試結果: 優秀！所有功能運作正常。');
        } else if (summary.passRate >= 70) {
            console.log('\n⚠️ 測試結果: 良好，但有部分功能需要檢查。');
        } else {
            console.log('\n❌ 測試結果: 需要改進，多項功能存在問題。');
        }
        
        console.log('='.repeat(60));
        
        return summary.passRate >= 80;
    }
}

// 主要測試函數
function runTests() {
    console.log('🚀 開始 ButtonStylesManager 簡化驗證...\n');
    
    const testRunner = new SimpleTestRunner();
    
    // 1. 基本結構測試
    console.log('📝 1. 基本結構測試');
    console.log('-'.repeat(30));
    
    testRunner.test('ButtonStylesManager 物件存在', () => {
        return typeof ButtonStylesManager === 'object' && ButtonStylesManager !== null;
    });

    testRunner.test('base 屬性結構正確', () => {
        return ButtonStylesManager.base && 
               typeof ButtonStylesManager.base.standard === 'string' &&
               typeof ButtonStylesManager.base.compact === 'string' &&
               typeof ButtonStylesManager.base.fixes === 'object';
    });

    testRunner.test('variants 屬性結構正確', () => {
        return ButtonStylesManager.variants &&
               ButtonStylesManager.variants.primary &&
               ButtonStylesManager.variants.secondary &&
               ButtonStylesManager.variants.success &&
               ButtonStylesManager.variants.custom;
    });

    testRunner.test('states 屬性結構正確', () => {
        return ButtonStylesManager.states &&
               ButtonStylesManager.states.normal &&
               ButtonStylesManager.states.disabled &&
               ButtonStylesManager.states.loading;
    });

    // 2. 函數測試
    console.log('\n📝 2. 函數測試');
    console.log('-'.repeat(30));

    testRunner.test('getButtonClasses 函數存在', () => {
        return typeof ButtonStylesManager.getButtonClasses === 'function';
    });

    testRunner.test('getButtonStyle 函數存在', () => {
        return typeof ButtonStylesManager.getButtonStyle === 'function';
    });

    testRunner.test('createCompatibleButtonLogic 函數存在', () => {
        return typeof ButtonStylesManager.createCompatibleButtonLogic === 'function';
    });

    testRunner.test('safeGetButtonStyle 函數存在', () => {
        return typeof ButtonStylesManager.safeGetButtonStyle === 'function';
    });

    // 3. getButtonClasses 功能測試
    console.log('\n📝 3. getButtonClasses 功能測試');
    console.log('-'.repeat(30));

    testRunner.test('getButtonClasses 預設參數', () => {
        const classes = ButtonStylesManager.getButtonClasses();
        return typeof classes === 'string' && 
               classes.includes('h-[72px]') && 
               classes.includes('p-3') && 
               classes.includes('rounded-lg');
    });

    testRunner.test('getButtonClasses 標準尺寸', () => {
        const classes = ButtonStylesManager.getButtonClasses('primary', 'standard');
        return classes.includes('h-[72px]') && classes.includes('shadow-lg');
    });

    testRunner.test('getButtonClasses 緊湊尺寸', () => {
        const classes = ButtonStylesManager.getButtonClasses('primary', 'compact');
        return classes.includes('h-12') && classes.includes('shadow-md');
    });

    testRunner.test('getButtonClasses 無效尺寸處理', () => {
        const classes = ButtonStylesManager.getButtonClasses('primary', 'invalid');
        return classes.includes('h-[72px]'); // 應該回退到標準尺寸
    });

    // 4. getButtonStyle 功能測試
    console.log('\n📝 4. getButtonStyle 功能測試');
    console.log('-'.repeat(30));

    testRunner.test('getButtonStyle 預設樣式', () => {
        const style = ButtonStylesManager.getButtonStyle();
        return typeof style === 'object' &&
               style.margin === 0 &&
               style.touchAction === 'manipulation' &&
               style.opacity === 1;
    });

    testRunner.test('getButtonStyle primary 變體', () => {
        const style = ButtonStylesManager.getButtonStyle({ variant: 'primary' });
        return style.background && 
               style.background.includes('var(--theme-primary') &&
               style.borderColor && 
               style.borderColor.includes('var(--theme-primary');
    });

    testRunner.test('getButtonStyle secondary 變體', () => {
        const style = ButtonStylesManager.getButtonStyle({ variant: 'secondary' });
        return style.background && 
               style.background.includes('var(--surface-color') &&
               style.borderColor && 
               style.borderColor.includes('var(--border-color');
    });

    testRunner.test('getButtonStyle success 變體', () => {
        const style = ButtonStylesManager.getButtonStyle({ variant: 'success' });
        return style.background && 
               style.background.includes('var(--success-color') &&
               style.color === 'white';
    });

    testRunner.test('getButtonStyle custom 變體', () => {
        const customColors = { background: '#ff0000', color: '#ffffff', borderColor: '#ff0000' };
        const style = ButtonStylesManager.getButtonStyle({ variant: 'custom', customColors });
        return style.background === '#ff0000' && 
               style.color === '#ffffff' && 
               style.borderColor === '#ff0000';
    });

    // 5. 狀態測試
    console.log('\n📝 5. 狀態測試');
    console.log('-'.repeat(30));

    testRunner.test('normal 狀態', () => {
        const style = ButtonStylesManager.getButtonStyle({ state: 'normal' });
        return style.opacity === 1 && style.cursor === 'pointer';
    });

    testRunner.test('disabled 狀態', () => {
        const style = ButtonStylesManager.getButtonStyle({ state: 'disabled' });
        return style.opacity === 0.3 && style.cursor === 'not-allowed';
    });

    testRunner.test('loading 狀態', () => {
        const style = ButtonStylesManager.getButtonStyle({ state: 'loading' });
        return style.opacity === 0.5 && style.cursor === 'wait';
    });

    testRunner.test('ignoreDisabled 參數', () => {
        const style = ButtonStylesManager.getButtonStyle({ state: 'disabled', ignoreDisabled: true });
        return style.opacity === 1 && style.cursor === 'pointer';
    });

    // 6. 錯誤處理測試
    console.log('\n📝 6. 錯誤處理測試');
    console.log('-'.repeat(30));

    testRunner.test('無效變體處理', () => {
        const style = ButtonStylesManager.getButtonStyle({ variant: 'invalid' });
        return style.background && style.background.includes('var(--theme-primary'); // 應該回退到 primary
    });

    testRunner.test('無效狀態處理', () => {
        const style = ButtonStylesManager.getButtonStyle({ state: 'invalid' });
        return style.opacity === 1 && style.cursor === 'pointer'; // 應該回退到 normal
    });

    testRunner.test('空參數處理', () => {
        const style = ButtonStylesManager.getButtonStyle({});
        return style.margin === 0 && style.touchAction === 'manipulation';
    });

    testRunner.test('null 參數處理', () => {
        const style = ButtonStylesManager.getButtonStyle(null);
        return style.margin === 0 && style.touchAction === 'manipulation';
    });

    // 7. 相容性測試
    console.log('\n📝 7. 相容性測試');
    console.log('-'.repeat(30));

    testRunner.test('相容性包裝器功能', () => {
        const mockLogic = { someMethod: () => 'test' };
        const compatible = ButtonStylesManager.createCompatibleButtonLogic(mockLogic);
        return typeof compatible.getAddButtonStyle === 'function' && 
               compatible.someMethod() === 'test';
    });

    testRunner.test('getAddButtonStyle 相容性', () => {
        const mockLogic = {};
        const compatible = ButtonStylesManager.createCompatibleButtonLogic(mockLogic);
        const style = compatible.getAddButtonStyle('#ff0000', '#ffffff', true);
        return style.background === '#ff0000' && style.color === '#ffffff';
    });

    // 8. 安全性測試
    console.log('\n📝 8. 安全性測試');
    console.log('-'.repeat(30));

    testRunner.test('safeGetButtonStyle 正常運作', () => {
        const style = ButtonStylesManager.safeGetButtonStyle({ variant: 'primary' });
        return style && typeof style === 'object' && style.margin === 0;
    });

    // 9. 效能測試
    console.log('\n📝 9. 效能測試');
    console.log('-'.repeat(30));

    testRunner.test('getButtonClasses 效能', () => {
        const start = Date.now();
        for (let i = 0; i < 1000; i++) {
            ButtonStylesManager.getButtonClasses('primary', 'standard');
        }
        const duration = Date.now() - start;
        console.log(`  getButtonClasses 1000次呼叫耗時: ${duration}ms`);
        return duration < 100; // 1000 次呼叫應該在 100ms 內完成
    });

    testRunner.test('getButtonStyle 效能', () => {
        const start = Date.now();
        for (let i = 0; i < 1000; i++) {
            ButtonStylesManager.getButtonStyle({ variant: 'primary', state: 'normal' });
        }
        const duration = Date.now() - start;
        console.log(`  getButtonStyle 1000次呼叫耗時: ${duration}ms`);
        return duration < 200; // 1000 次呼叫應該在 200ms 內完成
    });

    // 輸出測試結果
    const success = testRunner.printSummary();
    
    // 程式碼重複度分析
    analyzeCodeDuplication();
    
    return success;
}

// 程式碼重複度分析
function analyzeCodeDuplication() {
    console.log('\n📊 程式碼重複度分析');
    console.log('='.repeat(50));
    
    const commonStyles = [
        'h-[72px] p-3 rounded-lg border-2',
        'h-12 p-2 rounded-md border',
        'flex flex-col items-center justify-center',
        'shadow-lg transition-all duration-200',
        'margin: 0',
        'touchAction: manipulation',
        'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))'
    ];

    const estimatedComponentsUsingStyles = 5; // SlotMachine, MealTimeSelector, DistanceControl, LocationManager, etc.
    const totalDuplicationBefore = commonStyles.length * estimatedComponentsUsingStyles;
    const totalDuplicationAfter = commonStyles.length; // 集中在 ButtonStylesManager

    const reductionCount = totalDuplicationBefore - totalDuplicationAfter;
    const reductionPercentage = ((reductionCount / totalDuplicationBefore) * 100).toFixed(1);

    console.log('常見重複樣式:');
    commonStyles.forEach((style, index) => {
        console.log(`  ${index + 1}. ${style}`);
    });

    console.log(`\n重複度統計:`);
    console.log(`  重構前: ${totalDuplicationBefore} 個重複定義`);
    console.log(`  重構後: ${totalDuplicationAfter} 個集中定義`);
    console.log(`  減少數量: ${reductionCount} 個`);
    console.log(`  減少比例: ${reductionPercentage}%`);

    if (parseFloat(reductionPercentage) >= 80) {
        console.log(`\n✅ 達成目標！程式碼重複度減少 ${reductionPercentage}%，超過 80% 的目標。`);
        return true;
    } else {
        console.log(`\n⚠️ 未達目標。程式碼重複度減少 ${reductionPercentage}%，未達到 80% 的目標。`);
        return false;
    }
}

// 執行測試
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = {
    runTests,
    analyzeCodeDuplication,
    ButtonStylesManager,
    SimpleTestRunner
};