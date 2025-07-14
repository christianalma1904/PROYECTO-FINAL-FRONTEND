import React, { useEffect, useState } from 'react';
import { getProtected } from './api';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string | number;
  nombre: string;
  precio: number;
}

export default function Home() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getProtected();

        if (Array.isArray(data)) {
          setPlanes(data);
        } else {
          setError("La API no devolvió un formato de planes esperado.");
          console.error("Respuesta inesperada de getProtected:", data);
        }
      } catch (err: any) {
        if (err.message?.toLowerCase().includes('expirad') || err.message?.toLowerCase().includes('autorizad') || err.message?.toLowerCase().includes('token')) {
          setError('Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión.');
          navigate('/login');
        } else {
          setError(`Error al cargar los planes: ${err.message || 'Error desconocido'}`);
        }
        console.error("Error al llamar a getProtected:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, [navigate]);

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col text-center">
          <h1 className="fw-bold">Planes Nutricionales</h1>
          <p className="text-secondary">¡Conoce nuestros planes y elige el ideal para ti!</p>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Planes disponibles</h5>
            </div>
            <ul className="list-group list-group-flush">
              {loading && (
                <li className="list-group-item text-center">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </li>
              )}
              {error && (
                <li className="list-group-item text-danger text-center">{error}</li>
              )}
              {!loading && !error && planes.length === 0 && (
                <li className="list-group-item text-center text-muted">
                  No se encontraron planes disponibles.
                </li>
              )}
              {!loading && !error && planes.map(plan => (
                <li key={plan.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">{plan.nombre}</span>
                  <span className="badge bg-primary fs-6">${plan.precio}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
