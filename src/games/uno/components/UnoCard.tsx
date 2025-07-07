import React from 'react';
import { UnoCard as UnoCardType } from '../types';
import { getColorEmoji, getColorName } from '../utils/unoDeck';

interface UnoCardProps {
    card: UnoCardType;
    isPlayable?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

const UnoCard: React.FC<UnoCardProps> = ({
    card,
    isPlayable = false,
    isSelected = false,
    onClick,
    disabled = false,
    className = ''
}) => {
    const getCardColor = () => {
        switch (card.color) {
            case 'red': return 'bg-gradient-to-br from-red-500 to-red-700';
            case 'blue': return 'bg-gradient-to-br from-blue-500 to-blue-700';
            case 'green': return 'bg-gradient-to-br from-green-500 to-green-700';
            case 'yellow': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
            case 'black': return 'bg-gradient-to-br from-gray-800 to-gray-900';
            default: return 'bg-gray-500';
        }
    };

    const getCardStyle = () => {
        let baseStyle = `w-24 h-36 rounded-2xl border-4 border-white font-extrabold text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 shadow-xl ${getCardColor()}`;
        if (disabled) {
            baseStyle += ' opacity-50 cursor-not-allowed';
        } else {
            baseStyle += ' hover:scale-110 hover:shadow-2xl ring-4 ring-yellow-300/70';
        }
        if (isSelected) {
            baseStyle += ' scale-110 ring-8 ring-blue-400';
        }
        return `${baseStyle} ${className}`;
    };

    const getDisplayValue = () => {
        switch (card.value) {
            case 'skip':
                return '⏭️';
            case 'reverse':
                return '🔄';
            case 'draw2':
                return '+2';
            case 'wild':
                return '🌈';
            case 'wild4':
                return '+4';
            default:
                return card.value.toString();
        }
    };

    const handleClick = () => {
        if (!disabled && onClick) {
            onClick();
        }
    };

    return (
        <div
            className={getCardStyle()}
            onClick={handleClick}
            title={`${getColorName(card.color)} ${card.value}`}
            style={{ boxShadow: isPlayable ? '0 0 16px 4px #ffe066' : '0 4px 16px 0 #0006' }}
        >
            <div className="text-2xl mb-1 drop-shadow-lg">
                {getColorEmoji(card.color)}
            </div>
            <div className="text-5xl font-extrabold drop-shadow-lg select-none">
                {getDisplayValue()}
            </div>
            {card.color === 'black' && (
                <div className="text-xs mt-2 opacity-80 font-bold tracking-wide">
                    {card.value === 'wild' ? 'Comodín' : '+4'}
                </div>
            )}
        </div>
    );
};

export default UnoCard; 