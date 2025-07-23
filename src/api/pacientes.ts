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
  // Si tu backend usa _id en lugar de id, puedes añadirlo aquí también:
  _id?: string;
}

// Función auxiliar para manejar errores de fetch (similar a handleResponse en dietas.ts)
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido del servidor o respuesta no JSON' }));
    // Si hay un status 401, lo indicamos explícitamente para un mejor manejo en el frontend
    if (res.status === 401) {
      throw new Error(`401 Unauthorized: ${errorBody.message || 'Credenciales inválidas o token expirado.'}`);
    }
    throw new Error(errorBody.message || `Error en la solicitud: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Obtener todos los pacientes
export async function getPacientes(): Promise<Paciente[]> {
  const res = await fetch(`${API}/pacientes`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Paciente[]>(res); // Usar la nueva función de manejo de respuesta
}

// Crear un paciente
export async function createPaciente(paciente: Partial<Paciente>): Promise<Paciente> { // Añadido Promise<Paciente> para tipado
  const headers = getAuthHeaders(); // Obtener los encabezados de autenticación
  const res = await fetch(`${API}/pacientes`, {
    method: 'POST',
    headers: {
      ...headers, // getAuthHeaders ya incluye 'Content-Type'
      // 'Content-Type': 'application/json', // <--- Eliminado: ya está en getAuthHeaders
    },
    body: JSON.stringify(paciente),
  });
  return handleResponse<Paciente>(res); // Usar la nueva función de manejo de respuesta
}

// Editar/Actualizar un paciente
export async function updatePaciente(id: number | string, paciente: Partial<Paciente>): Promise<Paciente> { // id puede ser string si es _id de MongoDB
  const headers = getAuthHeaders(); // Obtener los encabezados de autenticación
  const res = await fetch(`${API}/pacientes/${id}`, {
    method: 'PUT',
    headers: {
      ...headers, // getAuthHeaders ya incluye 'Content-Type'
      // 'Content-Type': 'application/json', // <--- Eliminado: ya está en getAuthHeaders
    },
    body: JSON.stringify(paciente),
  });
  return handleResponse<Paciente>(res); // Usar la nueva función de manejo de respuesta
}

// Eliminar un paciente
export async function deletePaciente(id: number | string): Promise<{ message: string }> { // id puede ser string si es _id de MongoDB
  const res = await fetch(`${API}/pacientes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ message: string }>(res); // Usar la nueva función de manejo de respuesta
}