import { Link } from 'wouter';
import { Check, ArrowRight } from 'lucide-react';

export default function Services() {
const services = [
  {
    id: 'fotografia',
    title: 'Fotografía documental para Bodas',
    description:
      'Nos especializamos en el fotoreportaje para contar tu historia de manera auténtica y elegante en tu boda. Cada mirada, risa y detalle especial será inmortalizado con creatividad y sensibilidad.',
    price: '€1,500',
    includes: [
      '8-12 horas de cobertura profesional',
      '1000+ fotos editadas cuidadosamente',
      'Galería online privada con descarga',
      'Edición profesional del reportaje',
      'Entrega del reportaje en formato papel y digital',
    ],
    process: [
      'Consulta inicial gratuita para conocer tu visión',
      'Reunión de planificación pre-boda',
      'Cobertura completa del día de la boda',
      'Edición profesional de fotos (2-3 semanas)',
      'Entrega de galería online privada',
    ],
  },
  {
    id: 'videografia',
    title: 'Grabación en video con calidad cinematográfica',
    description:
      'Creamos videos de boda con estilo cinematográfico, capturando la atmósfera, los momentos clave y la emoción de tu día. Cada video es editado profesionalmente con color grading y música cuidadosamente seleccionada.',
    price: '€800',
    includes: [
      'Teaser de 1 minuto para redes sociales',
      'Video completo 5-7 minutos de tu boda',
      'Cobertura de 8-10 horas',
      'Música con licencia',
      'Entrega en alta definición',
    ],
    process: [
      'Consulta y planificación inicial',
      'Reunión de estilo, música y narrativa',
      'Cobertura profesional del evento',
      'Edición y color grading (3-4 semanas)',
      'Revisiones y ajustes según tus preferencias',
      'Entrega final del video completo',
    ],
  },
];


  const packages = [
    {
      name: 'Paquete Foto + Video',
      description: 'La combinación perfecta para documentar tu día',
      price: '€1,840',
      savings: 'Ahorra 20%',
      includes: [
        'Fotografía completa (8-12 horas)',
        'Videografía cinematográfica',
        'Teaser + Video completo',
        '1000+ fotos editadas',
        'Edición profesional del reportaje',
        'Galería online privada',
        'Coordinación profesional',
        'Entrega del reportaje en formato papel y digital',
      ],
    },
    {
      name: 'Paquete Premium',
      description: 'Servicio integral de lujo con todo incluido',
      price: 'Consultar',
      savings: 'Personalizado',
      includes: [
        'Foto + Video + Dron',
        'Álbum de lujo',
        'Sesión pre-boda',
        'Fotógrafo adicional',
        'Videógrafo adicional',
        'Entrega acelerada',
      ],
    },
  ];

  const processSteps = [
    {
      number: '01',
      title: 'Consulta Inicial',
      description:
        'Nos reunimos para conocer tu visión, estilo y necesidades. Respondemos todas tus preguntas.',
    },
    {
      number: '02',
      title: 'Planificación',
      description:
        'Creamos un plan detallado del día, ubicaciones clave y momentos que no queremos perder.',
    },
    {
      number: '03',
      title: 'Cobertura del Evento',
      description:
        'Nuestro equipo profesional captura cada momento con discreción y profesionalismo.',
    },
    {
      number: '04',
      title: 'Edición Profesional',
      description:
        'Seleccionamos, editamos y perfeccionamos cada imagen y video con cuidado extremo.',
    },
    {
      number: '05',
      title: 'Entrega',
      description:
        'Recibes tu galería online privada, descargas y materiales finales en múltiples formatos.',
    },
  ];

  return (
    <>
      <div className="container pt-48 pb-24">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="section-title mb-4">
            Fotografía y Video de Bodas
          </h1>
          <p className="section-subtitle">
            Momentos auténticos, emociones reales y recuerdos eternos. Descubre nuestros paquetes de fotografía de bodas estilo fotoperiodístico y videografía cinematográfica, diseñados para narrar tu día con elegancia y cercanía.
          </p>
        </div>
        <div className="text-center mb-20">
         
        </div>
        {/* Servicios Principales */}
        {services.map((service) => (
          <section key={service.id} className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Contenido */}
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  {service.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {service.description}
                </p>

                <div className="mb-8">
                  <p className="text-3xl font-bold text-accent mb-4">
                    {service.price}
                  </p>

                  <h3 className="text-sm font-semibold text-accent mb-4">
                    QUÉ INCLUYE
                  </h3>
                  <ul className="space-y-3">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check size={20} className="text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/contacto" className="cta-button-primary">
                  Reserva tu Fecha
                </Link>
              </div>

              {/* Proceso */}
              <div className="bg-card border border-border rounded-sm p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">
                  Nuestro Proceso
                </h3>
                <div className="space-y-6">
                  {service.process.map((step, index) => (
                    <div key={step} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="section-divider" />
          </section>
        ))}

        {/* Paquetes */}
        <section className="mb-24">
          <h2 className="section-title text-center mb-16">Paquetes de Fotografía y Videografía Combinados</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className="bg-card border border-border rounded-sm p-8 hover:border-accent transition-colors"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {pkg.description}
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-3xl font-bold text-accent">{pkg.price}</p>
                    <span className="text-sm text-accent font-medium">
                      {pkg.savings}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check size={18} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/contacto" className="cta-button w-full text-center">
                  Reserva tu Fecha
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Proceso de Trabajo */}
        <section className="mb-24">
          <h2 className="section-title text-center mb-16">Proceso de Trabajo</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {processSteps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="number-marker text-center">{step.number}</div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-card border border-border rounded-sm p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Tienes preguntas?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contáctanos para una consulta gratuita. Estaremos encantados de hablar
            sobre tu proyecto y encontrar la solución perfecta.
          </p>

          <Link href="/contacto" className="cta-button-primary inline-flex items-center gap-2">
            Agendar Consulta
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </>
  );
}
