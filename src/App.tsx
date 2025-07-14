import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register'; // <--- Importa Register
import Dashboard from './Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4" to="/">Nutri Plans</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/register">Register</Link>  {/* <-- Enlace nuevo */}
              </li>
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />  {/* <-- Ruta nueva */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
