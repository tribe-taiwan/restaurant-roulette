const http = require('http');

console.log('🔍 快速測試 SlotMachine 組件...');

function testSlotMachine() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/components/SlotMachine.js', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`HTTP 狀態碼: ${res.statusCode}`);
                console.log(`文件大小: ${data.length} 字符`);
                
                if (res.statusCode === 200) {
                    console.log('✅ SlotMachine.js 載入成功');
                    
                    // 檢查組件註冊
                    if (data.includes('window.SlotMachine = SlotMachine')) {
                        console.log('✅ 組件註冊正確');
                    } else {
                        console.log('❌ 組件註冊缺失');
                    }
                    
                    // 檢查滑動轉場相關代碼
                    if (data.includes('isSliding') && data.includes('triggerSlideTransition')) {
                        console.log('✅ 滑動轉場代碼存在');
                    } else {
                        console.log('❌ 滑動轉場代碼缺失');
                    }
                    
                    resolve(true);
                } else {
                    console.log('❌ SlotMachine.js 載入失敗');
                    resolve(false);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ 請求失敗:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ 請求超時');
            req.destroy();
            resolve(false);
        });
    });
}

testSlotMachine().then(success => {
    if (success) {
        console.log('🎉 測試通過！');
        process.exit(0);
    } else {
        console.log('❌ 測試失敗！');
        process.exit(1);
    }
});
