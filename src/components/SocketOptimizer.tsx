import { useEffect, useState } from 'react';
import { useSocketOptimization } from '../hooks/useSocket';

interface SocketOptimizerProps {
  children: React.ReactNode;
}

export const SocketOptimizer: React.FC<SocketOptimizerProps> = ({ children }) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const isSocketLoaded = useSocketOptimization();

  useEffect(() => {
    // Optimizaciones adicionales para Socket.io
    const optimizeSocketIO = () => {
      // Determinar la URL del servidor basado en el entorno
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const serverUrl = isLocalhost ? 'http://localhost:3001' : 'https://tic-tac-toe-ai-production-13d0.up.railway.app';
      
      console.log('🔍 DEBUG: SocketOptimizer usando URL:', serverUrl);
      
      // 1. Precargar DNS para el servidor de Socket.io
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = serverUrl;
      document.head.appendChild(link);

      // 2. Precargar la conexión WebSocket
      const wsLink = document.createElement('link');
      wsLink.rel = 'preconnect';
      wsLink.href = serverUrl;
      wsLink.crossOrigin = 'anonymous';
      document.head.appendChild(wsLink);

      // 3. Configurar optimizaciones de red
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType === 'slow-2g') {
          // Para conexiones lentas, usar polling en lugar de WebSocket
          localStorage.setItem('socket_transport', 'polling');
        }
      }

      // 4. Precargar recursos críticos de Socket.io
      const preloadResources = [
        'https://cdn.socket.io/4.8.1/socket.io.min.js',
        serverUrl
      ];

      preloadResources.forEach(resource => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = resource;
        preloadLink.as = resource.includes('.js') ? 'script' : 'fetch';
        preloadLink.crossOrigin = 'anonymous';
        document.head.appendChild(preloadLink);
      });

      setIsOptimized(true);
    };

    // Ejecutar optimizaciones cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeSocketIO);
    } else {
      optimizeSocketIO();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeSocketIO);
    };
  }, []);

  // Mostrar indicador de optimización en desarrollo
  if (import.meta.env.DEV) {
    console.log('🔧 Socket Optimizer:', {
      isOptimized,
      isSocketLoaded,
      ready: isOptimized && isSocketLoaded
    });
  }

  return <>{children}</>;
};

// Componente para mostrar el estado de optimización
export const SocketStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'optimizing' | 'ready' | 'error'>('optimizing');
  const isSocketLoaded = useSocketOptimization();

  useEffect(() => {
    if (isSocketLoaded) {
      setStatus('ready');
      return undefined;
    } else {
      const timeout = setTimeout(() => {
        setStatus('error');
      }, 10000); // 10 segundos timeout

      return () => clearTimeout(timeout);
    }
  }, [isSocketLoaded]);

  if (status === 'ready') {
    return null; // No mostrar nada cuando esté listo
  }

  // Solo mostrar cuando esté optimizando o haya error
  const isOptimizing = status === 'optimizing';

  return (
    <div className="fixed bottom-4 right-4 bg-discord-secondary p-3 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isOptimizing ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-sm text-discord-text-secondary">
          {isOptimizing ? 'Optimizando conexión...' : 'Error de conexión'}
        </span>
      </div>
    </div>
  );
}; 