// src/pages/Dietas.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// IMPORTANTE: Asegúrate que Dieta, getAllDietas, createDieta y CreateDietaPayload sean exportados correctamente desde '../api/dietas'
import { Dieta, getAllDietas, createDieta, CreateDietaPayload, SemanaDieta } from '../api/dietas';
import { getPlanes, Plan } from '../api/planes';

export default function Dietas() {
  const { token, isAuthenticated, user } = useAuth();
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]); // Para el selector de planes si es necesario

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el formulario de nueva dieta
  const [newDieta, setNewDieta] = useState<Omit<Dieta, '_id' | 'id'>>({
    nombre: '',
    descripcion: '',
    paciente_id: user?.id || '', // Asigna el ID del usuario logueado por defecto
    fechaAsignacion: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    semanas: [], // Inicializa como un array vacío
    plan_id: '' // Opcional, inicializa si es necesario
  });

  const [newSemana, setNewSemana] = useState<SemanaDieta>({
    semana: 1,
    menu: [],
  });
  const [newMenuItem, setNewMenuItem] = useState<string>('');


  useEffect(() => {
    async function fetchDietasAndPlanes() {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !token || !user?.id) {
        setError("No autenticado. Por favor, inicia sesión para ver y gestionar dietas.");
        setLoading(false);
        return;
      }

      try {
        // Cargar todas las dietas (para administradores) o las del usuario (si la vista es de paciente)
        // Para esta vista de "Dietas", asumiremos que un administrador ve todas, o un paciente ve las suyas.
        // Si esta página la usa un admin, usar getAllDietas. Si es para un paciente, usar getMyDietas(user.id).
        // Por la forma en que estaba, se parece más a una vista de admin, así que mantendremos getAllDietas.
        const dietasData = await getAllDietas();
        setDietas(dietasData);

        // Cargar planes si se van a asignar a las dietas desde aquí
        const planesData = await getPlanes();
        setPlanes(planesData);

      } catch (err: any) {
        console.error("Error al cargar dietas o planes:", err);
        setError(err.message || "Error al cargar las dietas o planes.");
      } finally {
        setLoading(false);
      }
    }
    fetchDietasAndPlanes();
  }, [isAuthenticated, token, user]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDieta(prev => ({ ...prev, [name]: value }));
  };

  const handleSemanaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSemana(prev => ({ ...prev, [name]: name === 'semana' ? parseInt(value) : value }));
  };

  const handleMenuItemAdd = () => {
    if (newMenuItem.trim() !== '') {
      setNewSemana(prev => ({
        ...prev,
        menu: [...prev.menu, newMenuItem.trim()]
      }));
      setNewMenuItem('');
    }
  };

  const handleAddSemana = () => {
    if (newSemana.menu.length > 0) {
      setNewDieta(prev => ({
        ...prev,
        semanas: [...prev.semanas, newSemana]
      }));
      setNewSemana({ semana: (newDieta.semanas.length > 0 ? Math.max(...newDieta.semanas.map(s => s.semana)) + 1 : 1), menu: [] });
    } else {
      alert("El menú de la semana no puede estar vacío.");
    }
  };


  const handleCreateDieta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Asegurarse de que paciente_id esté establecido
      if (!newDieta.paciente_id && user?.id) {
        setNewDieta(prev => ({ ...prev, paciente_id: user.id! }));
      }
      const createdDieta = await createDieta(newDieta);
      setDietas(prev => [...prev, createdDieta]);
      // Limpiar formulario
      setNewDieta({
        nombre: '',
        descripcion: '',
        paciente_id: user?.id || '',
        fechaAsignacion: new Date().toISOString().split('T')[0],
        semanas: [],
        plan_id: ''
      });
      setNewSemana({ semana: 1, menu: [] });
      setNewMenuItem('');
      alert('Dieta creada exitosamente!');
    } catch (err: any) {
      console.error("Error al crear dieta:", err);
      alert(`Error al crear dieta: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="container mt-5">Cargando dietas...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Gestión de Dietas</h1>

      {/* Formulario para Crear Nueva Dieta */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Crear Nueva Dieta</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateDieta}>
            <div className="mb-3">
              <label htmlFor="nombreDieta" className="form-label">Nombre de la Dieta</label>
              <input
                type="text"
                className="form-control"
                id="nombreDieta"
                name="nombre"
                value={newDieta.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="descripcionDieta" className="form-label">Descripción</label>
              <textarea
                className="form-control"
                id="descripcionDieta"
                name="descripcion"
                value={newDieta.descripcion}
                onChange={handleInputChange}
                rows={3}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="pacienteId" className="form-label">ID del Paciente</label>
              <input
                type="text"
                className="form-control"
                id="pacienteId"
                name="paciente_id"
                value={newDieta.paciente_id}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="planId" className="form-label">Plan Asociado (Opcional)</label>
              <select
                className="form-select"
                id="planId"
                name="plan_id"
                value={newDieta.plan_id || ''}
                onChange={handleInputChange}
              >
                <option value="">Selecciona un plan</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="fechaAsignacion" className="form-label">Fecha de Asignación</label>
              <input
                type="date"
                className="form-control"
                id="fechaAsignacion"
                name="fechaAsignacion"
                value={newDieta.fechaAsignacion}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Sección para añadir Semanas y Menús */}
            <div className="card mb-3">
              <div className="card-header">
                <h6>Añadir Semanas y Menús</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="semanaNum" className="form-label">Número de Semana</label>
                  <input
                    type="number"
                    className="form-control"
                    id="semanaNum"
                    name="semana"
                    value={newSemana.semana}
                    onChange={handleSemanaChange}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="menuItem" className="form-label">Elemento del Menú para esta semana</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="menuItem"
                      value={newMenuItem}
                      onChange={(e) => setNewMenuItem(e.target.value)}
                      placeholder="Ej: Pollo a la plancha con vegetales"
                    />
                    <button className="btn btn-outline-secondary" type="button" onClick={handleMenuItemAdd}>Añadir Elemento</button>
                  </div>
                  <div className="mt-2">
                    <h6>Elementos actuales del menú para Semana {newSemana.semana}:</h6>
                    {newSemana.menu.length > 0 ? (
                      <ul>
                        {newSemana.menu.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No hay elementos de menú añadidos para esta semana.</p>
                    )}
                  </div>
                </div>
                <button type="button" className="btn btn-info" onClick={handleAddSemana}>
                  Añadir Semana Completa
                </button>
                <div className="mt-3">
                  <h6>Semanas añadidas a la dieta:</h6>
                  {newDieta.semanas.length > 0 ? (
                    <ul>
                      {newDieta.semanas.map((s, idx) => (
                        <li key={idx}>Semana {s.semana}: {s.menu.join(', ')}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay semanas añadidas a esta dieta.</p>
                  )}
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Crear Dieta</button>
          </form>
        </div>
      </div>

      {/* Lista de Dietas Existentes */}
      <h2 className="mt-5">Dietas Existentes</h2>
      <div className="row">
        {dietas.length > 0 ? (
          dietas.map((dieta) => (
            <div key={dieta._id || dieta.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{dieta.nombre}</h5>
                  <p className="card-text">{dieta.descripcion || 'Sin descripción'}</p>
                  <p className="card-text">ID Paciente: {dieta.paciente_id}</p>
                  {dieta.plan_id && <p className="card-text">ID Plan: {dieta.plan_id}</p>} {/* Condicional */}
                  <p className="card-text"><small className="text-muted">Asignada el: {dieta.fechaAsignacion || 'N/A'}</small></p>
                  {dieta.semanas && dieta.semanas.length > 0 && ( // Condicional para semanas
                    <>
                      <h6>Semanas:</h6>
                      <ul>
                        {dieta.semanas.map((s, idx) => (
                          <li key={idx}>Semana {s.semana}: {s.menu.join(', ')}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-12">No hay dietas disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
}