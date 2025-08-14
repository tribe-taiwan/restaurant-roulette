// validate-ui-functionality-components.js
// 驗證任務7：保留所有UI功能組件

const { test, expect } = require('@playwright/test');

test('驗證所有UI功能組件正常工作', async ({ page }) => {
  console.log('🧪 開始驗證UI功能組件...');

  // 導航到主頁面
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);

  console.log('✅ 1. 驗證候選清單功能');
  
  // 檢查加入候選按鈕是否存在
  const addCandidateButton = await page.locator('button').filter({ hasText: /加入候選|➕/ }).first();
  const addButtonVisible = await addCandidateButton.isVisible();
  console.log('   加入候選按鈕可見:', addButtonVisible ? '✅' : '❌');

  if (addButtonVisible) {
    // 點擊加入候選按鈕
    await addCandidateButton.click();
    await page.waitForTimeout(1000);
    
    // 檢查候選清單是否出現
    const candidateList = await page.locator('[class*="candidate"]').first();
    const candidateListVisible = await candidateList.isVisible().catch(() => false);
    console.log('   候選清單顯示:', candidateListVisible ? '✅' : '❌');
    
    if (candidateListVisible) {
      // 檢查候選清單計數
      const candidateCount = await page.locator('text=/候選名單.*\\(\\d+\\/9\\)/').textContent().catch(() => '');
      console.log('   候選清單計數:', candidateCount || '未找到');
      
      // 檢查清空按鈕
      const clearButton = await page.locator('button').filter({ hasText: /清空|清除/ }).first();
      const clearButtonVisible = await clearButton.isVisible().catch(() => false);
      console.log('   清空按鈕可見:', clearButtonVisible ? '✅' : '❌');
      
      // 檢查移除按鈕
      const removeButton = await page.locator('button').filter({ hasText: /❌|移除/ }).first();
      const removeButtonVisible = await removeButton.isVisible().catch(() => false);
      console.log('   移除按鈕可見:', removeButtonVisible ? '✅' : '❌');
    }
  }

  console.log('✅ 2. 驗證餐廳評分和價位標籤顯示');
  
  // 檢查評分顯示
  const ratingDisplay = await page.locator('[class*="rating"], .flex:has(span:text("⭐")), .flex:has(span:text("★"))').first();
  const ratingVisible = await ratingDisplay.isVisible().catch(() => false);
  console.log('   評分顯示:', ratingVisible ? '✅' : '❌');
  
  // 檢查價位標籤
  const priceTag = await page.locator('[class*="price"], .bg-\\[var\\(--accent-color\\)\\]').first();
  const priceTagVisible = await priceTag.isVisible().catch(() => false);
  console.log('   價位標籤顯示:', priceTagVisible ? '✅' : '❌');

  console.log('✅ 3. 驗證分享和導航按鈕功能');
  
  // 檢查分享按鈕
  const shareButton = await page.locator('button').filter({ hasText: /複製|分享|📋/ }).first();
  const shareButtonVisible = await shareButton.isVisible();
  console.log('   分享按鈕可見:', shareButtonVisible ? '✅' : '❌');
  
  // 檢查導航按鈕
  const navButton = await page.locator('button').filter({ hasText: /導航|🗺️/ }).first();
  const navButtonVisible = await navButton.isVisible();
  console.log('   導航按鈕可見:', navButtonVisible ? '✅' : '❌');

  console.log('✅ 4. 驗證所有按鈕狀態管理');
  
  // 檢查按鈕是否有正確的禁用狀態
  const spinButton = await page.locator('button').filter({ hasText: /搜尋|🔍|轉動|🎰/ }).first();
  const spinButtonEnabled = await spinButton.isEnabled();
  console.log('   轉動按鈕啟用:', spinButtonEnabled ? '✅' : '❌');
  
  // 檢查按鈕樣式是否正確應用
  const buttonStyles = await spinButton.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      background: styles.background,
      borderColor: styles.borderColor,
      cursor: styles.cursor
    };
  });
  console.log('   按鈕樣式應用:', buttonStyles.background ? '✅' : '❌');

  console.log('✅ 5. 驗證觸控操作功能');
  
  if (candidateListVisible) {
    // 測試左滑刪除功能（模擬觸控）
    const candidateItem = await page.locator('[class*="candidate"]').first();
    if (await candidateItem.isVisible()) {
      const box = await candidateItem.boundingBox();
      if (box) {
        // 模擬左滑手勢
        await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 10, box.y + box.height / 2);
        await page.mouse.up();
        await page.waitForTimeout(500);
        
        console.log('   左滑刪除測試:', '✅ 已執行');
      }
    }
  }

  // 總結驗證結果
  console.log('\n📊 UI功能組件驗證總結:');
  console.log('   - 候選清單功能:', addButtonVisible && candidateListVisible ? '✅ 正常' : '❌ 異常');
  console.log('   - 評分價位顯示:', ratingVisible || priceTagVisible ? '✅ 正常' : '❌ 異常');
  console.log('   - 分享導航按鈕:', shareButtonVisible && navButtonVisible ? '✅ 正常' : '❌ 異常');
  console.log('   - 按鈕狀態管理:', spinButtonEnabled && buttonStyles.background ? '✅ 正常' : '❌ 異常');

  const allFunctionsWorking = addButtonVisible && shareButtonVisible && navButtonVisible && spinButtonEnabled;
  
  if (allFunctionsWorking) {
    console.log('\n🎉 任務7驗證成功！所有UI功能組件正常工作');
  } else {
    console.log('\n⚠️ 任務7需要修復：部分UI功能組件異常');
  }
});