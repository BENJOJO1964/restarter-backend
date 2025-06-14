import React, { useState } from 'react';

export default function AudioRecorder({ onAudio }: { onAudio: (audio: Blob) => void }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder|null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    setMediaRecorder(mr);
    setChunks([]);
    mr.ondataavailable = e => setChunks(prev => [...prev, e.data]);
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      onAudio(blob);
    };
    mr.start();
    setRecording(true);
  };
  const stop = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };
  return (
    <div>
      <button onClick={recording ? stop : start}>
        {recording ? '停止錄音' : '開始錄音'}
      </button>
    </div>
  );
}
