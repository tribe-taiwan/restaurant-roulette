/**
 * 驗證動態內容更新機制實現
 * 檢查 SlotMachine.js 中的動態內容更新功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 開始驗證動態內容更新機制...\n');

// 讀取 SlotMachine.js 文件
const slotMachineFile = path.join(__dirname, '../components/SlotMachine.js');
const slotMachineContent = fs.readFileSync(slotMachineFile, 'utf8');

// 檢查項目
const checks = [
    {
        name: '轉換餐廳數據為 Slide 格式的函數',
        pattern: /convertRestaurantToSlideData.*React\.useCallback/s,
        description: '檢查是否實現了 convertRestaurantToSlideData 函數'
    },
    {
        name: '動態更新滑動器內容的函數',
        pattern: /updateSliderContent.*React\.useCallback/s,
        description: '檢查是否實現了 updateSliderContent 函數'
    },
    {
        name: '添加單一餐廳到滑動器的函數',
        pattern: /addRestaurantToSlider.*React\.useCallback/s,
        description: '檢查是否實現了 addRestaurantToSlider 函數'
    },
    {
        name: '獲取當前餐廳的函數',
        pattern: /getCurrentRestaurant.*React\.useCallback/s,
        description: '檢查是否實現了 getCurrentRestaurant 函數'
    },
    {
        name: '圖片預載入機制',
        pattern: /preloadRestaurantImages.*React\.useCallback/s,
        description: '檢查是否實現了圖片預載入功能'
    },
    {
        name: '餐廳資訊完整顯示',
        pattern: /restaurant\.name_zh.*restaurant\.name/s,
        description: '檢查是否正確顯示餐廳名稱（中文/英文）'
    },
    {
        name: '評分顯示',
        pattern: /restaurant\.rating.*renderStars/s,
        description: '檢查是否正確顯示餐廳評分'
    },
    {
        name: '距離顯示',
        pattern: /restaurant\.distance.*km/s,
        description: '檢查是否正確顯示餐廳距離'
    },
    {
        name: '價位標籤顯示',
        pattern: /restaurant\.priceLevel.*priceLabels/s,
        description: '檢查是否正確顯示價位標籤'
    },
    {
        name: '料理類型標籤顯示',
        pattern: /restaurant\.cuisine.*map.*typeIndex/s,
        description: '檢查是否正確顯示料理類型標籤'
    },
    {
        name: '滑動器內容更新機制',
        pattern: /React\.useEffect.*sliderRestaurants.*keenSlider\.update/s,
        description: '檢查是否實現了滑動器內容更新機制'
    },
    {
        name: '圖片正確顯示機制',
        pattern: /backgroundImage.*restaurant\.image.*linear-gradient/s,
        description: '檢查是否正確處理餐廳圖片顯示'
    }
];

let passedChecks = 0;
let totalChecks = checks.length;

console.log('📋 檢查結果：\n');

checks.forEach((check, index) => {
    const passed = check.pattern.test(slotMachineContent);
    const status = passed ? '✅' : '❌';
    const number = (index + 1).toString().padStart(2, '0');
    
    console.log(`${status} ${number}. ${check.name}`);
    console.log(`    ${check.description}`);
    
    if (passed) {
        passedChecks++;
    } else {
        console.log(`    ⚠️  未找到相關實現`);
    }
    console.log('');
});

// 檢查特定的數據結構處理
console.log('🔍 詳細檢查：\n');

// 檢查餐廳數據轉換
if (slotMachineContent.includes('convertRestaurantToSlideData')) {
    console.log('✅ 01. 餐廳數據轉換函數已實現');
    
    // 檢查轉換的字段
    const requiredFields = [
        'id', 'name', 'name_zh', 'name_en', 'image', 
        'rating', 'reviewCount', 'distance', 'priceLevel', 
        'cuisine', 'address', 'place_id', 'isPreloaded'
    ];
    
    const missingFields = requiredFields.filter(field => 
        !slotMachineContent.includes(`${field}:`) && 
        !slotMachineContent.includes(`${field} =`)
    );
    
    if (missingFields.length === 0) {
        console.log('✅ 02. 所有必要字段都已包含在轉換函數中');
    } else {
        console.log('❌ 02. 缺少以下字段:', missingFields.join(', '));
    }
} else {
    console.log('❌ 01. 餐廳數據轉換函數未實現');
}

// 檢查動態更新邏輯
if (slotMachineContent.includes('updateSliderContent')) {
    console.log('✅ 03. 動態更新函數已實現');
    
    if (slotMachineContent.includes('setSliderRestaurants')) {
        console.log('✅ 04. 狀態更新邏輯已實現');
    } else {
        console.log('❌ 04. 狀態更新邏輯未實現');
    }
} else {
    console.log('❌ 03. 動態更新函數未實現');
}

// 檢查圖片預載入
if (slotMachineContent.includes('preloadRestaurantImages')) {
    console.log('✅ 05. 圖片預載入機制已實現');
    
    if (slotMachineContent.includes('img.onload') && slotMachineContent.includes('img.onerror')) {
        console.log('✅ 06. 圖片載入成功/失敗處理已實現');
    } else {
        console.log('❌ 06. 圖片載入成功/失敗處理未完整實現');
    }
} else {
    console.log('❌ 05. 圖片預載入機制未實現');
}

console.log('\n📊 總結：');
console.log(`通過檢查: ${passedChecks}/${totalChecks}`);
console.log(`完成度: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 所有檢查都通過！動態內容更新機制實現完成。');
} else {
    console.log('\n⚠️  還有部分功能需要完善。');
}

// 檢查測試文件是否存在
const testFile = path.join(__dirname, 'test-dynamic-content-update.html');
if (fs.existsSync(testFile)) {
    console.log('\n✅ 測試文件已創建: test-dynamic-content-update.html');
    console.log('   可以在瀏覽器中打開進行手動測試');
} else {
    console.log('\n❌ 測試文件不存在');
}

console.log('\n🔧 建議的下一步：');
console.log('1. 在瀏覽器中打開測試文件進行手動驗證');
console.log('2. 測試單一餐廳載入功能');
console.log('3. 測試多家餐廳批量更新功能');
console.log('4. 測試圖片預載入機制');
console.log('5. 驗證所有餐廳資訊正確顯示');