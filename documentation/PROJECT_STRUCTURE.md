# Estructura del Proyecto

## Raíz del Proyecto
- `.env.local`: Variables de entorno para configuración (Supabase, API, SMTP, etc.).
- `server.ts`: Punto de entrada del servidor Backend (Express). Configuración de API, conexión a Supabase y rutas principales.

## Backend (`/server`)
- `routes/`
  - `workers.ts`: Rutas de la API para la gestión de trabajadores (CRUD: Listar, Crear, Eliminar).

## Frontend (`/src`)
- `App.tsx`: Componente principal, configuración de rutas (Router) y proveedores globales.
- `Layout.tsx`: Estructura base de la aplicación (Header, Footer), con lógica condicional para mostrar una cabecera distinta en el panel de administración.
- `index.css`: Estilos globales (Tailwind CSS).

### Componentes (`/src/components`)
- `AdminPageLayout.tsx`: Plantilla reutilizable para páginas del panel de administración (título, botón volver, contenedor).
- `BookingAgent.tsx`: Chatbot flotante para reservas automáticas.
- `ErrorBoundary.tsx`: Manejo de errores en la interfaz de usuario.
- `Footer.tsx`: Pie de página para la parte pública.
- `GalleryDashboard.tsx`: Panel de visualización y gestión de galerías existentes.
- `GalleryManager.tsx`: Gestor para crear y subir nuevas galerías privadas.
- `Navigation.tsx`: Barra de navegación para la parte pública.
- `ui/`: Componentes de interfaz genéricos (Sonner para notificaciones, Tooltip, etc.).

### Contextos (`/src/contexts`)
- `AuthContext.tsx`: Manejo del estado de autenticación (Usuario, Token, Login, Logout).

### Páginas (`/src/pages`)
#### Públicas
- `Home.tsx`: Página de inicio.
- `Portfolio.tsx`: Portafolio de trabajos fotográficos.
- `Services.tsx`: Información de servicios.
- `Contact.tsx`: Formulario de contacto.
- `PrivateGallery.tsx`: Visualización de galerías privadas para clientes (protegidas por contraseña).
- `NotFound.tsx`: Página de error 404.

#### Administración (Panel de Control)
- `AdminDashboard.tsx`: Panel principal (Dashboard) con accesos directos a las diferentes herramientas.
- `AdminAgenda.tsx`: Calendario interactivo para gestión de citas y eventos.
- `AdminCrm.tsx`: Gestión de clientes (CRM), listado, filtrado y fichas detalladas con historial y notas.
- `AdminCrmHub.tsx`: Centro de navegación agrupado para herramientas CRM (Clientes, Pipeline).
- `AdminGallery.tsx`: Página contenedora para la gestión de galerías (usa GalleryDashboard y GalleryManager).
- `AdminPipeline.tsx`: Visualización del embudo de ventas tipo Kanban (arrastrar y soltar).
- `AdminTasks.tsx`: Hoja de ruta diaria (Agente inteligente) y gestión de tareas administrativas (manuales o importadas de Sheets).
- `AdminTaskRules.tsx`: Configuración de reglas de negocio para la generación automática de alertas en la hoja de ruta.
- `AdminUsers.tsx`: Gestión de equipo (Alta y baja de trabajadores y asignación de roles).

## Base de Datos (Supabase)
- Tablas principales: `clients`, `workers`, `bookings`, `private_galleries`, `contact_messages`, `client_activities`.
- Autenticación: Gestión de usuarios y roles mediante tabla `workers` y JWT.