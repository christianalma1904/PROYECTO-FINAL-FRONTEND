// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Planes from './pages/Planes'; // <-- ¡Importa el componente Planes!
import Dietas from './pages/Dietas'; // <-- ¡Importa el componente Dietas!
import Seguimiento from './pages/Seguimiento'; // <-- ¡Importa el componente Seguimiento!


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>} />

          {/* Añade estas nuevas rutas para que la navegación funcione */}
          <Route path="/planes" element={<ProtectedRoute><Planes /></ProtectedRoute>} />
          <Route path="/dietas" element={<ProtectedRoute><Dietas /></ProtectedRoute>} />
          <Route path="/seguimiento" element={<ProtectedRoute><Seguimiento /></ProtectedRoute>} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}