const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

// GET /api/check-username?name=xxx
router.get('/', async (req, res) => {
  const name = (req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const snapshot = await db.collection('profiles').where('nickname', '==', name).limit(1).get();
    res.json({ exists: !snapshot.empty });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router; 