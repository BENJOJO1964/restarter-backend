import React, { useRef, useState } from 'react';

export interface VirtualAvatarProps {
  avatar: 'male' | 'female';
  videoUrl?: string; // 嘴型動畫影片
  audioUrl?: string; // TTS 語音
  isSpeaking?: boolean;
  onAvatarChange?: (avatar: 'male' | 'female') => void;
}

const AVATAR_IMG = {
  male: '/avatars/male.png',
  female: '/avatars/female.png',
};

export default function VirtualAvatar({ avatar, videoUrl, audioUrl, isSpeaking, onAvatarChange }: VirtualAvatarProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setPlaying(true);
    }
  };
  const handleEnded = () => setPlaying(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
      <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 8 }}>
        {videoUrl ? (
          <video src={videoUrl} width={160} height={160} autoPlay muted loop style={{ borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <img src={AVATAR_IMG[avatar]} width={160} height={160} style={{ borderRadius: '50%', objectFit: 'cover', filter: isSpeaking ? 'brightness(1.1)' : 'none' }} alt={avatar} />
        )}
        <button onClick={() => onAvatarChange && onAvatarChange(avatar === 'male' ? 'female' : 'male')} style={{ position: 'absolute', right: 8, bottom: 8, background: '#fff', borderRadius: '50%', border: 'none', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>切換</button>
      </div>
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} />
      )}
      {audioUrl && (
        <button onClick={handlePlay} style={{ padding: '6px 18px', borderRadius: 8, background: '#6c63ff', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, marginTop: 8 }} disabled={playing}>
          {playing ? '播放中...' : '播放語音'}
        </button>
      )}
    </div>
  );
} 