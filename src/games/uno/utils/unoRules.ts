import {
    UnoGameState,
    UnoPlayer,
    UnoCard,
    CardColor,
    CardValue,
    GameDirection,
    PlayerAction,
    ActionResult,
    BotStrategy
} from '../types';
import { canPlayCard, getPlayableCards, formatCard, getColorName } from './unoDeck';

// Configuración de estrategias de bot por dificultad
export const BOT_STRATEGIES: Record<string, BotStrategy> = {
    easy: {
        priority: 'numbers',
        aggression: 0.3,
        unoThreshold: 0.8
    },
    medium: {
        priority: 'actions',
        aggression: 0.6,
        unoThreshold: 0.6
    },
    hard: {
        priority: 'wilds',
        aggression: 0.9,
        unoThreshold: 0.4
    }
};

// Validar si una acción del jugador es legal
export const validatePlayerAction = (
    action: PlayerAction,
    gameState: UnoGameState,
    playerIndex: number
): ActionResult => {
    const currentPlayer = gameState.players[playerIndex];
    const currentCard = gameState.discardPile[gameState.discardPile.length - 1];

    switch (action.type) {
        case 'playCard':
            if (!action.cardId) {
                return {
                    success: false,
                    message: 'Debes seleccionar una carta para jugar.',
                    nextPlayer: playerIndex,
                    direction: gameState.direction,
                    drawStack: gameState.drawStack,
                    currentColor: gameState.currentColor,
                    currentValue: gameState.currentValue
                };
            }

            const cardToPlay = currentPlayer.hand.find(card => card.id === action.cardId);
            if (!cardToPlay) {
                return {
                    success: false,
                    message: 'La carta seleccionada no está en tu mano.',
                    nextPlayer: playerIndex,
                    direction: gameState.direction,
                    drawStack: gameState.drawStack,
                    currentColor: gameState.currentColor,
                    currentValue: gameState.currentValue
                };
            }

            if (!canPlayCard(cardToPlay, gameState.currentColor, gameState.currentValue)) {
                return {
                    success: false,
                    message: `No puedes jugar ${formatCard(cardToPlay)} sobre ${formatCard(currentCard)}.`,
                    nextPlayer: playerIndex,
                    direction: gameState.direction,
                    drawStack: gameState.drawStack,
                    currentColor: gameState.currentColor,
                    currentValue: gameState.currentValue
                };
            }

            return executeCardPlay(gameState, playerIndex, cardToPlay, action.newColor);

        case 'drawCard':
            return executeDrawCard(gameState, playerIndex);

        case 'sayUno':
            return executeSayUno(gameState, playerIndex);

        case 'challenge':
            return executeChallenge(gameState, playerIndex, action.challengeTarget);

        default:
            return {
                success: false,
                message: 'Acción no válida.',
                nextPlayer: playerIndex,
                direction: gameState.direction,
                drawStack: gameState.drawStack,
                currentColor: gameState.currentColor,
                currentValue: gameState.currentValue
            };
    }
};

