/**
 * App Component
 * 
 * Design: Minimalismo Contemporáneo Oscuro
 * Tema: Dark (fondo negro profundo, acentos dorados)
 * Fuentes: Playfair Display (títulos) + Inter (cuerpo)
 */

import { Toaster } from "@/components/ui/sonner";
import { Route, Switch } from 'wouter';
import "../index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Layout } from "./Layout";
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import PrivateGallery from './pages/PrivateGallery';
import PublicBlog from "./pages/PublicBlog";
import PublicContract from './pages/PublicContract';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminGallery from './pages/AdminGallery';
import AdminAgenda from './pages/AdminAgenda';
import AdminCrm from './pages/AdminCrm';
import AdminPipeline from './pages/AdminPipeline';
import AdminTasks from './pages/AdminTasks';
import AdminCrmHub from './pages/AdminCrmHub';
import AdminTaskRules from './pages/AdminTaskRules';
import AdminUsers from './pages/AdminUsers';
import AdminContracting from './pages/AdminContracting';
import AdminAds from './pages/AdminAds';

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/servicios" component={Services} />
      <Route path="/contacto" component={Contact} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/gallery" component={AdminGallery} />
      <Route path="/admin/agenda" component={AdminAgenda} />
      <Route path="/admin/crm" component={AdminCrm} />
      <Route path="/admin/crm-hub" component={AdminCrmHub} />
      <Route path="/admin/pipeline" component={AdminPipeline} />
      <Route path="/admin/ads" component={AdminAds} />
      <Route path="/admin/contracting" component={AdminContracting} />
      <Route path="/admin/tasks" component={AdminTasks} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/rules" component={AdminTaskRules} />

      {/* Specific Routes */}
      <Route path="/contract/:token" component={PublicContract} />
      <Route path="/gallery/:token" component={PrivateGallery} />
      
      {/* 404 & Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // 1. Lógica de Subdominio: Detectar si estamos en 'news.'
  const isNewsSubdomain = window.location.hostname.startsWith('news.');

  // 2. Si es el subdominio de noticias, renderizamos SOLO el Blog
  if (isNewsSubdomain) {
    return <PublicBlog />;
  }

  // 3. Si no, renderizamos la aplicación normal
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Toaster />
        <Layout>
          <Router />
        </Layout>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
