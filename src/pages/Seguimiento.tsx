// src/pages/Seguimiento.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMySeguimiento, createSeguimiento, SeguimientoEntry, CreateSeguimientoPayload } from '../api/seguimiento';

export default function Seguimiento() {
  const { token, isAuthenticated, user } = useAuth();
  const [seguimiento, setSeguimiento] = useState<SeguimientoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [peso, setPeso] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]); // Fecha actual en YYYY-MM-DD

  useEffect(() => {
    async function fetchSeguimiento() {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !token || !user?.id) {
        setError("No autenticado. Por favor, inicia sesión para ver tu seguimiento.");
        setLoading(false);
        return;
      }
      try {
        // Pasa el user.id a getMySeguimiento
        const data = await getMySeguimiento(user.id);
        setSeguimiento(data);
      } catch (err: any) {
        console.error("Error al cargar seguimiento:", err);
        setError(err.message || "Error al cargar los datos de seguimiento.");
      } finally {
        setLoading(false);
      }
    }
    fetchSeguimiento();
  }, [isAuthenticated, token, user]); // Añadido user a las dependencias

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.id) {
      alert("No estás autenticado para registrar un seguimiento.");
      return;
    }

    const newEntry: CreateSeguimientoPayload = {
      paciente_id: user.id,
      fecha: fecha,
      peso: peso,
      observaciones: observaciones,
    };

    try {
      await createSeguimiento(newEntry);
      // Después de crear, recarga los datos
      const updatedSeguimiento = await getMySeguimiento(user.id); // Pasa user.id al recargar
      setSeguimiento(updatedSeguimiento);
      // Limpia el formulario
      setPeso(0);
      setObservaciones('');
      setFecha(new Date().toISOString().split('T')[0]); // Reinicia la fecha a hoy
      alert('Registro de seguimiento añadido exitosamente!');
    } catch (err: any) {
      console.error("Error al añadir seguimiento:", err);
      alert(`Error al añadir seguimiento: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="container mt-5">Cargando seguimiento...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Mi Seguimiento de Peso</h1>

      {/* Formulario para añadir nuevo registro */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Añadir Nuevo Registro</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fecha" className="form-label">Fecha</label>
              <input
                type="date"
                className="form-control"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="peso" className="form-label">Peso (kg)</label>
              <input
                type="number"
                className="form-control"
                id="peso"
                value={peso}
                onChange={(e) => setPeso(parseFloat(e.target.value))}
                step="0.1"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="observaciones" className="form-label">Observaciones (Opcional)</label>
              <textarea
                className="form-control"
                id="observaciones"
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Guardar Registro</button>
          </form>
        </div>
      </div>

      {/* Lista de registros de seguimiento */}
      <h2 className="mt-4">Historial de Seguimiento</h2>
      <div className="row">
        {seguimiento.length > 0 ? (
          // Ordenar por fecha descendente para mostrar el más reciente primero
          seguimiento.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map((entry) => (
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