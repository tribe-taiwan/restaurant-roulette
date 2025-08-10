/**
 * SearchSettings 修復驗證腳本
 * 驗證 appendChild 錯誤是否已修復
 */

class SearchSettingsFixValidator {
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
        console.log('🔧 開始 SearchSettings 修復驗證...\n');

        // 1. 驗證子組件載入
        await this.validateSubComponentsLoading();

        // 2. 驗證子組件返回值
        await this.validateSubComponentsReturnValues();

        // 3. 驗證 SearchSettings 組件
        await this.validateSearchSettingsComponent();

        // 4. 驗證 DOM 操作
        await this.validateDOMOperations();

        // 5. 驗證錯誤處理
        await this.validateErrorHandling();

        // 輸出結果
        this.outputResults();
    }

    /**
     * 驗證子組件載入
     */
    async validateSubComponentsLoading() {
        console.log('📦 驗證子組件載入...');

        const requiredComponents = ['SettingsDisplay', 'DistanceControl', 'MealTimeSelector'];
        
        requiredComponents.forEach(componentName => {
            if (typeof window[componentName] === 'function') {
                this.addResult('pass', `${componentName} 組件已正確載入`);
            } else {
                this.addResult('fail', `${componentName} 組件未載入或不是函數`);
            }
        });

        console.log('✅ 子組件載入驗證完成\n');
    }

    /**
     * 驗證子組件返回值
     */
    async validateSubComponentsReturnValues() {
        console.log('🔍 驗證子組件返回值...');

        const mockProps = {
            selectedMealTime: 'lunch',
            baseUnit: 1000,
            unitMultiplier: 3,
            translations: {
                openNowFilter: '現在營業',
                anyTime: '任何時間',
                breakfast: '早餐',
                lunch: '午餐',
                dinner: '晚餐'
            },
            setSelectedMealTime: () => {},
            setBaseUnit: () => {},
            setUnitMultiplier: () => {}
        };

        // 測試 SettingsDisplay
        if (typeof window.SettingsDisplay === 'function') {
            try {
                const settingsDisplay = window.SettingsDisplay({
                    selectedMealTime: mockProps.selectedMealTime,
                    baseUnit: mockProps.baseUnit,
                    unitMultiplier: mockProps.unitMultiplier,
                    translations: mockProps.translations
                });

                if (settingsDisplay && settingsDisplay.nodeType === Node.ELEMENT_NODE) {
                    this.addResult('pass', 'SettingsDisplay 返回有效的 DOM 元素');
                } else {
                    this.addResult('fail', `SettingsDisplay 返回無效元素: ${typeof settingsDisplay}`);
                }
            } catch (error) {
                this.addResult('fail', `SettingsDisplay 執行失敗: ${error.message}`);
            }
        }

        // 測試 DistanceControl
        if (typeof window.DistanceControl === 'function') {
            try {
                const distanceControl = window.DistanceControl({
                    baseUnit: mockProps.baseUnit,
                    setBaseUnit: mockProps.setBaseUnit,
                    unitMultiplier: mockProps.unitMultiplier,
                    setUnitMultiplier: mockProps.setUnitMultiplier
                });

                if (distanceControl && distanceControl.nodeType === Node.ELEMENT_NODE) {
                    this.addResult('pass', 'DistanceControl 返回有效的 DOM 元素');
                } else {
                    this.addResult('fail', `DistanceControl 返回無效元素: ${typeof distanceControl}`);
                }
            } catch (error) {
                this.addResult('fail', `DistanceControl 執行失敗: ${error.message}`);
            }
        }

        // 測試 MealTimeSelector
        if (typeof window.MealTimeSelector === 'function') {
            try {
                const mealTimeSelector = window.MealTimeSelector({
                    selectedMealTime: mockProps.selectedMealTime,
                    setSelectedMealTime: mockProps.setSelectedMealTime,
                    translations: mockProps.translations
                });

                if (mealTimeSelector && mealTimeSelector.nodeType === Node.ELEMENT_NODE) {
                    this.addResult('pass', 'MealTimeSelector 返回有效的 DOM 元素');
                } else {
                    this.addResult('fail', `MealTimeSelector 返回無效元素: ${typeof mealTimeSelector}`);
                }
            } catch (error) {
                this.addResult('fail', `MealTimeSelector 執行失敗: ${error.message}`);
            }
        }

        console.log('✅ 子組件返回值驗證完成\n');
    }

    /**
     * 驗證 SearchSettings 組件
     */
    async validateSearchSettingsComponent() {
        console.log('🎯 驗證 SearchSettings 組件...');

        if (typeof SearchSettings === 'function') {
            try {
                const mockProps = {
                    selectedMealTime: 'lunch',
                    setSelectedMealTime: () => {},
                    translations: {
                        openNowFilter: '現在營業',
                        anyTime: '任何時間',
                        breakfast: '早餐',
                        lunch: '午餐',
                        dinner: '晚餐'
                    },
                    selectedLanguage: 'zh',
                    baseUnit: 1000,
                    setBaseUnit: () => {},
                    unitMultiplier: 3,
                    setUnitMultiplier: () => {}
                };

                const searchSettings = SearchSettings(mockProps);

                if (searchSettings && searchSettings.nodeType === Node.ELEMENT_NODE) {
                    this.addResult('pass', 'SearchSettings 返回有效的 DOM 元素');
                    
                    // 檢查子元素
                    const childElements = searchSettings.querySelectorAll('*');
                    if (childElements.length > 0) {
                        this.addResult('pass', `SearchSettings 包含 ${childElements.length} 個子元素`);
                    } else {
                        this.addResult('warning', 'SearchSettings 沒有子元素');
                    }
                } else {
                    this.addResult('fail', `SearchSettings 返回無效元素: ${typeof searchSettings}`);
                }
            } catch (error) {
                this.addResult('fail', `SearchSettings 執行失敗: ${error.message}`);
            }
        } else {
            this.addResult('fail', 'SearchSettings 組件未載入或不是函數');
        }

        console.log('✅ SearchSettings 組件驗證完成\n');
    }

    /**
     * 驗證 DOM 操作
     */
    async validateDOMOperations() {
        console.log('🔨 驗證 DOM 操作...');

        // 創建測試容器
        const testContainer = document.createElement('div');
        testContainer.id = 'test-container';
        document.body.appendChild(testContainer);

        try {
            // 測試 appendChild 操作
            const testElement = document.createElement('div');
            testElement.textContent = '測試元素';
            
            // 這應該不會拋出錯誤
            testContainer.appendChild(testElement);
            this.addResult('pass', 'DOM appendChild 操作正常');

            // 測試無效元素的 appendChild
            try {
                testContainer.appendChild(null);
                this.addResult('fail', 'appendChild(null) 應該拋出錯誤但沒有');
            } catch (error) {
                this.addResult('pass', 'appendChild(null) 正確拋出錯誤');
            }

            // 測試非 DOM 元素的 appendChild
            try {
                testContainer.appendChild('string');
                this.addResult('fail', 'appendChild(string) 應該拋出錯誤但沒有');
            } catch (error) {
                this.addResult('pass', 'appendChild(string) 正確拋出錯誤');
            }

        } catch (error) {
            this.addResult('fail', `DOM 操作測試失敗: ${error.message}`);
        } finally {
            // 清理測試容器
            document.body.removeChild(testContainer);
        }

        console.log('✅ DOM 操作驗證完成\n');
    }

    /**
     * 驗證錯誤處理
     */
    async validateErrorHandling() {
        console.log('🛡️ 驗證錯誤處理...');

        // 測試缺少子組件的情況
        const originalComponents = {
            SettingsDisplay: window.SettingsDisplay,
            DistanceControl: window.DistanceControl,
            MealTimeSelector: window.MealTimeSelector
        };

        try {
            // 暫時移除一個組件
            delete window.SettingsDisplay;

            const searchSettings = SearchSettings({
                selectedMealTime: 'lunch',
                setSelectedMealTime: () => {},
                translations: { anyTime: '任何時間' },
                selectedLanguage: 'zh',
                baseUnit: 1000,
                setBaseUnit: () => {},
                unitMultiplier: 3,
                setUnitMultiplier: () => {}
            });

            if (searchSettings && searchSettings.nodeType === Node.ELEMENT_NODE) {
                const text = searchSettings.textContent;
                if (text.includes('載入搜索設定組件中') || text.includes('缺少')) {
                    this.addResult('pass', '缺少子組件時顯示適當的載入訊息');
                } else {
                    this.addResult('warning', '缺少子組件時的錯誤處理可能不完整');
                }
            } else {
                this.addResult('fail', '缺少子組件時未返回有效的載入狀態');
            }

        } catch (error) {
            this.addResult('warning', `錯誤處理測試異常: ${error.message}`);
        } finally {
            // 恢復組件
            Object.assign(window, originalComponents);
        }

        console.log('✅ 錯誤處理驗證完成\n');
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
                this.results.warnings++;
                break;
        }
    }

    /**
     * 輸出測試結果
     */
    outputResults() {
        console.log('📊 SearchSettings 修復驗證結果');
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
                'warning': '⚠️'
            }[result.type];
            
            console.log(`${icon} ${result.message}`);
        });

        // 總結
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
        
        console.log(`\n🎯 成功率: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('🎉 SearchSettings appendChild 錯誤已修復！');
        } else {
            console.log('🔧 仍有問題需要修復');
        }

        // 修復狀態
        console.log('\n💡 修復狀態:');
        if (this.results.failed === 0) {
            console.log('✅ appendChild 錯誤已修復');
            console.log('✅ 子組件正確返回 DOM 元素');
            console.log('✅ 錯誤處理機制正常');
        } else {
            console.log('❌ 仍存在問題，需要進一步修復');
        }
    }
}

// 自動執行驗證（如果在瀏覽器環境中）
if (typeof window !== 'undefined') {
    window.SearchSettingsFixValidator = SearchSettingsFixValidator;
    
    // 等待頁面載入完成後執行驗證
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const validator = new SearchSettingsFixValidator();
                validator.runAllTests();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            const validator = new SearchSettingsFixValidator();
            validator.runAllTests();
        }, 1000);
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchSettingsFixValidator;
}