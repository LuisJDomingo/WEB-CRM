# Sistema de Galerías Privadas - Flujo Visual

## 🎯 Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE SOLICITA FOTOS                         │
│                    (Rellena formulario de contacto)               │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATOS GUARDADOS EN SUPABASE                          │
│              (contact_messages table)                             │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         FOTÓGRAFO REVISA EN PANEL DE CONTACTO                     │
│         (Vuelve a sitio cuando listas las fotos)                 │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│      FOTÓGRAFO ACCEDE: http://localhost:5173/admin/gallery       │
│      Ingresa contraseña admin                                     │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         FOTÓGRAFO CREA NUEVA GALERÍA PRIVADA                      │
│         Datos: Nombre, Email, Fecha Evento, Contraseña            │
└────────────────┬──────────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────┐    ┌──────────────────────┐
│ BCRYPT HASH  │    │  JWT TOKEN GENERADO  │
│ Contraseña   │    │  (Válido 90 días)    │
└──────┬───────┘    └──────┬───────────────┘
       │                   │
       └───────┬───────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│    GUARDAR EN SUPABASE (private_galleries table)                  │
│    - password_hash (bcrypt)                                       │
│    - access_token (JWT)                                           │
│    - client_name, client_email, event_date                        │
│    - created_at, expires_at (90 días adelante)                    │
└────────────────┬──────────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────┐
│  LINK GENERADO       │  │  EMAIL ENVIADO A CLIENTE │
│  /gallery/{token}    │  │  Con contraseña incluida │
└──────────┬───────────┘  └──────────┬───────────────┘
           │                         │
           └─────────┬───────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│         CLIENTE RECIBE EMAIL CON INSTRUCCIONES                    │
│         Link: http://localhost:5173/gallery/{token}               │
│         Contraseña: [lo que el fotógrafo configuró]              │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│     CLIENTE HACE CLIC EN LINK (dentro de 90 días)                │
│     Se abre página de login: GET /gallery/:token                 │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│      CLIENTE INGRESA CONTRASEÑA                                   │
│      POST /api/gallery/verify                                     │
│      Body: { token, password }                                    │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│    VERIFICACIÓN EN BACKEND                                        │
│    1. Verificar JWT válido (jwt.verify)                           │
│    2. Comparar password con hash (bcrypt.compare)                 │
│    3. Si OK → retornar sessionToken                               │
└────────────────┬──────────────────────────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
     ▼                       ▼
  ✅ CORRECTO            ❌ INCORRECTO
     │                       │
     ▼                       ▼
 sessionToken           Error: "Contraseña
 guardado en           incorrecta"
 localStorage          (Volver a intentar)
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│     CLIENTE VE SU GALERÍA DE FOTOS                                │
│     GET /api/gallery/:token (con JWT válido)                      │
│     Muestra:                                                       │
│     - Nombre del cliente                                           │
│     - Fotos en grid responsive                                    │
│     - Botones de descarga                                         │
│     - Botón cerrar sesión                                         │
└────────────────┬──────────────────────────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
     ▼                       ▼
 DESCARGAR FOTOS      CERRAR SESIÓN
     │                    │
     ▼                    ▼
sessionToken se      sessionToken
elimina localStorage eliminado localStorage
```

## 🔐 Flujo de Seguridad - Detalle Técnico

```
ADMIN LOGIN
───────────
contraseña "admin123"
    │
    ▼
localStorage.setItem('adminSession', 'true')
    │
    ▼
Acceso a /admin/gallery permitido


CREAR GALERÍA
─────────────
1. Recibir datos: clientName, clientEmail, eventDate, password
2. Hash password con bcrypt:
   saltRounds = 10
   passwordHash = await bcrypt.hash(password, 10)
   Ejemplo: "test123" → "$2a$10$eFYVEhDlSEDF..."
   
3. Generar JWT token:
   const token = jwt.sign(
     { email: clientEmail, name: clientName },
     JWT_SECRET,
     { expiresIn: '90d' }
   )
   
4. Guardar en Supabase:
   INSERT INTO private_galleries (
     client_name, client_email, event_date,
     password_hash, access_token,
     created_at, expires_at
   ) VALUES (...)
   
5. Generar link único:
   accessLink = "http://localhost:5173/gallery/{token}"


