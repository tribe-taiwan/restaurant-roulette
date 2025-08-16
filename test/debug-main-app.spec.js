import { test, expect } from '@playwright/test';

test('主應用調試 - 檢查餐廳搜索LOG', async ({ page, context }) => {
  console.log('🔍 開始主應用調試測試...');
  
  // 🎯 重要：自動授予地理位置權限，避免授權彈窗阻塞測試
  await context.grantPermissions(['geolocation']);
  console.log('✅ 已自動授予地理位置權限');
  
  // 捕獲所有控制台日誌
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`瀏覽器控制台: ${text}`);
  });

  // 前往主應用
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  
  // 等待應用完全載入
  await page.waitForTimeout(5000);
  
  console.log('📊 檢查頁面內容...');
  
  // 檢查頁面標題
  const title = await page.title();
  console.log(`頁面標題: ${title}`);
  
  // 檢查是否有錯誤信息
  const errorMessages = await page.locator('.error, [class*="error"]').allTextContents();
  if (errorMessages.length > 0) {
    console.log('❌ 發現錯誤信息:', errorMessages);
  }
  
  // 檢查位置狀態
  const locationStatus = await page.locator('text=/位置|定位|Location/').allTextContents();
  console.log('📍 位置相關文字:', locationStatus);
  
  // 設置台南市保安路46號位置作為測試位置
  await page.context().setGeolocation({ latitude: 22.9943, longitude: 120.2038 }); // 台南市保安路46號
  
  console.log('🎯 已設置台南市保安路46號位置，等待應用響應...');
  
  // 首先嘗試尋找並填寫地址輸入欄位
  console.log('📝 尋找地址輸入欄位...');
  const addressInput = page.locator('input[placeholder*="地址"], input[placeholder*="位置"], input[type="text"]').first();
  if (await addressInput.isVisible()) {
    console.log('📝 找到地址輸入欄位，輸入台南市保安路46號...');
    await addressInput.fill('台南市保安路46號');
    await page.waitForTimeout(1000);
    
    // 現在手動定位按鈕應該可以點擊了
    const manualLocationBtn = page.locator('button:has-text("手動定位")');
    if (await manualLocationBtn.isVisible() && await manualLocationBtn.isEnabled()) {
      console.log('📍 點擊手動定位按鈕...');
      await manualLocationBtn.click();
      await page.waitForTimeout(3000);
    }
  } else {
    console.log('❌ 找不到地址輸入欄位');
  }
  
  // 直接檢查和強制設置React狀態
  await page.evaluate(() => {
    console.log('🔧 開始檢查React應用狀態...');
    
    // 檢查當前userLocation狀態
    const rootElement = document.querySelector('#root');
    console.log('🔍 根元素存在:', !!rootElement);
    
    // 嘗試找到React Fiber節點並檢查狀態
    let reactInstance = null;
    if (rootElement && rootElement._reactInternalFiber) {
      reactInstance = rootElement._reactInternalFiber;
    } else if (rootElement && Object.keys(rootElement).find(key => key.startsWith('__reactInternalInstance'))) {
      const key = Object.keys(rootElement).find(key => key.startsWith('__reactInternalInstance'));
      reactInstance = rootElement[key];
    } else if (rootElement && Object.keys(rootElement).find(key => key.startsWith('_reactInternalFiber'))) {
      const key = Object.keys(rootElement).find(key => key.startsWith('_reactInternalFiber'));
      reactInstance = rootElement[key];
    }
    
    console.log('🔍 React實例存在:', !!reactInstance);
    
    // 檢查是否有全域的位置設定函數
    if (window.setUserLocationForTest) {
      console.log('🔧 找到測試用位置設定函數，直接設置...');
      window.setUserLocationForTest({ lat: 22.9943, lng: 120.2038 });
    } else {
      console.log('❌ 找不到測試用位置設定函數');
    }
    
    // 嘗試直接觸發位置更新
    if (window.getUserLocation) {
      console.log('🔧 嘗試觸發getUserLocation...');
      window.getUserLocation();
    }
    
    // 模擬成功的地理位置回調
    const mockPosition = {
      coords: {
        latitude: 22.9943,
        longitude: 120.2038,
        accuracy: 10
      },
      timestamp: Date.now()
    };
    
    // 如果有註冊的位置回調，直接調用
    if (window.locationSuccessCallback) {
      console.log('🔧 找到位置成功回調，直接調用...');
      window.locationSuccessCallback(mockPosition);
    }
    
    console.log('🔧 JavaScript狀態檢查完成');
  });
  
  await page.waitForTimeout(3000);
  
  // 再次嘗試尋找地址輸入欄位並直接輸入地址
  const addressInputAgain = page.locator('input[placeholder*="地址"], input[placeholder*="位置"], input[type="text"]').first();
  if (await addressInputAgain.isVisible()) {
    console.log('📝 找到地址輸入欄位，輸入台南市保安路46號...');
    await addressInputAgain.fill('台南市保安路46號');
    await page.waitForTimeout(1000);
    
    // 尋找確認按鈕
    const confirmBtn = page.locator('button:has-text("確認"), button:has-text("搜尋"), button:has-text("送出")').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      console.log('✅ 已點擊地址確認按鈕');
      await page.waitForTimeout(3000);
    }
  }
  
  // 檢查所有按鈕
  const allButtons = await page.locator('button').allTextContents();
  console.log('🔍 所有按鈕文字:', allButtons);
  
  // 等待定位完成 - 尋找"下一個"或其他相關按鈕
  console.log('⏳ 等待定位完成...');
  
  // 等待定位完成，檢查按鈕狀態變化
  await page.waitForTimeout(5000);
  
  // 再次檢查按鈕狀態
  const updatedButtons = await page.locator('button').allTextContents();
  console.log('🔄 更新後的按鈕文字:', updatedButtons);
  
  // 尋找轉盤按鈕 - 現在包含"下一個"
  let spinButton = page.locator('button').filter({ hasText: /下一個|轉動|搜尋|下一家|spin|slot/ }).first();
  
  // 如果還是找不到，嘗試點擊老虎機區域
  if (!(await spinButton.isVisible())) {
    console.log('🎰 嘗試尋找老虎機區域...');
    const slotMachine = page.locator('.slot-machine, [class*="slot"]').first();
    if (await slotMachine.isVisible()) {
      spinButton = slotMachine.locator('button').first();
    }
  }
  
  // 如果還是找不到，嘗試任何顯眼的按鈕
  if (!(await spinButton.isVisible())) {
    console.log('🔍 嘗試尋找主要按鈕...');
    const mainButtons = page.locator('button').filter({ hasText: /下一個|保留|搜尋/ });
    spinButton = mainButtons.first();
  }
  
  if (await spinButton.isVisible()) {
    console.log('🎰 找到轉盤按鈕，開始測試搜索...');
    
    // 點擊搜索按鈕
    await spinButton.click();
    
    // 等待搜索完成並檢查LOG
    await page.waitForTimeout(10000);
    
    // 檢查關鍵的調試LOG
    const relevantLogs = logs.filter(log => 
      log.includes('AdvancedPreloader') ||
      log.includes('9方向搜索') ||
      log.includes('可用餐廳') ||
      log.includes('快取餐廳') ||
      log.includes('歷史記錄') ||
      log.includes('📊') ||
      log.includes('📈') ||
      log.includes('🔍') ||
      log.includes('📍') ||
      log.includes('🎯')
    );
    
    console.log('\n🔍 相關的調試LOG:');
    relevantLogs.forEach(log => console.log(`  ${log}`));
    
    // 檢查是否有可用餐廳數量顯示
    const availableCountText = await page.locator('text=/\\d+／\\d+（.*km）/').textContent().catch(() => null);
    if (availableCountText) {
      console.log(`📊 可用餐廳數量顯示: ${availableCountText}`);
    }
    
    // 再點擊一次以查看更多LOG
    console.log('🔄 再次點擊按鈕查看更多LOG...');
    await spinButton.click();
    await page.waitForTimeout(5000);
    
  } else {
    console.log('❌ 找不到轉盤按鈕');
  }
  
  // 輸出所有LOG用於分析
  console.log('\n📝 所有控制台LOG:');
  logs.forEach((log, index) => {
    if (log.includes('📊') || log.includes('🔍') || log.includes('📍') || log.includes('🎯')) {
      console.log(`${index}: ${log}`);
    }
  });
});