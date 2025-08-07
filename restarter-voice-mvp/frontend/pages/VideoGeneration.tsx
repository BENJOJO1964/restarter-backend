import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTestMode } from '../App';

const TEXT = {
  'zh-TW': {
    title: 'AI對嘴短影音生成',
    subtitle: '上傳圖片，輸入文字或音頻，生成對嘴短影音',
    uploadImage: '上傳圖片',
    uploadAudio: '上傳音頻',
    inputText: '輸入文字',
    textPlaceholder: '請輸入要轉換成語音的文字...',
    generateButton: '生成視頻',
    generating: '生成中...',
    downloadButton: '下載視頻',
    settings: '設置',
    poseStyle: '姿勢風格',
    resolution: '分辨率',
    preprocess: '預處理方式',
    stillMode: '靜止模式',
    batchSize: '批次大小',
    enhancer: '人臉增強',
    backButton: '返回',
    success: '視頻生成成功！',
    error: '生成失敗，請重試',
    loading: '正在生成視頻，請稍候...',
    imageSizeLimit: '支持 JPG, PNG, GIF 格式，最大 10MB',
    audioSizeLimit: '支持 WAV, MP3, M4A 格式，最大 50MB',
    imageSizeError: '圖片文件大小不能超過 10MB',
    audioSizeError: '音頻文件大小不能超過 50MB',
    imageFormatError: '請選擇有效的圖片文件 (支持 JPG, PNG, GIF 格式)',
    audioFormatError: '請選擇有效的音頻文件 (支持 WAV, MP3, M4A 格式)'
  },
  'zh-CN': {
    title: 'AI对嘴短视频生成',
    subtitle: '上传图片，输入文字或音频，生成对嘴短视频',
    uploadImage: '上传图片',
    uploadAudio: '上传音频',
    inputText: '输入文字',
    textPlaceholder: '请输入要转换成语音的文字...',
    generateButton: '生成视频',
    generating: '生成中...',
    downloadButton: '下载视频',
    settings: '设置',
    poseStyle: '姿势风格',
    resolution: '分辨率',
    preprocess: '预处理方式',
    stillMode: '静止模式',
    batchSize: '批次大小',
    enhancer: '人脸增强',
    backButton: '返回',
    success: '视频生成成功！',
    error: '生成失败，请重试',
    loading: '正在生成视频，请稍候...',
    imageSizeLimit: '支持 JPG, PNG, GIF 格式，最大 10MB',
    audioSizeLimit: '支持 WAV, MP3, M4A 格式，最大 50MB',
    imageSizeError: '图片文件大小不能超过 10MB',
    audioSizeError: '音频文件大小不能超过 50MB',
    imageFormatError: '请选择有效的图片文件 (支持 JPG, PNG, GIF 格式)',
    audioFormatError: '请选择有效的音频文件 (支持 WAV, MP3, M4A 格式)'
  },
  'en': {
    title: 'AI Lip-Sync Video Generation',
    subtitle: 'Upload image, input text or audio to generate lip-sync videos',
    uploadImage: 'Upload Image',
    uploadAudio: 'Upload Audio',
    inputText: 'Input Text',
    textPlaceholder: 'Please enter text to convert to speech...',
    generateButton: 'Generate Video',
    generating: 'Generating...',
    downloadButton: 'Download Video',
    settings: 'Settings',
    poseStyle: 'Pose Style',
    resolution: 'Resolution',
    preprocess: 'Preprocess',
    stillMode: 'Still Mode',
    batchSize: 'Batch Size',
    enhancer: 'Face Enhancer',
    backButton: 'Back',
    success: 'Video generated successfully!',
    error: 'Generation failed, please try again',
    loading: 'Generating video, please wait...',
    imageSizeLimit: 'Supports JPG, PNG, GIF formats, max 10MB',
    audioSizeLimit: 'Supports WAV, MP3, M4A formats, max 50MB',
    imageSizeError: 'Image file size cannot exceed 10MB',
    audioSizeError: 'Audio file size cannot exceed 50MB',
    imageFormatError: 'Please select a valid image file (supports JPG, PNG, GIF formats)',
    audioFormatError: 'Please select a valid audio file (supports WAV, MP3, M4A formats)'
  }
};

