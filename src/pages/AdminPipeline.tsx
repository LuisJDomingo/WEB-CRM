import { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Client {
  id: string;
  name: string;
  email: string;
  status: 'primer contacto' | 'conversacion iniciada' | 'cita concertada' | 'contratado' | 'descartado';
  updated_at: string;
}

const pipelineStages = [
  'primer contacto',
  'conversacion iniciada',
  'cita concertada',
  'contratado',
  'descartado',
];

export default function AdminPipeline() {
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('🔍 [Pipeline] Pidiendo clientes a:', `${baseUrl}/api/admin/clients`);

      const response = await fetch(`${baseUrl}/api/admin/clients`, { headers: { 'Authorization': `Bearer ${token}` } });
      const text = await response.text();
      
      let data;
      try { data = JSON.parse(text); } catch(e) { console.error('Pipeline parse error:', text); throw new Error('Error de formato en respuesta'); }

      if (!response.ok) throw new Error(data.error || 'Error al cargar clientes');
      setClients(data.clients || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchClients();
  }, [isAuthenticated, token]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const client = clients.find(c => c.id === draggableId);
    if (!client) return;

    const newStatus = destination.droppableId;
    const originalStatus = source.droppableId;

    // Actualización optimista
    const updatedClients = clients.map(c => 
      c.id === draggableId ? { ...c, status: newStatus as Client['status'] } : c
    );
    setClients(updatedClients);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/clients/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Error del servidor: ${response.status}`);
        console.error("Server error response:", errorText);
        throw new Error('No se pudo actualizar el estado.');
      }
      toast.success(`Cliente movido a "${newStatus.toUpperCase()}"`);
    } catch (error: any) {
      toast.error(error.message);
      // Revertir en caso de error
      setClients(clients.map(c => 
        c.id === draggableId ? { ...c, status: originalStatus as Client['status'] } : c
      ));
    }
  };

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!isAuthenticated) return <Redirect to="/admin" />;

  return (
    <div className="p-8">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-accent/10 rounded-full transition-colors" title="Volver al Panel">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">Pipeline de Ventas</h1>
          </div>
          <button onClick={fetchClients} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:opacity-90 transition">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start h-full overflow-x-auto pb-4">
            {pipelineStages.map(stage => (
              <Droppable key={stage} droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-card/50 border border-border rounded-lg p-4 min-h-[500px] flex flex-col transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : ''}`}
                  >
                    <h2 className="font-bold text-sm uppercase tracking-wider mb-4 border-b border-border pb-2 text-muted-foreground flex justify-between">
                      {stage}
                      <span className="bg-muted text-foreground px-2 py-0.5 rounded-full text-xs">
                        {clients.filter(c => c.status === stage).length}
                      </span>
                    </h2>
                    <div className="space-y-3 flex-1">
                      {clients.filter(c => c.status === stage).map((client, index) => (
                        <Draggable key={client.id} draggableId={client.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-card p-4 rounded-md shadow-sm border border-border hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary rotate-2' : ''}`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <p className="font-semibold text-foreground truncate">{client.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                              <div className="mt-2 text-[10px] text-muted-foreground text-right">
                                {new Date(client.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}