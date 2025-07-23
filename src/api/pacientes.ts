// src/api/pacientes.ts
import { getAuthHeaders } from "./utils";

const API = process.env.REACT_APP_API_URL;

// Definición de la interfaz Paciente
export interface Paciente {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol?: string;
}

// Función utilitaria para manejar errores de la API
async function parseApiError(res: Response, defaultMsg: string) {
  let errorMsg = defaultMsg;
  try {
    const data = await res.json();
    errorMsg = data?.message || defaultMsg;
  } catch {
    // No hacer nada, usar mensaje por defecto
  }
  throw new Error(errorMsg);
}

// Obtener todos los pacientes
export async function getPacientes(): Promise<Paciente[]> {
  const res = await fetch(`${API}/pacientes`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await parseApiError(res, 'Error al obtener pacientes.');
  }
  return res.json();
}

// Crear un paciente
export async function createPaciente(paciente: Partial<Paciente>) {
  const res = await fetch(`${API}/pacientes`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paciente),
  });

  if (!res.ok) {
    await parseApiError(res, 'Error al crear paciente.');
  }
  return res.json();
}

// Editar/Actualizar un paciente
export async function updatePaciente(id: number, paciente: Partial<Paciente>) {
  const res = await fetch(`${API}/pacientes/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paciente),
  });

  if (!res.ok) {
    await parseApiError(res, 'Error al actualizar paciente.');
  }
  return res.json();
}

// Eliminar un paciente
export async function deletePaciente(id: number) {
  const res = await fetch(`${API}/pacientes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await parseApiError(res, 'Error al eliminar paciente.');
  }
  return res.json();
}
