const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const nodemailer = require('nodemailer');

// POST /api/send-message
router.post('/', async (req, res) => {
  const { content, toUid, toEmail, toNickname, fromUid, fromEmail, fromNickname } = req.body;
  if (!content || !toUid || !toEmail || !fromUid || !fromNickname) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }
  try {
    // 1. 寫入 Firestore messages 集合
    await db.collection('messages').add({
      content,
      toUid,
      toEmail,
      toNickname,
      fromUid,
      fromEmail,
      fromNickname,
      timestamp: Date.now(),
      read: false
    });
    // 2. 發送 email 通知
    // 請根據你的郵件服務設定 transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const mailOptions = {
      from: `Restarter留言通知 <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `你收到一則新留言 - 來自${fromNickname}`,
      html: `<div style="font-size:16px;line-height:1.7;">
        <b>${fromNickname}</b> 給你留言：<br/><blockquote style="border-left:3px solid #6B5BFF;padding-left:10px;margin:10px 0;">${content}</blockquote>
        <div style="margin-top:18px;">請盡快登入 Restarter 查看詳情。</div>
      </div>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router; 