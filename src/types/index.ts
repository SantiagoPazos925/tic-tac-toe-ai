// Tipos de usuario
export interface User {
    id: string;
    name: string;
    status: 'online' | 'away' | 'offline';
    joinedAt: Date;
}

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    token: string;
}

// Tipos de mensajes del chat
export interface ChatMessage {
    id: string;
    type: 'user' | 'system';
    content: string;
    sender?: string;
    timestamp: Date;
}

// Tipos para el formulario de autenticación
export interface AuthForm {
    username: string;
    email: string;
    password: string;
}

// Tipos para el menú contextual
export interface ContextMenuPosition {
    x: number;
    y: number;
}

// Tipos para las acciones del usuario
export type UserAction = 'profile' | 'message' | 'invite' | 'block';

// Tipos para el estado de conexión
export interface ConnectionStatus {
    isConnected: boolean;
    ping: number | null;
}

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Tipos para la autenticación
export interface AuthResponse {
    user: AuthUser;
    token: string;
}

// Tipos para los eventos de Socket.IO
export interface SocketEvents {
    'join-lobby': { name: string };
    'leave-lobby': void;
    'send-message': { content: string };
    'update-status': 'online' | 'away';
    'ping': number;
    'pong': number;
} 