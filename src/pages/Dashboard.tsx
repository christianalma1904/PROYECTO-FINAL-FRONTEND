// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { getPlanes } from '../api/planes'; 
import { useAuth } from '../context/AuthContext'; 

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  // CORREGIDO: Asegúrate de que 'precio' sea un número en la interfaz
  precio: number; 
}

export default function Dashboard() {
  const { token, user, isAuthenticated } = useAuth(); 
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanes() {
      if (!isAuthenticated || !token) {
        setError("No autenticado. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }
      try {
        const data = await getPlanes();
        // Opcional: Si sabes que el backend podría enviar precio como string,
        // puedes mapear los datos para convertirlo aquí
        const formattedPlanes = data.map(plan => ({
          ...plan,
          // CORRECCIÓN: Asegúrate de que plan.precio sea un número.
          // Usamos parseFloat para convertirlo si viene como string.
          // Si ya es un número, parseFloat no lo afectará.
          precio: parseFloat(plan.precio as any) // 'as any' para evitar error de TS si lo lee como string
        }));
        setPlanes(formattedPlanes); // Usa los planes formateados
      } catch (err: any) {
        console.error("Error al cargar planes:", err);
        setError(err.message || "Error al cargar los planes.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlanes();
  }, [isAuthenticated, token]);

  if (loading) {
    return <div className="container mt-5">Cargando planes...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>

      <h2>Planes</h2>
      <div className="row">
        {planes.length > 0 ? (
          planes.map((plan) => (
            <div key={plan.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{plan.nombre}</h5>
                  <p className="card-text">{plan.descripcion}</p>
                  {/* CORRECCIÓN: Asegúrate de que plan.precio es un número antes de toFixed */}
                  <p className="card-text"><strong>Precio: ${plan.precio ? plan.precio.toFixed(2) : 'N/A'}</strong></p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-12">No hay planes disponibles en este momento.</p>
        )}
      </div>

      <h2>Mis Dietas</h2>
      <p>Aquí se mostrarán tus dietas asignadas.</p>

      <h2>Mi Seguimiento</h2>
      <p>Aquí podrás ver tu progreso.</p>
    </div>
  );
}