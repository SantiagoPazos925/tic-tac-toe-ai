import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { User, ChatMessage } from '../types';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [ping, setPing] = useState<number | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    // Conectar al socket
    const connect = useCallback(() => {
        const socket = socketService.connect();

        // Eventos de conexión
        socketService.onConnect(() => {
            setIsConnected(true);
            // Limpiar usuarios al reconectar para evitar duplicados
            setUsers([]);
        });

        socketService.onDisconnect(() => {
            setIsConnected(false);
            setPing(null);
            // Limpiar usuarios al desconectar
            setUsers([]);
        });

        // Eventos de usuarios
        socketService.onUsersList((usersList: User[]) => {
            // Asegurar que no hay duplicados en la lista del servidor
            const uniqueUsers = usersList.filter((user, index, self) =>
                index === self.findIndex(u => u.id === user.id)
            );
            setUsers(uniqueUsers);
        });

        socketService.onUserJoined((user: User) => {
            setUsers(prev => {
                // Verificar si el usuario ya existe para evitar duplicados
                const userExists = prev.some(u => u.id === user.id);
                if (userExists) {
                    return prev;
                }
                return [...prev, user];
            });
        });

        socketService.onUserLeft((user: { id: string; name: string }) => {
            setUsers(prev => prev.filter(u => u.id !== user.id));
        });

        socketService.onUserUpdated((updatedUser: User) => {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        });

        // Eventos del chat
        socketService.onChatHistory((messages: ChatMessage[]) => {
            setChatMessages(messages);
        });

        socketService.onChatMessage((message: ChatMessage) => {
            setChatMessages(prev => [...prev, message]);
        });

        // Eventos de ping
        socketService.onPong((timestamp: number) => {
            const pingTime = Date.now() - timestamp;
            setPing(pingTime);
        });

        return socket;
    }, []);

    // Desconectar
    const disconnect = useCallback(() => {
        socketService.disconnect();
        setIsConnected(false);
        setPing(null);
        setUsers([]);
        setChatMessages([]);
    }, []);

    // Enviar ping
    const sendPing = useCallback(() => {
        socketService.sendPing();
    }, []);

    // Limpiar al desmontar
    useEffect(() => {
        connect(); // const socket = connect(); // Para uso futuro

        return () => {
            socketService.offAll();
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        ping,
        users,
        chatMessages,
        socketService,
        sendPing,
        disconnect
    };
}; 