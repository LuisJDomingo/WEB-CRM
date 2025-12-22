# 🎯 GUÍA PRÁCTICA: Crear una Galería Privada

## ✅ Estado de los Servidores

- ✅ **Frontend**: http://localhost:5174 (Puerto 5174, usó este porque 5173 estaba ocupado)
- ✅ **Backend**: http://localhost:3001/api (Express ejecutándose)
- ✅ **Supabase**: Conectado y listo

---

## 📋 PASO 1: Acceder al Panel Admin

### En tu navegador:
1. Abre: **`http://localhost:5174/admin/gallery`**
2. Verás una pantalla con un campo "Contraseña de Administrador"
3. Ingresa: **`admin123`** (contraseña por defecto)
4. Haz clic en "Acceder"

**Pantalla esperada:**
```
┌─────────────────────────────────────────┐
│     PANEL DE ADMINISTRACIÓN             │
│                                         │
│  Contraseña de Administrador:           │
│  [admin123____________]                 │
│                                         │
│          [Acceder]                      │
└─────────────────────────────────────────┘
```

---

## 📋 PASO 2: Crear una Galería Privada

Una vez dentro del admin, verás el formulario para crear una nueva galería:

### Campos a Completar:

**1. Nombre del Cliente:**
```
[Ejemplo: Juan Martínez]
```

**2. Email del Cliente:**
```
[Ejemplo: juan@ejemplo.com]
```

**3. Fecha del Evento:**
```
[Ejemplo: 2025-12-15]
```

**4. Contraseña de Acceso:**
```
[Ejemplo: Fotos2025!] ← Esta contraseña la usará el cliente
```

### Ejemplo Completo:

```
Nombre del Cliente:  Rosa García
Email del Cliente:   rosa.garcia@email.com
Fecha del Evento:    2025-12-09
Contraseña:         MiFotoBoda2025
```

---

## 📋 PASO 3: Enviar el Link de Acceso

Después de completar el formulario, haz clic en **"Crear Galería"**

**Resultado esperado:**
- ✅ Se crea la galería en la base de datos
- ✅ Se genera un token JWT único
- ✅ Aparece el link de acceso en pantalla

### El Link de Acceso se verá así:
```
http://localhost:5174/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJl...
```

### Opciones para Compartir:

**📋 Opción 1: Copiar el Link**
- Haz clic en el botón **"Copiar Link"**
- El link se copia al portapapeles
- Puedes enviarlo por WhatsApp, email, etc.

**📧 Opción 2: Simular Envío por Email**
- Haz clic en **"Enviar por Email"**
- En los logs de la consola verás:
```
📧 Email simulado para: rosa.garcia@email.com
Link: http://localhost:5174/gallery/...
Contraseña: MiFotoBoda2025
```

---

## 📋 PASO 4: Cliente Accede a la Galería

### Tu cliente recibe:

**Email de Ejemplo:**
```
Asunto: Tu Galería de Fotos - Rosa García

Hola Rosa,

Tu galería privada está lista. Accede aquí:
http://localhost:5174/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Tu contraseña: MiFotoBoda2025

¡Disfruta tus fotos!
```

### El cliente hace lo siguiente:

