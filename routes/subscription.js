const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// 測試用戶創建功能（僅用於開發測試）
const createTestUser = async (userId) => {
  try {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // 創建測試用戶
      await userRef.set({
        email: 'test@example.com',
        displayName: 'Test User',
        subscription: 'free', // 設置為免費版
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 創建初始使用量記錄
      const currentMonth = new Date().toISOString().slice(0, 7);
      await admin.firestore()
        .collection('usage')
        .doc(userId)
        .collection('monthly')
        .doc(currentMonth)
        .set({
          aiCost: 0,
          userInteractions: 0,
          comments: 0,
          milestones: 0,
          aiChats: 0,
          freeFeatures: 0
        });

      console.log(`測試用戶 ${userId} 已創建`);
    }
  } catch (error) {
    console.error('創建測試用戶失敗:', error);
  }
};

// 訂閱方案配置 - 嚴格按照圖片中的標準
const SUBSCRIPTION_PLANS = {
  free: {
    name: '免費版',
    price: 0,
    limits: {
      aiCostLimit: 0, // 無語音功能權限
      userInteractions: 0, // 無法與其他使用者互動
      comments: 0, // 無權限使用OpenAI API功能
      milestones: 0, // 無權限使用OpenAI API功能
      aiChats: 0, // 無權限使用OpenAI API功能
      freeFeatures: 15 // 基礎功能使用15次/月
    }
  },
  basic: {
    name: '基礎版',
    price: 149,
    limits: {
      aiCostLimit: 50000, // 50K tokens/月 (圖片顯示: 50K tokens/月)
      userInteractions: 100, // 用戶互動: 100次/月
      comments: 30, // 留言: 30次/月
      milestones: 30, // 里程碑: 30次/月
      aiChats: 30, // AI聊天: 30次/月
      freeFeatures: 300 // 基礎功能: 300次/月
    }
  },
  advanced: {
    name: '進階版',
    price: 249,
    limits: {
      aiCostLimit: 100000, // 100K tokens/月 (圖片顯示: 100K tokens/月)
      userInteractions: 300, // 用戶互動: 300次/月
      comments: 80, // 留言: 80次/月
      milestones: 80, // 里程碑: 80次/月
      aiChats: 80, // AI聊天: 80次/月
      freeFeatures: 600 // 基礎功能: 600次/月
    }
  },
  professional: {
    name: '專業版',
    price: 349,
    limits: {
      aiCostLimit: 200000, // 200K tokens/月 (圖片顯示: 200K tokens/月)
      userInteractions: 800, // 用戶互動: 800次/月
      comments: 150, // 留言: 150次/月
      milestones: 150, // 里程碑: 150次/月
      aiChats: 150, // AI聊天: 150次/月
      freeFeatures: 1000 // 基礎功能: 1000次/月
    }
  },
  unlimited: {
    name: '無限版',
    price: 499,
    limits: {
      aiCostLimit: 500000, // 500K tokens/月 (圖片顯示: 500K tokens/月)
      userInteractions: -1, // 無限制 (圖片顯示: 無限制)
      comments: -1, // 無限制 (圖片顯示: 無限制)
      milestones: -1, // 無限制 (圖片顯示: 無限制)
      aiChats: -1, // 無限制 (圖片顯示: 無限制)
      freeFeatures: -1 // 無限制 (圖片顯示: 無限制)
    }
  }
};

// 檢查用戶訂閱狀態
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    const userData = userDoc.data();
    const subscription = userData.subscription || 'free';
    const plan = SUBSCRIPTION_PLANS[subscription];
    
    // 獲取本月使用統計
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageDoc = await admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth)
      .get();

    const usage = usageDoc.exists ? usageDoc.data() : {
      aiCost: 0,
      userInteractions: 0,
      comments: 0,
      milestones: 0,
      aiChats: 0,
      freeFeatures: 0
    };

    res.json({
      subscription,
      plan,
      usage,
      limits: plan.limits,
      isOverLimit: {
        aiCost: usage.aiCost >= plan.limits.aiCostLimit && plan.limits.aiCostLimit > 0,
        userInteractions: usage.userInteractions >= plan.limits.userInteractions && plan.limits.userInteractions > 0,
        comments: usage.comments >= plan.limits.comments && plan.limits.comments > 0,
        milestones: usage.milestones >= plan.limits.milestones && plan.limits.milestones > 0,
        aiChats: usage.aiChats >= plan.limits.aiChats && plan.limits.aiChats > 0,
        freeFeatures: usage.freeFeatures >= plan.limits.freeFeatures && plan.limits.freeFeatures > 0
      }
    });
  } catch (error) {
    console.error('檢查訂閱狀態錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
});

