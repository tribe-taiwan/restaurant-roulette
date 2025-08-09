# 🔗 調用鏈文檔 (2025年1月更新)

## 📊 當前架構概覽

### 層級結構
```
UI Layer (app.js + components/)
    ↓
Business Logic (app.js functions)
    ↓
Utils Layer (utils/locationUtils.js + utils/mealTimeConfig.js)
    ↓
External APIs (Google Maps, Places)
```

### 數據流向
```
User Action → App Component → Utils Functions → External APIs → Utils Processing → Component Update → UI Render
```

## 🗂️ app.js 函數組織結構 (當前版本)

### 1. 工具函數區塊 (純函數，不依賴狀態)
- `saveLocationToStorage(locations)` - 儲存位置到localStorage (app.js:432)

### 2. UI 副作用區塊
- `React.useEffect` - 更新滑桿填充顏色 (app.js:442-448)

### 3. 地址和定位服務函數區塊
- `geocodeAddress(address)` - 地址轉換為經緯度 (app.js:455)
- `handleAddressConfirm()` - 確認地址校正 (app.js:482)
- `handleLocationButton(type)` - 智能住家/公司按鈕處理 (app.js:502)
- `saveLocationFromInput(type)` - 從輸入框儲存位置 (app.js:520)
- `useSavedLocation(location)` - 使用已儲存位置 (app.js:559)
- `getAddressFromCoords(lat, lng)` - 從坐標獲取地址 (app.js:581)
- `getUserLocation()` - 獲取用戶位置 (app.js:610)
- `handleLocationError(errorMessage)` - 處理定位錯誤 (app.js:685)

### 4. 核心業務邏輯函數區塊
- `handleSpin(isAutoSpin)` - 智能餐廳搜索函數 (app.js:703)
- `shouldShowAnimation(isAutoSpin)` - 判斷是否需要顯示動畫 (app.js:781)
- `checkForQuickData()` - 檢查快取資料可用性 (app.js:813)
- `handleAddCandidate()` - 加入候選餐廳 (app.js:854)
- `handleClearList()` - 清除候選列表 (app.js:868)
- `handleImageClick()` - 處理圖片點擊 (app.js:873)
- `handlePreviousRestaurant()` - 回到上一家餐廳 (app.js:888)

## 📞 詳細調用鏈分析 (2025年1月版本)

### 🎯 智能餐廳搜索流程 (主要更新)
```
用戶點擊轉盤按鈕
    ↓
handleSpin(isAutoSpin) - app.js:703
    ↓
shouldShowAnimation(isAutoSpin) - app.js:781 (檢查是否需要動畫)
    ↓
checkForQuickData() - app.js:813 (檢查快取資料)
    ↓
[有快取] 立即顯示結果 OR [無快取] 啟動輪盤動畫
    ↓
window.updateSearchRadius() - locationUtils.js:30
    ↓
window.getRandomRestaurant() - locationUtils.js:980 (多次嘗試搜索策略)
    ↓
getAvailableRestaurantsFromCache() - locationUtils.js:919 (優先使用快取)
    ↓
[如無快取] searchNearbyRestaurants() - locationUtils.js:396 (多區域搜索)
    ↓
Google Places API (nearbySearch + getDetails)
    ↓
updateRestaurantCache() - locationUtils.js:877 (更新快取)
    ↓
餐廳篩選 (營業時間 + 歷史記錄)
    ↓
updateRestaurantHistory() - locationUtils.js:845
    ↓
餐廳結果回傳並更新UI
```

### 🕔 定位功能流程
```
應用啟動/重新定位
    ↓
getUserLocation() - app.js:610
    ↓
navigator.geolocation.getCurrentPosition()
    ↓
getAddressFromCoords() - app.js:581
    ↓
window.getAddressFromCoordinates() - locationUtils.js:36
    ↓
Google Geocoding API
    ↓
更新UI顯示
```

### 🏠 地址校正流程
```
用戶輸入地址
    ↓
handleAddressConfirm() - app.js:482
    ↓
geocodeAddress() - app.js:455
    ↓
Google Geocoding API
    ↓
window.getAddressFromCoordinates() - locationUtils.js:36
    ↓
更新位置和地址顯示
```

### 💾 位置儲存流程
```
用戶點擊住家/公司按鈕
    ↓
handleLocationButton() - app.js:502
    ↓
saveLocationFromInput() - app.js:520 (如有輸入)
    ↓
geocodeAddress() - app.js:455
    ↓
saveLocationToStorage() - app.js:432
    ↓
localStorage.setItem()
```

### 🔄 快取管理流程 (新增)
```
搜索條件變化 (時段/距離/位置)
    ↓
React.useEffect監聽 - app.js:383
    ↓
window.clearRestaurantHistory() - locationUtils.js:1111
    ↓
localStorage.removeItem('restaurant_history')
    ↓
強制重新搜索確保結果準確性
```

## 🔄 跨檔案依賴關係 (2025年1月版本)

### app.js 依賴的全域函數
- `window.getAddressFromCoordinates` (locationUtils.js:36) - 座標轉地址
- `window.updateSearchRadius` (locationUtils.js:30) - 更新搜索半徑
- `window.getRandomRestaurant` (locationUtils.js:980) - 智能餐廳搜索
- `window.getBusinessStatus` (locationUtils.js:706) - 營業狀態計算
- `window.clearRestaurantHistory` (locationUtils.js:1111) - 清除歷史記錄
- `window.getRestaurantHistory` (locationUtils.js:823) - 獲取歷史記錄
- `window.getMealTimeConfig` (mealTimeConfig.js) - 用餐時段配置

### 組件依賴關係
```
app.js (主應用)
├── components/LanguageSelector.js (語言選擇)
├── components/SlotMachine.js (老虎機動畫)
├── components/RestaurantCard.js (餐廳卡片)
├── components/LocationManager.js (位置管理)
├── components/SearchSettings.js (搜索設定)
├── components/StatusMessages.js (狀態訊息)
├── utils/locationUtils.js (位置工具)
└── utils/mealTimeConfig.js (時段配置)
```

### 重複代碼識別
**發現的重複函數**:
1. `priceLabels` 物件 - 出現在 RestaurantCard.js:7 和 SlotMachine.js:10
2. `getDirectionsUrl` 函數 - 出現在 RestaurantCard.js:149 和 SlotMachine.js:39
3. `renderStars` 函數 - 星級顯示邏輯在 SlotMachine.js:20 複用
4. 翻譯系統 - RestaurantCard.js 有獨立的 translations 物件

**清理建議**:
- 將共同的 `priceLabels` 提取到 utils 文件
- 統一 `getDirectionsUrl` 函數實現
- 建立共享的星級顯示組件

## ⚠️ 當前架構評估

### ✅ 架構優勢
- 清晰的層級分離 (UI → Logic → Utils → APIs)
- 智能快取機制減少 API 調用
- 多樣化搜索策略提高成功率
- 完整的錯誤處理和重試機制

### ⚠️ 待優化項目
- 組件間存在代碼重複
- 營業時間篩選邏輯複雜
- 翻譯系統分散在多個文件
- 部分廢棄測試文件需清理

### 📊 代碼質量指標
- **總代碼行數**: ~2,000+ 行
- **組件數量**: 6 個主要組件
- **工具函數**: ~20 個核心函數
- **API 整合**: Google Maps + Places
- **多語言支援**: 6 種語言

---
**文檔更新**: 2025年1月8日
**版本**: Restaurant Roulette v2025.1
**架構狀態**: 穩定運行，建議進行代碼重複清理
