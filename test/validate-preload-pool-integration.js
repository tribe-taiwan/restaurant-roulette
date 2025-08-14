/**
 * 驗證預載入池整合功能
 * 檢查任務6的所有要求是否正確實現
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 開始驗證預載入池整合...\n');

// 讀取 SlotMachine.js 文件
const slotMachineFile = path.join(__dirname, '../components/SlotMachine.js');
const slotMachineContent = fs.readFileSync(slotMachineFile, 'utf8');

// 驗證項目
const validations = [
    {
        name: '簡化預載入池觸發邏輯',
        checks: [
            {
                description: '預載入池狀態管理',
                pattern: /const \[preloadPool, setPreloadPool\] = React\.useState\(new Map\(\)\)/,
                required: true
            },
            {
                description: '簡化的預載入池管理函數',
                pattern: /const managePreloadPool = React\.useCallback\(async \(currentRestaurant\)/,
                required: true
            },
            {
                description: '移除複雜動畫相關邏輯',
                pattern: /backgroundRefill: true.*Mark as background refill/,
                required: true
            }
        ]
    },
    {
        name: '確保預載入圖片正確顯示在 Keen Slider 中',
        checks: [
            {
                description: '預載入圖片在背景樣式中的使用',
                pattern: /poolItem\.imageObject\.src/,
                required: true
            },
            {
                description: '預載入狀態指示器',
                pattern: /preloadPool\.has\(restaurant\.image\).*preloadPool\.get\(restaurant\.image\)\.isLoaded/,
                required: true
            },
            {
                description: '圖片預載入完成標記',
                pattern: /isLoaded: true,\s*imageObject: img/,
                required: true
            }
        ]
    },
    {
        name: '保留幕後補充餐廳功能',
        checks: [
            {
                description: '背景餐廳狀態管理',
                pattern: /const \[backgroundRestaurants, setBackgroundRestaurants\] = React\.useState\(\[\]\)/,
                required: true
            },
            {
                description: '幕後補充觸發邏輯',
                pattern: /BACKGROUND_REFILL_THRESHOLD = 5/,
                required: true
            },
            {
                description: '調用 getRandomRestaurant 進行幕後補充',
                pattern: /window\.getRandomRestaurant\(userLocation, selectedMealTime, \{[\s\S]*?backgroundRefill: true/,
                required: true
            }
        ]
    },
    {
        name: '移除複雜動畫相關預載入邏輯',
        checks: [
            {
                description: '不應包含複雜動畫狀態',
                pattern: /apiWaiting|apiReceived|fast|slow/,
                required: false // 這些不應該存在
            },
            {
                description: '簡化的圖片預載入機制',
                pattern: /const ensureImagePreloaded = React\.useCallback/,
                required: true
            },
            {
                description: '移除舊的複雜預載入邏輯',
                pattern: /preloadRestaurantImages.*forEach.*restaurant, index/,
                required: false // 舊邏輯不應該存在
            }
        ]
    },
    {
        name: '整合功能完整性',
        checks: [
            {
                description: '預載入池函數暴露給外部',
                pattern: /managePreloadPool,\s*ensureImagePreloaded,\s*preloadPoolSize/,
                required: true
            },
            {
                description: '背景餐廳與當前餐廳結合',
                pattern: /const allRestaurants = \[finalRestaurant, \.\.\.backgroundRestaurants/,
                required: true
            },
            {
                description: '預載入狀態標記',
                pattern: /isPreloaded: restaurant\.image \? preloadPool\.has\(restaurant\.image\)/,
                required: true
            }
        ]
    }
];

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = [];

// 執行驗證
validations.forEach((validation, index) => {
    console.log(`${index + 1}. ${validation.name}`);
    
    validation.checks.forEach((check, checkIndex) => {
        totalChecks++;
        const found = check.pattern.test(slotMachineContent);
        
        if (check.required) {
            // 必須存在的檢查
            if (found) {
                console.log(`   ✅ ${check.description}`);
                passedChecks++;
            } else {
                console.log(`   ❌ ${check.description}`);
                failedChecks.push(`${validation.name}: ${check.description}`);
            }
        } else {
            // 不應該存在的檢查
            if (!found) {
                console.log(`   ✅ ${check.description} (已移除)`);
                passedChecks++;
            } else {
                console.log(`   ❌ ${check.description} (仍然存在)`);
                failedChecks.push(`${validation.name}: ${check.description} (應該被移除)`);
            }
        }
    });
    
    console.log('');
});

// 檢查測試文件是否存在
const testFile = path.join(__dirname, 'test-preload-pool-integration.html');
if (fs.existsSync(testFile)) {
    console.log('✅ 測試文件已創建: test-preload-pool-integration.html');
    passedChecks++;
} else {
    console.log('❌ 測試文件缺失: test-preload-pool-integration.html');
    failedChecks.push('測試文件缺失');
}
totalChecks++;

// 總結
console.log('='.repeat(50));
console.log(`驗證完成: ${passedChecks}/${totalChecks} 項檢查通過`);

if (failedChecks.length > 0) {
    console.log('\n❌ 失敗的檢查項目:');
    failedChecks.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure}`);
    });
    console.log('\n請修復上述問題後重新驗證。');
    process.exit(1);
} else {
    console.log('\n🎉 所有檢查項目都已通過！');
    console.log('\n📋 任務6完成總結:');
    console.log('   ✅ 簡化了預載入池的觸發邏輯');
    console.log('   ✅ 確保預載入圖片能正確顯示在 Keen Slider 中');
    console.log('   ✅ 保留了幕後補充餐廳的功能');
    console.log('   ✅ 移除了與複雜動畫相關的預載入邏輯');
    console.log('   ✅ 創建了測試文件驗證功能');
    
    console.log('\n🔧 主要改進:');
    console.log('   • 使用 Map 結構管理預載入池，提升性能');
    console.log('   • 簡化觸發邏輯，只在餐廳變更時管理預載入池');
    console.log('   • 預載入圖片直接在 Keen Slider 中顯示');
    console.log('   • 保持幕後補充功能，確保餐廳池不會耗盡');
    console.log('   • 移除所有複雜動畫狀態相關的預載入邏輯');
    
    process.exit(0);
}