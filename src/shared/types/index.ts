// Tipos compartidos para toda la aplicación

export interface Game {
    id: string;
    name: string;
    description: string;
    icon: string;
    status: 'available' | 'coming-soon' | 'maintenance';
    players: string;
}

export interface PlayerInfo {
    playerNumber: number;
    symbol: string;
    name?: string;
    playerNames?: {
        player1: string;
        player2: string;
    };
}

export interface GameState {
    board: string[];
    currentPlayer: string;
    winner: string | null;
    isTie: boolean;
    gameStarted: boolean;
}

export interface RoomInfo {
    id: string;
    players: number;
    gameStarted: boolean;
} 