const express = require('express');
const router = express.Router();

// 待審核的註冊資料存儲
const pendingRegistrations = new Map();

// 生成圖形驗證碼
router.get('/generate-captcha', (req, res) => {
  try {
    // 生成簡單的數學驗證碼
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = ['+', '-', '×'][Math.floor(Math.random() * 3)];
    
    let answer;
    let question;
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        answer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        break;
      case '×':
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
    }
    
    // 生成驗證 ID
    const captchaId = Math.random().toString(36).substring(2, 15);
    
    // 儲存驗證碼答案（5分鐘過期）
    const captchaData = {
      answer,
      question,
      expiresAt: Date.now() + (5 * 60 * 1000)
    };
    
    // 這裡應該使用 Redis 或資料庫儲存，暫時用 Map
    pendingRegistrations.set(captchaId, captchaData);
    
    res.json({
      success: true,
      captchaId,
      question,
      expiresIn: 300 // 5分鐘
    });
    
  } catch (error) {
    console.error('生成驗證碼錯誤:', error);
    res.status(500).json({ error: '生成驗證碼失敗' });
  }
});

// 驗證圖形驗證碼並完成註冊
router.post('/verify-captcha', async (req, res) => {
  try {
    const { captchaId, userAnswer, registrationData } = req.body;
    
    if (!captchaId || !userAnswer || !registrationData) {
      return res.status(400).json({ error: '請提供完整的驗證資料' });
    }

    // 檢查驗證碼
    const captchaData = pendingRegistrations.get(captchaId);
    
    if (!captchaData) {
      return res.status(400).json({ error: '驗證碼無效或已過期' });
    }

    if (Date.now() > captchaData.expiresAt) {
      pendingRegistrations.delete(captchaId);
      return res.status(400).json({ error: '驗證碼已過期' });
    }

    if (parseInt(userAnswer) !== captchaData.answer) {
      return res.status(400).json({ error: '驗證碼答案錯誤' });
    }

    // 驗證碼正確，刪除驗證碼資料
    pendingRegistrations.delete(captchaId);

    // 直接返回註冊資料，讓前端完成註冊
    res.json({ 
      success: true, 
      message: '驗證碼正確，註冊成功！',
      registrationData
    });

  } catch (error) {
    console.error('驗證碼驗證錯誤:', error);
    res.status(500).json({ 
      error: '驗證失敗，請稍後再試',
      success: false
    });
  }
});



module.exports = router; 