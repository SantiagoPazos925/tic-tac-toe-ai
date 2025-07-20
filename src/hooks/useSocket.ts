import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
  lazyConnect?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  // Determinar la URL del servidor basado en el entorno
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const defaultUrl = isLocalhost ? 'http://localhost:3001' : 'https://tic-tac-toe-ai-production-13d0.up.railway.app';
  
  const {
    url = import.meta.env['VITE_SOCKET_URL'] || defaultUrl,
    autoConnect = false,
    lazyConnect = true,
    retryAttempts = 3,
    retryDelay = 1000,
    timeout = 5000
  } = options;
  
  console.log('🔍 DEBUG: useSocket usando URL:', url);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para crear la conexión con optimizaciones
  const createSocket = useCallback(() => {
    if (socketRef.current) {
      return socketRef.current;
    }

        const socket = io(url, {
      autoConnect: false,
      timeout: timeout,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      forceNew: false,
      // Configuración de reconnection
      reconnection: true,
      reconnectionAttempts: retryAttempts,
      reconnectionDelay: retryDelay,
      reconnectionDelayMax: 5000,
              // Configuración básica
    });

    // Event listeners optimizados
    socket.on('connect', () => {
      console.log('🔌 Socket conectado');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      retryCountRef.current = 0;
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar
        setTimeout(() => {
          socket.connect();
        }, retryDelay);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión Socket:', err);
      setIsConnecting(false);
      setError(err.message);
      
      // Retry con backoff exponencial
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Reintentando conexión Socket (${retryCountRef.current}/${retryAttempts})`);
          socket.connect();
        }, delay);
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socket.on('reconnect_error', (err) => {
      console.error('❌ Error de reconexión Socket:', err);
      setError(err.message);
    });

    socketRef.current = socket;
        return socket;
  }, [url, timeout, retryAttempts, retryDelay]);

  // Función para conectar
  const connect = useCallback(() => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);
    
    const socket = createSocket();
    socket.connect();
  }, [isConnected, isConnecting, createSocket]);

  // Función para desconectar
    const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
        setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    }, []);

  // Función para reconectar
  const reconnect = useCallback(() => {
    disconnect();
    retryCountRef.current = 0;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Lazy connection - conectar solo cuando sea necesario
    useEffect(() => {
    if (!lazyConnect && autoConnect) {
      connect();
        }

        return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
            }
        };
  }, [lazyConnect, autoConnect, connect]);

  // Cleanup al desmontar
    useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

    return {
    socket: socketRef.current,
        isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    reconnect
  };
};

// Hook para optimizar la carga de Socket.io
export const useSocketOptimization = () => {
  const [isSocketLoaded, setIsSocketLoaded] = useState(false);

  useEffect(() => {
    // Precargar Socket.io cuando el navegador esté idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Precargar el script de Socket.io
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
        script.async = true;
        script.onload = () => {
          console.log('📦 Socket.io precargado');
          setIsSocketLoaded(true);
        };
        document.head.appendChild(script);
      });
    } else {
      // Fallback para navegadores que no soportan requestIdleCallback
      setTimeout(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
        script.async = true;
        script.onload = () => {
          console.log('📦 Socket.io precargado');
          setIsSocketLoaded(true);
        };
        document.head.appendChild(script);
      }, 2000);
    }
  }, []);

  return isSocketLoaded;
}; 