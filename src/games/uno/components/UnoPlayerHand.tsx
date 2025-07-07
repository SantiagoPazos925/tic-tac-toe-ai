import React, { useState } from 'react';
import { UnoCard as UnoCardType } from '../types';
import UnoCard from './UnoCard';

interface UnoPlayerHandProps {
    cards: UnoCardType[];
    playableCards: UnoCardType[];
    onPlayCard: (cardId: string) => void;
    disabled?: boolean;
}

const UnoPlayerHand: React.FC<UnoPlayerHandProps> = ({
    cards,
    playableCards,
    onPlayCard,
    disabled = false
}) => {
    const [animatingCardId, setAnimatingCardId] = useState<string | null>(null);
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    const playableCardIds = playableCards.map(card => card.id);
    // Efecto abanico: calcular ángulo para cada carta
    const spread = Math.min(60, cards.length * 8); // máximo 60 grados
    const startAngle = -spread / 2;

    const handlePlay = (cardId: string) => {
        setAnimatingCardId(cardId);
        setTimeout(() => {
            setAnimatingCardId(null);
            onPlayCard(cardId);
        }, 350); // Duración de la animación
    };

    return (
        <div className="relative flex justify-center items-end w-full" style={{ minHeight: '180px' }}>
            {cards.map((card, idx) => {
                const angle = startAngle + (spread / Math.max(1, cards.length - 1)) * idx;
                const isAnimating = animatingCardId === card.id;
                const isHovered = hoveredCardId === card.id;
                const isPlayable = playableCardIds.includes(card.id) && !disabled;

                return (
                    <div
                        key={card.id}
                        style={{
                            transform: `translateY(-10px) rotate(${angle}deg)` +
                                (isAnimating ? ' scale-125 translate-y-[-80px] translate-x-0' : '') +
                                (isHovered ? ' translate-y-[-20px] scale-110' : ''),
                            zIndex: isHovered ? 200 + idx : 100 + idx,
                            marginLeft: idx === 0 ? 0 : -48,
                            transition: 'all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1)',
                            filter: isHovered ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'none'
                        }}
                        className={
                            `transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-4 cursor-pointer ${isAnimating ? 'opacity-80' : ''
                            } ${isHovered ? 'ring-2 ring-yellow-300 ring-opacity-50' : ''
                            }`
                        }
                        onClick={() => !disabled && playableCardIds.includes(card.id) && !animatingCardId && handlePlay(card.id)}
                        onMouseEnter={() => setHoveredCardId(card.id)}
                        onMouseLeave={() => setHoveredCardId(null)}
                    >
                        <UnoCard
                            card={card}
                            isPlayable={playableCardIds.includes(card.id)}
                            isSelected={isAnimating}
                            disabled={disabled}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default UnoPlayerHand; 