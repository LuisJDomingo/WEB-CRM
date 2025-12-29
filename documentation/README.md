# 📸 Narrativa de Bodas - Plataforma Web y Gestión Integral

Este proyecto es una solución completa para fotógrafos de bodas y eventos, que combina un sitio web público elegante y optimizado para SEO con un potente panel de administración (Backoffice) para la gestión del negocio, clientes y galerías privadas.

---

## 🚀 Características Principales

### 🌐 Parte Cliente (Web Pública)
Diseñada con un estilo "Minimalismo Contemporáneo Oscuro" para resaltar la fotografía.

*   **Páginas Informativas**: Inicio, Portafolio, Servicios y Contacto.
*   **Galerías Privadas**: Acceso seguro para clientes mediante token único y contraseña para ver y descargar sus fotos.
*   **Diseño Responsive**: Adaptado perfectamente a móviles, tablets y escritorio.
*   **Optimización**: Carga rápida de imágenes y SEO técnico implementado.
*   **Chatbot de Reservas**: Agente flotante para captación de leads y consultas rápidas.

### 🛠️ Parte Backoffice (Panel de Administración)
Un centro de control protegido para gestionar todo el flujo de trabajo.

*   **Dashboard**: Vista general del estado del negocio.
*   **CRM de Clientes**:
    *   Gestión de leads y clientes (estados: primer contacto, cita concertada, contratado, etc.).
    *   Historial de actividades y notas por cliente.
    *   Filtros avanzados y ordenación.
*   **Agenda y Calendario**:
    *   Gestión de citas y eventos.
    *   Control de disponibilidad (bloqueo de fechas).
*   **Gestión de Galerías**:
    *   Creación de galerías privadas con subida múltiple de imágenes.
    *   Generación de enlaces seguros para compartir.
    *   Gestión de fotos (añadir/eliminar) en galerías existentes.
*   **Gestión de Equipo**: Administración de usuarios (trabajadores) y roles.
*   **Agente Inteligente**: Hoja de ruta diaria y tareas automáticas.

---

## 💻 Stack Tecnológico

### Frontend
*   **Framework**: React 19 (Vite)
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS 4
*   **Routing**: Wouter
*   **UI Components**: Lucide React (iconos), Sonner (notificaciones).

### Backend
*   **Servidor**: Node.js con Express
*   **Base de Datos**: Supabase (PostgreSQL)
*   **Autenticación**: JWT (JSON Web Tokens) y Bcrypt para hashing de contraseñas.
*   **Archivos**: Multer para gestión de subida de imágenes.

---

## ⚙️ Instalación y Configuración

