import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function RelaxationTools() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [currentAudio, setCurrentAudio] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState('');
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(10); // 分鐘

  // 生成白噪音
  const generateWhiteNoise = () => {
    if (currentAudio) {
      currentAudio.close();
    }

    const audioContext = new AudioContext();
    const bufferSize = 4096;
    const whiteNoise = audioContext.createScriptProcessor(bufferSize, 1, 1);
    const gainNode = audioContext.createGain();
    
    whiteNoise.onaudioprocess = function(e) {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * volume;
      }
    };
    
    whiteNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    setCurrentAudio(audioContext);
    setIsPlaying(true);
    setCurrentSound('white-noise');
  };

  // 生成粉紅噪音
  const generatePinkNoise = () => {
    if (currentAudio) {
      currentAudio.close();
    }

    const audioContext = new AudioContext();
    const bufferSize = 4096;
    const pinkNoise = audioContext.createScriptProcessor(bufferSize, 1, 1);
    const gainNode = audioContext.createGain();
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    pinkNoise.onaudioprocess = function(e) {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5) * volume;
      }
    };
    
    pinkNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    setCurrentAudio(audioContext);
    setIsPlaying(true);
    setCurrentSound('pink-noise');
  };

  // 生成雨聲
  const generateRainSound = () => {
    if (currentAudio) {
      currentAudio.close();
    }

    const audioContext = new AudioContext();
    const bufferSize = 4096;
    const rainNoise = audioContext.createScriptProcessor(bufferSize, 1, 1);
    const gainNode = audioContext.createGain();
    
    rainNoise.onaudioprocess = function(e) {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const drop = Math.random() > 0.95 ? Math.random() * 0.5 : 0;
        output[i] = drop * volume;
      }
    };
    
    rainNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    setCurrentAudio(audioContext);
    setIsPlaying(true);
    setCurrentSound('rain');
  };

  // 停止播放
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.close();
      setCurrentAudio(null);
      setIsPlaying(false);
      setCurrentSound('');
    }
  };

  // 音量控制
  useEffect(() => {
    if (currentAudio) {
      const gainNode = currentAudio.createGain();
      gainNode.gain.value = volume;
    }
  }, [volume]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* 返回按鈕 */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: '#fff',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: '700',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        ← 返回
      </button>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        paddingTop: '60px'
      }}>
        {/* 標題 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '10px'
          }}>
            🧘 冥想與放鬆工具
          </h1>
          <p style={{
            color: '#fff',
            fontSize: '1.1rem',
            opacity: 0.9
          }}>
            幫助您放鬆身心，緩解壓力
          </p>
        </div>

        {/* 主要功能區域 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          {/* 生成式音頻 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#333',
              fontSize: '1.5rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🎵 生成式放鬆音頻
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <button
                onClick={generateWhiteNoise}
                disabled={isPlaying && currentSound === 'white-noise'}
                style={{
                  background: isPlaying && currentSound === 'white-noise' 
                    ? '#4CAF50' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '20px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isPlaying && currentSound === 'white-noise' ? 'default' : 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                🌫️ 白噪音
                <br />
                <small>助眠放鬆</small>
              </button>

              <button
                onClick={generatePinkNoise}
                disabled={isPlaying && currentSound === 'pink-noise'}
                style={{
                  background: isPlaying && currentSound === 'pink-noise' 
                    ? '#4CAF50' 
                    : 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '20px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isPlaying && currentSound === 'pink-noise' ? 'default' : 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                🌸 粉紅噪音
                <br />
                <small>自然放鬆</small>
              </button>

              <button
                onClick={generateRainSound}
                disabled={isPlaying && currentSound === 'rain'}
                style={{
                  background: isPlaying && currentSound === 'rain' 
                    ? '#4CAF50' 
                    : 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '20px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isPlaying && currentSound === 'rain' ? 'default' : 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                🌧️ 雨聲
                <br />
                <small>自然環境音</small>
              </button>
            </div>

            {/* 控制面板 */}
            {isPlaying && (
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '20px'
              }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>
                  🎛️ 控制面板
                </h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    音量: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <button
                  onClick={stopAudio}
                  style={{
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ⏹️ 停止播放
                </button>
              </div>
            )}
          </div>

          {/* 免費音效庫 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              color: '#333',
              fontSize: '1.5rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🎼 免費音效庫
            </h2>
            
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#856404', marginBottom: '15px' }}>
                🚧 開發中
              </h3>
              <p style={{ color: '#856404', lineHeight: '1.6' }}>
                我們正在收集免費的自然音效和冥想音樂。<br />
                包括：森林鳥叫、海浪聲、輕柔音樂等。<br />
                敬請期待！
              </p>
            </div>
          </div>

          {/* 使用說明 */}
          <div style={{
            background: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#0c5460', marginBottom: '15px' }}>
              💡 使用建議
            </h3>
            <ul style={{ color: '#0c5460', lineHeight: '1.6' }}>
              <li><strong>白噪音：</strong>適合助眠，屏蔽環境噪音</li>
              <li><strong>粉紅噪音：</strong>更自然的放鬆效果</li>
              <li><strong>雨聲：</strong>營造寧靜的自然環境</li>
              <li><strong>建議時長：</strong>10-30分鐘，配合深呼吸</li>
            </ul>
          </div>
        </div>

        {/* 返回主頁按鈕 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '15px 30px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            返回主頁
          </button>
        </div>
      </div>
    </div>
  );
}
