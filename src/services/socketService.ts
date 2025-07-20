import { io, Socket } from 'socket.io-client';
import { ChatMessage, User } from '../types';

class SocketService {
    private socket: Socket | null = null;
    private baseUrl: string;
    //private eventListeners: Map<string, Function[]> = new Map();

    constructor() {
        this.baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:3001';
    }

    connect(): Socket {
        if (this.socket && this.socket.connected) {
            console.log('🔍 DEBUG: Socket ya conectado, retornando conexión existente');
            return this.socket;
        }

        if (this.socket) {
            console.log('🔍 DEBUG: Socket existe pero no conectado, desconectando antes de reconectar');
            this.socket.disconnect();
            this.socket = null;
        }

        console.log('🔍 DEBUG: Creando nueva conexión de socket');
        this.socket = io(this.baseUrl, {
            // Configuraciones para mantener conexión estable
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            forceNew: true, // Forzar nueva conexión
            autoConnect: true // Conectar automáticamente
        });

        // Agregar listeners para debug
        this.socket.on('connect', () => {
            console.log('🔍 DEBUG: Socket conectado con ID:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔍 DEBUG: Socket desconectado, razón:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔍 DEBUG: Error de conexión:', error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔍 DEBUG: Socket reconectado, intento:', attemptNumber);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🔍 DEBUG: Error de reconexión:', error);
        });

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    // Eventos del lobby
    joinLobby(name: string): void {
        if (this.socket) {
            this.socket.emit('join-lobby', { name });
        }
    }

    leaveLobby(): void {
        if (this.socket) {
            this.socket.emit('leave-lobby');
        }
    }

    // Eventos del chat
    sendMessage(content: string): void {
        if (this.socket) {
            this.socket.emit('send-message', { content });
        }
    }

    // Eventos de estado
    updateStatus(status: 'online' | 'away'): void {
        if (this.socket) {
            this.socket.emit('update-status', status);
        }
    }

    // Eventos de ping
    sendPing(): void {
        if (this.socket) {
            this.socket.emit('ping', Date.now());
        }
    }

    // Listeners
    onConnect(callback: () => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('connect');
            this.socket.on('connect', callback);
        }
    }

    onDisconnect(callback: () => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('disconnect');
            this.socket.on('disconnect', callback);
        }
    }

    onUsersList(callback: (users: User[]) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('users-list');
            this.socket.on('users-list', callback);
        }
    }

    onUserJoined(callback: (user: User) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('user-joined');
            this.socket.on('user-joined', callback);
        }
    }

    onUserLeft(callback: (user: { id: string; name: string }) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('user-left');
            this.socket.on('user-left', callback);
        }
    }

    onUserUpdated(callback: (user: User) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('user-updated');
            this.socket.on('user-updated', callback);
        }
    }

    onChatHistory(callback: (messages: ChatMessage[]) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('chat-history');
            this.socket.on('chat-history', callback);
        }
    }

    onChatMessage(callback: (message: ChatMessage) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('chat-message');
            this.socket.on('chat-message', callback);
        }
    }

    onPong(callback: (timestamp: number) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('pong');
            this.socket.on('pong', callback);
        }
    }

    onForceDisconnect(callback: (data: { message: string; reason: string }) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('force-disconnect');
            this.socket.on('force-disconnect', callback);
        }
    }

    onError(callback: (error: { message: string }) => void): void {
        if (this.socket) {
            // Remover listener anterior para evitar duplicados
            this.socket.off('error');
            this.socket.on('error', callback);
        }
    }

    // Limpiar listeners
    off(event: string): void {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    offAll(): void {
        if (this.socket) {
            this.socket.off();
        }
    }
}

export const socketService = new SocketService(); 