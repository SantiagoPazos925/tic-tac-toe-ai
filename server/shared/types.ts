// Tipos compartidos entre todos los juegos

export interface BasePlayer {
    id: string;
    name: string;
}

export interface BaseRoom {
    id: string;
    players: BasePlayer[];
    gameStarted: boolean;
}

export interface BaseGameState {
    gamePhase: string;
    players: BasePlayer[];
}

// Tipos para manejo de salas
export interface RoomInfo {
    id: string;
    players: number;
    gameStarted: boolean;
}

// Tipos para mensajes de chat
export interface ChatMessage {
    id: string;
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
    isCorrectGuess?: boolean;
}

// Tipos para datos de dibujo
export interface DrawingPoint {
    x: number;
    y: number;
    color: string;
    size: number;
    isDrawing: boolean;
    userId: string;
} 