import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al dar click o tap fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper para cerrar el menú y navegar
  const goTo = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="user-menu-nutri ms-3" ref={menuRef}>
      <button
        className="d-flex align-items-center gap-2 user-menu-toggle"
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          minWidth: 0
        }}
        aria-haspopup="true"
        aria-expanded={open}
        title="Abrir menú de usuario"
      >
        <div className="user-avatar-nutri">
          {user?.name
            ? user.name[0].toUpperCase()
            : user?.email
            ? user.email[0].toUpperCase()
            : "👤"}
        </div>
        <span className="text-success small fw-semibold user-menu-name">
          {user?.name || user?.email}
        </span>
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ marginLeft: 2 }}>
          <polyline points="5,8 10,13 15,8" fill="none" stroke="#38b000" strokeWidth="2" />
        </svg>
      </button>

      <div className={`user-dropdown-nutri shadow ${open ? "open" : ""}`}>
        <div className="px-3 py-2 border-bottom text-muted small user-dropdown-header">
          {user?.name || user?.email}
        </div>
        {/* LINKS DE PERFIL Y CONFIGURACIÓN */}
        <button
          className="dropdown-item user-dropdown-link"
          onClick={() => goTo('/perfil')}
        >
          <span style={{ fontSize: 17, marginRight: 7, color: "#38b000" }}>👤</span>
          Perfil
        </button>
        <button
          className="dropdown-item user-dropdown-link"
          onClick={() => goTo('/configuracion')}
        >
          <span style={{ fontSize: 17, marginRight: 7, color: "#27ae60" }}>⚙️</span>
          Configuración
        </button>
        <div className="dropdown-divider" style={{ borderColor: "#e6fff2" }}></div>
        <button className="btn btn-sm btn-outline-danger user-menu-logout w-100 px-2 my-2"
          onClick={() => { handleLogout(); setOpen(false); }}>
          <span style={{ fontSize: 17, verticalAlign: 'middle', marginRight: 4 }}>🔓</span>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
