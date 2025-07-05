import React, { useState } from 'react';
import { Board, Lobby, RoomStatus, useSocket, BoardState } from './games/tic-tac-toe';
import { GameMenu, PlayerNameInput, ConnectionStats } from './shared';

type GameMode = 'name-input' | 'game-menu' | 'lobby' | 'game';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('name-input');
  const [playerName, setPlayerName] = useState('');
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
    canMakeMove,
    leaveRoom
  } = useSocket();

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setGameMode('game-menu');
  };

  const handleGameSelect = (gameId: string) => {
    if (gameId === 'tic-tac-toe') {
      setGameMode('lobby');
    }
    // Aquí se pueden agregar más juegos en el futuro
  };

  const handleBackToNameInput = () => {
    setGameMode('name-input');
  };

  const handleBackToGameMenu = () => {
    leaveRoom();
    setGameMode('game-menu');
  };

  const handleJoinRoom = (roomId: string, playerName: string) => {
    joinRoom(roomId, playerName);
    setGameMode('game');
  };

  const handleCreateRoom = (playerName: string) => {
    const randomRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinRoom(randomRoomId, playerName);
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
    leaveRoom();
    setGameMode('lobby');
  };

  const getStatusMessage = (): string => {
    if (gameState.winner) {
      const winnerName = playerInfo?.playerNames ?
        (gameState.winner === 'X' ? playerInfo.playerNames.player1 : playerInfo.playerNames.player2) :
        gameState.winner;
      return `¡Ganador: ${winnerName}!`;
    }
    if (gameState.isTie) return "¡Es un empate!";
    if (!gameState.gameStarted) return "Esperando al segundo jugador...";
    if (isMyTurn()) return "Tu turno";
    return "Turno del oponente";
  };

  if (gameMode === 'name-input') {
    return <PlayerNameInput onSubmit={handleNameSubmit} onCancel={() => { }} />;
  }

  if (gameMode === 'game-menu') {
    return <GameMenu
      playerName={playerName}
      onSelectGame={handleGameSelect}
      onBack={handleBackToNameInput}
    />;
  }

  if (gameMode === 'lobby') {
    return <Lobby onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} playerName={playerName} onBackToMenu={handleBackToGameMenu} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col items-center justify-center p-4 font-sans">
      <ConnectionStats latency={latency} isConnected={isConnected} roomId={roomId} />

      {/* Botón para volver al menú de juegos */}
      <div className="absolute top-16 left-4 z-40">
        <button
          onClick={handleBackToGameMenu}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Menú de Juegos</span>
        </button>
      </div>

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
          playerNames={playerInfo.playerNames}
        />
      )}

      <div className="relative">
        <Board
          squares={gameState.board as BoardState}
          onSquareClick={handleSquareClick}
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
