import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  requiredPlan?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  requiredPlan = 'basic'
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const planNames = {
    basic: '基礎版 (NT$ 149/月)',
    advanced: '進階版 (NT$ 249/月)',
    professional: '專業版 (NT$ 349/月)',
    unlimited: '無限版 (NT$ 499/月)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        maxWidth: 400,
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        {/* 圖標 */}
        <div style={{
          fontSize: 48,
          marginBottom: 16,
          color: '#6B5BFF'
        }}>
          🚀
        </div>

        {/* 標題 */}
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#333',
          marginBottom: 12
        }}>
          {title}
        </h2>

        {/* 訊息 */}
        <p style={{
          fontSize: 16,
          color: '#666',
          marginBottom: 20,
          lineHeight: 1.6
        }}>
          {message}
        </p>

        {/* 友善提示 */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4ff 100%)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          border: '1px solid #e0e8ff'
        }}>
          <div style={{
            fontSize: 14,
            color: '#6B5BFF',
            fontWeight: 600,
            marginBottom: 8
          }}>
            💡 升級小提醒
          </div>
          <div style={{
            fontSize: 13,
            color: '#666',
            lineHeight: 1.4
          }}>
            • 升級後立即生效，無需等待<br/>
            • 可隨時取消，權益保留至本期結束<br/>
            • 支援多種付款方式，安全便捷
          </div>
        </div>

        {/* 需要的方案 */}
        {requiredPlan && (
          <div style={{
            background: '#fff',
            borderRadius: 10,
            padding: 14,
            marginBottom: 24,
            border: '2px solid #6B5BFF',
            boxShadow: '0 2px 8px #6B5BFF22'
          }}>
            <span style={{
              fontSize: 14,
              color: '#6B5BFF',
              fontWeight: 700
            }}>
              ✨ 建議方案：{planNames[requiredPlan as keyof typeof planNames]} 或更高
            </span>
          </div>
        )}

        {/* 按鈕組 */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center'
        }}>
          <button
            onClick={() => {
              onClose();
              navigate('/plans');
            }}
            style={{
              background: 'linear-gradient(135deg, #6B5BFF 0%, #00CFFF 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              flex: 1,
              boxShadow: '0 4px 12px #6B5BFF33',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px #6B5BFF44';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px #6B5BFF33';
            }}
          >
            🚀 立即升級
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: '#f8f9ff',
              color: '#6B5BFF',
              border: '2px solid #6B5BFF',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6B5BFF';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9ff';
              e.currentTarget.style.color = '#6B5BFF';
            }}
          >
            💭 稍後再說
          </button>
        </div>
      </div>
    </div>
  );
}; 