import { WordGuessingPlayer, WordGuessingGameState, ChatMessage, DrawingPoint } from '../types';
import { getRandomWord } from './wordCategories';

export const POINTS_FOR_CORRECT_GUESS = 10;
export const POINTS_FOR_DRAWING = 5;
export const DRAWING_TIME = 60;
export const ROUND_TIME = 90;
export const MAX_ROUNDS = 5;

export const checkGuess = (message: string, currentWord: string): boolean => {
    const normalizedMessage = message.toLowerCase().trim();
    const normalizedWord = currentWord.toLowerCase().trim();

    // Verificar coincidencia exacta
    if (normalizedMessage === normalizedWord) {
        return true;
    }

    // Verificar coincidencia sin acentos
    const withoutAccents = (str: string) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    if (withoutAccents(normalizedMessage) === withoutAccents(normalizedWord)) {
        return true;
    }

    // Verificar si contiene la palabra (para casos como "es un perro")
    if (normalizedMessage.includes(normalizedWord) || normalizedWord.includes(normalizedMessage)) {
        return true;
    }

    return false;
};

export const calculateScore = (
    player: WordGuessingPlayer,
    isCorrectGuess: boolean,
    isDrawer: boolean,
    timeRemaining: number
): number => {
    let score = player.score;

    if (isCorrectGuess) {
        // Puntos por adivinar correctamente
        score += POINTS_FOR_CORRECT_GUESS;

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

export const getNextDrawer = (players: WordGuessingPlayer[], currentDrawerId: string): string => {
    const currentIndex = players.findIndex(p => p.id === currentDrawerId);
    const nextIndex = (currentIndex + 1) % players.length;
    return players[nextIndex].id;
};

export const initializeGameState = (players: WordGuessingPlayer[]): WordGuessingGameState => {
    const firstDrawer = players[0]?.id || '';
    const word = getRandomWord();

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
        roundStartTime: Date.now()
    };
};

export const startNewRound = (
    players: WordGuessingPlayer[],
    roundNumber: number,
    previousDrawerId?: string
): Partial<WordGuessingGameState> => {
    const nextDrawerId = previousDrawerId
        ? getNextDrawer(players, previousDrawerId)
        : players[0]?.id || '';

    const word = getRandomWord();

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
        roundStartTime: Date.now()
    };
};

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
            gameState.timeRemaining
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

export const endGame = (players: WordGuessingPlayer[]): Partial<WordGuessingGameState> => {
    return {
        gamePhase: 'game-end',
        players: players.sort((a, b) => b.score - a.score)
    };
};

export const createMessage = (
    playerId: string,
    playerName: string,
    message: string,
    isCorrectGuess: boolean = false
): ChatMessage => {
    return {
        id: `${playerId}-${Date.now()}`,
        playerId,
        playerName,
        message,
        timestamp: Date.now(),
        isCorrectGuess
    };
};

export const isGameOver = (roundNumber: number): boolean => {
    return roundNumber >= MAX_ROUNDS;
};

export const getGameWinner = (players: WordGuessingPlayer[]): WordGuessingPlayer | null => {
    if (players.length === 0) return null;

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    return sortedPlayers[0];
}; 