const express = require('express');
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

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Restarter Backend API is running on Vercel'
  });
});

// 主頁面
app.get('/', (req, res) => {
  res.json({ 
    message: 'Restarter Backend API', 
    status: 'running',
    endpoints: [
      '/health',
      '/api/tts',
      '/api/gpt', 
      '/api/whisper',
      '/api/quotes',
      '/api/coaching'
    ]
  });
});

// 處理所有其他路由
app.use('/api', require('../backend/routes'));

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = app;
