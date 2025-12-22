/**
 * ErrorBoundary Component
 * 
 * Componente para capturar errores en React
 */

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d0d0d',
          color: '#f2f2f2',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '20px', fontWeight: 'bold' }}>
              Algo salió mal
            </h1>
            <p style={{ marginBottom: '20px', color: '#b3b3b3', fontSize: '16px' }}>
              Disculpa, hemos encontrado un error. Por favor, intenta nuevamente.
            </p>
            <details style={{ marginBottom: '20px', textAlign: 'left', backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '4px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Detalles del error</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '12px' }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#d4af37',
                color: '#0d0d0d',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
