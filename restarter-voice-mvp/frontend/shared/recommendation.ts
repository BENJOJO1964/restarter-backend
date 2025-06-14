// 推薦系統 mock 資料結構與推薦邏輯

export type UserProfile = {
  id: string;
  name: string;
  gender: string;
  country: string;
  age: number;
  interests: string[];
  region: string;
  moodHistory: string[];
  friends: string[];
};

export type Mission = {
  id: string;
  title: string;
  tags: string[];
};

export type Group = {
  id: string;
  name: string | Record<string, string>;
  topic: string | Record<string, string>;
};

export type AITheme = {
  id: string;
  title: string;
  desc: string;
};

// mock 用戶資料
export const mockUsers: UserProfile[] = [
  { id: 'u1', name: '小明', gender: 'male', country: '台灣', age: 25, interests: ['運動', '閱讀'], region: '台北', moodHistory: ['快樂', '平靜'], friends: ['u2'] },
  { id: 'u2', name: 'Sakura', gender: 'female', country: '日本', age: 23, interests: ['音樂', '旅行'], region: '東京', moodHistory: ['悲傷', '希望'], friends: ['u1'] },
  { id: 'u3', name: 'John', gender: 'male', country: '美國', age: 30, interests: ['電影', '科技'], region: 'New York', moodHistory: ['焦慮'], friends: [] },
];

// mock 任務資料
export const mockMissions: Mission[] = [
  { id: 'm1', title: '每日心情記錄', tags: ['日誌', '自我成長'] },
  { id: 'm2', title: '主題挑戰：分享你的故事', tags: ['分享', '社群'] },
  { id: 'm3', title: '情緒圖像創作', tags: ['創意', '情緒'] },
];

// mock 小組資料
export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: {
      'zh-TW': '運動小組', 'zh-CN': '运动小组', 'en': 'Sports Group', 'ja': 'スポーツグループ', 'ko': '운동 소그룹', 'vi': 'Nhóm Thể thao'
    },
    topic: {
      'zh-TW': '運動', 'zh-CN': '运动', 'en': 'Sports', 'ja': 'スポーツ', 'ko': '운동', 'vi': 'Thể thao'
    }
  },
  {
    id: 'g2',
    name: {
      'zh-TW': '閱讀俱樂部', 'zh-CN': '阅读俱乐部', 'en': 'Reading Club', 'ja': '読書クラブ', 'ko': '독서 소그룹', 'vi': 'Câu lạc bộ Đọc sách'
    },
    topic: {
      'zh-TW': '閱讀', 'zh-CN': '阅读', 'en': 'Reading', 'ja': '読書', 'ko': '독서', 'vi': 'Đọc sách'
    }
  },
  {
    id: 'g3',
    name: {
      'zh-TW': '音樂同好', 'zh-CN': '音乐同好', 'en': 'Music Lovers', 'ja': '音楽仲間', 'ko': '음악 소그룹', 'vi': 'Nhóm Yêu nhạc'
    },
    topic: {
      'zh-TW': '音樂', 'zh-CN': '音乐', 'en': 'Music', 'ja': '音楽', 'ko': '음악', 'vi': 'Âm nhạc'
    }
  },
];

// mock AI陪聊主題
export const mockAIThemes: AITheme[] = [
  { id: 'a1', title: '情緒支持', desc: '聊聊你的心情，獲得AI陪伴' },
  { id: 'a2', title: '目標設定', desc: '一起規劃你的新目標' },
  { id: 'a3', title: '興趣探索', desc: '發現更多你喜歡的事物' },
];

// 推薦邏輯
export function recommendMissions(user: UserProfile): Mission[] {
  // 根據興趣、心情推薦任務
  return mockMissions.filter(m => user.interests.some(i => m.tags.includes(i)) || m.tags.some(t => user.moodHistory.includes(t)));
}

export function recommendGroups(user: UserProfile): Group[] {
  // 根據興趣推薦小組
  return mockGroups.filter(g => user.interests.includes(g.topic.en));
}

export function recommendFriends(user: UserProfile): UserProfile[] {
  // 推薦非現有好友，興趣有交集者
  return mockUsers.filter(u => u.id !== user.id && !user.friends.includes(u.id) && u.interests.some(i => user.interests.includes(i)));
}

export function recommendAIThemes(user: UserProfile): AITheme[] {
  // 根據心情或興趣推薦AI主題
  return mockAIThemes.filter(a => user.interests.some(i => a.title.includes(i)) || user.moodHistory.some(m => a.title.includes(m)));
} 