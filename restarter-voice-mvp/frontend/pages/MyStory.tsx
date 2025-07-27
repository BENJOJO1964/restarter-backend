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
import { useTestMode } from '../App';

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
    socialIntegration: '社會融入度評估',
    socialIntegrationTitle: '社會融入度評估',
    socialIntegrationDesc: '評估你在社會中的融入程度，包括人際關係、就業狀況、家庭關係等',
    socialIntegrationQuestions: {
      q1: '你覺得與他人的關係如何？',
      q2: '你對目前的工作/學習狀況滿意嗎？',
      q3: '你與家人的關係如何？',
      q4: '你對未來有信心嗎？',
      q5: '你覺得社會對你的接納程度如何？'
    },
    socialIntegrationOptions: {
      excellent: '非常好',
      good: '良好',
      fair: '一般',
      poor: '需要改善'
    },
    milestoneTypes: {
      start: '開始',
      achievement: '成就',
      growth: '成長',
      habit: '習慣',
      help: '幫助',
      goal: '目標',
      social: '社會融入'
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
    socialIntegration: '社会融入度评估',
    socialIntegrationTitle: '社会融入度评估',
    socialIntegrationDesc: '评估你在社会中的融入程度，包括人际关系、就业状况、家庭关系等',
    socialIntegrationQuestions: {
      q1: '你觉得与他人的关系如何？',
      q2: '你对目前的工作/学习状况满意吗？',
      q3: '你与家人的关系如何？',
      q4: '你对未来有信心吗？',
      q5: '你觉得社会对你的接纳程度如何？'
    },
    socialIntegrationOptions: {
      excellent: '非常好',
      good: '良好',
      fair: '一般',
      poor: '需要改善'
    },
    milestoneTypes: {
      start: '开始',
      achievement: '成就',
      growth: '成长',
      habit: '习惯',
      help: '帮助',
      goal: '目标',
      social: '社会融入'
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
    socialIntegration: 'Social Integration Assessment',
    socialIntegrationTitle: 'Social Integration Assessment',
    socialIntegrationDesc: 'Assess your level of social integration, including relationships, employment status, family relationships, etc.',
    socialIntegrationQuestions: {
      q1: 'How do you feel about your relationships with others?',
      q2: 'Are you satisfied with your current work/study situation?',
      q3: 'How are your relationships with family?',
      q4: 'Do you have confidence in the future?',
      q5: 'How do you feel about society\'s acceptance of you?'
    },
    socialIntegrationOptions: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Needs Improvement'
    },
    milestoneTypes: {
      start: 'Start',
      achievement: 'Achievement',
      growth: 'Growth',
      habit: 'Habit',
      help: 'Help',
      goal: 'Goal',
      social: 'Social Integration'
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
  const { isTestMode } = useTestMode();

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
  const [showSocialIntegrationDialog, setShowSocialIntegrationDialog] = useState(false);
  const [showSocialIntegrationReport, setShowSocialIntegrationReport] = useState(false);
  const [socialIntegrationReport, setSocialIntegrationReport] = useState<any>(null);
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
      if (isTestMode) return;
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

  // 社會融入度評估相關函數
  const [socialIntegrationAnswers, setSocialIntegrationAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  });

  const handleSocialIntegrationSubmit = () => {
    // 計算評估結果
    const answers = Object.values(socialIntegrationAnswers);
    const score = answers.reduce((total, answer) => {
      switch (answer) {
        case 'excellent': return total + 5;
        case 'good': return total + 4;
        case 'fair': return total + 3;
        case 'poor': return total + 2;
        default: return total;
      }
    }, 0);
    
    const averageScore = score / answers.length;
    let result = '';
    let description = '';
    let recommendations = [];
    
    if (averageScore >= 4.5) {
      result = '優秀';
      description = '你的社會融入度非常高，在人際關係、就業狀況、家庭關係等方面都表現出色。';
      recommendations = [
        '繼續保持現有的良好狀態',
        '可以考慮擔任志工幫助其他更生人',
        '分享你的成功經驗給其他需要幫助的人'
      ];
    } else if (averageScore >= 3.5) {
      result = '良好';
      description = '你的社會融入度良好，在大部分方面都有不錯的表現，還有提升空間。';
      recommendations = [
        '參加更多社交活動擴大交友圈',
        '尋求職業技能培訓提升就業競爭力',
        '與家人多溝通改善家庭關係'
      ];
    } else if (averageScore >= 2.5) {
      result = '一般';
      description = '你的社會融入度一般，在某些方面需要改善，建議尋求更多支持。';
      recommendations = [
        '建議尋求專業輔導師協助',
        '參加更生人互助團體',
        '制定具體的改善計劃'
      ];
    } else {
      result = '需要改善';
      description = '你的社會融入度需要改善，建議尋求專業輔導和支持。';
      recommendations = [
        '立即聯繫專業輔導師',
        '參加更生人支持計劃',
        '尋求心理諮商服務'
      ];
    }
    
    // 生成詳細報告
    const report = {
      score: averageScore,
      result: result,
      description: description,
      recommendations: recommendations,
      details: {
        relationships: socialIntegrationAnswers.q1,
        employment: socialIntegrationAnswers.q2,
        family: socialIntegrationAnswers.q3,
        confidence: socialIntegrationAnswers.q4,
        acceptance: socialIntegrationAnswers.q5
      }
    };
    
    const milestone: Milestone = {
      id: Date.now(),
      title: `${t.socialIntegrationTitle} - ${result}`,
      description: `${description} 評估分數: ${averageScore.toFixed(1)}/5.0\n\n建議：\n${recommendations.map(rec => `• ${rec}`).join('\n')}`,
      date: new Date().toISOString(),
      type: 'social',
      completed: true
    };
    
    const updatedMilestones = [milestone, ...milestones];
    setMilestones(updatedMilestones);
    saveMilestonesToStorage(updatedMilestones);
    setSocialIntegrationAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' });
    setShowSocialIntegrationDialog(false);
    
    // 顯示詳細報告
    setShowSocialIntegrationReport(true);
    setSocialIntegrationReport(report);
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
      goal: '#F44336',
      social: '#6B5BFF'
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
          marginBottom: '24px',
          flexWrap: 'wrap'
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

          {/* 社會融入度評估按鈕 */}
          <button
            onClick={() => setShowSocialIntegrationDialog(true)}
            style={{
              background: 'linear-gradient(135deg, #6B5BFF 0%, #5A4FCF 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '12px 24px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 16px rgba(107, 91, 255, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 91, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(107, 91, 255, 0.3)';
            }}
          >
            <span style={{ fontSize: '18px' }}>📊</span>
            {t.socialIntegration}
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
                <option value="social">{t.milestoneTypes.social}</option>
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
                <option value="social">{t.milestoneTypes.social}</option>
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

      {/* 社會融入度評估對話框 */}
      {showSocialIntegrationDialog && (
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
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
              {t.socialIntegrationTitle}
            </h3>
            
            <p style={{ 
              marginBottom: '24px', 
              color: '#666', 
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              {t.socialIntegrationDesc}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 問題1 */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>
                  {t.socialIntegrationQuestions.q1}
                </label>
                <select
                  value={socialIntegrationAnswers.q1}
                  onChange={(e) => setSocialIntegrationAnswers(prev => ({ ...prev, q1: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">請選擇...</option>
                  <option value="excellent">{t.socialIntegrationOptions.excellent}</option>
                  <option value="good">{t.socialIntegrationOptions.good}</option>
                  <option value="fair">{t.socialIntegrationOptions.fair}</option>
                  <option value="poor">{t.socialIntegrationOptions.poor}</option>
                </select>
              </div>
              
              {/* 問題2 */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>
                  {t.socialIntegrationQuestions.q2}
                </label>
                <select
                  value={socialIntegrationAnswers.q2}
                  onChange={(e) => setSocialIntegrationAnswers(prev => ({ ...prev, q2: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">請選擇...</option>
                  <option value="excellent">{t.socialIntegrationOptions.excellent}</option>
                  <option value="good">{t.socialIntegrationOptions.good}</option>
                  <option value="fair">{t.socialIntegrationOptions.fair}</option>
                  <option value="poor">{t.socialIntegrationOptions.poor}</option>
                </select>
              </div>
              
              {/* 問題3 */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>
                  {t.socialIntegrationQuestions.q3}
                </label>
                <select
                  value={socialIntegrationAnswers.q3}
                  onChange={(e) => setSocialIntegrationAnswers(prev => ({ ...prev, q3: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">請選擇...</option>
                  <option value="excellent">{t.socialIntegrationOptions.excellent}</option>
                  <option value="good">{t.socialIntegrationOptions.good}</option>
                  <option value="fair">{t.socialIntegrationOptions.fair}</option>
                  <option value="poor">{t.socialIntegrationOptions.poor}</option>
                </select>
              </div>
              
              {/* 問題4 */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>
                  {t.socialIntegrationQuestions.q4}
                </label>
                <select
                  value={socialIntegrationAnswers.q4}
                  onChange={(e) => setSocialIntegrationAnswers(prev => ({ ...prev, q4: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">請選擇...</option>
                  <option value="excellent">{t.socialIntegrationOptions.excellent}</option>
                  <option value="good">{t.socialIntegrationOptions.good}</option>
                  <option value="fair">{t.socialIntegrationOptions.fair}</option>
                  <option value="poor">{t.socialIntegrationOptions.poor}</option>
                </select>
              </div>
              
              {/* 問題5 */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' }}>
                  {t.socialIntegrationQuestions.q5}
                </label>
                <select
                  value={socialIntegrationAnswers.q5}
                  onChange={(e) => setSocialIntegrationAnswers(prev => ({ ...prev, q5: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">請選擇...</option>
                  <option value="excellent">{t.socialIntegrationOptions.excellent}</option>
                  <option value="good">{t.socialIntegrationOptions.good}</option>
                  <option value="fair">{t.socialIntegrationOptions.fair}</option>
                  <option value="poor">{t.socialIntegrationOptions.poor}</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setShowSocialIntegrationDialog(false)}
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
                onClick={handleSocialIntegrationSubmit}
                disabled={!Object.values(socialIntegrationAnswers).every(answer => answer !== '')}
                style={{
                  background: Object.values(socialIntegrationAnswers).every(answer => answer !== '') 
                    ? 'linear-gradient(45deg, #6B5BFF, #5A4FCF)' 
                    : '#ccc',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  cursor: Object.values(socialIntegrationAnswers).every(answer => answer !== '') ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                提交評估
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 社會融入度評估詳細報告對話框 */}
      {showSocialIntegrationReport && socialIntegrationReport && (
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
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
              📊 社會融入度評估報告
            </h3>
            
            {/* 總體評分 */}
            <div style={{ 
              background: 'linear-gradient(135deg, #6B5BFF 0%, #5A4FCF 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                {socialIntegrationReport.result}
              </div>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                總分：{socialIntegrationReport.score.toFixed(1)}/5.0
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {socialIntegrationReport.description}
              </div>
            </div>
            
            {/* 詳細分析 */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '12px', fontWeight: '600' }}>
                📋 詳細分析
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <span style={{ color: '#666' }}>人際關係</span>
                  <span style={{ fontWeight: '600', color: '#6B5BFF' }}>
                    {socialIntegrationReport.details.relationships === 'excellent' ? '優秀' :
                     socialIntegrationReport.details.relationships === 'good' ? '良好' :
                     socialIntegrationReport.details.relationships === 'fair' ? '一般' : '需要改善'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <span style={{ color: '#666' }}>就業狀況</span>
                  <span style={{ fontWeight: '600', color: '#6B5BFF' }}>
                    {socialIntegrationReport.details.employment === 'excellent' ? '優秀' :
                     socialIntegrationReport.details.employment === 'good' ? '良好' :
                     socialIntegrationReport.details.employment === 'fair' ? '一般' : '需要改善'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <span style={{ color: '#666' }}>家庭關係</span>
                  <span style={{ fontWeight: '600', color: '#6B5BFF' }}>
                    {socialIntegrationReport.details.family === 'excellent' ? '優秀' :
                     socialIntegrationReport.details.family === 'good' ? '良好' :
                     socialIntegrationReport.details.family === 'fair' ? '一般' : '需要改善'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <span style={{ color: '#666' }}>未來信心</span>
                  <span style={{ fontWeight: '600', color: '#6B5BFF' }}>
                    {socialIntegrationReport.details.confidence === 'excellent' ? '優秀' :
                     socialIntegrationReport.details.confidence === 'good' ? '良好' :
                     socialIntegrationReport.details.confidence === 'fair' ? '一般' : '需要改善'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <span style={{ color: '#666' }}>社會接納</span>
                  <span style={{ fontWeight: '600', color: '#6B5BFF' }}>
                    {socialIntegrationReport.details.acceptance === 'excellent' ? '優秀' :
                     socialIntegrationReport.details.acceptance === 'good' ? '良好' :
                     socialIntegrationReport.details.acceptance === 'fair' ? '一般' : '需要改善'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 改善建議 */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '12px', fontWeight: '600' }}>
                💡 改善建議
              </h4>
              <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
                {socialIntegrationReport.recommendations.map((rec: string, index: number) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ color: '#6B5BFF', fontWeight: 'bold' }}>•</span>
                    <span style={{ color: '#333' }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 專業輔導建議 */}
            <div style={{ 
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: 'white', marginBottom: '8px', fontWeight: '600' }}>
                🎯 專業輔導建議
              </h4>
              <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.4', margin: 0 }}>
                基於您的評估結果，我們建議您考慮尋求專業輔導師的協助。專業輔導師可以為您提供個性化的改善計劃和持續的支持。
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSocialIntegrationReport(false)}
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
                關閉報告
              </button>
              <button
                onClick={() => {
                  setShowSocialIntegrationReport(false);
                  // 這裡可以添加聯繫輔導師的功能
                  alert('功能開發中：聯繫專業輔導師');
                }}
                style={{
                  background: 'linear-gradient(45deg, #6B5BFF, #5A4FCF)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                聯繫輔導師
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer 5個按鈕 - 原封不動複製自 RestartWall */}
      {window.innerWidth <= 768 ? (
        // 手機版 Footer - 複製自心聲釋放頁面
        <footer style={{ 
          textAlign: 'center', 
          fontSize: 12, 
          color: '#888', 
          marginTop: 20, 
          padding: 12,
          background: 'rgba(255,255,255,0.95)',
          borderTop: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          {/* 第一行：隱私權政策、條款/聲明、資料刪除說明 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a href="/privacy-policy" style={{ color: '#6B5BFF', textDecoration: 'underline', fontSize: 11 }}>
              {lang === 'zh-TW' ? '隱私權政策' : 
               lang === 'zh-CN' ? '隐私政策' : 
               lang === 'en' ? 'Privacy Policy' : 
               lang === 'ja' ? 'プライバシーポリシー' : 
               lang === 'ko' ? '개인정보 처리방침' : 
               lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 
               lang === 'vi' ? 'Chính sách bảo mật' : 
               lang === 'ms' ? 'Dasar Privasi' : 
               'Consilium de Privata'}
            </a>
            <a href="/terms" style={{ color: '#6B5BFF', textDecoration: 'underline', fontSize: 11 }}>
              {lang === 'zh-TW' ? '條款/聲明' : 
               lang === 'zh-CN' ? '条款/声明' : 
               lang === 'en' ? 'Terms/Statement' : 
               lang === 'ja' ? '規約/声明' : 
               lang === 'ko' ? '약관/성명' : 
               lang === 'th' ? 'ข้อกำหนด/แถลงการณ์' : 
               lang === 'vi' ? 'Điều khoản/Tuyên bố' : 
               lang === 'ms' ? 'Terma/Pernyataan' : 
               'Termini/Declaratio'}
            </a>
            <a href="/data-deletion" style={{ color: '#6B5BFF', textDecoration: 'underline', fontSize: 11 }}>
              {lang === 'zh-TW' ? '資料刪除說明' : 
               lang === 'zh-CN' ? '数据删除说明' : 
               lang === 'en' ? 'Data Deletion' : 
               lang === 'ja' ? 'データ削除について' : 
               lang === 'ko' ? '데이터 삭제 안내' : 
               lang === 'th' ? 'คำอธิบายการลบข้อมูล' : 
               lang === 'vi' ? 'Giải thích xóa dữ liệu' : 
               lang === 'ms' ? 'Penjelasan Penghapusan Data' : 
               'Explicatio Deletionis Datae'}
            </a>
          </div>
          {/* 第二行：我們是誰、意見箱 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a href="/about" style={{ color: '#6B5BFF', textDecoration: 'underline', fontWeight: 600, fontSize: 11 }}>
              {lang === 'zh-TW' ? '🧬 我們是誰' : 
               lang === 'zh-CN' ? '🧬 我们是谁' : 
               lang === 'en' ? '🧬 Who We Are' : 
               lang === 'ja' ? '🧬 私たちについて' : 
               lang === 'ko' ? '🧬 우리는 누구인가' : 
               lang === 'th' ? '🧬 เราเป็นใคร' : 
               lang === 'vi' ? '🧬 Chúng tôi là ai' : 
               lang === 'ms' ? '🧬 Siapa Kami' : 
               '🧬 Quis sumus'}
            </a>
            <a href="/feedback" style={{ color: '#6B5BFF', textDecoration: 'underline', fontWeight: 600, fontSize: 11 }}>
              {lang === 'zh-TW' ? '💬 意見箱' : 
               lang === 'zh-CN' ? '💬 意见箱' : 
               lang === 'en' ? '💬 Feedback' : 
               lang === 'ja' ? '💬 ご意見箱' : 
               lang === 'ko' ? '💬 피드백' : 
               lang === 'th' ? '💬 กล่องความคิดเห็น' : 
               lang === 'vi' ? '💬 Hộp góp ý' : 
               lang === 'ms' ? '💬 Kotak Maklum Balas' : 
               '💬 Arca Consilii'}
            </a>
          </div>
        </footer>
      ) : (
        // 桌面版 Footer
        <Footer />
      )}
    </div>
  );
} 