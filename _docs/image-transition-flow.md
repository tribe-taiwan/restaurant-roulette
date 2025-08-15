# 餐廳圖片換圖流程分析

## 概述
Restaurant Roulette 使用 Keen Slider 處理餐廳圖片的轉場效果，包含智能預載入池和滑動轉場動畫。

## 主要流程

### 圖片換圖完整流程

```mermaid
graph TD
    A[用戶觸發換圖] --> B[檢查轉場條件]
    B --> C{是否在轉動中?}
    C -->|是| D[跳過操作]
    C -->|否| E[開始滑動轉場]
    
    E --> F[協調器鎖定狀態]
    F --> G[Keen Slider 開始滑動]
    G --> H[當前圖覆蓋層淡出]
    H --> I[檢查預載入池]
    
    I --> J{目標圖片已預載?}
    J -->|是| K[立即顯示新圖]
    J -->|否| L[顯示載入態或模糊圖]
    
    L --> M[緊急預載入目標圖]
    M --> N[載入完成後顯示清晰圖]
    
    K --> O[新圖覆蓋層淡入]
    N --> O
    O --> P[滑動轉場完成]
    P --> Q[協調器解鎖狀態]
    Q --> R[觸發預載入池管理]
```

### 模糊畫面出現原因

```mermaid
graph TD
    A[當前圖消失] --> B[檢查新圖預載入狀態]
    B --> C{新圖已載入?}
    C -->|是| D[立即顯示清晰新圖]
    C -->|否| E[顯示過渡態]
    
    E --> F[CSS transition 效果]
    F --> G[背景模糊或漸變色]
    G --> H[Keen Slider 過渡動畫]
    H --> I[新圖載入中...]
    I --> J[載入完成]
    J --> K[模糊消失，顯示清晰圖]
    
    style G fill:#ff9999
    style H fill:#ff9999
```

## 核心組件分析

### 1. SlotMachine.js 圖片渲染邏輯 (components/SlotMachine.js:724-737)

```javascript
backgroundImage: (() => {
  // 檢查預載入池
  if (restaurant.image && preloadPool.has(restaurant.image)) {
    const poolItem = preloadPool.get(restaurant.image);
    if (poolItem.isLoaded && poolItem.imageObject) {
      // 使用預載入的圖片
      return `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${poolItem.imageObject.src})`;
    }
  }
  
  // 回退到原始圖片或漸變背景
  return restaurant.image 
    ? `linear-gradient(rgba(0,0,0,var(--image-overlay-opacity)), rgba(0,0,0,var(--image-overlay-opacity))), url(${restaurant.image})`
    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
})()
```

### 2. 智能預載入池管理 (components/AdvancedPreloader.js:40-230)

```mermaid
graph LR
    A[當前餐廳] --> B[計算預載範圍]
    B --> C[前 N 家歷史]
    C --> D[當前餐廳]
    D --> E[後 N 家候補]
    E --> F[異步載入圖片]
    F --> G[更新預載入池]
    G --> H{剩餘 < 10家?}
    H -->|是| I[觸發幕後補充]
    H -->|否| J[繼續監控]
```

### 3. Keen Slider 轉場機制 (components/SlotMachine.js:208-247)

```mermaid
graph TD
    A[Keen Slider 初始化] --> B[禁用內建拖拽]
    B --> C[自定義觸控處理]
    C --> D[slideChanged 事件]
    D --> E[更新當前索引]
    E --> F[記錄當前餐廳]
    F --> G[觸發預載入管理]
```

### 4. 滑動轉場協調器 (hooks/useEffectManager.js:68-99)

```mermaid
graph TD
    A[safeRestaurantSwitch] --> B{可以開始滑動?}
    B -->|否| C[直接更新狀態]
    B -->|是| D[鎖定協調器]
    D --> E[設置待定更新]
    E --> F[執行滑動轉場]
    F --> G[轉場完成回調]
    G --> H[解鎖協調器]
    H --> I[執行待定更新]
```

## 模糊畫面成因分析

### 主要原因

1. **圖片未預載入**：新餐廳圖片不在預載入池中
2. **網路載入延遲**：即使觸發載入，仍需等待網路回應
3. **CSS 過渡效果**：Keen Slider 的過渡動畫期間
4. **背景回退機制**：顯示漸變背景作為載入態

### 模糊態表現形式

```mermaid
graph LR
    A[當前圖消失] --> B[過渡態顯示]
    B --> C[漸變背景]
    B --> D[模糊效果]
    B --> E[載入動畫]
    C --> F[新圖載入完成]
    D --> F
    E --> F
    F --> G[清晰圖顯示]
```

## 優化策略

### 1. 預載入範圍優化
- 動態計算：最小 21 家，最大 200 家
- 9 個方向預載入：前 N + 當前 + 後 N
- 智能觸發：剩餘 < 10 家時幕後補充

### 2. 緊急載入機制
- 檢測到未預載入時立即觸發載入
- 使用 Promise 確保載入完成
- 設置 5 秒超時避免無限等待

### 3. 視覺優化
- 使用一致的漸變背景作為載入態
- 添加載入動畫提升用戶體驗
- 保持覆蓋層透明度一致性

## 代碼位置索引

- **主要滑動邏輯**：`components/SlotMachine.js:208-640`
- **圖片渲染邏輯**：`components/SlotMachine.js:724-737`
- **預載入池管理**：`components/AdvancedPreloader.js:40-230`
- **轉場協調器**：`hooks/useEffectManager.js:68-99`
- **緊急預載入**：`components/SlotMachine.js:336-384`

## 注意事項

1. 模糊畫面通常持續時間極短（< 300ms）
2. 預載入池有效時可完全避免模糊態
3. 網路狀況影響載入速度和模糊持續時間
4. CSS transition 和 Keen Slider 動畫可能疊加產生視覺效果