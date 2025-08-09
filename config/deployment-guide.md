# 多主題餐廳輪盤部署指南

## 🎯 商業模式

這套系統可以賣給不同的民宿，每家民宿都能有自己的品牌特色：

1. **統一核心功能**：餐廳搜尋、輪盤動畫、多語言支援
2. **客製化外觀**：配色、logo、背景圖片、社交媒體連結
3. **在地化設定**：民宿位置、導航功能、聯絡資訊

## 🚀 快速部署新民宿

### 步驟 1：準備主題資源

```bash
# 創建新主題目錄
mkdir assets/themes/your-bnb-name

# 準備圖片資源
# - banner.jpg (1920x1080, <500KB)
# - logo.png (200x200, <100KB) 
# - favicon.ico (32x32, <10KB)
```

### 步驟 2：配置主題設定

在 `config/themes.js` 中新增主題：

```javascript
yourBnbName: {
  brand: {
    name: "您的餐廳輪盤名稱",
    subtitle: "地區美食輪盤", 
    businessName: "您的民宿名稱",
    slogan: "您的標語",
    description: "SEO 描述"
  },
  
  homeBase: {
    name: "您的民宿名稱",
    address: "完整地址",
    lat: 緯度座標,
    lng: 經度座標,
    phone: "聯絡電話",
    bookingUrl: "Booking.com 連結"
  },
  
  colors: {
    primary: "#您的主色",
    secondary: "#您的次色", 
    // ... 其他顏色
  },
  
  images: {
    banner: "./assets/themes/your-bnb-name/banner.jpg",
    logo: "./assets/themes/your-bnb-name/logo.png",
    favicon: "./assets/themes/your-bnb-name/favicon.ico"
  },
  
  socialMedia: {
    booking: { url: "Booking.com 連結", title: "預訂標題" },
    instagram: { url: "Instagram 連結", title: "IG 標題" },
    facebook: { url: "Facebook 連結", title: "FB 標題" }
  },
  
  seo: {
    title: "完整頁面標題",
    description: "SEO 描述",
    keywords: "關鍵字, 用逗號分隔",
    ogImage: "https://your-domain.com/banner.jpg",
    ogUrl: "https://your-domain.com/"
  }
}
```

### 步驟 3：設定預設主題

在 `config/themes.js` 中更新：

```javascript
window.DEFAULT_THEME = 'yourBnbName';
```

### 步驟 4：部署到網站

1. 上傳所有檔案到網站主機
2. 確保 Google Places API Key 已設定
3. 測試所有功能是否正常

## 🎨 主題切換方式

### 方式 1：URL 參數 (推薦)
```
https://your-domain.com/?theme=oceanview
https://your-domain.com/?theme=mountain
```

### 方式 2：修改預設主題
修改 `config/themes.js` 中的 `window.DEFAULT_THEME`

### 方式 3：使用主題選擇器 (開發用)
在 app.js 中加入 ThemeSelector 組件

## 🏠 民宿導航功能

系統自動提供：

1. **民宿起點按鈕**：將民宿設為搜尋起點
2. **回民宿按鈕**：開啟 Google Maps 導航到民宿
3. **自動設定家位置**：可將民宿設為預設"家"位置

## 📱 客戶使用流程

1. 客戶訪問民宿專屬網址
2. 自動載入民宿主題（配色、logo、資訊）
3. 使用民宿位置作為搜尋中心
4. 找到餐廳後可一鍵導航回民宿

## 🔧 技術支援

### 常見問題

**Q: 如何更換主題配色？**
A: 修改 `config/themes.js` 中對應主題的 `colors` 設定

**Q: 如何更新民宿位置？**
A: 修改主題配置中的 `homeBase` 座標和地址

**Q: 如何新增社交媒體連結？**
A: 在主題配置的 `socialMedia` 中新增或修改連結

### 維護建議

- 定期檢查 Google Places API 配額
- 監控網站載入速度
- 定期更新主題圖片
- 備份主題配置檔案

## 💰 商業授權

每個民宿主題都是獨立的配置，可以：

1. 單獨銷售給不同民宿
2. 提供客製化服務
3. 收取年度維護費用
4. 提供技術支援服務

## 📞 聯絡資訊

如需技術支援或客製化服務，請聯絡開發團隊。
