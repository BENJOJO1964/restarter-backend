import axios from 'axios';
import { getAuth } from 'firebase/auth';

export async function* generateResponse(userText: string, lang: string, systemPrompt: string): AsyncGenerator<string> {
  try {
    // 獲取當前用戶ID
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('用戶未登入');
    }

    // 檢查是否為測試模式
    const isTestMode = localStorage.getItem('testMode') === 'true';
    
    const response = await axios.post('/api/gpt', {
      messages: [
        { sender: 'user', text: userText }
      ],
      system_prompt: systemPrompt,
      userId: user.uid
    }, {
      headers: {
        'x-test-mode': isTestMode ? 'true' : 'false'
      }
    });
    
    const reply = response.data.reply;
    if (reply) {
      // 模擬流式輸出
      const words = reply.split('');
      for (const word of words) {
        yield word;
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms 延遲
      }
    }
  } catch (error) {
    console.error('Error calling GPT API:', error);
    yield '抱歉，我現在無法回應，請稍後再試。';
  }
} 