/**
 * Layout Component - Provides a consistent page structure with Header and Footer.
 */
import React from 'react';
import { Link, useLocation } from 'wouter';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { useAuth } from './contexts/AuthContext';
import { LogOut, LogIn } from 'lucide-react';
import FloatingBookingAgent from './components/BookingAgent'; // <-- importamos el chat

interface LayoutProps {
  children: React.ReactNode;
}

// Usamos Tailwind CSS para el fondo y el color del texto por defecto
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const isAdmin = location.startsWith('/admin');
  const isGallery = location.startsWith('/gallery/');

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 h-24 border-b border-border bg-card z-50 flex items-center justify-between px-4 sm:px-8 shadow-sm transition-all">
          <Link href="/admin" className="flex items-center gap-3 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div
                className="h-16 w-64 md:w-72 bg-foreground group-hover:bg-primary transition-colors"
                style={{
                  maskImage: 'url(/images/Narrativa_de_bodas-removebg-preview.png)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'left center',
                }}
              />
              <span className="text-xl font-bold text-foreground tracking-wide group-hover:text-primary transition-colors hidden md:inline">
                Panel de Control
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role || 'Trabajador'}</p>
                </div>
                <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm">
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm font-medium">
                <LogIn size={16} />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </header>
        <main className="pt-24">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navigation />
      <main className={`flex-grow ${isGallery ? 'pt-0' : 'pt-32'}`}>
        {children}
      </main>
      <Footer className={isGallery ? 'mt-0' : undefined} />
      <FloatingBookingAgent businessId="demo" />
    </div>
  );
};
