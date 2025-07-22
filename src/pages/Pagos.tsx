import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form, Alert, Spinner, Card } from 'react-bootstrap'; // Importar Card
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

// Define un tipo que incluya todos los elementos posibles para Form.Control
type FormControlEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export default function Pagos() {
  const { id: planIdFromUrl } = useParams<{ id: string }>();
  const { user, isAuthenticated, token } = useAuth(); // Asegúrate de que token se usa si es necesario en getAuthHeaders

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
        // Lógica para cuando se está en la página de compra de un plan específico
        // En un caso real, buscarías el plan por su ID de la API de planes.
        // Aquí simulamos un plan si el ID de la URL está presente.
        const allPlanes = await getPlanes();
        const foundPlan = allPlanes.find(p => p.id === Number(planIdFromUrl));

        if (foundPlan) {
            setPlanDetailsForPurchase(foundPlan);
        } else {
            setError(`No se encontró el plan con ID: ${planIdFromUrl}`);
            setPlanDetailsForPurchase(null);
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
      console.error("Error al cargar datos:", err);
      setError(err.message || "Ocurrió un problema al cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cuando el componente se monta o cuando planIdFromUrl, isAuthenticated, o user cambian
    // volvemos a cargar los datos.
    fetchAllData();
  }, [planIdFromUrl, isAuthenticated, user]);


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

    try {
      const newPayment: CreatePagoPayload = {
        paciente: Number(user.id), // El ID del usuario autenticado es el paciente
        plan: Number(planIdFromUrl),
        monto: planDetailsForPurchase.precio,
        fecha: new Date().toISOString().split('T')[0],
      };
      await createPago(newPayment);
      setSuccessMessage('¡Pago del plan registrado con éxito!');
      setPurchaseForm({ tarjeta: '', fecha: '', codigo: '' });
    } catch (err: any) {
      console.error("Error al procesar la compra:", err);
      setError(err.message || "Error al procesar la compra del plan.");
    } finally {
      setIsProcessingPurchase(false);
    }
  };

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

    // Validación básica de campos
    if (!newPagoForm.paciente || !newPagoForm.plan || newPagoForm.monto <= 0 || !newPagoForm.fecha) {
      setError("Por favor, completa todos los campos para crear un pago.");
      setIsCreating(false);
      return;
    }

    try {
      const created = await createPago(newPagoForm);
      // Asegurarse de que el paciente se muestre correctamente al añadirlo
      setPagos(prev => [...prev, created]);
      setSuccessMessage("Pago creado exitosamente.");
      setShowCreateModal(false);
      setNewPagoForm({ paciente: 0, plan: 0, monto: 0, fecha: new Date().toISOString().split('T')[0] }); // Reiniciar formulario
    } catch (err: any) {
      console.error("Error al crear pago:", err);
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

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setCurrentEditPago(null);
    setEditPagoForm({});
    setError(null); // Limpiar error al cerrar el modal
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
    if (!currentEditPago || !currentEditPago.id) return; // Asegurar que hay un pago para editar

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: UpdatePagoPayload = { ...editPagoForm };
      const updated = await updatePago(currentEditPago.id, payload);
      setPagos(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSuccessMessage("Pago actualizado exitosamente.");
      handleEditModalClose(); // Cerrar modal al éxito
    } catch (err: any) {
      console.error("Error al actualizar pago:", err);
      setError(err.message || "Error al actualizar el pago.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (pago: Pago) => {
    setPagoToDelete(pago);
    setShowDeleteModal(true);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setPagoToDelete(null);
    setError(null); // Limpiar error al cerrar el modal
  };

  const handleConfirmDelete = async () => {
    if (!pagoToDelete || !pagoToDelete.id) return;

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await deletePago(pagoToDelete.id);
      setPagos(prev => prev.filter(p => p.id !== pagoToDelete.id)); // Eliminar del estado local
      setSuccessMessage("Pago eliminado exitosamente.");
      handleDeleteModalClose(); // Cerrar modal al éxito
    } catch (err: any) {
      console.error("Error al eliminar pago:", err);
      setError(err.message || "Error al eliminar el pago.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Renderizado condicional para la compra de planes
  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <Alert variant="warning" className="text-center">
          Por favor, inicia sesión para acceder a esta sección.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status" className="text-success">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-secondary">Cargando información de pagos...</p>
      </div>
    );
  }

  if (planIdFromUrl) {
    if (!planDetailsForPurchase) {
      return (
        <div className="container mt-5">
          <Alert variant="danger" className="text-center">
            No se encontraron detalles para el plan con ID: {planIdFromUrl}.
            {error && ` Error: ${error}`}
          </Alert>
        </div>
      );
    }
    return (
      <div className="container mt-4 mb-5">
        <h1 className="mb-4 text-center">Comprar Plan: {planDetailsForPurchase.nombre}</h1>
        <p className="lead text-center text-muted mb-4">
          Completa los datos de pago para adquirir este plan.
        </p>
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title className="text-center h4 mb-3">Detalles del Plan</Card.Title>
                <div className="text-center mb-3">
                  <p className="card-text">{planDetailsForPurchase.descripcion}</p>
                  <p className="fs-3 text-success">
                    <strong>Precio: ${planDetailsForPurchase.precio.toFixed(2)}</strong>
                  </p>
                </div>

                <hr className="my-4" />

                <Card.Title className="text-center h4 mb-3">Información de Pago</Card.Title>
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                {successMessage && <Alert variant="success" className="mb-3">{successMessage}</Alert>}
                <Form onSubmit={handlePurchaseSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="cardNumber">Número de tarjeta</Form.Label>
                    <Form.Control
                      id="cardNumber"
                      type="text"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={purchaseForm.tarjeta}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, tarjeta: e.target.value })}
                      required
                      className="rounded-pill px-3"
                    />
                  </Form.Group>
                  <div className="row mb-3">
                    <Form.Group className="col-md-6">
                      <Form.Label htmlFor="expiryDate">Fecha de vencimiento</Form.Label>
                      <Form.Control
                        id="expiryDate"
                        type="text"
                        placeholder="MM/AA"
                        value={purchaseForm.fecha}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, fecha: e.target.value })}
                        required
                        className="rounded-pill px-3"
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6">
                      <Form.Label htmlFor="securityCode">Código de seguridad</Form.Label>
                      <Form.Control
                        id="securityCode"
                        type="text"
                        placeholder="CVV"
                        value={purchaseForm.codigo}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, codigo: e.target.value })}
                        required
                        className="rounded-pill px-3"
                      />
                    </Form.Group>
                  </div>
                  <Button type="submit" variant="success" className="w-100 btn-lg mt-4 rounded-pill" disabled={isProcessingPurchase}>
                    {isProcessingPurchase ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Procesando...
                      </>
                    ) : (
                      'Pagar ahora'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado para la gestión de pagos (si no hay planIdFromUrl)
  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4 text-center">Historial de Pagos 💰</h1>
      <p className="text-muted text-center mb-4">
        Consulta y gestiona todos los pagos registrados en tu sistema.
      </p>

      {error && <Alert variant="danger" className="mb-3 text-center">{error}</Alert>}
      {successMessage && <Alert variant="success" className="mb-3 text-center">{successMessage}</Alert>}

      <div className="d-grid gap-2 mb-4">
        <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)} className="rounded-pill">
          <i className="bi bi-plus-circle me-2"></i> Registrar Nuevo Pago
        </Button>
      </div>

      <h2 className="mb-3 mt-5">Últimos Pagos Registrados</h2>
      {pagos.length === 0 ? (
        <Alert variant="info" className="text-center">No se han registrado pagos aún.</Alert>
      ) : (
        <div className="row">
          {pagos.map((pago) => (
            <div key={pago.id} className="col-lg-4 col-md-6 mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="h5 mb-3 text-primary">Pago #{pago.id}</Card.Title>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <strong>Paciente:</strong>{' '}
                      {(() => {
                        const foundPaciente = pacientes.find(p => p.id === pago.paciente);
                        return foundPaciente ? foundPaciente.nombre : `ID: ${pago.paciente}`;
                      })()}
                    </li>
                    <li className="mb-2">
                      <strong>Plan:</strong>{' '}
                      {planes.find(p => p.id === pago.plan)?.nombre || `ID: ${pago.plan}`}
                    </li>
                    <li className="mb-2">
                      <strong>Monto:</strong> <span className="text-success fw-bold">${pago.monto.toFixed(2)}</span>
                    </li>
                    <li className="mb-2">
                      <strong>Fecha:</strong> {new Date(pago.fecha).toLocaleDateString()}
                    </li>
                  </ul>
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button variant="outline-info" size="sm" onClick={() => handleEditClick(pago)}>
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(pago)}>
                      <i className="bi bi-trash-fill me-1"></i> Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Pago */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Registrar Nuevo Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleCreatePagoSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Paciente</Form.Label>
              <Form.Select
                name="paciente"
                value={newPagoForm.paciente || ''}
                onChange={handleNewPagoChange}
                required
                className="rounded-pill"
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.email})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Plan</Form.Label>
              <Form.Select
                name="plan"
                value={newPagoForm.plan || ''}
                onChange={handleNewPagoChange}
                required
                className="rounded-pill"
              >
                <option value="">Selecciona un plan</option>
                {planes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="monto"
                placeholder="Monto del pago"
                value={newPagoForm.monto === 0 ? '' : newPagoForm.monto}
                onChange={handleNewPagoChange}
                required
                className="rounded-pill"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Pago</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={newPagoForm.fecha}
                onChange={handleNewPagoChange}
                required
                className="rounded-pill"
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100 mt-3 rounded-pill" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Creando...
                </>
              ) : (
                'Registrar Pago'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Editar Pago */}
      <Modal show={showEditModal} onHide={handleEditModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Editar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {currentEditPago && (
            <Form onSubmit={handleUpdatePagoSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Paciente</Form.Label>
                <Form.Select
                  name="paciente"
                  value={editPagoForm.paciente || ''}
                  onChange={handleEditPagoChange}
                  required
                  className="rounded-pill"
                >
                  <option value="">Selecciona un paciente</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.email})</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Plan</Form.Label>
                <Form.Select
                  name="plan"
                  value={editPagoForm.plan || ''}
                  onChange={handleEditPagoChange}
                  required
                  className="rounded-pill"
                >
                  <option value="">Selecciona un plan</option>
                  {planes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="monto"
                  value={editPagoForm.monto === 0 ? '' : editPagoForm.monto}
                  onChange={handleEditPagoChange}
                  required
                  className="rounded-pill"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Pago</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={editPagoForm.fecha || ''}
                  onChange={handleEditPagoChange}
                  required
                  className="rounded-pill"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 mt-3 rounded-pill" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Actualizando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Eliminar Pago */}
      <Modal show={showDeleteModal} onHide={handleDeleteModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p className="text-center">
            ¿Estás seguro de que quieres eliminar el pago de{' '}
            <strong className="text-danger">${pagoToDelete?.monto?.toFixed(2)}</strong> del paciente{' '}
            <strong className="text-primary">
              {(() => {
                const foundPaciente = pacientes.find(p => p.id === pagoToDelete?.paciente);
                return foundPaciente ? foundPaciente.nombre : `ID: ${pagoToDelete?.paciente}`;
              })()}
            </strong>{' '}
            para el plan{' '}
            <strong className="text-info">
              {planes.find(p => p.id === pagoToDelete?.plan)?.nombre || `ID: ${pagoToDelete?.plan}`}
            </strong>
            ? Esta acción es irreversible.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteModalClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}