# Configuración de Base de Datos SQL (Supabase)

## Resumen
Tu formulario de contacto ahora envía los datos a una base de datos SQL PostgreSQL alojada en Supabase.

## Pasos para configurar:

### 1. Crear cuenta Supabase
- Ve a https://supabase.com
- Haz clic en "Sign Up"
- Crea una cuenta con tu email

### 2. Crear un nuevo proyecto
- Haz clic en "New Project"
- Elige un nombre (ej: "narrativabodas")
- Crea una contraseña fuerte para la base de datos
- Selecciona la región más cercana
- Espera a que se cree (toma ~2 minutos)

### 3. Obtener credenciales
- En el panel de Supabase, ve a **Settings** > **API**
- Copia la **Project URL** (ejemplo: https://xxxxx.supabase.co)
- Copia la **anon public** key
- Pega estos valores en `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-aqui
```

### 4. Crear tabla en la base de datos
- En Supabase, ve a **SQL Editor**
- Crea una nueva consulta
- Copia y ejecuta este SQL:

```sql
-- Crear tabla para mensajes de contacto
CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  event_type VARCHAR(50) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_contact_email ON contact_messages(email);
CREATE INDEX idx_contact_created_at ON contact_messages(created_at DESC);

-- Habilitar RLS (seguridad de filas)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Permitir que el público inserte (sin autenticación)
CREATE POLICY "Allow public inserts" ON contact_messages
  FOR INSERT
  WITH CHECK (true);
```

### 5. Iniciar los servidores

**Opción A: En 2 terminales separadas**

Terminal 1 - Backend (API):
```bash
npx ts-node server.ts
```

Terminal 2 - Frontend:
```bash
npm run dev
```

**Opción B: Script único (Linux/Mac):**
```bash
bash start-all.sh
```

### 6. Verificar que funciona
- Abre http://localhost:5173
- Completa el formulario de contacto
- Envía un mensaje
- En Supabase, ve a **Table Editor** > **contact_messages** para ver los datos guardados

## Estructura de datos guardados

Cada mensaje contiene:
- `id` - Identificador único
- `name` - Nombre del cliente
- `email` - Email del cliente
- `phone` - Teléfono (opcional)
- `event_type` - Tipo de evento (boda, corporativo, etc.)
- `message` - Mensaje enviado
- `created_at` - Fecha y hora de registro

## Próximos pasos opcionales

1. **Admin Panel**: Crear página para ver todos los mensajes
2. **Email Notifications**: Enviar correos cuando llegan mensajes
3. **Analytics**: Ver estadísticas de contactos
4. **Autenticación**: Proteger acceso al backend

## Soporte

Si tienes problemas:
- Verifica que Supabase está activo
- Comprueba que las credenciales en `.env.local` son correctas
- Revisa la consola del navegador para errores
- Revisa el servidor backend en terminal
