// SlotMachineUtils.js
// 🛠️ 老虎機工具函數集合 - 包含純函數和獨立工具

/**
 * 🎲 亂數排序函數 - 增加轉盤的隨機性
 * @param {Array} array - 要排序的陣列
 * @returns {Array} 亂數排序後的新陣列
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 自動偵測可用的slot圖片數量 - 使用fetch避免404錯誤
 * @returns {Promise<Array>} 偵測到的圖片路徑陣列
 */
const autoDetectSlotImages = async () => {
  const basePath = './assets/image/slot-machine';
  const detectedImages = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  // RR_UI_059: 開始自動偵測slot圖片
  window.RRLog?.debug('RR_UI_UPDATE', '開始自動偵測slot圖片數量', {
    supportedFormats: extensions
  });

  let i = 1;
  while (true) {
    let imageFound = false;

    // 嘗試每種副檔名
    for (const ext of extensions) {
      const imagePath = `${basePath}/slot (${i})${ext}`;

      try {
        // 使用fetch進行HEAD請求，避免下載圖片內容，減少404錯誤顯示
        const response = await fetch(imagePath, {
          method: 'HEAD',
          cache: 'no-cache'
        });

        if (response.ok) {
          detectedImages.push(imagePath);
          imageFound = true;
          break; // 找到就跳出副檔名迴圈
        }
      } catch (error) {
        // 繼續嘗試下一個副檔名，不輸出錯誤
      }
    }

    if (!imageFound) {
      // RR_UI_060: slot圖片偵測完成
      window.RRLog?.info('RR_UI_UPDATE', 'slot圖片偵測完成', {
        totalFound: detectedImages.length,
        range: `slot (1) ~ slot (${detectedImages.length})`
      });
      break; // 沒找到任何格式的圖片，停止搜尋
    }

    i++;

    // 安全上限，避免無限迴圈
    if (i > 100) {
      // RR_UI_061: 達到圖片搜尋上限
      window.RRLog?.warn('RR_UI_ERROR', '達到圖片搜尋上限100張，停止搜尋');
      break;
    }
  }

  // RR_UI_062: slot圖片載入成功
  window.RRLog?.info('RR_UI_UPDATE', 'slot圖片載入成功', {
    count: detectedImages.length,
    supportedFormats: extensions,
    images: detectedImages.slice(0, 3).map(img => img.split('/').pop()) // 只顯示前3個檔名
  });

  return detectedImages;
};

// 註冊到全局變數
window.shuffleArray = shuffleArray;
window.autoDetectSlotImages = autoDetectSlotImages;
