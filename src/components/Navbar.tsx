// src/components/Navbar.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu'; // Asumo que este componente sigue existiendo y es funcional

// Importa los componentes de react-bootstrap
import { Navbar, Nav, Container } from 'react-bootstrap';

// Renombra el componente de Navbar a AppNavbar para evitar conflicto de nombres con el import de react-bootstrap
export default function AppNavbar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate(); // Necesario si UserMenu no maneja la navegación directamente para Cerrar Sesión

  return (
    // Usa el componente Navbar de react-bootstrap
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        {/* Navbar.Brand es para el logo/nombre de la marca. Usamos 'as={Link}' para integrar react-router-dom */}
        <Navbar.Brand as={Link} to="/">Nutri Plans</Navbar.Brand>

        {/* Navbar.Toggle es el botón hamburguesa. 'aria-controls' debe coincidir con el 'id' de Navbar.Collapse */}
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        {/* Navbar.Collapse es el contenido que se oculta/muestra al hacer clic en el botón hamburguesa */}
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
          {/* Nav agrupa los enlaces de navegación */}
          <Nav className="align-items-center">
            {/* Nav.Link es para los enlaces de navegación. Usamos 'as={Link}' para integrar react-router-dom */}
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>

            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/planes">Planes</Nav.Link>
                <Nav.Link as={Link} to="/dietas">Dietas</Nav.Link>
                <Nav.Link as={Link} to="/seguimiento">Seguimiento</Nav.Link>
                <Nav.Link as={Link} to="/pacientes">Pacientes</Nav.Link>
                <Nav.Link as={Link} to="/nutricionistas">Nutricionistas</Nav.Link>
                <Nav.Link as={Link} to="/pagos">Pagos</Nav.Link>
                {/* UserMenu ahora debería ir dentro de un Nav.Item o directamente en Nav si UserMenu es solo el Dropdown */}
                {/* Si UserMenu es un <li>, asegúrate de que no duplique el <li> */}
                <UserMenu /> {/* Asumo que UserMenu es un componente que renderiza sus propios <li> o es un Dropdown */}
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}