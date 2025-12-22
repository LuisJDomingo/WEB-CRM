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
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import PrivateGallery from './pages/PrivateGallery';
import AdminGallery from './pages/AdminGallery';
import AdminAgenda from './pages/AdminAgenda';
import AdminDashboard from './pages/AdminDashboard';
import AdminCrm from './pages/AdminCrm';
import AdminPipeline from './pages/AdminPipeline'; // Importar la nueva página
import AdminTasks from './pages/AdminTasks';
import AdminCrmHub from './pages/AdminCrmHub';
import AdminTaskRules from './pages/AdminTaskRules';
import AdminUsers from './pages/AdminUsers';
import { AuthProvider } from './contexts/AuthContext';

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/portfolio"} component={Portfolio} />
      <Route path={"/servicios"} component={Services} />
      <Route path={"/contacto"} component={Contact} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/gallery"} component={AdminGallery} />
      <Route path={"/admin/agenda"} component={AdminAgenda} />
      <Route path={"/admin/crm"} component={AdminCrm} />
      <Route path={"/admin/crm-hub"} component={AdminCrmHub} />
      <Route path={"/admin/pipeline"} component={AdminPipeline} /> {/* Añadir la nueva ruta */}
      <Route path={"/gallery/:token"} component={PrivateGallery} />
      <Route path={"/404"} component={NotFound} />
      <Route path="/admin/tasks" component={AdminTasks} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/rules" component={AdminTaskRules} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
