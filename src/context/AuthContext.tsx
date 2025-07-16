// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Interfaz para el usuario que se guardará en el contexto y localStorage
interface User {
  id: string;
  rol: string;
  email: string;
  name?: string; // Opcional, si tu token o backend lo provee
}

// Interfaz para la información que proveerá el contexto de autenticación
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (accessToken: string, userData: User) => void; // <--- MODIFICADO: ahora recibe el objeto User completo
  logout: () => void;
  isAuthenticated: boolean; // Utilidad para saber si hay usuario logueado
}

// Crea el contexto con un valor inicial indefinido
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Componente Proveedor de Autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estado para el token y el usuario, inicializados desde localStorage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Función para manejar el login
  const handleLogin = (accessToken: string, userData: User) => { // <--- MODIFICADO
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Efecto para verificar el token al cargar la aplicación (ej. si el usuario cierra y abre la pestaña)
  useEffect(() => {
    if (token) {
      try {
        const decoded: { exp: number; [key: string]: any } = jwtDecode(token);
        // Verifica si el token ha expirado
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expirado, cerrando sesión.");
          handleLogout();
        } else {
          // Si el token es válido, asegúrate de que el user también esté en el estado
          if (!user) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            } else {
              // Si no hay user en localStorage pero sí token, intenta decodificarlo para obtener el rol/id/email
              // Esto es un fallback, idealmente `handleLogin` ya setea `user`
              const decodedForUser: { sub: number; role: string; email?: string; [key: string]: any } = jwtDecode(token);
              setUser({ id: String(decodedForUser.sub), rol: decodedForUser.role, email: decodedForUser.email || '' });
            }
          }
        }
      } catch (error) {
        console.error("Error al validar token en useEffect de AuthContext:", error);
        handleLogout(); // Si el token no es válido, cierra sesión
      }
    }
  }, [token, user]); // Dependencias: token y user (para re-validar si cambian)

  // El valor que se proveerá a los componentes que usen este contexto
  const contextValue: AuthContextType = {
    user,
    token,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!token && !!user, // Es auténticado si hay token y user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};