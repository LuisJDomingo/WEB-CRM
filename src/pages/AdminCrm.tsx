import { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { ArrowLeft, RefreshCw, Search, FileText, ChevronDown, MessageCircle, ArrowUpDown, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ClientModal from '../components/ClientModal';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'primer contacto' | 'conversacion iniciada' | 'cita concertada' | 'en contratacion' | 'contratado' | 'descartado';
  source: string;
  notes: string | null;
  updated_at: string;
  message: string | null;
}

const clientStatusOptions = [
  'primer contacto',
  'conversacion iniciada',
  'cita concertada',
  'en contratacion',
  'contratado',
  'descartado',
];

export default function AdminCrm() {
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' } | null>(null);
  
  // Estado para el modal unificado
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setClients(data || []);
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

  const handleSort = (key: keyof Client) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    const originalClients = [...clients];
    setClients(clients.map(c => c.id === clientId ? { ...c, status: newStatus as Client['status'] } : c));

    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (error) throw error;
      toast.success('Estado actualizado');
    } catch (error: any) {
      toast.error(error.message);
      setClients(originalClients);
    }
  };

  const openNotesModal = (client: Client) => {
    setEditingClient(client);
  };

  const handleSaveClientData = async (data: any) => {
    if (!editingClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: data.status,
          notes: data.notes 
        })
        .eq('id', editingClient.id);

      if (error) throw error;
      
      toast.success('Cliente actualizado correctamente');
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, status: data.status, notes: data.notes } : c));
      setEditingClient(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contratado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'descartado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'en contratacion': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cita concertada': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'conversacion iniciada': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getWhatsAppLink = (phone: string | null, name: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${name}, te contacto desde Narrativa de Bodas.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
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

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue = a[key];
    let bValue = b[key];

    if (aValue === null) aValue = '';
    if (bValue === null) bValue = '';

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Métricas simples calculadas al vuelo
  const metrics = {
    total: clients.length,
    nuevos: clients.filter(c => c.status === 'primer contacto').length,
    activos: clients.filter(c => ['conversacion iniciada', 'cita concertada', 'en contratacion'].includes(c.status)).length,
    ganados: clients.filter(c => c.status === 'contratado').length,
    tasaConversion: clients.length > 0 ? Math.round((clients.filter(c => c.status === 'contratado').length / clients.length) * 100) : 0
  };

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

          {/* Tarjetas de Métricas Rápidas */}
          <div className="hidden lg:flex gap-4">
            <div className="bg-card border border-border px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold">Conversión</div>
              <div className="text-xl font-bold text-green-500">{metrics.tasaConversion}%</div>
            </div>
            <div className="bg-card border border-border px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold">Activos</div>
              <div className="text-xl font-bold text-blue-500">{metrics.activos}</div>
            </div>
            <div className="bg-card border border-border px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold">Ganados</div>
              <div className="text-xl font-bold text-primary">{metrics.ganados}</div>
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
                  <th className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Cliente <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-2">
                      Contacto <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Estado <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('source')}>
                    <div className="flex items-center gap-2">
                      Origen <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('updated_at')}>
                    <div className="flex items-center gap-2">
                      Actualizado <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Cargando datos...</td></tr>
                ) : sortedClients.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No se encontraron clientes.</td></tr>
                ) : (
                  sortedClients.map(client => (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <button onClick={() => openNotesModal(client)} className="text-left hover:text-primary transition-colors">
                          <div className="font-semibold text-base">{client.name}</div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-foreground">{client.email}</span>
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{client.phone}</span>
                              <a 
                                href={getWhatsAppLink(client.phone, client.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-500 hover:text-green-600 p-1 hover:bg-green-50 rounded-full transition-colors"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle size={16} />
                              </a>
                            </div>
                          )}
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
                              (status === 'en contratacion' && client.status !== 'en contratacion') ? null : (
                                <option key={status} value={status} className="bg-card text-foreground">{status.toUpperCase()}</option>
                              )
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
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(client.updated_at), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openNotesModal(client)}
                          className="p-2 rounded-full transition-colors text-muted-foreground hover:bg-muted"
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
      <ClientModal 
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        client={editingClient}
        onSave={handleSaveClientData}
      />
    </div>
  );
}