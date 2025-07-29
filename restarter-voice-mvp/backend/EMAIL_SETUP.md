# Email 驗證功能設定指南

## 概述
Restarter 專案現在支援 email 驗證功能，確保用戶註冊時填寫的是真實的 email 地址。只有驗證成功的用戶才能完成註冊並進入首頁。

## 需要的 API KEY

### 支援多種 Email 服務
Restarter 現在支援多種 email 服務，包括 Gmail、Outlook、Yahoo、QQ、163 等。您可以選擇以下任一方式設定：

### 方式 1：Gmail SMTP 設定

#### 步驟 1：啟用 Gmail 兩步驟驗證
1. 登入您的 Gmail 帳戶
2. 前往「安全性」設定
3. 啟用「兩步驟驗證」

#### 步驟 2：生成應用程式密碼
1. 在 Gmail 安全性設定中，點擊「應用程式密碼」
2. 選擇「郵件」和您的裝置
3. 生成 16 位元的應用程式密碼

#### 步驟 3：設定環境變數
```env
# Gmail 設定
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

### 方式 2：其他 Email 服務設定

#### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### QQ Mail
```env
EMAIL_SERVICE=qq
EMAIL_USER=your-email@qq.com
EMAIL_PASS=your-authorization-code
```

#### 163 Mail
```env
EMAIL_SERVICE=163
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-authorization-code
```

### 方式 3：自定義 SMTP 設定
如果您有自己的 SMTP 伺服器或使用第三方 email 服務：

```env
# 自定義 SMTP 設定
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@your-domain.com
SMTP_PASS=your-password
```

### 通用設定
無論使用哪種方式，都需要設定前端網址：

```env
# 前端網址（用於驗證連結）
FRONTEND_URL=https://your-domain.com
```

## 驗證流程

### 1. 用戶註冊
- 用戶填寫註冊資料（包含 email）
- 系統發送驗證郵件到用戶的 email

### 2. Email 驗證
- 用戶點擊郵件中的驗證連結
- 系統驗證 token 並完成註冊

### 3. 註冊完成
- 驗證成功後，用戶可以進入 Restarter 首頁
- 未驗證的用戶無法進入首頁

## 安全特性

- **Token 過期**：驗證連結 15 分鐘後自動過期
- **一次性使用**：每個 token 只能使用一次
- **Email 格式驗證**：確保 email 格式正確
- **防重複註冊**：同一 email 的待確認註冊會被覆蓋

## 故障排除

### 常見問題

1. **Email 發送失敗**
   - 檢查 EMAIL_USER 和 EMAIL_PASS 是否正確
   - 確認 Gmail 兩步驟驗證已啟用
   - 檢查應用程式密碼是否正確

2. **驗證連結無效**
   - 確認 FRONTEND_URL 設定正確
   - 檢查 token 是否已過期
   - 確認前端路由設定正確

3. **郵件進入垃圾郵件匣**
   - 建議用戶將 noreply@restarter.com 加入聯絡人
   - 檢查 Gmail 的垃圾郵件設定

## 測試

### 本地測試
```bash
cd restarter-voice-mvp/backend
TEST_MODE=true node -r dotenv/config server.js
```

### 測試註冊流程
1. 使用測試 email 註冊
2. 檢查是否收到驗證郵件
3. 點擊驗證連結
4. 確認註冊完成

## 注意事項

- 請確保 EMAIL_USER 使用真實的 Gmail 帳戶
- EMAIL_PASS 必須是應用程式密碼，不是一般登入密碼
- 建議在生產環境中使用專業的 email 服務（如 SendGrid、Mailgun）
- 定期檢查 email 發送狀態和錯誤日誌 