# Restarter 部署指南

## 部署到 Render

### 1. 準備工作
- 確保您有 Render 帳戶
- 將代碼推送到 GitHub 倉庫

### 2. 在 Render 上創建服務

#### 前端服務 (Static Site)
1. 登入 Render Dashboard
2. 點擊 "New +" → "Static Site"
3. 連接您的 GitHub 倉庫
4. 配置設置：
   - **Name**: `restarter-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**: 不需要額外設置

#### 後端服務 (Web Service)
1. 點擊 "New +" → "Web Service"
2. 連接同一個 GitHub 倉庫
3. 配置設置：
   - **Name**: `restarter-backend`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node -r dotenv/config server.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `3001`
     - 添加所有必要的 API 密鑰（OpenAI, PlayAI 等）

### 3. 配置環境變量
在後端服務中添加以下環境變量：
```
OPENAI_API_KEY=your_openai_key
PLAYAI_API_KEY=your_playai_key
PLAYAI_USER_ID=your_playai_user_id
PLAYAI_APP_VERSION_ID=your_playai_app_version_id
DID_API_KEY=your_did_key
```

### 4. 配置路由
在 Render Dashboard 中為前端服務配置路由：
- 將所有 `/api/*` 請求重定向到後端服務
- 將所有其他請求重定向到 `index.html`（用於 SPA 路由）

## 測試電腦版和手機版

### 部署完成後，您可以：

1. **電腦版測試**：
   - 在電腦瀏覽器中訪問 `https://restarter-frontend.onrender.com`
   - 測試所有功能，包括聊天室、交友區等

2. **手機版測試**：
   - 在手機瀏覽器中訪問相同的 URL
   - 測試響應式設計和觸控功能
   - 測試語音錄製功能（需要 HTTPS）

3. **同時測試**：
   - 可以在電腦和手機上同時打開網站
   - 測試不同設備的用戶體驗
   - 驗證所有功能在不同螢幕尺寸下的表現

### 測試重點：
- ✅ 響應式設計
- ✅ 觸控操作
- ✅ 語音功能
- ✅ 聊天室功能
- ✅ 交友區功能
- ✅ 測試模式功能
- ✅ 多語言支持

## 注意事項

1. **HTTPS**: Render 自動提供 HTTPS，確保語音功能正常工作
2. **環境變量**: 確保所有 API 密鑰都正確配置
3. **CORS**: 後端需要配置正確的 CORS 設置
4. **冷啟動**: 免費計劃有冷啟動延遲，付費計劃響應更快

## 故障排除

如果遇到問題：
1. 檢查 Render 日誌
2. 確認環境變量設置
3. 檢查 API 端點是否正確
4. 驗證 CORS 配置 