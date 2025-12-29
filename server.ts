import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import fs from 'fs';
import createWorkersRouter from './server/routes/workers.js';
import createAdminAdsRouter from './server/routes/adminAds.js';

// Extender el tipo Request de Express para incluir la propiedad `user`
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

// ---------------- CONFIG ----------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Variable mutable para el token de Meta (para permitir renovación automática en memoria)
let metaAccessToken = process.env.META_ACCESS_TOKEN;

// ---------------- SUPABASE ----------------
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabaseKey = serviceKey || anonKey || '';

if (!serviceKey) {
  console.warn('⚠️  ADVERTENCIA: No se encontró SUPABASE_SERVICE_ROLE_KEY en .env.local.');
  console.warn('El backend usará la clave anónima (anon key). Esto puede causar problemas de permisos si tienes RLS activado.');
  supabaseKey = anonKey || '';
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- MULTER (File Uploads) ----------------
const uploadsDir = path.join(__dirname, 'public/gallery-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsDir), filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) });
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ---------------- MIDDLEWARE AUTH ----------------
const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Log para depuración (muestra los primeros caracteres del token)
  // console.log(`🔐 [Auth] Header recibido: ${authHeader ? authHeader.substring(0, 25) + '...' : 'NULO'}`);

  if (!authHeader?.startsWith('Bearer ')) {
    console.log('❌ [Auth] Petición rechazada: No hay cabecera Bearer');
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const token = authHeader.split(' ')[1];

    // Verificación adicional para tokens malformados comunes
    if (!token || token === 'null' || token === 'undefined') {
      console.error('❌ [Auth] Petición rechazada: El token es nulo, undefined o no es una cadena válida.');
      return res.status(401).json({ error: 'Token de autenticación ausente o malformado.' });
    }

    req.user = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch (err: any) {
    console.error('❌ [Auth] Token inválido:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// ---------------- HEALTHCHECK ----------------
app.get('/', (req, res) => {
  res.send('✅ El Backend está funcionando correctamente. Accede al frontend en http://localhost:5174');
});
 
// ---------------- LOGIN ADMIN ----------------
app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { data: worker, error } = await supabase
      .from('workers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !worker) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, worker.password_hash || '');
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: worker.id, email: worker.email, role: worker.role, name: worker.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      worker: {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        role: worker.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// ==================== RUTAS DE CONTACTO ====================
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, eventType, message, source } = req.body;
    if (!name || !email || !eventType) return res.status(400).json({ error: 'Campos requeridos faltantes' });

    // --- CRM: Registrar o actualizar cliente ---
    let clientId;
    // Verificamos si existe (usando array para evitar errores si no hay resultados)
    const { data: existingClients } = await supabase.from('clients').select('id').eq('email', email);
    const existingClient = existingClients?.[0];
    
    if (existingClient) {
      clientId = existingClient.id;
      // Si el cliente ya existe, actualizamos su mensaje para que conste la nueva interacción
      await supabase
        .from('clients')
        .update({ message: message || null, updated_at: new Date().toISOString() })
        .eq('id', clientId);
    } else {
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert([{ 
          name, 
          email, 
          phone: phone || null, 
          status: 'primer contacto', 
          source: source || 'formulario_contacto', // Guardamos la fuente real (ej: 'instagram', 'facebook')
          message: message || null 
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error al crear cliente:', createError);
        throw createError;
      }
      clientId = newClient.id;
    }

    // --- NOTIFICACIÓN: Crear actividad para el Dashboard ---
    if (clientId) {
      const { error: activityError } = await supabase.from('client_activities').insert([{ client_id: clientId, type: 'contact_form', details: message ? `Mensaje: ${message.substring(0, 50)}...` : 'Solicitud de información', is_read: false }]);
      if (activityError) {
        console.error('❌ Error creando notificación en client_activities:', activityError);
      }
    }

    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE GALERÍAS PÚBLICAS ====================
app.post('/api/gallery/create-with-images', upload.array('images', 100), async (req, res) => {
  try {
    const { clientName, clientEmail, eventDate, password, chronicle } = req.body;
    if (!clientName || !clientEmail || !password) return res.status(400).json({ error: 'Campos requeridos faltantes' });

    // --- CRM: Asegurar que el cliente existe en la tabla 'clients' ---
    // Esto garantiza que "todos los clientes estén en la misma tabla"
    const { data: existingClients } = await supabase.from('clients').select('id').eq('email', clientEmail);
    
    if (!existingClients || existingClients.length === 0) {
      // Si no existe, lo creamos automáticamente como 'cliente'
      await supabase.from('clients').insert([{ 
        name: clientName, 
        email: clientEmail, 
        status: 'cliente', // Estado directo a cliente porque ya tiene galería
        source: 'galeria_privada',
        notes: `Galería creada para evento del: ${eventDate}`,
        created_at: new Date().toISOString()
      }]);
      console.log(`✅ Cliente ${clientName} registrado automáticamente en CRM al crear galería.`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const accessToken = jwt.sign({ email: clientEmail, name: clientName }, JWT_SECRET, { expiresIn: '90d' });
    const imageUrls = (req.files as Express.Multer.File[] || []).map(file => ({ url: `/gallery-uploads/${file.filename}` }));

    const { data, error } = await supabase.from('private_galleries').insert([{ client_email: clientEmail, client_name: clientName, event_date: eventDate, password_hash: passwordHash, access_token: accessToken, images: imageUrls, chronicle: chronicle || null }]).select();
    if (error) throw error;

    res.json({ success: true, gallery: data?.[0], accessLink: `http://localhost:5174/gallery/${accessToken}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gallery/verify', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' });

    const { data, error } = await supabase.from('private_galleries').select('*').eq('access_token', token).single();
    if (error || !data) return res.status(404).json({ error: 'Galería no encontrada' });

    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    if (!passwordMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({ success: true, gallery: { id: data.id, clientName: data.client_name, images: data.images } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gallery/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { data, error } = await supabase.from('private_galleries').select('*').eq('access_token', token).single();
    if (error || !data) return res.status(404).json({ error: 'Galería no encontrada' });
    res.json({ success: true, gallery: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gallery/:token/comments', async (req, res) => {
  try {
    const { token } = req.params;
    const { comments } = req.body;
    
    // 1. Actualizar comentarios en la galería
    const { data: gallery, error } = await supabase
      .from('private_galleries')
      .update({ client_comments: comments })
      .eq('access_token', token)
      .select()
      .single();

    if (error) throw error;

    // 2. Crear notificación en el Dashboard (Activity)
    if (gallery) {
      // Buscar si el cliente ya existe en el CRM
      let { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('email', gallery.client_email)
        .single();

      // Si no existe, lo creamos para poder asociar la notificación
      if (!client) {
        const { data: newClient } = await supabase.from('clients').insert([{ name: gallery.client_name, email: gallery.client_email, status: 'conversacion iniciada', source: 'galeria_privada' }]).select().single();
        client = newClient;
      }

      // Insertar la actividad
      if (client) {
        await supabase.from('client_activities').insert([{
          client_id: client.id,
          type: 'gallery_comment',
          details: `Nuevo comentario en galería: "${comments.substring(0, 50)}${comments.length > 50 ? '...' : ''}"`,
          is_read: false
        }]);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE IA (INTEGRACIÓN PYTHON) ====================
app.post('/api/ai/generate-copy', checkAuth, async (req, res) => {
  try {
    const { content, platform } = req.body;
    
    // URL del servicio Python (FastAPI)
    // Asumimos que corre en el puerto 8000 (puerto por defecto de uvicorn)
    const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';

    const response = await fetch(`${pythonUrl}/api/ai/generate-copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, platform })
    });

    if (!response.ok) throw new Error(`Error en el servicio de IA (Python): ${response.statusText}`);
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    // Detectar si el error es porque el servidor Python está apagado
    const isConnectionError = error.message.includes('fetch failed') || error.code === 'ECONNREFUSED';
    const errorMessage = isConnectionError 
      ? 'El servidor de IA (Python) no está conectado. Asegúrate de ejecutar "npm run python" o "npm run start:all".' 
      : error.message;
      
    console.error('❌ Error generando copy:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/ai/generate-blog-post', checkAuth, async (req, res) => {
  try {
    const { topic } = req.body;
    
    const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';

    const response = await fetch(`${pythonUrl}/api/ai/generate-blog-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) throw new Error(`Error en el servicio de IA (Python): ${response.statusText}`);
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('❌ Error generando blog post:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ai/health', async (req, res) => {
  try {
    const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
    const response = await fetch(`${pythonUrl}/api/ai/health`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// ==================== RUTAS DE BLOG (NOTICIAS) ====================

// Obtener todos los posts (Público)
app.get('/api/blog/posts', async (req, res) => {
  try {
    // Si quieres filtrar por publicados: .eq('status', 'published')
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });
      
    if (error) throw error;
    res.json({ posts: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Crear/Editar Post (Admin)
app.post('/api/admin/blog/posts', checkAuth, async (req, res) => {
  try {
    const { id, title, slug, content, excerpt, image_url, status } = req.body;
    
    const postData = {
      title,
      slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      content,
      excerpt,
      image_url,
      status: status || 'draft',
      published_at: status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      // Actualizar
      result = await supabase.from('blog_posts').update(postData).eq('id', id).select().single();
    } else {
      // Crear
      result = await supabase.from('blog_posts').insert([postData]).select().single();
    }

    if (result.error) throw result.error;
    res.json({ success: true, post: result.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE ANALÍTICA (PREPARADO PARA APIS EXTERNAS) ====================

// 1. Métricas de Posts Sociales (Bulk)
// Recibe una lista de IDs y devuelve sus métricas (Vistas, Likes, Leads)
app.post('/api/analytics/social/metrics', checkAuth, async (req, res) => {
  try {
    const { postIds } = req.body; // Array de IDs de posts
    const metricsMap: Record<string, any> = {};
    
    // 1. INTENTO DE CONEXIÓN REAL (Si existen credenciales)
    // Requiere META_ACCESS_TOKEN en .env.local y que los postIds sean IDs reales de Facebook/Instagram
    if (metaAccessToken && postIds.length > 0) {
      try {
        const response = await axios.get(`https://graph.facebook.com/v19.0/insights`, {
          params: {
            ids: postIds.join(','),
            metric: 'post_impressions,post_reactions_like',
            access_token: metaAccessToken
          }
        });
        
        if (response.data && response.data.data) {
          // Si la API responde con datos, significa que los IDs son reales
          console.log('✅ Datos recibidos de Meta API para', Object.keys(response.data.data).length, 'posts');
          // Aquí se procesarían los datos reales para llenar metricsMap
        }
      } catch (error: any) {
        // Si falla (común si los IDs son simulados tipo "k92js..."), usamos el fallback
        // Solo mostramos error si es un problema de autenticación real
        if (error.response?.status === 401 || error.response?.status === 403) {
           console.error('❌ Error Auth Meta API: Token inválido o expirado.');
        }
      }
    }
    
    // 2. FALLBACK: SIMULACIÓN (Si no hay API o falló)
    // Cuando tengas las APIs, simplemente rellena metricsMap con los datos reales
    if (Array.isArray(postIds)) {
      postIds.forEach((id: string) => {
        // Generación determinista basada en ID para consistencia (simula persistencia de datos reales)
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
        const seed = Math.abs(hash);
        const pseudoRandom = (offset: number) => {
          const x = Math.sin(seed + offset) * 10000;
          return x - Math.floor(x);
        };

        metricsMap[id] = {
          views: Math.floor(pseudoRandom(1) * 3000) + 500,
          likes: Math.floor(pseudoRandom(2) * 250) + 20,
          leads: Math.floor(pseudoRandom(3) * 15)
        };
      });
    }
    
    res.json({ metrics: metricsMap });
  } catch (error: any) {
    console.error('❌ Error fetching metrics:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Datos Históricos (Gráfico de Líneas)
// Devuelve la evolución de Leads vs Gasto para el gráfico del Dashboard
app.get('/api/analytics/historical', checkAuth, async (req, res) => {
  try {
    const days = 30;
    const data = [];
    
    // TODO: Conectar con base de datos de 'ad_campaign_metrics' o API de Meta Marketing
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      
      data.push({
        date: d.toISOString().split('T')[0], // YYYY-MM-DD
        leads: Math.floor(Math.random() * 8) + (i * 0.3), // Simulación de tendencia
        spend: Number((Math.random() * 15 + 10 + (i * 0.5)).toFixed(2))
      });
    }
    
    res.json({ historical: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE ADMINISTRACIÓN ====================

// --- Gestión de Trabajadores (Workers) ---
console.log('🛠️ Montando rutas de trabajadores en /api/admin/workers');
const workersRouter = createWorkersRouter(supabase);
app.use('/api/admin/workers', checkAuth, workersRouter);

// --- Gestión de Publicidad (Ads Manager) ---
// Protegemos las rutas de datos y gestión, pero dejamos públicas las de Auth/Callback
app.use('/api/admin/ads/campaigns', checkAuth);
app.use('/api/admin/ads/campaign', checkAuth);
const adminAdsRouter = createAdminAdsRouter(supabase);
app.use('/api/admin/ads', adminAdsRouter);
console.log('📢 Rutas de publicidad montadas en /api/admin/ads');

// --- Gestión de Clientes (CRM) ---
app.get('/api/admin/clients', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('clients').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    res.json({ clients: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/clients/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error) throw error;
    res.json({ client: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/clients/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data: oldClient } = await supabase.from('clients').select('status').eq('id', id).single();
    const { data, error } = await supabase.from('clients').update(updateData).eq('id', id).select().single();
    if (error) throw error;

    if (status && oldClient && oldClient.status !== status && req.user) {
      await supabase.from('client_activities').insert([{ client_id: id, worker_id: req.user.id, type: 'status_change', details: `Cambio de estado: "${oldClient.status}" ➔ "${status}"`, is_read: false }]);
    }
    res.json({ success: true, client: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/clients/:id/activities', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('client_activities').select('*, workers(name)').eq('client_id', id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ activities: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Gestión de Galerías (Admin) ---
app.get('/api/admin/galleries', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('private_galleries').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ galleries: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/gallery/:token', checkAuth, async (req, res) => {
  try {
    const { token } = req.params;
    const { error } = await supabase.from('private_galleries').update({ deleted_at: new Date().toISOString() }).eq('access_token', token);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Reportes y Estadísticas ---
app.get('/api/admin/stats', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('clients').select('status, created_at');
    const { data: clientsData, error: clientsError } = await supabase.from('clients').select('status, source, created_at');
    
    if (clientsError) throw clientsError;
    const stats = { totalClients: clientsData.length, byStatus: { 'primer contacto': 0, 'conversacion iniciada': 0, 'cita concertada': 0, 'contratado': 0, 'descartado': 0 }, bySource: {} as Record<string, number>, recentLeads: 0 };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    clientsData.forEach(client => {
      if (stats.byStatus[client.status as keyof typeof stats.byStatus] !== undefined) {
        (stats.byStatus as any)[client.status]++;
      }
      // Contar por fuente (origen)
      const src = (client.source || 'directo').toLowerCase();
      stats.bySource[src] = (stats.bySource[src] || 0) + 1;

      if (new Date(client.created_at) > thirtyDaysAgo) stats.recentLeads++;
    });
    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/activities', checkAuth, async (req, res) => {
  try {
    // Obtenemos solo las no leídas y sin límite para el scroll
    const { data, error } = await supabase
      .from('client_activities')
      .select('*, clients(name), workers(name)')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filtrar notificaciones: Los cambios de estado solo aparecen si ocurrieron en la última semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const filteredActivities = (data || []).filter((activity: any) => {
      if (activity.type === 'status_change') {
        // Solo mostrar si ocurrió hace 7 días o más (created_at <= oneWeekAgo)
        return new Date(activity.created_at) <= oneWeekAgo;
      }
      return true;
    });

    res.json({ activities: filteredActivities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/activities/:id/read', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Intentamos actualizar todo (estado y fecha)
    let { error } = await supabase
      .from('client_activities')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    // Si falla porque no existe la columna 'read_at', intentamos solo actualizar 'is_read'
    if (error && error.message.includes('read_at')) {
      console.warn('⚠️ La columna read_at no existe, actualizando solo is_read');
      const retry = await supabase.from('client_activities').update({ is_read: true }).eq('id', id);
      error = retry.error;
    }

    if (error) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ ERROR DE PERMISOS: No se pudo actualizar la notificación. NECESITAS configurar la SUPABASE_SERVICE_ROLE_KEY en tu .env.local para que el backend tenga permisos de escritura.');
      }
      throw error;
    }
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error: any) {
    console.error('❌ Error al marcar notificación como leída:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS PARA EL CHATBOT DE RESERVAS ====================

app.get('/api/bookings', async (req, res) => {
  try {
    const { date, business_id } = req.query;
    let query = supabase.from('bookings').select('start_time').eq('business_id', business_id || 'demo');
    if (date) query = query.eq('date', date as string);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { business_id, date, start_time, customer_name, customer_email, customer_phone, event_details } = req.body;

    // --- Integración con CRM ---
    if (customer_email) {
      const { data: existingClient } = await supabase.from('clients').select('*').eq('email', customer_email).single();
      if (existingClient) {
        await supabase.from('clients').update({ status: 'cita concertada', name: customer_name || existingClient.name, phone: customer_phone || existingClient.phone, updated_at: new Date().toISOString() }).eq('email', customer_email);
      } else {
        await supabase.from('clients').insert([{ name: customer_name, email: customer_email, phone: customer_phone, status: 'cita concertada', source: 'chatbot_reserva' }]);
      }
    }

    const { data, error } = await supabase.from('bookings').insert([{ business_id: business_id || 'demo', date, start_time, customer_name, customer_email, customer_phone, event_details }]).select();
    if (error) throw error;
    res.json({ success: true, booking: data[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TAREAS PROGRAMADAS (CRON JOBS) ====================

const checkStaleLeads = async () => {
  console.log('🕵️  Revisando leads inactivos (+7 días)...');
  try {
    // 1. Obtener clientes activos (no contratados ni descartados)
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, status, created_at, updated_at')
      .neq('status', 'contratado')
      .neq('status', 'descartado');

    if (error) throw error;
    if (!clients) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const client of clients) {
      // Usar updated_at si existe (último cambio), si no created_at (fecha de entrada)
      const lastActivityStr = client.updated_at || client.created_at;
      const lastActivity = new Date(lastActivityStr);

      if (lastActivity < sevenDaysAgo) {
        // El cliente está inactivo. Verificar si ya existe una alerta pendiente para no duplicar.
        const { data: existing } = await supabase
          .from('client_activities')
          .select('id')
          .eq('client_id', client.id)
          .eq('type', 'stale_warning')
          .eq('is_read', false)
          .single();

        if (!existing) {
          console.log(`⚠️  Lead inactivo detectado: ${client.name}`);
          await supabase.from('client_activities').insert([{
            client_id: client.id,
            type: 'stale_warning',
            details: `ALERTA: ${client.name} lleva más de 7 días sin seguimiento.`,
            is_read: false,
            created_at: new Date().toISOString()
          }]);
        }
      }
    }
  } catch (err) {
    console.error('Error en checkStaleLeads:', err);
  }
};

const syncAdMetrics = async () => {
  console.log('🔄 [CRON] Sincronizando métricas de publicidad...');
  try {
    // Aquí iría la lógica para llamar a las APIs de Meta/TikTok y actualizar la tabla ad_campaign_metrics
    // Por ahora, simulamos una actualización de "última sincronización"
    /* await supabase.from('ad_platforms').update({ 
         updated_at: new Date().toISOString() 
       }).eq('is_active', true); */
    // console.log('✅ Métricas sincronizadas');
  } catch (err) {
    console.error('❌ Error sincronizando ads:', err);
  }
};

const refreshMetaToken = async () => {
  if (!process.env.META_APP_ID || !process.env.META_APP_SECRET || !metaAccessToken) return;

  console.log('🔄 [CRON] Renovando token de Meta (Facebook/Instagram)...');
  try {
    // Intercambiar el token actual por uno nuevo de larga duración
    const response = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: metaAccessToken
      }
    });

    if (response.data.access_token) {
      metaAccessToken = response.data.access_token;
      console.log('✅ Token de Meta renovado exitosamente en memoria.');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    if (errorMessage.includes('Invalid Client ID')) {
      console.warn('⚠️  Meta Config: Client ID inválido. Se desactiva la renovación automática del token.');
      metaAccessToken = undefined; // Evitar futuros intentos
    } else {
      console.error('❌ Error renovando token de Meta:', errorMessage);
    }
  }
};

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`👉 Si ves esto, estás ejecutando server.ts correctamente.`);

  console.log('\n📚 API Endpoints Disponibles:');
  console.log('====================================================================================================');
  console.log('| MÉTODO | RUTA                                     | DESCRIPCIÓN                                |');
  console.log('|--------|------------------------------------------|--------------------------------------------|');
  
  const routes = [
    { method: 'GET', path: '/', desc: 'Healthcheck - Verificar estado' },
    { method: 'POST', path: '/api/admin/login', desc: 'Login Admin (Body: email, password)' },
    { method: 'POST', path: '/api/contact', desc: 'Contacto Público (Body: name, email...)' },
    { method: 'POST', path: '/api/gallery/create-with-images', desc: 'Crear Galería (Multipart: images, data)' },
    { method: 'POST', path: '/api/gallery/verify', desc: 'Verificar Acceso Galería (token, password)' },
    { method: 'GET', path: '/api/gallery/:token', desc: 'Ver Galería Pública' },
    { method: 'ROUTER', path: '/api/admin/workers/*', desc: 'CRUD Trabajadores (Auth Required)' },
    { method: 'GET', path: '/api/admin/clients', desc: 'Listar Clientes CRM (Auth Required)' },
    { method: 'PUT', path: '/api/admin/clients/:id', desc: 'Actualizar Cliente (Auth Required)' },
    { method: 'GET', path: '/api/admin/clients/:id/activities', desc: 'Historial Cliente (Auth Required)' },
    { method: 'GET', path: '/api/admin/galleries', desc: 'Listar Galerías Admin (Auth Required)' },
    { method: 'DELETE', path: '/api/admin/gallery/:token', desc: 'Eliminar Galería (Auth Required)' },
    { method: 'GET', path: '/api/admin/stats', desc: 'Estadísticas Dashboard (Auth Required)' },
    { method: 'GET', path: '/api/admin/activities', desc: 'Actividad Reciente NO LEÍDA (Auth)' },
    { method: 'PATCH', path: '/api/admin/activities/:id/read', desc: 'Marcar Notificación como leída (Auth)' },
    { method: 'GET', path: '/api/bookings', desc: 'Listar Reservas (Query: date, business_id)' },
    { method: 'POST', path: '/api/bookings', desc: 'Crear Reserva (Body: date, time, client...)' },
    { method: 'GET', path: '/api/admin/ads/auth/:provider', desc: 'Iniciar OAuth Ads (Meta/TikTok)' },
    { method: 'GET', path: '/api/admin/ads/campaigns', desc: 'Listar Campañas (Auth Required)' },
    { method: 'POST', path: '/api/analytics/social/metrics', desc: 'Obtener Métricas Posts (Bulk)' },
    { method: 'GET', path: '/api/analytics/historical', desc: 'Datos Históricos Dashboard' },
    { method: 'GET', path: '/api/ai/health', desc: 'Diagnóstico Estado IA' },
  ];

  routes.forEach(r => {
    console.log(`| ${r.method.padEnd(6)} | ${r.path.padEnd(40)} | ${r.desc.padEnd(42)} |`);
  });
  console.log('====================================================================================================\n');

  // Verificación de Credenciales para Modo Real
  console.log('📊 Estado de Conexión a APIs Externas:');
  if (process.env.META_APP_ID && process.env.META_APP_SECRET) {
    console.log('✅ Meta (Facebook/Instagram): Credenciales configuradas.');
  } else {
    console.log('⚠️  Meta (Facebook/Instagram): Faltan credenciales en .env.local (Modo Simulación activo).');
  }
  console.log(process.env.TIKTOK_APP_ID ? '✅ TikTok: Credenciales configuradas.' : '⚠️  TikTok: Faltan credenciales en .env.local.');
  console.log('');

  // Iniciar revisión de leads inactivos
  checkStaleLeads(); // Ejecutar al arrancar
  setInterval(checkStaleLeads, 24 * 60 * 60 * 1000); // Repetir cada 24 horas
  setInterval(syncAdMetrics, 60 * 60 * 1000); // Sincronizar anuncios cada 1 hora
  
  // Renovar token de Meta cada 5 días (los tokens de larga duración duran 60 días)
  if (metaAccessToken) {
      refreshMetaToken(); // Intentar refrescar al inicio para asegurar validez
      setInterval(refreshMetaToken, 5 * 24 * 60 * 60 * 1000);
  }
});
