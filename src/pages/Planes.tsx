// src/pages/Planes.tsx
import React, { useEffect, useState } from 'react';
import { getPlanes, Plan } from '../api/planes'; // Asegúrate de que estas importaciones sean correctas
import { useAuth } from '../context/AuthContext'; // Si usas el contexto de autenticación

// Define tu componente Planes
const Planes = () => { // O también podrías usar 'function Planes() {'
  const { token, isAuthenticated } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanes() {
      setLoading(true);
      setError(null);
      if (!isAuthenticated || !token) {
        setError("No autenticado. Por favor, inicia sesión para ver los planes.");
        setLoading(false);
        return;
      }
      try {
        const planesData = await getPlanes(); // Llama a la función de la API
        setPlanes(planesData);
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
      <h1>Nuestros Planes de Nutrición</h1>
      <div className="row">
        {planes.length > 0 ? (
          planes.map((plan) => (
            <div key={plan.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{plan.nombre}</h5>
                  <p className="card-text">{plan.descripcion}</p>
                  <p className="card-text">
                    <strong>Precio: ${typeof plan.precio === 'string' ? parseFloat(plan.precio).toFixed(2) : plan.precio.toFixed(2)}</strong>
                  </p>
                  {/* Agrega más detalles del plan si es necesario */}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-12">No hay planes disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
};

export default Planes; // <--- ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE!