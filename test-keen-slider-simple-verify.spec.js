// test-keen-slider-simple-verify.spec.js
// 驗證簡化版測試檔案

const { test, expect } = require('@playwright/test');

test('簡化版 Keen Slider 功能驗證', async ({ page }) => {
  console.log('🧪 測試簡化版 Keen Slider...');
  
  await page.goto('http://localhost:3001/test-keen-slider-simple.html');
  await page.waitForLoadState('networkidle');
  
  // 等待初始化
  await page.waitForTimeout(1000);
  
  console.log('✅ 1. 檢查基本渲染');
  
  const restaurantCards = await page.$$('.restaurant-card');
  console.log('   餐廳卡片數量:', restaurantCards.length);
  
  const currentRestaurant = await page.textContent('#currentRestaurant');
  console.log('   當前餐廳:', currentRestaurant);
  
  console.log('✅ 2. 測試滑動功能');
  
  // 測試下一家
  await page.click('button:has-text("下一家")');
  await page.waitForTimeout(500);
  
  const nextRestaurant = await page.textContent('#currentRestaurant');
  console.log('   滑動後餐廳:', nextRestaurant);
  
  const slideChanged = nextRestaurant !== currentRestaurant;
  console.log('   滑動是否成功:', slideChanged ? '✅ 是' : '❌ 否');
  
  console.log('✅ 3. 測試加入候選功能');
  
  await page.click('.add-btn');
  await page.waitForTimeout(500);
  
  const candidateCount = await page.textContent('#candidateCount');
  console.log('   候選數量:', candidateCount);
  
  console.log('✅ 4. 測試轉動功能');
  
  await page.click('button:has-text("🎰 轉動")');
  console.log('   轉動已開始...');
  
  // 等待轉動完成
  await page.waitForTimeout(3000);
  
  const finalRestaurant = await page.textContent('#currentRestaurant');
  console.log('   轉動後餐廳:', finalRestaurant);
  
  console.log('✅ 5. 測試鍵盤控制');
  
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  
  const keyboardRestaurant = await page.textContent('#currentRestaurant');
  console.log('   鍵盤控制後餐廳:', keyboardRestaurant);
  
  console.log('✅ 6. 檢查 GPU 優化');
  
  const slideElement = await page.$('.keen-slider__slide');
  const styles = await page.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      transform: computed.transform !== 'none',
      willChange: computed.willChange !== 'auto',
      backfaceVisibility: computed.backfaceVisibility === 'hidden'
    };
  }, slideElement);
  
  console.log('   GPU 優化屬性:', styles);
  
  if (slideChanged && parseInt(candidateCount) > 0) {
    console.log('🎉 簡化版測試檔案功能正常！');
    console.log('📱 請在手機 Chrome 中測試: http://localhost:3001/test-keen-slider-simple.html');
  } else {
    console.log('❌ 仍有問題需要修復');
  }
});