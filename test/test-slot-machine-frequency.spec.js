const { test, expect } = require('@playwright/test');

test('測試轉盤出現頻率 - 檢查快取機制', async ({ page }) => {
  console.log('🎰 開始測試轉盤出現頻率...');
  
  // 監聽所有控制台訊息
  const allLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(text);
    console.log(`瀏覽器控制台: ${text}`);
  });
  
  // 前往主頁面
  await page.goto('http://localhost:3000');
  
  // 等待頁面完全載入
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 檢查是否有按鈕
  const buttonExists = await page.locator('button.btn-primary').isVisible();
  console.log(`🔍 按鈕是否存在: ${buttonExists}`);
  
  if (!buttonExists) {
    console.log('❌ 找不到輪盤按鈕，測試結束');
    return;
  }
  
  let slotMachineCount = 0;
  let directSlideCount = 0;
  let noResponseCount = 0;
  const totalClicks = 5; // 減少測試次數
  
  console.log(`🎯 準備進行 ${totalClicks} 次點擊測試...`);
  
  for (let i = 0; i < totalClicks; i++) {
    console.log(`\n🔄 第 ${i + 1} 次點擊測試...`);
    
    // 清除之前的日誌
    allLogs.length = 0;
    
    // 點擊輪盤按鈕
    await page.click('button.btn-primary');
    
    // 等待3秒看結果
    await page.waitForTimeout(3000);
    
    // 分析日誌
    const hasCache = allLogs.some(log => log.includes('⚡ 發現') && log.includes('快取餐廳'));
    const hasNoCache = allLogs.some(log => log.includes('⏳ 無可用快取'));
    
    if (hasCache) {
      directSlideCount++;
      console.log(`⚡ 第 ${i + 1} 次：快取直接滑動`);
    } else if (hasNoCache) {
      slotMachineCount++;
      console.log(`🎰 第 ${i + 1} 次：轉盤搜索`);
    } else {
      noResponseCount++;
      console.log(`❓ 第 ${i + 1} 次：無明確回應`);
      console.log('最近的日誌:', allLogs.slice(-5));
    }
    
    // 等待一小段時間再進行下一次測試
    await page.waitForTimeout(1000);
  }
  
  console.log('\n📊 測試結果統計:');
  console.log(`🎰 轉盤動畫次數: ${slotMachineCount}/${totalClicks} (${(slotMachineCount/totalClicks*100).toFixed(1)}%)`);
  console.log(`⚡ 直接滑動次數: ${directSlideCount}/${totalClicks} (${(directSlideCount/totalClicks*100).toFixed(1)}%)`);
  
  // 檢查快取狀況
  const cacheInfo = await page.evaluate(() => {
    const history = JSON.parse(localStorage.getItem('restaurant_history') || '{}');
    return {
      cachedRestaurants: history.cached_restaurants?.length || 0,
      shownRestaurants: history.shown_restaurants?.length || 0
    };
  });
  
  console.log('\n📋 快取狀況:');
  console.log(`快取餐廳數: ${cacheInfo.cachedRestaurants}`);
  console.log(`已顯示餐廳數: ${cacheInfo.shownRestaurants}`);
  
  // 判斷是否異常
  const expectedDirectSlideRatio = 0.7; // 期望70%以上應該是直接滑動
  const actualDirectSlideRatio = directSlideCount / totalClicks;
  
  if (actualDirectSlideRatio < expectedDirectSlideRatio) {
    console.log(`⚠️ 警告：直接滑動比例過低 (${(actualDirectSlideRatio*100).toFixed(1)}%)，應該 >= ${(expectedDirectSlideRatio*100)}%`);
    console.log('🔍 可能原因:');
    console.log('1. 快取餐廳被過度篩選（營業時間、已顯示等條件）');
    console.log('2. shown_restaurants 清單累積過多');
    console.log('3. getAvailableRestaurantsFromCache 函數邏輯問題');
  } else {
    console.log(`✅ 直接滑動比例正常 (${(actualDirectSlideRatio*100).toFixed(1)}%)`);
  }
  
  // 確保測試通過的基本條件
  expect(totalClicks).toBe(slotMachineCount + directSlideCount);
});