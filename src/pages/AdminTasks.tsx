import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  User,
  ExternalLink,
  Plus,
  FileSpreadsheet,
  Trash2,
  Check,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

/* =======================
   TYPES
======================= */

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  updated_at: string;
  notes: string | null;
}

interface Task {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string;
  type: 'call' | 'message';
  priority: 'high' | 'medium' | 'normal';
  daysInStatus: number;
  reason: string;
  status: string;
}

interface AdminTask {
  id: string;
  title: string;
  isCompleted: boolean;
  source: 'manual' | 'sheets';
  createdAt: string;
  dueDate?: string;
}

/* =======================
   COMPONENT
======================= */

export default function AdminTasks() {
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ calls: 0, messages: 0, total: 0 });
  
  // Estado para Tareas Administrativas
  const [activeTab, setActiveTab] = useState<'clients' | 'admin'>('clients');
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchClientsAndGenerateTasks();
    }
  }, [isAuthenticated, token]);

  // Cargar tareas administrativas guardadas
  useEffect(() => {
    const saved = localStorage.getItem('admin_tasks');
    if (saved) {
      setAdminTasks(JSON.parse(saved));
    }
  }, []);

  const fetchClientsAndGenerateTasks = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/admin/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Error del servidor: ${response.status}`);
        console.error("Server error response:", errorText);
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      const clients: Client[] = data.clients || [];
      
      const generatedTasks = generateTasks(clients);
      setTasks(generatedTasks);
      
      // Calcular estadísticas rápidas
      setStats({
        total: generatedTasks.length,
        calls: generatedTasks.filter(t => t.type === 'call').length,
        messages: generatedTasks.filter(t => t.type === 'message').length
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🧠 LÓGICA DEL AGENTE INTELIGENTE
  // ==========================================
  const generateTasks = (clients: Client[]): Task[] => {
    const today = new Date();
    const tasks: Task[] = [];
    
    // Cargar reglas personalizadas o usar valores por defecto
    const rules = JSON.parse(localStorage.getItem('contactRules') || JSON.stringify({
      primerContactoDays: 2,
      primerContactoPriority: 5,
      conversacionIniciadaDays: 3,
      conversacionIniciadaPriority: 7
    }));

    clients.forEach(client => {
      const lastUpdate = parseISO(client.updated_at);
      const daysDiff = differenceInDays(today, lastUpdate);

      // Regla 1: Clientes en "Primer Contacto" olvidados (> 2 días)
      // Acción: Mensaje suave para reactivar
      if (client.status === 'primer contacto') {
        if (daysDiff >= rules.primerContactoDays) {
          tasks.push({
            id: `task-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone,
            clientEmail: client.email,
            type: 'message',
            priority: daysDiff > rules.primerContactoPriority ? 'high' : 'normal',
            daysInStatus: daysDiff,
            reason: 'Cliente nuevo sin seguimiento reciente. Enviar info o preguntar dudas.',
            status: client.status
          });
        }
      } 
      // Regla 2: Conversaciones iniciadas que se han enfriado (> 3 días)
      // Acción: Llamada para intentar cerrar o avanzar
      else if (client.status === 'conversacion iniciada') {
        if (daysDiff >= rules.conversacionIniciadaDays) {
          tasks.push({
            id: `task-${client.id}`,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone,
            clientEmail: client.email,
            type: 'call',
            priority: daysDiff > rules.conversacionIniciadaPriority ? 'high' : 'medium',
            daysInStatus: daysDiff,
            reason: 'Conversación estancada. Llamar para proponer cita o cierre.',
            status: client.status
          });
        }
      }
      // Regla 3: Citas concertadas (Opcional: Recordatorio 1 día antes)
      // (Aquí podrías añadir lógica para confirmar citas mañana, si quisieras)
    });

    // Ordenar por prioridad (Alta primero) y luego por días de espera
    return tasks.sort((a, b) => {
        const priorityScore = { high: 3, medium: 2, normal: 1 };
        if (priorityScore[b.priority] !== priorityScore[a.priority]) {
            return priorityScore[b.priority] - priorityScore[a.priority];
        }
        return b.daysInStatus - a.daysInStatus;
    });
  };

  const getWhatsAppLink = (phone: string | null) => {
    if (!phone) return '#';
    // Limpiar teléfono y añadir código de país si falta (asumiendo ES +34 por defecto si quieres)
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  // ==========================================
  // 📋 GESTIÓN DE TAREAS ADMINISTRATIVAS
  // ==========================================
  
  const saveAdminTasks = (newTasks: AdminTask[]) => {
    setAdminTasks(newTasks);
    localStorage.setItem('admin_tasks', JSON.stringify(newTasks));
  };

  const handleAddAdminTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: AdminTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      isCompleted: false,
      source: 'manual',
      createdAt: new Date().toISOString(),
      dueDate: newTaskDueDate || undefined
    };
    
    saveAdminTasks([newTask, ...adminTasks]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    toast.success('Tarea añadida');
  };

  const toggleAdminTask = (id: string) => {
    const updated = adminTasks.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    saveAdminTasks(updated);
  };

  const deleteAdminTask = (id: string) => {
    const updated = adminTasks.filter(t => t.id !== id);
    saveAdminTasks(updated);
  };

  const importFromSheets = async () => {
    setIsImporting(true);
    try {
      // ID y Rango proporcionados por el usuario
      const sheetId = '1aBK6Aw0bivZUqNqbtkY9Ls25_W47cN6L8HpgQd6RxZ8';
      const range = 'A4:E49';
      // Usamos la API de visualización de Google para obtener CSV (requiere que la hoja sea pública o accesible)
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&range=${range}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('No se pudo acceder a la hoja de cálculo');

      const text = await response.text();
      
      // Parser CSV simple
      const rows = text.split('\n').map(row => {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        return values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
      });

      const importedTasks: AdminTask[] = rows
        .filter(row => row.length > 0 && row.some(cell => cell.trim())) // Filtrar filas vacías
        .map((row, index) => ({
          id: `sheet-${Date.now()}-${index}`,
          title: row.filter(cell => cell.trim()).join(' - '), // Unir todas las columnas
          isCompleted: false,
          source: 'sheets',
          createdAt: new Date().toISOString()
        }));

      if (importedTasks.length > 0) {
        saveAdminTasks([...importedTasks, ...adminTasks]);
        toast.success(`${importedTasks.length} tareas importadas de Google Sheets`);
      } else {
        toast.info('No se encontraron datos en el rango especificado');
      }
    } catch (error) {
      console.error('Error importando de Sheets:', error);
      toast.error('Error al importar. Asegúrate de que la hoja es pública en la web.');
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Generando hoja de ruta...</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-accent/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Hoja de Ruta Diaria</h1>
              <p className="text-muted-foreground text-sm">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>
          
          {/* Tabs de Navegación */}
          <div className="flex bg-muted/30 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'clients' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Seguimiento Clientes
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'admin' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tareas Administrativas
            </button>
          </div>
        </div>

        {activeTab === 'clients' ? (
          /* =======================
             VISTA CLIENTES
          ======================= */
          <div className="space-y-6">
            {/* Resumen Rápido */}
            <div className="flex gap-4 text-sm mb-6">
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <Phone size={16} /> <span className="font-bold">{stats.calls}</span> Llamadas
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <MessageSquare size={16} /> <span className="font-bold">{stats.messages}</span> Mensajes
              </div>
            </div>

            {/* Lista de Tareas de Clientes */}
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed">
              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">¡Todo al día!</h3>
              <p className="text-muted-foreground">No hay clientes pendientes de contactar según tus criterios.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-card border-l-4 rounded-r-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md ${
                  task.priority === 'high' ? 'border-l-red-500' : 
                  task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}
              >
                {/* Info Principal */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    task.type === 'call' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {task.type === 'call' ? <Phone size={24} /> : <MessageSquare size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{task.clientName}</h3>
                      {task.priority === 'high' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle size={10} /> Prioritario
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock size={14} /> 
                      Lleva {task.daysInStatus} días en "{task.status}"
                    </p>
                    <p className="text-sm font-medium mt-2 text-foreground/80">
                      💡 {task.reason}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  {task.type === 'call' ? (
                    <a 
                      href={`tel:${task.clientPhone}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <Phone size={16} /> Llamar ahora
                    </a>
                  ) : (
                    <a 
                      href={getWhatsAppLink(task.clientPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
                    >
                      <MessageSquare size={16} /> WhatsApp
                    </a>
                  )}
                  
                  {/* Botón secundario para ver ficha (simulado, idealmente llevaría al CRM) */}
                  <Link href={`/admin/crm?id=${task.clientId}`} className="flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent text-sm font-medium rounded">
                    <User size={16} /> Ver Ficha
                  </Link>
                </div>
              </div>
            ))
          )}
          </div>
        ) : (
          /* =======================
             VISTA ADMINISTRATIVA
          ======================= */
          <div className="space-y-6">
            {/* Barra de Acciones */}
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleAddAdminTask} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Añadir nueva tarea..."
                  className="flex-1 p-3 rounded-lg border bg-card focus:ring-2 focus:ring-primary outline-none"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <input 
                  type="date" 
                  className="p-3 rounded-lg border bg-card focus:ring-2 focus:ring-primary outline-none"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition">
                  <Plus size={24} />
                </button>
              </form>
              
              <button 
                onClick={importFromSheets}
                disabled={isImporting}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <FileSpreadsheet size={20} />
                {isImporting ? 'Sincronizando...' : 'Importar de Drive'}
              </button>
            </div>

            {/* Lista de Tareas Admin */}
            <div className="space-y-2">
              {adminTasks.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-dashed">
                  <Briefcase size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold">Sin tareas pendientes</h3>
                  <p className="text-muted-foreground">Añade tareas manuales o impórtalas de Google Sheets.</p>
                </div>
              ) : (
                adminTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`group flex items-center justify-between p-4 bg-card border rounded-lg transition-all ${
                      task.isCompleted ? 'opacity-60 bg-muted/50' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleAdminTask(task.id)}
                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                          task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        {task.isCompleted && <Check size={14} />}
                      </button>
                      <div>
                        <div className="flex gap-3 text-xs text-muted-foreground mb-1">
                          <span>📅 {format(parseISO(task.createdAt), 'dd/MM/yyyy')}</span>
                          {task.dueDate && (
                            <span className={new Date(task.dueDate) < new Date() && !task.isCompleted ? 'text-red-500 font-bold' : ''}>
                              🏁 {format(parseISO(task.dueDate), 'dd/MM/yyyy')}
                            </span>
                          )}
                        </div>
                        <p className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {task.source === 'sheets' && <FileSpreadsheet size={10} className="text-green-600" />}
                          {task.source === 'sheets' ? 'Importado de Sheets' : 'Manual'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteAdminTask(task.id)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
