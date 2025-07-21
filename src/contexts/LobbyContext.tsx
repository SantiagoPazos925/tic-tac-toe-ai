import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useLobbySocket } from '../hooks/useLobbySocket';
import { ChatMessage, ContextMenuPosition, ReplyMessage, User } from '../types';
import { useAuthContext } from './AuthContext';

interface LobbyContextType {
  // Estado de conexión
  isConnected: boolean;
  ping: number | null;
  
  // Usuarios
  users: User[];
  currentUser: User | null;
  
  // Mensajes
  messages: ChatMessage[];
  systemMessages: ChatMessage[];
  newMessage: string;
  
  // UI State
  showStatusMenu: boolean;
  showUserContextMenu: boolean;
  contextMenuUser: User | null;
  contextMenuPosition: ContextMenuPosition;
  
  // Funciones
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  handleSendMessage: (e: React.FormEvent, replyTo?: ReplyMessage | null) => void;
  toggleStatusMenu: () => void;
  handleStatusChange: (status: string) => void;
  handleUserContextMenu: (e: React.MouseEvent, user: User) => void;
  closeUserContextMenu: () => void;
  handleUserAction: (action: string) => void;
  handleLogout: () => void;
  
  // Refs
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  systemMessagesEndRef: React.RefObject<HTMLDivElement | null>;
  
  // Socket service
  socketService: any;
  sendPing: () => void;
  disconnect: () => void;
}

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const useLobbyContext = () => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobbyContext must be used within a LobbyProvider');
  }
  return context;
};

interface LobbyProviderProps {
  children: React.ReactNode;
}

export const LobbyProvider: React.FC<LobbyProviderProps> = ({ children }) => {
  const { authUser, logout } = useAuthContext();
  
  // Usar el hook optimizado de Socket.io
  const { 
    isConnected, 
    ping, 
    users, 
    userMessages, 
    systemMessages, 
    socketService, 
    sendPing,
    disconnect
  } = useLobbySocket();

  // Estado local
  const [newMessage, setNewMessage] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showUserContextMenu, setShowUserContextMenu] = useState(false);
  const [contextMenuUser, setContextMenuUser] = useState<User | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

  // Refs
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const systemMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Usuario actual
  const currentUser = users.find(u => u.username === authUser?.username) || null;

  // Funciones
  const sendMessage = useCallback(() => {
    if (newMessage.trim() && authUser) {
      socketService.sendMessage(newMessage.trim());
      setNewMessage('');
    }
  }, [newMessage, authUser, socketService]);

  const handleSendMessage = useCallback((e: React.FormEvent, replyTo?: ReplyMessage | null) => {
    e.preventDefault();
    if (newMessage.trim() && authUser) {
      console.log('🔍 DEBUG: Enviando mensaje desde handleSendMessage:', newMessage.trim());
      socketService.sendMessage(newMessage.trim(), replyTo);
      setNewMessage('');
    }
  }, [newMessage, authUser, socketService]);

  const toggleStatusMenu = useCallback(() => {
    setShowStatusMenu(!showStatusMenu);
  }, [showStatusMenu]);

  const handleStatusChange = useCallback((status: string) => {
    if (authUser) {
      socketService.updateStatus(status as 'online' | 'away');
      setShowStatusMenu(false);
    }
  }, [authUser, socketService]);

  const handleUserContextMenu = useCallback((e: React.MouseEvent, user: User) => {
    e.preventDefault();
    setContextMenuUser(user);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowUserContextMenu(true);
  }, []);

  const closeUserContextMenu = useCallback(() => {
    setShowUserContextMenu(false);
    setContextMenuUser(null);
    setContextMenuPosition({ x: 0, y: 0 });
  }, []);

  const handleUserAction = useCallback((action: string) => {
    if (contextMenuUser) {
      switch (action) {
        case 'message':
          // Implementar mensaje privado
          console.log('Enviar mensaje privado a:', contextMenuUser.username);
          break;
        case 'profile':
          // Implementar ver perfil
          console.log('Ver perfil de:', contextMenuUser.username);
          break;
        default:
          console.log('Acción no implementada:', action);
      }
      closeUserContextMenu();
    }
  }, [contextMenuUser, closeUserContextMenu]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const value: LobbyContextType = {
    // Estado de conexión
    isConnected,
    ping,
    
    // Usuarios
    users,
    currentUser,
    
    // Mensajes
    messages: userMessages,
    systemMessages,
    newMessage,
    
    // UI State
    showStatusMenu,
    showUserContextMenu,
    contextMenuUser,
    contextMenuPosition,
    
    // Funciones
    setNewMessage,
    sendMessage,
    handleSendMessage,
    toggleStatusMenu,
    handleStatusChange,
    handleUserContextMenu,
    closeUserContextMenu,
    handleUserAction,
    handleLogout,
    
    // Refs
    chatEndRef,
    systemMessagesEndRef,
    
    // Socket service
    socketService,
    sendPing,
    disconnect
  };

  return (
    <LobbyContext.Provider value={value}>
      {children}
    </LobbyContext.Provider>
  );
}; 