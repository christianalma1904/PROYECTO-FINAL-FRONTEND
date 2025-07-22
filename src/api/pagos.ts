// src/api/pagos.ts (VERSIÓN FINAL, solo para referencia)
import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface Pago {
  id: number;
  paciente: number; // ID del paciente (numérico)
  plan: number;     // ID del plan (numérico)
  monto: number;
  fecha: string;
}

// Define una interfaz para los datos crudos que podrían venir del backend
// donde 'plan' Y 'paciente' podrían ser objetos o un número/string
interface RawPago {
  id: number;
  // paciente podría ser un número (ID) o un objeto con un ID
  paciente: number | { id: string | number; nombre?: string; email?: string; }; //
  plan: number | string | { id: string | number; nombre?: string; descripcion?: string; precio?: number };
  monto: number | string;
  fecha: string;
}

// Función auxiliar para determinar si un valor es un objeto con ID
// Reutilizable para Plan y Paciente
function isObjectWithId(value: any): value is { id: string | number } { //
  return typeof value === 'object' && value !== null && 'id' in value; //
}


// Obtener todos los pagos
export async function getPagos(): Promise<Pago[]> {
  const res = await fetch(`${API}/pagos`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al obtener los pagos');
  }

  const rawPagos: RawPago[] = await res.json();

  // *** TRANSFORMACIÓN CRUCIAL AQUÍ ***
  const transformedPagos: Pago[] = rawPagos.map(rawPago => {
    let planId: number;
    if (isObjectWithId(rawPago.plan)) { // Usa la función genérica
      planId = Number(rawPago.plan.id); // Si es un objeto Plan, extrae su ID
    } else if (typeof rawPago.plan === 'string') {
      planId = Number(rawPago.plan); // Si es un string, conviértelo a número
    } else {
      planId = rawPago.plan; // Ya es un número
    }

    let montoNum: number;
    if (typeof rawPago.monto === 'string') {
      montoNum = parseFloat(rawPago.monto);
    } else {
      montoNum = rawPago.monto;
    }

    // AÑADIR TRANSFORMACIÓN PARA PACIENTE AQUÍ en getPagos también
    let pacienteId: number; //
    if (isObjectWithId(rawPago.paciente)) { // Usa la función genérica
      pacienteId = Number(rawPago.paciente.id); //
    } else {
      pacienteId = rawPago.paciente; // Ya es un número
    }

    return {
      ...rawPago,
      paciente: pacienteId, // Asegura que paciente es numérico
      plan: planId,
      monto: montoNum,
    } as Pago; // Afirmamos que el tipo de retorno es Pago
  });

  return transformedPagos;
}

// Interfaz para crear un Pago (excluye el ID)
export interface CreatePagoPayload extends Omit<Pago, 'id'> {}

// Interfaz para actualizar un Pago (excluye el ID) - Usaremos Omit<Pago, 'id'> para el body
// Si necesitas actualizaciones parciales con PATCH, deberías definirla con campos opcionales:
export interface UpdatePagoPayload extends Partial<Omit<Pago, 'id'>> {} // Para PATCH
// O si siempre envías todos los campos (PUT), usa:
// export interface UpdatePagoPayload extends Omit<Pago, 'id'> {} // Para PUT

// Crear un nuevo pago
export async function createPago(pago: CreatePagoPayload): Promise<Pago> { // Usar la interfaz definida
  const res = await fetch(`${API}/pagos`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pago),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al crear el pago');
  }

  const rawCreatedPago: RawPago = await res.json(); // Leer como RawPago

  let planId: number;
  if (isObjectWithId(rawCreatedPago.plan)) { // Usa la función genérica
    planId = Number(rawCreatedPago.plan.id);
  } else if (typeof rawCreatedPago.plan === 'string') {
    planId = Number(rawCreatedPago.plan);
  } else {
    planId = rawCreatedPago.plan;
  }

  let montoNum: number;
  if (typeof rawCreatedPago.monto === 'string') {
    montoNum = parseFloat(rawCreatedPago.monto);
  } else {
    montoNum = rawCreatedPago.monto;
  }

  // *** AÑADIR TRANSFORMACIÓN PARA PACIENTE AQUÍ ***
  let pacienteId: number; //
  if (isObjectWithId(rawCreatedPago.paciente)) { // Usa la función genérica
    pacienteId = Number(rawCreatedPago.paciente.id); //
  } else {
    pacienteId = rawCreatedPago.paciente; // Ya es un número
  }

  return {
    ...rawCreatedPago,
    paciente: pacienteId, // Asegura que paciente es numérico
    plan: planId,
    monto: montoNum
  } as Pago; // Afirmamos que el tipo de retorno es Pago
}


// Eliminar un pago
export async function deletePago(id: number): Promise<void> {
  const res = await fetch(`${API}/pagos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al eliminar el pago');
  }
  // Si tu backend devuelve algo como { message: '...' } para 200 OK en DELETE
  // y no un 204 No Content, podrías necesitar leer res.json()
  // Por ahora, Promise<void> es adecuado para 204
}

// Actualizar un pago
export async function updatePago(id: number, pago: UpdatePagoPayload): Promise<Pago> { // Usar la interfaz definida
  const res = await fetch(`${API}/pagos/${id}`, {
    method: 'PUT', // Asegúrate de que tu backend espera PUT para actualizaciones completas
    // Si tu backend solo espera PATCH para actualizaciones parciales, cambia a 'PATCH'
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pago),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al actualizar el pago');
  }

  const rawUpdatedPago: RawPago = await res.json(); // Leer como RawPago

  let planId: number;
  if (isObjectWithId(rawUpdatedPago.plan)) { // Usa la función genérica
    planId = Number(rawUpdatedPago.plan.id);
  } else if (typeof rawUpdatedPago.plan === 'string') {
    planId = Number(rawUpdatedPago.plan);
  } else {
    planId = rawUpdatedPago.plan;
  }

  let montoNum: number;
  if (typeof rawUpdatedPago.monto === 'string') {
    montoNum = parseFloat(rawUpdatedPago.monto);
  } else {
    montoNum = rawUpdatedPago.monto;
  }

  // *** AÑADIR TRANSFORMACIÓN PARA PACIENTE AQUÍ ***
  let pacienteId: number; //
  if (isObjectWithId(rawUpdatedPago.paciente)) { // Usa la función genérica
    pacienteId = Number(rawUpdatedPago.paciente.id); //
  } else {
    pacienteId = rawUpdatedPago.paciente; // Ya es un número
  }

  return {
    ...rawUpdatedPago,
    paciente: pacienteId, // Asegura que paciente es numérico
    plan: planId,
    monto: montoNum
  } as Pago; // Afirmamos que el tipo de retorno es Pago
}