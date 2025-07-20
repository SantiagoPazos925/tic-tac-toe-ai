import { lazy, Suspense, useEffect, useState } from 'react';

// Componente de carga diferida para Socket.io
const SocketOptimizer = lazy(() => import('./SocketOptimizer').then(module => ({ default: module.SocketOptimizer })));
const SocketStatusIndicator = lazy(() => import('./SocketOptimizer').then(module => ({ default: module.SocketStatusIndicator })));

interface LazySocketLoaderProps {
  children: React.ReactNode;
  showStatus?: boolean;
}

export const LazySocketLoader: React.FC<LazySocketLoaderProps> = ({ 
  children, 
  showStatus = false 
}) => {
  const [shouldLoadSocket, setShouldLoadSocket] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Cargar Socket.io solo cuando sea necesario
    const loadSocket = () => {
      // En móviles, cargar después de 2 segundos
      // En desktop, cargar después de 1 segundo
      const delay = isMobile ? 2000 : 1000;
      
      setTimeout(() => {
        setShouldLoadSocket(true);
      }, delay);
    };

    // Cargar inmediatamente si no es móvil y la conexión es rápida
    if (!isMobile && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType !== 'slow-2g' && connection.effectiveType !== '2g') {
        loadSocket();
      } else {
        // Para conexiones lentas, cargar después de 3 segundos
        setTimeout(() => setShouldLoadSocket(true), 3000);
      }
    } else {
      loadSocket();
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  return (
    <>
      {children}
      
      {shouldLoadSocket && (
        <Suspense fallback={null}>
          <SocketOptimizer>
            {showStatus && <SocketStatusIndicator />}
          </SocketOptimizer>
        </Suspense>
      )}
    </>
  );
};

// Hook para cargar Socket.io bajo demanda
export const useLazySocket = () => {
  const [socketLoaded, setSocketLoaded] = useState(false);

  const loadSocket = () => {
    if (!socketLoaded) {
      // Cargar Socket.io dinámicamente
      import('socket.io-client').then(() => {
        setSocketLoaded(true);
      });
    }
  };

  return { socketLoaded, loadSocket };
}; 