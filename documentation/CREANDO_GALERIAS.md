# 📊 Guía del Panel de Administración

## Descripción General

El panel de administración es tu **cuadro de mando central** para gestionar todas las galerías privadas de tus clientes. Puedes:

- ✅ Ver todas las galerías activas
- ✅ Crear nuevas galerías con fotos
- ✅ Editar información de galerías existentes
- ✅ Agregar más fotos a galerías ya creadas
- ✅ Eliminar fotos individuales
- ✅ Eliminar galerías completas
- ✅ Copiar y enviar links de acceso
- ✅ Agregar notas privadas para cada galería

---

## 🚀 Cómo Acceder

1. Abre `http://localhost:5174/admin/gallery`
2. Ingresa la contraseña de administrador: **`admin123`**
3. ¡Listo! Ya estás en el panel

---

## 📋 Estructura del Panel

### Menú Superior (Tabs)

El panel tiene **dos secciones principales**:

#### 1️⃣ **Panel de Galerías** (Pestaña por defecto)

Este es tu dashboard de control donde ves:
- Lista de todas las galerías activas
- Información del cliente
- Cantidad de fotos en cada galería
- Botones de edición y eliminación

#### 2️⃣ **Crear Nueva Galería**

Formulario completo para crear una nueva galería con:
- Nombre del cliente
- Email
- Fecha del evento
- Contraseña de acceso
- Subida de múltiples fotos

---

## 🔧 Operaciones Principales

### A. Ver Galerías Activas

En el "Panel de Galerías":

1. Ves una tarjeta por cada galería creada
2. Muestra:
   - **Nombre del cliente** (grande y destacado)
   - **Email del cliente**
   - **Cantidad de fotos** (badge dorado)
   - **Botones de acción** (Editar, Eliminar)

### B. Expandir una Galería

Haz clic en cualquier tarjeta de galería para **expandir y ver detalles**:

```
┌─────────────────────────────────────┐
│ Juan y María              [📸 12]    │ ← Haz clic para expandir
│ juan@email.com                      │
│ [Editar] [Eliminar] ▼               │
└─────────────────────────────────────┘
         ↓ (Se expande)
┌─────────────────────────────────────┐
│ Email: juan@email.com               │
│ Fecha evento: 25/12/2024            │
│ Creada: 15/12/2024                  │
│ Expira: 14/03/2025                  │
│                                     │
│ Notas (privadas): ...               │
│                                     │
│ Link de acceso:                     │
│ http://localhost:5174/gallery/... [📋]│
│                                     │
│ [Agregar imagen] [Galería de fotos] │
└─────────────────────────────────────┘
```

### C. Editar Información de Galería

1. En una galería expandida, haz clic en **[Editar]**
2. Puedes cambiar:
   - Nombre del cliente
   - Email
   - Notas privadas
3. Haz clic en **[Guardar]** para confirmar
4. O **[Cancelar]** para descartar cambios

### D. Agregar Nuevas Fotos a una Galería

Dentro de una galería expandida:

1. En la sección "Imágenes", selecciona un archivo
2. Haz clic en **[Agregar]**
3. La foto se añade a la galería existente (sin reemplazar las otras)

### E. Ver Preview de una Foto

En la galería de fotos:

1. **Pasa el mouse** sobre una miniatura
2. Aparecen dos botones:
   - 👁️ **Ver** - Abre preview en pantalla completa
   - 🗑️ **Eliminar** - Borra esa foto

### F. Eliminar una Foto Individual

1. Haz hover sobre la foto
2. Haz clic en **🗑️**
3. Confirma que deseas eliminar
4. La foto se elimina de la galería

### G. Eliminar una Galería Completa

En el encabezado de la tarjeta:

1. Haz clic en **[Eliminar]** (botón rojo)
2. Se pedirá confirmación (no se puede deshacer)
3. La galería y todas sus fotos se eliminan

### H. Copiar Link de Acceso

En la sección "Link de acceso para el cliente":

1. Haz clic en **[Copiar]**
2. El link se copia al portapapeles
3. Verás confirmación: "Copiado"
4. Ahora puedes pegarlo donde quieras

---

## ➕ Crear Nueva Galería

### Paso a Paso

1. Ve a la pestaña **"+ Crear Nueva Galería"**
2. Completa el formulario:
   - **Nombre del cliente**: Ej: "Juan y María"
   - **Email**: Ej: "cliente@ejemplo.com"
   - **Fecha del evento**: Selecciona la fecha
   - **Contraseña de acceso**: Define una contraseña segura

3. **Subir fotos**:
   - Haz clic en el área punteada "Haz clic para seleccionar imágenes"
   - O arrastra fotos directamente
   - Verás la lista de archivos seleccionados
   - Puedes eliminar archivos haciendo clic en la X

