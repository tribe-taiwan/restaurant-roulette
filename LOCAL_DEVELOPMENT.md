# 本地開發設置

## API 金鑰配置

由於安全考量，API 金鑰不會提交到 Git 倉庫。請按照以下步驟設置本地開發環境：

### 1. 獲取新的 Google Places API 金鑰

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建或選擇專案
3. 啟用 Google Places API 和 Maps JavaScript API
4. 創建 API 金鑰
5. 設置 API 金鑰限制（可選但建議）

### 2. 配置本地開發

**方法 A：直接修改文件（僅限本地開發）**

1. 打開 `utils/locationUtils.js`
2. 將第 3 行的 `%%GOOGLE_PLACES_API_KEY%%` 替換為你的實際 API 金鑰
3. **重要：不要提交這個修改到 Git！**

**方法 B：使用腳本替換（推薦）**

1. 創建本地配置文件：
   ```bash
   echo "YOUR_ACTUAL_API_KEY" > .api_key
   ```

2. 使用替換腳本：
   ```bash
   # Windows
   powershell -Command "(Get-Content utils/locationUtils.js) -replace '%%GOOGLE_PLACES_API_KEY%%', (Get-Content .api_key) | Set-Content utils/locationUtils.js"
   
   # macOS/Linux
   sed -i.bak "s/%%GOOGLE_PLACES_API_KEY%%/$(cat .api_key)/g" utils/locationUtils.js
   ```

### 3. 驗證配置

1. 在瀏覽器中打開 `index.html`
2. 檢查開發者工具 Console
3. 確認沒有 API 金鑰相關錯誤

## 生產部署

生產環境使用 GitHub Actions 自動替換 API 金鑰：

1. 在 GitHub 倉庫設置中添加 Secret：
   - 名稱：`GOOGLE_PLACES_API_KEY`
   - 值：你的生產環境 API 金鑰

2. 推送到 main 分支時會自動部署到 Firebase

## 安全提醒

- ✅ API 金鑰在代碼中使用佔位符 `%%GOOGLE_PLACES_API_KEY%%`
- ✅ `.api_key` 文件已在 `.gitignore` 中
- ✅ 生產部署時自動替換 API 金鑰
- ❌ 永遠不要將真實 API 金鑰提交到 Git