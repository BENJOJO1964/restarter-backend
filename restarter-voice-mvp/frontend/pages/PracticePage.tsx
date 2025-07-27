import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import AudioRecorder from '../components/AudioRecorder';
import { Scenario } from './SkillBox';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { usePermission } from '../hooks/usePermission';
import { TokenRenewalModal } from '../components/TokenRenewalModal';
import { useTestMode } from '../App';
type LanguageCode = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'ms' | 'la';

const LANGS: { code: LanguageCode; label: string }[] = [
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

const UI_TEXT = {
    backToScenarios: { 'zh-TW': '← 返回情境列表', 'zh-CN': '← 返回情境列表', 'ja': '← シナリオ一覧へ戻る', 'en': '← Back to Scenarios', 'ko': '← 시나리오 목록으로', 'th': '← กลับไปที่รายการสถานการณ์', 'vi': '← Quay lại danh sách kịch bản', 'ms': '← Kembali ke Senarai Senario', 'la': '← Ad indicem scaenariorum redire' },
    logout: { 'zh-TW': '登出', 'zh-CN': '登出', 'ja': 'ログアウト', 'en': 'Logout', 'ko': '로그아웃', 'th': 'ออกจากระบบ', 'vi': 'Đăng xuất', 'ms': 'Log keluar', 'la': 'Exire' },
    practiceRoom: { 'zh-TW': '模擬練習中', 'zh-CN': '模拟练习中', 'ja': '練習シミュレーション中', 'en': 'Practice in Progress', 'ko': '연습 시뮬레이션 중', 'th': 'กำลังฝึกซ้อม', 'vi': 'Đang thực hành', 'ms': 'Latihan Sedang Berlangsung', 'la': 'In Exercitatione' },
    yourTurn: { 'zh-TW': '換你說了', 'zh-CN': '换你说了', 'ja': 'あなたの番です', 'en': 'Your turn', 'ko': '당신 차례입니다', 'th': 'ตาคุณแล้ว', 'vi': 'Đến lượt bạn', 'ms': 'Giliran anda', 'la': 'Tua vice est' },
    recording: { 'zh-TW': '錄音中...', 'zh-CN': '录音中...', 'ja': '録音中...', 'en': 'Recording...', 'ko': '녹음 중...', 'th': 'กำลังบันทึก...', 'vi': 'Đang ghi âm...', 'ms': 'Merakam...', 'la': 'Registrans...' },
    send: { 'zh-TW': '傳送', 'zh-CN': '发送', 'ja': '送信', 'en': 'Send', 'ko': '보내기', 'th': 'ส่ง', 'vi': 'Gửi', 'ms': 'Hantar', 'la': 'Mitte' },
};

// 1. 新增多語言對應
const SCENARIO_TEXT = {
  category: {
    'zh-TW': '分類', 'zh-CN': '分类', 'en': 'Category', 'ja': 'カテゴリ', 'ko': '분류', 'th': 'หมวดหมู่', 'vi': 'Phân loại', 'ms': 'Kategori', 'la': 'Categoria'
  },
  difficulty: {
    'zh-TW': '難度', 'zh-CN': '难度', 'en': 'Difficulty', 'ja': '難易度', 'ko': '난이도', 'th': 'ความยาก', 'vi': 'Độ khó', 'ms': 'Kesukaran', 'la': 'Difficultas'
  },
  tags: {
    'zh-TW': '標籤', 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ', 'ko': '태그', 'th': 'แท็ก', 'vi': 'Thẻ', 'ms': 'Tag', 'la': 'Tags'
  }
};
const DIFFICULTY_MAP: Record<string, Record<LanguageCode, string>> = {
  'hard': { 'zh-TW': '困難', 'zh-CN': '困难', 'en': 'Hard', 'ja': '難しい', 'ko': '어려움', 'th': 'ยาก', 'vi': 'Khó', 'ms': 'Sukar', 'la': 'Difficile' },
  'medium': { 'zh-TW': '中等', 'zh-CN': '中等', 'en': 'Medium', 'ja': '普通', 'ko': '보통', 'th': 'ปานกลาง', 'vi': 'Trung bình', 'ms': 'Sederhana', 'la': 'Mediocris' },
  'easy': { 'zh-TW': '簡單', 'zh-CN': '简单', 'en': 'Easy', 'ja': '簡単', 'ko': '쉬움', 'th': 'ง่าย', 'vi': 'Dễ', 'ms': 'Mudah', 'la': 'Facilis' }
};

// 取得多語言 scenario
function getLocalizedScenario(scenarios: any[], scenarioId: string, lang: string): any {
  const current = scenarios.find(s => s.id === scenarioId);
  if (!current) return null;
  // 若有多語言欄位，優先顯示當前語言，否則 fallback 英文
  if (current.translations && current.translations[lang]) {
    return { ...current, ...current.translations[lang] };
  }
  return current;
}

export default function PracticePage() {
    const navigate = useNavigate();
    const { scenarioId } = useParams();
    const safeScenarioId = scenarioId || '';
    const auth = getAuth();
    const lang = (localStorage.getItem('lang') as LanguageCode) || 'zh-TW';
    
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [userText, setUserText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    // 新增：友善提示浮窗
    const [toast, setToast] = useState('');
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 1800);
    };

    // 新增：權限檢查
    const { checkPermission, recordUsage } = usePermission();
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [permissionResult, setPermissionResult] = useState<any>(null);
    const { isTestMode } = useTestMode();

    // 判斷是否為完整句子
    function isMeaningfulInput(input: string) {
        if (!input || input.trim().length < 12) return false;
        return true;
    }

    useEffect(() => {
        const fetchScenarioDetails = async () => {
            setIsLoading(true);
            console.log('[useEffect] fetchScenarioDetails start, isLoading:', true);
            try {
                const response = await fetch(`/locales/${lang}/scenarios.json`);
                if (!response.ok) throw new Error('Failed to fetch scenarios');
                const scenarios: Scenario[] = await response.json();
                const currentScenario = getLocalizedScenario(scenarios, safeScenarioId, lang);
                if (currentScenario) {
                    setScenario(currentScenario);
                    setMessages([{ sender: 'ai', text: currentScenario.starting_line || currentScenario.system_prompt || '' }]);
                    console.log('[useEffect] scenario loaded:', currentScenario);
                } else {
                    setScenario(null);
                    console.log('[useEffect] scenario not found');
                }
            } catch (error) {
                console.error('[useEffect] Error fetching scenario details:', error);
                setScenario(null);
            } finally {
                setIsLoading(false);
                console.log('[useEffect] fetchScenarioDetails end, isLoading:', false);
            }
        };
        if (scenarioId) {
            fetchScenarioDetails();
        }
    }, [scenarioId, lang]);

    const callApi = async (url: string, body: any, options: any = {}) => {
        console.log('[callApi] url:', url, 'body:', body);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            ...options
        });
        if (!res.ok) throw new Error('API call failed');
        return res;
    };

    const handleAudio = async (audioBlob: Blob) => {
        setIsLoading(true);
        console.log('[handleAudio] isLoading:', true);
        try {
            // 檢查語音權限
            const user = auth.currentUser;
            if (!user) {
                showToast('請先登入');
                return;
            }

            const permission = await checkPermission('aiChat');
            if (!permission.allowed) {
                if (isTestMode) return;
                if (permission.canRenew) {
                    setPermissionResult(permission);
                    setShowRenewalModal(true);
                } else {
                    setPermissionResult(permission);
                    setShowRenewalModal(true);
                }
                return;
            }

            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
            formData.append('userId', user.uid); // 添加用戶ID
            
            const res = await fetch('/api/whisper', { method: 'POST', body: formData });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Whisper API failed: ${errorText}`);
            }
            const data = await res.json();
            const transcript = data.transcript || data.text || '';
            if (transcript) {
                setUserText(transcript); // 先顯示在輸入框
                // 自動送出
                setTimeout(() => {
                  handleSendText();
                }, 300);
            }
        } catch (error) {
            console.error("Error with audio processing:", error);
        } finally {
            setIsLoading(false);
            console.log('[handleAudio] end, isLoading:', false);
        }
    };
    
    const handleSendText = async () => {
        if (!userText.trim()) {
            showToast('請先輸入內容再送出');
            return;
        }
        if (!isMeaningfulInput(userText)) {
            showToast('請輸入至少12個字訓練表達能力');
            return;
        }

        // 檢查 AI 聊天權限
        const user = auth.currentUser;
        if (!user) {
            showToast('請先登入');
            return;
        }

        const permission = await checkPermission('aiChat');
        if (!permission.allowed) {
            if (isTestMode) return;
            if (permission.canRenew) {
                setPermissionResult(permission);
                setShowRenewalModal(true);
            } else {
                showToast('需要訂閱才能使用 AI 聊天功能');
            }
            return;
        }

        const msg = userText;
        setMessages(prev => {
            const newMessages = [...prev, { sender: 'user', text: msg }];
            getAIResponse(newMessages);
            return newMessages;
        });
        setUserText('');
    };

    const getAIResponse = async (currentMessages: any[]) => {
        setIsLoading(true);
        console.log('[getAIResponse] called, currentMessages:', currentMessages);
        try {
            // 修正: 過濾空訊息，並確保格式正確
            const filteredMessages = currentMessages.filter(m => m && m.text && m.text.trim()).map(m => ({
                sender: m.sender,
                text: m.text.trim()
            }));
            // 新增：傳遞情境主題與指令
            const scenarioInfo = scenario ? {
                system_prompt: scenario.system_prompt || '',
                title: scenario.title || '',
                description: scenario.description || ''
            } : {};
            
            const user = auth.currentUser;
            const res = await callApi('/api/gpt', { 
                messages: filteredMessages, 
                ...scenarioInfo,
                userId: user?.uid // 添加用戶ID
            });
            // 修正: 正確解析 reply 欄位
            const data = await res.json();
            const aiReply = data.reply || data.message || 'AI 無回應';
            setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
            console.log('[getAIResponse] AI message:', aiReply);
            // TTS
            const ttsRes = await callApi('/api/tts', { text: aiReply }, { responseType: 'blob' });
            const audioBlob = await ttsRes.blob();
            if (audioRef.current) {
                audioRef.current.src = URL.createObjectURL(audioBlob);
                audioRef.current.play();
            }
        } catch (error) {
            console.error('[getAIResponse] Error getting AI response:', error);
            setMessages(prev => [...prev, { sender: 'ai', text: '抱歉，我現在遇到一些問題，請稍後再試。' }]);
        } finally {
            setIsLoading(false);
            console.log('[getAIResponse] end, isLoading:', false);
        }
    };

    // 移除全畫面 isLoading 判斷
    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    if (!scenario) {
        return <div style={{textAlign:'center',marginTop:80}}><div style={{fontSize:22,marginBottom:16}}>⚠️ Scenario not found.</div><button onClick={() => navigate('/skillbox')} style={{padding:'10px 28px',borderRadius:8,background:'#6B5BFF',color:'#fff',fontWeight:700,fontSize:16,border:'none',cursor:'pointer'}}>Go back</button></div>;
    }

    const handleRenewalModalClose = () => {
        setShowRenewalModal(false);
        setPermissionResult(null);
    };

    return (
        <div className="modern-bg" style={{ background: `url('/senario.png') center center / cover no-repeat fixed`, minHeight: '100vh', width:'100vw', overflow:'hidden', position:'relative' }}>
            <audio ref={audioRef} hidden />
            {/* 固定頂部的三個按鈕區塊 */}
            <div style={{position:'fixed',top:0,left:0,right:0,zIndex:200,display:'flex',justifyContent:'flex-start',alignItems:'center',padding:'18px 32px 0 32px',background:'transparent',width:'100vw',pointerEvents:'auto'}}>
                <button className="topbar-btn" onClick={() => navigate('/skillbox')} style={{ fontWeight: 700, fontSize: 18, padding: '6px 16px', borderRadius: 8, border: '1.5px solid #6B5BFF', background: '#fff', color: '#6B5BFF', cursor: 'pointer' }}>{UI_TEXT.backToScenarios[lang]}</button>
            </div>
            {/* 內容區塊可捲動，並自動下移不被頂部按鈕遮住 */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 80, overflowY:'auto', maxHeight:'calc(100vh - 80px)', padding: '24px' }}>
                {/* Scenario Header - 移除麥克風按鈕 */}
                <div style={{ width: '100%', maxWidth: 700, background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: '32px 32px 18px 32px', boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0, position: 'relative' }}>
                    <div style={{ fontSize: 54, marginBottom: 8 }}>{scenario.emoji}</div>
                    <h2 style={{ color: '#6B5BFF', fontWeight: 900, fontSize: 28, marginBottom: 24, textAlign: 'center' }}>{scenario.title}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, padding: '4px 12px', borderRadius: 16, background: '#6B5BFF22', color: '#6B5BFF' }}>{SCENARIO_TEXT.category[lang]}: {scenario.category}</span>
                      <span style={{ fontWeight: 600, fontSize: 14, padding: '4px 12px', borderRadius: 16, background: '#23c6e622', color: '#23c6e6' }}>{SCENARIO_TEXT.difficulty[lang]}: {DIFFICULTY_MAP[scenario.difficulty]?.[lang] || scenario.difficulty}</span>
                    </div>
                    <p style={{ fontSize: 16, color: '#4A4A4A', textAlign: 'center', margin: '0 0 8px 0', lineHeight:1.6 }}>{scenario.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                      {scenario.tags?.map(tag => <span key={tag} style={{ fontSize: 13, background: '#f7f7ff', color: '#6B5BFF', borderRadius: 12, padding: '2px 10px' }}>{tag}</span>)}
                    </div>
                </div>
                {/* Chat Area */}
                <div style={{ width: '100%', maxWidth: 700, background: 'rgba(255,255,255,0.93)', borderRadius: 16, padding: '18px 32px 24px 32px', boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', marginTop: 0 }}>
                    <div style={{ minHeight: '32vh', maxHeight: '44vh', overflowY: 'auto', background: '#f6f7fa', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: '12px', boxShadow:'0 2px 8px #6B5BFF11' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                <div style={{
                                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #6B5BFF 60%, #23c6e6 100%)' : '#fff',
                                    color: msg.sender === 'user' ? '#fff' : '#4A4A4A',
                                    padding: '10px 16px',
                                    borderRadius: '18px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Input Area - 麥克風放左側 */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
                        <div style={{ marginRight: 0 }}>
                          <AudioRecorder onAudio={handleAudio} lang={lang} />
                        </div>
                        <input 
                            type="text"
                            value={userText}
                            onChange={(e) => setUserText(e.target.value)}
                            placeholder={isLoading ? "AI正在思考..." : UI_TEXT.yourTurn[lang]}
                            disabled={isLoading}
                            style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '2px solid #ddd', fontSize: 16, outline: 'none', background: isLoading ? '#f0f0f0' : '#fff' }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                        />
                        <button onClick={handleSendText} disabled={isLoading} style={{ padding: '12px 24px', borderRadius: 12, background: isLoading ? '#ccc' : '#6B5BFF', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                            {isLoading ? "..." : UI_TEXT.send[lang]}
                        </button>
                        {isLoading && <div style={{ position: 'absolute', right: -36, top: '50%', transform: 'translateY(-50%)' }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #6B5BFF', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}
                    </div>
                    {/* 動態輸入提示 */}
                    {userText && !isMeaningfulInput(userText) && (
                      <div style={{ color: '#ff9800', fontSize: 15, marginTop: 6, fontWeight: 600 }}>
                        請輸入至少12個字訓練表達能力
                      </div>
                    )}
                </div>
            </div>
            {/* Toast 浮窗 */}
            {toast && <div style={{ position:'fixed', top: 32, left:'50%', transform:'translateX(-50%)', background:'#ff9800', color:'#fff', padding:'12px 32px', borderRadius: 16, fontWeight:700, fontSize:18, zIndex:9999, boxShadow:'0 2px 12px #0002' }}>{toast}</div>}
            <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            
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
        </div>
    );
} 