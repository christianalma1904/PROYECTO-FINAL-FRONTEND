// src/api/planes.ts
import { getAuthHeaders } from './utils';

const API = process.env.REACT_APP_API_URL;

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  // Si tu backend usa _id en lugar de id, puedes añadirlo aquí también:
  _id?: string;
}

// Función auxiliar para manejar errores de fetch (consistente con dietas.ts y pacientes.ts)
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido del servidor o respuesta no JSON' }));
    // Si hay un status 401, lo indicamos explícitamente para un mejor manejo en el frontend
    if (res.status === 401) {
      throw new Error(`401 Unauthorized: ${errorBody.message || 'Credenciales inválidas o token expirado.'}`);
    }
    throw new Error(errorBody.message || `Error en la solicitud: ${res.status} ${res.statusText}`);
  }
  // Para DELETE, si no hay contenido en la respuesta pero res.ok es true, devolvemos un objeto vacío.
  if (res.status === 204) { // No Content
    return {} as T;
  }
  return res.json();
}

// Obtener todos los planes
export async function getPlanes(): Promise<Plan[]> {
  const res = await fetch(`${API}/planes`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<Plan[]>(res);
}

// Crear un nuevo plan
export async function createPlan(plan: Omit<Plan, 'id' | '_id'>): Promise<Plan> { // Omitir también _id si es generado por el backend
  const headers = getAuthHeaders();
  const res = await fetch(`${API}/planes`, {
    method: 'POST',
    headers: {
      ...headers, // getAuthHeaders ya incluye 'Content-Type'
      // 'Content-Type': 'application/json', // <--- Eliminado: ya está en getAuthHeaders
    },
    body: JSON.stringify(plan),
  });
  return handleResponse<Plan>(res);
}

// Eliminar un plan
export async function deletePlan(id: number | string): Promise<void> { // id puede ser string si es _id
  const res = await fetch(`${API}/planes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  // Para delete, handleResponse ya se encargará del 204 No Content
  await handleResponse<void>(res); // Esperamos la resolución pero no necesitamos el valor
}

// Actualizar un plan
export async function updatePlan(id: number | string, plan: Omit<Plan, 'id' | '_id'>): Promise<Plan> { // id puede ser string si es _id
  const headers = getAuthHeaders();
  const res = await fetch(`${API}/planes/${id}`, {
    method: 'PUT',
    headers: {
      ...headers, // getAuthHeaders ya incluye 'Content-Type'
      // 'Content-Type': 'application/json', // <--- Eliminado: ya está en getAuthHeaders
    },
    body: JSON.stringify(plan),
  });
  return handleResponse<Plan>(res);
}