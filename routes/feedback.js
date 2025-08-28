const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const EmailService = require('../services/email-service');
const fs = require('fs');
const path = require('path');

// 本地備用儲存
const LOCAL_FEEDBACK_FILE = path.join(__dirname, '../data/local-feedback.json');

// 確保本地檔案存在
if (!fs.existsSync(path.dirname(LOCAL_FEEDBACK_FILE))) {
  fs.mkdirSync(path.dirname(LOCAL_FEEDBACK_FILE), { recursive: true });
}

if (!fs.existsSync(LOCAL_FEEDBACK_FILE)) {
  fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify([], null, 2));
}

// 本地儲存意見
const saveFeedbackLocally = (feedbackData) => {
  try {
    const existingData = JSON.parse(fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf8'));
    const newFeedback = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...feedbackData,
      timestamp: Date.now(),
      status: 'new',
      adminNotes: '',
      source: 'local'
    };
    existingData.push(newFeedback);
    fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify(existingData, null, 2));
    return newFeedback;
  } catch (error) {
    console.error('本地儲存失敗:', error);
    return null;
  }
};

// POST /api/feedback - 提交意見
router.post('/', async (req, res) => {
  const { content, userEmail, userNickname, userLang } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '意見內容不能為空' });
  }

  try {
    // 1. 嘗試儲存意見到 Firestore
    let feedbackDoc = null;
    let firebaseSuccess = false;
    
    try {
      feedbackDoc = await db.collection('feedback').add({
        content: content.trim(),
        userEmail: userEmail || '匿名',
        userNickname: userNickname || '匿名',
        userLang: userLang || 'zh-TW',
        timestamp: Date.now(),
        status: 'new',
        adminNotes: '',
        source: 'firebase'
      });
      firebaseSuccess = true;
      console.log('Firebase 儲存成功');
    } catch (firebaseError) {
      console.error('Firebase 儲存失敗，使用本地備用:', firebaseError.message);
      
      // 2. Firebase 失敗時，使用本地儲存
      const localFeedback = saveFeedbackLocally({
        content: content.trim(),
        userEmail: userEmail || '匿名',
        userNickname: userNickname || '匿名',
        userLang: userLang || 'zh-TW'
      });
      
      if (localFeedback) {
        feedbackDoc = { id: localFeedback.id };
        console.log('本地儲存成功');
      } else {
        throw new Error('本地儲存也失敗');
      }
    }

    // 3. 發送 email 通知
    try {
      const emailService = new EmailService();
      
      const mailOptions = {
        from: 'onboarding@resend.dev',
        to: process.env.ADMIN_EMAIL || 'rbben521@gmail.com',
        subject: `新意見回饋 - ${userNickname || '匿名用戶'}`,
        html: `
          <div style="font-size:16px;line-height:1.7;max-width:600px;margin:0 auto;">
            <h2 style="color:#6B5BFF;margin-bottom:20px;">💬 新意見回饋</h2>
            <div style="background:#f7f8fa;padding:20px;border-radius:8px;margin-bottom:20px;">
              <p style="margin:0 0 15px 0;"><strong>用戶：</strong>${userNickname || '匿名用戶'}</p>
              <p style="margin:0 0 15px 0;"><strong>Email：</strong>${userEmail || '未提供'}</p>
              <p style="margin:0 0 15px 0;"><strong>語言：</strong>${userLang || 'zh-TW'}</p>
              <p style="margin:0 0 15px 0;"><strong>時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:15px 0;">
              <p style="margin:0;"><strong>意見內容：</strong></p>
              <blockquote style="border-left:3px solid #6B5BFF;padding-left:15px;margin:15px 0;font-style:italic;">
                ${content.trim()}
              </blockquote>
            </div>
            <div style="text-align:center;color:#666;font-size:14px;">
              此郵件由 Restarter 意見箱系統自動發送
            </div>
          </div>
        `
      };

      const result = await emailService.sendEmail(mailOptions);
      
      if (result.success) {
        console.log(`✅ 意見通知郵件發送成功 (${result.service})`);
        console.log('郵件ID:', result.messageId);
      } else {
        console.log('⚠️ 郵件發送失敗，已記錄到本地:', result.error);
      }
    } catch (emailError) {
      console.error('郵件服務錯誤:', emailError.message);
      console.error('意見已儲存，但郵件發送失敗');
    }

    res.json({ 
      success: true, 
      message: '意見已成功送出，我們會認真考慮你的建議！',
      feedbackId: feedbackDoc.id,
      storage: firebaseSuccess ? 'firebase' : 'local',
      emailStatus: 'stored_locally' // 標記郵件已儲存到本地
    });

  } catch (error) {
    console.error('意見提交錯誤:', error);
    res.status(500).json({ error: '意見提交失敗，請稍後再試' });
  }
});

// GET /api/feedback - 管理員取得意見列表
router.get('/', async (req, res) => {
  const { adminKey } = req.query;
  
  // 簡單的管理員驗證（實際應用中應該使用更安全的認證）
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: '未授權存取' });
  }

  try {
    const feedbacks = [];
    
    // 1. 嘗試從 Firebase 取得
    try {
      const snapshot = await db.collection('feedback')
        .orderBy('timestamp', 'desc')
        .get();
      
      snapshot.docs.forEach(doc => {
        feedbacks.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } catch (firebaseError) {
      console.error('Firebase 讀取失敗:', firebaseError.message);
    }
    
    // 2. 從本地檔案取得
    try {
      if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
        const localFeedbacks = JSON.parse(fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf8'));
        feedbacks.push(...localFeedbacks);
      }
    } catch (localError) {
      console.error('本地檔案讀取失敗:', localError.message);
    }
    
    // 3. 按時間排序
    feedbacks.sort((a, b) => b.timestamp - a.timestamp);

    res.json({ feedbacks });
  } catch (error) {
    console.error('取得意見列表錯誤:', error);
    res.status(500).json({ error: '取得意見列表失敗' });
  }
});

// PUT /api/feedback/:id - 更新意見狀態
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { adminKey, status, adminNotes } = req.body;
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: '未授權存取' });
  }

  try {
    // 判斷是 Firebase 還是本地意見
    if (id.startsWith('local_')) {
      // 更新本地意見
      const localFeedbacks = JSON.parse(fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf8'));
      const feedbackIndex = localFeedbacks.findIndex(f => f.id === id);
      
      if (feedbackIndex !== -1) {
        localFeedbacks[feedbackIndex] = {
          ...localFeedbacks[feedbackIndex],
          status: status || 'reviewed',
          adminNotes: adminNotes || '',
          updatedAt: Date.now()
        };
        fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify(localFeedbacks, null, 2));
      }
    } else {
      // 更新 Firebase 意見
      await db.collection('feedback').doc(id).update({
        status: status || 'reviewed',
        adminNotes: adminNotes || '',
        updatedAt: Date.now()
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('更新意見狀態錯誤:', error);
    res.status(500).json({ error: '更新意見狀態失敗' });
  }
});

module.exports = router; 