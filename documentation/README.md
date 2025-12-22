# narrativabodas de Bodas y Eventos - Sitio Web Profesional

Un sitio web moderno, seguro y optimizado para SEO, diseñado para promocionar servicios de fotografía y videografía de bodas y eventos. Construido con React 19, TypeScript y Tailwind CSS 4.

## Características Principales

### Diseño
- **Minimalismo Contemporáneo Oscuro:** Paleta elegante con negro profundo y acentos dorados
- **Responsive:** Optimizado para desktop, tablet y mobile
- **Rápido:** Optimizaciones de rendimiento implementadas
- **Accesible:** Cumple con estándares WCAG 2.1

### Funcionalidad
- **Galería de Portafolio:** Showcase de trabajos con filtros y lightbox
- **Página de Servicios:** Descripción detallada de servicios y paquetes
- **Formulario de Contacto:** Validación de datos y protección GDPR
- **Navegación Intuitiva:** Menú sticky con responsive mobile

### Seguridad
- **HTTPS:** Certificados SSL/TLS automáticos
- **Content Security Policy:** Protección contra XSS
- **Validación de Formularios:** Cliente y servidor
- **GDPR Compliance:** Consentimiento y política de privacidad

### SEO/SEM
- **Meta Tags Completos:** Title, description, Open Graph
- **Schema.org Markup:** LocalBusiness structured data
- **Sitemap y Robots.txt:** Indexación optimizada
- **Velocidad:** Lazy loading, minificación, compresión
- **Mobile Optimization:** Mobile-first responsive design

---

## Inicio Rápido

### Requisitos
- Node.js 18+ (incluido pnpm)
- Editor de código (VSCode, PyCharm, etc.)

### Instalación

```bash
# Clonar o descargar el proyecto
cd /home/ubuntu/narrativabodas-web

# Instalar dependencias (si es necesario)
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Abrir en navegador
# http://localhost:3000
```

### Estructura de Carpetas

```
narrativabodas-web/
├── client/
│   ├── public/
│   │   ├── images/              ← Imágenes del sitio
│   │   ├── sitemap.xml          ← Mapa del sitio para SEO
│   │   └── robots.txt           ← Instrucciones para buscadores
│   ├── src/
│   │   ├── pages/               ← Páginas (Home, Portfolio, Services, Contact)
│   │   ├── components/          ← Componentes reutilizables
│   │   ├── App.tsx              ← Rutas principales
│   │   ├── index.css            ← Estilos globales
│   │   └── main.tsx             ← Punto de entrada
│   └── index.html               ← HTML principal
├── CONTENT_STRUCTURE.md         ← Estructura de contenido y SEO
├── SECURITY_AND_OPTIMIZATION.md ← Guía de seguridad y optimizaciones
├── EDITING_GUIDE.md             ← Guía de edición del sitio
└── README.md                    ← Este archivo
```

---

## Páginas Principales

### 1. **Inicio** (`/`)
- Hero section con imagen de fondo
- Propuesta de valor (3 columnas)
- Portafolio destacado
- Servicios principales
- Testimonios
- Llamada a acción final

### 2. **Portafolio** (`/portfolio`)
- Galería completa con filtros
- Lightbox para ver imágenes en detalle
- Información de cada proyecto
- Estadísticas (bodas, eventos, calificación)

### 3. **Servicios** (`/servicios`)
- Fotografía de bodas
- Videografía cinematográfica
- Paquetes especiales
- Proceso de trabajo
- Precios y opciones

### 4. **Contacto** (`/contacto`)
- Formulario de contacto con validación
- Información de contacto
- Horario de atención
- Redes sociales

---

## Edición del Sitio

### Cambios Comunes

#### Cambiar Texto
1. Abrir archivo en VSCode o PyCharm
2. Localizar el texto a cambiar
3. Guardar archivo
4. El servidor recargará automáticamente

**Ejemplo:** Cambiar título en Home
```tsx
// client/src/pages/Home.tsx (línea ~48)
<h1>Tu nuevo título aquí</h1>
```

#### Cambiar Imágenes
1. Guardar nueva imagen en `client/public/images/`
2. Usar el mismo nombre o actualizar referencia en código
3. Optimizar imagen (máximo 1MB)

#### Cambiar Colores
1. Editar `client/src/index.css`
2. Cambiar valores OKLCH en `:root`
3. Los cambios se aplican globalmente

#### Cambiar Información de Contacto
1. Editar `client/src/components/Footer.tsx`
2. Actualizar email, teléfono, ubicación
3. Guardar y recargar

