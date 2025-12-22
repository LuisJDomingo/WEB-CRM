# Seguridad y Optimizaciones SEO/SEM

## Resumen Ejecutivo

Este documento detalla las medidas de seguridad implementadas y las optimizaciones SEO/SEM del sitio web de narrativabodas de Bodas y Eventos. El sitio está construido con React 19, TypeScript y Tailwind CSS 4, priorizando seguridad, rendimiento y posicionamiento en buscadores.

---

## 1. Medidas de Seguridad Implementadas

### 1.1 Protección en el Servidor (HTTPS)
- **HTTPS Obligatorio:** Manus proporciona certificados SSL/TLS automáticos
- **HSTS (HTTP Strict Transport Security):** Fuerza conexiones seguras
- **Certificados de Seguridad:** Válidos y actualizados automáticamente

### 1.2 Content Security Policy (CSP)
**Header implementado en `client/index.html`:**
```
Content-Security-Policy: default-src 'self'; 
script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
img-src 'self' data: https:; 
font-src 'self' https://fonts.gstatic.com; 
connect-src 'self' https:;
```

**Beneficios:**
- Previene ataques XSS (Cross-Site Scripting)
- Controla qué recursos externos se pueden cargar
- Bloquea scripts maliciosos inyectados

### 1.3 Protección contra Ataques Comunes

#### XSS (Cross-Site Scripting)
- React sanitiza automáticamente el contenido renderizado
- Validación de entrada en formularios (cliente)
- Nunca se usa `dangerouslySetInnerHTML` sin validación

#### CSRF (Cross-Site Request Forgery)
- Tokens CSRF en formularios (implementable en backend)
- SameSite cookies para prevenir ataques cross-site
- Validación de origen en solicitudes POST

#### SQL Injection
- No aplicable en frontend (cliente)
- Backend debe usar prepared statements y ORM

### 1.4 Validación de Formularios
**Implementado en `client/src/pages/Contact.tsx`:**
- Validación de email con expresión regular
- Campos requeridos con validación HTML5
- Mensajes de error claros para el usuario
- Prevención de envío duplicado con estado `isSubmitting`

### 1.5 Protección de Datos Personales

#### GDPR Compliance
- Checkbox de consentimiento en formulario de contacto
- Política de privacidad accesible (`/privacidad`)
- Aviso de cookies (implementable)
- Derecho a ser olvidado (implementable en backend)

#### Privacidad
- No se recopilan datos innecesarios
- Los datos se envían solo con consentimiento explícito
- Información de contacto protegida

### 1.6 Seguridad de Dependencias
- Todas las dependencias están en `package.json`
- Usar `pnpm audit` regularmente para verificar vulnerabilidades
- Actualizar dependencias periódicamente

### 1.7 Protección de Activos Estáticos
- Las imágenes están en `/client/public/images/`
- Caché agresivo para archivos estáticos (hash de contenido)
- Lazy loading para optimizar velocidad

### 1.8 Autenticación y Control de Acceso (Nueva Implementación)

Se ha migrado de un sistema de contraseña única compartida a un sistema de autenticación robusto basado en usuarios individuales y tokens.

#### Cambios Realizados
- **Tabla de Usuarios:** Nueva tabla `workers` en Supabase para gestionar el personal.
- **Hashing:** Uso de `bcrypt` para encriptar contraseñas antes de guardarlas.
- **JWT:** Uso de JSON Web Tokens para manejar sesiones seguras sin estado.
- **Roles de Servicio:** El backend utiliza claves privilegiadas (`SERVICE_ROLE_KEY`) para gestionar usuarios, manteniendo el frontend restringido.

#### ¿Por qué es más seguro? (Ejemplos Prácticos)

1.  **Ejemplo: Rotación de Personal**
    *   *Antes:* Si un empleado dejaba la empresa, había que cambiar la contraseña `admin123` en el código fuente, volver a desplegar la web y comunicar la nueva contraseña a todo el equipo restante.
    *   *Ahora:* Simplemente se elimina o desactiva el usuario de ese empleado en la base de datos. El resto del equipo sigue trabajando sin interrupciones.

2.  **Ejemplo: Filtración de Datos**
    *   *Antes:* Si un atacante accedía al código o la base de datos, obtenía la contraseña en texto plano inmediatamente.
    *   *Ahora:* Las contraseñas se guardan como hashes (`$2b$10$XyZ...`). Incluso si roban la base de datos, no pueden usar esas contraseñas para iniciar sesión sin desencriptarlas (lo cual es computacionalmente muy costoso).

