// chat.js - AI 對話 API 路由
const express = require('express');
const router = express.Router();
const openai = require('openai');

// 檢查是否有 OpenAI API Key
const hasOpenAI = process.env.OPENAI_API_KEY;

// 聊天 API 端點
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '缺少訊息內容' });
    }

    if (!hasOpenAI) {
      return res.status(500).json({ 
        error: 'OpenAI API 未配置',
        message: '請聯繫管理員配置 OpenAI API Key'
      });
    }

    // 創建 OpenAI 客戶端
    const client = new openai.OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 發送請求到 OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一個友善的 AI 助手，會用中文回答問題。請保持友善、有幫助的態度。"
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      response: aiResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('聊天 API 錯誤:', error);
    res.status(500).json({
      error: 'API錯誤',
      message: error.message
    });
  }
});

module.exports = router;
