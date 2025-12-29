import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function createContactRouter(supabase: SupabaseClient) {
  const router = Router();

  // POST: Recibir formulario de contacto
  router.post('/', async (req, res) => {
    try {
      const { name, email, phone, eventType, eventDate, message, privacy } = req.body;

      // Validación básica
      if (!name || !email || !privacy) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }

      // 1. Insertar Cliente (Lead)
      // Creamos el cliente con estado 'lead'. Guardamos el mensaje en 'notes' 
      // para asegurar que se vea en la ficha aunque no tengas columna 'message'.
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            name,
            email,
            phone,
            status: 'lead',
            notes: `Evento: ${eventType} (${eventDate || 'Sin fecha'}).\nMensaje: ${message}`,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Insertar Actividad (Notificación)
      // IMPORTANTE: Usamos 'contact_form' para que salga el sobre naranja en el panel
      const { error: activityError } = await supabase
        .from('activities')
        .insert([
          {
            type: 'contact_form',
            details: message ? `Mensaje: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}` : 'Nueva solicitud de contacto',
            client_id: client.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (activityError) throw activityError;

      res.status(200).json({ success: true, message: 'Mensaje enviado y registrado' });

    } catch (error: any) {
      console.error('Error procesando contacto:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}