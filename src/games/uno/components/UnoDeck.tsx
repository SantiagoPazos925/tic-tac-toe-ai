import React from 'react';

interface UnoDeckProps {
    cardCount: number;
    onDraw: () => void;
    disabled?: boolean;
}

const UnoDeck: React.FC<UnoDeckProps> = ({ cardCount, onDraw, disabled = false }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="relative flex flex-col items-center">
                {/* Dorso personalizado */}
                <div className="w-24 h-36 rounded-2xl border-4 border-white bg-gradient-to-br from-black to-gray-900 flex items-center justify-center shadow-2xl relative">
                    <span className="text-4xl font-extrabold text-yellow-400 drop-shadow-lg select-none" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
                        UNO
                    </span>
                </div>
                {/* Badge de cantidad */}
                <div className="absolute -right-6 -top-4 bg-white text-blue-700 text-lg px-4 py-1 rounded-full font-bold border-2 border-blue-400 shadow">
                    {cardCount}
                </div>
            </div>
            <button
                onClick={onDraw}
                disabled={disabled}
                className={`mt-6 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-colors ${disabled
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 scale-105'
                    }`}
            >
                Robar Carta
            </button>
        </div>
    );
};

export default UnoDeck; 