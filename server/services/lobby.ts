import { lobbyConfig } from '../config/index.js';
import { ChatMessage, LobbyUser } from '../types/index.js';
import { Logger } from '../utils/logger.js';
import { validateChatMessage, ValidationError } from '../utils/validation.js';

export class LobbyService {
    private connectedUsers = new Map<string, LobbyUser>();
    private userSessions = new Map<string, { name: string; lastSeen: Date; socketId: string }>();
    private chatMessages: ChatMessage[] = [];

    // Unirse al lobby
    joinLobby(socketId: string, username: string): { user: LobbyUser | null; disconnectedSocketId: string | null } {
        const now = new Date();
        let disconnectedSocketId: string | null = null;

        Logger.lobby(`🔍 DEBUG: joinLobby iniciado para ${username} con socket ${socketId}`);
        Logger.lobby(`🔍 DEBUG: Usuarios conectados actualmente: ${Array.from(this.connectedUsers.values()).map(u => `${u.name}(${u.id})`).join(', ')}`);

        // Buscar y eliminar TODAS las conexiones existentes para este usuario
        const existingConnections: string[] = [];
        for (const [socketIdKey, user] of this.connectedUsers.entries()) {
            if (user.name === username && socketIdKey !== socketId) {
                existingConnections.push(socketIdKey);
                this.connectedUsers.delete(socketIdKey);
                Logger.lobby(`🔍 DEBUG: Eliminando conexión existente para ${username}: ${socketIdKey}`);
            }
        }

        Logger.lobby(`🔍 DEBUG: Conexiones existentes encontradas: ${existingConnections.length}`);

        // Tomar la primera conexión eliminada como la principal para notificar
        if (existingConnections.length > 0) {
            disconnectedSocketId = existingConnections[0] || null;
            Logger.lobby(`🔍 DEBUG: Desconectando conexión principal para ${username}: ${disconnectedSocketId}`);
        }

        // Limpiar cualquier sesión anterior
        const existingSession = this.userSessions.get(username);
        Logger.lobby(`🔍 DEBUG: Sesión existente para ${username}: ${existingSession ? `socketId: ${existingSession.socketId}, lastSeen: ${existingSession.lastSeen}` : 'no encontrada'}`);

        if (existingSession && existingSession.socketId && existingSession.socketId !== socketId) {
            if (this.connectedUsers.has(existingSession.socketId)) {
                this.connectedUsers.delete(existingSession.socketId);
                Logger.lobby(`🔍 DEBUG: Removiendo sesión anterior para ${username}: ${existingSession.socketId}`);
            }
        }

        const isReconnection = existingSession &&
            (now.getTime() - existingSession.lastSeen.getTime()) < lobbyConfig.reconnectionTimeout;

        Logger.lobby(`🔍 DEBUG: Es reconexión: ${isReconnection}`);

        // Verificar si el usuario ya está conectado con el mismo socket
        const existingUser = this.connectedUsers.get(socketId);
        if (existingUser && existingUser.name === username) {
            Logger.lobby(`🔍 DEBUG: Usuario ${username} ya está conectado con socket ${socketId}, no haciendo nada`);
            return { user: null, disconnectedSocketId: null };
        }

        const user: LobbyUser = {
            id: socketId,
            name: username,
            status: 'online',
            joinedAt: now,
            lastSeen: now
        };

        this.connectedUsers.set(socketId, user);
        this.userSessions.set(username, {
            name: username,
            lastSeen: now,
            socketId: socketId
        });

        Logger.lobby(`🔍 DEBUG: Usuario ${username} agregado con socket ${socketId}`);
        Logger.lobby(`🔍 DEBUG: Usuarios conectados después: ${Array.from(this.connectedUsers.values()).map(u => `${u.name}(${u.id})`).join(', ')}`);

        Logger.lobby(`Usuario ${username} ${isReconnection ? 'se reconectó' : 'se unió'} al lobby (socket: ${socketId})`);

        return { user, disconnectedSocketId };
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
        this.userSessions.set(user.name, {
            name: user.name,
            lastSeen: now,
            socketId: socketId
        });
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
        Logger.lobby(`🔍 DEBUG: updateUserStatus llamado para socket ${socketId} con estado ${status}`);

        const user = this.connectedUsers.get(socketId);
        if (!user) {
            Logger.lobby(`🔍 DEBUG: No se encontró usuario para socket ${socketId}`);
            Logger.lobby(`🔍 DEBUG: Usuarios conectados: ${Array.from(this.connectedUsers.keys()).join(', ')}`);
            return null;
        }

        Logger.lobby(`🔍 DEBUG: Usuario encontrado: ${user.name}, estado actual: ${user.status}`);
        user.status = status;
        user.lastSeen = new Date();
        this.connectedUsers.set(socketId, user);

        Logger.lobby(`🔍 DEBUG: Usuario ${user.name} cambió estado a: ${status}`);
        Logger.lobby(`🔍 DEBUG: Usuario actualizado en connectedUsers: ${user.name}(${user.id}) - ${user.status}`);

        return user;
    }

