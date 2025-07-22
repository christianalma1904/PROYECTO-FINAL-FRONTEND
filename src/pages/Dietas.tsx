// src/pages/Dietas.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Importa CreateDietaPayload aquí
import { Dieta, getAllDietas, createDieta, SemanaDieta, CreateDietaPayload } from '../api/dietas';
import { getPlanes, Plan } from '../api/planes';

export default function Dietas() {
  const { token, isAuthenticated, user } = useAuth();
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // *** CAMBIO CLAVE AQUÍ: Usar CreateDietaPayload directamente ***
  const [newDieta, setNewDieta] = useState<CreateDietaPayload>({
    // Eliminamos 'nombre', 'descripcion', 'fechaAsignacion' de la inicialización
    paciente_id: user?.id || '', // Asegúrate de que user.id existe al inicializar
    semanas: [],
    plan_id: ''
  });

  const [newSemana, setNewSemana] = useState<SemanaDieta>({ semana: 1, menu: [] });
  const [newMenuItem, setNewMenuItem] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [dietasData, planesData] = await Promise.all([
          getAllDietas(),
          getPlanes(),
        ]);

        setDietas(dietasData);
        setPlanes(planesData);
      } catch (err: any) {
        setError('Error al cargar dietas o planes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && token) fetchData();
    // También asegúrate de que si el user.id cambia después de la primera renderización,
    // el paciente_id se actualice si es necesario, o que user.id esté disponible pronto.
    if (user?.id && newDieta.paciente_id === '') {
        setNewDieta(prev => ({ ...prev, paciente_id: user.id }));
    }
  }, [isAuthenticated, token, user?.id, newDieta.paciente_id]); // Añadir user.id a las dependencias

  // *** FUNCIONES QUE ESTABAN FALTANDO O ERAN INCOMPLETAS ***
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Solo actualiza los campos que existen en CreateDietaPayload
    // TypeScript te avisará si intentas asignar 'nombre' o 'descripcion'
    setNewDieta(prev => ({ ...prev, [name]: value }));
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
    if (newSemana.menu.length > 0 || newSemana.semana) { // Asegúrate de que haya algo en la semana
      setNewDieta(prev => ({
        ...prev,
        semanas: [...prev.semanas, newSemana]
      }));
      setNewSemana({ semana: newSemana.semana + 1, menu: [] }); // Incrementa la semana para la siguiente
    } else {
        alert("Por favor, añade al menos un elemento al menú o asigna un número de semana.");
    }
  };
  // *** FIN DE LAS FUNCIONES QUE ESTABAN FALTANDO ***

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // **IMPORTANTE PARA DEPURACIÓN:** Confirma el payload final aquí
      console.log("Payload enviado a createDieta:", newDieta);

      const result = await createDieta(newDieta); // newDieta ahora es CreateDietaPayload
      setDietas(prev => [...prev, result]);
      
      // Resetear el formulario al estado inicial de CreateDietaPayload
      setNewDieta({
        paciente_id: user?.id || '',
        semanas: [],
        plan_id: ''
      });
      setNewSemana({ semana: 1, menu: [] });
      setNewMenuItem('');
    } catch (error) {
      alert('Error al agregar la dieta.');
      console.error("Error al crear la dieta:", error); // Muestra el error en consola
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
            {/* Si el backend NO quiere nombre, descripcion, fechaAsignacion en el POST,
                estos inputs NO DEBEN estar asociados a newDieta para el POST.
                Los he comentado como se sugirió. Si tu UI necesita que el usuario ingrese
                estos datos, necesitarás un estado separado para ellos
                o un endpoint de API diferente.
            */}
            {/*
            <div className="col-md-6 mb-2">
              <input
                className="form-control"
                name="nombre"
                placeholder="Nombre"
                // 'newDieta' ya no tiene 'nombre', 'descripcion', 'fechaAsignacion'
                // por lo que estos bindings (value={newDieta.nombre}) causarían errores de tipo
                // y deben ser eliminados o movidos a un estado temporal si la UI los requiere.
                value={newDieta.nombre || ''} // Esto ahora es inválido
                onChange={handleInputChange}
                required
              />
            </div>
            */}
            <div className="col-md-6 mb-2">
              <select
                className="form-select"
                name="plan_id"
                value={newDieta.plan_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un plan</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                ))}
              </select>
            </div>
            {/*
            <div className="col-md-12 mb-2">
              <textarea
                className="form-control"
                name="descripcion"
                placeholder="Descripción"
                value={newDieta.descripcion || ''} // Esto ahora es inválido
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <input
                className="form-control"
                name="fechaAsignacion"
                type="date"
                value={newDieta.fechaAsignacion || ''} // Esto ahora es inválido
                onChange={handleInputChange}
                required
              />
            </div>
            */}
            {/* Inputs para semanas y menuItem siguen siendo válidos */}
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
                {/* Asegúrate de que newDieta.semanas siempre sea un array antes de mapear */}
                {newDieta.semanas && newDieta.semanas.map((s, i) => (
                  <li key={i} className="list-group-item">
                    Semana {s.semana}: {s.menu.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-12">
              <button type="button" className="btn btn-info w-100" onClick={handleAddSemana}>Añadir Semana</button>
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
                    {/* Estos campos sí son válidos para mostrar si vienen de la API (GET) */}
                    <h5 className="card-title">{dieta.nombre}</h5>
                    <p className="card-text">{dieta.descripcion}</p>
                    <p className="card-text"><strong>📆 Fecha:</strong> {dieta.fechaAsignacion}</p>
                    <p className="card-text"><strong>🧾 Plan ID:</strong> {dieta.plan_id}</p>
                    <p className="card-text"><strong>👤 Paciente ID:</strong> {dieta.paciente_id}</p>
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