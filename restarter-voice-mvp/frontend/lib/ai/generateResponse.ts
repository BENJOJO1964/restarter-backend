import axios from 'axios';

export async function* generateResponse(userText: string, lang: string, systemPrompt: string): AsyncGenerator<string> {
  try {
    const response = await axios.post('/api/gpt', {
      messages: [
        { sender: 'user', text: userText }
      ],
      system_prompt: systemPrompt
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