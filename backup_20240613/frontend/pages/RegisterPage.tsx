import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../src/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(app);

const LANGS = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'zh-CN', label: '简中' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
];
const TEXT = {
  'zh-TW': {
    heroLeftTop: '更生人不是罪',
    heroLeftMain: '不是沒能力，',
    heroLeftSub: '只是被過去耽誤太久。',
    heroLeftYellow: '野花昂首盡綻放！',
    heroRightTop: '我要重新開始...',
    heroRightSub: '不為誰，只為自己。',
    heroRightYellow: '浪子回頭金不換！',
    title: 'Restarter™ 註冊',
    email: 'Email (e.g: example@gmail.com)【必填】',
    password: '密碼【必填】（至少8位數包含英文/數字）',
    nickname: '暱稱【必填】',
    age: '年齡【必填】',
    gender: '選擇性別【必填】',
    male: '男性 👨',
    female: '女性 👩',
    bio: '簡介',
    submit: '🚀 立即註冊',
    fileSelect: '選擇檔案',
  },
  'zh-CN': {
    heroLeftTop: '更生人不是错',
    heroLeftMain: '不是没能力，',
    heroLeftSub: '只是被过去耽误太久。',
    heroLeftYellow: '野花昂首尽绽放！',
    heroRightTop: '我要重新开始...',
    heroRightSub: '不为谁，只为自己。',
    heroRightYellow: '浪子回头金不换！',
    title: 'Restarter™ 注册',
    email: '邮箱 (e.g: example@gmail.com)【必填】',
    password: '密码【必填】（至少8位包含字母/数字）',
    nickname: '昵称【必填】',
    age: '年龄【必填】',
    gender: '选择性别【必填】',
    male: '男性 👨',
    female: '女性 👩',
    bio: '简介',
    submit: '🚀 立即注册',
    fileSelect: '选择文件',
  },
  'en': {
    heroLeftTop: "Redemption is not a crime",
    heroLeftMain: "It's not lack of ability,",
    heroLeftSub: "just too much time lost in the past.",
    heroLeftYellow: "Wildflowers bloom bravely!",
    heroRightTop: "I want a new start...",
    heroRightSub: "Not for anyone else, just for myself.",
    heroRightYellow: "A prodigal's return is priceless!",
    title: 'Restarter™ Sign Up',
    email: 'Email (e.g: example@gmail.com) *required',
    password: 'Password *required (at least 8 chars, letters & numbers)',
    nickname: 'Nickname *required',
    age: 'Age *required',
    gender: 'Gender *required',
    male: 'Male 👨',
    female: 'Female 👩',
    bio: 'Bio',
    submit: '🚀 Sign Up',
    fileSelect: 'Choose File',
  },
  'ja': {
    heroLeftTop: '更生は罪じゃない',
    heroLeftMain: '能力がないわけじゃない、',
    heroLeftSub: 'ただ過去に囚われすぎただけ。',
    heroLeftYellow: '野の花も堂々と咲く！',
    heroRightTop: '私は新しく始めたい...',
    heroRightSub: '誰のためでもなく、自分のために。',
    heroRightYellow: '迷える子羊の帰還は尊い！',
    title: 'Restarter™ 新規登録',
    email: 'メール (e.g: example@gmail.com)【必須】',
    password: 'パスワード【必須】（8文字以上、英数字含む）',
    nickname: 'ニックネーム【必須】',
    age: '年齢【必須】',
    gender: '性別を選択【必須】',
    male: '男性 👨',
    female: '女性 👩',
    bio: '自己紹介',
    submit: '🚀 新規登録',
    fileSelect: 'ファイルを選択',
  },
};

const FILE_LABEL: Record<string, string> = {
  'zh-TW': '上傳頭像',
  'zh-CN': '上传头像',
  'en': 'Upload Avatar',
  'ja': 'アバターをアップロード',
};

const SLOGAN2: Record<string, string> = {
  'zh-TW': '每一位更生人，都是世界的一員！',
  'zh-CN': '每一位更生人，都是世界的一员！',
  'en': 'Every Restarter is still one of us.',
  'ja': 'すべての更生者は世界の一員です！',
};

