import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const TEXT: Record<string, { title: string; today: string; guide: string; input: string; send: string; history: string; backHome: string }> = {
  'zh-TW': {
    title: 'PairTalk 配對',
    today: '今日配對對象：',
    guide: '引導問題：今天你最想聊什麼？',
    input: '輸入訊息...',
    send: '送出',
    history: '訊息列表',
    backHome: '登出',
  },
  'zh-CN': {
    title: 'PairTalk 配对',
    today: '今日配对对象：',
    guide: '引导问题：今天你最想聊什么？',
    input: '输入信息...',
    send: '送出',
    history: '信息列表',
    backHome: '登出',
  },
  'en': {
    title: 'PairTalk Match',
    today: 'Today\'s Match: ',
    guide: 'Prompt: What do you want to talk about today?',
    input: 'Enter message...',
    send: 'Send',
    history: 'Message List',
    backHome: '登出',
  },
  'ja': {
    title: 'ペアトーク',
    today: '今日のマッチ：',
    guide: 'ガイド質問：今日は何を話したい？',
    input: 'メッセージを入力...',
    send: '送信',
    history: 'メッセージ一覧',
    backHome: '登出',
  },
  'ko': {
    title: '페어톡 매칭',
    today: '오늘의 매칭: ',
    guide: '안내 질문: 오늘 무엇에 대해 이야기하고 싶으신가요?',
    input: '메시지 입력...',
    send: '보내기',
    history: '메시지 목록',
    backHome: '登出',
  },
  'vi': {
    title: 'Kết bạn PairTalk',
    today: 'Đối tượng hôm nay: ',
    guide: 'Câu hỏi gợi ý: Hôm nay bạn muốn nói chuyện về điều gì?',
    input: 'Nhập tin nhắn...',
    send: 'Gửi',
    history: 'Danh sách tin nhắn',
    backHome: '登出',
  },
};

export default function PairTalkMatch() {
  const navigate = useNavigate();
  const auth = getAuth();
  const lang = localStorage.getItem('lang') || 'zh-TW';
  const t = TEXT[lang];
  // 狀態：配對對象、引導問題、訊息列表
  return (
    <div>
      <div style={{position:'absolute',top:0,left:0,width:'100%',zIndex:100,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 32px 0 32px',boxSizing:'border-box',background:'transparent'}}>
        <button onClick={()=>navigate('/')} style={{background:'none',border:'none',color:'#6c63ff',fontWeight:700,fontSize:18,cursor:'pointer'}}>{t.backHome}</button>
        <div style={{display:'flex',gap:12,marginRight:8}}>
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
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 18 }}>{t.title}</h2>
        <div style={{ marginTop: 18 }}>
          <b>{t.today}</b>
          <div style={{ marginTop: 8 }}>{t.guide}</div>
        </div>
        <div style={{marginTop:8}}>
          <input placeholder={t.input} style={{width:200}} />
          <button style={{marginLeft:8}}>{t.send}</button>
        </div>
        <div style={{marginTop:24}}>{t.history}</div>
      </div>
    </div>
  );
} 