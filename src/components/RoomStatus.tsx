import React from 'react';

interface RoomStatusProps {
    roomId: string;
    playerNumber: number;
    symbol: string;
    isWaiting: boolean;
    onCopyRoomId: () => void;
    playerNames?: {
        player1: string;
        player2: string;
    };
}

const RoomStatus: React.FC<RoomStatusProps> = ({
    roomId,
    playerNumber,
    symbol,
    isWaiting,
    onCopyRoomId,
    playerNames
}) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl mb-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-200 mb-4">
                    Sala: {roomId}
                </h2>

                <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-teal-400 mb-2">{symbol}</div>
                        <div className="text-gray-400">
                            {playerNames ?
                                (playerNumber === 1 ? playerNames.player1 : playerNames.player2) :
                                `Jugador ${playerNumber}`
                            }
                        </div>
                    </div>
                </div>

                {isWaiting ? (
                    <div className="text-center">
                        <div className="text-gray-300 mb-2">Esperando al segundo jugador...</div>
                        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : (
                    <div className="text-green-400 font-semibold">
                        ¡Jugador 2 se ha unido! El juego puede comenzar.
                    </div>
                )}

                <div className="mt-4">
                    <p className="text-gray-400 text-sm mb-2">
                        Comparte este código con tu amigo:
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                        <code className="bg-gray-700 px-4 py-2 rounded-lg text-teal-400 font-mono text-lg">
                            {roomId}
                        </code>
                        <button
                            onClick={onCopyRoomId}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                            title="Copiar código"
                        >
                            📋
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomStatus; 