4. Haz clic en **"Crear Galería (N fotos)"**
5. Espera a que se confirme ✓

### Después de Crear

Verás:
- ✅ Mensaje de éxito
- 🔗 **Link de acceso** (código para copiar)
- ✉️ Botón para **"Enviar por Email"** (aún en desarrollo)
- 🔄 Botón **"Crear otra galería"** para repetir el proceso

---

## 🔐 Link de Acceso

Cada galería tiene un **link único e irrepetible**:

```
http://localhost:5174/gallery/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Este link:
- ✅ Es único para cada cliente
- ✅ Expira en 90 días
- ✅ Requiere la contraseña que estableciste
- ✅ Funciona en cualquier navegador

**Para compartir con el cliente:**
1. Copia el link
2. Envíalo por email, WhatsApp, o como prefieras
3. El cliente abre el link
4. Ingresa la contraseña
5. ¡Puede ver todas las fotos en pantalla completa!

---

## 📱 Funcionalidades del Cliente

Cuando el cliente accede con el link:

1. **Entra a la galería privada**
2. **Ingresa la contraseña** que le compartiste
3. **Ve todas las fotos** en una galería de miniaturas
4. **Puede:**
   - 🖼️ Ver fotos en pantalla completa
   - ⌨️ Navegar con flechas del teclado
   - 📥 Descargar fotos individuales
   - ❌ Cerrar con Esc o botón X

---

## ⏰ Información de Expiración

- **Creada el**: Fecha de creación de la galería
- **Expira el**: Fecha en que la galería ya no será accesible (90 días después)
- Puedes ver estas fechas en los detalles expandidos

---

## 📝 Notas Privadas

En la sección "Notas (privadas)":

- Solo tú puedes verlas (no aparecen en el cliente)
- Úsalas para:
  - Recordar detalles del evento
  - Notas sobre el cliente
  - Información logística
  - Cualquier cosa que quieras recordar

---

## 🛡️ Seguridad

⚠️ **Importante:**

- La contraseña admin es `admin123` - **Cámbiala en producción**
- El código está en `src/pages/AdminGallery.tsx` línea ~22
- Las contraseñas de clientes se hashean con Bcrypt
- Los links de acceso son JWTs cifrados y seguros

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────┐
│ 1. Accedes al panel de admin            │
├─────────────────────────────────────────┤
│ 2. Ingresas contraseña                  │
├─────────────────────────────────────────┤
│ 3. OPCIÓN A: Ves galerías existentes    │
│    - Editar info                        │
│    - Agregar fotos                      │
│    - Eliminar fotos/galería             │
│                                         │
│ OPCIÓN B: Creas nueva galería           │
│    - Subes fotos                        │
│    - Generas link único                 │
│    - Compartes con cliente              │
├─────────────────────────────────────────┤
│ 4. Cliente recibe link                  │
├─────────────────────────────────────────┤
│ 5. Cliente ingresa contraseña           │
├─────────────────────────────────────────┤
│ 6. Cliente ve galería en pantalla       │
│    - Puede descargar fotos              │
│    - Puede ver fullscreen               │
└─────────────────────────────────────────┘
```

---

## 🐛 Solución de Problemas

### "El link de acceso está vacío"
- Espera unos segundos después de crear la galería
- Recarga la página
- Intenta crear nuevamente

### "No veo las fotos que subí"
- Verifica que los archivos sean imágenes (JPG, PNG, etc.)
- Que no sean mayores a 50MB
- Intenta desde otro navegador

### "El cliente no puede acceder"
- Verifica que le enviaste el link completo
- Que la contraseña sea correcta
- Que la galería no haya expirado (90 días)

### "No puedo editar una galería"
- Haz clic en el botón [Editar] primero
- Modifica los campos que desees
- Haz clic en [Guardar] para confirmar

---

## 💡 Tips y Trucos

✨ **Productividad:**
- Copia el link y crea un template de email
- Usa las notas para tracking de clientes
- Agrupa galerías por evento/mes

📸 **Fotos:**
- Sube fotos de alta calidad (cuidado con el peso)
- Organiza en orden chronológico
- Puedes agregar más fotos después de crear la galería

🔐 **Seguridad:**
- Usa contraseñas fuertes para los clientes
- Revisa la expiración de galerías antiguas
- Elimina galerías cuando ya no las necesites

---

## 🎯 Próximas Mejoras Planeadas

- Email integrado con SendGrid
- Gestión de múltiples admin
- Watermarks en descargas
- Estadísticas de acceso (quién vio, cuándo)
- Permisos personalizables
- Organización por eventos/carpetas

---

## ¡Listo! 🎉

Ya puedes usar el panel para gestionar todas tus galerías. ¿Preguntas? Revisa esta guía o expande una galería en el panel para ver todas las opciones disponibles.

**¡Disfruta administrando tus galerías privadas!**
