/**
 * Footer Component
 * 
 * Design: Minimalismo Contemporáneo Oscuro
 * Propósito: Información de contacto, redes sociales y links legales
 * Características:
 * - Diseño minimalista con acentos dorados
 * - Links a redes sociales
 * - Información de contacto
 * - Links legales (privacidad, términos)
 * - Schema.org markup para SEO
 */

import { Link } from 'wouter';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Instagram,
      href: 'https://instagram.com',
      label: 'Instagram',
      ariaLabel: 'Síguenos en Instagram',
    },  
    {
      icon: Facebook,
      href: 'https://facebook.com',
      label: 'Facebook',
      ariaLabel: 'Síguenos en Facebook',
    },
    {
      icon: FaTiktok,
      href: 'https://tiktok.com',
      label: 'TikTok',
      ariaLabel: 'Síguenos en TikTok',
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'contacto@narrativabodas.com',
      href: 'mailto:contacto@narrativabodas.com',
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: '+34 XXX XXX XXX',
      href: 'tel:+34XXXXXXXXX',
    },
  ];

  const legalLinks = [
    { href: '/privacidad', label: 'Política de Privacidad' },
    { href: '/terminos', label: 'Términos de Servicio' },
    { href: '/cookies', label: 'Política de Cookies' },
  ];

  return (
    <footer
      className={`bg-card border-t border-border ${className ?? 'mt-24 md:mt-32'}`}
      role="contentinfo"
    >
      <div className="container py-16 md:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12 pb-12 border-b border-border">
          {/* Brand Section */}
          <div>
            <Link href="/" aria-label="Ir a la página de inicio">
              <img
                src="/images/Narrativa_de_bodas-removebg-preview.png"
                alt="Logo de Narrativa de Bodas"
                className="h-24 w-auto object-contain mb-4 transition-opacity hover:opacity-80"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Capturamos tus momentos especiales con autenticidad y profesion y oficio.
              Fotografía y video de lujo para parejas que valoran la calidad.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-accent mb-6">Contacto</h4>
            <div className="space-y-4">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-3 text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Icon size={18} className="mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.label} 
                      </p>
                      <p className="text-sm hover:text-accent">
                        {item.value}
                      </p>
                    </div>
                  </a>
                );
              })}
              </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold text-accent mb-6">Síguenos</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 
                                bg-card 
                                rounded-sm 
                                border border-border 
                                hover:border-accent 
                                hover:bg-accent/10 
                                flex items-center
                                justify-center 
                                text-muted-foreground 
                                hover:text-accent 
                                transition-all 
                                duration-300"
                    aria-label={social.ariaLabel}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center md:text-right">
            © {currentYear} Desarrollado por Studio Martin. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Schema.org LocalBusiness Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'narrativabodas de Bodas y Eventos',
            image: 'https://example.com/logo.png',
            description:
              'Fotografía y videografía profesional para bodas y eventos',
            telephone: '+34XXXXXXXXX',
            email: 'contacto@narrativabodas.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Calle Principal 123',
              addressLocality: 'Madrid',
              postalCode: '28001',
              addressCountry: 'ES',
            },
            areaServed: 'ES',
            priceRange: '€€€',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '25',
            },
          }),
        }}
      />
    </footer>
  );
}
