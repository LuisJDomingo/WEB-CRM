# Brainstorming de Diseño: Narrativa de Bodas de Bodas y Eventos

## Contexto del Proyecto
- **Público objetivo:** Parejas jóvenes de medio-alto poder adquisitivo
- **Especialidad:** Fotoperiodismo (narrativa visual, momentos auténticos)
- **Objetivo:** Promocionar y vender servicios de fotografía y video

---

## Enfoque 1: Minimalismo Contemporáneo Oscuro

**Movimiento de Diseño:** Modernismo digital con influencias de fotografía editorial contemporánea

**Principios Fundamentales:**
1. **Espacio negativo como protagonista:** Fondos oscuros (charcoal/negro profundo) que enmarcan la fotografía como galería de arte
2. **Tipografía contrastante:** Serif elegante para títulos + sans-serif limpio para cuerpo
3. **Enfoque en la imagen:** Las fotos son el 80% del contenido visual; el texto es secundario
4. **Navegación invisible:** Menú minimalista que desaparece en scroll

**Filosofía de Color:**
- Fondo: Negro profundo (oklch(0.08 0 0))
- Acentos: Oro/champagne sutil (oklch(0.75 0.08 70)) para elegancia
- Texto: Blanco cálido (oklch(0.95 0.01 65))
- Propósito: Crear una galería premium donde cada imagen respira

**Paradigma de Layout:**
- Galería asimétrica con imágenes de diferentes tamaños (masonry layout)
- Secciones full-width con scroll horizontal para portfolios
- Tipografía grande y audaz en hero, con mucho espacio en blanco
- Divisores sutiles (líneas finas, espacios amplios)

**Elementos Distintivos:**
1. **Bordes dorados sutiles** alrededor de imágenes destacadas
2. **Números grandes en serif** para secciones (01, 02, 03)
3. **Transiciones suaves y lentas** entre secciones (fade in, parallax ligero)

**Filosofía de Interacción:**
- Hover sobre imágenes: zoom muy sutil (1.02x) + overlay oscuro con información
- Botones CTA: Minimalistas con borde dorado, fondo transparente
- Scroll suave y natural, sin animaciones agresivas

**Animaciones:**
- Fade-in al scroll (opacity: 0 → 1 en 800ms)
- Parallax muy sutil en hero (5-10% de movimiento)
- Hover en imágenes: zoom 1.02x + brillo sutil
- Transiciones de página: fade out/in en 400ms

**Sistema de Tipografía:**
- Títulos: Playfair Display (serif elegante, 700) - 3.5rem en desktop
- Subtítulos: Montserrat (sans-serif, 600) - 1.5rem
- Cuerpo: Inter (sans-serif, 400) - 1rem
- Jerarquía clara con espaciado generoso

**Probabilidad:** 0.08

---

## Enfoque 2: Energía Moderna con Gradientes Cálidos

**Movimiento de Diseño:** Diseño contemporáneo con influencias de movimiento artístico moderno (expresionismo digital)

**Principios Fundamentales:**
1. **Gradientes dinámicos como narrativa:** Transiciones suaves entre colores cálidos que evocan atardeceres y momentos dorados
2. **Formas orgánicas:** Bordes redondeados, divisores curvos, layouts fluidos
3. **Contenido en capas:** Múltiples niveles de profundidad visual
4. **Movimiento constante pero sutil:** Animaciones que dan sensación de vida

**Filosofía de Color:**
- Gradiente principal: Naranja cálido (oklch(0.65 0.15 45)) → Rosa suave (oklch(0.70 0.12 15))
- Fondo: Crema cálida (oklch(0.98 0.01 70))
- Acentos: Terracota profundo (oklch(0.55 0.12 35))
- Propósito: Evocar calidez, intimidad y momentos especiales

**Paradigma de Layout:**
- Secciones con fondo alternado (gradiente/sólido)
- Imágenes flotantes sobre fondos con sombras suaves
- Divisores curvos (SVG wave) entre secciones
- Contenido centrado con máximo ancho, pero con asimetría visual

