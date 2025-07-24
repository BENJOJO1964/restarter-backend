import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { getAuth, signOut } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';

const TEXT: {
  [key: string]: {
    back?: string;
    logout?: string;
    title: string;
    subtitle?: string;
    steps?: { title: string; desc: string; placeholder: string }[];
    submit?: string;
    loading?: string;
    next?: string;
    finish?: string;
    finishSub?: string;
    error?: string;
    task?: string;
    done?: string;
    badge?: string;
    loadingText?: string;
    submitButton?: string;
    retry?: string;
  }
} = {
  'zh-TW': {
    back: '返回',
    logout: '登出',
    title: '重啟之路',
    subtitle: '一步步走出迷霧，看見全新的自己',
    steps: [
      { title: '第一站：迷霧山谷', desc: '寫下最近一件讓你感到強烈情緒的事。不必評判自己，單純描述事情的經過、你的感受，以及這個感受帶來的影響。', placeholder: '在這裡寫下你的故事...(300字內)' },
      { title: '第二站：希望之丘', desc: '回顧你剛剛寫下的事件，請思考：在那個情境下，你有沒有做過什麼小小的努力或嘗試？即使很微小，也請寫下來。', placeholder: '寫下你做過的努力或嘗試...(300字內)' },
      { title: '第三站：勇氣森林', desc: '根據你剛剛發現的努力或資源，請設定一個你願意嘗試的小行動，並寫下你預期會遇到的困難，以及你打算怎麼面對。', placeholder: '寫下你的小行動與預期困難...(300字內)' },
      { title: '第四站：智慧溪流', desc: '回顧你剛剛的行動經驗，請反思：這個過程中，你學到了什麼？有沒有什麼新的發現或領悟？', placeholder: '寫下你的學習與領悟...(300字內)' },
      { title: '第五站：重啟之巔', desc: '綜合前面所有關卡的經歷，請寫下你給未來自己的祝福或期許，並思考：如果未來再遇到困難，你會怎麼鼓勵自己？', placeholder: '寫下給自己的祝福或期許...(300字內)' }
    ],
    submit: '提交，尋求指引',
    loading: '請稍候...',
    next: '前往下一站',
    finish: '恭喜你完成重啟之路！',
    finishSub: '未來也請繼續善待自己！',
    error: '發生錯誤，請稍後再試。',
    retry: '再來一次',
  },
  'zh-CN': {
    back: '返回首页',
    logout: '登出',
    title: '日常任务挑战',
    subtitle: '一步步走出迷雾，看见全新的自己',
    steps: [
      { title: '第一站：迷雾山谷', desc: '写下最近一件让你感到强烈情绪的事。不必评判自己，单纯描述事情的经过、你的感受，以及这个感受带来的影响。', placeholder: '在这里写下你的故事...(300字内)' },
      { title: '第二站：希望之丘', desc: '回顾你刚刚写下的事件，请思考：在那个情境下，你有没有做过什么小小的努力或尝试？即使很微小，也请写下来。', placeholder: '写下你做过的努力或尝试...(300字内)' },
      { title: '第三站：勇气森林', desc: '根据你刚刚发现的努力或资源，请设定一个你愿意尝试的小行动，并写下你预期会遇到的困难，以及你打算怎么面对。', placeholder: '写下你的小行动与预期困难...(300字内)' },
      { title: '第四站：智慧溪流', desc: '回顾你刚刚的行动经验，请反思：这个过程中，你学到了什么？有没有什么新的发现或领悟？', placeholder: '写下你的学习与领悟...(300字内)' },
      { title: '第五站：重启之巅', desc: '综合前面所有关卡的经历，请写下你给未来自己的祝福或期许，并思考：如果未来再遇到困难，你会怎么鼓励自己？', placeholder: '写下给自己的祝福或期许...(300字内)' }
    ],
    submit: '提交，寻求指引',
    loading: '请稍候...',
    next: '前往下一站',
    finish: '恭喜你完成重启之路！',
    finishSub: '未来也请继续善待自己！',
    error: '发生错误，请稍后再试。',
    retry: '再来一次',
  },
  'en': {
    back: 'Back to Home',
    logout: 'Logout',
    title: 'Restart Journey',
    subtitle: 'Step by step out of the mist, see a new self',
    steps: [
      { title: 'Step 1: Misty Valley', desc: 'Write about a recent event that made you feel strong emotions. No need to judge yourself, just describe what happened, how you felt, and how it affected you.', placeholder: 'Write your story here...(300 words max)' },
      { title: 'Step 2: Hill of Hope', desc: 'Review the event you just wrote. Did you make any small effort or try anything in that situation? Even if it was minor, write it down.', placeholder: 'Write your effort or attempt...(300 words max)' },
      { title: 'Step 3: Forest of Courage', desc: 'Based on your discovered effort or resources, set a small action you are willing to try, and write down the difficulties you expect and how you plan to face them.', placeholder: 'Write your action and expected difficulties...(300 words max)' },
      { title: 'Step 4: Stream of Wisdom', desc: 'Reflect on your action experience. What did you learn? Any new discoveries or insights?', placeholder: 'Write your learning and insights...(300 words max)' },
      { title: 'Step 5: Summit of Restart', desc: 'Summarize all your experiences and write a blessing or expectation for your future self. If you face difficulties again, how will you encourage yourself?', placeholder: 'Write your blessing or expectation...(300 words max)' }
    ],
    submit: 'Submit for Guidance',
    loading: 'Please wait...',
    next: 'Next Step',
    finish: 'Congratulations on completing your restart journey!',
    finishSub: 'Please continue to be kind to yourself in the future!',
    error: 'An error occurred, please try again later.',
    retry: 'Try Again',
  },
  'ja': {
    back: 'ホームに戻る',
    logout: 'ログアウト',
    title: '日課ミッション挑戦',
    subtitle: '一歩ずつ霧を抜けて、新しい自分に出会おう',
    steps: [
      { title: '第1ステップ：霧の谷', desc: '最近あなたが強い感情を抱いた出来事について書いてください。自分を評価せず、出来事の経過や感情、その影響を素直に書きましょう。', placeholder: 'ここにあなたのストーリーを書いてください...(300字以内)' },
      { title: '第2ステップ：希望の丘', desc: '先ほど書いた出来事を振り返り、その状況であなたが行った小さな努力や試みがあれば書いてください。些細なことでも構いません。', placeholder: 'あなたの努力や試みを書いてください...(300字以内)' },
      { title: '第3ステップ：勇気の森', desc: '発見した努力やリソースをもとに、挑戦したい小さな行動と、予想される困難、それにどう向き合うかを書いてください。', placeholder: '行動と予想される困難を書いてください...(300字以内)' },
      { title: '第4ステップ：知恵の流れ', desc: '行動の経験を振り返り、学んだことや新たな気づきがあれば書いてください。', placeholder: '学びや気づきを書いてください...(300字以内)' },
      { title: '第5ステップ：再出発の頂', desc: 'これまでの経験をまとめ、未来の自分へのメッセージや期待を書いてください。困難に直面したとき、どう自分を励ますかも考えてみましょう。', placeholder: '未来の自分へのメッセージや期待を書いてください...(300字以内)' }
    ],
    submit: '提出して指導を求める',
    loading: 'お待ちください...',
    next: '次のステップへ',
    finish: '再出発の道を完了しました！',
    finishSub: 'これからも自分を大切にしてください！',
    error: 'エラーが発生しました。しばらくしてから再度お試しください。',
    retry: 'もう一度',
  },
  'ko': {
    back: '홈으로',
    logout: '로그아웃',
    title: '일일 미션 도전',
    subtitle: '한 걸음씩 안개를 걷고, 새로운 나를 만나보세요',
    steps: [
      { title: '1단계: 안개의 계곡', desc: '최근에 강한 감정을 느꼈던 일을 적어보세요. 자신을 평가하지 말고, 그 일의 과정과 감정, 그리고 그 감정이 가져온 영향을 솔직하게 적어보세요.', placeholder: '여기에 당신의 이야기를 적어주세요...(300자 이내)' },
      { title: '2단계: 희망의 언덕', desc: '방금 적은 일을 돌아보며, 그 상황에서 했던 작은 노력이나 시도가 있다면 적어보세요. 아주 사소한 것도 괜찮아요.', placeholder: '노력이나 시도를 적어주세요...(300자 이내)' },
      { title: '3단계: 용기의 숲', desc: '발견한 노력이나 자원을 바탕으로, 시도해보고 싶은 작은 행동과 예상되는 어려움, 그리고 어떻게 대처할지 적어보세요.', placeholder: '행동과 예상되는 어려움을 적어주세요...(300자 이내)' },
      { title: '4단계: 지혜의 시냇물', desc: '행동 경험을 돌아보며, 배운 점이나 새로운 깨달음이 있다면 적어보세요.', placeholder: '배운 점이나 깨달음을 적어주세요...(300자 이내)' },
      { title: '5단계: 재시작의 정상', desc: '지금까지의 경험을 종합해 미래의 나에게 전하고 싶은 메시지나 기대를 적어보세요. 앞으로 어려움이 닥칠 때 어떻게 자신을 격려할지도 생각해보세요.', placeholder: '미래의 나에게 전하고 싶은 메시지나 기대를 적어주세요...(300자 이내)' }
    ],
    submit: '제출하고 안내받기',
    loading: '잠시만 기다려주세요...',
    next: '다음 단계로',
    finish: '재시작의 여정을 완료했습니다!',
    finishSub: '앞으로도 자신을 소중히 하세요!',
    error: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    retry: '다시 시도',
  },
  'th': {
    back: 'กลับหน้าหลัก',
    logout: 'ออกจากระบบ',
    title: 'ภารกิจประจำวัน',
    subtitle: 'ก้าวออกจากหมอกทีละก้าว พบกับตัวเองในมุมใหม่',
    steps: [
      { title: 'ขั้นที่ 1: หุบเขาหมอก', desc: 'เขียนเกี่ยวกับเหตุการณ์ล่าสุดที่ทำให้คุณรู้สึกอารมณ์รุนแรง ไม่ต้องตัดสินตัวเอง เพียงบรรยายเหตุการณ์ ความรู้สึก และผลกระทบที่เกิดขึ้น', placeholder: 'เขียนเรื่องราวของคุณที่นี่...(300 คำ)' },
      { title: 'ขั้นที่ 2: เนินแห่งความหวัง', desc: 'ทบทวนเหตุการณ์ที่เพิ่งเขียนไป มีความพยายามหรือการลองทำอะไรเล็กๆ ในสถานการณ์นั้นหรือไม่ แม้จะเล็กน้อยก็เขียนได้', placeholder: 'เขียนความพยายามหรือสิ่งที่ลองทำ...(300 คำ)' },
      { title: 'ขั้นที่ 3: ป่าแห่งความกล้าหาญ', desc: 'จากความพยายามหรือทรัพยากรที่ค้นพบ กำหนดการกระทำเล็กๆ ที่อยากลอง พร้อมทั้งอุปสรรคที่คาดว่าจะเจอและวิธีรับมือ', placeholder: 'เขียนการกระทำและอุปสรรคที่คาดไว้...(300 คำ)' },
      { title: 'ขั้นที่ 4: ลำธารแห่งปัญญา', desc: 'ทบทวนประสบการณ์การกระทำของคุณ มีอะไรที่ได้เรียนรู้หรือค้นพบใหม่ๆ หรือไม่', placeholder: 'เขียนสิ่งที่ได้เรียนรู้หรือค้นพบ...(300 คำ)' },
      { title: 'ขั้นที่ 5: ยอดเขาแห่งการเริ่มต้นใหม่', desc: 'สรุปประสบการณ์ทั้งหมด เขียนคำอวยพรหรือความคาดหวังถึงตัวเองในอนาคต หากเจออุปสรรคอีกจะให้กำลังใจตัวเองอย่างไร', placeholder: 'เขียนคำอวยพรหรือความคาดหวัง...(300 คำ)' }
    ],
    submit: 'ส่งและขอคำแนะนำ',
    loading: 'กรุณารอสักครู่...',
    next: 'ไปยังขั้นถัดไป',
    finish: 'คุณสำเร็จภารกิจเริ่มต้นใหม่แล้ว!',
    finishSub: 'ขอให้ดูแลตัวเองต่อไป!',
    error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งภายหลัง',
    retry: 'ลองอีกครั้ง',
  },
  'vi': {
    back: 'Về trang chủ',
    logout: 'Đăng xuất',
    title: 'Thử thách nhiệm vụ hàng ngày',
    subtitle: 'Từng bước vượt qua sương mù, khám phá bản thân mới',
    steps: [
      { title: 'Bước 1: Thung lũng sương mù', desc: 'Viết về một sự kiện gần đây khiến bạn cảm xúc mạnh. Không cần phán xét bản thân, chỉ cần mô tả diễn biến, cảm xúc và ảnh hưởng của nó.', placeholder: 'Viết câu chuyện của bạn tại đây...(300 từ)' },
      { title: 'Bước 2: Đồi hy vọng', desc: 'Xem lại sự kiện vừa viết, bạn có nỗ lực hoặc thử điều gì nhỏ không? Dù nhỏ cũng hãy ghi lại.', placeholder: 'Viết nỗ lực hoặc điều bạn đã thử...(300 từ)' },
      { title: 'Bước 3: Rừng dũng cảm', desc: 'Dựa trên nỗ lực hoặc nguồn lực vừa phát hiện, hãy đặt ra một hành động nhỏ muốn thử, dự đoán khó khăn và cách đối mặt.', placeholder: 'Viết hành động và khó khăn dự đoán...(300 từ)' },
      { title: 'Bước 4: Suối trí tuệ', desc: 'Xem lại trải nghiệm hành động, bạn học được gì? Có phát hiện hay nhận thức mới không?', placeholder: 'Viết điều bạn học được hoặc nhận ra...(300 từ)' },
      { title: 'Bước 5: Đỉnh tái khởi động', desc: 'Tổng hợp mọi trải nghiệm, viết lời chúc hoặc kỳ vọng cho bản thân tương lai. Nếu gặp khó khăn, bạn sẽ động viên mình thế nào?', placeholder: 'Viết lời chúc hoặc kỳ vọng...(300 từ)' }
    ],
    submit: 'Gửi và nhận hướng dẫn',
    loading: 'Vui lòng chờ...',
    next: 'Bước tiếp theo',
    finish: 'Chúc mừng bạn đã hoàn thành hành trình tái khởi động!',
    finishSub: 'Hãy tiếp tục yêu thương bản thân nhé!',
    error: 'Đã xảy ra lỗi, vui lòng thử lại sau.',
    retry: 'Thử lại',
  },
  'la': {
    back: 'Redi ad domum',
    logout: 'Exire',
    title: 'Provocatio Cotidiana',
    subtitle: 'Gradatim e nebula progredere, novum te aspice',
    steps: [
      { title: 'Gradus I: Vallis Nebulosa', desc: 'Scribe de re nuper te vehementer commotum. Te ipsum iudicare noli, sed simpliciter rem, sensus tuos, et effectus describas.', placeholder: 'Hic fabulam tuam scribe...(300 verba)' },
      { title: 'Gradus II: Collis Spei', desc: 'Recense rem modo scriptam. In illa condicione quid parvum conatus es? Etiam minima, scribe.', placeholder: 'Conatum tuum scribe...(300 verba)' },
      { title: 'Gradus III: Silva Virtutis', desc: 'Ex conatu aut opibus inventis, parvam actionem temptare velis, difficultates praevides et quomodo eas superaturus sis scribe.', placeholder: 'Actionem et difficultates scribe...(300 verba)' },
      { title: 'Gradus IV: Rivus Sapientiae', desc: 'Recense experientiam actionis. Quid didicisti? Quid novi invenisti?', placeholder: 'Quae didicisti scribe...(300 verba)' },
      { title: 'Gradus V: Culmen Renovationis', desc: 'Omnia experientia colligens, votum aut spem tibi futuro scribe. Si iterum difficultates occurrant, quomodo te hortaberis?', placeholder: 'Votum aut spem scribe...(300 verba)' }
    ],
    submit: 'Mitte et consilium pete',
    loading: 'Exspecta quaeso...',
    next: 'Ad gradum proximum',
    finish: 'Iter renovationis confecisti!',
    finishSub: 'Te ipsum semper cura!',
    error: 'Error factus est, quaeso postea repete.',
    retry: 'Iterum conare',
  },
  'ms': {
    back: 'Kembali ke Laman Utama',
    logout: 'Log keluar',
    title: 'Cabaran Misi Harian',
    subtitle: 'Melangkah keluar dari kabus, temui diri baharu',
    steps: [
      { title: 'Langkah 1: Lembah Berkabus', desc: 'Tulis tentang peristiwa baru-baru ini yang membuatkan anda beremosi kuat. Tidak perlu menilai diri, hanya gambarkan peristiwa, perasaan dan kesannya.', placeholder: 'Tulis kisah anda di sini...(300 patah perkataan)' },
      { title: 'Langkah 2: Bukit Harapan', desc: 'Imbas kembali peristiwa tadi, adakah anda berusaha atau mencuba sesuatu walaupun kecil? Catatkan walaupun kecil.', placeholder: 'Tulis usaha atau percubaan anda...(300 patah perkataan)' },
      { title: 'Langkah 3: Hutan Keberanian', desc: 'Berdasarkan usaha atau sumber yang ditemui, tetapkan tindakan kecil yang ingin dicuba, jangka cabaran dan cara menghadapinya.', placeholder: 'Tulis tindakan dan cabaran dijangka...(300 patah perkataan)' },
      { title: 'Langkah 4: Sungai Kebijaksanaan', desc: 'Imbas kembali pengalaman tindakan anda, apa yang anda pelajari? Ada penemuan atau kesedaran baharu?', placeholder: 'Tulis apa yang anda pelajari...(300 patah perkataan)' },
      { title: 'Langkah 5: Puncak Permulaan Semula', desc: 'Gabungkan semua pengalaman, tulis harapan atau ucapan untuk diri masa depan. Jika hadapi cabaran lagi, bagaimana anda akan beri semangat pada diri?', placeholder: 'Tulis harapan atau ucapan...(300 patah perkataan)' }
    ],
    submit: 'Hantar & mohon panduan',
    loading: 'Sila tunggu...',
    next: 'Langkah seterusnya',
    finish: 'Tahniah, anda telah tamat perjalanan permulaan semula!',
    finishSub: 'Teruskan sayangi diri anda!',
    error: 'Ralat berlaku, sila cuba lagi kemudian.',
    retry: 'Cuba lagi',
  },
};

