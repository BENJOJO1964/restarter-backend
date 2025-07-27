const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// 初始化OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 社會融入度評估API
router.post('/', async (req, res) => {
  try {
    console.log('收到社會融入度評估請求');
    const { answers, userMilestones, assessmentDate, context } = req.body;
    
    // 檢查OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API Key 未設置');
      return res.status(500).json({
        error: 'OpenAI API Key 未配置',
        message: '請檢查環境變量設置'
      });
    }

    // 檢查權限（測試模式跳過）
    if (!req.headers['x-test-mode']) {
      // 這裡可以添加權限檢查邏輯
    }

    // 準備發送給OpenAI的提示
    const prompt = `
你是一個專業的更生人社會融入度評估專家。請根據以下信息進行深度分析：

用戶評估答案：
- 人際關係：${answers.q1}
- 就業狀況：${answers.q2}
- 家庭關係：${answers.q3}
- 未來信心：${answers.q4}
- 社會接納：${answers.q5}

用戶歷史里程碑（最近10個）：
${userMilestones.map(m => `- ${m.title}: ${m.description}`).join('\n')}

請提供以下分析：
1. 客觀評分（1-5分）
2. 評估等級（優秀/良好/一般/需要改善）
3. 詳細分析描述
4. 個性化改善建議（3-5條）
5. AI深度分析（基於用戶歷史和當前狀況）

請以JSON格式返回：
{
  "score": 評分,
  "result": "等級",
  "description": "詳細描述",
  "recommendations": ["建議1", "建議2", "建議3"],
  "aiAnalysis": "AI深度分析"
}
`;

    // 調用OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "你是一個專業的更生人社會融入度評估專家，專門幫助更生人評估和改善社會融入度。請提供客觀、專業、個性化的分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // 解析AI回應
    const aiResponse = completion.choices[0].message.content;
    let aiResult;
    
    try {
      // 嘗試解析JSON
      aiResult = JSON.parse(aiResponse);
    } catch (error) {
      // 如果解析失敗，使用備用邏輯
      console.error('AI回應解析失敗:', error);
      aiResult = {
        score: 3.0,
        result: "一般",
        description: "基於您的評估，您的社會融入度一般，建議尋求專業輔導協助。",
        recommendations: [
          "建議尋求專業輔導師協助",
          "參加更生人互助團體",
          "制定具體的改善計劃"
        ],
        aiAnalysis: "AI分析暫時無法使用，建議聯繫專業輔導師進行更詳細的評估。"
      };
    }

    // 確保返回格式正確
    const result = {
      score: parseFloat(aiResult.score) || 3.0,
      result: aiResult.result || "一般",
      description: aiResult.description || "評估完成",
      recommendations: Array.isArray(aiResult.recommendations) ? aiResult.recommendations : ["建議尋求專業輔導"],
      aiAnalysis: aiResult.aiAnalysis || "AI分析完成"
    };

    res.json(result);

  } catch (error) {
    console.error('社會融入度評估API錯誤:', error);
    res.status(500).json({
      error: 'AI評估服務暫時無法使用',
      message: error.message
    });
  }
});

module.exports = router; 