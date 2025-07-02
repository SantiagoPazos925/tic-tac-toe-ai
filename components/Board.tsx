
import React from 'react';
import Square from './Square';
import { BoardState } from '../types';

interface BoardProps {
  squares: BoardState;
  onSquareClick: (index: number) => void;
  winningLine: number[] | null;
  isGameEnded: boolean;
}

const Board: React.FC<BoardProps> = ({ squares, onSquareClick, winningLine, isGameEnded }) => {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 p-2 md:p-3 bg-slate-900/50 rounded-lg shadow-2xl">
      {squares.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onSquareClick(index)}
          isWinner={winningLine?.includes(index) ?? false}
          isGameEnded={isGameEnded}
        />
      ))}
    </div>
  );
};

export default Board;
