import { useCallback, useEffect, useState } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  blur?: number;
}

interface UseImageOptimizationReturn {
  optimizedSrc: string;
  isLoading: boolean;
  hasError: boolean;
  loadImage: () => void;
  preloadImage: () => void;
}

export const useImageOptimization = (
  originalSrc: string,
  options: ImageOptimizationOptions = {}
): UseImageOptimizationReturn => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const {
    quality = 80,
    format = 'webp',
    width,
    height,
    blur = 0
  } = options;

  // Función para generar URL optimizada
  const generateOptimizedUrl = useCallback((src: string): string => {
    // Si es un SVG o data URL, no optimizar
    if (src.endsWith('.svg') || src.startsWith('data:')) {
      return src;
    }

    // Para imágenes externas, usar un servicio de optimización
    if (src.startsWith('http')) {
      // Aquí podrías integrar con servicios como Cloudinary, ImageKit, etc.
      return src;
    }

    // Para imágenes locales, generar URL con parámetros
    const url = new URL(src, window.location.origin);
    url.searchParams.set('format', format);
    url.searchParams.set('quality', quality.toString());
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (blur > 0) url.searchParams.set('blur', blur.toString());

    return url.toString();
  }, [format, quality, width, height, blur]);

  // Función para cargar imagen
  const loadImage = useCallback(() => {
    if (!originalSrc) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    const optimizedUrl = generateOptimizedUrl(originalSrc);

    img.onload = () => {
      setOptimizedSrc(optimizedUrl);
      setIsLoading(false);
    };

    img.onerror = () => {
      // Fallback al original si la optimización falla
      setOptimizedSrc(originalSrc);
      setIsLoading(false);
      setHasError(true);
    };

    img.src = optimizedUrl;
  }, [originalSrc, generateOptimizedUrl]);

  // Función para precargar imagen
  const preloadImage = useCallback(() => {
    if (!originalSrc) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = generateOptimizedUrl(originalSrc);
    document.head.appendChild(link);

    // Limpiar después de un tiempo
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 5000);
  }, [originalSrc, generateOptimizedUrl]);

  // Cargar imagen automáticamente
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  return {
    optimizedSrc,
    isLoading,
    hasError,
    loadImage,
    preloadImage
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