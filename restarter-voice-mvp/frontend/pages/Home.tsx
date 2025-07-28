import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import app from '../src/firebaseConfig';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { TokenRenewalModal } from '../components/TokenRenewalModal';
import { useTestMode } from '../App';
import WeatherWidget from '../components/WeatherWidget';

import type { LanguageCode } from '../contexts/LanguageContext';

// 移除重複的 LANGS 定義，使用 LanguageContext 中的

const TEXT: Record<string, { slogan: string[]; desc: string; wall: string; friend: string; voice: string; ai: string; tts: string; chat: string; emotion: string; welcomeRegister: string; }> = {
  'zh-TW': {
    slogan: ['找回信任的起點，重新出發不孤單！'],
    desc: 'Restarter™ 重啟人生的平台，在這裡你絕不會被標籤，只被理解與支持。讓AI陪你對話、練習挑戰、交朋友，找到信任與改變的力量，你可以放心說出自己的故事與心情，這裡有理解與同行。',
    wall: '你可以放心說出自己的故事與心情，這裡有理解與同行。',
    friend: '交友區',
    voice: '即時語音輸入',
    ai: 'AI 風格回覆',
    tts: '擬真語音輸出',
    chat: '來聊天吧！',
    emotion: '情緒圖像實驗室',
    welcomeRegister: '歡迎註冊',
  },
  'zh-CN': {
    slogan: ['找回信任的起点，重新出发不孤单！'],
    desc: 'Restarter™ 重启人生的平台，在这里你绝不会被标签，只被理解与支持。让AI陪你对话、练习挑战、交朋友，找到信任与改变的力量，你可以放心说出自己的故事与心情，这里有理解与同行。',
    wall: '你可以放心说出自己的故事与心情，这里有理解与同行。',
    friend: '交友区',
    voice: '即时语音输入',
    ai: 'AI 风格回复',
    tts: '拟真语音输出',
    chat: '来聊天吧！',
    emotion: '情绪图像实验室',
    welcomeRegister: '欢迎注册',
  },
  'en': {
    slogan: ['Regain trust and start anew, you are never alone!'],
    desc: 'Restarter™ is a platform for restarting your life. Here, you will never be labeled, only understood and supported. Let AI accompany you in conversations, practice challenges, make friends, and find the power of trust and change. You can safely share your stories and feelings—here, you are understood and never alone.',
    wall: 'You can safely share your story and feelings here, where you will find understanding and companionship.',
    friend: 'Friend Match',
    voice: 'Voice Input',
    ai: 'AI Style Reply',
    tts: 'Realistic TTS',
    chat: "Let's Chat!",
    emotion: 'Emotion Visual Lab',
    welcomeRegister: 'Welcome Register',
  },
  'ja': {
    slogan: ['信頼を取り戻し、新たな一歩を踏み出そう！'],
    desc: 'Restarter™は人生を再出発するためのプラットフォームです。ここでは決してラベルを貼られることはなく、理解とサポートだけがあります。AIと一緒に対話し、挑戦を練習し、友達を作り、信頼と変化の力を見つけましょう。自分のストーリーや気持ちを安心して話せる場所、それがここです。',
    wall: 'ここでは安心して自分のストーリーや気持ちを話せます。理解と共感がここにあります。',
    friend: '友達マッチ',
    voice: '音声入力',
    ai: 'AIスタイル返信',
    tts: 'リアルTTS',
    chat: '話しましょう！',
    emotion: '感情ビジュアルラボ',
    welcomeRegister: '登録へようこそ',
  },
  'ko': {
    slogan: ['신뢰를 되찾고, 새롭게 시작하세요. 당신은 결코 혼자가 아닙니다!'],
    desc: 'Restarter™는 인생을 재시작하는 플랫폼입니다. 이곳에서는 결코 낙인찍히지 않고, 오직 이해와 지지만이 있습니다. AI와 함께 대화하고, 도전을 연습하며, 친구를 사귀고, 신뢰와 변화의 힘을 찾아보세요. 자신의 이야기와 감정을 안심하고 말할 수 있는 곳, 바로 여기입니다.',
    wall: '여기서는 자신의 이야기와 감정을 안심하고 말할 수 있습니다. 이곳에는 이해와 동행이 있습니다.',
    friend: '친구 매칭',
    voice: '음성 입력',
    ai: 'AI 스타일 답장',
    tts: '현실적인 TTS',
    chat: "채팅하자!",
    emotion: '감정 비주얼 랩',
    welcomeRegister: '가입 환영',
  },
  'th': {
    slogan: ['เริ่มต้นใหม่ด้วยความไว้วางใจ คุณไม่ได้อยู่คนเดียว!'],
    desc: 'Restarter™ คือแพลตฟอร์มสำหรับเริ่มต้นชีวิตใหม่ ที่นี่คุณจะไม่ถูกตัดสิน มีแต่ความเข้าใจและการสนับสนุน ให้ AI อยู่เป็นเพื่อนคุย ฝึกฝนความท้าทาย หาเพื่อนใหม่ และค้นพบพลังแห่งความไว้วางใจและการเปลี่ยนแปลง คุณสามารถพูดเรื่องราวและความรู้สึกของตัวเองได้อย่างสบายใจ ที่นี่มีแต่ความเข้าใจและเพื่อนร่วมทาง',
    wall: 'คุณสามารถพูดเรื่องราวและความรู้สึกของคุณได้อย่างสบายใจ ที่นี่มีความเข้าใจและเพื่อนร่วมทาง',
    friend: 'จับคู่เพื่อน',
    voice: 'ป้อนข้อมูลด้วยเสียง',
    ai: 'ตอบกลับสไตล์ AI',
    tts: 'TTS ที่สมจริง',
    chat: "มาคุยกันเถอะ!",
    emotion: 'ห้องทดลองภาพอารมณ์',
    welcomeRegister: 'ยินดีต้อนรับการลงทะเบียน',
  },
  'vi': {
    slogan: ['Tìm lại niềm tin, bắt đầu lại, bạn không bao giờ đơn độc!'],
    desc: 'Restarter™ là nền tảng để làm lại cuộc đời. Ở đây bạn sẽ không bao giờ bị gán nhãn, chỉ có sự thấu hiểu và hỗ trợ. Hãy để AI đồng hành cùng bạn trò chuyện, luyện tập, kết bạn và tìm thấy sức mạnh của niềm tin và sự thay đổi. Bạn có thể yên tâm chia sẻ câu chuyện và cảm xúc của mình, ở đây luôn có sự thấu hiểu và đồng hành.',
    wall: 'Bạn có thể yên tâm chia sẻ câu chuyện và cảm xúc của mình tại đây, nơi có sự thấu hiểu và đồng hành.',
    friend: 'Ghép bạn bè',
    voice: 'Nhập liệu bằng giọng nói',
    ai: 'Trả lời theo phong cách AI',
    tts: 'TTS thực tế',
    chat: "Hãy trò chuyện!",
    emotion: 'Phòng thí nghiệm hình ảnh cảm xúc',
    welcomeRegister: 'Chào mừng đăng ký',
  },
  'ms': {
    slogan: ['Temui semula kepercayaan, mulakan semula, anda tidak pernah keseorangan!'],
    desc: 'Restarter™ ialah platform untuk memulakan semula kehidupan. Di sini anda tidak akan pernah dilabel, hanya difahami dan disokong. Biarkan AI menemani anda berbual, berlatih, berkawan dan temui kekuatan kepercayaan dan perubahan. Anda boleh berkongsi kisah dan perasaan anda dengan tenang, di sini ada pemahaman dan teman seperjalanan.',
    wall: 'Anda boleh berkongsi kisah dan perasaan anda dengan tenang di sini, di mana ada pemahaman dan teman seperjalanan.',
    friend: 'Padanan Rakan',
    voice: 'Input Suara',
    ai: 'Balasan Gaya AI',
    tts: 'TTS Realistik',
    chat: "Jom Sembang!",
    emotion: 'Makmal Visual Emosi',
    welcomeRegister: 'Selamat Datang Daftar',
  },
  'la': {
    slogan: ['Fidem recupera et iterum incipe, numquam solus es!'],
    desc: 'Restarter™ est suggestum ad vitam iterum incipiendam. Hic numquam notaberis, sed tantum intelligetur et sustineberis. Sinite AI tecum colloqui, exercere, amicos facere, vim fiduciae et mutationis invenire.',
    wall: 'Hic tuto fabulas tuas et sensus tuos narrare potes: hic intellectus et comitatus invenies.',
    friend: 'Par Amicus',
    voice: 'Vox Input',
    ai: 'AI Stylus Responsio',
    tts: 'Verus TTS',
    chat: "Loquamur!",
    emotion: 'Emotion Visual Lab',
    welcomeRegister: 'Benevenite Registrare',
  },
};

