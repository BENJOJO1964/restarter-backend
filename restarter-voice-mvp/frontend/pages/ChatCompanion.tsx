import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VirtualAvatar from '../components/VirtualAvatar';
import { generateResponse } from '../lib/ai/generateResponse';
import { speak } from '../lib/ai/speak';
import { generateTalkingFace } from '../lib/ai/talkingFace';
import { getAuth, signOut } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import Footer from '../components/Footer';
import { TokenRenewalModal } from '../components/TokenRenewalModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { usePermission } from '../hooks/usePermission';
import { useTestMode } from '../App';

interface ChatMsg {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  status?: 'streaming' | 'done';
  audio?: string;
}

type LanguageCode = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko' | 'vi' | 'th' | 'la' | 'ms';

const LANGS: { code: LanguageCode; label: string }[] = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'zh-CN', label: '简中' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'th', label: 'ไทย' },
  { code: 'la', label: 'Latina' },
  { code: 'ms', label: 'Bahasa Melayu' },
];

const AVATAR_FILES = [
  'Annie.png', 'berlex.png', 'Bray.png', 'Cayly.png', 'Derxl.png', 'El.png',
  'Fenny.png', 'Gily.png', 'Henny.png', 'Jesy.png', 'Karl.png', 'michy.png',
  'Mily.png', 'Neysher.png', 'sandy.png', 'Sherl.png', 'Shu.png', 'Shyly.png'
];

const AVATAR_LIST = AVATAR_FILES.map(f => `/avatars/${f}`);
const AVATAR_NAMES = AVATAR_FILES.map(f => f.replace(/\.png$/i, ''));