// 檢查特定功能權限
router.post('/check-permission', async (req, res) => {
  try {
    const { userId, feature } = req.body;
    
    if (!userId || !feature) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      // 自動創建測試用戶
      await createTestUser(userId);
    }

    const userData = userDoc.data();
    const subscription = userData.subscription || 'free';
    const plan = SUBSCRIPTION_PLANS[subscription];

    // 檢查是否為免費版且嘗試使用付費功能
    if (subscription === 'free') {
      const paidFeatures = ['aiChat', 'voiceFeature', 'userInteraction'];
      if (paidFeatures.includes(feature)) {
        // 檢查是否為測試模式
        const testMode = req.headers['x-test-mode'] === 'true';
        if (testMode) {
          // 測試模式下允許所有功能
          return res.json({
            allowed: true,
            reason: null,
            currentUsage: usage,
            limits: plan.limits,
            currentPlan: subscription,
            isTestMode: true
          });
        }
        
        return res.json({
          allowed: false,
          reason: '此功能需要訂閱',
          requiredPlan: 'basic'
        });
      }
    }

    // 檢查使用限制
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageDoc = await admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth)
      .get();

    const usage = usageDoc.exists ? usageDoc.data() : {
      aiCost: 0,
      userInteractions: 0,
      comments: 0,
      milestones: 0,
      aiChats: 0,
      freeFeatures: 0
    };

    let isOverLimit = false;
    let limitType = '';

    // 檢查各功能獨立限制
    switch (feature) {
      case 'aiChat':
        // AI聊天可能包含語音功能，需要檢查Token
        if (plan.limits.aiCostLimit > 0 && usage.aiCost >= plan.limits.aiCostLimit) {
          isOverLimit = true;
          limitType = 'AI Token 已用完';
          
          // 檢查是否可以續購（Token用完但未滿一個月）
          const currentDate = new Date();
          const subscriptionStartDate = userData.subscriptionStartDate ? new Date(userData.subscriptionStartDate) : currentDate;
          const daysSinceStart = Math.floor((currentDate - subscriptionStartDate) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart < 30) {
            // 可以續購，返回特殊狀態
            return res.json({
              allowed: false,
              isOverLimit: true,
              limitType: 'AI Token 已用完',
              canRenew: true,
              remainingDays: 30 - daysSinceStart,
              usedTokens: usage.aiCost,
              totalTokens: plan.limits.aiCostLimit,
              currentPlan: subscription,
              message: `Token 已用完，但還有 ${30 - daysSinceStart} 天到期，可以續購`
            });
          }
        } else if (plan.limits.aiChats > 0 && usage.aiChats > plan.limits.aiChats) {
          isOverLimit = true;
          limitType = 'aiChats';
        }
        break;
      case 'userInteraction':
        // 用戶互動（文字功能，不消耗Token）
        if (plan.limits.userInteractions > 0 && usage.userInteractions > plan.limits.userInteractions) {
          isOverLimit = true;
          limitType = 'userInteractions';
        }
        break;
      case 'comment':
        // 留言（文字功能，不消耗Token）
        if (plan.limits.comments > 0 && usage.comments > plan.limits.comments) {
          isOverLimit = true;
          limitType = 'comments';
        }
        break;
      case 'milestone':
        // 里程碑（文字功能，不消耗Token）
        if (plan.limits.milestones > 0 && usage.milestones > plan.limits.milestones) {
          isOverLimit = true;
          limitType = 'milestones';
        }
        break;
      case 'freeFeature':
        // 基礎功能（文字功能，不消耗Token）
        if (plan.limits.freeFeatures > 0 && usage.freeFeatures > plan.limits.freeFeatures) {
          isOverLimit = true;
          limitType = 'freeFeatures';
        }
        break;
    }

    res.json({
      allowed: !isOverLimit,
      reason: isOverLimit ? `本月${limitType}使用次數已達上限` : null,
      currentUsage: usage,
      limits: plan.limits,
      currentPlan: subscription,
      isOverLimit: isOverLimit,
      limitType: limitType,
      canRenew: false, // 默認不能續購
      remainingDays: 0,
      usedTokens: usage.aiCost,
      totalTokens: plan.limits.aiCostLimit
    });

  } catch (error) {
    console.error('檢查權限錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
});

// 記錄使用量
router.post('/record-usage', async (req, res) => {
  try {
    const { userId, feature, cost = 0 } = req.body;
    
    if (!userId || !feature) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageRef = admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth);

    const usageDoc = await usageRef.get();
    const currentUsage = usageDoc.exists ? usageDoc.data() : {
      aiCost: 0,
      userInteractions: 0,
      comments: 0,
      milestones: 0,
      aiChats: 0,
      freeFeatures: 0
    };

    // 更新使用量
    const updates = {};
    switch (feature) {
      case 'aiChat':
        updates.aiChats = (currentUsage.aiChats || 0) + 1;
        updates.aiCost = (currentUsage.aiCost || 0) + cost;
        break;
      case 'userInteraction':
        updates.userInteractions = (currentUsage.userInteractions || 0) + 1;
        break;
      case 'comment':
        updates.comments = (currentUsage.comments || 0) + 1;
        break;
      case 'milestone':
        updates.milestones = (currentUsage.milestones || 0) + 1;
        break;
      case 'freeFeature':
        updates.freeFeatures = (currentUsage.freeFeatures || 0) + 1;
        break;
    }

    await usageRef.set(updates, { merge: true });

    res.json({ success: true, updatedUsage: updates });

  } catch (error) {
    console.error('記錄使用量錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
});

// 更新用戶訂閱
router.post('/update-subscription', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    
    if (!userId || !plan) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ error: '無效的訂閱方案' });
    }

    await admin.firestore().collection('users').doc(userId).update({
      subscription: plan,
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      subscription: plan,
      plan: SUBSCRIPTION_PLANS[plan]
    });

  } catch (error) {
    console.error('更新訂閱錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
});

