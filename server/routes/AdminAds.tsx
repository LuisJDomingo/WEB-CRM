import React, { useEffect, useState } from 'react';
import { Facebook, BarChart3, Users, Wallet } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { PlatformCard } from '../../components/ads/PlatformCard';
import { toast } from 'sonner';

export default function AdminAds() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    meta: [],
    tiktok: [],
    total_spend: 0,
    total_leads: 0
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      // Actualizado a /api/admin/ads
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ads/campaigns`);
      if (!res.ok) throw new Error('Error cargando datos');
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error('No se pudieron cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    // Optimistic update
    toast.success(`Campaña ${newStatus === 'ACTIVE' ? 'activada' : 'pausada'}`);
    
    try {
      // Actualizado a /api/admin/ads
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ads/campaign/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchCampaigns(); // Recargar para confirmar
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando métricas...</div>;

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Gestión de Publicidad</h1>
          <p className="text-muted-foreground mt-1">Control unificado de Meta y TikTok Ads</p>
        </div>
        <div className="flex gap-3">
          <a href={`${import.meta.env.VITE_API_URL}/api/admin/ads/auth/meta`} className="px-4 py-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2">
            <Facebook size={16} /> Conectar Meta
          </a>
          <a href={`${import.meta.env.VITE_API_URL}/api/admin/ads/auth/tiktok`} className="px-4 py-2 bg-black hover:bg-zinc-800 text-white border border-zinc-800 text-sm font-medium rounded-md transition-colors flex items-center gap-2">
            <FaTiktok size={16} /> Conectar TikTok
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inversión Mensual</p>
              <p className="text-2xl font-bold text-foreground">${data.total_spend.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leads Generados</p>
              <p className="text-2xl font-bold text-foreground">{data.total_leads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PlatformCard platformName="Meta (Facebook/Instagram)" icon={<Facebook size={20} />} campaigns={data.meta} onToggle={handleToggle} />
        <PlatformCard platformName="TikTok Ads" icon={<FaTiktok size={20} />} campaigns={data.tiktok} onToggle={handleToggle} />
      </div>
    </div>
  );
}