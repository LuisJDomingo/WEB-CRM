# 🚀 Quick Start Guide - Comienza en 5 minutos

## ⚡ Paso 1: Verificar Prerequisites (1 min)

```bash
# Verificar que tengas instalado
node --version        # Debe ser v18+
npm --version         # Debe ser v9+
```

Si no tienes Node, descarga de https://nodejs.org

---

## 📦 Paso 2: Instalar Dependencias (2 min)

```bash
# En la carpeta del proyecto
npm install

# Esto instala:
# - React 19
# - Vite 6.4.1
# - TypeScript
# - Tailwind CSS
# - date-fns
# - react-big-calendar
# - Y más...
```

---

## 🔑 Paso 3: Configurar Variables de Entorno (1 min)

```bash
# Editar .env.local
# Debe tener:
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=xxx (opcional, para Gmail)
```

---

## 🚀 Paso 4: Iniciar la Aplicación (1 min)

### Opción A: Ambas en una terminal (más simple)
```bash
npm run dev:all
```

### Opción B: En 2 terminales (más control)

**Terminal 1 - Frontend:**
```bash
npm run dev
# Abre: http://localhost:5174
```

**Terminal 2 - Backend:**
```bash
npm run server
# Ejecuta en: http://localhost:3001
```

---

## 📋 Primer Uso - Checklist

- [ ] Frontend cargó en http://localhost:5174
- [ ] Backend responde en http://localhost:3001/api/health
- [ ] Puedo ver la página de inicio
- [ ] Puedo hacer login en /admin
  - User: `admin`
  - Pass: `password` (cambiar después)
- [ ] Puedo ver el dashboard de galerías
- [ ] Puedo ver el calendario
- [ ] Puedo crear un evento de prueba

---

## 🎯 Siguientes Pasos

### Opción 1: Crear una Galería de Prueba
```
1. Click en "➕ Crear Nueva Galería"
2. Llena el formulario
3. Sube 5+ imágenes
4. Click "Crear Galería"
5. ¡Listo! Aparecerá en el dashboard
```

### Opción 2: Probar el Calendario
```
1. Click en "📅 Calendario"
2. Selecciona una fecha
3. Click "Agregar evento"
4. Rellena los datos
5. Click "Agregar"
6. El evento se guarda automáticamente
```

### Opción 3: Conectar Gmail (Avanzado)
```
1. Ve a GMAIL_INTEGRATION_PLAN.md
2. Sigue el plan paso a paso (30 min)
3. Conecta tu Gmail
4. Los eventos se sincronizarán automáticamente
```

---

## 🌐 URLs Útiles

| URL | Propósito | Acceso |
|---|---|---|
| http://localhost:5174 | Home/inicio | Público |
| http://localhost:5174/portfolio | Galería demo | Público |
| http://localhost:5174/admin | Login admin | Protegido |
| http://localhost:5174/admin/gallery | Dashboard admin | Protegido |
| http://localhost:3001/api/health | Estado del server | Público |

---

## 🐛 Troubleshooting Rápido

### Puerto 5174 ya está en uso
```bash
# Cambiar puerto en vite.config.ts
# O matar el proceso:
npx lsof -i :5174
kill -9 <PID>
```

### Puerto 3001 ya está en uso
```bash
# En PowerShell:
Get-Process | Where-Object {$_.ProcessName -match "node"} | Stop-Process -Force

# O en Task Manager: matar procesos node.exe
```

### npm install falla
```bash
# Limpiar cache
npm cache clean --force

# Reinstalar
rm -r node_modules package-lock.json
npm install
```

### Vite no compila
```bash
# Limpiar cache Vite
rm -r .vite

# Reiniciar
npm run dev
```

### Database no conecta
```bash
# Verificar .env.local tiene credenciales Supabase
# Verificar internet está conectado
# Verificar IP no está bloqueada
```

---

## 📚 Documentación Esencial

| Archivo | Lee primero si... |
|---|---|
| RESUMEN_SISTEMA_COMPLETO.md | Quieres entender qué hace |
| CALENDAR_GUIDE.md | Quieres usar el calendario |
| ADMIN_PANEL_GUIDE.md | Quieres crear galerías |
| CALENDAR_IMPLEMENTATION.md | Quieres editar el código |
| GMAIL_INTEGRATION_PLAN.md | Quieres conectar Gmail |
| TESTING_CHECKLIST.md | Quieres probar todo |

