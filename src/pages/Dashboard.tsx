// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { getPlanes } from '../api/planes'; // Asegúrate de que esta ruta sea correcta
import { useAuth } from '../context/AuthContext'; 

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  // Agrega otras propiedades del plan si las tienes
}

export default function Dashboard() {
  const { token, user, isAuthenticated } = useAuth(); 
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanes() {
      // Aunque getPlanes no toma 'token' como argumento, la lógica de `isAuthenticated` y `token` del contexto
      // sigue siendo útil para decidir si intentar cargar los planes o mostrar un error de autenticación.
      if (!isAuthenticated || !token) { // Verificar si el usuario está autenticado antes de intentar cargar
        setError("No autenticado. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }
      try {
        const data = await getPlanes(); // <--- CORREGIDO: Llamada sin argumentos
        setPlanes(data);
      } catch (err: any) {
        console.error("Error al cargar planes:", err);
        setError(err.message || "Error al cargar los planes.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlanes();
  }, [isAuthenticated, token]); // Dependencias para re-ejecutar cuando isAuthenticated o token cambien

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
                  <p className="card-text"><strong>Precio: ${plan.precio.toFixed(2)}</strong></p>
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