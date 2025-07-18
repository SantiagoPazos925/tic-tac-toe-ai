import { Server, Socket } from 'socket.io';
import { LobbyService } from './lobby.js';
import { Logger } from '../utils/logger.js';
import { lobbyConfig } from '../config/index.js';

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
        socket.on('send-message', (messageData: { content: string }) => {
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
            const user = this.lobbyService.joinLobby(socket.id, userData.name);
            const isReconnection = this.lobbyService.checkReconnection(userData.name);

            // Siempre crear mensaje del sistema cuando un usuario se une
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

    private handleSendMessage(socket: Socket, messageData: { content: string }): void {
        try {
            const chatMessage = this.lobbyService.sendMessage(socket.id, messageData.content);

            if (chatMessage) {
                // Enviar mensaje a todos los usuarios
                this.io.emit('chat-message', chatMessage);
            } else {
                socket.emit('error', { message: 'Mensaje inválido' });
            }

        } catch (error) {
            Logger.error('Error enviando mensaje', error);
            socket.emit('error', { message: 'Error al enviar mensaje' });
        }
    }

    private handleUpdateStatus(socket: Socket, status: 'online' | 'away'): void {
        try {
            const user = this.lobbyService.updateUserStatus(socket.id, status);
            if (user) {
                this.io.emit('user-updated', user);
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