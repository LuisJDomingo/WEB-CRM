import { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { ArrowLeft, RefreshCw, Search, FileText, X, Save, ChevronDown, History, User, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'primer contacto' | 'conversacion iniciada' | 'cita concertada' | 'contratado' | 'descartado';
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

const clientStatusOptions = [
  'primer contacto',
  'conversacion iniciada',
  'cita concertada',
  'contratado',
  'descartado',
];

export default function AdminCrm() {
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estado para el modal de notas
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [modalView, setModalView] = useState<'details' | 'booking'>('details');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDetails, setBookingDetails] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('🔍 [CRM] Pidiendo clientes a:', `${baseUrl}/api/admin/clients`);

      const response = await fetch(`${baseUrl}/api/admin/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const text = await response.text();
      console.log('🔍 [CRM] Respuesta:', response.status, text.substring(0, 50));
      
      let data;
      try { data = JSON.parse(text); } catch (e) { throw new Error('Respuesta inválida (HTML)'); }

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar los clientes');
      }
      setClients(data.clients || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated, token]);

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    const originalClients = [...clients];
    setClients(clients.map(c => c.id === clientId ? { ...c, status: newStatus as Client['status'] } : c));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('No se pudo actualizar el estado.');
      toast.success('Estado actualizado');
      fetchClients(); 
    } catch (error: any) {
      toast.error(error.message);
      setClients(originalClients);
    }
  };

  const handleBookAppointment = async () => {
    if (!editingClient || !bookingDate || !bookingTime) {
        toast.error('Por favor, completa la fecha y la hora.');
        return;
    }
    setIsBooking(true);
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                clientId: editingClient.id,
                clientName: editingClient.name,
                clientEmail: editingClient.email,
                date: bookingDate,
                time: bookingTime,
                details: bookingDetails,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al crear la cita');

        toast.success(`Cita creada para ${editingClient.name}`);
        setEditingClient(null); // Close modal
        fetchClients(); // Refresh client list
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsBooking(false);
    }
  };

  const fetchActivities = async (clientId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/clients/${clientId}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities', error);
    }
  };

  const openNotesModal = (client: Client) => {
    setEditingClient(client);
    setNoteInput(client.notes || '');
    setModalView('details');
    fetchActivities(client.id);
  };

  const handleSaveNotes = async () => {
    if (!editingClient) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: noteInput }),
      });

      if (!response.ok) throw new Error('Error al guardar notas');
      
      toast.success('Notas guardadas correctamente');
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, notes: noteInput } : c));
      setEditingClient(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contratado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'descartado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cita concertada': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'conversacion iniciada': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm))
    );
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!isAuthenticated) return <Redirect to="/admin" />;

  return (
    <div className="min-h-screen bg-background p-8 pt-24 text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-accent/10 rounded-full transition-colors" title="Volver al Panel">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">CRM de Clientes</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {filteredClients.length} clientes encontrados
              </p>
            </div>
          </div>
          
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
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Origen</th>
                  <th className="px-6 py-4 text-center">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Cargando datos...</td></tr>
                ) : filteredClients.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No se encontraron clientes.</td></tr>
                ) : (
                  filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <button onClick={() => openNotesModal(client)} className="text-left hover:text-primary transition-colors">
                          <div className="font-semibold text-base">{client.name}</div>
                        </button>
                        <div className="text-xs text-muted-foreground mt-1">
                          Actualizado: {format(new Date(client.updated_at), 'dd MMM yyyy', { locale: es })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-foreground">{client.email}</span>
                          {client.phone && <span className="text-muted-foreground">{client.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative w-fit">
                          <select 
                            value={client.status} 
                            onChange={(e) => handleStatusChange(client.id, e.target.value)} 
                            className={`pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 ${getStatusColor(client.status)}`}
                          >
                            {clientStatusOptions.map(status => (
                              <option key={status} value={status} className="bg-card text-foreground">{status.toUpperCase()}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-current pointer-events-none" size={14} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground capitalize">
                          {client.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openNotesModal(client)}
                          className={`p-2 rounded-full transition-colors ${client.notes ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                          title={client.notes ? "Ver/Editar notas" : "Agregar nota"}
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Notas */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border ">
              <div className="flex items-center gap-3">
                {modalView === 'booking' && (
                  <button onClick={() => setModalView('details')} className="text-muted-foreground hover:text-foreground" title="Volver">
                    <BackIcon size={20} />
                  </button>
                )}
                <div>
                  <h3 className="text-lg font-bold">{editingClient.name}</h3>
                  <p className="text-xs text-muted-foreground">{editingClient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {modalView === 'details' && (
                  <button
                    onClick={() => setModalView('booking')}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  >
                    <CalendarIcon size={14} />
                    Reservar Cita
                  </button>
                )}
                <button onClick={() => setEditingClient(null)} className="text-muted-foreground hover:text-foreground p-1" title="Cerrar">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {modalView === 'details' ? (
              <>
                <div className="flex border-b border-border">
                  <button onClick={() => setModalView('details')} className={`flex-1 py-3 text-sm font-medium transition-colors text-primary border-b-2 border-primary`}>Notas</button>
                  <button onClick={() => setModalView('booking')} className={`flex-1 py-3 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground`}>Historial</button>
                </div>
                <div className="p-6 h-[400px] overflow-y-auto">
                  <div className="h-full flex flex-col">
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="flex-1 w-full p-4 bg-muted/30 border border-border rounded-md focus:outline-none focus:border-primary resize-none text-sm leading-relaxed"
                      placeholder="Escribe aquí detalles importantes, preferencias..."
                      autoFocus
                    />
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={handleSaveNotes}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Save size={16} />
                        Guardar Notas
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 space-y-4">
                <h4 className="font-semibold text-center text-muted-foreground">Nueva Cita</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha</label>
                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hora</label>
                    <input type="time" step="3600" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Detalles (opcional)</label>
                  <input type="text" value={bookingDetails} onChange={e => setBookingDetails(e.target.value)} placeholder="Ej: Primera reunión, prueba de equipo..." className="w-full px-3 py-2 bg-background border border-border rounded-md" />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleBookAppointment}
                    disabled={isBooking}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isBooking ? 'Reservando...' : 'Confirmar Cita'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}