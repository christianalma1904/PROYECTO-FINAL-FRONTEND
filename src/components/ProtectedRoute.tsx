import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Opcional: puedes pasar ["admin"], ["user"], etc.
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles y el usuario no pertenece a uno de ellos
  if (roles && user && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  // Si pasa la validación, renderiza el contenido
  return <>{children}</>;
}
