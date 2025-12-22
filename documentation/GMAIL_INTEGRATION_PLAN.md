# 🔐 Plan de Integración Gmail OAuth2

## 📋 Descripción General

Este documento describe cómo pasar de la versión simulada a integración real con Gmail Calendar API.

**Tiempo estimado:** 2-3 horas
**Dificultad:** Intermedia
**Requisitos:** Google Cloud Project, credenciales OAuth2

---

## 🎯 Objetivos

Al finalizar, tendrás:
- ✅ Autenticación OAuth2 con Google
- ✅ Lectura de eventos del calendario principal
- ✅ Sincronización automática
- ✅ Actualización en tiempo real
- ✅ Manejo seguro de tokens

---

## 📦 Step 1: Configurar Google Cloud Project

### 1.1 Crear Proyecto
```bash
# En Google Cloud Console
1. Ir a console.cloud.google.com
2. Crear nuevo proyecto: "Fotógrafo Disponibilidad"
3. Esperar a que se cree (30 segundos)
```

### 1.2 Habilitar Calendar API
```bash
1. En el proyecto, ir a "APIs & Services"
2. Click "Enable APIs and Services"
3. Buscar "Google Calendar API"
4. Click "Enable"
5. Esperar confirmación
```

### 1.3 Crear Credenciales OAuth2
```bash
1. Ir a "Credentials" en el sidebar
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Te pedirá crear Consent Screen primero:
   - User Type: Externo
   - App name: "Fotógrafo Disponibilidad"
   - Email: tu_email@gmail.com
   - Support email: igual
   - Developer email: igual
   - Click Save and Continue
4. En Scopes:
   - Agregar scope: https://www.googleapis.com/auth/calendar.readonly
   - Click Save and Continue
5. En Test users:
   - Agregar tu email de Gmail
   - Click Save and Continue
6. Volver a Credentials
7. Click "Create Credentials" → "OAuth 2.0 Client ID"
8. Tipo: "Web application"
9. Name: "Fotógrafo App"
10. Authorized redirect URIs:
    - http://localhost:5174/admin/gallery (desarrollo)
    - http://localhost:5174/callback (alternativa)
    - https://tu-dominio.com/admin/gallery (producción)
11. Click Create
12. Descargar JSON (guardar seguro)
13. Copiar Client ID y Client Secret
```

### 1.4 Variables de Entorno
```bash
# .env (FRONTEND - Vite)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# .env (BACKEND - Node)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=yyy...
GOOGLE_REDIRECT_URI=http://localhost:5174/callback
```

---

## 💻 Step 2: Backend - Endpoint de Google Auth

### 2.1 Crear Endpoint en server-simple.cjs

```javascript
// server-simple.cjs - Agregar después de endpoints existentes

const axios = require('axios');

// POST /api/auth/google-token
// Intercambia authorization code por access token
app.post('/api/auth/google-token', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Intercambiar code por tokens
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    );
    
    const { access_token, refresh_token, expires_in } = response.data;
    
    // En producción: guardar refresh_token en BD
    // Para ahora: enviar access_token al frontend
    
    res.json({
      accessToken: access_token,
      expiresIn: expires_in,
      // Nota: refresh_token debe guardarse SERVER-SIDE solamente
    });
    
  } catch (error) {
    console.error('Google token exchange error:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Failed to exchange token',
      details: error.message 
    });
  }
});

// GET /api/calendar/events
// Obtiene eventos del calendario del usuario
app.get('/api/calendar/events', async (req, res) => {
  try {
    const { accessToken } = req.headers;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token' });
    }
    
    // Obtener eventos de Google Calendar
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          maxResults: 250,
          singleEvents: true,
          orderBy: 'startTime',
          // Opcional: timeMin para eventos desde hoy
          timeMin: new Date().toISOString()
        }
      }
    );
    
    const events = response.data.items || [];
    
    // Mapear a nuestro formato
    const calendarEvents = events.map(item => ({
      id: item.id,
      date: item.start.dateTime 
        ? item.start.dateTime.split('T')[0]
        : item.start.date,
      title: item.summary,
      startTime: item.start.dateTime 
        ? item.start.dateTime.split('T')[1].slice(0, 5)
        : '09:00',
      endTime: item.end.dateTime 
        ? item.end.dateTime.split('T')[1].slice(0, 5)
        : '10:00',
      status: 'booked', // Los eventos de Gmail siempre son "booked"
      description: item.description || '',
      source: 'gmail',
      createdAt: new Date(item.created).getTime()
    }));
    
    res.json({ events: calendarEvents });
    
  } catch (error) {
    console.error('Calendar fetch error:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error.message 
    });
  }
});

// POST /api/calendar/refresh-token
// Refresca un access token expirado (requiere refresh token guardado)
app.post('/api/calendar/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }
    );
    
    res.json({
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});
```

