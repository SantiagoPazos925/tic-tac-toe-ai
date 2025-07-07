// Tipos específicos para el juego UNO

export interface Vector2D {
    x: number;
    y: number;
}

// Tipos de cartas
export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'black';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';
export type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface UnoCard {
    id: string;
    color: CardColor;
    type: CardType;
    value: CardValue;
    displayValue: string;
}

// Tipos de jugadores
export type PlayerType = 'human' | 'bot';
export type GameDirection = 'clockwise' | 'counterclockwise';

export interface UnoPlayer {
    id: string;
    name: string;
    type: PlayerType;
    hand: UnoCard[];
    hasSaidUno: boolean;
    isCurrentTurn: boolean;
}

// Estado del juego
export interface UnoGameState {
    players: UnoPlayer[];
    currentPlayerIndex: number;
    direction: GameDirection;
    deck: UnoCard[];
    discardPile: UnoCard[];
    currentColor: CardColor;
    currentValue: CardValue;
    gamePhase: 'setup' | 'playing' | 'gameOver';
    winner: UnoPlayer | null;
    lastAction: string;
    drawStack: number; // Para cartas +2 y +4 acumuladas
    challengeMode: boolean; // Para el desafío del +4
}

// Configuración del juego
export interface UnoGameConfig {
    numBots: number; // 2 o 3
    difficulty: 'easy' | 'medium' | 'hard';
    enableChallenges: boolean; // Para el desafío del +4
}

// Acciones del jugador
export interface PlayerAction {
    type: 'playCard' | 'drawCard' | 'sayUno' | 'challenge';
    cardId?: string;
    newColor?: CardColor;
    challengeTarget?: string;
}

// Resultado de una acción
export interface ActionResult {
    success: boolean;
    message: string;
    nextPlayer: number;
    direction: GameDirection;
    drawStack: number;
    currentColor: CardColor;
    currentValue: CardValue;
}

// Configuración de la IA
export interface BotStrategy {
    priority: 'numbers' | 'actions' | 'wilds';
    aggression: number; // 0-1, qué tan agresivo es el bot
    unoThreshold: number; // Cuándo decir UNO
}

// Estado de la UI
export interface UnoUIState {
    showCardSelector: boolean;
    showColorSelector: boolean;
    showUnoButton: boolean;
    showChallengeButton: boolean;
    selectedCardId: string | null;
    selectedColor: CardColor | null;
    gameMessage: string;
    gameMessageType: 'info' | 'warning' | 'error' | 'success';
    showGameOver: boolean;
}

// Configuración de física para animaciones
export interface UnoPhysics {
    cardFlipSpeed: number;
    cardMoveSpeed: number;
    cardDealSpeed: number;
    animationDuration: number;
}

// Configuración de sonidos
export interface UnoSoundConfig {
    cardPlay: boolean;
    cardDraw: boolean;
    unoCall: boolean;
    gameWin: boolean;
    gameStart: boolean;
} 