CLIENTE ACCEDE A GALERÍA
────────────────────────
1. GET /gallery/:token
   ├─ Mostrar formulario de login
   └─ Almacenar token en estado

2. Usuario ingresa contraseña
3. POST /api/gallery/verify
   ├─ Verificar JWT: jwt.verify(token, JWT_SECRET)
   │  └─ Si expira (>90 días): Error 401
   │
   ├─ Buscar en BD: SELECT * FROM private_galleries WHERE access_token = token
   │  └─ Si no existe: Error 404
   │
   ├─ Comparar password: await bcrypt.compare(password, password_hash)
   │  ├─ Si correcto: retornar sessionToken
   │  └─ Si incorrecto: Error 401 "Contraseña incorrecta"
   │
   └─ Guardar sessionToken en localStorage

4. Mostrar galería con fotos
5. Para descargar: Cliente puede descargar directamente

6. Cerrar sesión:
   ├─ Eliminar sessionToken de localStorage
   ├─ Volver a formulario de login
   └─ Requiere contraseña nuevamente
```

## 📊 Tabla de Transiciones de Estado

```
┌─────────────────────┬───────────────────┬──────────────────────┐
│ ESTADO ACTUAL       │ ACCIÓN            │ NUEVO ESTADO         │
├─────────────────────┼───────────────────┼──────────────────────┤
│ Página Inicio       │ Click "Contacto"  │ Formulario Contacto  │
│ Formulario Contacto │ Submit            │ Mensaje en Supabase  │
│ -                   │ Admin accede      │ Admin Login          │
│ Admin Login         │ Contraseña OK     │ Admin Dashboard      │
│ Admin Dashboard     │ Click "Nueva"     │ Crear Galería        │
│ Crear Galería       │ Submit            │ Galería Creada       │
│ Galería Creada      │ Click "Copiar"    │ Link en Clipboard    │
│ Galería Creada      │ Click "Email"     │ Email Enviado        │
│ -                   │ Cliente abre link │ Login Galería        │
│ Login Galería       │ Contraseña OK     │ Galería Privada      │
│ Galería Privada     │ Click Descarga    │ Foto Descargada      │
│ Galería Privada     │ Click Logout      │ Login Galería        │
│ Galería Privada     │ Token expira      │ Acceso Denegado      │
└─────────────────────┴───────────────────┴──────────────────────┘
```

## 🌐 URLs del Sistema

```
FRONTEND (Vite)
───────────────
http://localhost:5173/                    → Página Inicio
http://localhost:5173/portfolio           → Portafolio
http://localhost:5173/servicios           → Servicios
http://localhost:5173/contacto            → Formulario Contacto
http://localhost:5173/admin/gallery       → Panel Administración
http://localhost:5173/gallery/:token      → Galería Privada Cliente


BACKEND API (Express)
─────────────────────
POST   http://localhost:3001/api/contact              → Crear contacto
GET    http://localhost:3001/api/contact/admin        → Listar contactos

