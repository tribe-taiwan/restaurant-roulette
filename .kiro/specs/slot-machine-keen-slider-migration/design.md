# Design Document

## Overview

基於成功的Keen Slider測試檔案，設計一個漸進式重構方案，將複雜的老虎機系統簡化為統一的滑動器架構。重點是最小化修改、降低風險，並設置明確的關鍵點檢查。

## Architecture

### 當前架構問題
- 多個動畫狀態（idle, fast, slow, apiWaiting, apiReceived）
- 複雜的狀態轉換邏輯
- 滑動轉場與老虎機動畫的協調衝突
- 多層DOM結構覆蓋

### 目標架構
- 單一Keen Slider實例管理所有內容（採用測試檔案的簡單邏輯）
- **移除所有複雜動畫**：去掉 apiWaiting, apiReceived, fast, slow 等狀態
- 簡化的狀態：只保留 `spinning` 和 `idle`
- 使用測試檔案的簡單轉動邏輯：定時器 + nextSlide()
- 保留所有核心功能：預載入池、觸控操作、候選清單等

## Components and Interfaces

### 1. 核心滑動器組件
```javascript
// 新的統一滑動器
const UnifiedSlotMachine = {
  slider: null,           // Keen Slider實例
  currentIndex: 0,        // 當前slide索引
  isSpinning: false,      // 簡化的狀態
  restaurants: [],        // 餐廳數據陣列
  preloadPool: new Map()  // 預載入池
}
```

### 2. 內容管理接口
```javascript
// 內容更新接口
const ContentManager = {
  updateSlides(restaurants),     // 更新所有slides
  addRestaurant(restaurant),     // 添加新餐廳
  preloadImages(restaurants),    // 預載入圖片
  getCurrentRestaurant()         // 獲取當前餐廳
}
```

### 3. 動畫控制接口（採用測試檔案邏輯）
```javascript
// 超簡化的動畫控制 - 直接採用測試檔案的成功邏輯
const AnimationController = {
  startSpinning(),              // 簡單的定時器轉動（測試檔案邏輯）
  nextSlide(),                  // 下一張
  previousSlide(),              // 上一張
  // 移除所有複雜動畫狀態管理
}
```

## Data Models

### 餐廳數據模型
```javascript
const RestaurantSlide = {
  id: string,
  name: string,
  image: string,
  rating: number,
  distance: string,
  priceLevel: number,
  cuisine: string[],
  isPreloaded: boolean
}
```

### 滑動器狀態模型
```javascript
const SliderState = {
  isSpinning: boolean,
  currentIndex: number,
  totalSlides: number,
  preloadedCount: number,
  availableRestaurants: number
}
```

## Error Handling

### 關鍵點檢查機制
1. **關鍵點1：基礎滑動器初始化**
   - 檢查：Keen Slider是否正常初始化
   - 失敗處理：回滾到原始組件
   
2. **關鍵點2：內容更新機制**
   - 檢查：動態更新slides是否正常工作
   - 失敗處理：停止重構，保持當前狀態
   
3. **關鍵點3：預載入池整合**
   - 檢查：預載入是否與新架構兼容
   - 失敗處理：使用簡化的預載入邏輯

### 錯誤恢復策略
```javascript
const ErrorRecovery = {
  checkpoints: [],              // 檢查點陣列
  rollback(checkpointId),       // 回滾到指定檢查點
  validateFunctionality(),      // 驗證功能完整性
  emergencyFallback()           // 緊急回退到原始組件
}
```

## Testing Strategy

### 漸進式測試方法
1. **階段1：基礎功能測試**
   - 滑動器初始化
   - 基本的上一張/下一張功能
   - 觸控事件響應

2. **階段2：動畫功能測試**
   - 轉動動畫
   - 停止邏輯
   - 性能測試（無閃爍）

3. **階段3：整合功能測試**
   - 預載入池整合
   - API數據更新
   - 所有原有功能驗證

### 性能基準
- 滑動響應時間：< 16ms
- 圖片載入時間：保持現有水準
- 記憶體使用：不超過當前版本的110%

## Implementation Phases

### Phase 1: 移除複雜動畫系統
- **關鍵點1**：移除所有動畫狀態管理（apiWaiting, apiReceived等）
- 移除 SlotMachineAnimationController.js 的複雜邏輯
- 保留基本的 isSpinning 狀態
- 驗證：基本功能不受影響

### Phase 2: 整合Keen Slider基礎
- **關鍵點2**：用Keen Slider替換現有的滑動邏輯
- 直接採用測試檔案的初始化代碼
- 實現基本的上一張/下一張功能
- 驗證：滑動操作正常

### Phase 3: 整合簡單轉動邏輯
- **關鍵點3**：採用測試檔案的轉動邏輯（定時器 + nextSlide）
- 移除所有複雜的動畫序列生成
- 保持轉動的視覺效果但邏輯極簡
- 驗證：轉動功能正常且無閃爍

### Phase 4: 保留核心功能
- 整合預載入池（簡化觸發邏輯）
- 保留觸控操作、鍵盤控制
- 保留候選清單、評分顯示等所有UI功能
- 最終驗證：所有功能正常

## Risk Mitigation

### 風險評估（大幅降低）
1. **移除複雜動畫**
   - 風險：**低** - 測試檔案已證明簡單邏輯有效
   - 緩解：直接複製測試檔案的成功代碼

2. **功能保留**
   - 風險：**中** - 需要確保所有現有功能正常
   - 緩解：逐一驗證每個功能模塊

### 成功標準
- 所有現有功能正常工作
- 性能不低於當前版本
- 代碼複雜度顯著降低
- 通過所有關鍵點檢查