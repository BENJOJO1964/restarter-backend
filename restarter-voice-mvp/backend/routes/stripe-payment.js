const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// 創建支付意圖
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, plan, userId } = req.body;
    
    if (!amount || !plan || !userId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // 創建支付意圖
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe使用分為單位
      currency: 'twd',
      metadata: { 
        plan: plan,
        userId: userId 
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('創建支付意圖錯誤:', error);
    res.status(500).json({ error: '支付處理失敗' });
  }
});

// 確認支付成功
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, userId, plan } = req.body;
    
    if (!paymentIntentId || !userId || !plan) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // 確認支付意圖
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // 更新用戶訂閱狀態
      const currentDate = new Date();
      const subscriptionEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

      await admin.firestore().collection('users').doc(userId).update({
        subscription: plan,
        subscriptionStartDate: currentDate,
        subscriptionEndDate: subscriptionEndDate,
        paymentMethod: 'stripe',
        lastTransactionId: paymentIntentId,
        lastPaymentAmount: paymentIntent.amount / 100,
        lastPaymentCurrency: 'TWD',
        subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });

      // 重置當月使用量
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
        amount: paymentIntent.amount / 100,
        currency: 'TWD',
        paymentMethod: 'stripe',
        transactionId: paymentIntentId,
        paymentDate: currentDate,
        status: 'success'
      });

      res.json({ 
        success: true, 
        message: '付款成功，AI 功能已立即解鎖！',
        subscription: plan,
        startDate: currentDate,
        endDate: subscriptionEndDate
      });
    } else {
      res.status(400).json({ error: '支付未完成' });
    }

  } catch (error) {
    console.error('確認支付錯誤:', error);
    res.status(500).json({ error: '支付確認失敗' });
  }
});

// Webhook處理（用於處理支付事件）
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook簽名驗證失敗:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 處理支付成功事件
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('支付成功:', paymentIntent.id);
    
    // 這裡可以添加額外的處理邏輯
  }

  res.json({ received: true });
});

module.exports = router; 