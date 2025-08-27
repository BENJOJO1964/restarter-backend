// chat.js - AI 對話 API 路由
const express = require('express');
const router = express.Router();
const openai = require('openai');

// 檢查是否有 OpenAI API Key
const hasOpenAI = process.env.OPENAI_API_KEY;

// 聊天 API 端點 - 兼容多種格式
router.post('/chat', async (req, res) => {
  try {
    const { message, messages, userId, system_prompt, title, description } = req.body;
    
    // 支持單條消息或消息數組
    let userMessage = message;
    let messageHistory = [];
    
    if (messages && Array.isArray(messages)) {
      // 使用消息歷史格式
      messageHistory = messages.filter(m => m && m.text && m.text.trim()).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text.trim()
      }));
      userMessage = messageHistory[messageHistory.length - 1]?.content || message;
    } else if (message) {
      // 使用單條消息格式
      userMessage = message;
    } else {
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

    // 構建系統提示詞
    let systemContent = "你是一個友善的 AI 助手，會用中文回答問題。請保持友善、有幫助的態度。";
    
    if (system_prompt || title || description) {
      systemContent = `${system_prompt ? system_prompt + '\n' : ''}你現在要扮演一個情境模擬對話AI，主題是：「${title||''}」。請根據下方主題描述，給出真實、具體、貼近主題的回應。主題描述：${description||''}\n請用簡潔、完整的一段話回覆（40~60字內），務必讓回覆有明確結尾標點，不能斷句。`;
    }

    // 構建消息數組
    let formattedMessages = [
      { role: 'system', content: systemContent }
    ];

    if (messageHistory.length > 0) {
      formattedMessages = formattedMessages.concat(messageHistory);
    } else if (userMessage) {
      formattedMessages.push({ role: 'user', content: userMessage });
    }

    // 發送請求到 OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: formattedMessages,
      max_tokens: 80,
      temperature: 0.8,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    // 返回兼容格式的回應
    res.json({
      success: true,
      reply: aiResponse,
      response: aiResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('聊天 API 錯誤:', error);
    
    // 強化錯誤訊息
    let errMsg = 'AI 回覆失敗，請稍後再試。';
    if (error && error.response && error.response.data) {
      errMsg += ' 詳細: ' + JSON.stringify(error.response.data);
    } else if (error && error.message) {
      errMsg += ' 詳細: ' + error.message;
    }
    
    res.status(500).json({
      error: 'API錯誤',
      message: errMsg,
      reply: errMsg
    });
  }
});

// 兼容舊的 GPT 端點
router.post('/gpt', async (req, res) => {
  // 重定向到聊天端點
  req.url = '/chat';
  return router.handle(req, res);
});

module.exports = router;
