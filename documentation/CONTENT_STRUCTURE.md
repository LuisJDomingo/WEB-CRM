# Estructura de Contenido y Arquitectura SEO

## Visión General del Sitio

El sitio web está diseñado como una galería de lujo minimalista que posiciona a los fotógrafos y videógrafos como profesionales de alto nivel especializados en documentalismo de bodas y eventos. La arquitectura enfatiza la fotografía como protagonista mientras mantiene una navegación limpia y profesional.

---

## Estructura de Páginas

### 1. **Página de Inicio (Home)**
**Ruta:** `/`

**Propósito SEO:** Página de entrada principal, debe capturar intención de búsqueda general y dirigir a secciones específicas.

**Secciones:**

#### A. Hero Section
- **Imagen:** Hero wedding moment (full-width, autoplay subtle parallax)
- **Contenido:** 
  - Titular principal: "Capturamos tus momentos más especiales"
  - Subtítulo: "documentalismo de bodas y eventos para parejas que valoran la autenticidad"
  - CTA primario: "Ver Portafolio"
  - CTA secundario: "Solicitar Cotización"

#### B. Propuesta de Valor (3 columnas)
- **Sección:** "¿Por qué elegirnos?"
- **Elementos:**
  1. **Documentalismo Auténtico:** Capturamos momentos reales, no poses forzadas
  2. **Equipo Profesional:** Fotógrafos y videógrafos con experiencia en eventos de lujo
  3. **Entrega Premium:** Edición profesional, galería online privada, múltiples formatos

#### C. Portafolio Destacado (Grid asimétrico)
- **Sección:** "Nuestro Trabajo"
- **Contenido:** 6-8 imágenes en masonry layout
- **Interacción:** Hover para ver detalles, click para abrir modal

#### D. Servicios (3 tarjetas)
- **Fotografía de Bodas**
- **Videografía Cinematográfica**
- **Paquetes Combinados**

#### E. Testimonios (Carousel)
- **Sección:** "Lo que dicen nuestros clientes"
- **Contenido:** 3-4 testimonios con foto, nombre, evento

#### F. Llamada a Acción Final
- **Contenido:** "¿Listo para tu día especial?"
- **CTA:** "Agendar Consulta Gratuita"

#### G. Footer
- **Información de contacto**
- **Redes sociales**
- **Links legales (Privacidad, Términos)**

---

### 2. **Página de Portafolio**
**Ruta:** `/portfolio`

**Propósito SEO:** Mostrar trabajo de calidad, mejorar tiempo en página, generar confianza.

**Secciones:**

#### A. Filtros por Tipo
- Todas las bodas
- Eventos corporativos
- Sesiones de parejas
- Detalles y preparativos

#### B. Galería Completa
- Grid responsivo con imágenes de alta calidad
- Lazy loading para optimizar velocidad
- Modal lightbox para ver en detalle

#### C. Información de Cada Proyecto
- Fecha del evento
- Ubicación
- Servicios utilizados
- Breve descripción

---

### 3. **Página de Servicios**
**Ruta:** `/servicios`

**Propósito SEO:** Capturar búsquedas específicas de servicios ("fotografía de bodas", "videografía", etc.)

**Secciones:**

#### A. Fotografía de Bodas
- Descripción detallada
- Qué incluye (horas, cantidad de fotos, edición)
- Galería de ejemplos
- Precios indicativos

#### B. Videografía Cinematográfica
- Descripción del servicio
- Qué incluye (duración, edición, música)
- Video de ejemplo
- Precios indicativos

#### C. Paquetes Personalizados
- Opción de combinar servicios
- Descuentos por paquete
- CTA para cotización

#### D. Proceso de Trabajo
- Pre-producción
- Día del evento
- Post-producción
- Entrega final

---

### 4. **Página de Contacto**
**Ruta:** `/contacto`

**Propósito SEO:** Capturar intención de conversión, formulario de contacto para leads.

**Secciones:**

#### A. Formulario de Contacto
- Nombre
- Email
- Teléfono
- Tipo de evento
- Fecha estimada
- Mensaje
- Checkbox de privacidad

#### B. Información de Contacto
- Email
- Teléfono
- Ubicación (ciudad/país)
- Horario de atención

#### C. Redes Sociales
- Links a Instagram, Facebook, etc.

---

## Estrategia SEO/SEM

### Keywords Principales

| Palabra Clave | Volumen | Dificultad | Ubicación |
|---|---|---|---|
| Fotografía de bodas | Alto | Alto | Home, Servicios |
| Fotógrafo de bodas [ciudad] | Medio | Medio | Home, Contacto |
| Videografía de bodas | Medio | Medio | Servicios |
| Fotógrafo profesional eventos | Bajo | Bajo | Servicios |
| Documentalismo bodas | Bajo | Bajo | Home, Portafolio |

### Optimización On-Page

**Meta Tags:**
- Title: "Fotografía y Videografía de Bodas | Documentalismo Profesional"
- Description: "Capturamos tus momentos especiales con Documentalismo auténtico. Fotógrafos y videógrafos profesionales para bodas y eventos."

**Headers (H1-H3):**
- H1: Único por página, enfocado en keyword principal
- H2: Subtemas relacionados
- H3: Detalles específicos

**Contenido:**
- Mínimo 300 palabras por página
- Palabras clave naturalmente distribuidas (2-3% densidad)
- Enlaces internos entre páginas relacionadas
- Imágenes con atributo `alt` descriptivo

**Velocidad:**
- Imágenes optimizadas (WebP, lazy loading)
- Minificación de CSS/JS
- Caché del navegador
- CDN para assets estáticos

### Estrategia de Backlinks

- Directorios de fotografía local
- Blogs de bodas y eventos
- Colaboraciones con wedding planners
- Menciones en redes sociales

---

## Estructura de Datos (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Documentalismo de Bodas y Eventos",
  "image": "https://example.com/logo.png",
  "description": "Fotografía y videografía profesional para bodas y eventos",
  "telephone": "+34-XXX-XXX-XXX",
  "email": "contacto@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Principal 123",
    "addressLocality": "Ciudad",
    "postalCode": "28001",
    "addressCountry": "ES"
  },
  "areaServed": "ES",
  "priceRange": "€€€",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "25"
  }
}
```

---

## Consideraciones de Seguridad

### Protección de Datos
- HTTPS obligatorio (Manus proporciona)
- Formularios con CSRF protection
- Validación de entrada en cliente y servidor
- Rate limiting en endpoints de contacto

### Privacidad
- Política de privacidad clara y accesible
- Consentimiento explícito para cookies
- GDPR compliance (si aplica)
- Protección de datos de clientes en galería privada

### Seguridad de Contenido
- Content Security Policy (CSP) headers
- No ejecutar scripts de terceros sin validación
- Sanitización de contenido dinámico
- Protección contra XSS y SQL injection

---

## Métricas de Éxito

| Métrica | Objetivo |
|---|---|
| Tiempo en página | > 2 minutos |
| Bounce rate | < 40% |
| Conversión (contacto) | > 2% |
| Velocidad de carga | < 2 segundos |
| Mobile usability | 100% |
| SEO score | > 90 |

