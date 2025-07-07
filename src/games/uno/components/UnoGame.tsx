import React, { useState } from 'react';
import { useUnoGame } from '../hooks/useUnoGame';
import UnoCard from './UnoCard';
import UnoPlayerHand from './UnoPlayerHand';
import UnoDiscardPile from './UnoDiscardPile';
import UnoDeck from './UnoDeck';
import UnoControls from './UnoControls';
import UnoGameOver from './UnoGameOver';
import { UnoGameConfig } from '../types';
import styles from './UnoGame.module.css';

interface UnoGameProps {
    onBackToMenu: () => void;
}

const UnoGame: React.FC<UnoGameProps> = ({ onBackToMenu }) => {
    const [gameConfig, setGameConfig] = useState<UnoGameConfig>({
        numBots: 2,
        difficulty: 'medium',
        enableChallenges: true
    });
    const [gameStarted, setGameStarted] = useState(false);
    const [drawAnimation, setDrawAnimation] = useState(false);

    const {
        gameState,
        uiState,
        isBotTurn,
        initializeGame,
        executePlayerAction,
        getPlayableCards,
        shouldSayUno,
        resetGame,
        setUiState
    } = useUnoGame(gameConfig);

    const handleStartGame = () => {
        initializeGame();
        setGameStarted(true);
    };

    const handlePlayCard = (cardId: string) => {
        const card = gameState?.players[0].hand.find(c => c.id === cardId);
        if (card?.color === 'black') {
            setUiState(prev => ({
                ...prev,
                showColorSelector: true,
                selectedCardId: cardId
            }));
        } else {
            executePlayerAction({
                type: 'playCard',
                cardId
            });
        }
    };

    const handleColorSelect = (color: string) => {
        if (uiState.selectedCardId) {
            executePlayerAction({
                type: 'playCard',
                cardId: uiState.selectedCardId,
                newColor: color as any
            });
        }
    };

    const handleDrawCard = () => {
        setDrawAnimation(true);
        setTimeout(() => {
            setDrawAnimation(false);
            executePlayerAction({ type: 'drawCard' });
        }, 500); // Duración de la animación
    };

    const handleSayUno = () => {
        executePlayerAction({ type: 'sayUno' });
    };

    if (!gameStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at 60% 40%, #10151c 60%, #1a2332 100%)' }}>
                <div className="bg-[#181f2a] rounded-2xl p-8 shadow-2xl max-w-md w-full border border-[#232b3b]">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-300 mb-2">UNO</h1>
                        <p className="text-gray-300">¡Prepárate para la diversión!</p>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Número de oponentes:
                            </label>
                            <select
                                value={gameConfig.numBots}
                                onChange={(e) => setGameConfig(prev => ({
                                    ...prev,
                                    numBots: parseInt(e.target.value)
                                }))}
                                className="w-full p-3 bg-[#232b3b] border border-[#2d3748] rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none shadow-sm"
                            >
                                {Array.from({ length: 9 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1} oponente{i + 1 > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Dificultad:
                            </label>
                            <select
                                value={gameConfig.difficulty}
                                onChange={(e) => setGameConfig(prev => ({
                                    ...prev,
                                    difficulty: e.target.value as any
                                }))}
                                className="w-full p-3 bg-[#232b3b] border border-[#2d3748] rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none shadow-sm"
                            >
                                <option value="easy">Fácil</option>
                                <option value="medium">Medio</option>
                                <option value="hard">Difícil</option>
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={onBackToMenu}
                                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleStartGame}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                            >
                                ¡Comenzar!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!gameState) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at 60% 40%, #2176ae 60%, #14375a 100%)', backgroundImage: 'url(/uno-texture.png), radial-gradient(circle at 60% 40%, #2176ae 60%, #14375a 100%)', backgroundBlendMode: 'overlay' }}>
                <div className="text-white text-xl">Cargando juego...</div>
            </div>
        );
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isPlayerTurn = currentPlayer.type === 'human';
    const playableCards = getPlayableCards();

    // Nueva disposición visual para hasta 9 bots
    const bots = gameState.players.slice(1); // todos los bots
    const botsTop = bots.slice(0, 3); // primeros 3 arriba
    const botsLeft = bots.slice(3, 6); // siguientes 3 izquierda
    const botsRight = bots.slice(6, 9); // últimos 3 derecha

    // Layout principal tipo UNO profesional
    return (
        <div
            className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-hidden"
            style={{ background: 'radial-gradient(circle at 60% 40%, #2176ae 60%, #14375a 100%)', backgroundImage: 'url(/uno-texture.png), radial-gradient(circle at 60% 40%, #2176ae 60%, #14375a 100%)', backgroundBlendMode: 'overlay' }}
            onContextMenu={e => e.preventDefault()}
        >
            {/* Botón menú */}
            <div className="absolute top-6 right-6 z-40">
                <button
                    onClick={onBackToMenu}
                    className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors shadow-lg border border-white border-opacity-30"
                >
                    <span className="text-xl">✖</span>
                </button>
            </div>

            {/* Bots arriba */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-row justify-center gap-20 z-20">
                {botsTop.map((player, idx) => {
                    const isTurn = gameState.currentPlayerIndex === idx + 1;
                    const hasUno = player.hand.length === 1;
                    return (
                        <div key={player.id} className={['uno-bot-top', 'flex flex-col items-center', isTurn ? 'ring-4 ring-yellow-300 shadow-xl animate-glow' : '', 'rounded-2xl p-2 bg-black/10'].join(' ')} style={{ minWidth: 100 }}>
                            <div className="flex flex-row items-center justify-center gap-[-24px]">
                                {Array.from({ length: player.hand.length }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-16 rounded-xl border-4 border-white shadow-lg -ml-4 first:ml-0 bg-gradient-to-br from-black to-gray-900 flex items-center justify-center relative"
                                        style={{ zIndex: i }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 32 32" className="mx-auto" style={{ filter: 'drop-shadow(0 2px 4px #0008)' }}>
                                            <ellipse cx="16" cy="16" rx="14" ry="10" fill="#ffe066" stroke="#e63946" strokeWidth="3" />
                                            <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#e63946" fontFamily="Arial Black, Arial, sans-serif">UNO</text>
                                        </svg>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-white text-xs font-bold drop-shadow-lg">
                                    {player.name}
                                </span>
                                <span className="bg-white text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {player.hand.length}
                                </span>
                                {hasUno && (
                                    <span className="ml-1 bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-extrabold animate-bounce shadow-lg border-2 border-yellow-600">UNO</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Bots izquierda */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex flex-col items-center gap-20 z-20">
                {botsLeft.map((player, idx) => {
                    const botIdx = idx + 3;
                    const isTurn = gameState.currentPlayerIndex === botIdx + 1;
                    const hasUno = player.hand.length === 1;
                    return (
                        <div key={player.id} className={[styles['uno-bot-left'], 'flex flex-col items-center', isTurn ? 'ring-4 ring-yellow-300 shadow-xl animate-glow' : '', 'rounded-2xl p-2 bg-black/10'].join(' ')} style={{ minWidth: 100 }}>
                            <div className="flex flex-row items-center justify-center gap-[-16px]">
                                {Array.from({ length: player.hand.length }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-16 rounded-xl border-4 border-white shadow-lg -ml-4 first:ml-0 bg-gradient-to-br from-black to-gray-900 flex items-center justify-center relative"
                                        style={{ zIndex: i }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 32 32" className="mx-auto" style={{ filter: 'drop-shadow(0 2px 4px #0008)' }}>
                                            <ellipse cx="16" cy="16" rx="14" ry="10" fill="#ffe066" stroke="#e63946" strokeWidth="3" />
                                            <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#e63946" fontFamily="Arial Black, Arial, sans-serif">UNO</text>
                                        </svg>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-white text-xs font-bold drop-shadow-lg">
                                    {player.name}
                                </span>
                                <span className="bg-white text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {player.hand.length}
                                </span>
                                {hasUno && (
                                    <span className="ml-1 bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-extrabold animate-bounce shadow-lg border-2 border-yellow-600">UNO</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Bots derecha */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col items-center gap-20 z-20">
                {botsRight.map((player, idx) => {
                    const botIdx = idx + 6;
                    const isTurn = gameState.currentPlayerIndex === botIdx + 1;
                    const hasUno = player.hand.length === 1;
                    return (
                        <div key={player.id} className={[styles['uno-bot-right'], 'flex flex-col items-center', isTurn ? 'ring-4 ring-yellow-300 shadow-xl animate-glow' : '', 'rounded-2xl p-2 bg-black/10'].join(' ')} style={{ minWidth: 100 }}>
                            <div className="flex flex-row items-center justify-center gap-[-16px]">
                                {Array.from({ length: player.hand.length }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-16 rounded-xl border-4 border-white shadow-lg -ml-4 first:ml-0 bg-gradient-to-br from-black to-gray-900 flex items-center justify-center relative"
                                        style={{ zIndex: i }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 32 32" className="mx-auto" style={{ filter: 'drop-shadow(0 2px 4px #0008)' }}>
                                            <ellipse cx="16" cy="16" rx="14" ry="10" fill="#ffe066" stroke="#e63946" strokeWidth="3" />
                                            <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#e63946" fontFamily="Arial Black, Arial, sans-serif">UNO</text>
                                        </svg>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-white text-xs font-bold drop-shadow-lg">
                                    {player.name}
                                </span>
                                <span className="bg-white text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {player.hand.length}
                                </span>
                                {hasUno && (
                                    <span className="ml-1 bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-extrabold animate-bounce shadow-lg border-2 border-yellow-600">UNO</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Centro: pila de descarte y mazo */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                <div className="flex items-center gap-12">
                    <UnoDeck
                        cardCount={gameState.deck.length}
                        onDraw={handleDrawCard}
                        disabled={!isPlayerTurn || isBotTurn}
                    />
                    <UnoDiscardPile
                        topCard={gameState.discardPile[gameState.discardPile.length - 1]}
                        currentColor={gameState.currentColor}
                    />
                </div>
            </div>

            {/* Mano del jugador humano abajo */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-5xl flex flex-col items-center z-40">
                <UnoPlayerHand
                    cards={gameState.players[0].hand}
                    playableCards={playableCards}
                    onPlayCard={handlePlayCard}
                    disabled={!isPlayerTurn || isBotTurn}
                />
                <div className="mt-2 flex items-center gap-2">
                    <span className={`text-white text-lg font-bold drop-shadow-lg ${isPlayerTurn ? 'animate-glow' : ''}`}
                        style={isPlayerTurn ? { textShadow: '0 0 16px #ffe066, 0 0 8px #ffe066' } : {}}>
                        JUGADOR 1
                    </span>
                    <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-base font-bold">
                        {gameState.players[0].hand.length}
                    </span>
                    {gameState.players[0].hand.length === 1 && (
                        <span className="ml-2 bg-yellow-400 text-white px-3 py-1 rounded-full text-base font-extrabold animate-bounce shadow-lg border-2 border-yellow-600">UNO</span>
                    )}
                </div>
            </div>

            {/* Controles a la derecha */}
            <div className="absolute bottom-8 right-8 z-50">
                <UnoControls
                    isPlayerTurn={isPlayerTurn}
                    isBotTurn={isBotTurn}
                    shouldSayUno={shouldSayUno()}
                    onSayUno={handleSayUno}
                    onDrawCard={handleDrawCard}
                    playableCards={playableCards}
                />
            </div>

            {/* Selector de color */}
            {uiState.showColorSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Elige un color:</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['red', 'blue', 'green', 'yellow'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleColorSelect(color)}
                                    className="p-4 rounded-lg font-semibold text-white hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#f59e0b' }}
                                >
                                    {color === 'red' ? '🟥 Rojo' : color === 'blue' ? '🟦 Azul' : color === 'green' ? '🟩 Verde' : '🟨 Amarillo'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje del juego */}
            {uiState.gameMessage && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white font-semibold z-40 ${uiState.gameMessageType === 'error' ? 'bg-red-600' :
                    uiState.gameMessageType === 'success' ? 'bg-green-600' :
                        uiState.gameMessageType === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`}>
                    {uiState.gameMessage}
                </div>
            )}

            {/* Pantalla de fin de juego */}
            {gameState.gamePhase === 'gameOver' && gameState.winner && (
                <UnoGameOver
                    winner={gameState.winner}
                    onPlayAgain={resetGame}
                    onBackToMenu={onBackToMenu}
                />
            )}

            {/* Animación de robar carta */}
            {drawAnimation && (
                <div className="pointer-events-none fixed z-50" style={{ left: 'calc(50% - 48px)', top: 'calc(50% - 72px)' }}>
                    <div className="w-24 h-36 rounded-2xl border-4 border-white bg-gradient-to-br from-black to-gray-900 flex items-center justify-center shadow-2xl animate-draw-card">
                        <span className="text-4xl font-extrabold text-yellow-400 drop-shadow-lg select-none" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
                            UNO
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnoGame; 