import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Save, Sliders } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTaskRules() {
  const [rules, setRules] = useState({
    primerContactoDays: 2,
    primerContactoPriority: 5,
    conversacionIniciadaDays: 3,
    conversacionIniciadaPriority: 7
  });

  useEffect(() => {
    const savedRules = localStorage.getItem('contactRules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('contactRules', JSON.stringify(rules));
    toast.success('Reglas actualizadas correctamente');
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-accent/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Reglas de Contactación</h1>
            <p className="text-muted-foreground">Configura los tiempos para generar alertas automáticas</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-8">
          {/* Primer Contacto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Sliders className="text-blue-500" />
              <h3 className="font-bold text-lg">Estado: Primer Contacto</h3>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Días para alerta (Mensaje)</label>
                <p className="text-xs text-muted-foreground mb-2">Tiempo sin cambios para sugerir enviar un mensaje.</p>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-2 rounded border bg-background"
                  value={rules.primerContactoDays}
                  onChange={e => setRules({...rules, primerContactoDays: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Días para Prioridad Alta</label>
                <p className="text-xs text-muted-foreground mb-2">Tiempo para marcar la tarea como urgente.</p>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-2 rounded border bg-background"
                  value={rules.primerContactoPriority}
                  onChange={e => setRules({...rules, primerContactoPriority: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Conversación Iniciada */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Sliders className="text-green-500" />
              <h3 className="font-bold text-lg">Estado: Conversación Iniciada</h3>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Días para alerta (Llamada)</label>
                <p className="text-xs text-muted-foreground mb-2">Tiempo sin cambios para sugerir realizar una llamada.</p>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-2 rounded border bg-background"
                  value={rules.conversacionIniciadaDays}
                  onChange={e => setRules({...rules, conversacionIniciadaDays: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Días para Prioridad Alta</label>
                <p className="text-xs text-muted-foreground mb-2">Tiempo para marcar la tarea como urgente.</p>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-2 rounded border bg-background"
                  value={rules.conversacionIniciadaPriority}
                  onChange={e => setRules({...rules, conversacionIniciadaPriority: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Save size={20} /> Guardar Reglas
          </button>
        </div>
      </div>
    </div>
  );
}