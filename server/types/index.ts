import { Request } from 'express';

// Tipos principales del backend

// Tipos de usuario
export interface User {
    id?: number;
    username: string;
    email: string;
    password_hash: string;
    created_at?: Date;
    last_login?: Date;
    status?: 'online' | 'away' | 'offline';
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    created_at: Date;
    last_login: Date;
    status: string;
}

export interface AuthUser {
    id: number;
    username: string;
    email: string;
}

// Tipos para el lobby en tiempo real
export interface LobbyUser {
    id: string;
    name: string;
    status: 'online' | 'away' | 'offline';
    joinedAt: Date;
    lastSeen?: Date;
}

export interface ChatMessage {
    id: string;
    type: 'user' | 'system';
    content: string;
    sender?: string;
    timestamp: Date;
}

// Tipos para autenticación
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
    };
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: AuthUser;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Tipos para configuración
export interface DatabaseConfig {
    isProduction: boolean;
    connectionString?: string;
    ssl?: boolean;
}

export interface ServerConfig {
    port: number;
    corsOrigins: string[];
    jwtSecret: string;
    environment: string;
} 