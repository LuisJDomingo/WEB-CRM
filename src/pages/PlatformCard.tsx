import React from 'react';
import { Play, Pause, TrendingUp, DollarSign } from 'lucide-react';

interface Campaign {
  platform_campaign_id: string;
  campaign_name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
}

interface PlatformCardProps {
  platformName: string;
  icon: React.ReactNode;
  campaigns: Campaign[];
  onToggle: (id: string, currentStatus: string) => void;
}

export function PlatformCard({ platformName, icon, campaigns, onToggle }: PlatformCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:border-accent/50 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-md text-accent border border-zinc-800">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground capitalize">{platformName}</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-zinc-900 px-2 py-1 rounded">
          {campaigns.length} Activas
        </span>
      </div>

      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No hay campañas activas</p>
        ) : (
          campaigns.map((camp) => (
            <div key={camp.platform_campaign_id} className="group flex items-center justify-between p-3 rounded-md bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-zinc-200 truncate">{camp.campaign_name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign size={10} /> {camp.spend}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={10} /> {camp.clicks} Clics
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => onToggle(camp.platform_campaign_id, camp.status)}
                className={`p-2 rounded-full transition-colors ${
                  camp.status === 'ACTIVE' 
                    ? 'text-green-400 hover:bg-green-400/10' 
                    : 'text-yellow-400 hover:bg-yellow-400/10'
                }`}
                title={camp.status === 'ACTIVE' ? 'Pausar Campaña' : 'Activar Campaña'}
              >
                {camp.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
        <p className="text-xs text-muted-foreground">Gasto Total</p>
        <p className="text-lg font-serif text-accent">
          ${campaigns.reduce((acc, c) => acc + Number(c.spend), 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
}