const FRIEND_EMOJI: Record<string, string> = {
  'zh-TW': '🧑‍🤝‍🧑',
  'zh-CN': '🧑‍🤝‍🧑',
  'en': '🧑‍🤝‍🧑',
  'ja': '🧑‍🤝‍🧑',
  'ko': '🧑‍🤝‍🧑',
  'th': '🧑‍🤝‍🧑',
  'vi': '🧑‍🤝‍🧑',
  'ms': '🧑‍🤝‍🧑',
  'la': '🧑‍🤝‍🧑',
};

const SLOGAN2: Record<string, string> = {
  'zh-TW': '每一位更生人，都是世界的一員！',
  'zh-CN': '每一位更生人，都是世界的一员！',
  'en': 'Everyone deserves a place in the world!',
  'ja': 'すべての更生者は世界の一員です！',
  'ko': '모든 사람은 세상에 있을 자격이 있습니다!',
  'th': 'ทุกคนสมควรได้รับที่ในโลก!',
  'vi': 'Mọi người đều xứng đáng có một vị trí trên thế giới!',
  'ms': 'Setiap orang berhak mendapat tempat di dunia!',
  'la': 'Omnes locum in mundo merentur!',
};

const FOOTER_TEXT = {
  'zh-TW': { privacy: '隱私權政策', deletion: '資料刪除說明' },
  'zh-CN': { privacy: '隐私政策', deletion: '资料删除说明' },
  'en': { privacy: 'Privacy Policy', deletion: 'Data Deletion' },
  'ja': { privacy: 'プライバシーポリシー', deletion: 'データ削除について' },
  'ko': { privacy: '개인정보처리방침', deletion: '데이터 삭제 안내' },
  'th': { privacy: 'นโยบายความเป็นส่วนตัว', deletion: 'นโยบายการลบข้อมูล' },
  'vi': { privacy: 'Chính sách bảo mật', deletion: 'Chính sách xóa dữ liệu' },
  'ms': { privacy: 'Dasar Privasi', deletion: 'Dasar Pemadaman Data' },
  'la': { privacy: 'Consilium Privacy', deletion: 'Norma Deletionis Datae' },
};

const PROFILE_MANAGEMENT_TEXT = {
  'zh-TW': '個人管理中心',
  'zh-CN': '个人管理中心',
  'en': 'Profile Management',
  'ja': 'プロフィール管理',
  'ko': '프로필 관리',
  'th': 'จัดการโปรไฟล์',
  'vi': 'Quản lý hồ sơ',
  'ms': 'Pengurusan Profil',
  'la': 'Administratio Profili',
};

const MEMBER_BENEFITS_TEXT = {
  'zh-TW': '訂閱方案',
  'zh-CN': '订阅方案',
  'en': 'Subscription Plans',
  'ja': 'サブスクリプションプラン',
  'ko': '구독 플랜',
  'th': 'แผนการสมัครสมาชิก',
  'vi': 'Gói Đăng Ký',
  'ms': 'Pelan Langganan',
  'la': 'Plana Subscriptionis',
};

