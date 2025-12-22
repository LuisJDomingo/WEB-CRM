#!/usr/bin/env node

/**
 * Servidor Express para Galerías Privadas
 * Este es un servidor simplificado sin dependencias de ESM loaders
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta raíz para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('✅ El Backend está funcionando correctamente. Accede al frontend en http://localhost:5174');
});

// Configurar almacenamiento de archivos
const uploadsDir = path.join(__dirname, 'public/gallery-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB por archivo
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Inicializar Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Usar la clave de servicio (Service Role) si existe para saltar RLS en el backend, si no, usar la anónima
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('\n--- Diagnóstico de Arranque ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key cargada:', !!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SÍ ✅' : 'NO ❌');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  ADVERTENCIA: Si tienes RLS activado en la tabla "workers", el login fallará sin la Service Role Key.');
}
console.log('-------------------------------\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas');
  console.error('Asegúrate de tener un archivo .env.local con estas variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-aqui';

// Middleware para proteger rutas de administrador
const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Adjuntamos los datos del usuario decodificados a la petición para uso futuro
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token inválido o expirado.' });
  }
};

// Verificación de conexión al inicio
(async () => {
  try {
    // Intentamos una consulta ligera para verificar conectividad
    const { error } = await supabase.from('workers').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.message && (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND'))) {
        console.error('\n❌ ERROR CRÍTICO DE CONEXIÓN CON SUPABASE');
        console.error('========================================');
        console.error('El servidor no puede conectar con la base de datos.');
        console.error('URL configurada:', supabaseUrl);
        console.error('\nPosibles causas:');
        console.error('1. 🛑 PROYECTO PAUSADO: Si usas la capa gratuita, Supabase pausa los proyectos inactivos -> Entra al dashboard y dale a "Restore".');
        console.error('2. 🔗 URL INCORRECTA: Verifica que VITE_SUPABASE_URL en .env.local sea correcta.');
        console.error('3. 🌐 SIN INTERNET: Tu servidor no tiene acceso a la red.');
        console.error('========================================\n');
      } else {
        console.error('⚠️  Advertencia: Supabase respondió con error al iniciar:', error.message);
      }
    } else {
      console.log('✅ Conexión a Supabase verificada correctamente.');
    }
  } catch (err) {
    console.error('❌ Error CRÍTICO: No se puede conectar a Supabase. Revisa tu URL en .env.local\n   Detalle:', err.message);
  }
})();

// ==================== RUTAS DE CONTACTO ====================

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, eventType, message } = req.body;

    if (!name || !email || !eventType) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    // --- CRM: Registrar o actualizar cliente (Primer Contacto) ---
    try {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single();

      if (!existingClient) {
        await supabase.from('clients').insert([{
          name,
          email,
          phone: phone || null,
          status: 'primer contacto',
          source: 'formulario_contacto'
        }]);
      }
    } catch (crmError) {
      console.error('Error CRM en contacto:', crmError);
      // No bloqueamos el flujo principal si falla el CRM
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          event_type: eventType,
          message: message || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ error: 'Error al guardar el mensaje' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== RUTAS DE GALERÍAS ====================

// Crear galería privada
app.post('/api/gallery/create', async (req, res) => {
  try {
    const { clientName, clientEmail, eventDate, password } = req.body;

    if (!clientName || !clientEmail || !password) {
      return res.status(400).json({ error: 'Campos requeridos: clientName, clientEmail, password' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const accessToken = jwt.sign(
      { email: clientEmail, name: clientName },
      JWT_SECRET,
      { expiresIn: '90d' }
    );

    const { data, error } = await supabase
      .from('private_galleries')
      .insert([
        {
          client_email: clientEmail,
          client_name: clientName,
          event_date: eventDate || new Date().toISOString(),
          password_hash: passwordHash,
          access_token: accessToken,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error Supabase:', error);
      return res.status(500).json({ error: 'Error al crear galería' });
    }

    const accessLink = `http://localhost:5174/gallery/${accessToken}`;

    res.json({
      success: true,
      gallery: data?.[0],
      accessLink,
      message: `Galería creada. Link: ${accessLink}`,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear galería con imágenes (nuevo endpoint)
app.post('/api/gallery/create-with-images', upload.array('images', 100), async (req, res) => {
  try {
    const { clientName, clientEmail, eventDate, password } = req.body;

    if (!clientName || !clientEmail || !password) {
      return res.status(400).json({ error: 'Campos requeridos: clientName, clientEmail, password' });
    }

    // Generar hash de contraseña y token
    const passwordHash = await bcrypt.hash(password, 10);
    const accessToken = jwt.sign(
      { email: clientEmail, name: clientName },
      JWT_SECRET,
      { expiresIn: '90d' }
    );

    // Procesar imágenes
    const imageUrls = (req.files || []).map(file => ({
      filename: file.filename,
      url: `/gallery-uploads/${file.filename}`,
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
    }));

    // Validar y procesar la fecha
    let finalDate = new Date().toISOString();
    if (eventDate && eventDate.trim() !== '') {
      const parsedDate = new Date(eventDate);
      if (!isNaN(parsedDate.getTime())) {
        finalDate = parsedDate.toISOString();
      }
    }

    // Crear registro en Supabase
    const { data, error } = await supabase
      .from('private_galleries')
      .insert([
        {
          client_email: clientEmail,
          client_name: clientName,
          event_date: finalDate,
          password_hash: passwordHash,
          access_token: accessToken,
          images: imageUrls,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error Supabase:', error);
      return res.status(500).json({ error: 'Error al crear galería' });
    }

    const accessLink = `http://localhost:5174/gallery/${accessToken}`;

    res.json({
      success: true,
      gallery: data?.[0],
      accessLink,
      imagesCount: imageUrls.length,
      message: `Galería creada con ${imageUrls.length} imágenes. Link: ${accessLink}`,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar acceso a galería
app.post('/api/gallery/verify', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña requeridos' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const { data, error } = await supabase
      .from('private_galleries')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const sessionToken = jwt.sign(
      { galleryId: data.id, email: data.client_email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      sessionToken,
      gallery: {
        id: data.id,
        clientName: data.client_name,
        clientEmail: data.client_email,
        eventDate: data.event_date,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener detalles de galería
app.get('/api/gallery/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const { data, error } = await supabase
      .from('private_galleries')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    res.json({
      success: true,
      gallery: {
        id: data.id,
        client_name: data.client_name,
        client_email: data.client_email,
        event_date: data.event_date,
        created_at: data.created_at,
        images: data.images || [],
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Enviar email (simulado)
app.post('/api/gallery/send-link', async (req, res) => {
  try {
    const { email, accessLink, link, clientName, password } = req.body;
    const finalLink = accessLink || link;

    if (!email || !finalLink || !clientName) {
      return res.status(400).json({ error: 'Campos requeridos: email, accessLink/link, clientName' });
    }

    const emailHTML = `
      <h2>¡Tu Galería Está Lista!</h2>
      <p>Hola ${clientName},</p>
      <p>Tu galería privada de fotos está lista para ver.</p>
      <p><strong>Acceso:</strong> <a href="${finalLink}">${finalLink}</a></p>
      <p><strong>Contraseña:</strong> ${password}</p>
      <p>¡Disfruta tus fotos!</p>
    `;

    console.log(`\n📧 ════════════════════════════════════════`);
    console.log(`   Email enviado a: ${email}`);
    console.log(`   Para: ${clientName}`);
    console.log(`   Link: ${finalLink}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`════════════════════════════════════════\n`);

    res.json({ success: true, message: 'Email enviado correctamente (simulado en consola)' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al enviar email' });
  }
});

// ==================== ENDPOINTS ADMIN ====================

// GET todas las galerías activas
app.get('/api/admin/galleries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('private_galleries')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ error: 'Error al obtener galerías' });
    }

    res.json({ success: true, galleries: data || [] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET una galería específica por token (acceso admin)
app.get('/api/admin/gallery/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { data, error } = await supabase
      .from('private_galleries')
      .select('*')
      .eq('access_token', token)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    res.json({ success: true, gallery: data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT actualizar galería (admin)
app.put('/api/admin/gallery/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { client_name, client_email, notes } = req.body;

    const updateData = {};
    if (client_name !== undefined) updateData.client_name = client_name;
    if (client_email !== undefined) updateData.client_email = client_email;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('private_galleries')
      .update(updateData)
      .eq('access_token', token)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    res.json({ success: true, gallery: data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT actualizar imágenes de una galería
app.put('/api/admin/gallery/:token/images', upload.array('images'), async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.body; // 'add' o 'replace'

    // Obtener galería actual
    const { data: gallery, error: getError } = await supabase
      .from('private_galleries')
      .select('images')
      .eq('access_token', token)
      .is('deleted_at', null)
      .single();

    if (getError || !gallery) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    // Procesar nuevas imágenes
    const newImages = (req.files || []).map(file => ({
      url: `/gallery-uploads/${file.filename}`,
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
    }));

    let finalImages = newImages;
    if (action === 'add') {
      finalImages = [...(gallery.images || []), ...newImages];
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('private_galleries')
      .update({ images: finalImages })
      .eq('access_token', token)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar imágenes' });
    }

    res.json({ success: true, gallery: data, imagesCount: finalImages.length });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE una imagen específica de una galería
app.delete('/api/admin/gallery/:token/image', async (req, res) => {
  try {
    const { token } = req.params;
    const { imageUrl } = req.body;

    // Obtener galería
    const { data: gallery, error: getError } = await supabase
      .from('private_galleries')
      .select('images')
      .eq('access_token', token)
      .is('deleted_at', null)
      .single();

    if (getError || !gallery) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    // Filtrar imagen
    const updatedImages = gallery.images.filter(img => 
      (typeof img === 'string' ? img : img.url) !== imageUrl
    );

    // Actualizar
    const { data, error } = await supabase
      .from('private_galleries')
      .update({ images: updatedImages })
      .eq('access_token', token)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar imagen' });
    }

    res.json({ success: true, gallery: data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE una galería completa (soft delete)
app.delete('/api/admin/gallery/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { data, error } = await supabase
      .from('private_galleries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('access_token', token)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    res.json({ success: true, message: 'Galería eliminada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ==================== RUTAS DE ADMINISTRACIÓN Y TRABAJADORES ====================

// 1. Login de trabajadores (Consultar credenciales)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Buscar trabajador por email
    const { data: worker, error } = await supabase
      .from('workers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !worker) {
      console.error(`❌ Intento de login fallido para: ${email}`);
      if (error) console.error(`   Error de base de datos: ${error.message}`);
      if (!worker) console.error('   Usuario no encontrado (posible bloqueo RLS o email incorrecto)');
      
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, worker.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
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
        email: worker.email,
        name: worker.name,
        role: worker.role
      }
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Consultar lista de trabajadores (Protegido)
app.get('/api/admin/workers', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, workers: data });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar trabajadores' });
  }
});

// 3. Registrar nuevo trabajador (Utilidad para crear el primer usuario)
app.post('/api/admin/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Faltan datos' });

    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('workers')
      .insert([{ email, password_hash, name, role: role || 'worker' }])
      .select().single();

    if (error) {
      console.error('Error de Supabase al registrar:', error);
      
      // Detectar proyecto pausado (Error 521 Cloudflare o HTML en el mensaje)
      if (error.message && (error.message.includes('521') || error.message.includes('Web server is down') || error.message.includes('<!DOCTYPE html>'))) {
        return res.status(503).json({ 
          error: '🛑 PROYECTO SUPABASE PAUSADO (Error 521). Entra en supabase.com y pulsa "Restore" para reactivarlo.'
        });
      }

      if (error.message.includes('fetch failed')) {
        return res.status(503).json({ 
          error: 'No se pudo conectar con la base de datos (Supabase).',
          details: 'El servidor backend no pudo comunicarse con el servicio de base de datos. Verifica la conexión a internet del servidor y que no haya un firewall bloqueando el acceso a *.supabase.co.'
        });
      }
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true, worker: data });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al registrar.' });
  }
});

// 4. Consultar lista de clientes (CRM)
app.get('/api/admin/clients', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, clients: data });
  } catch (error) {
    console.error('Error al consultar clientes:', error);
    res.status(500).json({ error: 'Error al consultar clientes' });
  }
});

// 5. Actualizar un cliente (CRM)
app.put('/api/admin/clients/:id', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const updateData = { updated_at: new Date().toISOString() };
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        // Obtener estado anterior para el log
        const { data: oldClient } = await supabase.from('clients').select('status').eq('id', id).single();

        const { data, error } = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        // --- TRAZABILIDAD: Registrar cambio de estado ---
        if (status && oldClient && oldClient.status !== status) {
            await supabase.from('client_activities').insert([{
                client_id: id,
                worker_id: req.user.id, // ID del trabajador logueado
                type: 'status_change',
                details: `Cambio de estado: "${oldClient.status}" ➔ "${status}"`
            }]);
        }
        // -----------------------------------------------

        if (error) throw error;
        res.json({ success: true, client: data });
    } catch (error) {
        console.error('Error actualizando cliente:', error);
        res.status(500).json({ error: 'Error interno al actualizar cliente' });
    }
});

// 6. Obtener estadísticas del Dashboard (Reportes y Métricas)
app.get('/api/admin/stats', checkAuth, async (req, res) => {
  try {
    // 1. Contar clientes por estado
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('status, created_at');

    if (clientError) throw clientError;

    const stats = {
      totalClients: clients.length,
      byStatus: {
        'primer contacto': 0,
        'conversacion iniciada': 0,
        'cita concertada': 0,
        'contratado': 0,
        'descartado': 0
      },
      recentLeads: 0 // Últimos 30 días
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    clients.forEach(client => {
      if (stats.byStatus[client.status] !== undefined) {
        stats.byStatus[client.status]++;
      }
      if (new Date(client.created_at) > thirtyDaysAgo) {
        stats.recentLeads++;
      }
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error stats:', error);
    res.status(500).json({ error: 'Error al calcular estadísticas' });
  }
});

// 7. Obtener historial de actividades de un cliente
app.get('/api/admin/clients/:id/activities', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('client_activities')
      .select(`
        *,
        workers (
          name
        )
      `)
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, activities: data });
  } catch (error) {
    console.error('Error activities:', error);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

// 8. Obtener actividad reciente (Dashboard)
app.get('/api/admin/activities', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('client_activities')
      .select('*, clients(name), workers(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent activity from Supabase:', error);
      throw error;
    }
    res.json({ success: true, activities: data });
  } catch (error) {
    console.error('Server error on /api/admin/activities:', error);
    res.status(500).json({ error: 'Error al obtener actividad reciente' });
  }
});

// 9. Crear una reserva desde el panel de admin (CRM)
app.post('/api/admin/bookings', checkAuth, async (req, res) => {
  try {
      const {
          clientId,
          clientName,
          clientEmail,
          date,
          time,
          details
      } = req.body;

      if (!clientId || !date || !time) {
          return res.status(400).json({ error: 'Faltan datos para la reserva (clientId, date, time)' });
      }

      // 1. Crear la reserva en la tabla 'bookings'
      const { data: newBooking, error: bookingError } = await supabase
          .from('bookings')
          .insert([{
              business_id: 'demo',
              date: date,
              start_time: time,
              customer_name: clientName,
              customer_email: clientEmail,
              event_details: details || 'Cita desde CRM'
          }])
          .select()
          .single();

      if (bookingError) throw bookingError;

      // 2. Actualizar el estado del cliente a "cita concertada"
      await supabase.from('clients').update({ status: 'cita concertada', updated_at: new Date().toISOString() }).eq('id', clientId);

      // 3. Registrar la actividad (Trazabilidad)
      await supabase.from('client_activities').insert([{ client_id: clientId, worker_id: req.user.id, type: 'booking_created', details: `Cita concertada para el ${date} a las ${time}.` }]);

      res.json({ success: true, booking: newBooking });

  } catch (error) {
      console.error('Error creando reserva desde admin:', error);
      res.status(500).json({ error: 'Error interno al crear la reserva' });
  }
});

// 10. Obtener citas de un cliente
app.get('/api/admin/clients/:id/bookings', checkAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: client } = await supabase.from('clients').select('email').eq('id', id).single();
        if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

        const { data, error } = await supabase.from('bookings').select('*').eq('customer_email', client.email).order('date', { ascending: true });
        if (error) throw error;
        res.json({ success: true, bookings: data });
    } catch (error) {
        console.error('Error al obtener citas del cliente:', error);
        res.status(500).json({ error: 'Error al obtener citas del cliente' });
    }
});

// ==================== API PARA EL CHATBOT (RESERVAS) ====================

// 1. Consultar disponibilidad (El chatbot llama aquí en lugar de a Supabase)
app.get('/api/bookings', async (req, res) => {
  try {
    const { date, business_id } = req.query;
    
    let query = supabase
      .from('bookings')
      .select('start_time')
      .eq('business_id', business_id || 'demo');
      
    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error consultando reservas:', error);
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
});

// 2. Crear reserva (El chatbot envía los datos aquí)
app.post('/api/bookings', async (req, res) => {
  try {
    const { 
      business_id, date, start_time, 
      customer_name, customer_email, customer_phone, 
      event_details, event_date 
    } = req.body;

    // --- CRM: Registrar o actualizar cliente (Cita Concertada) ---
    if (customer_email) {
      try {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('*')
          .eq('email', customer_email)
          .single();

        if (existingClient) {
          // Si ya existe, actualizamos estado a 'cita concertada' y datos de contacto
          await supabase.from('clients').update({
            status: 'cita concertada',
            name: customer_name || existingClient.name,
            phone: customer_phone || existingClient.phone,
            updated_at: new Date().toISOString()
          }).eq('email', customer_email);
        } else {
          // Si es nuevo, lo creamos directamente con estado 'cita concertada'
          await supabase.from('clients').insert([{
            name: customer_name,
            email: customer_email,
            phone: customer_phone,
            status: 'cita concertada',
            source: 'chatbot_reserva'
          }]);
        }
      } catch (crmError) {
        console.error('Error CRM en reserva:', crmError);
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        business_id: business_id || 'demo',
        date,
        start_time,
        customer_name,
        customer_email,
        customer_phone,
        event_details,
        event_date
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, booking: data[0] });
  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
});

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 3001;
// ==================== GOOGLE OAUTH ====================

// POST /api/auth/google-token
// Intercambia authorization code por access token
app.post('/api/auth/google-token', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const axios = require('axios');
    
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
    
    const { access_token, expires_in } = response.data;
    
    res.json({
      accessToken: access_token,
      expiresIn: expires_in
    });
    
  } catch (error) {
    console.error('Google token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange token',
      details: error.message 
    });
  }
});

// GET /api/calendar/events
// Obtiene eventos del calendario del usuario autenticado
app.get('/api/calendar/events', async (req, res) => {
  try {
    const accessToken = req.headers['x-access-token'];
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    const axios = require('axios');
    
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          maxResults: 250,
          singleEvents: true,
          orderBy: 'startTime',
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
      title: item.summary || 'Sin título',
      startTime: item.start.dateTime 
        ? item.start.dateTime.split('T')[1].slice(0, 5)
        : '09:00',
      endTime: item.end.dateTime 
        ? item.end.dateTime.split('T')[1].slice(0, 5)
        : '10:00',
      description: item.description || '',
      status: 'booked',
      clientName: 'Google Calendar',
      clientEmail: '',
      source: 'gmail',
      syncedAt: new Date().toISOString()
    }));
    
    res.json({ success: true, events: calendarEvents });
    
  } catch (error) {
    console.error('Calendar fetch error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error.message 
    });
  }
});

// ==================== FIN GOOGLE OAUTH ====================

app.listen(PORT, () => {
  console.log(`\n✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🔗 Endpoints:`);
  console.log(`   POST /api/gallery/create - Crear galería`);
  console.log(`   POST /api/gallery/verify - Verificar acceso`);
  console.log(`   GET  /api/gallery/:token - Obtener detalles`);
  console.log(`   POST /api/gallery/send-link - Enviar email`);
  console.log(`   GET  /api/admin/galleries - Listar todas`);
  console.log(`   GET  /api/admin/gallery/:token - Obtener galería`);
  console.log(`   PUT  /api/admin/gallery/:token - Actualizar datos`);
  console.log(`   PUT  /api/admin/gallery/:token/images - Actualizar imágenes`);
  console.log(`   DELETE /api/admin/gallery/:token/image - Eliminar imagen`);
  console.log(`   DELETE /api/admin/gallery/:token - Eliminar galería\n`);
});
