import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Redirect } from 'wouter';
import { Plus, X, Trash2, MessageCircle } from 'lucide-react';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
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

const DnDCalendar = withDragAndDrop(Calendar);

interface Booking {
  id: number;
  customer_name: string;
  date: string;
  start_time: string;
  event_details: string;
  customer_phone: string;
  customer_email: string;
  address?: string;
  type?: string;
  duration?: number;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
  allDay?: boolean;
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
  const [calendarSettings, setCalendarSettings] = useState({
    startHour: 9,
    endHour: 20,
    commercialStartHour: 10,
    commercialEndHour: 14,
    commercialStartHour2: 16,
    commercialEndHour2: 20
  });
  const [isAllDay, setIsAllDay] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    event_details: '',
    type: 'comercial',
    duration: 60
  });

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), []);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchBookings();
      const savedSettings = localStorage.getItem('agenda_settings');
      if (savedSettings) {
        try {
          setCalendarSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
        } catch (e) {
          console.error('Error parsing settings', e);
        }
      }
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
          const duration = booking.duration || 60;
          const start = new Date(`${booking.date}T${booking.start_time}`);
          const end = new Date(start.getTime() + duration * 60 * 1000);
          const isAllDayEvent = duration === 1440;

          return {
            title: `${booking.customer_name || 'Cliente'} - ${booking.event_details || 'Cita'}`,
            start,
            end,
            resource: booking,
            allDay: isAllDayEvent
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
    setIsAllDay(false);
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      address: '',
      date: format(start, 'yyyy-MM-dd'),
      start_time: format(start, 'HH:mm'),
      event_details: '',
      type: 'comercial',
      duration: 60
    });
    setShowModal(true);
  };

  // Manejar clic en una cita existente (Ver detalles)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  }, []);

  // Guardar nueva cita en Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = { ...formData };

    if (isAllDay) {
      dataToSave.start_time = '00:00';
      dataToSave.duration = 1440;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([dataToSave]);

      if (error) throw error;

      await fetchBookings();
      setShowModal(false);
      toast.success('Cita guardada correctamente');
    } catch (error: any) {
      console.error('Error guardando cita:', error);
      toast.error(`Error al guardar: ${error.message || 'Revisa la consola'}`);
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
      toast.success('Cita eliminada');
    } catch (error: any) {
      console.error('Error eliminando cita:', error);
      toast.error('Error al eliminar la cita');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const type = (event.resource.type || 'comercial').toLowerCase();
    let backgroundColor = '#10b981'; // Verde por defecto

    if (type === 'profesional') backgroundColor = '#3b82f6'; // Azul
    if (type === 'boda') backgroundColor = '#d946ef'; // Fucsia
    if (type === 'evento') backgroundColor = '#f97316'; // Naranja

    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor, // Para un look más sólido
        color: 'white', // Asegura que el texto sea legible
      }
    };
  };

  // Estilo para las ranuras de tiempo (marcar horario comercial)
  const slotPropGetter = useCallback((date: Date) => {
    const hour = date.getHours() + date.getMinutes() / 60;
    const { commercialStartHour, commercialEndHour, commercialStartHour2, commercialEndHour2 } = calendarSettings;
    
    const inFirstRange = hour >= commercialStartHour && hour < commercialEndHour;
    const inSecondRange = hour >= commercialStartHour2 && hour < commercialEndHour2;

    // Si está dentro de CUALQUIERA de los horarios comerciales
    if (inFirstRange || inSecondRange) {
      return { className: 'bg-background' }; // Mantiene el color base (blanco/oscuro) limpio
    }
    // Fuera del horario comercial (pero dentro del laboral visible)
    return {
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
    };
  }, [calendarSettings]);

  // Mover evento (Drag & Drop)
  const moveEvent = useCallback(
    async ({ event, start, end, isAllDay: droppedOnAllDaySlot }: any) => {
      const { resource } = event;

      // Calcular nuevos valores
      const newDate = format(start, 'yyyy-MM-dd');
      const newStartTime = droppedOnAllDaySlot ? '00:00' : format(start, 'HH:mm');
      let newDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

      if (droppedOnAllDaySlot) {
          newDuration = 1440;
      }

      // Actualizar el recurso (datos de la cita) para que el modal muestre la info correcta
      const updatedResource = {
        ...resource,
        date: newDate,
        start_time: newStartTime,
        duration: newDuration
      };

      // Actualización optimista en UI
      setEvents((prev) => {
        const filtered = prev.filter((ev) => ev.resource.id !== resource.id);
        return [...filtered, { ...event, start, end, allDay: droppedOnAllDaySlot, resource: updatedResource }];
      });

      try {
        const { error } = await supabase
          .from('bookings')
          .update({
            date: newDate,
            start_time: newStartTime,
            duration: newDuration,
          })
          .eq('id', resource.id);

        if (error) throw error;
        toast.success('Cita movida correctamente');
      } catch (error) {
        console.error(error);
        toast.error('Error al mover la cita');
        fetchBookings(); // Revertir cambios si falla
      }
    },
    []
  );

  // Redimensionar evento (Alargar/Acortar duración)
  const resizeEvent = useCallback(
    async ({ event, start, end }: any) => {
      const { resource } = event;

      // Calcular nuevos valores
      const newDate = format(start, 'yyyy-MM-dd');
      const newStartTime = format(start, 'HH:mm');
      const newDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

      // Actualizar recurso
      const updatedResource = {
        ...resource,
        date: newDate,
        start_time: newStartTime,
        duration: newDuration
      };

      setEvents((prev) => {
        const filtered = prev.filter((ev) => ev.resource.id !== resource.id);
        return [...filtered, { ...event, start, end, resource: updatedResource }];
      });

      try {
        const { error } = await supabase
          .from('bookings')
          .update({
            date: newDate,
            start_time: newStartTime,
            duration: newDuration,
          })
          .eq('id', resource.id);

        if (error) throw error;
        toast.success('Duración actualizada');
      } catch (error) {
        console.error(error);
        toast.error('Error al redimensionar');
        fetchBookings();
      }
    },
    []
  );

  const getWhatsAppLink = (phone: string, name: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${name}, te contacto desde Narrativa de Bodas referente a tu cita.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  // Configurar límites de horario (9:00 - 20:00)
  const minTime = new Date();
  minTime.setHours(Math.floor(calendarSettings.startHour), Math.round((calendarSettings.startHour % 1) * 60), 0);
  const maxTime = new Date();
  maxTime.setHours(Math.floor(calendarSettings.endHour), Math.round((calendarSettings.endHour % 1) * 60), 0);

  const pageActions = (
    <>
      <button 
        onClick={() => handleSelectSlot({ start: new Date() })}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        <Plus size={20} /> Nueva Cita
      </button>
    </>
  );

  return (
    <AdminPageLayout title="Agenda de Citas" actions={pageActions}>
        {/* Leyenda de Colores */}
        <div className="flex flex-wrap gap-4 mb-4 px-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span>Comercial</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span>Profesional</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#d946ef]"></div>
            <span>Boda</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
            <span>Evento</span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-lg h-[700px] border border-border text-card-foreground">
          {/* Añadimos la clase 'text-sm' para reducir el tamaño de la fuente dentro del calendario */}
          <DnDCalendar
            localizer={localizer}
            events={events}
            eventPropGetter={eventStyleGetter}
            slotPropGetter={slotPropGetter}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            culture="es"
            view={view}
            onView={setView}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            resizable
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
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Cita</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        (selectedEvent.type || 'comercial') === 'profesional' ? 'bg-blue-500' :
                        (selectedEvent.type || 'comercial') === 'boda' ? 'bg-fuchsia-500' :
                        (selectedEvent.type || 'comercial') === 'evento' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}>
                        {(selectedEvent.type || 'comercial').charAt(0).toUpperCase() + (selectedEvent.type || 'comercial').slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                      <p>{selectedEvent.date}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hora</label>
                      <p>{selectedEvent.duration === 1440 ? 'Todo el día' : selectedEvent.start_time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Duración</label>
                      <p>{selectedEvent.duration === 1440 ? '-' : `${selectedEvent.duration || 60} min`}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                    <p>{selectedEvent.customer_email}</p>
                    <div className="flex items-center gap-2">
                      <p>{selectedEvent.customer_phone}</p>
                      {selectedEvent.customer_phone && (
                        <a 
                          href={getWhatsAppLink(selectedEvent.customer_phone, selectedEvent.customer_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                  {selectedEvent.address && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                      <p>{selectedEvent.address}</p>
                    </div>
                  )}
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
                    <label className="block text-sm font-medium mb-1">Persona de contacto</label>
                    <input required type="text" className="w-full p-2 rounded border border-input bg-background" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Cita</label>
                    <select className="w-full p-2 rounded border border-input bg-background" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="comercial">Comercial</option>
                      <option value="profesional">Profesional</option>
                      <option value="boda">Boda</option>
                      <option value="evento">Evento</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="allDay" 
                      checked={isAllDay} 
                      onChange={e => setIsAllDay(e.target.checked)} 
                      className="rounded border-input w-4 h-4"
                    />
                    <label htmlFor="allDay" className="text-sm font-medium cursor-pointer">Todo el día</label>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className={isAllDay ? "col-span-3" : ""}>
                      <label className="block text-sm font-medium mb-1">Fecha</label>
                      <input required type="date" className="w-full p-2 rounded border border-input bg-background" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    {!isAllDay && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Hora</label>
                          <input required type="time" className="w-full p-2 rounded border border-input bg-background" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Duración</label>
                          <select className="w-full p-2 rounded border border-input bg-background" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">1 hora</option>
                            <option value="90">1.5 horas</option>
                            <option value="120">2 horas</option>
                            <option value="180">3 horas</option>
                            <option value="240">4 horas</option>
                          </select>
                        </div>
                      </>
                    )}
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
                    <label className="block text-sm font-medium mb-1">Dirección</label>
                    <input type="text" className="w-full p-2 rounded border border-input bg-background" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
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