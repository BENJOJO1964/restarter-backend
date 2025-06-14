import React, { useState, useRef, useEffect } from 'react';

const CHAT_TEXT: Record<string, { title: string; send: string; video: string; inputPlaceholder: string; connecting: string; endVideo: string; }> = {
  'zh-TW': { title: '聊天', send: '發送', video: '視訊聊天', inputPlaceholder: '輸入訊息...', connecting: '連線中...', endVideo: '結束視訊' },
  'zh-CN': { title: '聊天', send: '发送', video: '视频聊天', inputPlaceholder: '输入消息...', connecting: '连接中...', endVideo: '结束视频' },
  'en': { title: 'Chat', send: 'Send', video: 'Video Call', inputPlaceholder: 'Type a message...', connecting: 'Connecting...', endVideo: 'End Video' },
  'ja': { title: 'チャット', send: '送信', video: 'ビデオ通話', inputPlaceholder: 'メッセージを入力...', connecting: '接続中...', endVideo: 'ビデオ終了' },
  'ko': { title: '채팅', send: '보내기', video: '영상통화', inputPlaceholder: '메시지 입력...', connecting: '연결 중...', endVideo: '영상 종료' },
  'vi': { title: 'Trò chuyện', send: 'Gửi', video: 'Gọi video', inputPlaceholder: 'Nhập tin nhắn...', connecting: 'Đang kết nối...', endVideo: 'Kết thúc video' },
};

export default function ChatPage() {
  const lang = localStorage.getItem('lang') || 'zh-TW';
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [videoOn, setVideoOn] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream|null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiList = ['😀','😂','😍','👍','🥰','😭','😎','😡','🎉','❤️','😅','🤔','🙌','👏','😳','😏','��','😜','😱','😴'];
  const [imageMsgs, setImageMsgs] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (videoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
    // eslint-disable-next-line
  }, [videoOn]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'me', text: input }]);
    setInput('');
    // 模擬對方回覆
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: 'other', text: '👍' }]);
    }, 800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageMsgs(msgs => [...msgs, url]);
      setMessages([...messages, { from: 'me', image: url }]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #6B5BFF22', padding: 0, display: 'flex', flexDirection: 'column', height: 600, position: 'relative' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 900, fontSize: 22, color: '#6B5BFF' }}>💬 {CHAT_TEXT[lang].title}</span>
          <button onClick={()=>setVideoOn(v=>!v)} style={{ background: videoOn ? '#6B5BFF' : '#fff', color: videoOn ? '#fff' : '#6B5BFF', border: '2px solid #6B5BFF', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '6px 18px', cursor: 'pointer', transition: 'background 0.18s, color 0.18s' }}>{videoOn ? CHAT_TEXT[lang].endVideo : CHAT_TEXT[lang].video}</button>
        </div>
        {videoOn && (
          <div style={{ background: '#232946', color: '#fff', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, margin: 18, fontSize: 20, fontWeight: 700, position: 'relative' }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 0 18px', background: videoOn ? '#f7f7ff' : '#fff' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              {msg.image ? (
                <img src={msg.image} alt="img" style={{ maxWidth: 180, borderRadius: 12, boxShadow: '0 2px 8px #6B5BFF33' }} />
              ) : (
                <div style={{ background: msg.from === 'me' ? 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)' : '#eee', color: msg.from === 'me' ? '#fff' : '#232946', borderRadius: 16, padding: '10px 18px', maxWidth: 220, fontSize: 16, fontWeight: 500, boxShadow: msg.from === 'me' ? '0 2px 8px #6B5BFF33' : '0 1px 4px #aaa2', marginLeft: msg.from === 'me' ? 40 : 0, marginRight: msg.from === 'me' ? 0 : 40 }}>{msg.text}</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: '18px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={()=>setShowEmoji(v=>!v)} style={{ background: '#fff', border: '1.5px solid #6B5BFF', borderRadius: 8, fontSize: 22, cursor: 'pointer', padding: '0 10px' }}>😊</button>
          {showEmoji && (
            <div style={{ position: 'absolute', bottom: 70, left: 18, background: '#fff', border: '1.5px solid #6B5BFF', borderRadius: 12, boxShadow: '0 2px 8px #6B5BFF22', padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, zIndex: 10 }}>
              {emojiList.map(e => (
                <span key={e} style={{ fontSize: 22, cursor: 'pointer' }} onClick={()=>{setInput(input+e);setShowEmoji(false);}}>{e}</span>
              ))}
            </div>
          )}
          <input type="file" accept="image/*" style={{ display: 'none' }} id="chat-img-upload" onChange={handleImageUpload} />
          <label htmlFor="chat-img-upload" style={{ background: '#fff', border: '1.5px solid #6B5BFF', borderRadius: 8, fontSize: 20, cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center' }}>🖼️</label>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleSend();}} placeholder={CHAT_TEXT[lang].inputPlaceholder} style={{ flex: 1, borderRadius: 8, border: '1.5px solid #6B5BFF', fontSize: 16, padding: '10px 14px', outline: 'none' }} />
          <button onClick={handleSend} style={{ background: 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '10px 18px', cursor: 'pointer', transition: 'background 0.18s, color 0.18s' }}>{CHAT_TEXT[lang].send}</button>
        </div>
      </div>
    </div>
  );
} 