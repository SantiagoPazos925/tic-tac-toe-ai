import React from 'react';
import { WordGuessingPlayer } from '../types';

interface PlayerListProps {
    players: WordGuessingPlayer[];
    currentPlayer: WordGuessingPlayer | null;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayer }) => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
                <div
                    key={player.id}
                    className={`p-3 rounded-lg flex items-center justify-between ${currentPlayer?.id === player.id
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : 'bg-white/10'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                            </span>
                            <span className={`font-semibold ${currentPlayer?.id === player.id ? 'text-blue-300' : 'text-white'
                                }`}>
                                {player.name}
                            </span>
                        </div>

                        {player.isDrawing && (
                            <span className="text-yellow-300 text-sm font-medium">
                                🎨 Dibujando
                            </span>
                        )}

                        {player.hasGuessed && !player.isDrawing && (
                            <span className="text-green-300 text-sm font-medium">
                                ✅ Adivinó
                            </span>
                        )}
                    </div>

                    <div className="text-right">
                        <div className="font-bold text-white">
                            {player.score} pts
                        </div>
                        {currentPlayer?.id === player.id && (
                            <div className="text-xs text-blue-300">
                                Tú
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {players.length === 0 && (
                <div className="text-center text-white/60 py-4">
                    <p>No hay jugadores conectados</p>
                </div>
            )}
        </div>
    );
};

export default PlayerList; 