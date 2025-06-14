import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatWithTone } from '../utils/toneFormatter';
import type { Tone, Quote } from '../../shared/types';
import { getAuth } from 'firebase/auth';
import { TEXT, useLanguage, LanguageCode } from '../shared/i18n';

const demoTones: Tone[] = [
  { id: 'gentle', name: '溫柔', description: '溫柔、體貼、安撫人心', stylePrompt: '請用溫柔、體貼的語氣回應。' },
  { id: 'hopeful', name: '希望', description: '充滿希望、鼓勵、正向', stylePrompt: '請用充滿希望、鼓勵的語氣回應。' },
];

interface Message {
  id: string;
  text: string;
  aiReply: string;
  toneId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    country: string;
    region: string;
    email: string;
  };
  comments?: { nickname: string; content: string; toUserId: string; }[];
}

const AVATAR_LIST = [
  '/avatars/male1.jpg', '/avatars/female1.jpg', '/avatars/male2.jpg', '/avatars/female2.jpg',
  '/avatars/male3.jpg', '/avatars/female3.jpg', '/avatars/male4.jpg', '/avatars/female4.jpg',
];

function randomAvatar() {
  return AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)];
}

function randomName() {
  const names = ['小明', '小美', 'John', 'Alice', 'Yuki', 'Tom', 'Mia', 'Ken'];
  return names[Math.floor(Math.random() * names.length)];
}

