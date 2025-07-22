// src/api/seguimiento.ts
import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface SeguimientoEntry {
  _id?: string;
  id?: string;
  paciente_id: string;
  fecha: string;
  peso: number;
  observaciones?: string;
}

export interface CreateSeguimientoPayload extends Omit<SeguimientoEntry, '_id' | 'id'> {}

export async function getAllSeguimiento(): Promise<SeguimientoEntry[]> {
  const res = await fetch(`${API}/seguimiento`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al obtener todos los seguimientos');
  }

  return res.json();
}

export async function getMySeguimiento(userId: string): Promise<SeguimientoEntry[]> {
  const all = await getAllSeguimiento();
  return all.filter(e => e.paciente_id === userId);
}

export async function createSeguimiento(entry: CreateSeguimientoPayload): Promise<SeguimientoEntry> {
  const res = await fetch(`${API}/seguimiento`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(entry),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Error al crear seguimiento');
  }

  return res.json();
}