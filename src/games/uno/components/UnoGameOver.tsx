import React from 'react';
import { UnoPlayer } from '../types';

interface UnoGameOverProps {
    winner: UnoPlayer;
    onPlayAgain: () => void;
    onBackToMenu: () => void;
}

const UnoGameOver: React.FC<UnoGameOverProps> = ({ winner, onPlayAgain, onBackToMenu }) => {
    const isPlayerWinner = winner.type === 'human';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                <div className="mb-6">
                    <div className={`text-6xl mb-4 ${isPlayerWinner ? 'text-green-500' : 'text-red-500'}`}>
                        {isPlayerWinner ? '🏆' : '😔'}
                    </div>
                    <h2 className={`text-3xl font-bold mb-2 ${isPlayerWinner ? 'text-green-600' : 'text-red-600'}`}>
                        {isPlayerWinner ? '¡VICTORIA!' : '¡Derrota!'}
                    </h2>
                    <p className="text-gray-600 text-lg">
                        {isPlayerWinner
                            ? '¡Has ganado la partida!'
                            : `${winner.name} ha ganado la partida.`
                        }
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onPlayAgain}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
                    >
                        Jugar de Nuevo
                    </button>

                    <button
                        onClick={onBackToMenu}
                        className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors"
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnoGameOver; 