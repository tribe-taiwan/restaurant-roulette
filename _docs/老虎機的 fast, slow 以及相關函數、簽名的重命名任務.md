# 動畫狀態重命名任務

## 目標
將 SlotMachine 組件中的動畫狀態從模糊的 `fast/slow` 重命名為語義清晰的名稱，避免未來 AI IDE 因名稱誤解而錯誤修改代碼。

## 重命名方案
- `fast` → `slot_apiWaiting` (老虎機等待API狀態)
- `slow` → `slot_apiReceived` (老虎機API已接收狀態)

## 完成的修改範圍

### 1. 核心狀態重命名
- [x] `animationPhase` 狀態值更新
- [x] 動畫邏輯中的狀態檢查條件
- [x] `getAnimationClass()` 函數中的 case 分支

### 2. 變數系統性重命名
- [x] `fastAnimationLevel` → `apiWaitingLevel`
- [x] `fastSequenceCache` → `apiWaitingSequenceCache`
- [x] `fastTotalDuration` → `apiWaitingTotalDuration`
- [x] `slowTotalDuration` → `apiReceivedTotalDuration`
- [x] `fastScrollDistance` → `apiWaitingScrollDistance`
- [x] `slowAnimationDuration` → `apiReceivedAnimationDuration`

### 3. CSS 動畫類名重命名
- [x] `scrollFastDynamic` → `scrollApiWaitingDynamic`
- [x] `scrollSlowStopDynamic` → `scrollApiReceivedStopDynamic`
- [x] `.animate-scroll-fast-dynamic-*` → `.animate-scroll-api-waiting-dynamic-*`
- [x] `.animate-scroll-slow-stop-dynamic` → `.animate-scroll-api-received-stop-dynamic`

### 4. 函數返回值重命名
- [x] `fastDuration` → `apiWaitingDuration`
- [x] `slowDuration` → `apiReceivedDuration`

### 5. 圖片數量升級
- [x] 將預設圖片陣列從 6 張擴展到 22 張
- [x] 更新 slot (1).jpg 到 slot (22).jpg 的完整序列
- [x] 自動適配動畫時間計算

### 6. 動畫邏輯優化
- [x] 修復 `slot_apiWaiting` 模式動畫提前停止問題
- [x] 增加 5 組序列重複確保連續動畫
- [x] 延長動畫時間匹配新序列長度

## 執行狀態
- [x] 確定命名方案
- [x] 修改 SlotMachine.js 核心邏輯
- [x] 更新所有相關變數名稱
- [x] 重命名 CSS 動畫類別
- [x] 升級圖片數量到 22 張
- [x] 驗證動畫流程正常運作

## 語義化效果

### 修改前 (模糊命名)
```javascript
// 容易誤解為動畫速度設定
animationPhase === 'fast'  // 快速？
animationPhase === 'slow'  // 慢速？
fastSequenceCache         // 快速序列？
```

### 修改後 (業務語義)
```javascript
// 清晰表達業務邏輯狀態
animationPhase === 'slot_apiWaiting'   // 老虎機等待API返回
animationPhase === 'slot_apiReceived'  // 老虎機API已接收
apiWaitingSequenceCache               // API等待序列快取
```

## 動畫流程確認

1. **用戶點擊** → `isSpinning=true` → **立即進入 `slot_apiWaiting` 模式**
2. **API 返回餐廳** → 檢測到 `finalRestaurant.image` → **切換到 `slot_apiReceived` 模式**
3. **動畫完成** → 回到 `idle` 狀態 → **顯示最終餐廳結果**

## 技術改善

- **避免誤解**：未來 AI IDE 不會將其理解為性能優化設定
- **提高可讀性**：新開發者能立即理解代碼意圖
- **業務導向**：命名直接反映 Google Places API 的調用狀態
- **擴展性好**：22 張圖片提供更豐富的視覺效果
- **動畫穩定**：修復了等待模式下的動畫中斷問題

## 測試確認

- ✅ 動畫狀態正確切換
- ✅ `slot_apiWaiting` 模式持續動畫
- ✅ `slot_apiReceived` 模式順利過渡到餐廳圖片
- ✅ 所有 console.log 訊息正確顯示新的狀態名稱
- ✅ CSS 動畫類名成功應用

---

**任務完成時間**: 2025-08-10  
**狀態**: ✅ 完成  
**測試環境**: http://127.0.0.1:3001  
**主要檔案**: `components/SlotMachine.js`