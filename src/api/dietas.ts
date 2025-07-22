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
  nombre?: string; // Hago estos opcionales por ahora, si es que realmente NO se envían.
  descripcion?: string; // Hago estos opcionales por ahora.
  paciente_id: string;
  plan_id?: string;
  fechaAsignacion?: string; // Hago estos opcionales por ahora.
  semanas: SemanaDieta[];
}

// Basado en tu Postman, este es el payload real para POST /dietas
export interface CreateDietaPayload {
  paciente_id: string;
  plan_id?: string; // Asegúrate si es opcional u obligatorio en tu API
  semanas: SemanaDieta[];
}

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
  console.log("Enviando dieta:", JSON.stringify(dieta)); // Para depuración
  const res = await fetch(`${API}/dietas`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json', // <--- ¡AÑADE ESTO!
    },
    body: JSON.stringify(dieta),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Error desconocido del servidor o respuesta no JSON' }));
    console.error("Error al crear dieta:", errorBody); // Depuración del error completo
    throw new Error(errorBody.message || 'Error al crear dieta');
  }

  return res.json();
}