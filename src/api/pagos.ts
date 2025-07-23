// src/api/pagos.ts
import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface Pago {
  id: number;
  paciente: number; 
  plan: number;     
  monto: number;
  fecha: string;
}

interface RawPago {
  id: number;
  paciente: number | { id: string | number; nombre?: string; email?: string; }; //
  plan: number | string | { id: string | number; nombre?: string; descripcion?: string; precio?: number };
  monto: number | string;
  fecha: string;
}

function isObjectWithId(value: any): value is { id: string | number } { //
  return typeof value === 'object' && value !== null && 'id' in value; //
}


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

  const transformedPagos: Pago[] = rawPagos.map(rawPago => {
    let planId: number;
    if (isObjectWithId(rawPago.plan)) { 
      planId = Number(rawPago.plan.id);
    } else if (typeof rawPago.plan === 'string') {
      planId = Number(rawPago.plan); 
    } else {
      planId = rawPago.plan;
    }

    let montoNum: number;
    if (typeof rawPago.monto === 'string') {
      montoNum = parseFloat(rawPago.monto);
    } else {
      montoNum = rawPago.monto;
    }

    
    let pacienteId: number; 
    if (isObjectWithId(rawPago.paciente)) { 
      pacienteId = Number(rawPago.paciente.id); 
    } else {
      pacienteId = rawPago.paciente; 
    }

    return {
      ...rawPago,
      paciente: pacienteId,
      plan: planId,
      monto: montoNum,
    } as Pago;
  });

  return transformedPagos;
}

export interface CreatePagoPayload extends Omit<Pago, 'id'> {}

export interface UpdatePagoPayload extends Partial<Omit<Pago, 'id'>> {} // Para PATCH

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

  let pacienteId: number;
  if (isObjectWithId(rawCreatedPago.paciente)) { 
    pacienteId = Number(rawCreatedPago.paciente.id); 
  } else {
    pacienteId = rawCreatedPago.paciente;
  }

  return {
    ...rawCreatedPago,
    paciente: pacienteId,
    plan: planId,
    monto: montoNum
  } as Pago;
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
}

// Actualizar un pago
export async function updatePago(id: number, pago: UpdatePagoPayload): Promise<Pago> { // Usar la interfaz definida
  const res = await fetch(`${API}/pagos/${id}`, {
    method: 'PUT',
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
  if (isObjectWithId(rawUpdatedPago.plan)) {
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

  let pacienteId: number;
  if (isObjectWithId(rawUpdatedPago.paciente)) {
    pacienteId = Number(rawUpdatedPago.paciente.id); 
  } else {
    pacienteId = rawUpdatedPago.paciente;
  }

  return {
    ...rawUpdatedPago,
    paciente: pacienteId, // Asegura que paciente es numérico
    plan: planId,
    monto: montoNum
  } as Pago; // Afirmamos que el tipo de retorno es Pago
}