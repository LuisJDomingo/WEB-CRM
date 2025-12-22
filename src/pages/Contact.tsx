/**
 * Contact Page
 * 
 * Design: Minimalismo Contemporáneo Oscuro
 * Propósito: Formulario de contacto y información de contacto
 * Características:
 * - Formulario con validación
 * - Información de contacto
 * - Redes sociales
 * - GDPR compliance
 */

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { submitContact } from '../services/supabase';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'boda',
    eventDate: '',
    message: '',
    privacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (
      !formData.name ||
      !formData.email ||
      !formData.eventType ||
      !formData.privacy
    ) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Enviar a la API
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          eventType: formData.eventType,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }

      toast.success('¡Mensaje enviado! Nos pondremos en contacto pronto.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventType: 'boda',
        eventDate: '',
        message: '',
        privacy: false,
      });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    {
      icon: MapPin,
      label: 'Ubicación',
      value: 'Madrid, España',
      href: '#',
    },
  ];

  return (
    <>
      <div className="container pt-48 pb-24">
        {/* Header  de la seccion */}
        <div className="text-center mb-16">
          <h1 className="section-title mb-4">Contacto</h1>
          <p className="section-subtitle">
            Cuéntanos sobre tu evento y encontremos la solución perfecta para ti
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-50 pt-16 pb-24">
          {/* Información de Contacto */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Información de Contacto
            </h2>

            <div className="space-y-8">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <a
                    key={info.label}
                    href={info.href}
                    className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-sm bg-card border border-border flex items-center justify-center flex-shrink-0 hover:border-accent transition-colors">
                      <Icon size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-accent mb-1">
                        {info.label}
                      </p>
                      <p className="text-foreground hover:text-accent transition-colors">
                        {info.value}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Horario */}
            <div className="mt-12 pt-12 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Horario de Atención
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Lunes - Viernes: 10:00 - 19:00</p>
                <p>Sábado: 11:00 - 18:00</p>
                <p>Domingo: Cerrado</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email 
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  placeholder="tu@email.com"
                  //required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  placeholder="+34 XXX XXX XXX"
                  required
                />
              </div>

              {/* Tipo de Evento */}
              <div>
                <label
                  htmlFor="eventType"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Tipo de Evento *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                  required
                >
                  <option value="boda">Boda</option>
                  <option value="evento-corporativo">Evento Corporativo</option>
                  <option value="sesion-parejas">Sesión de Parejas</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Fecha del Evento */}
              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Fecha Estimada del Evento
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Mensaje */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Cuéntanos más sobre tu evento
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Comparte detalles sobre tu evento, ubicación, estilo, etc."
                />
              </div>

              {/* Privacidad */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <label
                  htmlFor="privacy"
                  className="text-sm text-muted-foreground"
                >
                  Acepto la{' '}
                  <a href="/privacidad" className="text-accent hover:underline">
                    política de privacidad
                  </a>{' '}
                  y el tratamiento de mis datos personales *
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="cta-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Nos pondremos en contacto dentro de 24 horas
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}