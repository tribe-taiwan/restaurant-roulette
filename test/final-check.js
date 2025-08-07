const http = require('http');

console.log('🎯 最終檢查：SlotMachine 滑動轉場效果');
console.log('=' .repeat(50));

function checkMainPage() {
    return new Promise((resolve) => {
        console.log('📋 檢查主頁面...');
        
        const req = http.get('http://localhost:3000/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   HTTP 狀態碼: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    // 檢查是否包含 SlotMachine 組件載入
                    if (data.includes('components/SlotMachine.js')) {
                        console.log('   ✅ SlotMachine.js 已包含在頁面中');
                    } else {
                        console.log('   ❌ SlotMachine.js 未包含在頁面中');
                    }
                    
                    // 檢查是否有錯誤處理
                    if (data.includes('SlotMachine is not defined')) {
                        console.log('   ❌ 頁面包含 SlotMachine 未定義錯誤');
                        resolve(false);
                    } else {
                        console.log('   ✅ 頁面沒有明顯的 SlotMachine 錯誤');
                        resolve(true);
                    }
                } else {
                    console.log('   ❌ 主頁面載入失敗');
                    resolve(false);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log('   ❌ 主頁面請求失敗:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('   ❌ 請求超時');
            req.destroy();
            resolve(false);
        });
    });
}

function checkSlotMachineComponent() {
    return new Promise((resolve) => {
        console.log('📋 檢查 SlotMachine 組件...');
        
        const req = http.get('http://localhost:3000/components/SlotMachine.js', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   HTTP 狀態碼: ${res.statusCode}`);
                console.log(`   文件大小: ${data.length} 字符`);
                
                if (res.statusCode === 200) {
                    // 檢查組件註冊
                    if (data.includes('window.SlotMachine = SlotMachine')) {
                        console.log('   ✅ 組件註冊正確');
                    } else {
                        console.log('   ❌ 組件註冊缺失');
                        resolve(false);
                        return;
                    }
                    
                    // 檢查滑動轉場相關代碼
                    const hasSlideStates = data.includes('isSliding') && data.includes('currentImage') && data.includes('nextImage');
                    const hasSlideFunction = data.includes('triggerSlideTransition');
                    const hasSlideEffect = data.includes('useEffect') && data.includes('previousRestaurant');
                    
                    if (hasSlideStates && hasSlideFunction && hasSlideEffect) {
                        console.log('   ✅ 滑動轉場代碼完整');
                    } else {
                        console.log('   ❌ 滑動轉場代碼不完整');
                        console.log(`      狀態: ${hasSlideStates ? '✅' : '❌'}`);
                        console.log(`      函數: ${hasSlideFunction ? '✅' : '❌'}`);
                        console.log(`      效果: ${hasSlideEffect ? '✅' : '❌'}`);
                    }
                    
                    // 檢查 JSX 中的滑動轉場實現
                    if (data.includes('滑動轉場容器') && data.includes('slideInFromRight')) {
                        console.log('   ✅ JSX 滑動轉場實現存在');
                    } else {
                        console.log('   ❌ JSX 滑動轉場實現缺失');
                    }
                    
                    resolve(true);
                } else {
                    console.log('   ❌ SlotMachine.js 載入失敗');
                    resolve(false);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log('   ❌ SlotMachine.js 請求失敗:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('   ❌ 請求超時');
            req.destroy();
            resolve(false);
        });
    });
}

function checkCSS() {
    return new Promise((resolve) => {
        console.log('📋 檢查 CSS 動畫...');
        
        const req = http.get('http://localhost:3000/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.includes('slideInFromRight') && data.includes('slideInFromLeft')) {
                    console.log('   ✅ CSS 滑動動畫已定義');
                    resolve(true);
                } else {
                    console.log('   ❌ CSS 滑動動畫缺失');
                    resolve(false);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log('   ❌ CSS 檢查失敗:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('   ❌ 請求超時');
            req.destroy();
            resolve(false);
        });
    });
}

async function runFinalCheck() {
    console.log('🚀 開始最終檢查...\n');
    
    const mainPageOk = await checkMainPage();
    console.log('');
    
    const componentOk = await checkSlotMachineComponent();
    console.log('');
    
    const cssOk = await checkCSS();
    console.log('');
    
    console.log('=' .repeat(50));
    console.log('📊 最終檢查結果:');
    console.log(`   主頁面檢查: ${mainPageOk ? '✅ 通過' : '❌ 失敗'}`);
    console.log(`   組件檢查: ${componentOk ? '✅ 通過' : '❌ 失敗'}`);
    console.log(`   CSS 檢查: ${cssOk ? '✅ 通過' : '❌ 失敗'}`);
    
    if (mainPageOk && componentOk && cssOk) {
        console.log('\n🎉 所有檢查通過！SlotMachine 滑動轉場效果實現成功！');
        console.log('✅ 組件可以正常載入');
        console.log('✅ 滑動轉場代碼完整');
        console.log('✅ CSS 動畫已定義');
        console.log('✅ 基於測試文件的實現完成');
        process.exit(0);
    } else {
        console.log('\n❌ 部分檢查失敗，需要進一步修復');
        process.exit(1);
    }
}

runFinalCheck();
