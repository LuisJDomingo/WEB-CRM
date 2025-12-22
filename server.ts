import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import fs from 'fs';
import createWorkersRouter from './server/routes/workers.js';

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

    // Log para depuración del token recibido
    console.log(`🔎 [Auth] Verificando token: "${token}" (longitud: ${token?.length})`);

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
    const { name, email, phone, eventType, message } = req.body;
    if (!name || !email || !eventType) return res.status(400).json({ error: 'Campos requeridos faltantes' });

    // --- CRM: Registrar o actualizar cliente ---
    const { data: existingClient } = await supabase.from('clients').select('id').eq('email', email).single();
    if (!existingClient) {
      await supabase.from('clients').insert([{ name, email, phone: phone || null, status: 'primer contacto', source: 'formulario_contacto' }]);
    }

    const { data, error } = await supabase.from('contact_messages').insert([{ name, email, phone: phone || null, event_type: eventType, message: message || null }]).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE GALERÍAS PÚBLICAS ====================
app.post('/api/gallery/create-with-images', upload.array('images', 100), async (req, res) => {
  try {
    const { clientName, clientEmail, eventDate, password, chronicle } = req.body;
    if (!clientName || !clientEmail || !password) return res.status(400).json({ error: 'Campos requeridos faltantes' });

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
    
    const { error } = await supabase
      .from('private_galleries')
      .update({ client_comments: comments })
      .eq('access_token', token);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE ADMINISTRACIÓN ====================

// --- Gestión de Trabajadores (Workers) ---
console.log('🛠️ Montando rutas de trabajadores en /api/admin/workers');
const workersRouter = createWorkersRouter(supabase);
app.use('/api/admin/workers', checkAuth, workersRouter);

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
      await supabase.from('client_activities').insert([{ client_id: id, worker_id: req.user.id, type: 'status_change', details: `Cambio de estado: "${oldClient.status}" ➔ "${status}"` }]);
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
    if (error) throw error;
    const stats = { totalClients: data.length, byStatus: { 'primer contacto': 0, 'conversacion iniciada': 0, 'cita concertada': 0, 'contratado': 0, 'descartado': 0 }, recentLeads: 0 };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    data.forEach(client => {
      if (stats.byStatus[client.status as keyof typeof stats.byStatus] !== undefined) {
        (stats.byStatus as any)[client.status]++;
      }
      if (new Date(client.created_at) > thirtyDaysAgo) stats.recentLeads++;
    });
    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/activities', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('client_activities').select('*, clients(name), workers(name)').order('created_at', { ascending: false }).limit(5);
    if (error) throw error;
    res.json({ activities: data });
  } catch (error: any) {
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
    { method: 'GET', path: '/api/admin/activities', desc: 'Actividad Reciente (Auth Required)' },
    { method: 'GET', path: '/api/bookings', desc: 'Listar Reservas (Query: date, business_id)' },
    { method: 'POST', path: '/api/bookings', desc: 'Crear Reserva (Body: date, time, client...)' },
  ];

  routes.forEach(r => {
    console.log(`| ${r.method.padEnd(6)} | ${r.path.padEnd(40)} | ${r.desc.padEnd(42)} |`);
  });
  console.log('====================================================================================================\n');
});