export default function VideoGeneration() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { isTestMode } = useTestMode();
  const t = TEXT[lang] || TEXT['zh-TW'];

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // 設置選項
  const [poseStyle, setPoseStyle] = useState(0);
  const [resolution, setResolution] = useState(128);
  const [preprocess, setPreprocess] = useState('crop');
  const [stillMode, setStillMode] = useState(false);
  const [batchSize, setBatchSize] = useState(2);
  const [enhancer, setEnhancer] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // 檢查文件大小 (限制為 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(t.imageSizeError);
        return;
      }
      setImageFile(file);
      setError(null);
    } else {
      setError(t.imageFormatError);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      // 檢查文件大小 (限制為 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        setError(t.audioSizeError);
        return;
      }
      setAudioFile(file);
      setError(null);
    } else {
      setError(t.audioFormatError);
    }
  };

  const handleGenerateVideo = async () => {
    if (!imageFile) {
      setError('請上傳圖片');
      return;
    }

    if (!audioFile && !text.trim()) {
      setError('請上傳音頻或輸入文字');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setProgressMessage('開始生成視頻...');

    // 模擬進度更新
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          setProgressMessage('正在處理視頻...');
          return prev + Math.random() * 10;
        }
        return prev;
      });
    }, 2000);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (audioFile) {
        formData.append('audio', audioFile);
      }
      if (text.trim()) {
        formData.append('text', text.trim());
      }
      formData.append('pose_style', poseStyle.toString());
      formData.append('size_of_image', resolution.toString());
      formData.append('preprocess_type', preprocess);
      formData.append('is_still_mode', stillMode.toString());
      formData.append('batch_size', batchSize.toString());
      formData.append('enhancer', enhancer.toString());

      const response = await fetch('/api/video-generation/generate-video', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedVideoUrl(result.videoUrl);
        setError(null);
        setProgress(100);
        setProgressMessage('視頻生成完成！');
      } else {
        setError(result.error || t.error);
        setProgress(0);
        setProgressMessage('');
      }
    } catch (err) {
      setError(t.error);
      console.error('視頻生成錯誤:', err);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = 'generated-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6B5BFF 0%, #23c6e6 100%)',
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
          color: '#6B5BFF',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: '700',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        ← {t.backButton}
      </button>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        paddingTop: '60px'
      }}>
        {/* 標題 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: '900',
            marginBottom: '10px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {t.title}
          </h1>
          <p style={{
            color: '#fff',
            fontSize: '1.1rem',
            opacity: 0.9
          }}>
            {t.subtitle}
          </p>
        </div>

        {/* 主要內容 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          {/* 上傳區域 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#6B5BFF', marginBottom: '20px' }}>📸 {t.uploadImage}</h3>
            <div style={{
              border: '2px dashed #6B5BFF',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: imageFile ? '#f0f8ff' : '#fafafa'
            }} onClick={() => imageInputRef.current?.click()}>
              {imageFile ? (
                <div>
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                  />
                  <p style={{ marginTop: '10px', color: '#6B5BFF' }}>{imageFile.name}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📷</div>
                  <p style={{ color: '#666' }}>點擊上傳圖片</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    {t.imageSizeLimit}
                  </p>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* 音頻上傳 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#6B5BFF', marginBottom: '20px' }}>🎵 {t.uploadAudio}</h3>
            <div style={{
              border: '2px dashed #6B5BFF',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: audioFile ? '#f0f8ff' : '#fafafa'
            }} onClick={() => audioInputRef.current?.click()}>
              {audioFile ? (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎵</div>
                  <p style={{ color: '#6B5BFF' }}>{audioFile.name}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎵</div>
                  <p style={{ color: '#666' }}>點擊上傳音頻（可選）</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    {t.audioSizeLimit}
                  </p>
                </div>
              )}
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* 文字輸入 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#6B5BFF', marginBottom: '20px' }}>✍️ {t.inputText}</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.textPlaceholder}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* 設置選項 */}
          {/* 優化提示 */}
          <div style={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🚀 速度優化提示</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>選擇64x64分辨率可將時間縮短到30秒-1分鐘</li>
              <li>使用小於5MB的JPG圖片</li>
              <li>選擇小於10MB的音頻文件</li>
              <li>避免複雜背景和多人臉圖片</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#6B5BFF', marginBottom: '20px' }}>⚙️ {t.settings}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  {t.poseStyle}: {poseStyle}
                </label>
                <input
                  type="range"
                  min="0"
                  max="46"
                  value={poseStyle}
                  onChange={(e) => setPoseStyle(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  {t.resolution}
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                >
                  <option value={64}>64 (極快)</option>
                  <option value={128}>128 (快速)</option>
                  <option value={256}>256 (標準)</option>
                  <option value={512}>512 (高品質)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  {t.preprocess}
                </label>
                <select
                  value={preprocess}
                  onChange={(e) => setPreprocess(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                >
                  <option value="crop">crop</option>
                  <option value="resize">resize</option>
                  <option value="full">full</option>
                  <option value="extcrop">extcrop</option>
                  <option value="extfull">extfull</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={stillMode}
                    onChange={(e) => setStillMode(e.target.checked)}
                  />
                  {t.stillMode}
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={enhancer}
                    onChange={(e) => setEnhancer(e.target.checked)}
                  />
                  {t.enhancer}
                </label>
              </div>
            </div>
          </div>

          {/* 進度條 */}
          {isGenerating && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #6B5BFF 0%, #23c6e6 100%)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{ 
                textAlign: 'center', 
                color: '#6B5BFF',
                fontSize: '14px',
                margin: 0
              }}>
                {progressMessage} ({progress}%)
              </p>
            </div>
          )}

          {/* 生成按鈕 */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating || !imageFile || (!audioFile && !text.trim())}
              style={{
                background: isGenerating || !imageFile || (!audioFile && !text.trim()) ? '#ccc' : 'linear-gradient(135deg, #6B5BFF 0%, #23c6e6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 40px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: isGenerating || !imageFile || (!audioFile && !text.trim()) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(107, 91, 255, 0.3)'
              }}
            >
              {isGenerating ? t.generating : t.generateButton}
            </button>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* 生成的視頻 */}
          {generatedVideoUrl && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#6B5BFF', marginBottom: '20px' }}>✅ {t.success}</h3>
              <video
                controls
                style={{
                  maxWidth: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}
              >
                <source src={generatedVideoUrl} type="video/mp4" />
                您的瀏覽器不支持視頻播放。
              </video>
              <button
                onClick={handleDownload}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '20px',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                }}
              >
                📥 {t.downloadButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
