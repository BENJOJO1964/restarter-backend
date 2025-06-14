// quotes.js - 語錄 API 路由
const express = require('express');
const router = express.Router();

// GET /api/quotes
router.get('/', (req, res) => {
  // TODO: 回傳語錄資料
  res.json([
    { id: '1', text: '你很棒，值得被愛。', toneId: 'gentle' },
    { id: '2', text: '每一天都是新的開始。', toneId: 'hopeful' },
  ]);
});

module.exports = router; 