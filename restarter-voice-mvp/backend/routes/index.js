const express = require('express');
const router = express.Router();

// 導入所有路由
const ttsRouter = require('./tts');
const gptRoutes = require('./gpt');
const whisperRoutes = require('./whisper');
const quotesRoutes = require('./quotes');
const coachingRouter = require('./coaching');
const scenariosRouter = require('./scenarios');
const mindGardenRouter = require('./mind-garden');
const missionAiRouter = require('./mission-ai');
const storyRouter = require('./story');
const sendMessageRouter = require('./send-message');
const moodRouter = require('./mood');
const feedbackRouter = require('./feedback');
const subscriptionRouter = require('./subscription');
const weatherRouter = require('./weather');
const socialIntegrationRouter = require('./social-integration-assessment');
const emailVerificationRouter = require('./email-verification');
const adminFeedbackRouter = require('./admin-feedback');

// 註冊路由
router.use('/tts', ttsRouter);
router.use('/gpt', gptRoutes);
router.use('/whisper', whisperRoutes);
router.use('/quotes', quotesRoutes);
router.use('/coaching', coachingRouter);
router.use('/scenarios', scenariosRouter);
router.use('/mind-garden', mindGardenRouter);
router.use('/mission-ai', missionAiRouter);
router.use('/story', storyRouter);
router.use('/send-message', sendMessageRouter);
router.use('/mood', moodRouter);
router.use('/feedback', feedbackRouter);
router.use('/subscription', subscriptionRouter);
router.use('/weather', weatherRouter);
router.use('/social-integration-assessment', socialIntegrationRouter);
router.use('/email-verification', emailVerificationRouter);
router.use('/admin-feedback', adminFeedbackRouter);

module.exports = router;
