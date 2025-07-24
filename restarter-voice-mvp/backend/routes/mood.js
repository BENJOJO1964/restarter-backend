const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const moodFile = path.join(__dirname, '../mood.json');

// 取得所有心情（拼圖）
router.get('/', (req, res) => {
  const userId = req.query.userId || 'demo-user';
  fs.readFile(moodFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: '讀取失敗' });
    try {
      const all = JSON.parse(data || '[]');
      const user = all.find(u => u.userId === userId);
      // 返回扁平化的心情陣列
      const moods = [];
      if (user && Array.isArray(user.garden)) {
        user.garden.forEach(puzzle => {
          if (Array.isArray(puzzle.petals)) {
            puzzle.petals.forEach(petal => {
              moods.push({ mood: petal.mood, date: petal.date });
            });
          }
        });
      }
      res.json(moods);
    } catch (e) {
      res.status(500).json({ error: '資料格式錯誤' });
    }
  });
});

// 新增一筆心情（拼圖碎片）
router.post('/', (req, res) => {
  const { userId, mood, date } = req.body;
  // 嚴格檢查 body 結構
  if (!userId || !mood || !date || typeof userId !== 'string' || typeof mood !== 'string' || typeof date !== 'string') {
    return res.status(400).json({ error: '缺少欄位或格式錯誤' });
  }
  
  // 檢查心情內容是否有效
  const trimmedMood = mood.trim();
  if (trimmedMood.length < 2) {
    return res.status(400).json({ error: '心情內容太短' });
  }
  
  // 檢查是否為無效內容
  const isOnlyNumbers = /^\d+$/.test(trimmedMood);
  // 簡化驗證：只檢查是否為純符號（不包括字母、數字、空格和各種語言字符）
  const isOnlySymbols = /^[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u1e00-\u1eff\u0100-\u017f\u00c0-\u00ff]+$/.test(trimmedMood);
  const isRepeatedChars = /^(.)\1+$/.test(trimmedMood);
  
  if (isOnlyNumbers || isOnlySymbols || isRepeatedChars) {
    return res.status(400).json({ error: '請輸入有意義的心情內容（不能全是數字、符號或重複字元）' });
  }
  
  fs.readFile(moodFile, 'utf8', (err, data) => {
    let all = [];
    if (!err && data) {
      try { all = JSON.parse(data); } catch {}
    }
    let user = all.find(u => u.userId === userId);
    if (!user) {
      user = { userId, garden: [] };
      all.push(user);
    }
    
    // 檢查今天是否已經記錄過
    let todayPiece = false;
    if (user.garden.length > 0) {
      const lastPuzzle = user.garden[user.garden.length - 1];
      todayPiece = lastPuzzle.petals.some(p => p.date === date);
    }
    if (todayPiece) {
      return res.json({ success: true, msg: '今天已經記錄過' });
    }
    
    // 決定加在現有拼圖還是新拼圖
    if (user.garden.length === 0 || user.garden[user.garden.length - 1].petals.length >= 9) {
      user.garden.push({ petals: [{ mood: trimmedMood, date }] });
    } else {
      user.garden[user.garden.length - 1].petals.push({ mood: trimmedMood, date });
    }
    
    fs.writeFile(moodFile, JSON.stringify(all, null, 2), err2 => {
      if (err2) {
        console.error('寫入 mood.json 失敗:', err2);
        return res.status(500).json({ error: '寫入失敗' });
      }
      res.json({ success: true, mood: trimmedMood, date });
    });
  });
});

// 新增：清空所有心情紀錄
router.delete('/', (req, res) => {
  const userId = req.query.userId || 'demo-user';
  const clear = req.query.clear;
  if (!clear) return res.status(400).json({ error: '缺少 clear 參數' });
  fs.readFile(moodFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: '讀取失敗' });
    let all = [];
    try { all = JSON.parse(data || '[]'); } catch {}
    const idx = all.findIndex(u => u.userId === userId);
    if (idx !== -1) {
      all[idx].garden = [];
      fs.writeFile(moodFile, JSON.stringify(all, null, 2), err2 => {
        if (err2) return res.status(500).json({ error: '寫入失敗' });
        res.json({ success: true });
      });
    } else {
      res.json({ success: true }); // 沒有該 user 也算成功
    }
  });
});

module.exports = router; 