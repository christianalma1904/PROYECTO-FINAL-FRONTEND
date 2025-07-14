// Home.tsx
import React, { useEffect, useState } from 'react';
import { getPlanes } from './api';

interface Plan {
  id: string | number; // Puede ser string o number según tu API
  nombre: string;
  precio: number;
  // Agrega aquí cualquier otra propiedad que tus planes tengan
}

export default function Home() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getPlanes();

        if (Array.isArray(data)) {
          setPlanes(data);
        } else {
          setError("La API no devolvió un formato de planes esperado (no es un arreglo).");
          console.error("Respuesta inesperada de getPlanes:", data);
        }
      } catch (err: any) {
        setError(`Error al cargar los planes: ${err.message}`);
        console.error("Error al llamar a getPlanes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <h1>Planes Nutricionales</h1>
        <p>Cargando planes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h1>Planes Nutricionales</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Por favor, revisa la consola del navegador y el terminal de tu backend para más detalles.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Planes Nutricionales</h1>
      <ul className="list-group">
        {planes.length > 0 ? (
          planes.map(plan => (
            <li key={plan.id} className="list-group-item">
              <strong>{plan.nombre}</strong> - ${plan.precio}
            </li>
          ))
        ) : (
          <p>No se encontraron planes disponibles.</p>
        )}
      </ul>
    </div>
  );
}