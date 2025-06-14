// gpt.js - 處理 GPT-4 對話 API
const express = require('express');
const router = express.Router();

// POST /api/gpt
router.post('/', (req, res) => {
  // TODO: 處理 LLM 對話
  res.json({ reply: 'stub gpt reply' });
});

module.exports = router;
