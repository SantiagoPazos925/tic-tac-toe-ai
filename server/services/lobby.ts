import { LobbyUser, ChatMessage } from '../types/index.js';
import { lobbyConfig } from '../config/index.js';
import { Logger } from '../utils/logger.js';
import { validateChatMessage, ValidationError } from '../utils/validation.js';

export class LobbyService {
    private connectedUsers = new Map<string, LobbyUser>();
    private userSessions = new Map<string, { name: string; lastSeen: Date }>();
    private chatMessages: ChatMessage[] = [];

    // Unirse al lobby
    joinLobby(socketId: string, username: string): LobbyUser {
        const now = new Date();
        const existingUser = this.userSessions.get(username);
        const isReconnection = existingUser &&
            (now.getTime() - existingUser.lastSeen.getTime()) < lobbyConfig.reconnectionTimeout;

        const user: LobbyUser = {
            id: socketId,
            name: username,
            status: 'online',
            joinedAt: now,
            lastSeen: now
        };

        this.connectedUsers.set(socketId, user);
        this.userSessions.set(username, { name: username, lastSeen: now });

        Logger.lobby(`Usuario ${username} ${isReconnection ? 'se reconectó' : 'se unió'} al lobby`);

        return user;
    }

    // Salir del lobby
    leaveLobby(socketId: string): { user: LobbyUser | null; isManual: boolean } {
        const user = this.connectedUsers.get(socketId);
        if (!user) {
            return { user: null, isManual: false };
        }

        this.connectedUsers.delete(socketId);
        this.userSessions.delete(user.name); // Limpiar sesión al salir manualmente

        Logger.lobby(`Usuario ${user.name} salió del lobby`);
        return { user, isManual: true };
    }

    // Desconectar usuario
    disconnectUser(socketId: string): LobbyUser | null {
        const user = this.connectedUsers.get(socketId);
        if (!user) {
            return null;
        }

        const now = new Date();
        this.userSessions.set(user.name, { name: user.name, lastSeen: now });
        this.connectedUsers.delete(socketId);

        Logger.lobby(`Usuario ${user.name} se desconectó temporalmente`);
        return user;
    }

    // Verificar si un usuario se reconectó rápidamente
    checkReconnection(username: string): boolean {
        const session = this.userSessions.get(username);
        if (!session) return false;

        const now = new Date();
        const timeDiff = now.getTime() - session.lastSeen.getTime();
        return timeDiff < lobbyConfig.reconnectionTimeout;
    }

    // Actualizar estado del usuario
    updateUserStatus(socketId: string, status: 'online' | 'away'): LobbyUser | null {
        const user = this.connectedUsers.get(socketId);
        if (!user) return null;

        user.status = status;
        user.lastSeen = new Date();
        this.connectedUsers.set(socketId, user);

        Logger.lobby(`Usuario ${user.name} cambió estado a: ${status}`);
        return user;
    }

    // Enviar mensaje del chat
    sendMessage(socketId: string, content: string): ChatMessage | null {
        const user = this.connectedUsers.get(socketId);
        if (!user) return null;

        try {
            const validatedContent = validateChatMessage(content);

            const chatMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'user',
                content: validatedContent,
                sender: user.name,
                timestamp: new Date()
            };

            this.addChatMessage(chatMessage);
            Logger.lobby(`Mensaje de ${user.name}: ${validatedContent}`);

            return chatMessage;
        } catch (error) {
            if (error instanceof ValidationError) {
                Logger.warn(`Mensaje inválido de ${user.name}: ${content}`);
            }
            return null;
        }
    }

    // Agregar mensaje del sistema
    addSystemMessage(content: string): ChatMessage {
        const systemMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'system',
            content,
            timestamp: new Date()
        };

        this.addChatMessage(systemMessage);
        Logger.lobby(`Mensaje del sistema: ${content}`);

        return systemMessage;
    }

    // Agregar mensaje al historial
    private addChatMessage(message: ChatMessage): void {
        this.chatMessages.push(message);

        // Mantener solo los últimos N mensajes
        if (this.chatMessages.length > lobbyConfig.maxChatHistory) {
            this.chatMessages = this.chatMessages.slice(-lobbyConfig.maxChatHistory);
        }
    }

    // Obtener lista de usuarios conectados
    getConnectedUsers(): LobbyUser[] {
        return Array.from(this.connectedUsers.values());
    }

    // Obtener historial del chat
    getChatHistory(): ChatMessage[] {
        return [...this.chatMessages];
    }

    // Obtener usuario por socket ID
    getUserBySocketId(socketId: string): LobbyUser | null {
        return this.connectedUsers.get(socketId) || null;
    }

    // Obtener usuario por nombre
    getUserByName(username: string): LobbyUser | null {
        for (const user of this.connectedUsers.values()) {
            if (user.name === username) {
                return user;
            }
        }
        return null;
    }

    // Obtener estadísticas del lobby
    getLobbyStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            totalSessions: this.userSessions.size,
            chatMessages: this.chatMessages.length,
            onlineUsers: Array.from(this.connectedUsers.values()).filter(u => u.status === 'online').length,
            awayUsers: Array.from(this.connectedUsers.values()).filter(u => u.status === 'away').length
        };
    }

    // Limpiar sesiones antiguas (para mantenimiento)
    cleanupOldSessions(): void {
        const now = new Date();
        const cutoffTime = now.getTime() - (lobbyConfig.reconnectionTimeout * 2);

        for (const [username, session] of this.userSessions.entries()) {
            if (session.lastSeen.getTime() < cutoffTime) {
                this.userSessions.delete(username);
                Logger.lobby(`Sesión limpiada para: ${username}`);
            }
        }
    }
} 