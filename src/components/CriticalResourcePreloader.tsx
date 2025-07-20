import { useEffect } from 'react';

interface CriticalResourcePreloaderProps {
  // Propiedades opcionales para configuración
  preloadImages?: string[];
  preloadFonts?: string[];
  preloadScripts?: string[];
}

export const CriticalResourcePreloader: React.FC<CriticalResourcePreloaderProps> = ({
  preloadImages = [],
  preloadFonts = [],
  preloadScripts = []
}) => {
  useEffect(() => {
    // Preload de recursos críticos con prioridad alta
    const preloadCriticalResources = () => {
      // Preload de imágenes críticas
      preloadImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      });

      // Preload de fuentes críticas
      preloadFonts.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.href = href;
        link.crossOrigin = 'anonymous';
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      });

      // Preload de scripts críticos
      preloadScripts.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      });
    };

    // Preload de recursos con prioridad media (lazy loading)
    const preloadMediumPriorityResources = () => {
      // Preload de componentes que se cargarán después
      const mediumPriorityResources = [
        '/src/components/UserContextMenu.tsx',
        '/src/components/VirtualizationDemo.tsx',
        '/src/components/ImageOptimizationDemo.tsx'
      ];

      mediumPriorityResources.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Preload de recursos con prioridad baja (cuando el navegador esté idle)
    const preloadLowPriorityResources = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const lowPriorityResources = [
            '/src/components/VirtualizedUsersList.tsx',
            '/src/components/EmojiPicker.tsx'
          ];

          lowPriorityResources.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = src;
            document.head.appendChild(link);
          });
        });
      }
    };

    // Ejecutar preloads en orden de prioridad
    preloadCriticalResources();
    
    // Preload de recursos medios después de un pequeño delay
    setTimeout(preloadMediumPriorityResources, 100);
    
    // Preload de recursos de baja prioridad cuando el navegador esté idle
    preloadLowPriorityResources();

    // Cleanup function
    return () => {
      // Limpiar preloads si es necesario
      const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]');
      preloadLinks.forEach(link => {
        if (link.getAttribute('data-preloader') === 'true') {
          link.remove();
        }
      });
    };
  }, [preloadImages, preloadFonts, preloadScripts]);

  // Este componente no renderiza nada visible
  return null;
}; 