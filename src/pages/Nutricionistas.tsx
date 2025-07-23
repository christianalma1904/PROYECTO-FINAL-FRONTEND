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
    // eslint-disable-next-line
  }, []);

  const fetchNutricionistas = async () => {
    setLoading(true);
    try {
      const data = await getNutricionistas();
      setNutricionistas(data);
    } catch (err) {
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
    <div className="container mt-5 mb-5">
      <h1 className="mb-4 text-center text-success fw-bold">Gestión de Nutricionistas 🥼</h1>
      <p className="text-muted text-center mb-4">
        Crea y visualiza los profesionales encargados de guiar a los pacientes.
      </p>

      <div className="card shadow-sm p-4 mb-4 border-0">
        <h4 className="mb-3 text-success fw-semibold">Agregar nuevo nutricionista</h4>
        <div className="row g-2">
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
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="col-12 mt-2">
            <button className="btn btn-success w-100" onClick={handleCreate}>
              Agregar Nutricionista
            </button>
          </div>
        </div>
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
              <div key={n.id} className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card shadow h-100 border-0 nutricionista-card">
                  <div className="card-body d-flex flex-column align-items-center text-center">
                    <div
                      className="rounded-circle bg-success mb-3"
                      style={{
                        width: 66,
                        height: 66,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        color: '#fff',
                        background: "linear-gradient(120deg,#27ae60 65%,#38b000 100%)",
                        fontWeight: 600,
                        boxShadow: "0 2px 8px 0 rgba(52,199,89,0.11)"
                      }}
                    >
                      {n.nombre ? n.nombre[0].toUpperCase() : '🧑‍⚕️'}
                    </div>
                    <h5 className="card-title text-success fw-bold mb-1">{n.nombre}</h5>
                    <p className="card-text mb-1">
                      <span className="fw-semibold">Especialidad:</span> <span className="text-secondary">{n.especialidad}</span>
                    </p>
                    <p className="card-text mb-0">
                      <span className="fw-semibold">Email:</span> <span className="text-secondary">{n.email}</span>
                    </p>
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
