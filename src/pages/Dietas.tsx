// src/pages/Dietas.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dieta, getAllDietas, createDieta, SemanaDieta, CreateDietaPayload } from '../api/dietas';
import { getPlanes, Plan } from '../api/planes';
import { getPacientes, Paciente } from '../api/pacientes';

export default function Dietas() {
  const { token, isAuthenticated, user } = useAuth();
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newDietaPayload, setNewDietaPayload] = useState<Omit<CreateDietaPayload, 'nombre' | 'descripcion' | 'fechaAsignacion'>>({
    paciente_id: user?.id || '',
    semanas: [],
    plan_id: ''
  });
  const [dietaNombre, setDietaNombre] = useState<string>('');
  const [dietaDescripcion, setDietaDescripcion] = useState<string>('');
  const [dietaFechaAsignacion, setDietaFechaAsignacion] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSemana, setNewSemana] = useState<SemanaDieta>({ semana: 1, menu: [] });
  const [newMenuItem, setNewMenuItem] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [dietasData, planesData, pacientesData] = await Promise.all([
          getAllDietas(),
          getPlanes(),
          getPacientes(),
        ]);
        setDietas(dietasData);
        setPlanes(planesData);
        setPacientes(pacientesData);
      } catch (err: any) {
        setError('Error al cargar dietas, planes o pacientes.');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && token) fetchData();
    if (user?.id && newDietaPayload.paciente_id === '') {
      setNewDietaPayload(prev => ({ ...prev, paciente_id: user.id }));
    }
  }, [isAuthenticated, token, user?.id, newDietaPayload.paciente_id]);

  // --- HANDLERS ---
  const handleDietaPayloadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDietaPayload(prev => ({ ...prev, [name]: value }));
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'nombre') setDietaNombre(value);
    else if (name === 'descripcion') setDietaDescripcion(value);
    else if (name === 'fechaAsignacion') setDietaFechaAsignacion(value);
  };

  const handleSemanaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSemana(prev => ({ ...prev, semana: parseInt(e.target.value) }));
  };

  const handleMenuItemAdd = () => {
    if (newMenuItem.trim()) {
      setNewSemana(prev => ({ ...prev, menu: [...prev.menu, newMenuItem.trim()] }));
      setNewMenuItem('');
    }
  };

  const handleAddSemana = () => {
    if (newSemana.menu.length > 0) {
      setNewDietaPayload(prev => ({
        ...prev,
        semanas: [
          ...prev.semanas,
          { ...newSemana, menu: newSemana.menu.filter(item => item.trim() !== '') }
        ]
      }));
      setNewSemana({ semana: newSemana.semana + 1, menu: [] });
    } else {
      alert("Por favor, añade al menos un elemento al menú para la semana actual.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!dietaNombre || !dietaDescripcion || !dietaFechaAsignacion) {
        alert('Completa nombre, descripción y fecha.');
        return;
      }
      if (!newDietaPayload.paciente_id || !newDietaPayload.plan_id) {
        alert('Selecciona paciente y plan.');
        return;
      }
      if (newDietaPayload.semanas.length === 0) {
        alert('Añade al menos una semana.');
        return;
      }
      if (newDietaPayload.semanas.some(s => s.menu.length === 0 || s.menu.some(m => !m.trim()))) {
        alert('Verifica que todos los menús de semana tengan elementos.');
        return;
      }

      const payloadToSend: CreateDietaPayload = {
        paciente_id: newDietaPayload.paciente_id,
        plan_id: newDietaPayload.plan_id,
        semanas: newDietaPayload.semanas,
        nombre: dietaNombre,
        descripcion: dietaDescripcion,
        fechaAsignacion: dietaFechaAsignacion,
      };

      const result = await createDieta(payloadToSend);
      setDietas(prev => [...prev, result]);
      setNewDietaPayload({ paciente_id: user?.id || '', semanas: [], plan_id: '' });
      setDietaNombre('');
      setDietaDescripcion('');
      setDietaFechaAsignacion(new Date().toISOString().split('T')[0]);
      setNewSemana({ semana: 1, menu: [] });
      setNewMenuItem('');
      alert('Dieta creada con éxito.');
    } catch (error) {
      alert('Error al agregar la dieta.');
      // Opcional: console.error(error);
    }
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor inicia sesión para visualizar las dietas disponibles.
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h1 className="mb-4 text-center text-success fw-bold">Dietas Asignadas 🥗</h1>
      <p className="text-muted text-center mb-4">
        Registra y accede a tus dietas semanales personalizadas.
      </p>

      {/* FORMULARIO NUEVA DIETA */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="card shadow-sm p-4 border-0">
          <h4 className="mb-3 text-success fw-semibold">Agregar nueva dieta</h4>
          <div className="row g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                name="nombre"
                placeholder="Nombre de la Dieta"
                value={dietaNombre}
                onChange={handleOtherInputChange}
                required
              />
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                name="plan_id"
                value={newDietaPayload.plan_id}
                onChange={handleDietaPayloadChange}
                required
              >
                <option value="">Selecciona un plan</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-12">
              <textarea
                className="form-control"
                name="descripcion"
                placeholder="Descripción de la Dieta"
                value={dietaDescripcion}
                onChange={handleOtherInputChange}
                required
                rows={2}
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                name="fechaAsignacion"
                type="date"
                placeholder="Fecha de Asignación"
                value={dietaFechaAsignacion}
                onChange={handleOtherInputChange}
                required
              />
            </div>
            {/* Selector de Paciente */}
            <div className="col-md-6">
              <select
                className="form-select"
                name="paciente_id"
                value={newDietaPayload.paciente_id}
                onChange={handleDietaPayloadChange}
                required
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map(paciente => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nombre || paciente.email}
                  </option>
                ))}
              </select>
            </div>
            {/* Semana y menú */}
            <div className="col-md-3 mb-2">
              <input
                className="form-control"
                name="semana"
                type="number"
                value={newSemana.semana}
                onChange={handleSemanaChange}
                min={1}
              />
            </div>
            <div className="col-md-6 mb-2 d-flex">
              <input
                className="form-control me-2"
                placeholder="Elemento menú"
                value={newMenuItem}
                onChange={(e) => setNewMenuItem(e.target.value)}
              />
              <button type="button" className="btn btn-outline-secondary" onClick={handleMenuItemAdd}>+</button>
            </div>
            <div className="col-md-3 mb-2">
              <button type="button" className="btn btn-info w-100" onClick={handleAddSemana}>
                Añadir Semana
              </button>
            </div>
            <div className="col-md-12">
              <ul className="list-group">
                {newSemana.menu.length > 0 && (
                  <li className="list-group-item bg-light text-muted">
                    Menú actual Semana {newSemana.semana}: {newSemana.menu.join(', ')}
                  </li>
                )}
                {newDietaPayload.semanas.map((s, i) => (
                  <li key={i} className="list-group-item">
                    <strong>Semana {s.semana}:</strong> {s.menu.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="btn btn-success mt-3 w-100" type="submit">
            Crear Dieta
          </button>
        </div>
      </form>

      {/* LISTA DE DIETAS */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando dietas...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {dietas.length > 0 ? (
            dietas
              .slice()
              .sort((a, b) =>
                b.fechaAsignacion && a.fechaAsignacion
                  ? new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime()
                  : 0
              )
              .map((dieta) => (
                <div key={dieta._id || dieta.id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow border-0 dieta-card">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-success fw-bold mb-2">
                        {dieta.nombre || 'Nombre no disponible'}
                      </h5>
                      <p className="card-text mb-1">{dieta.descripcion || 'Descripción no disponible'}</p>
                      <span className="badge rounded-pill bg-success-subtle text-success mb-2">
                        {dieta.fechaAsignacion
                          ? "Asignada: " +
                            new Date(dieta.fechaAsignacion).toLocaleDateString('es-ES', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })
                          : 'No asignada'}
                      </span>
                      <div className="mb-2">
                        <span className="badge bg-light text-dark me-1">
                          {/* CONVERTING TO NUMBER HERE */}
                          🧾 Plan: {planes.find(p => p.id === Number(dieta.plan_id))?.nombre || dieta.plan_id}
                        </span>
                        <span className="badge bg-light text-dark">
                          {/* CONVERTING TO NUMBER HERE */}
                          👤 Paciente: {pacientes.find(p => p.id === Number(dieta.paciente_id))?.nombre || dieta.paciente_id}
                        </span>
                      </div>
                      <div>
                        {dieta.semanas && dieta.semanas.length > 0 && (
                          <details className="mb-0">
                            <summary className="fw-semibold text-success" style={{ cursor: "pointer" }}>
                              Menú Semanal <span style={{ fontSize: 12 }}>▼</span>
                            </summary>
                            <ul className="list-group mt-2">
                              {dieta.semanas.map((s, idx) => (
                                <li key={idx} className="list-group-item py-1">
                                  <strong>Semana {s.semana}:</strong> {s.menu.join(', ')}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="col-12 text-center">No hay dietas disponibles actualmente.</p>
          )}
        </div>
      )}
    </div>
  );
}