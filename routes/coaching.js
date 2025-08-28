const express = require('express');
const router = express.Router();
const { getCoachingFeedback } = require('../services/coaching');

router.post('/analyze', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text input is required.' });
  }

  try {
    const feedback = await getCoachingFeedback(text);
    res.json({ feedback });
  } catch (error) {
    console.error('Error in /analyze route:', error);
    res.status(500).json({ error: 'Failed to get feedback from AI coach.' });
  }
});

module.exports = router; 