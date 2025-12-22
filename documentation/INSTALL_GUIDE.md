# Instalación y Configuración del Sistema de Galerías Privadas

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Cuenta en Supabase (https://supabase.com)
- VS Code o editor similar

## 🚀 Paso 1: Configurar Base de Datos en Supabase

### 1.1 Crear tabla en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el editor SQL
3. Copia y pega el contenido de `CREATE_GALLERY_TABLE.sql`
4. Ejecuta las sentencias SQL

El archivo SQL crea:
- ✅ Tabla `private_galleries`
- ✅ Índices para optimizar búsquedas
- ✅ Vista `active_galleries`
- ✅ Tabla de auditoría `gallery_access_logs`
- ✅ Funciones de administración

### 1.2 Desactivar RLS (Row Level Security)

Si tienes problemas con permisos:
1. Ve a "Authentication" → "Policies" en Supabase
2. Selecciona tabla `private_galleries`
3. Elimina o deshabilita las políticas RLS
4. Ejecuta: `ALTER TABLE private_galleries DISABLE ROW LEVEL SECURITY;`

## 🔧 Paso 2: Configurar Variables de Entorno

### 2.1 Archivo `.env.local`

En la raíz del proyecto, asegúrate de tener:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria_aqui_123456789
NODE_ENV=development
```

Para obtener los valores:
1. Ve a Supabase Dashboard
2. Settings → API
3. Copia `Project URL` y `anon public key`
4. Crea `JWT_SECRET` con un texto aleatorio fuerte

## 📦 Paso 3: Instalar Dependencias

```bash
# Navega al directorio del proyecto
cd "c:\Users\luisd\Downloads\Diseño de Web Segura para Fotógrafos de narrativabodas (2)"

# Instala todas las dependencias
npm install
```

Las siguientes dependencias ya deberían estar instaladas:
- `express` - Servidor backend
- `@supabase/supabase-js` - Cliente Supabase
- `bcryptjs` - Hash de contraseñas
- `jsonwebtoken` - Tokens JWT
- `cors` - Manejo de CORS
- `dotenv` - Variables de entorno

Si falta alguna:
```bash
npm install express @supabase/supabase-js bcryptjs jsonwebtoken cors dotenv typescript ts-node
```

## ▶️ Paso 4: Iniciar Servidores

Necesitas abrir **DOS** terminales:

### Terminal 1: Servidor Frontend (Vite)
```bash
npm run dev
```

Salida esperada:
```
VITE v6.4.1  ready in 123 ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.129:5173/
```

### Terminal 2: Servidor Backend (Express)
```bash
npm run server
```

Salida esperada:
```
Servidor corriendo en puerto 3001
```

## 🧪 Paso 5: Probar el Sistema

### 5.1 Acceder al Panel de Administración

1. Abre: `http://localhost:5173/admin/gallery`
2. Contraseña: `admin123` (⚠️ **CAMBIAR después**)
3. Deberías ver el formulario para crear galerías

### 5.2 Crear una Galería de Prueba

Rellena con:
- Nombre: "Juan García"
- Email: "juan@example.com"
- Fecha: 2024-06-15
- Contraseña: "test123456"

Deberías ver:
- ✅ Galería creada exitosamente
- ✅ Link de acceso generado
- ✅ Botón para copiar link
- ✅ Botón para enviar por email

### 5.3 Acceder a la Galería Privada

1. Copia el link que se generó
2. Abre en nueva pestaña (ej: `http://localhost:5173/gallery/eyJ...`)
3. Ingresa contraseña: "test123456"
4. Deberías ver la galería con fotos de prueba

## 🔐 Paso 6: Seguridad - Cambiar Contraseña de Admin

### En `src/pages/AdminGallery.tsx`

Busca esta línea:
```typescript
const ADMIN_PASSWORD = 'admin123'; // CAMBIAR EN PRODUCCIÓN
```

Cámbiala a una contraseña fuerte:
```typescript
const ADMIN_PASSWORD = 'miContraseñaSuperSegura@2024#!'; // Cambiada
```

Para máxima seguridad, muévela a una variable de entorno:
```typescript
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'admin123';
```

Luego en `.env.local`:
```env
VITE_ADMIN_PASSWORD=miContraseñaSuperSegura@2024#!
```

## 📧 Paso 7: Implementar Emails Reales (Opcional)

### Con SendGrid (Recomendado)

1. Crea cuenta en https://sendgrid.com
2. Obtén API key
3. Instala dependencia:
```bash
npm install @sendgrid/mail
```

4. Actualiza `server/routes/gallery.ts`:
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// En endpoint POST /gallery/send-link:
await sgMail.send({
  to: email,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Tu galería privada está lista',
  html: emailHTML,
});
```

5. Agrega a `.env.local`:
```env
SENDGRID_API_KEY=tu_api_key_aqui
SENDGRID_FROM_EMAIL=noreply@tustominio.com
```

## 📁 Estructura de Carpetas

```
proyecto/
├── src/
│   ├── pages/
│   │   ├── PrivateGallery.tsx      ← Galería privada (cliente)
│   │   ├── AdminGallery.tsx        ← Panel de admin
│   │   └── ...otras páginas
│   ├── components/
│   │   ├── GalleryManager.tsx      ← Creador de galerías
│   │   └── ...otros componentes
│   └── App.tsx
├── server/
│   └── routes/
│       └── gallery.ts             ← Rutas de API de galería
├── server.ts                       ← Servidor Express principal
├── CREATE_GALLERY_TABLE.sql        ← Script de base de datos
├── GALLERY_SYSTEM.md              ← Guía de uso
├── INSTALL_GUIDE.md              ← Este archivo
├── .env.local                     ← Variables de entorno
├── package.json
└── tsconfig.json
```

## 🐛 Troubleshooting

### Error: "ENOENT: no such file or directory .env.local"
**Solución:** Crea el archivo `.env.local` en la raíz del proyecto

### Error: "Cannot find module '@supabase/supabase-js'"
**Solución:** 
```bash
npm install @supabase/supabase-js
```

### Error: "Servidor no responde en puerto 3001"
**Solución:** 
- Verifica que ejecutaste `npm run server`
- Revisa que el puerto 3001 no está en uso
- Comprueba que los logs muestren "Servidor corriendo en puerto 3001"

### Error: "CORS error bloqueado"
**Solución:**
- Asegúrate que el frontend está en `http://localhost:5173`
- El backend debe estar corriendo en `http://localhost:3001`
- Verifica que CORS está habilitado en server.ts

### Error: "RLS policy blocking inserts"
**Solución:**
```sql
ALTER TABLE private_galleries DISABLE ROW LEVEL SECURITY;
```

## ✅ Checklist de Configuración Completa

- [ ] Proyecto clonado/creado
- [ ] Cuenta Supabase creada
- [ ] Tabla `private_galleries` creada con SQL
- [ ] `.env.local` configurado con credenciales Supabase
- [ ] `npm install` ejecutado exitosamente
- [ ] `npm run dev` inició frontend sin errores
- [ ] `npm run server` inició backend sin errores
- [ ] Galería de prueba creada en admin panel
- [ ] Cliente accedió a galería privada exitosamente
- [ ] Contraseña de admin cambiada
- [ ] Variables de entorno seguras configuradas

## 🚀 Despliegue a Producción

### Antes de publicar:

1. **Cambiar ADMIN_PASSWORD** a algo seguro
2. **Implementar emails reales** (SendGrid/Nodemailer)
3. **Activar HTTPS** en servidor
4. **Implementar rate limiting** para login
5. **Configurar cookies seguras** (httpOnly, secure, sameSite)
6. **Hacer backup** de base de datos
7. **Configurar CORS** solo para tu dominio:
   ```typescript
   const cors = require('cors');
   app.use(cors({
     origin: 'https://tumomio.com',
     credentials: true
   }));
   ```

## 📞 Soporte

Para problemas con:
- **Supabase**: Visita https://supabase.com/docs
- **Express/Node**: Visita https://expressjs.com/es/
- **React/Frontend**: Visita https://react.dev

---

**¡Listo!** Tu sistema de galerías privadas está configurado. 🎉
