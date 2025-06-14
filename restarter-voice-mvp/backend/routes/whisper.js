// whisper.js - 處理語音轉文字（Whisper）API
const express = require('express');
const router = express.Router();
const { transcribeAudio } = require('../services/whisper');
const multer = require('multer');
const upload = multer();

// POST /api/whisper
router.post('/', upload.single('audio'), async (req, res) => {
  // 假資料測試
  const result = await transcribeAudio(req.file?.buffer);
  res.json({ text: result });
});

// GET /api/whisper
router.get('/', (req, res) => {
  res.send('Whisper API is working!');
});

module.exports = router;
