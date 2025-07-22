import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">Nutri Plans</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/planes">Planes</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dietas">Dietas</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/seguimiento">Seguimiento</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/pacientes">Pacientes</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/nutricionistas">Nutricionistas</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/pagos">Pagos</Link>
                </li>
                <li className="nav-item">
                  <UserMenu />
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Iniciar sesión</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Registrarse</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
