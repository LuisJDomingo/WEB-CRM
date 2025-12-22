import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminPageLayout } from '@/components/AdminPageLayout';
import { toast } from 'sonner';
import { UserPlus, Trash2, User } from 'lucide-react';

interface Worker {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor';
  created_at: string;
}

export default function AdminUsers() {
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as 'admin' | 'editor'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => `Error del servidor: ${response.status}`);
        throw new Error(errorText || 'No se pudo cargar el equipo.');
      }
      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkers();
    }
  }, [isAuthenticated, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name || !formData.role) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Error del servidor: ${response.status}`);
        throw new Error(errorText || 'Error al crear el usuario.');
      }
      const data = await response.json();
      toast.success(`Usuario ${data.worker.email} creado.`);
      setFormData({ name: '', email: '', password: '', role: 'editor' });
      fetchWorkers(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (workerId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar a este trabajador? Esta acción no se puede deshacer.')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers/${workerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => `Error del servidor: ${response.status}`);
        throw new Error(errorText || 'No se pudo eliminar el usuario.');
      }

      toast.success('Usuario eliminado.');
      fetchWorkers(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isAuthLoading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <AdminPageLayout title="Gestión de Equipo" subtitle="Añade o elimina trabajadores con acceso al panel">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserPlus size={20} />Añadir Nuevo Trabajador</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nombre</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 rounded border bg-background" required /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 rounded border bg-background" required /></div>
              <div><label className="block text-sm font-medium mb-1">Contraseña</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 rounded border bg-background" required /></div>
              <div><label className="block text-sm font-medium mb-1">Privilegios</label><select name="role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full p-2 rounded border bg-background"><option value="editor">Editor (Puede gestionar clientes y galerías)</option><option value="admin">Administrador (Control total)</option></select></div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-primary text-primary-foreground rounded font-bold hover:opacity-90 disabled:opacity-50">{isSubmitting ? 'Creando...' : 'Crear Usuario'}</button>
            </form>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-card border rounded-xl"><h3 className="font-bold text-lg p-6 border-b">Equipo Actual</h3>
            {loading ? (<p className="p-6 text-muted-foreground">Cargando equipo...</p>) : workers.length === 0 ? (<p className="p-6 text-muted-foreground">No hay trabajadores registrados.</p>) : (
              <ul className="divide-y divide-border">{workers.map(worker => (<li key={worker.id} className="flex justify-between items-center p-4 hover:bg-muted/30"><div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full"><User size={20} /></div>
                    <div>
                      <p className="font-medium">{worker.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${worker.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>{worker.role}</span>
                  </div><button onClick={() => handleDelete(worker.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" title="Eliminar trabajador"><Trash2 size={18} /></button></li>))}</ul>)}
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}