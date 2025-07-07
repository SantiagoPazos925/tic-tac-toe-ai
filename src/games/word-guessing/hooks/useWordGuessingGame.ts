import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../tic-tac-toe/hooks/useSocket';
import { WordGuessingGameState, WordGuessingPlayer, ChatMessage, DrawingPoint } from '../types';
import { v4 as uuidv4 } from 'uuid';

const DRAWING_TIME = 60; // 60 segundos para dibujar
const ROUND_TIME = 90; // 90 segundos total por ronda
const MAX_ROUNDS = 5;

// Obtener o generar userId persistente
function getOrCreateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = uuidv4();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

export const useWordGuessingGame = (roomId: string, playerName: string) => {
    const { isConnected, latency } = useSocket();
    const socket = (window as any).socket;
    const userId = getOrCreateUserId();
    const [gameState, setGameState] = useState<WordGuessingGameState>({
        currentWord: '',
        currentDrawer: '',
        players: [],
        gamePhase: 'waiting',
        timeRemaining: ROUND_TIME,
        roundNumber: 0,
        maxRounds: MAX_ROUNDS,
        messages: [],
        drawingData: [],
        correctGuesses: [],
        roundStartTime: 0
    });

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState<WordGuessingPlayer | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [drawerDisconnected, setDrawerDisconnected] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Unirse a la sala
    const joinRoom = useCallback(() => {
        if (socket && roomId && playerName) {
            socket.emit('join-word-guessing-room', { roomId, playerName, userId });
        }
    }, [socket, roomId, playerName, userId]);

    // Enviar mensaje de chat
    const sendMessage = useCallback((message: string) => {
        if (socket && message.trim()) {
            socket.emit('word-guessing-message', { roomId, message, userId });
            setChatMessage('');
        }
    }, [socket, roomId, userId]);

    // Enviar datos de dibujo
    const sendDrawingData = useCallback((drawingPoint: DrawingPoint) => {
        if (socket && isDrawing) {
            socket.emit('word-guessing-draw', { roomId, drawingPoint: { ...drawingPoint, userId } });
        }
    }, [socket, roomId, isDrawing, userId]);

    // Limpiar canvas
    const clearCanvas = useCallback(() => {
        if (socket && isDrawing) {
            socket.emit('word-guessing-clear', { roomId });
        }
    }, [socket, roomId, isDrawing]);

    // Iniciar juego
    const startGame = useCallback(() => {
        if (socket) {
            socket.emit('word-guessing-start', { roomId });
        }
    }, [socket, roomId]);

    // Salir de la sala
    const leaveRoom = useCallback(() => {
        if (socket) {
            socket.emit('leave-word-guessing-room', roomId, userId);
        }
    }, [socket, roomId, userId]);

    // Manejar eventos del socket
    useEffect(() => {
        if (!socket) return;

        const handleGameStateUpdate = (newState: WordGuessingGameState) => {
            setGameState(prev => ({
                ...newState,
                messages: newState.messages // confiar solo en el backend
            }));
            // Encontrar el jugador actual por userId persistente
            const myId = userId;
            const currentPlayerData = newState.players.find(p => p.id === myId);
            setCurrentPlayer(currentPlayerData || null);
            setIsDrawing(currentPlayerData?.isDrawing || false);
        };

        const handlePlayerLeft = (playerId: string) => {
            setGameState(prev => {
                const newState = {
                    ...prev,
                    players: prev.players.filter(p => p.id !== playerId)
                };

                // Verificar si el jugador que se fue era el dibujante
                if (prev.currentDrawer === playerId && (prev.gamePhase === 'drawing' || prev.gamePhase === 'guessing')) {
                    setDrawerDisconnected(true);
                }

                return newState;
            });
        };

        const handleNewMessage = (message: ChatMessage) => {
            setGameState(prev => ({
                ...prev,
                messages: [...prev.messages, message]
            }));
        };

        const handleDrawingUpdate = (drawingData: DrawingPoint[]) => {
            setGameState(prev => ({
                ...prev,
                drawingData
            }));
        };

        const handleCanvasCleared = () => {
            setGameState(prev => ({
                ...prev,
                drawingData: []
            }));
        };

        const handleRoundStart = (data: { word: string; drawer: string; timeRemaining: number }) => {
            setGameState(prev => ({
                ...prev,
                currentWord: data.word,
                currentDrawer: data.drawer,
                gamePhase: 'drawing',
                timeRemaining: data.timeRemaining,
                roundStartTime: Date.now()
            }));
            setDrawerDisconnected(false); // Resetear estado de desconexión
        };

        const handleRoundEnd = (data: { correctGuesses: string[]; scores: WordGuessingPlayer[] }) => {
            setGameState(prev => ({
                ...prev,
                gamePhase: 'round-end',
                correctGuesses: data.correctGuesses,
                players: data.scores
            }));
        };

        const handleGameEnd = (data: { finalScores: WordGuessingPlayer[] }) => {
            setGameState(prev => ({
                ...prev,
                gamePhase: 'game-end',
                players: data.finalScores
            }));
        };

        const handleDrawerDisconnected = (data: { previousDrawer: string; timeToReconnect: number }) => {
            // Activar el estado de desconexión del dibujante
            setDrawerDisconnected(true);
        };

        const handleDrawerChanged = (data: { newDrawer: string }) => {
            // Desactivar el estado de desconexión del dibujante
            setDrawerDisconnected(false);

            // Actualizar el estado del juego con el nuevo dibujante
            setGameState(prev => ({
                ...prev,
                currentDrawer: data.newDrawer,
                players: prev.players.map(p => ({
                    ...p,
                    isDrawing: p.id === data.newDrawer
                }))
            }));
        };

        const handleDrawerReconnected = (data: { drawerId: string }) => {
            // Desactivar el estado de desconexión del dibujante
            setDrawerDisconnected(false);
        };

        // Suscribirse a eventos
        socket.on('word-guessing-game-state', handleGameStateUpdate);
        socket.on('word-guessing-player-left', handlePlayerLeft);
        socket.on('word-guessing-message', handleNewMessage);
        socket.on('word-guessing-drawing-update', handleDrawingUpdate);
        socket.on('word-guessing-canvas-cleared', handleCanvasCleared);
        socket.on('word-guessing-round-start', handleRoundStart);
        socket.on('word-guessing-round-end', handleRoundEnd);
        socket.on('word-guessing-game-end', handleGameEnd);
        socket.on('word-guessing-drawer-disconnected', handleDrawerDisconnected);
        socket.on('word-guessing-drawer-changed', handleDrawerChanged);
        socket.on('word-guessing-drawer-reconnected', handleDrawerReconnected);

        // Unirse a la sala automáticamente
        joinRoom();

        return () => {
            socket.off('word-guessing-game-state', handleGameStateUpdate);
            socket.off('word-guessing-player-left', handlePlayerLeft);
            socket.off('word-guessing-message', handleNewMessage);
            socket.off('word-guessing-drawing-update', handleDrawingUpdate);
            socket.off('word-guessing-canvas-cleared', handleCanvasCleared);
            socket.off('word-guessing-round-start', handleRoundStart);
            socket.off('word-guessing-round-end', handleRoundEnd);
            socket.off('word-guessing-game-end', handleGameEnd);
            socket.off('word-guessing-drawer-disconnected', handleDrawerDisconnected);
            socket.off('word-guessing-drawer-changed', handleDrawerChanged);
            socket.off('word-guessing-drawer-reconnected', handleDrawerReconnected);
        };
    }, [socket, playerName, joinRoom]);

    // Timer para el tiempo restante
    useEffect(() => {
        if (gameState.gamePhase === 'drawing' || gameState.gamePhase === 'guessing') {
            timerRef.current = setInterval(() => {
                setGameState(prev => ({
                    ...prev,
                    timeRemaining: Math.max(0, prev.timeRemaining - 1)
                }));
            }, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [gameState.gamePhase]);

    // Limpiar al desmontar el componente
    useEffect(() => {
        return () => {
            if (socket) {
                socket.emit('leave-word-guessing-room', roomId);
            }
        };
    }, [socket, roomId]);

    return {
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
    };
}; 