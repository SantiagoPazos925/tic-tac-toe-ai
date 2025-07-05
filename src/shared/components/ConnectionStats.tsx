import React from 'react';

interface ConnectionStatsProps {
    latency: number;
    isConnected: boolean;
    roomId: string;
}

export const ConnectionStats: React.FC<ConnectionStatsProps> = ({
    latency,
    isConnected,
    roomId
}) => {
    const getLatencyColor = (latency: number) => {
        if (latency < 50) return 'text-green-400';
        if (latency < 100) return 'text-yellow-400';
        if (latency < 200) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center space-x-2 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-300 text-sm font-mono">
                    PING: <span className={getLatencyColor(latency)}>{latency}</span>ms
                </span>
            </div>
        </div>
    );
}; 