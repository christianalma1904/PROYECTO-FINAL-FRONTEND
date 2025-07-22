// src/api/pacientes.ts
import { getAuthHeaders } from "./utils";

const API = process.env.REACT_APP_API_URL;

export async function getPacientes() {
  const res = await fetch(`${API}/pacientes`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) { // <-- AGREGADA LA COMPROBACIÓN DE ÉXITO DE LA RESPUESTA
    const error = await res.json().catch(() => ({ message: 'Error desconocido al obtener pacientes.' }));
    throw new Error(error.message || 'Error al obtener pacientes.');
  }

  return res.json();
}

export async function createPaciente(paciente: any) {
  const res = await fetch(`${API}/pacientes`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(), // Asegura que Content-Type se maneje correctamente si es necesario
      'Content-Type': 'application/json', // Importante para POST/PUT/PATCH
    },
    body: JSON.stringify(paciente),
  });

  if (!res.ok) { // <-- AGREGADA LA COMPROBACIÓN DE ÉXITO DE LA RESPUESTA
    const error = await res.json().catch(() => ({ message: 'Error desconocido al crear paciente.' }));
    throw new Error(error.message || 'Error al crear paciente.');
  }

  return res.json();
}