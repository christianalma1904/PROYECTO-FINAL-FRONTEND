// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Interfaz para el usuario que se guardará en el contexto y localStorage
interface User {
  id: string;
  rol: string;
  email: string;
  name?: string; // Opcional, si tu token lo provee (o si lo obtienes de otra API call)
}

// Interfaz para la información que proveerá el contexto de autenticación
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (accessToken: string) => void; 
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error al parsear usuario de localStorage:", e);
      localStorage.removeItem('user'); // Limpia el valor inválido
      return null;
    }
  });

  const handleLogin = (accessToken: string) => {
    localStorage.setItem('token', accessToken);
    setToken(accessToken);

    try {
      const decoded: { sub: number; role: string; email?: string; name?: string; [key: string]: any } = jwtDecode(accessToken);
      const userData: User = {
        id: String(decoded.sub), 
        rol: decoded.role,     
        email: decoded.email || '', 
        name: decoded.name 
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error al decodificar el token JWT durante el login:", error);
      handleLogout(); // Limpia todo si el token no es válido
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded: { exp: number; sub: number; role: string; email?: string; name?: string; [key: string]: any } = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expirado, cerrando sesión.");
          handleLogout();
        } else {
          // Si el token es válido pero el user no está en estado o es nulo/inválido
          if (!user || !user.id) { // Añadimos una comprobación básica para el objeto user
            try {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
              } else {
                // Si no hay user en localStorage, decodificar del token
                const userData: User = {
                  id: String(decoded.sub),
                  rol: decoded.role,
                  email: decoded.email || '',
                  name: decoded.name
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData)); 
              }
            } catch (e) {
              console.error("Error al re-parsear usuario de localStorage en useEffect:", e);
              handleLogout(); // Limpia todo si hay un problema al leer el usuario
            }
          }
        }
      } catch (error) {
        console.error("Error al validar token en useEffect de AuthContext:", error);
        handleLogout();
      }
    } else if (user) { 
        handleLogout(); // Si no hay token pero sí hay user, es una inconsistencia, cerrar sesión
    }
  }, [token, user]); 

  const contextValue: AuthContextType = {
    user,
    token,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!token && !!user, 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};