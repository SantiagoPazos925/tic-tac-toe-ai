import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, PlayerInfo } from '../../../shared/types';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState<GameState>({
        board: Array(9).fill(null),
        currentPlayer: '',
        winner: null,
        isTie: false,
        gameStarted: false
    });
    const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
    const [roomId, setRoomId] = useState<string>('');
    const [isWaiting, setIsWaiting] = useState(false);
    const [error, setError] = useState<string>('');
    const [latency, setLatency] = useState<number>(0);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Conectar al servidor
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
        socketRef.current = io(socketUrl);

        // Exponer el socket globalmente para que otros componentes puedan acceder
        (window as any).socket = socketRef.current;

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            setError('');

            // Iniciar medición de latencia
            startLatencyMeasurement();
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('playerJoined', (info: PlayerInfo) => {
            setPlayerInfo(info);
            setIsWaiting(true);
        });

        socket.on('gameStarted', (state: { board: string[], currentPlayer: string, playerNames?: { player1: string, player2: string } }) => {
            setGameState(prev => ({
                ...prev,
                board: state.board,
                currentPlayer: state.currentPlayer,
                gameStarted: true
            }));
            setIsWaiting(false);

            // Actualizar información del jugador con nombres si está disponible
            if (state.playerNames) {
                setPlayerInfo(prev => prev ? {
                    ...prev,
                    playerNames: state.playerNames
                } : null);
            }
        });

        socket.on('moveMade', (data: {
            board: string[],
            currentPlayer: string,
            lastMove: { index: number, symbol: string },
            playerNames?: { player1: string, player2: string }
        }) => {
            setGameState(prev => ({
                ...prev,
                board: data.board,
                currentPlayer: data.currentPlayer
            }));

            // Actualizar información del jugador con nombres si está disponible
            if (data.playerNames) {
                setPlayerInfo(prev => prev ? {
                    ...prev,
                    playerNames: data.playerNames
                } : null);
            }
        });

        socket.on('gameOver', (data: {
            board: string[],
            winner: string | null,
            isTie: boolean
        }) => {
            setGameState(prev => ({
                ...prev,
                board: data.board,
                winner: data.winner,
                isTie: data.isTie
            }));
        });

        socket.on('gameRestarted', (state: { board: string[], currentPlayer: string, playerNames?: { player1: string, player2: string } }) => {
            setGameState({
                board: state.board,
                currentPlayer: state.currentPlayer,
                winner: null,
                isTie: false,
                gameStarted: true
            });

            // Actualizar información del jugador con nombres si está disponible
            if (state.playerNames) {
                setPlayerInfo(prev => prev ? {
                    ...prev,
                    playerNames: state.playerNames
                } : null);
            }
        });

        socket.on('playerDisconnected', () => {
            setError('El otro jugador se ha desconectado');
        });

        socket.on('roomFull', () => {
            setError('Esta sala está llena');
        });

        // Manejar pong para calcular latencia
        socket.on('pong', () => {
            const endTime = Date.now();
            const pingTime = endTime - (socket as any).pingStartTime;
            setLatency(pingTime);
        });

        return () => {
            // Limpiar intervalo de ping
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
            socket.disconnect();
        };
    }, []);

    // Función para medir latencia
    const startLatencyMeasurement = () => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
        }

        pingIntervalRef.current = setInterval(() => {
            if (socketRef.current && socketRef.current.connected) {
                (socketRef.current as any).pingStartTime = Date.now();
                socketRef.current.emit('ping');
            }
        }, 5000); // Medir cada 5 segundos
    };

    const joinRoom = (roomId: string, playerName: string) => {
        if (socketRef.current) {
            socketRef.current.emit('joinRoom', { roomId, playerName });
            setRoomId(roomId);
            setError('');
        }
    };

    const makeMove = (index: number) => {
        if (socketRef.current && roomId) {
            socketRef.current.emit('makeMove', { roomId, index });
        }
    };

    const restartGame = () => {
        if (socketRef.current && roomId) {
            socketRef.current.emit('restartGame', roomId);
        }
    };

    const isMyTurn = () => {
        return socketRef.current && gameState.currentPlayer === socketRef.current.id;
    };

    const canMakeMove = (index: number) => {
        return (
            isMyTurn() &&
            gameState.board[index] === null &&
            !gameState.winner &&
            !gameState.isTie &&
            gameState.gameStarted
        );
    };

    const leaveRoom = () => {
        if (socketRef.current && roomId) {
            socketRef.current.emit('leaveRoom', roomId);
            setRoomId('');
            setPlayerInfo(null);
            setGameState({
                board: Array(9).fill(null),
                currentPlayer: '',
                winner: null,
                isTie: false,
                gameStarted: false
            });
            setIsWaiting(false);
            setError('');
        }
    };

    return {
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
    };
}; 