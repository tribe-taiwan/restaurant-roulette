const { test, expect } = require('@playwright/test');

test('驗證路名搜索策略效果', async ({ page }) => {
  page.setDefaultTimeout(120000);
  
  console.log('🔍 開始測試路名搜索策略...');
  
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
  
  try {
    // 1. 載入頁面
    console.log('📄 載入測試頁面...');
    await page.goto('https://eat.tribe.org.tw/test/test-search-strategies.html', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 2. 檢查頁面標題
    const title = await page.title();
    console.log(`頁面標題: ${title}`);
    expect(title).toContain('餐廳搜索策略測試');
    
    // 3. 檢查 API 版本標註
    const apiVersion = await page.locator('.api-version').textContent();
    console.log('API 版本:', apiVersion);
    expect(apiVersion).toContain('Google Places API (New)');
    
    // 4. 測試隨機偏移搜索（檢查重複率問題）
    console.log('🎲 測試隨機偏移搜索...');
    const randomOffsetButton = page.locator('button:has-text("執行隨機偏移測試")');
    await expect(randomOffsetButton).toBeVisible();
    
    await randomOffsetButton.click();
    
    // 等待搜索完成
    await page.waitForFunction(() => {
      const resultDiv = document.getElementById('randomOffsetResult');
      const content = resultDiv ? resultDiv.textContent : '';
      return content.includes('隨機偏移搜索結果') && 
             (content.includes('總計找到') || content.includes('測試失敗'));
    }, { timeout: 90000 });
    
    const randomResult = await page.locator('#randomOffsetResult').textContent();
    console.log('🎲 隨機偏移搜索結果:');
    console.log(randomResult);
    
    // 提取餐廳數量和重複率
    const randomRestaurantMatch = randomResult.match(/總計找到\s*(\d+)\s*家不重複餐廳/);
    const randomDuplicateMatch = randomResult.match(/整體重複率:\s*(\d+\.?\d*)%/);
    
    let randomRestaurantCount = 0;
    let randomDuplicateRate = 0;
    
    if (randomRestaurantMatch) {
      randomRestaurantCount = parseInt(randomRestaurantMatch[1]);
      console.log(`隨機偏移找到餐廳數量: ${randomRestaurantCount}`);
    }
    
    if (randomDuplicateMatch) {
      randomDuplicateRate = parseFloat(randomDuplicateMatch[1]);
      console.log(`隨機偏移重複率: ${randomDuplicateRate}%`);
    }
    
    // 5. 測試路名搜索
    console.log('🛣️ 測試路名搜索...');
    const streetSearchButton = page.locator('button:has-text("執行路名搜索測試")');
    await expect(streetSearchButton).toBeVisible();
    
    await streetSearchButton.click();
    
    // 等待搜索完成
    await page.waitForFunction(() => {
      const resultDiv = document.getElementById('streetSearchResult');
      const content = resultDiv ? resultDiv.textContent : '';
      return content.includes('路名搜索結果') && 
             (content.includes('總計找到') || content.includes('測試失敗'));
    }, { timeout: 90000 });
    
    const streetResult = await page.locator('#streetSearchResult').textContent();
    console.log('🛣️ 路名搜索結果:');
    console.log(streetResult);
    
    // 提取餐廳數量和重複率
    const streetRestaurantMatch = streetResult.match(/總計找到\s*(\d+)\s*家不重複餐廳/);
    const streetDuplicateMatch = streetResult.match(/整體重複率:\s*(\d+\.?\d*)%/);
    
    let streetRestaurantCount = 0;
    let streetDuplicateRate = 0;
    
    if (streetRestaurantMatch) {
      streetRestaurantCount = parseInt(streetRestaurantMatch[1]);
      console.log(`路名搜索找到餐廳數量: ${streetRestaurantCount}`);
    }
    
    if (streetDuplicateMatch) {
      streetDuplicateRate = parseFloat(streetDuplicateMatch[1]);
      console.log(`路名搜索重複率: ${streetDuplicateRate}%`);
    }
    
    // 6. 比較兩種方法的效果
    console.log('\n📊 搜索策略比較:');
    console.log(`隨機偏移方法: ${randomRestaurantCount} 家餐廳, 重複率 ${randomDuplicateRate}%`);
    console.log(`路名搜索方法: ${streetRestaurantCount} 家餐廳, 重複率 ${streetDuplicateRate}%`);
    
    // 驗證路名搜索是否更有效
    if (streetRestaurantCount > 0 && randomRestaurantCount > 0) {
      const improvement = ((streetRestaurantCount - randomRestaurantCount) / randomRestaurantCount * 100).toFixed(1);
      const duplicateImprovement = (randomDuplicateRate - streetDuplicateRate).toFixed(1);
      
      console.log(`📈 改善效果:`);
      console.log(`  餐廳數量提升: ${improvement}% (${streetRestaurantCount - randomRestaurantCount} 家)`);
      console.log(`  重複率改善: ${duplicateImprovement}% (降低)`);
      
      // 驗證路名搜索確實更有效
      expect(streetRestaurantCount).toBeGreaterThanOrEqual(randomRestaurantCount);
      
      if (streetRestaurantCount > randomRestaurantCount) {
        console.log('✅ 路名搜索策略確實找到更多餐廳！');
      }
      
      if (streetDuplicateRate < randomDuplicateRate) {
        console.log('✅ 路名搜索策略重複率更低！');
      }
    }
    
    // 輸出所有控制台訊息供分析
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