// Ejecutar el juego de una carta
const executeCardPlay = (
    gameState: UnoGameState,
    playerIndex: number,
    card: UnoCard,
    newColor?: CardColor
): ActionResult => {
    const newGameState = { ...gameState };
    const player = newGameState.players[playerIndex];

    // Remover carta de la mano del jugador
    player.hand = player.hand.filter(c => c.id !== card.id);

    // Agregar carta a la pila de descarte
    newGameState.discardPile.push(card);

    // Actualizar color y valor actuales
    if (card.color === 'black') {
        // Comodín - el jugador debe elegir un color
        if (!newColor) {
            return {
                success: false,
                message: 'Debes elegir un color para el comodín.',
                nextPlayer: playerIndex,
                direction: gameState.direction,
                drawStack: gameState.drawStack,
                currentColor: gameState.currentColor,
                currentValue: gameState.currentValue
            };
        }
        newGameState.currentColor = newColor;
        newGameState.currentValue = card.value;
    } else {
        newGameState.currentColor = card.color;
        newGameState.currentValue = card.value;
    }

    // Aplicar efectos especiales de la carta
    const effectResult = applyCardEffects(newGameState, playerIndex, card);

    // Verificar si el jugador ganó
    if (player.hand.length === 0) {
        newGameState.gamePhase = 'gameOver';
        newGameState.winner = player;
        return {
            success: true,
            message: `¡${player.name} ha ganado la partida!`,
            nextPlayer: playerIndex,
            direction: effectResult.direction,
            drawStack: effectResult.drawStack,
            currentColor: effectResult.currentColor,
            currentValue: effectResult.currentValue
        };
    }

    // Verificar si debe decir UNO
    if (player.hand.length === 1 && !player.hasSaidUno) {
        return {
            success: true,
            message: `¡${player.name} jugó ${formatCard(card)}! ¡No olvides decir UNO!`,
            nextPlayer: effectResult.nextPlayer,
            direction: effectResult.direction,
            drawStack: effectResult.drawStack,
            currentColor: effectResult.currentColor,
            currentValue: effectResult.currentValue
        };
    }

    return {
        success: true,
        message: `¡${player.name} jugó ${formatCard(card)}!`,
        nextPlayer: effectResult.nextPlayer,
        direction: effectResult.direction,
        drawStack: effectResult.drawStack,
        currentColor: effectResult.currentColor,
        currentValue: effectResult.currentValue
    };
};

// Aplicar efectos especiales de las cartas
const applyCardEffects = (
    gameState: UnoGameState,
    playerIndex: number,
    card: UnoCard
): ActionResult => {
    const numPlayers = gameState.players.length;
    let nextPlayer = playerIndex;
    let direction = gameState.direction;
    let drawStack = gameState.drawStack;
    let currentColor = gameState.currentColor;
    let currentValue = gameState.currentValue;

    switch (card.value) {
        case 'skip':
            nextPlayer = getNextPlayer(playerIndex, direction, numPlayers);
            break;

        case 'reverse':
            if (numPlayers === 2) {
                // Con 2 jugadores, actúa como skip
                nextPlayer = getNextPlayer(playerIndex, direction, numPlayers);
            } else {
                // Cambiar dirección
                direction = direction === 'clockwise' ? 'counterclockwise' : 'clockwise';
            }
            break;

        case 'draw2':
            drawStack += 2;
            nextPlayer = getNextPlayer(playerIndex, direction, numPlayers);
            break;

        case 'wild4':
            drawStack += 4;
            nextPlayer = getNextPlayer(playerIndex, direction, numPlayers);
            break;
    }

    return {
        success: true,
        message: '',
        nextPlayer,
        direction,
        drawStack,
        currentColor,
        currentValue
    };
};

// Ejecutar robo de carta
const executeDrawCard = (
    gameState: UnoGameState,
    playerIndex: number
): ActionResult => {
    const player = gameState.players[playerIndex];
    const cardsToDraw = Math.max(1, gameState.drawStack);

    // Robar cartas
    for (let i = 0; i < cardsToDraw; i++) {
        if (gameState.deck.length > 0) {
            const drawnCard = gameState.deck.pop()!;
            player.hand.push(drawnCard);
        }
    }

    // Resetear draw stack
    const newDrawStack = 0;

    // Pasar al siguiente jugador
    const nextPlayer = getNextPlayer(playerIndex, gameState.direction, gameState.players.length);

    return {
        success: true,
        message: `${player.name} robó ${cardsToDraw} carta${cardsToDraw > 1 ? 's' : ''}.`,
        nextPlayer,
        direction: gameState.direction,
        drawStack: newDrawStack,
        currentColor: gameState.currentColor,
        currentValue: gameState.currentValue
    };
};

// Ejecutar decir UNO
const executeSayUno = (
    gameState: UnoGameState,
    playerIndex: number
): ActionResult => {
    const player = gameState.players[playerIndex];

    if (player.hand.length !== 1) {
        return {
            success: false,
            message: 'Solo puedes decir UNO cuando tienes exactamente 1 carta.',
            nextPlayer: playerIndex,
            direction: gameState.direction,
            drawStack: gameState.drawStack,
            currentColor: gameState.currentColor,
            currentValue: gameState.currentValue
        };
    }

    player.hasSaidUno = true;

    return {
        success: true,
        message: `¡${player.name} dijo UNO!`,
        nextPlayer: playerIndex,
        direction: gameState.direction,
        drawStack: gameState.drawStack,
        currentColor: gameState.currentColor,
        currentValue: gameState.currentValue
    };
};

