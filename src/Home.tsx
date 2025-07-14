// src/Home.tsx
import React, { useEffect, useState } from 'react';
import { getProtected } from './api'; // Importa getProtected en lugar de getPlanes
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redireccionar

interface Plan {
  id: string | number;
  nombre: string;
  precio: number;
  // Agrega otras propiedades del Plan si las tienes
}

export default function Home() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Intenta obtener los planes utilizando la función protegida
        const data = await getProtected();

        if (Array.isArray(data)) {
          setPlanes(data);
        } else {
          setError("La API no devolvió un formato de planes esperado.");
          console.error("Respuesta inesperada de getProtected:", data);
        }
      } catch (err: any) {
        // Manejo específico para errores de autenticación/autorización
        if (err.message.includes('Sesión expirada') || err.message.includes('no autorizada') || err.message.includes('Token no encontrado')) {
          setError('Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión.');
          navigate('/login'); // Redirige al usuario a la página de login
        } else {
          setError(`Error al cargar los planes: ${err.message || 'Error desconocido'}`);
        }
        console.error("Error al llamar a getProtected:", err);
      } finally {
        setLoading(false);
      }
    };

    // Llama a fetchPlanes solo si el usuario está autenticado, o si necesitas forzar el inicio de sesión
    // Considera que si no hay token al cargar Home, se redirigirá al login
    fetchPlanes();
  }, [navigate]); // Añade 'navigate' como dependencia para el useEffect

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