const TEXTS: Record<LanguageCode, any> = {
  'zh-TW': {
    friend: '朋友',
    avatarTitle: '選我做你的朋友',
    companionPhrase: ['🕊️ 守在海這端，', '我都聽著呢。'],
    changeAvatar: '更換我的頭像',
    aiReplyTemplate: (text: string) => `AI陪聊：我明白你的意思，「${text}」，讓我再多聽你說說...`,
    aiSystemPrompt: '你是一個溫暖、善解人意的虛擬人，請用鼓勵、正向語氣回應。',
    speechErrorBrowser: '此瀏覽器不支援語音辨識，請改用 Chrome/Edge。',
    speechErrorFail: '語音辨識失敗，請再試一次。',
    speechErrorNoDetect: '沒有偵測到語音，請再試一次。',
    logout: '登出',
    inputPlaceholder: '或者，直接輸入文字... (Enter 送出)',
    welcome: (name: string) => `嗨，${name}，我是你的 AI 朋友，你可以開始跟我說話囉！`,
    welcomePickAvatar: (name: string) => `嗨，${name}，先幫我選個頭像後我們再輕鬆自在，天南地北痛快聊...`,
    welcomeChat: (avatar: string, name: string) => `${avatar}說：嗨，${name}，今天想聊點什麼呢？`,
    whoAmI: '你想我是誰？',
    tapToTalk: '按一下開始語音聊天...',
    aiReplying: 'AI 正在回覆中，輸入新訊息可立即打斷',
    recognizing: '正在辨識中...',
  },
  'zh-CN': {
    friend: '朋友',
    avatarTitle: '选我做你的朋友',
    companionPhrase: ['🕊️ 守在海这端，', '我都听着呢。'],
    changeAvatar: '更换我的头像',
    aiReplyTemplate: (text: string) => `AI陪聊：我明白你的意思，"${text}"，让我再多听你聊聊...`,
    aiSystemPrompt: '你是一个温暖、善解人意的虚拟人，请用鼓励、正向语气回应。',
    speechErrorBrowser: '此浏览器不支持语音识别，请改用 Chrome/Edge。',
    speechErrorFail: '语音识别失败，请再试一次。',
    speechErrorNoDetect: '没有检测到语音，请再试一次。',
    logout: '登出',
    inputPlaceholder: '或者，直接输入文字... (Enter 发送)',
    welcome: (name: string) => `嗨，${name}，我是你的 AI 朋友，你可以开始跟我说话啰！`,
    welcomePickAvatar: (name: string) => `嗨，${name}，先帮我选个头像后我们再轻松自在，天南地北畅快聊...`,
    welcomeChat: (avatar: string, name:string) => `${avatar}说：嗨，${name}，今天想聊点什么呢？`,
    whoAmI: '你想我是谁？',
    tapToTalk: '点一下开始语音聊天...',
    aiReplying: 'AI 正在回复中，输入新消息可立即打断',
    recognizing: '正在识别中...',
  },
  'en': {
    friend: 'Friend',
    avatarTitle: 'Pick Me as Your Friend',
    companionPhrase: ["🕊️ I'm here by the sea,", "I'm listening."],
    changeAvatar: 'Change My Avatar',
    aiReplyTemplate: (text: string) => `AI Chat: I understand what you mean, "${text}", let me hear more from you...`,
    aiSystemPrompt: 'You are a warm, empathetic virtual person. Please respond in an encouraging and positive tone.',
    speechErrorBrowser: 'This browser does not support speech recognition. Please use Chrome/Edge.',
    speechErrorFail: 'Speech recognition failed, please try again.',
    speechErrorNoDetect: 'No speech detected, please try again.',
    logout: 'Logout',
    inputPlaceholder: 'Or, type text directly... (Enter to send)',
    welcome: (name: string) => `Hi, ${name}, I'm your AI friend. You can start talking to me now!`,
    welcomePickAvatar: (name: string) => `Hi, ${name}, pick my avatar and let's chat freely!`,
    welcomeChat: (avatar: string, name: string) => `${avatar}: Hi, ${name}, what do you want to talk about today?`,
    whoAmI: 'Who do you want me to be?',
    tapToTalk: 'Tap to start voice chat...',
    aiReplying: 'AI is replying, type a new message to interrupt.',
    recognizing: 'Recognizing...',
  },
  'ja': {
    friend: '友達',
    avatarTitle: '友達に選んでね',
    companionPhrase: ['🕊️ この海辺で待ってるよ、', 'ずっと聞いているから。'],
    changeAvatar: 'アバターを変更',
    aiReplyTemplate: (text: string) => `AIチャット：あなたの言うこと、「${text}」、わかります。もっと聞かせてください...`,
    aiSystemPrompt: 'あなたは温かく、共感的なバーチャルパーソンです。励ましとポジティブなトーンで応答してください。',
    speechErrorBrowser: 'このブラウザは音声認識に対応していません。Chrome/Edgeを使用してください。',
    speechErrorFail: '音声認識に失敗しました。もう一度お試しください。',
    speechErrorNoDetect: '音声が検出されませんでした。もう一度お試しください。',
    logout: 'ログアウト',
    inputPlaceholder: 'あるいは、直接テキストを入力... (Enterで送信)',
    welcome: (name: string) => `こんにちは、${name}さん。あなたのAIの友達です。さあ、話しましょう！`,
    welcomePickAvatar: (name: string) => `やあ、${name}、まずは私のアバターを選んでから、気軽に何でも話そう！`,
    welcomeChat: (avatar: string, name: string) => `${avatar}：やあ、${name}、今日は何を話そうか？`,
    whoAmI: '私が誰であってほしいですか？',
    tapToTalk: 'タップして音声チャット開始',
    aiReplying: 'AIが返信中です。新しいメッセージを入力するとすぐに中断できます',
    recognizing: '認識中...',
  },
  'ko': {
    friend: '친구',
    avatarTitle: '나를 친구로 선택해줘',
    companionPhrase: ['🕊️ 바다 이편에서 지키고 있을게,', '다 듣고 있어.'],
    changeAvatar: '내 아바타 변경',
    aiReplyTemplate: (text: string) => `AI 채팅: 무슨 말인지 알겠어, "${text}", 더 얘기해줘...`,
    aiSystemPrompt: '당신은 따뜻하고 공감 능력이 뛰어난 가상 인간입니다. 격려하고 긍정적인 톤으로 응답해주세요.',
    speechErrorBrowser: '이 브라우저는 음성 인식을 지원하지 않습니다. Chrome/Edge를 사용해주세요.',
    speechErrorFail: '음성 인식이 실패했습니다. 다시 시도해주세요.',
    speechErrorNoDetect: '음성이 감지되지 않았습니다. 다시 시도해주세요.',
    logout: '로그아웃',
    inputPlaceholder: '아니면, 직접 텍스트를 입력하세요... (Enter로 전송)',
    welcome: (name: string) => `안녕, ${name}. 나는 너의 AI 친구야. 이제 나에게 말을 걸 수 있어!`,
    welcomePickAvatar: (name: string) => `안녕, ${name}. 먼저 내 아바타를 고르고 자유롭게 얘기하자!`,
    welcomeChat: (avatar: string, name: string) => `${avatar}: 안녕, ${name}, 오늘 무슨 얘기하고 싶어?`,
    whoAmI: '내가 누구였으면 좋겠어?',
    tapToTalk: '탭하여 음성 채팅 시작...',
    aiReplying: 'AI가 답장 중입니다. 새 메시지를 입력하여 중단할 수 있습니다.',
    recognizing: '인식 중...',
  },
  'vi': {
    friend: 'Bạn bè',
    avatarTitle: 'Chọn tôi làm bạn của bạn',
    companionPhrase: ['🕊️ Em ở đây bên bờ biển,', 'Em đang lắng nghe đây.'],
    changeAvatar: 'Thay đổi Avatar của tôi',
    aiReplyTemplate: (text: string) => `Trò chuyện AI: Tôi hiểu ý bạn, "${text}", hãy cho tôi nghe thêm...`,
    aiSystemPrompt: 'Bạn là một người ảo ấm áp, đồng cảm. Vui lòng trả lời bằng giọng điệu khích lệ và tích cực.',
    speechErrorBrowser: 'Trình duyệt này không hỗ trợ nhận dạng giọng nói. Vui lòng sử dụng Chrome/Edge.',
    speechErrorFail: 'Nhận dạng giọng nói thất bại, vui lòng thử lại.',
    speechErrorNoDetect: 'Không phát hiện thấy giọng nói, vui lòng thử lại.',
    logout: 'Đăng xuất',
    inputPlaceholder: 'Hoặc, nhập văn bản trực tiếp... (Enter để gửi)',
    welcome: (name: string) => `Chào, ${name}. Tôi là người bạn AI của bạn. Bây giờ bạn có thể bắt đầu nói chuyện với tôi!`,
    welcomePickAvatar: (name: string) => `Chào, ${name}, hãy chọn avatar của tôi và chúng ta hãy trò chuyện thoải mái!`,
    welcomeChat: (avatar: string, name: string) => `${avatar}: Chào, ${name}, hôm nay bạn muốn nói về điều gì?`,
    whoAmI: 'Bạn muốn tôi là ai?',
    tapToTalk: 'Nhấn để bắt đầu trò chuyện thoại...',
    aiReplying: 'AI đang trả lời, nhập tin nhắn mới để ngắt.',
    recognizing: 'Đang nhận dạng...',
  },
  'th': {
    friend: 'เพื่อน',
    avatarTitle: 'เลือกฉันเป็นเพื่อนของคุณ',
    companionPhrase: ['🕊️ ฉันอยู่ที่นี่ริมทะเล,', 'ฉันกำลังฟังอยู่'],
    changeAvatar: 'เปลี่ยนอวตารของฉัน',
    aiReplyTemplate: (text: string) => `แชท AI: ฉันเข้าใจที่คุณหมายถึง, "${text}", เล่าให้ฉันฟังอีกสิ...`,
    aiSystemPrompt: 'คุณเป็นบุคคลเสมือนที่อบอุ่นและเข้าอกเข้าใจ โปรดตอบกลับด้วยน้ำเสียงที่ให้กำลังใจและเป็นบวก',
    speechErrorBrowser: 'เบราว์เซอร์นี้ไม่รองรับการจำแนกเสียงพูด กรุณาใช้ Chrome/Edge',
    speechErrorFail: 'การจำแนกเสียงพูดล้มเหลว กรุณาลองอีกครั้ง',
    speechErrorNoDetect: 'ไม่พบเสียงพูด กรุณาลองอีกครั้ง',
    logout: 'ออกจากระบบ',
    inputPlaceholder: 'หรือพิมพ์ข้อความโดยตรง... (Enter เพื่อส่ง)',
    welcome: (name: string) => `สวัสดี, ${name}. ฉันคือเพื่อน AI ของคุณ คุณสามารถเริ่มคุยกับฉันได้เลย!`,
    welcomePickAvatar: (name: string) => `สวัสดี, ${name}, เลือกอวตารของฉันแล้วมาคุยกันอย่างอิสระ!`,
    welcomeChat: (avatar: string, name: string) => `${avatar}: สวัสดี, ${name}, วันนี้คุณอยากคุยเรื่องอะไร?`,
    whoAmI: 'คุณอยากให้ฉันเป็นใคร?',
    tapToTalk: 'แตะเพื่อเริ่มแชทด้วยเสียง...',
    aiReplying: 'AI กำลังตอบกลับ, พิมพ์ข้อความใหม่เพื่อขัดจังหวะ',
    recognizing: 'กำลังจดจำ...',
  },
  'la': {
    friend: 'Amicus',
    avatarTitle: 'Elige Me ut Amicum Tuum',
    companionPhrase: ['🕊️ Hic adsum ad mare,', 'Audio.'],
    changeAvatar: 'Muta Imaginem Meam',
    aiReplyTemplate: (text: string) => `AI Curabitur: Intellego quid velis, "${text}", sine me plura a te audire...`,
    aiSystemPrompt: 'Tu es persona virtualis calida et empathetica. Quaeso responde sono hortanti et positivo.',
    speechErrorBrowser: 'Hic navigator recognitionem vocis non sustinet. Quaeso utere Chrome/Edge.',
    speechErrorFail: 'Recognitio vocis defecit, quaeso iterum conare.',
    speechErrorNoDetect: 'Nulla oratio detecta, quaeso iterum conare.',
    logout: 'Exire',
    inputPlaceholder: 'Aut, textum directe scribe... (Enter mittere)',
    welcome: (name: string) => `Salve, ${name}. Amicus tuus AI sum. Iam potes mecum loqui!`,
    welcomePickAvatar: (name: string) => `Salve, ${name}, elige imaginem meam et libere loquamur!`,
    welcomeChat: (avatar: string, name: string) => `${avatar}: Salve, ${name}, de quo hodie loqui vis?`,
    whoAmI: 'Quis vis me esse?',
    tapToTalk: 'Tange ut colloquium vocale incipias...',
    aiReplying: 'AI respondet, scribe novum nuntium ad interrumpendum.',
    recognizing: 'Agnoscens...',
  },
  'ms': {
    friend: 'Kawan',
    avatarTitle: 'Pilih Saya sebagai Kawan Anda',
    companionPhrase: ['🕊️ Saya di sini di tepi laut,', 'Saya sedang mendengar.'],
    changeAvatar: 'Tukar Avatar Saya',
    aiReplyTemplate: (text: string) => `Sembang AI: Saya faham maksud awak, "${text}", beritahu saya lagi...`,
    aiSystemPrompt: 'Anda adalah orang maya yang mesra dan empati. Sila balas dengan nada yang menggalakkan dan positif.',
    speechErrorBrowser: 'Pelayar ini tidak menyokong pengecaman pertuturan. Sila gunakan Chrome/Edge.',
    speechErrorFail: 'Pengecaman pertuturan gagal, sila cuba lagi.',
    speechErrorNoDetect: 'Tiada pertuturan dikesan, sila cuba lagi.',
    logout: 'Log keluar',
    inputPlaceholder: 'Atau, taip teks secara terus... (Enter untuk hantar)',
    welcome: (name: string) => `Hai, ${name}. Saya kawan AI anda. Anda boleh mula bercakap dengan saya sekarang!`,
    welcomePickAvatar: (name: string) => `Hai, ${name}, pilih avatar saya dan mari berbual dengan bebas!`,
    welcomeChat: (avatar: string, name: string) => `${avatar}: Hai, ${name}, apa yang anda mahu bualkan hari ini?`,
    whoAmI: 'Awak nak saya jadi siapa?',
    tapToTalk: 'Ketik untuk memulakan sembang suara...',
    aiReplying: 'AI sedang membalas, taip mesej baru untuk mengganggu.',
    recognizing: 'Mengecam...',
  },
};

