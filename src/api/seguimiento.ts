// src/api/seguimiento.ts

import { getAuthHeaders } from "./utils";
const API = process.env.REACT_APP_API_URL;

export interface SeguimientoEntry {
  _id?: string; // Si tu backend usa MongoDB ObjectId como _id
  id?: number; // O number, si tu backend usa id numérico (más probable por tus pacientes.json)
  paciente_id: string; // Asumiendo que user.id es string y coincide con el ID del paciente en el seguimiento
  fecha: string;
  peso: number;
  semana: number;
  fotos: string[]; // <-- Este campo ha sido re-añadido aquí
}

// CreateSeguimientoPayload excluye los IDs que son generados por el backend
export interface CreateSeguimientoPayload extends Omit<SeguimientoEntry, '_id' | 'id'> {}

export async function getAllSeguimiento(): Promise<SeguimientoEntry[]> {
  const res = await fetch(`${API}/seguimiento`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido al obtener seguimientos.' }));
    throw new Error(error.message || 'Error al obtener todos los seguimientos.');
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
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido al crear seguimiento.' }));
    throw new Error(error.message || 'Error al crear seguimiento.');
  }

  return res.json();
}