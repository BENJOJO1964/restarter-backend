const express = require('express');
const router = express.Router();

// 待確認的註冊資料存儲
const pendingRegistrations = new Map();

// 簡訊驗證 API 設定
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_API_URL = process.env.SMS_API_URL || 'https://api.twilio.com/2010-04-01/Accounts';

// 發送簡訊驗證碼
router.post('/send-sms', async (req, res) => {
  try {
    const { phoneNumber, registrationData } = req.body;
    
    if (!phoneNumber || !registrationData) {
      return res.status(400).json({ error: '請提供手機號碼和註冊資料' });
    }

    // 檢查是否已有待確認的註冊
    const existingToken = Array.from(pendingRegistrations.entries())
      .find(([token, data]) => data.phoneNumber === phoneNumber);
    
    if (existingToken) {
      pendingRegistrations.delete(existingToken[0]);
    }

    // 生成 6 位數驗證碼
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 設定過期時間（10分鐘）
    const expiresAt = Date.now() + (10 * 60 * 1000);
    
    // 儲存待確認的註冊資料
    pendingRegistrations.set(verificationCode, {
      phoneNumber,
      registrationData,
      expiresAt
    });

    // 檢查簡訊服務是否已設定
    if (!SMS_API_KEY) {
      return res.status(500).json({ 
        error: '簡訊服務未設定，請聯繫管理員',
        success: false 
      });
    }

    // 發送簡訊（這裡使用 Twilio 作為範例）
    const message = `您的 Restarter 驗證碼是：${verificationCode}，10分鐘內有效。`;
    
    // 實際發送簡訊的程式碼（需要根據選擇的簡訊服務調整）
    // const response = await fetch(`${SMS_API_URL}/Messages.json`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(`${SMS_API_KEY}:${SMS_API_SECRET}`).toString('base64')}`,
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: new URLSearchParams({
    //     To: phoneNumber,
    //     From: process.env.TWILIO_PHONE_NUMBER,
    //     Body: message
    //   })
    // });

    // 暫時模擬發送成功（實際部署時需要真實的簡訊服務）
    console.log(`發送簡訊到 ${phoneNumber}: ${message}`);

    res.json({ 
      success: true, 
      message: '驗證簡訊已發送，請檢查您的手機',
      phoneNumber
    });

  } catch (error) {
    console.error('發送簡訊錯誤:', error);
    res.status(500).json({ 
      error: '發送簡訊失敗，請稍後再試',
      success: false
    });
  }
});

// 確認簡訊驗證碼
router.post('/confirm-sms', async (req, res) => {
  try {
    const { verificationCode } = req.body;
    
    if (!verificationCode) {
      return res.status(400).json({ error: '請提供驗證碼' });
    }

    const pendingData = pendingRegistrations.get(verificationCode);
    
    if (!pendingData) {
      return res.status(400).json({ error: '驗證碼無效或已過期' });
    }

    if (Date.now() > pendingData.expiresAt) {
      pendingRegistrations.delete(verificationCode);
      return res.status(400).json({ error: '驗證碼已過期' });
    }

    // 返回註冊資料，讓前端完成註冊
    const { phoneNumber, registrationData } = pendingData;
    
    // 刪除待確認資料
    pendingRegistrations.delete(verificationCode);
    
    res.json({ 
      success: true, 
      message: '簡訊驗證成功',
      phoneNumber,
      registrationData
    });

  } catch (error) {
    console.error('確認簡訊驗證錯誤:', error);
    res.status(500).json({ 
      error: '確認失敗，請稍後再試',
      success: false
    });
  }
});

module.exports = router; 