/**
 * Navigation Component
 * 
 * Design: Minimalismo Contemporáneo Oscuro
 * Propósito: Navegación limpia y elegante
 * Características:
 * - Menú sticky que desaparece en scroll
 * - Logo minimalista
 * - Links internos con Wouter
 * - Responsive mobile menu
 * - Accesibilidad completa
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar/ocultar nav según dirección del scroll
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/portfolio', label: 'Portafolio' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/servicios', label: 'Servicios' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 bg-background border-b border-border transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      role="navigation"
      aria-label="Navegación principal">
      <div className="container flex items-center justify-between h-32 px-4 md:px-6 lg:px-8">
        {/* Left side: Desktop links or Mobile Logo */}
        <div className="flex-1 flex justify-start">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-accent transition-colors duration-300 text-lg font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/" className="md:hidden" aria-label="Ir a la página de inicio">
            <img
              src="/images/Narrativa_de_bodas-removebg-preview.png"
              alt="Logo de Narrativa de Bodas"
              className="h-28 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Logo (Desktop Center) */}
        <div className="hidden md:block">
          <Link href="/" aria-label="Ir a la página de inicio">
            <img
              src="/images/Narrativa_de_bodas-removebg-preview.png"
              alt="Logo de Narrativa de Bodas"
              className="h-28 w-auto object-contain transition-opacity hover:opacity-80"
            />
          </Link>
        </div>

        {/* Right side: Desktop links or Mobile button */}
        <div className="flex-1 flex justify-end items-center">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.slice(2, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-accent transition-colors duration-300 text-lg font-medium"
            >
              {link.label}
            </Link>
          ))}
            <Link href="/contacto" className="cta-button text-sm ml-2">
              Presupuesto
            </Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-card rounded-sm transition-colors" aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={isOpen}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-accent transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setIsOpen(false)}
              className="cta-button-primary text-center text-sm"
            >
              Presupuesto
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
