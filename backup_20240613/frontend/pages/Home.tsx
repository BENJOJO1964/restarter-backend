import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import app from '../src/firebaseConfig';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';

type LanguageCode = 'zh-TW' | 'zh-CN' | 'en' | 'ja';

const LANGS: { code: LanguageCode; label: string }[] = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'zh-CN', label: '简中' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
];

const TEXT: Record<LanguageCode, { slogan: string[]; desc: string; wall: string; friend: string; voice: string; ai: string; tts: string; chat: string; emotion: string; }> = {
  'zh-TW': {
    slogan: ['站出來', '不是只有你一個人！'],
    desc: 'Restarter™你的情緒夥伴，傾聽你的聲音、用聲音.文字回應你，支持你表白，陪你被好好聽見。',
    wall: '進入情緒牆（Restart Wall）',
    friend: '交友區',
    voice: '即時語音輸入',
    ai: 'AI 風格回覆',
    tts: '擬真語音輸出',
    chat: '來聊天吧！',
    emotion: '情緒圖像實驗室',
  },
  'zh-CN': {
    slogan: ['站出来', '不是只有你一个人！'],
    desc: 'Restarter™你的情绪伙伴，倾听你的声音、用声音.文字回应你，支持你表白，陪你被好好听见。',
    wall: '进入情绪墙（Restart Wall）',
    friend: '交友区',
    voice: '即时语音输入',
    ai: 'AI 风格回复',
    tts: '拟真语音输出',
    chat: '来聊天吧！',
    emotion: '情緒圖像實驗室',
  },
  'en': {
    slogan: ['Speak up', 'you are not alone!'],
    desc: 'Restarter™ is your emotional companion, listening to your voice and responding with voice or text, supporting your expression and making you truly heard.',
    wall: 'Enter Restart Wall',
    friend: 'Friend Match',
    voice: 'Voice Input',
    ai: 'AI Style Reply',
    tts: 'Realistic TTS',
    chat: "Let's Chat!",
    emotion: 'Emotion Visual Lab',
  },
  'ja': {
    slogan: ['声を上げて', '一人じゃないよ！'],
    desc: 'Restarter™はあなたの感情パートナー。あなたの声に耳を傾け、声や文字で応え、あなたの気持ちを支え、しっかり受け止めます。',
    wall: '感情ウォールへ',
    friend: '友達マッチ',
    voice: '音声入力',
    ai: 'AIスタイル返信',
    tts: 'リアルTTS',
    chat: '話しましょう！',
    emotion: '感情ビジュアルラボ',
  },
};

const FRIEND_EMOJI: Record<LanguageCode, string> = {
  'zh-TW': '🧑‍🤝‍🧑',
  'zh-CN': '🧑‍🤝‍🧑',
  'en': '🧑‍🤝‍🧑',
  'ja': '🧑‍🤝‍🧑',
};

const SLOGAN2: Record<LanguageCode, string> = {
  'zh-TW': '每一位更生人，都是世界的一員！',
  'zh-CN': '每一位更生人，都是世界的一员！',
  'en': 'Everyone deserves a place in the world!',
  'ja': 'すべての更生者は世界の一員です！',
};

