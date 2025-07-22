import { useEffect, useState } from 'react';
import { getPlanes, Plan, createPlan, deletePlan, updatePlan } from '../api/planes';
import { useAuth } from '../context/AuthContext';

export default function Planes() {
  const { token, isAuthenticated } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nuevoPlan, setNuevoPlan] = useState({ nombre: '', descripcion: '', precio: '' });
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const fetchPlanes = async () => {
    setLoading(true);
    setError(null);
    try {
      const planesData = await getPlanes();
      setPlanes(planesData);
    } catch (err: any) {
      console.error("Error al cargar planes:", err);
      setError("Ocurrió un problema al cargar los planes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) fetchPlanes();
  }, [isAuthenticated, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await updatePlan(editandoId, {
          nombre: nuevoPlan.nombre,
          descripcion: nuevoPlan.descripcion,
          precio: parseFloat(nuevoPlan.precio),
        });
      } else {
        await createPlan({
          nombre: nuevoPlan.nombre,
          descripcion: nuevoPlan.descripcion,
          precio: parseFloat(nuevoPlan.precio),
        });
      }
      setNuevoPlan({ nombre: '', descripcion: '', precio: '' });
      setEditandoId(null);
      await fetchPlanes();
    } catch (error) {
      alert('Error al guardar el plan.');
      console.error('Error saving plan:', error); // Agregué un console.error para mejor depuración
    }
  };

  const handleEliminar = async (id: number) => {
    // CORRECCIÓN AQUÍ: Se cambió 'confirm' por 'window.confirm'
    if (window.confirm('¿Estás seguro de eliminar este plan?')) {
      try {
        await deletePlan(id);
        await fetchPlanes();
      } catch (err) {
        alert('Error al eliminar el plan.');
        console.error('Error deleting plan:', err); // Agregué un console.error para mejor depuración
      }
    }
  };

  const handleEditar = (plan: Plan) => {
    setNuevoPlan({
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: plan.precio.toString(),
    });
    setEditandoId(plan.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor inicia sesión para visualizar los planes disponibles.
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Planes Personalizados para Ti 🥦</h1>
      <p className="text-muted text-center mb-4">
        Accede a planes adaptados a tus necesidades nutricionales, diseñados por profesionales.
      </p>

      {/* Formulario para agregar/editar plan */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="card shadow-sm p-4">
          <h4 className="mb-3">{editandoId ? 'Editar plan' : 'Agregar nuevo plan'}</h4>
          <div className="row">
            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                placeholder="Nombre"
                value={nuevoPlan.nombre}
                onChange={(e) => setNuevoPlan({ ...nuevoPlan, nombre: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                type="number"
                placeholder="Precio"
                value={nuevoPlan.precio}
                onChange={(e) => setNuevoPlan({ ...nuevoPlan, precio: e.target.value })}
                required
              />
            </div>
            <div className="col-md-12 mb-2">
              <textarea
                className="form-control"
                placeholder="Descripción"
                value={nuevoPlan.descripcion}
                onChange={(e) => setNuevoPlan({ ...nuevoPlan, descripcion: e.target.value })}
                required
              />
            </div>
          </div>
          <button className="btn btn-success mt-3 w-100" type="submit">
            {editandoId ? 'Guardar cambios' : 'Agregar Plan'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando planes de nutrición...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {planes.length > 0 ? (
            planes.map((plan) => (
              <div key={plan.id} className="col-md-4 mb-4">
                <div className="card shadow h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title">{plan.nombre}</h5>
                      <p className="card-text">{plan.descripcion}</p>
                      <p className="card-text">
                        <strong>💰 Precio:</strong> ${typeof plan.precio === 'string'
                          ? parseFloat(plan.precio).toFixed(2)
                          : plan.precio.toFixed(2)}
                      </p>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => handleEditar(plan)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => handleEliminar(plan.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-12 text-center">Actualmente no hay planes disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
}