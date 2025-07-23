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

  // **** AHORA SÍ, el bloque de compra de plan debe tener su contenido ****
  if (planIdFromUrl && planDetailsForPurchase) {
    return (
      <div className="container py-5">
        <h1 className="mb-4 text-center fw-bold text-success display-4 animate-fade-in">Adquirir Plan</h1>
        <p className="lead text-muted text-center mb-5 animate-fade-in">
          Complete la información para adquirir el plan "{planDetailsForPurchase.nombre}".
        </p>
        {error && <Alert variant="danger" className="mb-4 text-center fade-in">{error}</Alert>}
        {successMessage && <Alert variant="success" className="mb-4 text-center fade-in">{successMessage}</Alert>}

        <Card className="shadow-lg border-0 rounded-4 p-4 p-md-5 mx-auto animate-zoom-in" style={{ maxWidth: '600px' }}>
          <Card.Body>
            <Form onSubmit={handlePurchaseSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Plan Seleccionado</Form.Label>
                <Form.Control
                  type="text"
                  value={planDetailsForPurchase.nombre}
                  readOnly
                  disabled
                  className="bg-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="text"
                  value={`$${planDetailsForPurchase.precio.toFixed(2)}`}
                  readOnly
                  disabled
                  className="bg-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Número de Tarjeta</Form.Label>
                <Form.Control
                  type="text"
                  name="tarjeta"
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={purchaseForm.tarjeta}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, tarjeta: e.target.value })}
                  maxLength={19}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Vencimiento (MM/AA)</Form.Label>
                <Form.Control
                  type="text"
                  name="fecha"
                  placeholder="MM/AA"
                  value={purchaseForm.fecha}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, fecha: e.target.value })}
                  maxLength={5}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Código de Seguridad (CVV)</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo"
                  placeholder="CVV"
                  value={purchaseForm.codigo}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, codigo: e.target.value })}
                  maxLength={4}
                  required
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                className="w-100 rounded-pill fw-bold custom-btn-gradient-green"
                disabled={isProcessingPurchase}
              >
                {isProcessingPurchase ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Procesando...
                  </>
                ) : (
                  'Confirmar Compra'
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
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
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title><i className="bi bi-cash-stack me-2"></i> Registrar Nuevo Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleCreatePagoSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Paciente</Form.Label>
                <Form.Select
                  name="paciente"
                  value={newPagoForm.paciente}
                  onChange={handleNewPagoChange}
                  required
                >
                  <option value={0}>Selecciona un Paciente</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre} ({paciente.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Plan</Form.Label>
                <Form.Select
                  name="plan"
                  value={newPagoForm.plan}
                  onChange={handleNewPagoChange}
                  required
                >
                  <option value={0}>Selecciona un Plan</option>
                  {planes.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} (${plan.precio})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  name="monto"
                  value={newPagoForm.monto}
                  onChange={handleNewPagoChange}
                  step="0.01"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={newPagoForm.fecha}
                  onChange={handleNewPagoChange}
                  required
                />
              </Form.Group>
              <Button variant="success" type="submit" className="w-100 mt-3" disabled={isCreating}>
                {isCreating ? <Spinner animation="border" size="sm" /> : 'Crear Pago'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Modal Editar Pago (SOLO ADMIN) */}
      {userRole === 'admin' && currentEditPago && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered animation>
          <Modal.Header closeButton className="bg-info text-white">
            <Modal.Title><i className="bi bi-pencil-square me-2"></i> Editar Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleUpdatePagoSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>ID del Pago</Form.Label>
                <Form.Control type="text" value={currentEditPago.id} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Paciente</Form.Label>
                <Form.Select
                  name="paciente"
                  value={editPagoForm.paciente}
                  onChange={handleEditPagoChange}
                  required
                >
                  <option value={0}>Selecciona un Paciente</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre} ({paciente.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Plan</Form.Label>
                <Form.Select
                  name="plan"
                  value={editPagoForm.plan}
                  onChange={handleEditPagoChange}
                  required
                >
                  <option value={0}>Selecciona un Plan</option>
                  {planes.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} (${plan.precio})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  name="monto"
                  value={editPagoForm.monto}
                  onChange={handleEditPagoChange}
                  step="0.01"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={editPagoForm.fecha}
                  onChange={handleEditPagoChange}
                  required
                />
              </Form.Group>
              <Button variant="info" type="submit" className="w-100 mt-3" disabled={isUpdating}>
                {isUpdating ? <Spinner animation="border" size="sm" /> : 'Actualizar Pago'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Modal Eliminar Pago (SOLO ADMIN) */}
      {userRole === 'admin' && pagoToDelete && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered animation>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title><i className="bi bi-exclamation-triangle-fill me-2"></i> Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p>¿Estás seguro de que quieres eliminar el pago con ID: <strong>{pagoToDelete.id}</strong>?</p>
            <p className="text-muted">Esta acción no se puede deshacer.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? <Spinner animation="border" size="sm" /> : 'Eliminar'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}