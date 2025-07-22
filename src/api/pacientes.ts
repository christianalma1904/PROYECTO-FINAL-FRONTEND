// src/api/pacientes.ts
import { getAuthHeaders } from "./utils";

const API = process.env.REACT_APP_API_URL;

// Definición de la interfaz Paciente - ¡CORREGIDA!
export interface Paciente {
  id: number; // Tu backend devuelve 'id' como número, no '_id' como string
  nombre: string; // Tu backend devuelve 'nombre'
  email: string;
  password?: string; // Opcional, ya que no siempre lo necesitas en el frontend
  rol?: string; // Opcional
}

export async function getPacientes(): Promise<Paciente[]> {
  const res = await fetch(`${API}/pacientes`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido al obtener pacientes.' }));
    throw new Error(error.message || 'Error al obtener pacientes.');
  }

  return res.json();
}

export async function createPaciente(paciente: any) {
  const res = await fetch(`${API}/pacientes`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paciente),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido al crear paciente.' }));
    throw new Error(error.message || 'Error al crear paciente.');
  }

  return res.json();
}