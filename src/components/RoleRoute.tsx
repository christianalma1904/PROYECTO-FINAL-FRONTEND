import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RoleRoute({ children, role }: { children: React.ReactNode, role: string }) {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  if (!user || user.rol !== role) return <Navigate to="/" />;
  return children;
}