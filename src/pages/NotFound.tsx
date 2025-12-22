/**
 * NotFound Page (404)
 * 
 * Design: Minimalismo Contemporáneo Oscuro
 * Propósito: Página de error 404
 */

import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="container text-center max-w-2xl flex flex-col items-center justify-center min-h-[60vh]">
        <div className="number-marker text-center mb-8">404</div>

        <h1 className="section-title mb-4">Página no encontrada</h1>
        <p className="section-subtitle mb-12">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <Link href="/" className="cta-button-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Volver al Inicio
        </Link>
      </div>
    </Layout>
  );
}