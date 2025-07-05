import React from 'react';
import { Player } from '../types';

interface SquareProps {
  value: Player | null;
  onClick: () => void;
  isGameEnded: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isGameEnded }) => {
  const playerXColor = 'text-teal-300';
  const playerOColor = 'text-amber-300';

  const baseClasses = "w-24 h-24 md:w-28 md:h-28 flex items-center justify-center text-5xl md:text-6xl font-extrabold rounded-lg transition-all duration-300 ease-in-out";
  const interactiveClasses = isGameEnded ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700';
  const valueColor = value === 'X' ? playerXColor : playerOColor;

  return (
    <button
      className={`${baseClasses} bg-slate-800 ${value ? valueColor : ''} ${interactiveClasses}`}
      onClick={onClick}
      disabled={isGameEnded || value !== null}
    >
      {value}
    </button>
  );
};

export default Square;
