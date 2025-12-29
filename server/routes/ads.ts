import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const router = Router();

// Inicializar cliente de Supabase (Service Role para escritura segura)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Endpoints de Autenticación (OAuth) ---

router.get('/auth/:provider', (req, res) => {
  const { provider } = req.params;
  const redirectUri = `${process.env.VITE_API_URL}/api/ads/callback/${provider}`;

  if (provider === 'meta') {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${redirectUri}&scope=ads_management,ads_read,read_insights`;
    return res.redirect(authUrl);
  } 
  
  if (provider === 'tiktok') {
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_APP_ID}&scope=advertiser_management,reporting&response_type=code&redirect_uri=${redirectUri}`;
    return res.redirect(authUrl);
  }

  res.status(400).json({ error: 'Proveedor no soportado' });
});

router.get('/callback/:provider', async (req, res) => {
  const { provider } = req.params;
  const { code } = req.query;

  try {
    // Aquí iría la lógica de intercambio de código por token (simulado para brevedad)
    // const tokenData = await exchangeCodeForToken(provider, code);
    
    // Guardar en base de datos
    /*
    await supabase.from('ad_platforms').upsert({
      provider,
      access_token: 'TOKEN_SIMULADO',
      is_active: true
    }, { onConflict: 'provider' });
    */

    res.redirect(`${process.env.VITE_FRONTEND_URL}/admin/ads?status=success&provider=${provider}`);
  } catch (error) {
    console.error('Error en callback:', error);
    res.redirect(`${process.env.VITE_FRONTEND_URL}/admin/ads?status=error`);
  }
});

// --- Endpoints de Datos ---

router.get('/campaigns', async (req, res) => {
  try {
    // 1. Obtener métricas cacheadas de hoy
    const { data: metrics, error } = await supabase
      .from('ad_campaign_metrics')
      .select('*')
      .order('spend', { ascending: false });

    if (error) throw error;

    // 2. Agrupar por plataforma para el dashboard
    const summary = {
      meta: metrics?.filter(m => m.platform === 'meta') || [],
      tiktok: metrics?.filter(m => m.platform === 'tiktok') || [],
      total_spend: metrics?.reduce((acc, curr) => acc + Number(curr.spend), 0) || 0,
      total_leads: metrics?.reduce((acc, curr) => acc + Number(curr.conversions), 0) || 0
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo campañas' });
  }
});

router.post('/campaign/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { status, platform } = req.body; // 'ACTIVE' o 'PAUSED'

  try {
    // Aquí llamaríamos a la API externa de Meta/TikTok para pausar real
    // await toggleExternalCampaign(platform, id, status);

    // Actualizar caché local
    await supabase
      .from('ad_campaign_metrics')
      .update({ status })
      .eq('platform_campaign_id', id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cambiar el estado' });
  }
});

export default router;