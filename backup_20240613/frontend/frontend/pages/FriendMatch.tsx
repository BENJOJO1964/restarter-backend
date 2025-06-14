import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const mockUsers = [
  { id: 1, name: 'Alice', country: '台灣', region: '台北', interest: '閱讀', email: 'alice@example.com', gender: 'female' },
  { id: 2, name: 'Bob', country: '日本', region: '東京', interest: '音樂', email: 'bob@example.com', gender: 'male' },
  { id: 3, name: 'Carol', country: '美國', region: '舊金山', interest: '運動', email: 'carol@example.com', gender: 'female' },
];

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

const TEXT = {
  'zh-TW': {
    friendMatch: '交友區 Friend Match',
    preferences: '理想朋友條件',
    name: '暱稱',
    country: '國家(地區)',
    city: '城市',
    interest: '興趣',
    email: 'Email',
    invite: '邀請交友',
    invited: '邀請已發送（Email）！',
    age: '年齡',
    eventType: '事件類型',
    save: '儲存資料',
    saved: '已儲存！',
    next: '下一頁',
    male: '男性',
    female: '女性',
    other: '其他',
    preferencesTitle: '理想朋友條件',
    friendPreferences: '理想朋友條件',
    home: '首頁',
    gender: '性別',
    backHome: '返回首頁',
  },
  'zh-CN': {
    friendMatch: '交友区 Friend Match',
    preferences: '理想朋友条件',
    name: '昵称',
    country: '国家(地区)',
    city: '城市',
    interest: '兴趣',
    email: 'Email',
    invite: '邀请交友',
    invited: '邀请已发送（Email）！',
    age: '年龄',
    eventType: '事件类型',
    save: '保存资料',
    saved: '已保存！',
    next: '下一页',
    male: '男性',
    female: '女性',
    other: '其他',
    preferencesTitle: '理想朋友条件',
    friendPreferences: '理想朋友条件',
    home: '首页',
    gender: '性别',
    backHome: '返回首页',
  },
  'en': {
    friendMatch: 'Friend Match',
    preferences: 'Friend Preferences',
    name: 'Name',
    country: 'Country (Region)',
    city: 'City',
    interest: 'Interest',
    email: 'Email',
    invite: 'Invite',
    invited: 'Invite sent (Email)!',
    age: 'Age',
    eventType: 'Event Type',
    save: 'Save',
    saved: 'Saved!',
    next: 'Next',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    preferencesTitle: 'Friend Preferences',
    friendPreferences: 'Friend Preferences',
    home: 'Home',
    gender: 'Gender',
    backHome: 'Back to Home',
  },
  'ja': {
    friendMatch: '友達マッチ Friend Match',
    preferences: '理想の友達条件',
    name: 'ニックネーム',
    country: '国(地域)',
    city: '都市',
    interest: '趣味',
    email: 'Email',
    invite: '友達申請',
    invited: '招待を送信しました（Email）！',
    age: '年齢',
    eventType: 'イベントタイプ',
    save: 'データ保存',
    saved: '保存しました！',
    next: '次へ',
    male: '男性',
    female: '女性',
    other: 'その他',
    preferencesTitle: '理想の友達条件',
    friendPreferences: '理想の友達条件',
    home: 'ホームへ戻る',
    gender: '性別',
    backHome: 'ホームへ戻る',
  },
  'ko': {
    friendMatch: '친구 매칭',
    preferences: '친구 조건',
    name: '이름',
    country: '국가(지역)',
    city: '도시',
    interest: '관심사',
    email: '이메일',
    invite: '초대',
    invited: '초대가 전송되었습니다(이메일)!',
    age: '나이',
    eventType: '이벤트 유형',
    save: '저장',
    saved: '저장됨!',
    next: '다음',
    male: '남성',
    female: '여성',
    other: '기타',
    preferencesTitle: '친구 조건',
    friendPreferences: '친구 조건',
    home: '홈으로',
    gender: '성별',
    backHome: '홈으로',
  },
  'vi': {
    friendMatch: 'Kết bạn',
    preferences: 'Tiêu chí bạn bè',
    name: 'Tên',
    country: 'Quốc gia (Khu vực)',
    city: 'Thành phố',
    interest: 'Sở thích',
    email: 'Email',
    invite: 'Kết bạn',
    invited: 'Đã gửi lời mời (Email)!',
    age: 'Tuổi',
    eventType: 'Loại sự kiện',
    save: 'Lưu',
    saved: 'Đã lưu!',
    next: 'Tiếp',
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
    preferencesTitle: 'Tiêu chí bạn bè',
    friendPreferences: 'Tiêu chí bạn bè',
    home: 'Trang chủ',
    gender: 'Giới tính',
    backHome: 'Trang chủ',
  },
};

