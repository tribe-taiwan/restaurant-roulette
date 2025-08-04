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

**⚠️ 重要：以下方法僅供本地開發測試，請勿提交修改到 Git！**

**方法 A：臨時修改檔案（最簡單）**

1. 打開 `utils/locationUtils.js`
2. 找到第 14 行：`API_KEY: '%%GOOGLE_PLACES_API_KEY%%',`
3. 臨時替換為：`API_KEY: '你的真實API金鑰',`
4. 儲存檔案並重新整理瀏覽器
5. **測試完成後立即還原！**

**方法 B：使用 .env.local 檔案（推薦）**

1. 複製範例檔案：
   ```bash
   cp .env.local.example .env.local
   ```

2. 編輯 `.env.local` 檔案：
   ```
   GOOGLE_PLACES_API_KEY=你的真實API金鑰
   ```

3. 重新啟動開發伺服器：
   ```bash
   npm run dev
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
