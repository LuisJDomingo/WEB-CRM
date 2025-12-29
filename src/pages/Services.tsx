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
      title: 'Conexión y Consulta',
      description:
        'Todo comienza con una conversación honesta. Queremos escuchar vuestra historia, entender qué es lo que más valoráis y asegurar que somos el equipo perfecto para vosotros. No es solo una reunión administrativa, es el inicio de una relación de confianza donde resolvemos dudas y conectamos visiones.',
      image: 'public\\images\\reunion.jpg',
      alt: 'Pareja conversando en sesión preboda'
    },
    {
      number: '02',
      title: 'Planificación a Medida',
      description:
        'Diseñamos juntos el cronograma fotográfico para que el día fluya sin estrés. Os asesoramos sobre la mejor luz para la ceremonia, los tiempos para los retratos y visitamos las localizaciones si es necesario. Preparamos cada detalle técnico para que vosotros solo os preocupéis de disfrutar.',
      image: 'public\\images\\beso-y-abrazo-su-mujer.jpg',
      alt: 'Detalles de planificación de boda'
    },
    {
      number: '03',
      title: 'El Gran Día: Cobertura Documental',
      description:
        'Estaremos allí, discretos pero atentos, capturando desde los nervios previos hasta la euforia de la fiesta. Nuestro enfoque documental busca la naturalidad, sin interrupciones ni posados forzados interminables. Seremos testigos silenciosos de vuestras emociones más auténticas.',
      image: 'public/images/hero-wedding-moment.jpg',
      alt: 'Fotógrafo capturando momento de boda'
    },
    {
      number: '04',
      title: 'Edición Artesanal y Narrativa',
      description:
        'La magia continúa en el estudio. Seleccionamos y editamos vuestras fotos una a una, aplicando nuestro estilo de color característico y construyendo una narrativa visual coherente. No usamos filtros automáticos; cada imagen recibe el tratamiento que merece para transmitir la emoción del momento.',
      image: 'public/images/novio-poniendo-el-anillo-en-el-dedo-de-la-novia.jpg',
      alt: 'Edición de fotos de boda'
    },
    {
      number: '05',
      title: 'Entrega del Legado',
      description:
        'El momento final. Recibiréis vuestra galería privada online para compartir con familia y amigos al instante. Además, si habéis elegido álbum, maquetaremos vuestra historia en un libro de calidad museo, impreso en papeles fine-art que perdurarán por generaciones como vuestro patrimonio visual.',
      image: 'public/images/event-celebration.jpg',
      alt: 'Entrega de álbum de boda'
    },
  ];

  return (
    <>
      {/* Hero Section con Imagen de Fondo */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/una-joven-y-bella-novia-esta-de-pie-cerca-de-la-casa-con-su-marido.jpg" 
            alt="Novios en su boda" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        
      </section>
      
      <div className="container py-24">
        <div className="container relative z-10 max-w-3xl mx-auto text-center text-white mb-24">
          <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-6 block drop-shadow-md">
            Capturando Recuerdos
          </span>
          <div className="text-center mb-16">
          <h1 className="section-title mb-4">La experiencia</h1>
          <p className="section-subtitle">
            Nuestro proceso de trabajo
          </p>
        </div>
          
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            No vendemos solo fotos, creamos un legado visual. Nuestra propuesta se basa en la honestidad, 
            la elegancia y la narrativa documental. Queremos que revivas tu boda tal y como fue, con toda su emoción y belleza natural.
          </p>
          
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Nuestro proceso está diseñado para brindaros tranquilidad y resultados excepcionales. 
            Desde el primer café hasta la entrega del álbum, os acompañamos en cada paso.
          </p>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            A continuación os detallamos cómo trabajamos y qué podéis esperar de nosotros.
          </p>
        
        </div>
        {/* La Experiencia (Proceso) - Moved to top */}
        <section className="mb-24">
            <div className="space-y-24">
                {processSteps.map((step, index) => (
                    <div key={step.number} className={`flex flex-col md:flex-row gap-12 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                        <div className="w-full md:w-1/2 relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 -z-10 rounded-full blur-2xl"></div>
                             <img 
                                src={step.image} 
                                alt={step.alt}
                                className="w-full h-[400px] object-cover rounded-sm shadow-xl"
                             />
                        </div>
                        <div className="w-full md:w-1/2">
                            <div className="md:hidden text-4xl font-serif font-bold text-accent opacity-50 mb-4">
                                {step.number}
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-foreground mb-6">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <div className="text-center mb-24">
            <Link href="/contacto" className="inline-flex items-center justify-center px-12 py-5 bg-accent text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:bg-black hover:scale-105 hover:shadow-2xl shadow-lg group">
                <span>¡Nos vemos!</span>
            </Link>
        </div>

        {/* FAQ / Dudas */}
        <section className="container mx-auto mb-24">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Preguntas Frecuentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Os desplazáis fuera?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">¡Por supuesto! Nos encanta viajar. El desplazamiento está incluido en los primeros 100km. Para bodas de destino, consultadnos y os prepararemos un presupuesto a medida.</p>
                </div>
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Cómo reservamos?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">Firmamos un contrato digital y se abona una señal del 30%. El resto se abona la semana de la boda. Todo el proceso es online y sencillo.</p>
                </div>
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Entregáis RAWs?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">No entregamos archivos RAW. Entregamos una selección curada y editada (mínimo 800 fotos) que representa nuestro trabajo final terminado.</p>
                </div>
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Plazos de entrega?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">Entregamos un adelanto (teaser) la semana siguiente a la boda. La galería completa suele estar lista entre 4 y 8 semanas después del evento.</p>
                </div>
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Segundo fotógrafo?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">Sí, en bodas de más de 100 invitados o con logística compleja recomendamos siempre un segundo profesional para no perder ningún detalle.</p>
                </div>
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Hacéis álbumes?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">Sí, trabajamos con laboratorios artesanales. Diseñamos álbumes de lino y materiales nobles que perduran generaciones.</p>
                </div>
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Y si llueve?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">¡Nos adaptamos! La lluvia puede crear atmósferas mágicas. Tenemos equipo sellado y experiencia para sacar partido a cualquier clima.</p>
                </div>
                <div className="pb-4">
                    <h3 className="font-bold text-lg mb-3 text-foreground">¿Equipo de repuesto?</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">Siempre llevamos cámaras, objetivos, tarjetas y baterías de respaldo por duplicado. La seguridad de vuestros recuerdos es nuestra prioridad absoluta.</p>
                </div>
            </div>
        </section>
        
        <div className="text-center mb-24">
            <Link href="/contacto" className="inline-flex items-center justify-center px-12 py-5 bg-accent text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:bg-black hover:scale-105 hover:shadow-2xl shadow-lg group">
                <span>¡Nos vemos!</span>
            </Link>
        </div>

        
        {/* Grid de Servicios Principales (Estilo Tarjetas Limpias) */}
        {false && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {/* Tarjeta: Fotografía */}
            <div className="bg-card border border-border p-8 flex flex-col hover:border-accent transition-all duration-300 group relative">
                <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-accent transition-colors">Fotografía</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
                    {services[0].description}
                </p>
                <div className="text-3xl font-bold text-foreground mb-6 font-serif">{services[0].price}</div>
                <ul className="space-y-4 mb-8 text-sm text-muted-foreground">
                    {services[0].includes.slice(0, 5).map(item => (
                        <li key={item} className="flex gap-3 items-start">
                          <Check size={16} className="text-accent shrink-0 mt-0.5" /> 
                          <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <Link href="/contacto" className="w-full py-4 border border-foreground text-foreground text-center text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors mt-auto">
                    Ver Detalles
                </Link>
            </div>

            {/* Tarjeta: Video */}
            <div className="bg-card border border-border p-8 flex flex-col hover:border-accent transition-all duration-300 group relative">
                <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-accent transition-colors">Cinematografía</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
                    {services[1].description}
                </p>
                <div className="text-3xl font-bold text-foreground mb-6 font-serif">{services[1].price}</div>
                <ul className="space-y-4 mb-8 text-sm text-muted-foreground">
                    {services[1].includes.slice(0, 5).map(item => (
                        <li key={item} className="flex gap-3 items-start">
                          <Check size={16} className="text-accent shrink-0 mt-0.5" /> 
                          <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <Link href="/contacto" className="w-full py-4 border border-foreground text-foreground text-center text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors mt-auto">
                    Ver Detalles
                </Link>
            </div>

            {/* Tarjeta: Pack Completo (Destacado) */}
            <div className="bg-foreground text-background p-8 flex flex-col relative overflow-hidden transform md:-translate-y-4 shadow-2xl">
                <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-wider">
                    Más Popular
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4 text-white">Foto + Video</h3>
                <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                    {packages[0].description}
                </p>
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="text-3xl font-bold text-white font-serif">{packages[0].price}</div>
                  <span className="text-accent text-sm font-bold">{packages[0].savings}</span>
                </div>
                
                <ul className="space-y-4 mb-8 text-sm text-gray-300 mt-4">
                    {packages[0].includes.map(item => (
                        <li key={item} className="flex gap-3 items-start">
                          <Check size={16} className="text-accent shrink-0 mt-0.5" /> 
                          <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <Link href="/contacto" className="w-full py-4 bg-accent text-white text-center text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors mt-auto">
                    Solicitar Disponibilidad
                </Link>
            </div>
        </div>
        )}

        {/* Sección Premium / A medida */}
        {false && (
        <section className="mb-24 bg-muted/10 border-y border-border py-20">
            <div className="max-w-4xl mx-auto text-center px-6">
                <h2 className="text-3xl font-serif font-bold mb-6">Colección Premium Signature</h2>
                <p className="text-muted-foreground mb-10 text-lg font-light">
                    Para parejas que buscan la excelencia absoluta. Una experiencia integral que incluye cobertura ilimitada, dron, álbumes de lino hechos a mano y sesión pre-boda editorial.
                </p>
                <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-foreground mb-10 uppercase tracking-wide">
                    <span>✦ Drone 4K</span>
                    <span>✦ Álbum Fine Art</span>
                    <span>✦ 2 Fotógrafos</span>
                    <span>✦ Entrega Express</span>
                </div>
                <Link href="/contacto" className="inline-block border-b border-accent text-accent pb-1 hover:text-foreground transition-colors text-sm uppercase tracking-widest">
                    Consultar opciones personalizadas
                </Link>
            </div>
        </section>
        )}

        {/* CTA Final */}
        <div className="text-center py-12">
            <h2 className="text-3xl font-serif font-bold mb-6">¿Empezamos la aventura?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Si sientes conexión con nuestro trabajo, nos encantaría conocer vuestra historia.
            </p>
            <Link href="/contacto" className="cta-button-primary inline-flex items-center gap-3 px-10 py-4 text-sm tracking-widest">
                Consultar Disponibilidad <ArrowRight size={16} />
            </Link>
        </div>
      </div>
    </>
  );
}
