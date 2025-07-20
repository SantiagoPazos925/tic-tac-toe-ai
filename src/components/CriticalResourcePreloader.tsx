import { useEffect } from 'react';

export const CriticalResourcePreloader: React.FC = () => {
  useEffect(() => {
    // Preloads críticos estáticos
    const criticalPreloads = [
      { href: '/icon.svg', as: 'image', type: 'image/svg+xml' },
      { href: '/src/index.tsx', as: 'script', type: 'module' },
    ];

    // DNS prefetch y preconnect para dominios externos
    const externalDomains = [
      'https://esm.sh',
      'https://cdn.socket.io',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    // Crear elementos de preload
    criticalPreloads.forEach(({ href, as, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Crear DNS prefetch y preconnect
    externalDomains.forEach(domain => {
      // DNS prefetch
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);

      // Preconnect
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = domain;
      preconnectLink.crossOrigin = 'anonymous';
      document.head.appendChild(preconnectLink);
    });

    // Cleanup function
    return () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  return null;
}; 