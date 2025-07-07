import React, { useState, useEffect, useCallback } from 'react';
import { RoomInfo } from '../../../shared/types';
import styles from './WordGuessingLobby.module.css';

interface WordGuessingLobbyProps {
    onJoinRoom: (roomId: string) => void;
    onCreateRoom: () => void;
    playerName: string;
    onBackToMenu: () => void;
}

const WordGuessingLobby: React.FC<WordGuessingLobbyProps> = ({ onJoinRoom, onCreateRoom, playerName, onBackToMenu }) => {
    const [roomId, setRoomId] = useState('');
    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    // Función para refrescar la lista de salas
    const refreshRooms = useCallback(() => {
        const socket = (window as any).socket;
        if (!socket) return;
        setLoadingRooms(true);
        socket.emit('getWordGuessingRooms');
    }, []);

    useEffect(() => {
        const socket = (window as any).socket;
        if (!socket) return;
        setIsConnected(true);
        refreshRooms();
        socket.on('wordGuessingRoomsList', (roomsList: RoomInfo[]) => {
            setRooms(roomsList);
            setLoadingRooms(false);
        });
        return () => {
            socket.off('wordGuessingRoomsList');
        };
    }, [refreshRooms]);

    // Refrescar lista de salas cada vez que el lobby se muestra o vuelve a ser visible
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                refreshRooms();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [refreshRooms]);

    // Refrescar lista al volver desde el menú principal
    useEffect(() => {
        // Si el padre llama a onBackToMenu, puedes pasar una prop para refrescar aquí si lo necesitas
        // Por ahora, refrescamos cada vez que se monta
        refreshRooms();
    }, [refreshRooms]);

    const handleJoinRoom = () => {
        if (roomId.trim()) {
            onJoinRoom(roomId.trim());
        }
    };

    const handleJoinAvailableRoom = (id: string) => {
        onJoinRoom(id);
    };

    const generateRandomRoomId = () => {
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(randomId);
    };

    return (
        <div className={styles.lobbyBackground}>
            <div className="text-center mb-8">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onBackToMenu}
                        className={styles.lobbyBtn}
                        style={{ background: 'none', color: '#fff', boxShadow: 'none', padding: '8px 18px', marginTop: 0 }}
                    >
                        <span>←</span>
                        <span style={{ marginLeft: 8 }}>Menú de Juegos</span>
                    </button>
                    <div className="flex-1"></div>
                </div>
                <h1 className={styles.lobbyTitle}>🎨 Adivina la Palabra</h1>
                <p className={styles.lobbySubtitle}>Dibuja y adivina palabras en tiempo real</p>
            </div>

            <div className={styles.lobbyPanel}>
                <div>
                    <h2 className={styles.lobbySubtitle} style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 16 }}>Unirse a una sala</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Código de sala"
                            className={styles.lobbyInput}
                            maxLength={6}
                        />
                        <button
                            onClick={generateRandomRoomId}
                            className={styles.lobbyBtn}
                            style={{ padding: '0 16px', marginTop: 0 }}
                            title="Generar código aleatorio"
                        >
                            🎲
                        </button>
                    </div>
                    <button
                        onClick={handleJoinRoom}
                        disabled={!roomId.trim()}
                        className={styles.lobbyBtn}
                        style={{ width: '100%' }}
                    >
                        Unirse
                    </button>
                </div>

                <div className={styles.lobbyDivider}></div>

                <div>
                    <button
                        onClick={onCreateRoom}
                        className={styles.lobbyBtn}
                        style={{ width: '100%', background: 'linear-gradient(90deg, #7f53ff 0%, #647dee 100%)' }}
                    >
                        Crear nueva sala
                    </button>
                </div>

                <div className={styles.lobbyRoomList}>
                    <h3 style={{ color: '#ffe066', fontWeight: 600, marginBottom: 8 }}>Salas disponibles</h3>
                    {!isConnected ? (
                        <div className={styles.lobbyInfoText}>Conectando al servidor...</div>
                    ) : loadingRooms ? (
                        <div className={styles.lobbyInfoText}>Cargando salas...</div>
                    ) : rooms.length === 0 ? (
                        <div className={styles.lobbyInfoText}>No hay salas disponibles.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {rooms.map((room) => (
                                <li key={room.id} className={styles.lobbyRoomItem}>
                                    <div>
                                        <span className={styles.lobbyRoomCode}>{room.id}</span>
                                        <span style={{ marginLeft: 12, color: '#bdbdbd' }}>{room.players}/8</span>
                                        {room.gameStarted && <span style={{ marginLeft: 10, fontSize: 12, color: '#7fff7f' }}>En juego</span>}
                                        {room.creatorName && (
                                            <span style={{ marginLeft: 16, fontSize: 12, color: '#a685fa' }}>Creador: <span style={{ fontWeight: 600 }}>{room.creatorName}</span></span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleJoinAvailableRoom(room.id)}
                                        disabled={room.players >= 8}
                                        className={styles.lobbyRoomJoinBtn}
                                    >
                                        Unirse
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={styles.lobbyInfoText}>
                    Comparte el código de sala con tus amigos para jugar juntos
                </div>
            </div>
        </div>
    );
};

export default WordGuessingLobby; 