# 主題資源目錄

這個目錄包含不同主題的圖片資源。每個主題都有自己的子目錄。

## 目錄結構

```
assets/themes/
├── oceanview/          # 海景民宿主題
│   ├── banner.jpg      # 主要背景圖片
│   ├── logo.png        # 民宿 logo
│   └── favicon.ico     # 網站圖標
├── mountain/           # 山景民宿主題
│   ├── banner.jpg
│   ├── logo.png
│   └── favicon.ico
└── README.md           # 說明文件

```

## 圖片規格建議

### banner.jpg (主要背景圖片)
- 尺寸：1920x1080 或更高
- 格式：JPG
- 檔案大小：< 500KB
- 內容：民宿外觀或當地風景

### logo.png (民宿 logo)
- 尺寸：200x200 或更高
- 格式：PNG (支援透明背景)
- 檔案大小：< 100KB
- 內容：民宿 logo 或 Booking.com logo

### favicon.ico (網站圖標)
- 尺寸：32x32, 16x16
- 格式：ICO
- 檔案大小：< 10KB

## 新增主題步驟

1. 在 `assets/themes/` 下創建新的主題目錄
2. 準備對應的圖片資源
3. 在 `config/themes.js` 中新增主題配置
4. 更新圖片路徑指向新的主題目錄

## 注意事項

- 所有圖片都應該經過壓縮優化
- 建議使用 WebP 格式以獲得更好的壓縮率
- 確保圖片版權清楚，避免使用有版權爭議的圖片
