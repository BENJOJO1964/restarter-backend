const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// 待確認的註冊資料存儲（實際應用中應使用 Redis 或數據庫）
const pendingRegistrations = new Map();

// 創建郵件傳輸器
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 發送確認郵件
router.post('/send-confirmation', async (req, res) => {
  try {
    const { email, registrationData } = req.body;
    
    if (!email || !registrationData) {
      return res.status(400).json({ error: '請提供 email 和註冊資料' });
    }

    // 生成確認 token
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // 存儲待確認的註冊資料（24小時有效期）
    pendingRegistrations.set(confirmationToken, {
      email,
      registrationData,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    // 確認連結
    const confirmationUrl = `https://restarter-frontend-6e9s.onrender.com/confirm-registration?token=${confirmationToken}`;

    // 郵件內容
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restarter™ 註冊確認',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B5BFF;">Restarter™ 註冊確認</h2>
          <p>您好！</p>
          <p>感謝您註冊 Restarter™，請點擊下方按鈕確認您的註冊：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="
              display: inline-block;
              background: linear-gradient(90deg, #6e8efb, #a777e3);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
            ">✅ 確認註冊</a>
          </div>
          <p>如果按鈕無法點擊，請複製以下連結到瀏覽器：</p>
          <p style="word-break: break-all; color: #666; font-size: 12px;">${confirmationUrl}</p>
          <p>此確認連結將在 24 小時後失效。</p>
          <p>如果這不是您的操作，請忽略此郵件。</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Restarter™ - 每一位更生人，都是世界的一員！
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: '確認郵件已發送到您的 email，請檢查收件匣並點擊確認連結' 
    });

  } catch (error) {
    console.error('Email 發送錯誤:', error);
    res.status(500).json({ 
      error: '確認郵件發送失敗，請稍後再試' 
    });
  }
});

// 確認註冊
router.post('/confirm-registration', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: '請提供確認 token' });
    }

    const pendingData = pendingRegistrations.get(token);
    
    if (!pendingData) {
      return res.status(400).json({ error: '確認連結無效或已過期' });
    }

    if (Date.now() > pendingData.expiresAt) {
      pendingRegistrations.delete(token);
      return res.status(400).json({ error: '確認連結已過期' });
    }

    // 返回註冊資料，讓前端完成註冊
    const { email, registrationData } = pendingData;
    
    // 刪除待確認資料
    pendingRegistrations.delete(token);
    
    res.json({ 
      success: true, 
      message: 'email 確認成功',
      email,
      registrationData
    });

  } catch (error) {
    console.error('確認註冊錯誤:', error);
    res.status(500).json({ 
      error: '確認失敗，請稍後再試' 
    });
  }
});

module.exports = router; 