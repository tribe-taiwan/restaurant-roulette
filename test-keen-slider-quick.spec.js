// test-keen-slider-quick.spec.js
// 快速驗證測試

const { test, expect } = require('@playwright/test');

test('快速驗證修復效果', async ({ page }) => {
  console.log('🔧 快速驗證修復效果...');
  
  await page.goto('http://localhost:3001/test-keen-slider-complete.html');
  await page.waitForLoadState('networkidle');
  
  // 等待初始化
  await page.waitForTimeout(1000);
  
  // 檢查餐廳內容是否正確渲染
  const restaurantNames = await page.$$eval('.restaurant-name', elements => 
    elements.map(el => el.textContent)
  );
  console.log('餐廳名稱:', restaurantNames);
  
  // 檢查當前餐廳名稱
  const currentName = await page.textContent('#currentRestaurantName');
  console.log('當前餐廳:', currentName);
  
  // 測試按鈕是否可見
  const nextButton = await page.isVisible('button:has-text("下一家")');
  const addButton = await page.isVisible('.btn-primary');
  console.log('下一家按鈕可見:', nextButton);
  console.log('加入候選按鈕可見:', addButton);
  
  if (nextButton) {
    console.log('✅ 測試下一家按鈕...');
    await page.click('button:has-text("下一家")');
    await page.waitForTimeout(500);
    
    const newName = await page.textContent('#currentRestaurantName');
    console.log('滑動後餐廳:', newName);
    
    if (newName !== currentName) {
      console.log('✅ 滑動功能正常！');
    } else {
      console.log('❌ 滑動沒有效果');
    }
  }
  
  if (addButton) {
    console.log('✅ 測試加入候選按鈕...');
    await page.click('.btn-primary');
    await page.waitForTimeout(500);
    
    const candidateCount = await page.textContent('#candidateCount');
    console.log('候選數量:', candidateCount);
  }
  
  console.log('🎉 快速測試完成！');
});