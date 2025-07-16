// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importaciones de tus componentes generales
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Importaciones de tus componentes de páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos'; // ¡IMPORTACIÓN CORREGIDA: Ahora es Pagos!

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta protegida para el Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* ¡NUEVA RUTA PARA LA PÁGINA DE PAGOS! */}
        {/* Usamos '/pagar/:id' o '/pagos/:id' para indicar que se pagará un plan específico */}
        <Route path="/pagar/:id" element={<ProtectedRoute><Pagos /></ProtectedRoute>} />
        {/* He envuelto Pagos en ProtectedRoute asumiendo que es una página que requiere autenticación.
            Si no la requiere, puedes quitar ProtectedRoute. */}

        {/*
        // EJEMPLO: Si tuvieras un RoleRoute (para admin, por ejemplo)
        import RoleRoute from './components/RoleRoute';
        <Route
          path="/admin"
          element={
            <RoleRoute role="admin">
              <AdminDashboard /> // Asumiendo que tienes un componente AdminDashboard
            </RoleRoute>
          }
        />
        */}
      </Routes>
    </BrowserRouter>
  );
}