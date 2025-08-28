const OpenAI = require('openai');

let openai; // Declare openai instance variable

function getOpenAIInstance() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

async function generateFlowerImage(emotionPrompt) {
  if (!emotionPrompt) {
    throw new Error("Emotion prompt is required.");
  }

  const fullPrompt = `A single, unique, beautiful, symbolic flower that represents the feeling of "${emotionPrompt}". The flower should be the central focus, on a simple, clean, light-colored background. Hyperrealistic digital art, detailed, with cinematic lighting.`;

  try {
    const openaiInstance = getOpenAIInstance(); // Get instance inside the function
    const response = await openaiInstance.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    console.log(`Generated image URL for prompt "${emotionPrompt}": ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    throw new Error('Failed to generate flower image.');
  }
}

module.exports = { generateFlowerImage }; 