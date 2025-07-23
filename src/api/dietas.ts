import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface SemanaDieta {
  semana: number;
  menu: string[];
}

export interface Dieta {
  _id?: string;
  id?: string;
  paciente_id: string;
  plan_id?: string;
  semanas: SemanaDieta[];
  nombre?: string;
  descripcion?: string;
  fechaAsignacion?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDietaPayload {
  paciente_id: string;
  plan_id?: string;
  semanas: SemanaDieta[];
  nombre: string;
  descripcion: string;
  fechaAsignacion: string;
}

// Obtener todas las dietas
export async function getAllDietas(): Promise<Dieta[]> {
  const res = await fetch(`${API}/dietas`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al obtener todas las dietas');
  }

  return res.json();
}

// Obtener las dietas de un usuario/paciente
export async function getMyDietas(userId: string): Promise<Dieta[]> {
  const res = await fetch(`${API}/dietas?paciente_id=${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error al obtener dietas para el paciente ${userId}`);
  }

  return res.json();
}

// Crear dieta (POST)
export async function createDieta(dieta: CreateDietaPayload): Promise<Dieta> {
  const res = await fetch(`${API}/dietas`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dieta),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido del servidor o respuesta no JSON' }));
    throw new Error(errorBody.message || 'Error al crear dieta');
  }

  return res.json();
}

// Actualizar dieta (PUT /dietas/:id)
export async function updateDieta(id: string, dieta: Partial<CreateDietaPayload>): Promise<Dieta> {
  const res = await fetch(`${API}/dietas/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dieta),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido al actualizar dieta.' }));
    throw new Error(errorBody.message || 'Error al actualizar dieta');
  }

  return res.json();
}

// Eliminar dieta (DELETE /dietas/:id)
export async function deleteDieta(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API}/dietas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido al eliminar dieta.' }));
    throw new Error(errorBody.message || 'Error al eliminar dieta');
  }

  return res.json();
}