const missions = [
  {
    title: '第一站：迷霧山谷',
    desc: '寫下最近一件讓你感到強烈情緒的事。不必評判自己，單純描述事情的經過、你的感受，以及這個感受帶來的影響。',
    boxBg: '#fff',
    placeholder: '在這裡寫下你的故事...'
  },
  {
    title: '第二站：希望之丘',
    desc: '回顧你剛剛寫下的事件，請思考：在那個情境下，你有沒有做過什麼小小的努力或嘗試？即使很微小，也請寫下來。',
    boxBg: '#e6f9e6',
    placeholder: '寫下你做過的努力或嘗試...'
  },
  {
    title: '第三站：勇氣森林',
    desc: '根據你剛剛發現的努力或資源，請設定一個你願意嘗試的小行動，並寫下你預期會遇到的困難，以及你打算怎麼面對。',
    boxBg: '#d0ead7',
    placeholder: '寫下你的小行動與預期困難...'
  },
  {
    title: '第四站：智慧溪流',
    desc: '回顧你剛剛的行動經驗，請反思：這個過程中，你學到了什麼？有沒有什麼新的發現或領悟？',
    boxBg: '#e6f2fa',
    placeholder: '寫下你的學習與領悟...'
  },
  {
    title: '第五站：重啟之巔',
    desc: '綜合前面所有關卡的經歷，請寫下你給未來自己的祝福或期許，並思考：如果未來再遇到困難，你會怎麼鼓勵自己？',
    boxBg: '#fffbe6',
    placeholder: '寫下給自己的祝福或期許...'
  }
];

