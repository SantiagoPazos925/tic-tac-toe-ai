// Tipos específicos para el juego Tic-Tac-Toe

export type Player = 'X' | 'O';

export type BoardState = (Player | null)[];

// Re-exportar tipos compartidos que se usan en este juego
export type { PlayerInfo, GameState, RoomInfo } from '../../../shared/types'; 