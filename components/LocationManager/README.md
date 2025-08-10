# LocationManager 重構架構文件

## 概述

LocationManager 組件已重構為模組化架構，拆分為四個獨立的子組件，提供更好的代碼組織和維護性。

## 組件架構

```
LocationManager/
├── CurrentLocationDisplay.js    # 當前位置顯示
├── QuickLocationButtons.js      # 住家/公司快速按鈕
├── AddressInput.js             # 地址輸入框
├── LocationActions.js          # 自動/手動定位按鈕
├── index.js                    # 模組匯出入口
└── README.md                   # 架構文件
```

## 子組件說明

### 1. CurrentLocationDisplay
- **功能**: 顯示當前偵測到的位置資訊
- **Props**: 
  - `locationStatus`: 定位狀態
  - `userAddress`: 用戶地址
  - `translations`: 翻譯對象
- **特點**: 只在定位成功且有地址時顯示

### 2. QuickLocationButtons
- **功能**: 處理住家和公司快速位置按鈕
- **Props**:
  - `savedLocations`: 已儲存的位置列表
  - `addressInput`: 當前地址輸入
  - `isInputFocused`: 輸入框聚焦狀態
  - `onLocationButton`: 按鈕點擊處理函數
  - `translations`: 翻譯對象
- **特點**: 根據狀態動態顯示按鈕樣式和文字

### 3. AddressInput
- **功能**: 提供大型地址輸入框
- **Props**:
  - `addressInput`: 輸入值
  - `setAddressInput`: 設定輸入值函數
  - `onAddressConfirm`: 地址確認處理函數
  - `onFocus/onBlur`: 聚焦狀態處理函數
  - `translations`: 翻譯對象
- **特點**: 包含輸入驗證和安全過濾

### 4. LocationActions
- **功能**: 自動和手動定位操作按鈕
- **Props**:
  - `locationStatus`: 定位狀態
  - `addressInput`: 地址輸入
  - `isInputFocused`: 輸入框聚焦狀態
  - `isRelocating`: 重新定位狀態
  - `isGeocodingAddress`: 地址解析狀態
  - `onRelocate`: 自動定位處理函數
  - `onAddressConfirm`: 地址確認處理函數
  - `translations`: 翻譯對象
- **特點**: 內部管理手動定位狀態，避免全局衝突

## 安全特性

### 1. 模組化匯出
- 使用安全的模組匯出方式，支援瀏覽器和Node.js環境
- 避免全局變數衝突
- 提供錯誤處理和組件驗證

### 2. 輸入驗證
- 地址輸入長度限制（200字符）
- 危險字符過濾（`<>\"'&`）
- 防止XSS攻擊

### 3. 錯誤處理
- 每個組件都包含try-catch錯誤處理
- 組件載入失敗時的優雅降級
- 詳細的錯誤日誌記錄

## 使用方式

### 1. 載入順序
```html
<!-- 必須按順序載入 -->
<script src="components/LocationManager/CurrentLocationDisplay.js"></script>
<script src="components/LocationManager/QuickLocationButtons.js"></script>
<script src="components/LocationManager/AddressInput.js"></script>
<script src="components/LocationManager/LocationActions.js"></script>
<script src="components/LocationManager/index.js"></script>
<script src="components/LocationManager.js"></script>
```

### 2. 組件使用
```javascript
// 主組件會自動載入和使用子組件
<LocationManager 
  locationStatus={locationStatus}
  userAddress={userAddress}
  savedLocations={savedLocations}
  // ... 其他props
/>
```

## 測試

使用 `test/test-location-manager-refactor.html` 進行功能測試：
- 測試所有子組件的載入
- 驗證狀態管理的獨立性
- 確認用戶交互的正確性

## 維護注意事項

1. **組件獨立性**: 每個子組件都應該是獨立的，不依賴其他子組件
2. **狀態管理**: 避免在子組件中使用全局狀態
3. **錯誤處理**: 確保每個組件都有適當的錯誤處理
4. **載入順序**: 維持正確的腳本載入順序
5. **向後兼容**: 保持與現有API的兼容性