import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTestMode } from '../App';
import Footer from '../components/Footer';

interface Milestone {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
  completed: boolean;
}

const TEXTS = {
  'zh-TW': {
    title: '社會融入度評估',
    subtitle: '評估您的社會融入度，獲得專業建議',
    subtitle2: '勇敢面對並定期檢測自身社會融入程度進步狀況，每一次評估都是成長的機會',
    backToHome: '返回首頁',
    startAssessment: '開始評估',
    submitAssessment: '提交評估',
    cancelAssessment: '取消',
    closeAssessment: '關閉',
    assessmentComplete: '評估完成',
    viewReport: '查看報告',
    closeReport: '關閉報告',
    // 評估問題
    q1Title: '人際關係',
    q1Desc: '最近6個月，您與他人的互動和社交能力如何？',
    q2Title: '就業狀況',
    q2Desc: '最近1年，您的工作穩定性和發展前景如何？',
    q3Title: '家庭關係',
    q3Desc: '最近6個月，您與家人的相處和溝通狀況如何？',
    q4Title: '未來信心',
    q4Desc: '最近1年，您對未來的樂觀程度和規劃如何？',
    q5Title: '社會接納',
    q5Desc: '最近6個月，您感覺被社會接受和認可的程度如何？',
    q6Title: '情緒管理',
    q6Desc: '最近6個月，您處理壓力和負面情緒的能力如何？',
    q7Title: '生活規律',
    q7Desc: '最近1年，您的生活作息和規律性如何？',
    q8Title: '學習成長',
    q8Desc: '最近1年，您在技能學習和個人成長方面的投入如何？',
    q9Title: '財務管理',
    q9Desc: '最近1年，您的財務規劃和理財能力如何？',
    q10Title: '健康狀況',
    q10Desc: '最近6個月，您的身體和心理健康狀況如何？',
    q11Title: '社交網絡',
    q11Desc: '最近6個月，您建立和維護社交關係的能力如何？',
    q12Title: '目標設定',
    q12Desc: '最近1年，您設定和追求個人目標的能力如何？',
    q13Title: '適應能力',
    q13Desc: '最近6個月，您適應環境變化和挑戰的能力如何？',
    q14Title: '責任感',
    q14Desc: '最近1年，您對自己和他人負責的態度如何？',
    q15Title: '自我認同',
    q15Desc: '最近6個月，您對自我價值和身份的認同感如何？',
    q16Title: '社區參與',
    q16Desc: '最近1年，您參與社區活動和公益服務的情況如何？',
    q17Title: '職業發展',
    q17Desc: '最近1年，您在職業技能提升和職涯規劃方面的表現如何？',
    q18Title: '人際衝突處理',
    q18Desc: '最近6個月，您處理人際衝突和分歧的能力如何？',
    q19Title: '時間管理',
    q19Desc: '最近1年，您合理安排時間和優先級的能力如何？',
    q20Title: '整體滿意度',
    q20Desc: '最近6個月，您對整體生活狀況的滿意度如何？',
    // 選項
    excellent: '非常好',
    good: '良好',
    fair: '一般',
    poor: '需要改善',
    // 報告
    scoreLabel: '評估分數',
    resultLabel: '評估結果',
    descriptionLabel: '詳細分析',
    recommendationsLabel: '改善建議',
    analysisLabel: '專業分析'
  },
  'zh-CN': {
    title: '社会融入度评估',
    subtitle: '评估您的社会融入度，获得专业建议',
    subtitle2: '勇敢面对并定期检测自身社会融入程度进步状况，每一次评估都是成长的机会',
    backToHome: '返回首页',
    startAssessment: '开始评估',
    submitAssessment: '提交评估',
    cancelAssessment: '取消',
    closeAssessment: '关闭',
    assessmentComplete: '评估完成',
    viewReport: '查看报告',
    closeReport: '关闭报告',
    // 评估问题
    q1Title: '人际关系',
    q1Desc: '最近6个月，您与他人的互动和社交能力如何？',
    q2Title: '就业状况',
    q2Desc: '最近1年，您的工作稳定性和发展前景如何？',
    q3Title: '家庭关系',
    q3Desc: '最近6个月，您与家人的相处和沟通状况如何？',
    q4Title: '未来信心',
    q4Desc: '最近1年，您对未来的乐观程度和规划如何？',
    q5Title: '社会接纳',
    q5Desc: '最近6个月，您感觉被社会接受和认可的程度如何？',
    q6Title: '情绪管理',
    q6Desc: '最近6个月，您处理压力和负面情绪的能力如何？',
    q7Title: '生活规律',
    q7Desc: '最近1年，您的生活作息和规律性如何？',
    q8Title: '学习成长',
    q8Desc: '最近1年，您在技能学习和个人成长方面的投入如何？',
    q9Title: '财务管理',
    q9Desc: '最近1年，您的财务规划和理财能力如何？',
    q10Title: '健康状况',
    q10Desc: '最近6个月，您的身体和心理健康状况如何？',
    q11Title: '社交网络',
    q11Desc: '最近6个月，您建立和维护社交关系的能力如何？',
    q12Title: '目标设定',
    q12Desc: '最近1年，您设定和追求个人目标的能力如何？',
    q13Title: '适应能力',
    q13Desc: '最近6个月，您适应环境变化和挑战的能力如何？',
    q14Title: '责任感',
    q14Desc: '最近1年，您对自己和他人负责的态度如何？',
    q15Title: '自我认同',
    q15Desc: '最近6个月，您对自我价值和身份的认同感如何？',
    q16Title: '社区参与',
    q16Desc: '最近1年，您参与社区活动和公益服务的情况如何？',
    q17Title: '职业发展',
    q17Desc: '最近1年，您在职业技能提升和职涯规划方面的表现如何？',
    q18Title: '人际冲突处理',
    q18Desc: '最近6个月，您处理人际冲突和分歧的能力如何？',
    q19Title: '时间管理',
    q19Desc: '最近1年，您合理安排时间和优先级的能力如何？',
    q20Title: '整体满意度',
    q20Desc: '最近6个月，您对整体生活状况的满意度如何？',
    // 选项
    excellent: '非常好',
    good: '良好',
    fair: '一般',
    poor: '需要改善',
    // 报告
    scoreLabel: '评估分数',
    resultLabel: '评估结果',
    descriptionLabel: '详细分析',
    recommendationsLabel: '改善建议',
    analysisLabel: '专业分析'
  },
  'en': {
    title: 'Social Integration Assessment',
    subtitle: 'Assess your social integration and get professional advice',
    subtitle2: 'Face challenges bravely and regularly monitor your social integration progress, every assessment is an opportunity for growth',
    backToHome: 'Back to Home',
    startAssessment: 'Start Assessment',
    submitAssessment: 'Submit Assessment',
    cancelAssessment: 'Cancel',
    closeAssessment: 'Close',
    assessmentComplete: 'Assessment Complete',
    viewReport: 'View Report',
    closeReport: 'Close Report',
    // Assessment questions
    q1Title: 'Interpersonal Relationships',
    q1Desc: 'In the past 6 months, how is your interaction and social ability with others?',
    q2Title: 'Employment Status',
    q2Desc: 'In the past year, how is your job stability and development prospects?',
    q3Title: 'Family Relationships',
    q3Desc: 'In the past 6 months, how is your relationship and communication with family?',
    q4Title: 'Future Confidence',
    q4Desc: 'In the past year, how optimistic are you about the future and your planning?',
    q5Title: 'Social Acceptance',
    q5Desc: 'In the past 6 months, how accepted and recognized do you feel by society?',
    q6Title: 'Emotional Management',
    q6Desc: 'In the past 6 months, how well do you handle stress and negative emotions?',
    q7Title: 'Life Routine',
    q7Desc: 'In the past year, how regular is your daily routine and lifestyle?',
    q8Title: 'Learning & Growth',
    q8Desc: 'In the past year, how much have you invested in skill learning and personal growth?',
    q9Title: 'Financial Management',
    q9Desc: 'In the past year, how is your financial planning and money management?',
    q10Title: 'Health Status',
    q10Desc: 'In the past 6 months, how is your physical and mental health?',
    q11Title: 'Social Network',
    q11Desc: 'In the past 6 months, how well do you build and maintain social relationships?',
    q12Title: 'Goal Setting',
    q12Desc: 'In the past year, how well do you set and pursue personal goals?',
    q13Title: 'Adaptability',
    q13Desc: 'In the past 6 months, how well do you adapt to environmental changes and challenges?',
    q14Title: 'Responsibility',
    q14Desc: 'In the past year, how responsible are you towards yourself and others?',
    q15Title: 'Self-Identity',
    q15Desc: 'In the past 6 months, how strong is your sense of self-worth and identity?',
    q16Title: 'Community Participation',
    q16Desc: 'In the past year, how involved are you in community activities and public service?',
    q17Title: 'Career Development',
    q17Desc: 'In the past year, how well have you performed in skill enhancement and career planning?',
    q18Title: 'Conflict Resolution',
    q18Desc: 'In the past 6 months, how well do you handle interpersonal conflicts and disagreements?',
    q19Title: 'Time Management',
    q19Desc: 'In the past year, how well do you manage time and prioritize tasks?',
    q20Title: 'Overall Satisfaction',
    q20Desc: 'In the past 6 months, how satisfied are you with your overall life situation?',
    // Options
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Needs Improvement',
    // Report
    scoreLabel: 'Assessment Score',
    resultLabel: 'Assessment Result',
    descriptionLabel: 'Detailed Analysis',
    recommendationsLabel: 'Improvement Suggestions',
    analysisLabel: 'Professional Analysis'
  }
};

