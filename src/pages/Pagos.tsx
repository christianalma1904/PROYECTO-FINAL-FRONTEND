import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form, Alert, Spinner, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getPacientes, Paciente } from '../api/pacientes';
import { getPlanes, Plan } from '../api/planes';
import {
  Pago,
  CreatePagoPayload,
  UpdatePagoPayload,
  getPagos,
  createPago,
  deletePago,
  updatePago,
} from '../api/pagos';

type FormControlEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export default function Pagos() {
  const { id: planIdFromUrl } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.rol || 'paciente';

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planDetailsForPurchase, setPlanDetailsForPurchase] = useState<Plan | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPagoForm, setNewPagoForm] = useState<CreatePagoPayload>({
    paciente: 0,
    plan: 0,
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
  });
  const [isCreating, setIsCreating] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditPago, setCurrentEditPago] = useState<Pago | null>(null);
  const [editPagoForm, setEditPagoForm] = useState<UpdatePagoPayload>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState<Pago | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [purchaseForm, setPurchaseForm] = useState({ tarjeta: '', fecha: '', codigo: '' });
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // --- DATA LOAD ---
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!isAuthenticated || !user) {
      setError("Usuario no autenticado. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }
    try {
      if (planIdFromUrl) {
        const allPlanes = await getPlanes();
        const foundPlan = allPlanes.find(p => p.id === Number(planIdFromUrl));
        if (foundPlan) {
          setPlanDetailsForPurchase(foundPlan);
          // Pre-fill monto if it's a purchase flow and user is identified as a patient
          if (user.rol === 'paciente' && !newPagoForm.monto) {
            setNewPagoForm(prev => ({
              ...prev,
              paciente: Number(user.id),
              plan: Number(planIdFromUrl),
              monto: foundPlan.precio,
            }));
          }
        } else {
          setError(`No se encontró el plan con ID: ${planIdFromUrl}`);
        }
      } else {
        const [pagosData, pacientesData, planesData] = await Promise.all([
          getPagos(),
          getPacientes(),
          getPlanes(),
        ]);
        setPagos(pagosData);
        setPacientes(pacientesData);
        setPlanes(planesData);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un problema al cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [planIdFromUrl, isAuthenticated, user]);

  // --- COMPRA PLAN ---
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPurchase(true);
    setError(null);
    setSuccessMessage(null);
    if (!user || !planIdFromUrl || !planDetailsForPurchase) {
      setError("Faltan datos para procesar la compra del plan.");
      setIsProcessingPurchase(false);
      return;
    }

    // Validaciones simples
    if (!purchaseForm.tarjeta || purchaseForm.tarjeta.replace(/\s/g, '').length < 13 || purchaseForm.tarjeta.replace(/\s/g, '').length > 19) {
      setError("Número de tarjeta inválido.");
      setIsProcessingPurchase(false);
      return;
    }
    if (!purchaseForm.fecha || !/^\d{2}\/\d{2}$/.test(purchaseForm.fecha)) {
      setError("Formato de fecha de vencimiento inválido (MM/AA).");
      setIsProcessingPurchase(false);
      return;
    }
    if (!purchaseForm.codigo || !/^\d{3,4}$/.test(purchaseForm.codigo)) {
      setError("Código de seguridad (CVV) inválido.");
      setIsProcessingPurchase(false);
      return;
    }

    try {
      const newPayment: CreatePagoPayload = {
        paciente: Number(user.id),
        plan: Number(planIdFromUrl),
        monto: planDetailsForPurchase.precio,
        fecha: new Date().toISOString().split('T')[0],
      };
      await createPago(newPayment);
      setSuccessMessage('¡Pago del plan registrado con éxito! Redirigiendo...');
      setPurchaseForm({ tarjeta: '', fecha: '', codigo: '' });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Error al procesar la compra del plan.");
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  // --- CRUD HANDLERS ---
  const handleNewPagoChange = (e: FormControlEvent) => {
    const { name, value } = e.target;
    setNewPagoForm(prev => ({
      ...prev,
      [name]: (name === 'paciente' || name === 'plan' || name === 'monto') ? Number(value) : value,
    }));
  };

  const handleCreatePagoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    if (!newPagoForm.paciente || !newPagoForm.plan || newPagoForm.monto <= 0 || !newPagoForm.fecha) {
      setError("Por favor, completa todos los campos para crear un pago.");
      setIsCreating(false);
      return;
    }

    try {
      const created = await createPago(newPagoForm);
      setPagos(prev => [...prev, created]);
      setSuccessMessage("Pago creado exitosamente.");
      setShowCreateModal(false);
      setNewPagoForm({ paciente: 0, plan: 0, monto: 0, fecha: new Date().toISOString().split('T')[0] });
    } catch (err: any) {
      setError(err.message || "Error al crear el pago.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (pago: Pago) => {
    setCurrentEditPago(pago);
    setEditPagoForm({
      paciente: pago.paciente,
      plan: pago.plan,
      monto: pago.monto,
      fecha: pago.fecha,
    });
    setShowEditModal(true);
  };

  const handleEditPagoChange = (e: FormControlEvent) => {
    const { name, value } = e.target;
    setEditPagoForm(prev => ({
      ...prev!,
      [name]: (name === 'paciente' || name === 'plan' || name === 'monto') ? Number(value) : value,
    }));
  };

  const handleUpdatePagoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditPago || !currentEditPago.id) return;
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await updatePago(currentEditPago.id, editPagoForm);
      setPagos(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSuccessMessage("Pago actualizado exitosamente.");
      setShowEditModal(false);
      setCurrentEditPago(null);
      setEditPagoForm({});
    } catch (err: any) {
      setError(err.message || "Error al actualizar el pago.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (pago: Pago) => {
    setPagoToDelete(pago);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!pagoToDelete || !pagoToDelete.id) return;
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await deletePago(pagoToDelete.id);
      setPagos(prev => prev.filter(p => p.id !== pagoToDelete.id));
      setSuccessMessage("Pago eliminado exitosamente.");
      setShowDeleteModal(false);
      setPagoToDelete(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar el pago.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UI RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <Alert variant="warning" className="text-center shadow-sm">
          Por favor, inicia sesión para acceder a esta sección.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status" className="text-success" />
        <p className="mt-3 text-secondary">Cargando información de pagos...</p>
      </div>
    );
  }

  if (planIdFromUrl && planDetailsForPurchase) {
    // --- COMPRA PLAN (todos los pacientes pueden comprar) ---
    return (
      // ...tu código de compra no cambia...
      // Puedes dejar igual este bloque
      <>{/* ...todo el bloque de compra aquí igual que tu versión anterior... */}</>
    );
  }

  if (planIdFromUrl && !planDetailsForPurchase) {
    return (
      <div className="container mt-5">
        <Alert variant="danger" className="text-center shadow-sm">
          No se encontraron detalles para el plan con ID: {planIdFromUrl}.
          {error && ` Error: ${error}`}
        </Alert>
      </div>
    );
  }

  // --- HISTORIAL DE PAGOS ---
  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center fw-bold text-success display-4 animate-fade-in">Historial de Pagos 💰</h1>
      <p className="lead text-muted text-center mb-5 animate-fade-in">
        Consulta y gestiona todos los pagos registrados en tu sistema.
      </p>

      {error && <Alert variant="danger" className="mb-4 text-center fade-in">{error}</Alert>}
      {successMessage && <Alert variant="success" className="mb-4 text-center fade-in">{successMessage}</Alert>}

      {/* Botón para crear pago SOLO ADMIN */}
      {userRole === 'admin' && (
        <div className="d-flex justify-content-center mb-5 animate-slide-up">
          <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)} className="rounded-pill fw-semibold custom-btn-gradient-green">
            <i className="bi bi-plus-circle me-2"></i> Registrar Nuevo Pago
          </Button>
        </div>
      )}

      <h2 className="mb-4 mt-5 fw-bold text-secondary text-center animate-slide-up">Últimos Pagos Registrados</h2>
      {pagos.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm animate-fade-in">
          <i className="bi bi-info-circle me-2"></i> No se han registrado pagos aún.
        </Alert>
      ) : (
        <div className="row g-4">
          {pagos
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .map((pago) => (
              <div key={pago.id} className="col-lg-4 col-md-6">
                <Card className="h-100 shadow-sm border-0 pago-card-hover">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h5 mb-3 text-success fw-bold border-bottom pb-2">
                      <i className="bi bi-receipt me-2 text-primary"></i>Pago ID: {pago.id}
                    </Card.Title>
                    <ul className="list-unstyled flex-grow-1">
                      <li className="mb-2 fs-6">
                        <span className="fw-semibold text-dark">Paciente:</span>{" "}
                        {(() => {
                          const foundPaciente = pacientes.find(p => p.id === pago.paciente);
                          return foundPaciente ? <span className="text-info">{foundPaciente.nombre} ({foundPaciente.email})</span> : <span className="text-muted">ID: {pago.paciente}</span>;
                        })()}
                      </li>
                      <li className="mb-2 fs-6">
                        <span className="fw-semibold text-dark">Plan:</span>{" "}
                        {planes.find(p => p.id === pago.plan)?.nombre || <span className="text-muted">ID: {pago.plan}</span>}
                      </li>
                      <li className="mb-2 fs-6">
                        <span className="fw-semibold text-dark">Monto:</span> <span className="text-success fw-bolder fs-5">${pago.monto.toFixed(2)}</span>
                      </li>
                      <li className="mb-2 fs-6">
                        <span className="fw-semibold text-dark">Fecha:</span> <span className="text-muted">{new Date(pago.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </li>
                    </ul>
                    {/* Botones SOLO admin */}
                    {userRole === 'admin' && (
                      <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                        <Button variant="outline-info" size="sm" onClick={() => handleEditClick(pago)} className="fw-semibold rounded-pill px-3 py-2 action-btn-hover">
                          <i className="bi bi-pencil-fill me-1"></i> Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(pago)} className="fw-semibold rounded-pill px-3 py-2 action-btn-hover">
                          <i className="bi bi-trash-fill me-1"></i> Eliminar
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))}
        </div>
      )}

      {/* Modal Crear Pago (SOLO ADMIN) */}
      {userRole === 'admin' && (
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered animation>
          {/* ...igual que tu código, no cambia... */}
        </Modal>
      )}

      {/* Modal Editar Pago (SOLO ADMIN) */}
      {userRole === 'admin' && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered animation>
          {/* ...igual que tu código, no cambia... */}
        </Modal>
      )}

      {/* Modal Eliminar Pago (SOLO ADMIN) */}
      {userRole === 'admin' && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered animation>
          {/* ...igual que tu código, no cambia... */}
        </Modal>
      )}
    </div>
  );
}
