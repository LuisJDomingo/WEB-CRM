# Guía de Edición del Sitio Web

## Introducción

Este sitio web está diseñado para ser fácilmente editable desde cualquier editor de código como VSCode o PyCharm. No se requieren conocimientos avanzados de programación para realizar cambios básicos.

---

## Estructura de Archivos

```
Narrativa de bodas-web/
├── client/
│   ├── public/
│   │   └── images/              ← Imágenes del sitio
│   └── src/
│       ├── pages/               ← Páginas principales
│       │   ├── Home.tsx
│       │   ├── Portfolio.tsx
│       │   ├── Services.tsx
│       │   ├── Contact.tsx
│       │   └── NotFound.tsx
│       ├── components/           ← Componentes reutilizables
│       │   ├── Navigation.tsx
│       │   ├── Footer.tsx
│       │   └── GalleryGrid.tsx
│       ├── App.tsx              ← Rutas principales
│       ├── index.css            ← Estilos globales
│       └── main.tsx             ← Entrada de la aplicación
├── CONTENT_STRUCTURE.md         ← Estructura de contenido
├── SECURITY_AND_OPTIMIZATION.md ← Seguridad y SEO
└── EDITING_GUIDE.md             ← Este archivo
```

---

## Cambios Comunes

### 1. Cambiar Texto en la Página de Inicio

**Archivo:** `client/src/pages/Home.tsx`

#### Cambiar Título Principal
```tsx
// Línea ~48
<h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
  Capturamos tus momentos más especiales  ← CAMBIAR AQUÍ
</h1>
```

#### Cambiar Subtítulo
```tsx
// Línea ~52
<p className="text-lg md:text-xl text-gray-200 mb-8 font-light">
  Reportajes auténtico para parejas que valoran la calidad y la emoción  ← CAMBIAR AQUÍ
</p>
```

#### Cambiar Sección "¿Por qué elegirnos?"
```tsx
// Línea ~88
{[
  {
    title: 'Reportajes Auténticos',  ← CAMBIAR TÍTULO
    description: 'Capturamos momentos reales...',  ← CAMBIAR DESCRIPCIÓN
    icon: '01',
  },
  // ... más elementos
]}
```

### 2. Cambiar Información de Contacto

**Archivo:** `client/src/components/Footer.tsx`

```tsx
// Línea ~16-30
const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contacto@narrativabodas.com',  ← CAMBIAR EMAIL
    href: 'mailto:contacto@narrativabodas.com',
  },
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+34 XXX XXX XXX',  ← CAMBIAR TELÉFONO
    href: 'tel:+34XXXXXXXXX',
  },
  // ...
];
```

### 3. Cambiar Información en Servicios

**Archivo:** `client/src/pages/Services.tsx`

#### Cambiar Precio
```tsx
// Línea ~21
price: 'Desde €1,500',  ← CAMBIAR PRECIO
```

#### Cambiar Descripción de Servicio
```tsx
// Línea ~19
description: 'Captura de momentos auténticos...',  ← CAMBIAR DESCRIPCIÓN
```

#### Cambiar Lista de Incluye
```tsx
// Línea ~25
includes: [
  '8-12 horas de cobertura',  ← CAMBIAR O AGREGAR ITEMS
  '1000+ fotos editadas profesionalmente',
  // ...
],
```

### 4. Cambiar Imágenes

**Ubicación:** `client/public/images/`

#### Reemplazar Imagen Existente
1. Guardar nueva imagen en `client/public/images/`
2. Usar el mismo nombre que la imagen anterior
3. El sitio usará automáticamente la nueva imagen

**Ejemplo:**
```tsx
// En Home.tsx
<img src="/images/hero-wedding-moment.jpg" alt="Momento íntimo de pareja en boda" />
// Si reemplazas el archivo hero-wedding-moment.jpg, la imagen se actualizará automáticamente
```

#### Agregar Nueva Imagen a Galería
1. Guardar imagen en `client/public/images/`
2. Agregar entrada en array de imágenes

**Ejemplo en Home.tsx:**
```tsx
const featuredImages = [
  {
    id: '1',
    src: '/images/hero-wedding-moment.jpg',
    alt: 'Momento íntimo de pareja en boda',
    title: 'Boda María & Juan',
    description: 'Captura de un momento especial durante la ceremonia',
  },
  // AGREGAR NUEVA IMAGEN AQUÍ
  {
    id: 'nueva',
    src: '/images/nueva-imagen.jpg',
    alt: 'Descripción de la nueva imagen',
    title: 'Título del evento',
    description: 'Descripción del evento',
  },
];
```

### 5. Cambiar Testimonios

**Archivo:** `client/src/pages/Home.tsx`

```tsx
// Línea ~115
const testimonials = [
  {
    name: 'María García',  ← CAMBIAR NOMBRE
    event: 'Boda 2024',  ← CAMBIAR EVENTO
    text: 'Fue increíble trabajar con ellos...',  ← CAMBIAR TESTIMONIAL
    rating: 5,  ← CAMBIAR CALIFICACIÓN (1-5)
  },
  // ... más testimonios
];
```

