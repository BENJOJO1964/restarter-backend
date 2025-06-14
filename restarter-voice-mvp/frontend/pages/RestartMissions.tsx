import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const TEXT: Record<string, { title: string; task: string; done: string; badge: string; backHome: string }> = {
  'zh-TW': {
    title: '日常任務挑戰',
    task: '今天說出一句感謝的話',
    done: '完成',
    badge: '徽章/成就顯示',
    backHome: '登出',
  },
  'zh-CN': {
    title: '日常任务挑战',
    task: '今天说出一句感谢的话',
    done: '完成',
    badge: '徽章/成就显示',
    backHome: '登出',
  },
  'en': {
    title: 'Daily Mission Challenge',
    task: 'Say a word of thanks today',
    done: 'Done',
    badge: 'Badges/Achievements',
    backHome: '登出',
  },
  'ja': {
    title: '日課ミッション挑戦',
    task: '今日は感謝の言葉を言おう',
    done: '完了',
    badge: 'バッジ/実績表示',
    backHome: '登出',
  },
};

export default function RestartMissions() {
  const navigate = useNavigate();
  const auth = getAuth();
  const lang = localStorage.getItem('lang') || 'zh-TW';
  const t = TEXT[lang];
  // 狀態：任務列表、完成按鈕、徽章顯示
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 32px 0 32px'}}>
        <button onClick={()=>navigate('/')} style={{background:'none',border:'none',color:'#6c63ff',fontWeight:700,fontSize:18,cursor:'pointer'}}>{t.backHome}</button>
        <div style={{display:'flex',gap:12}}>
          <button className="topbar-btn" onClick={async()=>{await signOut(auth);localStorage.clear();window.location.href='/'}}>登出</button>
          <select className="topbar-select" value={lang} onChange={e=>{localStorage.setItem('lang',e.target.value);window.location.reload();}}>
            <option value="zh-TW">繁中</option>
            <option value="zh-CN">简中</option>
            <option value="en">EN</option>
            <option value="ja">日文</option>
          </select>
        </div>
      </div>
      <div style={{padding:32}}>
        <h2>🎯 {t.title}</h2>
        <ul>
          <li>
            <span>{t.task}</span>
            <button style={{marginLeft:8}}>{t.done}</button>
          </li>
        </ul>
        <div style={{marginTop:24}}>{t.badge}</div>
      </div>
    </div>
  );
} 