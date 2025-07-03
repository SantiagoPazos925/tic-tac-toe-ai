import React from 'react';

interface LatencyIndicatorProps {
    latency: number;
    isConnected: boolean;
}

export const LatencyIndicator: React.FC<LatencyIndicatorProps> = ({ latency, isConnected }) => {
    const getLatencyColor = (latency: number) => {
        if (latency < 50) return 'text-green-500';
        if (latency < 100) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getLatencyStatus = (latency: number) => {
        if (latency < 50) return 'Excelente';
        if (latency < 100) return 'Buena';
        if (latency < 200) return 'Regular';
        return 'Mala';
    };

    if (!isConnected) {
        return (
            <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Desconectado</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-sm">
                    <span className="font-medium">Latencia: </span>
                    <span className={`font-bold ${getLatencyColor(latency)}`}>
                        {latency}ms
                    </span>
                    <span className="text-gray-500 ml-1">
                        ({getLatencyStatus(latency)})
                    </span>
                </div>
            </div>
        </div>
    );
}; 