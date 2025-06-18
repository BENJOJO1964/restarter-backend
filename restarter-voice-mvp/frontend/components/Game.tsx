import React, { useState, useEffect, useRef } from 'react';
import Hole from './Hole';
import EndScreen from './EndScreen';

// 多語系音效 API 介面（可改 fetch）
const getMoleSound = async (lang: string) => {
  // 可改為 fetch(`/api/sound?lang=${lang}`)
  return `/whack-${lang}.mp3`;
};

function getLevel(score: number) {
  if (score >= 360) return 5;
  if (score >= 270) return 4;
  if (score >= 180) return 3;
  if (score >= 90) return 2;
  return 1;
}

export default function Game() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [popSpeed, setPopSpeed] = useState(1000);
  const [currentHole, setCurrentHole] = useState(0);
  const [currentMole, setCurrentMole] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [taunt, setTaunt] = useState('');
  const [moleHitAnim, setMoleHitAnim] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<{name:string,score:number}[]>([]);
  const [moles, setMoles] = useState<any[]>([]);
  const [lowScoreInsults, setLowScoreInsults] = useState<string[]>([]);
  const [moleVoiceLines, setMoleVoiceLines] = useState<any>({});
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const popRef = useRef<NodeJS.Timeout|null>(null);

  // 載入地鼠資料
  useEffect(() => {
    fetch('/moles.json').then(r=>r.json()).then(setMoles);
    fetch('/restarter_low_score_insults.json').then(r=>r.json()).then(data=>setLowScoreInsults(data.low_score_insults||[]));
    fetch('/restarter_mole_voice_lines.json').then(r=>r.json()).then(data=>setMoleVoiceLines(data.mole_reactions||{}));
  }, []);

  // 載入排行榜
  useEffect(() => {
    if (showRanking) {
      fetch('/rankings.json').then(r=>r.json()).then(setRanking);
    }
  }, [showRanking]);

  // 倒數計時
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowEnd(true);
      clearInterval(timerRef.current!);
      clearInterval(popRef.current!);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timeLeft]);

  // 地鼠隨機出現
  useEffect(() => {
    if (showEnd || moles.length === 0) return;
    popRef.current = setInterval(() => {
      setCurrentHole(Math.floor(Math.random() * 5));
      setCurrentMole(Math.floor(Math.random() * moles.length));
    }, popSpeed);
    return () => clearInterval(popRef.current!);
  }, [popSpeed, showEnd, moles]);

  // 分數升級
  useEffect(() => {
    const newLevel = getLevel(score);
    setLevel(newLevel);
    setPopSpeed([1000,800,600,500,400][newLevel-1]);
  }, [score]);

  // 點擊地鼠
  const handleHit = async () => {
    setScore(s => s + 1);
    const lang = localStorage.getItem('lang') || 'zh-TW';
    // 低分時顯示低分嘲諷語
    if (score < 40 && lowScoreInsults.length > 0) {
      setTaunt(lowScoreInsults[Math.floor(Math.random() * lowScoreInsults.length)]);
    } else {
      // 地鼠專屬語音台詞
      const moleName = moles[currentMole]?.name?.[lang] || moles[currentMole]?.name?.['zh-TW'] || '';
      const voiceLines = moleVoiceLines[moleName] || [];
      if (voiceLines.length > 0) {
        setTaunt(voiceLines[Math.floor(Math.random() * voiceLines.length)]);
      } else {
        // fallback: moles.json taunt
        const taunts = moles[currentMole]?.taunts?.[lang] || moles[currentMole]?.taunts?.['zh-TW'] || [];
        setTaunt(taunts[Math.floor(Math.random() * taunts.length)] || '');
      }
    }
    setMoleHitAnim(true);
    setTimeout(() => setMoleHitAnim(false), 200);
    // 多語系音效
    try {
      const soundUrl = await getMoleSound(lang);
      const audio = new window.Audio(soundUrl);
      audio.play();
    } catch (e) {}
  };

  // 重新開始
  const handleRestart = () => {
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setPopSpeed(1000);
    setShowEnd(false);
    setTaunt('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow-lg">
        {/* 排行榜入口 */}
        <div className="mb-2 flex justify-end">
          <button className="px-3 py-1 bg-green-200 rounded text-green-800 font-bold" onClick={()=>setShowRanking(true)}>排行榜</button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold">分數: {score}</div>
          <div className="text-lg font-bold">等級: {level}</div>
          <div className="text-lg font-bold">倒數: {timeLeft}s</div>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {moles.length > 0 && [0,1,2,3,4].map(i => (
            <Hole key={i} active={i===currentHole} mole={{name:moles[currentMole]?.name?.[localStorage.getItem('lang')||'zh-TW']||'',emoji:moles[currentMole]?.emoji||''}} onHit={handleHit} hitAnim={moleHitAnim && i===currentHole} />
          ))}
        </div>
        <div className="h-12 text-center text-xl font-bold text-red-500 transition-all duration-200">{taunt}</div>
        {showEnd && <EndScreen score={score} onRestart={handleRestart} />}
        {/* 排行榜彈窗 */}
        {showRanking && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl w-80">
              <div className="text-xl font-bold mb-4">排行榜</div>
              <ol className="mb-4">
                {ranking.map((r, i) => (
                  <li key={i} className="mb-1">{i+1}. {r.name} - <span className="font-bold text-blue-600">{r.score}</span></li>
                ))}
              </ol>
              <button className="px-4 py-1 bg-blue-400 text-white rounded" onClick={()=>setShowRanking(false)}>關閉</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 