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
    const trimmed = input.trim();
    const sanitized = trimmed.replace(/[<>]/g, '');
    console.log('🔍 DEBUG: sanitizeInput - original:', JSON.stringify(trimmed), 'sanitizado:', JSON.stringify(sanitized));
    return sanitized;
}

// Validar y sanitizar mensaje del chat
export function validateChatMessage(content: string): string {
    console.log('🔍 DEBUG: Validando mensaje original:', JSON.stringify(content));
    
    if (!content || typeof content !== 'string') {
        console.log('🔍 DEBUG: Mensaje es null, undefined o no es string');
        throw new ValidationError('El mensaje no puede estar vacío');
    }
    
    if (content.trim().length === 0) {
        console.log('🔍 DEBUG: Mensaje está vacío después de trim');
        throw new ValidationError('El mensaje no puede estar vacío');
    }
    
    const sanitized = sanitizeInput(content);
    console.log('🔍 DEBUG: Mensaje sanitizado:', JSON.stringify(sanitized));
    
    if (!sanitized || sanitized.length === 0) {
        console.log('🔍 DEBUG: Mensaje queda vacío después de sanitización');
        throw new ValidationError('El mensaje no puede estar vacío después de la sanitización');
    }
    
    if (sanitized.length > 500) {
        console.log('🔍 DEBUG: Mensaje excede 500 caracteres');
        throw new ValidationError('El mensaje no puede tener más de 500 caracteres');
    }
    
    console.log('🔍 DEBUG: Mensaje válido:', sanitized);
    return sanitized;
} 