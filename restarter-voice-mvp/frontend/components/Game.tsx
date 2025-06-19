import React, { useState, useEffect, useRef } from 'react';
import Hole from './Hole';
import EndScreen from './EndScreen';

// 多語系音效 API 介面（可改 fetch）
const getMoleSound = async (lang: string) => {
  // 可改為 fetch(`/api/sound?lang=${lang}`)
  return `/whack-${lang}.mp3`;
};

const getLevel = (score: number) => {
  if (score >= 360) return 5;
  if (score >= 270) return 4;
  if (score >= 180) return 3;
  if (score >= 90) return 2;
  return 1;
};

const MOLE_VISIBLE_TIME_BASE = 900; // 基礎可見時間(ms)
const POP_INTERVAL_BASE = 700; // 基礎間隔(ms)
const LEVELS = 6;

// 低分嘲諷語
const lowScoreInsults = [
  "你是地鼠的心靈輔導吧？捨不得下手？",
  "你這樣打，地鼠都想幫你懺悔教室。",
  "拳頭那麼軟，連社會邊緣人聯盟都打不贏。",
  "你不如乾脆報名廢物研究所算了。",
  "打個地鼠打得跟心如止水研習班一樣認真。",
  "快醒醒！這裡不是慢動作選手訓練班。",
  "你不如乾脆報名睡覺大賽算了。",
  "地鼠新娘打得都比你猛。",
  "睡覺大賽來了都不敢這樣打。",
  "慢動作選手來當隊友都嫌你拖後腿。"
];

// 地鼠專屬語音台詞
const moleVoiceLines = {
  "關到殘廢": [
    "老子不是不想改，是關太久腿軟。",
    "這拳頭沒在監獄用，現在全給你！",
    "吃牢飯吃到精神錯亂，揍你剛好！",
    "你以為我坐過牢就不會打？來！",
    "關到爬出來，拳頭都進化了。"
  ],
  "啥都不會": [
    "我就廢怎樣，你敢講就敢挨打！",
    "技術沒有，火氣一堆，先揍你！",
    "不會投履歷但會打你沒在手軟！",
    "不會面試但面你拳頭剛剛好。",
    "我什麼都不會，就會爆你頭。"
  ],
  "假死懶鬼": [
    "你怎麼又來煩我，裝死也要休息。",
    "別吵我爛命一條，揍我啊廢物！",
    "不想動但不代表不會反擊。",
    "懶得活但打你還是可以。",
    "你活著我都煩，滾！"
  ],
  "狗眼看人低": [
    "你不是看不起我？打給你看！",
    "眼睛長頭頂？我揍你變扁平族。",
    "你看低我？看清楚我拳頭先到！",
    "嘴巴高傲，拳頭幫你矯正一下。",
    "來來來，我是你不屑的未來。"
  ],
  "看你屁事": [
    "你瞄三小？打爛你那副眼神！",
    "我過我的人生，關你屁事？",
    "少在那邊關注哥，想被打？",
    "沒你的事滾一邊去，先打醒你。",
    "你不是很愛看？我給你精彩的。"
  ]
};

function getLevelByHitRate(hitCount: number, total: number, prevLevel: number) {
  if (total === 0) return 1;
  const rate = hitCount / total;
  if (rate > 0.9) {
    return Math.min(6, prevLevel + 1);
  } else if (rate <= 0.4) {
    return Math.max(1, prevLevel - 1);
  }
  return prevLevel;
}

interface GameProps {
  initialTime: number;
}

