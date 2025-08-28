const axios = require('axios');

const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_REGION = process.env.AZURE_REGION;

async function translateText(text, from, to) {
  const endpoint = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
  const url = `${endpoint}&from=${from}&to=${to}`;
  const headers = {
    'Ocp-Apim-Subscription-Key': AZURE_KEY,
    'Ocp-Apim-Subscription-Region': AZURE_REGION,
    'Content-Type': 'application/json'
  };
  const body = [{ Text: text }];
  const res = await axios.post(url, body, { headers });
  return res.data[0].translations[0].text;
}

async function translateAll(text, from, targets) {
  const result = {};
  for (const to of targets) {
    if (to === from) continue;
    try {
      result[to] = await translateText(text, from, to);
    } catch (e) {
      result[to] = '';
    }
  }
  return result;
}

module.exports = { translateText, translateAll }; 