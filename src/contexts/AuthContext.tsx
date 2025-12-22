import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

// Define la forma del objeto de usuario y el contexto
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Crea el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// El componente proveedor
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setLocation] = useLocation();

  // Al montar el componente, comprueba si existe una sesión en localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      // Validación básica de formato JWT (debe tener 3 partes separadas por puntos)
      const isValidToken = storedToken && 
                          storedToken !== 'undefined' && 
                          storedToken !== 'null' &&
                          storedToken.split('.').length === 3;

      if (isValidToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        // Limpia datos inválidos del almacenamiento
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    } catch (error) {
      console.error("Error al cargar el estado de autenticación desde localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de login
  const login = async (email: string, password: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    if (data.success && data.token && data.worker) {
      // Validación de seguridad antes de guardar
      if (!data.token.includes('.')) {
        console.error("❌ El servidor devolvió un token inválido:", data.token);
        throw new Error('Error de seguridad: Token inválido recibido del servidor');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.worker));
      setToken(data.token);
      setUser(data.worker);
      setIsAuthenticated(true);
    } else {
      throw new Error('Respuesta de login inválida desde el servidor.');
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLocation('/admin');
  };

  const value = { isAuthenticated, user, token, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};