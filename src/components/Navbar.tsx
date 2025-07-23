import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

import { Navbar, Nav, Container } from 'react-bootstrap';

export default function AppNavbar() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Helper para marcar activo
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Obtener el rol del usuario autenticado
  const userRole = user?.rol || 'paciente'; // Por defecto 'paciente' si no hay rol

  return (
    <Navbar
      expand="lg"
      className="shadow-sm px-2 py-2"
      style={{
        background: "#fff",
        borderBottom: "2px solid #e6fff2",
        zIndex: 50,
        minHeight: 70,
      }}
      sticky="top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-logo" style={{ fontWeight: 700, color: "#38b000", fontSize: "1.7rem", letterSpacing: 1 }}>
          <span role="img" aria-label="broccoli" style={{ marginRight: 8 }}>🥦</span>
          Nutri <span style={{ color: "#27ae60" }}>Plans</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav className="align-items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Opciones para ambos */}
                <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard') ? 'nav-active' : ''}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/planes" className={isActive('/planes') ? 'nav-active' : ''}>
                  Planes
                </Nav.Link>
                {/* Solo el admin puede ver Dietas */}
                {userRole === 'admin' && (
                  <Nav.Link as={Link} to="/dietas" className={isActive('/dietas') ? 'nav-active' : ''}>
                    Dietas
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/pagos" className={isActive('/pagos') ? 'nav-active' : ''}>
                  Pagos
                </Nav.Link>
                {/* Opciones solo para admin */}
                {userRole === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/pacientes" className={isActive('/pacientes') ? 'nav-active' : ''}>
                      Pacientes
                    </Nav.Link>
                    <Nav.Link as={Link} to="/nutricionistas" className={isActive('/nutricionistas') ? 'nav-active' : ''}>
                      Nutricionistas
                    </Nav.Link>
                  </>
                )}
                <UserMenu />
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className={isActive('/login') ? 'nav-active' : ''}>
                  Iniciar sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className={isActive('/register') ? 'nav-active' : ''}>
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
