// Utilidades específicas para Tic-Tac-Toe

import { TicTacToeRoom } from './types.js';

// Función para verificar si hay un ganador
export function checkWinner(board: string[]): string | null {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticales
        [0, 4, 8], [2, 4, 6] // diagonales
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    // Verificar empate
    if (board.every(cell => cell !== null)) {
        return 'tie';
    }

    return null;
}

// Función para crear una nueva sala de Tic-Tac-Toe
export function createTicTacToeRoom(roomId: string, playerId: string, playerName: string): TicTacToeRoom {
    return {
        id: roomId,
        players: [playerId],
        playerNames: new Map([[playerId, playerName]]),
        board: Array(9).fill(null),
        currentPlayer: playerId,
        gameStarted: false
    };
}

// Función para agregar un jugador a una sala
export function addPlayerToRoom(room: TicTacToeRoom, playerId: string, playerName: string): boolean {
    if (room.players.length >= 2) {
        return false; // Sala llena
    }

    room.players.push(playerId);
    room.playerNames.set(playerId, playerName);

    if (room.players.length === 2) {
        room.gameStarted = true;
    }

    return true;
}

// Función para hacer un movimiento
export function makeMove(room: TicTacToeRoom, playerId: string, index: number): boolean {
    // Verificar que es el turno del jugador
    if (room.currentPlayer !== playerId) return false;

    // Verificar que la celda está vacía
    if (room.board[index] !== null) return false;

    // Determinar el símbolo del jugador
    const playerIndex = room.players.indexOf(playerId);
    const symbol = playerIndex === 0 ? 'X' : 'O';

    // Hacer el movimiento
    room.board[index] = symbol;

    // Cambiar turno
    room.currentPlayer = room.players[(playerIndex + 1) % 2];

    return true;
}

// Función para reiniciar el juego
export function restartGame(room: TicTacToeRoom): void {
    room.board = Array(9).fill(null);
    room.currentPlayer = room.players[0];
    room.gameStarted = true;
} 