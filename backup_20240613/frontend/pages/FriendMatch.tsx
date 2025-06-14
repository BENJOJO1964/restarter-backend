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
  '台灣': { 'zh-TW': '台灣', 'zh-CN': '台湾', 'en': 'Taiwan', 'ja': '台湾' },
  '日本': { 'zh-TW': '日本', 'zh-CN': '日本', 'en': 'Japan', 'ja': '日本' },
  '美國': { 'zh-TW': '美國', 'zh-CN': '美国', 'en': 'USA', 'ja': 'アメリカ' },
};
const CITY_MAP = {
  '台北': { 'zh-TW': '台北', 'zh-CN': '台北', 'en': 'Taipei', 'ja': '台北' },
  '東京': { 'zh-TW': '東京', 'zh-CN': '东京', 'en': 'Tokyo', 'ja': '東京' },
  '舊金山': { 'zh-TW': '舊金山', 'zh-CN': '旧金山', 'en': 'San Francisco', 'ja': 'サンフランシスコ' },
};
const INTEREST_MAP = {
  '閱讀': { 'zh-TW': '閱讀', 'zh-CN': '阅读', 'en': 'Reading', 'ja': '読書' },
  '音樂': { 'zh-TW': '音樂', 'zh-CN': '音乐', 'en': 'Music', 'ja': '音楽' },
  '運動': { 'zh-TW': '運動', 'zh-CN': '运动', 'en': 'Sports', 'ja': 'スポーツ' },
};

const COUNTRY_OPTIONS = {
  'zh-TW': ['台灣','中國大陸','日本','韓國','馬來西亞','新加坡','印尼','越南','菲律賓','英國','法國','德國','美國','加拿大','非洲','歐洲','南美洲','中東','其他'],
  'zh-CN': ['台湾','中国大陆','日本','韩国','马来西亚','新加坡','印尼','越南','菲律宾','英国','法国','德国','美国','加拿大','非洲','欧洲','南美洲','中东','其他'],
  'en': ['Taiwan','China','Japan','Korea','Malaysia','Singapore','Indonesia','Vietnam','Philippines','UK','France','Germany','USA','Canada','Africa','Europe','South America','Middle East','Other'],
  'ja': ['台湾','中国','日本','韓国','マレーシア','シンガポール','インドネシア','ベトナム','フィリピン','イギリス','フランス','ドイツ','アメリカ','カナダ','アフリカ','ヨーロッパ','南アメリカ','中東','その他'],
};
const AGE_RANGE_OPTIONS = {
  'zh-TW': ['18-23','24-28','29-33','34-39','40-46','47-51','52-58','59-64','65-72','73-80'],
  'zh-CN': ['18-23','24-28','29-33','34-39','40-46','47-51','52-58','59-64','65-72','73-80'],
  'en': ['18-23','24-28','29-33','34-39','40-46','47-51','52-58','59-64','65-72','73-80'],
  'ja': ['18-23','24-28','29-33','34-39','40-46','47-51','52-58','59-64','65-72','73-80'],
};
const INTEREST_OPTIONS = {
  'zh-TW': ['經濟','運動','閱讀','電影','旅遊','交友','唱歌','電商','做生意','電腦','AI','其他'],
  'zh-CN': ['经济','运动','阅读','电影','旅游','交友','唱歌','电商','做生意','电脑','AI','其他'],
  'en': ['Economy','Sports','Reading','Movie','Travel','Friendship','Singing','E-commerce','Business','Computer','AI','Other'],
  'ja': ['経済','スポーツ','読書','映画','旅行','友達','カラオケ','EC','ビジネス','パソコン','AI','その他'],
};
const EVENT_TYPE_OPTIONS = {
  'zh-TW': ['經濟','政治','科技','法律','毒品','民事','傷害'],
  'zh-CN': ['经济','政治','科技','法律','毒品','民事','伤害'],
  'en': ['Economy','Politics','Technology','Law','Drugs','Civil','Injury'],
  'ja': ['経済','政治','テクノロジー','法律','薬物','民事','傷害'],
};

