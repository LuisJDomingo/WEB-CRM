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