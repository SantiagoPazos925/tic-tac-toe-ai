import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { socketService } from '../services/socketService';
import { ChatMessage, User } from '../types';
import Logger from '../utils/logger';

export const useLobbySocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [ping, setPing] = useState<number | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [hasJoinedLobby, setHasJoinedLobby] = useState(false);
    const [isJoiningLobby, setIsJoiningLobby] = useState(false);
    const { logout, setForceDisconnected, authUser } = useAuthContext();

    // Memoizar usuarios únicos para evitar re-renders innecesarios
    const uniqueUsers = useMemo(() => {
        return users.filter((user, index, self) =>
            index === self.findIndex(u => u.id === user.id)
        );
    }, [users]);

    // Memoizar mensajes filtrados
    const userMessages = useMemo(() =>
        chatMessages.filter(message => message.type === 'text' || message.type === 'user'),
        [chatMessages]
    );

    const systemMessages = useMemo(() =>
        chatMessages.filter(message => message.type === 'system'),
        [chatMessages]
    );

    // Conectar
    const connect = useCallback(() => {
        const existingSocket = socketService.getSocket();
        if (existingSocket && existingSocket.connected) {
            Logger.socket('Socket ya conectado, no creando nueva conexión');
            return existingSocket;
        }

        Logger.socket('Creando nueva conexión de socket');
        const socket = socketService.connect();

        // Eventos de conexión
        socketService.onConnect(() => {
            Logger.socket('Evento connect recibido en useSocket');
            setIsConnected(true);
            // NO unirse al lobby aquí - se maneja en el useEffect
        });

        socketService.onDisconnect(() => {
            Logger.socket('Evento disconnect recibido en useSocket');
            setIsConnected(false);
            setPing(null);
            setHasJoinedLobby(false);
            setIsJoiningLobby(false);
        });

        // Eventos de usuarios
        socketService.onUsersList((usersList: any[]) => {
            Logger.socket('Lista de usuarios recibida:', usersList);
            // Mapear LobbyUser del backend a User del frontend
            const mappedUsers: User[] = usersList.map(user => {
                // Convertir fechas de string a Date si es necesario
                const joinDate = user.joinedAt ? 
                    (typeof user.joinedAt === 'string' ? new Date(user.joinedAt) : user.joinedAt) : 
                    new Date();
                
                const lastSeen = user.lastSeen ? 
                    (typeof user.lastSeen === 'string' ? new Date(user.lastSeen) : user.lastSeen) : 
                    new Date();

                return {
                    id: user.id,
                    username: user.name, // LobbyUser usa 'name', User usa 'username'
                    email: '', // No disponible en LobbyUser
                    status: user.status,
                    lastSeen: lastSeen,
                    isOnline: user.status === 'online',
                    joinDate: joinDate, // LobbyUser usa 'joinedAt', User usa 'joinDate'
                    name: user.name // Para compatibilidad
                };
            });
            setUsers(mappedUsers);
        });

        socketService.onUserJoined((user: any) => {
            Logger.socket('Usuario unido:', user);
            
            // Convertir fechas de string a Date si es necesario
            const joinDate = user.joinedAt ? 
                (typeof user.joinedAt === 'string' ? new Date(user.joinedAt) : user.joinedAt) : 
                new Date();
            
            const lastSeen = user.lastSeen ? 
                (typeof user.lastSeen === 'string' ? new Date(user.lastSeen) : user.lastSeen) : 
                new Date();

            const mappedUser: User = {
                id: user.id,
                username: user.name,
                email: '',
                status: user.status,
                lastSeen: lastSeen,
                isOnline: user.status === 'online',
                joinDate: joinDate,
                name: user.name
            };
            
            setUsers(prev => {
                const userExists = prev.some(u => u.id === mappedUser.id);
                if (userExists) {
                    Logger.socket('Usuario ya existe en la lista');
                    return prev;
                }
                Logger.socket('Agregando usuario a la lista');
                return [...prev, mappedUser];
            });
        });

        socketService.onUserLeft((user: { id: string; name: string }) => {
            Logger.socket('Usuario salió:', user);
            setUsers(prev => prev.filter(u => u.id !== user.id));
        });

        socketService.onUserUpdated((updatedUser: any) => {
            Logger.socket('Usuario actualizado recibido:', updatedUser);
            setUsers(prev => {
                const updatedUsers = prev.map(u => {
                    if (u.id === updatedUser.id) {
                        Logger.socket('Actualizando usuario:', u.username, 'de', u.status, 'a', updatedUser.status);
                        
                        // Convertir lastSeen de string a Date si es necesario
                        const lastSeen = updatedUser.lastSeen ? 
                            (typeof updatedUser.lastSeen === 'string' ? new Date(updatedUser.lastSeen) : updatedUser.lastSeen) : 
                            new Date();
                        
                        // Mapear correctamente el usuario actualizado
                        return {
                            ...u, // Mantener datos existentes como joinDate
                            status: updatedUser.status,
                            lastSeen: lastSeen,
                            isOnline: updatedUser.status === 'online'
                        };
                    }
                    return u;
                });
                return updatedUsers;
            });
        });

        // Eventos del chat
        socketService.onChatHistory((messages: ChatMessage[]) => {
            Logger.socket('Historial de chat recibido:', messages.length, 'mensajes');
            setChatMessages(messages);
        });

        socketService.onChatMessage((message: ChatMessage) => {
            Logger.socket('Mensaje de chat recibido:', message);
            setChatMessages(prev => [...prev, message]);
        });

        // Eventos de ping
        socketService.onPong((timestamp: number) => {
            const pingTime = Date.now() - timestamp;
            setPing(pingTime);
        });

        // Evento de desconexión forzada
        socketService.onForceDisconnect((data: { message: string; reason: string }) => {
            Logger.socket('Recibido evento force-disconnect:', data);
            setIsConnected(false);
            setPing(null);
            setUsers([]);
            setChatMessages([]);

            // Marcar como force-disconnected para evitar reconexión inmediata
            setForceDisconnected();

            // Mostrar notificación al usuario y cerrar sesión
            if (data.reason === 'new-login') {
                Logger.socket('Mostrando alerta de desconexión por nuevo login');
                alert('Has sido desconectado porque te conectaste desde otro dispositivo.');
            } else {
                Logger.socket('Mostrando alerta de desconexión general');
                alert(data.message);
            }

            // Cerrar sesión y redirigir al login
            Logger.socket('Ejecutando logout después de force-disconnect');
            logout();

            // Deshabilitar temporalmente el formulario de login para evitar reconexión inmediata
            setTimeout(() => {
                const authForm = document.querySelector('.auth-form') as HTMLFormElement;
                if (authForm) {
                    authForm.style.pointerEvents = 'none';
                    authForm.style.opacity = '0.5';

                    // Rehabilitar después de 3 segundos
                    setTimeout(() => {
                        authForm.style.pointerEvents = 'auto';
                        authForm.style.opacity = '1';
                    }, 3000);
                }
            }, 100);
        });

        // Eventos de error
        socketService.onError((error: { message: string }) => {
            Logger.error('Error de socket:', error.message);
            alert(`Error de conexión: ${error.message}`);
        });

        return socket;
    }, [logout, setForceDisconnected, authUser]);

    // Desconectar
    const disconnect = useCallback(() => {
        socketService.disconnect();
        setIsConnected(false);
        setPing(null);
        setUsers([]);
        setChatMessages([]);
        setHasJoinedLobby(false);
        setIsJoiningLobby(false);
    }, []);

    // Enviar ping
    const sendPing = useCallback(() => {
        socketService.sendPing();
    }, []);

    // Verificar estado de conexión cuando cambie el socket
    useEffect(() => {
        const checkConnectionStatus = () => {
            const socket = socketService.getSocket();
            if (socket && socket.connected && !isConnected) {
                Logger.socket('Actualizando estado de conexión a conectado');
                setIsConnected(true);
            } else if ((!socket || !socket.connected) && isConnected) {
                Logger.socket('Actualizando estado de conexión a desconectado');
                setIsConnected(false);
            }
        };

        // Verificar inmediatamente
        checkConnectionStatus();

        // Verificar periódicamente
        const interval = setInterval(checkConnectionStatus, 1000);

        return () => clearInterval(interval);
    }, [isConnected]);

    // Unirse al lobby cuando cambie el usuario autenticado y esté conectado
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        
        if (authUser && isConnected && !hasJoinedLobby && !isJoiningLobby) {
            Logger.socket('Usuario autenticado cambiado y conectado, uniéndose al lobby:', authUser.username);
            setHasJoinedLobby(true);
            setIsJoiningLobby(true);
            
            // Debounce para evitar múltiples uniones
            timeoutId = setTimeout(() => {
                socketService.joinLobby(authUser.username);
                // Resetear el flag después de un tiempo
                setTimeout(() => setIsJoiningLobby(false), 1000);
            }, 500); // Aumentar el delay para evitar uniones rápidas
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [authUser, isConnected, hasJoinedLobby, isJoiningLobby]);

    // Limpiar al desmontar
    useEffect(() => {
        // Verificar si ya hay una conexión activa al inicializar
        const existingSocket = socketService.getSocket();
        if (existingSocket && existingSocket.connected) {
            Logger.socket('Socket ya conectado al inicializar useSocket');
            setIsConnected(true);
        }

        connect();

        return () => {
            socketService.offAll();
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        ping,
        users: uniqueUsers, // Retornar usuarios únicos memoizados
        chatMessages,
        userMessages, // Mensajes de usuario memoizados
        systemMessages, // Mensajes del sistema memoizados
        socketService,
        sendPing,
        disconnect
    };
}; 