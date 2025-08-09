# 📁 檔案結構重組計劃

## 🎯 目標
- 提升調用鏈的可讀性和可追蹤性
- 按功能模塊重新組織代碼
- 漸進式重構，每階段Git提交測試
- 保持系統穩定性，避免UI文字消失

## 📊 當前結構分析 (696行app.js + 各組件)

### 現有問題：
1. **app.js過大** (696行) - 翻譯、業務邏輯、UI混雜
2. **調用關係不清** - 全域函數分散在不同檔案
3. **功能耦合度高** - 狀態管理和業務邏輯混合
4. **難以追蹤流程** - 缺乏清晰的模塊界限

## 🏗️ 目標結構設計

```
restaurant-roulette/
├── 📄 index.html                 # 靜態入口點
├── 📄 app.js                     # 精簡主應用 (React狀態 + UI)
├── 📁 config/                    # 配置和常量
│   ├── translations.js           # 多語言翻譯
│   └── constants.js              # 應用常量
├── 📁 services/                  # 業務邏輯服務層
│   ├── locationService.js        # 位置相關業務邏輯
│   ├── restaurantService.js      # 餐廳搜索業務邏輯
│   └── storageService.js         # 本地存儲業務邏輯
├── 📁 utils/                     # 純工具函數
│   ├── appUtils.js               # 應用工具函數
│   ├── locationUtils.js          # 位置工具 (已存在)
│   └── mockData.js               # 模擬數據 (已存在)
├── 📁 components/                # React組件 (已存在)
├── 📁 hooks/                     # React Hooks
└── 📁 docs/                      # 文檔和調用鏈圖
    ├── CALL_CHAIN.md             # 調用鏈文檔
    └── ARCHITECTURE.md           # 架構說明
```

## 🔄 調用鏈設計原則

### 清晰的層級結構：
```
UI Layer (app.js + components/)
    ↓
Service Layer (services/)
    ↓
Utils Layer (utils/)
    ↓
External APIs (Google Maps, Places)
```

### 數據流向：
```
User Action → Component → Service → Utils → API → Utils → Service → Component → UI Update
```

## 📅 漸進式實施階段

### 🚀 階段1: 基礎檔案創建和載入 (低風險)
**目標：** 建立新的檔案結構和載入順序
**風險：** 低 - 只新增檔案，不修改現有邏輯

1. 創建新目錄結構
2. 在index.html中添加新檔案的載入
3. 確保載入順序正確
4. **Git提交 + 測試UI正常**

### 🔄 階段2: 翻譯對象提取 (極低風險)  
先不實施，因為之前結果造成UI中文字缺失，就是因為統一翻譯系統 utils/translations.js 存在載入時序問題，害我連續修復10次失敗回滾。
~~**目標：** 將193行翻譯移到config/translations.js
**風險：** 極低 - 純數據移動

1. 提取translations對象到獨立檔案
2. 在app.js中使用window.translations
3. **Git提交 + 測試多語言切換正常**~~

### 🛠️ 階段3: 工具函數提取 (中等風險)
**目標：** 將純函數移到utils/appUtils.js
**風險：** 中等 - 函數移動需確保調用正確

1. 提取saveLocationToStorage等純函數
2. 修改app.js調用方式為window.AppUtils.xxx
3. **Git提交 + 測試位置儲存功能正常**

### 🏢 階段4: 業務邏輯服務化 (高風險)
**目標：** 創建service層封裝業務邏輯
**風險：** 高 - 涉及複雜業務邏輯重構

1. 創建LocationService封裝位置相關邏輯
2. 創建RestaurantService封裝餐廳搜索邏輯  
3. 創建StorageService封裝存儲邏輯
4. **每個Service分別Git提交 + 功能測試**

### 📋 階段5: 文檔和最終優化 (無風險)
**目標：** 完善文檔和調用鏈圖
**風險：** 無 - 純文檔工作

1. 創建詳細的調用鏈文檔
2. 繪製模塊依賴圖
3. 更新架構說明
4. **最終Git提交**

## 🛡️ 安全措施

### 每階段必須檢查：
- ✅ UI文字正常顯示
- ✅ 語言切換功能正常
- ✅ 位置獲取功能正常  
- ✅ 餐廳搜索功能正常
- ✅ 無控制台錯誤

### 回滾策略：
如任何階段出現問題，立即回滾到上一個穩定提交

### 載入順序原則：
**絕對不改變現有檔案的載入順序，只在適當位置添加新檔案**

## ⚠️ 重要錯誤教訓 (來自2025/08/02實作經驗)

### 🚨 關鍵失敗案例：

#### 1. **空檔案載入問題 (致命錯誤)**
**問題：** 在 index.html 中載入了只有佔位符內容的檔案
```html
<!-- 這會導致 JavaScript 錯誤 -->
<script src="services/locationService.js"></script>  <!-- 只有 TODO 和空函數 -->
<script src="hooks/useLocationManager.js"></script>  <!-- 只有 console.warn -->
```

**後果：** 
- 定位功能完全失效
- 出現 "t is not a function" 錯誤
- 需要緊急回滾和修復

**教訓：** 
- ✅ **永遠不要載入空的或不完整的檔案**
- ✅ **檔案必須有完整的實作才能加入 index.html**
- ✅ **佔位符檔案應該留在本地，不要提交**

#### 2. **翻譯系統統一化失敗 (重複錯誤)**
**問題：** 嘗試將翻譯對象提取到 utils/translations.js
**後果：** 載入時序問題導致 UI 文字消失，連續10次回滾失敗
**狀態：** 已在階段2標記為不實施

#### 3. **useEffect 依賴修改風險 (中等風險)**
**問題：** 修改 useEffect 依賴陣列容易造成無限循環
**教訓：** 保守策略，避免大幅修改 React 狀態管理

### ✅ 成功的安全實作範例：

#### 1. **純函數提取 (成功案例)**
- 提取 saveLocationToStorage, getSimplifiedAddress 等純函數到 app.js 內部
- 避免建立 utils/appUtils.js 檔案，減少載入複雜性
- 結果：成功減少代碼行數，無副作用

#### 2. **最小化修復策略 (推薦方法)**
- 只修改絕對必要的內容
- 一次只改一個問題
- 立即測試，有問題立即回滾

### 🔧 修正後的實施建議：

#### 階段1: 檔案創建 (修正版)
❌ **錯誤方式：** 創建空的 services/, hooks/ 檔案並載入
✅ **正確方式：** 只創建目錄結構，不在 index.html 中載入未完成的檔案

#### 階段3: 工具函數提取 (修正版)  
❌ **錯誤方式：** 創建 utils/appUtils.js 並修改 window 對象
✅ **正確方式：** 直接在 app.js 內部重組函數，避免跨檔案依賴

#### 階段4: 業務邏輯服務化 (風險警告)
⚠️ **高風險操作，需要極度謹慎**
- 只有在完全理解業務邏輯後才實施
- 必須保持現有的 React 狀態管理不變
- 建議延後實施或完全跳過

---
*本計劃確保重構過程安全可控，每階段都有明確的成功標準*
