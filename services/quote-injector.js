// quote-injector.js - 將語錄/風格注入 LLM prompt
// TODO: 根據 tone/quote 將 context 注入 prompt
function injectQuotePrompt(userText, quote, tone) {
  return `${quote.text}\n\n以${tone.name}語氣回應：${userText}`;
}
 
module.exports = { injectQuotePrompt }; 