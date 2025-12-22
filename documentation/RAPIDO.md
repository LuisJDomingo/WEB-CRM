# ⚡ INSTRUCCIONES RÁPIDAS (2 MINUTOS)

## ✅ TODO ESTÁ CORRIENDO

- ✅ Frontend: http://localhost:5174
- ✅ Backend: http://localhost:3001
- ✅ Supabase: Conectado

---

## 🎯 PASO 1: ACCEDE AL PANEL ADMIN

**Abre en tu navegador:**
```
http://localhost:5174/admin/gallery
```

**Verás:**
Un campo de contraseña

**Ingresa:**
```
admin123
```

**Haz clic:**
Botón "Acceder"

---

## 📝 PASO 2: COMPLETA EL FORMULARIO

```
Nombre del Cliente:  Rosa García
Email:               rosa@example.com
Fecha del Evento:    2025-12-09
Contraseña:          MiFoto2025
```

**Haz clic:** Botón "Crear Galería"

---

## 🔗 PASO 3: COPIA EL LINK

Verás algo como esto:
```
http://localhost:5174/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Opciones:**
- 📋 **Copiar Link** (para compartir por WhatsApp, etc.)
- 📧 **Enviar Email** (simula el envío - ve los logs del servidor)

---

## 🔐 PASO 4: ABRE EL LINK EN OTRA PESTAÑA

1. Copia el link
2. Abre una **nueva pestaña del navegador**
3. **Pega el link en la barra de direcciones**
4. Presiona **Enter**

---

## 🔑 PASO 5: INGRESA LA CONTRASEÑA

**Contraseña:** `MiFoto2025` (la que pusiste)

**Haz clic:** Botón "Entrar"

---

## 📸 PASO 6: ¡VES TUS FOTOS!

Verás:
- Nombre de la galería
- Fecha del evento
- Grid de fotos
- Botón de descargar en cada foto
- Botón de cerrar sesión

---

## 🧪 PROBAR CON MÁS CLIENTES

Repite los pasos 1-5 con diferentes datos:

**Cliente 2:**
```
Nombre: Juan Martínez
Email: juan@example.com
Fecha: 2025-12-10
Contraseña: SegundaGaleria123
```

**Cliente 3:**
```
Nombre: María López
Email: maria@example.com
Fecha: 2025-12-11
Contraseña: TercerCliente456
```

---

## 📊 VER LOS LOGS DEL SERVIDOR

En la **terminal donde corre `npm run server`**, verás:

```
✅ Servidor corriendo en puerto 3001

📧 ════════════════════════════════════════
   Email enviado a: rosa@example.com
   Para: Rosa García
   Link: http://localhost:5174/gallery/...
   Contraseña: MiFoto2025
════════════════════════════════════════
```

---

## ❌ SI ALGO FALLA

### No aparece el panel admin
- Abre: `http://localhost:5174` primero
- Luego ve a: `/admin/gallery`

### Dice "Tabla no existe"
- Abre Supabase
- SQL Editor
- Pega el contenido de `CREATE_GALLERY_TABLE.sql`
- Ejecuta

### No aparece el link después de crear
- Abre la consola: F12
- Busca errores rojos
- Verifica que Supabase tenga credenciales

### Backend no responde
- Abre otra terminal
- Ve a la carpeta del proyecto
- Ejecuta: `npm run server`

---

## 🎉 ¡LISTO!

Acabas de:
1. ✅ Crear una galería privada
2. ✅ Generar un link único
3. ✅ Acceder como cliente
4. ✅ Ver las fotos

**Ahora entiendes cómo funciona el sistema.**

---

## 📚 PARA MÁS DETALLES

Abre estos archivos:

- **FLUJO_VISUAL.md** ← Ver cómo funciona el sistema paso a paso
- **LISTO_PARA_PROBAR.md** ← Guía completa con todos los detalles
- **PRUEBA_PRACTICA.md** ← Troubleshooting y conceptos

---

## 💡 TIPS

1. **Contraseña admin:** `admin123` (cámbialo si quieres)
2. **Contraseña cliente:** Elige la que quieras (ej: `MiFoto2025`)
3. **Token dura:** 90 días (después expira)
4. **Sesión dura:** 24 horas (luego tiene que re-loguear)
5. **Los datos se guardan:** En Supabase (persisten)

---

**¡Disfruta tu sistema de galerías privadas!** 🚀