export default function Home() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const t = TEXT[lang];
  const featureBtnsRef = useRef<HTMLDivElement>(null);
  const chatBtnRef = useRef<HTMLButtonElement>(null);
  const [chatBtnMargin, setChatBtnMargin] = useState(0);
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLangBox, setShowLangBox] = useState(false);
  const [showLoginTip, setShowLoginTip] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionModalData, setSubscriptionModalData] = useState({
    title: '',
    message: '',
    requiredPlan: 'basic'
  });
  const { isTestMode } = useTestMode();
  
  // Token 續購彈跳窗狀態
  const [showTokenRenewalModal, setShowTokenRenewalModal] = useState(false);
  const [tokenRenewalData, setTokenRenewalData] = useState({
    currentPlan: 'basic',
    remainingDays: 0,
    usedTokens: 0,
    totalTokens: 0
  });


  // 新增：響應式螢幕寬度判斷
  const [isMobile, setIsMobile] = useState(() => {
    // 在伺服器端渲染時，window 可能不存在
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // MODULES 陣列（還原）
  const MODULES = [
    {
      key: 'echo-box',
      icon: '🎤',
      title: {
        'zh-TW': '心聲釋放',
        'zh-CN': '心声释放',
        'ja': '心の声を解放',
        'en': 'Voice Release',
        'ko': '마음의 소리 해방',
        'th': 'ปลดปล่อยเสียงในใจ',
        'vi': 'Giải Phóng Tiếng Lòng',
        'ms': 'Pelepasan Suara Hati',
        'la': 'Vox Liberatio'
      },
      desc: {
        'zh-TW': '你可盡情說出心裡對某些人事物的不滿，釋放後或許有解方，天下沒有不能解決的難題',
        'zh-CN': '你可尽情说出心里对某些人事物的不满，释放后或许有解方，天下没有不能解决的难题',
        'ja': '心の中の特定の人や物事への不満を自由に言い、解放後には解決策があるかもしれない、解決できない問題はない',
        'en': 'You can freely speak out your dissatisfaction with certain people or things, after release there may be a solution, there is no problem that cannot be solved',
        'ko': '마음속 특정 사람이나 사물에 대한 불만을 자유롭게 말하고, 해방 후에는 해결책이 있을지도 모르며, 해결할 수 없는 문제는 없다',
        'th': 'คุณสามารถพูดความไม่พอใจต่อคนหรือสิ่งต่างๆ ได้อย่างอิสระ หลังปลดปล่อยแล้วอาจมีวิธีแก้ไข ไม่มีปัญหาที่แก้ไขไม่ได้',
        'vi': 'Bạn có thể tự do nói ra sự bất mãn với những người hoặc sự việc cụ thể, sau khi giải phóng có thể có giải pháp, không có vấn đề nào không thể giải quyết',
        'ms': 'Anda boleh bebas mengucapkan ketidakpuasan terhadap orang atau perkara tertentu, selepas melepaskan mungkin ada penyelesaian, tiada masalah yang tidak dapat diselesaikan',
        'la': 'Libere dissatisfactionem cum hominibus vel rebus certis profer, post liberationem fortasse solutio est, nulla quaestio insolubilis est'
      },
      path: '/echo-box'
    },
    {
      key: 'restart-wall',
      icon: '🧱',
      title: {
        'zh-TW': '情緒重啟牆',
        'zh-CN': '情绪重启墙',
        'ja': '感情リスタートウォール',
        'en': 'Emotional Restart Wall',
        'ko': '감정 재시작 벽',
        'th': 'กำแพงรีสตาร์ทอารมณ์',
        'vi': 'Tường Khởi Động Lại Cảm Xúc',
        'ms': 'Dinding Restart Emosi',
        'la': 'Murus Restart Affectus'
      },
      desc: {
        'zh-TW': '舒暢分享心情，獲得支持與理解',
        'zh-CN': '舒畅分享心情，获得支持与理解',
        'ja': '気持ちを快く共有し、サポートと理解を得る',
        'en': 'Share feelings comfortably, get support and understanding',
        'ko': '편안하게 감정을 공유하고 지원과 이해를 받으세요',
        'th': 'แบ่งปันความรู้สึกอย่างสบายใจ รับการสนับสนุนและความเข้าใจ',
        'vi': 'Chia sẻ cảm xúc thoải mái, nhận được hỗ trợ và thấu hiểu',
        'ms': 'Kongsi perasaan dengan selesa, dapatkan sokongan dan pemahaman',
        'la': 'Sensus libere partiri, auxilium et intelligentiam accipe'
      },
      path: '/wall'
    },
    {
      key: 'my-story',
      icon: '📖',
      title: {
        'zh-TW': '我的里程碑',
        'zh-CN': '我的里程碑',
        'ja': '私のマイルストーン',
        'en': 'My Milestones',
        'ko': '내 이정표',
        'th': 'เหตุการณ์สำคัญของฉัน',
        'vi': 'Cột Mốc Của Tôi',
        'ms': 'Pencapaian Saya',
        'la': 'Mea Milestones'
      },
      desc: {
        'zh-TW': '記錄個人成長里程碑，見證改變歷程',
        'zh-CN': '记录个人成长里程碑，见证改变历程',
        'ja': '個人の成長マイルストーンを記録し、変化の過程を目撃',
        'en': 'Record personal growth milestones, witness the journey of change',
        'ko': '개인 성장의 이정표를 기록하고 변화의 여정을 목격하세요',
        'th': 'บันทึกเหตุการณ์สำคัญของการเติบโตส่วนบุคคล เป็นพยานในการเดินทางแห่งการเปลี่ยนแปลง',
        'vi': 'Ghi lại các cột mốc phát triển cá nhân, chứng kiến hành trình thay đổi',
        'ms': 'Rekod pencapaian pertumbuhan peribadi, saksikan perjalanan perubahan',
        'la': 'Milestones crescendi personalis inscribe, iter mutationis testare'
      },
      path: '/my-story'
    },
    {
      key: 'journal',
      icon: '🌳',
      title: {
        'zh-TW': '心情解鎖盒',
        'zh-CN': '心情解锁盒',
        'ja': '気持ちアンロックボックス',
        'en': 'Mood Unlock Box',
        'ko': '감정 언락 박스',
        'th': 'กล่องปลดล็อกอารมณ์',
        'vi': 'Hộp Mở Khóa Cảm Xúc',
        'ms': 'Kotak Buka Kunci Emosi',
        'la': 'Arca Unlock Affectus'
      },
      desc: {
        'zh-TW': '每天記錄心情，解鎖拼圖碎片，拼出完整的自己！',
        'zh-CN': '每天记录心情，解锁拼图碎片，拼出完整的自己！',
        'ja': '毎日気持ちを記録して、パズルのピースをアンロックし、完全な自分を完成させよう！',
        'en': 'Record your mood daily, unlock puzzle pieces, and piece together your complete self!',
        'ko': '매일 기분을 기록하고 퍼즐 조각을 열어 완전한 자신을 완성하세요!',
        'th': 'บันทึกอารมณ์ทุกวัน ปลดล็อกชิ้นส่วนจิ๊กซอว์ และต่อภาพตัวเองที่สมบูรณ์!',
        'vi': 'Ghi lại tâm trạng mỗi ngày, mở khóa các mảnh ghép, và ghép thành hình ảnh hoàn chỉnh của chính mình!',
        'ms': 'Catat perasaan setiap hari, buka kepingan teka-teki, dan lengkapkan diri anda yang sempurna!',
        'la': 'Cotidie animum inscribe, fragmenta aenigmatis solve, et te ipsum perfectum compone!'
      },
      path: '/journal'
    },
    {
      key: 'missions',
      icon: '🎯',
      title: {
        'zh-TW': '挑戰任務', 'zh-CN': '挑战任务', 'en': 'Challenge Missions', 'ja': 'ミッションに挑戦', 'ko': '임무 도전', 'th': 'ท้าทายภารกิจ', 'vi': 'Thử thách nhiệm vụ', 'ms': 'Cabaran Misi', 'la': 'Provocatio Missionum'
      },
      desc: {
        'zh-TW': '五站重啟路，讓你更堅強', 'zh-CN': '五站重启路，让你更坚强', 'en': 'Five-Station Restart Journey, Make You Stronger', 'ja': '五つのステーション再起動の道、あなたをより強くする', 'ko': '다섯 단계 재시작 여정, 당신을 더 강하게 만들어요', 'th': 'เส้นทางรีสตาร์ทห้าสถานี ทำให้คุณแข็งแกร่งขึ้น', 'vi': 'Hành trình khởi động lại năm trạm, làm cho bạn mạnh mẽ hơn', 'ms': 'Perjalanan Restart Lima Stesen, Membuat Anda Lebih Kuat', 'la': 'Iter Restart Quinque Stationum, Te Fortiorem Facit'
      },
      path: '/restart-missions'
    },
    {
      key: 'storywall',
      icon: '📖',
      title: {
        'zh-TW': '我是誰故事鏈', 'zh-CN': '我是誰故事鏈', 'ja': 'ストーリーウォール', 'en': 'Story Wall', 'ko': '스토리 월', 'th': 'กำแพงเรื่องราว', 'vi': 'Tường Truyện', 'ms': 'Dinding Cerita', 'la': 'Murus Fabularum'
      },
      desc: {
        'zh-TW': '分享故事，建立連結',
        'zh-CN': '分享故事，建立连接',
        'ja': 'ストーリーを共有し、つながりを築く',
        'en': 'Share Stories, Build Connections',
        'ko': '이야기를 공유하고 연결을 구축',
        'th': 'แบ่งปันเรื่องราว สร้างการเชื่อมต่อ',
        'vi': 'Chia sẻ câu chuyện, xây dựng kết nối',
        'ms': 'Kongsi cerita, bina hubungan',
        'la': 'Fabulas partiri, nexus construere'
      },
      path: '/storywall'
    },

    {
      key: 'skillbox',
      icon: '🛠️',
      title: {
        'zh-TW': '社會模擬所',
        'zh-CN': '技能方块',
        'ja': 'スキルボックス',
        'en': 'Skill Box',
        'ko': '스킬 박스',
        'th': 'กล่องทักษะ',
        'vi': 'Hộp Kỹ Năng',
        'ms': 'Kotak Kemahiran',
        'la': 'Arca Peritiae'
      },
      desc: {
        'zh-TW': '練習社會互動，解鎖成就', 'zh-CN': '练习社会互动，解锁成就', 'en': 'Practice social skills, unlock achievements', 'ja': '社会スキル練習で実績解除', 'ko': '사회적 기술 연습, 업적 잠금 해제', 'th': 'ฝึกฝนทักษะทางสังคม, ปลดล็อกความสำเร็จ', 'vi': 'Thực hành kỹ năng xã hội, mở khóa thành tích', 'ms': 'Latih kemahiran sosial, buka pencapaian', 'la': 'Practice social skills, unlock achievements'
      },
      path: '/skillbox'
    },
    {
      key: 'emotionRelease',
      icon: '🎮',
      title: {
        'zh-TW': '情緒發洩區',
        'zh-CN': '情绪发泄区',
        'ja': '感情発散エリア',
        'en': 'Emotion Release Zone',
        'ko': '감정 발산 구역',
        'th': 'พื้นที่ระบายอารมณ์',
        'vi': 'Khu Vực Giải Tỏa Cảm Xúc',
        'ms': 'Zon Pelepasan Emosi',
        'la': 'Zona Emotio Liberationis'
      },
      desc: {
        'zh-TW': '透過遊戲釋放壓力，找回平靜', 'zh-CN': '通过游戏释放压力，找回平静', 'en': 'Release stress through games, find peace', 'ja': 'ゲームでストレスを発散し、平静を取り戻す', 'ko': '게임으로 스트레스를 해소하고 평온을 찾으세요', 'th': 'ปลดปล่อยความเครียดผ่านเกม หาความสงบ', 'vi': 'Giải tỏa căng thẳng qua trò chơi, tìm lại bình yên', 'ms': 'Lepaskan tekanan melalui permainan, temui ketenangan', 'la': 'Libera tensionem per ludos, inveni pacem'
      },
      path: '/emotion-release'
    }
  ];

  useLayoutEffect(() => {
    if (featureBtnsRef.current && chatBtnRef.current) {
      const featureTop = featureBtnsRef.current.getBoundingClientRect().top;
      const chatBtnTop = chatBtnRef.current.getBoundingClientRect().top;
      const featureHeight = featureBtnsRef.current.getBoundingClientRect().height;
      const chatBtnHeight = chatBtnRef.current.getBoundingClientRect().height;
      setChatBtnMargin((featureTop + featureHeight) - (chatBtnTop + chatBtnHeight));
    }
  }, [lang]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [auth]);

  // 1. 新增 state 與 useEffect 處理語言下拉點擊空白自動關閉
  const langBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showLangBox) return;
    const handleClick = (e: MouseEvent) => {
      if (langBoxRef.current && !langBoxRef.current.contains(e.target as Node)) {
        setShowLangBox(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLangBox]);

  const handleFeature = (type: string) => {
    if (type === 'voice') {
      navigate('/voice');
    } else if (type === 'ai') {
      navigate('/ai');
    } else if (type === 'tts') {
      navigate('/tts');
    } else if (type === 'chat') {
      navigate('/chat');
    } else if (type === 'friend') {
      navigate('/friend');
    } else if (type === 'emotion') {
      navigate('/EmotionVisualLab');
    } else if (type === 'storywall') {
      navigate('/storywall');
    }
  };

  // 1. 多語言登出與互助實驗室
  const LOGOUT_TEXT = {
    'zh-TW': '登出',
    'zh-CN': '登出',
    'en': 'Logout',
    'ja': 'ログアウト',
    'ko': '로그아웃',
    'th': 'ออกจากระบบ',
    'vi': 'Đăng xuất',
    'ms': 'Keluar',
    'la': 'Exire',
  };
  const MUTUAL_HELP_TEXT = {
    'zh-TW': '互相幫助&合作實驗室',
    'zh-CN': '互相帮助&合作实验室',
    'en': 'Mutual Help & Collaboration Lab',
    'ja': '相互支援＆協力ラボ',
    'ko': '상호도움&협력실험실',
    'th': 'ห้องทดลองช่วยเหลือและร่วมมือ',
    'vi': 'Phòng thí nghiệm Hỗ trợ & Hợp tác',
    'ms': 'Makmal Bantuan & Kerjasama',
    'la': 'Laboratorium Auxilii Mutui et Cooperationis',
  };
  const MUTUAL_HELP_DESC = {
    'zh-TW': '當跌倒再起，我們需要相互扶持！',
    'zh-CN': '在重新站起来的路上，我们需要彼此扶持！',
    'en': 'When we fall and rise again, we need to support each other!',
    'ja': '転んで立ち上がるとき、私たちはお互いに支え合う必要があります！',
    'ko': '넘어졌다가 다시 일어설 때, 우리는 서로를 도와야 합니다!',
    'th': 'เมื่อเราล้มและลุกขึ้นใหม่ เราต้องช่วยเหลือกัน!',
    'vi': 'Khi vấp ngã và đứng dậy, chúng ta cần hỗ trợ lẫn nhau!',
    'ms': 'Ketika kita jatuh dan bangun semula, kita perlu saling membantu!',
    'la': 'Cum cadimus et resurgimus, mutuo auxilio egemus!',
  };

  // 多語言提示內容
  const LOGIN_TIP_TEXT = {
    'zh-TW': {
      title: '請先註冊/登入才能使用此功能',
      btn: '前往註冊/登入',
      close: '關閉',
    },
    'zh-CN': {
      title: '请先注册/登录才能使用此功能',
      btn: '前往注册/登录',
      close: '关闭',
    },
    'en': {
      title: 'Please register/login to use this feature',
      btn: 'Go to Register/Login',
      close: 'Close',
    },
    'ja': {
      title: 'ご利用には登録/ログインが必要です',
      btn: '登録/ログインへ',
      close: '閉じる',
    },
    'ko': {
      title: '이 기능을 사용하려면 가입/로그인 해주세요',
      btn: '가입/로그인으로 이동',
      close: '닫기',
    },
    'th': {
      title: 'กรุณาสมัคร/เข้าสู่ระบบก่อนใช้ฟีเจอร์นี้',
      btn: 'ไปที่สมัคร/เข้าสู่ระบบ',
      close: 'ปิด',
    },
    'vi': {
      title: 'Vui lòng đăng ký/đăng nhập để sử dụng chức năng này',
      btn: 'Đến đăng ký/đăng nhập',
      close: 'Đóng',
    },
    'ms': {
      title: 'Sila daftar/log masuk untuk menggunakan ciri ini',
      btn: 'Pergi ke Daftar/Log Masuk',
      close: 'Tutup',
    },
    'la': {
      title: 'Quaeso registra/aperi ut hoc munus utaris',
      btn: 'Ad registra/login',
      close: 'Claude',
    },
  };
  const tipText = LOGIN_TIP_TEXT[lang];

  // 改寫 feature 按鈕 onClick，檢查登入和訂閱權限
  const handleFeatureWithAuth = async (cb: () => void, feature?: string) => {
    if (!user) {
      setShowLoginTip(true);
      return;
    }

    // 測試模式：跳過所有權限檢查
    if (isTestMode) {
      cb();
      return;
    }

    // 如果有指定功能，檢查訂閱權限
    if (feature) {
      try {
        const response = await fetch('/api/subscription/check-permission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            feature,
          }),
        });

        if (!response.ok) {
          throw new Error('權限檢查失敗');
        }

        const result = await response.json();
        
        if (!result.allowed) {
          // 檢查是否為 Token 續購情況
          if (result.canRenew) {
            setTokenRenewalData({
              currentPlan: result.currentPlan,
              remainingDays: result.remainingDays,
              usedTokens: result.usedTokens,
              totalTokens: result.totalTokens
            });
            setShowTokenRenewalModal(true);
          } else {
            // 顯示訂閱提示模態框
            setSubscriptionModalData({
              title: '功能需要升級',
              message: result.reason || '此功能需要升級訂閱才能使用',
              requiredPlan: result.requiredPlan || 'basic'
            });
            setShowSubscriptionModal(true);
          }
          return;
        }
      } catch (error) {
        console.error('權限檢查錯誤:', error);
        // 如果檢查失敗，仍然允許使用功能
      }
    }

    cb();
  };

  if (!authChecked) {
    return <div style={{textAlign:'center',marginTop:'30vh',fontSize:24}}>載入中...</div>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 響應式適配：根據 isMobile 狀態切換 */}
      {isMobile ? (
        // 手機版頂部導航
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px #0001' }}>
          {/* 左側：LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/ctx-logo.png" alt="logo" style={{ width: 72, height: 72, cursor: 'pointer' }} onClick={() => navigate('/')} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#6B5BFF' }}>Restarter™</span>
          </div>
          
          {/* 右側：用戶資訊和按鈕 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                <img src={user.photoURL || '/ctx-logo.png'} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #6B5BFF' }} />
                <span style={{ color: '#6B5BFF', fontWeight: 600, fontSize: 12, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.displayName || user.email || '用戶'}</span>
                <button className="topbar-btn" onClick={async () => { await signOut(auth); }} style={{ background: '#fff', color: '#ff6347', border: '1px solid #ff6347', borderRadius: 6, fontWeight: 600, fontSize: 12, padding: '4px 8px' }}>{LOGOUT_TEXT[lang]}</button>
              </>
            ) : (
              <button className="topbar-btn" onClick={() => navigate('/register')} style={{ background: '#fff', color: '#1976d2', border: '1px solid #1976d2', borderRadius: 6, fontWeight: 600, fontSize: 12, padding: '4px 8px' }}>{lang==='zh-TW'?'註冊':'zh-CN'===lang?'注册':'en'===lang?'Register':'ja'===lang?'登録':'ko'===lang?'가입':'th'===lang?'สมัคร':'vi'===lang?'Đăng ký':'ms'===lang?'Daftar':'Registrare'}</button>
            )}
            <LanguageSelector style={{ width: '80px', fontSize: 14, padding: '6px 10px' }} />

          </div>
        </div>
      ) : (
        // 桌面版頂部導航
        <div style={{ position: 'fixed', top: 24, right: 36, zIndex: 9999, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 18, pointerEvents: 'auto', width: '100%', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 18, marginRight: 24 }}>
            <button 
              className="topbar-btn" 
              onClick={() => navigate('/about')} 
              style={{ background: '#fff', color: '#6B5BFF', border: '2px solid #6B5BFF', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '8px 14px', minWidth: 120 }}
              aria-label={lang==='zh-TW'?'了解 Restarter 平台':'zh-CN'===lang?'了解 Restarter 平台':'en'===lang?'Learn about Restarter platform':'ja'===lang?'Restarter プラットフォームについて':'ko'===lang?'Restarter 플랫폼에 대해 알아보기':'th'===lang?'เรียนรู้เกี่ยวกับแพลตฟอร์ม Restarter':'vi'===lang?'Tìm hiểu về nền tảng Restarter':'ms'===lang?'Ketahui tentang platform Restarter':'Cognosce de suggestum Restarter'}
              role="button"
            >
              {lang==='zh-TW'?'🧬 Restarter™｜我們是誰':'zh-CN'===lang?'🧬 Restarter™｜我们是谁':'en'===lang?'🧬 Restarter™｜Who We Are':'ja'===lang?'🧬 Restarter™｜私たちについて':'ko'===lang?'🧬 Restarter™｜우리는 누구인가':'th'===lang?'🧬 Restarter™｜เราเป็นใคร':'vi'===lang?'🧬 Restarter™｜Chúng tôi là ai':'ms'===lang?'🧬 Restarter™｜Siapa Kami':'🧬 Restarter™｜Quis sumus'}
            </button>
            <button 
              className="topbar-btn" 
              onClick={() => navigate('/feedback')} 
              style={{ background: '#fff', color: '#6B5BFF', border: '2px solid #6B5BFF', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '8px 14px', minWidth: 140 }}
              aria-label={lang==='zh-TW'?'提供意見和建議':'zh-CN'===lang?'提供意见和建议':'en'===lang?'Provide feedback and suggestions':'ja'===lang?'ご意見やご提案を提供':'ko'===lang?'의견과 제안 제공':'th'===lang?'ให้ข้อเสนอแนะและคำแนะนำ':'vi'===lang?'Cung cấp phản hồi và đề xuất':'ms'===lang?'Berikan maklum balas dan cadangan':'Praebe consilia et suggestiones'}
              role="button"
            >
              {lang==='zh-TW'?'💬 意見箱｜我們想聽你說':'zh-CN'===lang?'💬 意见箱｜我们想听你说':'en'===lang?'💬 Feedback｜We Want to Hear You':'ja'===lang?'💬 ご意見箱｜あなたの声を聞かせて':'ko'===lang?'💬 피드백｜여러분의 의견을 듣고 싶어요':'th'===lang?'💬 กล่องความคิดเห็น｜เราอยากฟังคุณ':'vi'===lang?'💬 Hộp góp ý｜Chúng tôi muốn lắng nghe bạn':'ms'===lang?'💬 Kotak Maklum Balas｜Kami ingin mendengar anda':'💬 Arca Consilii｜Te audire volumus'}
            </button>
            <button 
              className="topbar-btn" 
              onClick={() => navigate('/token-test')} 
              style={{ background: '#fff', color: '#ff6b6b', border: '2px solid #ff6b6b', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '8px 14px', minWidth: 120 }}
              aria-label="Token 消耗測試"
              role="button"
            >
              🧪 Token 測試
            </button>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={user.photoURL || '/ctx-logo.png'} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #90caf9' }} />
                  <span style={{ color: '#1976d2', fontWeight: 700, fontSize: 16 }}>{user.displayName || user.email || '用戶'}</span>
                  <button className="topbar-btn" onClick={async () => { await signOut(auth); }} style={{ background: '#fff', color: '#ff6347', border: '2px solid #ffb4a2', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '8px 14px', marginLeft: 6 }}>{LOGOUT_TEXT[lang]}</button>

                </div>
              </>
            ) : (
              <button className="topbar-btn" onClick={() => navigate('/register')} style={{ background: '#fff', color: '#1976d2', border: '2px solid #90caf9', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '8px 10px', minWidth: 90 }}>{lang==='zh-TW'?'註冊/登入':'zh-CN'===lang?'注册/登录':'en'===lang?'Register / Login':'ja'===lang?'登録/ログイン':'ko'===lang?'가입/로그인':'th'===lang?'สมัคร/เข้าสู่ระบบ':'vi'===lang?'Đăng ký/Đăng nhập':'ms'===lang?'Daftar / Log Masuk':'Registrare / Login'}</button>
            )}
          </div>
          {/* 語言選擇按鈕，靠右且寬度縮短，點擊彈出小框 */}
          <div style={{ position: 'relative', display: 'inline-block' }} ref={langBoxRef}>
            <button
              className="topbar-btn"
              style={{
                background: '#6B5BFF',
                color: '#fff',
                border: '2px solid #6B5BFF',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                padding: '8px 10px',
                minWidth: 90,
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onClick={() => setShowLangBox(v => !v)}
            >
              {lang === 'zh-TW' ? '繁中' : lang === 'zh-CN' ? '简中' : lang === 'en' ? 'English' : lang === 'ja' ? '日本語' : lang === 'ko' ? '한국어' : lang === 'th' ? 'ไทย' : lang === 'vi' ? 'Tiếng Việt' : lang === 'ms' ? 'Bahasa Melayu' : 'Latin'}
              <span style={{ marginLeft: 6 }}>▼</span>
            </button>
            {showLangBox && (
              <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1.5px solid #6B5BFF', borderRadius: 8, boxShadow: '0 4px 16px #0002', zIndex: 9999, minWidth: 120 }}>
                {['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'th', 'vi', 'ms', 'la'].map(l => (
                  <div key={l} style={{ padding: '10px 18px', cursor: 'pointer', color: l === lang ? '#6B5BFF' : '#232946', fontWeight: l === lang ? 700 : 500, background: l === lang ? '#f3f0ff' : '#fff' }} onClick={() => { setLang(l as LanguageCode); setShowLangBox(false); }}>
                    {l === 'zh-TW' ? '繁中' : l === 'zh-CN' ? '简中' : l === 'en' ? 'English' : l === 'ja' ? '日本語' : l === 'ko' ? '한국어' : l === 'th' ? 'ไทย' : l === 'vi' ? 'Tiếng Việt' : 'Latin'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {isMobile ? (
        // 手機版主內容
        <div style={{ width: '100vw', minHeight: '100vh', background: `url('/plains.png') center center/cover no-repeat`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 120 }}>
          
          {/* 手機版天氣組件 */}
          <div style={{ width: '100%', padding: '0 16px', marginBottom: 16 }}>
            <WeatherWidget />
          </div>
          
          {/* 手機版主標題區域 */}
          <div style={{ width: '100%', padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 900, color: '#232946', fontSize: 16, lineHeight: 1.2, letterSpacing: 0.3, textShadow: '1px 2px 8px #fff', whiteSpace: 'nowrap' }}>
                {lang === 'zh-TW' ? '找回信任的起點，重新出發不孤單！' : 
                 lang === 'zh-CN' ? '找回信任的起点，重新出发不孤单！' : 
                 lang === 'en' ? 'Regain trust and start anew, you are never alone!' : 
                 lang === 'ja' ? '信頼を取り戻し、新たな一歩を踏み出そう！' : 
                 lang === 'ko' ? '신뢰를 되찾고, 새롭게 시작하세요. 당신은 결코 혼자가 아닙니다!' : 
                 lang === 'th' ? 'เริ่มต้นใหม่ด้วยความไว้วางใจ คุณไม่ได้อยู่คนเดียว!' : 
                 lang === 'vi' ? 'Tìm lại niềm tin, bắt đầu lại, bạn không bao giờ đơn độc!' : 
                 lang === 'ms' ? 'Temui semula kepercayaan, mulakan semula, anda tidak pernah keseorangan!' : 
                 'Fidem recupera et iterum incipe, numquam solus es!'}
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12, textShadow: '0 2px 8px #232946' }}>
              <span style={{ color: '#6B5BFF' }}>Restarter™</span> Global Platform
            </h1>
            <div style={{ marginBottom: 20 }}>
              <span style={{ color: '#232946', fontWeight: 500, fontSize: 14, lineHeight: 1.6 }}>
                {lang === 'zh-TW'
                  ? 'Restarter™ 重啟人生的平台，在這裡你絕不會被標籤，只被理解與支持。讓AI陪你對話、練習挑戰、交朋友，找到信任與改變的力量，你可以放心說出自己的故事與心情，釋放不滿有解方，天下沒有解決不了的難題。'
                  : lang === 'zh-CN'
                  ? 'Restarter™ 重启人生的平台，在这里你绝不会被标签，只被理解与支持。让AI陪你对话、练习挑战、交朋友，找到信任与改变的力量，你可以放心说出自己的故事与心情，释放不满有解方，天下没有解决不了的难题。'
                  : lang === 'en'
                  ? 'Restarter™ is a platform for restarting your life. Here, you will never be labeled, only understood and supported.'
                  : lang === 'ja'
                  ? 'Restarter™ は人生を再起動するためのプラットフォームです。ここでは決してレッテルを貼られることはなく、理解とサポートだけが得られます。'
                  : lang === 'ko'
                  ? 'Restarter™는 인생을 재시작하는 플랫폼입니다. 이곳에서는 결코 낙인찍히지 않고, 오직 이해와 지지를 받습니다.'
                  : lang === 'th'
                  ? 'Restarter™ คือแพลตฟอร์มสำหรับเริ่มต้นชีวิตใหม่ ที่นี่คุณจะไม่ถูกตัดสิน มีแต่ความเข้าใจและการสนับสนุน'
                  : 'Restarter™ suggestum ad vitam iterum incipiendam est. Hic numquam notaberis, sed tantum intelligetur et sustineberis.'}
              </span>
            </div>
          </div>
          
          {/* 社會融入度評估按鈕 */}
          <div style={{ width: '100%', padding: '0 16px', marginBottom: '16px', position: 'relative' }}>
            <button
              onClick={() => handleFeatureWithAuth(() => navigate('/social-integration'))}
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
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 91, 255, 0.4)';
                const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                if (tooltip) tooltip.style.opacity = '1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(107, 91, 255, 0.3)';
                const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                if (tooltip) tooltip.style.opacity = '0';
              }}
            >
              <span style={{ fontSize: '18px' }}>📊</span>
              {lang === 'zh-TW' ? '社會融入度評估' :
               lang === 'zh-CN' ? '社会融入度评估' :
               lang === 'ja' ? '社会統合度評価' :
               lang === 'en' ? 'Social Integration Assessment' :
               lang === 'ko' ? '사회 통합도 평가' :
               lang === 'th' ? 'การประเมินการผสมผสานทางสังคม' :
               lang === 'vi' ? 'Đánh Giá Hòa Nhập Xã Hội' :
               lang === 'ms' ? 'Penilaian Integrasi Sosial' :
               'Aestimatio Integrationis Socialis'}
            </button>
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#232946',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '500',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              opacity: '0',
              transition: 'opacity 0.3s ease',
              zIndex: 1000,
              pointerEvents: 'none',
              maxWidth: '200px',
              marginBottom: '8px'
            }}>
              {lang === 'zh-TW' ? '評估個人社會融入度，獲得專業建議和改善方向' :
               lang === 'zh-CN' ? '评估个人社会融入度，获得专业建议和改善方向' :
               lang === 'ja' ? '個人の社会統合度を評価し、専門的なアドバイスと改善方向を獲得' :
               lang === 'en' ? 'Assess personal social integration, get professional advice and improvement direction' :
               lang === 'ko' ? '개인 사회 통합도를 평가하고 전문적인 조언과 개선 방향을 얻으세요' :
               lang === 'th' ? 'ประเมินการผสมผสานทางสังคมส่วนบุคคล รับคำแนะนำจากผู้เชี่ยวชาญและทิศทางการปรับปรุง' :
               lang === 'vi' ? 'Đánh giá mức độ hòa nhập xã hội cá nhân, nhận lời khuyên chuyên môn và hướng cải thiện' :
               lang === 'ms' ? 'Nilai integrasi sosial peribadi, dapatkan nasihat profesional dan arah penambahbaikan' :
               'Aestima integrationem socialem personalem, consilium professionalem et directionem meliorationis accipe'}
            </div>
          </div>
          
          {/* 手機版功能按鈕 */}
          <div style={{ width: '100%', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 第一行：交友區 + 來聊天吧 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <button 
                className="feature-btn" 
                style={{ flex: 1, minWidth: 'calc(50% - 4px)', padding: '16px 8px', borderRadius: 12, border: '2px solid #6B5BFF', background: '#fff', color: '#6B5BFF', fontWeight: 700, fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }} 
                onClick={() => handleFeatureWithAuth(() => navigate('/friend'))}
              >
                <span style={{ fontSize: 20 }}>{FRIEND_EMOJI[lang]}</span>
                <span style={{ fontSize: 12, textAlign: 'center' }}>{t.friend}</span>
              </button>
              <button
                className="feature-btn"
                style={{
                  flex: 1,
                  minWidth: 'calc(50% - 4px)',
                  padding: '16px 8px',
                  borderRadius: 12,
                  border: '2px solid #6B5BFF',
                  background: '#fff',
                  color: '#6B5BFF',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
                onClick={() => handleFeatureWithAuth(() => handleFeature('chat'), 'aiChat')}
              >
                <span style={{ fontSize: 20 }}>💬</span>
                <span style={{ fontSize: 12, textAlign: 'center' }}>{t.chat}</span>
              </button>
            </div>
            
            {/* 第二行：每2個一行排列功能按鈕 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {MODULES.slice(0, 2).map(m => (
                <button 
                  key={m.key} 
                  className="feature-btn" 
                  style={{ flex: 1, minWidth: 'calc(50% - 4px)', padding: '16px 8px', borderRadius: 12, border: '2px solid #6B5BFF', background: '#fff', color: '#6B5BFF', fontWeight: 700, fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }} 
                  onClick={() => handleFeatureWithAuth(() => navigate(m.path))}
                >
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, textAlign: 'center' }}>{m.title[lang]}</span>
                </button>
              ))}
            </div>
            
            {/* 第三行：每2個一行排列功能按鈕 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {MODULES.slice(2, 4).map(m => (
                <button 
                  key={m.key} 
                  className="feature-btn" 
                  style={{ flex: 1, minWidth: 'calc(50% - 4px)', padding: '16px 8px', borderRadius: 12, border: '2px solid #6B5BFF', background: '#fff', color: '#6B5BFF', fontWeight: 700, fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }} 
                  onClick={() => handleFeatureWithAuth(() => navigate(m.path))}
                >
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, textAlign: 'center' }}>{m.title[lang]}</span>
                </button>
              ))}
            </div>
            
            {/* 第四行：社會模擬所 + 互相幫助&合作實驗室 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {MODULES.slice(4).map(m => (
                <button 
                  key={m.key} 
                  className="feature-btn" 
                  style={{ flex: 1, minWidth: 'calc(50% - 4px)', padding: '16px 8px', borderRadius: 12, border: '2px solid #6B5BFF', background: '#fff', color: '#6B5BFF', fontWeight: 700, fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }} 
                  onClick={() => handleFeatureWithAuth(() => navigate(m.path))}
                >
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, textAlign: 'center' }}>{m.title[lang]}</span>
                </button>
              ))}
              <button
                className="feature-btn"
                style={{
                  flex: 1,
                  minWidth: 'calc(50% - 4px)',
                  padding: '16px 8px',
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, #ffe0b2 0%, #ffb74d 100%)',
                  color: '#b85c00',
                  border: '2px solid #ffb74d',
                  fontWeight: 900,
                  fontSize: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
                onClick={() => handleFeatureWithAuth(() => navigate('/HelpLab'))}
              >
                <span style={{ fontSize: 20 }}>🧪</span>
                <span style={{ fontSize: 12, textAlign: 'center' }}>{MUTUAL_HELP_TEXT[lang]}</span>
              </button>
            </div>
          </div>
          
          {/* 手機版額外按鈕 */}
          <div style={{ width: '100%', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box' }}>
            <a href="/plans" style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#6B5BFF', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '2px solid #6B5BFF', cursor: 'pointer', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>{MEMBER_BENEFITS_TEXT[lang]}</a>
          </div>
        </div>
      ) : (
        // 桌面版主內容
        <div style={{ width: '100vw', minHeight: '100vh', background: `url('/plains.png') center center/cover no-repeat`, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
          {/* 左側內容：主標題、說明、功能按鈕 */}
          <div className="home-left-col left-relative" style={{ flex: 1, minWidth: 320, maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '48px 0 0 0', zIndex: 2 }}>
            {/* LOGO、標語、主標題、說明、功能按鈕等原本內容 */}
            <div className="fixed-logo-box" style={{ position: 'fixed', top: 16, left: 42, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 10000, paddingTop: 0, marginTop: 0 }}>
              <img src="/ctx-logo.png" className="fixed-logo-img" style={{ marginBottom: 0, width: 182, height: 182, cursor: 'pointer', marginTop: '-40px' }} onClick={() => navigate('/')} />
            </div>
            <div className="column-content" style={{ justifyContent: 'center', alignItems: 'center', height: '100%', paddingTop: 120 }}>
              
              {/* 恢復主標語、主標題、說明等重要文字內容 */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 900,
                  margin: '0 auto 12px auto',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    color: '#232946',
                    fontSize: 20,
                    lineHeight: 1.2,
                    letterSpacing: 0.5,
                    textShadow: '2px 4px 12px #fff, 0 2px 8px #23294688',
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lang === 'zh-TW' ? '找回信任的起點，重新出發不孤單！' : 
                   lang === 'zh-CN' ? '找回信任的起点，重新出发不孤单！' : 
                   lang === 'en' ? 'Regain trust and start anew, you are never alone!' : 
                   lang === 'ja' ? '信頼を取り戻し、新たな一歩を踏み出そう！' : 
                   lang === 'ko' ? '신뢰를 되찾고, 새롭게 시작하세요. 당신은 결코 혼자가 아닙니다!' : 
                   lang === 'th' ? 'เริ่มต้นใหม่ด้วยความไว้วางใจ คุณไม่ได้อยู่คนเดียว!' : 
                   lang === 'vi' ? 'Tìm lại niềm tin, bắt đầu lại, bạn không bao giờ đơn độc!' : 
                   lang === 'ms' ? 'Temui semula kepercayaan, mulakan semula, anda tidak pernah keseorangan!' : 
                   'Fidem recupera et iterum incipe, numquam solus es!'}
                </span>
              </div>
              <h1 className="main-title" style={{ position: 'relative', left: '0px', fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 18, textShadow: '0 2px 12px #232946, 0 4px 24px #0008' }}>
                <span style={{ color: '#6B5BFF' }}>Restarter™</span> Global Platform
              </h1>
              <div style={{ width: '100%', textAlign: 'center', margin: '0 auto', marginBottom: 24 }}>
                <span style={{ color: '#232946', fontWeight: 500, fontSize: 16, lineHeight: 1.7, letterSpacing: 0.5 }}>
                  {lang === 'zh-TW'
                    ? 'Restarter™ 重啟人生的平台，在這裡你絕不會被標籤，只被理解與支持。讓AI陪你對話、練習挑戰、交朋友，找到信任與改變的力量，你可以放心說出自己的故事與心情，釋放不滿有解方，天下沒有解決不了的難題。'
                    : lang === 'zh-CN'
                    ? 'Restarter™ 重启人生的平台，在这里你绝不会被标签，只被理解与支持。让AI陪你对话、练习挑战、交朋友，找到信任与改变的力量，你可以放心说出自己的故事与心情，释放不满有解方，天下没有解决不了的难题。'
                    : lang === 'en'
                    ? 'Restarter™ is a platform for restarting your life. Here, you will never be labeled, only understood and supported. Let AI accompany you in conversations, practice challenges, make friends, and find the power of trust and change. You can safely share your stories and feelings—here, you are understood and never alone.'
                    : lang === 'ja'
                    ? 'Restarter™ は人生を再起動するためのプラットフォームです。ここでは決してレッテルを貼られることはなく、理解とサポートだけが得られます。AIと一緒に会話したり、チャレンジを練習したり、友達を作ったりして、信頼と変化の力を見つけましょう。自分のストーリーや気持ちを安心して話せる場所、それがここです。'
                    : lang === 'ko'
                    ? 'Restarter™는 인생을 재시작하는 플랫폼입니다. 이곳에서는 결코 낙인찍히지 않고, 오직 이해와 지지를 받습니다. AI와 대화하고, 도전을 연습하고, 친구를 사귀며 신뢰와 변화의 힘을 찾아보세요. 자신의 이야기와 감정을 안심하고 말할 수 있는 곳, 바로 여기입니다.'
                    : lang === 'th'
                    ? 'Restarter™ คือแพลตฟอร์มสำหรับเริ่มต้นชีวิตใหม่ ที่นี่คุณจะไม่ถูกตัดสิน มีแต่ความเข้าใจและการสนับสนุน ให้ AI อยู่เป็นเพื่อนคุย ฝึกฝนความท้าทาย หาเพื่อนใหม่ และค้นพบพลังแห่งความไว้วางใจและการเปลี่ยนแปลง คุณสามารถพูดเรื่องราวและความรู้สึกของตัวเองได้อย่างสบายใจ ที่นี่มีแต่ความเข้าใจและเพื่อนร่วมทาง'
                    : 'Restarter™ suggestum ad vitam iterum incipiendam est. Hic numquam notaberis, sed tantum intelligetur et sustineberis. Sine AI tecum colloquere, provocationes exerce, amicos invenias, fidem et mutationis vim reperias. Historias et sensus tuos tuto narrare potes, hic est intelligentia et comitatus.'}
                </span>
              </div>
              
              {/* 桌面版社會融入度評估按鈕 */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
                <button
                  onClick={() => handleFeatureWithAuth(() => navigate('/social-integration'))}
                  style={{
                    background: 'linear-gradient(135deg, #6B5BFF 0%, #5A4FCF 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '600',
                    boxShadow: '0 4px 16px rgba(107, 91, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 91, 255, 0.4)';
                    const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(107, 91, 255, 0.3)';
                    const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '0';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>📊</span>
                  {lang === 'zh-TW' ? '社會融入度評估' :
                   lang === 'zh-CN' ? '社会融入度评估' :
                   lang === 'ja' ? '社会統合度評価' :
                   lang === 'en' ? 'Social Integration Assessment' :
                   lang === 'ko' ? '사회 통합도 평가' :
                   lang === 'th' ? 'การประเมินการผสมผสานทางสังคม' :
                   lang === 'vi' ? 'Đánh Giá Hòa Nhập Xã Hội' :
                   lang === 'ms' ? 'Penilaian Integrasi Sosial' :
                   'Aestimatio Integrationis Socialis'}
                </button>
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#232946',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  opacity: '0',
                  transition: 'opacity 0.3s ease',
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}>
                  {lang === 'zh-TW' ? '評估個人社會融入度，獲得專業建議和改善方向' :
                   lang === 'zh-CN' ? '评估个人社会融入度，获得专业建议和改善方向' :
                   lang === 'ja' ? '個人の社会統合度を評価し、専門的なアドバイスと改善方向を獲得' :
                   lang === 'en' ? 'Assess personal social integration, get professional advice and improvement direction' :
                   lang === 'ko' ? '개인 사회 통합도를 평가하고 전문적인 조언과 개선 방향을 얻으세요' :
                   lang === 'th' ? 'ประเมินการผสมผสานทางสังคมส่วนบุคคล รับคำแนะนำจากผู้เชี่ยวชาญและทิศทางการปรับปรุง' :
                   lang === 'vi' ? 'Đánh giá mức độ hòa nhập xã hội cá nhân, nhận lời khuyên chuyên môn và hướng cải thiện' :
                   lang === 'ms' ? 'Nilai integrasi sosial peribadi, dapatkan nasihat profesional dan arah penambahbaikan' :
                   'Aestima integrationem socialem personalem, consilium professionalem et directionem meliorationis accipe'}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 18, justifyContent: 'center', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center' }}>
                  <button 
                    className="feature-btn" 
                    style={{ fontSize: 18, padding: '24px 24px', minWidth: 160, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, justifyContent: 'center' }} 
                    onClick={() => handleFeatureWithAuth(() => navigate('/friend'), 'userInteraction')}
                    aria-label={lang === 'zh-TW' ? '進入交友區，尋找新朋友，建立支持圈' : lang === 'zh-CN' ? '进入交友区，寻找新朋友，建立支持圈' : lang === 'en' ? 'Enter friend matching area to find new friends and build support circle' : lang === 'ja' ? '友達マッチングエリアに入って新しい友達を見つけ、サポートサークルを築く' : lang === 'ko' ? '친구 매칭 영역으로 이동하여 새로운 친구를 찾고 지원 서클을 구축' : lang === 'th' ? 'เข้าสู่พื้นที่จับคู่เพื่อนเพื่อหาเพื่อนใหม่และสร้างวงกลมสนับสนุน' : lang === 'vi' ? 'Vào khu vực ghép bạn bè để tìm bạn mới và xây dựng vòng tròn hỗ trợ' : lang === 'ms' ? 'Masuk ke kawasan padanan rakan untuk mencari rakan baru dan membina bulatan sokongan' : 'Intra in area par amicus ad inveniendos novos amicos et construendam circulum auxilii'}
                    role="button"
                  >
                    <span style={{ fontSize: 32 }}>{FRIEND_EMOJI[lang]}</span>
                    <span style={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{t.friend}</span>
                  </button>
                  {MODULES.slice(0,2).map(m => (
                    <button 
                      key={m.key} 
                      className="feature-btn" 
                      style={{ fontSize: 18, padding: '24px 24px', minWidth: 160, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, justifyContent: 'center' }} 
                      onClick={() => handleFeatureWithAuth(() => navigate(m.path))}
                      aria-label={m.desc[lang]}
                      role="button"
                    >
                      <span style={{ 
                        fontSize: 32,
                        transform: m.icon === '🎤' ? 'translateY(8px)' : 'none'
                      }}>{m.icon}</span>
                      <span style={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{m.title[lang]}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center' }}>
                  {MODULES.slice(2, 5).map(m => (
                    <button 
                      key={m.key} 
                      className="feature-btn" 
                      style={{ fontSize: 18, padding: '24px 24px', minWidth: 160, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, justifyContent: 'center' }} 
                      onClick={() => handleFeatureWithAuth(() => navigate(m.path))}
                      aria-label={m.desc[lang]}
                      role="button"
                    >
                      <span style={{ fontSize: 32 }}>{m.icon}</span>
                      <span style={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{m.title[lang]}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center', marginTop: 10 }}>
                  {/* 我是誰故事鏈按鈕 */}
                  <button 
                    className="feature-btn" 
                    style={{ fontSize: 18, padding: '24px 24px', minWidth: 160, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, justifyContent: 'center' }} 
                    onClick={() => handleFeatureWithAuth(() => navigate('/storywall'))}
                    aria-label={lang === 'zh-TW' ? '分享故事，建立連結' : lang === 'zh-CN' ? '分享故事，建立连接' : lang === 'en' ? 'Share Stories, Build Connections' : lang === 'ja' ? 'ストーリーを共有し、つながりを築く' : lang === 'ko' ? '이야기를 공유하고 연결을 구축' : lang === 'th' ? 'แบ่งปันเรื่องราว สร้างการเชื่อมต่อ' : lang === 'vi' ? 'Chia sẻ câu chuyện, xây dựng kết nối' : lang === 'ms' ? 'Kongsi cerita, bina hubungan' : 'Fabulas partiri, nexus construere'}
                    role="button"
                  >
                    <span style={{ fontSize: 32 }}>📖</span>
                    <span style={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{lang === 'zh-TW' ? '我是誰故事鏈' : lang === 'zh-CN' ? '我是誰故事鏈' : lang === 'ja' ? 'ストーリーウォール' : lang === 'en' ? 'Story Wall' : lang === 'ko' ? '스토리 월' : lang === 'th' ? 'กำแพงเรื่องราว' : lang === 'vi' ? 'Tường Truyện' : lang === 'ms' ? 'Dinding Cerita' : 'Murus Fabularum'}</span>
                  </button>
                  {/* 互相幫助&合作實驗室按鈕 - 縮短寬度 */}
                  <button
                    className="feature-btn mutual-help-btn"
                    style={{
                      fontSize: 18,
                      padding: '24px 24px',
                      minWidth: 180,
                      maxWidth: 240,
                      minHeight: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      justifyContent: 'center',
                      background: 'linear-gradient(90deg, #ffe0b2 0%, #ffb74d 100%)',
                      color: '#b85c00',
                      border: '2px solid #ffb74d',
                      fontWeight: 900,
                      boxShadow: '0 2px 12px #ffb74d55',
                    }}
                    onClick={() => handleFeatureWithAuth(() => navigate('/HelpLab'))}
                    aria-label={lang === 'zh-TW' ? '提供與獲得幫助，一樣重要' : lang === 'zh-CN' ? '提供与获得帮助，一样重要' : lang === 'en' ? 'Providing and receiving help are equally important' : lang === 'ja' ? '助けを提供することと受けることは同じように重要' : lang === 'ko' ? '도움을 제공하고 받는 것은 똑같이 중요합니다' : lang === 'th' ? 'การให้และรับความช่วยเหลือมีความสำคัญเท่ากัน' : lang === 'vi' ? 'Cung cấp và nhận sự giúp đỡ đều quan trọng như nhau' : lang === 'ms' ? 'Memberi dan menerima bantuan sama penting' : 'Auxilium praebere et accipere aequo modo magni momenti sunt'}
                    role="button"
                  >
                    <span style={{ fontSize: 32 }}>🧪</span>
                    <span style={{ fontWeight: 900, color: '#1976d2', textAlign: 'center', lineHeight: 1.2 }}>{MUTUAL_HELP_TEXT[lang]}</span>
                  </button>
                  {/* 情緒發洩區按鈕 */}
                  <button 
                    className="feature-btn" 
                    style={{ fontSize: 18, padding: '24px 24px', minWidth: 160, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, justifyContent: 'center' }} 
                    onClick={() => handleFeatureWithAuth(() => navigate('/emotion-release'))}
                    aria-label={lang === 'zh-TW' ? '透過遊戲釋放壓力，找回平靜' : lang === 'zh-CN' ? '通过游戏释放压力，找回平静' : lang === 'en' ? 'Release stress through games, find peace' : lang === 'ja' ? 'ゲームでストレスを発散し、平静を取り戻す' : lang === 'ko' ? '게임으로 스트레스를 해소하고 평온을 찾으세요' : lang === 'th' ? 'ปลดปล่อยความเครียดผ่านเกม หาความสงบ' : lang === 'vi' ? 'Giải tỏa căng thẳng qua trò chơi, tìm lại bình yên' : lang === 'ms' ? 'Lepaskan tekanan melalui permainan, temui ketenangan' : 'Libera tensionem per ludos, inveni pacem'}
                    role="button"
                  >
                    <span style={{ fontSize: 32 }}>🎮</span>
                    <span style={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{lang === 'zh-TW' ? '情緒發洩區' : lang === 'zh-CN' ? '情绪发泄区' : lang === 'ja' ? '感情発散エリア' : lang === 'en' ? 'Emotion Release Zone' : lang === 'ko' ? '감정 발산 구역' : lang === 'th' ? 'พื้นที่ระบายอารมณ์' : lang === 'vi' ? 'Khu Vực Giải Tỏa Cảm Xúc' : lang === 'ms' ? 'Zon Pelepasan Emosi' : 'Zona Emotio Liberationis'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* 右側內容：mockup 圖片和來聊天吧按鈕 */}
          <div className="home-right-col" style={{ flex: 1, minWidth: 320, maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 120, zIndex: 2 }}>
            {/* 新增：上方按鈕區塊 */}
            <div style={{ display: 'flex', gap: 18, marginBottom: 18, justifyContent: 'center', width: '100%' }}>
              <a href="/plans" style={{ background: '#6B5BFF', color: '#fff', fontWeight: 700, fontSize: 18, padding: '10px 28px', borderRadius: 10, boxShadow: '0 2px 8px #6B5BFF33', textDecoration: 'none', border: '2px solid #6B5BFF', cursor: 'pointer' }}>{MEMBER_BENEFITS_TEXT[lang]}</a>
            </div>
            {/* 天氣組件 - 移動到訂閱方案按鈕下方 */}
            <div style={{ marginBottom: 18, width: '100%', maxWidth: 300 }}>
              <WeatherWidget />
            </div>
            <img src="/hero-mic.jpg" className="home-mic-img" style={{ marginBottom: 0, height: 'calc(100vh - 180px)', maxHeight: 520, minHeight: 320, width: '100%', objectFit: 'contain', background: '#232946' }} />
            <button
              ref={chatBtnRef}
              className="feature-btn home-chat-btn"
              style={{ height: 120, marginTop: 0, marginBottom: 0, position: 'relative', top: '-60px', gap: 8, padding: '24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => handleFeatureWithAuth(() => handleFeature('chat'), 'aiChat')}
              aria-label={lang === 'zh-TW' ? '開始與 AI 聊天對話' : lang === 'zh-CN' ? '开始与 AI 聊天对话' : lang === 'en' ? 'Start chatting with AI' : lang === 'ja' ? 'AIとのチャットを開始' : lang === 'ko' ? 'AI와 채팅 시작' : lang === 'th' ? 'เริ่มแชทกับ AI' : lang === 'vi' ? 'Bắt đầu trò chuyệnกับ AI' : lang === 'ms' ? 'Mula berbual dengan AI' : 'Incipe colloquium cum AI'}
              role="button"
            >
              <span role="img" aria-label="chat" style={{ fontSize: 32 }}>💬</span>
              <span className="home-chat-btn-text" style={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{t.chat}</span>
            </button>
          </div>
        </div>
      )}
      {isMobile ? (
        // 手機版 Footer
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
        <footer style={{ 
          textAlign: 'center', 
          fontSize: 14, 
          color: '#888', 
          marginTop: 0, 
          padding: 16,
          background: 'rgba(255,255,255,0.92)',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 -2px 8px #0001',
          position: 'relative',
          top: '-20px',
        }}>
          <div style={{ width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* 左側：我們是誰 */}
            <a href="/about" style={{ color: '#6B5BFF', textDecoration: 'underline', fontWeight: 700, minWidth: 120, marginRight: 32 }}>
              {lang === 'zh-TW' ? '🧬 Restarter™｜我們是誰' : 
               lang === 'zh-CN' ? '🧬 Restarter™｜我们是谁' : 
               lang === 'en' ? '🧬 Restarter™｜Who We Are' : 
               lang === 'ja' ? '🧬 Restarter™｜私たちについて' : 
               lang === 'ko' ? '🧬 Restarter™｜우리는 누구인가' : 
               lang === 'th' ? '🧬 Restarter™｜เราเป็นใคร' : 
               lang === 'vi' ? '🧬 Restarter™｜Chúng tôi là ai' : 
               lang === 'ms' ? '🧬 Restarter™｜Siapa Kami' : 
               '🧬 Restarter™｜Quis sumus'}
            </a>
            {/* 中央：政策/條款/刪除 */}
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'center' }}>
              <a href="/privacy-policy" style={{ color: '#6B5BFF', textDecoration: 'underline' }}>
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
              <a href="/terms" style={{ color: '#6B5BFF', textDecoration: 'underline' }}>
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
              <a href="/data-deletion" style={{ color: '#6B5BFF', textDecoration: 'underline' }}>
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
            {/* 右側：意見箱 */}
            <a href="/feedback" style={{ color: '#6B5BFF', textDecoration: 'underline', fontWeight: 700, minWidth: 140, textAlign: 'right', marginLeft: 32 }}>
              {lang === 'zh-TW' ? '💬 意見箱｜我們想聽你說' : 
               lang === 'zh-CN' ? '💬 意见箱｜我们想听你说' : 
               lang === 'en' ? '💬 Feedback｜We Want to Hear You' : 
               lang === 'ja' ? '💬 ご意見箱｜あなたの声を聞かせて' : 
               lang === 'ko' ? '💬 피드백｜여러분의 의견을 듣고 싶어요' : 
               lang === 'th' ? '💬 กล่องความคิดเห็น｜เราอยากฟังคุณ' : 
               lang === 'vi' ? '💬 Hộp góp ý｜Chúng tôi muốn lắng nghe bạn' : 
               lang === 'ms' ? '💬 Kotak Maklum Balas｜Kami ingin mendengar anda' : 
               '💬 Arca Consilii｜Te audire volumus'}
            </a>
          </div>
        </footer>
      )}
      {/* 登入提示視窗 */}
      {showLoginTip && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,40,80,0.18)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #6B5BFF33', padding: 28, minWidth: 280, maxWidth: 340, width: '90vw', position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button type="button" onClick={() => setShowLoginTip(false)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', fontWeight: 700 }}>×</button>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#6B5BFF', textAlign: 'center', marginBottom: 2 }}>{tipText.title}</div>
            <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(90deg, #6e8efb, #a777e3)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 0', fontWeight: 700, fontSize: 17, cursor: 'pointer', margin: '12px 0' }}>{tipText.btn}</button>
            <button onClick={() => setShowLoginTip(false)} style={{ background: '#eee', color: '#666', border: 'none', borderRadius: 14, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{tipText.close}</button>
          </div>
        </div>
      )}
      
      {/* 訂閱提示模態框 */}
              <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          title={subscriptionModalData.title}
          message={subscriptionModalData.message}
          requiredPlan={subscriptionModalData.requiredPlan}
        />
        
        <TokenRenewalModal
          isOpen={showTokenRenewalModal}
          onClose={() => setShowTokenRenewalModal(false)}
          currentPlan={tokenRenewalData.currentPlan}
          remainingDays={tokenRenewalData.remainingDays}
          usedTokens={tokenRenewalData.usedTokens}
          totalTokens={tokenRenewalData.totalTokens}
        />
      

      
      <style>{`
        .feature-btn, .home-chat-btn, .topbar-btn {
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
          cursor: pointer;
        }
        /* 移除懸停效果以避免畫面停滯和耗電 */
        .feature-btn, .home-chat-btn {
          background: #fff;
          border-radius: 12px;
          border: 2px solid #6B5BFF;
          color: #6B5BFF;
          font-weight: 700;
          font-size: 16px;
          padding: 8px 16px;
        }
        .home-chat-btn-text {
          font-size: 18px;
          margin-left: 2px;
        }
        .topbar-btn {
          background: #6c63ff;
          border-radius: 8px;
          border: none;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          padding: 8px 18px;
        }
        .fixed-logo-box {
          position: fixed;
          top: 16px;
          left: 42px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10000;
        }
        .fixed-logo-img {
          width: 54px;
          height: 54px;
        }
        .fixed-logo-slogan {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 8px #232946, 0 4px 18px #0008;
        }
      `}</style>
    </div>
  );
}