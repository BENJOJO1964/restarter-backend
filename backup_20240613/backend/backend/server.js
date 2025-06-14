// server.js - WebSocket + REST API 入口
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket 連線管理
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (msg) => {
    // 處理音訊流、控制訊息
  });
  ws.on('close', () => console.log('Client disconnected'));
});

// REST API 路由（Whisper, GPT, TTS）
app.use('/api/whisper', require('./routes/whisper'));
app.use('/api/gpt', require('./routes/gpt'));
app.use('/api/tts', require('./routes/tts'));
app.use('/api/quotes', require('./routes/quotes'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
