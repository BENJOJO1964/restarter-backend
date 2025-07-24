// tts.js - 處理 TTS 語音合成 API
const express = require('express');
const router = express.Router();

// POST /api/tts
router.post('/', (req, res) => {
  // TODO: 文字轉語音
  res.json({ audioUrl: 'stub tts audio url' });
});

module.exports = router;
