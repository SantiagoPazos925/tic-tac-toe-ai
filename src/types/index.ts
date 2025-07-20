// ============================================================================
// TIPOS PRINCIPALES DEL PROYECTO
// ============================================================================

// ============================================================================
// USUARIOS
// ============================================================================

export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    status: UserStatus;
    lastSeen: Date | string | undefined; // Compatible con backend (string) y frontend (Date)
    isOnline: boolean;
    joinDate: Date | string | undefined; // Compatible con backend (string) y frontend (Date)
    name?: string; // Para compatibilidad con código existente
}

export type UserStatus = 'online' | 'away' | 'offline' | 'busy';

export interface UserProfile extends User {
    bio?: string;
    preferences: UserPreferences;
    stats: UserStats;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundEnabled: boolean;
    language: 'es' | 'en';
}

export interface UserStats {
    gamesPlayed: number;
    gamesWon: number;
    totalScore: number;
    rank: number;
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    token: string;
    refreshToken: string;
    expiresAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthForm {
    type: 'login' | 'register';
    email: string;
    password: string;
    username?: string;
    confirmPassword?: string;
}

export interface AuthResponse {
    user: AuthUser;
    message: string;
    token?: string; // Para compatibilidad con código existente
}

// ============================================================================
// MENSAJES Y CHAT
// ============================================================================

export interface Message {
    id: string;
    content: string;
    sender: User | string; // Compatible con backend (string) y frontend (User)
    timestamp: Date;
    type: MessageType;
    reactions: Reaction[];
    isEdited: boolean;
    editedAt?: Date;
}

// Alias para compatibilidad con código existente
export type ChatMessage = Message;

export type MessageType = 'text' | 'user' | 'system' | 'notification' | 'game';

export interface Reaction {
    emoji: string;
    users: string[]; // User IDs
    count: number;
}

export interface ChatRoom {
    id: string;
    name: string;
    type: 'lobby' | 'private' | 'game';
    participants: User[];
    messages: Message[];
    lastMessage?: Message;
    unreadCount: number;
}

// ============================================================================
// CONTEXT MENU
// ============================================================================

export interface ContextMenuPosition {
    x: number;
    y: number;
}

// ============================================================================
// JUEGO TIC-TAC-TOE
// ============================================================================

export interface Game {
    id: string;
    board: GameBoard;
    players: GamePlayer[];
    currentPlayer: string; // Player ID
    status: GameStatus;
    winner?: string; // Player ID
    createdAt: Date;
    updatedAt: Date;
    moves: GameMove[];
}

export type GameBoard = Array<Array<CellValue>>;
export type CellValue = 'X' | 'O' | null;
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'draw';

export interface GamePlayer {
    id: string;
    symbol: 'X' | 'O';
    user: User;
    score: number;
    isReady: boolean;
}

export interface GameMove {
    id: string;
    playerId: string;
    position: Position;
    timestamp: Date;
}

export interface Position {
    row: number;
    col: number;
}

// ============================================================================
// SOCKET.IO EVENTS
// ============================================================================

export interface SocketEvents {
    // Conexión
    'connect': () => void;
    'disconnect': (reason: string) => void;

    // Usuarios
    'user-joined': (user: User) => void;
    'user-left': (userId: string) => void;
    'user-status-changed': (data: { userId: string; status: UserStatus }) => void;

    // Chat
    'message-received': (message: Message) => void;
    'message-edited': (data: { messageId: string; newContent: string }) => void;
    'message-deleted': (messageId: string) => void;
    'reaction-added': (data: { messageId: string; reaction: Reaction }) => void;

    // Juego
    'game-created': (game: Game) => void;
    'game-joined': (game: Game) => void;
    'game-move': (move: GameMove) => void;
    'game-finished': (game: Game) => void;

    // Sistema
    'system-message': (message: string) => void;
    'error': (error: string) => void;
}

export interface ClientToServerEvents {
    // Usuarios
    'join-lobby': (data: { userId: string }) => void;
    'leave-lobby': () => void;
    'update-status': (status: UserStatus) => void;

    // Chat
    'send-message': (data: { content: string; roomId?: string }) => void;
    'edit-message': (data: { messageId: string; newContent: string }) => void;
    'delete-message': (messageId: string) => void;
    'add-reaction': (data: { messageId: string; emoji: string }) => void;

    // Juego
    'create-game': (data: { opponentId?: string }) => void;
    'join-game': (gameId: string) => void;
    'make-move': (data: { gameId: string; position: Position }) => void;
    'leave-game': (gameId: string) => void;
}

// ============================================================================
// COMPONENTES REACT
// ============================================================================

export interface ComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends ComponentProps {
    type?: 'text' | 'email' | 'password' | 'number';
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
}

export interface ModalProps extends ComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============================================================================
// CONTEXTOS
// ============================================================================

export interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

export interface LobbyContextType {
    users: User[];
    messages: Message[];
    chatMessages?: Message[]; // Para compatibilidad con código existente
    games: Game[];
    currentGame: Game | null;
    isLoading: boolean;
    error: string | null;
    contextMenuPosition: ContextMenuPosition;
    contextMenuUser: User | null;
    isContextMenuOpen: boolean;
    joinGame: (gameId: string) => void;
    createGame: (opponentId?: string) => void;
    updateStatus: (status: UserStatus) => void;
    openContextMenu: (user: User, position: ContextMenuPosition) => void;
    closeContextMenu: () => void;
    handleContextMenuAction: (action: string) => void;
}

// ============================================================================
// SERVICIOS
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// ============================================================================
// UTILIDADES
// ============================================================================

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventHandler<T = any> = (event: T) => void;

export type AsyncFunction<T = any, R = any> = (arg: T) => Promise<R>;

// ============================================================================
// CONSTANTES
// ============================================================================

export const GAME_BOARD_SIZE = 3;
export const MAX_MESSAGES_PER_ROOM = 100;
export const MAX_USERS_IN_LOBBY = 50;
export const SOCKET_RECONNECTION_ATTEMPTS = 5;
export const SOCKET_RECONNECTION_DELAY = 1000;

export const USER_STATUSES: Record<UserStatus, string> = {
    online: 'En línea',
    away: 'Ausente',
    offline: 'Desconectado',
    busy: 'Ocupado'
};

export const GAME_STATUSES: Record<GameStatus, string> = {
    waiting: 'Esperando',
    playing: 'Jugando',
    finished: 'Terminado',
    draw: 'Empate'
}; 