import { useEffect, useState } from 'react';
import { getPlanes, Plan, createPlan, deletePlan, updatePlan } from '../api/planes';
import { createPago } from '../api/pagos'; // Importa tu función para crear pagos
import { useAuth } from '../context/AuthContext';

export default function Planes() {
  const { token, isAuthenticated, user } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedId, setFlippedId] = useState<number | null>(null);

  const [nuevoPlan, setNuevoPlan] = useState({ nombre: '', descripcion: '', precio: '' });
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Control para compra paciente
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Detectar rol
  const userRole = user?.rol || 'paciente';

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
      console.error('Error saving plan:', error);
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este plan?')) {
      try {
        await deletePlan(id);
        await fetchPlanes();
      } catch (err) {
        alert('Error al eliminar el plan.');
        console.error('Error deleting plan:', err);
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

  // --- Lógica de compra para el paciente ---
  const handleComprar = async (plan: Plan) => {
    if (!user || userRole !== 'paciente') return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      await createPago({
        paciente: Number(user.id),
        plan: plan.id,
        monto: parseFloat(plan.precio.toString()), // <--- ¡CAMBIO APLICADO AQUÍ!
        fecha: new Date().toISOString().split('T')[0]
      });
      setSuccess('¡Compra realizada con éxito! Puedes revisar tu historial de pagos.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      // Es buena idea mostrar el error específico del backend si viene en err.message
      setError(err.message || 'Error al realizar la compra.');
      console.error("Error en handleComprar:", err); // Para ver el error completo en consola
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor inicia sesión para visualizar los planes disponibles.
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ background: "#f6fff8", borderRadius: "1rem", padding: "2rem 1rem" }}>
      <h1 className="mb-4 text-center" style={{ color: "#38b000" }}>Planes Personalizados para Ti 🥦</h1>
      <p className="text-muted text-center mb-4">
        Accede a planes adaptados a tus necesidades nutricionales, diseñados por profesionales.
      </p>

      {/* Mensaje de compra */}
      {success && <div className="alert alert-success text-center">{success}</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Formulario SOLO PARA ADMIN */}
      {userRole === 'admin' && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="card shadow-sm p-4" style={{ border: "1.5px solid #d1fadf", background: "#fff" }}>
            <h4 className="mb-3 text-success">{editandoId ? 'Editar plan' : 'Agregar nuevo plan'}</h4>
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
            <button className="btn btn-success mt-3 w-100 rounded-pill" type="submit" style={{ background: 'linear-gradient(90deg, #4CAF50 60%, #27ae60 100%)', border: 'none' }}>
              {editandoId ? 'Guardar cambios' : 'Agregar Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Planes Cards */}
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
                <div
                  className={`flip-card h-100 ${flippedId === plan.id ? 'flipped' : ''}`}
                  onClick={() => setFlippedId(flippedId === plan.id ? null : plan.id)}
                  style={{
                    perspective: 1000,
                    cursor: "pointer",
                    minHeight: 270,
                    borderRadius: '1rem',
                  }}
                >
                  <div className="flip-card-inner" style={{ height: '100%' }}>
                    {/* Front */}
                    <div className="flip-card-front card shadow h-100 p-4 d-flex flex-column justify-content-center align-items-center"
                      style={{
                        borderColor: "#27ae60",
                        background: "#fff",
                        boxShadow: "0 0.25rem 0.75rem rgba(39,174,96,0.09)"
                      }}>
                      <h5 className="card-title text-success">{plan.nombre}</h5>
                      <p className="card-text">
                        <strong>Precio:</strong> <span style={{ color: '#38b000' }}>${typeof plan.precio === 'string' ? parseFloat(plan.precio).toFixed(2) : plan.precio.toFixed(2)}</span>
                      </p>
                    </div>
                    {/* Back */}
                    <div className="flip-card-back card shadow h-100 p-4 d-flex flex-column justify-content-between align-items-center"
                      style={{
                        background: "#e6fff2",
                        color: "#21693b"
                      }}>
                      <div>
                        <h5 className="card-title">{plan.nombre}</h5>
                        <p className="card-text">{plan.descripcion}</p>
                      </div>
                      <div className="d-flex gap-2 mt-3 w-100">
                        {/* SOLO ADMIN puede editar/eliminar */}
                        {userRole === 'admin' && (
                          <>
                            <button className="btn btn-outline-primary w-100" onClick={(e) => { e.stopPropagation(); handleEditar(plan); }}>
                              Editar
                            </button>
                            <button className="btn btn-outline-danger w-100" onClick={(e) => { e.stopPropagation(); handleEliminar(plan.id); }}>
                              Eliminar
                            </button>
                          </>
                        )}
                        {/* SOLO PACIENTE puede comprar */}
                        {userRole === 'paciente' && (
                          <button
                            className="btn btn-success w-100"
                            disabled={isProcessing}
                            onClick={(e) => { e.stopPropagation(); handleComprar(plan); }}
                          >
                            {isProcessing ? 'Procesando...' : 'Adquirir Plan'}
                          </button>
                        )}
                        <button
                          className="btn btn-outline-success w-100"
                          onClick={e => { e.stopPropagation(); setFlippedId(null); }}
                        >
                          Volver
                        </button>
                      </div>
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