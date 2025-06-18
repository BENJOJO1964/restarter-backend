import React, { useState } from 'react';
import { UserProfile, mockUsers } from '../shared/recommendation';
import { UserAchievement, BADGES, calcLevel, nextLevelExp } from '../shared/achievement';
import { useLanguage, TEXT, LanguageCode } from '../shared/i18n';

// 預設 mock 用戶
const defaultUser: UserProfile = { ...mockUsers[0] };
const defaultAchievement: UserAchievement = {
  exp: 80,
  level: 1,
  badges: ['starter'],
};

const ProfilePage: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const [user] = useState<UserProfile>(defaultUser);
  const [achievement, setAchievement] = useState<UserAchievement>(defaultAchievement);

  // 模擬獲得經驗值與徽章
  const handleGainExp = (amount: number) => {
    setAchievement(prev => {
      const newExp = prev.exp + amount;
      const newLevel = calcLevel(newExp);
      let newBadges = [...prev.badges];
      if (newLevel >= 5 && !newBadges.includes('level5')) newBadges.push('level5');
      return { ...prev, exp: newExp, level: newLevel, badges: newBadges };
    });
  };

  // 模擬解鎖徽章
  const handleUnlockBadge = (badgeId: string) => {
    setAchievement(prev => prev.badges.includes(badgeId) ? prev : { ...prev, badges: [...prev.badges, badgeId] });
  };

  // 進度條百分比
  const percent = Math.min(100, Math.round((achievement.exp / nextLevelExp(achievement.level)) * 100));

  return (
    <div style={{minHeight:'100vh',width:'100vw',background: `url('/personal.png') center center / cover no-repeat`, position:'relative'}}>
      {/* 左上角返回首頁按鈕 */}
      <button
        onClick={() => { window.location.href = '/'; }}
        style={{position:'fixed',top:24,left:36,zIndex:100,fontWeight:700,fontSize:18,padding:'6px 18px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',cursor:'pointer',transition:'background 0.18s, color 0.18s, border 0.18s'}}
        onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}}
        onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}
      >
        {TEXT[lang].backHome || '返回首頁'}
      </button>
      {/* 右上角語言切換與登出按鈕 */}
      <div style={{position:'fixed',top:24,right:36,zIndex:100,display:'flex',alignItems:'center',gap:12}}>
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          style={{padding:'6px 18px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',fontWeight:700,fontSize:18,cursor:'pointer'}}
          onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}}
          onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}
        >
          {TEXT[lang].logout || '登出'}
        </button>
        <select
          value={lang}
          onChange={e => { setLang(e.target.value as LanguageCode); }}
          style={{padding:'6px 14px',borderRadius:8,fontWeight:600,border:'1.5px solid #6B5BFF',color:'#6B5BFF',background:'#fff',cursor:'pointer',fontSize:18}}
          onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}}
          onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}
        >
          <option value="zh-TW">繁中</option>
          <option value="zh-CN">简中</option>
          <option value="en">EN</option>
          <option value="ja">日文</option>
          <option value="ko">한국어</option>
          <option value="vi">Tiếng Việt</option>
        </select>
      </div>
      {/* 內容卡片層 */}
      <div style={{maxWidth:480,margin:'32px auto',background:'#fff',borderRadius:16,boxShadow:'0 2px 16px #0002',padding:32,position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
        {/* 頭像框放在卡片左上方，橢圓位置 */}
        <div style={{width:'100%',height:100,position:'relative',marginBottom:8,marginTop:4}}>
          <img src="/avatars/avatar1.png" alt="avatar" style={{width:110,height:110,borderRadius:'50%',border:'5px solid #6B5BFF',objectFit:'cover',position:'absolute',left:-30,top:-30,background:'#fff'}} />
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,height:'100%'}}>
            <span style={{fontSize:44,display:'inline-block'}}>👤</span>
            <span style={{fontSize:38,fontWeight:900,color:'#6B4F27',letterSpacing:2,display:'inline-block'}}>{TEXT[lang].profile || '個人頁'}</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:24,marginTop:24}}>
        <div>
          <div style={{fontWeight:700,fontSize:24,marginBottom:4}}>{user.name}</div>
            <div style={{fontSize:20,color:'#6B5BFF',fontWeight:700,background:'#e6eaff',borderRadius:6,padding:'2px 12px',display:'inline-block'}}>{TEXT[lang].level || '等級'} {achievement.level}</div>
          </div>
        </div>
      <div style={{marginBottom:18}}>
          <div style={{fontSize:15,marginBottom:6,color:'#bbb'}}>{TEXT[lang].exp || '經驗值'}: {achievement.exp} / {nextLevelExp(achievement.level)}</div>
          <div style={{height:18,background:'#eee',borderRadius:9,overflow:'hidden',width:'100%',maxWidth:520,margin:'0 auto'}}>
            <div style={{height:'100%',width:`${percent}%`,background:'#6B5BFF',transition:'width 0.4s',borderRadius:9}}></div>
        </div>
      </div>
      <div style={{marginBottom:18}}>
        <div style={{fontWeight:600,marginBottom:8}}>{TEXT[lang].badges || '徽章牆'}</div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          {BADGES.map(badge => (
            <div key={badge.id} style={{padding:'8px 12px',borderRadius:8,background:achievement.badges.includes(badge.id)?'#6B5BFF':'#eee',color:achievement.badges.includes(badge.id)?'#fff':'#888',fontSize:22,display:'flex',flexDirection:'column',alignItems:'center',minWidth:60}}>
              <span style={{fontSize:28}}>{badge.icon}</span>
                <span style={{fontSize:13,marginTop:2}}>{badge.name[lang]}</span>
            </div>
          ))}
        </div>
      </div>
      {/* 測試互動：模擬獲得經驗值與徽章 */}
        <div style={{marginTop:24,display:'flex',gap:12,width:'100%',justifyContent:'center'}}>
          <button
            onClick={()=>handleGainExp(50)}
            style={{padding:'6px 18px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',fontWeight:600,cursor:'pointer',fontSize:18,transition:'background 0.18s, color 0.18s, border 0.18s'}}
            onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}
            autoFocus
          >
            {TEXT[lang].gainExp || '獲得經驗值'}
          </button>
          <button
            onClick={()=>handleUnlockBadge('friend')}
            style={{padding:'6px 18px',borderRadius:8,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',fontWeight:600,cursor:'pointer',fontSize:18,transition:'background 0.18s, color 0.18s, border 0.18s'}}
            onMouseOver={e=>{e.currentTarget.style.background='#6B5BFF';e.currentTarget.style.color='#fff';}}
            onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6B5BFF';}}
            autoFocus
          >
            {TEXT[lang].unlockBadge || '解鎖徽章'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 