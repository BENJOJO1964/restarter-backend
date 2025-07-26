import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { usePermission } from '../hooks/usePermission';
import { TokenRenewalModal } from '../components/TokenRenewalModal';
import { UpgradeModal } from '../components/UpgradeModal';
import Footer from '../components/Footer';

const TEXTS = {
  'zh-TW': {
    title: '我的故事 My Story',
    subtitle: '記錄你的成長歷程，見證改變的每一步',
    backToHome: '← 返回首頁',
    logout: '登出',
    addMilestone: '添加里程碑',
    editMilestone: '編輯里程碑',
    deleteMilestone: '刪除里程碑',
    save: '保存',
    cancel: '取消',
    totalDays: '總天數',
    achievements: '成就',
    currentStreak: '連續',
    days: '天',
    myMilestones: '我的里程碑',
    noMilestones: '還沒有里程碑，開始記錄你的故事吧！',
    milestoneTypes: {
      start: '開始',
      achievement: '成就',
      growth: '成長',
      habit: '習慣',
      help: '幫助',
      goal: '目標'
    }
  },
  'zh-CN': {
    title: '我的故事 My Story',
    subtitle: '记录你的成长历程，见证改变的每一步',
    backToHome: '← 返回首页',
    logout: '登出',
    addMilestone: '添加里程碑',
    editMilestone: '编辑里程碑',
    deleteMilestone: '删除里程碑',
    save: '保存',
    cancel: '取消',
    totalDays: '总天数',
    achievements: '成就',
    currentStreak: '连续',
    days: '天',
    myMilestones: '我的里程碑',
    noMilestones: '还没有里程碑，开始记录你的故事吧！',
    milestoneTypes: {
      start: '开始',
      achievement: '成就',
      growth: '成长',
      habit: '习惯',
      help: '帮助',
      goal: '目标'
    }
  },
  'en': {
    title: 'My Story',
    subtitle: 'Record your growth journey, witness every step of change',
    backToHome: '← Back to Home',
    logout: 'Logout',
    addMilestone: 'Add Milestone',
    editMilestone: 'Edit Milestone',
    deleteMilestone: 'Delete Milestone',
    save: 'Save',
    cancel: 'Cancel',
    totalDays: 'Total Days',
    achievements: 'Achievements',
    currentStreak: 'Current Streak',
    days: 'days',
    myMilestones: 'My Milestones',
    noMilestones: 'No milestones yet, start recording your story!',
    milestoneTypes: {
      start: 'Start',
      achievement: 'Achievement',
      growth: 'Growth',
      habit: 'Habit',
      help: 'Help',
      goal: 'Goal'
    }
  }
};

interface Milestone {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
  completed: boolean;
  audioUrl?: string; // 新增：儲存音頻URL
  duration?: number; // 新增：儲存錄音時長
}

interface UserProfile {
  name: string;
  startDate: Date;
  totalDays: number;
  achievements: number;
  currentStreak: number;
}