### 6. Cambiar Colores

**Archivo:** `client/src/index.css`

#### Cambiar Color Dorado (Acento)
```css
:root {
  /* Línea ~45 */
  --primary: oklch(0.75 0.08 70);  ← CAMBIAR ESTOS VALORES
  --accent: oklch(0.75 0.08 70);
}
```

**Valores OKLCH Comunes:**
- Oro: `oklch(0.75 0.08 70)`
- Plata: `oklch(0.85 0.02 280)`
- Rojo: `oklch(0.60 0.25 20)`
- Azul: `oklch(0.50 0.15 260)`

### 7. Cambiar Texto del Formulario de Contacto

**Archivo:** `client/src/pages/Contact.tsx`

#### Cambiar Etiquetas de Campos
```tsx
// Línea ~130
<label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
  Nombre Completo *  ← CAMBIAR TEXTO
</label>
```

#### Cambiar Placeholder
```tsx
// Línea ~135
<input
  type="text"
  placeholder="Tu nombre"  ← CAMBIAR PLACEHOLDER
/>
```

---

## Cambios Avanzados

### Agregar Nueva Página

1. **Crear archivo en `client/src/pages/NuevaPage.tsx`:**
```tsx
import { Link } from 'wouter';

export default function NuevaPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container">
        <h1 className="section-title mb-4">Título de la Página</h1>
        <p className="text-muted-foreground">Contenido aquí</p>
      </div>
    </main>
  );
}
```

2. **Agregar ruta en `client/src/App.tsx`:**
```tsx
import NuevaPage from "./pages/NuevaPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/nueva"} component={NuevaPage} />  ← AGREGAR AQUÍ
      {/* ... más rutas ... */}
    </Switch>
  );
}
```

3. **Agregar link en navegación `client/src/components/Navigation.tsx`:**
```tsx
const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/nueva', label: 'Nueva Página' },  ← AGREGAR AQUÍ
  // ...
];
```

### Cambiar Fuentes

**Archivo:** `client/index.html`

```html
<!-- Línea ~28 -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

**Fuentes Recomendadas:**
- Títulos: Playfair Display, Montserrat, Bebas Neue
- Cuerpo: Inter, Lato, Roboto

**Cambiar en `client/src/index.css`:**
```css
html {
  font-family: 'Inter', system-ui, sans-serif;  ← CAMBIAR FUENTE
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;  ← CAMBIAR FUENTE
}
```

---

## Flujo de Trabajo

### 1. Hacer Cambios Localmente
```bash
cd /home/ubuntu/narrativabodas-web
# Editar archivos en VSCode o PyCharm
```

### 2. Ver Cambios en Tiempo Real
- El servidor de desarrollo recarga automáticamente
- Abre navegador en `http://localhost:3000`
- Los cambios aparecen al guardar el archivo

### 3. Verificar Cambios
- Revisar en desktop y mobile
- Probar formularios
- Verificar links internos

### 4. Publicar Cambios
- Los cambios se publican automáticamente al guardar
- El sitio se actualiza en vivo

---

## Consejos de Edición

### Mantener Consistencia
- Usar los mismos colores en todo el sitio
- Mantener la misma tipografía
- Usar los mismos espacios y márgenes

### Optimizar para SEO
- Usar keywords en títulos y descripciones
- Agregar alt text descriptivo a imágenes
- Mantener contenido actualizado

### Mejorar Rendimiento
- Optimizar imágenes antes de subir (máximo 1MB)
- Usar formato WebP cuando sea posible
- No agregar scripts de terceros innecesarios

### Seguridad
- No cambiar código de seguridad sin entender
- Validar siempre datos de formularios
- Mantener dependencias actualizadas

---

## Solución de Problemas

### El sitio no se carga
- Verificar que el servidor esté corriendo
- Revisar la consola del navegador (F12)
- Buscar errores en la terminal

### Las imágenes no se ven
- Verificar que el archivo existe en `client/public/images/`
- Revisar la ruta en el código (debe ser `/images/nombre.jpg`)
- Verificar el nombre del archivo (sensible a mayúsculas)

### El formulario no funciona
- Verificar que los campos tengan nombres correctos
- Revisar la validación en el código
- Buscar errores en la consola del navegador

### Los estilos no se aplican
- Limpiar caché del navegador (Ctrl+Shift+Delete)
- Verificar que las clases de Tailwind sean correctas
- Revisar que los colores estén definidos en `index.css`

---

## Recursos Útiles

### Documentación
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Herramientas
- [VSCode](https://code.visualstudio.com)
- [PyCharm](https://www.jetbrains.com/pycharm/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Comunidades
- [Stack Overflow](https://stackoverflow.com)
- [GitHub Discussions](https://github.com/discussions)
- [React Community](https://react.dev/community)

---

## Soporte

Para preguntas sobre edición o cambios específicos, consulta:
1. Este documento (EDITING_GUIDE.md)
2. CONTENT_STRUCTURE.md (estructura de contenido)
3. SECURITY_AND_OPTIMIZATION.md (seguridad y SEO)
4. Documentación oficial de las tecnologías usadas