const LANGS = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'zh-CN', label: '简中' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ภาษาไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'la', label: 'Latīna' },
  { code: 'ms', label: 'Bahasa Melayu' },
];

export default function RestartMissions() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { lang } = useLanguage();
  // 取得語言內容，缺少欄位自動補繁中
  const base = TEXT['zh-TW'];
  const raw = TEXT[lang] || base;
  const t = {
    ...base,
    ...raw,
    steps: raw.steps || base.steps,
    submit: raw.submit || base.submit,
    loading: raw.loading || base.loading,
    next: raw.next || base.next,
    finish: raw.finish || base.finish,
    finishSub: raw.finishSub || base.finishSub,
    error: raw.error || base.error,
    retry: raw.retry || base.retry,
  };
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [aiReply, setAiReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const mission = t.steps?.[step];

  useEffect(() => {
    if (aiReply && step === (t.steps?.length || 0) - 1) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [aiReply, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiReply('');
    
    try {
      console.log('Sending request to /api/mission-ai with:', { step, input, history: answers });
      
      const res = await fetch('/api/mission-ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ step, input, history: answers })
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      
      setAiReply(data.reply || 'AI教練祝福你！');
      setAnswers(prev => [...prev, input]);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setAiReply('發生錯誤，請稍後再試。錯誤詳情：' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setInput('');
    setAiReply('');
    setStep(step + 1);
  };

  // 煙火動畫元件
  const Fireworks = () => (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <iframe src="https://embed.lottiefiles.com/animation/85716" style={{ width: 400, height: 400, border: 'none', background: 'transparent' }} title="fireworks1" />
      <iframe src="https://embed.lottiefiles.com/animation/85716" style={{ width: 400, height: 400, border: 'none', background: 'transparent', position: 'absolute', left: '20vw', top: '10vh' }} title="fireworks2" />
      <iframe src="https://embed.lottiefiles.com/animation/85716" style={{ width: 400, height: 400, border: 'none', background: 'transparent', position: 'absolute', right: '20vw', top: '20vh' }} title="fireworks3" />
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflowX: 'hidden',
      background: `url('/mountain.png') center center / cover no-repeat fixed, linear-gradient(to bottom, #eaf6ff 0%, #f7fafc 100%)`,
    }}>
      {/* 返回按鈕 - 頁面左上角 */}
      <button
          onClick={() => navigate('/')}
          style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 1000,
              fontWeight: 700,
              fontSize: 16,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1.5px solid #6B5BFF',
              background: '#fff',
              color: '#6B5BFF',
              cursor: 'pointer',
              minWidth: 80,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
      >
          {t.back}
      </button>

      {/* 登出和繁中按鈕 - 頁面右上角 */}
      <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
      }}>
          <button
              onClick={async () => { await signOut(auth); localStorage.clear(); window.location.href = '/'; }}
              style={{
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1.5px solid #6B5BFF',
                  background: '#fff',
                  color: '#6B5BFF',
                  cursor: 'pointer',
                  minWidth: 80,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
          >
              {t.logout}
          </button>
          <div style={{ width: 80 }}>
              <LanguageSelector style={{ width: '100%' }} />
          </div>
      </div>

      {/* Top Bar 獨立卡片 */}
      <div
          style={{
              width: '100%',
              maxWidth: 700,
              margin: '20px auto 20px auto',
              padding: '16px 24px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
          }}
      >
          <h1 style={{ 
              fontWeight: 900, 
              fontSize: 18, 
              color: '#6B5BFF', 
              margin: 0, 
              lineHeight: 1,
              textShadow: '0 2px 8px #6B5BFF88',
              textAlign: 'center',
          }}>
              <span role="img" aria-label="mission">🎯</span> 挑戰任務
          </h1>
      </div>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0 2rem 0', background: 'rgba(255,255,255,0.92)', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2rem', marginBottom: 8 }}>{t.title}</h1>
        <div style={{ textAlign: 'center', color: '#666', marginBottom: 32 }}>{t.subtitle}</div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: '#2a5d8f', marginBottom: 8 }}>{mission?.title || ''}</div>
          <div style={{ color: '#333', marginBottom: 24 }}>{mission?.desc || ''}</div>
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mission?.placeholder || ''}
              style={{ width: '100%', minHeight: 100, borderRadius: 8, border: '1px solid #ccc', padding: 12, marginBottom: 16 }}
              required
            />
            <button
              type="submit"
              disabled={loading || !input}
              style={{ width: '100%', background: '#6B5BFF', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '12px 0', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.99 : 1, filter: 'none', textShadow: 'none', transition: 'background 0.18s' }}
            >
              {loading ? t.loading : t.submit}
            </button>
          </form>
          {aiReply && (
            <div style={{ marginTop: 24, background: '#f5f5f5', borderRadius: 8, padding: 16, color: '#2a5d8f' }}>{aiReply}</div>
          )}
          {aiReply && step < (t.steps?.length || 0) - 1 && (
            <button
              onClick={handleNext}
              style={{ marginTop: 16, width: '100%', background: '#6B5BFF', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer', transition: 'background 0.18s' }}
            >
              {t.next}
            </button>
          )}
          {aiReply && step === (t.steps?.length || 0) - 1 && (
            <div style={{ marginTop: 24, textAlign: 'center', color: '#e6b800', fontWeight: 700, fontSize: 20 }}>
              {t.finish}<br />
              <span style={{ fontSize: 16, color: '#888' }}>{t.finishSub}</span>
              {showFireworks && <Fireworks />}
              <div style={{ marginTop: 24 }}>
                <button
                  onClick={() => {
                    setStep(0);
                    setInput('');
                    setAnswers([]);
                    setAiReply('');
                  }}
                  style={{
                    background: '#6B5BFF',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 32px',
                    cursor: 'pointer',
                    marginTop: 8,
                    boxShadow: '0 2px 8px #0001',
                    transition: 'background 0.18s',
                  }}
                >
                  {t.retry}
                </button>
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', color: '#aaa', fontSize: 14 }}>
          {(t.steps || []).map((m: any, i: any) => (
            <span key={i} style={{
              display: 'inline-block',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: i <= step ? '#8ec6f7' : '#e0e0e0',
              margin: '0 4px',
              border: i === step ? '2px solid #2a5d8f' : 'none',
              transition: 'all 0.2s'
            }} />
          ))}
        </div>
      </div>
      
      <Footer />
      
      {/* 煙火動畫 */}
      {aiReply && step === (t.steps?.length || 0) - 1 && showFireworks && <Fireworks />}
    </div>
  );
} 