// src/api/pagos.ts
import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface Pago {
  id: number;
  paciente: number;
  plan: number; // Queremos que esto siempre sea un número
  monto: number;
  fecha: string;
}

// Define una interfaz para los datos crudos que podrían venir del backend
// donde 'plan' podría ser un objeto o un número/string
interface RawPago {
  id: number;
  paciente: number;
  plan: number | string | { id: string | number; nombre?: string; descripcion?: string; precio?: number };
  monto: number | string;
  fecha: string;
}

// Función auxiliar para determinar si un valor es un objeto Plan
function isPlanObject(value: any): value is { id: string | number } {
  return typeof value === 'object' && value !== null && 'id' in value;
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
    if (isPlanObject(rawPago.plan)) {
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

    return {
      ...rawPago,
      plan: planId,
      monto: montoNum,
    } as Pago; // Afirmamos que el tipo de retorno es Pago
  });

  return transformedPagos;
}

// Crear un nuevo pago
export async function createPago(pago: Omit<Pago, 'id'>): Promise<Pago> {
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

  return res.json();
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
export async function updatePago(id: number, pago: Omit<Pago, 'id'>): Promise<Pago> {
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

  return res.json();
}