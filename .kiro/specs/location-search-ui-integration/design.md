# Design Document

## Overview

本設計文件描述了餐廳輪盤應用中位置管理和搜索設定組件的重新設計方案。採用手機優先的設計理念，借鑒Garmin設備的大按鈕界面風格，創建簡潔大氣且功能完整的用戶界面。

## Architecture

### 設計原則

1. **手機優先（Mobile First）**：所有設計決策都以手機體驗為優先考量
2. **大按鈕設計**：借鑒Garmin風格，使用大型、易觸控的按鈕
3. **單頁顯示**：每個功能區塊都能在手機螢幕的一頁內完整顯示
4. **模組化架構**：安全的代碼結構，避免全局衝突
5. **視覺層次**：清晰的資訊架構和視覺分組

### 組件架構

```
LocationSearchUI/
├── LocationManager/
│   ├── CurrentLocationDisplay
│   ├── QuickLocationButtons
│   ├── AddressInput
│   └── LocationActions
├── SearchSettings/
│   ├── DistanceControl
│   ├── MealTimeSelector
│   └── SettingsDisplay
└── Shared/
    ├── LargeButton
    ├── StatusIndicator
    └── MobileCard
```

## Components and Interfaces

### 1. LocationManager 重新設計

#### 1.1 整體布局
- **卡片式設計**：使用圓角卡片包裝整個區塊
- **垂直布局**：適合手機螢幕的垂直排列
- **最大寬度**：限制在手機螢幕寬度內（max-width: 100vw）

#### 1.2 CurrentLocationDisplay（當前位置顯示）
```javascript
// 設計規格
{
  height: "60px",
  background: "gradient(green-500 to green-600)",
  borderRadius: "12px",
  padding: "16px",
  textAlign: "center",
  fontSize: "16px",
  fontWeight: "medium"
}
```

#### 1.3 QuickLocationButtons（快速位置按鈕）
```javascript
// Garmin風格大按鈕設計
{
  buttonHeight: "56px", // 符合觸控標準
  buttonSpacing: "12px",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "bold",
  iconSize: "24px",
  layout: "flex-row", // 住家和公司並排
  states: {
    unset: "bg-gray-600 hover:bg-gray-500",
    ready: "bg-orange-500 hover:bg-orange-400", 
    saved: "bg-green-500 hover:bg-green-400"
  }
}
```

#### 1.4 AddressInput（地址輸入）
```javascript
// 大型輸入框設計
{
  height: "52px",
  fontSize: "16px",
  padding: "16px",
  borderRadius: "12px",
  border: "2px solid transparent",
  focusBorder: "2px solid var(--primary-color)",
  placeholder: "清晰易讀的提示文字"
}
```

#### 1.5 LocationActions（定位操作）
```javascript
// 雙按鈕布局
{
  buttonHeight: "52px",
  layout: "flex-row",
  gap: "12px",
  autoLocation: {
    flex: "1",
    icon: "gps-icon",
    text: "自動定位"
  },
  manualLocation: {
    flex: "1", 
    icon: "pin-icon",
    text: "手動定位"
  }
}
```

### 2. SearchSettings 重新設計

#### 2.1 DistanceControl（距離控制）
```javascript
// 大型滑軌設計
{
  container: {
    height: "80px",
    padding: "20px",
    background: "var(--surface-color)"
  },
  unitSwitcher: {
    height: "44px",
    buttonWidth: "80px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold"
  },
  slider: {
    height: "8px",
    thumbSize: "24px",
    trackColor: "var(--primary-color)",
    width: "200px"
  },
  distanceDisplay: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--accent-color)",
    minWidth: "80px"
  }
}
```

#### 2.2 MealTimeSelector（用餐時段選擇）
```javascript
// 大按鈕網格設計
{
  layout: "grid-2x3", // 2行3列
  buttonSize: {
    height: "72px",
    minWidth: "100px"
  },
  buttonContent: {
    iconSize: "32px",
    fontSize: "14px",
    fontWeight: "medium",
    layout: "vertical" // 圖標在上，文字在下
  },
  spacing: "8px",
  borderRadius: "12px"
}
```

### 3. 共用組件設計

#### 3.1 LargeButton（大按鈕組件）
```javascript
// 標準化大按鈕
const LargeButton = {
  minHeight: "48px",
  minTouchTarget: "44px", // iOS/Android 觸控標準
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 20px",
  transition: "all 0.2s ease",
  states: {
    default: "shadow-md",
    hover: "shadow-lg transform scale-105",
    active: "shadow-sm transform scale-95",
    disabled: "opacity-50 cursor-not-allowed"
  }
}
```

#### 3.2 MobileCard（移動端卡片）
```javascript
// 標準化卡片容器
const MobileCard = {
  width: "100%",
  maxWidth: "480px", // 適合手機螢幕
  margin: "0 auto",
  padding: "20px",
  borderRadius: "16px",
  background: "var(--surface-color)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: "1px solid var(--border-color)"
}
```

## Data Models

### UI狀態管理
```javascript
// LocationManager 狀態
const locationState = {
  currentLocation: {
    address: string,
    coordinates: { lat: number, lng: number },
    status: 'loading' | 'success' | 'error'
  },
  savedLocations: {
    home: LocationData | null,
    office: LocationData | null
  },
  addressInput: string,
  isGeocoding: boolean
}

// SearchSettings 狀態  
const searchState = {
  distance: {
    baseUnit: 200 | 1000,
    multiplier: 1-10,
    actualRadius: number
  },
  mealTime: 'current' | 'all' | 'breakfast' | 'lunch' | 'dinner'
}
```

### 組件Props接口
```javascript
// 標準化Props接口
interface MobileUIProps {
  // 基礎屬性
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  
  // 大按鈕屬性
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  
  // 觸控屬性
  touchFeedback?: boolean;
  hapticFeedback?: boolean;
}
```

## Error Handling

### 1. 輸入驗證
- 地址輸入長度限制（200字符）
- 特殊字符過濾
- 即時驗證回饋

### 2. 網路錯誤處理
- 定位服務失敗的優雅降級
- 離線狀態的本地快取使用
- 重試機制和用戶提示

### 3. 觸控操作錯誤
- 防止誤觸的確認機制
- 操作回饋和狀態指示
- 無障礙支援

## Testing Strategy

### 1. 響應式測試
- 多種手機螢幕尺寸測試
- 橫豎屏切換測試
- 觸控操作精確度測試

### 2. 性能測試
- 組件渲染性能
- 動畫流暢度測試
- 記憶體使用優化

### 3. 用戶體驗測試
- 單手操作便利性
- 視覺層次清晰度
- 操作流程直觀性

## Implementation Notes

### 1. CSS 變數系統
```css
:root {
  /* Garmin風格色彩 */
  --garmin-blue: #007ACC;
  --garmin-green: #00A86B;
  --garmin-orange: #FF6B35;
  --garmin-gray: #4A5568;
  
  /* 大按鈕尺寸 */
  --button-height-small: 44px;
  --button-height-medium: 52px;
  --button-height-large: 60px;
  
  /* 觸控區域 */
  --touch-target-min: 44px;
  --border-radius-large: 12px;
}
```

### 2. 動畫和過渡
- 使用 `transform` 而非 `width/height` 變化
- 60fps 流暢動畫
- 減少重繪和重排

### 3. 無障礙支援
- ARIA 標籤完整性
- 鍵盤導航支援
- 高對比度模式兼容