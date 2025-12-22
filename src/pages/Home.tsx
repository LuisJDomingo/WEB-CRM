import { Link } from "wouter";
import { Camera, Video, Sparkles } from 'lucide-react';


export default function Home() {
  const featuredImages = [
    {
      id: '1',
      src: '/images/hero-wedding-moment.jpg',
      alt: 'Fotografía de boda íntima: pareja compartiendo un momento especial',
      title: 'Boda María & Juan',
      description: 'Captura profesional de un instante único durante la ceremonia de boda',
    },
    {
      id: '2',
      src: '/images/couple-portrait-elegant.jpg',
      alt: 'Retrato elegante de pareja en sesión fotográfica de boda',
      title: 'Sesión de Parejas',
      description: 'Retrato profesional de parejas para bodas, con estilo natural y sofisticado',
    },
    {
      id: '3',
      src: '/images/wedding-details-luxury.jpg',
      alt: 'Detalles de boda de lujo para fotografía profesional',
      title: 'Detalles Premium',
      description: 'Fotografía macro de elementos de boda cuidadosamente seleccionados',
    },
    {
      id: '4',
      src: '/images/event-celebration.jpg',
      alt: 'Celebración de boda con momentos auténticos y felices',
      title: 'Momento de Celebración',
      description: 'Captura de alegría y emociones genuinas durante la recepción de boda',
    },
    {
      id: '5',
      src: '/images/videography-cinematic.jpg',
      alt: 'Videografía cinematográfica profesional para bodas',
      title: 'Producción Cinematográfica',
      description: 'Video de boda con color grading profesional y edición cinematográfica',
    },
  ];

  const services = [
    {
      icon: Camera,
      title: 'Fotografía de Bodas con Estilo Documentalista',
      description: 'Capturamos momentos auténticos y naturales, documentando tu boda con elegancia y discreción.',
      features: ['Cobertura de 8 horas', 'Más de 500 fotos profesionales', 'Galería online segura'],
    },
    {
      icon: Video,
      title: 'Videos de Bodas con estilo Cinematográfica',
      description: 'Videos de boda con edición de lujo, música licenciada y color grading profesional.',
      features: ['Teaser emocional', 'Video completo del evento', 'Entrega en Alta Definición'],
    },
    {
      icon: Sparkles,
      title: 'Paquetes Combinados de Foto + Video',
      description: 'Combina nuestros servicios de fotografía y video.',
      features: ['Fotografía + Video', 'Descuento especial 20%', 'Coordinación integral del servicio'],
    },
  ];

  const testimonials = [
    {
      name: 'María García',
      event: 'Boda 2024',
      text: 'Trabajar con ellos fue maravilloso. Las fotos son elegantes, auténticas y llenas de emoción.',
      rating: 5,
    },
    {
      name: 'Carlos López',
      event: 'Boda 2024',
      text: 'Profesionales excepcionales. Superaron todas nuestras expectativas con su trabajo.',
      rating: 5,
    },
    {
      name: 'Ana Martínez',
      event: 'Evento 2024',
      text: 'Equipo altamente profesional y creativo. La calidad es impresionante.',
      rating: 5,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-32">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/novio-poniendo-el-anillo-en-el-dedo-de-la-novia.jpg)' }}>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center max-w-3xl text-white px-4">
          <h1 className="text-5xl md:text-6xl mb-6 leading-tight text-primary font-carnival tracking-tight">
            Narrativa de Bodas
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-8 font-light">
            Capturamos cada emoción, cada detalle y cada sonrisa. Nuestro estilo documentalista combina elegancia y naturalidad de de boda para crear recuerdos que durarán toda la vida.
          </p>

          <div className="flex flex-row gap-4 justify-center flex-wrap">
            <Link href="/portfolio" className="cta-button-primary">
              Ver Portfolio de Bodas
            </Link>
            <Link href="/contacto" className="cta-button">
              Presupuesto Personalizado
            </Link>
          </div>
        </div>
      </section>

      {/* Propuesta de Valor */}
      <section className="container py-20 md:py-28">
        <h2 className="section-title text-center mb-16">
          ¿Por qué nosotros?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: 'Fotografía de boda, documental',
              description: 'Momentos reales y espontáneos, sin poses forzadas, para capturar la verdadera esencia de tu boda.',
              icon: '01',
            },
            {
              title: 'Equipo Profesional y Creativo',
              description: 'Fotógrafos y videógrafos con experiencia en bodas y todo tipo de eventos, comprometidos con la excelencia.',
              icon: '02',
            },
            {
              title: 'Entrega Personalizada',
              description: 'Galería online, múltiples formatos y edición profesional para revivir cada instante de tu día especial.',
              icon: '03',
            },
          ].map((item) => (
            <div key={item.icon} className="text-center">
              <div className="number-marker mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Equipo */}
      <section className="bg-card/50 py-20 md:py-28">
        <div className="container flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img
              src="public/images/fotoluis.jpg"
              alt="Equipo de fotógrafos y videógrafos profesionales para bodas" 
              className="rounded-sm shadow-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="section-title text-center mb-16">
              Cristina y Luis   
            </h2>
                     
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Somos fotógrafos y videógrafos especializados en bodas y todo tipo de eventos auténticos. 
              Nos apasiona capturar la esencia de cada pareja con estilo documentalista elegante y natural.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nuestro enfoque combina discreción, creatividad y atención al detalle, garantizando recuerdos visuales que podrás revivir una y otra vez. 
              Cada boda es única, y nuestro compromiso es reflejar esa autenticidad en cada imagen y video.
            </p>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="bg-card/50 py-20 md:py-28">
        <div className="container">
          <h2 className="section-title text-center mb-16">
            Nuestros Servicios de Fotografía y Video
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="bg-card border border-border rounded-sm p-8 transition-all duration-300 hover:border-accent"
                >
                  <Icon size={40} className="text-accent mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="mb-6 space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="text-sm text-muted-foreground">
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/contacto" className="text-accent text-sm font-bold hover:underline">
                    Más información →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="container py-20 md:py-28">
        <h2 className="section-title text-center mb-16">
          Lo que nuestros clientes dicen sobre nosotros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-card border border-border rounded-sm p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-accent">★</span>
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              <div className="border-t border-border pt-4">
                <p className="font-bold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-card/50 py-20 md:py-28 text-center">
        <div className="container">
          <h2 className="section-title mb-4">¿Nos conocemos?</h2>
          <p className="section-subtitle mb-8 max-w-2xl mx-auto">
            Agenda una consulta gratuita y hablemos de cómo podemos contar la historia de tu día de la manera más memorable.
          </p>
          <Link href="/contacto" className="cta-button-primary">
            Agendar Consulta Gratuita
          </Link>
        </div>
      </section>
    </>
  );
}
