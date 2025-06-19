import React, { useState } from 'react';

export default function WhackAMoleStart() {
  const [selectedTime, setSelectedTime] = useState<number|null>(null);

  const handleSelect = (seconds: number) => {
    setSelectedTime(seconds);
  };

  const handleStart = () => {
    if (selectedTime) {
      // 假設用 localStorage 傳遞時間，然後跳轉
      localStorage.setItem('whackamole_time', String(selectedTime));
      window.location.href = '/game';
    } else {
      alert('請先選擇遊戲時間！');
    }
  };

  return (
    <div className="bg-[url('/clay_background.png')] bg-cover bg-center min-h-screen flex flex-col justify-between items-center py-12 px-4 animate-pulse">
      {/* Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold text-red-700 text-center drop-shadow-lg mb-10 animate-bounce tracking-wider" style={{textShadow:'2px 2px 8px #fff8, 0 0 16px #b94a1f'}}>今天就讓怒氣出拳！</h1>

      {/* Time Selection */}
      <div className="mt-12 flex flex-col sm:flex-row gap-8 text-center">
        <button
          className={`bg-yellow-100 border-2 border-yellow-700 text-yellow-800 text-2xl font-semibold px-8 py-6 rounded-2xl shadow-xl hover:scale-105 hover:bg-yellow-200 transition transform drop-shadow ${selectedTime===30 ? 'ring-4 ring-yellow-400 scale-110' : ''}`}
          onClick={()=>handleSelect(30)}
        >
          <span className="text-3xl">⏲</span> <br/>我現在超煩 <span className="block text-lg">(30 秒)</span>
        </button>
        <button
          className={`bg-white border-2 border-red-600 text-red-700 text-2xl font-semibold px-8 py-6 rounded-2xl shadow-xl hover:scale-105 hover:bg-red-50 transition transform drop-shadow ${selectedTime===60 ? 'ring-4 ring-red-400 scale-110' : ''}`}
          onClick={()=>handleSelect(60)}
        >
          <span className="text-3xl">🔥</span> <br/>真的超怒啦！ <span className="block text-lg">(60 秒)</span>
        </button>
      </div>

      {/* Start Button */}
      <div className="mt-16">
        <button
          className="bg-red-700 text-white text-3xl px-16 py-7 rounded-full shadow-2xl hover:bg-red-800 hover:scale-105 active:scale-95 transition-all animate-pulse font-extrabold tracking-wider"
          onClick={handleStart}
        >
          🌟 直接開打！
        </button>
      </div>
    </div>
  );
} 