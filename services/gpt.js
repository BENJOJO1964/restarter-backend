require('dotenv').config({ path: __dirname + '/../.env' });
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'MISSING');
// gpt.js - GPT-4 對話服務
// TODO: 串接 OpenAI GPT-4，支援流式回覆

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chatWithGPT(prompt) {
  // stub: 假回傳
  return `AI回覆（假資料）：${prompt}`;
}

async function getEncouragementFromGPT(story) {
  const prompt = `你是一位溫暖、正向、善於鼓勵人的心理陪伴者。請針對以下用戶故事，給一句簡短、真誠、積極、具啟發性的鼓勵語，語言需與故事相同。\n\n故事：${story}\n\n鼓勵語：`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: '你是一位溫暖、正向、善於鼓勵人的心理陪伴者。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 60
  });
  return completion.choices[0].message.content.trim();
}

module.exports = { chatWithGPT, getEncouragementFromGPT };
