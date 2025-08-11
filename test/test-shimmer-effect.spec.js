const { test, expect } = require('@playwright/test');

test.describe('流光特效測試', () => {
  test('檢查流光特效是否正常顯示', async ({ page }) => {
    // 前往首頁，假設已有server在運行
    await page.goto('http://localhost:3000');
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    
    // 尋找標題元素
    const titleElement = page.locator('h1').filter({ hasText: '甲崩喔' });
    await expect(titleElement).toBeVisible();
    
    // 檢查是否有 shimmer-text 類別
    await expect(titleElement).toHaveClass(/shimmer-text/);
    
    // 尋找「回民宿家」元素
    const homeElement = page.locator('span').filter({ hasText: '回民宿家' });
    await expect(homeElement).toBeVisible();
    
    // 檢查父元素是否有 shimmer-text 類別
    const homeContainer = homeElement.locator('..');
    await expect(homeContainer).toHaveClass(/shimmer-text/);
    
    // 檢查 CSS 動畫是否存在
    const shimmerStyle = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.shimmer-text'));
      return {
        position: style.position,
        overflow: style.overflow
      };
    });
    
    expect(shimmerStyle.position).toBe('relative');
    expect(shimmerStyle.overflow).toBe('hidden');
    
    // 截圖保存，用於視覺檢查
    await page.screenshot({ 
      path: 'test/screenshots/shimmer-effect.png',
      fullPage: true 
    });
    
    console.log('流光特效測試完成，截圖已保存到 test/screenshots/shimmer-effect.png');
  });

  test('檢查流光動畫的延遲設定', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 檢查標題的延遲設定
    const titleDelay = await page.locator('h1').filter({ hasText: '甲崩喔' })
      .evaluate(el => el.style.getPropertyValue('--shimmer-delay'));
    expect(titleDelay).toBe('0s');
    
    // 檢查「回民宿家」的延遲設定
    const homeDelay = await page.locator('span').filter({ hasText: '回民宿家' }).locator('..')
      .evaluate(el => el.style.getPropertyValue('--shimmer-delay'));
    expect(homeDelay).toBe('1s');
    
    console.log('動畫延遲設定檢查完成');
  });
});