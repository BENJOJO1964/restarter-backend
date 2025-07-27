// gpt.js - AI 對話 API 路由
const express = require('express');
const router = express.Router();
const openai = require('openai');
const admin = require('firebase-admin');

const hasOpenAI = process.env.OPENAI_API_KEY;

// 檢查用戶權限的中間件
const checkUserPermission = async (req, res, next) => {
  try {
    const testMode = req.headers['x-test-mode'] === 'true';
    console.log('測試模式:', testMode);
    
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: '缺少用戶ID' });
    }

    // 測試模式下跳過Firebase檢查
    if (testMode) {
      console.log('測試模式：跳過Firebase檢查，使用預設值');
      req.userSubscription = 'basic';
      req.userUsage = { aiCost: 0, aiChats: 0 };
      req.userPlan = { aiCostLimit: 999999, aiChats: 999999 };
      return next();
    }

    // 檢查用戶是否存在
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    const userData = userDoc.data();
    const subscription = userData.subscription || 'free';
    
    // 測試模式下跳過權限檢查
    if (testMode) {
      console.log('測試模式：跳過權限檢查');
      req.userSubscription = subscription || 'basic';
      req.userUsage = { aiCost: 0, aiChats: 0 }; // 測試模式給予初始使用量
      req.userPlan = { aiCostLimit: 999999, aiChats: 999999 }; // 測試模式給予高額度
      return next();
    }
    
    // 免費版無法使用 AI 功能（除非測試模式）
    if (subscription === 'free' && !testMode) {
      return res.status(403).json({ 
        error: '此功能需要訂閱',
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
          error: '本月 AI 使用次數已達上限',
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
    console.error('錯誤詳情:', error.message);
    res.status(500).json({ error: '內部服務器錯誤', details: error.message });
  }
};

// POST /api/gpt
router.post('/', checkUserPermission, async (req, res) => {
  console.log('收到GPT API請求:', req.body);
  const { messages, system_prompt, title, description, userId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages required' });
  }
  // 檢查是否有OpenAI API KEY
  const openaiApiKey = process.env.OPENAI_API_KEY;
  console.log('OpenAI API KEY status:', openaiApiKey ? 'Found' : 'Missing');
  if (openaiApiKey) {
    try {
      const gpt = new openai.OpenAI({ apiKey: openaiApiKey });
      // 修正: 強制 messages 格式正確
      let formattedMessages = messages.filter(m => m && m.text && m.text.trim()).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text.trim()
      }));
      // 新增：將情境主題組成 system message 放最前面
      let systemMsg = '';
      if (system_prompt || title || description) {
        systemMsg = `${system_prompt ? system_prompt + '\n' : ''}你現在要扮演一個情境模擬對話AI，主題是：「${title||''}」。請根據下方主題描述，給出真實、具體、貼近主題的回應。主題描述：${description||''}\n請用簡潔、完整的一段話回覆（40~60字內），務必讓回覆有明確結尾標點，不能斷句。`;
      }
      if (systemMsg) {
        formattedMessages = [
          { role: 'system', content: systemMsg },
          ...formattedMessages
        ];
      }
      const completion = await gpt.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: formattedMessages,
        max_tokens: 80,
        temperature: 0.8,
      });
      const reply = completion.choices[0].message.content.trim();
      console.log('OpenAI completion:', completion);
      console.log('Generated reply:', reply);
      
      // 記錄使用量（測試模式下跳過）
      const testMode = req.headers['x-test-mode'] === 'true';
      if (!testMode) {
        try {
          const currentMonth = new Date().toISOString().slice(0, 7);
          const usageRef = admin.firestore()
            .collection('usage')
            .doc(userId)
            .collection('monthly')
            .doc(currentMonth);

          const currentUsage = req.userUsage;
          const estimatedTokens = completion.usage?.total_tokens || 50; // 估算 token 使用量
          
          await usageRef.set({
            aiCost: (currentUsage.aiCost || 0) + estimatedTokens,
            aiChats: (currentUsage.aiChats || 0) + 1
          }, { merge: true });
        } catch (error) {
          console.error('記錄使用量失敗:', error.message);
        }
      }

      console.log('Sending reply:', { reply });
      return res.json({ reply });
    } catch (e) {
      // 強化錯誤訊息，回傳詳細錯誤內容
      let errMsg = 'AI 回覆失敗，請稍後再試。';
      if (e && e.response && e.response.data) {
        errMsg += ' 詳細: ' + JSON.stringify(e.response.data);
      } else if (e && e.message) {
        errMsg += ' 詳細: ' + e.message;
      }
      console.error('OpenAI GPT error:', e);
      return res.json({ reply: errMsg });
    }
  } else {
    // 沒有 OpenAI API Key 時的 fallback
    console.error('OpenAI API KEY not found');
    res.json({ reply: 'AI 服務暫時無法使用，請檢查 OPENAI_API_KEY 環境變數設置。' });
  }
});

module.exports = router;
