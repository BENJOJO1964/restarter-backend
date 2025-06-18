// tts.js - 處理 TTS 語音合成 API
const express = require('express');
const router = express.Router();
const { textToSpeech } = require('../services/tts');

// POST /api/tts
router.post('/', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const audioUrl = await textToSpeech(text, voice);
    res.json({ audioUrl });
  } catch (error) {
    console.error('TTS Route Error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

module.exports = router;