export default function MyStory() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const t = TEXTS[lang] || TEXTS['zh-TW'];

  // 獲取用戶頭像
  const getUserAvatar = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const db = getFirestore();
        const docRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.avatar) {
            setUserAvatar(data.avatar);
          }
        }
      }
    } catch (error) {
      console.error('獲取用戶頭像失敗:', error);
    }
  };
  
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    // 從localStorage讀取保存的里程碑
    const savedMilestones = localStorage.getItem('userMilestones');
    if (savedMilestones) {
      return JSON.parse(savedMilestones);
    }
    // 預設里程碑
    return [
      {
        id: 1,
        title: '開始新的旅程',
        description: '決定重新開始，為自己設定新的目標',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'start',
        completed: true
      },
      {
        id: 2,
        title: '完成第一個小目標',
        description: '成功完成了一項小任務，感覺很棒',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'achievement',
        completed: true
      },
      {
        id: 3,
        title: '學會控制情緒',
        description: '在困難時刻保持冷靜，學會了情緒管理',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'growth',
        completed: true
      },
      {
        id: 4,
        title: '建立新的習慣',
        description: '每天堅持做一些小事情，建立正向習慣',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'habit',
        completed: true
      },
      {
        id: 5,
        title: '幫助他人',
        description: '第一次主動幫助別人，感受到付出的快樂',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'help',
        completed: true
      },
      {
        id: 6,
        title: '設定更大的目標',
        description: '為自己設定更具挑戰性的目標',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'goal',
        completed: false
      }
    ];
  });
  
  const [userProfile] = useState<UserProfile>({
    name: '我的故事',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    totalDays: 30,
    achievements: 5,
    currentStreak: 7
  });
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    type: 'achievement'
  });

  // 語音錄製相關狀態
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pendingAudio, setPendingAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showRecordingConfirm, setShowRecordingConfirm] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>('/avatars/Derxl.png');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);

  // 新增：權限檢查
  const { checkPermission, recordUsage } = usePermission();
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [permissionResult, setPermissionResult] = useState<any>(null);

  // 組件加載時獲取用戶頭像
  useEffect(() => {
    getUserAvatar();
  }, []);

  // 保存里程碑到localStorage
  const saveMilestonesToStorage = (newMilestones: Milestone[]) => {
    localStorage.setItem('userMilestones', JSON.stringify(newMilestones));
  };

  const handleAddMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.description.trim()) {
      const milestone: Milestone = {
        id: Date.now(),
        title: newMilestone.title,
        description: newMilestone.description,
        date: new Date().toISOString(),
        type: newMilestone.type,
        completed: false
      };
      
      const updatedMilestones = [milestone, ...milestones];
      setMilestones(updatedMilestones);
      saveMilestonesToStorage(updatedMilestones);
      setNewMilestone({ title: '', description: '', type: 'achievement' });
      setShowAddDialog(false);
    }
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone({
      title: milestone.title,
      description: milestone.description,
      type: milestone.type
    });
  };

  const handleSaveEdit = () => {
    if (editingMilestone && newMilestone.title.trim() && newMilestone.description.trim()) {
      const updatedMilestones = milestones.map(m => 
        m.id === editingMilestone.id 
          ? { ...m, title: newMilestone.title, description: newMilestone.description, type: newMilestone.type }
          : m
      );
      setMilestones(updatedMilestones);
      saveMilestonesToStorage(updatedMilestones);
      setEditingMilestone(null);
      setNewMilestone({ title: '', description: '', type: 'achievement' });
    }
  };

  const handleDeleteMilestone = (id: number) => {
    if (window.confirm('確定要刪除這個里程碑嗎？')) {
      const updatedMilestones = milestones.filter(m => m.id !== id);
      setMilestones(updatedMilestones);
      saveMilestonesToStorage(updatedMilestones);
    }
  };

  // 語音錄製相關函數
  const handleRecordingClick = async () => {
    if (isListening) {
      // 停止錄音
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setIsListening(false);
      setIsRecording(false);
      setRecordingDuration(0);
      return;
    }

    // 檢查語音權限
    const permission = await checkPermission('aiChat');
    if (!permission.allowed) {
      if (permission.isFreeUser) {
        // 免費用戶顯示升級跳窗
        setShowUpgradeModal(true);
      } else if (permission.canRenew) {
        // 已訂閱用戶但 Token 用完，顯示續購跳窗
        setPermissionResult(permission);
        setShowRenewalModal(true);
      } else {
        // 其他情況也顯示續購跳窗
        setPermissionResult(permission);
        setShowRenewalModal(true);
      }
      return;
    }

    // 顯示確認對話框
    setShowRecordingConfirm(true);
  };

  const handleConfirmRecording = async () => {
    setShowRecordingConfirm(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      
      // 清空之前的音頻塊
      setAudioChunks([]);
      audioChunksRef.current = [];
      setRecordingDuration(0);
      
      recorder.ondataavailable = (event) => {
        console.log('收到音頻數據，大小:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setAudioChunks(prev => {
            const newChunks = [...prev, event.data];
            console.log('更新音頻塊，當前數量:', newChunks.length);
            return newChunks;
          });
        }
      };
      
      recorder.onstop = () => {
        // 使用ref中收集的音頻塊
        const currentChunks = [...audioChunksRef.current];
        console.log('錄音停止，音頻塊數量:', currentChunks.length);
        
        // 創建音頻blob
        const audioBlob = currentChunks.length > 0 
          ? new Blob(currentChunks, { type: 'audio/webm' })
          : new Blob([''], { type: 'audio/webm' });
        
        // 計算實際錄音時長（基於音頻塊數量估算）
        const estimatedDuration = Math.max(1, Math.floor(currentChunks.length * 0.1)); // 每個音頻塊約0.1秒
        console.log('創建音頻blob，大小:', audioBlob.size, '估算錄音時長:', estimatedDuration);
        
        // 設置送出對話框
        setPendingAudio({ blob: audioBlob, duration: estimatedDuration });
        setShowSubmitDialog(true);
        setAudioChunks([]);
        audioChunksRef.current = [];
        console.log('設置送出對話框狀態');
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start(100); // 每100毫秒收集一次數據，確保能收集到音頻
      setMediaRecorder(recorder);
      setIsListening(true);
      setIsRecording(true);
      
      // 開始計時器
      const timer = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          // 檢查是否達到1分鐘限制
          if (newDuration >= 60) {
            // 自動停止錄音
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            if (timer) {
              clearInterval(timer);
              setRecordingTimer(null);
            }
            setIsListening(false);
            setIsRecording(false);
            alert('錄音時間已達1分鐘限制，已自動停止錄音');
          }
          return newDuration;
        });
      }, 1000);
      setRecordingTimer(timer);
    } catch (error) {
      console.error('錄音錯誤:', error);
      alert('無法啟動麥克風，請檢查權限設置');
    }
  };

  const handleCancelRecording = () => {
    setShowRecordingConfirm(false);
  };

  const handleSubmitVoice = () => {
    if (pendingAudio) {
      handleAudio(pendingAudio.blob, pendingAudio.duration);
      setPendingAudio(null);
      setShowSubmitDialog(false);
      
      // 記錄使用量
      recordUsage('aiChat', 1);
    }
  };

  const handleCancelSubmit = () => {
    setPendingAudio(null);
    setShowSubmitDialog(false);
  };

  const handleAudio = (audioBlob: Blob, duration: number) => {
    // 創建音頻URL
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // 模擬語音轉文字
    const mockTexts = [
      '今天完成了一個重要目標，感覺很有成就感。',
      '學會了新的技能，為自己的成長感到驕傲。',
      '克服了困難，證明了自己的能力。',
      '幫助了別人，感受到付出的快樂。',
      '建立了新的習慣，為未來打下基礎。'
    ];
    
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    const randomType = ['achievement', 'growth', 'habit', 'help', 'goal'][Math.floor(Math.random() * 5)];
    
    const milestone: Milestone = {
      id: Date.now(),
      title: '語音里程碑',
      description: randomText,
      date: new Date().toISOString(),
      type: randomType,
      completed: true,
      audioUrl: audioUrl, // 儲存音頻URL
      duration: duration // 儲存錄音時長
    };
    
    const updatedMilestones = [milestone, ...milestones];
    setMilestones(updatedMilestones);
    saveMilestonesToStorage(updatedMilestones);
  };

  const getMilestoneTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      start: '#2196F3',
      achievement: '#4CAF50',
      growth: '#9C27B0',
      habit: '#FF9800',
      help: '#E91E63',
      goal: '#F44336'
    };
    return colors[type] || '#9E9E9E';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 播放音頻里程碑
  const playVoiceMilestone = (milestone: Milestone) => {
    if (milestone.audioUrl) {
      // 播放真正的原音
      const audio = new Audio(milestone.audioUrl);
      
      // 添加錯誤處理
      audio.onerror = (error) => {
        console.error('音頻加載失敗:', error);
        // 如果原音播放失敗，使用文字轉語音作為備用
        playTextToSpeech(milestone.description);
      };
      
      audio.play().then(() => {
        console.log('正在播放原音...');
      }).catch((error) => {
        console.error('播放失敗:', error);
        // 如果播放失敗，使用文字轉語音作為備用
        playTextToSpeech(milestone.description);
      });
    } else {
      // 如果沒有原音，使用文字轉語音作為備用
      playTextToSpeech(milestone.description);
    }
  };

  const playTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      
      console.log('正在播放里程碑內容（文字轉語音）...');
    } else {
      alert('瀏覽器不支援語音播放功能');
    }
  };

  const completedMilestones = milestones.filter(m => m.completed).length;

  const handleRenewalModalClose = () => {
    setShowRenewalModal(false);
    setPermissionResult(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
      padding: '20px'
    }}>
      {/* 導航欄 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <button 
          onClick={() => navigate('/home')}
          style={{
            background: '#fff',
            border: '1.5px solid #6B5BFF',
            borderRadius: '8px',
            padding: '6px 10px',
            color: '#6B5BFF',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          返回
        </button>
        
        <h1 style={{ 
          color: 'white', 
          fontSize: '24px', 
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '8px'
        }}>
          我的里程碑
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '14px',
          fontWeight: 400,
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.4
        }}>
          記錄每個成長時刻，見證自我蛻變的旅程 ✨ 讓每個里程碑都成為你人生故事中的閃亮篇章
        </p>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/logout')}
            style={{
              background: '#fff',
              border: '1.5px solid #6B5BFF',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#6B5BFF',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {t.logout}
          </button>
          <LanguageSelector />
        </div>
      </div>

      {/* 主要內容 */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 用戶概況卡片 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <img 
                src={userAvatar} 
                alt="用戶頭像"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  // 如果圖片加載失敗，顯示默認頭像
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <span style={{ 
                fontSize: '35px', 
                color: '#4CAF50',
                display: 'none',
                position: 'absolute'
              }}>👤</span>
            </div>
            
            <h2 style={{ 
              color: '#333', 
              fontSize: '22px', 
              fontWeight: 'bold',
              marginBottom: '6px'
            }}>
              里程碑
            </h2>
            
            <p style={{ 
              color: '#666', 
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              開始於 {userProfile.startDate.toLocaleDateString('zh-TW')}
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '22px', 
                fontWeight: 'bold',
                color: '#4CAF50',
                marginBottom: '3px'
              }}>
                {userProfile.totalDays}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666'
              }}>
                {t.totalDays}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '22px', 
                fontWeight: 'bold',
                color: '#FF9800',
                marginBottom: '3px'
              }}>
                {completedMilestones}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666'
              }}>
                {t.achievements}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '22px', 
                fontWeight: 'bold',
                color: '#2196F3',
                marginBottom: '3px'
              }}>
                {userProfile.currentStreak}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#666'
              }}>
                {t.currentStreak} {t.days}
              </div>
            </div>
          </div>
        </div>

        {/* 添加里程碑按鈕區域 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* 文字添加按鈕 */}
          <button
            onClick={() => setShowAddDialog(true)}
            style={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '12px 24px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(33, 150, 243, 0.3)';
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            {t.addMilestone}
          </button>

          {/* 語音錄製按鈕 */}
          <button
            onClick={handleRecordingClick}
            style={{
              background: isRecording 
                ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
                : 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '12px 24px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: isRecording 
                ? '0 4px 16px rgba(244, 67, 54, 0.3)'
                : '0 4px 16px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: isRecording ? 'pulse 1.5s infinite' : 'none'
            }}
            onMouseOver={(e) => {
              if (!isRecording) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!isRecording) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(33, 150, 243, 0.3)';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>🎤</span>
            {isRecording ? `錄音中 ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}` : '語音輸入'}
          </button>
        </div>

        {/* 里程碑區域 */}
        <div style={{ marginBottom: '30px' }}>
          
          {milestones.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              {t.noMilestones}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {milestones.map((milestone, index) => (
                <div key={milestone.id} style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* 時間軸點 */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      minWidth: '40px'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: milestone.completed ? getMilestoneTypeColor(milestone.type) : '#ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px'
                      }}>
                        {milestone.completed && (
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        )}
                      </div>
                      
                      {index < milestones.length - 1 && (
                        <div style={{
                          width: '2px',
                          height: '40px',
                          background: '#ddd'
                        }} />
                      )}
                    </div>
                    
                    {/* 里程碑內容 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            background: getMilestoneTypeColor(milestone.type),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {t.milestoneTypes[milestone.type as keyof typeof t.milestoneTypes]}
                          </span>
                          
                          <span style={{
                            color: '#999',
                            fontSize: '12px'
                          }}>
                            {formatDate(milestone.date)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* 語音里程碑不顯示編輯按鈕，只顯示刪除按鈕 */}
                          {milestone.title !== '語音里程碑' && (
                            <button
                              onClick={() => handleEditMilestone(milestone)}
                              style={{
                                background: '#4CAF50',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ✏️
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            style={{
                              background: '#F44336',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: milestone.completed ? '#333' : '#666'
                      }}>
                        {milestone.title}
                      </h4>
                      
                      <p style={{ 
                        color: '#666', 
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: 0,
                        marginBottom: '8px'
                      }}>
                        {milestone.description}
                      </p>
                      
                      {/* 語音里程碑播放區域 */}
                      {milestone.audioUrl && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginTop: '8px'
                        }}>
                          <button
                            onClick={() => playVoiceMilestone(milestone)}
                            style={{
                              background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>▶️</span>
                            播放原音
                          </button>
                          
                          {milestone.duration && (
                            <span style={{
                              color: '#666',
                              fontSize: '12px',
                              background: '#f5f5f5',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}>
                              錄音時長: {Math.floor(milestone.duration / 60)}:{(milestone.duration % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 添加里程碑對話框 */}
      {showAddDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>{t.addMilestone}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                標題
              </label>
              <input
                type="text"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
                placeholder="輸入里程碑標題"
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                描述
              </label>
              <textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="輸入里程碑描述"
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                類型
              </label>
              <select
                value={newMilestone.type}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <option value="start">{t.milestoneTypes.start}</option>
                <option value="achievement">{t.milestoneTypes.achievement}</option>
                <option value="growth">{t.milestoneTypes.growth}</option>
                <option value="habit">{t.milestoneTypes.habit}</option>
                <option value="help">{t.milestoneTypes.help}</option>
                <option value="goal">{t.milestoneTypes.goal}</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddDialog(false)}
                style={{
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAddMilestone}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 語音送出對話框 */}
      {showSubmitDialog && pendingAudio && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>語音里程碑</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                錄音時長: {Math.floor(pendingAudio.duration / 60)}:{(pendingAudio.duration % 60).toString().padStart(2, '0')}
              </p>
              <audio 
                controls 
                style={{ width: '100%', marginBottom: '20px' }}
                src={URL.createObjectURL(pendingAudio.blob)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleCancelSubmit}
                style={{
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmitVoice}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                送出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 錄音確認對話框 */}
      {showRecordingConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px'
            }}>
              🎤
            </div>
            
            <h3 style={{ 
              marginBottom: '16px', 
              color: '#333',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              準備開始錄音
            </h3>
            
            <p style={{ 
              marginBottom: '20px', 
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              點擊「開始錄音」後，系統將開始錄製您的語音里程碑。<br/>
              <strong style={{ color: '#ff6b6b' }}>⚠️ 錄音時間限制為1分鐘</strong>
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleCancelRecording}
                style={{
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmRecording}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}
              >
                開始錄音
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯里程碑對話框 */}
      {editingMilestone && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>{t.editMilestone}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                標題
              </label>
              <input
                type="text"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                描述
              </label>
              <textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                類型
              </label>
              <select
                value={newMilestone.type}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <option value="start">{t.milestoneTypes.start}</option>
                <option value="achievement">{t.milestoneTypes.achievement}</option>
                <option value="growth">{t.milestoneTypes.growth}</option>
                <option value="habit">{t.milestoneTypes.habit}</option>
                <option value="help">{t.milestoneTypes.help}</option>
                <option value="goal">{t.milestoneTypes.goal}</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingMilestone(null)}
                style={{
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token 續購彈窗 */}
      {showRenewalModal && permissionResult && (
        <TokenRenewalModal
          isOpen={showRenewalModal}
          onClose={handleRenewalModalClose}
          currentPlan={permissionResult.currentPlan}
          remainingDays={permissionResult.remainingDays}
          usedTokens={permissionResult.usedTokens}
          totalTokens={permissionResult.totalTokens}
        />
      )}

      {/* 升級彈窗 */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureName="語音錄製功能"
        />
      )}
      
      {/* Footer 5個按鈕 - 原封不動複製自 RestartWall */}
      <footer
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 14,
          color: '#888',
          marginTop: 40,
          padding: '16px 0',
          background: 'rgba(255,255,255,0.92)',
          borderTop: '1px solid #eee',
          boxShadow: '0 -2px 8px #0001',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'column', // 手機版強制column
            alignItems: 'center',
            gap: window.innerWidth <= 768 ? 8 : 20,
            padding: '0 20px'
          }}
        >
          {/* 第一行：隱私權政策、條款/聲明、資料刪除說明 */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap'
          }}>
            <a href="/privacy-policy" style={{ color: '#6B5BFF', textDecoration: 'underline', padding: '4px 8px', fontSize: 12 }}>隱私權政策</a>
            <a href="/terms" style={{ color: '#6B5BFF', textDecoration: 'underline', padding: '4px 8px', fontSize: 12 }}>條款/聲明</a>
            <a href="/data-deletion" style={{ color: '#6B5BFF', textDecoration: 'underline', padding: '4px 8px', fontSize: 12 }}>資料刪除說明</a>
          </div>
          {/* 第二行：我們是誰、意見箱 */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap'
          }}>
            <a href="/about" style={{ color: '#6B5BFF', textDecoration: 'underline', fontWeight: 700, padding: '4px 8px', fontSize: 12 }}>🧬 Restarter™｜我們是誰</a>
            <a href="/feedback" style={{ color: '#6B5BFF', textDecoration: 'underline', fontWeight: 700, padding: '4px 8px', fontSize: 12 }}>💬 意見箱｜我們想聽你說</a>
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) {
            footer {
              padding: 8px 16px 40px 16px !important;
              marginTop: 20px !important;
            }
            footer > div {
              gap: 8px !important;
              flex-direction: column !important;
              justify-content: center !important;
            }
            footer > div > div {
              display: flex !important;
              flex-direction: row !important;
              justify-content: center !important;
              gap: 20px !important;
              flex-wrap: wrap !important;
            }
            footer > div > a {
              padding: 4px 8px !important;
              fontSize: 12px !important;
            }
          }
          @media (min-width: 700px) {
            footer {
              padding: 16px !important;
            }
            footer > div {
              flex-direction: row !important;
              gap: 40px !important;
              justify-content: space-between !important;
            }
            footer > div > a {
              padding: 4px 8px !important;
            }
          }
        `}</style>
      </footer>
    </div>
  );
} 