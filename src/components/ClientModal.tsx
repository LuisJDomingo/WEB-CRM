import { useState, useEffect } from 'react';
import { Users, X, RefreshCw, Save, FileSignature } from 'lucide-react';
import { Link } from 'wouter';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function ClientModal({ isOpen, onClose, client, onSave, isLoading }: ClientModalProps) {
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(client);
  }, [client]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      // El error lo maneja el padre, pero paramos el loading aquí
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!formData) return;
    if (!confirm('⚠️ ¿Estás seguro de que quieres DESCARTAR este lead?\n\nEstás a punto de perder toda la información de este cliente. ¿Deseas continuar?')) return;
    setIsSaving(true);
    try {
      await onSave({ ...formData, status: 'descartado' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header del Modal */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Gestión Rápida de Lead
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading || !formData ? (
            <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre</label>
                  <p className="text-lg font-medium">{formData.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                  <p className="text-base">{formData.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Teléfono</label>
                  <p className="text-base">{formData.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Origen</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {formData.source}
                  </span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Mensaje Inicial</label>
                <p className="text-sm text-foreground/80 italic">"{formData.message || 'Sin mensaje'}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado del Lead</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  >
                    <option value="primer contacto">Primer Contacto</option>
                    <option value="conversacion iniciada">Conversación Iniciada</option>
                    <option value="cita concertada">Cita Concertada</option>
                    {formData.status === 'en contratacion' && <option value="en contratacion">En Contratación</option>}
                    <option value="contratado">Contratado</option>
                    <option value="descartado">Descartado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas Privadas</label>
                  <textarea 
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-2 rounded-md border border-input bg-background min-h-[80px]"
                    placeholder="Añade notas sobre este cliente..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-border bg-muted/30 flex flex-wrap items-center justify-end gap-3">
          <button 
            onClick={handleDiscard}
            disabled={isSaving || isLoading}
            className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-md transition-colors mr-auto"
          >
            Descartar Lead
          </button>

          {formData && formData.status !== 'descartado' && formData.status !== 'contratado' && (
            <Link href={`/admin/contracting?client_id=${formData.id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <FileSignature size={16} />
              Iniciar Contratación
            </Link>
          )}

          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:opacity-90 flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Guardando...' : 'Guardar Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}