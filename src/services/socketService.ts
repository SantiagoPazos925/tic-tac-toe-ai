import { io, Socket } from 'socket.io-client';
import { User, ChatMessage } from '../types';

class SocketService {
    private socket: Socket | null = null;
    private baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    }

    connect(): Socket {
        if (!this.socket) {
            this.socket = io(this.baseUrl);
        }
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
            this.socket.on('connect', callback);
        }
    }

    onDisconnect(callback: () => void): void {
        if (this.socket) {
            this.socket.on('disconnect', callback);
        }
    }

    onUsersList(callback: (users: User[]) => void): void {
        if (this.socket) {
            this.socket.on('users-list', callback);
        }
    }

    onUserJoined(callback: (user: User) => void): void {
        if (this.socket) {
            this.socket.on('user-joined', callback);
        }
    }

    onUserLeft(callback: (user: { id: string; name: string }) => void): void {
        if (this.socket) {
            this.socket.on('user-left', callback);
        }
    }

    onUserUpdated(callback: (user: User) => void): void {
        if (this.socket) {
            this.socket.on('user-updated', callback);
        }
    }

    onChatHistory(callback: (messages: ChatMessage[]) => void): void {
        if (this.socket) {
            this.socket.on('chat-history', callback);
        }
    }

    onChatMessage(callback: (message: ChatMessage) => void): void {
        if (this.socket) {
            this.socket.on('chat-message', callback);
        }
    }

    onPong(callback: (timestamp: number) => void): void {
        if (this.socket) {
            this.socket.on('pong', callback);
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