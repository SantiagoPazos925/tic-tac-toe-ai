import React from 'react';
import { Game } from '../types';
import { GAMES } from '../utils/gameConfig';

interface GameMenuProps {
    playerName: string;
    onSelectGame: (gameId: string) => void;
    onBack: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ playerName, onSelectGame, onBack }) => {
    const games: Game[] = GAMES;

    const getStatusColor = (status: Game['status']) => {
        switch (status) {
            case 'available': return 'border-green-500 bg-green-500/10';
            case 'coming-soon': return 'border-gray-500 bg-gray-500/10';
            case 'maintenance': return 'border-red-500 bg-red-500/10';
            default: return 'border-gray-500 bg-gray-500/10';
        }
    };

    const getStatusText = (status: Game['status']) => {
        switch (status) {
            case 'available': return 'Disponible';
            case 'coming-soon': return 'Próximamente';
            case 'maintenance': return 'Mantenimiento';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
                    Sala de Juegos
                </h1>
                <p className="text-gray-400 mt-2">Bienvenido, {playerName}</p>
            </div>

            <div className="max-w-4xl w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${game.status === 'available' ? 'hover:shadow-2xl' : 'cursor-not-allowed'
                                }`}
                            onClick={() => game.status === 'available' && onSelectGame(game.id)}
                        >
                            <div className={`border-2 rounded-xl p-6 h-full transition-all duration-300 ${getStatusColor(game.status)} ${game.status === 'available'
                                ? 'hover:border-teal-400 hover:bg-teal-500/20'
                                : 'opacity-60'
                                }`}>

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${game.status === 'available'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : game.status === 'coming-soon'
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {getStatusText(game.status)}
                                    </span>
                                </div>

                                {/* Game Icon */}
                                <div className="text-center mb-4">
                                    <div className="text-4xl mb-2">{game.icon}</div>
                                </div>

                                {/* Game Info */}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-200 mb-2">
                                        {game.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-3">
                                        {game.description}
                                    </p>
                                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                        <span>👥</span>
                                        <span>{game.players}</span>
                                    </div>
                                </div>

                                {/* Overlay for unavailable games */}
                                {game.status !== 'available' && (
                                    <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">🔒</div>
                                            <div className="text-gray-300 text-sm font-medium">
                                                {getStatusText(game.status)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Back Button */}
                <div className="text-center mt-8">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors duration-300"
                    >
                        ← Cambiar nombre
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameMenu; 