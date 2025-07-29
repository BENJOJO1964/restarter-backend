# Restarter Email 驗證功能完整說明

## 功能概述
Restarter 專案現在具備完整的 email 驗證功能，確保用戶註冊時填寫的是真實的 email 地址。只有驗證成功的用戶才能進入 Restarter 首頁。

## 完整驗證流程

### 1. 用戶註冊階段
- 用戶在註冊頁面填寫個人資料（包含 email）
- 系統驗證資料格式正確性
- 點擊註冊按鈕

### 2. Email 驗證郵件發送
- 系統生成唯一的驗證 token
- 發送包含驗證連結的郵件到用戶 email
- 在註冊頁面顯示「驗證郵件已發送」的成功訊息
- 用戶需要檢查 email 收件匣

### 3. Email 驗證確認
- 用戶點擊郵件中的「✅ 確認 Email 地址」按鈕
- 系統驗證 token 的有效性
- 自動完成註冊流程（創建 Firebase 用戶、上傳頭像、寫入資料庫）
- 顯示註冊成功訊息並自動跳轉到首頁

### 4. 首頁訪問控制
- 只有驗證成功的用戶才能訪問 `/home` 首頁
- 未驗證的用戶會被重定向到註冊頁面
- 所有功能頁面都有用戶登入狀態保護

## 技術實現

### 後端 API
- **POST /api/email-verification/send-confirmation**
  - 接收註冊資料和 email
  - 生成驗證 token
  - 發送驗證郵件
  - 儲存待確認的註冊資料

- **POST /api/email-verification/confirm-registration**
  - 接收驗證 token
  - 驗證 token 有效性
  - 完成註冊流程
  - 返回註冊資料

### 前端頁面
- **註冊頁面** (`/register`)
  - 收集用戶資料
  - 發送驗證郵件
  - 顯示驗證郵件已發送訊息

- **確認註冊頁面** (`/confirm-registration`)
  - 接收驗證 token
  - 完成註冊流程
  - 自動跳轉到首頁

### 安全特性
- **Token 過期機制**：驗證連結 15 分鐘後自動過期
- **一次性使用**：每個 token 只能使用一次
- **防重複註冊**：同一 email 的待確認註冊會被覆蓋
- **路由保護**：未驗證用戶無法訪問功能頁面

## 需要的 API KEY 設定

### Gmail SMTP 設定
在後端目錄建立 `.env` 檔案：

```env
# Email 驗證功能設定
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password

# 前端網址（用於驗證連結）
FRONTEND_URL=https://your-domain.com

# 其他現有的 API KEY
OPENAI_API_KEY=your-openai-api-key
PLAYAI_API_KEY=your-playai-api-key
PLAYAI_USERID=your-playai-userid
PLAY_APP_VERSION_ID=your-play-app-version-id
D_ID_KEY=your-d-id-key
```

### Gmail 設定步驟
1. 啟用 Gmail 兩步驟驗證
2. 生成應用程式密碼
3. 設定環境變數

## 測試流程

### 本地測試
```bash
cd restarter-voice-mvp/backend
TEST_MODE=true node -r dotenv/config server.js
```

### 測試步驟
1. 訪問註冊頁面
2. 填寫註冊資料（包含真實 email）
3. 點擊註冊按鈕
4. 檢查 email 收件匣
5. 點擊驗證連結
6. 確認自動跳轉到首頁

## 故障排除

### 常見問題
1. **Email 發送失敗**
   - 檢查 EMAIL_USER 和 EMAIL_PASS 設定
   - 確認 Gmail 兩步驟驗證已啟用
   - 檢查應用程式密碼是否正確

2. **驗證連結無效**
   - 確認 FRONTEND_URL 設定正確
   - 檢查 token 是否已過期
   - 確認前端路由設定正確

3. **郵件進入垃圾郵件匣**
   - 建議用戶將發送郵件地址加入聯絡人
   - 檢查 Gmail 的垃圾郵件設定

## 注意事項
- 請確保使用真實的 Gmail 帳戶作為 EMAIL_USER
- EMAIL_PASS 必須是應用程式密碼，不是一般登入密碼
- 建議在生產環境中使用專業的 email 服務
- 定期檢查 email 發送狀態和錯誤日誌

## 完成狀態
✅ 後端 email 驗證 API 已實現
✅ 前端註冊頁面已整合 email 驗證
✅ 前端確認註冊頁面已實現
✅ 路由保護已設定
✅ 錯誤處理已完善
✅ 安全機制已實現

現在 Restarter 專案具備完整的 email 驗證功能，確保只有真實 email 的用戶才能完成註冊並進入首頁。 