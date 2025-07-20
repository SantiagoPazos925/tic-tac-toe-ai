import { useMemo } from 'react';

interface CriticalResources {
  criticalResources: string[];
  preloadImages: string[];
  preloadFonts: string[];
  preloadScripts: string[];
}

export const useCriticalResources = (): CriticalResources => {
  return useMemo(() => {
    // Recursos críticos que se cargan inmediatamente
    const criticalResources = [
      // API endpoints críticos
      '/api/auth/status',
      '/api/users/me',
      
      // Configuraciones críticas
      '/config/app.json',
      
      // WebSocket endpoint
      '/socket.io/',
    ];

    // Imágenes críticas que se muestran en el fold
    const preloadImages = [
      // Iconos y logos críticos
      '/icon.svg',
      '/logo.svg',
      
      // Imágenes de fondo críticas
      '/images/background.jpg',
      
      // Avatares por defecto
      '/images/default-avatar.png',
    ];

    // Fuentes críticas
    const preloadFonts = [
      // Fuentes del sistema que usamos
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    ];

    // Scripts críticos externos
    const preloadScripts = [
      // React desde ESM
      'https://esm.sh/react@^19.1.0',
      'https://esm.sh/react-dom@^19.1.0',
      
      // Socket.IO client
      'https://cdn.socket.io/4.7.2/socket.io.min.js',
    ];

    return {
      criticalResources,
      preloadImages,
      preloadFonts,
      preloadScripts,
    };
  }, []);
}; 