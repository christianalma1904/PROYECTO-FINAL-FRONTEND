// src/pages/Pacientes.tsx
import { useEffect, useState } from 'react';
import { getPacientes, createPaciente } from '../api/pacientes';
import { useAuth } from '../context/AuthContext';

export default function Pacientes() {
  const { isAuthenticated, token } = useAuth();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPacientes();
      setPacientes(data);
    } catch (err: any) {
      setError('Error al obtener los pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) fetchPacientes();
  }, [isAuthenticated, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      await createPaciente(form);
      await fetchPacientes();
      setForm({ nombre: '', email: '', password: '' });
    } catch (err) {
      alert('Error al crear el paciente.');
    }
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="container mt-5 alert alert-warning">
        Por favor inicia sesión para visualizar los pacientes.
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Gestión de Pacientes 👥</h1>
      <p className="text-muted text-center mb-4">
        Administra la información de pacientes registrados en el sistema.
      </p>

      <div className="card shadow-sm p-4 mb-4">
        <h4 className="mb-3">Agregar nuevo paciente</h4>
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              className="form-control"
              placeholder="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              className="form-control"
              placeholder="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              className="form-control"
              placeholder="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button className="btn btn-success mt-3 w-100" onClick={handleCreate}>
          Crear Paciente
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando pacientes...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {pacientes.length > 0 ? (
            pacientes.map((p) => (
              <div key={p.id} className="col-md-4 mb-4">
                <div className="card shadow h-100">
                  <div className="card-body">
                    <h5 className="card-title">{p.nombre}</h5>
                    <p className="card-text">📧 {p.email}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-12 text-center">No hay pacientes registrados actualmente.</p>
          )}
        </div>
      )}
    </div>
  );
}
