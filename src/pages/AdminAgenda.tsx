import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { Redirect } from 'wouter';
import { Plus, X, Trash2 } from 'lucide-react';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { AdminPageLayout } from '@/components/AdminPageLayout';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración del calendario
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Booking {
  id: number;
  customer_name: string;
  date: string;
  start_time: string;
  event_details: string;
  customer_phone: string;
  customer_email: string;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

export default function AdminAgenda() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Estado para el Modal y Formulario
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    event_details: ''
  });

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), []);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, isAuthLoading]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) throw error;

      if (data) {
        const formattedEvents = data.map((booking: Booking) => {
          // Crear fechas de inicio y fin (asumimos 1 hora de duración por defecto)
          const start = new Date(`${booking.date}T${booking.start_time}`);
          const end = new Date(start.getTime() + 60 * 60 * 1000);

          return {
            title: `${booking.customer_name || 'Cliente'} - ${booking.event_details || 'Cita'}`,
            start,
            end,
            resource: booking
          };
        });
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar clic en un hueco vacío (Crear nueva cita)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedEvent(null);
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      date: format(start, 'yyyy-MM-dd'),
      start_time: format(start, 'HH:mm'),
      event_details: ''
    });
    setShowModal(true);
  };

  // Manejar clic en una cita existente (Ver detalles)
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  };

  // Guardar nueva cita en Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([formData]);

      if (error) throw error;

      await fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Error guardando cita:', error);
      alert('Error al guardar la cita. Revisa la consola.');
    }
  };

  // Eliminar cita
  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;

      await fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Error eliminando cita:', error);
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  // Configurar límites de horario (9:00 - 20:00)
  const minTime = new Date();
  minTime.setHours(9, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(20, 0, 0);

  const pageActions = (
    <>
      <button 
        onClick={() => handleSelectSlot({ start: new Date() })}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        <Plus size={20} /> Nueva Cita
      </button>
      <button 
        onClick={fetchBookings}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition"
      >
        Actualizar
      </button>
    </>
  );

  return (
    <AdminPageLayout title="Agenda de Citas" actions={pageActions}>
        <div className="bg-card p-6 rounded-xl shadow-lg h-[700px] border border-border text-card-foreground">
          {/* Añadimos la clase 'text-sm' para reducir el tamaño de la fuente dentro del calendario */}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            culture="es"
            view={view}
            onView={setView}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            date={date}
            onNavigate={onNavigate}
            min={minTime}
            max={maxTime}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay citas en este rango."
            }}
          />
        </div>

      {/* MODAL DE DETALLES / CREACIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border text-card-foreground rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/50">
              <h3 className="text-xl font-bold">
                {selectedEvent ? 'Detalles de la Cita' : 'Nueva Cita'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {selectedEvent ? (
                // VISTA DE DETALLES
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                    <p className="text-lg font-semibold">{selectedEvent.customer_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                      <p>{selectedEvent.date}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hora</label>
                      <p>{selectedEvent.start_time}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                    <p>{selectedEvent.customer_email}</p>
                    <p>{selectedEvent.customer_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Detalles</label>
                    <p className="bg-muted p-3 rounded-md mt-1">{selectedEvent.event_details}</p>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    >
                      <Trash2 size={18} /> Eliminar Cita
                    </button>
                  </div>
                </div>
              ) : (
                // FORMULARIO DE CREACIÓN
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre del Cliente</label>
                    <input required type="text" className="w-full p-2 rounded border border-input bg-background" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha</label>
                      <input required type="date" className="w-full p-2 rounded border border-input bg-background" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hora</label>
                      <input required type="time" className="w-full p-2 rounded border border-input bg-background" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" className="w-full p-2 rounded border border-input bg-background" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input type="tel" className="w-full p-2 rounded border border-input bg-background" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Detalles / Notas</label>
                    <textarea className="w-full p-2 rounded border border-input bg-background h-24" value={formData.event_details} onChange={e => setFormData({...formData, event_details: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded font-bold hover:opacity-90">
                    Guardar Cita
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}