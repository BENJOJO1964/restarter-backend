import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import VideoReactionPlayer, { VideoReactionType } from '../components/VideoReactionPlayer';
import { useVideoReaction } from '../components/VideoReactionContext';
import { generateResponse } from '../lib/ai/generateResponse';
import { useUserStatus } from '../hooks/useUserStatus';
import { LANGS, TEXT, useLanguage, LanguageCode } from '../shared/i18n';
const BADGES = ['🦸‍♂️','🦸‍♀️','🦹‍♂️','🦹‍♀️'];
const SUBTITLE: Record<string, string> = {
  'zh-TW': '每天一點小練習，解鎖你的社交技能 ✨',
  'zh-CN': '每天一点小练习，解锁你的社交技能 ✨',
  'en': 'A little practice every day unlocks your social skills ✨',
  'ja': '毎日少し練習して、あなたのソーシャルスキルを解放しよう ✨',
};
const PICK_SCENARIO: Record<string, string> = {
  'zh-TW': '選擇情境',
  'zh-CN': '选择情境',
  'en': 'Pick a scenario',
  'ja': 'シナリオを選択',
};
const UNLOCKED_BADGES: Record<string, string> = {
  'zh-TW': '已解鎖徽章',
  'zh-CN': '已解锁徽章',
  'en': 'Unlocked Badges',
  'ja': '獲得したバッジ',
};
const NO_BADGE: Record<string, string> = {
  'zh-TW': '尚未獲得徽章',
  'zh-CN': '尚未获得徽章',
  'en': 'No badges yet',
  'ja': 'まだバッジがありません',
};
const YOUR_ANSWER: Record<string, string> = {
  'zh-TW': '你的回答...',
  'zh-CN': '你的回答...',
  'en': 'Your answer...',
  'ja': 'あなたの答え...',
  'ko': '당신의 답변...',
  'vi': 'Câu trả lời của bạn...',
};
const VOICE_BTN: Record<string, string> = {
  'zh-TW': '🎤語音',
  'zh-CN': '🎤语音',
  'en': '🎤 Voice',
  'ja': '🎤音声',
  'ko': '🎤 음성',
  'vi': '🎤 Giọng nói',
};
const VOICE_RECORDING: Record<string, string> = {
  'zh-TW': '🎤錄音中...',
  'zh-CN': '🎤录音中...',
  'en': '🎤 Recording...',
  'ja': '🎤録音中...',
  'ko': '🎤 녹음 중...',
  'vi': '🎤 Đang ghi âm...',
};
const SEND_BTN: Record<string, string> = {
  'zh-TW': '送出',
  'zh-CN': '送出',
  'en': 'Send',
  'ja': '送信',
  'ko': '보내기',
  'vi': 'Gửi',
};
// AI情緒標籤對應影片
const EMOTION_TO_REACTION: { [k: string]: VideoReactionType } = {
  'joy': 'joy',
  'gratitude': 'joy',
  'encouragement': 'encouragement',
  'motivation': 'motivation',
  'reproach': 'reproach',
  'disappointment': 'disappointment',
  'lost': 'lost',
  'breakthrough': 'breakthrough',
  'clarity': 'clarity',
  'sadness': 'disappointment',
  'anger': 'reproach',
  'neutral': 'encouragement',
  'reluctance': 'reluctance',
  'confusion': 'confusion',
  'affection': 'affection',
  'regret': 'regret',
  'admiration': 'admiration',
  'teasing': 'teasing',
};
// 多語言情境題庫模板與細節
const SCENARIO_TEMPLATES = {
  'zh-TW': [
    '你遇到一位{relation}，請主動{action}。',
    '朋友邀請你參加{event}，你想{response}。',
    '你今天心情{emotion}，請和朋友分享原因。',
    '你需要請求{relation}幫忙，請表達你的需求。',
    '你和朋友有意見不同，請試著表達你的看法。',
    '你想鼓勵一位{relation}，請說一句鼓勵的話。',
    '你收到一份禮物，請表達你的感謝。',
    '你想拒絕一個邀約，請禮貌地說明理由。',
    '你想認識新朋友，請自我介紹。',
    '你想安慰一位{relation}，請說一句安慰的話。',
  ],
  'zh-CN': [
    '你遇到一位{relation}，请主动{action}。',
    '朋友邀请你参加{event}，你想{response}。',
    '你今天心情{emotion}，请和朋友分享原因。',
    '你需要请求{relation}帮忙，请表达你的需求。',
    '你和朋友有意见不同，请试着表达你的看法。',
    '你想鼓励一位{relation}，请说一句鼓励的话。',
    '你收到一份礼物，请表达你的感谢。',
    '你想拒绝一个邀约，请礼貌地说明理由。',
    '你想认识新朋友，请自我介绍。',
    '你想安慰一位{relation}，请说一句安慰的话。',
  ],
  'en': [
    'You meet a {relation}, please {action} them.',
    'A friend invites you to a {event}, you want to {response}.',
    'You feel {emotion} today. Please share the reason with a friend.',
    'You need to ask a {relation} for help. Please express your need.',
    'You have a different opinion from a friend. Please express your view.',
    'You want to encourage a {relation}. Please say something encouraging.',
    'You received a gift. Please express your gratitude.',
    'You want to decline an invitation. Please politely explain your reason.',
    'You want to make a new friend. Please introduce yourself.',
    'You want to comfort a {relation}. Please say something comforting.',
  ],
  'ja': [
    '{relation}に会いました。まず{action}してください。',
    '友達に{event}に誘われました。あなたは{response}したいです。',
    '今日は{emotion}な気分です。友達に理由を話してください。',
    '{relation}に助けを求めたいです。自分の気持ちを伝えてください。',
    '友達と意見が違います。自分の考えを伝えてください。',
    '{relation}を励ましたいです。励ましの言葉をかけてください。',
    'プレゼントをもらいました。感謝の気持ちを伝えてください。',
    '誘いを断りたいです。丁寧に理由を説明してください。',
    '新しい友達を作りたいです。自己紹介してください。',
    '{relation}を慰めたいです。慰めの言葉をかけてください。',
  ],
  'ko': [
    '{relation}에 만났습니다. 먼저 {action}해주세요.',
    '{relation}에게 {event}에 초대되었습니다. 당신은 {response}하고 싶습니다.',
    '{emotion} 기분이 오늘입니다. 친구에게 이유를 말해주세요.',
    '{relation}에 도움을 요청하고 싶습니다. 스스로 기분을 전달해주세요.',
    '친구와 의견이 다릅니다. 스스로 생각을 전달해주세요.',
    '{relation}을 위로하고 싶습니다. 위로하는 말을 해주세요.',
    '선물을 받았습니다. 감사의 마음을 전달해주세요.',
    '초대를 거절하고 싶습니다. 친절하게 이유를 설명해주세요.',
    '새로운 친구를 만들고 싶습니다. 자기소개해주세요.',
    '{relation}을 위로하고 싶습니다. 위로하는 말을 해주세요.',
  ],
  'vi': [
    'Bạn đã gặp {relation}. Hãy {action} đầu tiên.',
    'Bạn đã được mời tham gia {event} bởi {relation}. Bạn muốn {response}.',
    'Hôm nay bạn cảm thấy {emotion}. Hãy chia sẻ lý do với một người bạn.',
    'Bạn cần hỏi {relation} về sự giúp đỡ. Hãy thể hiện nhu cầu của bạn.',
    'Bạn có ý kiến khác với {relation}. Hãy thể hiện quan điểm của bạn.',
    'Bạn muốn khích lệ {relation}. Hãy nói một câu khích lệ.',
    'Bạn đã nhận được một món quà. Hãy thể hiện cảm tình cảm thành kết quả.',
    'Bạn không muốn chấp nhận mời. Hãy giải thích lý do tự nhiên.',
    'Bạn muốn làm mới một người bạn. Hãy tự giới thiệu.',
    'Bạn muốn an ủi {relation}. Hãy nói một câu an ủi.',
  ],
};
const RELATIONS = {
  'zh-TW': ['同事', '鄰居', '家人', '朋友', '老師', '同學', '主管', '陌生人'],
  'zh-CN': ['同事', '邻居', '家人', '朋友', '老师', '同学', '上司', '陌生人'],
  'en': ['colleague', 'neighbor', 'family member', 'friend', 'teacher', 'classmate', 'boss', 'stranger'],
  'ja': ['同僚', '隣人', '家族', '友達', '先生', 'クラスメート', '上司', '知らない人'],
  'ko': ['동료', '이웃', '가족', '친구', '선생님', '동급생', '상사', '낯선 사람'],
  'vi': ['đồng nghiệp', 'hàng xóm', 'thành viên gia đình', 'bạn bè', 'giáo viên', 'bạn cùng lớp', 'sếp', 'người lạ'],
};
const ACTIONS = {
  'zh-TW': ['打招呼', '微笑', '自我介紹', '問候', '表達關心'],
  'zh-CN': ['打招呼', '微笑', '自我介绍', '问候', '表达关心'],
  'en': ['greet', 'smile', 'introduce yourself', 'say hello', 'show care'],
  'ja': ['挨拶する', '微笑む', '自己紹介する', '声をかける', '気遣う'],
  'ko': ['인사하기', '미소 짓기', '자기소개', '안부 묻기', '관심 표현하기'],
  'vi': ['chào hỏi', 'mỉm cười', 'giới thiệu bản thân', 'chào hỏi', 'thể hiện sự quan tâm'],
};
const EVENTS = {
  'zh-TW': ['聚會', '運動', '晚餐', '電影', '旅行', '讀書會'],
  'zh-CN': ['聚会', '运动', '晚餐', '电影', '旅行', '读书会'],
  'en': ['party', 'sports', 'dinner', 'movie', 'trip', 'book club'],
  'ja': ['パーティー', 'スポーツ', '夕食', '映画', '旅行', '読書会'],
  'ko': ['파티', '운동', '저녁 식사', '영화', '여행', '독서 모임'],
  'vi': ['tiệc tùng', 'thể thao', 'bữa tối', 'phim ảnh', 'du lịch', 'câu lạc bộ sách'],
};
const RESPONSES = {
  'zh-TW': ['答應', '婉拒', '考慮', '推遲', '接受'],
  'zh-CN': ['答应', '婉拒', '考虑', '推迟', '接受'],
  'en': ['accept', 'decline', 'consider', 'postpone', 'agree'],
  'ja': ['受ける', '断る', '考える', '延期する', '同意する'],
  'ko': ['수락', '거절', '고려', '연기', '동의'],
  'vi': ['chấp nhận', 'từ chối', 'xem xét', 'hoãn lại', 'đồng ý'],
};
const EMOTIONS = {
  'zh-TW': ['開心', '緊張', '感動', '難過', '興奮', '平靜', '焦慮', '自信', '感恩', '驕傲', '放鬆', '期待', '好奇'],
  'zh-CN': ['开心', '紧张', '感动', '难过', '兴奋', '平静', '焦虑', '自信', '感恩', '骄傲', '放松', '期待', '好奇'],
  'en': ['happy', 'nervous', 'touched', 'sad', 'excited', 'calm', 'anxious', 'confident', 'grateful', 'proud', 'relaxed', 'expectant', 'curious'],
  'ja': ['嬉しい', '緊張', '感動', '悲しい', 'ワクワク', '穏やか', '不安', '自信', '感謝', '誇り', 'リラックス', '期待', '好奇心'],
  'ko': ['기쁨', '긴장', '감동', '슬픔', '흥분', '평정', '긴장', '자신감', '감사', '자랑', '편안함', '기대', '호기심'],
  'vi': ['vui mừng', 'căng thẳng', 'cảm động', 'buồn', 'hào hứng', 'bình tĩnh', 'căng thẳng', 'tự tin', 'cảm ơn', 'tự hào', 'thoải mái', 'mong đợi', 'tò mò'],
};
const REQUESTS = {
  'zh-TW': ['借錢', '幫忙搬家', '協助找工作', '照顧寵物', '陪伴聊天', '幫忙修電腦', '一起運動', '借用物品', '幫忙準備報告', '協助照顧家人'],
  'zh-CN': ['借钱', '帮忙搬家', '协助找工作', '照顾宠物', '陪伴聊天', '帮忙修电脑', '一起运动', '借用物品', '帮忙准备报告', '协助照顾家人'],
  'en': ['borrow money', 'help move', 'find a job', 'pet sitting', 'have a chat', 'fix a computer', 'work out together', 'borrow something', 'prepare a report', 'take care of family'],
  'ja': ['お金を借りる', '引っ越しを手伝う', '仕事探しを手伝う', 'ペットの世話', '話し相手になる', 'パソコン修理を頼む', '一緒に運動する', '物を借りる', 'レポート作成を手伝う', '家族の世話を頼む'],
  'ko': ['돈 빌리기', '이사 도와주기', '취업 도와주기', '애완 돌보기', '이야기 하는 사람', '컴퓨터 고치기 도와주기', '함께 운동하기', '물건 빌리기', '보고서 준비하기', '가족 돌보기'],
  'vi': ['vay tiền', 'giúp đỡ chuyển đi', 'giúp đỡ tìm việc', 'chăm sóc thú cưng', 'nói chuyện với người bạn', 'giúp sửa máy tính', 'cùng làm thể thao', 'mượn đồ', 'chuẩn bị báo cáo', 'chăm sóc gia đình'],
};
// 根據日期和 lang 產生唯一情境
function seededRandom(seed: number) { let x = Math.sin(seed) * 10000; return x - Math.floor(x); }
function generateScenario(lang: 'zh-TW'|'zh-CN'|'en'|'ja'|'ko'|'vi', dateStr: string) {
  const dateSeed = parseInt(dateStr.replace(/-/g, ''), 10);
  const templates = SCENARIO_TEMPLATES[lang];
  const tIdx = Math.floor(seededRandom(dateSeed) * templates.length);
  let template = templates[tIdx];
  const relation = RELATIONS[lang][Math.floor(seededRandom(dateSeed+1) * RELATIONS[lang].length)];
  const action = ACTIONS[lang][Math.floor(seededRandom(dateSeed+2) * ACTIONS[lang].length)];
  const event = EVENTS[lang][Math.floor(seededRandom(dateSeed+3) * EVENTS[lang].length)];
  const response = RESPONSES[lang][Math.floor(seededRandom(dateSeed+4) * RESPONSES[lang].length)];
  const emotion = EMOTIONS[lang][Math.floor(seededRandom(dateSeed+5) * EMOTIONS[lang].length)];
  const request = REQUESTS[lang][Math.floor(seededRandom(dateSeed+6) * REQUESTS[lang].length)];
  // 讓請求情境更具體
  if (template.includes('請求{relation}幫忙')) {
    template = template.replace('請求{relation}幫忙', `請求{relation}幫忙${request}`);
  }
  if (template.includes('请求{relation}帮忙')) {
    template = template.replace('请求{relation}帮忙', `请求{relation}帮忙${request}`);
  }
  if (template.includes('ask a {relation} for help')) {
    template = template.replace('ask a {relation} for help', `ask a {relation} to help you ${request}`);
  }
  if (template.includes('{relation}に助けを求めたいです')) {
    template = template.replace('{relation}に助けを求めたいです', `{relation}に${request}を頼みたいです`);
  }
  return template
    .replace('{relation}', relation)
    .replace('{action}', action)
    .replace('{event}', event)
    .replace('{response}', response)
    .replace('{emotion}', emotion);
}
// 動態展示徽章/成就
function renderAchievements(badgeCount:number, lang:string) {
  const trophy = Math.floor(badgeCount/10);
  const crown = Math.floor(trophy/10);
  const castle = Math.floor(crown/10);
  const palace = Math.floor(castle/10);
  const badge = badgeCount%10;
  const trophyR = trophy%10;
  const crownR = crown%10;
  const castleR = castle%10;
  return (
    <div style={{display:'flex',alignItems:'center',gap:4,flexWrap:'wrap',marginTop:8}}>
      {[...Array(badge)].map((_,i)=>(<span key={'b'+i} style={{fontSize:28}}>🦸‍♂️</span>))}
      {[...Array(trophyR)].map((_,i)=>(<span key={'t'+i} style={{fontSize:28}}>🏆</span>))}
      {[...Array(crownR)].map((_,i)=>(<span key={'c'+i} style={{fontSize:28}}>👑</span>))}
      {[...Array(castleR)].map((_,i)=>(<span key={'s'+i} style={{fontSize:28}}>🏯</span>))}
      {[...Array(palace)].map((_,i)=>(<span key={'p'+i} style={{fontSize:32}}>🏰🫅</span>))}
    </div>
  );
}
// SkillBox 主體
export default function SkillBox() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { lang, setLang } = useLanguage();
  const today = new Date().toISOString().slice(0, 10);
  const scenarioText = generateScenario(lang, today);
  const [input, setInput] = useState('');
  const [aiReply, setAiReply] = useState('');
  const { badges, rank, promotion, addBadge } = useUserStatus();
  const [recording, setRecording] = useState(false);
  const { setVideoReaction } = useVideoReaction();
  const [speechError, setSpeechError] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  // 在組件頂部定義 SpeechRecognition 與 recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  let recognition: any = null;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }
  const handleSend = async () => {
    if(!input.trim())return;
    setAiReply(`AI分析：你的回答很棒！（mock）建議：保持自信，語氣自然。`);
    // 完成互動給徽章與晉升
    const promoted = addBadge();
    if (promoted && setVideoReaction) setVideoReaction('encouragement'); // 晉升時播放影片
  };
  const handleVoice = () => {
    if (!SpeechRecognition) {
      setSpeechError(lang==='zh-TW'?'此瀏覽器不支援語音辨識，請改用 Chrome/Edge。':lang==='zh-CN'?'此浏览器不支持语音识别，请改用 Chrome/Edge。':lang==='ja'?'このブラウザは音声認識に対応していません。Chrome/Edgeを使ってください。':'This browser does not support speech recognition. Please use Chrome/Edge.');
      return;
    }
    setSpeechError('');
    setRecognizing(true);
    setLastTranscript('');
    try {
      recognition.start();
    } catch (e) {
      setSpeechError(lang==='zh-TW'?'請允許麥克風權限，並確認沒有其他錄音程式正在使用麥克風。':lang==='zh-CN'?'请允许麦克风权限，并确认没有其他录音程序正在使用麦克风。':lang==='ja'?'マイクの権限を許可し、他の録音アプリが使っていないか確認してください。':'Please allow microphone permission and make sure no other app is using the mic.');
      setRecognizing(false);
    }
  };
  // 多語言情緒分析
  async function detectEmotionByAI(text: string, lang: string, apiKey: string): Promise<VideoReactionType> {
    const prompt = {
      'zh-TW': `請判斷下列用戶輸入的主要情緒，只回傳一個英文單字（joy, gratitude, encouragement, motivation, reproach, disappointment, lost, breakthrough, clarity, sadness, anger, neutral, reluctance, confusion, affection, regret, admiration, teasing）\n用戶輸入：${text}`,
      'zh-CN': `请判断下列用户输入的主要情绪，只返回一个英文单词（joy, gratitude, encouragement, motivation, reproach, disappointment, lost, breakthrough, clarity, sadness, anger, neutral, reluctance, confusion, affection, regret, admiration, teasing）\n用户输入：${text}`,
      'en': `Please judge the main emotion of the following user input. Only return one English word (joy, gratitude, encouragement, motivation, reproach, disappointment, lost, breakthrough, clarity, sadness, anger, neutral, reluctance, confusion, affection, regret, admiration, teasing)\nUser input: ${text}`,
      'ja': `次のユーザー入力の主な感情を判断してください。英語の単語1つだけ返してください（joy, gratitude, encouragement, motivation, reproach, disappointment, lost, breakthrough, clarity, sadness, anger, neutral, reluctance, confusion, affection, regret, admiration, teasing）\nユーザー入力：${text}`,
    }[lang] || text;
    try {
      const emotion = await generateResponse([
        { role: 'assistant', content: '你是一個情緒分析助手，只回傳一個英文情緒單字。' },
        { role: 'user', content: prompt },
      ], apiKey);
      const key = emotion.trim().toLowerCase();
      return EMOTION_TO_REACTION[key] || 'encouragement';
    } catch {
      return 'encouragement';
    }
  }
  const UI_TEXT: Record<string, { home: string; backHome: string; skillbox: string; scenario: string; send: string; achievements: string; voice: string; answer: string }> = {
    'zh-TW': { home: '首頁', backHome: '返回首頁', skillbox: '情境模擬室', scenario: '情境', send: '送出', achievements: '成就', voice: '語音', answer: '你的回答...' },
    'zh-CN': { home: '首页', backHome: '返回首页', skillbox: '情境模拟室', scenario: '情境', send: '送出', achievements: '成就', voice: '语音', answer: '你的回答...' },
    'en': { home: 'Home', backHome: 'Back to Home', skillbox: 'SkillBox', scenario: 'Scenario', send: 'Send', achievements: 'Achievements', voice: 'Voice', answer: 'Your answer...' },
    'ja': { home: 'ホームへ戻る', backHome: 'ホームへ戻る', skillbox: 'スキルボックス', scenario: 'シナリオ', send: '送信', achievements: '実績', voice: '音声', answer: 'あなたの答え...' },
    'ko': { home: '홈으로', backHome: '홈으로', skillbox: '스킬박스', scenario: '상황', send: '보내기', achievements: '업적', voice: '음성', answer: '당신의 답변...' },
    'vi': { home: 'Trang chủ', backHome: 'Trang chủ', skillbox: 'Phòng thí nghiệm Kỹ năng', scenario: 'Tình huống', send: 'Gửi', achievements: 'Thành tích', voice: 'Giọng nói', answer: 'Câu trả lời của bạn...' },
  };
  return (
    <div className="modern-bg" style={{ background: `url('/donkey.png') center center / cover no-repeat`, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{position:'absolute',top:0,left:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',gap:12}}>
        <button className="topbar-btn" onClick={()=>navigate('/')} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{UI_TEXT[lang].backHome}</button>
      </div>
      <div style={{position:'absolute',top:0,right:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',gap:12}}>
        <button className="topbar-btn" onClick={async()=>{await signOut(auth);localStorage.clear();window.location.href='/';}} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{String(lang)==='zh-TW'?'登出':String(lang)==='zh-CN'?'登出':String(lang)==='ja'?'ログアウト':String(lang)==='ko'?'로그아웃':String(lang)==='vi'?'Đăng xuất':'Logout'}</button>
        <select className="topbar-select" value={lang} onChange={e=>{localStorage.setItem('lang',e.target.value);window.location.reload();}} style={{padding:'6px 14px',borderRadius:8,fontWeight:600,border:'1.5px solid #6B5BFF',color:'#6B5BFF',background:'#fff',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>
          <option value="zh-TW">繁中</option>
          <option value="zh-CN">简中</option>
          <option value="en">EN</option>
          <option value="ja">日文</option>
          <option value="ko">한국어</option>
          <option value="vi">Tiếng Việt</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#6B5BFF', textShadow: '0 2px 12px #6B5BFF88, 0 4px 24px #0008', letterSpacing:1, background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #6B5BFF22', padding:'12px 32px', margin:0, marginBottom: 24, display:'flex',alignItems:'center',gap:12 }}>🛠️ {UI_TEXT[lang].skillbox}</h2>
        <div style={{ maxWidth: 540, width: '100%', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, display:'flex',alignItems:'center',gap:8, color:'#6B5BFF', textShadow:'0 2px 12px #6B5BFF88, 0 4px 24px #0008', letterSpacing:1 }}>🛠️ {UI_TEXT[lang].skillbox}</h2>
          <div style={{ fontSize: 18, color: '#614425', fontWeight: 700, marginBottom: 18, display:'flex',alignItems:'center',gap:8 }}>{SUBTITLE[lang]}</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: '#6B5BFF', fontWeight: 700 }}>{UI_TEXT[lang].scenario}:</span>
              <span style={{ color: '#222', fontWeight: 600 }}> {scenarioText}</span>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={UI_TEXT[lang].answer} style={{ width: '100%', minHeight: 48, borderRadius: 8, border: '1px solid #ddd', padding: 10, fontSize: 16, marginTop: 8 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button 
                onClick={handleVoice} 
                style={{ borderRadius: '50%', width: 36, height: 36, background: '#6B5BFF', color: '#fff', border: 'none', fontSize: 18, transition: 'background 0.18s, box-shadow 0.18s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#4a3bbf'; e.currentTarget.style.boxShadow = '0 2px 12px #6B5BFF55'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#6B5BFF'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {recording ? VOICE_RECORDING[lang] : VOICE_BTN[lang]}
              </button>
              {speechError && <div style={{ color: '#d32f2f', marginTop: 6, fontSize: 15 }}>{speechError}</div>}
              <button 
                onClick={handleSend} 
                style={{ borderRadius: 8, background: '#23c6e6', color: '#fff', border: 'none', fontWeight: 700, padding: '6px 18px', transition: 'background 0.18s, box-shadow 0.18s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#1ba3c2'; e.currentTarget.style.boxShadow = '0 2px 12px #23c6e655'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#23c6e6'; e.currentTarget.style.boxShadow = 'none'; }}
              >{UI_TEXT[lang].send}</button>
            </div>
            {aiReply && <div style={{ background: '#f7f7ff', borderRadius: 10, padding: 14, marginTop: 16, color: '#6B5BFF', fontWeight: 700 }}>{aiReply}</div>}
          </div>
          <div style={{ marginTop: 18, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <b style={{ minWidth: 64, textAlign: 'left', fontSize: 22, color: '#6B5BFF', textShadow: '0 2px 8px #6B5BFF33, 0 4px 16px #0002', fontWeight: 900, letterSpacing: 1 }}>{UI_TEXT[lang].achievements}:</b>
              {renderAchievements(badges, lang)}
              <span style={{marginLeft:12, fontSize:20}}>{rank?.icon} {rank?.name_zh}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 