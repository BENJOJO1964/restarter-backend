const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const nodemailer = require('nodemailer');

// POST /api/feedback - 提交意見
router.post('/', async (req, res) => {
  const { content, userEmail, userNickname, userLang } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '意見內容不能為空' });
  }

  try {
    // 1. 儲存意見到 Firestore
    const feedbackDoc = await db.collection('feedback').add({
      content: content.trim(),
      userEmail: userEmail || '匿名',
      userNickname: userNickname || '匿名',
      userLang: userLang || 'zh-TW',
      timestamp: Date.now(),
      status: 'new', // new, reviewed, resolved
      adminNotes: ''
    });

    // 2. 發送 email 通知給管理員
    if (process.env.ADMIN_EMAIL) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: `Restarter 意見箱 <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📝 新意見回饋 - ${userNickname || '匿名使用者'}`,
        html: `
          <div style="font-size: 16px; line-height: 1.7; max-width: 600px;">
            <h2 style="color: #6B5BFF;">💬 收到新意見回饋</h2>
            <div style="background: #f7f8fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <strong>意見內容：</strong><br/>
              <div style="white-space: pre-wrap; margin-top: 10px;">${content}</div>
            </div>
            <div style="margin-top: 20px;">
              <strong>提交者：</strong> ${userNickname || '匿名'}<br/>
              <strong>Email：</strong> ${userEmail || '未提供'}<br/>
              <strong>語言：</strong> ${userLang || 'zh-TW'}<br/>
              <strong>時間：</strong> ${new Date().toLocaleString('zh-TW')}<br/>
              <strong>意見 ID：</strong> ${feedbackDoc.id}
            </div>
            <div style="margin-top: 30px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
              <strong>💡 管理員操作：</strong><br/>
              • 登入管理後台查看完整意見列表<br/>
              • 回覆使用者意見<br/>
              • 標記意見處理狀態
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ 
      success: true, 
      message: '意見已成功送出，我們會認真考慮你的建議！',
      feedbackId: feedbackDoc.id 
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
    const snapshot = await db.collection('feedback')
      .orderBy('timestamp', 'desc')
      .get();
    
    const feedbacks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    await db.collection('feedback').doc(id).update({
      status: status || 'reviewed',
      adminNotes: adminNotes || '',
      updatedAt: Date.now()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('更新意見狀態錯誤:', error);
    res.status(500).json({ error: '更新意見狀態失敗' });
  }
});

module.exports = router; 