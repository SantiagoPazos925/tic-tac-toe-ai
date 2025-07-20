import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useImageFormatSupport } from '../hooks/useImageOptimization';
import { OptimizedImage } from './OptimizedImage';

interface ImageOptimizationDemoProps {
  images?: Array<{
    src: string;
    alt: string;
    originalSize?: string;
    optimizedSize?: string;
  }>;
}

const defaultImages = [
  {
    src: 'https://picsum.photos/800/600?random=1',
    alt: 'Imagen de ejemplo 1',
    originalSize: '2.3MB',
    optimizedSize: '450KB'
  },
  {
    src: 'https://picsum.photos/800/600?random=2',
    alt: 'Imagen de ejemplo 2',
    originalSize: '1.8MB',
    optimizedSize: '320KB'
  },
  {
    src: 'https://picsum.photos/800/600?random=3',
    alt: 'Imagen de ejemplo 3',
    originalSize: '3.1MB',
    optimizedSize: '580KB'
  }
];

export const ImageOptimizationDemo: React.FC<ImageOptimizationDemoProps> = ({
  images = defaultImages
}) => {
  const [showOptimized, setShowOptimized] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { webp, avif } = useImageFormatSupport();

  // Asegurar que siempre tengamos una imagen válida
  const currentImage = images[selectedImage] || defaultImages[0];
  
  // Verificación adicional para TypeScript
  if (!currentImage) {
    return <div>Error: No se encontró imagen</div>;
  }

  return (
    <div className="image-optimization-demo">
      <motion.div
        className="demo-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3>🖼️ Demo de Optimización de Imágenes</h3>
        
        <div className="format-support">
          <span className={`format-badge ${webp ? 'supported' : 'not-supported'}`}>
            WebP: {webp ? '✅ Soportado' : '❌ No soportado'}
          </span>
          <span className={`format-badge ${avif ? 'supported' : 'not-supported'}`}>
            AVIF: {avif ? '✅ Soportado' : '❌ No soportado'}
          </span>
        </div>

        <div className="demo-controls">
          <button
            className={`control-btn ${showOptimized ? 'active' : ''}`}
            onClick={() => setShowOptimized(true)}
          >
            🚀 Optimizada
          </button>
          <button
            className={`control-btn ${!showOptimized ? 'active' : ''}`}
            onClick={() => setShowOptimized(false)}
          >
            📷 Original
          </button>
        </div>
      </motion.div>

      <div className="image-comparison">
        <div className="image-container">
          <h4>{showOptimized ? 'Imagen Optimizada' : 'Imagen Original'}</h4>
          
          {showOptimized ? (
            <OptimizedImage
              src={currentImage.src}
              alt={currentImage.alt}
              width={400}
              height={300}
              className="demo-image"
              priority={true}
            />
          ) : (
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              width={400}
              height={300}
              className="demo-image"
              loading="lazy"
            />
          )}

          <div className="image-stats">
            <p><strong>Tamaño:</strong> {showOptimized ? currentImage.optimizedSize : currentImage.originalSize}</p>
            <p><strong>Reducción:</strong> {showOptimized ? '~80%' : '0%'}</p>
            <p><strong>Formato:</strong> {showOptimized ? 'WebP/AVIF' : 'JPEG/PNG'}</p>
          </div>
        </div>

        <div className="image-gallery">
          <h4>Galería de Imágenes</h4>
          <div className="gallery-grid">
            {images.map((image, index) => (
              <motion.div
                key={index}
                className={`gallery-item ${selectedImage === index ? 'selected' : ''}`}
                onClick={() => setSelectedImage(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <OptimizedImage
                  src={image.src}
                  alt={image.alt}
                  width={150}
                  height={100}
                  className="gallery-thumbnail"
                  priority={index < 3}
                />
                <div className="thumbnail-info">
                  <span>Imagen {index + 1}</span>
                  <small>{image.optimizedSize}</small>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="optimization-benefits">
        <h4>🎯 Beneficios de la Optimización</h4>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <h5>Carga Más Rápida</h5>
            <p>Reducción del 60-80% en el tamaño de archivo</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📱</span>
            <h5>Mejor UX</h5>
            <p>Lazy loading y formatos modernos</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🌐</span>
            <h5>Menos Ancho de Banda</h5>
            <p>Ideal para conexiones lentas</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔧</span>
            <h5>Fallback Automático</h5>
            <p>Compatibilidad con navegadores antiguos</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 