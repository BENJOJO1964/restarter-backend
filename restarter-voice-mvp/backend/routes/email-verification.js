const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// 待確認的註冊資料存儲（實際應用中應使用 Redis 或數據庫）
const pendingRegistrations = new Map();

// 創建郵件傳輸器
const transporter = nodemailer.createTransport({
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

    // 暫時跳過 email 驗證，直接返回成功
    // TODO: 之後設定好 email 服務後再啟用
    res.json({ 
      success: true, 
      message: '註冊成功！歡迎加入 Restarter™',
      email,
      registrationData
    });

  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ 
      error: '註冊失敗，請稍後再試' 
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