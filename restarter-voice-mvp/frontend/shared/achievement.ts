// 成就/升級系統資料結構

export type Badge = {
  id: string;
  name: { 'zh-TW': string; 'zh-CN': string; 'en': string; 'ja': string; 'ko': string; 'vi': string };
  desc: string;
  icon: string; // emoji 或圖片路徑
};

export type UserAchievement = {
  exp: number;
  level: number;
  badges: string[]; // badge id 陣列
};

// 升級經驗值規則（每級所需經驗值）
export const LEVEL_EXP = [0, 100, 250, 500, 1000, 2000, 4000];

// mock 徽章資料
export const BADGES: Badge[] = [
  { id: 'starter', name: { 'zh-TW': '新手上路', 'zh-CN': '新手上路', 'en': 'Getting Started', 'ja': '初心者', 'ko': '입문자', 'vi': 'Người mới' }, desc: '完成首次任務', icon: '🌱' },
  { id: 'friend', name: { 'zh-TW': '交友達人', 'zh-CN': '交友达人', 'en': 'Friend Maker', 'ja': '友達達人', 'ko': '친구달인', 'vi': 'Kết bạn' }, desc: '加第一位好友', icon: '🤝' },
  { id: 'mission5', name: { 'zh-TW': '任務高手', 'zh-CN': '任务高手', 'en': 'Mission Expert', 'ja': 'ミッション達人', 'ko': '미션고수', 'vi': 'Chuyên gia nhiệm vụ' }, desc: '完成5個任務', icon: '🏅' },
  { id: 'level5', name: { 'zh-TW': '等級5', 'zh-CN': '等级5', 'en': 'Level 5', 'ja': 'レベル5', 'ko': '레벨5', 'vi': 'Cấp 5' }, desc: '達到等級5', icon: '🎖️' },
];

// 根據經驗值計算等級
export function calcLevel(exp: number): number {
  for (let i = LEVEL_EXP.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_EXP[i]) return i + 1;
  }
  return 1;
}

// 根據等級取得下一級所需經驗值
export function nextLevelExp(level: number): number {
  return LEVEL_EXP[level] || LEVEL_EXP[LEVEL_EXP.length - 1];
} 