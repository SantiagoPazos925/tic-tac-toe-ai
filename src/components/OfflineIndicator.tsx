import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useServiceWorker } from '../hooks/useServiceWorker';

interface OfflineIndicatorProps {
    className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
    const {
        isSupported,
        isInstalled,
        isUpdated,
        isOffline,
        skipWaiting,
    } = useServiceWorker();

    if (!isSupported) {
        return null; // No mostrar nada si no hay soporte para Service Worker
    }

    return (
        <>
            {/* Indicador de estado offline */}
            <AnimatePresence>
                {isOffline && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-discord-warning text-discord-text-primary px-4 py-2 rounded-md shadow-lg flex items-center gap-2 ${className}`}
                    >
                        <div className="w-2 h-2 bg-discord-warning rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Modo offline</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Indicador de actualización disponible */}
            <AnimatePresence>
                {isUpdated && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 right-4 z-50 bg-discord-accent text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 ${className}`}
                    >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-sm font-medium">Nueva versión disponible</span>
                        <button
                            onClick={skipWaiting}
                            className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-all"
                        >
                            Actualizar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Indicador de estado del Service Worker */}
            <AnimatePresence>
                {isInstalled && !isOffline && !isUpdated && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`fixed bottom-4 right-4 z-40 bg-discord-success bg-opacity-20 text-discord-success px-3 py-1 rounded-full text-xs ${className}`}
                    >
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-discord-success rounded-full"></div>
                            <span>App instalada</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Componente para mostrar información detallada del Service Worker
export const ServiceWorkerInfo: React.FC = () => {
    const {
        isSupported,
        isInstalled,
        isUpdated,
        isOffline,
        registration,
        update,
        unregister,
    } = useServiceWorker();

    if (!isSupported) {
        return (
            <div className="p-4 bg-discord-secondary rounded-md">
                <h3 className="text-discord-text-primary font-semibold mb-2">
                    Service Worker no soportado
                </h3>
                <p className="text-discord-text-secondary text-sm">
                    Tu navegador no soporta Service Workers. Algunas funciones offline no estarán disponibles.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-discord-secondary rounded-md">
            <h3 className="text-discord-text-primary font-semibold mb-3">
                Estado de la Aplicación
            </h3>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-discord-text-secondary text-sm">Service Worker:</span>
                    <span className={`text-sm font-medium ${isInstalled ? 'text-discord-success' : 'text-discord-warning'}`}>
                        {isInstalled ? 'Instalado' : 'No instalado'}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-discord-text-secondary text-sm">Conexión:</span>
                    <span className={`text-sm font-medium ${isOffline ? 'text-discord-warning' : 'text-discord-success'}`}>
                        {isOffline ? 'Offline' : 'Online'}
                    </span>
                </div>

                {isUpdated && (
                    <div className="flex items-center justify-between">
                        <span className="text-discord-text-secondary text-sm">Actualización:</span>
                        <span className="text-sm font-medium text-discord-accent">
                            Disponible
                        </span>
                    </div>
                )}

                {registration && (
                    <div className="flex items-center justify-between">
                        <span className="text-discord-text-secondary text-sm">Estado:</span>
                        <span className="text-sm font-medium text-discord-text-primary">
                            {registration.active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-4 space-y-2">
                <button
                    onClick={update}
                    className="w-full btn btn-sm"
                >
                    Buscar actualizaciones
                </button>

                {isInstalled && (
                    <button
                        onClick={unregister}
                        className="w-full btn btn-secondary btn-sm"
                    >
                        Desinstalar app
                    </button>
                )}
            </div>
        </div>
    );
}; 