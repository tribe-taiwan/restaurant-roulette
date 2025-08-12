const { test, expect } = require('@playwright/test');

test.describe('滑動吸附功能測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/scroll-snap-test.html');
    await page.waitForLoadState('networkidle');
  });

  test('快速向下滑動應該定位到老虎機', async ({ page, isMobile }) => {
    // 確保頁面已載入
    await expect(page.locator('[data-name="slot-machine"]')).toBeVisible();
    
    // 滾動到頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    const initialScroll = await page.evaluate(() => window.pageYOffset);
    console.log(`初始滾動位置: ${initialScroll}px`);
    
    // 模擬觸控滑動 - 使用 page.touchscreen
    const startX = 200;
    const startY = 300;
    const endY = 600;
    
    // 執行快速滑動 - 使用滑鼠事件模擬（更可靠）
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(10); // 很短的時間
    await page.mouse.move(startX, endY);
    await page.mouse.up();
    
    // 等待滑動完成
    await page.waitForTimeout(1500);
    
    // 檢查是否定位到老虎機頂端
    const finalScroll = await page.evaluate(() => window.pageYOffset);
    console.log(`最終滾動位置: ${finalScroll}px`);
    
    // 獲取老虎機的實際位置
    const targetPosition = await page.evaluate(() => {
      const element = document.querySelector('[data-name="slot-machine"]');
      const rect = element.getBoundingClientRect();
      return rect.top + window.pageYOffset;
    });
    
    console.log(`目標位置: ${targetPosition}px`);
    
    const tolerance = 100;
    expect(Math.abs(finalScroll - targetPosition)).toBeLessThan(tolerance);
  });

  test('快速向上滑動應該定位到老虎機', async ({ page }) => {
    // 滾動到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // 獲取老虎機位置
    const slotMachine = page.locator('[data-name="slot-machine"]');
    const slotMachineBox = await slotMachine.boundingBox();
    const initialScroll = await page.evaluate(() => window.pageYOffset);
    
    console.log(`初始滾動位置: ${initialScroll}px`);
    
    // 模擬快速向上滑動 - 在下方區域進行
    const lowerSection = page.locator('.section-3');
    
    // 執行快速向上滑動手勢
    await page.mouse.move(200, 500);
    await page.mouse.down();
    await page.mouse.move(200, 200, { steps: 5 }); // 快速向上移動300px
    await page.mouse.up();
    
    // 等待滾動完成
    await page.waitForTimeout(1000);
    
    // 檢查是否定位到老虎機頂端
    const finalScroll = await page.evaluate(() => window.pageYOffset);
    console.log(`最終滾動位置: ${finalScroll}px`);
    
    // 計算老虎機的絕對位置
    const targetPosition = await page.evaluate(() => {
      const element = document.querySelector('[data-name="slot-machine"]');
      const rect = element.getBoundingClientRect();
      return rect.top + window.pageYOffset;
    });
    
    console.log(`目標位置: ${targetPosition}px`);
    
    const tolerance = 50;
    expect(Math.abs(finalScroll - targetPosition)).toBeLessThan(tolerance);
  });

  test('慢速滑動應該保持原生行為', async ({ page }) => {
    // 滾動到頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    const initialScroll = await page.evaluate(() => window.pageYOffset);
    
    // 執行慢速滑動
    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.waitForTimeout(200); // 停留較久製造慢速效果
    await page.mouse.move(200, 300, { steps: 50 }); // 慢速移動100px，更多步驟
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    const finalScroll = await page.evaluate(() => window.pageYOffset);
    
    // 慢速滑動不應該跳躍到老虎機位置
    // 應該有適度的滾動但不會直接定位到老虎機
    expect(finalScroll).toBeGreaterThan(initialScroll);
    const screenHeight = await page.evaluate(() => window.innerHeight);
    expect(finalScroll).toBeLessThan(screenHeight); // 不應該滾動太遠
  });

  test('檢查調試信息輸出', async ({ page }) => {
    const debugInfo = page.locator('#debug');
    await expect(debugInfo).toContainText('初始化完成');
    
    // 執行一次滑動
    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.mouse.move(200, 400, { steps: 3 });
    await page.mouse.up();
    
    await page.waitForTimeout(200);
    
    // 檢查是否有滑動信息輸出
    const debugText = await debugInfo.textContent();
    expect(debugText).toMatch(/(快速滑動|慢速滑動)/);
  });
});