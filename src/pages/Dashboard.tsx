import { useEffect, useState } from 'react';
import { getPlanes, Plan } from '../api/planes';
import { getMyDietas, Dieta } from '../api/dietas';
import { getMySeguimiento, SeguimientoEntry } from '../api/seguimiento';
import { useAuth } from '../context/AuthContext';

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

      if (!isAuthenticated || !token || !user?.id) {
        setError("Por favor inicia sesión para acceder al dashboard.");
        setLoading(false);
        return;
      }

      try {
        const planesData = await getPlanes();
        const dietasData = await getMyDietas(user.id);
        const seguimientoData = await getMySeguimiento(user.id);

        setPlanes(planesData);
        setDietas(dietasData);
        setSeguimiento(seguimientoData);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar los datos del Dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, token, user]);

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3">Cargando tu información...</p>
      </div>
    );
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4">Bienvenido, <strong>{user?.name || user?.email}</strong></h1>

      {/* Resumen general */}
      <div className="row text-center mb-5">
        <div className="col-md-4">
          <div className="card bg-light shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📋 Planes disponibles</h5>
              <p className="display-6">{planes.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light shadow-sm">
            <div className="card-body">
              <h5 className="card-title">🍎 Mis Dietas</h5>
              <p className="display-6">{dietas.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light shadow-sm">
            <div className="card-body">
              <h5 className="card-title">📈 Registros</h5>
              <p className="display-6">{seguimiento.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de dietas */}
      <h2 className="mb-3">📋 Mis Dietas</h2>
      <div className="row">
        {dietas.length > 0 ? (
          dietas.map((dieta) => (
            <div key={dieta._id || dieta.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{dieta.nombre}</h5>
                  <p>{dieta.descripcion}</p>
                  <p>
                    <strong>Asignada:</strong>{' '}
                    {dieta.fechaAsignacion
                      ? new Date(dieta.fechaAsignacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                  {dieta.semanas?.length > 0 && (
                    <>
                      <h6>Menú semanal:</h6>
                      <ul>
                        {dieta.semanas.map((semana, index) => (
                          <li key={index}>
                            Semana {semana.semana}: {semana.menu.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No tienes dietas asignadas.</p>
        )}
      </div>

      {/* Sección de seguimiento */}
      <h2 className="mt-5 mb-3">📊 Mi Seguimiento</h2>
      <div className="row">
        {seguimiento.length > 0 ? (
          seguimiento.map((entry) => (
            <div key={entry._id || entry.id} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  {/* LÍNEA CORREGIDA PARA EL FORMATO DE FECHA EN SEGUIMIENTO */}
                  <h5 className="card-title">
                    📅{' '}
                    {entry.fecha
                      ? new Date(entry.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </h5>
                  <p><strong>Peso:</strong> {entry.peso} kg</p>
                  {/* ELIMINADA la referencia a 'observaciones' */}
                  {/* {entry.observaciones && <p><strong>Nota:</strong> {entry.observaciones}</p>} */}
                  {/* AÑADIDA la referencia a 'semana', que ahora sí existe en SeguimientoEntry */}
                  <p><strong>Semana:</strong> {entry.semana}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No hay registros de seguimiento todavía.</p>
        )}
      </div>
    </div>
  );
}