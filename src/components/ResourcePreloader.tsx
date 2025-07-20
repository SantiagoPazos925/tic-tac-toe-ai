import { useEffect } from 'react';

interface ResourcePreloaderProps {
  criticalResources?: string[];
  preloadImages?: string[];
  preloadFonts?: string[];
  preloadScripts?: string[];
}

export const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({
  criticalResources = [],
  preloadImages = [],
  preloadFonts = [],
  preloadScripts = []
}) => {
  useEffect(() => {
    // Función para crear elementos de preload
    const createPreloadElement = (href: string, as: string, type?: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      link.crossOrigin = 'anonymous';
      return link;
    };

    // Función para crear elementos de dns-prefetch
    const createDnsPrefetch = (domain: string) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      return link;
    };

    // Función para crear elementos de preconnect
    const createPreconnect = (domain: string) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      return link;
    };

    // Agregar preloads críticos
    criticalResources.forEach(resource => {
      const link = createPreloadElement(resource, 'fetch');
      document.head.appendChild(link);
    });

    // Agregar preloads de imágenes
    preloadImages.forEach(image => {
      const link = createPreloadElement(image, 'image');
      document.head.appendChild(link);
    });

    // Agregar preloads de fuentes
    preloadFonts.forEach(font => {
      const link = createPreloadElement(font, 'font', 'font/woff2');
      document.head.appendChild(link);
    });

    // Agregar preloads de scripts
    preloadScripts.forEach(script => {
      const link = createPreloadElement(script, 'script');
      document.head.appendChild(link);
    });

    // DNS prefetch para dominios externos
    const externalDomains = [
      'https://esm.sh',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ];

    externalDomains.forEach(domain => {
      const dnsLink = createDnsPrefetch(domain);
      const preconnectLink = createPreconnect(domain);
      document.head.appendChild(dnsLink);
      document.head.appendChild(preconnectLink);
    });

    // Cleanup function
    return () => {
      // Remover elementos de preload al desmontar
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [criticalResources, preloadImages, preloadFonts, preloadScripts]);

  return null; // Este componente no renderiza nada
}; 