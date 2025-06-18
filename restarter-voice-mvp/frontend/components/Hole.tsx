import React from 'react';

type Mole = {
  name: string;
  emoji: string;
};

type HoleProps = {
  active: boolean;
  mole: Mole;
  onHit: () => void;
  hitAnim: boolean;
};

export default function Hole({ active, mole, onHit, hitAnim }: HoleProps) {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {active ? (
        <button
          className={`w-14 h-14 rounded-full bg-yellow-200 border-4 border-yellow-400 flex flex-col items-center justify-center text-3xl shadow-lg transition-transform duration-150 ${hitAnim ? 'scale-125 animate-bounce' : ''}`}
          onClick={onHit}
        >
          <span>{mole.emoji}</span>
          <span className="text-xs font-bold text-gray-700">{mole.name}</span>
        </button>
      ) : (
        <div className="w-14 h-14 rounded-full bg-gray-300 border-4 border-gray-400" />
      )}
    </div>
  );
} 