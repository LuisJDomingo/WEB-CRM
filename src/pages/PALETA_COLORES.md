# 🎨 Paleta de Colores - Proyecto Fotoperiodismo

Este proyecto utiliza una paleta **"Editorial Bold"**, inspirada en revistas clásicas como *Time* o *Life*. Se basa en un alto contraste (Blanco/Negro) para la legibilidad y un **Rojo Carmesí** intenso para guiar la atención.

## ☀️ Modo Claro (Light Mode)

| Variable CSS | Valor OKLCH | Hexadecimal (Aprox.) | Uso Principal |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(0.99 0 0)` | **#FCFCFC** | Fondo principal (Blanco papel puro) |
| `--foreground` | `oklch(0.15 0 0)` | **#262626** | Texto principal (Gris tinta muy oscuro) |
| `--primary` | `oklch(0.10 0 0)` | **#1A1A1A** | Elementos sólidos, encabezados, botones oscuros |
| `--primary-foreground` | `oklch(0.98 0 0)` | **#FAFAFA** | Texto sobre botones primarios |
| **`--accent`** | **`oklch(0.52 0.22 29)`** | **#D22030** | **Rojo Carmesí (Color de Marca, Bordes, CTA)** |
| `--secondary` | `oklch(0.96 0 0)` | **#F5F5F5** | Fondos secundarios, bloques de contenido |
| `--muted` | `oklch(0.92 0 0)` | **#EBEBEB** | Fondos sutiles, elementos deshabilitados |
| `--muted-foreground` | `oklch(0.45 0 0)` | **#737373** | Texto secundario, metadatos, fechas |
| `--border` | `oklch(0.85 0 0)` | **#D9D9D9** | Líneas divisorias, bordes de inputs |
| `--destructive` | `oklch(0.55 0.20 20)` | **#C92A2A** | Errores, acciones destructivas (Borrar) |

## 🌙 Modo Oscuro (Dark Mode)

| Variable CSS | Valor OKLCH | Hexadecimal (Aprox.) | Uso Principal |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(0.10 0 0)` | **#1A1A1A** | Fondo principal (Negro profundo) |
| `--foreground` | `oklch(0.98 0 0)` | **#FAFAFA** | Texto principal (Blanco) |
| `--primary` | `oklch(0.98 0 0)` | **#FAFAFA** | Botones primarios (Blanco en modo oscuro) |
| **`--accent`** | **`oklch(0.55 0.22 29)`** | **#DE2839** | **Rojo Vibrante (Ajustado para fondo oscuro)** |
| `--card` | `oklch(0.12 0 0)` | **#1F1F1F** | Tarjetas, modales, paneles flotantes |
| `--border` | `oklch(0.25 0 0)` | **#404040** | Bordes en modo oscuro |

## 📊 Gráficos y Datos

| Variable | Valor OKLCH | Hex (Aprox.) | Color |
| :--- | :--- | :--- | :--- |
| `--chart-1` | `oklch(0.52 0.22 29)` | **#D22030** | Rojo Principal |
| `--chart-2` | `oklch(0.25 0 0)` | **#404040** | Gris Oscuro / Negro |
| `--chart-3` | `oklch(0.60 0 0)` | **#999999** | Gris Medio |
| `--chart-4` | `oklch(0.85 0 0)` | **#D9D9D9** | Gris Claro |
| `--chart-5` | `oklch(0.40 0.15 30)` | **#9E2A2B** | Rojo Oscuro / Vino |

---

### Notas de Implementación
- **Tipografía:** Se usa *Playfair Display* para títulos (elegancia) y *Nunito/Roboto* para cuerpo (legibilidad).
- **Bordes:** El radio de borde (`--radius`) es de `0.25rem` (4px), creando esquinas casi rectas para un look más serio y periodístico.
- **Sombras:** Se utilizan sombras duras o muy difusas en negro para mantener el contraste sobre las fotografías.