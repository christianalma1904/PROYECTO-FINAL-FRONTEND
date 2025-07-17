import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Tipado del token decodificado
interface DecodedJWT {
  sub: number;
  role: string;
  exp: number;
  email?: string;
  name?: string;
  [key: string]: any;
}

// Usuario que se guarda en el contexto y localStorage
interface User {
  id: string;
  rol: string;
  email: string;
  name?: string;
}

// Estructura del contexto
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
      localStorage.removeItem('user');
      return null;
    }
  });

  const handleLogin = (accessToken: string) => {
    try {
      const decoded: DecodedJWT = jwtDecode(accessToken);

      // Validación de expiración del token antes de guardar
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Intento de login con token expirado.");
        handleLogout();
        return;
      }

      const userData: User = {
        id: String(decoded.sub),
        rol: decoded.role,
        email: decoded.email || '',
        name: decoded.name
      };

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
    } catch (error) {
      console.error("Error al decodificar el token JWT durante el login:", error);
      handleLogout();
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
        const decoded: DecodedJWT = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expirado, cerrando sesión.");
          handleLogout();
        } else {
          if (!user || !user.id) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } else {
              const userData: User = {
                id: String(decoded.sub),
                rol: decoded.role,
                email: decoded.email || '',
                name: decoded.name
              };
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
        }
      } catch (error) {
        console.error("Error al validar token en useEffect:", error);
        handleLogout();
      }
    } else if (user) {
      handleLogout(); // Inconsistencia: hay user pero no token
    }
  }, [token, user]);

  const contextValue: AuthContextType = {
    user,
    token,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!token && !!user
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
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
