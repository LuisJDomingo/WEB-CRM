import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default function createWorkersRouter(supabase: SupabaseClient) {
  const router = Router();

  // GET: Listar trabajadores
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ workers: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST: Crear nuevo trabajador
  router.post('/', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insertar en base de datos
      const { data, error } = await supabase
        .from('workers')
        .insert([
          { 
            name, 
            email, 
            password_hash: hashedPassword, 
            role: role || 'editor' 
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Devolver usuario sin el hash
      const { password_hash, ...worker } = data;
      res.status(201).json({ worker });
    } catch (error: any) {
      console.error('Error creando trabajador:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE: Eliminar trabajador
  router.delete('/:id', async (req, res) => {
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
