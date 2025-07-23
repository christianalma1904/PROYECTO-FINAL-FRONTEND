import React, { useEffect, useState, useReducer, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dieta, getAllDietas, createDieta, updateDieta, deleteDieta,
  SemanaDieta, CreateDietaPayload
} from '../api/dietas';
import { getPlanes, Plan } from '../api/planes';
import { getPacientes, Paciente } from '../api/pacientes';

// Interfaces para el estado del formulario
interface DietaFormState {
  nombre: string;
  descripcion: string;
  fechaAsignacion: string;
  paciente_id: string;
  plan_id: string;
  semanas: SemanaDieta[];
  currentSemanaNum: number;
  currentSemanaMenu: string[];
  newMenuItem: string;
}

type DietaFormAction =
  | { type: 'RESET_FORM' }
  | { type: 'SET_FIELD'; field: keyof DietaFormState; value: string }
  | { type: 'SET_CURRENT_SEMANA_NUM'; value: number }
  | { type: 'ADD_MENU_ITEM'; item: string }
  | { type: 'ADD_SEMANA' }
  | { type: 'LOAD_DIETA_FOR_EDIT'; dieta: Dieta };

const dietaFormReducer = (state: DietaFormState, action: DietaFormAction): DietaFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      if (Object.prototype.hasOwnProperty.call(state, action.field) && typeof state[action.field] === 'string') {
        return { ...state, [action.field]: action.value } as DietaFormState;
      }
      return state;
    case 'SET_CURRENT_SEMANA_NUM':
      return { ...state, currentSemanaNum: action.value };
    case 'ADD_MENU_ITEM':
      return { ...state, currentSemanaMenu: [...state.currentSemanaMenu, action.item], newMenuItem: '' };
    case 'ADD_SEMANA':
      const newSemana: SemanaDieta = {
        semana: state.currentSemanaNum,
        menu: state.currentSemanaMenu.filter(item => item.trim() !== '')
      };
      return {
        ...state,
        semanas: [...state.semanas, newSemana],
        currentSemanaNum: state.currentSemanaNum + 1,
        currentSemanaMenu: [],
      };
    case 'LOAD_DIETA_FOR_EDIT':
      return {
        ...state,
        nombre: action.dieta.nombre || '',
        descripcion: action.dieta.descripcion || '',
        fechaAsignacion: action.dieta.fechaAsignacion ? action.dieta.fechaAsignacion.split('T')[0] : new Date().toISOString().split('T')[0],
        paciente_id: action.dieta.paciente_id || '',
        plan_id: action.dieta.plan_id || '',
        semanas: action.dieta.semanas || [],
        currentSemanaNum: (action.dieta.semanas?.length ? Math.max(...action.dieta.semanas.map(s => s.semana)) + 1 : 1),
        currentSemanaMenu: [],
        newMenuItem: ''
      };
    case 'RESET_FORM':
      return {
        nombre: '',
        descripcion: '',
        fechaAsignacion: new Date().toISOString().split('T')[0],
        paciente_id: '',
        plan_id: '',
        semanas: [],
        currentSemanaNum: 1,
        currentSemanaMenu: [],
        newMenuItem: ''
      };
    default:
      return state;
  }
};

