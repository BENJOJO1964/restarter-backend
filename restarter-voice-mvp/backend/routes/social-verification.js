const express = require('express');
const router = express.Router();

// 社交媒體驗證狀態存儲
const socialVerifications = new Map();

// 社交媒體登入驗證
router.post('/verify-social', async (req, res) => {
  try {
    const { socialType, socialId, socialToken, registrationData } = req.body;
    
    if (!socialType || !socialId || !socialToken || !registrationData) {
      return res.status(400).json({ error: '請提供完整的社交媒體驗證資料' });
    }

    // 驗證社交媒體 token（這裡需要根據不同的社交媒體 API 進行驗證）
    let isValid = false;
    
    switch (socialType) {
      case 'google':
        // 驗證 Google token
        isValid = await verifyGoogleToken(socialToken);
        break;
      case 'facebook':
        // 驗證 Facebook token
        isValid = await verifyFacebookToken(socialToken);
        break;
      case 'apple':
        // 驗證 Apple token
        isValid = await verifyAppleToken(socialToken);
        break;
      case 'line':
        // 驗證 Line token
        isValid = await verifyLineToken(socialToken);
        break;
      case 'wechat':
        // 驗證微信 token
        isValid = await verifyWeChatToken(socialToken);
        break;
      default:
        return res.status(400).json({ error: '不支援的社交媒體類型' });
    }

    if (!isValid) {
      return res.status(400).json({ error: '社交媒體驗證失敗' });
    }

    // 生成驗證 token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    
    // 儲存驗證資料
    socialVerifications.set(verificationToken, {
      socialType,
      socialId,
      registrationData,
      verifiedAt: Date.now()
    });

    res.json({ 
      success: true, 
      message: '社交媒體驗證成功',
      verificationToken,
      socialType,
      socialId
    });

  } catch (error) {
    console.error('社交媒體驗證錯誤:', error);
    res.status(500).json({ 
      error: '社交媒體驗證失敗，請稍後再試',
      success: false
    });
  }
});

// 確認社交媒體驗證
router.post('/confirm-social', async (req, res) => {
  try {
    const { verificationToken } = req.body;
    
    if (!verificationToken) {
      return res.status(400).json({ error: '請提供驗證 token' });
    }

    const verificationData = socialVerifications.get(verificationToken);
    
    if (!verificationData) {
      return res.status(400).json({ error: '驗證 token 無效' });
    }

    // 返回驗證資料，讓前端完成註冊
    const { socialType, socialId, registrationData } = verificationData;
    
    // 刪除驗證資料
    socialVerifications.delete(verificationToken);
    
    res.json({ 
      success: true, 
      message: '社交媒體驗證確認成功',
      socialType,
      socialId,
      registrationData
    });

  } catch (error) {
    console.error('確認社交媒體驗證錯誤:', error);
    res.status(500).json({ 
      error: '確認失敗，請稍後再試',
      success: false
    });
  }
});

// 驗證 Google Token
async function verifyGoogleToken(token) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const data = await response.json();
    return data.aud === process.env.GOOGLE_CLIENT_ID;
  } catch (error) {
    console.error('Google token 驗證錯誤:', error);
    return false;
  }
}

// 驗證 Facebook Token
async function verifyFacebookToken(token) {
  try {
    const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Facebook token 驗證錯誤:', error);
    return false;
  }
}

// 驗證 Apple Token
async function verifyAppleToken(token) {
  try {
    // Apple 驗證邏輯（需要 Apple 的 JWT 驗證）
    return true; // 簡化處理
  } catch (error) {
    console.error('Apple token 驗證錯誤:', error);
    return false;
  }
}

// 驗證 Line Token
async function verifyLineToken(token) {
  try {
    const response = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.userId;
  } catch (error) {
    console.error('Line token 驗證錯誤:', error);
    return false;
  }
}

// 驗證微信 Token
async function verifyWeChatToken(token) {
  try {
    // 微信驗證邏輯
    return true; // 簡化處理
  } catch (error) {
    console.error('微信 token 驗證錯誤:', error);
    return false;
  }
}

module.exports = router; 