import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthUser, AuthForm } from '../types';

interface AuthContextType {
    authUser: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<any>;
    register: (authForm: AuthForm) => Promise<any>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar sesión al cargar
    useEffect(() => {
        const { user, token } = authService.getSession();

        if (user && token) {
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

    const value = {
        authUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 