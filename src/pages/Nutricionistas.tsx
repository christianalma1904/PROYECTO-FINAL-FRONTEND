
// src/pages/Nutricionistas.tsx
import { useEffect, useState } from 'react';
import { getNutricionistas, createNutricionista } from '../api/nutricionistas';

export default function Nutricionistas() {
  const [nutricionistas, setNutricionistas] = useState<any[]>([]);
  const [form, setForm] = useState({ nombre: '', especialidad: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    fetchNutricionistas();
  }, []);

  const fetchNutricionistas = async () => {
    setLoading(true);
    try {
      const data = await getNutricionistas();
      setNutricionistas(data);
    } catch (err) {
      console.error('Error al cargar nutricionistas:', err);
      setError('No se pudieron cargar los nutricionistas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createNutricionista(form);
      setForm({ nombre: '', especialidad: '', email: '' });
      await fetchNutricionistas();
    } catch (err) {
      alert('Error al crear nutricionista.');
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor inicia sesión para visualizar los nutricionistas.
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Gestión de Nutricionistas 🥼</h1>
      <p className="text-muted text-center mb-4">
        Crea y visualiza los profesionales encargados de guiar a los pacientes.
      </p>

      <div className="card shadow-sm p-4 mb-4">
        <h4 className="mb-3">Agregar nuevo nutricionista</h4>
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              className="form-control"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              className="form-control"
              placeholder="Especialidad"
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>
        <button className="btn btn-success mt-3 w-100" onClick={handleCreate}>Agregar Nutricionista</button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando nutricionistas...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {nutricionistas.length > 0 ? (
            nutricionistas.map((n) => (
              <div key={n.id} className="col-md-4 mb-4">
                <div className="card shadow h-100">
                  <div className="card-body">
                    <h5 className="card-title">{n.nombre}</h5>
                    <p className="card-text">Especialidad: {n.especialidad}</p>
                    <p className="card-text">Email: {n.email}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-12 text-center">No hay nutricionistas registrados.</p>
          )}
        </div>
      )}
    </div>
  );
}