export default function Home() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<LanguageCode>(() => (localStorage.getItem('lang') as LanguageCode) || 'zh-TW');
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  const t = TEXT[lang];
  const featureBtnsRef = useRef<HTMLDivElement>(null);
  const chatBtnRef = useRef<HTMLButtonElement>(null);
  const [chatBtnMargin, setChatBtnMargin] = useState(0);
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);

  useLayoutEffect(() => {
    if (featureBtnsRef.current && chatBtnRef.current) {
      const featureTop = featureBtnsRef.current.getBoundingClientRect().top;
      const chatBtnTop = chatBtnRef.current.getBoundingClientRect().top;
      const featureHeight = featureBtnsRef.current.getBoundingClientRect().height;
      const chatBtnHeight = chatBtnRef.current.getBoundingClientRect().height;
      setChatBtnMargin((featureTop + featureHeight) - (chatBtnTop + chatBtnHeight));
    }
  }, [lang]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleFeature = (type: string) => {
    if (type === 'voice') {
      navigate('/voice');
    } else if (type === 'ai') {
      navigate('/ai');
    } else if (type === 'tts') {
      navigate('/tts');
    } else if (type === 'chat') {
      navigate('/chat');
    } else if (type === 'friend') {
      navigate('/friend');
    } else if (type === 'emotion') {
      navigate('/EmotionVisualLab');
    }
  };

  const logoutText = lang === 'zh-TW' ? '登出' : lang === 'zh-CN' ? '登出' : lang === 'ja' ? 'ログアウト' : 'Logout';

  const MODULES = [
    {
      key: 'journal',
      icon: '🎨',
      title: {
        'zh-TW': '情緒圖像實驗室', 'zh-CN': '情绪图像实验室', 'en': 'Emotion Visual Lab', 'ja': '感情ビジュアルラボ'
      },
      desc: {
        'zh-TW': '用AI生成你的情緒藝術圖像', 'zh-CN': '用AI生成你的情绪艺术图像', 'en': 'Generate your emotion art with AI', 'ja': 'AIで感情アートを生成'
      },
      path: '/journal'
    },
    {
      key: 'missions',
      icon: '🎯',
      title: {
        'zh-TW': '任務挑戰', 'zh-CN': '任务挑战', 'en': 'Restart Missions', 'ja': 'ミッション挑戦'
      },
      desc: {
        'zh-TW': 'AI生成日常任務，完成獲徽章', 'zh-CN': 'AI生成日常任务，完成获徽章', 'en': 'AI daily missions, earn badges', 'ja': 'AI日課ミッションでバッジ獲得'
      },
      path: '/missions'
    },
    {
      key: 'pairtalk',
      icon: '🤝',
      title: {
        'zh-TW': '配對對聊', 'zh-CN': '配对对聊', 'en': 'PairTalk Match', 'ja': 'ペアトーク'
      },
      desc: {
        'zh-TW': 'AI引導配對，安全對話', 'zh-CN': 'AI引导配对，安全对话', 'en': 'AI-guided matching, safe chat', 'ja': 'AIが導く安全な対話'
      },
      path: '/pairtalk'
    },
    {
      key: 'skillbox',
      icon: '🛠️',
      title: {
        'zh-TW': '情境模擬室', 'zh-CN': '情境模拟室', 'en': 'SkillBox', 'ja': 'スキルボックス'
      },
      desc: {
        'zh-TW': '練習社會互動，解鎖成就', 'zh-CN': '练习社会互动，解锁成就', 'en': 'Practice social skills, unlock achievements', 'ja': '社会スキル練習で実績解除'
      },
      path: '/skillbox'
    }
  ];

  return (
    <>
      <div style={{ position: 'fixed', top: 24, right: 36, zIndex: 9999, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 18, pointerEvents: 'auto' }}>
        {user ? (
          <button className="topbar-btn" onClick={async () => { await signOut(auth); localStorage.clear(); window.location.href = '/'; }}>登出</button>
        ) : (
          <button className="topbar-btn" onClick={() => window.location.href = '/register'}>登入</button>
        )}
        <select className="topbar-select" value={lang} onChange={e => { localStorage.setItem('lang', e.target.value as LanguageCode); window.location.href = '/'; }}
          style={{ padding: '6px 18px', borderRadius: 8, fontWeight: 700, border: '2px solid #6B5BFF', color: '#6B5BFF', background: '#fff', cursor: 'pointer', fontSize: 16, transition: 'background 0.2s, color 0.2s, box-shadow 0.2s', boxShadow: 'none' }}
          onMouseOver={e => { e.currentTarget.style.background = '#6B5BFF'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 2px 12px #6B5BFF55'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6B5BFF'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {LANGS.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
      <div style={{ width: '100vw', minHeight: '100vh', background: `url('/plains.png') center center/cover no-repeat`, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* 左側內容：主標題、說明、功能按鈕 */}
        <div className="home-left-col left-relative" style={{ flex: 1, minWidth: 320, maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '48px 0 0 0', zIndex: 2 }}>
          {/* LOGO、標語、主標題、說明、功能按鈕等原本內容 */}
          <div className="fixed-logo-box" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <img src="/ctx-logo.png" className="fixed-logo-img" style={{ marginBottom: 0 }} />
            <div className="fixed-logo-slogan" style={{ marginLeft: 8, whiteSpace: 'nowrap' }}>
              {t.slogan[0]}...{t.slogan[1]}
            </div>
          </div>
          <div className="column-content" style={{ justifyContent: 'center', alignItems: 'center', height: '100%', paddingTop: 48 }}>
            <h1 className="main-title" style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 18, textShadow: '0 2px 12px #232946, 0 4px 24px #0008' }}>Restarter™ Voice Companion</h1>
            <div className="main-desc" style={{ color: '#fff', fontSize: 22, marginBottom: 12, textAlign: 'center', maxWidth: 480, fontWeight: 700, textShadow: '0 2px 12px #232946, 0 4px 24px #0008' }}>
              <span style={{ color: '#fff', fontWeight: 900, textShadow: '0 2px 12px #232946, 0 4px 24px #0008' }}>Restarter™</span>{t.desc.replace('Restarter™', '')}
            </div>
            <div style={{ color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 24, fontWeight: 700, textShadow: '0 2px 12px #232946, 0 4px 24px #0008' }}>{lang==='zh-TW'?'你怎麼想都可以說出來，這裡沒有對錯 💡':lang==='zh-CN'?'你怎么想都可以说出来，这里没有对错 💡':lang==='ja'?'何を思っても話していい、ここに正解も間違いもない 💡':'Say whatever you think, there is no right or wrong here 💡'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 18, justifyContent: 'center', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center' }}>
                <button className="feature-btn" style={{ fontSize: 18, padding: '18px 24px', minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => navigate('/friend')}>
                  <span style={{ fontSize: 32 }}>{FRIEND_EMOJI[lang]}</span>
                  <span style={{ fontWeight: 700 }}>{t.friend}</span>
                  <span style={{ fontSize: 14, color: '#614425', marginTop: 2, fontWeight: 500 }}>{lang === 'zh-TW' ? '尋找新朋友，建立支持圈' : lang === 'zh-CN' ? '寻找新朋友，建立支持圈' : lang === 'en' ? 'Find new friends, build your support circle' : '新しい友達を探そう'} 😊</span>
                </button>
                {MODULES.slice(0,2).map(m => (
                  <button key={m.key} className="feature-btn" style={{ fontSize: 18, padding: '18px 24px', minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => navigate(m.path)}>
                    <span style={{ fontSize: 32 }}>{m.icon}</span>
                    <span style={{ fontWeight: 700 }}>{m.title[lang]}</span>
                    <span style={{ fontSize: 14, color: '#614425', marginTop: 2, fontWeight: 500 }}>{m.desc[lang]} 😊</span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center' }}>
                {MODULES.slice(2).map(m => (
                  <button key={m.key} className="feature-btn" style={{ fontSize: 18, padding: '18px 24px', minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} onClick={() => navigate(m.path)}>
                    <span style={{ fontSize: 32 }}>{m.icon}</span>
                    <span style={{ fontWeight: 700 }}>{m.title[lang]}</span>
                    <span style={{ fontSize: 14, color: '#614425', marginTop: 2, fontWeight: 500 }}>{m.desc[lang]} 😊</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* 右側內容：mockup 圖片和來聊天吧按鈕 */}
        <div className="home-right-col" style={{ flex: 1, minWidth: 320, maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 120, zIndex: 2 }}>
          <img src="/hero-mic.jpg" className="home-mic-img" style={{ marginBottom: 0, height: 'calc(100vh - 180px)', maxHeight: 520, minHeight: 320, width: '100%', objectFit: 'contain', background: '#232946' }} />
          <button
            ref={chatBtnRef}
            className="feature-btn home-chat-btn"
            style={{ height: 64, marginTop: 0, marginBottom: 0, position: 'relative', top: '-32px', gap: 4 }}
            onClick={() => handleFeature('chat')}
          >
            <span role="img" aria-label="chat" style={{ marginRight: 2, fontSize: 22 }}>💬</span>
            <span className="home-chat-btn-text">{t.chat}</span>
          </button>
        </div>
      </div>
      <style>{`
        .feature-btn, .home-chat-btn, .topbar-btn {
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
          cursor: pointer;
        }
        .feature-btn:hover, .home-chat-btn:hover, .topbar-btn:hover {
          background: #4a3bbf !important;
          color: #fff !important;
          box-shadow: 0 2px 12px #6B5BFF55;
        }
      `}</style>
    </>
  );
} 