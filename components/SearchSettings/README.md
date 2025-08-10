# SearchSettings 組件架構

## 概述

SearchSettings 組件已重構為模組化架構，拆分為三個獨立的子組件，實現更好的代碼組織和維護性。

## 組件結構

```
SearchSettings/
├── index.js              # 模組導出管理
├── DistanceControl.js    # 距離控制子組件
├── MealTimeSelector.js   # 用餐時段選擇子組件
├── SettingsDisplay.js    # 設定狀態顯示子組件
├── SearchSettings.css    # 組件樣式
└── README.md            # 文檔
```

## 子組件說明

### 1. DistanceControl
**功能**: 距離控制，包含單位切換器和距離滑軌
**Props**:
- `baseUnit`: 基礎單位 (200 或 1000)
- `setBaseUnit`: 設定基礎單位的函數
- `unitMultiplier`: 距離倍數 (1-10)
- `setUnitMultiplier`: 設定距離倍數的函數

**特點**:
- 智能單位切換，保持相近距離
- 視覺化滑軌控制
- 即時距離顯示

### 2. MealTimeSelector
**功能**: 用餐時段選擇，實現大按鈕網格布局
**Props**:
- `selectedMealTime`: 當前選中的用餐時段
- `setSelectedMealTime`: 設定用餐時段的函數
- `translations`: 翻譯對象

**特點**:
- 2行網格布局 (第一行: 現在營業中、不限時間; 第二行: 早午晚餐)
- 大按鈕設計，符合觸控標準
- 圖標和文字垂直布局
- 無障礙支援 (ARIA 標籤)

### 3. SettingsDisplay
**功能**: 顯示當前設定狀態
**Props**:
- `selectedMealTime`: 當前選中的用餐時段
- `baseUnit`: 基礎單位
- `unitMultiplier`: 距離倍數
- `translations`: 翻譯對象

**特點**:
- 緊湊的狀態顯示
- 距離和用餐時段並排顯示
- 圖標和文字結合

## 使用方式

### 在 HTML 中載入
```html
<!-- 載入子組件 -->
<script src="./components/SearchSettings/DistanceControl.js"></script>
<script src="./components/SearchSettings/MealTimeSelector.js"></script>
<script src="./components/SearchSettings/SettingsDisplay.js"></script>
<script type="text/babel" src="./components/SearchSettings/index.js"></script>

<!-- 載入樣式 -->
<link rel="stylesheet" href="./components/SearchSettings/SearchSettings.css">
```

### 在主組件中使用
```javascript
// 主 SearchSettings 組件會自動使用子組件
<SearchSettings
  selectedMealTime={selectedMealTime}
  setSelectedMealTime={setSelectedMealTime}
  translations={translations}
  baseUnit={baseUnit}
  setBaseUnit={setBaseUnit}
  unitMultiplier={unitMultiplier}
  setUnitMultiplier={setUnitMultiplier}
/>
```

## 安全特性

### 1. 模組化設計
- 每個子組件獨立運作
- 避免全局變數衝突
- 安全的狀態管理

### 2. 錯誤處理
- 子組件載入檢查
- 降級顯示機制
- 錯誤邊界保護

### 3. 無障礙支援
- ARIA 標籤完整
- 鍵盤導航支援
- 高對比度模式兼容

## 設計原則

### 1. 手機優先
- 大按鈕設計 (最小 44px 高度)
- 觸控友好的間距
- 響應式布局

### 2. 視覺一致性
- 統一的圓角設計 (12px)
- 一致的色彩方案
- 平滑的過渡動畫

### 3. 性能優化
- 組件懶載入
- 最小化重繪
- 記憶體效率

## 維護指南

### 添加新功能
1. 在對應子組件中添加功能
2. 更新 Props 接口
3. 添加相應的樣式
4. 更新文檔

### 修改樣式
1. 在 `SearchSettings.css` 中修改
2. 保持響應式設計
3. 確保無障礙兼容性

### 調試問題
1. 檢查子組件載入狀態
2. 查看瀏覽器控制台錯誤
3. 驗證 Props 傳遞正確性
