# Shared Components

這個目錄包含了餐廳輪盤應用的共用組件，採用Garmin風格的大按鈕設計，專為手機優先的用戶體驗而設計。

## 組件列表

### 1. LargeButton
Garmin風格的大按鈕組件，支援多種尺寸、狀態和觸控回饋。

**特性：**
- 多種尺寸：small, medium, large, xl
- 多種變體：primary, secondary, success, warning, error
- 觸控回饋和動畫效果
- 載入狀態支援
- 圖標支援（左、右、上方位置）
- 無障礙支援

**使用方式：**
```javascript
// 創建基本按鈕
const button = createLargeButton({
    text: '確認',
    size: 'large',
    variant: 'primary'
}).onClick(() => {
    console.log('按鈕被點擊');
});

// 添加到頁面
document.body.appendChild(button.getElement());

// 設置載入狀態
button.setLoading(true);
```

### 2. MobileCard
移動端卡片容器組件，提供標準化的卡片布局。

**特性：**
- 響應式設計
- 多種內邊距選項
- 可配置的陰影和圓角
- 標題和副標題支援
- 載入狀態指示
- 底部區域支援

**使用方式：**
```javascript
// 創建卡片
const card = createMobileCard({
    title: '位置管理',
    subtitle: '設定您的位置偏好',
    padding: 'normal',
    shadow: 'normal'
});

// 添加內容
card.setContent('<p>這是卡片內容</p>');

// 添加到頁面
document.body.appendChild(card.getElement());
```

### 3. StatusIndicator
狀態指示器組件，用於顯示載入、成功、錯誤等狀態回饋。

**特性：**
- 多種狀態類型：loading, success, error, warning, info
- 自動隱藏功能
- 多種位置選項：static, fixed, absolute
- 動畫效果
- 圖標和訊息支援

**使用方式：**
```javascript
// 顯示載入狀態
const loading = showLoading('正在載入...');

// 顯示成功訊息
showSuccess('操作成功完成！');

// 顯示錯誤訊息
showError('發生錯誤，請重試');

// 手動創建指示器
const indicator = createStatusIndicator({
    type: 'warning',
    message: '請注意',
    position: 'fixed'
}).show();
```

## CSS 變數系統

所有組件都使用統一的CSS變數系統，定義在 `garmin-design-system.css` 中：

### 色彩變數
```css
--garmin-blue: #007ACC;
--garmin-green: #00A86B;
--garmin-orange: #FF6B35;
--garmin-gray: #4A5568;
```

### 尺寸變數
```css
--button-height-small: 44px;
--button-height-medium: 52px;
--button-height-large: 60px;
--button-height-xl: 72px;
--touch-target-min: 44px;
```

### 間距變數
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
```

## 使用指南

### 1. 引入樣式
在您的HTML文件中引入統一的樣式文件：
```html
<link rel="stylesheet" href="components/shared/shared-components.css">
```

### 2. 引入JavaScript
```html
<script src="components/shared/LargeButton.js"></script>
<script src="components/shared/MobileCard.js"></script>
<script src="components/shared/StatusIndicator.js"></script>
```

或使用ES6模組：
```javascript
import { createLargeButton, createMobileCard, showSuccess } from './components/shared/index.js';
```

### 3. 工具類
樣式文件還包含了實用的工具類：

**間距：**
- `mt-sm`, `mb-lg`, `ml-xl` 等

**佈局：**
- `flex`, `flex-col`, `items-center`, `justify-between`

**文字：**
- `text-center`, `font-bold`, `text-primary`

**響應式：**
- `mobile-only`, `desktop-only`

## 設計原則

1. **手機優先**：所有組件都以手機體驗為優先設計
2. **觸控友好**：最小觸控區域44px，適當的間距和回饋
3. **Garmin風格**：大按鈕、高對比度、清晰的視覺層次
4. **無障礙支援**：完整的ARIA標籤、鍵盤導航、高對比度模式
5. **性能優化**：使用CSS變數、避免重繪、流暢的60fps動畫

## 瀏覽器支援

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 注意事項

1. 所有組件都支援深色模式和高對比度模式
2. 動畫會根據用戶的 `prefers-reduced-motion` 設定自動調整
3. 觸控回饋在支援的設備上會自動啟用
4. 所有文字都支援多語言，請確保提供適當的語言標籤

## 更新日誌

### v1.0.0 (2025-08-10)
- 初始版本發布
- 包含 LargeButton、MobileCard、StatusIndicator 組件
- 完整的 Garmin 風格設計系統
- 移動端優化和無障礙支援