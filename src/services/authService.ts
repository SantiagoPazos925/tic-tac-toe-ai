import { AuthUser, AuthForm, AuthResponse } from '../types';
// import { ApiResponse } from '../types'; // Para uso futuro

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    }

    // Login
    async login(username: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error de autenticación');
        }

        return data;
    }

    // Registro
    async register(authForm: AuthForm): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(authForm),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error de registro');
        }

        return data;
    }

    // Guardar datos de sesión
    saveSession(user: AuthUser, token: string): void {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Obtener datos de sesión
    getSession(): { user: AuthUser | null; token: string | null } {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        let user: AuthUser | null = null;
        if (userStr) {
            try {
                user = JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        return { user, token };
    }

    // Verificar si hay sesión activa
    isAuthenticated(): boolean {
        const { user, token } = this.getSession();
        return !!(user && token);
    }

    // Cerrar sesión
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Obtener token para requests autenticados
    getAuthHeaders(): Record<string, string> {
        const { token } = this.getSession();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    }
}

export const authService = new AuthService(); 