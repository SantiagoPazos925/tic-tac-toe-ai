import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameState {
    board: string[];
    currentPlayer: string;
    winner: string | null;
    isTie: boolean;
    gameStarted: boolean;
}

interface PlayerInfo {
    playerNumber: number;
    symbol: string;
}

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

    useEffect(() => {
        // Conectar al servidor
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
        socketRef.current = io(socketUrl);

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            setError('');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('playerJoined', (info: PlayerInfo) => {
            setPlayerInfo(info);
            setIsWaiting(true);
        });

        socket.on('gameStarted', (state: { board: string[], currentPlayer: string }) => {
            setGameState(prev => ({
                ...prev,
                board: state.board,
                currentPlayer: state.currentPlayer,
                gameStarted: true
            }));
            setIsWaiting(false);
        });

        socket.on('moveMade', (data: {
            board: string[],
            currentPlayer: string,
            lastMove: { index: number, symbol: string }
        }) => {
            setGameState(prev => ({
                ...prev,
                board: data.board,
                currentPlayer: data.currentPlayer
            }));
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

        socket.on('gameRestarted', (state: { board: string[], currentPlayer: string }) => {
            setGameState({
                board: state.board,
                currentPlayer: state.currentPlayer,
                winner: null,
                isTie: false,
                gameStarted: true
            });
        });

        socket.on('playerDisconnected', () => {
            setError('El otro jugador se ha desconectado');
        });

        socket.on('roomFull', () => {
            setError('Esta sala está llena');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const joinRoom = (roomId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('joinRoom', roomId);
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

    return {
        isConnected,
        gameState,
        playerInfo,
        roomId,
        isWaiting,
        error,
        joinRoom,
        makeMove,
        restartGame,
        isMyTurn,
        canMakeMove
    };
}; 