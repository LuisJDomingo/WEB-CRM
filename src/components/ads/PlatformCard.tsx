import React from 'react';
import { Play, Pause, BarChart2, MousePointerClick } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  spend?: number;
  clicks?: number;
  impressions?: number;
}

interface PlatformCardProps {
  platformName: string;
  icon: React.ReactNode;
  campaigns: Campaign[];
  onToggle: (id: string, currentStatus: string) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platformName,
  icon,
  campaigns,
  onToggle,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/20">
        <div className="p-2 bg-background rounded-md border border-border text-foreground">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-foreground">{platformName}</h3>
      </div>
      
      <div className="divide-y divide-border">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No hay campañas activas en este momento.</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
              <div className="min-w-0 flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className={`w-2 h-2 rounded-full ${
                      campaign.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} 
                  />
                  <h4 className="font-medium text-foreground truncate" title={campaign.name}>
                    {campaign.name}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BarChart2 size={12} />
                    {campaign.impressions?.toLocaleString() || 0} imp.
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick size={12} />
                    {campaign.clicks?.toLocaleString() || 0} clics
                  </span>
                  <span className="font-medium text-foreground">
                    ${campaign.spend?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => onToggle(campaign.id, campaign.status)}
                className={`p-2 rounded-full transition-colors border border-transparent ${
                  campaign.status === 'ACTIVE' 
                    ? 'text-amber-600 hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/30' 
                    : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/30'
                }`}
                title={campaign.status === 'ACTIVE' ? "Pausar campaña" : "Activar campaña"}
              >
                {campaign.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};