// 1. 多語言返回與更換頭像
const BACK_TEXT = {
  'zh-TW': '返回',
  'zh-CN': '返回',
  'en': 'Back',
  'ja': '戻る',
  'ko': '뒤로',
  'th': 'ย้อนกลับ',
  'vi': 'Quay lại',
  'ms': 'Kembali',
  'la': 'Redi',
};
const CHANGE_AVATAR_TEXT = {
  'zh-TW': '更換頭像',
  'zh-CN': '更换头像',
  'en': 'Change Avatar',
  'ja': 'アバターを変更',
  'ko': '아바타 변경',
  'th': 'เปลี่ยนภาพประจำตัว',
  'vi': 'Đổi avatar',
  'ms': 'Tukar Avatar',
  'la': 'Muta Imaginem',
};

// 1. 多語言主副標題
const MAIN_TITLE = {
  'zh-TW': '讓我們來聊天...',
  'zh-CN': '让我们来聊天...',
  'en': "Let's Chat...",
  'ja': 'さあ、話そう...',
  'ko': '함께 이야기해요...',
  'th': 'มาคุยกันเถอะ...',
  'vi': 'Hãy trò chuyện nào...',
  'ms': 'Mari Berbual...',
  'la': 'Colloquamur...'
};
const SUB_TITLE = {
  'zh-TW': '聊什麼都可以喔 😊',
  'zh-CN': '聊什么都可以哦 😊',
  'en': 'Anything is okay to talk about 😊',
  'ja': '何でも話していいよ 😊',
  'ko': '무엇이든 이야기해도 돼요 😊',
  'th': 'คุยอะไรก็ได้เลย 😊',
  'vi': 'Nói gìก็ได้ nhé 😊',
  'ms': 'Boleh berbual apa sahaja 😊',
  'la': 'De omnibus loqui licet 😊'
};

