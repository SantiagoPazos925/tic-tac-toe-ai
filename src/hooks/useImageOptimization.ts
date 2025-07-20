import { useCallback, useEffect, useState } from 'react';

interface ImageOptimizationOptions {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  lazy?: boolean;
  placeholder?: string;
}

interface OptimizedImage {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  loading: 'lazy' | 'eager';
  placeholder?: string | undefined;
}

export const useImageOptimization = (options: ImageOptimizationOptions): OptimizedImage => {
  const {
    src,
    alt,
    width,
    quality = 80,
    format = 'auto',
    lazy = true,
    placeholder
  } = options;

  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [srcSet, setSrcSet] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Detectar soporte de formatos modernos
  const detectFormatSupport = useCallback(() => {
    if (typeof window === 'undefined') return 'webp';

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    // Probar AVIF
    try {
      canvas.toDataURL('image/avif');
      return 'avif';
    } catch {
      // Probar WebP
      try {
        canvas.toDataURL('image/webp');
        return 'webp';
      } catch {
        return 'jpeg';
      }
    }
  }, []);

  // Generar srcSet optimizado
  const generateSrcSet = useCallback((originalSrc: string, format: string) => {
    const supportedFormat = detectFormatSupport();
    const finalFormat = format === 'auto' ? supportedFormat : format;
    
    const sizes = [320, 640, 960, 1280, 1920];
    const srcSetParts = sizes.map(size => {
      const optimizedSrc = `${originalSrc}?w=${size}&q=${quality}&fmt=${finalFormat}`;
      return `${optimizedSrc} ${size}w`;
    });

    return srcSetParts.join(', ');
  }, [quality, detectFormatSupport]);

  // Generar sizes attribute
  const generateSizes = useCallback((imgWidth?: number) => {
    if (!imgWidth) return '100vw';
    
    if (imgWidth <= 320) return '320px';
    if (imgWidth <= 640) return '640px';
    if (imgWidth <= 960) return '960px';
    if (imgWidth <= 1280) return '1280px';
    return '1920px';
  }, []);

  // Optimizar imagen
  useEffect(() => {
    const optimizeImage = async () => {
      try {
        // Si es una imagen externa, usar un servicio de optimización
        if (src.startsWith('http')) {
          // Usar un servicio como Cloudinary, ImageKit, o similar
          const optimizedUrl = `https://res.cloudinary.com/demo/image/fetch/w_${width || 'auto'},q_${quality},f_auto/${src}`;
          setOptimizedSrc(optimizedUrl);
        } else {
          // Para imágenes locales, usar Vite's asset handling
          setOptimizedSrc(src);
        }

        const newSrcSet = generateSrcSet(src, format);
        setSrcSet(newSrcSet);
      } catch (error) {
        console.error('Error optimizing image:', error);
        setOptimizedSrc(src);
      }
    };

    optimizeImage();
  }, [src, width, quality, format, generateSrcSet]);

  // Lazy loading con Intersection Observer
  useEffect(() => {
    if (!lazy) {
      setIsLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    const imgElement = document.querySelector(`img[src="${src}"]`);
    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement);
      }
    };
  }, [src, lazy]);

  return {
    src: optimizedSrc,
    srcSet,
    sizes: generateSizes(width),
    alt,
    loading: lazy ? 'lazy' : 'eager',
    placeholder: placeholder || (isLoaded ? undefined : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+')
  };
};

// Hook para detectar soporte de formatos modernos
export const useImageFormatSupport = () => {
  const [supportedFormats, setSupportedFormats] = useState<{
    webp: boolean;
    avif: boolean;
  }>({ webp: false, avif: false });

  useEffect(() => {
    // Detectar soporte de WebP
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = () => {
      setSupportedFormats(prev => ({
        ...prev,
        webp: webpTest.width === 1
      }));
    };
    webpTest.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAADsAD+JaQAA3AAAAAA';

    // Detectar soporte de AVIF
    const avifTest = new Image();
    avifTest.onload = avifTest.onerror = () => {
      setSupportedFormats(prev => ({
        ...prev,
        avif: avifTest.width === 1
      }));
    };
    avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }, []);

  return supportedFormats;
};

// Hook para precarga de imágenes
export const useImagePreload = (srcs: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      const promises = srcs.map(src => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(src);
          img.src = src;
        });
      });

      try {
        const loadedSrcs = await Promise.all(promises);
        setLoadedImages(new Set(loadedSrcs));
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    preloadImages();
  }, [srcs]);

  return loadedImages;
};

// Hook para optimización de imágenes en background
export const useBackgroundImageOptimization = () => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handleIdle = () => {
        setIsIdle(true);
        // Aquí se pueden optimizar imágenes en background
      };

      requestIdleCallback(handleIdle);
    } else {
      // Fallback para navegadores que no soportan requestIdleCallback
      setTimeout(() => setIsIdle(true), 1000);
    }
  }, []);

  return isIdle;
}; 