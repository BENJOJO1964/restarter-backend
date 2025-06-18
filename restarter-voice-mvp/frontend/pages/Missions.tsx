import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import VideoReactionPlayer, { VideoReactionType } from '../components/VideoReactionPlayer';
import { useVideoReaction } from '../components/VideoReactionContext';
import { useUserStatus } from '../hooks/useUserStatus';
import { UI_TEXT, useLanguage, LanguageCode } from '../shared/i18n';
import { RecommendationList } from '../components/RecommendationList';
import { mockUsers } from '../shared/recommendation';
const TEXT: Record<string, { title: string; empty: string }> = {
  'zh-TW': { title: '任務挑戰', empty: '今天還沒有任務，明天再來看看！' },
  'zh-CN': { title: '任务挑战', empty: '今天还没有任务，明天再来看看！' },
  'en': { title: 'Restart Missions', empty: 'No missions for today. Check back tomorrow!' },
  'ja': { title: 'ミッション挑戦', empty: '今日はミッションがありません。明日また見てみましょう！' },
  'ko': { title: '미션 도전', empty: '오늘은 미션이 없습니다. 내일 다시 확인해 주세요!' },
};
const BADGES = ['🌟','🏅','🎖️','🥇'];
const mockMissions = [
  { id: 1, title: '與一位朋友分享今天的心情', done: false },
  { id: 2, title: '完成一篇日記', done: false },
  { id: 3, title: '閱讀一則 AI 回應', done: false },
];
const GUIDE: Record<string, string> = {
  'zh-TW': '還沒有任務嗎？點一下下方按鈕，馬上領取一個小挑戰，讓今天有個小小進步！',
  'zh-CN': '还没有任务？点一下下方按钮，马上领取一个小挑战，让今天有个小小进步！',
  'en': "No missions yet? Click the button below to get a small challenge and make a little progress today!",
  'ja': 'まだミッションがありませんか？下のボタンを押して、小さなチャレンジを始めましょう！'
};
// 多語言模板與細節
const MISSION_TEMPLATES = {
  'zh-TW': [
    "與一位朋友聊聊你最近的『{topic}』，並分享你的感受。",
    "今天主動關心一位家人，問問他們對『{topic}』的看法。",
    "寫下三件讓你感到『{emotion}』的事，並思考原因。",
    "嘗試稱讚一位同事或同學，理由是『{reason}』。",
    "主動幫助一位需要協助的人，並記錄你的『{emotion}』感受。",
    "和朋友討論『{topic}』，並交換彼此的想法。",
    "給自己一個小小的獎勵，因為你今天『{achievement}』。",
    "主動和陌生人打招呼，並觀察自己的『{emotion}』變化。",
    "分享一個你最近學到的『{knowledge}』，並應用在生活中。",
    "寫下今天遇到的『{challenge}』，以及你的解決方法。",
  ],
  'zh-CN': [
    "和一位朋友聊聊你最近的『{topic}』，并分享你的感受。",
    "今天主动关心一位家人，问问他们对『{topic}』的看法。",
    "写下三件让你感到『{emotion}』的事，并思考原因。",
    "试着称赞一位同事或同学，理由是『{reason}』。",
    "主动帮助一位需要协助的人，并记录你的『{emotion}』感受。",
    "和朋友讨论『{topic}』，并交换彼此的想法。",
    "给自己一个小小的奖励，因为你今天『{achievement}』。",
    "主动和陌生人打招呼，并观察自己的『{emotion}』变化。",
    "分享一个你最近学到的『{knowledge}』，并应用在生活中。",
    "写下今天遇到的『{challenge}』，以及你的解决方法。",
  ],
  'en': [
    "Talk to a friend about your recent '{topic}' and share your feelings.",
    "Show care to a family member today and ask their thoughts on '{topic}'.",
    "Write down three things that made you feel '{emotion}' and reflect on why.",
    "Try complimenting a colleague or classmate for '{reason}'.",
    "Help someone in need and record your '{emotion}' afterwards.",
    "Discuss '{topic}' with a friend and exchange ideas.",
    "Reward yourself for '{achievement}' today.",
    "Greet a stranger and observe your '{emotion}' change.",
    "Share a piece of '{knowledge}' you recently learned and apply it in life.",
    "Write about a '{challenge}' you faced today and your solution.",
  ],
  'ja': [
    "最近の『{topic}』について友達と話し、気持ちを共有しましょう。",
    "今日は家族の誰かに『{topic}』についてどう思うか聞いてみましょう。",
    "『{emotion}』と感じたことを3つ書き出し、その理由を考えてみましょう。",
    "同僚やクラスメートを『{reason}』で褒めてみましょう。",
    "助けが必要な人を手伝い、その後の『{emotion}』を記録しましょう。",
    "友達と『{topic}』について話し合い、お互いの考えを交換しましょう。",
    "今日は『{achievement}』を達成した自分にご褒美をあげましょう。",
    "知らない人に挨拶し、自分の『{emotion}』の変化を観察しましょう。",
    "最近学んだ『{knowledge}』を共有し、生活に活かしましょう。",
    "今日直面した『{challenge}』とその解決方法を書きましょう。",
  ],
  'ko': [
    "행복", "감동", "평온", "불안", "자신감", "감사", "자부심", "편안", "기대", "호기심"],
  'vi': ["vui vẻ", "cảm động", "bình tĩnh", "lo lắng", "tự tin", "biết ơn", "tự hào", "thư giãn", "mong đợi", "tò mò"],
};
const TOPICS = {
  'zh-TW': ["工作", "學習", "健康", "興趣", "家庭", "夢想", "壓力", "人際關係", "理財", "旅遊"],
  'zh-CN': ["工作", "学习", "健康", "兴趣", "家庭", "梦想", "压力", "人际关系", "理财", "旅游"],
  'en': ["work", "study", "health", "hobbies", "family", "dreams", "stress", "relationships", "finance", "travel"],
  'ja': ["仕事", "勉強", "健康", "趣味", "家族", "夢", "ストレス", "人間関係", "お金", "旅行"],
  'ko': ["일", "학습", "건강", "취미", "가족", "꿈", "스트레스", "인간관계", "재정", "여행"],
  'vi': ["công việc", "học tập", "sức khỏe", "sở thích", "gia đình", "ước mơ", "áp lực", "mối quan hệ", "tài chính", "du lịch"],
};
const EMOTIONS = {
  'zh-TW': ["開心", "感動", "平靜", "焦慮", "自信", "感恩", "驕傲", "放鬆", "期待", "好奇"],
  'zh-CN': ["开心", "感动", "平静", "焦虑", "自信", "感恩", "骄傲", "放松", "期待", "好奇"],
  'en': ["happy", "touched", "calm", "anxious", "confident", "grateful", "proud", "relaxed", "expectant", "curious"],
  'ja': ["嬉しい", "感動", "穏やか", "不安", "自信", "感謝", "誇り", "リラックス", "期待", "好奇心"],
  'ko': ["행복", "감동", "평온", "불안", "자신감", "감사", "자부심", "편안", "기대", "호기심"],
  'vi': ["vui vẻ", "cảm động", "bình tĩnh", "lo lắng", "tự tin", "biết ơn", "tự hào", "thư giãn", "mong đợi", "tò mò"],
};
const REASONS = {
  'zh-TW': ["他很努力", "他最近進步了", "他幫助過你", "他很有創意", "他很貼心"],
  'zh-CN': ["他很努力", "他最近进步了", "他帮助过你", "他很有创意", "他很贴心"],
  'en': ["their hard work", "their recent progress", "their help", "their creativity", "their thoughtfulness"],
  'ja': ["努力しているから", "最近成長したから", "助けてくれたから", "創造力があるから", "気配りができるから"],
  'ko': ["그의 노력", "최근의 발전", "도움을 준 것", "창의성", "배려심"],
  'vi': ["sự chăm chỉ của họ", "tiến bộ gần đây", "sự giúp đỡ", "sáng tạo", "sự chu đáo"],
};
const ACHIEVEMENTS = {
  'zh-TW': ["完成一項任務", "克服一個困難", "學會新技能", "幫助別人", "堅持運動"],
  'zh-CN': ["完成一项任务", "克服一个困难", "学会新技能", "帮助别人", "坚持锻炼"],
  'en': ["completing a task", "overcoming a challenge", "learning a new skill", "helping others", "keeping up exercise"],
  'ja': ["タスクを完了した", "困難を乗り越えた", "新しいスキルを身につけた", "人を助けた", "運動を続けた"],
  'ko': ["작업 완료", "어려움 극복", "새로운 기술 습득", "다른 사람 돕기", "운동 유지"],
  'vi': ["hoàn thành nhiệm vụ", "vượt qua thử thách", "học kỹ năng mới", "giúp đỡ người khác", "duy trì tập thể dục"],
};
const KNOWLEDGE = {
  'zh-TW': ["新知識", "新技能", "有趣的事實", "生活小技巧", "健康知識"],
  'zh-CN': ["新知识", "新技能", "有趣的事实", "生活小技巧", "健康知识"],
  'en': ["new knowledge", "new skills", "interesting facts", "life hacks", "health tips"],
  'ja': ["新しい知識", "新しいスキル", "面白い事実", "生活のコツ", "健康の知識"],
  'ko': ["새로운 지식", "새로운 기술", "흥미로운 사실", "생활 팁", "건강 지식"],
  'vi': ["kiến thức mới", "kỹ năng mới", "sự thật thú vị", "mẹo sống", "kiến thức sức khỏe"],
};
const CHALLENGES = {
  'zh-TW': ["困難", "挑戰", "煩惱", "誤會", "壓力來源"],
  'zh-CN': ["困难", "挑战", "烦恼", "误会", "压力来源"],
  'en': ["difficulty", "challenge", "trouble", "misunderstanding", "source of stress"],
  'ja': ["困難", "チャレンジ", "悩み", "誤解", "ストレスの原因"],
  'ko': ["어려움", "도전", "고민", "오해", "스트레스 원인"],
  'vi': ["khó khăn", "thử thách", "rắc rối", "hiểu lầm", "nguồn căng thẳng"],
};
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function generateDailyMission(dateStr: string, lang: 'zh-TW'|'zh-CN'|'en'|'ja'|'ko') {
  const dateSeed = parseInt(dateStr.replace(/-/g, ''), 10);
  const templates = MISSION_TEMPLATES[lang];
  const templateIdx = Math.floor(seededRandom(dateSeed) * templates.length);
  const template = templates[templateIdx];
  const topic = TOPICS[lang][Math.floor(seededRandom(dateSeed + 1) * TOPICS[lang].length)];
  const emotion = EMOTIONS[lang][Math.floor(seededRandom(dateSeed + 2) * EMOTIONS[lang].length)];
  const reason = REASONS[lang][Math.floor(seededRandom(dateSeed + 3) * REASONS[lang].length)];
  const achievement = ACHIEVEMENTS[lang][Math.floor(seededRandom(dateSeed + 4) * ACHIEVEMENTS[lang].length)];
  const knowledge = KNOWLEDGE[lang][Math.floor(seededRandom(dateSeed + 5) * KNOWLEDGE[lang].length)];
  const challenge = CHALLENGES[lang][Math.floor(seededRandom(dateSeed + 6) * CHALLENGES[lang].length)];
  return template
    .replace('{topic}', topic)
    .replace('{emotion}', emotion)
    .replace('{reason}', reason)
    .replace('{achievement}', achievement)
    .replace('{knowledge}', knowledge)
    .replace('{challenge}', challenge);
}
// 動態展示徽章/成就
function renderAchievements(badgeCount:number) {
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
export default function Missions() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { lang, setLang } = useLanguage();
  const [missions, setMissions] = useState<any[]>(JSON.parse(localStorage.getItem('missions')||'[]')||[]);
  const { badges, rank, promotion, addBadge } = useUserStatus();
  const [missionInput, setMissionInput] = useState('');
  const [records, setRecords] = useState<any[]>(JSON.parse(localStorage.getItem('missionRecords')||'[]')||[]);
  const { setVideoReaction } = useVideoReaction();
  // 假資料
  const [mission, setMission] = useState<string|null>(null);
  useEffect(() => {
    fetch('/api/mission').then(r=>r.json()).then(data=>setMission(data.mission)).catch(()=>{
      setMission('今天主動關心一位家人，問問他們對「家庭」的看法。');
    });
  }, []);

  // 在 useEffect 中根據語言產生每日唯一任務
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const langTyped = (lang as 'zh-TW'|'zh-CN'|'en'|'ja'|'ko');
    const stored = JSON.parse(localStorage.getItem('missions')||'[]');
    if (!stored.length || stored[0].date !== today || stored[0].lang !== langTyped) {
      const newMission = {
        title: generateDailyMission(today, langTyped),
        date: today,
        lang: langTyped,
        completed: false,
      };
      setMissions([newMission]);
      localStorage.setItem('missions', JSON.stringify([newMission]));
    } else {
      setMissions(stored);
    }
  }, [lang]);

  // 領取新任務
  const handleClaim = () => {
    setMissions(mockMissions);
    setMissionInput('');
  };

  // 匯出成就
  const handleExport = () => {
    if (!missions.length || !missionInput.trim()) return;
    const record = {
      date: new Date().toISOString(),
      mission: missions[0],
      solution: missionInput.trim(),
    };
    const newRecords = [record, ...records];
    setRecords(newRecords);
    localStorage.setItem('missionRecords', JSON.stringify(newRecords));
    setMissionInput('');
    // 完成任務給徽章與晉升
    const promoted = addBadge();
    if (promoted && setVideoReaction) setVideoReaction('encouragement'); // 晉升時播放影片
    const newMissions = missions.slice(1);
    setMissions(newMissions);
    localStorage.setItem('missions', JSON.stringify(newMissions));
  };

  // 放棄/跳過任務（假設有此功能）
  const handleGiveUp = () => {
    // 這裡可加上任務狀態變更邏輯
  };

  // 重新啟動連續任務（假設有此功能）
  const handleRestart = () => {
    // 這裡可加上任務重啟邏輯
  };

  return (
    <div>
      <div style={{position:'absolute',top:0,left:0,width:'100%',zIndex:100,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 32px 0 32px',boxSizing:'border-box',background:'transparent'}}>
        <button className="topbar-btn" onClick={()=>navigate('/')} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{UI_TEXT[lang].backHome}</button>
        <div style={{position:'absolute',top:0,right:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',gap:12}}>
          <button className="topbar-btn" onClick={async()=>{await signOut(auth);localStorage.clear();window.location.href='/';}} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{UI_TEXT[lang].logout}</button>
          <select className="topbar-select" value={lang} onChange={e=>{localStorage.setItem('lang',e.target.value);window.location.reload();}} style={{padding:'6px 14px',borderRadius:8,fontWeight:600,border:'1.5px solid #6B5BFF',color:'#6B5BFF',background:'#fff',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>
            <option value="zh-TW">繁中</option>
            <option value="zh-CN">简中</option>
            <option value="en">EN</option>
            <option value="ja">日文</option>
            <option value="ko">한국어</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>
      </div>
      <div className="modern-bg" style={{ background: `url('/mountain.png') center center / cover no-repeat`, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 540, background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px #0002', position: 'relative', minHeight: 520 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#6B5BFF', marginBottom: 8, textShadow: '0 2px 12px #6B5BFF88, 0 4px 24px #0008', textAlign:'center', letterSpacing:1 }}>🎯 {UI_TEXT[lang].title}</div>
          <div style={{ fontSize: 22, color: '#fff', fontWeight: 900, marginBottom: 24, textAlign:'center', textShadow:'0 2px 12px #6B5BFF88, 0 4px 24px #0008' }}>{UI_TEXT[lang].subtitle}</div>
          <div style={{ marginTop: 8 }}>
            {missions.length === 0 ? (
              <>
                <div style={{ color: '#6B5BFF', fontWeight: 700, marginBottom: 10 }}>{GUIDE[lang]}</div>
                <button
                  onClick={handleClaim}
                  style={{ borderRadius: 8, background: '#23c6e6', color: '#fff', border: 'none', fontWeight: 700, padding: '8px 22px', fontSize: 16, marginBottom: 8, cursor:'pointer', transition:'background 0.18s' }}
                  onMouseOver={e=>{e.currentTarget.style.background='#1bb0cc';}}
                  onMouseOut={e=>{e.currentTarget.style.background='#23c6e6';}}
                >{UI_TEXT[lang].home}</button>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 900, fontSize: 28, marginBottom: 8, color:'#614425', marginTop:0, letterSpacing:1 }}>{UI_TEXT[lang].todayMission}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, marginTop:0 }}>{missions[0].title}</div>
                <div style={{ margin: '18px 0 8px 0', fontWeight: 700, color:'#614425', fontSize:18 }}>{UI_TEXT[lang].solution}</div>
                <textarea
                  value={missionInput}
                  onChange={e=>setMissionInput(e.target.value)}
                  placeholder={UI_TEXT[lang].placeholder}
                  style={{ width: '100%', minHeight: 120, borderRadius: 8, border: '1px solid #ddd', padding: 14, fontSize: 18, marginBottom: 18, resize:'vertical' }}
                />
                <div style={{ display:'flex', justifyContent:'center', marginBottom: 8 }}>
                  <button
                    onClick={handleExport}
                    style={{ borderRadius: 8, background: '#6B5BFF', color: '#fff', border: 'none', fontWeight: 700, padding: '10px 32px', fontSize: 18, cursor:'pointer', transition:'background 0.18s' }}
                    onMouseOver={e=>{e.currentTarget.style.background='#4a3bbf';}}
                    onMouseOut={e=>{e.currentTarget.style.background='#6B5BFF';}}
                  >{UI_TEXT[lang].export}</button>
                </div>
              </>
            )}
          </div>
          {/* 左下角成就展示，確保在卡片內部 */}
          <div style={{ position: 'absolute', left: 32, bottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <b style={{ fontSize: 22, color: '#6B5BFF', textShadow: '0 2px 8px #6B5BFF33, 0 4px 16px #0002', fontWeight: 900, letterSpacing: 1 }}>{UI_TEXT[lang].achievements}</b>
            {renderAchievements(badges)}
            <span style={{marginLeft:12, fontSize:20}}>{rank?.icon} {rank?.name_zh}</span>
          </div>
        </div>
      </div>
      {/* 推薦區塊 */}
      <RecommendationList type="mission" user={mockUsers[0]} />
      <RecommendationList type="group" user={mockUsers[0]} />
    </div>
  );
} 