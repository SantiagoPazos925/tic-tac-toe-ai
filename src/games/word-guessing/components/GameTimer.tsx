import React from 'react';

interface GameTimerProps {
    timeRemaining: number;
}

const GameTimer: React.FC<GameTimerProps> = ({ timeRemaining }) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (timeRemaining <= 10) return 'text-red-500';
        if (timeRemaining <= 30) return 'text-yellow-500';
        return 'text-white';
    };

    const getTimerSize = () => {
        if (timeRemaining <= 10) return 'text-2xl font-bold';
        if (timeRemaining <= 30) return 'text-xl font-semibold';
        return 'text-lg';
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="text-white text-sm">⏰</div>
            <div className={`${getTimerColor()} ${getTimerSize()} font-mono`}>
                {formatTime(timeRemaining)}
            </div>
            {timeRemaining <= 10 && (
                <div className="animate-pulse text-red-500">
                    ⚠️
                </div>
            )}
        </div>
    );
};

export default GameTimer; 