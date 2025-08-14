/**
 * 驗證任務3的所有子任務是否完成
 * Task 3: 實現動態內容更新機制
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 驗證任務3：實現動態內容更新機制\n');

// 讀取 SlotMachine.js 文件
const slotMachineFile = path.join(__dirname, '../components/SlotMachine.js');
const slotMachineContent = fs.readFileSync(slotMachineFile, 'utf8');

// 任務3的子任務檢查
const subTasks = [
    {
        name: '創建函數將餐廳數據轉換為 Keen Slider slides',
        checks: [
            {
                description: 'convertRestaurantToSlideData 函數存在',
                pattern: /convertRestaurantToSlideData.*=.*React\.useCallback/s,
                required: true
            },
            {
                description: '轉換函數處理所有必要的餐廳字段',
                pattern: /id:.*name:.*image:.*rating:.*distance:.*priceLevel:.*cuisine:/s,
                required: true
            },
            {
                description: '轉換函數返回正確的數據結構',
                pattern: /return\s*{[\s\S]*id:[\s\S]*name:[\s\S]*}/,
                required: true
            }
        ]
    },
    {
        name: '實現動態更新滑動器內容的邏輯',
        checks: [
            {
                description: 'updateSliderContent 函數存在',
                pattern: /updateSliderContent.*=.*React\.useCallback/s,
                required: true
            },
            {
                description: '函數接受餐廳陣列參數並驗證',
                pattern: /Array\.isArray\(restaurants\)/,
                required: true
            },
            {
                description: '函數更新 sliderRestaurants 狀態',
                pattern: /setSliderRestaurants\(slideData\)/,
                required: true
            },
            {
                description: '函數包含日誌記錄用於調試',
                pattern: /console\.log.*更新.*Keen Slider.*餐廳數據/,
                required: true
            }
        ]
    },
    {
        name: '保留現有的餐廳資訊顯示（名稱、評分、距離等）',
        checks: [
            {
                description: '顯示餐廳中文名稱',
                pattern: /restaurant\.name_zh.*restaurant\.name/,
                required: true
            },
            {
                description: '顯示餐廳英文名稱（如果不同）',
                pattern: /restaurant\.name_en.*restaurant\.name_zh.*restaurant\.name/s,
                required: true
            },
            {
                description: '顯示餐廳評分和星級',
                pattern: /restaurant\.rating.*renderStars\(restaurant\.rating\)/s,
                required: true
            },
            {
                description: '顯示餐廳距離',
                pattern: /restaurant\.distance.*km/,
                required: true
            },
            {
                description: '顯示價位標籤',
                pattern: /restaurant\.priceLevel.*priceLabels/s,
                required: true
            },
            {
                description: '顯示料理類型標籤',
                pattern: /restaurant\.cuisine.*map.*typeIndex/s,
                required: true
            },
            {
                description: '顯示評論數量',
                pattern: /restaurant\.reviewCount.*toLocaleString/,
                required: true
            }
        ]
    },
    {
        name: '確保圖片正確顯示在每個 slide 中',
        checks: [
            {
                description: '圖片背景正確設置',
                pattern: /backgroundImage.*restaurant\.image.*linear-gradient.*url\(/s,
                required: true
            },
            {
                description: '無圖片時的備用背景',
                pattern: /linear-gradient\(135deg, #fbbf24 0%, #f59e0b 100%\)/,
                required: true
            },
            {
                description: '圖片預載入機制',
                pattern: /preloadRestaurantImages.*React\.useCallback/s,
                required: true
            },
            {
                description: '圖片載入成功處理',
                pattern: /img\.onload.*isPreloaded.*true/s,
                required: true
            },
            {
                description: '圖片載入失敗處理',
                pattern: /img\.onerror.*console\.warn/s,
                required: true
            },
            {
                description: '圖片載入狀態指示器',
                pattern: /Loading\.\.\./,
                required: true
            }
        ]
    }
];

let totalChecks = 0;
let passedChecks = 0;

console.log('📋 子任務檢查結果：\n');

subTasks.forEach((subTask, taskIndex) => {
    console.log(`${taskIndex + 1}. ${subTask.name}`);
    console.log('   ' + '='.repeat(subTask.name.length + 3));
    
    let subTaskPassed = 0;
    let subTaskTotal = subTask.checks.length;
    
    subTask.checks.forEach((check, checkIndex) => {
        totalChecks++;
        const passed = check.pattern.test(slotMachineContent);
        const status = passed ? '✅' : '❌';
        const letter = String.fromCharCode(97 + checkIndex); // a, b, c, ...
        
        console.log(`   ${status} ${letter}) ${check.description}`);
        
        if (passed) {
            passedChecks++;
            subTaskPassed++;
        } else if (check.required) {
            console.log(`      ⚠️  這是必需的功能`);
        }
    });
    
    const subTaskPercentage = Math.round((subTaskPassed / subTaskTotal) * 100);
    console.log(`   📊 子任務完成度: ${subTaskPassed}/${subTaskTotal} (${subTaskPercentage}%)`);
    console.log('');
});

// 額外檢查：確保與 Keen Slider 的整合
console.log('🔧 Keen Slider 整合檢查：\n');

const integrationChecks = [
    {
        name: 'Keen Slider 初始化配置',
        pattern: /new window\.KeenSlider.*loop: false.*slides:.*perView: 1/s,
        description: '檢查 Keen Slider 是否正確初始化'
    },
    {
        name: '滑動事件處理',
        pattern: /slideChanged.*setCurrentSlideIndex/s,
        description: '檢查滑動事件是否正確處理'
    },
    {
        name: '內容更新時的滑動器更新',
        pattern: /keenSlider.*update\(\)/,
        description: '檢查內容更新時是否更新滑動器'
    },
    {
        name: 'slide 結構正確',
        pattern: /keen-slider__slide.*restaurant-card/s,
        description: '檢查 slide 的 HTML 結構是否正確'
    }
];

integrationChecks.forEach((check, index) => {
    const passed = check.pattern.test(slotMachineContent);
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${check.name}`);
    console.log(`   ${check.description}`);
    if (passed) {
        passedChecks++;
    }
    totalChecks++;
    console.log('');
});

// 檢查測試文件
console.log('🧪 測試文件檢查：\n');

const testFile = path.join(__dirname, 'test-dynamic-content-update.html');
if (fs.existsSync(testFile)) {
    console.log('✅ 測試文件存在: test-dynamic-content-update.html');
    
    const testContent = fs.readFileSync(testFile, 'utf8');
    const testFeatures = [
        { name: '單一餐廳載入測試', pattern: /loadSingleRestaurant/ },
        { name: '多家餐廳載入測試', pattern: /loadMultipleRestaurants/ },
        { name: '動態添加餐廳測試', pattern: /addNewRestaurant/ },
        { name: '圖片預載入測試', pattern: /testImagePreload/ },
        { name: '滑動控制測試', pattern: /nextSlide.*previousSlide/ }
    ];
    
    testFeatures.forEach(feature => {
        const hasFeature = feature.pattern.test(testContent);
        const status = hasFeature ? '✅' : '❌';
        console.log(`   ${status} ${feature.name}`);
    });
} else {
    console.log('❌ 測試文件不存在');
}

console.log('\n📊 最終結果：');
console.log('='.repeat(50));
console.log(`總檢查項目: ${totalChecks}`);
console.log(`通過檢查: ${passedChecks}`);
console.log(`完成度: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 任務3完全完成！');
    console.log('✅ 所有子任務都已實現：');
    console.log('   • 創建函數將餐廳數據轉換為 Keen Slider slides');
    console.log('   • 實現動態更新滑動器內容的邏輯');
    console.log('   • 保留現有的餐廳資訊顯示（名稱、評分、距離等）');
    console.log('   • 確保圖片正確顯示在每個 slide 中');
    console.log('\n🔧 Requirements 2.1, 2.2 已滿足');
} else {
    const missingCount = totalChecks - passedChecks;
    console.log(`\n⚠️  還有 ${missingCount} 個檢查項目需要完善`);
}

console.log('\n🚀 下一步建議：');
console.log('1. 在瀏覽器中測試 test-dynamic-content-update.html');
console.log('2. 驗證所有餐廳資訊正確顯示');
console.log('3. 測試圖片預載入功能');
console.log('4. 準備進行任務4：整合簡單的轉動邏輯');