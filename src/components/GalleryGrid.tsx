/**
 * GalleryGrid Component
 * 
 * Design: Minimalismo Contemporáneo Oscuro
 * Propósito: Mostrar imágenes en layout asimétrico (masonry)
 * Características:
 * - Lazy loading para optimizar velocidad
 * - Hover effects sutiles (zoom 1.02x + overlay)
 * - Responsive grid que se adapta a mobile
 * - Accesibilidad: alt text y aria labels
 */

import { useState } from 'react';
import { X } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  columns?: number;
}

export function GalleryGrid({ images, columns = 3 }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns] || 'md:grid-cols-3';

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 md:gap-6 ${gridColsClass}`}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className="gallery-image cursor-pointer"
            onClick={() => setSelectedImage(image)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedImage(image);
              }
            }}
            aria-label={`Ver imagen: ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="w-full h-full object-cover"
              decoding="async"
            />
            <div className="gallery-overlay">
              <div className="text-center">
                <p className="text-white text-sm font-medium">Ver detalles</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-accent transition-colors"
              aria-label="Cerrar"
            >
              <X size={32} />
            </button>

            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto object-contain"
            />

            {(selectedImage.title || selectedImage.description) && (
              <div className="bg-card border-t border-border p-6 mt-4">
                {selectedImage.title && (
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="text-muted-foreground">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