export default function ChatCompanion() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [aiStreaming, setAIStreaming] = useState(false);
  const aiTimeout = useRef<NodeJS.Timeout|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showInput, setShowInput] = useState(false);
  const [recording, setRecording] = useState(false);
  const [aiAvatar, setAiAvatar] = useState<string>('');
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [avatarVideo, setAvatarVideo] = useState<string>('');
  const [avatarAudio, setAvatarAudio] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  
  const { lang, setLang } = useLanguage();
  const t = TEXTS[lang] || TEXTS['zh-TW'];
  const recognitionRef = useRef<any>(null);
  const { isTestMode } = useTestMode();

  // 新增：語音自動循環控制
  const [autoVoiceLoop, setAutoVoiceLoop] = useState(false);
  const voiceLoopTimeout = useRef<NodeJS.Timeout|null>(null);
  // 新增：強制控制麥克風按鈕狀態
  const [forceStop, setForceStop] = useState(false);

  // 新增：權限檢查
  const { checkPermission, recordUsage } = usePermission();
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [permissionResult, setPermissionResult] = useState<any>(null);

  const getNickname = () => {
    const user = getAuth().currentUser;
    return (user && user.displayName) || localStorage.getItem('nickname') || t.friend;
  };

  const [nickname, setNickname] = useState(getNickname());
  const [lastUid, setLastUid] = useState(() => localStorage.getItem('lastUid'));
  const [firstAvatarSelected, setFirstAvatarSelected] = useState(() => !localStorage.getItem('avatarWelcomed'));
  const [isFirstChat, setIsFirstChat] = useState(() => !localStorage.getItem('aiAvatar'));
  const [uploadedAvatar, setUploadedAvatar] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    setNickname(getNickname());
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setInput(lastTranscript + finalTranscript + interimTranscript);

        if (finalTranscript) {
          const fullText = lastTranscript + finalTranscript;
          setLastTranscript(prev => prev + finalTranscript);
          
          // 無論是測試模式還是正常模式，都自動發送語音辨識結果
          (async () => {
            const newUserMsg: ChatMsg = { id: `user-${Date.now()}`, text: fullText, sender: 'user' };
            setMessages(prev => [...prev, newUserMsg]);
            setInput('');
            
            if (aiTimeout.current) clearTimeout(aiTimeout.current);
            const newMsgId = `ai-${Date.now()}`;
            setMessages(prev => [...prev, { id: newMsgId, text: '', sender: 'ai', status: 'streaming' }]);
            setAIStreaming(true);
            
            try {
              const stream = await generateResponse(fullText, lang, t.aiSystemPrompt, isTestMode);
              let fullReply = '';
              for await (const chunk of stream) {
                fullReply += chunk;
                setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: fullReply } : m));
              }
              setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'done' } : m));
            } catch (error) {
              console.error("Error in AI pipeline: ", error);
              const errorMessage = error instanceof Error ? error.message : '未知錯誤';
              setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: `API錯誤：${errorMessage}`, status: 'done' } : m));
            } finally {
              setAIStreaming(false);
            }
          })();
          // 移除自動停止錄音，讓語音辨識持續進行
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        let errorMsg = '';
        switch (event.error) {
          case 'no-speech':
            errorMsg = t.speechErrorNoDetect;
            break;
          case 'audio-capture':
          case 'network':
            errorMsg = t.speechErrorFail;
            break;
          default:
            errorMsg = '';
        }
        setSpeechError(errorMsg);
        setRecognizing(false);
        setRecording(false);
      };

      recognitionRef.current.onend = () => {
        setRecognizing(false);
        if (recording) {
          // If recording was stopped manually, don't restart.
          // If it stopped by itself, maybe restart it if needed.
        }
      };
    } else {
      setSpeechError(t.speechErrorBrowser);
    }
  }, [lang, t.speechErrorBrowser, t.speechErrorFail, t.speechErrorNoDetect, recording, lastTranscript]);

  useEffect(() => {
    if (!recognitionRef.current) return;
    // 語音辨識結束時自動觸發AI回覆與循環
    recognitionRef.current.onend = () => {
      setRecognizing(false);
      if (autoVoiceLoop && recording && !forceStop) {
        // 停下後0.1秒自動AI回覆，然後自動再啟動語音辨識
        voiceLoopTimeout.current = setTimeout(() => {
          if (!recording || forceStop) return;
          if (input.trim()) {
            handleSend(input);
            setInput('');
            setLastTranscript('');
          }
          // AI回覆完再自動啟動語音辨識
          setTimeout(() => {
            if (recording && autoVoiceLoop && !forceStop) {
              recognitionRef.current.start();
              setRecognizing(true);
            }
          }, 500); // AI回覆後再啟動語音辨識
        }, 100);
      }
    };
    // eslint-disable-next-line
  }, [autoVoiceLoop, recording, input, forceStop]);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('aiAvatar');
    if (savedAvatar) {
      setAiAvatar(savedAvatar);
      setShowAvatarSelect(false);
    } else {
      setShowAvatarSelect(true);
    }
    
    const currentUid = getAuth().currentUser?.uid;
    if (currentUid !== lastUid) {
      localStorage.removeItem('aiAvatar');
      localStorage.removeItem('avatarWelcomed');
      setAiAvatar('');
      setLastUid(currentUid || null);
      if (currentUid) {
        localStorage.setItem('lastUid', currentUid);
      }
    }

    if (getAuth().currentUser) {
      setNickname(getAuth().currentUser?.displayName || t.friend);
    }

  }, [lastUid, t.friend]);

  // 自動捲動到最新訊息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      localStorage.removeItem('nickname');
      localStorage.removeItem('lastUid');
      localStorage.removeItem('aiAvatar');
      localStorage.removeItem('avatarWelcomed');
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSelectAvatar = (url: string) => {
    setAiAvatar(url);
    localStorage.setItem('aiAvatar', url);
    setShowAvatarSelect(false);
    if (firstAvatarSelected) {
      setMessages([{ id: 'welcome-1', text: t.welcomeChat(getAvatarName(url), nickname), sender: 'ai' }]);
      localStorage.setItem('avatarWelcomed', 'true');
      setFirstAvatarSelected(false);
    }
  };

  const fakeAIReply = (userText: string) => {
    if (aiTimeout.current) clearTimeout(aiTimeout.current);
    const newMsgId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { id: newMsgId, text: '', sender: 'ai', status: 'streaming' }]);
    setAIStreaming(true);

    const replyText = t.aiReplyTemplate(userText);
    let i = 0;
    const interval = setInterval(() => {
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: replyText.substring(0, i) } : m));
      i++;
      if (i > replyText.length) {
        clearInterval(interval);
        setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'done' } : m));
        setAIStreaming(false);
      }
    }, 50);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    // 檢查 AI 聊天權限
    const permission = await checkPermission('aiChat');
    if (!permission.allowed) {
      if (isTestMode) {
        // 測試模式下直接執行，不檢查權限，但調用真實的AI API
        const newUserMsg: ChatMsg = { id: `user-${Date.now()}`, text, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setLastTranscript('');

        if (aiTimeout.current) clearTimeout(aiTimeout.current);
        const newMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { id: newMsgId, text: '', sender: 'ai', status: 'streaming' }]);
        setAIStreaming(true);
        
        try {
          const stream = await generateResponse(text, lang, t.aiSystemPrompt, isTestMode);
          let fullReply = '';
          for await (const chunk of stream) {
            fullReply += chunk;
            setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: fullReply } : m));
          }

          setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'done' } : m));
        } catch (error) {
          console.error("Error in AI pipeline: ", error);
          const errorMessage = error instanceof Error ? error.message : '未知錯誤';
          setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: `API錯誤：${errorMessage}`, status: 'done' } : m));
        } finally {
          setAIStreaming(false);
        }
        return;
      }
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

    const newUserMsg: ChatMsg = { id: `user-${Date.now()}`, text, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLastTranscript('');

    if (aiTimeout.current) clearTimeout(aiTimeout.current);
    const newMsgId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { id: newMsgId, text: '', sender: 'ai', status: 'streaming' }]);
    setAIStreaming(true);
    
    try {
      const stream = await generateResponse(text, lang, t.aiSystemPrompt, isTestMode);
      let fullReply = '';
      for await (const chunk of stream) {
        fullReply += chunk;
        setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: fullReply } : m));
      }
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, status: 'done' } : m));
      
      setIsSpeaking(true);
      // 暫時跳過語音和影片生成
      // const audioUrl = await speak(fullReply, lang);
      // setAvatarAudio(audioUrl);
      // const videoUrl = await generateTalkingFace(fullReply, aiAvatar);
      // setAvatarVideo(videoUrl);
      
      // 記錄使用量
      await recordUsage('aiChat', 2); // AI 聊天消耗 2 tokens
      
    } catch (error) {
      console.error("Error in AI pipeline: ", error);
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: 'Oops, something went wrong.', status: 'done' } : m));
    } finally {
      setAIStreaming(false);
      setIsSpeaking(false);
    }
  };

  const getAvatarName = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1].replace(/\.png$/i, '');
  };

  const handleRecordVoice = async () => {
    if (!recognitionRef.current) return;
    
    if (recording || autoVoiceLoop || recognizing) {
      recognitionRef.current.stop();
      setRecording(false);
      setRecognizing(false);
      setAutoVoiceLoop(false); // 停止自動循環
      if (voiceLoopTimeout.current) clearTimeout(voiceLoopTimeout.current);
      setForceStop(true); // 強制停止
    } else {
      // 檢查語音權限
      const permission = await checkPermission('aiChat');
      if (!permission.allowed) {
        if (isTestMode) {
          // 測試模式下直接執行，不檢查權限
          setLastTranscript('');
          setInput('');
          recognitionRef.current.start();
          setRecording(true);
          setRecognizing(true);
          setSpeechError('');
          setAutoVoiceLoop(true); // 啟動自動循環
          setForceStop(false);
          return;
        }
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

      setLastTranscript('');
      setInput('');
      recognitionRef.current.start();
      setRecording(true);
      setRecognizing(true);
      setSpeechError('');
      setAutoVoiceLoop(true); // 啟動自動循環
      setForceStop(false);
      
      // 記錄使用量
      await recordUsage('aiChat', 1);
    }
  };

  const randomAvatar = () => {
    const randUrl = AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)];
    handleSelectAvatar(randUrl);
  };

  const handleUploadAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查文件類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片文件');
        return;
      }
      
      // 檢查文件大小 (限制為 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedAvatar(result);
        handleSelectAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // 確保 autoVoiceLoop 和 recording 都為 false 時才重置 forceStop
  useEffect(() => {
    if (!recording && !autoVoiceLoop) setForceStop(false);
  }, [recording, autoVoiceLoop]);

  const handleRenewalModalClose = () => {
    setShowRenewalModal(false);
    setPermissionResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* 上緣：AI名稱、主標題、使用者名稱 */}
      <header style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderBottom: '1px solid #ddd', position: 'relative', padding: 0 }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px 0 20px', position: 'relative' }}>
            {/* 返回按鈕 */}
            <button onClick={() => navigate(-1)} style={{ position: 'absolute', left: 20, background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{BACK_TEXT[lang]}</button>
            {/* AI名稱、主標題、使用者名稱 */}
            <span className="ai-name-desktop" style={{ fontWeight: 700, color: '#ff9800', fontSize: 18, marginRight: 12, minWidth: 50, textAlign: 'right', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getAvatarName(aiAvatar) || t.whoAmI}</span>
            <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', flexShrink: 0 }}>💬 聊天了吧</div>
            <span style={{ fontWeight: 700, color: '#1976d2', fontSize: 18, marginLeft: 12, minWidth: 50, textAlign: 'left', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getAuth().currentUser?.displayName || getAuth().currentUser?.email || '用戶'}</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <div style={{ fontSize: 16, color: '#888' }}>在這裡你可以盡情,暢快,放開地聊😊</div>
          </div>
      </header>

      {showAvatarSelect && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, textAlign: 'center', position: 'relative' }}>
            {/* X 關閉按鈕 */}
            <button 
              onClick={() => setShowAvatarSelect(false)} 
              style={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                background: 'none', 
                border: 'none', 
                fontSize: 24, 
                color: '#888', 
                cursor: 'pointer', 
                fontWeight: 700 
              }}
            >
              ×
            </button>
            <h2>{t.avatarTitle}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, margin: '24px 0' }}>
              {AVATAR_LIST.slice(0, 15).map(url => (
                <img key={url} src={url} alt={getAvatarName(url)} onClick={() => handleSelectAvatar(url)} style={{ width: 80, height: 80, borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} />
              ))}
              {/* 上傳心儀頭像 */}
              <div 
                style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  border: '2px dashed #6B5BFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  background: '#f8f8ff',
                  color: '#6B5BFF',
                  fontSize: 12,
                  fontWeight: 600
                }}
                onClick={triggerFileUpload}
              >
                上傳心儀頭像
              </div>
            </div>
            {/* 隱藏的文件輸入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUploadAvatar}
            />
          </div>
        </div>
      )}

      {!aiAvatar && !showAvatarSelect && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 24 }}>{t.welcomePickAvatar(nickname)}</p>
          <button onClick={() => setShowAvatarSelect(true)} style={{ padding: '10px 20px', borderRadius: 8, background: '#1877f2', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16 }}>
            {t.avatarTitle}
          </button>
        </div>
      )}
      
      {aiAvatar && (
        <main 
          ref={chatContainerRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '20px',
            maxHeight: 'calc(100vh - 240px)', // 調整高度計算，為固定footer預留空間
            scrollBehavior: 'smooth',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', minHeight: '100%' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
                <p style={{ fontSize: 18 }}>{t.welcomeChat(getAvatarName(aiAvatar), nickname)}</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} style={{ 
                display: 'flex', 
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                margin: '10px 0',
                wordWrap: 'break-word'
              }}>
                <div style={{
                  backgroundColor: msg.sender === 'user' ? '#0084ff' : '#e4e6eb',
                  color: msg.sender === 'user' ? '#fff' : '#000',
                  padding: '12px 16px',
                  borderRadius: 18,
                  maxWidth: '70%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.4'
                }}>
                  {msg.text}
                  {msg.status === 'streaming' && '...'}
                </div>
              </div>
            ))}
            {/* 確保最後一條訊息後有足夠空間 */}
            <div style={{ height: '20px' }}></div>
          </div>
        </main>
      )}

      {aiAvatar && (
        <footer style={{ 
          padding: '10px 20px 10px 20px', 
          backgroundColor: '#fff', 
          borderTop: '1px solid #ddd', 
          position: 'relative',
          minHeight: '160px', // 固定最小高度避免佈局變化
          boxSizing: 'border-box'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ flex: 1, marginLeft: 0, marginRight: 0 }}>
              {/* 手機版：AI頭像和使用者頭像在訊息框上方 */}
              <div className="mobile-avatars-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 8px' }}>
                {/* AI頭像 - 手機版樣式 */}
                <div className="mobile-ai-avatar" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50% / 45%', border: '4px solid #2196f3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', overflow: 'hidden' }}>
                    <div style={{ width: 72, height: 72, minWidth: 72, minHeight: 72, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <VirtualAvatar avatar={aiAvatar} videoUrl={avatarVideo} audioUrl={avatarAudio} isSpeaking={isSpeaking} size={72} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowAvatarSelect(true)} style={{ background: '#6B5BFF', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontWeight: 600, fontSize: 10, cursor: 'pointer', boxShadow: '0 2px 4px rgba(107, 91, 255, 0.3)', whiteSpace: 'nowrap' }}>{CHANGE_AVATAR_TEXT[lang]}</button>
                </div>
                {/* 中間歡迎訊息 */}
                <div style={{ flex: 1, textAlign: 'center', padding: '0 12px' }}>
                  <div style={{ fontSize: 14, color: '#666', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: 700, color: '#ff9800' }}>{getAvatarName(aiAvatar) || 'Fenny'}</span>
                    <br />
                    <span style={{ color: '#1976d2' }}>讓我們來聊天...</span>
                    <br />
                    <span style={{ color: '#1976d2' }}>{getAuth().currentUser?.displayName || getAuth().currentUser?.email || '用戶'}</span>
                    <br />
                    <span style={{ color: '#666' }}>聊什麼都可以喔 😊</span>
                  </div>
                </div>
                {/* 使用者頭像 - 手機版樣式 */}
                <div style={{ width: 80, height: 80, borderRadius: '50% / 45%', border: '4px solid #2196f3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', overflow: 'visible' }}>
                  <img src={getAuth().currentUser?.photoURL || '/ctx-logo.png'} alt="user" style={{ width: 72, height: 72, minWidth: 72, minHeight: 72, borderRadius: '50%', objectFit: 'cover', border: 'none', verticalAlign: 'bottom' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 80 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={aiStreaming ? t.aiReplying : t.inputPlaceholder}
                  style={{ width: '100%', padding: 12, borderRadius: 18, border: '1px solid #ccc' }}
                  disabled={aiStreaming || recognizing}
                />
              </div>
              {/* 手機版：送出與麥克風按鈕在輸入框下方置中 */}
              <div className="chat-action-row-mobile" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 16 }}>
                <button
                  onClick={() => handleSend()}
                  disabled={aiStreaming || !input}
                  style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16, cursor: aiStreaming || !input ? 'not-allowed' : 'pointer' }}
                >送出</button>
                <button
                  onClick={handleRecordVoice}
                  disabled={aiStreaming}
                  style={{ padding: 16, borderRadius: '50%', border: 'none', background: (recording || autoVoiceLoop || recognizing) ? '#ff4d4d' : '#1877f2', color: '#fff', cursor: 'pointer', fontSize: 20 }}
                >
                  {(recording || autoVoiceLoop || recognizing) ? '停止' : '🎤'}
                </button>
              </div>
              {/* 電腦版：送出與麥克風按鈕在輸入框下方置中 */}
              <div className="chat-action-row-desktop" style={{ width: '100%', display: 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 16 }}>
                <button
                  onClick={() => handleSend()}
                  disabled={aiStreaming || !input}
                  style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16, cursor: aiStreaming || !input ? 'not-allowed' : 'pointer' }}
                >送出</button>
                <button
                  onClick={handleRecordVoice}
                  disabled={aiStreaming}
                  style={{ padding: 16, borderRadius: '50%', border: 'none', background: (recording || autoVoiceLoop || recognizing) ? '#ff4d4d' : '#1877f2', color: '#fff', cursor: 'pointer', fontSize: 20 }}
                >
                  {(recording || autoVoiceLoop || recognizing) ? '停止' : '🎤'}
                </button>
              </div>
              {/* 固定高度的提示區域，避免佈局閃動 */}
              <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {speechError && <p style={{ color: 'red', margin: 0 }}>{speechError}</p>}
                {!speechError && !input && !recognizing && !aiStreaming && !recording && !autoVoiceLoop &&
                  <p style={{ color: '#888', margin: 0, cursor: 'pointer' }} onClick={handleRecordVoice}>{t.tapToTalk}</p>
                }
                {!speechError && recognizing && <p style={{ color: '#888', margin: 0 }}>{t.recognizing}</p>}
                {!speechError && (input || aiStreaming || recording || autoVoiceLoop) && <p style={{ color: 'transparent', margin: 0 }}>佔位</p>}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#aaa' }}>
              <p>{t.companionPhrase[0]}{t.companionPhrase[1]}</p>
          </div>
        </footer>
      )}
      
      {/* Footer */}
      {window.innerWidth <= 768 ? (
        // 手機版 Footer - 複製自我的里程碑頁面
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
          featureName="AI 聊天"
        />
      )}
    </div>
  );
}