**Elementos Distintivos:**
1. **Divisores SVG ondulados** entre secciones
2. **Tarjetas flotantes** con sombras suaves y bordes redondeados
3. **Iconos ilustrados** en lugar de iconos de línea

**Filosofía de Interacción:**
- Hover: Elevación (shadow aumenta), color se intensifica
- Botones CTA: Degradados, bordes redondeados, sombras suaves
- Scroll: Parallax en imágenes, fade-in en texto

**Animaciones:**
- Entrada de elementos: Scale (0.95 → 1) + fade-in en 600ms
- Hover en tarjetas: Elevación (shadow-lg → shadow-2xl) + scale 1.02
- Scroll parallax: Imágenes se mueven a 30% de la velocidad del scroll
- Animación de números: Contador que sube al llegar a viewport

**Sistema de Tipografía:**
- Títulos: Poppins (sans-serif moderno, 700) - 3rem
- Subtítulos: Poppins (600) - 1.5rem
- Cuerpo: Lato (sans-serif amigable, 400) - 1rem
- Énfasis: Colores en gradiente para palabras clave

**Probabilidad:** 0.07

---

## Enfoque 3: Documental Fotográfico Crudo

**Movimiento de Diseño:** Fotoperiodismo visual (estética de revista editorial, blanco y negro con toques de color)

**Principios Fundamentales:**
1. **Fotografía como contenido principal:** Las imágenes cuentan la historia, el diseño es soporte
2. **Tipografía audaz y editorial:** Grandes titulares con mucho contraste
3. **Diseño asimétrico y dinámico:** Inspirado en revistas de fotografía de alta gama
4. **Paleta de grises con un color de marca:** Blanco, gris, negro + un color vibrante (rojo, azul profundo)

**Filosofía de Color:**
- Fondo: Blanco puro (oklch(1 0 0)) con toques de gris muy claro
- Texto: Negro profundo (oklch(0.15 0.01 65))
- Acento de marca: Rojo vibrante (oklch(0.60 0.25 20)) o Azul profundo (oklch(0.45 0.15 260))
- Propósito: Crear impacto visual directo, editorial, profesional

**Paradigma de Layout:**
- Grid asimétrico (algunas imágenes grandes, otras pequeñas)
- Texto superpuesto sobre imágenes (con fondo semi-transparente)
- Márgenes amplios, tipografía grande
- Divisores simples (líneas horizontales, espacios en blanco)

**Elementos Distintivos:**
1. **Líneas gruesas de color de marca** como separadores
2. **Números grandes en tipografía sans-serif bold** para secciones
3. **Citas en serif italic** sobre imágenes

**Filosofía de Interacción:**
- Hover: Cambio de opacidad en imágenes, revelación de información
- Botones CTA: Fondo sólido del color de marca, texto blanco, bordes cuadrados
- Navegación: Visible y clara, con indicadores de sección

**Animaciones:**
- Entrada de imágenes: Fade-in + slide ligero (desde arriba/abajo)
- Hover en imágenes: Cambio de brillo/saturación
- Transiciones de página: Cortina vertical del color de marca
- Scroll: Revelación progresiva de contenido

**Sistema de Tipografía:**
- Títulos: Bebas Neue (sans-serif bold, 700) - 4rem
- Subtítulos: Roboto (sans-serif, 500) - 1.5rem
- Cuerpo: Roboto (sans-serif, 400) - 1rem
- Citas: Merriweather (serif, italic) - 1.2rem

**Probabilidad:** 0.06

---

## Resumen Comparativo

| Aspecto | Enfoque 1 | Enfoque 2 | Enfoque 3 |
|---------|-----------|-----------|-----------|
| **Atmósfera** | Lujo silencioso | Calidez moderna | Editorial directo |
| **Público** | Parejas sofisticadas | Parejas creativas | Parejas que valoran autenticidad |
| **Velocidad de carga** | Excelente (oscuro) | Buena | Excelente (simple) |
| **Editabilidad** | Alta (componentes simples) | Alta | Alta |
| **SEO** | Bueno | Bueno | Excelente (estructura clara) |
| **Seguridad** | Fácil de auditar | Fácil de auditar | Fácil de auditar |