3.  **Ejemplo: Auditoría y Responsabilidad**
    *   *Antes:* Era imposible saber quién borró una galería, ya que todos usaban la misma credencial genérica.
    *   *Ahora:* El sistema identifica exactamente qué usuario (`juan@ejemplo.com`) realizó cada acción, permitiendo trazabilidad.

---

## 2. Optimizaciones SEO/SEM

### 2.1 Meta Tags y Estructura

#### Title y Description
```html
<title>Fotografía y Videografía de Bodas | narrativabodas Profesional</title>
<meta name="description" content="Capturamos tus momentos especiales con narrativabodas auténtico. Fotógrafos y videógrafos profesionales para bodas y eventos de lujo." />
```

**Beneficios:**
- Keywords principales en title (fotografía, videografía, bodas)
- Description atractivo que incita clicks
- Longitud óptima para búsqueda (50-60 caracteres para title, 150-160 para description)

#### Open Graph (Redes Sociales)
```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Fotografía y Videografía de Bodas | narrativabodas Profesional" />
<meta property="og:description" content="..." />
<meta property="og:image" content="/images/hero-wedding-moment.jpg" />
```

**Beneficios:**
- Mejora compartibilidad en redes sociales
- Controla cómo se ve el sitio en Facebook, LinkedIn, etc.
- Aumenta engagement

#### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:image" content="..." />
```

### 2.2 Estructura de Contenido

#### Headings (H1-H3)
- **H1 único por página:** Enfocado en keyword principal
- **H2:** Subtemas relacionados (propuesta de valor, servicios, etc.)
- **H3:** Detalles específicos (características, beneficios)

**Ejemplo en Home:**
```
H1: Capturamos tus momentos más especiales
  H2: ¿Por qué elegirnos?
    H3: narrativabodas Auténtico
    H3: Equipo Profesional
    H3: Entrega Premium
  H2: Nuestro Trabajo
  H2: Nuestros Servicios
```

#### Keywords Estratégicas
| Página | Keyword Primaria | Keywords Secundarias |
|--------|------------------|---------------------|
| Home | Fotografía de bodas | Videografía, narrativabodas, eventos |
| Portfolio | Portafolio bodas | Galería, trabajos, ejemplos |
| Servicios | Servicios fotografía | Paquetes, precios, opciones |
| Contacto | Contactar fotógrafo | Cotización, consulta, presupuesto |

### 2.3 Velocidad de Página

#### Optimizaciones Implementadas
- **Lazy Loading:** Imágenes se cargan bajo demanda
- **Minificación:** CSS y JS minificados automáticamente por Vite
- **Compresión:** Gzip habilitado en servidor
- **Caché:** Archivos estáticos con hash de contenido

#### Métricas Objetivo
- **Largest Contentful Paint (LCP):** < 2.5 segundos
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1

#### Herramientas para Medir
- Google PageSpeed Insights: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- WebPageTest: https://www.webpagetest.org

### 2.4 Mobile Optimization

#### Responsive Design
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg)
- Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

#### Mobile Usability
- Botones y links con tamaño mínimo de 48x48px
- Texto legible sin zoom
- Menú responsive con hamburger icon
- Formularios optimizados para mobile

### 2.5 Structured Data (Schema.org)

#### LocalBusiness Schema
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "narrativabodas de Bodas y Eventos",
  "telephone": "+34-XXX-XXX-XXX",
  "email": "contacto@narrativabodas.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Principal 123",
    "addressLocality": "Madrid",
    "postalCode": "28001",
    "addressCountry": "ES"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "25"
  }
}
```

**Beneficios:**
- Mejora posicionamiento en búsqueda local
- Muestra información en Knowledge Panel de Google
- Aumenta confianza del usuario

### 2.6 Sitemap y Robots.txt

#### Sitemap (`/public/sitemap.xml`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://narrativabodas.example.com/</loc>
    <lastmod>2024-12-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://narrativabodas.example.com/portfolio</loc>
    <lastmod>2024-12-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... más URLs ... -->
</urlset>
```

#### Robots.txt (`/public/robots.txt`)
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /private

Sitemap: https://narrativabodas.example.com/sitemap.xml
```

### 2.7 Backlinks y Link Building

#### Estrategia de Backlinks
1. **Directorios Locales:** Google My Business, Yelp, TripAdvisor
2. **Blogs de Bodas:** Colaboraciones con blogs de bodas y eventos
3. **Wedding Planners:** Alianzas con coordinadores de bodas
4. **Redes Sociales:** Links desde Instagram, Facebook, LinkedIn
5. **Guest Posts:** Artículos en blogs relevantes

