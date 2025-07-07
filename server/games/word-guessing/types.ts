// Tipos específicos para Word Guessing

import { ChatMessage, DrawingPoint } from '../../shared/types.js';

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
    revealedLetters: boolean[];
    hiddenWordDisplay: string;
}

export interface WordGuessingRoom {
    id: string;
    players: WordGuessingPlayer[];
    gameState: WordGuessingGameState;
    drawingData: DrawingPoint[];
    messages: ChatMessage[];
    timers: Map<string, NodeJS.Timeout>;
    creatorName: string;
}

export interface WordGuessingMove {
    roomId: string;
    drawingPoint: DrawingPoint;
}

export interface WordGuessingMessage {
    roomId: string;
    message: string;
}

export interface WordGuessingStart {
    roomId: string;
}

export interface WordGuessingJoin {
    roomId: string;
    playerName: string;
} 