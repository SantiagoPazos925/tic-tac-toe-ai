import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';
import { AuthForm, AuthUser } from '../types';

interface AuthContextType {
    authUser: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isForceDisconnected: boolean;
    login: (username: string, password: string) => Promise<any>;
    register: (authForm: AuthForm) => Promise<any>;
    logout: () => void;
    setForceDisconnected: () => void;
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
    const [isForceDisconnected, setIsForceDisconnected] = useState(false);

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
        // Evitar login si fue force-disconnected recientemente
        if (isForceDisconnected) {
            console.log('🔍 DEBUG: Login bloqueado por force-disconnect reciente');
            return;
        }

        try {
            setIsLoading(true);
            console.log('🔍 DEBUG: Iniciando login para:', username);

            const response = await authService.login(username, password);
            console.log('🔍 DEBUG: Login exitoso, guardando sesión');

            authService.saveSession(response.user, response.token || '');

            setAuthUser(response.user);
            setIsAuthenticated(true);

            // NO conectar socket aquí - dejar que useSocket se encargue
            console.log('🔍 DEBUG: Login completado, useSocket se encargará de la conexión');

            return response;
        } catch (error) {
            console.error('🔍 DEBUG: Error en login:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [isForceDisconnected]);

    // Registro
    const register = useCallback(async (authForm: AuthForm) => {
        try {
            setIsLoading(true);
            const response = await authService.register(authForm);
            authService.saveSession(response.user, response.token || '');
            setAuthUser(response.user);
            setIsAuthenticated(true);

            // Conectar socket inmediatamente después del registro exitoso
            const socket = socketService.connect();
            if (socket.connected) {
                socketService.joinLobby(response.user.username);
            }

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
        // Desconectar socket al hacer logout
        socketService.disconnect();

        // Resetear el estado de force-disconnected después de un tiempo
        setTimeout(() => {
            setIsForceDisconnected(false);
        }, 5000); // 5 segundos
    }, []);

    // Función para marcar como force-disconnected
    const setForceDisconnected = useCallback(() => {
        setIsForceDisconnected(true);
    }, []);

    const value = {
        authUser,
        isAuthenticated,
        isLoading,
        isForceDisconnected,
        login,
        register,
        logout,
        setForceDisconnected
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 