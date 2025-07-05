import React, { useState } from 'react';

interface PlayerNameInputProps {
    onSubmit: (playerName: string) => void;
    onCancel: () => void;
}

const PlayerNameInput: React.FC<PlayerNameInputProps> = ({ onSubmit, onCancel }) => {
    const [playerName, setPlayerName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim()) {
            onSubmit(playerName.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
                    Tic-Tac-Toe Online
                </h1>
                <p className="text-gray-400 mt-2">Ingresa tu nombre para comenzar</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="playerName" className="block text-lg font-semibold text-gray-200 mb-2">
                            Tu nombre
                        </label>
                        <input
                            id="playerName"
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Ej: Juan, María, etc."
                            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-400 focus:outline-none text-lg"
                            maxLength={20}
                            autoFocus
                            required
                        />
                        <p className="text-gray-400 text-sm mt-1">
                            Máximo 20 caracteres
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!playerName.trim()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-400 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Continuar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlayerNameInput; 