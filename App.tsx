import React, { useState } from 'react';
import { BoardState } from './types';
import Board from './components/Board';
import Lobby from './components/Lobby';
import RoomStatus from './components/RoomStatus';
import { LatencyIndicator } from './components/LatencyIndicator';
import { ConnectionStats } from './components/ConnectionStats';
import { useSocket } from './hooks/useSocket';

type GameMode = 'lobby' | 'game';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('lobby');
  const {
    isConnected,
    gameState,
    playerInfo,
    roomId,
    isWaiting,
    error,
    latency,
    joinRoom,
    makeMove,
    restartGame,
    isMyTurn,
    canMakeMove
  } = useSocket();

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
    setGameMode('game');
  };

  const handleCreateRoom = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinRoom(randomRoomId);
    setGameMode('game');
  };

  const handleSquareClick = (index: number) => {
    if (canMakeMove(index)) {
      makeMove(index);
    }
  };

  const handleRestart = () => {
    restartGame();
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  const handleBackToLobby = () => {
    setGameMode('lobby');
  };

  const getStatusMessage = (): string => {
    if (gameState.winner) return `¡Ganador: ${gameState.winner}!`;
    if (gameState.isTie) return "¡Es un empate!";
    if (!gameState.gameStarted) return "Esperando al segundo jugador...";
    if (isMyTurn()) return "Tu turno";
    return "Turno del oponente";
  };

  if (gameMode === 'lobby') {
    return <Lobby onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col items-center justify-center p-4 font-sans">
      <LatencyIndicator latency={latency} isConnected={isConnected} />
      <ConnectionStats latency={latency} isConnected={isConnected} roomId={roomId} />
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
          Tic-Tac-Toe Online
        </h1>
        <p className="text-gray-400 mt-2">Jugando en tiempo real</p>
      </div>

      {!isConnected && (
        <div className="bg-red-800 rounded-lg p-4 mb-6">
          <p className="text-white">Conectando al servidor...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-800 rounded-lg p-4 mb-6">
          <p className="text-white">{error}</p>
          <button
            onClick={handleBackToLobby}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver al lobby
          </button>
        </div>
      )}

      {playerInfo && (
        <RoomStatus
          roomId={roomId}
          playerNumber={playerInfo.playerNumber}
          symbol={playerInfo.symbol}
          isWaiting={isWaiting}
          onCopyRoomId={handleCopyRoomId}
        />
      )}

      <div className="relative">
        <Board
          squares={gameState.board as BoardState}
          onSquareClick={handleSquareClick}
          winningLine={gameState.winner ? null : null}
          isGameEnded={!!gameState.winner || gameState.isTie}
        />
        {isWaiting && (
          <div className="absolute inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <p className="text-2xl font-semibold text-gray-200 h-8 transition-all duration-300">
          {getStatusMessage()}
        </p>
        {(gameState.winner || gameState.isTie) && (
          <div className="mt-4 space-x-4">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-gradient-to-r from-teal-400 to-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out"
            >
              Jugar de nuevo
            </button>
            <button
              onClick={handleBackToLobby}
              className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out"
            >
              Volver al lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
