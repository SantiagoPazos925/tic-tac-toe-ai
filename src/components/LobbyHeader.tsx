import { motion } from 'motion/react';

interface LobbyHeaderProps {
    isConnected: boolean;
    ping: number | null;
}

export const LobbyHeader = ({ isConnected, ping }: LobbyHeaderProps) => {
    return (
        <header className="lobby-header">
            <h1>🎮 Lobby de Juegos</h1>
            <div className="connection-status">
                <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                {isConnected ? 'Conectado' : 'Desconectado'}
                {isConnected && ping !== null && (
                    <span className="ping-indicator">
                        • {ping}ms
                    </span>
                )}
            </div>
        </header>
    );
}; 