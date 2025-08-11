# Design Document

## Overview

本設計文檔旨在將BANNER區塊整合到現有的統一設計系統中，確保視覺一致性和用戶體驗的連貫性。設計將基於現有的Garmin設計系統、共用組件樣式和統一佈局系統，同時保持BANNER的核心功能（主題切換、滑動動畫(已實現,保留即可)、語言選擇器、社交媒體連結）。

## Architecture

### 設計系統整合架構

```
統一設計系統
├── Garmin Design System (基礎變數和色彩)
├── Shared Components (共用組件樣式)
├── Unified Layout (統一佈局系統)
└── Banner Style Integration (新增BANNER專用樣式)
    ├── Banner Container (容器樣式)
    ├── Banner Controls (控制元素樣式)
    ├── Banner Content (內容區域樣式)
    └── Banner Animations (動畫效果樣式)
```

### 樣式層級結構

1. **基礎層**: 使用現有的CSS變數和設計token
2. **組件層**: 重用現有的統一組件樣式
3. **特化層**: BANNER專用的樣式擴展
4. **主題層**: 支援多品牌主題的動態樣式

## Components and Interfaces

### 1. Banner Container Component

**設計原則:**
- 除了區塊背景圖片為全方, 其他使用統一的圓角系統 (`--unified-border-radius: 12px`)
- 採用統一的陰影系統 (`--theme-shadow-lg`)
- 遵循統一的寬度和間距規範

**樣式規格:**
```css
.unified-banner-container {
  /* 使用統一佈局系統 */
  width: 100%;
  max-width: var(--unified-max-width);
  margin: 0 auto var(--unified-section-spacing) auto;
  padding: 0 var(--unified-content-padding);
  
  /* 使用統一設計系統 */
  border-radius: var(--unified-border-radius);
  box-shadow: var(--theme-shadow-lg);
  overflow: hidden;
  
  /* 響應式高度 */
  min-height: 300px;
  position: relative;
}
```

### 2. Banner Controls Component

**控制元素包括:**
- 語言選擇器 (右上角)
- 主題切換箭頭 (左右兩側, 保持現狀)
- 社交媒體圖標 (右下角)

**設計規格:**
```css
.unified-banner-control {
  /* 使用統一按鈕樣式 */
  @extend .unified-button;
  
  /* 觸控優化 */
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
  padding: var(--touch-padding);
  
  /* 視覺層級 */
  background: rgba(var(--surface-color-rgb), 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 3. Banner Content Component

**內容區域包括:**
- 主標題
- 副標題
- 回民宿家連結(保持原特效)

**設計規格:**
```css
.unified-banner-content {
  /* 使用統一文字系統 */
  color: var(--text-primary);
  text-align: center;
  
  /* 響應式字體大小 */
  font-size: clamp(var(--font-size-2xl), 4vw, 4rem);
  font-weight: var(--font-weight-bold);
  
  /* 統一間距 */
  padding: var(--spacing-2xl);
}
```

### 4. Banner Background Component

**背景處理:**
- 統一的遮罩處理
- 響應式圖片適配
- 主題切換滑動效果(保持原效果)

**設計規格:**
```css
.unified-banner-background {
  /* 統一背景處理 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  /* 統一遮罩 */
  position: relative;
}

.unified-banner-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(var(--background-color-rgb), 0.4),
    rgba(var(--background-color-rgb), 0.6)
  );
}
```

## Data Models

### Banner Theme Data Structure

```typescript
interface BannerTheme {
  id: string;
  bannerImage: string;
  logoImage?: string;
  displayName: string;
  config: ThemeConfig;
}

interface BannerState {
  themes: BannerTheme[];
  currentThemeIndex: number;
  isSliding: boolean;
  slideDirection: 'left' | 'right';
}
```

### Style Configuration

```typescript
interface BannerStyleConfig {
  container: {
    maxWidth: string;
    borderRadius: string;
    boxShadow: string;
    minHeight: string;
  };
  controls: {
    size: string;
    background: string;
    backdropFilter: string;
  };
  content: {
    fontSize: string;
    fontWeight: string;
    textAlign: string;
  };
  animations: {
    slideDuration: string;
    transitionTiming: string;
  };
}
```

## Error Handling

### 1. 主題載入失敗處理

```css
.unified-banner-fallback {
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2. 圖片載入失敗處理

```css
.unified-banner-background[data-error="true"] {
  background: var(--surface-color);
  border: 2px dashed var(--border-color);
}
```

### 3. 動畫性能優化

```css
@media (prefers-reduced-motion: reduce) {
  .unified-banner-slide {
    animation: none;
    transition: none;
  }
}
```

## Testing Strategy

### 1. 視覺一致性測試

**測試項目:**
- 圓角半徑與其他組件一致性
- 陰影效果與設計系統匹配
- 色彩使用符合主題規範
- 間距遵循統一佈局系統

**測試方法:**
- 視覺回歸測試
- 設計token驗證
- 跨瀏覽器兼容性測試

### 2. 響應式設計測試

**測試斷點:**
- 手機端: 320px - 767px
- 平板端: 768px - 1023px  
- 桌面端: 1024px+

**測試項目:**
- 寬度適配
- 控制元素觸控區域
- 文字大小縮放
- 圖片適配

### 3. 交互功能測試

**測試場景:**
- 主題切換動畫流暢性
- 控制按鈕懸停效果
- 觸控設備操作體驗


### 4. 性能測試

**測試指標:**
- 動畫幀率 (60fps)
- 圖片載入時間
- CSS載入大小

## Implementation Considerations

### 1. CSS變數整合

所有BANNER樣式將使用現有的CSS變數系統，確保主題切換時的一致性：

```css
.unified-banner {
  /* 使用現有變數 */
  background: var(--surface-color);
  color: var(--text-primary);
  border-radius: var(--unified-border-radius);
  box-shadow: var(--theme-shadow-lg);
  
  /* 響應式變數 */
  padding: var(--unified-content-padding);
  margin-bottom: var(--unified-section-spacing);
}
```

### 2. 組件重用策略

優先重用現有的統一組件：

```css
/* 重用統一按鈕樣式 */
.banner-control-button {
  @extend .unified-button;
  @extend .unified-button--secondary;
}

/* 重用統一卡片樣式 */
.banner-container {
  @extend .unified-card;
}
```

### 3. 動畫優化

保留原狀


### 4. 主題適配

確保BANNER樣式能夠適配所有品牌主題：

```css
.unified-banner {
  /* 使用主題適配變數 */
  background: var(--theme-surface);
  color: var(--theme-text-primary);
  
  /* 主題特定樣式 */
  --banner-accent: var(--theme-accent);
  --banner-primary: var(--theme-primary);
}
```

這個設計確保了BANNER區塊能夠完美整合到現有的統一設計系統中，同時保持其獨特的功能特性和視覺吸引力。