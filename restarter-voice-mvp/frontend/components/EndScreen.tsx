import React from 'react';

type EndScreenProps = {
  score: number;
  onRestart: () => void;
};

export default function EndScreen({ score, onRestart }: EndScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center">
        <div className="text-2xl font-bold mb-4">遊戲結束！</div>
        <div className="text-xl mb-2">你的分數：<span className="text-red-500 font-bold">{score}</span></div>
        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
          onClick={onRestart}
        >
          再玩一次
        </button>
      </div>
    </div>
  );
} 