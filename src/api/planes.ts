// src/api/planes.ts
import { getAuthHeaders } from './utils';

const API = process.env.REACT_APP_API_URL;

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

// Obtener todos los planes
export async function getPlanes(): Promise<Plan[]> {
  const res = await fetch(`${API}/planes`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error al obtener los planes');
  }

  return res.json();
}

// Crear un nuevo plan
export async function createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
  const res = await fetch(`${API}/planes`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error al crear el plan');
  }

  return res.json();
}

// Eliminar un plan
export async function deletePlan(id: number): Promise<void> {
  const res = await fetch(`${API}/planes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error al eliminar el plan');
  }
}

// Actualizar un plan
export async function updatePlan(id: number, plan: Omit<Plan, 'id'>): Promise<Plan> {
  const res = await fetch(`${API}/planes/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error al actualizar el plan');
  }

  return res.json();
}
