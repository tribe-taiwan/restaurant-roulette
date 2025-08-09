# MCP 服務器安裝指南

**撰寫時間**: 2025-08-06  
**適用於**: Claude Code (版本 1.0.69+)  
**目的**: 避免試錯，快速正確配置 MCP 服務器

---

## 🎯 核心原則

### ✅ **正確做法**
```bash
# 1. 全域安裝 MCP 服務器包
npm install -g <mcp-server-package>

# 2. 使用 --scope user 配置（所有項目可用）
claude mcp add --scope user <name> "<全域路徑>"
```

### ❌ **錯誤做法**
```bash
# 錯誤：在項目目錄下安裝（只對單一項目有效）
npm install <mcp-server-package>

# 錯誤：使用默認 local scope（項目特定）
claude mcp add <name> "<項目路徑>"
```

---

## 📦 已測試的 MCP 服務器

### 1. **Context7 MCP** ✅ 正常運行
```bash
# 安裝
npm install -g @upstash/context7-mcp

# 配置
claude mcp add --scope user context7 "C:\Users\<用戶名>\AppData\Roaming\npm\node_modules\@upstash\context7-mcp\dist\index.js"
```
**功能**: 上下文管理和數據檢索  
**API 密鑰**: 不需要  
**狀態**: ✓ 連接正常

---

### 2. **Notion MCP** ⚠️ 需要配置
```bash
# 安裝（可能失敗，需要構建環境）
npm install -g suekou/mcp-notion-server

# 如果成功，配置
claude mcp add --scope user notion "C:\Users\<用戶名>\AppData\Roaming\npm\node_modules\@suekou\mcp-notion-server\dist\index.js"
```
**功能**: Notion 數據庫和頁面操作  
**API 密鑰**: 需要 Notion Integration Token  
**環境變數**: `NOTION_API_KEY=your_token_here`  
**狀態**: 安裝困難（需要 TypeScript 編譯）

---

### 3. **Playwright MCP** ⚠️ 需要初始化
```bash
# 安裝
npm install -g playwright-mcp-server

# 配置
claude mcp add --scope user playwright "C:\Users\<用戶名>\AppData\Roaming\npm\node_modules\playwright-mcp-server\dist\index.js"
```
**功能**: 自動化瀏覽器測試生成  
**API 密鑰**: 不需要  
**狀態**: 安裝成功但連接失敗（可能需要 Playwright 初始化）

---

### 4. **Brave Search MCP** ⚠️ 需要 API 密鑰
```bash
# 安裝
npm install -g brave-search-mcp

# 配置
claude mcp add --scope user brave-search "C:\Users\<用戶名>\AppData\Roaming\npm\node_modules\brave-search-mcp\dist\index.js"
```
**功能**: 網頁搜索、圖片搜索、新聞搜索  
**API 密鑰**: 需要 Brave Search API Key  
**環境變數**: `BRAVE_SEARCH_API_KEY=your_api_key`  
**狀態**: 安裝成功但需要 API 配置

---

### 5. **Claude Context MCP** ⚠️ 複雜配置
```bash
# 安裝（從 GitHub）
npm install -g github:zilliztech/claude-context

# 配置（如果有 dist 文件）
claude mcp add --scope user claude-context "node C:\Users\<用戶名>\AppData\Roaming\npm\node_modules\claude-context\packages\mcp\src\index.ts"
```
**功能**: 代碼索引和語義搜索  
**API 密鑰**: 需要 OpenAI API Key + Milvus 地址  
**環境變數**: `OPENAI_API_KEY=xxx`, `MILVUS_ADDRESS=localhost:19530`  
**狀態**: 需要複雜設置（Milvus 向量數據庫）

---

## 🔧 配置管理

### 檢查狀態
```bash
claude mcp list
```

### 移除服務器
```bash
# 從 Claude Code 配置中移除
claude mcp remove <server-name>

# 從系統中完全卸載
npm uninstall -g <package-name>
```

### 環境變數配置
```bash
# 添加環境變數
claude mcp add --scope user <name> "<path>" -e "KEY=value" -e "KEY2=value2"
```

---

## 📁 重要路徑

### Windows 路徑
- **全域 npm 包位置**: `C:\Users\<用戶名>\AppData\Roaming\npm\node_modules`
- **Claude Code 設定檔**: `C:\Users\<用戶名>\.claude.json`

### 配置範圍說明
- `--scope user`: 所有項目可用（推薦）
- `--scope local`: 僅當前項目可用
- `--scope project`: 項目特定配置

---

## 🔑 常需 API 密鑰的服務器

### Notion MCP
1. 前往 [Notion Developers](https://developers.notion.com/)
2. 創建新的 Integration
3. 複製 Internal Integration Token
4. 配置環境變數: `NOTION_API_KEY=secret_xxx`

### Brave Search MCP  
1. 前往 [Brave Search API](https://brave.com/search/api/)
2. 註冊並獲取 API Key
3. 配置環境變數: `BRAVE_SEARCH_API_KEY=your_key`

### Claude Context MCP
1. 獲取 OpenAI API Key
2. 設置 Milvus 向量數據庫
3. 配置: `OPENAI_API_KEY=xxx`, `MILVUS_ADDRESS=localhost:19530`

---

## 🚨 常見錯誤

### 1. 權限錯誤
**症狀**: `EPERM: operation not permitted`  
**解決**: 以管理員身份運行 Command Prompt/PowerShell

### 2. 構建失敗
**症狀**: `'tsc' 不是內部或外部命令`  
**解決**: 全域安裝 TypeScript: `npm install -g typescript`

### 3. 連接失敗
**症狀**: `✗ Failed to connect`  
**原因**: 缺少 API 密鑰或環境變數  
**解決**: 檢查對應服務器的 README 文檔

---

## 📝 驗證清單

安裝完成後，確認：
- [ ] `claude mcp list` 顯示服務器狀態
- [ ] 至少一個服務器狀態為 `✓ Connected`
- [ ] 在其他項目目錄執行 `claude mcp list` 看到相同列表
- [ ] 重新開啟 Claude Code 會話，MCP 工具仍然可用

---

## 💡 最佳實踐

1. **優先安裝無需 API 密鑰的服務器**（如 Context7）
2. **分批配置**，避免一次安裝太多導致問題難以排查
3. **保存 API 密鑰**到安全的密碼管理器
4. **定期更新**服務器包: `npm update -g <package-name>`
5. **測試後再依賴**，確保功能符合預期

---

**最後更新**: 2025-08-06  
**測試環境**: Windows 11, Node.js v20+, Claude Code 1.0.69