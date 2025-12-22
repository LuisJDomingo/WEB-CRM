# 🎯 FLUJO VISUAL: Cómo Funciona El Sistema

## 1️⃣ TÚ CREAS UNA GALERÍA (Admin Panel)

```
┌─────────────────────────────────┐
│   ADMIN PANEL                   │
│   /admin/gallery                │
│                                 │
│  🔐 Contraseña: admin123        │
│  ✅ Accede                      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   FORMULARIO                    │
│                                 │
│  📝 Nombre: Rosa García         │
│  📧 Email: rosa@example.com     │
│  📅 Fecha: 2025-12-09           │
│  🔑 Contraseña: MiFoto2025      │
│                                 │
│  ✅ CREAR GALERÍA               │
└────────────┬────────────────────┘
             │
             ▼
```

## 2️⃣ EL SISTEMA PROCESA (Backend)

```
┌──────────────────────────────────────┐
│   BACKEND (Express)                  │
│                                      │
│   1. Hashear contraseña con Bcrypt  │
│      Contraseña:  MiFoto2025        │
│      Hash:        $2b$10$xyz...     │
│                                      │
│   2. Generar Token JWT              │
│      Token: eyJhbGciOiJIUzI1NiIs... │
│      Válido: 90 días                │
│                                      │
│   3. Guardar en Base de Datos       │
│      Tabla: private_galleries       │
│      Columnas: email, hash, token   │
│                                      │
│   4. Generar Link de Acceso         │
│      http://localhost:5174/         │
│      gallery/eyJhbGciOiJIUzI1NiIs.. │
└────────────┬─────────────────────────┘
             │
             ▼
```

## 3️⃣ RECIBE UN LINK (Panel Admin)

```
┌──────────────────────────────────────┐
│   RESULTADO                          │
│                                      │
│   ✅ Galería Creada                  │
│                                      │
│   🔗 Tu Link de Acceso:              │
│   ┌────────────────────────────┐    │
│   │ http://localhost:5174/     │    │
│   │ gallery/eyJhbGciOiJIUzI1Ni │    │
│   │ IsInR5cCI6IkpXVCJ9....     │    │
│   └────────────────────────────┘    │
│                                      │
│   📋 [Copiar Link]                   │
│   📧 [Enviar Email]                  │
└────────────┬─────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
  Copiar      Email (simulado)
    │               │
    │         ┌─────────────┐
    │         │ Console Log │
    │         │ 📧 Enviado  │
    │         │ a rosa@...  │
    │         └─────────────┘
```

## 4️⃣ TÚ COMPARTES EL LINK

```
┌──────────────────────────────────────┐
│   COMPARTIR                          │
│                                      │
│   📱 WhatsApp: "Haz clic aquí..."   │
│   📧 Email:    "Tu galería está...  │
│   💬 SMS:      "Link: http://..."   │
│   🔗 Directo:  Copiar y pegar      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   ROSA GARCÍA (Cliente)              │
│   Recibe el link en su dispositivo   │
└────────────┬─────────────────────────┘
             │
             ▼
```

## 5️⃣ ROSA ABRE EL LINK

```
Rosa hace clic o copia el link en navegador
                    │
                    ▼
┌──────────────────────────────────────┐
│   GALERÍA PRIVADA - LOGIN            │
│                                      │
│   🔐 Ingresa contraseña:             │
│   [MiFoto2025]                       │
│                                      │
│   ✅ ENTRAR                          │
└────────────┬─────────────────────────┘
             │
             ▼
```

## 6️⃣ EL BACKEND VERIFICA (POST /api/gallery/verify)

```
┌──────────────────────────────────────┐
│   BACKEND (Express)                  │
│                                      │
│   1. Extrae Token de URL             │
│      Token: eyJhbGciOiJIUzI1NiIs...  │
│                                      │
│   2. Verifica Firma JWT              │
│      ✅ Válido                       │
│      ✅ No expirado (90 días)        │
│                                      │
│   3. Busca en Base de Datos          │
│      SELECT * WHERE token = ...      │
│      ✅ Galería encontrada           │
│                                      │
│   4. Compara Contraseña              │
│      Ingresada: MiFoto2025           │
│      Hash BD:   $2b$10$xyz...        │
│      bcrypt.compare() ✅ Coinciden   │
│                                      │
│   5. Genera Session Token            │
│      SessionToken: abc123def456...   │
│      Válido: 24 horas                │
└────────────┬─────────────────────────┘
             │
             ▼
```

## 7️⃣ ACCESO CONCEDIDO

```
┌──────────────────────────────────────┐
│   RESPUESTA BACKEND                  │
│                                      │
│   {                                  │
│     "success": true,                 │
│     "sessionToken": "abc123...",     │
│     "gallery": {                     │
│       "id": "550e8400-...",          │
│       "clientName": "Rosa García",   │
│       "eventDate": "2025-12-09"      │
│     }                                │
│   }                                  │
└────────────┬─────────────────────────┘
             │
             ▼
```

