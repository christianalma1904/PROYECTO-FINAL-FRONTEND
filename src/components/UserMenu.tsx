import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  if (!isAuthenticated) return null;

  return (
    <div className="d-flex align-items-center gap-3">
      <span className="text-muted">
        Bienvenido, <strong>{user?.name || user?.email}</strong>
      </span>
      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
