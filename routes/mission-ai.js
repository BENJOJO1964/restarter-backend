const express = require('express');
const router = express.Router();

// 若有 openai 套件與 API key，則串接 GPT
let openai;
let hasOpenAI = false;
try {
  openai = require('openai');
  hasOpenAI = !!process.env.OPENAI_API_KEY;
} catch {}

const staticReplies = [
  '謝謝你願意分享自己的故事，這是勇敢的第一步。你的感受很重要，請繼續保持這份勇氣。',
  '你在困難中做出的努力很值得肯定，請相信自己有力量。每一個小小的嘗試都是成長的證明。',
  '設定行動目標是很棒的開始，遇到困難時也別忘了給自己鼓勵。你比想像中更堅強。',
  '你的反思很有價值，每一步都是成長的累積。這些領悟將成為你未來的力量。',
  '恭喜你完成重啟之路，未來也請繼續善待自己！你已經展現了改變的勇氣。',
];
const randomEncouragements = [
  '你的分享很真誠，謝謝你信任這個空間。',
  '每個感受都值得被看見，請繼續善待自己。',
  '你願意面對自己，這是很棒的勇氣。',
  '你的努力很值得肯定，請相信自己。',
  '每一步都是成長的累積，請繼續前進。',
  '你已經做得很好了，請給自己一個擁抱。',
  '謝謝你願意嘗試，未來也請繼續加油！',
  '你的故事很有力量，請相信自己。',
  '你很棒，請繼續保持這份勇氣。',
];

function isMeaningfulInput(input) {
  if (!input || input.trim().length < 8) return false;
  // 排除常見無意義短語、地名、單一詞彙、單字母、單詞
  const meaningless = ['不對', '沒事', '不知道', '無', '沒', '無語', '無聊', '哈', '嗯', '好', 'ok', 'a', 'b', 'c', '1', '2', '3', '德國', '美國', '台灣', '中國', '日本', '韓國', '英國', '法國', '義大利', '西班牙', '俄羅斯', '巴西', '印度', '澳洲', '加拿大', 'de', 'us', 'jp', 'tw', 'kr', 'cn', 'fr', 'it', 'es', 'ru', 'br', 'in', 'au', 'ca'];
  if (meaningless.includes(input.trim().toLowerCase())) return false;
  if (/^[\s\p{P}\p{S}a-zA-Z0-9]{1,8}$/u.test(input.trim())) return false;
  // 單一詞彙（無空格、無標點、無語意）也視為無意義
  if (!input.match(/[\s，。！？,.]/) && input.trim().length < 12) return false;
  return true;
}

router.post('/', async (req, res) => {
  try {
    const { step, input, history } = req.body;
    if (!input || typeof input !== 'string' || !isMeaningfulInput(input)) {
      return res.json({ reply: '你的內容無法理解，請完整表達' });
    }
    // 若有 OpenAI，則用 GPT 生成
    if (hasOpenAI) {
      try {
        const gpt = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemPrompt = '你是一位溫暖、真誠、鼓勵人的心理教練，請根據用戶的輸入，給出具體、貼近內容、真誠的回饋。請勿重複用戶的內容，請用繁體中文回答。';
        const userPrompt = `用戶輸入：「${input}」`;
        const completion = await gpt.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 80,
          temperature: 0.8,
        });
        const reply = completion.choices[0].message.content.trim();
        return res.json({ reply });
      } catch (e) {
        // fallback
      }
    }
    // fallback 回覆
    let reply = randomEncouragements[Math.floor(Math.random() * randomEncouragements.length)];
    if (step === 4) reply = '恭喜你完成重啟之路，未來也請繼續善待自己！你已經展現了改變的勇氣。';
    res.json({ reply });
  } catch (err) {
    // 保證不會 500，回傳友善訊息
    res.json({ reply: '伺服器暫時無法提供 AI 回饋，請稍後再試。' });
  }
});

module.exports = router; 