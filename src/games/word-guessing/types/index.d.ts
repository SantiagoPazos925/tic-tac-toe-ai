export interface WordGuessingPlayer {
    id: string;
    name: string;
    isDrawing: boolean;
    score: number;
    hasGuessed: boolean;
}
export interface WordGuessingGameState {
    currentWord: string;
    currentDrawer: string;
    players: WordGuessingPlayer[];
    gamePhase: 'waiting' | 'drawing' | 'guessing' | 'round-end' | 'game-end';
    timeRemaining: number;
    roundNumber: number;
    maxRounds: number;
    messages: ChatMessage[];
    drawingData: DrawingPoint[];
    correctGuesses: string[];
    roundStartTime: number;
}
export interface ChatMessage {
    id: string;
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
    isCorrectGuess: boolean;
}
export interface DrawingPoint {
    x: number;
    y: number;
    color: string;
    size: number;
    isDrawing: boolean;
}
export interface WordCategory {
    id: string;
    name: string;
    words: string[];
}
export type { PlayerInfo, GameState, RoomInfo } from '../../../shared/types';