**Para más detalles, ver `EDITING_GUIDE.md`**

---

## Optimizaciones Implementadas

### Rendimiento
- ✅ Lazy loading de imágenes
- ✅ Minificación de CSS/JS
- ✅ Compresión Gzip
- ✅ Caché de navegador
- ✅ Code splitting automático

### SEO
- ✅ Meta tags completos
- ✅ Schema.org markup
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Open Graph tags
- ✅ Estructura de headings correcta

### Seguridad
- ✅ HTTPS (Manus proporciona)
- ✅ Content Security Policy
- ✅ Validación de formularios
- ✅ Protección GDPR
- ✅ Sanitización de contenido

### Accesibilidad
- ✅ Contraste de colores adecuado
- ✅ Alt text en imágenes
- ✅ Navegación por teclado
- ✅ ARIA labels
- ✅ Estructura semántica HTML

---

## Herramientas y Tecnologías

### Frontend
- **React 19:** Framework de UI
- **TypeScript:** Tipado estático
- **Tailwind CSS 4:** Utilidades CSS
- **Wouter:** Enrutamiento ligero
- **Lucide React:** Iconos
- **Sonner:** Notificaciones

### Desarrollo
- **Vite:** Build tool rápido
- **ESBuild:** Minificación
- **Prettier:** Formateo de código
- **TypeScript:** Verificación de tipos

### Hosting
- **Manus:** Plataforma de hosting con SSL automático

---

## Checklist de Lanzamiento

Antes de publicar el sitio:

- [ ] Cambiar dominio en `client/index.html` (og:url)
- [ ] Actualizar información de contacto
- [ ] Agregar fotos reales del equipo
- [ ] Verificar todos los links
- [ ] Probar formulario de contacto
- [ ] Revisar en mobile
- [ ] Registrar en Google Search Console
- [ ] Crear Google My Business
- [ ] Configurar Google Analytics
- [ ] Crear sitemap.xml con URLs reales
- [ ] Actualizar robots.txt con dominio real
- [ ] Probar velocidad en PageSpeed Insights
- [ ] Verificar seguridad en SSL Labs

---

## Mantenimiento

### Actualizar Regularmente
- Agregar nuevos trabajos al portafolio
- Actualizar precios y servicios
- Revisar y responder formularios de contacto
- Actualizar testimonios
- Mantener información de contacto actualizada

### Monitoreo
- Revisar Google Analytics mensualmente
- Monitorear posicionamiento en Google Search Console
- Verificar velocidad de página
- Revisar errores en consola

### Seguridad
- Actualizar dependencias regularmente
- Ejecutar `pnpm audit` para vulnerabilidades
- Revisar logs de acceso
- Hacer backup de contenido

---

## Troubleshooting

### El sitio no se carga
```bash
# Verificar que el servidor esté corriendo
pnpm dev

# Limpiar caché y reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Las imágenes no se ven
- Verificar que existan en `client/public/images/`
- Revisar la ruta en el código (debe ser `/images/nombre.jpg`)
- Verificar nombre del archivo (sensible a mayúsculas)

### Los estilos no se aplican
- Limpiar caché: Ctrl+Shift+Delete
- Verificar clases de Tailwind en `index.css`
- Reiniciar servidor: `pnpm dev`

---

## Documentación Adicional

- **`CONTENT_STRUCTURE.md`** - Estructura de contenido y estrategia SEO
- **`SECURITY_AND_OPTIMIZATION.md`** - Detalles de seguridad y optimizaciones
- **`EDITING_GUIDE.md`** - Guía completa de edición del sitio
- **`ideas.md`** - Enfoques de diseño considerados

---

## Recursos Útiles

### Documentación Oficial
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

### Herramientas SEO
- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [Schema.org Validator](https://validator.schema.org)

### Herramientas de Desarrollo
- [VSCode](https://code.visualstudio.com)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## Soporte y Ayuda

Para preguntas sobre:
- **Edición del sitio:** Ver `EDITING_GUIDE.md`
- **Seguridad:** Ver `SECURITY_AND_OPTIMIZATION.md`
- **Contenido:** Ver `CONTENT_STRUCTURE.md`
- **Código:** Consultar documentación oficial de React/TypeScript

---

## Licencia

Este proyecto está disponible para uso comercial. Todos los derechos reservados.

---

## Información de Contacto

**narrativabodas de Bodas y Eventos**
- Email: contacto@narrativabodas.com
- Teléfono: +34 XXX XXX XXX
- Ubicación: Madrid, España

---

**Última actualización:** 2 de diciembre de 2024
**Versión:** 1.0.0

