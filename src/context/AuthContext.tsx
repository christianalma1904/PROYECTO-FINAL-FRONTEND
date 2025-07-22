// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode
} from "react";
import { jwtDecode } from "jwt-decode";

// Tipado del token decodificado
interface DecodedJWT {
  sub: string | number;
  role: string;
  exp: number;
  email?: string;
  name?: string;
  [key: string]: any;
}

// Usuario dentro del sistema
interface User {
  id: string;
  rol: string;
  email: string;
  name?: string;
}

// Tipo del contexto
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const decodeToken = (accessToken: string): User | null => {
    try {
      const decoded: DecodedJWT = jwtDecode(accessToken);
      if (decoded.exp * 1000 < Date.now()) return null;

      return {
        id: String(decoded.sub),
        rol: decoded.role,
        email: decoded.email || "",
        name: decoded.name,
      };
    } catch (err) {
      console.error("Token inválido:", err);
      return null;
    }
  };

  const login = (accessToken: string) => {
    const userData = decodeToken(accessToken);
    if (!userData) {
      logout();
      return;
    }

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      const userDecoded = decodeToken(token);
      if (userDecoded) {
        if (!user) {
          setUser(userDecoded);
          localStorage.setItem("user", JSON.stringify(userDecoded));
        }
      } else {
        logout();
      }
    } else if (user) {
      logout(); // Hay user pero no token => inconsistencia
    }
  }, [token]);

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};
