/**
 * Portfolio Page - Gallery with filterable portfolio of work
 */

import { useState } from 'react';
import { GalleryGrid } from '../components/GalleryGrid';

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('todas');

  const allImages = [
    {
      id: '1',
      src: 'images/una-joven-y-bella-novia-esta-de-pie-cerca-de-la-casa-con-su-marido.jpg',
      alt: 'Boda María & Juan',
      category: 'bodas',
      title: 'Boda María & Juan',
      description: 'Ceremonia en jardín, junio 2024',
    },
    {
      id: '2',
      src: 'images/beso-y-abrazo-su-mujer.jpg',
      alt: 'Sesión de parejas',
      category: 'sesiones',
      title: 'Sesión de Parejas',
      description: 'Retrato urbano, mayo 2024',
    },
    {
      id: '3',
      src: 'images/novio-poniendo-el-anillo-en-el-dedo-de-la-novia.jpg',
      alt: 'Detalles de boda',
      category: 'detalles',
      title: 'Detalles Premium',
      description: 'Anillos y accesorios, junio 2024',
    },
    {
      id: '4',
      src: 'images/una-joven-y-bella-novia-esta-de-pie-cerca-de-la-casa-con-su-marido.jpg',
      alt: 'Evento corporativo',
      category: 'eventos',
      title: 'Evento Corporativo',
      description: 'Cena de gala, abril 2024',
    },
    {
      id: '5',
      src: 'images/novio-poniendo-el-anillo-en-el-dedo-de-la-novia.jpg',
      alt: 'Videografía',
      category: 'bodas',
      title: 'Boda Cinematográfica',
      description: 'Video profesional, marzo 2024',
    },
  ];

  const filters = [
    { id: 'todas', label: 'Todas' },
    { id: 'bodas', label: 'Bodas' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'sesiones', label: 'Sesiones' },
    { id: 'detalles', label: 'Detalles' },
  ];

  const filteredImages =
    activeFilter === 'todas'
      ? allImages
      : allImages.filter((img) => img.category === activeFilter);

  return (
    <>
      <div className="container pt-48 pb-24">
        {/* Header de la sección */}
        <div className="text-center mb-16">
          <h1 className="section-title mb-4">Nuestro Portafolio</h1>
          <p className="section-subtitle">
            Galería de nuestros trabajos más destacados en fotografía y videografía
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2 rounded-sm text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border text-foreground hover:border-accent'
              }`}
              aria-pressed={activeFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Galería */}
        <GalleryGrid images={filteredImages} columns={3} />

        {/* Información adicional */}
        <div className="mt-20 pt-16 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="number-marker">50+</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Bodas Capturadas</h3>
              <p className="text-muted-foreground text-sm">Historias de amor documentadas con profesionalismo</p>
            </div>
            <div>
              <div className="number-marker">25+</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Eventos</h3>
              <p className="text-muted-foreground text-sm">Momentos profesionales capturados con excelencia</p>
            </div>
            <div>
              <div className="number-marker">4.5★</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Calificación</h3>
              <p className="text-muted-foreground text-sm">Satisfacción de nuestros clientes</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