---

## 🔐 Credenciales por Defecto

```
ADMIN:
  Usuario: admin
  Contraseña: password
  
CLIENTE DEMO:
  Token: cualquier_token (puede crear galerías)
```

⚠️ **IMPORTANTE:** Cambia la contraseña en producción
- En server-simple.cjs, línea ~50
- Reemplaza "password" con un hash bcrypt

---

## 💡 Primeras Personalizaciones

### Cambiar nombre del sitio
```
1. Editar: App.tsx
2. Cambiar títulos en páginas
3. Cambiar logo en Navigation.tsx
```

### Cambiar colores
```
1. Editar: tailwind.config.js
2. Cambiar tema colors
3. Relace imports de componentes
```

### Cambiar contraseña admin
```bash
# Generar nuevo hash
node -e "console.log(require('bcrypt').hashSync('tuContraseña', 10))"

# Copiar resultado en server-simple.cjs línea ~50
```

### Agregar más clientes
```
1. Tabla private_galleries en Supabase
2. INSERT de datos nuevos
3. O crear vía API
```

---

## 🔄 Flujo de Trabajo Típico

```
1. npm run dev:all (iniciar)
   ↓
2. Abrir http://localhost:5174
   ↓
3. Login en /admin (admin/password)
   ↓
4. Crear galería o probar calendario
   ↓
5. Ver datos en dashboard
   ↓
6. Editar o eliminar según necesites
   ↓
7. Los cambios se guardan automáticamente
```

---

## 🎓 Aprender Más

### Frontend (React + TypeScript)
- Archivos: `src/pages/*.tsx`, `src/components/*.tsx`
- Tema: React hooks, TypeScript interfaces, Tailwind CSS

### Backend (Express + Supabase)
- Archivo: `server-simple.cjs`
- Tema: REST API, authentication, file uploads

### Database (PostgreSQL)
- Archivo: `CREATE_GALLERY_TABLE.sql`
- Tema: Supabase, SQL queries

### Calendario (React)
- Archivo: `src/components/CalendarPanel.tsx`
- Tema: date-fns, localStorage, event management

---

## 🚀 Deploy (Cuando Estés Listo)

### Frontend (Vercel)
```bash
# 1. Push a GitHub
git push origin main

# 2. Conectar con Vercel
# https://vercel.com/new

# 3. Seleccionar repo y deploy
```

### Backend (Railway o Render)
```bash
# 1. Crear cuenta en Railway o Render
# 2. Conectar repo GitHub
# 3. Configurar variables de entorno
# 4. Deploy automático
```

---

## 📞 Necesitas Ayuda?

1. **Sobre el calendario**: Lee CALENDAR_GUIDE.md
2. **Sobre el dashboard**: Lee ADMIN_PANEL_GUIDE.md
3. **Sobre Gmail**: Lee GMAIL_INTEGRATION_PLAN.md
4. **Sobre el código**: Lee CALENDAR_IMPLEMENTATION.md
5. **Sobre testing**: Lee TESTING_CHECKLIST.md
6. **Sobre seguridad**: Lee SECURITY_AND_OPTIMIZATION.md

---

## ✅ Verificación Final

Antes de ir a producción, verifica:

- [ ] Login funciona
- [ ] Puedo crear galerías
- [ ] Puedo agregar imágenes
- [ ] Puedo editar galerías
- [ ] Puedo eliminar galerías
- [ ] Puedo ver como cliente
- [ ] Calendario funciona
- [ ] Eventos se guardan
- [ ] No hay errores en consola
- [ ] Performance es aceptable
- [ ] Se ve bien en móvil
- [ ] Cambié contraseña admin

---

## 🎉 ¡Listo!

Tu aplicación está funcionando. Ahora puedes:

1. **Probarla** con datos reales
2. **Expandirla** agregando funcionalidades
3. **Personalizarla** con tus colores y datos
4. **Deployarla** cuando estés listo
5. **Mantenerla** actualizando según necesites

---

**¡Felicidades! Tu panel administrativo está listo para usar.** 🚀

¿Necesitas ayuda con algo específico? Consulta el INDEX_PROYECTO.md