### 2.2 Instalar Axios (si no está)
```bash
npm install axios
```

---

## 🎨 Step 3: Frontend - Actualizar CalendarPanel.tsx

### 3.1 Reemplazar handleGmailConnect()

```typescript
// ANTES (simulado)
const handleGmailConnect = () => {
  if (gmailConnected) {
    setGmailConnected(false);
    const filtered = events.filter(e => e.source === 'local');
    setEvents(filtered);
    saveEvents(filtered);
    toast.success('Gmail desconectado');
  } else {
    setGmailConnected(true);
    syncGmailEvents();
    toast.success('Gmail conectado');
  }
};

// DESPUÉS (real)
const handleGmailConnect = async () => {
  if (gmailConnected) {
    // Desconectar
    setGmailConnected(false);
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('googleExpiresAt');
    
    const filtered = events.filter(e => e.source === 'local');
    setEvents(filtered);
    saveEvents(filtered);
    toast.success('Gmail desconectado');
    return;
  }
  
  // Conectar: Iniciar flujo OAuth2
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/admin/gallery`;
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar.readonly');
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    
    // Redirigir a Google Auth
    window.location.href = authUrl.toString();
    
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    toast.error('Error al conectar Gmail');
  }
};
```

### 3.2 Agregar Efecto para Manejar Redirect

```typescript
// Agregar nuevo useEffect en CalendarPanel
useEffect(() => {
  // Manejar retorno de Google OAuth
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');
  
  if (error) {
    toast.error('Error al autorizar Gmail: ' + error);
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  if (code) {
    // Intercambiar code por access token
    handleAuthorizationCode(code);
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

// Nueva función para manejar authorization code
const handleAuthorizationCode = async (code: string) => {
  try {
    toast.loading('Autorizando Gmail...');
    
    const response = await fetch('/api/auth/google-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) throw new Error('Failed to get access token');
    
    const { accessToken, expiresIn } = await response.json();
    
    // Guardar tokens en localStorage
    localStorage.setItem('googleAccessToken', accessToken);
    localStorage.setItem('googleExpiresAt', (Date.now() + expiresIn * 1000).toString());
    
    // Actualizar estado
    setGmailConnected(true);
    
    // Sincronizar eventos
    await syncGmailEventsReal(accessToken);
    
    toast.success('Gmail conectado exitosamente');
    
  } catch (error) {
    console.error('Authorization code error:', error);
    toast.error('Error al autorizar Gmail');
  }
};
```

### 3.3 Reemplazar syncGmailEvents()

```typescript
// ANTES (simulado)
const syncGmailEvents = () => {
  const gmailMockEvents = [
    {
      id: 'gmail-1',
      date: format(new Date(), 'yyyy-MM-dd'),
      title: 'Evento de Gmail',
      startTime: '14:00',
      endTime: '15:30',
      status: 'booked',
      description: 'Sincronizado desde Gmail',
      source: 'gmail',
      createdAt: Date.now()
    }
  ];
  
  const filtered = events.filter(e => e.source === 'local');
  const updated = [...filtered, ...gmailMockEvents];
  setEvents(updated);
  saveEvents(updated);
};

// DESPUÉS (real)
const syncGmailEventsReal = async (accessToken: string) => {
  try {
    const response = await fetch('/api/calendar/events', {
      headers: {
        'accessToken': accessToken
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch calendar');
    
    const { events: gmailEvents } = await response.json();
    
    // Filtrar eventos locales
    const filtered = events.filter(e => e.source === 'local');
    
    // Combinar con eventos de Gmail
    const updated = [...filtered, ...gmailEvents];
    setEvents(updated);
    saveEvents(updated);
    
    toast.success(`${gmailEvents.length} eventos sincronizados`);
    
  } catch (error) {
    console.error('Sync error:', error);
    toast.error('Error al sincronizar Gmail');
    setGmailConnected(false);
  }
};

// Mantener también version que usan useEffect
const syncGmailEvents = async () => {
  const accessToken = localStorage.getItem('googleAccessToken');
  if (accessToken) {
    await syncGmailEventsReal(accessToken);
  }
};
```

### 3.4 Agregar useEffect para Auto-Sync

```typescript
// Sincronizar cada 5 minutos si Gmail conectado
useEffect(() => {
  if (!gmailConnected) return;
  
  const interval = setInterval(() => {
    syncGmailEvents();
  }, 5 * 60 * 1000); // 5 minutos
  
  return () => clearInterval(interval);
}, [gmailConnected]);
```

### 3.5 Verificar Token Expirado

```typescript
// Agregar función para verificar token
const getValidAccessToken = async (): Promise<string | null> => {
  let token = localStorage.getItem('googleAccessToken');
  const expiresAt = localStorage.getItem('googleExpiresAt');
  
  if (!token) return null;
  
  // Si está próximo a expirar (< 5 minutos)
  if (expiresAt && Date.now() > parseInt(expiresAt) - 5 * 60 * 1000) {
    try {
      // Intentar refrescar token
      const response = await fetch('/api/calendar/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* refresh token desde backend */ })
      });
      
      if (response.ok) {
        const { accessToken, expiresIn } = await response.json();
        localStorage.setItem('googleAccessToken', accessToken);
        localStorage.setItem('googleExpiresAt', (Date.now() + expiresIn * 1000).toString());
        token = accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setGmailConnected(false);
      return null;
    }
  }
  
  return token;
};

// Usar en syncGmailEventsReal
const syncGmailEventsReal = async (accessToken?: string) => {
  try {
    const token = accessToken || await getValidAccessToken();
    if (!token) throw new Error('No valid access token');
    
    // ... resto del código
  } catch (error) {
    // ...
  }
};
```

---

## 🧪 Step 4: Testing

### 4.1 Ambiente Local
```bash
# Verificar variables de entorno
echo $env:VITE_GOOGLE_CLIENT_ID
echo $env:GOOGLE_CLIENT_SECRET

# Ejecutar
npm run dev    # Frontend
npm run server # Backend (en otra terminal)
```

### 4.2 Probar Flujo OAuth2
```
1. Ir a http://localhost:5174/admin/gallery
2. Click en "🔗 Conectar Gmail"
3. Se abrirá ventana de Google
4. Seleccionar cuenta Gmail
5. Autorizar acceso
6. Deberías ser redirigido a /admin/gallery
7. Toast debe decir "Gmail conectado"
8. Deberías ver tus eventos de Gmail
```

### 4.3 Verificar Eventos
```javascript
// En consola del navegador
console.log(JSON.parse(localStorage.getItem('calendarEvents')));
// Deberías ver eventos con source: 'gmail'
```

### 4.4 Edge Cases
- [ ] Desconectar Gmail y volver a conectar
- [ ] Crear evento local, conectar Gmail
- [ ] Crear evento local, sincronizar, crear otro local
- [ ] Eliminar evento local (no debería eliminar de Gmail)
- [ ] Token expirado (después de 1 hora)
- [ ] Sin conexión internet (debería funcionar offline)

---

## 🚀 Step 5: Deployment

### 5.1 Variables de Entorno en Producción
```bash
# En tu hosting (Vercel, Railway, etc.)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=yyy...
GOOGLE_REDIRECT_URI=https://tu-dominio.com/admin/gallery
```

### 5.2 Actualizar Google Cloud Console
```bash
1. Ir a Credentials
2. Editar OAuth 2.0 Client ID
3. Agregar redirect URI de producción:
   https://tu-dominio.com/admin/gallery
4. Guardar
```

### 5.3 Cambiar a Producción
```typescript
// En CalendarPanel.tsx
const redirectUri = process.env.NODE_ENV === 'production'
  ? `https://tu-dominio.com/admin/gallery`
  : `${window.location.origin}/admin/gallery`;
```

---

## ⚠️ Consideraciones de Seguridad

### ✅ Hacer
```typescript
// ✅ Validar código en backend
app.post('/api/auth/google-token', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });
  // Intercambiar con CLIENT_SECRET en backend
});

// ✅ Guardar refresh token server-side
database.saveRefreshToken(userId, refreshToken);

// ✅ Usar HTTPS en producción
const authUrl = 'https://accounts.google.com/...'; // No http

// ✅ Implementar PKCE para máxima seguridad
const codeVerifier = generateRandomString(128);
const codeChallenge = base64url(sha256(codeVerifier));
```

### ❌ Evitar
```typescript
// ❌ Nunca guardar CLIENT_SECRET en frontend
localStorage.setItem('googleClientSecret', secret); // MAL

// ❌ Nunca exponer refresh token al frontend
response.json({ refreshToken }); // MAL

// ❌ No validar scopes en frontend
authUrl.searchParams.append('scope', userInput); // MAL

// ❌ No confiar en access_token_expires del cliente
if (Date.now() > clientExpiresAt) { } // INSEGURO
```

---

## 📊 Comparación: Simulado vs Real

| Característica | Simulado | Real |
|---|---|---|
| Setup | 0 min | 30 min |
| Código | Sencillo | Moderado |
| Seguridad | N/A | Alta |
| Datos reales | ❌ | ✅ |
| Sincronización | Manual | Automática |
| Token refresh | No | ✅ |
| Multi-dispositivo | ❌ | ✅ |
| Offline | ✅ | ✅ |

---

## 🔄 Flujo Completo (Diagrama)

```
Usuario clickea "Conectar Gmail"
         ↓
Frontend genera Google Auth URL
         ↓
Redirige a accounts.google.com
         ↓
Usuario autoriza acceso
         ↓
Google redirige con code a /admin/gallery?code=xxx
         ↓
Frontend detecta code en URL
         ↓
Frontend POST /api/auth/google-token con code
         ↓
Backend (server-simple.cjs):
  - Intercambia code con CLIENT_SECRET
  - Recibe access_token + refresh_token
  - Guarda refresh_token en BD
  - Retorna solo access_token a frontend
         ↓
Frontend guarda access_token en localStorage
         ↓
Frontend GET /api/calendar/events con access_token
         ↓
Backend fetch a Google Calendar API
         ↓
Backend mapea eventos a nuestro formato
         ↓
Frontend recibe eventos y muestra en calendario
         ↓
Auto-refresh cada 5 minutos
```

---

## 📞 Troubleshooting

| Problema | Solución |
|---|---|
| "Invalid client" | Verifica GOOGLE_CLIENT_ID y CLIENT_SECRET |
| Redirect URI no coincide | Actualiza en Google Cloud Console |
| No aparecen eventos | Verifica scope en OAuth consent screen |
| Token siempre expira | Implementa token refresh |
| Eventos duplicados | Filtra por ID antes de guardar |
| Memory leak | Limpiar intervals en useEffect cleanup |

---

## 📝 Checklist de Implementación

- [ ] Crear Google Cloud Project
- [ ] Habilitar Google Calendar API
- [ ] Crear OAuth2 credentials
- [ ] Configurar consent screen
- [ ] Agregar variables de entorno
- [ ] Implementar endpoint /api/auth/google-token
- [ ] Implementar endpoint /api/calendar/events
- [ ] Actualizar handleGmailConnect()
- [ ] Agregar handleAuthorizationCode()
- [ ] Reemplazar syncGmailEvents()
- [ ] Agregar useEffect para redirect
- [ ] Agregar auto-sync interval
- [ ] Implementar token refresh
- [ ] Pruebas locales
- [ ] Deploy a producción
- [ ] Actualizar Google Cloud URLs
- [ ] Verificar en producción

---

## 📚 Recursos

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [React Google Login](https://github.com/react-oauth/react-oauth.io)
- [Security Best Practices](https://developers.google.com/identity/protocols/oauth2/security-best-practices)

---

**Próximo Paso:** Comienza por Step 1 (Google Cloud Setup)
