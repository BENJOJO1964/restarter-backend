# 🚀 部署檢查清單

## ✅ 已完成的自動環境切換

### 前端配置 (`src/config/api.ts`)
- [x] 開發環境：自動使用本地後端 (`/api` → `localhost:3001`)
- [x] 生產環境：自動使用雲端後端 (`https://restarter-backend-6e9s.onrender.com/api`)
- [x] WebSocket 自動切換 (`ws://localhost:3001` ↔ `wss://restarter-backend-6e9s.onrender.com`)

### 已修復的硬編碼 URL
- [x] `RegisterPage.tsx` - 使用 `getApiUrl()`
- [x] `ConfirmRegistration.tsx` - 使用 `getApiUrl()`
- [x] `VideoChat.tsx` - 使用 `getWsUrl()`
- [x] `WeatherWidget.tsx` - 使用 `getApiUrl()`
- [x] `WebSocketProvider.tsx` - 使用 `getWsUrl()`

## 🔧 部署前檢查

### 後端部署 (Render)
```bash
# 環境變數設定
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=rbben521@gmail.com
NODE_ENV=production
PORT=3001
```

### 前端部署 (Vercel/Netlify)
```bash
# 不需要額外設定
# 會自動使用生產環境配置
```

## 📋 功能測試清單

### 開發環境測試 (localhost)
- [ ] 前端：`localhost:5173` 正常運行
- [ ] 後端：`localhost:3001` 正常運行
- [ ] 意見箱郵件發送 ✅
- [ ] 註冊驗證碼郵件發送 ✅
- [ ] 註冊流程完整測試 ✅
- [ ] WebSocket 連接正常 ✅

### 生產環境測試 (雲端)
- [ ] 前端部署到雲端
- [ ] 後端部署到雲端
- [ ] 意見箱郵件發送 ✅
- [ ] 註冊驗證碼郵件發送 ✅
- [ ] 註冊流程完整測試 ✅
- [ ] WebSocket 連接正常 ✅
- [ ] 跨域請求正常 ✅

## 🔍 部署後驗證

### 1. 基本功能測試
```bash
# 測試後端健康檢查
curl https://restarter-backend-6e9s.onrender.com/api/health

# 測試郵件發送
curl -X POST https://restarter-backend-6e9s.onrender.com/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"content":"部署測試","userNickname":"測試","userEmail":"test@example.com"}'
```

### 2. 前端功能測試
- [ ] 訪問前端網站
- [ ] 測試註冊流程
- [ ] 測試意見箱功能
- [ ] 測試聊天功能
- [ ] 測試天氣功能

### 3. 郵件功能測試
- [ ] 註冊驗證碼郵件正常發送
- [ ] 意見箱通知郵件正常發送
- [ ] 郵件內容格式正確

## 🚨 常見問題處理

### 1. CORS 錯誤
```javascript
// 後端 CORS 配置
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### 2. WebSocket 連接失敗
- 檢查後端 WebSocket 服務是否正常運行
- 確認 SSL 證書是否有效
- 檢查防火牆設定

### 3. 郵件發送失敗
- 檢查 Resend API Key 是否正確
- 確認環境變數已正確載入
- 檢查 Resend 帳戶狀態和額度

### 4. 環境變數問題
```bash
# 檢查環境變數
echo $RESEND_API_KEY
echo $ADMIN_EMAIL
echo $NODE_ENV
```

## 📊 監控指標

### 後端監控
- [ ] API 響應時間 < 2秒
- [ ] 郵件發送成功率 > 95%
- [ ] WebSocket 連接穩定性
- [ ] 錯誤日誌監控

### 前端監控
- [ ] 頁面載入時間 < 3秒
- [ ] API 請求成功率 > 98%
- [ ] 用戶體驗流暢度
- [ ] 錯誤追蹤

## 🎯 部署成功標準

1. **功能完整性**：所有核心功能正常工作
2. **性能達標**：響應時間在可接受範圍內
3. **穩定性**：無重大錯誤或崩潰
4. **用戶體驗**：界面流暢，操作直觀
5. **安全性**：API 密鑰安全，CORS 配置正確

## 📝 部署記錄

### 開發環境
- 日期：2025年1月
- 狀態：✅ 正常運行
- 測試結果：所有功能正常

### 生產環境
- 日期：待部署
- 狀態：待測試
- 測試結果：待驗證 