    // Enviar mensaje del chat
    sendMessage(socketId: string, content: string, replyTo?: string): ChatMessage | null {
        Logger.lobby(`🔍 DEBUG: sendMessage llamado con socketId: ${socketId}, content: "${content}", replyTo: ${replyTo}`);
        Logger.lobby(`🔍 DEBUG: Usuarios conectados actualmente: ${Array.from(this.connectedUsers.keys()).join(', ')}`);
        
        const user = this.connectedUsers.get(socketId);
        if (!user) {
            Logger.lobby(`🔍 DEBUG: Usuario no encontrado para socket ${socketId}`);
            Logger.lobby(`🔍 DEBUG: Total de usuarios conectados: ${this.connectedUsers.size}`);
            return null;
        }

        Logger.lobby(`🔍 DEBUG: Procesando mensaje de ${user.name}: "${content}"`);

        try {
            const validatedContent = validateChatMessage(content);
            Logger.lobby(`🔍 DEBUG: Mensaje validado exitosamente: "${validatedContent}"`);

            const chatMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'user',
                content: validatedContent,
                sender: user.name,
                timestamp: new Date(),
                ...(replyTo ? { replyTo } : {})
            };

            this.addChatMessage(chatMessage);
            Logger.lobby(`✅ Mensaje de ${user.name}: ${validatedContent}`);

            return chatMessage;
        } catch (error) {
            if (error instanceof ValidationError) {
                Logger.warn(`❌ Mensaje inválido de ${user.name}: "${content}" - Error: ${error.message}`);
            } else {
                Logger.error(`❌ Error inesperado procesando mensaje de ${user.name}:`, error);
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

    // Obtener lista de usuarios conectados (sin duplicados)
    getConnectedUsers(): LobbyUser[] {
        const uniqueUsers = new Map<string, LobbyUser>();

        for (const user of this.connectedUsers.values()) {
            // Si ya existe un usuario con este nombre, mantener el más reciente
            const existingUser = uniqueUsers.get(user.name);
            if (!existingUser || (user.lastSeen && existingUser.lastSeen && user.lastSeen > existingUser.lastSeen)) {
                uniqueUsers.set(user.name, user);
            }
        }

        // Limpiar sesiones antiguas que ya no están conectadas
        this.cleanupDisconnectedSessions();

        return Array.from(uniqueUsers.values());
    }

    // Limpiar sesiones de usuarios que ya no están conectados
    private cleanupDisconnectedSessions(): void {
        const connectedUsernames = new Set(Array.from(this.connectedUsers.values()).map(user => user.name));

        for (const [username, _session] of this.userSessions.entries()) {
            if (!connectedUsernames.has(username)) {
                this.userSessions.delete(username);
                Logger.lobby(`Sesión limpiada para usuario desconectado: ${username}`);
            }
        }
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
        const uniqueUsers = this.getConnectedUsers();
        return {
            connectedUsers: uniqueUsers.length,
            totalSessions: this.userSessions.size,
            chatMessages: this.chatMessages.length,
            onlineUsers: uniqueUsers.filter(u => u.status === 'online').length,
            awayUsers: uniqueUsers.filter(u => u.status === 'away').length
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