// src/api/dietas.ts
import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface SemanaDieta {
  semana: number;
  menu: string[];
}

export interface Dieta {
  _id?: string;
  id?: string;
  nombre: string;
  descripcion: string;
  paciente_id: string;
  plan_id?: string;
  fechaAsignacion: string;
  semanas: SemanaDieta[];
}

export interface CreateDietaPayload extends Omit<Dieta, '_id' | 'id'> {}

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

export async function getMyDietas(userId: string): Promise<Dieta[]> {
  const allDietas = await getAllDietas();
  return allDietas.filter(d => d.paciente_id === userId);
}

export async function createDieta(dieta: CreateDietaPayload): Promise<Dieta> {
  const res = await fetch(`${API}/dietas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dieta),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al crear dieta');
  }

  return res.json();
}