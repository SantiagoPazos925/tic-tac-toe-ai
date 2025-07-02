import React, { useState } from 'react';

interface LobbyProps {
    onJoinRoom: (roomId: string) => void;
    onCreateRoom: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoinRoom, onCreateRoom }) => {
    const [roomId, setRoomId] = useState('');

    const handleJoinRoom = () => {
        if (roomId.trim()) {
            onJoinRoom(roomId.trim());
        }
    };

    const generateRandomRoomId = () => {
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(randomId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="text-center mb-8">
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
                            onClick={onCreateRoom}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out"
                        >
                            Crear nueva sala
                        </button>
                    </div>
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