// src/pages/Seguimiento.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPacientes, Paciente } from '../api/pacientes';
import { getAllSeguimiento, createSeguimiento, SeguimientoEntry, CreateSeguimientoPayload } from '../api/seguimiento';

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
  const [fotos, setFotos] = useState<string[]>([]); // <-- VUELVE A AÑADIR ESTA LÍNEA para el estado de fotos

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
      console.error("Error al cargar datos:", err);
      setError("Ocurrió un problema al cargar los datos de seguimiento o pacientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSeguimientoAndPacientes();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert("No estás autenticado.");
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
      fotos: fotos, // <-- VUELVE A AÑADIR ESTA LÍNEA en el payload (fotos es un array vacío por defecto)
    };

    try {
      const newEntry = await createSeguimiento(payload);
      setSeguimiento(prev => [...prev, newEntry]);
      alert('Registro de seguimiento agregado con éxito.');
      setSelectedPacienteId(undefined);
      setPeso(undefined);
      setFecha(new Date().toISOString().split('T')[0]);
      setSemana(1);
      setFotos([]); // <-- VUELVE A AÑADIR ESTA LÍNEA para resetear el estado de fotos
    } catch (error) {
      alert('Error al agregar el registro de seguimiento. Revisa la consola para más detalles.');
      console.error('Error al crear seguimiento:', error);
    }
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor inicia sesión para ver y registrar el seguimiento.
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Gestión de Seguimiento de Pacientes 📈</h1>
      <p className="text-muted text-center mb-4">
        Registra el progreso de peso y otros indicadores clave para tus pacientes.
      </p>

      {/* Formulario para agregar seguimiento */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="card shadow-sm p-4">
          <h4 className="mb-3">Agregar nuevo registro de seguimiento</h4>
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
            {/* Vuelve a añadir el input para fotos, pero no es estrictamente necesario si solo envías el array vacío */}
            <div className="col-md-12 mb-2">
              <input
                className="form-control"
                type="text"
                placeholder="URL de foto (opcional)"
                value={fotos[0] || ''} // Muestra la primera URL si existe
                onChange={(e) => setFotos(e.target.value ? [e.target.value] : [])} // Guarda como array
              />
            </div>
          </div>
          <button className="btn btn-success mt-3 w-100" type="submit">
            Agregar Registro
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando historial de seguimiento...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {seguimiento.length > 0 ? (
            <div className="col-12">
              <h4 className="mb-3">Historial de Seguimiento</h4>
              <ul className="list-group">
                {seguimiento.map((entry) => (
                  <li key={entry.id || entry._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Paciente:</strong> {pacientes.find(p => p.id === Number(entry.paciente_id))?.nombre || 'Desconocido'} -{' '}
                      <strong>Fecha:</strong> {new Date(entry.fecha).toLocaleDateString()} -{' '}
                      <strong>Peso:</strong> {entry.peso} kg -{' '}
                      <strong>Semana:</strong> {entry.semana}
                      {entry.fotos && entry.fotos.length > 0 && ( // <-- Muestra fotos si existen
                        <p className="mb-0 text-muted">Fotos: {entry.fotos.join(', ')}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="col-12 text-center">No hay registros de seguimiento. ¡Comienza a registrar!</p>
          )}
        </div>
      )}
    </div>
  );
}