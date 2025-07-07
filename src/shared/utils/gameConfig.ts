import { Game } from '../types';

// Configuración centralizada de todos los juegos
export const GAMES: Game[] = [
    {
        id: 'uno',
        name: 'UNO',
        description: 'El clásico juego de cartas UNO',
        icon: '🃏',
        status: 'coming-soon',
        players: '1 vs IA'
    },

    {
        id: 'tic-tac-toe',
        name: 'Tic-Tac-Toe',
        description: 'El clásico juego de tres en línea',
        icon: '⭕',
        status: 'available',
        players: '2 jugadores'
    },
    {
        id: 'word-guessing',
        name: 'Adivina la Palabra',
        description: 'Dibuja y adivina palabras en tiempo real',
        icon: '🎨',
        status: 'available',
        players: '2-8 jugadores'
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