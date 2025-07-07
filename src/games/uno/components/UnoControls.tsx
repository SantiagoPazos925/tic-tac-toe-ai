import React from 'react';
import { UnoCard as UnoCardType } from '../types';

interface UnoControlsProps {
    isPlayerTurn: boolean;
    isBotTurn: boolean;
    shouldSayUno: boolean;
    onSayUno: () => void;
    onDrawCard: () => void;
    playableCards: UnoCardType[];
}

const UnoControls: React.FC<UnoControlsProps> = ({
    isPlayerTurn,
    isBotTurn,
    shouldSayUno,
    onSayUno,
    onDrawCard,
    playableCards
}) => {
    return (
        <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-xl flex flex-col items-center gap-6 min-w-[220px]">
            {shouldSayUno && isPlayerTurn && (
                <button
                    onClick={onSayUno}
                    className="w-full bg-yellow-400 text-white py-4 px-6 rounded-2xl font-extrabold text-2xl shadow-lg hover:bg-yellow-500 transition-colors animate-pulse border-4 border-yellow-600 drop-shadow-xl"
                    style={{ letterSpacing: '0.1em', textShadow: '0 0 8px #fffbe6, 0 0 16px #ffe066' }}
                >
                    ¡UNO!
                </button>
            )}

            {isPlayerTurn && !isBotTurn && (
                <button
                    onClick={onDrawCard}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors border-4 border-blue-800 drop-shadow-xl"
                >
                    Robar Carta
                </button>
            )}

            {isBotTurn && (
                <div className="text-yellow-300 text-lg font-bold text-center animate-pulse">
                    Pensando...
                </div>
            )}

            <div className="text-white text-base text-center opacity-90 font-semibold mt-2">
                {isPlayerTurn ? '¡Es tu turno!' : 'Esperando...'}
            </div>
            {isPlayerTurn && playableCards.length > 0 && (
                <div className="text-green-300 text-sm text-center mt-1">
                    Tienes {playableCards.length} carta{playableCards.length > 1 ? 's' : ''} jugable{playableCards.length > 1 ? 's' : ''}
                </div>
            )}
            {isPlayerTurn && playableCards.length === 0 && (
                <div className="text-red-300 text-sm text-center mt-1">
                    No tienes cartas jugables
                </div>
            )}
        </div>
    );
};

export default UnoControls; 