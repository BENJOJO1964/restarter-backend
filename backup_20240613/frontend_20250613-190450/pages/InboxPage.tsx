import React from 'react';
import { useLocation } from 'react-router-dom';

// 假設留言資料存在 localStorage.messages
function getAllMessages() {
  try {
    return JSON.parse(localStorage.getItem('messages') || '[]');
  } catch {
    return [];
  }
}

export default function InboxPage() {
  const userId = localStorage.getItem('userId') || '';
  const messages = getAllMessages();
  // 收集所有留言給我的
  const myComments = messages.flatMap((msg: any) => (msg.comments||[]).filter((c: any) => c.toUserId === userId).map((c: any) => ({...c, post: msg.text, from: msg.user.name})));
  return (
    <div className="modern-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modern-container" style={{ maxWidth: 600, width: '100%', margin: '0 auto', padding: 32 }}>
        <h2 style={{ textAlign: 'center', color: '#6B5BFF', fontWeight: 900, marginBottom: 24 }}>我的留言箱</h2>
        {myComments.length === 0 && <div style={{ color: '#bbb', textAlign: 'center' }}>目前沒有收到任何留言</div>}
        {myComments.map((c, i) => (
          <div key={i} style={{ background: '#f7f7ff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px #6B5BFF11', marginBottom: 16 }}>
            <div style={{ color: '#6B5BFF', fontWeight: 700 }}>{c.from} 留言：</div>
            <div style={{ color: '#232946', margin: '8px 0' }}>{c.content}</div>
            <div style={{ color: '#6B4F27', fontSize: 14 }}>針對你的貼文：「{c.post}」</div>
          </div>
        ))}
      </div>
    </div>
  );
} 