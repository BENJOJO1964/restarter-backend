import axios from 'axios';

export async function generateResponse(messages: { role: 'user' | 'assistant', content: string }[], apiKey: string): Promise<string> {
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o',
    messages,
    max_tokens: 200,
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data.choices[0].message.content.trim();
} 