// 付款成功回調 - 立即解鎖 AI 功能並開始計算時間
router.post('/payment-success', async (req, res) => {
  try {
    const { 
      userId, 
      plan, 
      paymentMethod, 
      transactionId, 
      amount,
      currency = 'TWD'
    } = req.body;
    
    if (!userId || !plan || !transactionId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ error: '無效的訂閱方案' });
    }

    const currentDate = new Date();
    const subscriptionStartDate = currentDate;
    
    // 計算到期日期
    let subscriptionEndDate;
    if (plan.includes('yearly')) {
      // 年費方案
      subscriptionEndDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
    } else {
      // 月費方案
      subscriptionEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    }

    // 更新用戶訂閱狀態
    await admin.firestore().collection('users').doc(userId).update({
      subscription: plan,
      subscriptionStartDate: subscriptionStartDate,
      subscriptionEndDate: subscriptionEndDate,
      paymentMethod: paymentMethod,
      lastTransactionId: transactionId,
      lastPaymentAmount: amount,
      lastPaymentCurrency: currency,
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });

    // 重置當月使用量（從付款當天開始計算）
    const currentMonth = currentDate.toISOString().slice(0, 7);
    await admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth)
      .set({
        aiCost: 0,
        userInteractions: 0,
        comments: 0,
        milestones: 0,
        aiChats: 0,
        freeFeatures: 0,
        resetDate: currentDate
      });

    // 記錄付款歷史
    await admin.firestore().collection('paymentHistory').add({
      userId: userId,
      plan: plan,
      amount: amount,
      currency: currency,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      paymentDate: currentDate,
      status: 'success'
    });

    res.json({ 
      success: true, 
      message: '付款成功，AI 功能已立即解鎖！',
      subscription: plan,
      plan: SUBSCRIPTION_PLANS[plan],
      startDate: subscriptionStartDate,
      endDate: subscriptionEndDate,
      remainingDays: Math.ceil((subscriptionEndDate - currentDate) / (1000 * 60 * 60 * 24))
    });

  } catch (error) {
    console.error('付款成功處理錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
});

// 獲取用戶詳細訂閱資訊
router.get('/details/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    let userData;
    if (!userDoc.exists) {
      // 自動創建測試用戶
      await createTestUser(userId);
      // 重新獲取用戶數據
      const newUserDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!newUserDoc.exists) {
        return res.status(500).json({ error: '創建測試用戶失敗' });
      }
      userData = newUserDoc.data();
    } else {
      userData = userDoc.data();
    }
    
    // 確保 userData 存在
    if (!userData) {
      return res.status(500).json({ error: '無法獲取用戶數據' });
    }
    
    const subscription = userData.subscription || 'free';
    const plan = SUBSCRIPTION_PLANS[subscription];
    
    // 計算剩餘天數
    let remainingDays = 0;
    if (userData.subscriptionEndDate) {
      const endDate = userData.subscriptionEndDate.toDate();
      const currentDate = new Date();
      remainingDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
      remainingDays = Math.max(0, remainingDays);
    }

    // 獲取本月使用統計
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageDoc = await admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth)
      .get();

    const usage = usageDoc.exists ? usageDoc.data() : {
      aiCost: 0,
      userInteractions: 0,
      comments: 0,
      milestones: 0,
      aiChats: 0,
      freeFeatures: 0
    };

    res.json({
      subscription,
      plan,
      usage,
      limits: plan.limits,
      remainingDays,
      startDate: userData.subscriptionStartDate,
      endDate: userData.subscriptionEndDate,
      isActive: userData.isActive || false,
      paymentMethod: userData.paymentMethod,
      lastPaymentAmount: userData.lastPaymentAmount,
      lastPaymentCurrency: userData.lastPaymentCurrency
    });
  } catch (error) {
    console.error('獲取訂閱詳情錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
});

// 重置使用量（測試用）
router.post('/reset-usage', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少用戶ID' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    await admin.firestore()
      .collection('usage')
      .doc(userId)
      .collection('monthly')
      .doc(currentMonth)
      .set({
        aiCost: 0,
        userInteractions: 0,
        comments: 0,
        milestones: 0,
        aiChats: 0,
        freeFeatures: 0,
        resetDate: new Date()
      });

    res.json({ 
      success: true, 
      message: '使用量已重置',
      resetDate: new Date()
    });

  } catch (error) {
    console.error('重置使用量錯誤:', error);
    res.status(500).json({ error: '內部服務器錯誤' });
  }
});

module.exports = router; 