// Utilidades compartidas entre todos los juegos

import { ChatMessage } from './types.js';

// Función para crear un mensaje de chat
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

// Función para generar un ID único
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Función para verificar si un jugador existe en una sala
export const findPlayerInRoom = (players: any[], playerId: string) => {
    return players.find(p => p.id === playerId);
};

// Función para remover un jugador de una sala
export const removePlayerFromRoom = (players: any[], playerId: string) => {
    const index = players.findIndex(p => p.id === playerId);
    if (index !== -1) {
        players.splice(index, 1);
        return true;
    }
    return false;
}; 