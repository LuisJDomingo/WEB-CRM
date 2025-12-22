import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./index.css";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { Layout } from "./Layout"; // 1. Importa el Layout
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/portfolio"} component={Portfolio} />
      <Route path={"/servicios"} component={Services} />
      <Route path={"/contacto"} component={Contact} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * App Component
 * 
 * Design: Minimalismo Contemporáneo Oscuro
 * Tema: Dark (fondo negro profundo, acentos dorados)
 * Fuentes: Playfair Display (títulos) + Inter (cuerpo)
 */
function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Layout> {/* 2. Usa Layout para envolver el Router */}
          <Router />
        </Layout>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
