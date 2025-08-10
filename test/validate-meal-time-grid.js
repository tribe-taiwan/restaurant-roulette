// validate-meal-time-grid.js - 驗證用餐時段大按鈕網格實現

/**
 * 驗證用餐時段選擇器的大按鈕網格實現
 */
function validateMealTimeGrid() {
    console.log('🧪 開始驗證用餐時段大按鈕網格實現...');
    
    const results = {
        gridLayout: false,
        buttonSize: false,
        iconSize: false,
        verticalLayout: false,
        selectedState: false,
        touchSpacing: false,
        animations: false,
        accessibility: false
    };
    
    try {
        // 檢查網格布局
        const grid = document.querySelector('.meal-time-selector-grid');
        const rows = document.querySelectorAll('.meal-time-row');
        
        if (grid && rows.length === 2) {
            console.log('✅ 2行網格布局正確');
            results.gridLayout = true;
            
            // 檢查每行有3個按鈕
            let allRowsValid = true;
            rows.forEach((row, index) => {
                const buttons = row.querySelectorAll('.meal-time-button');
                if (buttons.length !== 3) {
                    console.log(`❌ 第${index + 1}行按鈕數量不正確: ${buttons.length}/3`);
                    allRowsValid = false;
                }
            });
            
            if (allRowsValid) {
                console.log('✅ 2行3列網格布局完整');
            }
        } else {
            console.log('❌ 網格布局不正確');
        }
        
        // 檢查按鈕尺寸 (72px高度)
        const buttons = document.querySelectorAll('.meal-time-button');
        if (buttons.length > 0) {
            const firstButton = buttons[0];
            const computedStyle = window.getComputedStyle(firstButton);
            const height = parseInt(computedStyle.height);
            
            if (height >= 72) {
                console.log(`✅ 按鈕高度符合規範: ${height}px`);
                results.buttonSize = true;
            } else {
                console.log(`❌ 按鈕高度不足: ${height}px (應為72px)`);
            }
        }
        
        // 檢查圖標尺寸 (32px)
        const icons = document.querySelectorAll('.meal-time-icon');
        if (icons.length > 0) {
            const firstIcon = icons[0];
            const computedStyle = window.getComputedStyle(firstIcon);
            const fontSize = parseInt(computedStyle.fontSize);
            
            if (fontSize >= 32) {
                console.log(`✅ 圖標尺寸符合規範: ${fontSize}px`);
                results.iconSize = true;
            } else {
                console.log(`❌ 圖標尺寸不足: ${fontSize}px (應為32px)`);
            }
        }
        
        // 檢查垂直布局
        const buttonContents = document.querySelectorAll('.meal-time-button-content');
        if (buttonContents.length > 0) {
            const firstContent = buttonContents[0];
            const computedStyle = window.getComputedStyle(firstContent);
            
            if (computedStyle.flexDirection === 'column') {
                console.log('✅ 按鈕內容垂直布局正確');
                results.verticalLayout = true;
            } else {
                console.log('❌ 按鈕內容布局不是垂直方向');
            }
        }
        
        // 檢查選中狀態
        const selectedButtons = document.querySelectorAll('.meal-time-button.selected');
        if (selectedButtons.length > 0) {
            console.log(`✅ 選中狀態樣式已應用: ${selectedButtons.length}個按鈕`);
            results.selectedState = true;
        } else {
            console.log('⚠️ 未找到選中狀態的按鈕');
        }
        
        // 檢查觸控間距
        if (rows.length >= 2) {
            const firstRow = rows[0];
            const secondRow = rows[1];
            const firstRowRect = firstRow.getBoundingClientRect();
            const secondRowRect = secondRow.getBoundingClientRect();
            const spacing = secondRowRect.top - firstRowRect.bottom;
            
            if (spacing >= 8) {
                console.log(`✅ 行間距適合觸控操作: ${spacing}px`);
                results.touchSpacing = true;
            } else {
                console.log(`❌ 行間距過小: ${spacing}px`);
            }
        }
        
        // 檢查過渡動畫
        if (buttons.length > 0) {
            const firstButton = buttons[0];
            const computedStyle = window.getComputedStyle(firstButton);
            
            if (computedStyle.transition && computedStyle.transition !== 'none') {
                console.log('✅ 過渡動畫已設定');
                results.animations = true;
            } else {
                console.log('❌ 未設定過渡動畫');
            }
        }
        
        // 檢查無障礙屬性
        let accessibilityScore = 0;
        buttons.forEach(button => {
            if (button.getAttribute('aria-label')) accessibilityScore++;
            if (button.getAttribute('aria-pressed')) accessibilityScore++;
        });
        
        if (accessibilityScore >= buttons.length * 2) {
            console.log('✅ 無障礙屬性完整');
            results.accessibility = true;
        } else {
            console.log(`❌ 無障礙屬性不完整: ${accessibilityScore}/${buttons.length * 2}`);
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
    
    if (score >= 80) {
        console.log('🎉 用餐時段大按鈕網格實現良好!');
    } else if (score >= 60) {
        console.log('⚠️ 用餐時段大按鈕網格基本可用，但需要改進');
    } else {
        console.log('❌ 用餐時段大按鈕網格需要重大修正');
    }
    
    return results;
}

// 如果在瀏覽器環境中，自動執行驗證
if (typeof window !== 'undefined') {
    // 等待DOM載入完成後執行驗證
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(validateMealTimeGrid, 500);
        });
    } else {
        setTimeout(validateMealTimeGrid, 500);
    }
}

// 導出函數供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateMealTimeGrid };
} else if (typeof window !== 'undefined') {
    window.validateMealTimeGrid = validateMealTimeGrid;
}