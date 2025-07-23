import { useEffect, useState } from 'react';
import { getPlanes, Plan } from '../api/planes';
import { getMyDietas, Dieta } from '../api/dietas';
import { getMySeguimiento, createSeguimiento, SeguimientoEntry, CreateSeguimientoPayload } from '../api/seguimiento';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { token, user, isAuthenticated } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [seguimiento, setSeguimiento] = useState<SeguimientoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el formulario de seguimiento (peso)
  const [peso, setPeso] = useState<number | undefined>(undefined);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [semana, setSemana] = useState<number | undefined>(1);
  const [fotos, setFotos] = useState<string[]>([]);

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
        setError("Error al cargar los datos del Dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated, token, user]);

  // Datos de la gráfica de peso
  const chartData =
    seguimiento.length > 0
      ? seguimiento
          .slice()
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .map((entry) => ({
            fecha: new Date(entry.fecha).toLocaleDateString("es-EC", {
              month: "short",
              day: "numeric",
            }),
            peso: entry.peso,
          }))
      : [];

  // Manejo de envío del formulario de seguimiento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert("No estás autenticado.");
      return;
    }
    if (peso === undefined || peso <= 0 || !fecha || semana === undefined || semana <= 0) {
      alert("Por favor, ingresa un peso válido (mayor que 0), una fecha y una semana válida (mayor que 0).");
      return;
    }
    const payload: CreateSeguimientoPayload = {
      peso,
      fecha,
      paciente_id: user.id.toString(), // Asume que el usuario actual es el paciente
      semana,
      fotos,
    };
    try {
      const nuevo = await createSeguimiento(payload);
      setSeguimiento(prev => [...prev, nuevo]);
      setPeso(undefined);
      setFecha(new Date().toISOString().split('T')[0]);
      setSemana(1);
      setFotos([]);
    } catch (error) {
      alert('Error al agregar el registro de seguimiento.');
    }
  };

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
    <div className="container mt-4 mb-5 dashboard-nutri">
      {/* HEADER DE BIENVENIDA */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="dashboard-header rounded-4 shadow-sm p-4 d-flex flex-column flex-md-row align-items-center gap-3"
            style={{
              background: "linear-gradient(90deg,#e6fff2 40%,#b8ffd4 100%)",
            }}
          >
            <div
              className="dashboard-avatar bg-success-subtle rounded-circle d-flex justify-content-center align-items-center me-3"
              style={{
                width: 72,
                height: 72,
                fontSize: 38,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(120deg,#27ae60 65%,#38b000 100%)",
              }}
            >
              {user?.name
                ? user.name[0].toUpperCase()
                : user?.email
                ? user.email[0].toUpperCase()
                : "👤"}
            </div>
            <div>
              <h1 className="mb-1 fw-bold text-success">
                ¡Hola, {user?.name?.split(" ")[0] || user?.email}!
              </h1>
              <span className="text-muted">
                Este es tu panel de progreso nutricional.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN GENERAL */}
      <div className="row text-center mb-5 dashboard-resumen g-4">
        <div className="col-12 col-md-4">
          <div className="dashboard-resumen-card card border-0 shadow-sm py-3" style={{ background: "#e6fff2", borderLeft: "5px solid #38b000", minHeight: 130 }}>
            <div className="card-body">
              <div className="dashboard-icon mb-1" style={{ fontSize: 32 }}>📋</div>
              <div className="card-title text-success fw-semibold">Planes disponibles</div>
              <div className="display-6 fw-bold">{planes.length}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="dashboard-resumen-card card border-0 shadow-sm py-3" style={{ background: "#d9f99d", borderLeft: "5px solid #27ae60", minHeight: 130 }}>
            <div className="card-body">
              <div className="dashboard-icon mb-1" style={{ fontSize: 32 }}>🍎</div>
              <div className="card-title text-success fw-semibold">Mis Dietas</div>
              <div className="display-6 fw-bold">{dietas.length}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="dashboard-resumen-card card border-0 shadow-sm py-3" style={{ background: "#e6fff2", borderLeft: "5px solid #38b000", minHeight: 130 }}>
            <div className="card-body">
              <div className="dashboard-icon mb-1" style={{ fontSize: 32 }}>📈</div>
              <div className="card-title text-success fw-semibold">Registros</div>
              <div className="display-6 fw-bold">{seguimiento.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEGUIMIENTO: REGISTRO, GRÁFICA Y HISTORIAL */}
      <section>
        <div className="row mb-4">
          <div className="col-12 col-md-7">
            {/* GRÁFICA */}
            <div className="card border-0 shadow-sm dashboard-chart-card mb-4" style={{ borderRadius: "1.3rem" }}>
              <div className="card-body">
                <h4 className="mb-3 text-success fw-bold">📊 Progreso de Peso</h4>
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e6fff2" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 14, fill: "#27ae60" }} />
                      <YAxis tick={{ fontSize: 14, fill: "#21693b" }} domain={["auto", "auto"]} width={36} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#38b000"
                        strokeWidth={3}
                        dot={{ r: 6, fill: "#27ae60", stroke: "#38b000", strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: "#b8ffd4", stroke: "#38b000", strokeWidth: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted">Agrega al menos dos registros de peso para ver tu progreso.</p>
                )}
              </div>
            </div>
          </div>
          {/* FORMULARIO */}
          <div className="col-12 col-md-5">
            <div className="card shadow-sm border-0 p-4 h-100 d-flex flex-column justify-content-between" style={{ borderRadius: '1.3rem', minHeight: 260 }}>
              <h4 className="mb-3 text-success fw-bold">Registrar Peso</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Peso (kg)</label>
                  <input
                    className="form-control"
                    type="number"
                    step="0.1"
                    placeholder="Ejemplo: 70.5"
                    value={peso === undefined ? '' : peso}
                    onChange={(e) => setPeso(parseFloat(e.target.value) || undefined)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha</label>
                  <input
                    className="form-control"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Semana</label>
                  <input
                    className="form-control"
                    type="number"
                    step="1"
                    placeholder="Semana"
                    value={semana === undefined ? '' : semana}
                    onChange={(e) => setSemana(parseInt(e.target.value) || undefined)}
                    required
                  />
                </div>
                {/* Puedes agregar el campo de fotos si quieres */}
                <button className="btn btn-success w-100" type="submit">
                  Guardar Registro
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* HISTORIAL DE REGISTROS */}
        <div className="row">
          <div className="col-12">
            <h5 className="mb-3 fw-bold text-success">Historial de Seguimiento</h5>
            {seguimiento.length > 0 ? (
              <ul className="list-group">
                {seguimiento
                  .slice()
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                  .map((entry) => (
                    <li key={entry.id || entry._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Fecha:</strong> {new Date(entry.fecha).toLocaleDateString()} —{' '}
                        <strong>Peso:</strong> {entry.peso} kg —{' '}
                        <strong>Semana:</strong> {entry.semana}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="alert alert-info mt-2">
                No hay registros de seguimiento todavía. <br />
                <span style={{ fontSize: 15 }}>¡Comienza a registrar tu progreso para ver resultados!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DIETAS */}
      <hr className="my-5" style={{ borderTop: "2px solid #e6fff2" }} />
      <div className="dashboard-section-title">
        <h2 className="mb-3 text-success fw-bold d-flex align-items-center">
          <span style={{ fontSize: 30, marginRight: 8 }}>🍏</span> Mis Dietas
        </h2>
      </div>
      <div className="row">
        {dietas.length > 0 ? (
          dietas.map((dieta) => (
            <div key={dieta._id || dieta.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100 border-0 dashboard-dieta-card">
                <div className="card-body">
                  <h5 className="card-title text-success">{dieta.nombre}</h5>
                  <p className="text-muted">{dieta.descripcion}</p>
                  <div className="mb-1">
                    <span className="badge rounded-pill bg-success-subtle text-success">
                      {dieta.fechaAsignacion
                        ? "Asignada: " +
                          new Date(dieta.fechaAsignacion).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "No asignada"}
                    </span>
                  </div>
                  {dieta.semanas?.length > 0 && (
                    <>
                      <h6 className="fw-semibold text-secondary mt-3 mb-2">
                        Menú semanal:
                      </h6>
                      <ul className="ps-3">
                        {dieta.semanas.map((semana, index) => (
                          <li key={index} className="text-muted">
                            <span className="fw-bold">Semana {semana.semana}:</span> {semana.menu.join(", ")}
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
          <div className="col-12">
            <div className="alert alert-info mt-2">
              No tienes dietas asignadas. <br />
              <span style={{ fontSize: 15 }}>Pide a tu nutricionista que te asigne una, o revisa los planes disponibles.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
