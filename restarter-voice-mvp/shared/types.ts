// types.ts - 前後端共用型別定義

export interface ASRResult {
  text: string;
  confidence?: number;
}

export interface GPTReply {
  reply: string;
  stream?: boolean;
}

export interface TTSAudio {
  audioUrl: string;
  stream?: boolean;
}

export type State = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface Tone {
  id: string;
  name: string;
  description: string;
  stylePrompt: string;
}

export interface Quote {
  id: string;
  text: string;
  toneId: string;
  author?: string;
}
