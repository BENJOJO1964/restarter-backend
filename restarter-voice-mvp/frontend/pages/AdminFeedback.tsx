import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Feedback {
  id: string;
  content: string;
  userEmail: string;
  userNickname: string;
  userLang: string;
  timestamp: number;
  status: 'new' | 'reviewed' | 'resolved';
  adminNotes: string;
}

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState<'new' | 'reviewed' | 'resolved'>('new');
  const navigate = useNavigate();

  const fetchFeedbacks = async () => {
    if (!adminKey) return;
    
    try {
      const response = await fetch(`/api/feedback?adminKey=${adminKey}`);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks);
        setIsAuthenticated(true);
      } else {
        alert('管理員金鑰錯誤');
      }
    } catch (error) {
      alert('取得意見列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminKey,
          status,
          adminNotes
        })
      });

      if (response.ok) {
        setFeedbacks(feedbacks.map(f => 
          f.id === feedbackId 
            ? { ...f, status, adminNotes, updatedAt: Date.now() }
            : f
        ));
        setSelectedFeedback(null);
        setAdminNotes('');
        alert('意見狀態已更新');
      } else {
        alert('更新失敗');
      }
    } catch (error) {
      alert('更新意見狀態失敗');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#ff4d4f';
      case 'reviewed': return '#faad14';
      case 'resolved': return '#52c41a';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return '新意見';
      case 'reviewed': return '已檢視';
      case 'resolved': return '已處理';
      default: return '未知';
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #e0e7ff 0%, #b7cfff 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: 18, 
          padding: 40, 
          boxShadow: '0 2px 16px #6B5BFF22',
          maxWidth: 400,
          width: '100%'
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#6B5BFF', marginBottom: 20, textAlign: 'center' }}>
            🔐 管理員登入
          </h1>
          <input
            type="password"
            placeholder="請輸入管理員金鑰"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0e7ff',
              borderRadius: 8,
              fontSize: 16,
              marginBottom: 20
            }}
            onKeyPress={(e) => e.key === 'Enter' && fetchFeedbacks()}
          />
          <button
            onClick={fetchFeedbacks}
            style={{
              width: '100%',
              background: '#6B5BFF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            登入
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#6B5BFF',
              border: '2px solid #6B5BFF',
              borderRadius: 8,
              padding: '12px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 12
            }}
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0e7ff 0%, #b7cfff 100%)', 
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        background: '#fff',
        borderRadius: 18,
        padding: 30,
        boxShadow: '0 2px 16px #6B5BFF22'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#6B5BFF' }}>
            📝 意見箱管理
          </h1>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              color: '#6B5BFF',
              border: '2px solid #6B5BFF',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            返回首頁
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            載入中...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                style={{
                  border: '2px solid #e0e7ff',
                  borderRadius: 12,
                  padding: '20px',
                  background: feedback.status === 'new' ? '#fff7e6' : '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: '8px' }}>
                      {feedback.userNickname} ({feedback.userLang})
                    </div>
                    <div style={{ color: '#666', fontSize: 14 }}>
                      {new Date(feedback.timestamp).toLocaleString('zh-TW')}
                    </div>
                  </div>
                  <div style={{
                    background: getStatusColor(feedback.status),
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {getStatusText(feedback.status)}
                  </div>
                </div>
                
                <div style={{
                  background: '#f7f8fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {feedback.content}
                </div>

                {feedback.adminNotes && (
                  <div style={{
                    background: '#e8f5e8',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    fontSize: '14px'
                  }}>
                    <strong>管理員備註：</strong> {feedback.adminNotes}
                  </div>
                )}

                <button
                  onClick={() => setSelectedFeedback(feedback)}
                  style={{
                    background: '#6B5BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  更新狀態
                </button>
              </div>
            ))}

            {feedbacks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                目前沒有意見回饋
              </div>
            )}
          </div>
        )}
      </div>

      {/* 更新狀態彈窗 */}
      {selectedFeedback && (
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
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#6B5BFF' }}>
              更新意見狀態
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>
                狀態：
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e0e7ff',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="new">新意見</option>
                <option value="reviewed">已檢視</option>
                <option value="resolved">已處理</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 700 }}>
                管理員備註：
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="輸入備註..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '2px solid #e0e7ff',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedFeedback(null)}
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={() => updateFeedbackStatus(selectedFeedback.id)}
                style={{
                  background: '#6B5BFF',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 