**1. Haz clic en el link (o cópialo en la barra de direcciones)**
```
http://localhost:5174/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Verá la pantalla de login:**
```
┌─────────────────────────────────────────┐
│     ACCESO A GALERÍA PRIVADA            │
│                                         │
│  Tu Contraseña:                         │
│  [MiFotoBoda2025____________]           │
│                                         │
│          [Entrar]                       │
└─────────────────────────────────────────┘
```

**3. Ingresa la contraseña:** `MiFotoBoda2025`

**4. Haz clic en "Entrar"**

---

## 📋 PASO 5: Visualizar la Galería

Una vez autenticado, el cliente verá:

```
┌──────────────────────────────────────────────┐
│  GALERÍA PRIVADA DE ROSA GARCÍA              │
│  Evento: 2025-12-09                          │
│  ─────────────────────────────────────────   │
│                                              │
│  [Foto 1] [Foto 2] [Foto 3]                  │
│  [Foto 4] [Foto 5] [Foto 6]                  │
│                                              │
│  Cada foto tiene botón de descargar          │
│  ─────────────────────────────────────────   │
│                    [Cerrar Sesión]           │
└──────────────────────────────────────────────┘
```

### Opciones del Cliente:

- 📸 **Ver las fotos** en alta resolución
- ⬇️ **Descargar cada foto** individualmente
- 🔓 **Cerrar sesión** cuando termine

---

## 🔐 Flujo de Seguridad

### ¿Cómo funciona la protección?

```
1. CREACIÓN DE GALERÍA (Admin)
   ├─ Contraseña → Se encripta con Bcrypt
   ├─ Token JWT → Se genera único (90 días validez)
   └─ Se guarda en Supabase

2. ACCESO A GALERÍA (Cliente)
   ├─ Abre el link (contiene el JWT)
   ├─ Ingresa contraseña
   ├─ Se verifica el JWT
   ├─ Se compara la contraseña con el hash
   └─ Se genera sessionToken para la sesión

3. VISUALIZACIÓN (Cliente Autenticado)
   ├─ Puede ver las fotos
   ├─ Puede descargarlas
   └─ Puede cerrar sesión
```

---

## 🧪 ESCENARIOS DE PRUEBA

### Escenario 1: Galería Exitosa

**Datos:**
```
Cliente:      María López
Email:        maria@example.com
Fecha:        2025-12-09
Contraseña:   Boda2025!
```

**Prueba:**
1. ✅ Crear galería
2. ✅ Copiar link
3. ✅ Abrir en nueva pestaña
4. ✅ Ingresar contraseña
5. ✅ Ver fotos
6. ✅ Descargar foto
7. ✅ Cerrar sesión

---

### Escenario 2: Contraseña Incorrecta

**Datos:**
- Link válido: ✅
- Contraseña ingresada: `ContraseñaIncorrecta`
- Contraseña correcta: `Boda2025!`

**Resultado esperado:**
- ❌ Mensaje de error: "Contraseña incorrecta"
- 🔄 La pantalla no cambia
- ✅ El cliente puede reintentar

---

### Escenario 3: Link Expirado

**Situación:**
- Galería creada hace 90+ días
- Cliente intenta acceder

**Resultado esperado:**
- ❌ Token JWT expirado
- ❌ Mensaje: "El acceso ha expirado"
- ✅ El admin puede crear uno nuevo

---

## 📱 URLs de Referencia

| Función | URL | Método |
|---------|-----|--------|
| Ver Admin | `http://localhost:5174/admin/gallery` | GET |
| Ver Galería | `http://localhost:5174/gallery/:token` | GET |
| Crear Galería | `POST /api/gallery/create` | Backend |
| Verificar Acceso | `POST /api/gallery/verify` | Backend |
| Obtener Datos | `GET /api/gallery/:token` | Backend |
| Enviar Email | `POST /api/gallery/send-link` | Backend |

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "Cannot POST /api/gallery/create"

**Solución:**
- ✅ Verifica que el backend esté corriendo: `npm run server`
- ✅ Verifica que esté en puerto 3001
- ✅ Abre `http://localhost:3001` en navegador (debe mostrar error pero confirma que existe)

### ❌ Error: "VITE_SUPABASE_URL is not defined"

**Solución:**
- ✅ Verifica que `.env.local` exista en la raíz del proyecto
- ✅ Contiene VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
- ✅ Reinicia el servidor: `npm run dev`

### ❌ Error: "Table 'private_galleries' does not exist"

**Solución:**
- ✅ Abre Supabase → SQL Editor
- ✅ Copia contenido de `CREATE_GALLERY_TABLE.sql`
- ✅ Ejecuta el script
- ✅ Recarga la aplicación