### 1. Prerrequisitos
*   Node.js (v18 o superior)
*   npm
*   Una cuenta y proyecto en [Supabase](https://supabase.com).

### 2. Clonar e Instalar

```bash
# Instalar dependencias
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto basándote en el archivo `.env.example` incluido.

```env
# .env.local

# Supabase (Obtener desde Project Settings > API)
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# Backend
VITE_API_URL="http://localhost:3001"
JWT_SECRET="tu_secreto_super_seguro_para_jwt"

# Opcional: Configuración de Email (SMTP) y Google Calendar
```

### 4. Base de Datos
Ejecuta los scripts SQL proporcionados en la documentación (`documentation/CREATE_GALLERY_TABLE.sql` y otros esquemas necesarios) en el editor SQL de tu proyecto en Supabase para crear las tablas necesarias (`clients`, `workers`, `private_galleries`, `bookings`, etc.).

---

## ▶️ Ejecución

El proyecto requiere ejecutar tanto el servidor de frontend como el de backend.

### Opción A: Todo en uno (Recomendado para desarrollo)

```bash
npm run dev:all
```
*(Nota: Asegúrate de tener configurado este script en package.json, o usa la Opción B)*

### Opción B: Terminales separadas

**Terminal 1 (Frontend):**
```bash
npm run dev
```
Acceso: `http://localhost:5174`

**Terminal 2 (Backend):**
```bash
npm run server
```
API: `http://localhost:3001`

---

## 📂 Estructura del Proyecto

```
├── public/             # Archivos estáticos y subidas de galería
├── server/             # Código del Backend (Express)
│   ├── routes/         # Rutas de la API
│   └── ...
├── src/                # Código del Frontend (React)
│   ├── components/     # Componentes reutilizables (Nav, Footer, etc.)
│   ├── contexts/       # Estado global (AuthContext)
│   ├── pages/          # Vistas (Home, AdminDashboard, PrivateGallery, etc.)
│   └── ...
├── documentation/      # Guías detalladas y diagramas
├── server.ts           # Punto de entrada del Backend
└── ...
```

---

## 🔐 Seguridad

*   **Rutas Protegidas**: El panel de administración (`/admin/*`) requiere autenticación JWT.
*   **Galerías Seguras**: Acceso mediante token único en URL + contraseña específica por galería.
*   **Datos Sensibles**: Las contraseñas se almacenan hasheadas (bcrypt). Las claves de API sensibles se mantienen en el backend o variables de entorno.


# Módulo de Gestión de Publicidad (Ads Manager)

Este documento detalla la arquitectura y requisitos para integrar la gestión de campañas de Facebook, Instagram y TikTok en el panel de administración existente.

## 1. Alcance del Módulo
El objetivo es permitir al administrador (fotógrafo):
1. Conectar sus cuentas publicitarias (OAuth).
2. Ver un dashboard unificado de rendimiento (Gasto, Clics, Conversiones).
3. Pausar o activar campañas existentes.
4. (Opcional) Crear anuncios rápidos basados en las galerías del sitio web.

## 2. Requisitos de Integración

### Meta (Facebook & Instagram)
- **Plataforma:** [Meta for Developers](https://developers.facebook.com/)
- **API:** Marketing API
- **Permisos:** `ads_management`, `ads_read`, `read_insights`.
- **Nivel de Acceso:** Se requiere "Standard Access" para uso en producción.

### TikTok
- **Plataforma:** TikTok for Business Developers
- **API:** TikTok Marketing API
- **Permisos:** `advertiser_management`, `reporting`.

## 3. Modelo de Datos (Schema Sugerido)

Para almacenar las credenciales y el caché de las campañas:

```sql
-- Tabla para credenciales de plataformas
CREATE TABLE ad_platforms (
    id INT PRIMARY KEY,
    provider VARCHAR(50), -- 'meta', 'tiktok'
    access_token TEXT,
    refresh_token TEXT,
    ad_account_id VARCHAR(100),
    token_expires_at DATETIME,
    is_active BOOLEAN DEFAULT false
);

-- Tabla para caché de métricas (actualización diaria/horaria)
CREATE TABLE ad_campaign_metrics (
    id INT PRIMARY KEY,
    platform_campaign_id VARCHAR(100),
    platform VARCHAR(50),
    spend DECIMAL(10, 2),
    impressions INT,
    clicks INT,
    date DATE
);
```

## 4. Endpoints del Backend (Diseño API)

Se necesitan rutas en el servidor para manejar la autenticación y la obtención de datos.

- `GET /api/ads/auth/{provider}`: Inicia el flujo OAuth.
- `GET /api/ads/callback/{provider}`: Recibe el código y obtiene el token.
- `GET /api/ads/campaigns`: Obtiene lista unificada de campañas activas.
- `POST /api/ads/campaign/{id}/toggle`: Pausa o activa una campaña.

## 5. Estrategia de Frontend (UI)

Siguiendo los lineamientos de diseño de `ideas.md`:

### Dashboard Unificado
- **Estilo:** Minimalista (Enfoque 1) o Moderno (Enfoque 2).
- **Tarjetas de Resumen:**
  - Gasto Total (Mes actual)
  - Costo por Lead (Parejas interesadas)
- **Gráfico Comparativo:** Líneas de colores (Azul para FB, Negro para TikTok) mostrando impresiones vs días.

### Componente de Gestión
```jsx
// Ejemplo conceptual (React)
const AdsDashboard = () => {
  const { data: campaigns } = useQuery('campaigns');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PlatformCard platform="meta" icon={<FaFacebook />} data={campaigns.meta} />
      <PlatformCard platform="tiktok" icon={<FaTiktok />} data={campaigns.tiktok} />
    </div>
  );
};
```

## 6. Pasos de Implementación
1. Registrar aplicaciones en los portales de desarrolladores de Meta y TikTok.
2. Implementar flujo OAuth en el backend.
3. Crear CRON jobs para sincronizar métricas cada hora (evitar límites de API).
4. Construir la interfaz en el Admin Panel.
