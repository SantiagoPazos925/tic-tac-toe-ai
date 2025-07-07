// Tipos específicos para Tic-Tac-Toe

export interface TicTacToePlayer {
    id: string;
    name: string;
    symbol: 'X' | 'O';
}

export interface TicTacToeRoom {
    id: string;
    players: string[];
    playerNames: Map<string, string>; // Mapa de socket.id a nombre del jugador
    board: string[];
    currentPlayer: string;
    gameStarted: boolean;
}

export interface TicTacToeGameState {
    board: string[];
    currentPlayer: string;
    playerNames: {
        player1: string;
        player2: string;
    };
    winner?: string | null;
    isTie?: boolean;
}

export interface TicTacToeMove {
    roomId: string;
    index: number;
} 