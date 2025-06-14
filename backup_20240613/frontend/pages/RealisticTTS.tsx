import React from 'react';
export default function RealisticTTS() {
  const [playing, setPlaying] = React.useState(false);
  const [lang, setLang] = React.useState('zh-TW');

  const handlePlay = () => {
    setPlaying(true);
  };

  return (
    <div className="modern-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modern-container" style={{ maxWidth: 480, width: '100%', margin: '0 auto', textAlign: 'center', padding: 48, borderRadius: 18, background: 'rgba(60,40,20,0.18)', boxShadow: '0 4px 24px #0002' }}>
        <h2 style={{ color: '#6B5BFF', fontWeight: 900, fontSize: 28, marginBottom: 24 }}>擬真語音輸出</h2>
        <div style={{ color: '#6B4F27', fontSize: 22, fontWeight: 700 }}>體驗即將開放，敬請期待！</div>
        <button onClick={handlePlay} style={{ padding: '6px 18px', borderRadius: 8, background: '#6c63ff', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, marginTop: 8 }} disabled={playing}>
          {playing ? (lang==='zh-TW'?'播放中...':lang==='zh-CN'?'播放中...':lang==='ja'?'再生中...':'Playing...') : (lang==='zh-TW'?'播放語音':lang==='zh-CN'?'播放语音':lang==='ja'?'音声を再生':'Play Audio')}
        </button>
      </div>
    </div>
  );
} 