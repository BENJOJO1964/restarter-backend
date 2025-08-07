require('dotenv').config({ path: __dirname + '/.env' });
const admin = require('firebase-admin');

// 檢查是否為測試模式
const isTestMode = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true';

// 使用環境變量配置Firebase
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // 從環境變量讀取服務帳戶密鑰
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // 本地開發時使用文件
  serviceAccount = require('./serviceAccountKey.json');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase初始化成功');
  } catch (error) {
    console.error('Firebase初始化失敗:', error.message);
    if (isTestMode) {
      console.log('測試模式：繼續運行，跳過Firebase');
    } else {
      throw error;
    }
  }
}
// server.js - WebSocket + REST API 入口
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

// WebRTC 信令伺服器（最簡單房間制）
const rooms = {};
wss.on('connection', ws => {
  ws.on('message', msg => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }
    const { type, room } = data;
    if (!room) return;
    rooms[room] = rooms[room] || [];
    if (!rooms[room].includes(ws)) rooms[room].push(ws);
    // 廣播給同房間其他人
    rooms[room].forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
  ws.on('close', () => {
    Object.values(rooms).forEach(arr => {
      const idx = arr.indexOf(ws);
      if (idx !== -1) arr.splice(idx, 1);
    });
  });
});

// REST API 路由（Whisper, GPT, TTS）
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
const videoGenerationRouter = require('./routes/video-generation');
const videoGenerationOptimizedRouter = require('./routes/video-generation-optimized');
// const stripePaymentRouter = require('./routes/stripe-payment');

app.use(express.json());
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
// app.use('/api/stripe', stripePaymentRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/social-integration-assessment', socialIntegrationRouter);
app.use('/api/video-generation', videoGenerationRouter);
app.use('/api/video-generation-optimized', videoGenerationOptimizedRouter);

// 後端只提供API，不提供靜態文件
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

// 處理favicon請求，避免404錯誤
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // 返回無內容狀態
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/health', (req, res) => {
  res.send({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
