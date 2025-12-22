import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Users, 
  Image, 
  Calendar,
  CheckSquare,
  Settings,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

function DashboardContent() {
  const menuItems = [
    {
      title: 'CRM Suite',
      description: 'Clientes y Pipeline',
      icon: <Users size={32} />,
      href: '/admin/crm-hub',
      color: 'bg-blue-500/10 text-blue-500',
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
            <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
            <p className="text-muted-foreground">Bienvenido a tu espacio de gestión</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
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
