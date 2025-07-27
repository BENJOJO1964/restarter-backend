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
    backToHome: '返回首頁',
    startAssessment: '開始評估',
    submitAssessment: '提交評估',
    cancelAssessment: '取消',
    assessmentComplete: '評估完成',
    viewReport: '查看報告',
    closeReport: '關閉報告',
    // 評估問題
    q1Title: '人際關係',
    q1Desc: '您與他人的互動和社交能力如何？',
    q2Title: '就業狀況',
    q2Desc: '您目前的工作穩定性和發展前景如何？',
    q3Title: '家庭關係',
    q3Desc: '您與家人的相處和溝通狀況如何？',
    q4Title: '未來信心',
    q4Desc: '您對未來的樂觀程度和規劃如何？',
    q5Title: '社會接納',
    q5Desc: '您感覺被社會接受和認可的程度如何？',
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
    backToHome: '返回首页',
    startAssessment: '开始评估',
    submitAssessment: '提交评估',
    cancelAssessment: '取消',
    assessmentComplete: '评估完成',
    viewReport: '查看报告',
    closeReport: '关闭报告',
    // 评估问题
    q1Title: '人际关系',
    q1Desc: '您与他人的互动和社交能力如何？',
    q2Title: '就业状况',
    q2Desc: '您目前的工作稳定性和发展前景如何？',
    q3Title: '家庭关系',
    q3Desc: '您与家人的相处和沟通状况如何？',
    q4Title: '未来信心',
    q4Desc: '您对未来的乐观程度和规划如何？',
    q5Title: '社会接纳',
    q5Desc: '您感觉被社会接受和认可的程度如何？',
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
    backToHome: 'Back to Home',
    startAssessment: 'Start Assessment',
    submitAssessment: 'Submit Assessment',
    cancelAssessment: 'Cancel',
    assessmentComplete: 'Assessment Complete',
    viewReport: 'View Report',
    closeReport: 'Close Report',
    // Assessment questions
    q1Title: 'Interpersonal Relationships',
    q1Desc: 'How is your interaction and social ability with others?',
    q2Title: 'Employment Status',
    q2Desc: 'How is your current job stability and development prospects?',
    q3Title: 'Family Relationships',
    q3Desc: 'How is your relationship and communication with family?',
    q4Title: 'Future Confidence',
    q4Desc: 'How optimistic are you about the future and your planning?',
    q5Title: 'Social Acceptance',
    q5Desc: 'How accepted and recognized do you feel by society?',
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
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
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
      answerMap[answers.q5 as keyof typeof answerMap] || 3
    ];
    
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / 5;
    
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
        acceptance: assessmentAnswers.q5
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
    { key: 'q5', title: t.q5Title, desc: t.q5Desc }
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
            marginBottom: '30px'
          }}>
            {t.subtitle}
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
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#333',
              marginBottom: '20px',
              textAlign: 'center'
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