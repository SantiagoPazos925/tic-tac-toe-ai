// Utilidades específicas para Word Guessing

import { getRandomWord } from './wordCategories.js';
import { createMessage } from '../../shared/utils.js';
import {
    WordGuessingPlayer,
    WordGuessingGameState,
    WordGuessingRoom
} from './types.js';

// Constantes del juego
export const POINTS_FOR_CORRECT_GUESS = 10;
export const POINTS_FOR_DRAWING = 5;
export const DRAWING_TIME = 60;
export const ROUND_TIME = 60;
export const MAX_ROUNDS = 5;

// Función para verificar si una respuesta es correcta
export function checkGuess(guess: string, correctWord: string): boolean {
    if (!guess || !correctWord) return false;

    // Normalizar ambas cadenas para comparación
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedCorrect = correctWord.trim().toLowerCase();

    // Verificar coincidencia exacta
    if (normalizedGuess === normalizedCorrect) {
        return true;
    }

    // Verificar si la respuesta contiene la palabra correcta (para casos donde el usuario escribe más texto)
    if (normalizedGuess.includes(normalizedCorrect)) {
        return true;
    }

    // Verificar si la palabra correcta contiene la respuesta (para casos de abreviaciones)
    if (normalizedCorrect.includes(normalizedGuess) && normalizedGuess.length >= 3) {
        return true;
    }

    return false;
}

// Función para calcular puntuación
export const calculateScore = (
    player: WordGuessingPlayer,
    isCorrectGuess: boolean,
    isDrawer: boolean,
    timeRemaining: number,
    revealedLetters?: boolean[]
): number => {
    let score = player.score;

    if (isCorrectGuess) {
        // Puntos por adivinar correctamente
        let basePoints = POINTS_FOR_CORRECT_GUESS;
        // Penalización por letras reveladas
        if (revealedLetters) {
            const total = revealedLetters.length;
            const revealed = revealedLetters.filter(Boolean).length;
            // Por cada letra revelada, restar un porcentaje de los puntos base
            const penalty = Math.floor((revealed / total) * basePoints);
            basePoints -= penalty;
            if (basePoints < 1) basePoints = 1; // mínimo 1 punto
        }
        score += basePoints;

        // Bonus por adivinar rápido
        const timeBonus = Math.floor((timeRemaining / ROUND_TIME) * 5);
        score += timeBonus;
    }

    if (isDrawer) {
        // Puntos por dibujar (si alguien adivinó)
        score += POINTS_FOR_DRAWING;
    }

    return score;
};

// Función para obtener el siguiente dibujante
export const getNextDrawer = (players: WordGuessingPlayer[], currentDrawerId: string): string => {
    const currentIndex = players.findIndex(p => p.id === currentDrawerId);
    const nextIndex = (currentIndex + 1) % players.length;
    return players[nextIndex].id;
};

// Función para inicializar el estado del juego
export const initializeGameState = (players: WordGuessingPlayer[]): WordGuessingGameState => {
    const firstDrawer = players[0]?.id || '';
    const word = getRandomWord();
    const revealedLetters = Array(word.length).fill(false);
    return {
        currentWord: word,
        currentDrawer: firstDrawer,
        players: players.map(player => ({
            ...player,
            isDrawing: player.id === firstDrawer,
            score: 0,
            hasGuessed: false
        })),
        gamePhase: 'waiting',
        timeRemaining: ROUND_TIME,
        roundNumber: 1,
        maxRounds: MAX_ROUNDS,
        messages: [],
        drawingData: [],
        correctGuesses: [],
        roundStartTime: Date.now(),
        revealedLetters,
        hiddenWordDisplay: getHiddenWordDisplay(word, revealedLetters)
    };
};

// Función para iniciar una nueva ronda
export const startNewRound = (
    players: WordGuessingPlayer[],
    roundNumber: number,
    previousDrawerId?: string
): Partial<WordGuessingGameState> => {
    const nextDrawerId = previousDrawerId
        ? getNextDrawer(players, previousDrawerId)
        : players[0]?.id || '';

    const word = getRandomWord();
    const revealedLetters = Array(word.length).fill(false);
    return {
        currentWord: word,
        currentDrawer: nextDrawerId,
        players: players.map(player => ({
            ...player,
            isDrawing: player.id === nextDrawerId,
            hasGuessed: false
        })),
        gamePhase: 'drawing',
        timeRemaining: ROUND_TIME,
        roundNumber,
        drawingData: [],
        correctGuesses: [],
        roundStartTime: Date.now(),
        revealedLetters,
        hiddenWordDisplay: getHiddenWordDisplay(word, revealedLetters)
    };
};

// Función para terminar una ronda
export const endRound = (
    gameState: WordGuessingGameState,
    correctGuesses: string[]
): Partial<WordGuessingGameState> => {
    // Actualizar puntuaciones
    const updatedPlayers = gameState.players.map(player => {
        const isCorrectGuess = correctGuesses.includes(player.name);
        const isDrawer = player.id === gameState.currentDrawer;

        const newScore = calculateScore(
            player,
            isCorrectGuess,
            isDrawer,
            gameState.timeRemaining,
            gameState.revealedLetters
        );

        return {
            ...player,
            score: newScore,
            hasGuessed: false,
            isDrawing: false
        };
    });

    return {
        players: updatedPlayers,
        gamePhase: 'round-end',
        correctGuesses
    };
};

// Función para terminar el juego
export const endGame = (players: WordGuessingPlayer[]): Partial<WordGuessingGameState> => {
    return {
        gamePhase: 'game-end',
        players: players.sort((a, b) => b.score - a.score)
    };
};

// Función para verificar si el juego ha terminado
export const isGameOver = (roundNumber: number): boolean => {
    return roundNumber >= MAX_ROUNDS;
};

// Función para obtener el ganador del juego
export const getGameWinner = (players: WordGuessingPlayer[]): WordGuessingPlayer | null => {
    if (players.length === 0) return null;

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    return sortedPlayers[0];
};

// Función para crear un mensaje de chat
export const createWordGuessingMessage = (
    playerId: string,
    playerName: string,
    message: string,
    isCorrectGuess: boolean = false
) => {
    return createMessage(playerId, playerName, message, isCorrectGuess);
};

/**
 * Genera la palabra oculta con guiones bajos y letras reveladas
 * Ejemplo: palabra = "perro", letrasReveladas = [false, true, false, false, true] => _ e _ _ o
 */
export function getHiddenWordDisplay(word: string, revealed: boolean[]): string {
    return word
        .split('')
        .map((char, idx) => (revealed[idx] ? char : '_'))
        .join(' ');
} 