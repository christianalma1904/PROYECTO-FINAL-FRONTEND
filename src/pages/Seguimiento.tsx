import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPacientes, Paciente } from '../api/pacientes';
import { getAllSeguimiento, createSeguimiento, SeguimientoEntry, CreateSeguimientoPayload } from '../api/seguimiento';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Seguimiento() {
  const { token, isAuthenticated, user } = useAuth();
  const [seguimiento, setSeguimiento] = useState<SeguimientoEntry[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPacienteId, setSelectedPacienteId] = useState<number | undefined>(undefined);
  const [peso, setPeso] = useState<number | undefined>(undefined);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [semana, setSemana] = useState<number | undefined>(1);
  const [fotos, setFotos] = useState<string[]>([]);

  // *** PUNTO CLAVE DE CORRECCIÓN Y DEPURACIÓN ***
  // Verificamos si user existe Y si user.rol es EXACTAMENTE 'admin'
  const isAdmin = user && user.rol === 'admin';

  // Añadimos console.log para depuración
  useEffect(() => {
    console.log("--- DEBUG DE SEGUIMIENTO.TSX ---");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("Objeto user:", user);
    if (user) {
      console.log("user.rol:", user.rol); // ¡Verifica este valor en la consola!
      console.log("¿Es 'admin'?", user.rol === 'admin');
    } else {
      console.log("El objeto user es null o undefined.");
    }
    console.log("isAdmin (resultado final):", isAdmin);
    console.log("-------------------------------");
  }, [isAuthenticated, user, isAdmin]); // Dependencias para que se ejecute cuando cambien estos valores


  const fetchSeguimientoAndPacientes = async () => {
    setLoading(true);
    setError(null);
    if (!isAuthenticated || !user) {
      setError("Usuario no autenticado.");
      setLoading(false);
      return;
    }
    try {
      const [allSeguimientoData, pacientesData] = await Promise.all([
        getAllSeguimiento(),
        getPacientes(),
      ]);
      setSeguimiento(allSeguimientoData);
      setPacientes(pacientesData);
    } catch (err: any) {
      setError("Ocurrió un problema al cargar los datos de seguimiento o pacientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo obtenemos datos si el usuario está autenticado Y es administrador
    if (isAuthenticated && isAdmin) {
      fetchSeguimientoAndPacientes();
    } else if (isAuthenticated && !isAdmin) {
      // Si está autenticado pero no es admin, muestra un error y detiene la carga
      setError("Acceso denegado. Esta página es solo para administradores.");
      setLoading(false); // Detener el spinner si no es admin
    } else {
      // Si no está autenticado, asegura que no intente cargar y muestre el mensaje inicial
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]); // 'isAdmin' se añade como dependencia

  // Filtra los registros del paciente seleccionado para la gráfica
  const seguimientoFiltrado = selectedPacienteId
    ? seguimiento.filter((s) => Number(s.paciente_id) === selectedPacienteId)
    : [];

  // Datos para la gráfica de peso
  const chartData =
    seguimientoFiltrado.length > 0
      ? seguimientoFiltrado
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert("No estás autenticado.");
      return;
    }
    // Verificar permisos de administrador antes de permitir el envío
    if (!isAdmin) {
      alert("No tienes permisos para agregar registros de seguimiento.");
      return;
    }

    if (selectedPacienteId === undefined || selectedPacienteId <= 0 || peso === undefined || peso <= 0 || !fecha || semana === undefined || semana <= 0) {
      alert("Por favor, selecciona un paciente e ingresa un peso válido (mayor que 0), una fecha y una semana válida (mayor que 0).");
      return;
    }

    const payload: CreateSeguimientoPayload = {
      peso: peso,
      fecha: fecha,
      paciente_id: selectedPacienteId.toString(),
      semana: semana,
      fotos: fotos,
    };

    try {
      const newEntry = await createSeguimiento(payload);
      setSeguimiento(prev => [...prev, newEntry]);
      alert('Registro de seguimiento agregado con éxito.');
      setPeso(undefined);
      setFecha(new Date().toISOString().split('T')[0]);
      setSemana(1);
      setFotos([]);
    } catch (error) {
      alert('Error al agregar el registro de seguimiento. Revisa la consola para más detalles.');
    }
  };

  // 1. Mensaje para usuarios no autenticados
  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor, inicia sesión para ver y registrar el seguimiento.
      </div>
    );
  }

  // 2. Mensaje para usuarios autenticados pero que NO son administradores
  if (!isAdmin) {
    return (
      <div className="container mt-5 alert alert-danger">
        Acceso denegado. Esta página es solo para administradores.
      </div>
    );
  }

  // Si llegamos aquí, el usuario está autenticado Y es administrador.
  // Procedemos a renderizar el contenido completo del componente.
  return (
    <div className="container mt-5 mb-5">
      <h1 className="mb-4 text-center text-success fw-bold">Gestión de Seguimiento de Pacientes 📈</h1>
      <p className="text-muted text-center mb-4">
        Registra el progreso de peso y otros indicadores clave para tus pacientes.
      </p>

      {/* Formulario para agregar seguimiento */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="card shadow-sm p-4">
          <h4 className="mb-3 text-success">Agregar nuevo registro de seguimiento</h4>
          <div className="row">
            {/* Selector de Paciente */}
            <div className="col-md-12 mb-3">
              <label htmlFor="pacienteSeguimientoSelect" className="form-label">Paciente</label>
              <select
                id="pacienteSeguimientoSelect"
                className="form-select"
                name="paciente_id"
                value={selectedPacienteId === undefined ? '' : selectedPacienteId}
                onChange={(e) => setSelectedPacienteId(Number(e.target.value) || undefined)}
                required
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.email})</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-2">
              <input
                className="form-control"
                type="number"
                step="0.1"
                placeholder="Peso (kg)"
                value={peso === undefined ? '' : peso}
                onChange={(e) => setPeso(parseFloat(e.target.value) || undefined)}
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
                value={semana === undefined ? '' : semana}
                onChange={(e) => setSemana(parseInt(e.target.value) || undefined)}
                required
              />
            </div>
            <div className="col-md-12 mb-2">
              <input
                className="form-control"
                type="text"
                placeholder="URL de foto (opcional)"
                value={fotos[0] || ''}
                onChange={(e) => setFotos(e.target.value ? [e.target.value] : [])}
              />
            </div>
          </div>
          <button className="btn btn-success mt-3 w-100" type="submit">
            Agregar Registro
          </button>
        </div>
      </form>

      {/* GRÁFICA DE PROGRESO */}
      {selectedPacienteId && (
        <div className="card mb-4 shadow-sm p-3" style={{ borderRadius: '1rem' }}>
          <h5 className="text-success fw-bold mb-2">📈 Progreso de Peso</h5>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
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
            <p className="text-muted mb-0">Agrega al menos dos registros de peso para ver el progreso.</p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando historial de seguimiento...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        selectedPacienteId && seguimientoFiltrado.length > 0 ? (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-3">Historial de Seguimiento</h4>
              <ul className="list-group">
                {seguimientoFiltrado.map((entry) => (
                  <li key={entry.id || entry._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Fecha:</strong> {new Date(entry.fecha).toLocaleDateString()} -{' '}
                      <strong>Peso:</strong> {entry.peso} kg -{' '}
                      <strong>Semana:</strong> {entry.semana}
                      {entry.fotos && entry.fotos.length > 0 && (
                        <p className="mb-0 text-muted">Fotos: {entry.fotos.join(', ')}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : selectedPacienteId ? (
          <p className="col-12 text-center">No hay registros de seguimiento para este paciente.</p>
        ) : (
          <p className="col-12 text-center">Selecciona un paciente para ver el historial y la gráfica de peso.</p>
        )
      )}
    </div>
  );
}