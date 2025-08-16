import { test, expect } from '@playwright/test';

test('按鈕點擊功能測試', async ({ page, context }) => {
  console.log('🔍 開始按鈕點擊功能測試...');
  
  // 自動授予地理位置權限
  await context.grantPermissions(['geolocation']);
  console.log('✅ 已自動授予地理位置權限');
  
  // 捕獲所有控制台日誌和錯誤
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`📝 Console: ${text}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`❌ Page Error: ${error.message}`);
    console.error(`❌ Error Stack: ${error.stack}`);
  });
  
  // 設置台南市保安路46號位置作為測試位置
  await context.setGeolocation({ latitude: 22.9943, longitude: 120.2038 });
  
  try {
    // 前往主應用
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    console.log('🎯 頁面載入完成，等待應用初始化...');
    
    // 等待應用完全載入
    await page.waitForTimeout(3000);
    
    // 檢查是否有JavaScript錯誤
    if (errors.length > 0) {
      console.error('❌ 發現JavaScript錯誤:', errors);
    }
    
    // 測試自動定位按鈕
    console.log('🔍 測試自動定位按鈕...');
    const autoLocationBtn = page.locator('button:has-text("自動定位"), button[aria-label*="自動定位"]').first();
    
    if (await autoLocationBtn.isVisible()) {
      console.log('✅ 找到自動定位按鈕');
      try {
        await autoLocationBtn.click();
        console.log('✅ 自動定位按鈕點擊成功');
        await page.waitForTimeout(2000);
      } catch (error) {
        console.error('❌ 自動定位按鈕點擊失敗:', error.message);
      }
    } else {
      console.log('⚠️ 未找到自動定位按鈕');
    }
    
    // 測試住家按鈕
    console.log('🔍 測試住家按鈕...');
    const homeBtn = page.locator('button:has-text("住家"), button:has-text("家"), button[aria-label*="住家"]').first();
    
    if (await homeBtn.isVisible()) {
      console.log('✅ 找到住家按鈕');
      try {
        await homeBtn.click();
        console.log('✅ 住家按鈕點擊成功');
        await page.waitForTimeout(2000);
      } catch (error) {
        console.error('❌ 住家按鈕點擊失敗:', error.message);
      }
    } else {
      console.log('⚠️ 未找到住家按鈕');
    }
    
    // 測試公司按鈕
    console.log('🔍 測試公司按鈕...');
    const officeBtn = page.locator('button:has-text("公司"), button[aria-label*="公司"]').first();
    
    if (await officeBtn.isVisible()) {
      console.log('✅ 找到公司按鈕');
      try {
        await officeBtn.click();
        console.log('✅ 公司按鈕點擊成功');
        await page.waitForTimeout(2000);
      } catch (error) {
        console.error('❌ 公司按鈕點擊失敗:', error.message);
      }
    } else {
      console.log('⚠️ 未找到公司按鈕');
    }
    
    // 等待一段時間觀察結果
    await page.waitForTimeout(3000);
    
    // 檢查最終錯誤狀態
    if (errors.length > 0) {
      console.error('❌ 測試過程中發現的所有錯誤:');
      errors.forEach((error, index) => {
        console.error(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ 沒有發現JavaScript錯誤');
    }
    
    // 輸出重要的日誌
    const importantLogs = logs.filter(log => 
      log.includes('錯誤') || 
      log.includes('Error') || 
      log.includes('error') ||
      log.includes('失敗') ||
      log.includes('成功') ||
      log.includes('清除') ||
      log.includes('位置')
    );
    
    if (importantLogs.length > 0) {
      console.log('📋 重要日誌:');
      importantLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 測試執行失敗:', error.message);
    throw error;
  }
});
