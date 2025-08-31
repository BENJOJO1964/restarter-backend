const express = require('express');
const router = express.Router();
const { generateFlowerImage } = require('../services/dalle');

router.post('/generate-flower', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const imageUrl = await generateFlowerImage(prompt);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error in /generate-flower route:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

module.exports = router; 