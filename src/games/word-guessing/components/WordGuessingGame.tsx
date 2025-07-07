import React, { useState } from 'react';
import { useWordGuessingGame } from '../hooks/useWordGuessingGame';
import DrawingCanvas from './DrawingCanvas';
import ChatBox from './ChatBox';
import PlayerList from './PlayerList';
import GameTimer from './GameTimer';
import { WordGuessingGameState } from '../types';
import styles from './WordGuessingGame.module.css';

interface WordGuessingGameProps {
    roomId: string;
    playerName: string;
    onBackToLobby: () => void;
}

// Componente Modal para notificación de desconexión
const DisconnectionModal: React.FC<{
    isOpen: boolean;
    onReconnect: () => void;
    isReconnecting: boolean;
}> = ({ isOpen, onReconnect, isReconnecting }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    React.useEffect(() => {
        if (isOpen) {
            setTimeLeft(30);
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Dibujante Desconectado
                    </h2>
                    <p className="text-gray-600 mb-4">
                        El jugador que estaba dibujando se ha desconectado.
                    </p>

                    <div className="mb-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {timeLeft}s
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${(timeLeft / 30) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Tiempo restante para reconexión
                        </p>
                    </div>

                    {isReconnecting ? (
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-blue-600 font-medium">Reconectando...</span>
                        </div>
                    ) : (
                        <button
                            onClick={onReconnect}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Reconectar
                        </button>
                    )}

                    <p className="text-xs text-gray-400 mt-4">
                        Si no se reconecta en {timeLeft} segundos, se asignará un nuevo dibujante
                    </p>
                </div>
            </div>
        </div>
    );
};

const WordGuessingGame: React.FC<WordGuessingGameProps> = ({ roomId, playerName, onBackToLobby }) => {
    const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    const {
        gameState,
        currentPlayer,
        isDrawing,
        isConnected,
        latency,
        chatMessage,
        setChatMessage,
        drawerDisconnected,
        joinRoom,
        sendMessage,
        sendDrawingData,
        clearCanvas,
        startGame,
        leaveRoom
    } = useWordGuessingGame(roomId, playerName);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(chatMessage);
    };

    const handleBackToLobby = () => {
        leaveRoom();
        onBackToLobby();
    };

    const handleReconnect = () => {
        setIsReconnecting(true);
        setShowDisconnectionModal(false);

        // Simular proceso de reconexión
        setTimeout(() => {
            setIsReconnecting(false);
            // Aquí podrías agregar lógica adicional de reconexión si es necesario
        }, 2000);
    };

    // Detectar cuando el dibujante se desconecta
    React.useEffect(() => {
        if (drawerDisconnected && (gameState.gamePhase === 'drawing' || gameState.gamePhase === 'guessing')) {
            setShowDisconnectionModal(true);
        } else {
            setShowDisconnectionModal(false);
        }
    }, [drawerDisconnected, gameState.gamePhase]);

    const renderGamePhase = () => {
        switch (gameState.gamePhase) {
            case 'waiting':
                return (
                    <div className={styles.waitingBackground}>
                        <div className={styles.waitingPanel}>
                            <h1 className={styles.waitingTitle}><span role="img" aria-label="paleta">🎨</span> Adivina la Palabra</h1>
                            <div className={styles.waitingSubtitle}>Esperando jugadores...</div>
                            <div className={styles.waitingSubtitle}>
                                Código de sala:
                                <span className={styles.waitingRoomCode}>{roomId}</span>
                            </div>
                            <div className={styles.waitingPlayerList}>
                                <PlayerList players={gameState.players} currentPlayer={currentPlayer} />
                            </div>
                            {gameState.players.length >= 2 && (
                                <button
                                    onClick={startGame}
                                    className={styles.waitingBackBtn}
                                    style={{ background: 'linear-gradient(90deg, #a685fa 0%, #7f53ff 100%)', marginBottom: 10 }}
                                >
                                    Iniciar Juego
                                </button>
                            )}
                            <button
                                onClick={handleBackToLobby}
                                className={styles.waitingBackBtn}
                            >
                                Volver al lobby
                            </button>
                        </div>
                    </div>
                );

            case 'drawing':
            case 'guessing':
                return (
                    <div className="canvas-layout-row flex h-screen w-screen bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        {/* Panel central: Canvas, barra y paleta */}
                        <div className="drawing-canvas flex flex-1 h-full items-center justify-center">
                            <DrawingCanvas
                                isDrawing={isDrawing}
                                drawingData={gameState.drawingData}
                                onDraw={sendDrawingData}
                                hiddenWordDisplay={gameState.hiddenWordDisplay || ''}
                                currentWord={gameState.currentWord}
                                timeRemaining={gameState.timeRemaining}
                                roomId={roomId}
                            />
                        </div>
                        {/* Panel derecho - Chat y jugadores */}
                        <div className="chat-box w-80 h-full bg-white/10 backdrop-blur-lg p-4 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white mb-2">Jugadores</h3>
                                <PlayerList players={gameState.players} currentPlayer={currentPlayer} />
                            </div>
                            <div className="flex-1">
                                <ChatBox
                                    messages={gameState.messages}
                                    chatMessage={chatMessage}
                                    setChatMessage={setChatMessage}
                                    onSendMessage={handleSendMessage}
                                    isDrawing={isDrawing}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'round-end':
                return (
                    <div className={styles.roundEndBackground}>
                        <div className={styles.roundEndPanel}>
                            <h2 className={styles.roundEndTitle}>¡Ronda Terminada!</h2>

                            <div className="mb-6">
                                <p className={styles.roundEndSubtitle} style={{ fontSize: '1.2rem', marginBottom: 16 }}>
                                    La palabra era: <span className={styles.roundEndWord}>{gameState.currentWord}</span>
                                </p>

                                {gameState.correctGuesses.length > 0 && (
                                    <div style={{ background: '#2e3a2e', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                                        <h3 className="font-semibold mb-2" style={{ color: '#7fff7f' }}>¡Correctos!</h3>
                                        <ul style={{ paddingLeft: 0, margin: 0 }}>
                                            {gameState.correctGuesses.map((guess, index) => (
                                                <li key={index} style={{ color: '#7fff7f', listStyle: 'none' }}>✓ {guess}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className={styles.roundEndScores}>
                                <h3 className="font-semibold mb-2">Puntuaciones</h3>
                                <div>
                                    {gameState.players
                                        .sort((a, b) => b.score - a.score)
                                        .map((player, index) => (
                                            <div key={player.id} className={styles.roundEndScoreItem}>
                                                <span className={index === 0 ? styles.roundEndScoreName : ''}>
                                                    {index + 1}. {player.name}
                                                </span>
                                                <span style={{ fontWeight: 600 }}>{player.score} pts</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <p className={styles.roundEndInfo}>
                                    Ronda {gameState.roundNumber} de {gameState.maxRounds}
                                </p>
                                <button
                                    onClick={startGame}
                                    className={styles.roundEndBtn}
                                >
                                    Siguiente Ronda
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'game-end':
                return (
                    <div className={styles.roundEndBackground}>
                        <div className={styles.roundEndPanel} style={{ maxWidth: 600 }}>
                            <h2 className={styles.roundEndTitle} style={{ fontSize: '2.3rem' }}>¡Juego Terminado!</h2>

                            <div className={styles.roundEndScores} style={{ padding: 24, marginBottom: 24 }}>
                                <h3 className={styles.roundEndSubtitle} style={{ fontSize: '1.4rem', marginBottom: 18 }}>🏆 Puntuaciones Finales</h3>
                                <div>
                                    {gameState.players
                                        .sort((a, b) => b.score - a.score)
                                        .map((player, index) => (
                                            <div key={player.id} className={styles.roundEndScoreItem} style={{ padding: 8, background: index === 0 ? '#35354a' : 'transparent', borderRadius: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <span style={{ fontSize: 24 }}>
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                                    </span>
                                                    <span className={index === 0 ? styles.roundEndScoreName : ''} style={{ fontSize: 18 }}>
                                                        {player.name}
                                                    </span>
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 20 }}>{player.score} pts</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: 18 }}>
                                <button
                                    onClick={handleBackToLobby}
                                    className={styles.roundEndBtn}
                                    style={{ background: 'linear-gradient(90deg, #647dee 0%, #7f53ff 100%)', marginRight: 16 }}
                                >
                                    Volver al Lobby
                                </button>
                                <button
                                    onClick={() => { leaveRoom(); onBackToLobby(); }}
                                    className={styles.roundEndBtn}
                                    style={{ background: 'linear-gradient(90deg, #7fff7f 0%, #00c853 100%)', color: '#23232b' }}
                                >
                                    Jugar de Nuevo
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Conectando al servidor...</p>
                    <p className="text-sm opacity-75 mt-2">Latencia: {latency}ms</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden">
            {renderGamePhase()}
            {showDisconnectionModal && (
                <DisconnectionModal
                    isOpen={showDisconnectionModal}
                    onReconnect={handleReconnect}
                    isReconnecting={isReconnecting}
                />
            )}
        </div>
    );
};

export default WordGuessingGame; 