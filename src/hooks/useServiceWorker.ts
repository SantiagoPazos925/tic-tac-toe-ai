import { useState, useEffect, useCallback } from 'react';
import Logger from '../utils/logger';

interface ServiceWorkerState {
    isSupported: boolean;
    isInstalled: boolean;
    isUpdated: boolean;
    isOffline: boolean;
    registration: ServiceWorkerRegistration | null;
}

interface ServiceWorkerActions {
    register: () => Promise<void>;
    update: () => Promise<void>;
    unregister: () => Promise<void>;
    skipWaiting: () => void;
}

export const useServiceWorker = (): ServiceWorkerState & ServiceWorkerActions => {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: 'serviceWorker' in navigator,
        isInstalled: false,
        isUpdated: false,
        isOffline: !navigator.onLine,
        registration: null,
    });

    // Registrar el Service Worker
    const register = useCallback(async () => {
        if (!state.isSupported) {
            Logger.warn('Service Worker no soportado en este navegador');
            return;
        }

        try {
            Logger.info('Registrando Service Worker...');

            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
            });

            Logger.info('Service Worker registrado exitosamente', registration);

            setState(prev => ({
                ...prev,
                isInstalled: true,
                registration
            }));

            // Escuchar actualizaciones
            registration.addEventListener('updatefound', () => {
                Logger.info('Nueva versión del Service Worker disponible');
                setState(prev => ({ ...prev, isUpdated: true }));
            });

        } catch (error) {
            Logger.error('Error registrando Service Worker:', error);
        }
    }, [state.isSupported]);

    // Actualizar el Service Worker
    const update = useCallback(async () => {
        if (!state.registration) return;

        try {
            Logger.info('Actualizando Service Worker...');
            await state.registration.update();
        } catch (error) {
            Logger.error('Error actualizando Service Worker:', error);
        }
    }, [state.registration]);

    // Desregistrar el Service Worker
    const unregister = useCallback(async () => {
        if (!state.registration) return;

        try {
            Logger.info('Desregistrando Service Worker...');
            await state.registration.unregister();
            setState(prev => ({
                ...prev,
                isInstalled: false,
                registration: null
            }));
        } catch (error) {
            Logger.error('Error desregistrando Service Worker:', error);
        }
    }, [state.registration]);

    // Saltar espera para activar nueva versión
    const skipWaiting = useCallback(() => {
        if (!state.registration || !state.registration.waiting) return;

        Logger.info('Activando nueva versión del Service Worker');
        state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Recargar la página después de la activación
        window.location.reload();
    }, [state.registration]);

    // Detectar cambios de conectividad
    useEffect(() => {
        const handleOnline = () => {
            Logger.info('Conexión restaurada');
            setState(prev => ({ ...prev, isOffline: false }));
        };

        const handleOffline = () => {
            Logger.warn('Conexión perdida - Modo offline activado');
            setState(prev => ({ ...prev, isOffline: true }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Escuchar mensajes del Service Worker
    useEffect(() => {
        if (!state.isSupported) return;

        const handleMessage = (event: MessageEvent) => {
            Logger.info('Mensaje recibido del Service Worker:', event.data);

            if (event.data && event.data.type === 'SW_UPDATED') {
                setState(prev => ({ ...prev, isUpdated: true }));
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
        };
    }, [state.isSupported]);

    // Registrar automáticamente al montar el componente
    useEffect(() => {
        if (state.isSupported && !state.isInstalled) {
            register();
        }
    }, [state.isSupported, state.isInstalled, register]);

    return {
        ...state,
        register,
        update,
        unregister,
        skipWaiting,
    };
};

// Hook para manejar datos offline
export const useOfflineData = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingData, setPendingData] = useState<any[]>([]);

    // Guardar datos para sincronización offline
    const saveOfflineData = useCallback((data: any) => {
        if (!isOnline) {
            setPendingData(prev => [...prev, data]);
            Logger.info('Datos guardados para sincronización offline', data);
        }
    }, [isOnline]);

    // Sincronizar datos pendientes
    const syncPendingData = useCallback(async () => {
        if (pendingData.length === 0) return;

        Logger.info('Sincronizando datos pendientes...', pendingData.length);

        try {
            // Aquí se implementaría la lógica de sincronización
            // Por ejemplo, enviar mensajes pendientes al servidor

            setPendingData([]);
            Logger.info('Datos sincronizados exitosamente');
        } catch (error) {
            Logger.error('Error sincronizando datos:', error);
        }
    }, [pendingData]);

    // Detectar cambios de conectividad
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncPendingData();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncPendingData]);

    return {
        isOnline,
        pendingData,
        saveOfflineData,
        syncPendingData,
    };
};

// Hook para notificaciones push
export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    // Solicitar permisos de notificación
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            Logger.warn('Notificaciones no soportadas en este navegador');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                Logger.info('Permisos de notificación concedidos');
                return true;
            } else {
                Logger.warn('Permisos de notificación denegados');
                return false;
            }
        } catch (error) {
            Logger.error('Error solicitando permisos de notificación:', error);
            return false;
        }
    }, []);

    // Suscribirse a notificaciones push
    const subscribe = useCallback(async () => {
        if (permission !== 'granted') {
            const granted = await requestPermission();
            if (!granted) return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Reemplazar con tu clave VAPID
            });

            setSubscription(pushSubscription);
            Logger.info('Suscripción a notificaciones push creada');

            // Aquí enviarías la suscripción al servidor
            // await sendSubscriptionToServer(pushSubscription);

        } catch (error) {
            Logger.error('Error suscribiéndose a notificaciones push:', error);
        }
    }, [permission, requestPermission]);

    // Desuscribirse de notificaciones push
    const unsubscribe = useCallback(async () => {
        if (!subscription) return;

        try {
            await subscription.unsubscribe();
            setSubscription(null);
            Logger.info('Suscripción a notificaciones push cancelada');
        } catch (error) {
            Logger.error('Error desuscribiéndose de notificaciones push:', error);
        }
    }, [subscription]);

    return {
        permission,
        subscription,
        requestPermission,
        subscribe,
        unsubscribe,
    };
}; 