import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Contexto de autenticación
import { AuthProvider } from './context/AuthContext';

// Componentes
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Planes from './pages/Planes';
import Dietas from './pages/Dietas';
import Seguimiento from './pages/Seguimiento';
import Pacientes from './pages/Pacientes';       // <-- IMPORTACIÓN DE PACIENTES
import Nutricionistas from './pages/Nutricionistas'; // <-- IMPORTACIÓN DE NUTRICIONISTAS

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/pagos" element={
            <ProtectedRoute>
              <Pagos />
            </ProtectedRoute>
          } />

          <Route path="/planes" element={
            <ProtectedRoute>
              <Planes />
            </ProtectedRoute>
          } />

          <Route path="/dietas" element={
            <ProtectedRoute>
              <Dietas />
            </ProtectedRoute>
          } />

          <Route path="/seguimiento" element={
            <ProtectedRoute>
              <Seguimiento />
            </ProtectedRoute>
          } />

          {/* NUEVAS RUTAS AGREGADAS */}
          <Route path="/pacientes" element={
            <ProtectedRoute>
              <Pacientes />
            </ProtectedRoute>
          } />

          <Route path="/nutricionistas" element={
            <ProtectedRoute>
              <Nutricionistas />
            </ProtectedRoute>
          } />
          {/* FIN DE NUEVAS RUTAS AGREGADAS */}

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}