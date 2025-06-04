// JS Web 錄音服務，供 Flutter Web interop 使用
window.flutterRecorder = {
  mediaRecorder: null,
  audioChunks: [],
  startRecording: async function () {
    if (!navigator.mediaDevices) throw new Error('mediaDevices not supported');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };
    this.mediaRecorder.start();
  },
  stopRecording: async function () {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject('No recorder');
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}; 