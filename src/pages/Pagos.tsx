// src/pages/Pagos.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPagos, createPago, deletePago, updatePago } from '../api/pagos';
import { useAuth } from '../context/AuthContext'; // Importar useAuth

interface Plan {
  id: string; // Si el ID de la URL es string
  nombre: string;
  descripcion: string;
  precio: number;
}

interface Pago {
  id: number;
  paciente: number;
  plan: number | Plan; // Changed to allow Plan object as well
  monto: number;
  fecha: string;
}

// *** NUEVA FUNCIÓN DE GUARDA DE TIPO ***
// Esta función le dice a TypeScript que si value es un objeto con una propiedad 'id' de tipo string,
// entonces es seguro asumir que es un tipo 'Plan'.
function isPlan(value: any): value is Plan {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string';
}


export default function Pagos() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, token } = useAuth();

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [planDetails, setPlanDetails] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ tarjeta: '', fecha: '', codigo: '' });
  const [editando, setEditando] = useState<Pago | null>(null);
  const [pagoForm, setPagoForm] = useState({ paciente: 0, plan: 0, monto: 0, fecha: '' });

  // Función para obtener los detalles del plan si se está pagando uno específico
  const fetchPlanDetails = async (planId: string) => {
    setLoading(true);
    setError(null);
    try {
      setPlanDetails({
        id: planId,
        nombre: `Plan ${planId}`,
        descripcion: 'Plan adquirido con detalles simulados.',
        precio: 55.0,
      });
    } catch (err) {
      console.error("Error al cargar detalles del plan simulado:", err);
      setError("No se pudieron cargar los detalles del plan.");
      setPlanDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los pagos del usuario logueado
  const fetchPagos = async () => {
    setLoading(true);
    setError(null);
    if (!isAuthenticated || !user) {
        setError("Usuario no autenticado.");
        setLoading(false);
        return;
    }
    try {
      const pagosData = await getPagos();
      const parsedPagosData = pagosData.map(pago => ({
          ...pago,
          monto: typeof pago.monto === 'string' ? parseFloat(pago.monto) : pago.monto,
          // *** USANDO LA NUEVA FUNCIÓN DE GUARDA DE TIPO ***
          plan: isPlan(pago.plan)
                ? Number(pago.plan.id) // Si es un Plan válido, usa su ID
                : (typeof pago.plan === 'string' ? Number(pago.plan) : pago.plan) // Si no, sigue las reglas anteriores
      }));
      setPagos(parsedPagosData as Pago[]);
    } catch (err: any) {
      console.error("Error al cargar pagos:", err);
      setError("Ocurrió un problema al cargar los pagos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
        setLoading(false);
        return;
    }

    if (id) {
      fetchPlanDetails(id);
    } else {
      fetchPagos();
    }
  }, [id, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !planDetails) {
      alert("Faltan datos para procesar el pago.");
      return;
    }
    if (!isAuthenticated || !token) {
      alert("No estás autenticado para procesar pagos.");
      return;
      }

    try {
      await createPago({
        paciente: Number(user.id),
        plan: Number(id),
        monto: planDetails.precio || 0,
        fecha: new Date().toISOString().split('T')[0]
      });
      alert('Pago registrado con éxito.');
      setForm({ tarjeta: '', fecha: '', codigo: '' });
      if (!id) fetchPagos();
    } catch (err: any) {
      const errMsg = err.message || 'Error desconocido al procesar el pago.';
      alert(`Error al procesar el pago: ${errMsg}`);
      console.error('Error al procesar el pago:', err);
    }
  };

  const handleDelete = async (pagoId: number) => {
    if (window.confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await deletePago(pagoId);
        alert('Pago eliminado con éxito.');
        await fetchPagos();
      } catch (err: any) {
        const errMsg = err.message || 'Error desconocido al eliminar el pago.';
        alert(`Error al eliminar el pago: ${errMsg}`);
        console.error('Error al eliminar el pago:', err);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    try {
      // Ensure pagoForm.plan is a number before passing to updatePago
      const updatedPagoForm = {
          ...pagoForm,
          // *** USANDO LA NUEVA FUNCIÓN DE GUARDA DE TIPO ***
          plan: isPlan(pagoForm.plan)
                ? Number(pagoForm.plan.id)
                : Number(pagoForm.plan)
      };
      await updatePago(editando.id, updatedPagoForm);
      alert('Pago actualizado con éxito.');
      setEditando(null);
      await fetchPagos();
    } catch (err: any) {
      const errMsg = err.message || 'Error desconocido al actualizar el pago.';
      alert(`Error al actualizar el pago: ${errMsg}`);
      console.error('Error al actualizar el pago:', err);
    }
  };

  const startEdit = (p: Pago) => {
    setEditando(p);
    // When setting pagoForm, ensure plan is a number
    setPagoForm({
        paciente: p.paciente,
        // *** USANDO LA NUEVA FUNCIÓN DE GUARDA DE TIPO ***
        plan: isPlan(p.plan)
              ? Number(p.plan.id)
              : Number(p.plan),
        monto: p.monto,
        fecha: p.fecha
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return <div className="container mt-5 alert alert-warning">Inicia sesión para acceder a los pagos.</div>;
  }

  if (loading) {
    return <div className="container mt-5">Cargando...</div>;
  }

  if (id && planDetails) {
    return (
      <div className="container mt-5">
        <h2 className="mb-3">Comprar Plan: {planDetails.nombre}</h2>
        <p>{planDetails.descripcion}</p>
        <p><strong>Precio:</strong> ${planDetails.precio.toFixed(2)}</p>

        <div className="card p-4 mt-4 shadow-sm">
          <h5>Información de Pago</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Número de tarjeta" value={form.tarjeta} onChange={(e) => setForm({ ...form, tarjeta: e.target.value })} required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Fecha de vencimiento (MM/AA)" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Código de seguridad" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Pagar ahora</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Historial de Pagos</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {editando && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5>Editar Pago</h5>
          <form onSubmit={handleUpdate} className="row g-2">
            <div className="col-md-6 mb-2">
                <input className="form-control" placeholder="Paciente ID" type="number" value={pagoForm.paciente} onChange={e => setPagoForm({ ...pagoForm, paciente: Number(e.target.value) })} required />
            </div>
            <div className="col-md-6 mb-2">
                <input className="form-control" placeholder="Plan ID" type="number"
                    // *** USANDO LA NUEVA FUNCIÓN DE GUARDA DE TIPO ***
                    value={isPlan(pagoForm.plan) ? Number(pagoForm.plan.id) : pagoForm.plan}
                    onChange={e => setPagoForm({ ...pagoForm, plan: Number(e.target.value) })} required />
            </div>
            <div className="col-md-6 mb-2">
                <input className="form-control" placeholder="Monto" type="number" step="0.01" value={pagoForm.monto} onChange={e => setPagoForm({ ...pagoForm, monto: Number(e.target.value) })} required />
            </div>
            <div className="col-md-6 mb-2">
                <input className="form-control" type="date" value={pagoForm.fecha} onChange={e => setPagoForm({ ...pagoForm, fecha: e.target.value })} required />
            </div>
            <div className="col-12 d-flex gap-2">
                <button className="btn btn-success flex-grow-1" type="submit">Guardar Cambios</button>
                <button className="btn btn-secondary flex-grow-1" type="button" onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {pagos.length > 0 ? (
        <div className="row">
          {pagos.map((pago) => (
            <div key={pago.id} className="col-md-4 mb-3">
              <div className="card shadow">
                <div className="card-body">
                  <p><strong>Monto:</strong> ${typeof pago.monto === 'number' ? pago.monto.toFixed(2) : parseFloat(pago.monto || '0').toFixed(2)}</p>
                  <p><strong>Fecha:</strong> {new Date(pago.fecha).toLocaleDateString()}</p>
                  {/* *** USANDO LA NUEVA FUNCIÓN DE GUARDA DE TIPO *** */}
                  <p><strong>Plan ID:</strong> {isPlan(pago.plan) ? pago.plan.id : pago.plan}</p>
                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(pago)}>Editar</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(pago.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No se han registrado pagos aún.</p>
      )}
    </div>
  );
}