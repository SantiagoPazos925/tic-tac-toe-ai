import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { AuthUser, AuthForm } from '../types';

export const useAuth = () => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar sesión al cargar
    useEffect(() => {
        const { user } = authService.getSession();
        if (user) {
            setAuthUser(user);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    // Login
    const login = useCallback(async (username: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authService.login(username, password);
            authService.saveSession(response.user, response.token);
            setAuthUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Registro
    const register = useCallback(async (authForm: AuthForm) => {
        try {
            setIsLoading(true);
            const response = await authService.register(authForm);
            authService.saveSession(response.user, response.token);
            setAuthUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        authService.logout();
        setAuthUser(null);
        setIsAuthenticated(false);
    }, []);

    return {
        authUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
    };
}; 