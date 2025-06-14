import { useState } from 'react';
// TODO: 實作 VAD
export function useVAD() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // 假資料測試
  return { isSpeaking };
}
