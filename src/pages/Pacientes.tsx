// src/pages/Pacientes.tsx
import { useEffect, useState } from 'react';
import { getPacientes, createPaciente, updatePaciente, deletePaciente } from '../api/pacientes';
import { useAuth } from '../context/AuthContext';

export default function Pacientes() {
  const { isAuthenticated, token, user } = useAuth(); // ⬅️ user debe tener { rol }
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Nuevo Paciente
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Edición inline
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Crear paciente
  const handleCreate = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.password.trim()) {
      setSuccess(null);
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError(null);
    try {
      await createPaciente(form);
      await fetchPacientes();
      setForm({ nombre: '', email: '', password: '' });
      setSuccess('Paciente creado exitosamente.');
      setTimeout(() => setSuccess(null), 1500);
    } catch (err) {
      setSuccess(null);
      setError('Error al crear el paciente.');
    }
  };

  // Iniciar edición
  const handleEdit = (paciente: any) => {
    setEditId(paciente.id);
    setEditForm({ nombre: paciente.nombre, email: paciente.email });
    setError(null);
    setSuccess(null);
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    if (!editForm.nombre.trim() || !editForm.email.trim()) {
      setError('No dejes campos vacíos.');
      return;
    }
    try {
      await updatePaciente(id, editForm);
      await fetchPacientes();
      setEditId(null);
      setSuccess('Paciente actualizado.');
      setTimeout(() => setSuccess(null), 1400);
    } catch {
      setError('Error al actualizar el paciente.');
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({ nombre: '', email: '' });
    setError(null);
  };

  // Eliminar paciente
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este paciente?')) {
      try {
        await deletePaciente(id);
        await fetchPacientes();
        setSuccess('Paciente eliminado.');
        setTimeout(() => setSuccess(null), 1300);
      } catch {
        setError('Error al eliminar el paciente.');
      }
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
    <div className="container mt-5 mb-5">
      <h1 className="mb-4 text-center text-success fw-bold">Gestión de Pacientes 👥</h1>
      <p className="text-muted text-center mb-4">
        Administra la información de pacientes registrados en el sistema.
      </p>

      {/* Feedback */}
      {success && <div className="alert alert-success text-center">{success}</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Formulario de agregar SOLO PARA ADMIN */}
      {user?.rol === 'admin' && (
        <div className="card shadow-sm p-4 mb-4 border-0">
          <h4 className="mb-3 text-success fw-semibold">Agregar nuevo paciente</h4>
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-4">
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
            <div className="col-12 col-md-4">
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
      )}

      {/* Listado */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2">Cargando pacientes...</p>
        </div>
      ) : (
        <div className="row">
          {pacientes.length > 0 ? (
            pacientes.map((p) => (
              <div key={p.id} className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card paciente-card h-100 shadow border-0 p-0 position-relative">
                  <div className="card-body d-flex flex-row align-items-center gap-3" style={{ minHeight: 80 }}>
                    {/* Avatar */}
                    <div className="bg-success d-flex justify-content-center align-items-center"
                      style={{
                        width: 48, height: 48, borderRadius: '50%', color: '#fff', fontSize: 24, fontWeight: 700, flexShrink: 0,
                        boxShadow: '0 2px 16px rgba(39,174,96,0.09)'
                      }}>
                      {p.nombre?.[0]?.toUpperCase() || p.email?.[0]?.toUpperCase() || '👤'}
                    </div>
                    <div className="flex-grow-1">
                      {editId === p.id ? (
                        <form className="d-flex flex-column flex-sm-row gap-2" onSubmit={e => { e.preventDefault(); handleSaveEdit(p.id); }}>
                          <input className="form-control" name="nombre" value={editForm.nombre}
                            onChange={handleEditChange} required />
                          <input className="form-control" name="email" value={editForm.email}
                            onChange={handleEditChange} required />
                        </form>
                      ) : (
                        <>
                          <div className="fw-bold text-success">{p.nombre}</div>
                          <div className="text-muted small" style={{ wordBreak: 'break-all' }}>
                            {p.email}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Acciones SOLO PARA ADMIN */}
                    <div className="d-flex flex-column gap-2 align-items-end">
                      {user?.rol === 'admin' && (
                        editId === p.id ? (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit(p.id)}>Guardar</button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={handleCancelEdit}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(p)}>Editar</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
                          </>
                        )
                      )}
                    </div>
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
