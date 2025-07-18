import { validationConfig } from '../config/index.js';
import { LoginRequest, RegisterRequest } from '../types/index.js';

// Validaciones de entrada
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Validar email
export function validateEmail(email: string): boolean {
    return validationConfig.email.pattern.test(email);
}

// Validar contraseña
export function validatePassword(password: string): boolean {
    return password.length >= validationConfig.password.minLength;
}

// Validar nombre de usuario
export function validateUsername(username: string): boolean {
    return username.length >= validationConfig.username.minLength &&
        username.length <= validationConfig.username.maxLength;
}

// Validar datos de registro
export function validateRegisterData(data: RegisterRequest): void {
    if (!data.username || !data.email || !data.password) {
        throw new ValidationError('Todos los campos son requeridos');
    }

    if (!validateUsername(data.username)) {
        throw new ValidationError(`El nombre de usuario debe tener entre ${validationConfig.username.minLength} y ${validationConfig.username.maxLength} caracteres`);
    }

    if (!validateEmail(data.email)) {
        throw new ValidationError('Ingresa un email válido');
    }

    if (!validatePassword(data.password)) {
        throw new ValidationError(`La contraseña debe tener al menos ${validationConfig.password.minLength} caracteres`);
    }
}

// Validar datos de login
export function validateLoginData(data: LoginRequest): void {
    if (!data.username || !data.password) {
        throw new ValidationError('Usuario y contraseña son requeridos');
    }
}

// Sanitizar entrada de usuario
export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

// Validar y sanitizar mensaje del chat
export function validateChatMessage(content: string): string {
    const sanitized = sanitizeInput(content);
    if (!sanitized || sanitized.length > 500) {
        throw new ValidationError('El mensaje debe tener entre 1 y 500 caracteres');
    }
    return sanitized;
} 