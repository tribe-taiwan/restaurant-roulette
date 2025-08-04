const { test, expect } = require('@playwright/test');

test('測試新 Places API 頁面', async ({ page }) => {
  // 設定頁面載入超時時間
  page.setDefaultTimeout(60000);
  
  console.log('🔍 開始測試 Places API 頁面...');
  
  // 監聽控制台訊息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    console.log(`瀏覽器控制台 ${msg.type()}: ${msg.text()}`);
  });
  
  // 監聽頁面錯誤
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`頁面錯誤: ${error.message}`);
  });
  
  // 監聽網路請求失敗
  page.on('requestfailed', request => {
    console.log(`網路請求失敗: ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    // 1. 載入頁面
    console.log('📄 載入測試頁面...');
    await page.goto('https://eat.tribe.org.tw/test/test-new-places-api.html', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 2. 檢查頁面標題
    const title = await page.title();
    console.log(`頁面標題: ${title}`);
    expect(title).toBe('新 Places API 測試');
    
    // 3. 檢查測試按鈕是否存在
    const testButton = page.locator('button:has-text("執行新 API 測試")');
    await expect(testButton).toBeVisible();
    console.log('✅ 測試按鈕已找到');
    
    // 4. 檢查結果區域是否存在
    const resultDiv = page.locator('#newApiResult');
    await expect(resultDiv).toBeVisible();
    console.log('✅ 結果顯示區域已找到');
    
    // 5. 等待 JavaScript 載入完成
    await page.waitForFunction(() => {
      return typeof window.testNewPlacesAPI === 'function';
    }, { timeout: 10000 });
    console.log('✅ JavaScript 函數已載入');
    
    // 6. 檢查 locationUtils.js 是否載入成功
    const configLoaded = await page.evaluate(() => {
      return typeof GOOGLE_PLACES_CONFIG !== 'undefined' && 
             GOOGLE_PLACES_CONFIG.API_KEY && 
             GOOGLE_PLACES_CONFIG.API_KEY !== '%%GOOGLE_PLACES_API_KEY%%';
    });
    
    if (configLoaded) {
      console.log('✅ Google Places 配置已載入');
      
      // 檢查 API 金鑰
      const apiKey = await page.evaluate(() => GOOGLE_PLACES_CONFIG.API_KEY);
      console.log(`API 金鑰: ${apiKey.substring(0, 10)}...`);
    } else {
      console.log('❌ Google Places 配置載入失敗');
    }
    
    // 7. 點擊測試按鈕
    console.log('🔍 點擊測試按鈕...');
    await testButton.click();
    
    // 8. 等待一下，然後檢查目前狀態
    await page.waitForTimeout(3000);
    let currentContent = await resultDiv.textContent();
    console.log(`點擊後的狀態: ${currentContent}`);
    
    // 如果還在載入中，等待更長時間
    if (currentContent.includes('⏳ 正在載入')) {
      console.log('API 仍在載入中，等待更長時間...');
      await page.waitForTimeout(10000);
      currentContent = await resultDiv.textContent();
      console.log(`10秒後的狀態: ${currentContent}`);
    }
    
    // 如果需要再次點擊測試按鈕
    if (currentContent.includes('⏳ 正在載入') || !currentContent.includes('🔍')) {
      console.log('嘗試再次點擊測試按鈕...');
      await testButton.click();
      await page.waitForTimeout(5000);
      currentContent = await resultDiv.textContent();
      console.log(`再次點擊後的狀態: ${currentContent}`);
    }
    
    // 9. 等待測試完成或錯誤訊息 (給更長的時間因為 API 請求可能需要時間)
    await page.waitForFunction(() => {
      const resultDiv = document.getElementById('newApiResult');
      const content = resultDiv ? resultDiv.textContent : '';
      return content.includes('新 Places API 搜索結果') || 
             content.includes('測試失敗') ||
             content.includes('總計找到') ||
             content.includes('錯誤') ||
             content.includes('❌');
    }, { timeout: 45000 });
    
    // 10. 檢查最終結果
    const finalResult = await resultDiv.textContent();
    console.log('📊 最終測試結果:');
    console.log(finalResult);
    
    // 檢查是否成功
    if (finalResult.includes('新 Places API 搜索結果') || finalResult.includes('總計找到')) {
      console.log('🎉 測試成功完成！');
      
      // 嘗試提取餐廳數量
      const restaurantCountMatch = finalResult.match(/總計找到\s*(\d+)\s*家不重複餐廳/);
      if (restaurantCountMatch) {
        const count = parseInt(restaurantCountMatch[1]);
        console.log(`找到餐廳數量: ${count}`);
        expect(count).toBeGreaterThan(0);
      }
    } else if (finalResult.includes('測試失敗') || finalResult.includes('❌')) {
      console.log('❌ 測試執行失敗');
      console.log('失敗原因:', finalResult);
    } else {
      console.log('⚠️ 測試結果不明確');
    }
    
    // 11. 輸出所有控制台訊息供分析
    console.log('\n📝 所有控制台訊息:');
    consoleMessages.forEach(msg => console.log(`  ${msg}`));
    
    if (pageErrors.length > 0) {
      console.log('\n❌ 頁面錯誤:');
      pageErrors.forEach(error => console.log(`  ${error}`));
    }
    
  } catch (error) {
    console.log(`測試過程中發生錯誤: ${error.message}`);
    throw error;
  }
});