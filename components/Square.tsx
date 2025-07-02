
import React from 'react';
import { Player } from '../types';

interface SquareProps {
  value: Player | null;
  onClick: () => void;
  isWinner: boolean;
  isGameEnded: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinner, isGameEnded }) => {
  const playerXColor = 'text-teal-300';
  const playerOColor = 'text-amber-300';
  const winnerBgColor = 'bg-green-500/30';

  const baseClasses = "w-24 h-24 md:w-28 md:h-28 flex items-center justify-center text-5xl md:text-6xl font-extrabold rounded-lg transition-all duration-300 ease-in-out";
  const interactiveClasses = isGameEnded ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700';
  const valueColor = value === 'X' ? playerXColor : playerOColor;
  const backgroundClass = isWinner ? winnerBgColor : 'bg-slate-800';
  
  return (
    <button
      className={`${baseClasses} ${backgroundClass} ${value ? valueColor : ''} ${interactiveClasses}`}
      onClick={onClick}
      disabled={isGameEnded || value !== null}
    >
      {value}
    </button>
  );
};

export default Square;
