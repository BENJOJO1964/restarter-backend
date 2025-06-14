import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import VideoReactionPlayer, { VideoReactionType } from '../components/VideoReactionPlayer';
import { useVideoReaction } from '../components/VideoReactionContext';
const TEXT: Record<string, { title: string; empty: string }> = {
  'zh-TW': { title: '配對對聊', empty: '目前沒有配對，等待系統為你尋找夥伴...' },
  'zh-CN': { title: '配对对聊', empty: '目前没有配对，等待系统为你寻找伙伴...' },
  'en': { title: 'PairTalk Match', empty: 'No matches yet. Waiting for a companion...' },
  'ja': { title: 'ペアトーク', empty: 'まだマッチがありません。相手を探しています...' },
  'ko': { title: '페어톡 매칭', empty: '아직 매칭이 없습니다. 상대를 찾고 있습니다...' },
  'vi': { title: 'Kết bạn PairTalk', empty: 'Chưa có ghép đôi nào. Đang tìm bạn đồng hành...' },
};
const SUBTITLE: Record<string, string> = {
  'zh-TW': '劫後餘生的交友最珍貴，沒人怕跨出第一步！',
  'zh-CN': '劫后余生的交友最珍贵，没人怕跨出第一步！',
  'en': 'Friendship after hardship is the most precious, no one is afraid to take the first step!',
  'ja': '困難を乗り越えた後の友情こそが最も貴重、一歩踏み出すのは誰も怖くない！',
  'ko': '고난을 이겨낸 후의 우정이 가장 소중하며, 누구도 첫걸음을 두려워하지 않습니다!',
  'vi': 'Tình bạn sau khó khăn là quý giá nhất, không ai sợ bước đầu tiên!',
};
const mockPairs = [
  { id: 1, partner: '小明', status: 'active', aiGuide: '你可以問對方：今天過得如何？' },
  { id: 2, partner: 'Sandy', status: 'archived', aiGuide: '你可以問對方：最近有什麼開心的事？' },
];
const mockProfiles = [
  {
    id: 1,
    nickname: 'Alice',
    country: '台灣',
    age: 28,
    gender: 'female',
    email: 'alice@example.com',
    bio: '喜歡閱讀與旅行',
    interest: '閱讀',
    eventType: '經濟',
    avatar: '/avatars/female1.jpg',
  },
  {
    id: 2,
    nickname: 'Bob',
    country: '日本',
    age: 32,
    gender: 'male',
    email: 'bob@example.com',
    bio: '音樂愛好者',
    interest: '音樂',
    eventType: '科技',
    avatar: '/avatars/male1.jpg',
  },
];
const GENDER_LABEL: Record<string, Record<string, string>> = {
  'zh-TW': { male: '男性', female: '女性', other: '其他' },
  'zh-CN': { male: '男性', female: '女性', other: '其他' },
  'en': { male: 'Male', female: 'Female', other: 'Other' },
  'ja': { male: '男性', female: '女性', other: 'その他' },
  'ko': { male: '남성', female: '여성', other: '기타' },
  'vi': { male: 'Nam', female: 'Nữ', other: 'Khác' },
};
const GIFT_OPTIONS = [
  { value: '🌹', label: '🌹' },
  { value: '💍', label: '💍' },
  { value: '🍰', label: '🍰' },
  { value: '🎩', label: '🎩' },
  { value: '🌺', label: '🌺' },
  { value: '👗', label: '👗' },
  { value: '✒️', label: '✒️' },
  { value: '🏎️', label: '🏎️' },
];
const AGE_UNIT: Record<string, string> = {
  'zh-TW': '歲',
  'zh-CN': '岁',
  'en': 'yrs',
  'ja': '歳',
};
const UI_TEXT: Record<string, { home: string; backHome: string; logout: string; pairtalk: string; sendGift: string; sendEmail: string; matchStatus: string; next: string; viewDetails: string; hide: string; invite: string; nickname?: string; country?: string; age?: string; gender?: string; email?: string; interest?: string; eventType?: string; bio?: string }> = {
  'zh-TW': { home: '首頁', backHome: '返回首頁', logout: '登出', pairtalk: '配對對聊', sendGift: '送出禮物', sendEmail: '發送Email', matchStatus: '配對狀態', next: '下一頁', viewDetails: '查看完整資料', hide: '收合資料', invite: '邀請', nickname: '暱稱', country: '國家', age: '年齡', gender: '性別', email: 'Email', interest: '興趣', eventType: '事件類型', bio: '簡介' },
  'zh-CN': { home: '首页', backHome: '返回首页', logout: '登出', pairtalk: '配对对聊', sendGift: '送出礼物', sendEmail: '发送Email', matchStatus: '配对状态', next: '下一页', viewDetails: '查看完整资料', hide: '收起资料', invite: '邀请', nickname: '昵称', country: '国家', age: '年龄', gender: '性别', email: 'Email', interest: '兴趣', eventType: '事件类型', bio: '简介' },
  'en': { home: 'Home', backHome: 'Back to Home', logout: 'Logout', pairtalk: 'PairTalk', sendGift: 'Send Gift', sendEmail: 'Send Email', matchStatus: 'Match Status', next: 'Next', viewDetails: 'View Details', hide: 'Hide', invite: 'Invite', nickname: 'Nickname', country: 'Country', age: 'Age', gender: 'Gender', email: 'Email', interest: 'Interest', eventType: 'Event Type', bio: 'Bio' },
  'ja': { home: 'ホームへ戻る', backHome: 'ホームへ戻る', logout: 'ログアウト', pairtalk: 'ペアトーク', sendGift: 'ギフトを送る', sendEmail: 'メール送信', matchStatus: 'マッチ状況', next: '次へ', viewDetails: '詳細を見る', hide: '閉じる', invite: '招待', nickname: 'ニックネーム', country: '国', age: '年齢', gender: '性別', email: 'Email', interest: '趣味', eventType: 'イベントタイプ', bio: '自己紹介' },
  'ko': { home: '홈으로', backHome: '홈으로', logout: '로그아웃', pairtalk: '페어톡', sendGift: '선물 보내기', sendEmail: '이메일 보내기', matchStatus: '매칭 상태', next: '다음', viewDetails: '상세 보기', hide: '숨기기', invite: '초대', nickname: '이름', country: '국가', age: '나이', gender: '성별', email: '이메일', interest: '관심사', eventType: '이벤트 유형', bio: '소개' },
  'vi': { home: 'Trang chủ', backHome: 'Trang chủ', logout: 'Đăng xuất', pairtalk: 'Kết bạn PairTalk', sendGift: 'Gửi quà', sendEmail: 'Gửi Email', matchStatus: 'Trạng thái ghép đôi', next: 'Tiếp', viewDetails: 'Xem chi tiết', hide: 'Ẩn', invite: 'Mời', nickname: 'Tên', country: 'Quốc gia', age: 'Tuổi', gender: 'Giới tính', email: 'Email', interest: 'Sở thích', eventType: 'Loại sự kiện', bio: 'Giới thiệu' },
};
export default function PairTalk() {
  const navigate = useNavigate();
  const auth = getAuth();
  const userEmail = auth.currentUser?.email || '';
  const lang = localStorage.getItem('lang') || 'zh-TW';
  const [pairs, setPairs] = useState<any[]>(JSON.parse(localStorage.getItem('pairs')||'[]')||mockPairs);
  const [timer, setTimer] = useState(300); // 5分鐘
  const [activeId, setActiveId] = useState(pairs.find((p:any)=>p.status==='active')?.id||null);
  const [aiMsg, setAiMsg] = useState('AI：記得保持友善，互相傾聽！');
  const isSubPage = window.location.pathname !== '/';
  const [matchIndex, setMatchIndex] = useState(0);
  const matched = mockProfiles[matchIndex];
  const [showDetail, setShowDetail] = useState(false);
  const [selectedGift, setSelectedGift] = useState(GIFT_OPTIONS[0].value);
  const { setVideoReaction } = useVideoReaction();
  React.useEffect(()=>{ if(activeId){ const t = setInterval(()=>setTimer(s=>s>0?s-1:0),1000); return()=>clearInterval(t);} },[activeId]);
  const handleArchive = (id:number) => {
    setPairs(pairs.map(p=>p.id===id?{...p,status:'archived'}:p));
    localStorage.setItem('pairs', JSON.stringify(pairs.map(p=>p.id===id?{...p,status:'archived'}:p)));
    setVideoReaction('disappointment');
  };
  const handleRematch = () => {
    setVideoReaction('breakthrough');
  };
  const handleSendGift = () => {
    alert(`${selectedGift} 已送出給 ${matched.nickname}！`);
  };
  const handleSendEmail = () => {
    window.location.href = `mailto:${matched.email}?subject=PairTalk&body=Hi${userEmail ? `&from=${userEmail}` : ''}`;
  };
  const handleNextMatch = () => {
    if (mockProfiles.length <= 1 || matchIndex === mockProfiles.length - 1) {
      alert(lang==='zh-TW'?'最後一頁':lang==='zh-CN'?'最后一页':lang==='ja'?'最後のページ':'Last page');
      return;
    }
    setShowDetail(false);
    setMatchIndex(i => i + 1);
  };
  return (
    <div className="modern-bg" style={{ background: `url('/valley.png') center center / cover no-repeat`, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{position:'absolute',top:0,left:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent'}}>
        <button className="topbar-btn" onClick={()=>navigate('/')} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginRight:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{UI_TEXT[lang]?.backHome}</button>
        {window.location.pathname!=='/pairtalk' && <button className="topbar-btn" onClick={()=>navigate(-1)} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginLeft:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{UI_TEXT[lang]?.backHome}</button>}
      </div>
      <div style={{position:'absolute',top:0,right:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',gap:12}}>
        <button className="topbar-btn" onClick={async()=>{await signOut(auth);localStorage.clear();window.location.href='/';}} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{UI_TEXT[lang]?.logout}</button>
        <select className="topbar-select" value={lang} onChange={e=>{localStorage.setItem('lang',e.target.value);window.location.reload();}} style={{padding:'6px 14px',borderRadius:8,fontWeight:600,border:'1.5px solid #6B5BFF',color:'#6B5BFF',background:'#fff',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>
          <option value="zh-TW">繁中</option>
          <option value="zh-CN">简中</option>
          <option value="en">EN</option>
          <option value="ja">日文</option>
          <option value="ko">한국어</option>
          <option value="vi">Tiếng Việt</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#6B5BFF', textShadow: '0 2px 12px #6B5BFF88, 0 4px 24px #0008', letterSpacing:1, background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #6B5BFF22', padding:'12px 32px', margin:0, marginBottom: 24, display:'flex',alignItems:'center',gap:12 }}>🤝 {UI_TEXT[lang]?.pairtalk}</h2>
        <div style={{ maxWidth: 540, width: '100%', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 22, color: '#6B5BFF', fontWeight: 900, marginBottom: 24, textAlign:'center', textShadow:'0 2px 12px #6B5BFF88, 0 4px 24px #0008' }}>{SUBTITLE[lang]}</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 18 }}>{TEXT[lang]?.title}</h2>
          <div style={{ marginTop: 18 }}>
            <b>{UI_TEXT[lang]?.matchStatus}</b>
            <div style={{ marginTop: 8 }}>{TEXT[lang]?.empty}</div>
          </div>
          {activeId ? (
            <div style={{ marginBottom: 16 }}>
              <b>今日配對：</b> {pairs.find(p=>p.id===activeId)?.partner}
              <div style={{ marginTop: 8, color: '#6B5BFF' }}>剩餘時間：{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</div>
              <div style={{ marginTop: 8, color: '#23c6e6' }}>{pairs.find(p=>p.id===activeId)?.aiGuide}</div>
              <div style={{ marginTop: 8, color: '#614425' }}>{aiMsg}</div>
              <button onClick={()=>handleArchive(activeId)} style={{ marginTop: 10, borderRadius: 8, background: '#eee', color: '#6B5BFF', border: 'none', fontWeight: 700, padding: '6px 18px' }}>封存對話</button>
              <button onClick={handleRematch} style={{ marginTop: 10, marginLeft: 10, borderRadius: 8, background: '#6B5BFF', color: '#fff', border: 'none', fontWeight: 700, padding: '6px 18px' }}>重配</button>
            </div>
          ) : <div style={{ color: '#614425', fontSize: 18, textAlign: 'center', marginTop: 40 }}>{TEXT[lang]?.empty}</div>}
          <div style={{ marginTop: 18 }}>
            <b>歷史配對</b>
            <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: 'none' }}>{pairs.filter(p=>p.status==='archived').map((p,i)=>(<li key={i} style={{ background: '#f7f7ff', borderRadius: 8, padding: 10, marginBottom: 8 }}><div style={{ fontWeight: 700 }}>{p.partner}</div><div style={{ color: '#614425', marginTop: 4 }}>{p.aiGuide}</div></li>))}</ul>
          </div>
          {/* 配對對象卡片 */}
          <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', background: '#f7f7ff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px #6B5BFF11', marginBottom: 24, textAlign: 'center', position: 'relative' }}>
            <img src={matched.avatar} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #6B5BFF', background: '#eee', marginBottom: 12 }} />
            <div style={{ fontWeight: 700, fontSize: 20, color: '#6B5BFF', marginBottom: 6 }}>{matched.nickname}</div>
            <div style={{ color: '#614425', fontSize: 16, marginBottom: 6 }}>{matched.country} / {matched.age}{AGE_UNIT[lang]}</div>
            <div style={{ color: '#614425', fontSize: 16, marginBottom: 6 }}>{(GENDER_LABEL[lang]?.[matched.gender] ?? '-')}</div>
            <button
              onClick={()=>setShowDetail(v=>!v)}
              style={{ margin: '8px 0', padding: '6px 18px', borderRadius: 8, fontWeight: 700, background: '#fff', color: '#6B5BFF', border: '2px solid #6B5BFF', cursor: 'pointer', fontSize: 15, transition: 'background 0.18s, color 0.18s, box-shadow 0.18s' }}
              onMouseOver={e => { e.currentTarget.style.background = '#6B5BFF'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 6px 32px #6B5BFF99'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6B5BFF'; e.currentTarget.style.boxShadow = 'none'; }}
            >{showDetail ? UI_TEXT[lang]?.hide : UI_TEXT[lang]?.viewDetails}</button>
            {showDetail && (
              <div style={{ marginTop: 8, color: '#232946', fontSize: 15, background:'#fff', borderRadius:8, padding:12, boxShadow:'0 2px 8px #6B5BFF11', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <img src={matched.avatar} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #6B5BFF', background: '#eee', marginBottom: 6 }} />
                <div><b>{UI_TEXT[lang]?.nickname}：</b>{matched.nickname}</div>
                <div><b>{UI_TEXT[lang]?.country}：</b>{matched.country}</div>
                <div><b>{UI_TEXT[lang]?.age}：</b>{matched.age}</div>
                <div><b>{UI_TEXT[lang]?.gender}：</b>{(GENDER_LABEL[lang]?.[matched.gender] ?? '-')}</div>
                <div><b>{UI_TEXT[lang]?.email}：</b>{matched.email}</div>
                <div><b>{UI_TEXT[lang]?.interest}：</b>{matched.interest}</div>
                <div><b>{UI_TEXT[lang]?.eventType}：</b>{matched.eventType}</div>
                <div><b>{UI_TEXT[lang]?.bio}：</b>{matched.bio}</div>
              </div>
            )}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
              <select value={selectedGift} onChange={e=>setSelectedGift(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #6B5BFF', fontSize: 18 }}>
                {GIFT_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              <button
                onClick={handleSendGift}
                style={{ padding: '6px 18px', borderRadius: 8, fontWeight: 700, background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', fontSize: 16, transition: 'background 0.18s, box-shadow 0.18s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #3a2fff 60%, #0e7fd6 100%)'; e.currentTarget.style.boxShadow = '0 6px 32px #6B5BFF99'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)'; e.currentTarget.style.boxShadow = 'none'; }}
              >{UI_TEXT[lang]?.sendGift}</button>
              <button
                onClick={handleSendEmail}
                style={{ padding: '6px 18px', borderRadius: 8, fontWeight: 700, background: '#fff', color: '#6B5BFF', border: '2px solid #6B5BFF', fontSize: 16, transition: 'background 0.18s, color 0.18s, box-shadow 0.18s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#6B5BFF'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 6px 32px #6B5BFF99'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6B5BFF'; e.currentTarget.style.boxShadow = 'none'; }}
              >{UI_TEXT[lang]?.sendEmail}</button>
            </div>
            {/* 右下角下一頁按鈕 */}
            <button
              onClick={handleNextMatch}
              style={{ position: 'absolute', right: 18, bottom: 0, transform: 'translateY(60px)', padding: '8px 24px', borderRadius: 8, fontWeight: 700, background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', fontSize: 16, boxShadow: '0 2px 8px #6B5BFF33', transition: 'background 0.18s, box-shadow 0.18s, transform 0.18s', cursor: 'pointer' }}
              onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #3a2fff 60%, #0e7fd6 100%)'; e.currentTarget.style.boxShadow = '0 6px 32px #6B5BFF99'; e.currentTarget.style.transform = 'translateY(55px) scale(1.04)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)'; e.currentTarget.style.boxShadow = '0 2px 8px #6B5BFF33'; e.currentTarget.style.transform = 'translateY(60px)'; }}
            >{UI_TEXT[lang]?.next}</button>
          </div>
        </div>
      </div>
    </div>
  );
} 