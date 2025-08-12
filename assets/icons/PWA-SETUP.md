# 🍽️ 甲崩喔 PWA 設置指南

## 📱 PWA 功能特色

✅ **離線瀏覽** - Service Worker 快取核心檔案  
✅ **可安裝** - 支援「加到主畫面」功能  
✅ **原生體驗** - 全螢幕顯示，無瀏覽器UI  
✅ **快速啟動** - 預載入關鍵資源  
✅ **跨平台** - iOS Safari、Android Chrome、桌面瀏覽器  
✅ **快捷操作** - PWA快捷選單支援  

## 🛠️ 已完成的設定

### 1. 核心檔案 ✅
- `manifest.json` - PWA應用配置
- `sw.js` - Service Worker檔案  
- `index.html` - 已加入PWA相關標籤

### 2. PWA 元標籤 ✅
- iOS Safari 支援標籤
- Android Chrome 支援標籤  
- Windows 磚片支援標籤
- 主題色彩配置

### 3. Service Worker 功能 ✅
- 靜態資源快取 (Cache First策略)
- 動態內容快取 (Network First策略)
- 離線fallback機制
- 快取大小管理
- 自動更新機制

## 📋 需要完成的步驟

### 🎨 第1步：生成PWA圖標
1. 在瀏覽器中打開 `generate-icons.html`
2. 點擊「生成所有圖標」按鈕
3. 逐一下載所有尺寸的圖標
4. 將下載的PNG檔案放入 `assets/icons/` 目錄

**需要的圖標尺寸：**
```
assets/icons/
├── icon-16x16.png      # Favicon
├── icon-32x32.png      # Favicon
├── icon-72x72.png      # Android
├── icon-96x96.png      # Android
├── icon-128x128.png    # Android
├── icon-144x144.png    # Windows
├── icon-152x152.png    # iOS
├── icon-180x180.png    # iOS
├── icon-192x192.png    # Android (推薦)
├── icon-384x384.png    # Android
├── icon-512x512.png    # Android (推薦)
├── icon-310x150.png    # Windows Wide
├── icon-310x310.png    # Windows Large
└── apple-touch-icon.png # iOS通用 ✅
```

### 📸 第2步：創建啟動畫面 (可選)
為iOS用戶創建各種螢幕尺寸的啟動畫面：
```
assets/splash/
├── apple-splash-2048-2732.png    # iPad Pro 12.9"
├── apple-splash-1668-2388.png    # iPad Pro 11"
├── apple-splash-1536-2048.png    # iPad 9.7"
├── apple-splash-1290-2796.png    # iPhone 14 Pro Max
├── apple-splash-1179-2556.png    # iPhone 14 Pro
├── apple-splash-1284-2778.png    # iPhone 14 Plus
├── apple-splash-1170-2532.png    # iPhone 14
├── apple-splash-1125-2436.png    # iPhone X/11 Pro
├── apple-splash-1242-2688.png    # iPhone 11 Pro Max
├── apple-splash-828-1792.png     # iPhone 11
├── apple-splash-1242-2208.png    # iPhone 8 Plus
├── apple-splash-750-1334.png     # iPhone 8
└── apple-splash-640-1136.png     # iPhone 5
```

## 📱 安裝測試

### iOS Safari 測試：
1. 用iPhone打開網站
2. 點擊分享按鈕 📤
3. 選擇「加入主畫面」
4. 確認圖標和名稱正確顯示

### Android Chrome 測試：
1. 用Android打開網站  
2. 瀏覽器會自動顯示「安裝」提示
3. 或透過選單 → 「安裝應用程式」

### 桌面瀏覽器測試：
1. Chrome: 網址列會顯示安裝圖標 ⊕
2. Edge: 設定選單 → 應用程式 → 安裝此網站

## 🔧 進階設定

### PWA 快捷操作
已設定兩個快捷操作：
- **隨機美食** (`/?action=spin`) - 直接開始輪盤
- **候選清單** (`/?action=candidates`) - 跳到候選清單

### 離線功能
- 核心應用檔案完全快取
- Google Places API回應快取
- 餐廳圖片快取
- 離線時自動使用快取資料

### 效能優化
- 靜態資源預快取
- 動態內容智能快取
- 快取大小限制（100項）
- 定期清理過期快取

## 🐛 疑難排解

### PWA無法安裝？
1. 確認HTTPS連線（localhost除外）
2. 檢查manifest.json是否正確載入
3. 確認Service Worker註冊成功
4. 檢查所有必需的圖標是否存在

### iOS圖標不正確？
1. 確認apple-touch-icon.png存在
2. 檢查icon-180x180.png（最重要）
3. 圖片必須是PNG格式，不能是SVG

### Service Worker無法載入？
1. 檢查sw.js檔案路徑
2. 確認檔案沒有語法錯誤
3. 檢查瀏覽器開發者工具的錯誤訊息

## 📊 PWA 檢測工具

1. **Chrome DevTools:**
   - F12 → Application → Manifest
   - F12 → Application → Service Workers

2. **Lighthouse PWA 審計:**
   - F12 → Lighthouse → Progressive Web App

3. **線上工具:**
   - [PWA Builder](https://www.pwabuilder.com/)
   - [Manifest Validator](https://manifest-validator.appspot.com/)

## 🎯 預期效果

✅ **iOS用戶：**
- 主畫面圖標：自訂logo
- 啟動無瀏覽器UI
- 狀態列與app融合

✅ **Android用戶：**  
- 自動安裝提示
- 主畫面圖標
- 全螢幕體驗
- 快捷操作選單

✅ **所有用戶：**
- 更快的載入速度
- 基本離線功能
- 原生app般的體驗

完成圖標生成後，你的PWA就完全準備就緒了！🚀