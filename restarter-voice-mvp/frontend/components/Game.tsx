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
  
  if (rate > 0.9) {  // 命中率 > 90%，升級
    return Math.min(6, prevLevel + 1);
  } else if (rate <= 0.4) {  // 命中率 <= 40%，降級
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
  const [currentMole, setCurrentMole] = useState(-1);
  const [showEnd, setShowEnd] = useState(false);
  const [taunt, setTaunt] = useState('');
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<{name:string,score:number}[]>([]);
  const [moles, setMoles] = useState<any[]>([]);
  const [moleHitAnim, setMoleHitAnim] = useState(false);
  const [missed, setMissed] = useState(false);
  const [gameStarted, setGameStarted] = useState(true);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [molePos, setMolePos] = useState({x: -9999, y: -9999});
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

  // 修改地鼠出現邏輯
  useEffect(() => {
    if (!gameStarted || showEnd || moles.length === 0) return;
    
    function popMole() {
      const r = 210;  // 圓盤半徑
      const center = 300;  // 中心點
      const angle = Math.random() * 2 * Math.PI;
      const dist = Math.random() * (r - 40);  // 考慮地鼠大小
      
      // 確保地鼠完全在可見區域內
      const x = Math.max(0, Math.min(600, center + dist * Math.cos(angle) - 40));
      const y = Math.max(0, Math.min(600, center + dist * Math.sin(angle) - 40));
      
      setMolePos({x, y});
      setCurrentMole(Math.floor(Math.random() * moles.length));
      setMissed(false);
      setTotalMoleCount(c => c + 1);
      
      // 根據等級調整地鼠可見時間
      const visibleTime = Math.max(300, MOLE_VISIBLE_TIME_BASE - (level-1)*120);
      
      hideRef.current = setTimeout(() => {
        setMolePos({x: -9999, y: -9999});
        if (!missed) {
          setScore(s => s - 1);  // 沒打到就扣一分
          // 根據命中率更新嘲諷語
          const currentHitRate = hitCount / (totalMoleCount + 1);  // +1 是因為當前這一下還沒計入 totalMoleCount
          if (currentHitRate <= 0.4) {
            setTaunt(lowScoreInsults[Math.floor(Math.random() * lowScoreInsults.length)]);
          }
        }
        
        // 根據等級調整出現間隔
        const interval = Math.max(200, POP_INTERVAL_BASE - (level-1)*100);
        popRef.current = setTimeout(popMole, interval);
      }, visibleTime);
    }
    
    // 初始延遲後開始遊戲
    popRef.current = setTimeout(popMole, 600);
    
    return () => {
      if (popRef.current) clearTimeout(popRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [showEnd, moles, gameStarted, level, missed, hitCount, totalMoleCount]);

  // 分數升級與命中率
  useEffect(() => {
    if (totalMoleCount === 0) return;
    setLevel(prev => getLevelByHitRate(hitCount, totalMoleCount, prev));
  }, [hitCount, totalMoleCount]);

  // 點擊地鼠
  const handleHit = async () => {
    setScore(s => s + 1);  // 打中就加一分
    setHitCount(c => c + 1);
    setMissed(true);
    setMoleHitAnim(true);
    setTimeout(() => setMoleHitAnim(false), 200);
    setMolePos({x: -9999, y: -9999});
    const lang = localStorage.getItem('lang') || 'zh-TW';
    
    // 根據命中率選擇嘲諷語
    const hitRate = (hitCount + 1) / (totalMoleCount || 1);  // +1 是因為當前這一下還沒計入 hitCount
    
    if (hitRate <= 0.4) {  // 命中率 <= 40%，最嚴厲的嘲諷
      setTaunt(lowScoreInsults[Math.floor(Math.random() * lowScoreInsults.length)]);
    } else if (hitRate > 0.9) {  // 命中率 > 90%，誇獎台詞
      setTaunt("太厲害了！你是打地鼠界的超級英雄！");
    } else {  // 一般情況，顯示地鼠台詞
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
    <div className="min-h-screen bg-[url('/clay_background.png')] bg-cover bg-center relative">
      {logo}
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* 遊戲未開始時顯示開始按鈕與計時選擇 */}
        {!gameStarted && !showEnd && (
          <div className="mt-20 mb-10 text-center">
            <div className="text-2xl font-bold mb-6 text-[#614425]">選擇遊戲時間</div>
            <div className="flex gap-6 justify-center mb-8">
              <button 
                onClick={()=>setSelectedTime(30)} 
                className={`text-xl px-8 py-3 rounded-xl border-2 ${
                  selectedTime===30 ? 'border-[#614425] bg-[#f7e7c1]' : 'border-gray-300 bg-white'
                } text-[#614425] font-bold cursor-pointer transition-all`}
              >
                30秒
              </button>
              <button 
                onClick={()=>setSelectedTime(60)}
                className={`text-xl px-8 py-3 rounded-xl border-2 ${
                  selectedTime===60 ? 'border-[#614425] bg-[#f7e7c1]' : 'border-gray-300 bg-white'
                } text-[#614425] font-bold cursor-pointer transition-all`}
              >
                60秒
              </button>
            </div>
            <button 
              onClick={handleStart}
              className="text-2xl px-16 py-4 rounded-xl bg-[#a97c50] text-white font-black border-none cursor-pointer shadow-lg hover:bg-[#614425] transition-all mt-4"
            >
              開始
            </button>
          </div>
        )}
        
        {/* 遊戲區域 */}
        {gameStarted && (
          <div className="relative w-[600px] h-[600px] bg-[#f0d5a3] rounded-full shadow-2xl overflow-hidden">
            {/* 分數區塊 */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-8 z-10">
              <div className="text-2xl font-black text-[#6B5BFF] bg-[#f7f7ff] rounded-xl px-6 py-2 shadow-lg">
                分數: {score}
              </div>
              <div className="text-xl font-bold text-[#614425] bg-[#fffbe6] rounded-xl px-4 py-2 shadow-lg">
                等級: {level}
              </div>
              <div className="text-xl font-bold text-white bg-[#23c6e6] rounded-xl px-4 py-2 shadow-lg">
                倒數: {timeLeft}s
              </div>
            </div>
            
            {/* 地鼠 */}
            {currentMole >= 0 && moles[currentMole] && (
              <div
                style={{
                  position: 'absolute',
                  left: molePos.x,
                  top: molePos.y,
                  transition: 'all 0.15s ease-out',
                  transform: moleHitAnim ? 'scale(0.8)' : 'scale(1)',
                }}
              >
                <Hole 
                  active={true}
                  mole={{
                    name: moles[currentMole]?.name?.[localStorage.getItem('lang')||'zh-TW'] || '',
                    emoji: moles[currentMole]?.emoji || ''
                  }}
                  onHit={handleHit}
                  hitAnim={moleHitAnim}
                />
              </div>
            )}
            
            {/* 嘲諷文字 */}
            {taunt && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xl font-bold text-[#614425] bg-white/80 px-6 py-3 rounded-full shadow-lg">
                {taunt}
              </div>
            )}
          </div>
        )}
        
        {/* 結束畫面 */}
        {showEnd && (
          <EndScreen
            score={score}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
} 