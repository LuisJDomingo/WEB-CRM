# ✅ SISTEMA LISTO PARA PROBAR

## 🎯 Estado Actual

```
✅ Frontend:  http://localhost:5174  (Vite ejecutándose)
✅ Backend:   http://localhost:3001  (Express ejecutándose)
✅ Supabase:  Conectado y listo
```

---

## 🚀 ACCEDER AL SISTEMA

### Opción 1: Panel Admin (Para crear galerías)
**URL:** `http://localhost:5174/admin/gallery`

**Contraseña:** `admin123`

---

## 📋 PASO A PASO: CÓMO PROBAR

### 1️⃣ CREAR UNA GALERÍA

1. Ve a: **`http://localhost:5174/admin/gallery`**
2. Ingresa contraseña: **`admin123`**
3. Completa el formulario:
   - **Nombre del Cliente:** `Rosa García`
   - **Email:** `rosa@example.com`
   - **Fecha:** `2025-12-09`
   - **Contraseña:** `MiFoto2025`
4. Haz clic en **"Crear Galería"**

### 2️⃣ COPIAR EL LINK

Una vez creada, verás un link como este:
```
http://localhost:5174/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Opciones:**
- 📋 **Copiar Link** - Para pegarlo donde quieras
- 📧 **Enviar Email** - Simula el envío (ve los logs del servidor)

### 3️⃣ CLIENTE ACCEDE A LA GALERÍA

1. Abre el link en otra pestaña
2. Verás una pantalla de login
3. Ingresa la contraseña: **`MiFoto2025`**
4. ¡Verás las fotos!

---

## 🎨 PANTALLAS

### Panel Admin
```
┌─────────────────────────────────────────┐
│  CREAR GALERÍA PRIVADA                  │
│                                         │
│  Nombre del Cliente: [_____________]    │
│  Email: [_________________________]     │
│  Fecha: [_________________________]     │
│  Contraseña: [____________________]     │
│                                         │
│         [Crear Galería]                 │
└─────────────────────────────────────────┘
```

### Login Cliente
```
┌─────────────────────────────────────────┐
│  ACCESO A GALERÍA PRIVADA               │
│                                         │
│  Contraseña:                            │
│  [____________________________]          │
│                                         │
│         [Entrar]                        │
└─────────────────────────────────────────┘
```

### Galería Privada
```
┌──────────────────────────────────────────────┐
│  GALERÍA DE ROSA GARCÍA                      │
│  Evento: 2025-12-09                          │
│                                              │
│  [Foto 1] [Foto 2] [Foto 3]                  │
│  [Foto 4] [Foto 5] [Foto 6]                  │
│                                              │
│              [Cerrar Sesión]                 │
└──────────────────────────────────────────────┘
```

---

## 🔐 SEGURIDAD IMPLEMENTADA

- ✅ **JWT Tokens** (Expiran en 90 días)
- ✅ **Bcrypt Hashing** (Contraseñas encriptadas)
- ✅ **Session Management** (localStorage)
- ✅ **API protegida** (Verificación de tokens)

---

## 📊 ARQUITECTURA

```
Cliente (Navegador)
    ↓
Frontend (React + Vite)  ← http://localhost:5174
    ↓
Express API              ← http://localhost:3001
    ↓
Supabase PostgreSQL      ← Cloud (Nube)
```

---

## 🧪 ENDPOINTS DE PRUEBA

### Crear Galería
```bash
POST http://localhost:3001/api/gallery/create
Content-Type: application/json

{
  "clientName": "Rosa García",
  "clientEmail": "rosa@example.com",
  "eventDate": "2025-12-09",
  "password": "MiFoto2025"
}
```

### Verificar Acceso
```bash
POST http://localhost:3001/api/gallery/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "MiFoto2025"
}
```

### Obtener Detalles
```bash
GET http://localhost:3001/api/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📱 USAR POSTMAN O CURL

Si quieres probar desde la terminal:

```bash
# Crear galería
curl -X POST http://localhost:3001/api/gallery/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test User",
    "clientEmail": "test@example.com",
    "eventDate": "2025-12-09",
    "password": "TestPassword123"
  }'

# Resultado:
# {"success":true,"accessLink":"http://localhost:5174/gallery/eyJhbGc..."}
```

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "POST /api/gallery/create no responde"
- ✅ Verifica que el backend esté corriendo: `npm run server`
- ✅ Deberías ver: `✅ Servidor corriendo en puerto 3001`

### ❌ Error: "Tabla 'private_galleries' no existe"
- ✅ Necesitas ejecutar `CREATE_GALLERY_TABLE.sql` en Supabase
- ✅ Abre Supabase → SQL Editor → Pega el SQL → Ejecuta

### ❌ Error: ".env.local no encontrado"
- ✅ Verifica que `.env.local` exista en la raíz del proyecto
- ✅ Debe contener: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, JWT_SECRET

### ❌ No aparece el link de acceso
- ✅ Abre la consola (F12)
- ✅ Busca errores en "Console"
- ✅ Verifica los logs del backend en la terminal

---

## ✨ CARACTERÍSTICAS FUNCIONALES

- ✅ Crear galerías privadas con contraseña
- ✅ Generar links únicos de acceso (JWT)
- ✅ Autenticación de cliente
- ✅ Visualizar fotos en galería
- ✅ Descargar fotos
- ✅ Cerrar sesión
- ✅ Simular envío de emails
- ✅ Admin panel protegido
- ✅ Base de datos Supabase
- ✅ API REST funcional

---

## 📚 DOCUMENTOS DE REFERENCIA

Si necesitas más detalles, abre estos archivos:

1. **PRUEBA_PRACTICA.md** ← 📖 Guía paso a paso completa
2. **QUICK_START.md** ← ⚡ Referencia rápida
3. **GALLERY_SYSTEM.md** ← 🔍 Detalles técnicos

---

## 🎓 CONCEPTOS CLAVE

### JWT Token
Un token encriptado que identifica la galería y expira en 90 días.

### Bcrypt Hash
Contraseña encriptada de forma irreversible (muy segura).

### Session Token
Token temporal almacenado en localStorage del navegador.

---

## 💡 TIPS

1. **Para probar con diferentes usuarios**, crea varias galerías con diferentes datos
2. **Los datos se guardan en Supabase**, así que persisten aunque reinicies
3. **Los emails son simulados**, ve los logs del servidor para verlos
4. **La contraseña admin es "admin123"**, cámbialo en AdminGallery.tsx si quieres

---

## 📞 CONTACTO / SOPORTE

Si algo no funciona:

1. ✅ Verifica que ambos servidores estén corriendo
2. ✅ Revisa los logs en las terminales
3. ✅ Abre la consola del navegador (F12)
4. ✅ Consulta la guía PRUEBA_PRACTICA.md

---

## 🎉 ¡LISTO PARA USAR!

Tu sistema de galerías privadas está completamente funcional.

**Solo necesitas:**
1. Acceder a http://localhost:5174/admin/gallery
2. Ingresar contraseña: admin123
3. Crear una galería
4. ¡Compartir el link!

**¡Disfruta!** 🚀
