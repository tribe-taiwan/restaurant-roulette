const { test, expect } = require('@playwright/test');

test('診斷 getPlaceDetails API 失敗原因', async ({ page }) => {
  console.log('🔍 開始自動診斷 Google Places API getDetails 失敗問題...');

  // 設置較長的超時時間，因為需要等待API調用
  test.setTimeout(180000); // 3分鐘

  // 監聽 console 日誌
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    
    // 即時顯示重要日誌
    if (text.includes('RR_API_STATS') || text.includes('RR_API_ERROR') || 
        text.includes('RR_API_SUCCESS') || text.includes('RR_API_WARNING')) {
      console.log(`📊 ${text}`);
    }
  });

  try {
    // 設置地理位置權限
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 25.033, longitude: 121.5654 }); // 台北市
    
    // 啟動開發伺服器
    console.log('🚀 啟動應用程式...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    
    // 等待頁面基本載入
    await page.waitForTimeout(3000);
    console.log('✅ 應用程式載入完成');
    console.log('📍 已設置位置為台北市');

    // 直接等待並點擊「餐廳輪盤」按鈕來觸發搜尋
    console.log('🎰 等待並點擊餐廳輪盤按鈕...');
    
    // 嘗試多種可能的按鈕選擇器
    const buttonSelectors = [
      'button[onclick*="spin"]',
      '.spin-button', 
      'button:has-text("餐廳輪盤")',
      'button:has-text("轉一轉")',
      'button:has-text("吃這家")',
      '.unified-large-button',
      '[data-action="spin"]'
    ];
    
    let buttonFound = false;
    for (const selector of buttonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        console.log(`✅ 成功點擊按鈕: ${selector}`);
        buttonFound = true;
        break;
      } catch (e) {
        // 繼續嘗試下一個選擇器
      }
    }
    
    if (!buttonFound) {
      console.log('⚠️ 未找到按鈕，嘗試直接觸發搜尋...');
      // 直接調用 JavaScript 函數
      await page.evaluate(() => {
        if (window.handleSpin) {
          window.handleSpin();
        } else if (window.getRandomRestaurant) {
          window.getRandomRestaurant({ lat: 25.033, lng: 121.5654 }, 'current');
        }
      });
    }

    // 等待搜尋完成，檢查是否有統計日誌
    console.log('⏳ 等待 API 調用完成和統計資料...');
    
    let apiStatsFound = false;
    let retryCount = 0;
    const maxRetries = 30; // 最多等待30秒

    while (!apiStatsFound && retryCount < maxRetries) {
      // 檢查是否有統計日誌
      const statsLogs = consoleLogs.filter(log => log.includes('RR_API_STATS'));
      if (statsLogs.length > 0) {
        apiStatsFound = true;
        console.log('\n✅ 發現 API 統計資料！');
        break;
      }
      
      await page.waitForTimeout(1000);
      retryCount++;
      
      if (retryCount % 5 === 0) {
        console.log(`⏳ 等待中... ${retryCount}/${maxRetries}s`);
      }
    }

    // 分析收集到的日誌
    console.log('\n📊 開始分析日誌資料...');
    
    // 提取統計資料
    const statsLogs = consoleLogs.filter(log => log.includes('RR_API_STATS'));
    const successLogs = consoleLogs.filter(log => log.includes('RR_API_SUCCESS'));
    const errorLogs = consoleLogs.filter(log => log.includes('RR_API_ERROR'));
    const warningLogs = consoleLogs.filter(log => log.includes('RR_API_WARNING'));
    const cacheFilterLogs = consoleLogs.filter(log => log.includes('RR_CACHE_FILTER'));

    console.log('\n🔍 詳細分析結果:');
    console.log(`📈 統計日誌數量: ${statsLogs.length}`);
    console.log(`✅ 成功日誌數量: ${successLogs.length}`);
    console.log(`❌ 錯誤日誌數量: ${errorLogs.length}`);
    console.log(`⚠️  警告日誌數量: ${warningLogs.length}`);
    console.log(`🗂️  快取篩選日誌數量: ${cacheFilterLogs.length}`);

    // 顯示統計日誌內容
    if (statsLogs.length > 0) {
      console.log('\n📊 API 調用統計:');
      statsLogs.forEach(log => {
        console.log(`   ${log}`);
      });
    }

    // 顯示錯誤日誌
    if (errorLogs.length > 0) {
      console.log('\n❌ 錯誤詳情:');
      errorLogs.slice(0, 5).forEach(log => { // 只顯示前5個錯誤
        console.log(`   ${log}`);
      });
      if (errorLogs.length > 5) {
        console.log(`   ... 還有 ${errorLogs.length - 5} 個錯誤`);
      }
    }

    // 顯示警告日誌
    if (warningLogs.length > 0) {
      console.log('\n⚠️  警告詳情:');
      warningLogs.slice(0, 3).forEach(log => { // 只顯示前3個警告
        console.log(`   ${log}`);
      });
      if (warningLogs.length > 3) {
        console.log(`   ... 還有 ${warningLogs.length - 3} 個警告`);
      }
    }

    // 顯示快取篩選統計
    if (cacheFilterLogs.length > 0) {
      console.log('\n🗂️  快取篩選統計:');
      cacheFilterLogs.slice(-1).forEach(log => { // 顯示最新的快取統計
        console.log(`   ${log}`);
      });
    }

    // 分析問題模式
    console.log('\n🧐 問題分析:');
    
    if (errorLogs.length > successLogs.length) {
      console.log('❌ 發現問題: getPlaceDetails 失敗率過高！');
      
      // 分析錯誤類型
      const statusErrors = errorLogs.filter(log => log.includes('status')).length;
      const networkErrors = errorLogs.filter(log => log.includes('Network error')).length;
      const quotaErrors = errorLogs.filter(log => log.includes('OVER_QUERY_LIMIT')).length;
      const deniedErrors = errorLogs.filter(log => log.includes('REQUEST_DENIED')).length;
      
      console.log(`   狀態錯誤: ${statusErrors} 個`);
      console.log(`   網路錯誤: ${networkErrors} 個`);  
      console.log(`   配額限制: ${quotaErrors} 個`);
      console.log(`   請求被拒: ${deniedErrors} 個`);
      
      if (quotaErrors > 0) {
        console.log('💡 可能原因: API 調用次數超過限制');
      }
      if (deniedErrors > 0) {
        console.log('💡 可能原因: API 金鑰權限問題');
      }
      if (networkErrors > 0) {
        console.log('💡 可能原因: 網路連線問題');
      }
    } else {
      console.log('✅ getPlaceDetails 整體運作正常');
    }

    // 驗證是否有改善
    const hasApiStats = statsLogs.length > 0;
    expect(hasApiStats).toBeTruthy();
    
    console.log('\n🏁 診斷完成！');
    
  } catch (error) {
    console.error(`💥 測試過程中發生錯誤: ${error.message}`);
    
    // 即使出錯也顯示已收集的日誌
    if (consoleLogs.length > 0) {
      console.log('\n📝 已收集的日誌:');
      consoleLogs.slice(-10).forEach(log => {
        console.log(`   ${log}`);
      });
    }
    
    throw error;
  }
});

// 輔助測試：檢查伺服器是否運行
test.beforeEach(async ({ page }) => {
  // 檢查伺服器是否在運行
  try {
    const response = await page.goto('http://localhost:8080', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    if (!response || !response.ok()) {
      throw new Error('伺服器未運行或無法連接');
    }
  } catch (error) {
    console.error('❌ 無法連接到伺服器。請先執行: npm start');
    throw error;
  }
});