export default function FriendMatch() {
  const navigate = useNavigate();
  const auth = getAuth();
  const lang = (localStorage.getItem('lang') as 'zh-TW'|'zh-CN'|'en'|'ja'|'ko'|'vi') || 'zh-TW';
  const [form, setForm] = useState({ name: '', country: '', region: '', interest: '', email: '', gender: '', age: '', eventType: '' });
  const [sent, setSent] = useState(false);
  const [inviteTo, setInviteTo] = useState<string|null>(null);
  const [page, setPage] = useState(0);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };
  const handleInvite = (user: typeof mockUsers[0]) => {
    setInviteTo(user.email);
    setTimeout(() => setInviteTo(null), 2000);
    // 這裡可串接 email 發送服務
  };
  const showInviteToast = (name: string) => {
    alert(`已發送邀請給 ${name}！`);
  };
  const usersToShow = Array(30).fill(0).map((_, i) => ({ ...mockUsers[i % mockUsers.length], avatar: AVATAR_LIST[i % AVATAR_LIST.length], id: i+1 }));
  const pageSize = 6;
  const pagedUsers = usersToShow.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <div className="modern-bg" style={{ background: `url('/green_hut.png') center center / cover no-repeat`, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{position:'absolute',top:0,left:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent'}}>
        <button className="topbar-btn" onClick={()=>navigate('/')} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginRight:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{TEXT[lang].backHome}</button>
        {window.location.pathname!=='/friend' && <button className="topbar-btn" onClick={()=>navigate(-1)} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginLeft:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{lang==='zh-TW'?'↩ 返回上一頁':lang==='zh-CN'?'↩ 返回上一页':lang==='ja'?'↩ 前のページへ':'↩ Back'}</button>}
      </div>
      <div style={{position:'absolute',top:0,right:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',gap:12}}>
        <button className="topbar-btn" onClick={async()=>{await signOut(auth);localStorage.clear();window.location.href='/';}} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{lang==='zh-TW'?'登出':lang==='zh-CN'?'登出':lang==='ja'?'ログアウト':lang==='ko'?'로그아웃':lang==='vi'?'Đăng xuất':'Logout'}</button>
        <select className="topbar-select" value={lang} onChange={e=>{localStorage.setItem('lang',e.target.value);window.location.reload();}} style={{padding:'6px 14px',borderRadius:8,fontWeight:600,border:'1.5px solid #6B5BFF',color:'#6B5BFF',background:'#fff',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {pagedUsers.map(user => (
                  <div key={user.id} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px #6B5BFF11', display: 'flex', flexDirection: 'row', gap: 12, border: '1.5px solid #eee', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#6B5BFF', fontSize: 17 }}><b>{TEXT[lang].name}:</b>{user.name} {user.gender && GENDER_EMOJI[user.gender]}</div>
                      <div style={{ color: '#644F27', fontSize: 15 }}><b>{TEXT[lang].country}:</b>{COUNTRY_MAP[user.country as keyof typeof COUNTRY_MAP]?.[lang]||user.country}　<b>{TEXT[lang].city}:</b>{CITY_MAP[user.region as keyof typeof CITY_MAP]?.[lang]||user.region}</div>
                      <div style={{ color: '#232946', fontSize: 15 }}><b>{TEXT[lang].interest}:</b>{INTEREST_MAP[user.interest as keyof typeof INTEREST_MAP]?.[lang]||user.interest}</div>
                      <div style={{ color: '#614425', fontSize: 15 }}><b>{TEXT[lang].email}:</b>{user.email}</div>
                      <button
                        onClick={() => { handleInvite(user); showInviteToast(user.name); }}
                        style={{ marginTop: 10, padding: '8px 22px', background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: '2.5px solid #fff', borderRadius: 12, fontWeight: 900, fontSize: 18, alignSelf: 'flex-end', letterSpacing: 1, boxShadow: '0 2px 16px #6B5BFF55', transition: 'background 0.18s, box-shadow 0.18s, border 0.18s, color 0.18s, font-size 0.18s' }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #3a2fff 60%, #0e7fd6 100%)';
                          e.currentTarget.style.boxShadow = '0 6px 32px #6B5BFF99';
                          e.currentTarget.style.border = '2.5px solid #fff';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.fontSize = '19px';
                          e.currentTarget.style.fontWeight = 'bolder';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)';
                          e.currentTarget.style.boxShadow = '0 2px 16px #6B5BFF55';
                          e.currentTarget.style.border = '2.5px solid #fff';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.fontSize = '18px';
                          e.currentTarget.style.fontWeight = '900';
                        }}
                      >
                        {TEXT[lang].invite}
                      </button>
                      {inviteTo === user.email && <div style={{ color: '#6B5BFF', fontWeight: 900, marginTop: 6, fontSize: 15 }}>{TEXT[lang].invited}</div>}
                    </div>
                    <img src={user.avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #6B5BFF', background: '#eee' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => setPage(p => p + 1)} style={{ marginTop: 18, alignSelf: 'flex-end', padding: '8px 32px', background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 16, letterSpacing: 1, boxShadow: '0 2px 12px #6B5BFF33', transition: 'background 0.2s, box-shadow 0.2s' }}>{TEXT[lang].next}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 