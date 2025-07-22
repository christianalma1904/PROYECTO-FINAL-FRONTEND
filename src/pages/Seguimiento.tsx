import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMySeguimiento, createSeguimiento, SeguimientoEntry, CreateSeguimientoPayload } from '../api/seguimiento';

export default function Seguimiento() {
  const { token, isAuthenticated, user } = useAuth();
  const [seguimiento, setSeguimiento] = useState<SeguimientoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [peso, setPeso] = useState<number>(0);
  const [fecha, setFecha] = useState<string>('');
  const [semana, setSemana] = useState<number>(1);
  const [fotos, setFotos] = useState<string[]>([]); // <-- VUELVE A AÑADIR ESTA LÍNEA para el estado de fotos


  const fetchSeguimiento = async () => {
    setLoading(true);
    setError(null);
    if (!isAuthenticated || !user || !user.id) {
      setError("Usuario no autenticado o ID de usuario no disponible.");
      setLoading(false);
      return;
    }
    try {
      const seguimientoData = await getMySeguimiento(user.id);
      setSeguimiento(seguimientoData);
    } catch (err: any) {
      console.error("Error al cargar seguimiento:", err);
      setError("Ocurrió un problema al cargar el seguimiento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchSeguimiento();
    }
  }, [isAuthenticated, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !user.id) {
      alert("No estás autenticado o tu ID de usuario no está disponible.");
      return;
    }

    if (peso <= 0 || !fecha || semana <= 0) {
        alert("Por favor, ingresa un peso válido, una fecha y una semana válida.");
        return;
    }

    const payload: CreateSeguimientoPayload = {
        peso: peso,
        fecha: fecha,
        paciente_id: user.id,
        semana: semana,
        fotos: fotos, // <-- VUELVE A AÑADIR ESTA LÍNEA en el payload (fotos es un array vacío por defecto)
    };

    try {
      await createSeguimiento(payload);
      setPeso(0);
      setFecha('');
      setSemana(1);
      setFotos([]); // <-- VUELVE A AÑADIR ESTA LÍNEA para resetear el estado de fotos
      await fetchSeguimiento();
    } catch (error) {
      alert('Error al agregar el registro de seguimiento.');
      console.error('Error al crear seguimiento:', error);
    }
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor inicia sesión para ver y registrar tu seguimiento.
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Tu Seguimiento Personal 📈</h1>
      <p className="text-muted text-center mb-4">
        Registra tu progreso de peso y otros indicadores clave para alcanzar tus metas.
      </p>

      {/* Formulario para agregar seguimiento */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="card shadow-sm p-4">
          <h4 className="mb-3">Agregar nuevo registro de seguimiento</h4>
          <div className="row">
            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                type="number"
                step="0.1"
                placeholder="Peso (kg)"
                value={peso === 0 ? '' : peso}
                onChange={(e) => setPeso(parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                type="date"
                placeholder="Fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                type="number"
                step="1"
                placeholder="Semana"
                value={semana === 0 ? '' : semana}
                onChange={(e) => setSemana(parseInt(e.target.value))}
                required
              />
            </div>
            {/* Si quieres un input para fotos, iría aquí. Por ahora, 'fotos' se envía como un array vacío por defecto. */}
            {/* Ejemplo de input básico para una URL de foto (si solo se permite una) */}
            {/* <div className="col-md-12 mb-2">
              <input
                className="form-control"
                type="text"
                placeholder="URL de foto (opcional)"
                value={fotos[0] || ''} // Muestra la primera URL si existe
                onChange={(e) => setFotos(e.target.value ? [e.target.value] : [])} // Guarda como array
              />
            </div> */}

          </div>
          <button className="btn btn-success mt-3 w-100" type="submit">
            Agregar Registro
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando tu historial de seguimiento...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {seguimiento.length > 0 ? (
            <div className="col-12">
              <h4 className="mb-3">Historial de Seguimiento</h4>
              <ul className="list-group">
                {seguimiento.map((entry) => (
                  <li key={entry._id || entry.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Fecha:</strong> {new Date(entry.fecha).toLocaleDateString()} -{' '}
                      <strong>Peso:</strong> {entry.peso} kg -{' '}
                      <strong>Semana:</strong> {entry.semana}
                      {entry.fotos && entry.fotos.length > 0 && ( // <-- Muestra fotos si existen
                        <p className="mb-0 text-muted">Fotos: {entry.fotos.join(', ')}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="col-12 text-center">Aún no hay registros de seguimiento. ¡Comienza a registrar tu progreso!</p>
          )}
        </div>
      )}
    </div>
  );
}