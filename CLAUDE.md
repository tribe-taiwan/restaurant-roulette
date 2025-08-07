# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant Roulette (甲崩喔) is a multilingual web application (主要支援繁體中文/English/日本語/한국어/越南語/馬來語) that helps users discover restaurants near their location using Google Places API. The app features a slot machine-style interface for randomly selecting restaurants with real-time location detection and meal time filtering.

## Development Commands

### Static Server Commands  
- `npm run dev` - Start development server on port 3000 using http-server
- `npm start` - Start production server on port 8080 using http-server
- `npm test` - Run Playwright tests

### Current Architecture
The project uses a **pure static web architecture** with modern React via CDN:
- **Static HTML Entry**: `index.html` serves as the main entry point loading all dependencies
- **React Components**: Modular component-based architecture using Babel standalone compilation
- **No Build Process**: Direct browser execution with CDN dependencies

## Architecture & Key Components

### Main Application Structure
- **`app.js`**: 主應用程式 (1079行) 包含完整的 React hooks 狀態管理
- **`components/`**: 模組化 React 組件
  - `LanguageSelector.js` - 多語言選擇器  
  - `SlotMachine.js` - 老虎機動畫和餐廳轉盤
  - `RestaurantCard.js` - 餐廳資訊卡片
  - `LocationManager.js` - 位置管理介面
  - `SearchSettings.js` - 搜尋設定 (時段/半徑)
  - `StatusMessages.js` - 系統狀態訊息
- **`utils/`**: 核心工具函式
  - `locationUtils.js` - Google Places/Geocoding API 整合
  - `commonUtils.js` - 共用工具函式 (星級、導航、價格標籤)
  - `mealTimeConfig.js` - 用餐時段配置
- **`_local/local-api.js`**: 本地 API 服務和 fallback 數據

### Core Features  
- **智能餐廳搜尋**: 根據用餐時段、營業時間、搜尋半徑動態篩選
- **多層定位系統**: GPS 自動定位 + 手動地址輸入 + 儲存位置 (住家/公司)
- **餐廳歷史記錄**: 追蹤用戶瀏覽過的餐廳，支援回到上一家
- **動態搜尋半徑**: 200m-2000m 可調整搜尋範圍
- **營業狀態檢查**: 實時檢查餐廳營業時間和狀態

### State Management (React Hooks)
- 語言選擇 (6種語言支援)
- 用戶位置座標和地址資訊
- 餐廳資料和候選清單
- 搜尋設定 (時段/半徑/營業狀態)
- 位置管理 (已儲存位置/地址校正)
- 動畫和轉場狀態

## Key Features & Business Logic

### Advanced Location Services
- **智能定位流程**: 自動 GPS → 上次已知位置 → 手動地址輸入
- **位置儲存系統**: 住家/公司位置快速切換
- **地址校正功能**: 支援中英文地址輸入和自動完成
- **動態半徑調整**: baseUnit (200m) × unitMultiplier (1-10) = 實際搜尋半徑

### 智能餐廳發現
- **時段過濾**: 早餐 (6-11) / 午餐 (11-15) / 晚餐 (17-22) / 當前營業
- **營業狀態計算**: 即時檢查餐廳營業時間和開店倒數
- **搜尋策略**: Google Places API + 快取機制 + mock data fallback
- **餐廳去重**: 避免重複顯示相同餐廳

### 動畫和 UX 優化
- **智能載入動畫**: 根據資料可用性決定是否顯示老虎機動畫
- **無縫轉場**: 快取資料時立即顯示，API 調用時顯示動畫
- **餐廳歷史**: 支援「回到上一家」功能
- **響應式設計**: 手機優先，支援平板和桌面

## Development Guidelines

### API Integration
- **Google Places API**: 金鑰位於 `utils/locationUtils.js`，支援新版 Places API
- **搜尋半徑**: 動態可調 200m-2000m (baseUnit × unitMultiplier)
- **語言參數**: 所有 API 調用都根據當前語言設定本地化回應
- **速率限制**: 實作適當的 API 調用頻率控制

### Error Handling Standards
- **多層錯誤邊界**: React ErrorBoundary + try-catch + API fallback
- **詳細錯誤記錄**: 包含時間戳、用戶代理、錯誤碼等技術資訊
- **用戶友善訊息**: 6種語言的錯誤提示和建議動作
- **優雅降級**: API 失敗時自動切換到模擬數據

### Component Development
- **命名規則**: PascalCase 組件名稱，camelCase 函式名稱
- **CSS 變數**: 使用 `--primary-color` 等自定義屬性統一主題
- **狀態管理**: 優先使用 React hooks，避免不必要的重渲染
- **國際化**: 所有顯示文字都要透過 translations 物件

### Testing & Debugging
- **測試檔案**: `test/` 目錄包含完整的 API 測試和功能測試
- **Playwright Tests**: 使用 `npm test` 運行自動化測試
- **開發工具**: Browser DevTools 提供詳細的 console 日誌
- **API 測試**: `test-new-places-api.html` 用於新版 Places API 測試

## File Organization
```
restaurant-roulette/
├── 📄 index.html               # 主要入口點，載入所有依賴
├── 📄 app.js                   # 主應用 (1079行 React 應用)
├── 📁 components/              # React 組件模組
│   ├── LanguageSelector.js     # 多語言選擇器
│   ├── SlotMachine.js          # 老虎機動畫組件
│   ├── RestaurantCard.js       # 餐廳資訊展示卡
│   ├── LocationManager.js      # 位置管理介面
│   ├── SearchSettings.js       # 搜尋設定介面
│   └── StatusMessages.js       # 系統狀態訊息
├── 📁 utils/                   # 核心工具函式
│   ├── locationUtils.js        # Google API 整合
│   ├── commonUtils.js          # 共用工具 (星級/導航/價格)
│   └── mealTimeConfig.js       # 用餐時段配置
├── 📁 _local/                  # 本地開發和 API 服務
│   └── local-api.js            # 本地 API 和 fallback 數據
├── 📁 test/                    # 測試檔案
│   ├── test-new-places-api.html # 新版 Places API 測試
│   ├── test-search-strategies.html # 搜尋策略測試
│   └── *.spec.js               # Playwright 自動化測試
├── 📁 trickle/                 # 靜態資源和模擬數據
│   └── assets/                 # JSON 格式的餐廳模擬數據
└── 📁 assets/                  # 圖片和媒體資源
    ├── image/                  # 圖片資源
    └── video/                  # 影片資源
```

## Important Notes & Architecture Decisions

- **回應語言**: 無論用何種語言提問，都用繁體中文回答
- **純靜態架構**: 不使用 Next.js 或建構工具，直接執行 CDN React
- **多語言支援**: 支援 6 種語言 (zh/en/ja/ko/vi/ms)
- **API 依賴**: Google Places API 為主要數據源，有 fallback 機制
- **權限需求**: 需要地理位置權限才能提供完整功能
- **優雅降級**: API 不可用時自動切換到模擬數據
- **效能優化**: 使用 localStorage 快取位置和餐廳數據
- **安全考量**: API 金鑰僅限制特定網域使用

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.