#### Anchor Text Recomendado
- "Fotografía de bodas profesional"
- "Videografía cinematográfica"
- "narrativabodas de eventos"
- "Fotógrafo de bodas Madrid"

### 2.8 Análisis y Monitoreo

#### Google Analytics
- Implementado automáticamente por Manus (Umami)
- Métricas clave:
  - Sesiones y usuarios
  - Páginas por sesión
  - Tiempo en página
  - Tasa de conversión (contactos)
  - Fuentes de tráfico

#### Google Search Console
- Registrar sitio
- Monitorear palabras clave
- Verificar errores de rastreo
- Enviar sitemap

#### Herramientas Recomendadas
- Google Analytics 4
- Google Search Console
- Ahrefs o SEMrush (análisis de competencia)
- Ubersuggest (investigación de keywords)

---

## 3. Guía de Edición Segura

### 3.1 Edición de Contenido

#### Cambiar Texto
1. Abrir archivo en VSCode o PyCharm
2. Localizar la sección a editar
3. Cambiar el texto (mantener estructura HTML)
4. Guardar archivo
5. El servidor recargará automáticamente

**Ejemplo - Cambiar título en Home:**
```tsx
// Antes
<h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
  Capturamos tus momentos más especiales
</h1>

// Después
<h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
  Tu nuevo título aquí
</h1>
```

#### Cambiar Imágenes
1. Reemplazar imagen en `/client/public/images/`
2. Usar mismo nombre de archivo o actualizar referencia
3. Optimizar imagen (máximo 1MB, formato WebP preferido)

**Ejemplo:**
```tsx
<img src="/images/hero-wedding-moment.jpg" alt="Descripción" />
```

### 3.2 Edición de Formularios

#### Cambiar Campos del Formulario
**Archivo:** `client/src/pages/Contact.tsx`

```tsx
// Agregar nuevo campo
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  eventType: 'boda',
  eventDate: '',
  presupuesto: '', // NUEVO
  message: '',
  privacy: false,
});

// Agregar input
<div>
  <label htmlFor="presupuesto" className="block text-sm font-medium text-foreground mb-2">
    Presupuesto Aproximado
  </label>
  <input
    type="text"
    id="presupuesto"
    name="presupuesto"
    value={formData.presupuesto}
    onChange={handleChange}
    className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground focus:outline-none focus:border-accent transition-colors"
    placeholder="Ej: €2,000 - €5,000"
  />
</div>
```

### 3.3 Edición de Estilos

#### Cambiar Colores
**Archivo:** `client/src/index.css`

```css
:root {
  /* Cambiar color de acento (oro) */
  --primary: oklch(0.75 0.08 70); /* Cambiar estos valores */
  --accent: oklch(0.75 0.08 70);
}
```

**Formato OKLCH:**
- Primer número: Lightness (0-1, 0=negro, 1=blanco)
- Segundo número: Chroma (saturación, 0-0.4)
- Tercer número: Hue (0-360, color)

#### Cambiar Tipografía
**Archivo:** `client/index.html`

```html
<!-- Cambiar fuente -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

### 3.4 Buenas Prácticas de Edición

#### Seguridad
- Nunca eliminar código sin entender su función
- Hacer backup antes de cambios grandes
- Probar cambios localmente antes de publicar
- Usar control de versiones (Git)

#### Mantenimiento
- Actualizar imágenes regularmente
- Revisar y actualizar precios
- Mantener información de contacto actualizada
- Agregar nuevos trabajos al portafolio

#### Performance
- Optimizar imágenes antes de subir
- No agregar scripts de terceros sin necesidad
- Monitorear velocidad de página
- Limpiar código no utilizado

---

## 4. Checklist de Seguridad

- [ ] HTTPS habilitado (Manus lo proporciona)
- [ ] CSP headers configurados
- [ ] Validación de formularios implementada
- [ ] Consentimiento GDPR en formularios
- [ ] Política de privacidad publicada
- [ ] Robots.txt y sitemap.xml creados
- [ ] Google Search Console verificado
- [ ] Google Analytics implementado
- [ ] Meta tags completos
- [ ] Schema.org markup agregado
- [ ] Mobile responsiveness verificado
- [ ] Velocidad de página optimizada
- [ ] Imágenes optimizadas
- [ ] Dependencias sin vulnerabilidades

---

## 5. Recursos Útiles

### Herramientas SEO
- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [Schema.org Validator](https://validator.schema.org)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Security Guidelines](https://infosec.mozilla.org)
- [CSP Reference](https://content-security-policy.com)

### Optimización
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [GTmetrix](https://gtmetrix.com)
