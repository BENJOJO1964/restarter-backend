import React, { useState, useEffect } from 'react';
import { UserProfile, recommendMissions, recommendFriends, recommendGroups, recommendAIThemes, Mission, Group, AITheme } from '../shared/recommendation';
import { TEXT, LanguageCode, useLanguage } from '../shared/i18n';
import { UserAchievement, BADGES, calcLevel, nextLevelExp } from '../shared/achievement';

export type RecommendationType = 'mission' | 'friend' | 'group' | 'ai';

interface RecommendationListProps {
  type: RecommendationType;
  user: UserProfile;
}

// 預設 mock 成就資料
const defaultAchievement: UserAchievement = {
  exp: 80,
  level: 1,
  badges: ['starter'],
};

export const RecommendationList: React.FC<RecommendationListProps> = ({ type, user }) => {
  const { lang } = useLanguage();
  // 本地 user 狀態（MVP 階段）
  const [localUser, setLocalUser] = useState<UserProfile>(user);
  // 本地成就狀態
  const [achievement, setAchievement] = useState<UserAchievement>(defaultAchievement);
  // 已加入/已加好友/已啟用提示
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  // 動畫狀態
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  // 強制 re-render on lang change
  const [langVersion, setLangVersion] = useState(0);
  useEffect(() => { setLangVersion(v => v + 1); }, [lang]);

  let items: any[] = [];
  let title = '';

  // 多語言提示
  const LABELS = {
    join: { 'zh-TW': '加入', 'zh-CN': '加入', 'en': 'Join', 'ja': '参加', 'ko': '참여', 'vi': 'Tham gia' },
    joined: { 'zh-TW': '已加入', 'zh-CN': '已加入', 'en': 'Joined', 'ja': '参加済み', 'ko': '참여됨', 'vi': 'Đã tham gia' },
    add: { 'zh-TW': '加好友', 'zh-CN': '加好友', 'en': 'Add', 'ja': '友達追加', 'ko': '친구추가', 'vi': 'Kết bạn' },
    added: { 'zh-TW': '已加好友', 'zh-CN': '已加好友', 'en': 'Added', 'ja': '追加済み', 'ko': '추가됨', 'vi': 'Đã kết bạn' },
    enable: { 'zh-TW': '啟用主題', 'zh-CN': '启用主题', 'en': 'Enable', 'ja': '有効化', 'ko': '활성화', 'vi': 'Kích hoạt' },
    enabled: { 'zh-TW': '已啟用', 'zh-CN': '已启用', 'en': 'Enabled', 'ja': '有効', 'ko': '활성화됨', 'vi': 'Đã kích hoạt' },
    joinGroup: { 'zh-TW': '加入小組', 'zh-CN': '加入小组', 'en': 'Join Group', 'ja': 'グループ参加', 'ko': '그룹참여', 'vi': 'Tham gia nhóm' },
    joinedGroup: { 'zh-TW': '已加入', 'zh-CN': '已加入', 'en': 'Joined', 'ja': '参加済み', 'ko': '참여됨', 'vi': 'Đã tham gia' },
  };

  switch (type) {
    case 'mission':
      items = recommendMissions(localUser);
      title = TEXT[lang].missionTitle;
      break;
    case 'friend':
      items = recommendFriends(localUser);
      title = TEXT[lang].friendTitle;
      break;
    case 'group':
      items = recommendGroups(localUser);
      title = TEXT[lang].groupTitle;
      break;
    case 'ai':
      items = recommendAIThemes(localUser);
      title = TEXT[lang].aiTitle;
      break;
    default:
      break;
  }

  if (!items.length) return null;

  // mock 增加經驗值與徽章
  const gainExp = (amount: number, badgeId?: string) => {
    setAchievement(prev => {
      const newExp = prev.exp + amount;
      const newLevel = calcLevel(newExp);
      let newBadges = [...prev.badges];
      if (badgeId && !newBadges.includes(badgeId)) newBadges.push(badgeId);
      if (newLevel >= 5 && !newBadges.includes('level5')) newBadges.push('level5');
      return { ...prev, exp: newExp, level: newLevel, badges: newBadges };
    });
  };

  // 處理加好友
  const handleAddFriend = (friendId: string) => {
    setAnimatingId(friendId);
    setTimeout(() => {
      setLocalUser(prev => ({ ...prev, friends: [...prev.friends, friendId] }));
      setJoinedIds(ids => [...ids, friendId]);
      gainExp(30, 'friend'); // 加好友獲得經驗與徽章
      setAnimatingId(null);
    }, 300);
  };

  // 處理加入任務
  const handleJoinMission = (missionId: string) => {
    setAnimatingId(missionId);
    setTimeout(() => {
      setJoinedIds(ids => [...ids, missionId]);
      gainExp(20, 'starter'); // 加入任務獲得經驗與徽章
      setAnimatingId(null);
    }, 300);
  };

  // 處理加入小組
  const handleJoinGroup = (groupId: string) => {
    setAnimatingId(groupId);
    setTimeout(() => {
      setJoinedIds(ids => [...ids, groupId]);
      gainExp(10); // 加入小組獲得經驗
      setAnimatingId(null);
    }, 300);
  };

  // 處理啟用AI主題
  const handleEnableAI = (aiId: string) => {
    setAnimatingId(aiId);
    setTimeout(() => {
      setJoinedIds(ids => [...ids, aiId]);
      gainExp(5); // 啟用主題獲得經驗
      setAnimatingId(null);
    }, 300);
  };

  return (
    <div style={{margin:'24px 0'}}>
      <h3 style={{fontWeight:700, fontSize:'1.3rem', marginBottom:12}}>{title}</h3>
      {/* 展示用戶成就狀態（小型） */}
      <div style={{fontSize:13,marginBottom:8,color:'#6B5BFF'}}>
        {TEXT[lang].level} {achievement.level} | {TEXT[lang].exp} {achievement.exp}
        <span style={{marginLeft:12}}>{TEXT[lang].badges}: {achievement.badges.map(bid => BADGES.find(b=>b.id===bid)?.icon).join(' ')}</span>
      </div>
      <ul style={{listStyle:'none', padding:0, margin:0}}>
        {items.map((item, idx) => (
          <li key={item.id || idx} style={{
            marginBottom:10, padding:'10px 16px', background:'#f7f7ff', borderRadius:8, boxShadow:'0 1px 4px #0001', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
            opacity: animatingId === item.id ? 0.5 : 1,
            transform: animatingId === item.id ? 'scale(0.96)' : 'scale(1)',
            transition: 'all 0.25s',
          }}>
            <span>
              {type === 'mission' && (<span>{(item as Mission).title}</span>)}
              {type === 'friend' && (
                <div style={{display:'flex',flexDirection:'column',gap:2,minWidth:160}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,color:'#6B5BFF'}}>{TEXT[lang].name}:</span><span>{item.name}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,color:'#644F27'}}>{TEXT[lang].country}:</span><span>{item.country}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,color:'#232946'}}>{TEXT[lang].city}:</span><span>{item.region}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,color:'#614425'}}>{TEXT[lang].email}:</span><span>{item.email}</span></div>
                </div>
              )}
              {type === 'group' && (
                <div style={{display:'flex',flexDirection:'column',gap:2,minWidth:160}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontWeight:700,color:'#6B5BFF'}}>{TEXT[lang].name}:</span>
                    <span>{typeof item.name === 'object' ? (item.name[lang] || item.name['zh-TW'] || Object.values(item.name)[0]) : item.name}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontWeight:700,color:'#644F27'}}>{TEXT[lang].topic}:</span>
                    <span>{typeof item.topic === 'object' ? (item.topic[lang] || item.topic['zh-TW'] || Object.values(item.topic)[0]) : item.topic}</span>
                  </div>
                </div>
              )}
              {type === 'ai' && (<span>{(item as AITheme).title} - {(item as AITheme).desc}</span>)}
            </span>
            {/* 互動按鈕 */}
            {type === 'mission' && (
              joinedIds.includes(item.id) ? <span style={{color:'#6B5BFF', fontWeight:600}}>{LABELS.joined[lang]}</span> :
              <button style={{padding:'4px 14px',borderRadius:6,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',fontWeight:600,cursor:'pointer'}} onClick={()=>handleJoinMission(item.id)} disabled={animatingId===item.id}>{LABELS.join[lang]}</button>
            )}
            {type === 'friend' && (
              joinedIds.includes(item.id) ? <span style={{color:'#6B5BFF', fontWeight:600}}>{LABELS.added[lang]}</span> :
              <button style={{padding:'4px 14px',borderRadius:6,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',fontWeight:600,cursor:'pointer'}} onClick={()=>handleAddFriend(item.id)} disabled={animatingId===item.id}>{LABELS.add[lang]}</button>
            )}
            {type === 'group' && (
              joinedIds.includes(item.id)
                ? <span style={{color:'#6B5BFF', fontWeight:600}}>{LABELS.joinedGroup[lang]}</span>
                : <button style={{padding:'4px 14px',borderRadius:6,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',fontWeight:600,cursor:'pointer'}} onClick={()=>handleJoinGroup(item.id)} disabled={animatingId===item.id}>{TEXT[lang].joinGroup}</button>
            )}
            {type === 'ai' && (
              joinedIds.includes(item.id) ? <span style={{color:'#6B5BFF', fontWeight:600}}>{LABELS.enabled[lang]}</span> :
              <button style={{padding:'4px 14px',borderRadius:6,border:'1.5px solid #6B5BFF',background:'#fff',color:'#6B5BFF',fontWeight:600,cursor:'pointer'}} onClick={()=>handleEnableAI(item.id)} disabled={animatingId===item.id}>{LABELS.enable[lang]}</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationList; 