function randomCountry() {
  const arr = ['台灣', '日本', '美國', '香港', '韓國', '新加坡'];
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRegion() {
  const arr = ['台北', '東京', '舊金山', '首爾', '新加坡', '高雄'];
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomEmail(name: string) {
  return name.toLowerCase() + '@demo.com';
}

export default function RestartWall() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>(demoTones[0]);
  const [loading, setLoading] = useState(false);
  const [showUser, setShowUser] = useState<null|Message>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentNickname, setCommentNickname] = useState('');
  const { lang, setLang } = useLanguage();

  // 取得當前登入者 userId
  React.useEffect(() => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        localStorage.setItem('userId', user.displayName || user.email || '');
      }
    } catch {}
  }, []);

  // 假 AI 回覆
  const fakeAIReply = (text: string, tone: Tone) => `${formatWithTone('AI安慰：' + text, tone.name)}`;

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const name = randomName();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      aiReply: '',
      toneId: selectedTone.id,
      createdAt: new Date().toISOString(),
      user: {
        id: name,
        name,
        avatar: randomAvatar(),
        country: randomCountry(),
        region: randomRegion(),
        email: randomEmail(name),
      },
      comments: [],
    };
    setMessages([userMsg, ...messages]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => {
        const newMsgs = prev.map(m => m.id === userMsg.id ? { ...m, aiReply: fakeAIReply(m.text, selectedTone) } : m);
        localStorage.setItem('messages', JSON.stringify(newMsgs));
        return newMsgs;
      });
      setLoading(false);
    }, 1200);
  };

  const handleAddComment = (msg: Message) => {
    if (!commentInput.trim() || !commentNickname.trim()) return;
    setMessages(msgs => {
      const newMsgs = msgs.map(m => m.id === msg.id ? { ...m, comments: [...(m.comments||[]), { nickname: commentNickname, content: commentInput, toUserId: msg.user.id }] } : m);
      localStorage.setItem('messages', JSON.stringify(newMsgs));
      return newMsgs;
    });
    setCommentInput('');
    setCommentNickname('');
    setShowUser(null);
  };

  return (
    <div className="modern-bg" style={{ background: `url('/snowmountain.png') center center / cover no-repeat`, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{position:'absolute',top:0,left:0,width:'100%',zIndex:100,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 32px 0 32px',boxSizing:'border-box',background:'transparent'}}>
        <button onClick={()=>navigate('/')} style={{background:'none',border:'none',color:'#6c63ff',fontWeight:700,fontSize:18,cursor:'pointer'}}>{TEXT[lang].backHome}</button>
        <div style={{display:'flex',gap:12,marginRight:8}}>
          <button className="topbar-btn" onClick={async()=>{const auth=getAuth();await auth.signOut();localStorage.clear();window.location.href='/'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='';e.currentTarget.style.color='';}}>{TEXT[lang].logout}</button>
          <select className="topbar-select" value={lang} onChange={e=>{setLang(e.target.value as LanguageCode);localStorage.setItem('lang',e.target.value);}} style={{padding:'6px 14px',borderRadius:8,fontWeight:600,cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='';e.currentTarget.style.color='';}}>
            <option value="zh-TW">繁中</option>
            <option value="zh-CN">简中</option>
            <option value="en">EN</option>
            <option value="ja">日文</option>
            <option value="ko">한국어</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>
      </div>
      <div className="modern-container" style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6c63ff', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginRight: 12 }}>← {TEXT[lang].backHome}</button>
          <h2 className="modern-title" style={{ fontSize: '2.2rem', margin: 0, flex: 1, textAlign: 'center', color:'#6B5BFF', textShadow:'0 2px 12px #6B5BFF88, 0 4px 24px #0008', letterSpacing:1, display:'flex',alignItems:'center',gap:8 }}>🧱 {TEXT[lang].restartWallTitle}</h2>
          <button onClick={() => navigate('/inbox')} style={{ background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 17, padding: '10px 28px', marginLeft: 18, boxShadow: '0 2px 12px #6B5BFF33', letterSpacing: 2 }}>💌 {TEXT[lang].myInbox}</button>
        </div>
        <div className="tone-list" style={{ marginBottom: 18 }}>
          {demoTones.map(tone => (
            <div
              key={tone.id}
              className={`tone-card${selectedTone.id === tone.id ? ' selected' : ''}`}
              onClick={() => setSelectedTone(tone)}
            >
              <div className="tone-name">{tone.name}</div>
              <div className="tone-desc">{tone.description}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <input
            className="quote-card"
            style={{ flex: 1, fontSize: 18, padding: '12px 16px', border: 'none', outline: 'none', background: '#232946', color: '#fff' }}
            placeholder={TEXT[lang].saySomething}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            className="tone-card selected"
            style={{ fontSize: 18, padding: '12px 24px' }}
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? TEXT[lang].sending : TEXT[lang].send}
          </button>
        </div>
        <div className="quote-list">
          {messages.length === 0 && <div style={{ color: '#614425', textAlign: 'center', marginTop: 32 }}>{TEXT[lang].noMessages}</div>}
          {messages.map(msg => (
            <div key={msg.id} className="quote-card" style={{ position: 'relative', paddingLeft: 64 }}>
              <img src={msg.user.avatar} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 8, top: 16, cursor: 'pointer', border: '2px solid #6B5BFF' }} onClick={() => setShowUser(msg)} />
              <div className="quote-text">{msg.text}</div>
              <div className="quote-tone">({msg.toneId})</div>
              {msg.aiReply && <div className="quote-tone-style">{msg.aiReply}</div>}
              <div style={{ fontSize: 12, color: '#614425', marginTop: 6 }}>{new Date(msg.createdAt).toLocaleString()}</div>
              <div style={{ marginTop: 14, background: '#f7f7ff', borderRadius: 10, padding: '10px 14px', boxShadow: '0 1px 6px #6B5BFF11' }}>
                <b style={{ color: '#6B5BFF', fontSize: 16 }}>{TEXT[lang].commentInteraction}</b>
                {(msg.comments||[]).length === 0 && <span style={{ color: '#bbb', marginLeft: 8 }}>{TEXT[lang].noComments}</span>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                  {(msg.comments||[]).map((c, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 8, padding: '6px 12px', color: '#232946', fontSize: 15, border: '1px solid #eee', boxShadow: '0 1px 4px #6B5BFF08' }}><b>{c.nickname}：</b>{c.content}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {showUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 28, padding: 36, minWidth: 340, maxWidth: 440, boxShadow: '0 6px 32px #6B5BFF22', textAlign: 'center', position: 'relative', border: '2px solid #6B5BFF22' }}>
              <button onClick={() => setShowUser(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#6B4F27', cursor: 'pointer' }}>×</button>
              <img src={showUser.user.avatar} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', marginBottom: 14, border: '2.5px solid #6B5BFF' }} />
              <div style={{ fontWeight: 900, color: '#6B5BFF', fontSize: 22, marginBottom: 8 }}>{showUser.user.name}</div>
              <div style={{ color: '#6B4F27', fontSize: 17, marginBottom: 8 }}>{showUser.user.country}・{showUser.user.region}</div>
              <div style={{ color: '#232946', fontSize: 16, marginBottom: 18 }}>{TEXT[lang].userPost}<br />{showUser.text}</div>
              <div style={{ color: '#6B5BFF', fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{TEXT[lang].leaveComment}</div>
              <input placeholder={TEXT[lang].yourNickname} value={commentNickname} onChange={e => setCommentNickname(e.target.value)} style={{ width: '92%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 10, fontSize: 16 }} />
              <textarea placeholder={TEXT[lang].commentContent} value={commentInput} onChange={e => setCommentInput(e.target.value)} style={{ width: '92%', padding: 10, borderRadius: 8, border: '1px solid #ddd', minHeight: 54, fontSize: 16 }} />
              <button onClick={() => handleAddComment(showUser)} style={{ marginTop: 12, padding: '10px 22px', background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 16, letterSpacing: 1 }}>{TEXT[lang].submitComment}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 