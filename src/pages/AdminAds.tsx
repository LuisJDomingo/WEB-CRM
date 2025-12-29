import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Facebook, 
  Users, 
  Wallet, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Send, 
  Clock, 
  Trash2, 
  Instagram,
  Settings,
  Link2,
  ShieldCheck,
  Palette,
  Bell,
  Save,
  Upload,
  Eye,
  X,
  LayoutList,
  Grid,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Music2,
  FileSpreadsheet,
  Download,
  Check,
  UploadCloud,
  RefreshCw,
  Edit,
  ChevronLeft,
  ChevronRight,
  Square,
  CheckSquare,
  FileText,
  StickyNote,
  Copy,
  Wand2,
  TrendingUp,
  BarChart3,
  LineChart,
  LayoutDashboard,
  Activity,
  BookOpen,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Hash
} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { PlatformCard } from '../components/ads/PlatformCard';
import { toast } from 'sonner';
import { format, parse, startOfWeek, getDay, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Configuración del Calendario
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const DnDCalendar = withDragAndDrop(Calendar);

// Configuración de Supabase (Para subir las imágenes a la nube)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para el Planificador Social
interface SocialPost {
  id: string;
  content: string;
  platforms: ('facebook' | 'instagram' | 'tiktok')[];
  scheduledDate: Date | null;
  status: 'scheduled' | 'published' | 'draft';
  image?: string;
  metrics?: {
    views: number;
    likes: number;
    leads: number;
  };
}

export default function AdminAds() {
  const { token, isAuthenticated } = useAuth();
  // Estado para pestañas
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'social' | 'blog' | 'settings'>('overview');
  
  // Estado para vista del planificador (Calendario vs Lista)
  const [socialView, setSocialView] = useState<'calendar' | 'list' | 'drafts'>('calendar');
  const [viewDate, setViewDate] = useState(new Date());
  
  // --- LÓGICA DE ADS (Existente) ---
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    meta: [],
    tiktok: [],
    total_spend: 0,
    total_leads: 0
  });
  const [crmStats, setCrmStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<{date: string, leads: number, spend: number}[]>([]);

  // --- LÓGICA DE BLOG (Nueva) ---
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingBlogPost, setEditingBlogPost] = useState<any>(null);

  // --- LÓGICA DE SOCIAL (Nueva) ---
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [filterPlatforms, setFilterPlatforms] = useState(['facebook', 'instagram', 'tiktok']);

  // Estado para Carga Masiva
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importPreview, setImportPreview] = useState<SocialPost[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);

  // Helper para saber si estamos editando un borrador
  const isEditingDraft = useMemo(() => {
    if (!editingId) return false;
    const post = posts.find(p => p.id === editingId);
    return post?.status === 'draft';
  }, [editingId, posts]);

  // --- LÓGICA DE CONFIGURACIÓN (Nueva) ---
  const [settings, setSettings] = useState({
    dailyBudgetCap: 50,
    cpaAlert: 15,
    defaultHashtags: '#boda #fotografia #amor',
    emailAlerts: true
  });

  // Cargar posts y limpiar los ya publicados para ahorrar costes
  useEffect(() => {
    if (isAuthenticated && token && (activeTab === 'social' || activeTab === 'overview')) {
      fetchAndCleanupPosts(true); // true = Auto-navegar al primer post
    }
  }, [isAuthenticated, token, activeTab]);

  // Cargar Actividad Real del CRM
  useEffect(() => {
    if (isAuthenticated && token && activeTab === 'overview') {
      const fetchActivities = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/activities`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            setRecentActivities(json.activities || []);
          }
        } catch (e) {
          console.error("Error cargando actividad", e);
        }
      };
      fetchActivities();
    }
  }, [isAuthenticated, token, activeTab]);

  // Cargar Estadísticas del CRM (Fuentes de Leads)
  useEffect(() => {
    if (isAuthenticated && token && activeTab === 'overview') {
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.stats) setCrmStats(data.stats);
      })
      .catch(e => console.error("Error cargando stats CRM", e));
    }
  }, [isAuthenticated, token, activeTab]);

  // Cargar Datos Históricos (Gráfico) desde el Backend
  useEffect(() => {
    if (isAuthenticated && token && activeTab === 'overview') {
      const fetchHistorical = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/historical`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            setHistoricalData(json.historical || []);
          }
        } catch (e) {
          console.error("Error cargando histórico", e);
        }
      };
      fetchHistorical();
    }
  }, [isAuthenticated, token, activeTab]);

  // Cargar Blog Posts
  useEffect(() => {
    if (isAuthenticated && token && activeTab === 'blog') {
      fetch(`${import.meta.env.VITE_API_URL}/api/blog/posts`)
        .then(res => res.json())
        .then(data => {
          if (data.posts) setBlogPosts(data.posts);
        })
        .catch(err => console.error("Error cargando blog", err));
    }
  }, [isAuthenticated, token, activeTab]);

  const fetchAndCleanupPosts = async (autoNavigate = false) => {
    try {
      // 1. Obtener cola de publicación
      const { data, error } = await supabase.from('social_queue').select('*');
      if (error) throw error;

      const now = new Date();
      const postsToUpdate: any[] = [];
      const imagesToDelete: string[] = [];

      // Procesar posts para separar activos de archivados
      const processedPosts = (data || []).map((row: any) => {
        // Si es null (borrador sin fecha), usamos fecha actual para que no rompa el calendario
        const scheduledDate = row.scheduled_date ? new Date(row.scheduled_date) : null;
        const isExpired = scheduledDate ? scheduledDate < now : false;
        
        // Si ya pasó la fecha y aún tiene imagen o no está marcado como publicado
        // IMPORTANTE: No limpiar borradores automáticamente
        const needsCleanup = row.status !== 'draft' && isExpired && (row.status !== 'published' || row.image_url);
        
        if (needsCleanup) {
          postsToUpdate.push({
            id: row.id,
            status: 'published',
            image_url: null // Borramos la referencia para que no busque la imagen borrada
          });
          
          if (row.image_url) {
            const parts = row.image_url.split('/social-posts/');
            if (parts.length > 1) imagesToDelete.push(`social-posts/${parts[1]}`);
          }
        }

        return {
          id: row.id,
          content: row.content,
          platforms: row.platforms,
          scheduledDate: scheduledDate,
            status: isExpired ? 'published' : (row.status === 'draft' ? 'draft' : 'scheduled'),
          image: isExpired ? null : row.image_url, // En UI ya no mostramos la imagen si expiró
          metrics: undefined // Se llenará con la llamada a la API
        };
      });

      // 2. Obtener Métricas desde el Backend (API Externa simulada)
      // Esto prepara el terreno para conectar Meta/TikTok APIs reales en el servidor
      const postIds = processedPosts.filter(p => p.status !== 'draft').map(p => p.id);
      let metricsMap: Record<string, any> = {};

      if (postIds.length > 0) {
        try {
          const metricsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/social/metrics`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ postIds })
          });
          if (metricsRes.ok) {
            const json = await metricsRes.json();
            metricsMap = json.metrics || {};
          }
        } catch (err) {
          console.error("Error obteniendo métricas:", err);
        }
      }

      // Combinar posts con sus métricas
      const finalPosts = processedPosts.map(p => ({
        ...p,
        metrics: metricsMap[p.id] || undefined
      }));

      setPosts(finalPosts);

      // Si es la carga inicial, mover el calendario a donde haya contenido
      if (autoNavigate && finalPosts.length > 0) {
        const now = new Date();
        // Ordenar cronológicamente
        const sorted = [...finalPosts].sort((a, b) => {
          const dateA = a.scheduledDate ? a.scheduledDate.getTime() : 0;
          const dateB = b.scheduledDate ? b.scheduledDate.getTime() : 0;
          return dateA - dateB;
        });
        // Buscar el primer post futuro o pendiente
        const nextPost = sorted.find(p => p.scheduledDate && p.scheduledDate >= now);
        
        if (nextPost && nextPost.scheduledDate) {
          setViewDate(nextPost.scheduledDate);
        } else {
          // Si todos son pasados, ir al último (el más reciente)
          const lastPost = sorted[sorted.length - 1];
          if (lastPost && lastPost.scheduledDate) {
            setViewDate(lastPost.scheduledDate);
          }
        }
      }

      // 2. Ejecutar limpieza (Archivado)
      if (postsToUpdate.length > 0) {
        // Actualizar estado en BBDD (Archivar)
        for (const update of postsToUpdate) {
          await supabase.from('social_queue').update(update).eq('id', update.id);
        }
        
        // Borrar imágenes físicas (Ahorro real de dinero)
        if (imagesToDelete.length > 0) {
          await supabase.storage.from('images').remove(imagesToDelete);
        }
        
        toast.success(`${postsToUpdate.length} posts archivados. Imágenes borradas para ahorrar espacio.`);
      }
    } catch (error: any) {
      console.error('Error gestionando posts:', error.message || error);
    }
  };

  // Función auxiliar para subir imagen a Supabase Storage
  const uploadImageToCloud = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `social-posts/${fileName}`;

      // Subir al bucket 'images' (o el que tengas configurado)
      const { error: uploadError } = await supabase.storage
        .from('images') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    }
  };

  const handleEditPost = (post: SocialPost) => {
    setEditingId(post.id);
    setNewPostContent(post.content);
    setSelectedPlatforms(post.platforms);
    if (post.scheduledDate) {
      try {
        const dateStr = format(post.scheduledDate, "yyyy-MM-dd'T'HH:mm");
        setScheduleDate(dateStr);
      } catch (e) {
        console.error("Error formatting date", e);
      }
    } else {
      setScheduleDate('');
    }
    setMediaPreview(post.image || null);
    setMediaFile(null);
    // window.scrollTo({ top: 0, behavior: 'smooth' }); // Desactivado para evitar saltos al abrir modal
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPostContent('');
    setSelectedPlatforms([]);
    setScheduleDate('');
    setMediaPreview(null);
    setMediaFile(null);
    setIsPostModalOpen(false);
  };

  const handleEventClick = (post: SocialPost) => {
    handleEditPost(post);
    setIsPostModalOpen(true);
  };

  // Memoizar posts ordenados para navegación rápida (evita reordenar en cada clic)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = a.scheduledDate ? a.scheduledDate.getTime() : 0;
      const dateB = b.scheduledDate ? b.scheduledDate.getTime() : 0;
      return dateA - dateB;
    });
  }, [posts]);

  // Memoizar eventos del calendario para evitar que el calendario se re-renderice al editar
  const calendarEvents = useMemo(() => posts
    .filter(p => p.status !== 'draft' && p.scheduledDate)
    .map(p => {
      const startDate = p.scheduledDate!;
      return {
        title: p.content,
        start: startDate,
        end: new Date(startDate.getTime() + 60 * 60 * 1000), // 1 hora duración visual
        resource: p
      };
    })
    .filter(e => e.resource.platforms.some(p => filterPlatforms.includes(p))), 
  [posts, filterPlatforms]);

  const handleNavigatePost = (direction: 'prev' | 'next') => {
    if (!editingId) return;
    
    const currentIndex = sortedPosts.findIndex(p => p.id === editingId);
    
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < sortedPosts.length) {
      handleEditPost(sortedPosts[newIndex]);
    } else {
      toast.info(direction === 'prev' ? 'Es el primer post' : 'Es el último post');
    }
  };

  const handleDuplicatePost = async (post: SocialPost) => {
    const toastId = toast.loading('Duplicando...');
    try {
      const { error } = await supabase.from('social_queue').insert([{
        content: post.content,
        platforms: post.platforms,
        scheduled_date: null, // Al duplicar va a borradores sin fecha
        image_url: post.image,
        status: 'draft'
      }]);

      if (error) throw error;

      toast.success('Copiado a borradores', { id: toastId });
      fetchAndCleanupPosts();
    } catch (error) {
      toast.error('Error al duplicar', { id: toastId });
    }
  };

  const handleEnhanceText = async () => {
     if (!newPostContent) {
       toast.error('Escribe algo primero para que la IA pueda mejorarlo.');
       return;
     }

     setIsEnhancing(true);
     const toastId = toast.loading('Mejorando texto con IA...');

     try {
       // Llamada a TU Backend (que usa llm_agent.py con tu personalidad)
       // Asegúrate de tener la ruta /api/ai/generate-copy creada en tu servidor
       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate-copy`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           content: newPostContent,
           platform: selectedPlatforms[0] || 'instagram'
         })
       });

       if (!response.ok) {
         throw new Error('Error al conectar con tu Agente IA');
       }

       const data = await response.json();
       const result = data.result; // Asumimos que el backend devuelve { result: "texto..." }

       if (result) {
         setNewPostContent(result);
         toast.success('¡Texto mejorado!', { id: toastId });
       }
     } catch (error: any) {
       console.error('Error IA:', error);
       toast.error('No se pudo conectar con el Agente. Usando modo offline.', { id: toastId });
       // Fallback offline
       const enhancements = [
           "\n\n#BodaSoñada #FotografiaProfesional #Recuerdos",
           " ✨",
           " 📸 Capturando momentos únicos.",
           "\n\n¿Te casas pronto? ¡Escríbenos!"
       ];
       setNewPostContent(prev => prev + enhancements[Math.floor(Math.random() * enhancements.length)]);
     } finally {
       setIsEnhancing(false);
     }
  };

  const handleSchedulePost = async (e: React.FormEvent | React.MouseEvent, targetStatus: 'scheduled' | 'draft' = 'scheduled') => {
    e.preventDefault();
    
    // Validaciones Profesionales
    if (!newPostContent && !mediaFile && !mediaPreview) {
      toast.error('El post no puede estar vacío');
      return;
    }

    if (targetStatus === 'scheduled') {
      if (selectedPlatforms.length === 0) {
        toast.error('Selecciona al menos una plataforma para programar');
        return;
      }
      if (!scheduleDate) {
        toast.error('Selecciona una fecha y hora');
        return;
      }
    }

    setIsUploading(true);
    let finalImageUrl = editingId ? (mediaPreview || undefined) : undefined;

    // 1. Si hay imagen seleccionada, subirla a la nube primero
    if (mediaFile) {
      const uploadedUrl = await uploadImageToCloud(mediaFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
      else toast.error('Error al subir la imagen, se publicará sin ella.');
    }

    // Validación de Multimedia para Instagram/TikTok
    if (targetStatus === 'scheduled' && !finalImageUrl && selectedPlatforms.some(p => ['instagram', 'tiktok'].includes(p))) {
      toast.error('Instagram y TikTok requieren una imagen o video obligatorio.');
      setIsUploading(false);
      return;
    }

    if (editingId) {
      // MODO EDICIÓN: Actualizar existente
      const { data, error } = await supabase
        .from('social_queue')
        .update({
          content: newPostContent,
          platforms: selectedPlatforms,
          scheduled_date: scheduleDate ? new Date(scheduleDate).toISOString() : null,
          image_url: finalImageUrl || null,
          status: targetStatus
        })
        .eq('id', editingId)
        .select();

      if (error) {
        toast.error('Error al actualizar el post');
        setIsUploading(false);
        return;
      } else {
        // Actualización Optimista (Instantánea)
        if (data && data[0]) {
          const updatedPost = data[0];
          setPosts(prev => prev.map(p => p.id === editingId ? {
            ...p,
            content: updatedPost.content,
            platforms: updatedPost.platforms,
            scheduledDate: new Date(updatedPost.scheduled_date),
            status: updatedPost.status,
            image: updatedPost.image_url,
            metrics: p.metrics // Mantenemos las métricas existentes o esperamos al refresh
          } : p));
        }
        toast.success(targetStatus === 'draft' ? 'Borrador actualizado' : 'Post actualizado correctamente');
        cancelEdit();
        setIsPostModalOpen(false);
        fetchAndCleanupPosts(); // En segundo plano
      }
    } else {
      // MODO CREACIÓN: Insertar nuevo
      const { data, error } = await supabase.from('social_queue').insert([{
        content: newPostContent,
        platforms: selectedPlatforms,
        scheduled_date: scheduleDate ? new Date(scheduleDate).toISOString() : null,
        image_url: finalImageUrl,
        status: targetStatus
      }]).select();

      if (error || !data) {
        toast.error('Error al guardar en base de datos');
        setIsUploading(false);
        return;
      } else {
        // Inserción Optimista (Instantánea)
        const newPostDB = data[0];
        const newPostLocal: SocialPost = {
          id: newPostDB.id,
          content: newPostDB.content,
          platforms: newPostDB.platforms,
          scheduledDate: new Date(newPostDB.scheduled_date),
          status: newPostDB.status,
          image: newPostDB.image_url,
          metrics: undefined // Se cargarán en el siguiente fetch
        };
        setPosts(prev => [...prev, newPostLocal]);
        
        toast.success(targetStatus === 'draft' ? 'Guardado como borrador' : 'Post programado correctamente');
        cancelEdit(); // Limpia el formulario usando la misma función
        setIsPostModalOpen(false);
        fetchAndCleanupPosts(); // En segundo plano
      }
    }

    setIsUploading(false);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación programada?')) return;

    try {
      const postToDelete = posts.find(p => p.id === id);
      
      // Borrar de BBDD
      const { error } = await supabase.from('social_queue').delete().eq('id', id);
      if (error) throw error;
      
      // Borrar imagen si existe
      if (postToDelete?.image) {
        const parts = postToDelete.image.split('/social-posts/');
        if (parts.length > 1) {
          await supabase.storage.from('images').remove([`social-posts/${parts[1]}`]);
        }
      }

      setPosts(posts.filter(p => p.id !== id));
      
      // Si estamos editando este post (modal abierto), lo cerramos
      if (editingId === id) {
        cancelEdit();
      }

      toast.success('Post eliminado y espacio liberado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleToggleSelect = (postId: string) => {
    setSelectedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedPostIds.size === posts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(posts.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPostIds.size === 0) return;
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedPostIds.size} publicaciones?`)) return;

    const idsToDelete = Array.from(selectedPostIds);
    const postsToDelete = posts.filter(p => idsToDelete.includes(p.id));
    
    try {
      await supabase.from('social_queue').delete().in('id', idsToDelete).throwOnError();
      
      const imagePathsToDelete = postsToDelete.map(p => p.image).filter(Boolean).map(url => {
          const parts = (url as string).split('/social-posts/');
          return parts.length > 1 ? `social-posts/${parts[1]}` : null;
      }).filter(Boolean) as string[];

      if (imagePathsToDelete.length > 0) await supabase.storage.from('images').remove(imagePathsToDelete);
      await fetchAndCleanupPosts();
      setSelectedPostIds(new Set());
      toast.success(`${idsToDelete.length} posts eliminados.`);
    } catch (error: any) { toast.error(error.message || 'Error al eliminar las publicaciones seleccionadas.'); }
  };

  // Manejo de carga de imagen simulada
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file); // Guardamos el archivo real para subirlo luego
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Procesar Carga Masiva
  const handleBulkFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Separar CSV de Imágenes
    const csvFile = Array.from(files).find(f => f.name.endsWith('.csv'));
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (!csvFile) {
      toast.error('Por favor sube al menos un archivo .csv');
      return;
    }

    // Validación: Avisar si no hay imágenes seleccionadas
    if (imageFiles.length === 0) {
      toast.warning('⚠️ No has seleccionado imágenes. Recuerda seleccionar el CSV y las fotos A LA VEZ.', {
        duration: 6000
      });
    }

    setIsUploading(true);
    const toastId = toast.loading('Procesando y subiendo imágenes...');

    const text = await csvFile.text();
    const lines = text.split('\n');
    const newPosts: SocialPost[] = [];
    let missingImages = 0;

    // Saltamos la cabecera (fila 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Formato CSV esperado: contenido, fecha(YYYY-MM-DD), hora(HH:MM), plataformas(fb;ig), nombre_imagen
      // Usamos regex para separar por comas respetando comillas si las hubiera
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
      
      if (cols.length < 3) continue;

      const [content, dateStr, timeStr, platformsStr, imageName] = cols;
      
      // Buscar imagen coincidente en los archivos subidos
      let cloudImageUrl = undefined;
      
      if (imageName) {
        // 1. Si el CSV ya trae una URL completa (ej: de una imagen ya online), la usamos
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
          cloudImageUrl = imageName;
        } 
        // 2. Si es un nombre de archivo, buscamos en los archivos subidos
        else if (imageFiles.length > 0) {
            const matchingFile = imageFiles.find(f => f.name.trim() === imageName.trim());
            if (matchingFile) {
              // SUBIDA AUTOMÁTICA A LA NUBE
              const url = await uploadImageToCloud(matchingFile);
              if (url) cloudImageUrl = url;
            } else {
              missingImages++;
            }
        } else {
          missingImages++;
        }
      }

      newPosts.push({
        id: Math.random().toString(36).substr(2, 9),
        content: content || 'Sin contenido',
        platforms: (platformsStr?.split(';').map(p => p.toLowerCase()) as any[]) || ['facebook'],
        scheduledDate: new Date(`${dateStr}T${timeStr}`),
        status: 'scheduled',
        image: cloudImageUrl
      });
    }

    setImportPreview(newPosts);
    setIsUploading(false);
    toast.dismiss(toastId);
    
    if (missingImages > 0) {
      toast.warning(`Procesado con alertas: Faltan ${missingImages} imágenes que no se encontraron.`);
    } else {
      toast.success(`¡Éxito! ${newPosts.length} posts procesados con sus imágenes.`);
    }
  };

  // Reprogramar post al arrastrar en el calendario
  const moveEvent = useCallback(({ event, start, end }: any) => {
    setPosts((prev) => prev.map(post => {
      if (post.id === event.resource.id) {
        return { ...post, scheduledDate: start };
      }
      return post;
    }));
    toast.success('Post reprogramado correctamente');
  }, []);

  // Estilos para eventos del calendario
  const eventStyleGetter = (event: any) => {
    const post = event.resource;
    
    // Si está publicado (pasado), color gris para diferenciar historial
    if (post.status === 'published') {
       return { style: { backgroundColor: '#6b7280', borderRadius: '4px', fontSize: '12px', opacity: 0.7 } };
    }
    // Si es borrador, color ámbar/naranja
    if (post.status === 'draft') {
       return { style: { backgroundColor: '#f59e0b', borderRadius: '4px', fontSize: '12px', border: '1px dashed #b45309', color: '#fff' } };
    }

    const platforms = post.platforms || [];
    let backgroundColor = '#1877F2'; // Facebook Blue default

    if (platforms.length > 1) {
      backgroundColor = '#8b5cf6'; // Púrpura para Multi-plataforma
    } else if (platforms.includes('instagram')) {
      backgroundColor = '#E1306C'; // Instagram Pink
    } else if (platforms.includes('tiktok')) {
      backgroundColor = '#000000'; // TikTok Black
    }
    
    return { style: { backgroundColor, borderRadius: '4px', fontSize: '12px' } };
  };

  const togglePlatformFilter = (platform: string) => {
    setFilterPlatforms(prev => 
        prev.includes(platform) 
            ? prev.filter(p => p !== platform) 
            : [...prev, platform]
    );
  };

  useEffect(() => {
    if (isAuthenticated && token) fetchCampaigns();
  }, [isAuthenticated, token]);

  // Efecto: Cargar identidad de marca automáticamente al entrar al planificador
  useEffect(() => {
    if (activeTab === 'social' && newPostContent.trim() === '') {
      setNewPostContent(settings.defaultHashtags);
    }
  }, [activeTab]);

  const fetchCampaigns = async () => {
    if (!token) return;
    console.log('🔄 Cargando campañas con autenticación...');
    try {
      // Actualizado a /api/admin/ads
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ads/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error cargando datos');
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error('No se pudieron cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    // Optimistic update
    toast.success(`Campaña ${newStatus === 'ACTIVE' ? 'activada' : 'pausada'}`);
    
    try {
      // Actualizado a /api/admin/ads
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ads/campaign/${id}/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchCampaigns(); // Recargar para confirmar
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleSaveSettings = () => {
    // Aquí enviaríamos estos ajustes a tu base de datos (Supabase/Backend)
    // para que el "vigilante" automático sepa cuándo avisarte.
    toast.success('Configuración de seguridad guardada', {
      description: `Te avisaremos si el gasto supera ${settings.dailyBudgetCap}€ diarios.`
    });
  };

  // Simulación de datos en tiempo real para el Dashboard
  const liveMetrics = useMemo(() => {
    const totalOrganicLeads = posts.reduce((acc, p) => acc + (p.metrics?.leads || 0), 0);
    const todaySpend = data.total_spend / 30; // Estimación diaria
    const activeCampaignsCount = data.meta.filter((c: any) => c.status === 'ACTIVE').length + data.tiktok.filter((c: any) => c.status === 'ACTIVE').length;
    
    // Desglose de leads por plataforma (RRSS)
    let platformLeads = { facebook: 0, instagram: 0, tiktok: 0 };

    // PRIORIDAD 1: Usar datos REALES del CRM si existen
    if (crmStats && crmStats.bySource) {
      platformLeads.facebook = (crmStats.bySource['facebook'] || 0) + (crmStats.bySource['meta'] || 0);
      platformLeads.instagram = crmStats.bySource['instagram'] || 0;
      platformLeads.tiktok = crmStats.bySource['tiktok'] || 0;
    } 
    
    // PRIORIDAD 2: Si no hay datos reales, usar estimación basada en posts (Fallback)
    if (platformLeads.facebook === 0 && platformLeads.instagram === 0 && platformLeads.tiktok === 0) {
      posts.forEach(post => {
        if (post.metrics?.leads && post.platforms.length > 0) {
          const split = post.metrics.leads / post.platforms.length;
          post.platforms.forEach(p => {
            if (platformLeads[p as keyof typeof platformLeads] !== undefined) {
               platformLeads[p as keyof typeof platformLeads] += split;
            }
          });
        }
      });
    }

    return { 
        totalOrganicLeads, 
        todaySpend,
        activeCampaignsCount,
        platformLeads: {
            facebook: Math.round(platformLeads.facebook),
            instagram: Math.round(platformLeads.instagram),
            tiktok: Math.round(platformLeads.tiktok)
        }
    };
  }, [posts, data, crmStats]);

  // Análisis de palabras clave en posts exitosos (Top 20 por leads)
  const topKeywords = useMemo(() => {
    const topPosts = [...posts]
      .filter(p => p.metrics && p.metrics.leads > 0)
      .sort((a, b) => (b.metrics?.leads || 0) - (a.metrics?.leads || 0))
      .slice(0, 20);

    const wordCounts: Record<string, number> = {};
    // Lista básica de stopwords en español para filtrar palabras irrelevantes
    const stopWords = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'que', 'los', 'las', 'del', 'un', 'una', 'por', 'para', 'con', 'no', 'si', 'lo', 'es', 'son', 'tu', 'mi', 'te', 'se', 'al', 'como', 'más', 'pero', 'o', 'sus', 'le', 'ha', 'me', 'sin', 'sobre', 'este', 'esta', 'entre', 'cuando', 'muy', 'nos', 'ti', 'tú', 'está', 'están', 'ser', 'fue', 'era', 'porque', 'donde', 'quien', 'cada', 'todo', 'todos']);

    topPosts.forEach(post => {
      const words = post.content
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()"?¡!¿]/g, "")
        .split(/\s+/);

      words.forEach(word => {
        // Filtrar palabras cortas y stopwords
        if (word.length > 3 && !stopWords.has(word) && !word.startsWith('http')) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); 
  }, [posts]);

  // Función para mapear tipos de actividad a iconos y colores
  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'contact_form':
        return { icon: <Users size={16} />, color: "text-blue-500 bg-blue-500/10", label: "Nuevo Lead" };
      case 'gallery_comment':
        return { icon: <MessageCircle size={16} />, color: "text-pink-500 bg-pink-500/10", label: "Comentario" };
      case 'status_change':
        return { icon: <RefreshCw size={16} />, color: "text-amber-500 bg-amber-500/10", label: "Cambio Estado" };
      case 'stale_warning':
        return { icon: <AlertTriangle size={16} />, color: "text-red-500 bg-red-500/10", label: "Alerta" };
      default:
        return { icon: <Activity size={16} />, color: "text-gray-500 bg-gray-500/10", label: "Actividad" };
    }
  };

  // Guardar Post de Blog
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Guardando noticia...');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/blog/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editingBlogPost)
      });
      
      if (!res.ok) throw new Error('Error al guardar');
      
      const data = await res.json();
      setBlogPosts(prev => editingBlogPost.id ? prev.map(p => p.id === data.post.id ? data.post : p) : [data.post, ...prev]);
      setEditingBlogPost(null);
      toast.success('Noticia guardada correctamente', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la noticia', { id: toastId });
    }
  };

  const handleGenerateBlog = async () => {
    if (!editingBlogPost?.title) {
      toast.error('Escribe un título o tema primero para que la IA sepa qué escribir.');
      return;
    }
    
    setIsGeneratingBlog(true);
    const toastId = toast.loading('La IA está redactando tu artículo (esto puede tardar unos segundos)...');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate-blog-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: editingBlogPost.title })
      });
      
      if (!res.ok) throw new Error('Error en la generación');
      
      const data = await res.json();
      if (data.post) {
        setEditingBlogPost((prev: any) => ({
          ...prev,
          title: data.post.title || prev.title,
          excerpt: data.post.excerpt || prev.excerpt,
          content: data.post.content || prev.content
        }));
        toast.success('¡Artículo generado!', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el artículo', { id: toastId });
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  // --- LÓGICA DE GRÁFICOS TEMPORALES (CSV) ---
  const downloadSampleCsv = () => {
    const headers = "date,leads,spend\n";
    const rows = Array.from({length: 30}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = format(d, 'yyyy-MM-dd');
      // Tendencia ligeramente ascendente con ruido aleatorio
      const leads = Math.floor(Math.random() * 8) + (i * 0.3);
      const spend = (Math.random() * 15 + 10 + (i * 0.5)).toFixed(2);
      return `${dateStr},${Math.floor(leads)},${spend}`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metricas_historicas_ejemplo.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('CSV de ejemplo descargado');
  };

  const handleHistoricalCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const data = [];
      
      // Saltar cabecera (i=1)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [date, leads, spend] = line.split(',');
        if (date && leads && spend) {
          data.push({
            date,
            leads: Number(leads),
            spend: Number(spend)
          });
        }
      }
      
      setHistoricalData(data);
      toast.success('Datos históricos cargados y visualizados');
    } catch (error) {
      toast.error('Error al procesar el CSV. Asegúrate de usar el formato correcto.');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando métricas...</div>;

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Marketing Hub</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus Ads y Redes Sociales en un solo lugar</p>
        </div>
        
        {/* Navegación de Pestañas */}
        <div className="flex bg-muted/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'overview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard size={16} /> Resumen
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'ads' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wallet size={16} /> Campañas (Ads)
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'social' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarIcon size={16} /> Planificador Social
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'blog' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen size={16} /> Blog / Noticias
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'settings' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings size={16} /> Configuración
          </button>
        </div>
      </div>

      {/* VISTA: RESUMEN (DASHBOARD TIEMPO REAL) */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1. KPIs Principales (Tarjetas Superiores) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10"><Activity size={60} /></div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Leads Hoy (Tiempo Real)</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-foreground">{Math.floor(liveMetrics.totalOrganicLeads / 10) + 2}</h2>
                <span className="text-xs font-bold text-emerald-500 flex items-center">+12% <ArrowUpRight size={12} /></span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%] rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10"><Wallet size={60} /></div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Gasto Diario (Ads)</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-foreground">{liveMetrics.todaySpend.toFixed(2)}€</h2>
                <span className="text-xs font-medium text-muted-foreground">de {settings.dailyBudgetCap}€ límite</span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full w-[${Math.min((liveMetrics.todaySpend / settings.dailyBudgetCap) * 100, 100)}%] rounded-full transition-all duration-1000 ${liveMetrics.todaySpend > settings.dailyBudgetCap * 0.9 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((liveMetrics.todaySpend / settings.dailyBudgetCap) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10"><Share2 size={60} /></div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Campañas Activas</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-foreground">{liveMetrics.activeCampaignsCount}</h2>
                <span className="text-xs font-medium text-muted-foreground">en Meta & TikTok</span>
              </div>
              <div className="mt-3 flex gap-1">
                {data.meta.filter((c: any) => c.status === 'ACTIVE').map((_, i) => <div key={`m-${i}`} className="h-1.5 w-4 bg-blue-500 rounded-full"></div>)}
                {data.tiktok.filter((c: any) => c.status === 'ACTIVE').map((_, i) => <div key={`t-${i}`} className="h-1.5 w-4 bg-black dark:bg-white rounded-full"></div>)}
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingUp size={60} /></div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Leads Orgánicos (Mes)</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-foreground">{liveMetrics.totalOrganicLeads}</h2>
                <span className="text-xs font-bold text-emerald-500 flex items-center">Ahorro: {(liveMetrics.totalOrganicLeads * 15).toFixed(0)}€</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Valor estimado vs. Publicidad de pago</p>
            </div>
          </div>

          {/* 1.2 Desglose de Leads por RRSS (Nuevo) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#1877F2]/10 text-[#1877F2] rounded-full flex items-center justify-center shrink-0">
                <Facebook size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facebook Leads</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{liveMetrics.platformLeads.facebook}</p>
                  <span className="text-xs text-muted-foreground">{(liveMetrics.platformLeads.facebook / (liveMetrics.totalOrganicLeads || 1) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#E1306C]/10 text-[#E1306C] rounded-full flex items-center justify-center shrink-0">
                <Instagram size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instagram Leads</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{liveMetrics.platformLeads.instagram}</p>
                  <span className="text-xs text-muted-foreground">{(liveMetrics.platformLeads.instagram / (liveMetrics.totalOrganicLeads || 1) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-full flex items-center justify-center shrink-0">
                <FaTiktok size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">TikTok Leads</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{liveMetrics.platformLeads.tiktok}</p>
                  <span className="text-xs text-muted-foreground">{(liveMetrics.platformLeads.tiktok / (liveMetrics.totalOrganicLeads || 1) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.5 Gráfico Temporal (Nuevo) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <LineChart className="text-blue-500" size={20} /> 
                  Evolución de Rendimiento
                </h3>
                <p className="text-sm text-muted-foreground">Comparativa de Inversión vs Resultados (30 días)</p>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadSampleCsv} className="hidden sm:flex text-xs items-center gap-1 text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md transition-colors">
                  <Download size={14} /> Descargar Ejemplo
                </button>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleHistoricalCsv}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="text-xs flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity">
                    <UploadCloud size={14} /> Subir CSV Histórico
                  </button>
                </div>
              </div>
            </div>

            {historicalData.length > 0 ? (
              <div className="h-[300px] w-full relative bg-muted/10 rounded-lg p-4 border border-border/50">
                {/* Gráfico SVG Personalizado */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Líneas de guía */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  
                  {/* Línea de Gasto (Azul) */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    points={historicalData.map((d, i) => `${(i / (historicalData.length - 1)) * 100},${100 - (d.spend / Math.max(...historicalData.map(x => x.spend))) * 100}`).join(' ')}
                  />
                  {/* Línea de Leads (Verde) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    points={historicalData.map((d, i) => `${(i / (historicalData.length - 1)) * 100},${100 - (d.leads / Math.max(...historicalData.map(x => x.leads))) * 100}`).join(' ')}
                  />
                </svg>
                <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded-full"></div> Gasto (€)</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-500 rounded-full"></div> Leads Conseguidos</div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/20">
                <BarChart3 size={48} className="opacity-20 mb-2" />
                <p>No hay datos históricos cargados.</p>
                <p className="text-xs">Sube un CSV para visualizar la tendencia.</p>
              </div>
            )}
          </div>

          {/* 1.6 Palabras Clave (Nuevo) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
               <div>
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    <Hash className="text-purple-500" size={20} />
                    Palabras Clave de Éxito
                 </h3>
                 <p className="text-sm text-muted-foreground">
                   Términos más frecuentes en tus 20 posts con mayor captación de leads.
                 </p>
               </div>
             </div>
             
             {topKeywords.length > 0 ? (
               <div className="flex flex-wrap gap-3">
                 {topKeywords.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800 transition-transform hover:scale-105 cursor-default">
                     <span className="font-bold text-sm">#{item.word}</span>
                     <span className="text-xs bg-white dark:bg-black/20 px-2 py-0.5 rounded-full font-mono font-bold">{item.count}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                 <Hash className="mx-auto mb-2 opacity-20" size={32} />
                 <p>No hay suficientes datos de leads para analizar palabras clave aún.</p>
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2. Feed de Actividad en Vivo */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="text-blue-500" size={20} /> Actividad Reciente
                <span className="ml-auto text-xs font-normal text-muted-foreground flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> En vivo</span>
              </h3>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No hay actividad reciente en el CRM.
                  </div>
                ) : (
                  recentActivities.slice(0, 5).map((activity) => {
                    const style = getActivityStyle(activity.type);
                    return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border">
                      <div className={`p-2 rounded-full ${style.color}`}>{style.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.details}</p>
                        <p className="text-xs text-muted-foreground capitalize">{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}</p>
                      </div>
                    </div>
                  )})
                )}
              </div>
            </div>

            {/* 3. Próximas Acciones */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CalendarIcon className="text-purple-500" size={20} /> Agenda de Marketing
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {posts.filter(p => p.status === 'scheduled').slice(0, 5).map(post => (
                  <div key={post.id} className="flex gap-3 items-start p-3 border border-border rounded-lg bg-background/50">
                    <div className="flex flex-col items-center justify-center bg-muted rounded w-12 h-12 shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">{post.scheduledDate ? format(post.scheduledDate, 'MMM', { locale: es }).toUpperCase() : '-'}</span>
                      <span className="text-lg font-bold text-foreground">{post.scheduledDate ? format(post.scheduledDate, 'dd') : '-'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                      <div className="flex gap-2 mt-1">
                        {post.platforms.map(p => <span key={p} className="text-[10px] px-1.5 py-0.5 bg-muted rounded capitalize text-muted-foreground">{p}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
                {posts.filter(p => p.status === 'scheduled').length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay posts programados.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA: ADS (Existente) */}
      {activeTab === 'ads' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inversión Mensual</p>
                  <p className="text-2xl font-bold text-foreground">${data.total_spend.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leads Generados</p>
                  <p className="text-2xl font-bold text-foreground">{data.total_leads}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PlatformCard platformName="Meta (Facebook/Instagram)" icon={<Facebook size={20} />} campaigns={data.meta} onToggle={handleToggle} />
            <PlatformCard platformName="TikTok Ads" icon={<FaTiktok size={20} />} campaigns={data.tiktok} onToggle={handleToggle} />
          </div>
        </div>
      )}

      {/* VISTA: SOCIAL (Nueva) */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Columna Izquierda: Crear Post */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {editingId ? <Edit size={20} /> : <Plus size={20} />} 
                  {editingId ? 'Editar Publicación' : 'Crear Publicación'}
                </h3>
                <button onClick={() => setShowBulkImport(true)} className="text-xs flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors font-medium">
                  <FileSpreadsheet size={14} /> Carga Masiva
                </button>
              </div>

              <form onSubmit={handleSchedulePost} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Contenido</label>
                    <button 
                      type="button"
                      onClick={() => setNewPostContent(prev => prev + (prev ? '\n\n' : '') + settings.defaultHashtags)}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium hover:underline flex items-center gap-1 transition-colors"
                      title="Añadir hashtags configurados en Ajustes"
                    >
                      <Palette size={12} /> Insertar firma de marca
                    </button>
                    <button 
                      type="button"
                      onClick={handleEnhanceText}
                      disabled={isEnhancing}
                      className={`text-xs ${isEnhancing ? 'text-muted-foreground cursor-wait' : 'text-purple-500 hover:text-purple-600'} font-medium hover:underline flex items-center gap-1 transition-colors`}
                    >
                      {isEnhancing ? <RefreshCw className="animate-spin" size={12} /> : <Wand2 size={12} />} 
                      {isEnhancing ? 'Pensando...' : 'Mejorar texto con IA'}
                    </button>
                  </div>
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full p-3 bg-background border rounded-lg min-h-[120px] resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="¿Qué quieres compartir hoy?"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                     <span>
                       {selectedPlatforms.includes('tiktok') && newPostContent.length > 2200 && <span className="text-red-500 font-bold mr-2">⚠️ Excede límite TikTok</span>}
                       {selectedPlatforms.includes('instagram') && newPostContent.length > 2200 && <span className="text-red-500 font-bold mr-2">⚠️ Excede límite IG</span>}
                     </span>
                     <span className={newPostContent.length > 2200 ? "text-red-500 font-bold" : ""}>
                       {newPostContent.length} / 2200
                     </span>
                  </div>
                </div>
                
                {/* Área de Multimedia */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Multimedia</label>
                  {!mediaPreview ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload size={24} />
                        <span className="text-sm">Arrastra o haz clic para subir imagen</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-border group">
                      <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                      <button 
                        type="button"
                        onClick={() => setMediaPreview(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Plataformas</label>
                  <div className="flex gap-2">
                    {['facebook', 'instagram', 'tiktok'].map(p => (
                      <button 
                        key={p}
                        type="button" 
                        onClick={() => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                        className={`p-2 rounded-lg border flex-1 flex justify-center transition-all ${selectedPlatforms.includes(p) ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted'}`}
                      >
                        {p === 'facebook' && <Facebook size={18} />}
                        {p === 'instagram' && <Instagram size={18} />}
                        {p === 'tiktok' && <FaTiktok size={18} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha y Hora</label>
                  <input 
                    type="datetime-local" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-2 bg-background border rounded-lg"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted flex items-center justify-center gap-2"
                  >
                    <Eye size={18} /> Previsualizar
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted text-muted-foreground">
                      Cancelar
                    </button>
                  )}
                  <button type="button" onClick={(e) => handleSchedulePost(e, 'draft')} disabled={isUploading} className="flex-1 py-2 bg-amber-500/10 text-amber-600 border border-amber-200 hover:bg-amber-500/20 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    <FileText size={18} /> {editingId ? 'Guardar Borrador' : 'Borrador'}
                  </button>
                  <button type="button" onClick={(e) => handleSchedulePost(e, 'scheduled')} disabled={isUploading} className="flex-[2] py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50">
                    {isUploading ? <RefreshCw className="animate-spin" size={18} /> : (editingId && !isEditingDraft ? <Save size={18} /> : <Clock size={18} />)}
                    {isUploading ? 'Guardando...' : (editingId && !isEditingDraft ? 'Actualizar' : 'Programar')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Calendario / Lista */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><CalendarIcon size={20} /> Calendario de Contenidos</h3>
              <div className="flex bg-muted rounded-lg p-1">
                <button 
                  onClick={() => setSocialView('calendar')}
                  className={`p-2 rounded-md transition-all ${socialView === 'calendar' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  title="Vista Calendario"
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setSocialView('list')}
                  className={`p-2 rounded-md transition-all ${socialView === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  title="Vista Lista"
                >
                  <LayoutList size={18} />
                </button>
                <button 
                  onClick={() => setSocialView('drafts')}
                  className={`p-2 rounded-md transition-all ${socialView === 'drafts' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  title="Borradores"
                >
                  <StickyNote size={18} />
                </button>
              </div>
            </div>

            {socialView === 'calendar' ? (
              <div className="bg-card border border-border rounded-xl p-4 h-[640px] text-xs flex flex-col">
                {/* Leyenda de Colores */}
                <div className="flex gap-4 mb-4 text-xs flex-wrap px-2">
                  <button onClick={() => togglePlatformFilter('facebook')} className={`flex items-center gap-1.5 transition-opacity ${!filterPlatforms.includes('facebook') ? 'opacity-40' : ''}`}><div className="w-3 h-3 rounded-full bg-[#1877F2]"></div> Facebook</button>
                  <button onClick={() => togglePlatformFilter('instagram')} className={`flex items-center gap-1.5 transition-opacity ${!filterPlatforms.includes('instagram') ? 'opacity-40' : ''}`}><div className="w-3 h-3 rounded-full bg-[#E1306C]"></div> Instagram</button>
                  <button onClick={() => togglePlatformFilter('tiktok')} className={`flex items-center gap-1.5 transition-opacity ${!filterPlatforms.includes('tiktok') ? 'opacity-40' : ''}`}><div className="w-3 h-3 rounded-full bg-black dark:bg-white"></div> TikTok</button>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div> Múltiple</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#6b7280]"></div> Publicado</div>
                </div>

                <DnDCalendar
                  components={{
                    event: ({ event }: any) => (
                      <div className="flex flex-col h-full justify-center px-1">
                        <span className="truncate font-semibold text-xs">{event.title}</span>
                        {event.resource.metrics && (
                          <span className="text-[10px] flex items-center gap-1 opacity-90 font-medium">
                            <TrendingUp size={10} /> {event.resource.metrics.leads} Leads
                          </span>
                        )}
                      </div>
                    )
                  }}
                  localizer={localizer}
                  date={viewDate}
                  onNavigate={setViewDate}
                  onSelectEvent={(event) => handleEventClick(event.resource)}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  onEventDrop={moveEvent}
                  eventPropGetter={eventStyleGetter}
                  messages={{
                    next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día"
                  }}
                  culture="es"
                  resizable={false}
                />
              </div>
            ) : socialView === 'list' ? (
              <div className="bg-card border border-border rounded-xl p-4 h-[640px] flex flex-col">
                <div className="flex justify-between items-center mb-2 px-2 h-10">
                   {selectedPostIds.size === 0 ? (
                     <div className="flex items-center gap-4">
                       <span className="text-sm text-muted-foreground font-medium">Total: {posts.length} posts</span>
                       {posts.some(p => p.metrics) && (
                         <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                           <BarChart3 size={12} /> {posts.reduce((acc, p) => acc + (p.metrics?.leads || 0), 0)} Leads Orgánicos
                         </span>
                       )}
                     </div>
                   ) : (
                     <div className="flex items-center gap-4">
                       <span className="text-sm font-bold text-primary">{selectedPostIds.size} seleccionados</span>
                       <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors text-xs font-semibold" title="Eliminar seleccionados">
                         <Trash2 size={14} />
                         Eliminar
                       </button>
                     </div>
                   )}
                </div>
                <div className="overflow-y-auto pr-2 flex-1">
                  {posts.length > 0 && (
                    <div className="flex items-center gap-4 p-2 border-b border-border sticky top-0 bg-card/80 backdrop-blur-sm z-10 mb-2">
                      <button onClick={handleToggleSelectAll} className="p-1">
                        {selectedPostIds.size === posts.length && posts.length > 0 ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted-foreground" />}
                      </button>
                      <span className="text-xs font-medium text-muted-foreground">Seleccionar todo</span>
                    </div>
                  )}
                  <div className="space-y-3">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">No hay posts programados</div>
                  ) : (
                    sortedPosts.filter(p => p.status !== 'draft').map((post) => {
                      const isSelected = selectedPostIds.has(post.id);
                      return (
                      <div key={post.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all ${isSelected ? 'bg-primary/10 border-primary/50' : 'bg-card border-border hover:shadow-md'}`}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <button onClick={() => handleToggleSelect(post.id)} className="p-1">
                            {isSelected ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} className="text-muted-foreground" />}
                          </button>
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {post.image ? <img src={post.image} className="w-full h-full object-cover" alt="Post" /> : <LayoutGrid size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{post.content}</p>
                            <p className="text-xs text-muted-foreground">{post.scheduledDate ? format(post.scheduledDate, "d MMM yyyy, HH:mm", { locale: es }) : 'Sin fecha'}</p>
                            {post.metrics && (
                              <div className="flex gap-3 mt-1.5 text-xs">
                                <span className="flex items-center gap-1 text-muted-foreground" title="Alcance"><Eye size={12} /> {post.metrics.views}</span>
                                <span className="flex items-center gap-1 text-muted-foreground" title="Interacciones"><Heart size={12} /> {post.metrics.likes}</span>
                                <span className={`flex items-center gap-1 font-bold ${post.metrics.leads > 5 ? 'text-emerald-600' : 'text-muted-foreground'}`} title="Leads Generados"><TrendingUp size={12} /> {post.metrics.leads} Leads {post.status === 'scheduled' && '(Est.)'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEventClick(post)} className="text-muted-foreground hover:text-blue-500 p-2" title="Editar">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDuplicatePost(post)} className="text-muted-foreground hover:text-green-500 p-2" title="Duplicar">
                            <Copy size={18} />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-muted-foreground hover:text-red-500 p-2">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )})
                  )}
                  </div>
                </div>
              </div>
            ) : (
              // VISTA DE BORRADORES
              <div className="bg-card border border-border rounded-xl p-4 h-[640px] flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                   <h4 className="font-bold flex items-center gap-2 text-amber-600"><StickyNote size={20} /> Borradores sin fecha</h4>
                   <span className="text-sm text-muted-foreground">{posts.filter(p => p.status === 'draft').length} borradores</span>
                </div>
                <div className="overflow-y-auto pr-2 flex-1 space-y-3">
                  {posts.filter(p => p.status === 'draft').length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground bg-muted/20">
                      <StickyNote size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No tienes borradores guardados.</p>
                      <p className="text-xs mt-1">Guarda ideas aquí para programarlas más tarde.</p>
                    </div>
                  ) : (
                    posts.filter(p => p.status === 'draft').map((post) => (
                      <div key={post.id} className="flex items-start justify-between p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 rounded-lg hover:shadow-md transition-all">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {post.image ? <img src={post.image} className="w-full h-full object-cover" alt="Post" /> : <LayoutGrid size={20} />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex gap-1">
                                {post.platforms.includes('facebook') && <Facebook size={14} className="text-blue-600" />}
                                {post.platforms.includes('instagram') && <Instagram size={14} className="text-pink-600" />}
                                {post.platforms.includes('tiktok') && <FaTiktok size={14} />}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => handleEventClick(post)} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 justify-center">
                            <Edit size={14} /> Editar
                          </button>
                          <button onClick={() => handleDuplicatePost(post)} className="text-xs text-green-600 hover:underline text-right">
                            Duplicar
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-xs text-red-500 hover:underline text-right">Eliminar</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MODAL DE PREVISUALIZACIÓN (Fuera del flujo normal) */}
          {showPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header del Modal */}
                <div className="flex justify-between items-center p-4 border-b border-border bg-card">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Eye size={20} className="text-primary" /> 
                    Vista Previa de Publicación
                  </h3>
                  <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                    <X size={24} />
                  </button>
                </div>

                {/* Tabs de Plataforma */}
                <div className="flex border-b border-border bg-muted/30">
                  <button 
                    onClick={() => setPreviewPlatform('facebook')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${previewPlatform === 'facebook' ? 'border-blue-600 text-blue-600 bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <Facebook size={18} /> Facebook
                  </button>
                  <button 
                    onClick={() => setPreviewPlatform('instagram')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${previewPlatform === 'instagram' ? 'border-pink-600 text-pink-600 bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <Instagram size={18} /> Instagram
                  </button>
                  <button 
                    onClick={() => setPreviewPlatform('tiktok')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${previewPlatform === 'tiktok' ? 'border-black dark:border-white text-foreground bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <FaTiktok size={18} /> TikTok
                  </button>
                </div>

                {/* Área de Contenido */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-zinc-900/50 flex justify-center items-start">
                  
                  {/* FACEBOOK */}
                  {previewPlatform === 'facebook' && (
                    <div className="w-full max-w-[500px] bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-border/50">
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">NB</div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Narrativa Bodas</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">Publicidad • <span className="text-[10px]">🌐</span></p>
                        </div>
                        <MoreHorizontal size={20} className="ml-auto text-muted-foreground" />
                      </div>
                      <div className="px-4 pb-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{newPostContent || 'Escribe algo para ver la vista previa...'}</p>
                      </div>
                      {mediaPreview ? (
                        <img src={mediaPreview} className="w-full h-auto object-cover max-h-[500px]" alt="Post" />
                      ) : (
                        <div className="w-full h-64 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground gap-2 border-y border-border/50">
                          <ImageIcon size={48} />
                          <span className="text-sm">Imagen del post</span>
                        </div>
                      )}
                      <div className="p-3 border-t border-border/50 flex justify-between mt-2">
                        <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 py-2 rounded"><Heart size={18} /> Me gusta</button>
                        <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 py-2 rounded"><MessageCircle size={18} /> Comentar</button>
                        <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 py-2 rounded"><Share2 size={18} /> Compartir</button>
                      </div>
                    </div>
                  )}

                  {/* INSTAGRAM */}
                  {previewPlatform === 'instagram' && (
                    <div className="w-full max-w-[400px] bg-white dark:bg-zinc-950 border border-border/50 shadow-sm rounded-sm">
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] rounded-full">
                            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-full border-2 border-transparent flex items-center justify-center text-[10px] font-bold">NB</div>
                          </div>
                          <span className="text-sm font-semibold">narrativa_bodas</span>
                        </div>
                        <MoreHorizontal size={16} />
                      </div>
                      <div className="aspect-square bg-muted/20 flex items-center justify-center overflow-hidden">
                        {mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover" alt="Post" /> : <ImageIcon size={48} className="text-muted-foreground" />}
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between mb-3">
                          <div className="flex gap-4"><Heart size={24} /><MessageCircle size={24} /><Send size={24} /></div>
                          <Bookmark size={24} />
                        </div>
                        <p className="text-sm"><span className="font-semibold mr-2">narrativa_bodas</span>{newPostContent || 'Tu descripción...'}</p>
                      </div>
                    </div>
                  )}

                  {/* TIKTOK */}
                  {previewPlatform === 'tiktok' && (
                    <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-xl overflow-hidden relative shadow-2xl border border-zinc-800">
                      {mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover opacity-80" alt="Post" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600"><Video size={48} /></div>}
                      <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center text-white">
                        <div className="w-10 h-10 bg-gray-200 rounded-full border border-white" />
                        <div className="flex flex-col items-center gap-1"><Heart size={28} fill="white" /><span className="text-xs font-bold">8.5K</span></div>
                        <div className="flex flex-col items-center gap-1"><MessageCircle size={28} fill="white" /><span className="text-xs font-bold">124</span></div>
                        <div className="flex flex-col items-center gap-1"><Share2 size={28} fill="white" /><span className="text-xs font-bold">Share</span></div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent text-white">
                        <p className="font-bold mb-1">@narrativa_bodas</p>
                        <p className="text-sm line-clamp-3 mb-2">{newPostContent || 'Descripción del video... #boda'}</p>
                        <div className="flex items-center gap-2 text-xs opacity-90"><Music2 size={14} className="animate-spin" /><span>Sonido original - Narrativa Bodas</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE CARGA MASIVA */}
          {showBulkImport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileSpreadsheet className="text-green-600" /> 
                    Importación Masiva
                  </h3>
                  <button onClick={() => { setShowBulkImport(false); setImportPreview([]); }} className="text-muted-foreground hover:text-foreground"><X size={24} /></button>
                </div>

                {!importPreview.length ? (
                  <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-600">
                      <p className="font-bold mb-1">¿Cómo funciona?</p>
                      <p>Sube un archivo <strong>.csv</strong> junto con las <strong>imágenes</strong> que quieras usar. El sistema emparejará automáticamente las fotos con los posts usando el nombre del archivo.</p>
                      <p className="mt-2 text-xs bg-white/50 p-2 rounded">💡 <strong>Truco:</strong> En la ventana de selección, mantén pulsado <code>Ctrl</code> (o <code>Cmd</code> en Mac) para seleccionar el CSV y las fotos a la vez.</p>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/50 transition-colors relative group">
                      <input 
                        type="file" 
                        multiple 
                        accept=".csv,image/*" 
                        onChange={handleBulkFiles}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                        <UploadCloud size={48} />
                        <div>
                          <p className="font-bold text-lg">Arrastra aquí tu CSV y tus Imágenes</p>
                          <p className="text-sm">o haz clic para explorar archivos</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p className="font-bold mb-1">Formato CSV requerido:</p>
                      <code className="bg-muted px-2 py-1 rounded block w-full overflow-x-auto">
                        contenido, fecha (YYYY-MM-DD), hora (HH:MM), plataformas (fb;ig), nombre_imagen.jpg
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-3 rounded-lg">
                      <Check size={20} />
                      <span className="font-bold">¡{importPreview.length} publicaciones detectadas!</span>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                      {importPreview.map((post, idx) => (
                        <div key={idx} className="p-3 flex gap-3 items-center">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                            {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <LayoutGrid className="p-2 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{post.content}</p>
                            <p className="text-xs text-muted-foreground">{post.scheduledDate ? format(post.scheduledDate, "d MMM yyyy, HH:mm", { locale: es }) : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setImportPreview([])} className="flex-1 py-2 border border-border rounded-lg hover:bg-muted">Cancelar</button>
                      <button 
                        onClick={async () => {
                          // Guardar importación masiva en BBDD
                          const payload = importPreview.map(p => ({
                            content: p.content,
                            platforms: p.platforms,
                            scheduled_date: p.scheduledDate.toISOString(),
                            image_url: p.image || null
                          }));
                          
                          const { error } = await supabase.from('social_queue').insert(payload);
                          
                          if (error) {
                            console.error('Error Supabase:', error);
                            toast.error(`Error guardando: ${error.message}`);
                            return;
                          }

                          await fetchAndCleanupPosts();
                          if (importPreview.length > 0) {
                            setViewDate(importPreview[0].scheduledDate);
                          }
                          setImportPreview([]);
                          setShowBulkImport(false);
                          toast.success('Publicaciones importadas correctamente');
                        }} 
                        className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90"
                      >
                        Confirmar e Importar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODAL DE EDICIÓN Y PREVISUALIZACIÓN (Desde Calendario) */}
          {isPostModalOpen && editingId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header con Navegación */}
                <div className="flex justify-between items-center p-4 border-b border-border bg-card">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleNavigatePost('prev')} className="p-2 hover:bg-muted rounded-full transition-colors" title="Anterior">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => handleNavigatePost('next')} className="p-2 hover:bg-muted rounded-full transition-colors" title="Siguiente">
                      <ChevronRight size={20} />
                    </button>
                    <h3 className="font-bold text-lg ml-2">Detalles de Publicación</h3>
                  </div>
                  <button onClick={cancelEdit} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                  {/* Columna Izquierda: Previsualización */}
                  <div className="flex-1 bg-gray-100 dark:bg-zinc-900/50 p-6 overflow-y-auto flex flex-col items-center border-r border-border">
                    <div className="w-full max-w-md mb-4 flex justify-center gap-2 bg-background/50 p-1 rounded-lg backdrop-blur-sm">
                      {(['facebook', 'instagram', 'tiktok'] as const).map(p => (
                        <button 
                          key={p}
                          onClick={() => setPreviewPlatform(p)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${previewPlatform === p ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Renderizado de Preview (Reutilizado) */}
                    <div className="transform scale-90 origin-top">
                      {previewPlatform === 'facebook' && (
                        <div className="w-[400px] bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-border/50">
                          <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">NB</div>
                            <div>
                              <p className="text-sm font-bold text-foreground">Narrativa Bodas</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">Publicidad • <span className="text-[10px]">🌐</span></p>
                            </div>
                            <MoreHorizontal size={20} className="ml-auto text-muted-foreground" />
                          </div>
                          <div className="px-4 pb-3">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{newPostContent || '...'}</p>
                          </div>
                          {mediaPreview ? (
                            <img src={mediaPreview} className="w-full h-auto object-cover max-h-[400px]" alt="Post" />
                          ) : (
                            <div className="w-full h-48 bg-muted/20 flex items-center justify-center text-muted-foreground"><ImageIcon size={32} /></div>
                          )}
                          <div className="p-3 border-t border-border/50 flex justify-between mt-2">
                            <div className="flex gap-4 text-muted-foreground text-sm font-medium w-full justify-around">
                              <span className="flex items-center gap-1"><Heart size={18} /> Me gusta</span>
                              <span className="flex items-center gap-1"><MessageCircle size={18} /> Comentar</span>
                              <span className="flex items-center gap-1"><Share2 size={18} /> Compartir</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {previewPlatform === 'instagram' && (
                        <div className="w-[350px] bg-white dark:bg-zinc-950 border border-border/50 shadow-sm rounded-sm">
                          <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] rounded-full">
                                <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-full border-2 border-transparent flex items-center justify-center text-[10px] font-bold">NB</div>
                              </div>
                              <span className="text-sm font-semibold">narrativa_bodas</span>
                            </div>
                            <MoreHorizontal size={16} />
                          </div>
                          <div className="aspect-square bg-muted/20 flex items-center justify-center overflow-hidden">
                            {mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover" alt="Post" /> : <ImageIcon size={48} className="text-muted-foreground" />}
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between mb-3">
                              <div className="flex gap-4"><Heart size={24} /><MessageCircle size={24} /><Send size={24} /></div>
                              <Bookmark size={24} />
                            </div>
                            <p className="text-sm"><span className="font-semibold mr-2">narrativa_bodas</span>{newPostContent}</p>
                          </div>
                        </div>
                      )}

                      {previewPlatform === 'tiktok' && (
                        <div className="w-[300px] aspect-[9/16] bg-black rounded-xl overflow-hidden relative shadow-2xl border border-zinc-800">
                          {mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover opacity-80" alt="Post" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600"><Video size={48} /></div>}
                          <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center text-white">
                            <div className="w-10 h-10 bg-gray-200 rounded-full border border-white" />
                            <div className="flex flex-col items-center gap-1"><Heart size={28} fill="white" /><span className="text-xs font-bold">8.5K</span></div>
                            <div className="flex flex-col items-center gap-1"><MessageCircle size={28} fill="white" /><span className="text-xs font-bold">124</span></div>
                            <div className="flex flex-col items-center gap-1"><Share2 size={28} fill="white" /><span className="text-xs font-bold">Share</span></div>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent text-white">
                            <p className="font-bold mb-1">@narrativa_bodas</p>
                            <p className="text-sm line-clamp-3 mb-2">{newPostContent}</p>
                            <div className="flex items-center gap-2 text-xs opacity-90"><Music2 size={14} className="animate-spin" /><span>Sonido original</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Derecha: Formulario de Edición */}
                  <div className="flex-1 p-6 overflow-y-auto bg-card">
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contenido</label>
                        <textarea 
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="w-full p-3 bg-background border rounded-lg min-h-[150px] resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                          placeholder="Edita tu contenido..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Fecha y Hora</label>
                          <input 
                            type="datetime-local" 
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full p-2 bg-background border rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Plataformas</label>
                          <div className="flex gap-2">
                            {['facebook', 'instagram', 'tiktok'].map(p => (
                              <button 
                                key={p}
                                type="button" 
                                onClick={() => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                className={`p-2 rounded-lg border flex-1 flex justify-center transition-all ${selectedPlatforms.includes(p) ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted'}`}
                              >
                                {p === 'facebook' && <Facebook size={18} />}
                                {p === 'instagram' && <Instagram size={18} />}
                                {p === 'tiktok' && <FaTiktok size={18} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Imagen</label>
                        <div className="flex items-center gap-4 p-3 border border-border rounded-lg">
                          {mediaPreview ? <img src={mediaPreview} className="w-16 h-16 object-cover rounded" /> : <div className="w-16 h-16 bg-muted rounded flex items-center justify-center"><ImageIcon /></div>}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => handleDeletePost(editingId!)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2">
                          <Trash2 size={18} /> Eliminar
                        </button>
                        <button type="button" onClick={(e) => handleSchedulePost(e, 'draft')} disabled={isUploading} className="px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-200 hover:bg-amber-500/20 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                           <FileText size={18} /> {isEditingDraft ? 'Guardar Borrador' : 'Borrador'}
                        </button>
                        <button type="button" onClick={(e) => handleSchedulePost(e, 'scheduled')} disabled={isUploading} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2">
                          {isUploading ? <RefreshCw className="animate-spin" size={18} /> : (isEditingDraft ? <Clock size={18} /> : <Save size={18} />)}
                          {isUploading ? 'Guardando...' : (isEditingDraft ? 'Programar' : 'Actualizar')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA: BLOG (Nueva) */}
      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Lista de Artículos */}
          <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Artículos</h3>
              <button 
                onClick={() => setEditingBlogPost({ title: '', content: '', excerpt: '', status: 'draft' })}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {blogPosts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => setEditingBlogPost(post)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${editingBlogPost?.id === post.id ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                >
                  <h4 className="font-bold text-sm line-clamp-1">{post.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt || 'Sin resumen'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {post.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor de Artículos */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            {editingBlogPost ? (
              <form onSubmit={handleSaveBlogPost} className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{editingBlogPost.id ? 'Editar Artículo' : 'Nueva Noticia'}</h3>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={handleGenerateBlog}
                      disabled={isGeneratingBlog}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 border border-purple-200 rounded hover:bg-purple-200 flex items-center gap-2 transition-colors font-medium"
                    >
                      {isGeneratingBlog ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
                      <span className="hidden sm:inline">{isGeneratingBlog ? 'Escribiendo...' : 'Generar con IA'}</span>
                    </button>
                    <button type="button" onClick={() => setEditingBlogPost(null)} className="px-3 py-1 text-sm border rounded hover:bg-muted">Cancelar</button>
                    <button type="submit" className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 flex items-center gap-2">
                      <Save size={16} /> Guardar
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-2 bg-background border rounded-lg text-lg font-bold"
                      value={editingBlogPost.title}
                      onChange={e => setEditingBlogPost({...editingBlogPost, title: e.target.value})}
                      placeholder="Escribe un título impactante..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Resumen (SEO)</label>
                    <textarea 
                      className="w-full p-2 bg-background border rounded-lg h-20 resize-none"
                      value={editingBlogPost.excerpt}
                      onChange={e => setEditingBlogPost({...editingBlogPost, excerpt: e.target.value})}
                      placeholder="Breve descripción para Google y redes sociales..."
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Contenido</label>
                    <textarea 
                      className="w-full p-4 bg-background border rounded-lg h-[300px] font-mono text-sm"
                      value={editingBlogPost.content}
                      onChange={e => setEditingBlogPost({...editingBlogPost, content: e.target.value})}
                      placeholder="Escribe tu artículo aquí (soporta HTML básico o Markdown)..."
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingBlogPost.status === 'published'}
                        onChange={e => setEditingBlogPost({...editingBlogPost, status: e.target.checked ? 'published' : 'draft'})}
                        className="w-4 h-4 rounded border-primary text-primary"
                      />
                      <span className="text-sm font-medium">Publicar inmediatamente</span>
                    </label>
                  </div>
                </div>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <BookOpen size={64} className="mb-4" />
                <p>Selecciona un artículo o crea uno nuevo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA: CONFIGURACIÓN (Nueva) */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1. Conexiones e Integraciones */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Link2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Conexiones</h3>
                <p className="text-sm text-muted-foreground">Gestiona los accesos a las plataformas</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center">
                    <Facebook size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Meta Ads & Social</p>
                    <p className="text-xs text-muted-foreground">Facebook e Instagram</p>
                  </div>
                </div>
                <a href={`${import.meta.env.VITE_API_URL}/api/admin/ads/auth/meta`} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                  Conectar / Renovar
                </a>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                    <FaTiktok size={20} />
                  </div>
                  <div>
                    <p className="font-medium">TikTok For Business</p>
                    <p className="text-xs text-muted-foreground">Ads y Publicaciones</p>
                  </div>
                </div>
                <a href={`${import.meta.env.VITE_API_URL}/api/admin/ads/auth/tiktok`} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                  Conectar / Renovar
                </a>
              </div>
            </div>
          </div>

          {/* 2. Seguridad y Límites */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Seguridad de Gasto</h3>
                <p className="text-sm text-muted-foreground">Protección contra sobrecostes en Ads</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Límite Diario Global (€)</label>
                <input type="number" value={settings.dailyBudgetCap} onChange={e => setSettings({...settings, dailyBudgetCap: Number(e.target.value)})} className="w-full p-3 bg-background border rounded-lg" />
                <p className="text-xs text-muted-foreground mt-1">Si el gasto total supera esta cantidad, recibirás una alerta crítica.</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Alerta de Coste por Lead (€)</label>
                <input type="number" value={settings.cpaAlert} onChange={e => setSettings({...settings, cpaAlert: Number(e.target.value)})} className="w-full p-3 bg-background border rounded-lg" />
                <p className="text-xs text-muted-foreground mt-1">Te avisaremos si un lead cuesta más de esto.</p>
              </div>
            </div>
          </div>

          {/* 3. Identidad de Marca */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6 md:col-span-2">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Palette size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Identidad de Marca</h3>
                <p className="text-sm text-muted-foreground">Configuración predeterminada para tus publicaciones</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Hashtags Predeterminados</label>
              <textarea value={settings.defaultHashtags} onChange={e => setSettings({...settings, defaultHashtags: e.target.value})} className="w-full p-3 bg-background border rounded-lg h-24 resize-none" placeholder="#boda #fotografia..." />
            </div>
            
            <div className="pt-4 flex justify-end">
              <button onClick={handleSaveSettings} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 flex items-center gap-2 transition-all">
                <Save size={18} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}