// test-keen-slider-debug.spec.js
// 自動化測試和修復 keen-slider 初始化問題

const { test, expect } = require('@playwright/test');

test('調試和修復 keen-slider 初始化問題', async ({ page }) => {
  // 訪問測試頁面
  await page.goto('http://localhost:3001/test-keen-slider-complete.html');
  
  // 等待頁面完全載入
  await page.waitForLoadState('networkidle');
  
  // 檢查 console 日誌
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // 等待一段時間讓初始化完成
  await page.waitForTimeout(3000);
  
  // 檢查 KeenSlider 是否載入
  const keenSliderLoaded = await page.evaluate(() => {
    return typeof KeenSlider !== 'undefined';
  });
  
  console.log('🔍 KeenSlider 是否載入:', keenSliderLoaded);
  
  // 檢查 sliderInstance 是否初始化
  const sliderInstanceExists = await page.evaluate(() => {
    return window.sliderInstance !== null && window.sliderInstance !== undefined;
  });
  
  console.log('🔍 sliderInstance 是否存在:', sliderInstanceExists);
  
  // 檢查初始化過程的 console 訊息
  console.log('📋 Console 訊息:');
  consoleMessages.forEach(msg => console.log('  ', msg));
  
  // 如果初始化失敗，嘗試手動初始化
  if (!sliderInstanceExists) {
    console.log('🔧 嘗試手動修復初始化...');
    
    await page.evaluate(() => {
      // 延遲初始化
      setTimeout(() => {
        console.log('🔄 重新嘗試初始化 Keen Slider...');
        if (typeof initKeenSlider === 'function') {
          initKeenSlider();
        }
      }, 1000);
    });
    
    await page.waitForTimeout(2000);
    
    const retrySliderExists = await page.evaluate(() => {
      return window.sliderInstance !== null && window.sliderInstance !== undefined;
    });
    
    console.log('🔍 重試後 sliderInstance 是否存在:', retrySliderExists);
  }
  
  // 測試按鈕功能
  console.log('🧪 測試下一家按鈕...');
  await page.click('button:has-text("下一家")');
  await page.waitForTimeout(1000);
  
  // 檢查是否有變化
  const currentIndex = await page.evaluate(() => {
    return window.currentSlideIndex || 0;
  });
  
  console.log('📍 當前滑動索引:', currentIndex);
  
  // 檢查滑動內容是否正確渲染
  const slideElements = await page.$$('.keen-slider__slide');
  console.log('🎯 滑動元素數量:', slideElements.length);
  
  // 檢查餐廳內容是否顯示
  const restaurantNames = await page.$$eval('.restaurant-name', elements => 
    elements.map(el => el.textContent)
  );
  console.log('🍽️ 餐廳名稱:', restaurantNames);
  
  // 生成修復建議
  console.log('\n🔧 修復建議:');
  if (!keenSliderLoaded) {
    console.log('   1. KeenSlider 未載入 - 檢查 CDN 連接');
  }
  if (!sliderInstanceExists) {
    console.log('   2. sliderInstance 未初始化 - 檢查初始化時機');
  }
  if (slideElements.length === 0) {
    console.log('   3. 滑動元素未生成 - 檢查 DOM 操作');
  }
  if (restaurantNames.length === 0) {
    console.log('   4. 餐廳內容未渲染 - 檢查內容渲染邏輯');
  }
});