import { useState, useEffect } from 'react';
import { AdminPageLayout } from '@/components/AdminPageLayout';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

export default function AdminTaskRules() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [calendarSettings, setCalendarSettings] = useState({
    startHour: 9,
    endHour: 20,
    commercialStartHour: 10,
    commercialEndHour: 14,
    commercialStartHour2: 16,
    commercialEndHour2: 20
  });
  const [contactRules, setContactRules] = useState({
    primerContactoDays: 2,
    primerContactoPriority: 5,
    conversacionIniciadaDays: 3,
    conversacionIniciadaPriority: 7
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('agenda_settings');
    if (savedSettings) {
      try {
        setCalendarSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }

    const savedRules = localStorage.getItem('contactRules');
    if (savedRules) {
      try {
        setContactRules(JSON.parse(savedRules));
      } catch (e) {
        console.error('Error parsing rules', e);
      }
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('agenda_settings', JSON.stringify(calendarSettings));
    toast.success('Horarios de agenda actualizados');
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('contactRules', JSON.stringify(contactRules));
    toast.success('Reglas de contactación actualizadas');
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  return (
    <AdminPageLayout title="Reglas y Configuración">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CONFIGURACIÓN DE AGENDA */}
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-card-foreground">
          <h2 className="text-xl font-bold mb-4">Configuración de Agenda</h2>
          <p className="text-sm text-muted-foreground mb-4">Define el horario laboral (visible) y el comercial (atención).</p>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Inicio Jornada Laboral (Visible)</label>
              <select 
                className="w-full p-2 rounded border border-input bg-background" 
                value={calendarSettings.startHour} 
                onChange={e => setCalendarSettings({...calendarSettings, startHour: parseFloat(e.target.value)})}
              >
                {Array.from({ length: 48 }, (_, i) => {
                  const h = Math.floor(i / 2);
                  const m = i % 2 === 0 ? '00' : '30';
                  return <option key={i} value={i / 2}>{h}:{m}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fin Jornada Laboral (Visible)</label>
              <select 
                className="w-full p-2 rounded border border-input bg-background" 
                value={calendarSettings.endHour} 
                onChange={e => setCalendarSettings({...calendarSettings, endHour: parseFloat(e.target.value)})}
              >
                {Array.from({ length: 48 }, (_, i) => {
                  const h = Math.floor(i / 2);
                  const m = i % 2 === 0 ? '00' : '30';
                  return <option key={i} value={i / 2}>{h}:{m}</option>;
                })}
              </select>
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <h3 className="font-semibold text-blue-500 mb-3">Horario Comercial (Turnos)</h3>
              
              {/* TURNO 1 */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Turno de Mañana</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Inicio</label>
                    <select 
                      className="w-full p-2 rounded border border-input bg-background" 
                      value={calendarSettings.commercialStartHour} 
                      onChange={e => setCalendarSettings({...calendarSettings, commercialStartHour: parseFloat(e.target.value)})}
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? '00' : '30';
                        return <option key={i} value={i / 2}>{h}:{m}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fin</label>
                    <select 
                      className="w-full p-2 rounded border border-input bg-background" 
                      value={calendarSettings.commercialEndHour} 
                      onChange={e => setCalendarSettings({...calendarSettings, commercialEndHour: parseFloat(e.target.value)})}
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? '00' : '30';
                        return <option key={i} value={i / 2}>{h}:{m}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* TURNO 2 */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Turno de Tarde</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Inicio</label>
                    <select 
                      className="w-full p-2 rounded border border-input bg-background" 
                      value={calendarSettings.commercialStartHour2} 
                      onChange={e => setCalendarSettings({...calendarSettings, commercialStartHour2: parseFloat(e.target.value)})}
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? '00' : '30';
                        return <option key={i} value={i / 2}>{h}:{m}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fin</label>
                    <select 
                      className="w-full p-2 rounded border border-input bg-background" 
                      value={calendarSettings.commercialEndHour2} 
                      onChange={e => setCalendarSettings({...calendarSettings, commercialEndHour2: parseFloat(e.target.value)})}
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? '00' : '30';
                        return <option key={i} value={i / 2}>{h}:{m}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded font-bold hover:opacity-90 mt-4">
              Guardar Horarios
            </button>
          </form>
        </div>

        {/* REGLAS DE CONTACTACIÓN */}
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-card-foreground">
          <h2 className="text-xl font-bold mb-4">Reglas de Contactación</h2>
          <p className="text-sm text-muted-foreground mb-4">Configura cuándo el sistema debe generar alertas automáticas para seguimiento de clientes.</p>
          <form onSubmit={handleSaveRules} className="space-y-6">
            
            <div className="space-y-3 border-b border-border pb-4">
              <h3 className="font-semibold text-blue-500">Estado: Primer Contacto</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Días sin respuesta para alerta</label>
                <input 
                  type="number" min="1" className="w-full p-2 rounded border border-input bg-background"
                  value={contactRules.primerContactoDays}
                  onChange={e => setContactRules({...contactRules, primerContactoDays: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Días para considerar Prioridad Alta</label>
                <input 
                  type="number" min="1" className="w-full p-2 rounded border border-input bg-background"
                  value={contactRules.primerContactoPriority}
                  onChange={e => setContactRules({...contactRules, primerContactoPriority: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-green-500">Estado: Conversación Iniciada</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Días inactivo para alerta</label>
                <input 
                  type="number" min="1" className="w-full p-2 rounded border border-input bg-background"
                  value={contactRules.conversacionIniciadaDays}
                  onChange={e => setContactRules({...contactRules, conversacionIniciadaDays: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded font-bold hover:opacity-90">
              Guardar Reglas
            </button>
          </form>
        </div>
      </div>
    </AdminPageLayout>
  );
}