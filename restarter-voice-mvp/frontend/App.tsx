// App.tsx - Restart Voice MVP 入口
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import RestartWall from './pages/RestartWall';
import ChatCompanion from './pages/ChatCompanion';
import RegisterPage from './pages/RegisterPage';
import FriendMatch from './pages/FriendMatch';
import InboxPage from './pages/InboxPage';
import AIStyleReply from './pages/AIStyleReply';
import RealisticTTS from './pages/RealisticTTS';
import EmotionVisualLab from './pages/EmotionVisualLab';
import Missions from './pages/Missions';
import PairTalk from './pages/PairTalk';
import SkillBox from './pages/SkillBox';
import ProfilePage from './pages/ProfilePage';
import './modern.css';
import app from './src/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { VideoReactionProvider } from './components/VideoReactionContext';
import { UserStatusProvider } from './hooks/useUserStatus';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  if (loading) return <div style={{color:'#fff',textAlign:'center',marginTop:80}}>載入中...</div>;
  return (
    <UserStatusProvider>
      <VideoReactionProvider>
        <BrowserRouter>
          <Routes>
            {!user && <Route path="*" element={<RegisterPage onRegister={() => window.location.reload()} />} />}
            {user && <Route path="/" element={<Home />} />}
            {user && <Route path="/wall" element={<RestartWall />} />}
            {user && <Route path="/chat" element={<ChatCompanion />} />}
            {user && <Route path="/friend" element={<FriendMatch />} />}
            {user && <Route path="/inbox" element={<InboxPage />} />}
            {user && <Route path="/ai" element={<AIStyleReply />} />}
            {user && <Route path="/tts" element={<RealisticTTS />} />}
            {user && <Route path="/journal" element={<EmotionVisualLab />} />}
            {user && <Route path="/missions" element={<Missions />} />}
            {user && <Route path="/pairtalk" element={<PairTalk />} />}
            {user && <Route path="/skillbox" element={<SkillBox />} />}
            {user && <Route path="/profile" element={<ProfilePage />} />}
          </Routes>
        </BrowserRouter>
      </VideoReactionProvider>
    </UserStatusProvider>
  );
}

export default App;
