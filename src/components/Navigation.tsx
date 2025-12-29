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
import { Link, useRoute, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [matchHome] = useRoute('/');
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar/ocultar nav según dirección del scroll
      if (matchHome && currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, matchHome]);

  const isTransparent = matchHome && !isOpen;
  const textColorClass = isTransparent ? 'text-white' : 'text-black';

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/portfolio', label: 'Portafolio' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/servicios', label: 'Servicios' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <nav
      className={`${matchHome ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent ? 'bg-transparent border-b border-transparent' : 'bg-white border-b border-border'
      } ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      role="navigation"
      aria-label="Navegación principal">
      <div className="container flex items-center justify-between h-32 px-4 md:px-6 lg:px-8">
        {/* Logo (Left) */}
        <div className="flex-shrink-0">
          {!matchHome && (
            <Link href="/" aria-label="Ir a la página de inicio">
              <img
                src="/images/logo_navigation.png"
                alt="Logo de Narrativa de Bodas"
                className="h-28 w-auto object-contain transition-opacity hover:opacity-80"
              />
            </Link>
          )}
        </div>

        {/* Right side: Desktop links & Mobile button */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
                className={`${location === link.href ? 'text-accent' : textColorClass} hover:text-accent transition-colors duration-300 text-sm font-bold uppercase tracking-widest`}
            >
              {link.label}
            </Link>
          ))}
            <Link href="/contacto" className="cta-button text-sm font-bold uppercase tracking-widest ml-4 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-colors">
              Contacto
            </Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-sm transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-black hover:bg-gray-100'}`} aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={isOpen}>
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
                className={`${location === link.href ? 'text-accent' : 'text-foreground'} hover:text-accent transition-colors py-2 text-sm font-bold uppercase tracking-widest`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setIsOpen(false)}
              className="cta-button-primary text-center text-xs font-bold uppercase tracking-widest"
            >
              Presupuesto
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
