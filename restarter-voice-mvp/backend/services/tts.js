// tts.js - TTS 語音合成服務
// TODO: 串接 ElevenLabs 或 OpenAI TTS，支援流式語音

const axios = require('axios');

async function textToSpeech(text, voice = 'female') {
  try {
    const voiceId = voice === 'male' 
      ? 's3://voice-cloning-zero-shot/zh-CN-YunxiNeural'
      : 's3://voice-cloning-zero-shot/zh-CN-XiaoxiaoNeural';
    
    const response = await axios.post('https://api.play.ht/api/v2/tts', {
      text,
      voice: voiceId,
      output_format: 'mp3',
      quality: 'medium',
      speed: 1.0,
      sample_rate: 24000,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
    });

    return response.data.audioUrl;
  } catch (error) {
    console.error('TTS Error:', error);
    throw new Error('Failed to generate speech');
  }
}

module.exports = {
  textToSpeech
};