const restarterRoleLeft: Record<string, string> = {
  'zh-TW': 'Restarter™ 是更生者的 副駕 / 合作人。',
  'zh-CN': 'Restarter™ 是更生者的 副驾 / 合作人。',
  'en': 'Restarter™ is a co-pilot/partner for Restarters.',
  'ja': 'Restarter™ は更生者の副操縦士・パートナーです。',
};
const restarterRoleRight: Record<string, string> = {
  'zh-TW': 'Restarter™ 是更生者的情緒管家 / 生產助手',
  'zh-CN': 'Restarter™ 是更生者的情绪管家 / 生产助手',
  'en': 'Restarter™ is an emotional steward/productivity assistant for Restarters.',
  'ja': 'Restarter™ は更生者の感情マネージャー・生産アシスタントです。',
};

// 驗證函式
function validateEmail(email: string) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email); }
function validatePassword(pw: string) { return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pw); }
function validateNickname(nick: string) { return /^[\w\u4e00-\u9fa5]{2,16}$/.test(nick); }
function validateAge(age: string) { const n = Number(age); return Number.isInteger(n) && n >= 18 && n <= 99; }

// Restarter™ 標語分色處理
function renderRestarterRole(role: string) {
  // role 例：Restarter™ 是更生者的 副駕 / 合作人。
  const match = role.match(/^(Restarter™)(.*)$/);
  if (!match) return role;
  return (
    <span>
      <span style={{ color: '#fff', fontWeight: 700 }}>Restarter™</span>
      <span style={{ color: '#ffd700', fontWeight: 700 }}>{match[2]}</span>
    </span>
  );
}

const INTEREST_OPTIONS = {
  'zh-TW': ['經濟','運動','閱讀','電影','旅遊','交友','唱歌','電商','做生意','電腦','AI','其他'],
  'zh-CN': ['经济','运动','阅读','电影','旅游','交友','唱歌','电商','做生意','电脑','AI','其他'],
  'en': ['Economy','Sports','Reading','Movie','Travel','Friendship','Singing','E-commerce','Business','Computer','AI','Other'],
  'ja': ['経済','スポーツ','読書','映画','旅行','友達','カラオケ','EC','ビジネス','パソコン','AI','その他'],
};

const COUNTRY_OPTIONS = {
  'zh-TW': ['台灣','中國大陸','日本','韓國','馬來西亞','新加坡','印尼','越南','菲律賓','英國','法國','德國','美國','加拿大','非洲','歐洲','南美洲','中東','其他'],
  'zh-CN': ['台湾','中国大陆','日本','韩国','马来西亚','新加坡','印尼','越南','菲律宾','英国','法国','德国','美国','加拿大','非洲','欧洲','南美洲','中东','其他'],
  'en': ['Taiwan','China','Japan','Korea','Malaysia','Singapore','Indonesia','Vietnam','Philippines','UK','France','Germany','USA','Canada','Africa','Europe','South America','Middle East','Other'],
  'ja': ['台湾','中国','日本','韓国','マレーシア','シンガポール','インドネシア','ベトナム','フィリピン','イギリス','フランス','ドイツ','アメリカ','カナダ','アフリカ','ヨーロッパ','南アメリカ','中東','その他'],
};
const EVENT_TYPE_OPTIONS = {
  'zh-TW': ['經濟','政治','科技','法律','毒品','民事','傷害'],
  'zh-CN': ['经济','政治','科技','法律','毒品','民事','伤害'],
  'en': ['Economy','Politics','Technology','Law','Drugs','Civil','Injury'],
  'ja': ['経済','政治','テクノロジー','法律','薬物','民事','傷害'],
};
const REGION_OPTIONS = {
  '台灣': ['台北','新北','台中','高雄','台南','其他'],
  '日本': ['東京','大阪','京都','北海道','其他'],
  '美國': ['舊金山','紐約','洛杉磯','西雅圖','其他'],
  '其他': ['其他'],
};
const AGE_OPTIONS = Array.from({length:82},(_,i)=>i+18);

