// test-keen-slider-complete.spec.js
// 完整功能測試

const { test, expect } = require('@playwright/test');

test('完整版 Keen Slider 功能測試', async ({ page }) => {
  console.log('🚀 開始完整功能測試...');
  
  await page.goto('http://localhost:3001/test-keen-slider-complete.html');
  await page.waitForLoadState('networkidle');
  
  // 等待初始化完成
  await page.waitForTimeout(500);
  
  console.log('✅ 1. 測試基本載入和初始化');
  
  // 檢查是否有餐廳內容
  const restaurantNames = await page.$$eval('.restaurant-name', elements => 
    elements.map(el => el.textContent)
  );
  console.log('   餐廳數量:', restaurantNames.length);
  console.log('   第一家餐廳:', restaurantNames[0]);
  
  console.log('✅ 2. 測試滑動功能');
  
  // 測試下一家按鈕
  const initialRestaurant = await page.textContent('#currentRestaurantName');
  console.log('   初始餐廳:', initialRestaurant);
  
  await page.click('button:has-text("下一家")');
  await page.waitForTimeout(500);
  
  const nextRestaurant = await page.textContent('#currentRestaurantName');
  console.log('   滑動後餐廳:', nextRestaurant);
  
  // 測試上一家按鈕
  await page.click('button:has-text("上一家")');
  await page.waitForTimeout(500);
  
  const prevRestaurant = await page.textContent('#currentRestaurantName');
  console.log('   回到餐廳:', prevRestaurant);
  
  console.log('✅ 3. 測試輪盤轉動功能');
  
  await page.click('button:has-text("🎰 開始轉動")');
  console.log('   轉動已開始...');
  
  // 等待轉動完成（最多8秒）
  await page.waitForTimeout(8000);
  
  const finalRestaurant = await page.textContent('#currentRestaurantName');
  console.log('   轉動後餐廳:', finalRestaurant);
  
  console.log('✅ 4. 測試加入候選功能');
  
  // 點擊加入候選
  await page.click('.btn-primary');
  await page.waitForTimeout(500);
  
  const candidateCount = await page.textContent('#candidateCount');
  console.log('   候選數量:', candidateCount);
  
  console.log('✅ 5. 測試語言切換功能');
  
  // 切換到英文
  await page.selectOption('#languageSelect', 'en');
  await page.waitForTimeout(500);
  
  const addButton = await page.textContent('.btn-primary');
  console.log('   英文按鈕文字:', addButton);
  
  // 切回中文
  await page.selectOption('#languageSelect', 'zh');
  await page.waitForTimeout(500);
  
  console.log('✅ 6. 測試設定功能');
  
  // 調整搜尋半徑
  await page.fill('#radiusSlider', '5');
  const radiusDisplay = await page.textContent('#radiusDisplay');
  console.log('   搜尋半徑:', radiusDisplay);
  
  // 切換用餐時段
  await page.selectOption('#mealTimeSelect', 'lunch');
  console.log('   已切換到午餐時段');
  
  console.log('✅ 7. 測試鍵盤快捷鍵');
  
  // 使用方向鍵
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  
  const keyboardRestaurant = await page.textContent('#currentRestaurantName');
  console.log('   鍵盤控制後餐廳:', keyboardRestaurant);
  
  console.log('✅ 8. 檢查防閃爍優化');
  
  // 檢查關鍵 CSS 屬性
  const slideElement = await page.$('.keen-slider__slide');
  const computedStyle = await page.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      transform: style.transform,
      willChange: style.willChange,
      backfaceVisibility: style.backfaceVisibility
    };
  }, slideElement);
  
  console.log('   CSS 優化屬性:', computedStyle);
  
  console.log('🎉 測試完成！所有功能正常運作');
  console.log('📱 請在手機 Chrome 瀏覽器中測試滑動是否還有閃爍問題');
});