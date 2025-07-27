// whisper.js - 處理語音轉文字（Whisper）API
const express = require('express');
const router = express.Router();
const { transcribeAudio } = require('../services/whisper');
const multer = require('multer');
const upload = multer();
const admin = require('firebase-admin');

// 檢查用戶權限的中間件
const checkUserPermission = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: '缺少用戶ID' });
    }

    // 檢查用戶是否存在
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    const userData = userDoc.data();
    const subscription = userData.subscription || 'free';

    // 檢查測試模式
    const testMode = req.headers['x-test-mode'] === 'true';
    
    // 免費版無法使用語音功能（除非測試模式）
    if (subscription === 'free' && !testMode) {
      return res.status(403).json({ 
        error: '語音功能需要訂閱',
        requiredPlan: 'basic'
      });
    }

    // 檢查本月使用量
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageDoc = await admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth)
      .get();

    const usage = usageDoc.exists ? usageDoc.data() : {
      aiCost: 0,
      aiChats: 0
    };

    // 獲取方案限制 - 嚴格按照圖片中的標準
    const SUBSCRIPTION_PLANS = {
      basic: { aiCostLimit: 50000, aiChats: 30 }, // 50K tokens/月
      advanced: { aiCostLimit: 100000, aiChats: 80 }, // 100K tokens/月
      professional: { aiCostLimit: 200000, aiChats: 150 }, // 200K tokens/月
      unlimited: { aiCostLimit: 500000, aiChats: -1 } // 500K tokens/月
    };

    const plan = SUBSCRIPTION_PLANS[subscription];
    if (!plan) {
      return res.status(400).json({ error: '無效的訂閱方案' });
    }

    // 檢查是否超過限制
    if ((plan.aiCostLimit > 0 && usage.aiCost >= plan.aiCostLimit) ||
        (plan.aiChats > 0 && usage.aiChats >= plan.aiChats)) {
      
      // 檢查是否可以續購（Token用完但未滿一個月）
      const currentDate = new Date();
      const subscriptionStartDate = userData.subscriptionStartDate ? new Date(userData.subscriptionStartDate) : currentDate;
      const daysSinceStart = Math.floor((currentDate - subscriptionStartDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceStart < 30) {
        return res.status(403).json({
          error: 'Token 已用完，但可以續購',
          canRenew: true,
          remainingDays: 30 - daysSinceStart,
          usedTokens: usage.aiCost,
          totalTokens: plan.aiCostLimit,
          currentPlan: subscription
        });
      } else {
        return res.status(403).json({
          error: '本月語音功能使用次數已達上限',
          canRenew: false
        });
      }
    }

    // 權限檢查通過，繼續處理
    req.userSubscription = subscription;
    req.userUsage = usage;
    req.userPlan = plan;
    next();
  } catch (error) {
    console.error('權限檢查錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
};

// POST /api/whisper
router.post('/', upload.single('audio'), checkUserPermission, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: '沒有音頻文件' });
    }

    // 語音轉文字
    const result = await transcribeAudio(req.file.buffer);
    
    // 記錄使用量
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageRef = admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth);

    const currentUsage = req.userUsage;
    
    // 計算實際的 Token 消耗
    // Whisper API 的 Token 消耗通常是音頻長度的函數
    // 這裡我們使用一個更精準的估算方法
    const audioDuration = req.file.buffer.length / 16000; // 假設 16kHz 採樣率
    const estimatedTokens = Math.ceil(audioDuration * 0.1); // 每秒約 0.1 tokens
    
    await usageRef.set({
      aiCost: (currentUsage.aiCost || 0) + estimatedTokens,
      aiChats: (currentUsage.aiChats || 0) + 1
    }, { merge: true });

    res.json({ text: result });
  } catch (error) {
    console.error('語音轉文字錯誤:', error);
    res.status(500).json({ error: '語音轉文字失敗' });
  }
});

module.exports = router;
