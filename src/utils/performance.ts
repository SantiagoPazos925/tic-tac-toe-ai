// Utilidades de rendimiento para optimización de PageSpeed

// Interfaz para métricas de rendimiento
interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// Declaración global para gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Declaraciones de tipos para Performance API
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

// Clase para monitoreo de rendimiento
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initObservers();
  }

  private initObservers() {
    // Observer para LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        this.metrics.lcp = lastEntry.startTime;
        this.logMetric('LCP', this.metrics.lcp);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observer para FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          this.logMetric('FID', this.metrics.fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observer para CLS
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as LayoutShift;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        this.metrics.cls = clsValue;
        this.logMetric('CLS', this.metrics.cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      this.observers = [lcpObserver, fidObserver, clsObserver];
    }
  }

  // Obtener FCP
  getFCP(): number {
    const fcpEntry = performance.getEntriesByType('paint').find(
      entry => entry.name === 'first-contentful-paint'
    );
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  // Obtener TTFB
  getTTFB(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : 0;
  }

  // Obtener todas las métricas
  getMetrics(): PerformanceMetrics {
    return {
      fcp: this.getFCP(),
      lcp: this.metrics.lcp || 0,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      ttfb: this.getTTFB()
    };
  }

  // Log de métricas
  private logMetric(name: string, value: number) {
    console.log(`📊 ${name}: ${value.toFixed(2)}ms`);
    
    // Enviar a analytics si está disponible
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value
      });
    }
  }

  // Cleanup
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
  }
}

// Función para optimizar imágenes
export const optimizeImages = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Lazy loading nativo
    if (!img.loading) {
      img.loading = 'lazy';
    }

    // Optimizar srcset si no existe
    if (!img.srcset && img.src) {
      const src = img.src;
      const sizes = [320, 640, 960, 1280];
      const srcSet = sizes.map(size => `${src}?w=${size} ${size}w`).join(', ');
      img.srcset = srcSet;
    }

    // Optimizar sizes
    if (!img.sizes) {
      img.sizes = '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 960px) 960px, 1280px';
    }
  });
};

// Función para precargar recursos críticos
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/src/styles/index.css',
    '/src/components/AuthForm.tsx',
    '/src/components/LobbyHeader.tsx'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });
};

// Función para optimizar fuentes
export const optimizeFonts = () => {
  // Precargar fuentes críticas
  const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
  fontLinks.forEach(link => {
    link.setAttribute('crossorigin', 'anonymous');
  });

  // Aplicar font-display: swap
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Whitney';
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

// Función para optimizar CSS crítico
export const optimizeCriticalCSS = () => {
  // Inline CSS crítico
  const criticalCSS = `
    body { margin: 0; padding: 0; background-color: #36393f; color: #ffffff; }
    #root { min-height: 100vh; display: flex; flex-direction: column; }
    .loading-spinner { display: flex; justify-content: center; align-items: center; height: 100vh; }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
};

// Función para optimizar JavaScript
export const optimizeJavaScript = () => {
  // Defer scripts no críticos
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
      script.setAttribute('defer', '');
    }
  });
};

// Función para optimizar recursos externos
export const optimizeExternalResources = () => {
  // DNS prefetch para dominios externos
  const externalDomains = [
    'https://esm.sh',
    'https://cdn.socket.io',
    'https://fonts.googleapis.com'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Función para monitorear errores de rendimiento
export const monitorPerformanceErrors = () => {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message.includes('performance')) {
      console.error('Performance error:', event.error);
      
      // Enviar a analytics
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'performance_error', {
          error_message: event.error.message,
          error_stack: event.error.stack
        });
      }
    }
  });
};

// Función para optimizar el Service Worker
export const optimizeServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registrado:', registration);
    }).catch(error => {
      console.error('Error registrando Service Worker:', error);
    });
  }
};

// Función principal de optimización
export const optimizePerformance = () => {
  // Aplicar optimizaciones cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      optimizeFonts();
      optimizeCriticalCSS();
      optimizeJavaScript();
      optimizeExternalResources();
      preloadCriticalResources();
    });
  } else {
    optimizeImages();
    optimizeFonts();
    optimizeCriticalCSS();
    optimizeJavaScript();
    optimizeExternalResources();
    preloadCriticalResources();
  }

  // Inicializar monitoreo
  const monitor = new PerformanceMonitor();
  monitorPerformanceErrors();
  optimizeServiceWorker();

  return monitor;
};

// Exportar instancia global del monitor
export const performanceMonitor = new PerformanceMonitor(); 