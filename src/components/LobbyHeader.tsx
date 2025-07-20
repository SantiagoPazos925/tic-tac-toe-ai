

interface LobbyHeaderProps {
    isConnected: boolean;
    ping: number | null;
}

export const LobbyHeader = ({ isConnected, ping }: LobbyHeaderProps) => {
    const getConnectionText = () => {
        if (!isConnected) return 'Desconectado';
        if (ping === null) return 'Conectado';
        if (ping < 50) return 'Excelente';
        if (ping < 100) return 'Bueno';
        if (ping < 200) return 'Regular';
        return 'Lento';
    };

    const getPingColor = () => {
        if (!isConnected || ping === null) return 'var(--discord-text-muted)';
        if (ping < 50) return '#43b581';
        if (ping < 100) return '#faa61a';
        if (ping < 200) return '#f04747';
        return '#f04747';
    };

    return (
        <header className="lobby-header">
            <div className="header-left">
                <h1>Lobby de Juegos</h1>
                <div className="header-subtitle">
                    <span className="subtitle-icon">🎯</span>
                    <span>Centro de entretenimiento</span>
                </div>
            </div>
            
            <div className="connection-status">
                <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                <span className="connection-text">{getConnectionText()}</span>
                {isConnected && ping !== null && (
                    <span 
                        className="ping-indicator"
                        style={{ color: getPingColor() }}
                    >
                        {ping}ms
                    </span>
                )}
            </div>
        </header>
    );
}; 