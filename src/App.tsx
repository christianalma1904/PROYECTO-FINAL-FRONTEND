// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; // <--- ¡Asegúrate de que esta línea esté presente y DESCOMENTADA!
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext'; 

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos'; 
// import ComprarPlan from './pages/ComprarPlan'; // Esta línea debería estar eliminada o comentada

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider> 
        <Navbar /> {/* <--- ¡Asegúrate de que esta línea esté presente y DESCOMENTADA! */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> 
          
          {/* Si tenías esta línea, asegúrate de que esté eliminada */}
          {/* <Route path="/comprar/:id" element={<ProtectedRoute><ComprarPlan /></ProtectedRoute>} /> */}
          
          <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>} /> 

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}