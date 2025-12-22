# INSTRUCCIONES PARA CONFIGURAR SUPABASE

## 1. Crear cuenta en Supabase
- Ve a https://supabase.com
- Registrate con tu email
- Crea un nuevo proyecto

## 2. Obtener credenciales
- En el dashboard de Supabase, ve a Settings > API
- Copia la URL del proyecto (VITE_SUPABASE_URL)
- Copia la clave anon pública (VITE_SUPABASE_ANON_KEY)

## 3. Crear tabla en Supabase
Ejecuta este SQL en el editor SQL de Supabase:

```sql
CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  event_type VARCHAR(50) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_contact_email ON contact_messages(email);
CREATE INDEX idx_contact_created_at ON contact_messages(created_at DESC);
```

## 4. Habilitar RLS (Row Level Security)
- En Supabase, ve a Authentication > Policies
- Habilita RLS en la tabla contact_messages
- Crea una política que permita INSERT sin autenticación

```sql
CREATE POLICY "Allow public inserts" ON contact_messages
FOR INSERT
WITH CHECK (true);
```

## 5. Agregar variables de entorno
Actualiza .env.local con:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

## 6. Instalar dependencias
```bash
npm install @supabase/supabase-js express cors typescript
```

## 7. Iniciar servidor backend
```bash
npx ts-node server.ts
```