export default function Dietas() {
  const { token, isAuthenticated, user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const initialFormState: DietaFormState = {
    nombre: '',
    descripcion: '',
    fechaAsignacion: new Date().toISOString().split('T')[0],
    paciente_id: user?.id || '',
    plan_id: '',
    semanas: [],
    currentSemanaNum: 1,
    currentSemanaMenu: [],
    newMenuItem: '',
  };

  const [formState, dispatch] = useReducer(dietaFormReducer, initialFormState);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
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
        setError('Error al cargar dietas, planes o pacientes. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token]);

  // Sincronizar paciente_id con el usuario loggeado si es el primero en cargar
  useEffect(() => {
    if (user?.id && formState.paciente_id === '') {
      dispatch({ type: 'SET_FIELD', field: 'paciente_id', value: user.id });
    }
  }, [user?.id, formState.paciente_id]);

  // HANDLERS FORM
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in formState && typeof formState[name as keyof DietaFormState] === 'string') {
      dispatch({ type: 'SET_FIELD', field: name as keyof DietaFormState, value });
    }
  }, [formState]);

  const handleSemanaNumChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_CURRENT_SEMANA_NUM', value: parseInt(e.target.value) || 1 });
  }, []);

  const handleNewMenuItemChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FIELD', field: 'newMenuItem', value: e.target.value });
  }, []);

  const handleMenuItemAdd = useCallback(() => {
    if (formState.newMenuItem.trim()) {
      dispatch({ type: 'ADD_MENU_ITEM', item: formState.newMenuItem.trim() });
    }
  }, [formState.newMenuItem]);

  const handleAddSemana = useCallback(() => {
    if (formState.currentSemanaMenu.length > 0) {
      dispatch({ type: 'ADD_SEMANA' });
    } else {
      alert("Por favor, añade al menos un elemento al menú para la semana actual antes de añadir la semana.");
    }
  }, [formState.currentSemanaMenu]);

  // HANDLERS DIETA
  const handleEditarDieta = useCallback((dieta: Dieta) => {
    setEditandoId(dieta._id || dieta.id || null);
    dispatch({ type: 'LOAD_DIETA_FOR_EDIT', dieta });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEliminarDieta = useCallback(async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta dieta? Esta acción es irreversible.')) return;
    try {
      await deleteDieta(id);
      setDietas(prev => prev.filter(d => (d._id || d.id) !== id));
      alert('Dieta eliminada con éxito.');
    } catch {
      alert('Error al eliminar la dieta. Por favor, inténtalo de nuevo.');
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, descripcion, fechaAsignacion, paciente_id, plan_id, semanas } = formState;

    if (!nombre.trim() || !descripcion.trim() || !fechaAsignacion) {
      alert('Por favor, completa el nombre, la descripción y la fecha de asignación de la dieta.');
      return;
    }
    if (!paciente_id || !plan_id) {
      alert('Por favor, selecciona un paciente y un plan para la dieta.');
      return;
    }
    if (semanas.length === 0) {
      alert('Debes añadir al menos una semana con su menú a la dieta.');
      return;
    }
    if (semanas.some(s => s.menu.length === 0 || s.menu.some(m => !m.trim()))) {
      alert('Verifica que todas las semanas añadidas tengan al menos un elemento de menú válido.');
      return;
    }

    const payloadToSend: CreateDietaPayload = {
      nombre,
      descripcion,
      fechaAsignacion,
      paciente_id,
      plan_id,
      semanas: semanas.map(s => ({ ...s, menu: s.menu.map(item => item.trim()) })),
    };

    try {
      if (editandoId) {
        const updatedDieta = await updateDieta(editandoId, payloadToSend);
        setDietas(prev =>
          prev.map(d => (d._id === editandoId || d.id === editandoId ? updatedDieta : d))
        );
        setEditandoId(null);
        alert('Dieta actualizada con éxito.');
      } else {
        const newDieta = await createDieta(payloadToSend);
        setDietas(prev => [...prev, newDieta]);
        alert('Dieta creada con éxito.');
      }
      dispatch({ type: 'RESET_FORM' });
    } catch {
      alert('Hubo un error al guardar la dieta. Por favor, inténtalo de nuevo.');
    }
  }, [formState, editandoId]);

  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning text-center">
        Por favor, <b>inicia sesión</b> para visualizar y gestionar las dietas disponibles.
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h1 className="mb-4 text-center text-success fw-bold">Gestión de Dietas 🥗</h1>
      <p className="text-muted text-center mb-4">
        Administra las dietas personalizadas para tus pacientes, asignando planes y detallando los menús semanales.
      </p>

      {/* SOLO ADMIN: FORMULARIO DE DIETA */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 shadow-sm rounded-3 bg-light">
          <h4 className="mb-4 text-success fw-semibold border-bottom pb-2">
            {editandoId ? "Editar Dieta Existente" : "Crear Nueva Dieta"}
          </h4>
          <div className="row g-3">
            <div className="col-md-6">
              <input
                id="nombreDieta"
                className="form-control"
                name="nombre"
                placeholder="Nombre de la Dieta (ej. Dieta Keto)"
                value={formState.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6">
              <select
                id="planId"
                className="form-select"
                name="plan_id"
                value={formState.plan_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un plan nutricional</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-12">
              <textarea
                id="descripcionDieta"
                className="form-control"
                name="descripcion"
                placeholder="Describe brevemente esta dieta"
                value={formState.descripcion}
                onChange={handleInputChange}
                required
                rows={2}
              />
            </div>
            <div className="col-md-6">
              <input
                id="fechaAsignacion"
                className="form-control"
                name="fechaAsignacion"
                type="date"
                value={formState.fechaAsignacion}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6">
              <select
                id="pacienteId"
                className="form-select"
                name="paciente_id"
                value={formState.paciente_id}
                onChange={handleInputChange}
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
            {/* Menú semanal */}
            <div className="col-12 mt-4">
              <h5 className="mb-3 text-secondary">Añadir Menú Semanal</h5>
              <div className="row g-2 align-items-end">
                <div className="col-md-3">
                  <input
                    id="semanaNum"
                    className="form-control"
                    name="semana"
                    type="number"
                    value={formState.currentSemanaNum}
                    onChange={handleSemanaNumChange}
                    min={1}
                  />
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      id="menuItem"
                      className="form-control"
                      placeholder="Ej. Pollo a la plancha, Arroz, Ensalada"
                      value={formState.newMenuItem}
                      onChange={handleNewMenuItemChange}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMenuItemAdd(); } }}
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={handleMenuItemAdd}>
                      Añadir Item
                    </button>
                  </div>
                </div>
                <div className="col-md-3">
                  <button type="button" className="btn btn-info w-100" onClick={handleAddSemana}>
                    Guardar Semana
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-12 mt-3">
              <h6 className="mb-2 text-primary">Menú de la Semana Actual:</h6>
              {formState.currentSemanaMenu.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {formState.currentSemanaMenu.map((item, index) => (
                    <li key={index} className="list-group-item py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted fst-italic">Aún no has añadido elementos al menú de esta semana.</p>
              )}
              <h6 className="mt-3 mb-2 text-success">Semanas Añadidas a la Dieta:</h6>
              {formState.semanas.length > 0 ? (
                <ul className="list-group">
                  {formState.semanas.map((s, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Semana {s.semana}:</strong> {s.menu.join(', ')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted fst-italic">No hay semanas añadidas a esta dieta aún.</p>
              )}
            </div>
            <div className="col-12 mt-4">
              <button className="btn btn-success w-100 py-2" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : editandoId ? "Actualizar Dieta" : "Crear Dieta"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary w-100 mt-2"
                  onClick={() => {
                    setEditandoId(null);
                    dispatch({ type: 'RESET_FORM' });
                  }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* LISTA DE DIETAS */}
      <hr className="my-5" />
      <h2 className="mb-4 text-center text-primary fw-bold">Listado de Dietas Existentes</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 fs-5 text-success">Cargando dietas...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center p-3">{error}</div>
      ) : (
        <div className="row g-4">
          {dietas.length > 0 ? (
            dietas
              .slice()
              .sort((a, b) =>
                b.fechaAsignacion && a.fechaAsignacion
                  ? new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime()
                  : 0
              )
              .map((dieta) => (
                <div key={dieta._id || dieta.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0 animate__animated animate__fadeInUp">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-success fw-bold mb-2">
                        {dieta.nombre || 'Dieta sin Nombre'}
                      </h5>
                      <p className="card-text text-muted mb-2 flex-grow-1">{dieta.descripcion || 'Sin descripción detallada.'}</p>
                      <hr className="my-2" />
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-success-subtle text-success">
                          📅 Asignada: {dieta.fechaAsignacion
                            ? new Date(dieta.fechaAsignacion).toLocaleDateString('es-ES', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })
                            : 'Fecha no disponible'}
                        </span>
                        <span className="badge bg-info-subtle text-info">
                          🧾 Plan: {planes.find(p => p.id === Number(dieta.plan_id))?.nombre || `ID: ${dieta.plan_id}`}
                        </span>
                        <span className="badge bg-primary-subtle text-primary">
                          👤 Paciente: {pacientes.find(p => p.id === Number(dieta.paciente_id))?.nombre || `ID: ${dieta.paciente_id}`}
                        </span>
                      </div>
                      {dieta.semanas && dieta.semanas.length > 0 && (
                        <details className="mb-3">
                          <summary className="fw-semibold text-primary" style={{ cursor: "pointer" }}>
                            Ver Menú Semanal ({dieta.semanas.length} semanas) <span className="ms-1" style={{ fontSize: '0.8em' }}>▼</span>
                          </summary>
                          <ul className="list-group list-group-flush mt-2 border rounded-1">
                            {dieta.semanas
                              .slice()
                              .sort((a, b) => a.semana - b.semana)
                              .map((s, idx) => (
                                <li key={idx} className="list-group-item py-2">
                                  <strong className="text-dark">Semana {s.semana}:</strong> <br />
                                  <small className="text-secondary">{s.menu.join(', ')}</small>
                                </li>
                              ))}
                          </ul>
                        </details>
                      )}
                      {/* BOTONES DE ACCIÓN SOLO PARA ADMIN */}
                      {isAdmin && (
                        <div className="d-flex gap-2 mt-auto pt-2 border-top">
                          <button
                            className="btn btn-outline-primary btn-sm flex-fill"
                            onClick={() => handleEditarDieta(dieta)}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm flex-fill"
                            onClick={() => handleEliminarDieta(dieta._id || dieta.id || '')}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="col-12 text-center alert alert-info py-4">
              ✨ ¡No hay dietas registradas aún! {isAdmin && 'Usa el formulario de arriba para añadir la primera.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
