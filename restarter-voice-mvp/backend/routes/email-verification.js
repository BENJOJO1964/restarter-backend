const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// 待確認的註冊資料存儲（實際應用中應使用 Redis 或數據庫）
const pendingRegistrations = new Map();

// 創建郵件傳輸器 - 專業設定
const createTransporter = () => {
  // 如果設定了自定義 SMTP 設定，使用自定義設定
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // 預設使用 Gmail 專業設定
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'noreply.restarter@gmail.com',
      pass: process.env.EMAIL_PASS
    }
  });
};

const transporter = createTransporter();

// 發送驗證碼
router.post('/send-code', async (req, res) => {
  try {
    const { email, registrationData } = req.body;
    
    if (!email || !registrationData) {
      return res.status(400).json({ error: '請提供 email 和註冊資料' });
    }

    // 檢查是否已有待確認的註冊
    const existingToken = Array.from(pendingRegistrations.entries())
      .find(([token, data]) => data.email === email);
    
    if (existingToken) {
      pendingRegistrations.delete(existingToken[0]);
    }

    // 生成 6 位數驗證碼
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 設定過期時間（5分鐘）
    const expiresAt = Date.now() + (5 * 60 * 1000);
    
    // 儲存待確認的註冊資料
    pendingRegistrations.set(verificationCode, {
      email,
      registrationData,
      expiresAt
    });

    // 檢查 email 服務是否已設定
    const hasEmailConfig = (
      (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) ||
      (process.env.EMAIL_USER && process.env.EMAIL_PASS)
    );
    
    if (!hasEmailConfig) {
      return res.status(500).json({ 
        error: 'Email 服務未設定，請聯繫管理員',
        success: false 
      });
    }

    // 發送驗證碼郵件
    const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply.restarter@gmail.com';
    const mailOptions = {
      from: `Restarter <${fromEmail}>`,
      to: email,
      subject: '🔐 Restarter 驗證碼 - 請輸入 6 位數驗證碼',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Restarter</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">您的個人成長夥伴</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">📧 您的驗證碼</h2>
            <p style="color: #666; line-height: 1.6;">
              感謝您註冊 Restarter！為了確保您的帳戶安全，請輸入以下 6 位數驗證碼：
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${verificationCode}</span>
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              ⏰ 此驗證碼將在 5 分鐘後過期<br/>
              🔒 如果您沒有註冊 Restarter，請忽略此郵件<br/>
              📱 請在註冊頁面輸入此驗證碼完成註冊
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 Restarter. 讓每個人都能重新開始。</p>
            <p>此郵件由 noreply.restarter@gmail.com 發送</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: '驗證碼已發送到您的 email，請檢查收件匣',
      email
    });

  } catch (error) {
    console.error('發送驗證碼錯誤:', error);
    res.status(500).json({ 
      error: '發送驗證碼失敗，請稍後再試',
      success: false
    });
  }
});

// 驗證碼確認
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: '請提供 email 和驗證碼' });
    }

    // 清理過期的驗證碼
    for (const [token, data] of pendingRegistrations.entries()) {
      if (Date.now() > data.expiresAt) {
        pendingRegistrations.delete(token);
      }
    }

    const pendingData = pendingRegistrations.get(code);
    
    if (!pendingData) {
      return res.status(400).json({ error: '驗證碼無效' });
    }

    if (pendingData.email !== email) {
      return res.status(400).json({ error: 'email 與驗證碼不匹配' });
    }

    if (Date.now() > pendingData.expiresAt) {
      pendingRegistrations.delete(code);
      return res.status(400).json({ error: '驗證碼已過期' });
    }

    // 返回註冊資料，讓前端完成註冊
    const { registrationData } = pendingData;
    
    // 刪除待確認資料
    pendingRegistrations.delete(code);
    
    res.json({ 
      success: true, 
      message: '驗證碼正確，註冊成功！',
      email,
      registrationData
    });

  } catch (error) {
    console.error('驗證碼確認錯誤:', error);
    res.status(500).json({ 
      error: '驗證失敗，請稍後再試' 
    });
  }
});

// 清理所有待確認的註冊（用於測試）
router.post('/clear-pending', async (req, res) => {
  try {
    const clearedCount = pendingRegistrations.size;
    pendingRegistrations.clear();
    res.json({ 
      success: true, 
      message: `已清理 ${clearedCount} 個待確認的註冊`,
      clearedCount
    });
  } catch (error) {
    console.error('清理待確認註冊錯誤:', error);
    res.status(500).json({ 
      error: '清理失敗，請稍後再試' 
    });
  }
});

module.exports = router; 