export default function SocialIntegration() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { isTestMode } = useTestMode();
  const t = TEXTS[lang as keyof typeof TEXTS] || TEXTS['zh-TW'];

  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '',
    q11: '', q12: '', q13: '', q14: '', q15: '', q16: '', q17: '', q18: '', q19: '', q20: ''
  });
  const [assessmentReport, setAssessmentReport] = useState<any>(null);

  // 預設評估結果映射表
  const getAssessmentResult = (answers: any) => {
    const answerMap = {
      'excellent': 5,
      'good': 4,
      'fair': 3,
      'poor': 2
    };
    
    // 計算總分
    const scores = [
      answerMap[answers.q1 as keyof typeof answerMap] || 3,
      answerMap[answers.q2 as keyof typeof answerMap] || 3,
      answerMap[answers.q3 as keyof typeof answerMap] || 3,
      answerMap[answers.q4 as keyof typeof answerMap] || 3,
      answerMap[answers.q5 as keyof typeof answerMap] || 3,
      answerMap[answers.q6 as keyof typeof answerMap] || 3,
      answerMap[answers.q7 as keyof typeof answerMap] || 3,
      answerMap[answers.q8 as keyof typeof answerMap] || 3,
      answerMap[answers.q9 as keyof typeof answerMap] || 3,
      answerMap[answers.q10 as keyof typeof answerMap] || 3,
      answerMap[answers.q11 as keyof typeof answerMap] || 3,
      answerMap[answers.q12 as keyof typeof answerMap] || 3,
      answerMap[answers.q13 as keyof typeof answerMap] || 3,
      answerMap[answers.q14 as keyof typeof answerMap] || 3,
      answerMap[answers.q15 as keyof typeof answerMap] || 3,
      answerMap[answers.q16 as keyof typeof answerMap] || 3,
      answerMap[answers.q17 as keyof typeof answerMap] || 3,
      answerMap[answers.q18 as keyof typeof answerMap] || 3,
      answerMap[answers.q19 as keyof typeof answerMap] || 3,
      answerMap[answers.q20 as keyof typeof answerMap] || 3
    ];
    
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / 20;
    
    // 根據分數範圍返回評估結果
    if (averageScore >= 4.5) {
      return {
        score: averageScore,
        result: '優秀',
        description: '你的社會融入度非常高，在人際關係、就業狀況、家庭關係等方面都表現出色。',
        recommendations: [
          '繼續保持現有的良好狀態',
          '可以考慮擔任志工幫助其他更生人',
          '分享你的成功經驗給其他需要幫助的人',
          '參與社區活動擴大影響力'
        ],
        analysis: '基於你的評估結果，你在各個方面都表現優秀，顯示出良好的社會適應能力和積極的生活態度。建議繼續保持這種狀態，並可以考慮幫助其他需要支持的人。'
      };
    } else if (averageScore >= 3.5) {
      return {
        score: averageScore,
        result: '良好',
        description: '你的社會融入度良好，在大部分方面都有不錯的表現，還有提升空間。',
        recommendations: [
          '參加更多社交活動擴大交友圈',
          '尋求職業技能培訓提升就業競爭力',
          '與家人多溝通改善家庭關係',
          '制定具體的個人發展計劃'
        ],
        analysis: '你的社會融入度處於良好水平，顯示出積極的改善趨勢。建議在現有基礎上進一步提升，特別是在就業技能和人際關係方面。'
      };
    } else if (averageScore >= 2.5) {
      return {
        score: averageScore,
        result: '一般',
        description: '你的社會融入度一般，在某些方面需要改善，建議尋求更多支持。',
        recommendations: [
          '建議尋求專業輔導師協助',
          '參加更生人互助團體',
          '制定具體的改善計劃',
          '逐步建立支持網絡'
        ],
        analysis: '你的社會融入度處於一般水平，這表明在某些方面還需要改善。建議尋求專業支持，制定具體的改善計劃，並逐步建立支持網絡。'
      };
    } else {
      return {
        score: averageScore,
        result: '需要改善',
        description: '你的社會融入度需要改善，建議尋求專業輔導和支持。',
        recommendations: [
          '立即聯繫專業輔導師',
          '參加更生人支持計劃',
          '尋求心理諮商服務',
          '建立穩定的生活規律'
        ],
        analysis: '你的社會融入度需要改善，建議立即尋求專業輔導和支持。這不是失敗，而是需要更多幫助的表現。專業輔導師可以幫助你制定適合的改善計劃。'
      };
    }
  };

  const handleSubmitAssessment = () => {
    // 檢查是否所有問題都已回答
    const allAnswered = Object.values(assessmentAnswers).every(answer => answer !== '');
    if (!allAnswered) {
      alert('請回答所有問題');
      return;
    }
    
    // 獲取預設評估結果
    const assessmentResult = getAssessmentResult(assessmentAnswers);
    
    // 生成詳細報告
    const report = {
      score: assessmentResult.score,
      result: assessmentResult.result,
      description: assessmentResult.description,
      recommendations: assessmentResult.recommendations,
      analysis: assessmentResult.analysis,
      details: {
        relationships: assessmentAnswers.q1,
        employment: assessmentAnswers.q2,
        family: assessmentAnswers.q3,
        confidence: assessmentAnswers.q4,
        acceptance: assessmentAnswers.q5,
        emotional: assessmentAnswers.q6,
        routine: assessmentAnswers.q7,
        learning: assessmentAnswers.q8,
        financial: assessmentAnswers.q9,
        health: assessmentAnswers.q10,
        social: assessmentAnswers.q11,
        goals: assessmentAnswers.q12,
        adaptability: assessmentAnswers.q13,
        responsibility: assessmentAnswers.q14,
        identity: assessmentAnswers.q15,
        community: assessmentAnswers.q16,
        career: assessmentAnswers.q17,
        conflict: assessmentAnswers.q18,
        time: assessmentAnswers.q19,
        satisfaction: assessmentAnswers.q20
      }
    };
    
    setAssessmentReport(report);
    setShowAssessmentDialog(false);
    setShowReportDialog(true);
  };

  const questions = [
    { key: 'q1', title: t.q1Title, desc: t.q1Desc },
    { key: 'q2', title: t.q2Title, desc: t.q2Desc },
    { key: 'q3', title: t.q3Title, desc: t.q3Desc },
    { key: 'q4', title: t.q4Title, desc: t.q4Desc },
    { key: 'q5', title: t.q5Title, desc: t.q5Desc },
    { key: 'q6', title: t.q6Title, desc: t.q6Desc },
    { key: 'q7', title: t.q7Title, desc: t.q7Desc },
    { key: 'q8', title: t.q8Title, desc: t.q8Desc },
    { key: 'q9', title: t.q9Title, desc: t.q9Desc },
    { key: 'q10', title: t.q10Title, desc: t.q10Desc },
    { key: 'q11', title: t.q11Title, desc: t.q11Desc },
    { key: 'q12', title: t.q12Title, desc: t.q12Desc },
    { key: 'q13', title: t.q13Title, desc: t.q13Desc },
    { key: 'q14', title: t.q14Title, desc: t.q14Desc },
    { key: 'q15', title: t.q15Title, desc: t.q15Desc },
    { key: 'q16', title: t.q16Title, desc: t.q16Desc },
    { key: 'q17', title: t.q17Title, desc: t.q17Desc },
    { key: 'q18', title: t.q18Title, desc: t.q18Desc },
    { key: 'q19', title: t.q19Title, desc: t.q19Desc },
    { key: 'q20', title: t.q20Title, desc: t.q20Desc }
  ];

  const options = [
    { value: 'excellent', label: t.excellent },
    { value: 'good', label: t.good },
    { value: 'fair', label: t.fair },
    { value: 'poor', label: t.poor }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 頂部導航 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          ← {t.backToHome}
        </button>
        
        <h1 style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: '700',
          margin: 0,
          textAlign: 'center'
        }}>
          {t.title}
        </h1>
        
        <div style={{ width: '100px' }}></div>
      </div>

      {/* 主要內容 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px'
      }}>
        {/* 評估介紹卡片 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            📊
          </div>
          
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '16px'
          }}>
            {t.title}
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {t.subtitle}
          </p>
          
          <p style={{
            fontSize: '14px',
            color: '#888',
            lineHeight: '1.5',
            marginBottom: '30px',
            fontStyle: 'italic'
          }}>
            {t.subtitle2}
          </p>
          
          <button
            onClick={() => setShowAssessmentDialog(true)}
            style={{
              background: 'linear-gradient(135deg, #6B5BFF, #5A4FCF)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(107, 91, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 91, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(107, 91, 255, 0.3)';
            }}
          >
            {t.startAssessment}
          </button>
        </div>
      </div>

      {/* 評估對話框 */}
      {showAssessmentDialog && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* 關閉按鈕 */}
            <button
              onClick={() => setShowAssessmentDialog(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#666',
                cursor: 'pointer',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#666';
              }}
            >
              ×
            </button>
            
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#333',
              marginBottom: '20px',
              textAlign: 'center',
              paddingRight: '40px'
            }}>
              {t.title}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {questions.map((question, index) => (
                <div key={question.key} style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '16px',
                  padding: '20px',
                  background: '#fafafa'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px'
                  }}>
                    {index + 1}. {question.title}
                  </h4>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '16px'
                  }}>
                    {question.desc}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {options.map(option => (
                      <label key={option.value} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: assessmentAnswers[question.key as keyof typeof assessmentAnswers] === option.value ? '#6B5BFF' : 'white',
                        color: assessmentAnswers[question.key as keyof typeof assessmentAnswers] === option.value ? 'white' : '#333',
                        border: `2px solid ${assessmentAnswers[question.key as keyof typeof assessmentAnswers] === option.value ? '#6B5BFF' : '#ddd'}`,
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="radio"
                          name={question.key}
                          value={option.value}
                          checked={assessmentAnswers[question.key as keyof typeof assessmentAnswers] === option.value}
                          onChange={(e) => setAssessmentAnswers({
                            ...assessmentAnswers,
                            [question.key]: e.target.value
                          })}
                          style={{ marginRight: '12px' }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '30px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowAssessmentDialog(false)}
                style={{
                  background: '#f0f0f0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t.cancelAssessment}
              </button>
              
              <button
                onClick={handleSubmitAssessment}
                style={{
                  background: 'linear-gradient(135deg, #6B5BFF, #5A4FCF)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t.submitAssessment}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 評估報告對話框 */}
      {showReportDialog && assessmentReport && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                📊
              </div>
              
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '8px'
              }}>
                {t.assessmentComplete}
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 分數和結果 */}
              <div style={{
                background: 'linear-gradient(135deg, #6B5BFF, #5A4FCF)',
                color: 'white',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  {assessmentReport.score.toFixed(1)}/5.0
                </div>
                
                <div style={{
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  {assessmentReport.result}
                </div>
              </div>
              
              {/* 詳細分析 */}
              <div style={{
                border: '2px solid #f0f0f0',
                borderRadius: '16px',
                padding: '20px',
                background: '#fafafa'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  {t.descriptionLabel}
                </h4>
                
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  {assessmentReport.description}
                </p>
              </div>
              
              {/* 專業分析 */}
              <div style={{
                border: '2px solid #f0f0f0',
                borderRadius: '16px',
                padding: '20px',
                background: '#fafafa'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  {t.analysisLabel}
                </h4>
                
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  {assessmentReport.analysis}
                </p>
              </div>
              
              {/* 改善建議 */}
              <div style={{
                border: '2px solid #f0f0f0',
                borderRadius: '16px',
                padding: '20px',
                background: '#fafafa'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  {t.recommendationsLabel}
                </h4>
                
                <ul style={{
                  fontSize: '16px',
                  color: '#666',
                  lineHeight: '1.6',
                  paddingLeft: '20px'
                }}>
                  {assessmentReport.recommendations.map((rec: string, index: number) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <button
                onClick={() => setShowReportDialog(false)}
                style={{
                  background: 'linear-gradient(135deg, #6B5BFF, #5A4FCF)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t.closeReport}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
} 