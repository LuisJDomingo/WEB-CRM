import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-aqui';

// Cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaz para galería
interface PrivateGallery {
  id: string;
  client_email: string;
  client_name: string;
  event_date: string;
  password_hash: string;
  access_token: string;
  created_at: string;
  expires_at: string;
}

// Crear nueva galería privada
router.post('/gallery/create', async (req: Request, res: Response) => {
  try {
    const { clientName, clientEmail, eventDate, password } = req.body;

    if (!clientName || !clientEmail || !password) {
      return res.status(400).json({ error: 'Campos requeridos: clientName, clientEmail, password' });
    }

    // Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generar token único
    const accessToken = jwt.sign(
      { email: clientEmail, name: clientName },
      JWT_SECRET,
      { expiresIn: '90d' }
    );

    // Crear en Supabase
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

    // Generar link de acceso
    const accessLink = `http://localhost:5173/gallery/${accessToken}`;

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

// Verificar acceso a galería
router.post('/gallery/verify', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña requeridos' });
    }

    // Verificar JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { email: string; name: string };
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Buscar galería
    const { data, error } = await supabase
      .from('private_galleries')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar nuevo token de sesión
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

// Obtener detalles de galería (autenticado)
router.get('/gallery/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Verificar JWT
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Buscar galería
    const { data, error } = await supabase
      .from('private_galleries')
      .select('id, client_name, client_email, event_date, created_at')
      .eq('access_token', token)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Galería no encontrada' });
    }

    res.json({ success: true, gallery: data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Enviar link de galería por email
router.post('/gallery/send-link', async (req: Request, res: Response) => {
  try {
    const { email, accessLink, clientName, password } = req.body;

    if (!email || !accessLink) {
      return res.status(400).json({ error: 'Email y accessLink son requeridos' });
    }

    // Template HTML del email
    const emailHTML = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #f2f2f2; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 32px; border-radius: 8px; border: 1px solid #333;">
            <h1 style="color: #d4af37; margin-bottom: 16px;">¡Tu galería privada está lista!</h1>
            
            <p>Hola ${clientName},</p>
            
            <p>Hemos preparado tu galería privada con las fotos de tu evento. Accede usando el siguiente link:</p>
            
            <div style="background-color: #0d0d0d; padding: 20px; border-radius: 4px; margin: 24px 0;">
              <a href="${accessLink}" style="display: inline-block; background-color: #d4af37; color: #0d0d0d; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                Acceder a mi galería
              </a>
              <p style="font-size: 12px; color: #999; margin-top: 16px;">O copia este link:</p>
              <code style="word-break: break-all; color: #d4af37;">${accessLink}</code>
            </div>
            
            <p><strong>Tu contraseña de acceso:</strong> ${password}</p>
            
            <p style="color: #b3b3b3; font-size: 14px;">
              Este link es personal y confidencial. No lo compartas con otros.
            </p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #999;">
              © 2024 Tu Estudio Fotográfico. Todos los derechos reservados.
            </p>
          </div>
        </body>
      </html>
    `;

    // Por ahora, simulamos el envío de email
    // En producción, usarías SendGrid, Nodemailer, o similar
    console.log(`📧 Email enviado a: ${email}`);
    console.log(`Asunto: Tu galería privada está lista`);
    console.log(`Contenido: ${emailHTML}`);

    res.json({ 
      success: true, 
      message: 'Email enviado correctamente',
      note: 'En desarrollo: instala nodemailer o SendGrid para emails reales'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al enviar email' });
  }
});

export default router;
