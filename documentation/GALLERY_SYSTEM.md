# Sistema de Galerías Privadas - Guía de Uso

## 📋 Descripción General

Sistema completo de galerías privadas con autenticación JWT y contraseña para compartir fotos de eventos con clientes de forma segura.

## 🚀 Cómo Usar

### 1. Acceder al Panel de Administración

- Navega a: `http://localhost:5173/admin/gallery`
- Contraseña por defecto: `admin123` ⚠️ **CAMBIAR EN PRODUCCIÓN**

### 2. Crear una Nueva Galería

1. Ingresa los siguientes datos:
   - **Nombre del cliente**: Ej: "Juan y María López"
   - **Email del cliente**: Ej: "juan@email.com"
   - **Fecha del evento**: Selecciona la fecha de la boda/evento
   - **Contraseña**: Crea una contraseña segura para el acceso

2. Haz clic en "Crear Galería"

3. Se generará automáticamente:
   - Un **link único** con token JWT (válido 90 días)
   - Un **hash seguro** de la contraseña (bcrypt)

### 3. Enviar Link al Cliente

Una vez creada la galería:

1. Copia el link haciendo clic en el botón "Copiar"
2. Haz clic en "Enviar por Email" para enviar el link automáticamente
3. El email incluye:
   - Link de acceso personalizado
   - Nombre del cliente
   - Contraseña temporal
   - Instrucciones de seguridad

### 4. Cliente Accede a su Galería

El cliente recibe un email con:
- Un link como: `http://localhost:5173/gallery/{token}`
- Su contraseña temporal

Al hacer clic:
1. Se presenta una pantalla de login
2. Ingresa la contraseña
3. Gana acceso a sus fotos en una galería privada

## 🔐 Características de Seguridad

- ✅ **JWT Token**: Expira en 90 días
- ✅ **Bcrypt Hash**: Contraseñas hasheadas con 10 rondas de sal
- ✅ **CORS Habilitado**: Comunicación segura entre frontend y backend
- ✅ **Autenticación en Dos Pasos**: Token + Contraseña
- ✅ **Sesión Segura**: Token de sesión almacenado localmente

## 📁 Estructura de Base de Datos

### Tabla: `private_galleries`

```sql
CREATE TABLE private_galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days'),
  images JSONB, -- Array de URLs de imágenes
  deleted_at TIMESTAMP
);
```

## 🔧 Configuración

### Variables de Entorno Necesarias

En `.env.local`:
```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
JWT_SECRET=tu_clave_secreta_jwt
```

### Endpoints API

#### POST `/api/gallery/create`
Crear nueva galería privada

**Request:**
```json
{
  "clientName": "Juan López",
  "clientEmail": "juan@email.com",
  "eventDate": "2024-06-15",
  "password": "micontraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "gallery": {
    "id": "uuid",
    "client_name": "Juan López",
    "client_email": "juan@email.com",
    "event_date": "2024-06-15",
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-04-15T10:30:00Z"
  },
  "accessLink": "http://localhost:5173/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/gallery/verify`
Verificar contraseña y obtener sesión

**Request:**
```json
{
  "token": "jwt_token_aqui",
  "password": "micontraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "token_de_sesion",
  "gallery": { /* datos de galería */ }
}
```

#### GET `/api/gallery/:token`
Obtener detalles de galería (requiere JWT válido)

**Response:**
```json
{
  "success": true,
  "gallery": {
    "id": "uuid",
    "client_name": "Juan López",
    "client_email": "juan@email.com",
    "event_date": "2024-06-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/api/gallery/send-link`
Enviar link de galería por email

**Request:**
```json
{
  "email": "cliente@email.com",
  "accessLink": "http://localhost:5173/gallery/...",
  "clientName": "Juan López",
  "password": "micontraseña123"
}
```

## 📸 Agregar Imágenes a la Galería

Las imágenes se pueden almacenar de dos formas:

### Opción 1: Supabase Storage
```typescript
// En el servidor
const { data } = await supabase
  .storage
  .from('wedding-photos')
  .upload(`${galleryId}/photo.jpg`, file);
```

### Opción 2: URLs Externas
Simplemente agrega URLs a la columna `images` en la tabla:
```sql
UPDATE private_galleries 
SET images = json_build_array(
  'https://cdn.example.com/photo1.jpg',
  'https://cdn.example.com/photo2.jpg'
)
WHERE id = 'gallery_id';
```

## 🚨 Precauciones de Seguridad

1. **CAMBIAR CONTRASEÑA DE ADMIN**: No usar `admin123` en producción
2. **PROTEGER JWT_SECRET**: Usar una clave aleatoria fuerte
3. **HTTPS EN PRODUCCIÓN**: Siempre usar HTTPS
4. **Rate Limiting**: Implementar limitación de intentos de login
5. **HTTPS COOKIES**: Almacenar tokens en cookies seguras (httpOnly)

## 📧 Implementar Emails Reales

Actualmente solo simula envíos. Para emails reales:

### Opción 1: Nodemailer
```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

await transporter.sendMail({
  to: email,
  subject: 'Tu galería privada está lista',
  html: emailHTML,
});
```

### Opción 2: SendGrid
```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: 'noreply@tudominio.com',
  subject: 'Tu galería privada está lista',
  html: emailHTML,
});
```

## 🐛 Troubleshooting

### Error: "Token inválido o expirado"
- El link tiene más de 90 días
- El token JWT fue modificado
- El servidor tiene una hora incorrecta

### Error: "Contraseña incorrecta"
- Verifica que está escrita exactamente (case-sensitive)
- Copia la contraseña del email de forma exacta

### Error: "CORS bloqueado"
- Asegúrate que el servidor está corriendo en puerto 3001
- Verifica que CORS está habilitado en server.ts

## 📱 Responsive Design

La galería privada es totalmente responsive:
- ✅ Desktop: Grid de 4 columnas
- ✅ Tablet: Grid de 2-3 columnas
- ✅ Mobile: Grid de 1 columna

## ⚙️ Próximas Mejoras

- [ ] Integración de Cloudinary/Imgix para imágenes
- [ ] Descargas en lote (ZIP)
- [ ] Galería con lightbox mejorado
- [ ] Estadísticas de visualización
- [ ] Control de expiración de galería
- [ ] Recaptcha para login
- [ ] Two-factor authentication (2FA)
