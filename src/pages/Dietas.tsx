// src/pages/Dietas.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dieta, getAllDietas, createDieta, SemanaDieta, CreateDietaPayload } from '../api/dietas';
import { getPlanes, Plan } from '../api/planes';
import { getPacientes, Paciente } from '../api/pacientes'; // <-- Asegúrate de que esta línea esté presente

export default function Dietas() {
  const { token, isAuthenticated, user } = useAuth();
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          getPacientes(), // Esto ya estaba bien en la última versión que te di
        ]);

        setDietas(dietasData);
        setPlanes(planesData);
        setPacientes(pacientesData); // Esto ya estaba bien
      } catch (err: any) {
        setError('Error al cargar dietas, planes o pacientes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && token) fetchData();
    if (user?.id && newDietaPayload.paciente_id === '') {
        setNewDietaPayload(prev => ({ ...prev, paciente_id: user.id }));
    }
  }, [isAuthenticated, token, user?.id, newDietaPayload.paciente_id]);

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
    const { value } = e.target;
    setNewSemana(prev => ({ ...prev, semana: parseInt(value) }));
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
        semanas: [...prev.semanas, { ...newSemana, menu: newSemana.menu.filter(item => item.trim() !== '') }]
      }));
      setNewSemana({ semana: newSemana.semana + 1, menu: [] });
    } else {
        alert("Por favor, añade al menos un elemento al menú para la semana actual antes de añadirla.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("¡handleSubmit se está ejecutando!");
    try {
      if (!dietaNombre || !dietaDescripcion || !dietaFechaAsignacion) {
          console.log("Fallo de validación: Nombre, descripción o fecha vacíos.");
          alert('Por favor, completa el nombre, la descripción y la fecha de asignación de la dieta.');
          return;
      }
      if (!newDietaPayload.paciente_id || !newDietaPayload.plan_id) {
          console.log("Fallo de validación: Paciente o plan vacíos.");
          alert('Por favor, selecciona un paciente y un plan.');
          return;
      }
      if (newDietaPayload.semanas.length === 0) {
          console.log("Fallo de validación: No hay semanas añadidas.");
          alert('Por favor, añade al menos una semana a la dieta.');
          return;
      }
      if (newDietaPayload.semanas.some(s => s.menu.length === 0 || s.menu.some(m => !m.trim()))) {
          console.log("Fallo de validación: Algún menú de semana está vacío o contiene elementos vacíos.");
          alert('Asegúrate de que todas las semanas tengan al menos un elemento de menú y que no estén vacíos.');
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

      console.log("Payload FINAL enviado a createDieta:", payloadToSend);

      const result = await createDieta(payloadToSend);
      
      setDietas(prev => [...prev, result]);
      
      setNewDietaPayload({
        paciente_id: user?.id || '',
        semanas: [],
        plan_id: ''
      });
      setDietaNombre('');
      setDietaDescripcion('');
      setDietaFechaAsignacion(new Date().toISOString().split('T')[0]);
      setNewSemana({ semana: 1, menu: [] });
      setNewMenuItem('');
      alert('Dieta creada y asignada con éxito.');
    } catch (error) {
      alert('Error al agregar la dieta. Revisa la consola para más detalles.');
      console.error("Error al crear la dieta:", error);
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
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Dietas Asignadas 🥗</h1>
      <p className="text-muted text-center mb-4">
        Registra y accede a tus dietas semanales personalizadas.
      </p>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="card shadow-sm p-4">
          <h4 className="mb-3">Agregar nueva dieta</h4>
          <div className="row">
            <div className="col-md-6 mb-2">
              <input
                className="form-control"
                name="nombre"
                placeholder="Nombre de la Dieta"
                value={dietaNombre}
                onChange={handleOtherInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
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
            <div className="col-md-12 mb-2">
              <textarea
                className="form-control"
                name="descripcion"
                placeholder="Descripción de la Dieta"
                value={dietaDescripcion}
                onChange={handleOtherInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
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

            {/* Selector de Paciente - ¡CORREGIDO! */}
            <div className="col-md-6 mb-2">
                <label htmlFor="pacienteSelect" className="form-label">Paciente</label>
                <select
                  id="pacienteSelect"
                  className="form-select"
                  name="paciente_id"
                  value={newDietaPayload.paciente_id}
                  onChange={handleDietaPayloadChange}
                  required
                >
                  <option value="">Selecciona un paciente</option>
                  {pacientes.map(paciente => (
                    // Usar paciente.id y paciente.nombre
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre || paciente.email} {/* Prioriza 'nombre', si no existe usa 'email' */}
                    </option>
                  ))}
                  {/* Si el usuario logueado NO es un paciente que viene en la lista 'pacientes', puedes añadirlo.
                      Pero si tu API ya devuelve al propio usuario en la lista de pacientes, esta línea podría duplicar.
                  */}
                  {/* {user?.id && !pacientes.some(p => p.id === user.id) && ( // Usar p.id para la comparación
                      <option value={user.id}>{user.email} (Yo)</option>
                  )} */}
                </select>
            </div>

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
            <div className="col-md-3 mb-2 d-flex">
              <input
                className="form-control me-2"
                placeholder="Elemento menú"
                value={newMenuItem}
                onChange={(e) => setNewMenuItem(e.target.value)}
              />
              <button type="button" className="btn btn-outline-secondary" onClick={handleMenuItemAdd}>+</button>
            </div>
            <div className="col-md-12 mb-2">
              <ul className="list-group">
                {newSemana.menu.length > 0 && (
                    <li className="list-group-item bg-light text-muted">
                        Menú actual de Semana {newSemana.semana}: {newSemana.menu.join(', ')}
                    </li>
                )}
                {newDietaPayload.semanas && newDietaPayload.semanas.map((s, i) => (
                  <li key={i} className="list-group-item">
                    <strong>Semana {s.semana}:</strong> {s.menu.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-12">
              <button type="button" className="btn btn-info w-100" onClick={handleAddSemana}>Añadir Semana a la Dieta</button>
            </div>
          </div>
          <button className="btn btn-success mt-3 w-100" type="submit">
            Crear Dieta
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando dietas disponibles...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {dietas.length > 0 ? (
            dietas.map((dieta) => (
              <div key={dieta._id || dieta.id} className="col-md-4 mb-4">
                <div className="card shadow h-100">
                  <div className="card-body">
                    <h5 className="card-title">{dieta.nombre || 'Nombre no disponible'}</h5>
                    <p className="card-text">{dieta.descripcion || 'Descripción no disponible'}</p>
                    <p className="card-text">
                        <strong>📆 Fecha:</strong> {dieta.fechaAsignacion ? new Date(dieta.fechaAsignacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                    <p className="card-text"><strong>🧾 Plan ID:</strong> {dieta.plan_id || 'N/A'}</p>
                    <p className="card-text"><strong>👤 Paciente ID:</strong> {dieta.paciente_id || 'N/A'}</p>
                    {dieta.semanas && dieta.semanas.length > 0 && (
                      <ul className="list-group mt-2">
                        {dieta.semanas.map((s, idx) => (
                          <li key={idx} className="list-group-item">
                            <strong>Semana {s.semana}:</strong> {s.menu.join(', ')}
                          </li>
                        ))}
                      </ul>
                    )}
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