export default function Game({ initialTime }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [level, setLevel] = useState(1);
  const [currentMole, setCurrentMole] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [taunt, setTaunt] = useState('');
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<{name:string,score:number}[]>([]);
  const [moles, setMoles] = useState<any[]>([]);
  const [moleHitAnim, setMoleHitAnim] = useState(false);
  const [missed, setMissed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [molePos, setMolePos] = useState({x: 0, y: 0});
  const [totalMoleCount, setTotalMoleCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const popRef = useRef<NodeJS.Timeout|null>(null);
  const hideRef = useRef<NodeJS.Timeout|null>(null);

  // 載入地鼠資料
  useEffect(() => {
    fetch('/moles.json').then(r=>r.json()).then(setMoles);
  }, []);

  // 載入排行榜
  useEffect(() => {
    if (showRanking) {
      fetch('/rankings.json').then(r=>r.json()).then(setRanking);
    }
  }, [showRanking]);

  // 倒數計時
  useEffect(() => {
    if (!gameStarted) return; // 遊戲未開始不倒數
    if (timeLeft <= 0) {
      setShowEnd(true);
      setGameStarted(false);
      clearInterval(timerRef.current!);
      clearInterval(popRef.current!);
      clearTimeout(hideRef.current!);
      setCurrentMole(-1);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timeLeft, gameStarted]);

  // 地鼠隨機出現與自動縮回
  useEffect(() => {
    if (!gameStarted || showEnd || moles.length === 0) return;
    function popMole() {
      // 圓盤半徑 210px，地鼠半徑 40px，避免超出
      const r = 210;
      const center = 300;
      let angle = Math.random() * 2 * Math.PI;
      let dist = Math.random() * (r - 40);
      const x = center + dist * Math.cos(angle) - 40;
      const y = center + dist * Math.sin(angle) - 40;
      setMolePos({x, y});
      setCurrentMole(Math.floor(Math.random() * moles.length));
      setMissed(false);
      setTotalMoleCount(c => c + 1);
      const visibleTime = Math.max(300, MOLE_VISIBLE_TIME_BASE - (level-1)*120);
      hideRef.current = setTimeout(() => {
        setMolePos({x: -9999, y: -9999});
        if (!missed) setScore(s => s - 1); // 沒打到扣分
        setTimeout(popMole, Math.max(200, POP_INTERVAL_BASE - (level-1)*100));
      }, visibleTime);
    }
    popRef.current = setTimeout(popMole, 600);
    return () => {
      clearTimeout(popRef.current!);
      clearTimeout(hideRef.current!);
    };
  }, [showEnd, moles, gameStarted, level]);

  // 分數升級與命中率
  useEffect(() => {
    if (totalMoleCount === 0) return;
    setLevel(prev => getLevelByHitRate(hitCount, totalMoleCount, prev));
  }, [hitCount, totalMoleCount]);

  // 點擊地鼠
  const handleHit = async () => {
    setScore(s => s + 1);
    setHitCount(c => c + 1);
    setMissed(true);
    setMoleHitAnim(true);
    setTimeout(() => setMoleHitAnim(false), 200);
    setMolePos({x: -9999, y: -9999});
    const lang = localStorage.getItem('lang') || 'zh-TW';
    if (score < 40) {
      setTaunt(lowScoreInsults[Math.floor(Math.random() * lowScoreInsults.length)]);
    } else {
      const moleName = moles[currentMole]?.name?.[lang] || moles[currentMole]?.name?.['zh-TW'] || '';
      const voiceLines = moleVoiceLines[moleName as keyof typeof moleVoiceLines] || [];
      if (voiceLines.length > 0) {
        setTaunt(voiceLines[Math.floor(Math.random() * voiceLines.length)]);
      } else {
        const taunts = moles[currentMole]?.taunts?.[lang] || moles[currentMole]?.taunts?.['zh-TW'] || [];
        setTaunt(taunts[Math.floor(Math.random() * taunts.length)] || '');
      }
    }
    try {
      const soundUrl = await getMoleSound(lang);
      const audio = new window.Audio(soundUrl);
      audio.play();
    } catch (e) {}
  };

  // 重新開始
  const handleRestart = () => {
    setScore(0);
    setTimeLeft(selectedTime);
    setLevel(1);
    setShowEnd(false);
    setTaunt('');
    setGameStarted(false);
    setTotalMoleCount(0);
    setHitCount(0);
  };

  // 開始遊戲
  const handleStart = () => {
    setScore(0);
    setTimeLeft(selectedTime);
    setLevel(1);
    setShowEnd(false);
    setTaunt('');
    setGameStarted(true);
  };

  // LOGO
  const logo = <img src="/ctx-logo.png" alt="logo" style={{height:90,position:'fixed',top:24,left:80,zIndex:100,transition:'all 0.3s'}} />;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', position: 'relative' }}>
      {logo}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        {/* 遊戲未開始時顯示開始按鈕與計時選擇 */}
        {!gameStarted && !showEnd && (
          <div style={{ marginTop: 80, marginBottom: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>選擇遊戲時間</div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
              <button onClick={()=>setSelectedTime(30)} style={{ fontSize: 22, padding: '10px 32px', borderRadius: 12, border: selectedTime===30?'2px solid #614425':'2px solid #ccc', background: selectedTime===30?'#f7e7c1':'#fff', color:'#614425', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>30秒</button>
              <button onClick={()=>setSelectedTime(60)} style={{ fontSize: 22, padding: '10px 32px', borderRadius: 12, border: selectedTime===60?'2px solid #614425':'2px solid #ccc', background: selectedTime===60?'#f7e7c1':'#fff', color:'#614425', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>60秒</button>
            </div>
            <button onClick={handleStart} style={{ fontSize: 28, padding: '16px 64px', borderRadius: 16, background: '#a97c50', color: '#fff', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px #61442533', transition:'all 0.2s', marginTop: 16 }} onMouseOver={e=>e.currentTarget.style.background='#614425'} onMouseOut={e=>e.currentTarget.style.background='#a97c50'}>開始</button>
          </div>
        )}
        {/* 分數區塊 */}
        {gameStarted && (
        <div style={{ display: 'flex', gap: 32, marginBottom: 24, marginTop: 32, alignItems: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#6B5BFF', background:'#f7f7ff', borderRadius:12, padding:'8px 24px', boxShadow:'0 2px 12px #6B5BFF22' }}>分數: {score}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#614425', background:'#fffbe6', borderRadius:12, padding:'8px 18px', boxShadow:'0 2px 12px #FFD70022' }}>等級: {level}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', background:'#23c6e6', borderRadius:12, padding:'8px 18px', boxShadow:'0 2px 12px #23c6e622' }}>倒數: {timeLeft}s</div>
          <button style={{ fontSize: 18, fontWeight: 700, color: '#fff', background:'#6B5BFF', borderRadius:10, padding:'8px 18px', border:'none', boxShadow:'0 2px 12px #6B5BFF33', cursor:'pointer' }} onClick={()=>setShowRanking(true)}>排行榜</button>
        </div>
        )}
        {/* 圓盤+隨機地鼠 */}
        {gameStarted && (
        <div style={{ width: 600, height: 600, borderRadius: '50%', background: `url('/orange-dirt.png') center/cover no-repeat`, boxShadow: '0 4px 32px #61442522', position: 'relative', marginBottom: 32 }}>
          <div style={{ position: 'absolute', left: molePos.x, top: molePos.y, zIndex: 2 }}>
            <Hole active={true} mole={{name:moles[currentMole]?.name?.[localStorage.getItem('lang')||'zh-TW']||'',emoji:moles[currentMole]?.emoji||''}} onHit={handleHit} hitAnim={moleHitAnim} />
          </div>
        </div>
        )}
        {/* 嘲諷語 */}
        <div style={{ minHeight: 32, fontSize: 22, color: '#b00', fontWeight: 700, marginBottom: 18 }}>{taunt}</div>
        {/* 結束畫面 */}
        {showEnd && <EndScreen score={score} onRestart={handleRestart} />}
        {/* 排行榜彈窗 */}
        {showRanking && (
          <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:'#fff', borderRadius:24, padding:32, minWidth:320, maxWidth:420, boxShadow:'0 4px 24px #0002', textAlign:'center', position:'relative' }}>
              <button onClick={()=>setShowRanking(false)} style={{ position:'absolute', top:12, right:18, background:'none', border:'none', fontSize:26, color:'#6B4F27', cursor:'pointer', fontWeight:900 }}>×</button>
              <div style={{ fontWeight:700, color:'#6B4F27', fontSize:22, marginBottom:18 }}>排行榜</div>
              <ol style={{ textAlign:'left', margin:'0 auto 18px auto', maxWidth:280 }}>
                {ranking.map((r, i) => (
                  <li key={i} style={{ fontSize:18, marginBottom:4 }}>{i+1}. {r.name} - <span style={{ fontWeight:700, color:'#6B5BFF' }}>{r.score}</span></li>
                ))}
              </ol>
              <button onClick={()=>setShowRanking(false)} style={{ padding:'8px 24px', borderRadius:8, background:'#6B5BFF', color:'#fff', border:'none', fontWeight:700, fontSize:16, marginTop:8 }}>關閉</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 