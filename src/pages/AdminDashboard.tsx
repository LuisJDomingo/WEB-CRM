import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Users, 
  Image, 
  Calendar,
  CheckSquare,
  Settings,
  LogIn,
  BellRing,
  Activity,
  MessageSquare,
  Mail,
  RefreshCw,
  AlertCircle,
  FileSignature,
  Megaphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ClientModal from '../components/ClientModal';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido de nuevo!');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="h-16 w-80 bg-foreground mx-auto"
            style={{
              maskImage: 'url(/images/Narrativa_de_bodas-removebg-preview.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
          />
          <h1 className="text-2xl font-bold text-foreground mt-4">Acceso al Panel</h1>
          <p className="text-muted-foreground text-sm">Introduce tus credenciales de trabajador</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-8 space-y-6 shadow-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-background border rounded-md"
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-background border rounded-md"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  type: string;
  details: string;
  created_at: string;
  client_id?: string;
  clients?: { name: string };
  workers?: { name: string };
}

function DashboardContent() {
  const { token } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [, setLocation] = useLocation();
  
  // Estados para el Modal de Cliente (Vista Rápida)
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<ActivityItem | null>(null);

  const fetchActivities = useCallback(async (isManualRefresh = false) => {
    setLoadingActivities(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        if (isManualRefresh) {
          toast.success('Lista de actividad actualizada.');
        }
      } else {
        if (isManualRefresh) {
          toast.error('No se pudo actualizar la actividad.');
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      if (isManualRefresh) toast.error('Error de red al actualizar la actividad.');
    } finally {
      setLoadingActivities(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchActivities();
  }, [token, fetchActivities]);

  // Función para abrir el modal del cliente
  const openClientModal = async (clientId: string) => {
    setLoadingClient(true);
    setIsModalOpen(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/clients/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedClient(data.client);
      } else {
        toast.error('No se pudieron cargar los datos del cliente');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
      setIsModalOpen(false);
    } finally {
      setLoadingClient(false);
    }
  };

  const markAsRead = (activity: ActivityItem) => {
    // 1. Optimistic UI: Eliminar inmediatamente del panel para que "desaparezca"
    setActivities(prev => prev.filter(a => a.id !== activity.id));

    // 2. Llamada a API en segundo plano para marcar como leída
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/activities/${activity.id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) {
        console.error('❌ El servidor respondió con error al marcar leída:', res.status);
        // REVERTIR: Si falla, volver a poner la actividad en la lista y avisar
        setActivities(prev => [...prev, activity].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        toast.error('No se pudo guardar el estado. Revisa la consola del servidor.');
      }
    }).catch(err => {
      console.error('❌ Error de red al marcar notificación:', err);
      // REVERTIR: Si hay error de red, volver a ponerla
      setActivities(prev => [...prev, activity].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      toast.error('Error de conexión al marcar como leída');
    });
  };

  // Función para guardar cambios desde el modal (Trabajar el lead)
  const handleSaveClient = async (updatedData: any) => {
    if (!selectedClient) return;

    // Verificar si hubo cambios reales antes de guardar
    const hasChanges = 
      updatedData.status !== selectedClient.status || 
      (updatedData.notes || '') !== (selectedClient.notes || '');

    if (!hasChanges) {
      setIsModalOpen(false);
      setSelectedClient(null);
      setPendingActivity(null); // Limpiamos la referencia pero NO marcamos como leída
      toast.info('No hubo cambios. La notificación sigue pendiente.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: updatedData.status,
          notes: updatedData.notes
        })
      });

      if (response.ok) {
        toast.success('Cliente actualizado correctamente');
        setIsModalOpen(false);
        setSelectedClient(null);
        
        if (pendingActivity) {
          markAsRead(pendingActivity);
          setPendingActivity(null);
        }
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      toast.error('No se pudieron guardar los cambios');
      throw error;
    }
  };

  const handleNotificationClick = (activity: ActivityItem, targetLink: string) => {
    // Si es cliente, abrimos modal y esperamos (no marcamos leída aún)
    if (activity.client_id) {
      setPendingActivity(activity);
      openClientModal(activity.client_id);
    } else {
      // Si no es cliente, marcamos leída y navegamos inmediatamente
      markAsRead(activity);
      if (targetLink !== '#') setLocation(targetLink);
    }
  };

  const menuItems = [
    {
      title: 'CRM Suite',
      description: 'Clientes y Pipeline',
      icon: <Users size={32} />,
      href: '/admin/crm-hub',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Contratación',
      description: 'Contratos, firmas y pagos',
      icon: <FileSignature size={32} />,
      href: '/admin/contracting',
      color: 'bg-indigo-500/10 text-indigo-500',
    },
    {
      title: 'Marketing Hub',
      description: 'Ads y Redes Sociales',
      icon: <Megaphone size={32} />,
      href: '/admin/ads',
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      title: 'Agenda',
      description: 'Calendario de citas y eventos',
      icon: <Calendar size={32} />,
      href: '/admin/agenda',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'Hoja de Ruta',
      description: 'Tareas diarias y recordatorios',
      icon: <CheckSquare size={32} />,
      href: '/admin/tasks',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'Galerías',
      description: 'Gestiona las fotos de clientes',
      icon: <Image size={32} />,
      href: '/admin/gallery',
      color: 'bg-pink-500/10 text-pink-500',
    },
    {
      title: 'Reglas de Contactación',
      description: 'Configura las normas de la hoja de ruta',
      icon: <Settings size={32} />,
      href: '/admin/rules',
      color: 'bg-gray-500/10 text-gray-500',
    },
    {
      title: 'Gestión de Equipo',
      description: 'Añade y gestiona los trabajadores',
      icon: <Users size={32} />,
      href: '/admin/users',
      color: 'bg-teal-500/10 text-teal-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-muted-foreground">Bienvenido a tu espacio de gestión </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menú Principal */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="block p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </Link>
            ))}
          </div>

          {/* Panel de Notificaciones */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-500/10 text-yellow-600">
                  <BellRing size={32} />
                </div>
                Notificaciones
              </h3>
              <button 
                onClick={() => fetchActivities(true)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                title="Actualizar lista"
              >
                <RefreshCw size={16} className={loadingActivities ? "animate-spin" : ""} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {loadingActivities ? (
                <p className="text-sm text-muted-foreground text-center py-4">Cargando actividad...</p>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente.</p>
              ) : (
                activities.map((activity) => {
                  const isGalleryComment = activity.type === 'gallery_comment';
                  const isContactForm = activity.type === 'contact_form';
                  const isStaleWarning = activity.type === 'stale_warning';
                  // Si es comentario de galería -> ir a Galerías. Si no -> ir a ficha CRM del cliente.
                  let targetLink = '#';
                  if (isGalleryComment) targetLink = '/admin/gallery';
                  else if (activity.client_id) {
                    // PRIORIDAD: Si hay ID de cliente, ir directamente a su ficha
                    targetLink = `/admin/crm-hub?id=${activity.client_id}`;
                  } else if (isContactForm) {
                    targetLink = '/admin/crm-hub';
                  }

                  return (
                    <div 
                      key={activity.id} 
                      onClick={() => handleNotificationClick(activity, targetLink)}
                      className="block group cursor-pointer"
                    >
                      <div className={`flex gap-3 items-start pb-3 border-b border-border group-last:border-0 group-last:pb-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors ${isContactForm ? 'bg-orange-500/10 hover:!bg-orange-500/20' : isStaleWarning ? 'bg-red-500/5 hover:!bg-red-500/10' : ''}`}>
                        <div className="mt-1 p-1.5 bg-muted rounded-full shrink-0 group-hover:bg-background transition-colors">
                          {isGalleryComment ? (
                            <MessageSquare size={14} className="text-blue-500" />
                          ) : isContactForm ? (
                            <Mail size={14} className="text-orange-500" />
                          ) : isStaleWarning ? (
                            <AlertCircle size={14} className="text-red-500" />
                          ) : (
                            <Activity size={14} className="text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {activity.clients?.name && <span className="text-foreground font-bold block text-xs mb-0.5">{activity.clients.name}</span>}
                            {activity.details}
                          </p>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                            <span>{format(new Date(activity.created_at), "d MMM, HH:mm", { locale: es })}</span>
                            {activity.workers && <span>• {activity.workers.name}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE VISTA RÁPIDA DE CLIENTE */}
      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingActivity(null); // Limpiamos la actividad pendiente si cancela
        }}
        client={selectedClient}
        onSave={handleSaveClient}
        isLoading={loadingClient}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Verificando sesión...</div>;
  }

  return isAuthenticated ? <DashboardContent /> : <LoginForm />;
}