export default function FriendMatch() {
  const navigate = useNavigate();
  const auth = getAuth();
  const lang = (localStorage.getItem('lang') as 'zh-TW'|'zh-CN'|'en'|'ja') || 'zh-TW';
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
        <button className="topbar-btn" onClick={()=>navigate('/')} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginRight:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{lang==='zh-TW'?'← 返回首頁':lang==='zh-CN'?'← 返回首页':lang==='ja'?'← ホームへ戻る':'← Home'}</button>
        {window.location.pathname!=='/friend' && <button className="topbar-btn" onClick={()=>navigate(-1)} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s', marginLeft:8}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{lang==='zh-TW'?'↩ 返回上一頁':lang==='zh-CN'?'↩ 返回上一页':lang==='ja'?'↩ 前のページへ':'↩ Back'}</button>}
      </div>
      <div style={{position:'absolute',top:0,right:0,zIndex:100,display:'flex',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',gap:12}}>
        <button className="topbar-btn" onClick={async()=>{await signOut(auth);localStorage.clear();window.location.href='/'}} style={{fontWeight:700,fontSize:18,padding:'6px 16px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>{lang==='zh-TW'?'登出':lang==='zh-CN'?'登出':lang==='ja'?'ログアウト':'Logout'}</button>
        <select className="topbar-select" value={lang} onChange={e=>{localStorage.setItem('lang',e.target.value);window.location.reload();}} style={{padding:'6px 14px',borderRadius:8,fontWeight:600,border:'1.5px solid #6B5BFF',color:'#6B5BFF',background:'#fff',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}} onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}>
          <option value="zh-TW">繁中</option>
          <option value="zh-CN">简中</option>
          <option value="en">EN</option>
          <option value="ja">日文</option>
        </select>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#6B5BFF', textShadow: '0 2px 12px #6B5BFF88, 0 4px 24px #0008', letterSpacing:1, background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #6B5BFF22', padding:'12px 32px', margin:0, display:'flex',alignItems:'center',gap:12, marginBottom: 24 }}>🧑‍🤝‍🧑 {lang==='zh-TW'?'交友區 Friend Match':lang==='zh-CN'?'交友区 Friend Match':lang==='ja'?'友達マッチ Friend Match':'Friend Match'}</h2>
        <div className="modern-container" style={{ maxWidth: 700, width: '100%', margin: '0 auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, background: '#f7f7ff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px #6B5BFF11', marginBottom: 0 }}>
              <h2 style={{ fontWeight: 900, fontSize: 24, color: '#6B5BFF', marginBottom: 18, textAlign: 'center' }}>
                {lang==='zh-TW'?'理想朋友條件':lang==='zh-CN'?'理想朋友条件':lang==='ja'?'理想の友達条件':'Friend Preferences'}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 0 }}>
                <select name="gender" value={form.gender || ''} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">性別</option>
                  <option value="male">{lang==='zh-TW'?'男性':lang==='zh-CN'?'男性':lang==='ja'?'男性':'Male'}</option>
                  <option value="female">{lang==='zh-TW'?'女性':lang==='zh-CN'?'女性':lang==='ja'?'女性':'Female'}</option>
                  <option value="other">其他</option>
                </select>
                <select name="age" value={form.age} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{lang==='zh-TW'?'年齡':lang==='zh-CN'?'年龄':lang==='ja'?'年齢':'Age'}</option>
                  {AGE_RANGE_OPTIONS[lang].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="eventType" value={form.eventType} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{lang==='zh-TW'?'事件類型':lang==='zh-CN'?'事件类型':lang==='ja'?'イベントタイプ':'Event Type'}</option>
                  {EVENT_TYPE_OPTIONS[lang].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="country" value={form.country} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{lang==='zh-TW'?'國家(地區)':lang==='zh-CN'?'國家(地區)':lang==='ja'?'国(地域)':'Country (Region)'}</option>
                  {COUNTRY_OPTIONS[lang].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <input name="region" placeholder={lang==='zh-TW'?'城市':lang==='zh-CN'?'城市':lang==='ja'?'都市':'City'} value={form.region} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                <select name="interest" value={form.interest} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="">{lang==='zh-TW'?'興趣':lang==='zh-CN'?'兴趣':lang==='ja'?'趣味':'Interest'}</option>
                  {INTEREST_OPTIONS[lang].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button type="submit" style={{ padding: 12, background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 17, marginTop: 8, letterSpacing: 1, boxShadow: '0 2px 12px #6B5BFF33' }}>{lang==='zh-TW'?'儲存資料':lang==='zh-CN'?'保存资料':lang==='ja'?'データ保存':'Save'}</button>
                {sent && <div style={{ color: '#6B5BFF', fontWeight: 700 }}>已儲存！</div>}
              </form>
            </div>
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'flex-start' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {pagedUsers.map(user => (
                  <div key={user.id} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px #6B5BFF11', display: 'flex', flexDirection: 'row', gap: 12, border: '1.5px solid #eee', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#6B5BFF', fontSize: 17 }}><b>{lang==='zh-TW'?'暱稱：':lang==='zh-CN'?'昵称：':lang==='ja'?'ニックネーム：':'Name: '}</b>{user.name} {user.gender && GENDER_EMOJI[user.gender]}</div>
                      <div style={{ color: '#6B4F27', fontSize: 15 }}><b>{lang==='zh-TW'?'國家(地區)：':lang==='zh-CN'?'國家(地區)：':lang==='ja'?'国(地域)：':'Country (Region): '}</b>{COUNTRY_MAP[user.country as keyof typeof COUNTRY_MAP]?.[lang]||user.country}　<b>{lang==='zh-TW'?'城市：':lang==='zh-CN'?'城市：':lang==='ja'?'都市：':'City: '}</b>{CITY_MAP[user.region as keyof typeof CITY_MAP]?.[lang]||user.region}</div>
                      <div style={{ color: '#232946', fontSize: 15 }}><b>{lang==='zh-TW'?'興趣：':lang==='zh-CN'?'兴趣：':lang==='ja'?'趣味：':'Interest: '}</b>{INTEREST_MAP[user.interest as keyof typeof INTEREST_MAP]?.[lang]||user.interest}</div>
                      <div style={{ color: '#614425', fontSize: 15 }}><b>Email：</b>{user.email}</div>
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
                        {lang==='zh-TW'?'邀請交友':lang==='zh-CN'?'邀请交友':lang==='ja'?'友達申請':'Invite'}
                      </button>
                      {inviteTo === user.email && <div style={{ color: '#6B5BFF', fontWeight: 900, marginTop: 6, fontSize: 15 }}>{lang==='zh-TW'?'邀請已發送（Email）！':lang==='zh-CN'?'邀请已发送（Email）！':lang==='ja'?'招待を送信しました（Email）！':'Invite sent (Email)!'}</div>}
                    </div>
                    <img src={user.avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #6B5BFF', background: '#eee' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => setPage(p => p + 1)} style={{ marginTop: 18, alignSelf: 'flex-end', padding: '8px 32px', background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 16, letterSpacing: 1, boxShadow: '0 2px 12px #6B5BFF33', transition: 'background 0.2s, box-shadow 0.2s' }}>{lang==='zh-TW'?'下一頁':lang==='zh-CN'?'下一页':lang==='ja'?'次へ':'Next'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 