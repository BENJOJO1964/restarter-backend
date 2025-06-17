require('dotenv').config();

// server.js - WebSocket + REST API 入口
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const upload = multer({
  dest: path.join(__dirname, 'uploads/')
});

// WebSocket 連線管理
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (msg) => {
    // 處理音訊流、控制訊息
    // 新增 signaling 處理
    try {
      const data = JSON.parse(msg);
      if (data.type === 'signal') {
        // 廣播 signaling 給其他 client
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'signal',
              from: data.from,
              signal: data.signal
            }));
          }
        });
      }
      // 其他訊息處理...
    } catch (e) {
      // 非 JSON 格式訊息
    }
  });
  ws.on('close', () => console.log('Client disconnected'));
});

// REST API 路由（Whisper, GPT, TTS）
app.use('/api/whisper', require('./routes/whisper'));
app.use('/api/gpt', require('./routes/gpt'));
app.use('/api/tts', require('./routes/tts'));
app.use('/api/quotes', require('./routes/quotes'));

// 圖片上傳 API
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename, originalname: req.file.originalname });
});

// 新增首頁路由，讓 / 顯示伺服器運作中
app.get('/', (req, res) => {
  res.send('伺服器運作正常，歡迎使用 Restarter Signaling Server！');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
