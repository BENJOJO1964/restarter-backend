import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../src/firebaseConfig';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import VideoChat from './VideoChat';
import { useTestMode } from '../App';

interface Message {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  text: string;
  participants: string[];
  createdAt: any;
}

interface ChatPartner {
  id: string;
  name: string;
  avatar: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

const LANGS = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'zh-CN', label: '简中' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ภาษาไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'la', label: 'Latīna' },
];

const TEXTS: { [key: string]: { back: string; title: string; send: string; placeholder: string } } = {
  'zh-TW': { back: '← 返回上一頁', title: '聊天室', send: '送出', placeholder: '輸入訊息...' },
  'zh-CN': { back: '← 返回上一页', title: '聊天室', send: '发送', placeholder: '输入信息...' },
  'en': { back: '← Back', title: 'Chat Room', send: 'Send', placeholder: 'Type a message...' },
  'ja': { back: '← 前のページへ', title: 'チャットルーム', send: '送信', placeholder: 'メッセージを入力...' },
  'ko': { back: '← 이전 페이지', title: '채팅방', send: '보내기', placeholder: '메시지 입력...' },
  'th': { back: '← กลับ', title: 'ห้องแชท', send: 'ส่ง', placeholder: 'พิมพ์ข้อความ...' },
  'vi': { back: '← Quay lại', title: 'Phòng chat', send: 'Gửi', placeholder: 'Nhập tin nhắn...' },
  'ms': { back: '← Kembali', title: 'Bilik Sembang', send: 'Hantar', placeholder: 'Taip mesej...' },
  'la': { back: '← Redire', title: 'Cella Colloquii', send: 'Mitte', placeholder: 'Nuntium insere...' },
};

function VideoChatModal({ open, onClose, roomId }: { open: boolean; onClose: () => void; roomId: string }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 16px #0003', minWidth: 540, minHeight: 420, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: '#eee', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer' }}>關閉</button>
        <VideoChat roomId={roomId} />
      </div>
    </div>
  );
}

