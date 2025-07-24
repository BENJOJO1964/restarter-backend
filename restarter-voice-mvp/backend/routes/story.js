const express = require('express');
const router = express.Router();
const { translateAll } = require('../services/azure-translate');
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const fs = require('fs');
const path = require('path');
const moodFile = path.join(__dirname, '../mood.json');

const LANGS = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'th', 'vi', 'ms', 'la'];

router.post('/add', async (req, res) => {
  const { title, content, lang, author, ...other } = req.body;
  try {
    // 1. 翻譯 title/content
    const titleTranslations = await translateAll(title, lang, LANGS);
    const contentTranslations = await translateAll(content, lang, LANGS);

    // 2. 組合 Firestore 結構
    const storyData = {
      title,
      content,
      lang,
      author,
      ...other,
      translations: {}
    };
    LANGS.forEach(code => {
      if (code !== lang) {
        storyData.translations[code] = {
          title: titleTranslations[code] || '',
          content: contentTranslations[code] || ''
        };
      }
    });

    // 3. 存進 Firestore
    await db.collection('stories').add(storyData);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router; 