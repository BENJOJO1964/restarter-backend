// Firestore 初始化範例
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

async function initSamples(userId) {
  // 1. 匿名心情日記
  await db.collection('journals').doc(userId).collection('entries').add({
    type: 'text',
    timestamp: new Date(),
    content: '今天心情不錯！',
    aiReply: '很高興你今天過得不錯～',
    emotionTags: ['開心'],
    ephemeral: false
  });
  // 2. 日常任務
  await db.collection('missions').doc(userId).collection('userMissions').add({
    title: '今天說出一句感謝的話',
    category: 'emotion',
    completed: false,
    rewardXP: 10
  });
  // 3. PairTalk 配對
  await db.collection('pairings').add({
    userAId: userId,
    userBId: 'uidB',
    initiatedAt: new Date(),
    messages: [],
    aiGeneratedPrompt: '今天你最想聊什麼？',
    expired: false
  });
  // 4. SkillBox 訓練
  await db.collection('trainings').doc(userId).collection('sessions').add({
    scenarioType: 'interview',
    userResponses: [],
    aiFeedback: [],
    score: 0
  });
}

module.exports = { initSamples }; 