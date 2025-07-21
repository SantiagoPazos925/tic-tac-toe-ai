import { Server, Socket } from 'socket.io';
import { lobbyConfig } from '../config/index.js';
import { Logger } from '../utils/logger.js';
import { LobbyService } from './lobby.js';

export class SocketService {
    private io: Server;
    private lobbyService: LobbyService;

    constructor(io: Server) {
        this.io = io;
        this.lobbyService = new LobbyService();
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            Logger.socket(`Usuario conectado: ${socket.id}`);
            this.handleConnection(socket);
        });
    }

    private handleConnection(socket: Socket): void {
        // Unirse al lobby
        socket.on('join-lobby', (userData: { name: string }) => {
            this.handleJoinLobby(socket, userData);
        });

        // Enviar mensaje del chat
        socket.on('send-message', (messageData: { content: string, replyTo?: string }) => {
            this.handleSendMessage(socket, messageData);
        });

        // Cambiar estado del usuario
        socket.on('update-status', (status: 'online' | 'away') => {
            this.handleUpdateStatus(socket, status);
        });

        // Salir del lobby manualmente
        socket.on('leave-lobby', () => {
            this.handleLeaveLobby(socket);
        });

        // Ping para mantener conexión y medir latencia
        socket.on('ping', (timestamp: number) => {
            socket.emit('pong', timestamp);
        });

        // Desconexión
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
    }

    private handleJoinLobby(socket: Socket, userData: { name: string }): void {
        try {
            Logger.socket(`🔍 DEBUG: Iniciando joinLobby para ${userData.name} con socket ${socket.id}`);

            const { user, disconnectedSocketId } = this.lobbyService.joinLobby(socket.id, userData.name);
            
            // Si el usuario ya está conectado con el mismo socket, verificar que esté registrado
            if (!user) {
                Logger.socket(`🔍 DEBUG: Usuario ${userData.name} ya está conectado con socket ${socket.id}, verificando registro`);
                const existingUser = this.lobbyService.getUserBySocketId(socket.id);
                if (existingUser) {
                    Logger.socket(`🔍 DEBUG: Usuario ${userData.name} ya está registrado, enviando datos actuales`);
                    // Enviar datos actuales al usuario
                    const usersList = this.lobbyService.getConnectedUsers();
                    socket.emit('users-list', usersList);
                    const chatHistory = this.lobbyService.getChatHistory();
                    socket.emit('chat-history', chatHistory);
                    return;
                } else {
                    Logger.socket(`🔍 DEBUG: Usuario ${userData.name} no está registrado, esto es un error`);
                    socket.emit('error', { message: 'Error al unirse al lobby' });
                    return;
                }
            }

            const isReconnection = this.lobbyService.checkReconnection(userData.name);

            Logger.socket(`🔍 DEBUG: joinLobby retornó - user: ${user.name}, disconnectedSocketId: ${disconnectedSocketId}, isReconnection: ${isReconnection}`);

            // Si se desconectó una conexión anterior, notificar al cliente anterior INMEDIATAMENTE
            if (disconnectedSocketId) {
                Logger.socket(`🔍 DEBUG: Buscando socket anterior: ${disconnectedSocketId}`);

                // Verificar si el socket anterior aún está conectado
                const previousSocket = this.io.sockets.sockets.get(disconnectedSocketId);
                Logger.socket(`🔍 DEBUG: Socket anterior encontrado: ${!!previousSocket}, conectado: ${previousSocket?.connected}`);

                if (previousSocket && previousSocket.connected) {
                    Logger.socket(`🔍 DEBUG: Enviando force-disconnect a socket ${disconnectedSocketId}`);
                    previousSocket.emit('force-disconnect', {
                        message: 'Has sido desconectado porque te conectaste desde otro dispositivo',
                        reason: 'new-login'
                    });
                    Logger.socket(`Usuario ${userData.name} desconectado de dispositivo anterior: ${disconnectedSocketId}`);

                    // Desconectar el socket anterior INMEDIATAMENTE
                    Logger.socket(`🔍 DEBUG: Desconectando socket anterior inmediatamente: ${disconnectedSocketId}`);
                    previousSocket.disconnect(true);
                    Logger.socket(`Socket anterior desconectado inmediatamente: ${disconnectedSocketId}`);
                } else {
                    Logger.socket(`🔍 DEBUG: Socket anterior no encontrado o no conectado: ${disconnectedSocketId}`);
                    Logger.socket(`Socket anterior ya no está conectado: ${disconnectedSocketId}`);
                }
            } else {
                Logger.socket(`🔍 DEBUG: No se encontró socket anterior para desconectar`);
            }

            // Enviar datos inmediatamente sin delay
            // Crear mensaje del sistema cuando un usuario se une
            const systemMessage = this.lobbyService.addSystemMessage(
                isReconnection
                    ? `${userData.name} se reconectó al lobby`
                    : `${userData.name} se unió al lobby`
            );
            Logger.socket(`📢 Enviando mensaje del sistema: ${systemMessage.content}`);
            this.io.emit('chat-message', systemMessage);

            // Notificar a todos los usuarios sobre el nuevo usuario
            this.io.emit('user-joined', user);

            // Enviar lista actual de usuarios al nuevo usuario
            const usersList = this.lobbyService.getConnectedUsers();
            Logger.socket(`🔍 DEBUG: Enviando lista de usuarios (${usersList.length} usuarios): ${usersList.map(u => u.name).join(', ')}`);
            socket.emit('users-list', usersList);

            // Enviar historial del chat al nuevo usuario
            const chatHistory = this.lobbyService.getChatHistory();
            socket.emit('chat-history', chatHistory);

            Logger.socket(`Usuario ${userData.name} ${isReconnection ? 'se reconectó' : 'se unió'} al lobby`);

        } catch (error) {
            Logger.error('Error al unirse al lobby', error);
            socket.emit('error', { message: 'Error al unirse al lobby' });
        }
    }

    private handleSendMessage(socket: Socket, messageData: { content: string, replyTo?: string }): void {
        try {
            Logger.socket(`🔍 DEBUG: Recibido mensaje de socket ${socket.id}:`, messageData);
            
            if (!messageData) {
                Logger.warn(`Mensaje null/undefined recibido de socket ${socket.id}`);
                socket.emit('error', { message: 'El mensaje no puede estar vacío' });
                return;
            }
            
            if (!messageData.content) {
                Logger.warn(`Mensaje sin contenido recibido de socket ${socket.id}:`, messageData);
                socket.emit('error', { message: 'El mensaje no puede estar vacío' });
                return;
            }
            
            Logger.socket(`🔍 DEBUG: Procesando mensaje: "${messageData.content}"`);
            const chatMessage = this.lobbyService.sendMessage(socket.id, messageData.content, messageData.replyTo);

            if (chatMessage) {
                Logger.socket(`✅ Mensaje enviado exitosamente por ${chatMessage.sender}: ${chatMessage.content}`);
                // Enviar mensaje a todos los usuarios
                this.io.emit('chat-message', chatMessage);
            } else {
                Logger.warn(`❌ Mensaje rechazado para socket ${socket.id}: "${messageData.content}"`);
                socket.emit('error', { message: 'Mensaje inválido' });
            }

        } catch (error) {
            Logger.error('Error enviando mensaje', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al enviar mensaje';
            Logger.socket(`🔍 DEBUG: Error específico: ${errorMessage}`);
            socket.emit('error', { message: errorMessage });
        }
    }

    private handleUpdateStatus(socket: Socket, status: 'online' | 'away'): void {
        try {
            Logger.socket(`🔍 DEBUG: Actualizando estado para socket ${socket.id} a: ${status}`);
            const user = this.lobbyService.updateUserStatus(socket.id, status);

            if (user) {
                Logger.socket(`🔍 DEBUG: Usuario actualizado: ${user.name} - Estado: ${user.status}`);
                Logger.socket(`🔍 DEBUG: Enviando user-updated a todos los clientes`);
                this.io.emit('user-updated', user);
                Logger.socket(`🔍 DEBUG: Evento user-updated enviado exitosamente`);
            } else {
                Logger.socket(`🔍 DEBUG: No se pudo actualizar el usuario para socket ${socket.id}`);
            }

        } catch (error) {
            Logger.error('Error actualizando estado', error);
            socket.emit('error', { message: 'Error al actualizar estado' });
        }
    }

    private handleLeaveLobby(socket: Socket): void {
        try {
            const { user, isManual } = this.lobbyService.leaveLobby(socket.id);

            if (user && isManual) {
                // Crear mensaje del sistema
                const systemMessage = this.lobbyService.addSystemMessage(`${user.name} cerró sesión`);
                Logger.socket(`📢 Enviando mensaje del sistema: ${systemMessage.content}`);

                this.io.emit('user-left', { id: socket.id, name: user.name });
                this.io.emit('chat-message', systemMessage);

                Logger.socket(`Usuario ${user.name} cerró sesión manualmente`);
            }

        } catch (error) {
            Logger.error('Error al salir del lobby', error);
        }
    }

    private handleDisconnect(socket: Socket): void {
        try {
            const user = this.lobbyService.disconnectUser(socket.id);
            if (user) {
                this.io.emit('user-left', { id: socket.id, name: user.name });

                // Solo crear mensaje del sistema si el usuario no se reconecta rápidamente
                setTimeout(() => {
                    if (!this.lobbyService.checkReconnection(user.name)) {
                        const systemMessage = this.lobbyService.addSystemMessage(`${user.name} se desconectó`);
                        Logger.socket(`📢 Enviando mensaje del sistema: ${systemMessage.content}`);
                        this.io.emit('chat-message', systemMessage);
                        Logger.socket(`Usuario ${user.name} se desconectó definitivamente`);
                    }
                }, lobbyConfig.reconnectionTimeout);

                Logger.socket(`Usuario ${user.name} se desconectó temporalmente`);
            }

        } catch (error) {
            Logger.error('Error en desconexión', error);
        }
    }

    // Métodos públicos para acceder al lobby service
    public getLobbyStats() {
        return this.lobbyService.getLobbyStats();
    }

    public getConnectedUsers() {
        return this.lobbyService.getConnectedUsers();
    }

    public getChatHistory() {
        return this.lobbyService.getChatHistory();
    }

    // Método para limpiar sesiones antiguas (se puede llamar periódicamente)
    public cleanupOldSessions(): void {
        this.lobbyService.cleanupOldSessions();
    }
} 