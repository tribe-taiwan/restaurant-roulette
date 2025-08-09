# Google Places API isOpen() 方法使用指南

## 問題背景

在使用 Google Places API 時，經常遇到以下錯誤訊息：
```
🔄 Google Places API isOpen() 方法不可用，使用 periods 手動計算營業狀態
```

這個問題的根本原因是對 `isOpen()` 方法的檢查方式不正確。

## 錯誤的檢查方式

```javascript
// ❌ 錯誤的檢查方式
if (openingHours && typeof openingHours.isOpen === 'function') {
  const isOpenNow = openingHours.isOpen();
}
```

## 正確的檢查方式

```javascript
// ✅ 正確的檢查方式
if (openingHours && openingHours.isOpen) {
  const isOpenNow = openingHours.isOpen();
}
```

## 完整的實作範例

```javascript
function checkRestaurantOpenStatus(openingHours) {
  // 使用新的 Google Places API 的 isOpen() 方法
  if (openingHours && openingHours.isOpen) {
    try {
      const isOpenNow = openingHours.isOpen();
      console.log('🕐 使用 Google Places API isOpen() 方法結果:', isOpenNow);

      // 如果營業中，檢查20分鐘緩衝區
      if (isOpenNow) {
        const minutesUntilClose = calculateMinutesUntilClose(openingHours);
        if (minutesUntilClose !== null && minutesUntilClose <= 20) {
          console.log(`⚠️ 餐廳將在${minutesUntilClose}分鐘後關門，排除此餐廳`);
          return false;
        }
      }

      return isOpenNow;
    } catch (error) {
      console.warn('⚠️ Google Places API isOpen() 調用失敗，回退到 periods 計算:', error);
    }
  } else {
    console.log('🔄 Google Places API isOpen() 方法不可用，使用 periods 手動計算營業狀態');
  }
  
  // 回退邏輯：使用 periods 手動計算當前營業狀態
  // ... 其他邏輯
}
```

## API 文檔參考

根據 Google Places API 官方文檔：
- `open_now` 欄位已被棄用
- 新的 `PlaceResult.opening_hours.isOpen()` 方法是推薦的做法
- 文檔連結：[Google Maps Platform Deprecations](https://developers.google.com/maps/deprecations)

## 修復位置

在 `utils/locationUtils.js` 中需要修復的函數：

1. **isRestaurantOpenForMealTime** (第301行)
2. **getBusinessStatus** (第749行)

## 測試驗證

修復後應該能看到：
```
🕐 使用 Google Places API isOpen() 方法結果: true/false
```

而不是：
```
🔄 Google Places API isOpen() 方法不可用，使用 periods 手動計算營業狀態
```

## 注意事項

1. **向後兼容**：保留 periods 手動計算作為備用方案
2. **錯誤處理**：使用 try-catch 包裹 isOpen() 調用
3. **日誌記錄**：適當的日誌輸出有助於除錯
4. **緩衝區檢查**：營業中的餐廳仍需檢查是否即將關門

## 相關檔案

- `utils/locationUtils.js` - 主要修復檔案
- `test/test-places-api.spec.js` - 測試檔案

## 修復日期

2025-01-09 - Commit Hash: `5e49749`
