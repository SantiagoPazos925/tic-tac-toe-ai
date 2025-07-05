import { Game } from '../types';

// Configuración centralizada de todos los juegos
export const GAMES: Game[] = [
    {
        id: 'tic-tac-toe',
        name: 'Tic-Tac-Toe',
        description: 'El clásico juego de tres en línea',
        icon: '⭕',
        status: 'available',
        players: '2 jugadores'
    },
    {
        id: 'connect-four',
        name: 'Conecta 4',
        description: 'Conecta cuatro fichas en línea',
        icon: '🔴',
        status: 'coming-soon',
        players: '2 jugadores'
    },
    {
        id: 'checkers',
        name: 'Damas',
        description: 'El juego tradicional de damas',
        icon: '⚫',
        status: 'coming-soon',
        players: '2 jugadores'
    },
    {
        id: 'chess',
        name: 'Ajedrez',
        description: 'El juego de estrategia por excelencia',
        icon: '♔',
        status: 'coming-soon',
        players: '2 jugadores'
    },
    {
        id: 'battleship',
        name: 'Batalla Naval',
        description: 'Hunde la flota enemiga',
        icon: '🚢',
        status: 'coming-soon',
        players: '2 jugadores'
    },
    {
        id: 'wordle',
        name: 'Wordle',
        description: 'Adivina la palabra en 6 intentos',
        icon: '📝',
        status: 'coming-soon',
        players: '1 jugador'
    }
];

// Función para obtener un juego por ID
export const getGameById = (id: string): Game | undefined => {
    return GAMES.find(game => game.id === id);
};

// Función para obtener juegos disponibles
export const getAvailableGames = (): Game[] => {
    return GAMES.filter(game => game.status === 'available');
};

// Función para obtener juegos próximos
export const getComingSoonGames = (): Game[] => {
    return GAMES.filter(game => game.status === 'coming-soon');
}; 