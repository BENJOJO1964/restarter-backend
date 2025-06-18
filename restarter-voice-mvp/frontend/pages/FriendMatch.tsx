import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { LANGS, TEXT, useLanguage, LanguageCode } from '../shared/i18n';
import { RecommendationList } from '../components/RecommendationList';
import { mockUsers } from '../shared/recommendation';
import { getFirestore, collection, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import app from '../src/firebaseConfig';

const AVATAR_LIST = [
  '/avatars/male1.jpg', '/avatars/female1.jpg', '/avatars/male2.jpg', '/avatars/female2.jpg',
  '/avatars/male3.jpg', '/avatars/female3.jpg', '/avatars/male4.jpg', '/avatars/female4.jpg',
];

const GENDER_EMOJI: Record<string, string> = { male: '👨', female: '👩', other: '🧑' };

const COUNTRY_MAP = {
  '台灣': { 'zh-TW': '台灣', 'zh-CN': '台湾', 'en': 'Taiwan', 'ja': '台湾', 'ko': '대만', 'vi': 'Đài Loan' },
  '日本': { 'zh-TW': '日本', 'zh-CN': '日本', 'en': 'Japan', 'ja': '日本', 'ko': '일본', 'vi': 'Nhật Bản' },
  '美國': { 'zh-TW': '美國', 'zh-CN': '美国', 'en': 'USA', 'ja': 'アメリカ', 'ko': '미국', 'vi': 'Mỹ' },
};
const CITY_MAP = {
  '台北': { 'zh-TW': '台北', 'zh-CN': '台北', 'en': 'Taipei', 'ja': '台北', 'ko': '타이베이', 'vi': 'Đài Bắc' },
  '東京': { 'zh-TW': '東京', 'zh-CN': '东京', 'en': 'Tokyo', 'ja': '東京', 'ko': '도쿄', 'vi': 'Tokyo' },
  '舊金山': { 'zh-TW': '舊金山', 'zh-CN': '旧金山', 'en': 'San Francisco', 'ja': 'サンフランシスコ', 'ko': '샌프란시스코', 'vi': 'San Francisco' },
};
const INTEREST_MAP = {
  '閱讀': { 'zh-TW': '閱讀', 'zh-CN': '阅读', 'en': 'Reading', 'ja': '読書', 'ko': '독서', 'vi': 'Đọc sách' },
  '音樂': { 'zh-TW': '音樂', 'zh-CN': '音乐', 'en': 'Music', 'ja': '音楽', 'ko': '음악', 'vi': 'Âm nhạc' },
  '運動': { 'zh-TW': '運動', 'zh-CN': '运动', 'en': 'Sports', 'ja': 'スポーツ', 'ko': '스포츠', 'vi': 'Thể thao' },
};

const COUNTRY_OPTIONS = {
  'zh-TW': ['台灣', '日本', '美國'],
  'zh-CN': ['台湾', '日本', '美国'],
  'en': ['Taiwan', 'Japan', 'USA'],
  'ja': ['台湾', '日本', 'アメリカ'],
  'ko': ['대만', '일본', '미국'],
  'vi': ['Đài Loan', 'Nhật Bản', 'Mỹ'],
};
const AGE_RANGE_OPTIONS = {
  'zh-TW': ['18-25', '26-35', '36-45', '46+'],
  'zh-CN': ['18-25', '26-35', '36-45', '46+'],
  'en': ['18-25', '26-35', '36-45', '46+'],
  'ja': ['18-25', '26-35', '36-45', '46+'],
  'ko': ['18-25', '26-35', '36-45', '46+'],
  'vi': ['18-25', '26-35', '36-45', '46+'],
};
const INTEREST_OPTIONS = {
  'zh-TW': ['閱讀', '音樂', '運動'],
  'zh-CN': ['阅读', '音乐', '运动'],
  'en': ['Reading', 'Music', 'Sports'],
  'ja': ['読書', '音楽', 'スポーツ'],
  'ko': ['독서', '음악', '스포츠'],
  'vi': ['Đọc sách', 'Âm nhạc', 'Thể thao'],
};
const EVENT_TYPE_OPTIONS = {
  'zh-TW': ['線上', '線下'],
  'zh-CN': ['线上', '线下'],
  'en': ['Online', 'Offline'],
  'ja': ['オンライン', 'オフライン'],
  'ko': ['온라인', '오프라인'],
  'vi': ['Trực tuyến', 'Ngoại tuyến'],
};

export default function FriendMatch() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { lang, setLang } = useLanguage();
  const [form, setForm] = useState({ name: '', country: '', region: '', interest: '', email: '', gender: '', age: '', eventType: '' });
  const [sent, setSent] = useState(false);
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const db = getFirestore(app);

  // 取得所有用戶
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => doc.data());
      setUsers(userList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  // 根據條件過濾用戶
  const filteredUsers = users.filter(user => {
    if (form.gender && user.gender !== form.gender) return false;
    if (form.age && user.age !== form.age) return false;
    if (form.eventType && user.eventType !== form.eventType) return false;
    if (form.country && user.country !== form.country) return false;
    if (form.region && user.region !== form.region) return false;
    if (form.interest && user.interest !== form.interest) return false;
    return true;
  });
  const pageSize = 6;
  const pagedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="modern-bg" style={{ background: `url('/green_hut.png') center center / cover no-repeat`, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{position:'absolute',top:0,left:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent'}}>
        <button className="topbar-btn" onClick={()=>navigate('/')} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginRight:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{TEXT[lang].backHome}</button>
        {window.location.pathname!=='/friend' && <button className="topbar-btn" onClick={()=>navigate(-1)} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginLeft:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{TEXT[lang].back}</button>}
      </div>
      <div style={{position:'absolute',top:0,right:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',gap:12}}>
        <button className="topbar-btn" onClick={async()=>{await signOut(auth);localStorage.clear();window.location.href='/';}} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{TEXT[lang].logout}</button>
        <select className="topbar-select" value={lang} onChange={e=>{setLang(e.target.value as LanguageCode);localStorage.setItem('lang',e.target.value);}} style={{padding:'6px 14px',borderRadius:8,fontWeight:600,border:'1.5px solid #6B5BFF',color:'#6B5BFF',background:'#fff',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>
          <option value="zh-TW">繁中</option>
          <option value="zh-CN">简中</option>
          <option value="en">EN</option>
          <option value="ja">日文</option>
          <option value="ko">한국어</option>
          <option value="vi">Tiếng Việt</option>
        </select>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#6B5BFF', textShadow: '0 2px 12px #6B5BFF88, 0 4px 24px #0008', letterSpacing:1, background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #6B5BFF22', padding:'12px 32px', margin:0, display:'flex',alignItems:'center',gap:12, marginBottom: 24 }}>🧑‍🤝‍🧑 {TEXT[lang].friendMatch}</h2>
        <div className="modern-container" style={{ maxWidth: 700, width: '100%', margin: '0 auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, background: '#f7f7ff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px #6B5BFF11', marginBottom: 0 }}>
              <h2 style={{ fontWeight: 900, fontSize: 24, color: '#6B5BFF', marginBottom: 18, textAlign: 'center' }}>
                {TEXT[lang].preferencesTitle}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 0 }}>
                <select name="gender" value={form.gender || ''} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{TEXT[lang].gender}</option>
                  <option value="male">{TEXT[lang].male}</option>
                  <option value="female">{TEXT[lang].female}</option>
                  <option value="other">其他</option>
                </select>
                <select name="age" value={form.age} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{TEXT[lang].age}</option>
                  {AGE_RANGE_OPTIONS[lang]?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="eventType" value={form.eventType} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{TEXT[lang].eventType}</option>
                  {EVENT_TYPE_OPTIONS[lang]?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="country" value={form.country} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{TEXT[lang].country}</option>
                  {COUNTRY_OPTIONS[lang]?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <input name="region" placeholder={TEXT[lang].city} value={form.region} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                <select name="interest" value={form.interest} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{TEXT[lang].interest}</option>
                  {INTEREST_OPTIONS[lang]?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button type="submit" style={{ padding: 12, background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 17, marginTop: 8, letterSpacing: 1, boxShadow: '0 2px 12px #6B5BFF33' }}>{TEXT[lang].save}</button>
                {sent && <div style={{ color: '#6B5BFF', fontWeight: 700 }}>{TEXT[lang].saved}</div>}
              </form>
            </div>
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'flex-start' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
                {pagedUsers.map(user => (
                  <div key={user.uid || user.id} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px #6B5BFF11', minWidth: 220, maxWidth: 260, width: '100%', display: 'flex', flexDirection: 'column', gap: 8, border: '1.5px solid #eee', position: 'relative', paddingRight: 24, paddingBottom: 32 }}>
                    <img src={user.avatar || AVATAR_LIST[0]} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #6B5BFF', background: '#eee', position: 'absolute', left: 140, bottom: 18, zIndex: 1 }} />
                    <div style={{ flex: 1, paddingRight: 0 }}>
                      <div style={{ fontWeight: 700, color: '#6B5BFF', fontSize: 17, whiteSpace: 'nowrap' }}>
                        <b>{TEXT[lang].name}{TEXT[lang].colon} </b><span>{user.nickname || user.name}</span>
                        <b style={{marginLeft:12}}>{TEXT[lang].gender}{TEXT[lang].colon} </b><span>{TEXT[lang][user.gender as 'male' | 'female' | 'other']}</span>
                      </div>
                      <div style={{ color: '#644F27', fontSize: 15, whiteSpace: 'nowrap', marginTop: 2 }}>
                        <b>{TEXT[lang].country}{TEXT[lang].colon} </b>{user.country}
                        <b style={{marginLeft:12}}>{TEXT[lang].city}{TEXT[lang].colon} </b>{user.region}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', color: '#614425', fontSize: 15, marginTop: 2, justifyContent: 'space-between' }}>
                        <span><b>{TEXT[lang].interest}{TEXT[lang].colon} </b>{user.interest}</span>
                        <span style={{marginLeft: 12}}><b>{TEXT[lang].age}{TEXT[lang].colon} </b>{user.age}</span>
                      </div>
                      <button
                        style={{ marginTop: 14, padding: '8px 22px', background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: '2.5px solid #fff', borderRadius: 12, fontWeight: 900, fontSize: 18, alignSelf: 'flex-start', letterSpacing: 1, boxShadow: '0 2px 16px #6B5BFF55', transition: 'background 0.18s, box-shadow 0.18s, border 0.18s, color 0.18s, font-size 0.18s', zIndex: 2 }}
                      >
                        {TEXT[lang].invite}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setPage(p => p + 1)} style={{ marginTop: 18, alignSelf: 'flex-end', padding: '8px 32px', background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 16, letterSpacing: 1, boxShadow: '0 2px 12px #6B5BFF33', transition: 'background 0.2s, box-shadow 0.2s' }}>{TEXT[lang].next}</button>
            </div>
          </div>
        </div>
      </div>
      <RecommendationList type="friend" user={mockUsers[0]} />
      <RecommendationList type="group" user={mockUsers[0]} />
    </div>
  );
} 