## 8️⃣ ROSA VE SUS FOTOS

```
┌──────────────────────────────────────┐
│   GALERÍA PRIVADA                    │
│   Rosa García - 2025-12-09           │
│                                      │
│   ┌─────┐  ┌─────┐  ┌─────┐        │
│   │ [1] │  │ [2] │  │ [3] │        │
│   │⬇ ⬇ │  │⬇ ⬇ │  │⬇ ⬇ │        │
│   └─────┘  └─────┘  └─────┘        │
│                                      │
│   ┌─────┐  ┌─────┐  ┌─────┐        │
│   │ [4] │  │ [5] │  │ [6] │        │
│   │⬇ ⬇ │  │⬇ ⬇ │  │⬇ ⬇ │        │
│   └─────┘  └─────┘  └─────┘        │
│                                      │
│   Cada foto puede:                   │
│   - 👁️ Verse en grande              │
│   - ⬇️ Descargarse                   │
│                                      │
│              [🔓 Cerrar Sesión]      │
└──────────────────────────────────────┘
```

## 🔐 SEGURIDAD EN CADA PASO

```
PASO                    PROTECCIÓN
─────────────────────────────────────
1. Crear galería     → Contraseña admin
2. Hash contraseña   → Bcrypt (irreversible)
3. Generar token     → JWT firmado (90 días)
4. Almacenar datos   → En Supabase (SSL)
5. Compartir link    → Token en URL (público)
6. Cliente accede    → Requiere contraseña
7. Verificar JWT     → Valida firma y fecha
8. Comparar pass     → Bcrypt comparison
9. Crear sesión      → Session token (24h)
10. Ver galería      → Session token en localStorage
```

## 📊 DATOS EN LA BASE DE DATOS

```
Tabla: private_galleries

┌──────────────────────────────────────────┐
│ id       │ UUID único                    │
├──────────────────────────────────────────┤
│ client_name   │ Rosa García              │
├──────────────────────────────────────────┤
│ client_email  │ rosa@example.com         │
├──────────────────────────────────────────┤
│ event_date    │ 2025-12-09               │
├──────────────────────────────────────────┤
│ password_hash │ $2b$10$xyz... (90 chars) │
│               │ Nunca se guarda la       │
│               │ contraseña real          │
├──────────────────────────────────────────┤
│ access_token  │ eyJhbGciOiJIUzI1NiIs...  │
│               │ JWT con email y nombre   │
├──────────────────────────────────────────┤
│ created_at    │ 2025-12-09T14:20:00Z     │
├──────────────────────────────────────────┤
│ expires_at    │ 2026-03-09T14:20:00Z     │
│               │ Válido 90 días           │
└──────────────────────────────────────────┘
```

## 🔄 FLUJO RESUMIDO

```
TÚ (Admin)
    ↓
[Crear Galería]
    ↓
[Backend: Hash + JWT]
    ↓
[Link generado] → [Copiar o Email]
    ↓
[Rosa recibe link]
    ↓
[Hace clic en navegador]
    ↓
[Panel de login]
    ↓
[Ingresa contraseña]
    ↓
[Backend: Verifica JWT + Contraseña]
    ↓
[Session token creado]
    ↓
[Rosa ve sus fotos]
    ↓
[Descarga las que quiere]
    ↓
[Cierra sesión]
```

## 💾 ALMACENAMIENTO

```
DATOS DONDE VIVEN:

Browser (Cliente)
├── localStorage
│   └── sessionToken: "abc123..."
│       (Sesión actual, 24 horas)
│
Backend (Express)
├── En memoria
│   └── Procesa requests
│
Supabase (Cloud)
└── PostgreSQL
    └── private_galleries table
        ├── Galería 1: Rosa García
        ├── Galería 2: Juan Martínez
        └── Galería 3: María López
```

## 🎯 CASOS DE USO

### Caso 1: Bodas
```
1. Fotógrafo toma fotos
2. Sube a su computadora
3. Crea galería en panel admin
4. Envía link a novia por WhatsApp
5. Novia ve fotos, elige favoritas, descarga
```

### Caso 2: Eventos Corporativos
```
1. Fotógrafo en evento
2. Crea galería al finalizar
3. Manda link a empresa por email
4. Personal descarga fotos para redes
```

### Caso 3: Sesión de Fotos
```
1. Cliente tiene sesión de retratos
2. Fotógrafo crea galería con fotos
3. Cliente abre link desde su teléfono
4. Ve los resultados en vivo
5. Descarga sus favoritas
```

---

**¿Entiendes el flujo?** Este diagrama resume todo lo que sucede cuando creas una galería y la compartes.
