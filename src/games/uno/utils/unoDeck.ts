import { UnoCard, CardColor, CardType, CardValue } from '../types';

// Configuración de la baraja de UNO
const UNO_DECK_CONFIG = {
    colors: ['red', 'blue', 'green', 'yellow'] as CardColor[],
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as CardValue[],
    actionCards: ['skip', 'reverse', 'draw2'] as CardValue[],
    wildCards: ['wild', 'wild4'] as CardValue[]
};

// Generar una carta individual
const createCard = (
    color: CardColor,
    type: CardType,
    value: CardValue,
    id: string
): UnoCard => {
    let displayValue = '';

    switch (value) {
        case 'skip':
            displayValue = '⏭️';
            break;
        case 'reverse':
            displayValue = '🔄';
            break;
        case 'draw2':
            displayValue = '+2';
            break;
        case 'wild':
            displayValue = '🌈';
            break;
        case 'wild4':
            displayValue = '+4';
            break;
        default:
            displayValue = value.toString();
    }

    return {
        id,
        color,
        type,
        value,
        displayValue
    };
};

// Generar la baraja completa de UNO (108 cartas)
export const generateUnoDeck = (): UnoCard[] => {
    const deck: UnoCard[] = [];
    let cardId = 0;

    // Cartas de número (19 de cada color: 1 cero, 2 de cada número del 1-9)
    UNO_DECK_CONFIG.colors.forEach(color => {
        // Un cero
        deck.push(createCard(color, 'number', 0, `card_${cardId++}`));

        // Dos de cada número del 1-9
        for (let num = 1; num <= 9; num++) {
            deck.push(createCard(color, 'number', num as CardValue, `card_${cardId++}`));
            deck.push(createCard(color, 'number', num as CardValue, `card_${cardId++}`));
        }
    });

    // Cartas de acción (2 de cada color para skip, reverse, draw2)
    UNO_DECK_CONFIG.colors.forEach(color => {
        UNO_DECK_CONFIG.actionCards.forEach(action => {
            deck.push(createCard(color, action as CardType, action, `card_${cardId++}`));
            deck.push(createCard(color, action as CardType, action, `card_${cardId++}`));
        });
    });

    // Comodines (4 de cada tipo)
    for (let i = 0; i < 4; i++) {
        deck.push(createCard('black', 'wild', 'wild', `card_${cardId++}`));
        deck.push(createCard('black', 'wild4', 'wild4', `card_${cardId++}`));
    }

    return deck;
};

// Barajar la baraja usando el algoritmo Fisher-Yates
export const shuffleDeck = (deck: UnoCard[]): UnoCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Repartir cartas iniciales
export const dealInitialCards = (deck: UnoCard[], numPlayers: number): {
    playerHands: UnoCard[][];
    remainingDeck: UnoCard[];
} => {
    const playerHands: UnoCard[][] = [];
    const remainingDeck = [...deck];

    // Repartir 7 cartas a cada jugador
    for (let i = 0; i < numPlayers; i++) {
        const hand: UnoCard[] = [];
        for (let j = 0; j < 7; j++) {
            if (remainingDeck.length > 0) {
                hand.push(remainingDeck.pop()!);
            }
        }
        playerHands.push(hand);
    }

    return { playerHands, remainingDeck };
};

// Obtener la primera carta para la pila de descarte
export const getFirstDiscardCard = (deck: UnoCard[]): {
    firstCard: UnoCard;
    remainingDeck: UnoCard[];
} => {
    const remainingDeck = [...deck];
    let firstCard: UnoCard;

    do {
        firstCard = remainingDeck.pop()!;
    } while (firstCard.type === 'wild4'); // Rechazar comodines +4 como primera carta

    return { firstCard, remainingDeck };
};

// Verificar si una carta se puede jugar
export const canPlayCard = (
    card: UnoCard,
    currentColor: CardColor,
    currentValue: CardValue
): boolean => {
    // Comodines siempre se pueden jugar
    if (card.color === 'black') {
        return true;
    }

    // Verificar coincidencia de color o valor
    return card.color === currentColor || card.value === currentValue;
};

// Obtener cartas jugables de una mano
export const getPlayableCards = (
    hand: UnoCard[],
    currentColor: CardColor,
    currentValue: CardValue
): UnoCard[] => {
    return hand.filter(card => canPlayCard(card, currentColor, currentValue));
};

// Obtener el emoji del color
export const getColorEmoji = (color: CardColor): string => {
    switch (color) {
        case 'red': return '🟥';
        case 'blue': return '🟦';
        case 'green': return '🟩';
        case 'yellow': return '🟨';
        case 'black': return '⚫';
        default: return '⚪';
    }
};

// Obtener el nombre del color en español
export const getColorName = (color: CardColor): string => {
    switch (color) {
        case 'red': return 'Rojo';
        case 'blue': return 'Azul';
        case 'green': return 'Verde';
        case 'yellow': return 'Amarillo';
        case 'black': return 'Negro';
        default: return 'Desconocido';
    }
};

// Obtener el nombre del valor de la carta
export const getValueName = (value: CardValue): string => {
    switch (value) {
        case 'skip': return 'Salta';
        case 'reverse': return 'Reversa';
        case 'draw2': return 'Toma 2';
        case 'wild': return 'Comodín';
        case 'wild4': return 'Comodín +4';
        default: return value.toString();
    }
};

// Formatear carta para mostrar
export const formatCard = (card: UnoCard): string => {
    const colorEmoji = getColorEmoji(card.color);
    const colorName = getColorName(card.color);
    const valueName = getValueName(card.value);

    if (card.color === 'black') {
        return `${colorEmoji} ${valueName}`;
    }

    return `${colorEmoji} ${valueName} (${colorName})`;
}; 