### ❌ La galería se crea pero no aparece el link

**Solución:**
- ✅ Abre la consola del navegador (F12)
- ✅ Busca errores en la pestaña "Console"
- ✅ Verifica que Supabase tenga credenciales correctas
- ✅ Prueba crear una galería desde la API directamente

---

## 📊 Lo que Sucede en Segundo Plano

### Cuando creas una galería:

```javascript
// 1. Frontend envía datos
POST /api/gallery/create
{
  clientName: "Rosa García",
  clientEmail: "rosa@example.com",
  eventDate: "2025-12-09",
  password: "MiFotoBoda2025"
}

// 2. Backend procesa
- password → Bcrypt hash (10 rounds)
- JWT generado → { email, name, iat, exp: 90 días }
- Inserta en Supabase → private_galleries table

// 3. Backend responde
{
  success: true,
  accessLink: "http://localhost:5174/gallery/eyJhbGci...",
  galleryId: "550e8400-e29b-41d4-a716-446655440000"
}

// 4. Frontend muestra el link
- Permite copiar
- Permite simular envío de email
```

### Cuando el cliente accede:

```javascript
// 1. Cliente hace clic en link
// Token está en URL: /gallery/TOKEN

// 2. Frontend verifica
- Extrae token de URL
- Decodifica (sin verificar aún)
- Muestra campo de contraseña

// 3. Cliente ingresa contraseña
POST /api/gallery/verify
{
  token: "eyJhbGci...",
  password: "MiFotoBoda2025"
}

// 4. Backend verifica
- JWT.verify(token) → valida firma y expiración
- Bcrypt.compare(password, hash) → valida contraseña
- Si todo OK → genera sessionToken

// 5. Frontend almacena sesión
- localStorage.sessionToken = "..."
- Redirige a galería
- Muestra las fotos

// 6. Cliente puede descargar
- Cada foto tiene botón de descarga
- Las imágenes están en public/images/
```

---

## 🎓 Conceptos Clave

### JWT Token
- **Qué es**: String encriptado que contiene datos del usuario
- **Duración**: 90 días
- **Uso**: Se envía en URL para identificar la galería
- **Seguridad**: Firmado, no se puede falsificar

### Bcrypt Password Hash
- **Qué es**: Versión encriptada irreversible de la contraseña
- **Salt Rounds**: 10 (muy seguro)
- **Uso**: Se almacena en BD, nunca la contraseña real
- **Verificación**: Compara contraseña ingresada vs hash

### Session Token
- **Qué es**: Token temporal para la sesión actual del cliente
- **Duración**: Mientras el navegador esté abierto
- **Almacenamiento**: localStorage del navegador
- **Uso**: Permite permanecer autenticado sin reingresar

---

## ✨ Resumen Rápido

```bash
# 1. Iniciar servidores (ya están corriendo)
npm run dev          # Frontend en 5174
npm run server       # Backend en 3001

# 2. Acceder al admin
http://localhost:5174/admin/gallery
Contraseña: admin123

# 3. Crear galería
Nombre: Tu Cliente
Email: cliente@example.com
Fecha: 2025-12-09
Contraseña: MiContraseña123

# 4. Compartir link
Copiar y enviar el link generado

# 5. Cliente accede
Abre el link
Ingresa contraseña
¡Ve sus fotos!
```

---

## 🎉 ¡Listo para Probar!

El sistema está completamente funcional. Solo necesitas:

1. ✅ Crear una galería en `/admin/gallery`
2. ✅ Copiar el link de acceso
3. ✅ Abrirlo en otra pestaña
4. ✅ Ingresar la contraseña
5. ✅ ¡Disfrutar las fotos!

Si tienes dudas, revisa el troubleshooting anterior o verifica los logs del backend en la terminal.

**¡Éxito con tu sistema de galerías privadas!** 🚀
