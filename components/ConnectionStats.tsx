import React, { useState } from 'react';

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
    const [isExpanded, setIsExpanded] = useState(false);

    const getConnectionQuality = (latency: number) => {
        if (latency < 50) return { quality: 'Excelente', color: 'text-green-500', bg: 'bg-green-100' };
        if (latency < 100) return { quality: 'Buena', color: 'text-yellow-500', bg: 'bg-yellow-100' };
        if (latency < 200) return { quality: 'Regular', color: 'text-orange-500', bg: 'bg-orange-100' };
        return { quality: 'Mala', color: 'text-red-500', bg: 'bg-red-100' };
    };

    const getRecommendations = (latency: number) => {
        if (latency < 50) return 'Conexión perfecta para jugar';
        if (latency < 100) return 'Conexión adecuada para la mayoría de juegos';
        if (latency < 200) return 'Considera mejorar tu conexión para mejor experiencia';
        return 'Conexión lenta, puede afectar la jugabilidad';
    };

    const quality = getConnectionQuality(latency);

    return (
        <div className="fixed bottom-4 left-4">
            <div className={`${quality.bg} border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">Estado de Conexión</h3>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-700">
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Latencia:</span>
                        <span className={`font-bold ${quality.color}`}>
                            {latency}ms
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calidad:</span>
                        <span className={`font-semibold ${quality.color}`}>
                            {quality.quality}
                        </span>
                    </div>

                    {roomId && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Sala:</span>
                            <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                                {roomId}
                            </span>
                        </div>
                    )}

                    {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">
                                {getRecommendations(latency)}
                            </p>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">0-50ms:</span>
                                    <span className="text-green-600">Excelente</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">50-100ms:</span>
                                    <span className="text-yellow-600">Buena</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">100-200ms:</span>
                                    <span className="text-orange-600">Regular</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">200ms+:</span>
                                    <span className="text-red-600">Mala</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 