// src/components/Navbar.tsx
import React, { useEffect, useState } from 'react'; // Asegúrate de importar React y los hooks
import { Link, useNavigate } from 'react-router-dom';

// Define la interfaz para el objeto 'user' que esperas de localStorage
interface UserData {
  id: string;
  rol: string;
  name?: string; // Propiedad opcional si tu API devuelve 'name'
  username?: string; // O 'username', ajusta según lo que uses para el nombre de usuario
  email: string;
  // Añade cualquier otra propiedad relevante que tu objeto 'user' tenga
}

export default function Navbar() {
  const navigate = useNavigate();
  // Usamos estados para que el Navbar se actualice cuando cambie el login/logout
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Manejo seguro del token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Convierte a booleano: true si hay token, false si es null/undefined

    // Manejo seguro del objeto user
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const parsedUser: UserData = JSON.parse(userString); // Tipamos el resultado del parseo
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Error al analizar los datos de usuario desde localStorage en Navbar:", e);
        localStorage.removeItem('user'); // Limpia los datos corruptos
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para cerrar sesión
  function handleLogout() { // Cambiado a 'handleLogout' por convención
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false); // Actualiza el estado local
    setCurrentUser(null); // Limpia el usuario actual
    navigate('/login'); // Redirige al login
  }

  return (
    <nav className="navbar navbar-expand navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Nutri Plans</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {/* Elementos mostrados cuando el usuario NO está logueado */}
            {!isLoggedIn && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}

            {/* Elementos mostrados cuando el usuario SÍ está logueado */}
            {isLoggedIn && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                {currentUser && ( // Muestra el nombre de usuario si está disponible
                  <li className="nav-item nav-link">
                    Bienvenido, {currentUser.name || currentUser.username || 'Usuario'}
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}