<style>{`
  @media (min-width: 768px) {
    .emotion-phrase-left {
      position: fixed;
      top: 32%;
      left: 2vw;
      z-index: 1001;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 400;
      text-shadow: 0 2px 8px #23294688;
      background: rgba(0,0,0,0.18);
      border-radius: 10px;
      padding: 6px 18px;
      backdrop-filter: blur(2px);
      box-shadow: 0 2px 12px #0002;
      display: block;
    }
    .emotion-phrase-right {
      position: fixed;
      top: 32%;
      right: 2vw;
      z-index: 1001;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 400;
      text-shadow: 0 2px 8px #23294688;
      background: rgba(0,0,0,0.18);
      border-radius: 10px;
      padding: 6px 18px;
      backdrop-filter: blur(2px);
      box-shadow: 0 2px 12px #0002;
      text-align: right;
      display: block;
    }
    .emotion-phrase-mobile-top, .emotion-phrase-mobile-bottom {
      display: none;
    }
  }
  @media (max-width: 767px) {
    .emotion-phrase-left, .emotion-phrase-right {
      display: none;
    }
    .emotion-phrase-mobile-top {
      position: fixed;
      top: 70px;
      left: 0;
      width: 100vw;
      z-index: 1001;
      color: #fff;
      font-size: 1.08rem;
      font-weight: 400;
      text-shadow: 0 2px 8px #23294688;
      background: rgba(0,0,0,0.18);
      border-radius: 10px;
      padding: 6px 18px;
      backdrop-filter: blur(2px);
      box-shadow: 0 2px 12px #0002;
      text-align: center;
      display: block;
    }
    .emotion-phrase-mobile-bottom {
      position: fixed;
      bottom: 60px;
      left: 0;
      width: 100vw;
      z-index: 1001;
      color: #fff;
      font-size: 1.08rem;
      font-weight: 400;
      text-shadow: 0 2px 8px #23294688;
      background: rgba(0,0,0,0.18);
      border-radius: 10px;
      padding: 6px 18px;
      backdrop-filter: blur(2px);
      box-shadow: 0 2px 12px #0002;
      text-align: center;
      display: block;
    }
  }
  .companion-phrase-left {
    position: absolute;
    top: 120px;
    left: 32px;
    color: rgba(255,255,255,0.85);
    font-size: 1.15rem;
    line-height: 1.6;
    max-width: 200px;
    text-shadow: 0 2px 8px #23294688;
    z-index: 1001;
    font-weight: 400;
    pointer-events: none;
    letter-spacing: 0.5px;
    background: rgba(0,0,0,0.10);
    border-radius: 10px;
    padding: 8px 16px;
    box-shadow: 0 2px 12px #0002;
    backdrop-filter: blur(2px);
  }
  @media (max-width: 767px) {
    .companion-phrase-left {
      position: static;
      margin: 12px auto 0 auto;
      left: unset;
      top: unset;
      display: block;
      text-align: center;
      max-width: 90vw;
      background: rgba(0,0,0,0.18);
    }
  }
  @media (min-width: 768px) {
    .change-avatar-desktop { display: block !important; }
    .change-avatar-mobile { display: none !important; }
    .ai-avatar-img-wrap { width: 40px !important; height: 40px !important; }
    .ai-name-desktop { max-width: 120px !important; }
    .chat-action-row-mobile { display: none !important; }
    .chat-action-row-desktop { display: flex !important; }
    .mobile-avatars-row { display: none !important; }
  }
  @media (max-width: 767px) {
    .change-avatar-desktop { display: none !important; }
    .change-avatar-mobile { display: block !important; }
    .ai-avatar-img-wrap { width: 40px !important; height: 40px !important; }
    .ai-name-desktop { max-width: 100px !important; }
    .chat-action-row-mobile { display: flex !important; }
    .chat-action-row-desktop { display: none !important; }
    .mobile-avatars-row { display: flex !important; }
  }
`}</style> 