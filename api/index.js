const express = require('express');
const cors = require('cors');

const app = express();

// CORS 設置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// 導入路由
const ttsRouter = require('./routes/tts');
const gptRoutes = require('./routes/gpt');
const whisperRoutes = require('./routes/whisper');
const quotesRoutes = require('./routes/quotes');
const coachingRouter = require('./routes/coaching');
const scenariosRouter = require('./routes/scenarios');
const mindGardenRouter = require('./routes/mind-garden');
const missionAiRouter = require('./routes/mission-ai');
const storyRouter = require('./routes/story');
const sendMessageRouter = require('./routes/send-message');
const moodRouter = require('./routes/mood');
const feedbackRouter = require('./routes/feedback');
const subscriptionRouter = require('./routes/subscription');
const weatherRouter = require('./routes/weather');
const socialIntegrationRouter = require('./routes/social-integration-assessment');
const emailVerificationRouter = require('./routes/email-verification');
const adminFeedbackRouter = require('./routes/admin-feedback');

// 設置路由
app.use('/api/tts', ttsRouter);
app.use('/api/gpt', gptRoutes);
app.use('/api/whisper', whisperRoutes);
app.use('/api/email-verification', emailVerificationRouter);
app.use('/api/quotes', quotesRoutes);
app.use('/api/coaching', coachingRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/mind-garden', mindGardenRouter);
app.use('/api/mission-ai', missionAiRouter);
app.use('/api/story', storyRouter);
app.use('/api/send-message', sendMessageRouter);
app.use('/api/mood', moodRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/admin-feedback', adminFeedbackRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/social-integration-assessment', socialIntegrationRouter);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 根端點
app.get('/', (req, res) => {
  res.json({ 
    message: 'Restarter Backend API', 
    status: 'running',
    endpoints: [
      '/api/tts',
      '/api/gpt', 
      '/api/whisper',
      '/api/email-verification',
      '/api/quotes',
      '/api/coaching',
      '/api/scenarios',
      '/api/mind-garden',
      '/api/mission-ai',
      '/api/story',
      '/api/send-message',
      '/api/mood',
      '/api/feedback',
      '/api/subscription',
      '/api/weather',
      '/api/social-integration-assessment'
    ]
  });
});

// 處理favicon請求
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

module.exports = app;
