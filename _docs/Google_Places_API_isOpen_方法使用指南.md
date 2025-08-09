# Google Places API isOpen() 方法使用指南

## 問題背景

在使用 Google Places API 時，經常遇到以下錯誤訊息：
```
🔄 Google Places API isOpen() 方法不可用，使用 periods 手動計算營業狀態
```

這個問題的根本原因是對 `isOpen()` 方法的檢查方式不正確。

## 錯誤的檢查方式

```javascript
// ❌ 錯誤的檢查方式 1：不檢查函數存在性
if (openingHours && openingHours.isOpen) {
  const isOpenNow = openingHours.isOpen();
}

// ❌ 錯誤的檢查方式 2：不檢查返回值
if (openingHours && typeof openingHours.isOpen === 'function') {
  const isOpenNow = openingHours.isOpen();
  return isOpenNow; // 可能返回 undefined
}
```

## 正確的檢查方式

```javascript
// ✅ 正確的檢查方式
if (openingHours && typeof openingHours.isOpen === 'function') {
  const isOpenNow = openingHours.isOpen();

  // 重要：檢查返回值是否為 undefined
  if (isOpenNow !== undefined) {
    return isOpenNow;
  } else {
    // 使用備用方案
    console.log('isOpen() 返回 undefined，缺少必要數據');
  }
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

## 常見問題與解決方案

### 問題 1：仍然出現 "open_now is deprecated" 警告

**原因**：程式碼中可能在序列化包含已棄用屬性的 Google Places API 原始物件。

**解決方案**：清理 detailsCache 中的已棄用屬性
```javascript
// ❌ 錯誤：直接存儲原始物件
localStorage.setItem('restaurants', JSON.stringify(rawPlaceResults));

// ✅ 正確：清理已棄用屬性後存儲
const cleanRestaurant = {
  id: place.place_id,
  name: place.name,
  // ... 其他必要屬性
  detailsCache: place.detailsCache ? {
    opening_hours: place.detailsCache.opening_hours ? {
      periods: place.detailsCache.opening_hours.periods,
      weekday_text: place.detailsCache.opening_hours.weekday_text,
      isOpen: place.detailsCache.opening_hours.isOpen
      // 不包含已棄用的 open_now, utc_offset 等屬性
    } : null,
    utc_offset_minutes: place.detailsCache.utc_offset_minutes
  } : null
};
```

### 問題 2：isOpen() 返回 undefined

**原因**：缺少 `utc_offset_minutes` 或 `periods` 數據。

**解決方案**：確保在 getPlaceDetails 中請求正確的欄位
```javascript
const request = {
  placeId: placeId,
  fields: [
    'name', 'formatted_address', 'geometry', 'rating',
    'opening_hours', 'utc_offset_minutes', // 重要：包含時區資訊
    'photos', 'price_level', 'website', 'url'
  ]
};
```

## 注意事項

1. **向後兼容**：保留 periods 手動計算作為備用方案
2. **錯誤處理**：使用 try-catch 包裹 isOpen() 調用
3. **日誌記錄**：適當的日誌輸出有助於除錯
4. **緩衝區檢查**：營業中的餐廳仍需檢查是否即將關門
5. **數據清理**：避免存儲包含已棄用屬性的原始 API 物件

## 相關檔案

- `utils/locationUtils.js` - 主要修復檔案
- `test/test-places-api.spec.js` - 測試檔案

### 問題 3：大量「沒有營業時間數據」錯誤導致輪盤轉圈

**原因**：移除 `detailsCache` 存儲後，`isRestaurantOpenInTimeSlot` 函數無法檢查營業時間。

**解決方案**：恢復 `detailsCache` 存儲，但只保留必要的營業時間屬性
```javascript
// 在 updateRestaurantCache 中保留清理後的 detailsCache
detailsCache: restaurant.detailsCache ? {
  opening_hours: restaurant.detailsCache.opening_hours ? {
    periods: restaurant.detailsCache.opening_hours.periods,
    weekday_text: restaurant.detailsCache.opening_hours.weekday_text,
    isOpen: restaurant.detailsCache.opening_hours.isOpen
  } : null,
  utc_offset_minutes: restaurant.detailsCache.utc_offset_minutes
} : null
```

## 修復歷史

- **2025-01-09** - Commit Hash: `5e49749` - 初始修復 isOpen() 檢查邏輯
- **2025-01-09** - Commit Hash: `4d18e31` - 新增技術文檔
- **2025-01-09** - Commit Hash: `4763fd1` - 修復 localStorage 存儲問題，避免序列化已棄用屬性
- **2025-01-09** - Commit Hash: `1990989` - 恢復 detailsCache 營業時間資訊，修復輪盤轉圈問題