export default function RegisterPage({ onRegister }: { onRegister: () => void }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'zh-TW'|'zh-CN'|'en'|'ja'>(() => (localStorage.getItem('lang') as 'zh-TW'|'zh-CN'|'en'|'ja') || 'zh-TW');
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  const t = TEXT[lang as keyof typeof TEXT];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [avatarFile, setAvatarFile] = useState<File|null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [interest, setInterest] = useState('');
  const [eventType, setEventType] = useState('');

  // 如果已登入，直接跳轉到首頁
  useEffect(() => {
    import('firebase/auth').then(({ getAuth }) => {
      const auth = getAuth(app);
      if (auth.currentUser) {
        navigate('/');
      }
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) { setError('Email格式不正確'); return; }
    if (!validatePassword(password)) { setError('密碼需8位以上且含英文與數字'); return; }
    if (!validateNickname(nickname)) { setError('暱稱2-16字，僅限中英文與數字'); return; }
    if (!validateAge(age)) { setError('年齡需為18-99歲'); return; }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: nickname });
      // 註冊成功後清空頭像相關 localStorage
      localStorage.removeItem('aiAvatar');
      localStorage.removeItem('avatarWelcomed');
      setLoading(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // 處理頭像上傳預覽
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarUrl('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: `url('/city-blur.jpg') center/cover no-repeat`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* 標語置中，語言切換右上 */}
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        <span style={{ fontWeight: 900, fontSize: 28, color: '#ffd700', letterSpacing: 2, textShadow: '0 2px 8px #23294688', whiteSpace: 'nowrap', textAlign: 'center' }}>{SLOGAN2[lang]}</span>
      </div>
      <div style={{ position: 'fixed', top: 24, right: 36, zIndex: 100 }}>
        <select value={lang} onChange={e => setLang(e.target.value as 'zh-TW'|'zh-CN'|'en'|'ja')} style={{ padding: '6px 14px', borderRadius: 8, fontWeight: 600 }}>
          {LANGS.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
      {/* 三欄式主區域 */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh', alignItems: 'flex-start', justifyContent: 'center', width: '100%', marginTop: 60 }}>
        {/* 左側圖文 */}
        <div style={{ flex: 1, minWidth: 220, maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(60,40,20,0.18)', padding: '0 12px', height: '100vh', boxSizing: 'border-box', paddingBottom: 80 }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ position: 'absolute', top: 24, left: 0, width: '100%', zIndex: 2, textAlign: 'center', textShadow: '0 2px 8px #23294688', pointerEvents: 'none', fontSize: 18, fontWeight: 700 }}>
              {renderRestarterRole(restarterRoleLeft[lang])}
            </div>
            <img src="/left-hero.png" alt="left hero" style={{ width: 300, maxWidth: '98%', marginBottom: 0, marginTop: 80, height: 410, objectFit: 'contain', alignSelf: 'flex-end', zIndex: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 1, width: '100%' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 8, marginTop: 12 }}>{t.heroLeftTop}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 8, marginTop: 12 }}>{t.heroLeftMain}</div>
              <div style={{ color: '#fff', fontWeight: 400, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>{t.heroLeftSub}</div>
              <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 18, textAlign: 'center', marginBottom: 0, height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', boxSizing: 'border-box' }}>{t.heroLeftYellow}</div>
            </div>
          </div>
        </div>
        {/* 中央註冊表單 */}
        <div style={{ flex: 1.2, minWidth: 320, maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 0, position: 'relative', marginBottom: 40 }}>
          <form onSubmit={handleRegister} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 280, maxWidth: 340, width: '100%', boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 0, alignItems: 'center', position: 'relative', justifyContent: 'flex-start' }}>
            <div style={{ width: '100%', textAlign: 'center', fontWeight: 900, fontSize: 20, color: '#6B5BFF', marginBottom: 4, textShadow: '0 2px 8px #6B5BFF88' }}>{t.heroLeftTop}</div>
            {/* LOGO置於表單內左上角 */}
            <img src="/ctx-logo.png" alt="LOGO" style={{ width: 64, height: 64, position: 'absolute', top: 18, left: 18, zIndex: 2 }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: '#6B4F27', marginBottom: 6, marginTop: 18, textAlign: 'center', alignSelf: 'center', position: 'relative', left: 16 }}>{t.title}</div>
            {/* 頭像上傳區塊：input、頭像、emoji 橫向排列 */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'center', width: '100%', marginTop: '-18px' }}>
              <label htmlFor="avatar-upload" style={{ fontSize: 14, marginRight: 8, maxWidth: 110, display: 'inline-block', cursor: 'pointer', border: '1px solid #bbb', borderRadius: 6, padding: '6px 14px', background: '#f7f7ff', fontWeight: 600, color: '#333', opacity: 1 }}>
                {FILE_LABEL[lang]}
              </label>
              <input id="avatar-upload" type="file" accept="image/jpeg,image/png" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#eee', overflow: 'hidden', border: '2px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 90, minHeight: 90, margin: '0 16px' }}>
                {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: 90, height: 90, objectFit: 'cover' }} /> : <span style={{ color: '#bbb', fontSize: 44 }}>👤</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <span
                  style={{ fontSize: 28, cursor: 'pointer', opacity: gender === 'male' ? 1 : 0.4, transition: 'opacity 0.2s' }}
                  onClick={() => setGender('male')}
                  role="img"
                  aria-label="male"
                >👨</span>
                <span
                  style={{ fontSize: 28, cursor: 'pointer', opacity: gender === 'female' ? 1 : 0.4, transition: 'opacity 0.2s' }}
                  onClick={() => setGender('female')}
                  role="img"
                  aria-label="female"
                >👩</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 0, alignItems: 'center', position: 'relative', justifyContent: 'flex-start' }}>
              <input type="email" placeholder={t.email + ' 😊'} value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }} />
              <input type="password" placeholder={t.password + ' 🔒'} value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }} />
              {/* 暱稱/年齡 */}
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <input type="text" placeholder={t.nickname + ' 📝'} value={nickname} onChange={e => setNickname(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }} />
                <select value={age} onChange={e => setAge(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }}>
                  <option value="">{lang==='zh-TW'?'年齡【必填】':lang==='zh-CN'?'年龄【必填】':lang==='ja'?'年齢【必須】':'Age *required'}</option>
                  {AGE_OPTIONS.map((opt: number) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {/* 國家(地區) */}
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <select value={country} onChange={e => {setCountry(e.target.value); setRegion('');}} required style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }}>
                  <option value="">{lang==='zh-TW'?'國家(地區)【必填】':lang==='zh-CN'?'國家(地區)【必填】':lang==='ja'?'国(地域)【必須】':'Country (Region) *required'}</option>
                  {COUNTRY_OPTIONS[lang].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select value={region} onChange={e => setRegion(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }}>
                  <option value="">{lang==='zh-TW'?'城市【必填】':lang==='zh-CN'?'城市【必填】':lang==='ja'?'都市【必須】':'City *required'}</option>
                  {(REGION_OPTIONS[country as keyof typeof REGION_OPTIONS]||[]).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {/* 興趣/事件類型 */}
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <select value={interest} onChange={e => setInterest(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }}>
                  <option value="">{lang==='zh-TW'?'興趣【必填】':lang==='zh-CN'?'兴趣【必填】':lang==='ja'?'趣味【必須】':'Interest *required'}</option>
                  {INTEREST_OPTIONS[lang].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select value={eventType} onChange={e => setEventType(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f7f7ff' }}>
                  <option value="">{lang==='zh-TW'?'事件類型【必填】':lang==='zh-CN'?'事件类型【必填】':lang==='ja'?'イベントタイプ【必須】':'Event Type *required'}</option>
                  {EVENT_TYPE_OPTIONS[lang].map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  <option value="其他">{lang==='zh-TW'?'其他':lang==='zh-CN'?'其他':lang==='ja'?'その他':'Other'}</option>
                </select>
              </div>
            </div>
            {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, marginTop: 8, letterSpacing: 1, boxShadow: '0 2px 12px #6B5BFF33' }}>
              {loading ? '註冊中...' : '🚀 ' + t.submit}
            </button>
            {/* 登入切換 */}
            <button type="button" onClick={() => setShowLogin(true)} style={{ width: '100%', padding: 12, background: '#23c6e6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, marginTop: 8, letterSpacing: 1, boxShadow: '0 2px 12px #23c6e633', cursor: 'pointer' }}>
              {lang === 'zh-TW' ? '登入 🔑' : lang === 'zh-CN' ? '登录 🔑' : lang === 'ja' ? 'ログイン 🔑' : 'Login 🔑'}
            </button>
          </form>
        </div>
        {/* 右側圖文 */}
        <div style={{ flex: 1, minWidth: 220, maxWidth: 340, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', background: 'rgba(60,40,20,0.18)', padding: '0 12px', height: '100vh', boxSizing: 'border-box', paddingBottom: 80 }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ position: 'absolute', top: 24, left: 0, width: '100%', zIndex: 2, textAlign: 'center', textShadow: '0 2px 8px #23294688', pointerEvents: 'none', fontSize: 18, fontWeight: 700 }}>
              {renderRestarterRole(restarterRoleRight[lang])}
            </div>
            <img src="/right-hero.png" alt="right hero" style={{ width: 280, maxWidth: '98%', marginBottom: 0, marginTop: 80, height: 380, objectFit: 'contain', alignSelf: 'flex-end', zIndex: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 1, width: '100%' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 8, marginTop: 12 }}>{t.heroRightTop}</div>
              <div style={{ color: '#fff', fontWeight: 400, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>{t.heroRightSub}</div>
              <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 18, textAlign: 'center', marginBottom: 0, height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', boxSizing: 'border-box' }}>{t.heroRightYellow}</div>
            </div>
          </div>
        </div>
      </div>
      {/* 頁面底部版權 */}
      <div style={{ position: 'fixed', bottom: 12, left: 24, color: '#fff', fontSize: 14, letterSpacing: 1, zIndex: 100, textAlign: 'left' }}>
        CTX Goodlife Inc.  copyright 2025
      </div>
      {/* 登入表單彈窗 */}
      {showLogin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={async e => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
              const auth = getAuth(app);
              const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
              setLoading(false);
              navigate('/');
            } catch (err: any) {
              setError(err.message);
              setLoading(false);
            }
          }} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 280, maxWidth: 340, width: '100%', boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
            <button type="button" onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, color: '#6B4F27', cursor: 'pointer' }}>×</button>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#6B4F27', marginBottom: 8, textAlign: 'center' }}>{lang === 'zh-TW' ? '登入' : lang === 'zh-CN' ? '登录' : lang === 'ja' ? 'ログイン' : 'Login'}</div>
            <input type="email" placeholder={t.email} value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="password" placeholder={t.password} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, marginTop: 8 }}>
              {loading ? (lang === 'zh-TW' ? '登入中...' : lang === 'zh-CN' ? '登录中...' : lang === 'ja' ? 'ログイン中...' : 'Logging in...') : (lang === 'zh-TW' ? '登入' : lang === 'zh-CN' ? '登录' : lang === 'ja' ? 'ログイン' : 'Login')}
            </button>
            <button type="button" onClick={() => { setShowReset(true); setResetMsg(''); setResetEmail(loginEmail); }} style={{ marginTop: 8, background: 'none', color: '#6B5BFF', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', textDecoration: 'underline' }}>
              {lang === 'zh-TW' ? '忘記密碼？' : lang === 'zh-CN' ? '忘记密码？' : lang === 'ja' ? 'パスワードを忘れた？' : 'Forgot password?'}
            </button>
          </form>
          {/* 忘記密碼彈窗 */}
          {showReset && (
            <form onSubmit={async e => {
              e.preventDefault();
              setResetMsg('');
              try {
                const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
                const auth = getAuth(app);
                await sendPasswordResetEmail(auth, resetEmail);
                setResetMsg(lang === 'zh-TW' ? '重設密碼信已寄出，請檢查信箱！' : lang === 'zh-CN' ? '重置密码邮件已发送，请检查邮箱！' : lang === 'ja' ? 'リセットメールを送信しました。メールを確認してください！' : 'Password reset email sent!');
              } catch (err: any) {
                setResetMsg((lang === 'zh-TW' ? '錯誤：' : lang === 'zh-CN' ? '错误：' : lang === 'ja' ? 'エラー：' : 'Error: ') + err.message);
              }
            }} style={{ background: '#fff', borderRadius: 16, padding: 28, minWidth: 260, maxWidth: 320, width: '100%', boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', gap: 14, position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2100 }}>
              <button type="button" onClick={() => setShowReset(false)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 18, color: '#6B4F27', cursor: 'pointer' }}>×</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#6B4F27', marginBottom: 8, textAlign: 'center' }}>{lang === 'zh-TW' ? '重設密碼' : lang === 'zh-CN' ? '重置密码' : lang === 'ja' ? 'パスワード再設定' : 'Reset Password'}</div>
              <input type="email" placeholder={t.email} value={resetEmail} onChange={e => setResetEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
              <button type="submit" style={{ width: '100%', padding: 10, background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                {lang === 'zh-TW' ? '發送重設信' : lang === 'zh-CN' ? '发送重置邮件' : lang === 'ja' ? 'リセットメール送信' : 'Send Reset Email'}
              </button>
              {resetMsg && <div style={{ color: resetMsg.startsWith('錯誤') || resetMsg.startsWith('错误') || resetMsg.startsWith('エラー') || resetMsg.startsWith('Error') ? 'red' : 'green', fontSize: 14, marginTop: 4 }}>{resetMsg}</div>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// 自訂 placeholder 顏色與按鈕 hover 效果
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    input::placeholder, textarea::placeholder {
      color: #614425 !important;
      opacity: 1;
    }
    button[type="submit"]:hover {
      background: #4b3fff !important;
      box-shadow: 0 2px 12px #6B5BFF55;
      transition: background 0.2s, box-shadow 0.2s;
    }
  `;
  document.head.appendChild(style);
} 