POST   http://localhost:3001/api/gallery/create       → Crear galería
POST   http://localhost:3001/api/gallery/verify       → Verificar login
GET    http://localhost:3001/api/gallery/:token       → Obtener datos
POST   http://localhost:3001/api/gallery/send-link    → Enviar email
```

## 📈 Diagrama de Componentes

```
┌───────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                          │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                │
│  │  Layout         │  │  Router          │                │
│  │  (Header/Nav/   │  │  (Wouter)        │                │
│  │   Footer)       │  │                  │                │
│  └────────┬────────┘  └────────┬─────────┘                │
│           │                    │                           │
│           ├────────┬───────────┴───────────┐              │
│           │        │                       │              │
│     ┌─────▼──┐  ┌──▼──────┐  ┌──▼───────┐ │              │
│     │ Pages  │  │ Pages   │  │ Pages    │ │              │
│     │ (Home, │  │(Private │  │(Admin    │ │              │
│     │Portfolio│  │Gallery) │  │Gallery)  │ │              │
│     └────────┘  └─────────┘  └──────────┘ │              │
│                                            │              │
│  ┌────────────────────────────────────────┼────┐          │
│  │  Components                            │    │          │
│  │  ┌─────────────────────────────────┐  │    │          │
│  │  │ GalleryManager                  │  │    │          │
│  │  │ (Crear galerías)                │  │    │          │
│  │  └─────────────────────────────────┘  │    │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
└───────────────────┬───────────────────────────────────────┘
                    │ HTTP Requests
                    │ (fetch API)
                    ▼
        ┌─────────────────────────────┐
        │  EXPRESS BACKEND (PORT 3001) │
        ├─────────────────────────────┤
        │                              │
        │  ┌──────────────────────┐   │
        │  │ Contact Routes       │   │
        │  │ POST /api/contact    │   │
        │  │ GET  /api/contact/.. │   │
        │  └──────────────────────┘   │
        │                              │
        │  ┌──────────────────────┐   │
        │  │ Gallery Routes       │   │
        │  │ POST /gallery/create │   │
        │  │ POST /gallery/verify │   │
        │  │ GET  /gallery/:token │   │
        │  │ POST /gallery/send.. │   │
        │  └──────────────────────┘   │
        │                              │
        └──────────┬───────────────────┘
                   │ Supabase SDK
                   │ (HTTP/WebSocket)
                   ▼
        ┌──────────────────────────────┐
        │  SUPABASE (PostgreSQL)        │
        ├──────────────────────────────┤
        │                               │
        │ Tables:                       │
        │ • contact_messages           │
        │ • private_galleries          │
        │ • gallery_access_logs        │
        │                               │
        └──────────────────────────────┘
```

## 🔄 Ciclo de Vida de una Galería

```
1️⃣ CREACIÓN
   └─ Timestamp: created_at = ahora
   └─ Expiración: expires_at = ahora + 90 días
   └─ Token: válido por 90 días
   └─ Estado: ACTIVA

2️⃣ COMPARTIDA
   └─ Email enviado a cliente
   └─ Cliente recibe link + contraseña
   └─ Estado: COMPARTIDA

3️⃣ ACCEDIDA
   └─ Cliente ingresa contraseña
   └─ Registrado en gallery_access_logs
   └─ Cliente ve fotos
   └─ Estado: EN_USO

4️⃣ EXPIRACIÓN AUTOMÁTICA
   └─ Después de 90 días:
      └─ Token JWT no válido
      └─ Acceso denegado
      └─ Estado: EXPIRADA (si no se elimina manualmente)

5️⃣ ELIMINACIÓN MANUAL
   └─ Admin puede eliminar galería
   └─ deleted_at = fecha de eliminación
   └─ Soft delete (datos permanecen en BD)
   └─ Estado: ELIMINADA
```

## 💾 Flujo de Datos (POST /api/gallery/create)

```
CLIENTE (Frontend)
│
├─ Form Data:
│  ├─ clientName: "Juan García"
│  ├─ clientEmail: "juan@example.com"
│  ├─ eventDate: "2024-06-15"
│  └─ password: "miContraseñA123!"
│
│ (fetch POST /api/gallery/create)
│
▼
SERVIDOR (Express)
│
├─ Recibir JSON
├─ Validar campos
├─ Hash password:
│  │ bcrypt.hash("miContraseñA123!", 10)
│  └─ Resultado: "$2a$10$eFYVEhDlSEDFY..."
│
├─ Generar JWT:
│  │ jwt.sign({email, name}, SECRET, {expiresIn: '90d'})
│  └─ Resultado: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
│
├─ INSERT en Supabase:
│  │ private_galleries (
│  │   client_name: "Juan García",
│  │   client_email: "juan@example.com",
│  │   event_date: "2024-06-15",
│  │   password_hash: "$2a$10$...",
│  │   access_token: "eyJ...",
│  │   created_at: "2024-01-15T10:30:00Z",
│  │   expires_at: "2024-04-15T10:30:00Z"
│  │ )
│  └─ OK: Retorna data
│
├─ Generar link:
│  │ accessLink = "http://localhost:5173/gallery/eyJ..."
│  └─ OK
│
▼
RESPUESTA JSON
│
└─ {
     "success": true,
     "gallery": {
       "id": "uuid-aqui",
       "client_name": "Juan García",
       "client_email": "juan@example.com",
       "event_date": "2024-06-15",
       "created_at": "2024-01-15T10:30:00Z",
       "expires_at": "2024-04-15T10:30:00Z"
     },
     "accessLink": "http://localhost:5173/gallery/eyJ..."
   }
```

---

**Nota**: Este diagrama es conceptual. Los pasos reales pueden variar según implementación.
