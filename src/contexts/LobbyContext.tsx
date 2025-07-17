import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, ChatMessage, ContextMenuPosition } from '../types';
import { useSocket } from '../hooks/useSocket';
import { useAuthContext } from './AuthContext';

interface LobbyState {
    // Estado de conexión
    isConnected: boolean;
    ping: number | null;

    // Usuarios
    users: User[];
    currentUser: User | null;

    // Chat
    chatMessages: ChatMessage[];
    newMessage: string;

    // UI State
    showStatusMenu: boolean;
    showUserContextMenu: boolean;
    contextMenuUser: User | null;
    contextMenuPosition: ContextMenuPosition;
}

interface LobbyContextType extends LobbyState {
    // Acciones de usuarios
    setNewMessage: (message: string) => void;
    sendMessage: (e: React.FormEvent) => void;

    // Acciones de estado
    toggleStatusMenu: () => void;
    handleStatusChange: (status: 'online' | 'away') => void;

    // Acciones del menú contextual
    handleUserContextMenu: (e: React.MouseEvent, user: User) => void;
    closeUserContextMenu: () => void;
    handleUserAction: (action: string) => void;

    // Acciones de logout
    handleLogout: () => void;

    // Referencias para scroll
    chatEndRef: React.RefObject<HTMLDivElement | null>;
    systemMessagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const useLobbyContext = () => {
    const context = useContext(LobbyContext);
    if (context === undefined) {
        throw new Error('useLobbyContext must be used within a LobbyProvider');
    }
    return context;
};

interface LobbyProviderProps {
    children: ReactNode;
}

export const LobbyProvider: React.FC<LobbyProviderProps> = ({ children }) => {
    const { isConnected, ping, users, chatMessages, socketService, sendPing } = useSocket();
    const { logout, authUser } = useAuthContext();

    // Estado local
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showUserContextMenu, setShowUserContextMenu] = useState(false);
    const [contextMenuUser, setContextMenuUser] = useState<User | null>(null);
    const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

    // Referencias
    const chatEndRef = React.useRef<HTMLDivElement>(null);
    const systemMessagesEndRef = React.useRef<HTMLDivElement>(null);

    // Actualizar el usuario actual cuando se recibe la lista de usuarios
    useEffect(() => {
        if (users.length > 0 && authUser) {
            const user = users.find(u => u.name === authUser.username);
            if (user) {
                setCurrentUser(user);
            }
        }
    }, [users, authUser]);

    // Scroll automático para mensajes del chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages.filter(message => message.type === 'user').length]);

    // Scroll automático para mensajes del sistema
    useEffect(() => {
        const systemMessages = chatMessages.filter(message => message.type === 'system');
        if (systemMessagesEndRef.current && systemMessages.length > 0) {
            setTimeout(() => {
                systemMessagesEndRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }, 100);
        }
    }, [chatMessages.filter(message => message.type === 'system').length]);

    // Enviar mensaje
    const sendMessage = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socketService.sendMessage(newMessage);
            setNewMessage('');
        }
    }, [newMessage, socketService]);

    // Toggle menú de estado
    const toggleStatusMenu = useCallback(() => {
        setShowStatusMenu(!showStatusMenu);
    }, [showStatusMenu]);

    // Cambiar estado del usuario
    const handleStatusChange = useCallback((status: 'online' | 'away') => {
        socketService.updateStatus(status);
        setShowStatusMenu(false);
    }, [socketService]);

    // Manejar menú contextual de usuario
    const handleUserContextMenu = useCallback((e: React.MouseEvent, user: User) => {
        e.preventDefault();

        const menuWidth = 250;
        const menuHeight = 300;
        const padding = 10;

        let x = e.clientX;
        let y = e.clientY;

        // Ajustar posición si se sale de la pantalla
        if (x + menuWidth > window.innerWidth - padding) {
            x = e.clientX - menuWidth;
        }
        if (y + menuHeight > window.innerHeight - padding) {
            y = e.clientY - menuHeight;
        }
        if (x < padding) {
            x = padding;
        }
        if (y < padding) {
            y = padding;
        }

        setContextMenuUser(user);
        setContextMenuPosition({ x, y });
        setShowUserContextMenu(true);
    }, []);

    // Cerrar menú contextual
    const closeUserContextMenu = useCallback(() => {
        setShowUserContextMenu(false);
        setContextMenuUser(null);
    }, []);

    // Manejar acciones del menú contextual
    const handleUserAction = useCallback((action: string) => {
        if (!contextMenuUser) return;

        switch (action) {
            case 'profile':
                console.log(`Ver perfil de ${contextMenuUser.name}`);
                break;
            case 'message':
                console.log(`Enviar mensaje a ${contextMenuUser.name}`);
                break;
            case 'invite':
                console.log(`Invitar a ${contextMenuUser.name} a jugar`);
                break;
            case 'block':
                console.log(`Bloquear a ${contextMenuUser.name}`);
                break;
        }

        closeUserContextMenu();
    }, [contextMenuUser, closeUserContextMenu]);

    // Logout
    const handleLogout = useCallback(() => {
        if (currentUser) {
            socketService.leaveLobby();
            logout();
        }
    }, [currentUser, socketService, logout]);

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showStatusMenu && !target.closest('.user-profile')) {
                setShowStatusMenu(false);
            }
            if (showUserContextMenu && !target.closest('.user-context-menu')) {
                closeUserContextMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showStatusMenu, showUserContextMenu, closeUserContextMenu]);

    const value: LobbyContextType = {
        // Estado
        isConnected,
        ping,
        users,
        currentUser,
        chatMessages,
        newMessage,
        showStatusMenu,
        showUserContextMenu,
        contextMenuUser,
        contextMenuPosition,

        // Acciones
        setNewMessage,
        sendMessage,
        toggleStatusMenu,
        handleStatusChange,
        handleUserContextMenu,
        closeUserContextMenu,
        handleUserAction,
        handleLogout,

        // Referencias
        chatEndRef,
        systemMessagesEndRef,
    };

    return (
        <LobbyContext.Provider value={value}>
            {children}
        </LobbyContext.Provider>
    );
}; 