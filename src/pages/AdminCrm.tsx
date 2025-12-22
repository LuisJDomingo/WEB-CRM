import { useState, useEffect } from 'react';
import { Redirect } from 'wouter';
import {
  RefreshCw,
  Search,
  FileText,
  X,
  Save,
  ChevronDown,
  History,
  User,
  Calendar as CalendarIcon,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';
import { AdminPageLayout } from '@/components/AdminPageLayout';

/* =======================
   TYPES
======================= */

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status:
    | 'primer contacto'
    | 'conversacion iniciada'
    | 'cita concertada'
    | 'contratado'
    | 'descartado';
  source: string;
  notes: string | null;
  updated_at: string;
}

interface Activity {
  id: string;
  type: string;
  details: string;
  created_at: string;
  workers?: { name: string };
}

/* =======================
   CONSTANTS
======================= */

const clientStatusOptions = [
  'primer contacto',
  'conversacion iniciada',
  'cita concertada',
  'contratado',
  'descartado',
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/* =======================
   COMPONENT
======================= */

export default function AdminCrm() {
  const { isAuthenticated, token, logout, isLoading: isAuthLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at_desc');

  // Modal / ficha cliente
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'activity'>('notes');
  const [isBookingView, setIsBookingView] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    details: ''
  });
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [highlightBooking, setHighlightBooking] = useState(false);

  /* =======================
     DATA FETCHING
  ======================= */

  const fetchClients = async () => {
    // 🛑 PREVENCIÓN DE BUCLE: Si no hay token, no intentamos la petición
    if (!token) {
      console.log('⏳ [CRM] Esperando token de autenticación...');
      return;
    }
    console.log(`🚀 [CRM] Realizando fetch con token: "${token}"`);
    setLoading(true);
    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const response = await fetch(`${baseUrl}/api/admin/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout(); // Cerrar sesión si el token es inválido
          throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
        }
        const errorText = await response.text().catch(() => `Error del servidor: ${response.status}`);
        console.error("Server error response:", errorText);
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setClients(data.clients || []);
    } catch (error: any) {
      toast.error(error.message || 'Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (clientId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'
        }/api/admin/clients/${clientId}/activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        console.error(`Error fetching activities for client ${clientId}: ${response.status}`);
      } else {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch {
      setActivities([]);
    }
  };

  useEffect(() => {
        // Solo ejecutamos si estamos autenticados Y tenemos un token
    if (isAuthenticated && token) {
      fetchClients();
    }
  }, [isAuthenticated, token]);

  // Abrir ficha automáticamente si hay ID en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('id');
    
    if (clientId && clients.length > 0) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        openClientModal(client);
        window.history.replaceState({}, '', '/admin/crm'); // Limpiar URL
      }
    }
  }, [clients]);

  /* =======================
     ACTIONS
  ======================= */

  const openClientModal = (client: Client) => {
    setEditingClient(client);
    setNoteInput(client.notes || '');
    setActiveTab('notes');
    setIsBookingView(false);
    setBookingForm({ date: '', time: '', details: '' });
    setExistingBooking(null);
    setHighlightBooking(false);
    fetchActivities(client.id);
    checkExistingBooking(client.email);
  };

  const checkExistingBooking = async (email: string) => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_email', email)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        setExistingBooking(data[0]);
      }
    } catch (error) {
      console.error('Error checking booking:', error);
    }
  };

  const saveNotes = async () => {
    if (!editingClient) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'
        }/api/admin/clients/${editingClient.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: noteInput }),
        }
      );

      if (!response.ok) throw new Error("No se pudo guardar la nota.");

      toast.success('Notas guardadas');
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id ? { ...c, notes: noteInput } : c
        )
      );
      setEditingClient(null);
    } catch (error: any) {
      toast.error('Error guardando notas');
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    // Validación: Si se cambia a "cita concertada", verificar si existe cita
    if (newStatus === 'cita concertada') {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        const { data } = await supabase
          .from('bookings')
          .select('id')
          .eq('customer_email', client.email)
          .gte('date', new Date().toISOString().split('T')[0])
          .limit(1);

        if (!data || data.length === 0) {
          toast.error("Para cambiar a 'Cita Concertada', primero debes agendar una cita.");
          if (editingClient?.id === clientId) {
            setIsBookingView(true);
            setHighlightBooking(true);
          }
          return;
        }
      }
    }

    const originalClients = [...clients];
    setClients(clients.map(c => c.id === clientId ? { ...c, status: newStatus as Client['status'] } : c));
    
    if (editingClient?.id === clientId) {
      setEditingClient({ ...editingClient, status: newStatus as any });
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'
        }/api/admin/clients/${clientId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Error del servidor: ${response.status}`);
        console.error("Server error response:", errorText);
        throw new Error('No se pudo actualizar el estado.');
      }
      fetchClients();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo actualizar el estado');
      setClients(originalClients);
      if (editingClient?.id === clientId) {
         const original = originalClients.find(c => c.id === clientId);
         if (original) setEditingClient(original);
      }
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      if (existingBooking) {
        // ACTUALIZAR CITA EXISTENTE
        const { error } = await supabase
          .from('bookings')
          .update({
            date: bookingForm.date,
            start_time: bookingForm.time,
            event_details: bookingForm.details
          })
          .eq('id', existingBooking.id);

        if (error) throw error;
        toast.success('Cita actualizada correctamente');
        checkExistingBooking(editingClient.email);
      } else {
        // CREAR NUEVA CITA
        const { error } = await supabase.from('bookings').insert([
          {
            customer_name: editingClient.name,
            customer_email: editingClient.email,
            customer_phone: editingClient.phone || '',
            date: bookingForm.date,
            start_time: bookingForm.time,
            event_details: bookingForm.details || `Cita con ${editingClient.name}`,
            status: 'confirmed'
          }
        ]);

        if (error) throw error;
        toast.success('Cita agendada en la Agenda');
        
        if (editingClient.status !== 'cita concertada') {
          handleStatusChange(editingClient.id, 'cita concertada');
        }
        checkExistingBooking(editingClient.email);
      }
      
      setHighlightBooking(false);
      setIsBookingView(false);
    } catch (error) {
      console.error('Error creating/updating booking:', error);
      toast.error('Error al guardar la cita');
    }
  };

  /* =======================
     HELPERS
  ======================= */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contratado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'descartado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cita concertada':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'conversacion iniciada':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusBarColor = (status: string) => {
    switch (status) {
      case 'contratado':
        return 'bg-green-500';
      case 'descartado':
        return 'bg-red-500';
      case 'cita concertada':
        return 'bg-yellow-500';
      case 'conversacion iniciada':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm));

      const matchesStatus =
        statusFilter === 'all' || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'updated_at_asc':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        default: // updated_at_desc
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  /* =======================
     GUARDS
  ======================= */

  if (isAuthLoading)
    return <div className="p-10 text-center">Cargando…</div>;

  if (!isAuthenticated) return <Redirect to="/admin" />;

  const pageActions = (
    <div className="flex gap-3 w-full md:w-auto">
      <div className="relative flex-1 md:w-48">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full pl-4 pr-10 py-2 bg-card border border-border rounded-md focus:outline-none focus:border-primary appearance-none capitalize"
        >
          <option value="all" className="bg-card text-foreground">Todos los estados</option>
          {clientStatusOptions.map(status => (
            <option key={status} value={status} className="capitalize bg-card text-foreground">
              {status}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
      </div>
      <div className="relative flex-1 md:w-48">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full pl-4 pr-10 py-2 bg-card border border-border rounded-md focus:outline-none focus:border-primary appearance-none capitalize"
        >
          <option value="updated_at_desc">Más Recientes</option>
          <option value="updated_at_asc">Más Antiguos</option>
          <option value="name_asc">Nombre (A-Z)</option>
          <option value="name_desc">Nombre (Z-A)</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
      </div>
      <div className="relative flex-1 md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          type="text" 
          placeholder="Buscar cliente..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:border-primary"
        />
      </div>
      <button
        onClick={fetchClients}
        disabled={loading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
      >
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );

  /* =======================
     RENDER
  ======================= */

  return (
    <AdminPageLayout 
      title="CRM de Clientes" 
      subtitle={`${filteredClients.length} clientes encontrados`}
      actions={pageActions}
    >
      {/* Gráfico de Estado de Clientes */}
      <div className="mb-8 bg-card border rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">Distribución de Clientes por Estado</h3>
        <div className="space-y-3 text-sm">
          {clientStatusOptions.map(status => {
            const count = clients.filter(c => c.status === status).length;
            const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
            const barColorClass = getStatusBarColor(status);

            return (
              <div key={status} className="grid grid-cols-4 items-center gap-4">
                <span className="col-span-1 capitalize text-muted-foreground">{status}</span>
                <div className="col-span-3 flex items-center gap-4">
                  <div className="w-full bg-muted rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${barColorClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold w-16 text-right">{count} ({Math.round(percentage)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 items-end mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Tasa de Cierre (Global)</p>
            <p className="text-2xl font-bold text-green-500">
              {((clients.filter(c => c.status === 'contratado').length / (clients.length > 0 ? clients.length : 1)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Tasa de Éxito (Resueltos)</p>
            <p className="text-2xl font-bold text-blue-500">
              {(() => {
                const resolved = clients.filter(c => c.status !== 'descartado').length;
                const won = clients.filter(c => c.status === 'contratado').length;
                return ((won / (resolved > 0 ? resolved : 1)) * 100).toFixed(1);
              })()}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Clientes</p>
            <p className="font-bold text-lg">
              {clients.length}
            </p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Origen</th>
                <th className="px-6 py-4 text-center">Ficha</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-t hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{client.name}</td>
                  <td className="px-6 py-4">
                    {client.email}
                    <br />
                    <span className="text-muted-foreground">
                      {client.phone ? (
                        <a href={`tel:${client.phone}`} className="hover:text-primary flex items-center gap-1 transition-colors" title="Llamar">
                          <Phone size={12} /> {client.phone}
                        </a>
                      ) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={client.status}
                      onChange={(e) =>
                        handleStatusChange(client.id, e.target.value)
                      }
                      className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                        client.status
                      )}`}
                    >
                      {clientStatusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {client.source.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openClientModal(client)}
                      className="p-2 rounded-full hover:bg-muted"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* MODAL FICHA CLIENTE */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between p-4 border-b">
              <div>
                <h3 className="font-bold">{editingClient.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {editingClient.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isBookingView && (
                  <button 
                    onClick={() => {
                      if (existingBooking) {
                        setBookingForm({
                          date: existingBooking.date,
                          time: existingBooking.start_time.substring(0, 5),
                          details: existingBooking.event_details || ''
                        });
                      }
                      setIsBookingView(true);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 ${existingBooking ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white text-xs rounded transition`}
                  >
                    <CalendarIcon size={14} /> {existingBooking ? 'Modificar Cita' : 'Agendar Cita'}
                  </button>
                )}
                <button onClick={() => setEditingClient(null)} className="p-1 hover:bg-muted rounded">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Ficha */}
            <div className="p-4 grid grid-cols-2 gap-4 text-sm border-b">
              <div>
                <span className="text-xs text-muted-foreground">Teléfono</span>
                {editingClient.phone ? (
                  <a href={`tel:${editingClient.phone}`} className="flex items-center gap-2 mt-1 text-blue-600 hover:underline font-medium">
                    <Phone size={16} /> {editingClient.phone}
                  </a>
                ) : (
                  <p>—</p>
                )}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Estado</span>
                <select
                  value={editingClient.status}
                  onChange={(e) => {
                    handleStatusChange(editingClient.id, e.target.value);
                  }}
                  className={`w-full mt-1 p-1.5 rounded border text-sm ${getStatusColor(editingClient.status)}`}
                >
                  {clientStatusOptions.map((s) => (
                    <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Origen</span>
                <p>{editingClient.source}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Última actualización
                </span>
                <p>
                  {format(
                    new Date(editingClient.updated_at),
                    'dd MMM yyyy HH:mm',
                    { locale: es }
                  )}
                </p>
              </div>
            </div>

            {/* Content */}
            {isBookingView ? (
              <div className={`p-6 ${highlightBooking ? 'bg-red-50/30' : ''}`}>
                {highlightBooking && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm flex items-center gap-2 animate-pulse">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span className="font-medium">Es necesario agendar la cita para confirmar el cambio de estado.</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-bold text-sm ${highlightBooking ? 'text-red-600' : ''}`}>{existingBooking ? 'Modificar Cita' : 'Nueva Cita en Agenda'}</h4>
                  <button onClick={() => { setIsBookingView(false); setHighlightBooking(false); }} className="text-xs text-muted-foreground hover:underline">Cancelar</button>
                </div>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Fecha</label>
                      <input required type="date" className="w-full p-2 rounded border bg-background text-sm" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Hora</label>
                      <input required type="time" className="w-full p-2 rounded border bg-background text-sm" value={bookingForm.time} onChange={e => setBookingForm({...bookingForm, time: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Detalles</label>
                    <textarea 
                      className="w-full p-2 rounded border bg-background text-sm h-20 resize-none" 
                      placeholder="Detalles de la reunión..."
                      value={bookingForm.details} 
                      onChange={e => setBookingForm({...bookingForm, details: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded font-bold text-sm hover:opacity-90">
                    {existingBooking ? 'Actualizar Cita' : 'Confirmar Cita'}
                  </button>
                </form>
              </div>
            ) : (
              <>
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 p-3 ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-primary text-primary'
                    : ''
                }`}
              >
                Notas
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 p-3 ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-primary text-primary'
                    : ''
                }`}
              >
                Historial
              </button>
            </div>

            <div className="p-4 max-h-[300px] overflow-y-auto">
              {activeTab === 'notes' ? (
                <>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full min-h-[120px] p-3 border rounded"
                  />
                  <button
                    onClick={saveNotes}
                    className="mt-3 px-4 py-2 bg-primary text-white rounded"
                  >
                    Guardar notas
                  </button>
                </>
              ) : (
                <>
                  {activities.length === 0 ? (
                    <p className="text-muted-foreground">
                      No hay actividad registrada
                    </p>
                  ) : (
                    activities.map((a) => (
                      <div key={a.id} className="mb-3 text-sm">
                        <p>{a.details}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(a.created_at), 'dd MMM yyyy HH:mm', {
                            locale: es,
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
