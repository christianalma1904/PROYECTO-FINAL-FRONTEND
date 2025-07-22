import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex align-items-center gap-2 ms-3">
      <span className="text-muted small">
        Bienvenido, <strong>{user?.name || user?.email}</strong>
      </span>
      <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
