import { useState, useEffect, useCallback } from 'react';
import {
    UnoGameState,
    UnoPlayer,
    UnoCard,
    CardColor,
    GameDirection,
    PlayerAction,
    ActionResult,
    UnoGameConfig,
    UnoUIState
} from '../types';
import {
    generateUnoDeck,
    shuffleDeck,
    dealInitialCards,
    getFirstDiscardCard,
    formatCard,
    getColorEmoji,
    getColorName,
    canPlayCard
} from '../utils/unoDeck';
import {
    validatePlayerAction,
    BOT_STRATEGIES,
    getBestCardToPlay,
    getBestColorForWild,
    checkUnoPenalty
} from '../utils/unoRules';

// Configuración por defecto
const DEFAULT_CONFIG: UnoGameConfig = {
    numBots: 2,
    difficulty: 'medium',
    enableChallenges: true
};

// Estado inicial de la UI
const initialUIState: UnoUIState = {
    showCardSelector: false,
    showColorSelector: false,
    showUnoButton: false,
    showChallengeButton: false,
    selectedCardId: null,
    selectedColor: null,
    gameMessage: '',
    gameMessageType: 'info',
    showGameOver: false
};

export const useUnoGame = (config: UnoGameConfig = DEFAULT_CONFIG) => {
    const [gameState, setGameState] = useState<UnoGameState | null>(null);
    const [uiState, setUiState] = useState<UnoUIState>(initialUIState);
    const [isBotTurn, setIsBotTurn] = useState(false);
    const [drawAnimation, setDrawAnimation] = useState(false);

    // Inicializar el juego
    const initializeGame = useCallback(() => {
        // Generar y barajar la baraja
        const deck = shuffleDeck(generateUnoDeck());

        // Crear jugadores
        const players: UnoPlayer[] = [
            {
                id: 'player',
                name: 'Tú',
                type: 'human',
                hand: [],
                hasSaidUno: false,
                isCurrentTurn: true
            }
        ];

        // Agregar bots
        for (let i = 1; i <= config.numBots; i++) {
            players.push({
                id: `bot${i}`,
                name: `Bot ${i}`,
                type: 'bot',
                hand: [],
                hasSaidUno: false,
                isCurrentTurn: false
            });
        }

        // Repartir cartas iniciales
        const { playerHands, remainingDeck } = dealInitialCards(deck, players.length);

        // Asignar manos a los jugadores
        players.forEach((player, index) => {
            player.hand = playerHands[index];
        });

        // Obtener primera carta para la pila de descarte
        const { firstCard, remainingDeck: finalDeck } = getFirstDiscardCard(remainingDeck);

        // Crear estado inicial del juego
        const initialState: UnoGameState = {
            players,
            currentPlayerIndex: 0,
            direction: 'clockwise',
            deck: finalDeck,
            discardPile: [firstCard],
            currentColor: firstCard.color === 'black' ? 'red' : firstCard.color,
            currentValue: firstCard.value,
            gamePhase: 'playing',
            winner: null,
            lastAction: '',
            drawStack: 0,
            challengeMode: false
        };

        setGameState(initialState);
        setUiState(initialUIState);
        setIsBotTurn(false);

        // Mostrar mensaje de inicio
        setUiState(prev => ({
            ...prev,
            gameMessage: `¡El juego comienza! Carta inicial: ${formatCard(firstCard)}`,
            gameMessageType: 'info'
        }));
    }, [config.numBots]);

    // Ejecutar acción del jugador
    const executePlayerAction = useCallback((action: PlayerAction) => {
        if (!gameState || gameState.gamePhase !== 'playing') return;

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (currentPlayer.type !== 'human') return;

        const result = validatePlayerAction(action, gameState, gameState.currentPlayerIndex);

        if (result.success) {
            // Actualizar estado del juego
            setGameState(prev => {
                if (!prev) return prev;

                const newState = { ...prev };

                // Aplicar cambios según el tipo de acción
                if (action.type === 'playCard' && action.cardId) {
                    const card = currentPlayer.hand.find(c => c.id === action.cardId);
                    if (card) {
                        // Remover carta de la mano
                        currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== action.cardId);

                        // Agregar a la pila de descarte
                        newState.discardPile.push(card);

                        // Actualizar color y valor
                        if (card.color === 'black' && action.newColor) {
                            newState.currentColor = action.newColor;
                        } else if (card.color !== 'black') {
                            newState.currentColor = card.color;
                        }
                        newState.currentValue = card.value;

                        // Verificar victoria
                        if (currentPlayer.hand.length === 0) {
                            newState.gamePhase = 'gameOver';
                            newState.winner = currentPlayer;
                        }
                    }
                } else if (action.type === 'drawCard') {
                    const cardsToDraw = Math.max(1, newState.drawStack);
                    for (let i = 0; i < cardsToDraw; i++) {
                        if (newState.deck.length > 0) {
                            const drawnCard = newState.deck.pop()!;
                            currentPlayer.hand.push(drawnCard);
                        }
                    }
                    newState.drawStack = 0;
                } else if (action.type === 'sayUno') {
                    currentPlayer.hasSaidUno = true;
                }

                // Actualizar turno y dirección
                newState.currentPlayerIndex = result.nextPlayer;
                newState.direction = result.direction;
                newState.drawStack = result.drawStack;
                newState.currentColor = result.currentColor;
                newState.currentValue = result.currentValue;

                // Resetear UNO para todos los jugadores
                newState.players.forEach(player => {
                    if (player.hand.length !== 1) {
                        player.hasSaidUno = false;
                    }
                });

                return newState;
            });

            // Mostrar mensaje
            setUiState(prev => ({
                ...prev,
                gameMessage: result.message,
                gameMessageType: 'success',
                showCardSelector: false,
                showColorSelector: false,
                selectedCardId: null,
                selectedColor: null
            }));

            // Verificar si es turno de bot
            const nextPlayer = gameState.players[result.nextPlayer];
            if (nextPlayer.type === 'bot') {
                setIsBotTurn(true);
            }
        } else {
            // Mostrar error
            setUiState(prev => ({
                ...prev,
                gameMessage: result.message,
                gameMessageType: 'error'
            }));
        }
    }, [gameState]);

    // Ejecutar turno de bot
    const executeBotTurn = useCallback(() => {
        if (!gameState || gameState.gamePhase !== 'playing') return;

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (currentPlayer.type !== 'bot') return;

        const strategy = BOT_STRATEGIES[config.difficulty];
        const playableCards = currentPlayer.hand.filter(card =>
            card.color === gameState.currentColor ||
            card.value === gameState.currentValue ||
            card.color === 'black'
        );

        let action: PlayerAction;
        let message = '';

        if (playableCards.length > 0) {
            // Jugar carta
            const bestCard = getBestCardToPlay(
                currentPlayer.hand,
                gameState.currentColor,
                gameState.currentValue,
                strategy
            );

            if (bestCard) {
                let newColor: CardColor | undefined;

                if (bestCard.color === 'black') {
                    newColor = getBestColorForWild(currentPlayer.hand);
                }

                action = {
                    type: 'playCard',
                    cardId: bestCard.id,
                    newColor
                };

                message = `¡${currentPlayer.name} jugó ${formatCard(bestCard)}!`;

                if (bestCard.color === 'black') {
                    message += ` Eligió el color ${getColorName(newColor!)}.`;
                }
            } else {
                action = { type: 'drawCard' };
                message = `${currentPlayer.name} no tiene cartas para jugar y roba una carta.`;
            }
        } else {
            // Robar carta
            if (gameState.deck.length > 0) {
                const drawnCard = gameState.deck[gameState.deck.length - 1];
                // Simular que el bot roba la carta
                const canPlay = canPlayCard(drawnCard, gameState.currentColor, gameState.currentValue);
                if (canPlay) {
                    action = { type: 'playCard', cardId: drawnCard.id };
                    message = `${currentPlayer.name} robó una carta y la jugó.`;
                } else {
                    action = { type: 'drawCard' };
                    message = `${currentPlayer.name} robó una carta pero no pudo jugarla.`;
                }
            } else {
                action = { type: 'drawCard' };
                message = `${currentPlayer.name} intentó robar pero el mazo está vacío.`;
            }
        }

        // Ejecutar acción del bot
        const result = validatePlayerAction(action, gameState, gameState.currentPlayerIndex);

        if (result.success) {
            setGameState(prev => {
                if (!prev) return prev;

                const newState = { ...prev };

                if (action.type === 'playCard' && action.cardId) {
                    const card = currentPlayer.hand.find(c => c.id === action.cardId);
                    if (card) {
                        currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== action.cardId);
                        newState.discardPile.push(card);

                        if (card.color === 'black' && action.newColor) {
                            newState.currentColor = action.newColor;
                        } else if (card.color !== 'black') {
                            newState.currentColor = card.color;
                        }
                        newState.currentValue = card.value;

                        if (currentPlayer.hand.length === 0) {
                            newState.gamePhase = 'gameOver';
                            newState.winner = currentPlayer;
                        }
                    }
                } else if (action.type === 'drawCard') {
                    const cardsToDraw = Math.max(1, newState.drawStack);
                    for (let i = 0; i < cardsToDraw; i++) {
                        if (newState.deck.length > 0) {
                            const drawnCard = newState.deck.pop()!;
                            currentPlayer.hand.push(drawnCard);
                        }
                    }
                    newState.drawStack = 0;
                }

                newState.currentPlayerIndex = result.nextPlayer;
                newState.direction = result.direction;
                newState.drawStack = result.drawStack;
                newState.currentColor = result.currentColor;
                newState.currentValue = result.currentValue;

                // Resetear UNO
                newState.players.forEach(player => {
                    if (player.hand.length !== 1) {
                        player.hasSaidUno = false;
                    }
                });

                return newState;
            });

            setUiState(prev => ({
                ...prev,
                gameMessage: message,
                gameMessageType: 'info'
            }));

            // Verificar si el siguiente jugador es humano
            const nextPlayer = gameState.players[result.nextPlayer];
            if (nextPlayer.type === 'human') {
                setIsBotTurn(false);
            }
        }
    }, [gameState, config.difficulty]);

    // Ejecutar turno de bot con delay
    useEffect(() => {
        if (isBotTurn && gameState) {
            const timer = setTimeout(() => {
                executeBotTurn();
            }, 1500); // 1.5 segundos de delay

            return () => clearTimeout(timer);
        }
    }, [isBotTurn, gameState, executeBotTurn]);

    // Obtener cartas jugables para el jugador humano
    const getPlayableCards = useCallback(() => {
        if (!gameState) return [];

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (currentPlayer.type !== 'human') return [];

        return currentPlayer.hand.filter(card =>
            card.color === gameState.currentColor ||
            card.value === gameState.currentValue ||
            card.color === 'black'
        );
    }, [gameState]);

    // Verificar si el jugador debe decir UNO
    const shouldSayUno = useCallback(() => {
        if (!gameState) return false;

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        return currentPlayer.type === 'human' &&
            currentPlayer.hand.length === 1 &&
            !currentPlayer.hasSaidUno;
    }, [gameState]);

    // Reiniciar juego
    const resetGame = useCallback(() => {
        initializeGame();
    }, [initializeGame]);

    const handlePlayCard = (cardId: string) => {
        const card = gameState?.players[0].hand.find(c => c.id === cardId);
        if (!gameState || !card) return;
        // Solo permitir jugar si la carta es jugable
        const playableCards = getPlayableCards();
        if (!playableCards.some(c => c.id === cardId)) return;
        if (card.color === 'black') {
            setUiState(prev => ({
                ...prev,
                showColorSelector: true,
                selectedCardId: cardId
            }));
        } else {
            executePlayerAction({
                type: 'playCard',
                cardId
            });
        }
    };

    const handleDrawCard = () => {
        if (!gameState) return;
        // Solo permitir robar si NO hay cartas jugables
        const playableCards = getPlayableCards();
        if (playableCards.length > 0) return;
        // Robar carta
        setDrawAnimation(true);
        setTimeout(() => {
            setDrawAnimation(false);
            // Robar una carta
            const newDeck = [...gameState.deck];
            const drawnCard = newDeck.pop();
            if (!drawnCard) return;
            const newHand = [...gameState.players[0].hand, drawnCard];
            // Si la carta robada es jugable, se juega automáticamente
            if (canPlayCard(drawnCard, gameState.currentColor, gameState.currentValue)) {
                executePlayerAction({
                    type: 'playCard',
                    cardId: drawnCard.id
                });
            } else {
                // Si no es jugable, solo la agrega a la mano y pasa turno
                executePlayerAction({ type: 'drawCard' });
            }
        }, 500);
    };

    return {
        gameState,
        uiState,
        isBotTurn,
        initializeGame,
        executePlayerAction,
        getPlayableCards,
        shouldSayUno,
        resetGame,
        setUiState
    };
}; 