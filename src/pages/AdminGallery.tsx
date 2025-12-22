import { useState, useEffect } from 'react';
import { Redirect } from 'wouter';
import { Plus, LayoutGrid, Trash2, ExternalLink, Image as ImageIcon, Copy, RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import GalleryManager from '@/components/GalleryManager';
import { useAuth } from '@/contexts/AuthContext';
import { AdminPageLayout } from '@/components/AdminPageLayout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Gallery {
  id: string;
  client_name: string;
  client_email: string;
  event_date: string;
  access_token: string;
  images: any[];
  created_at: string;
}

export default function AdminGallery() {
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGalleries = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/galleries`, {
        headers: {
          'Authorization': `Bearer ${token}` // ✅ AQUÍ ESTÁ LA SOLUCIÓN: Token explícito
        }
      });
      if (!response.ok) throw new Error('Error al cargar galerías');
      const data = await response.json();
      setGalleries(data.galleries || []);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar las galerías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token && activeTab === 'dashboard') {
      fetchGalleries();
    }
  }, [isAuthenticated, token, activeTab]);

  const handleGalleryCreated = () => {
    setActiveTab('dashboard');
    fetchGalleries();
    toast.success('Galería creada, ahora la puedes ver en el panel');
  };

  const handleDelete = async (tokenToDelete: string) => {
    if (!confirm('¿Estás seguro de eliminar esta galería? Esta acción no se puede deshacer.')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/gallery/${tokenToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Galería eliminada');
        fetchGalleries();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar la galería');
    }
  };

  const copyLink = (accessToken: string) => {
    const link = `${window.location.origin}/gallery/${accessToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace copiado al portapapeles');
  };

  // Esperamos a que termine la carga inicial Y a que tengamos el token
  if (isAuthLoading || (isAuthenticated && !token)) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  const pageActions = (
    <div className="flex bg-muted/30 p-1 rounded-lg">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
          activeTab === 'dashboard'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutGrid size={16} />
        Ver Galerías
      </button>
      <button
        onClick={() => setActiveTab('create')}
        className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
          activeTab === 'create'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Plus size={16} />
        Nueva Galería
      </button>
    </div>
  );

  return (
    <AdminPageLayout 
      title="Galerías de Clientes" 
      subtitle="Gestiona las entregas de fotos y accesos privados"
      actions={pageActions}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando galerías...</div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-12 bg-card border border-dashed rounded-xl">
              <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No hay galerías creadas</h3>
              <p className="text-muted-foreground mb-4">Crea la primera galería para compartir fotos con tus clientes.</p>
              <button onClick={() => setActiveTab('create')} className="text-primary hover:underline font-medium">
                Crear mi primera galería
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gallery) => (
                <div key={gallery.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg truncate" title={gallery.client_name}>{gallery.client_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{gallery.client_email}</p>
                      </div>
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <ImageIcon size={12} />
                        {gallery.images?.length || 0}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Evento: {format(new Date(gallery.event_date), 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw size={14} />
                        <span>Creada: {format(new Date(gallery.created_at), 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <button 
                        onClick={() => copyLink(gallery.access_token)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors"
                        title="Copiar enlace"
                      >
                        <Copy size={16} /> Copiar Link
                      </button>
                      <a 
                        href={`/gallery/${gallery.access_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-muted hover:bg-muted/80 rounded text-foreground transition-colors"
                        title="Ver galería"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button 
                        onClick={() => handleDelete(gallery.access_token)}
                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                        title="Eliminar galería"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'create' && <GalleryManager onGalleryCreated={handleGalleryCreated} />}
    </AdminPageLayout>
  );
}
