import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { RoomInfo } from '../../../shared/types';

interface LobbyProps {
    onJoinRoom: (roomId: string, playerName: string) => void;
    onCreateRoom: (playerName: string) => void;
    playerName: string;
    onBackToMenu: () => void;
}



const Lobby: React.FC<LobbyProps> = ({ onJoinRoom, onCreateRoom, playerName, onBackToMenu }) => {
    const [roomId, setRoomId] = useState('');
    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const { isConnected } = useSocket();

    useEffect(() => {
        if (!isConnected) return;

        // Solicitar la lista de salas al montar
        const socket = (window as any).socket;
        if (socket) {
            socket.emit('getRooms');
            setLoadingRooms(true);

            // Recibir la lista de salas
            socket.on('roomsList', (roomsList: RoomInfo[]) => {
                setRooms(roomsList);
                setLoadingRooms(false);
            });

            // Refrescar la lista cuando se actualiza en el backend
            socket.on('roomsUpdated', () => {
                socket.emit('getRooms');
            });

            return () => {
                socket.off('roomsList');
                socket.off('roomsUpdated');
            };
        }
    }, [isConnected]);

    const handleJoinRoom = () => {
        if (roomId.trim()) {
            onJoinRoom(roomId.trim(), playerName);
        }
    };

    const handleJoinAvailableRoom = (id: string) => {
        onJoinRoom(id, playerName);
    };

    const generateRandomRoomId = () => {
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(randomId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="text-center mb-8">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onBackToMenu}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center space-x-2"
                    >
                        <span>←</span>
                        <span>Menú de Juegos</span>
                    </button>
                    <div className="flex-1"></div>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
                    Tic-Tac-Toe Online
                </h1>
                <p className="text-gray-400 mt-2">Juega con amigos en tiempo real</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-200 mb-4">Unirse a una sala</h2>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="Código de sala"
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-400 focus:outline-none"
                                maxLength={6}
                            />
                            <button
                                onClick={generateRandomRoomId}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                title="Generar código aleatorio"
                            >
                                🎲
                            </button>
                        </div>
                        <button
                            onClick={handleJoinRoom}
                            disabled={!roomId.trim()}
                            className="w-full mt-3 px-6 py-3 bg-gradient-to-r from-teal-400 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Unirse
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800 text-gray-400">o</span>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={() => onCreateRoom(playerName)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out"
                        >
                            Crear nueva sala
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Salas disponibles</h3>
                    {!isConnected ? (
                        <div className="text-gray-400">Conectando al servidor...</div>
                    ) : loadingRooms ? (
                        <div className="text-gray-400">Cargando salas...</div>
                    ) : rooms.length === 0 ? (
                        <div className="text-gray-400">No hay salas disponibles.</div>
                    ) : (
                        <ul className="space-y-2">
                            {rooms.map((room) => (
                                <li key={room.id} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2">
                                    <div>
                                        <span className="font-mono text-teal-300">{room.id}</span>
                                        <span className="ml-3 text-gray-300">{room.players}/2</span>
                                        {room.gameStarted && <span className="ml-2 text-xs text-yellow-400">En juego</span>}
                                    </div>
                                    <button
                                        onClick={() => handleJoinAvailableRoom(room.id)}
                                        disabled={room.players >= 2}
                                        className="px-3 py-1 bg-teal-500 text-white rounded-lg font-bold hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Unirse
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Comparte el código de sala con tu amigo para jugar juntos
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Lobby; 