// Ejecutar desafío (para comodín +4)
const executeChallenge = (
    gameState: UnoGameState,
    playerIndex: number,
    challengeTarget?: string
): ActionResult => {
    if (!challengeTarget) {
        return {
            success: false,
            message: 'Debes especificar a quién desafiar.',
            nextPlayer: playerIndex,
            direction: gameState.direction,
            drawStack: gameState.drawStack,
            currentColor: gameState.currentColor,
            currentValue: gameState.currentValue
        };
    }

    const challengedPlayer = gameState.players.find(p => p.id === challengeTarget);
    if (!challengedPlayer) {
        return {
            success: false,
            message: 'Jugador no encontrado.',
            nextPlayer: playerIndex,
            direction: gameState.direction,
            drawStack: gameState.drawStack,
            currentColor: gameState.currentColor,
            currentValue: gameState.currentValue
        };
    }

    // Simplificar el desafío: el desafiado siempre roba 6 cartas
    for (let i = 0; i < 6; i++) {
        if (gameState.deck.length > 0) {
            const drawnCard = gameState.deck.pop()!;
            challengedPlayer.hand.push(drawnCard);
        }
    }

    return {
        success: true,
        message: `¡${challengedPlayer.name} fue desafiado y robó 6 cartas!`,
        nextPlayer: playerIndex,
        direction: gameState.direction,
        drawStack: 0,
        currentColor: gameState.currentColor,
        currentValue: gameState.currentValue
    };
};

// Obtener el siguiente jugador
const getNextPlayer = (
    currentPlayer: number,
    direction: GameDirection,
    numPlayers: number
): number => {
    if (direction === 'clockwise') {
        return (currentPlayer + 1) % numPlayers;
    } else {
        return (currentPlayer - 1 + numPlayers) % numPlayers;
    }
};

// Verificar si un jugador debe robar cartas por no decir UNO
export const checkUnoPenalty = (gameState: UnoGameState, playerIndex: number): boolean => {
    const player = gameState.players[playerIndex];
    return player.hand.length === 1 && !player.hasSaidUno;
};

// Obtener la mejor carta para jugar (para bots)
export const getBestCardToPlay = (
    hand: UnoCard[],
    currentColor: CardColor,
    currentValue: CardValue,
    strategy: BotStrategy
): UnoCard | null => {
    const playableCards = getPlayableCards(hand, currentColor, currentValue);

    if (playableCards.length === 0) {
        return null;
    }

    // Filtrar por prioridad de estrategia
    let filteredCards = playableCards;

    switch (strategy.priority) {
        case 'numbers':
            filteredCards = playableCards.filter(card => card.type === 'number');
            if (filteredCards.length === 0) {
                filteredCards = playableCards;
            }
            break;
        case 'actions':
            filteredCards = playableCards.filter(card => card.type !== 'number');
            if (filteredCards.length === 0) {
                filteredCards = playableCards;
            }
            break;
        case 'wilds':
            filteredCards = playableCards.filter(card => card.color === 'black');
            if (filteredCards.length === 0) {
                filteredCards = playableCards;
            }
            break;
    }

    // Seleccionar la primera carta disponible
    return filteredCards[0] || playableCards[0];
};

// Obtener el mejor color para comodín (para bots)
export const getBestColorForWild = (hand: UnoCard[]): CardColor => {
    const colorCounts: Record<CardColor, number> = {
        red: 0,
        blue: 0,
        green: 0,
        yellow: 0,
        black: 0
    };

    hand.forEach(card => {
        if (card.color !== 'black') {
            colorCounts[card.color]++;
        }
    });

    // Elegir el color más frecuente
    let bestColor: CardColor = 'red';
    let maxCount = 0;

    Object.entries(colorCounts).forEach(([color, count]) => {
        if (color !== 'black' && count > maxCount) {
            maxCount = count;
            bestColor = color as CardColor;
        }
    });

    return bestColor;
}; 