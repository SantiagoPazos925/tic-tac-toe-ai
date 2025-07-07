import React from 'react';
import { WordGuessingPlayer } from '../types';

interface WordGuessingRoomStatusProps {
    players: WordGuessingPlayer[];
    currentPlayer: WordGuessingPlayer | null;
    onStartGame: () => void;
}

const WordGuessingRoomStatus: React.FC<WordGuessingRoomStatusProps> = ({
    players,
    currentPlayer,
    onStartGame
}) => {
    return (
        <div className="text-center space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                    Jugadores en la sala ({players.length})
                </h3>

                <div className="space-y-2">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className={`p-2 rounded-lg ${currentPlayer?.id === player.id
                                    ? 'bg-blue-500/20 border border-blue-500/30'
                                    : 'bg-white/10'
                                }`}
                        >
                            <span className={`font-semibold ${currentPlayer?.id === player.id ? 'text-blue-300' : 'text-white'
                                }`}>
                                {player.name}
                            </span>
                            {currentPlayer?.id === player.id && (
                                <span className="text-xs text-blue-300 ml-2">(Tú)</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {players.length >= 2 && (
                <div className="bg-green-500/20 rounded-lg p-4">
                    <p className="text-green-300 font-semibold mb-2">
                        ¡Suficientes jugadores para comenzar!
                    </p>
                    <button
                        onClick={onStartGame}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Iniciar Juego
                    </button>
                </div>
            )}

            {players.length < 2 && (
                <div className="bg-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-300">
                        Esperando más jugadores... (mínimo 2)
                    </p>
                </div>
            )}
        </div>
    );
};

export default WordGuessingRoomStatus; 