import React from 'react';
import { UnoCard as UnoCardType } from '../types';
import UnoCard from './UnoCard';

interface UnoDiscardPileProps {
    topCard: UnoCardType;
    currentColor: string;
}

const colorDiamonds: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
};

const UnoDiscardPile: React.FC<UnoDiscardPileProps> = ({ topCard, currentColor }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
                <UnoCard
                    card={topCard}
                    className="shadow-2xl scale-110 border-8 border-white"
                />
                {/* Diamante de color actual */}
                <div
                    className={`absolute -right-16 top-1/2 -translate-y-1/2 w-10 h-10 rotate-45 border-4 border-white shadow-lg ${colorDiamonds[currentColor] || 'bg-gray-400'}`}
                />
            </div>
            <div className="mt-2 text-white text-base font-bold tracking-wide drop-shadow-lg">
                Pila de Descarte
            </div>
        </div>
    );
};

export default UnoDiscardPile; 