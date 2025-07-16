// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { getPlanes, Plan } from '../api/planes';
import { useAuth } from '../context/AuthContext';

// Importa las funciones y tipos para Dietas y Seguimiento
import { getMyDietas, Dieta } from '../api/dietas';
import { getMySeguimiento, SeguimientoEntry } from '../api/seguimiento';


export default function Dashboard() {
  const { token, user, isAuthenticated } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [seguimiento, setSeguimiento] = useState<SeguimientoEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !token || !user?.id) { // Asegúrate de que user.id exista
        setError("No autenticado o ID de usuario no disponible. Por favor, inicia sesión para ver tus datos.");
        setLoading(false);
        console.log("Dashboard: Usuario no autenticado o token/user.id ausente. No se cargan datos.");
        return;
      }

      try {
        // Cargar Planes
        console.log("Dashboard: Cargando planes...");
        const planesData = await getPlanes();
        const formattedPlanes = planesData.map(plan => ({
          ...plan,
          // Asegúrate de que plan.precio es un string o number. Convierte a number si es string.
          precio: typeof plan.precio === 'string' ? parseFloat(plan.precio) : plan.precio
        }));
        setPlanes(formattedPlanes);
        console.log("Dashboard: Planes cargados:", formattedPlanes);

        // Cargar Dietas del usuario logueado
        console.log("Dashboard: Intentando cargar dietas para el usuario:", user.id);
        const dietasData = await getMyDietas(user.id); // <-- PASA user.id AQUI
        setDietas(dietasData);
        console.log("Dashboard: Dietas cargadas:", dietasData);

        // Cargar Seguimiento del usuario logueado
        console.log("Dashboard: Intentando cargar seguimiento para el usuario:", user.id);
        const seguimientoData = await getMySeguimiento(user.id); // <-- PASA user.id AQUI
        setSeguimiento(seguimientoData);
        console.log("Dashboard: Seguimiento cargado:", seguimientoData);

      } catch (err: any) {
        console.error("Dashboard: Error al cargar datos:", err);
        setError(err.message || "Error al cargar los datos del Dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, token, user]); // Añadido user a las dependencias.

  if (loading) {
    return <div className="container mt-5">Cargando datos del Dashboard...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Dashboard de {user?.email || "Usuario"}</h1>

      <h2>Planes</h2>
      <div className="row">
        {planes.length > 0 ? (
          planes.map((plan) => (
            <div key={plan.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{plan.nombre}</h5>
                  <p className="card-text">{plan.descripcion}</p>
                  <p className="card-text"><strong>Precio: ${plan.precio ? plan.precio.toFixed(2) : 'N/A'}</strong></p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-12">No hay planes disponibles en este momento.</p>
        )}
      </div>

      {/* Sección de Mis Dietas */}
      <h2 className="mt-4">Mis Dietas</h2>
      <div className="row">
        {dietas.length > 0 ? (
          dietas.map((dieta) => (
            // Asegúrate de que _id o id existan en tu interfaz Dieta
            <div key={dieta._id || dieta.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{dieta.nombre}</h5>
                  <p className="card-text">{dieta.descripcion}</p>
                  <p className="card-text">ID Paciente: {dieta.paciente_id}</p>
                  {dieta.plan_id && <p className="card-text">ID Plan: {dieta.plan_id}</p>}
                  <p className="card-text"><small className="text-muted">Asignada el: {dieta.fechaAsignacion || 'N/A'}</small></p>
                  {dieta.semanas && dieta.semanas.length > 0 && (
                    <>
                      <h6>Semanas:</h6>
                      <ul>
                        {dieta.semanas.map((s, idx) => (
                          <li key={idx}>Semana {s.semana}: {s.menu.join(', ')}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-12">No tienes dietas asignadas en este momento.</p>
        )}
      </div>

      {/* Sección de Mi Seguimiento */}
      <h2 className="mt-4">Mi Seguimiento</h2>
      <div className="row">
        {seguimiento.length > 0 ? (
          seguimiento.map((entry) => (
            // Asegúrate de que _id o id existan en tu interfaz SeguimientoEntry
            <div key={entry._id || entry.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Fecha: {entry.fecha}</h5>
                  <p className="card-text">Peso: {entry.peso} kg</p>
                  {entry.observaciones && <p className="card-text">Observaciones: {entry.observaciones}</p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-12">No hay registros de seguimiento disponibles.</p>
        )}
      </div>
    </div>
  );
}