export default function ChatRoom() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { lang, setLang } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);
  const { isTestMode } = useTestMode();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadFriends(currentUser.uid);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadFriends = async (userId: string) => {
    setLoading(true);
    const linksRef = collection(db, 'links');
    const q1 = query(linksRef, where('user1Id', '==', userId), where('status', '==', 'connected'));
    const q2 = query(linksRef, where('user2Id', '==', userId), where('status', '==', 'connected'));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const friendIds = new Set<string>();
    snap1.forEach(doc => friendIds.add(doc.data().user2Id));
    snap2.forEach(doc => friendIds.add(doc.data().user1Id));
    const friendsArr: Friend[] = [];
    for (const fid of friendIds) {
      const profileRef = doc(db, 'profiles', fid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        friendsArr.push({
          id: fid,
          name: data.name || '好友',
          avatar: data.avatar || '/avatars/Derxl.png',
          online: !!data.online
        });
      }
    }
    
    // 測試模式：添加測試好友
    if (isTestMode) {
      friendsArr.push(
        {
          id: 'test-friend-1',
          name: '測試好友 1',
          avatar: '/avatars/Annie.png',
          online: true
        },
        {
          id: 'test-friend-2',
          name: '測試好友 2',
          avatar: '/avatars/Bray.png',
          online: false
        },
        {
          id: 'test-friend-3',
          name: '測試好友 3',
          avatar: '/avatars/berlex.png',
          online: true
        }
      );
    }
    
    setFriends(friendsArr);
    setLoading(false);
  };

  useEffect(() => {
    if (user && selectedFriend) {
      setLoading(true);
      
      // 測試模式：添加測試消息
      if (isTestMode && selectedFriend.id.startsWith('test-friend-')) {
        const testMessages: Message[] = [
          {
            id: 'test-msg-1',
            fromUserId: selectedFriend.id,
            fromUserName: selectedFriend.name,
            toUserId: user.uid,
            toUserName: user.displayName || '我',
            text: '你好！很高興認識你 😊',
            participants: [user.uid, selectedFriend.id],
            createdAt: new Date(Date.now() - 300000) // 5分鐘前
          },
          {
            id: 'test-msg-2',
            fromUserId: user.uid,
            fromUserName: user.displayName || '我',
            toUserId: selectedFriend.id,
            toUserName: selectedFriend.name,
            text: '你好！我也很高興認識你 👋',
            participants: [user.uid, selectedFriend.id],
            createdAt: new Date(Date.now() - 240000) // 4分鐘前
          },
          {
            id: 'test-msg-3',
            fromUserId: selectedFriend.id,
            fromUserName: selectedFriend.name,
            toUserId: user.uid,
            toUserName: user.displayName || '我',
            text: '今天天氣真不錯，你有什麼計劃嗎？',
            participants: [user.uid, selectedFriend.id],
            createdAt: new Date(Date.now() - 180000) // 3分鐘前
          },
          {
            id: 'test-msg-4',
            fromUserId: user.uid,
            fromUserName: user.displayName || '我',
            toUserId: selectedFriend.id,
            toUserName: selectedFriend.name,
            text: '我想去公園散步，你要一起嗎？',
            participants: [user.uid, selectedFriend.id],
            createdAt: new Date(Date.now() - 120000) // 2分鐘前
          },
          {
            id: 'test-msg-5',
            fromUserId: selectedFriend.id,
            fromUserName: selectedFriend.name,
            toUserId: user.uid,
            toUserName: user.displayName || '我',
            text: '好啊！聽起來很有趣 🌳',
            participants: [user.uid, selectedFriend.id],
            createdAt: new Date(Date.now() - 60000) // 1分鐘前
          }
        ];
        setMessages(testMessages);
        setLoading(false);
        return;
      }
      
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.uid),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesList: Message[] = [];
        querySnapshot.forEach((doc) => {
          const msg = doc.data() as Omit<Message, 'id'>;
          if (msg.participants.includes(selectedFriend.id)) {
            messagesList.push({ ...msg, id: doc.id });
          }
        });
        setMessages(messagesList);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, selectedFriend, isTestMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !selectedFriend) return;
    
    // 測試模式：直接添加到本地消息列表
    if (isTestMode && selectedFriend.id.startsWith('test-friend-')) {
      const newMessage: Message = {
        id: `test-msg-${Date.now()}`,
        fromUserId: user.uid,
        fromUserName: user.displayName || '我',
        toUserId: selectedFriend.id,
        toUserName: selectedFriend.name,
        text: input,
        participants: [user.uid, selectedFriend.id],
        createdAt: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      return;
    }
    
    try {
      const messageData = {
        fromUserId: user.uid,
        fromUserName: user.displayName || '我',
        toUserId: selectedFriend.id,
        toUserName: selectedFriend.name,
        text: input,
        participants: [user.uid, selectedFriend.id],
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'messages'), messageData);
      setInput('');
    } catch (error) {
      alert('發送訊息失敗');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div style={{
        background: `url('/green_hut.png') center center / cover no-repeat`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#fff', fontSize: 18 }}>載入中...</div>
      </div>
    );
  }

  return (
    <div style={{ background: `url('/green_hut.png') center center / cover no-repeat`, minHeight: '100vh', display: window.innerWidth <= 768 ? 'flex' : 'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'center' : 'flex-start', justifyContent: 'center', paddingTop: window.innerWidth <= 768 ? 20 : 40, position: 'relative' }}>
      <button onClick={() => navigate('/friend')} style={{ position: 'fixed', top: 24, left: 24, zIndex: 10001, background: '#fff', border: '1.5px solid #6B5BFF', color: '#6B5BFF', borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>返回上一頁</button>
      
      {/* 手機版：2個淺灰色卡片框 */}
      {window.innerWidth <= 768 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 400, padding: '20px' }}>
          {/* 上面一個淺灰色卡片框是【好友列表】 */}
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '95%', maxWidth: 320, border: '2px solid rgba(107,91,255,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#6B5BFF', marginBottom: 16, textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>好友列表</div>
            <div style={{ textAlign: 'center', color: '#333', fontSize: 16, lineHeight: 1.5, fontWeight: 500 }}>
              {friends.length === 0 ? 
                (isTestMode ? '測試模式已啟用，但沒有測試好友' : '請先加好友,才能開始聊天') : 
                '選擇好友開始聊天'
              }
            </div>
          </div>
          
          {/* 下面一個淺灰色卡片框是【聊天訊息框】 */}
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '95%', maxWidth: 320, border: '2px solid rgba(107,91,255,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#6B5BFF', marginBottom: 16, textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>聊天訊息框</div>
            <div style={{ textAlign: 'center', color: '#333', fontSize: 16, lineHeight: 1.5, fontWeight: 500 }}>
              {friends.length === 0 ? 
                (isTestMode ? '測試模式已啟用，請選擇測試好友開始聊天！' : '還沒有朋友,去交友區加好友吧!') : 
                '選擇好友開始聊天'
              }
            </div>
          </div>
        </div>
      ) : (
        /* 電腦版：保持原有佈局 */
        <>
          <div style={{ width: 220, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 16, marginRight: 32, minHeight: 600 }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>好友列表</div>
            {friends.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 80, fontSize: 16, fontWeight: 600 }}>
                {isTestMode ? (
                  <>
                    測試模式已啟用，但沒有測試好友<br/>
                    <span style={{ fontSize: 32 }}>🧪</span>
                  </>
                ) : (
                  <>
                    你暫時沒有連結朋友，再繼續加油 💪<br/>
                    <span style={{ fontSize: 32 }}>🦋</span>
                  </>
                )}
              </div>
            ) : (
              friends.map(f => (
                <div key={f.id} onClick={() => setSelectedFriend(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer', opacity: selectedFriend?.id === f.id ? 1 : 0.7 }}>
                  <img src={f.avatar} alt={f.name} style={{ width: 44, height: 44, borderRadius: '50%', filter: f.online ? 'none' : 'grayscale(1)', border: selectedFriend?.id === f.id ? '2px solid #6B5BFF' : '2px solid #eee' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: f.online ? '#222' : '#aaa' }}>
                      {f.name}
                      {isTestMode && f.id.startsWith('test-friend-') && (
                        <span style={{ 
                          fontSize: '10px', 
                          background: '#ff6b6b', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          marginLeft: '6px',
                          fontWeight: 'normal'
                        }}>
                          測試
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: f.online ? '#23c6e6' : '#aaa' }}>{f.online ? '在線' : '離線'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ flex: 1, maxWidth: 500, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 32, minHeight: 600, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16, marginTop: 8 }}>
              {selectedFriend ? (
                isTestMode && selectedFriend.id.startsWith('test-friend-') ? 
                `與 ${selectedFriend.name} 聊天 (測試模式)` : 
                `與 ${selectedFriend.name} 聊天`
              ) : (
                friends.length === 0 ? 
                (isTestMode ? '測試模式已啟用，請選擇測試好友開始聊天' : '請先加好友，才能開始聊天') : 
                '請選擇好友開始聊天'
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, background: '#f7f7f7', borderRadius: 8, padding: 16, minHeight: 240, maxHeight: 340 }}>
              {(!selectedFriend || messages.length === 0) && (
                <div style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
                  {selectedFriend ? 
                    (isTestMode && selectedFriend.id.startsWith('test-friend-') ? '開始測試聊天吧！' : '開始聊天吧！') : 
                    (friends.length === 0 ? 
                      (isTestMode ? '測試模式已啟用，請選擇測試好友開始聊天！' : '還沒有朋友，去交友區加好友吧！') : 
                      '請先選擇好友'
                    )
                  }
                </div>
              )}
              {selectedFriend && messages.map((msg, i) => (
                <div key={msg.id || i} style={{ textAlign: msg.fromUserId === user?.uid ? 'right' : 'left', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, color: msg.fromUserId === user?.uid ? '#2a5d8f' : '#888' }}>
                    {msg.fromUserName}：
                  </span>
                  <span style={{ marginLeft: 8 }}>{msg.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, marginTop: 8 }}>
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ flex: 1, borderRadius: 6, border: '1px solid #ccc', padding: 10, fontSize: 16 }} 
                placeholder={
                  isTestMode && selectedFriend?.id.startsWith('test-friend-') ? 
                  '輸入測試訊息...' : 
                  TEXTS[lang].placeholder
                } 
                disabled={friends.length === 0 || !selectedFriend}
              />
              <button
                onClick={selectedFriend ? sendMessage : undefined}
                disabled={friends.length === 0 || !selectedFriend}
                style={{ background: '#8ec6f7', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, fontSize: 16, cursor: friends.length === 0 || !selectedFriend ? 'not-allowed' : 'pointer', opacity: friends.length === 0 || !selectedFriend ? 0.5 : 1 }}
              >
                {isTestMode && selectedFriend?.id.startsWith('test-friend-') ? '測試發送' : TEXTS[lang].send}
              </button>
              <button
                onClick={selectedFriend ? () => setVideoOpen(true) : undefined}
                disabled={friends.length === 0 || !selectedFriend}
                style={{ background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, fontSize: 16, cursor: friends.length === 0 || !selectedFriend ? 'not-allowed' : 'pointer', opacity: friends.length === 0 || !selectedFriend ? 0.5 : 1 }}
              >
                {isTestMode && selectedFriend?.id.startsWith('test-friend-') ? '測試視訊' : '視訊聊天'}
              </button>
            </div>
            <VideoChatModal open={videoOpen} onClose={() => setVideoOpen(false)} roomId={user && selectedFriend ? `${user.uid}_${selectedFriend.id}` : ''} />
          </div>
        </>
      )}
    </div>
  );
}

function VideoRoomEntry() {
  const [showInput, setShowInput] = React.useState(false);
  const [roomCode, setRoomCode] = React.useState('');
  const navigate = useNavigate();
  return (
    <div style={{ marginTop: 16, textAlign: 'center' }}>
      {!showInput ? (
        <button onClick={() => setShowInput(true)} style={{ background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          進入視訊聊天室
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
          <input value={roomCode} onChange={e => setRoomCode(e.target.value)} placeholder="請輸入房間代碼" style={{ padding: 8, borderRadius: 8, border: '1.5px solid #6B5BFF', width: 160 }} />
          <button onClick={() => { if(roomCode) navigate(`/video?room=${encodeURIComponent(roomCode)}`); }} style={{ background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            進入
          </button>
          <button onClick={() => setShowInput(false)} style={{ background: '#ccc', color: '#333', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
            取消
          </button>
        </div>
      )}
    </div>
  );
} 