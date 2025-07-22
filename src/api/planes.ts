import { getAuthHeaders } from './utils';
const API = process.env.REACT_APP_API_URL;

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

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

export async function createPlan(plan: any): Promise<any> {
  const res = await fetch(`${API}/planes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(plan),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error al crear el plan');
  }

  return res.json();
}